# Editorial CMS: architecture, data model and operations

The blog is written in the admin app (`Saad-Portfolio-Admin`, admin.saadmaz.com)
and published on this site. This document covers how the two fit together.
CMS usage notes live in the admin repo's `docs/blog-cms.md`.

## 1. Architecture

```
 Admin CMS (Vite SPA)                         Public site (Vite SPA + Pages Functions)
 ─────────────────────                        ──────────────────────────────────────────
 TipTap editor, panels, autosave              /blog, /blog/:slug, /blog/category/:c,
        │  Firebase SDK (admin account)        /blog/series/:s, /authors/:slug, /preview/:id
        ▼                                              │ Firebase SDK (public reads)
   ┌──────────── Cloud Firestore ◀─────────────────────┘
   │  rules: public reads only published content
   │
   │◀── REST ─────── api/cron/publish-scheduled   scheduled publishing (cron Worker, every 10 min)
   │◀── REST ─────── api/admin                    preview links, rebuild, run scheduler, status
   │◀── REST ─────── api/preview                  signed draft preview data
   │◀── REST ─────── api/reactions, api/track     reactions, first-party analytics, 404 log
   │◀── REST ─────── api/feed                     /rss.xml and /sitemaps/blog.xml (live)
   │◀── REST ─────── scripts/prerender.mjs        crawler HTML, OG cards, redirects.json (build)
   ▼
 Firebase Storage  blog/** (images ≤15 MB; blog/attachments: pdf/md/txt/csv/zip ≤25 MB; admin write)        middleware.ts  301/302 redirects at the edge
```

- **No new infrastructure.** Firestore, Storage, Auth, Cloudflare Pages Functions and the
  existing build-time prerender are reused. Seven functions total (Hobby limit is 12).
- **Shared logic** lives in `frontend/src/lib/article-core.js` (+ `.d.ts`): reading
  time, slugs, visibility, canonical/OG fallbacks, related-article scoring, series
  order, redirect planning, publish checks, JSON-LD, RSS and sitemap builders. It's
  plain JS so the React app, the functions and `prerender.mjs` all import it. The
  CMS keeps a TypeScript copy of the parts it needs (`src/shared/lib/article.ts`)
  with identical test vectors.
- **Content format.** Articles are stored as sanitisable semantic HTML (`content`)
  plus the editor's JSON document (`contentJson`, the structured source). Custom
  blocks are plain elements with `data-*` markers that the site styles and
  enhances; legacy posts (HTML only) load and render unchanged.

## 2. Data model

All new fields are optional; existing posts keep working with these fallbacks
(see `article-core.js`): `status` ← `published`; `cover` ← `image`;
`seoTitle` ← `title`; `metaDescription` ← `excerpt`; `publishedAt` ← `date`;
`readingTimeMinutes` ← computed; `authorId` ← default author ← `author` name.

### `blog_posts/{id}` (extended)

| Field | Notes |
|---|---|
| `status` | `draft` · `in_review` · `scheduled` · `published` · `archived` |
| `published` | Kept in sync with `status === "published"`. Rules and public queries rely on it. |
| `subtitle`, `articleType`, `category`, `tags[]` | Types/categories managed in `blog_settings/config` |
| `authorId` (+ legacy `author`) | → `authors/{id}` |
| `cover`, `socialImage` | `ImageAsset`: `url, alt, caption, credit, creditUrl, width, height, focalX, focalY, variants[]` |
| `image` | Mirror of `cover.url` for older code |
| `seoTitle`, `metaDescription`, `canonicalUrl`, `noIndex`, `keywords` | |
| `content`, `contentJson` | HTML + TipTap JSON (stringified) |
| `readingTimeMinutes`, `wordCount` | Computed by the CMS (configurable WPM) |
| `date`, `publishedAt`, `lastUpdatedAt` | `publishedAt`/`date` fixed at first publication; `lastUpdatedAt` moves only on meaningful edits (title, subtitle, excerpt, content, sources, cover) |
| `scheduledAt`, `scheduledTimezone`, `scheduleError`, `scheduleAttempts` | Scheduling state |
| `featured`, `featuredOrder` | Homepage/blog featured sections |
| `relatedPostIds[]`, `seriesId`, `sources[]` | |
| `tableOfContents`, `reactionsEnabled`, `socialShareEnabled` | Default on |
| `publishedSlug`, `previousSlugs` | Drive automatic redirects |
| `revision`, `editedAt`, `editedBy` | Optimistic concurrency for the CMS |

### New collections

| Collection | Read | Write | Purpose |
|---|---|---|---|
| `blog_posts/{id}/revisions/{rid}` | admin | admin, scheduler | Snapshots on publish/update/schedule/manual save/10-min checkpoints |
| `blog_autosaves/{id}` | admin | admin | Unpublished edits to live posts |
| `authors/{id}` | public | admin | Author profiles |
| `blog_series/{id}` | public if `published` | admin | Series (ordered `postIds`) |
| `blog_settings/config` | public | admin | Article types, categories, WPM, reactions switch, default author |
| `redirects/{id}` | public | admin, scheduler | `from`, `to`, `statusCode`, `source` |
| `media/{id}` | admin | admin | Media library (uploaded images + renditions) |
| `blog_reactions/{postId}` | public | functions only | Aggregated reaction counts |
| `reaction_votes/{hash}` | none | functions only | De-duplication (keyed hash, no IPs) |
| `blog_stats/{postId}` (+ `/days/{date}`, `/days/{date}/visitors/{hash}`) | admin | functions only | Views, uniques, engaged time, scroll depth, referrer hosts |
| `not_found/{hash}` | admin (+ delete) | functions only | 404 path, count, first/last seen, referrer hosts |
| `system/scheduler`, `system/rebuild` | admin | functions only | Last scheduler run; rebuild throttle |

No composite indexes are needed (all new queries are single-field or equality-only).

### Security model

- `firestore.rules`: **drafts are no longer publicly readable** (previously
  `blog_posts` was `allow read: if true`, which exposed drafts and scheduled posts
  to anyone using the SDK). Public reads now require `published == true`, so every
  public query filters on it.
- `storage.rules`: `blog/**` accepts only JPEG/PNG/WebP/AVIF/GIF under 15 MB.
- CMS-only endpoints verify a Firebase ID token (signature, expiry, revocation)
  and require `ADMIN_EMAIL` with a verified email; CORS limited to `ADMIN_ORIGINS`.
- Draft previews use HMAC-signed tokens bound to one post, valid 30 minutes;
  `/preview/*` is `noindex`, `no-store`, and frameable only by the CMS.
- Article HTML is sanitised with DOMPurify before rendering (no scripts, frames,
  forms, inline CSS except `text-align`); the Custom HTML block uses a stricter
  profile. Embeds are rebuilt from provider + id (YouTube, Vimeo, Loom, CodePen)
  and match the CSP `frame-src`.
- Reactions and analytics: rate-limited per IP, bot user agents ignored,
  Do-Not-Track / GPC respected, no raw IPs or full referrer URLs stored.
- `robots.txt` disallows `/preview/` and `/api/` to save crawl budget only; access
  control is enforced by the token checks and rules above.

## 3. API

| Endpoint | Auth | Description |
|---|---|---|
| `POST /api/admin?action=preview-token` `{postId}` | admin token | `{ token, url, expiresAt }` |
| `POST /api/admin?action=rebuild` `{reason}` | admin token | Triggers the deploy hook (2-minute throttle) |
| `POST /api/admin?action=run-scheduler` | admin token | Runs the scheduler now |
| `GET /api/admin?action=status` | admin token | Which integrations are configured (booleans), last scheduler run, last rebuild |
| `GET/POST /api/cron/publish-scheduled` | `Bearer CRON_SECRET` | Publishes due posts |
| `GET /api/preview?id&token` | signed token | Post + pending autosave for `/preview/:id` |
| `POST /api/reactions` `{postId, reaction}` | public, rate-limited | Toggles a reaction; returns counts |
| `POST /api/track` `{t: view\|engage\|404, …}` | public, rate-limited | First-party analytics beacons |
| `GET /rss.xml`, `/feed.xml` → `/api/feed?type=rss` | public | RSS 2.0, CDN-cached 10 min |
| `GET /sitemaps/blog.xml` → `/api/feed?type=sitemap` | public | Blog sitemap, CDN-cached 10 min |

## 4. Publishing workflow

1. **Draft.** The CMS autosaves 2.5 s after typing stops; nothing is sent when the
   content hasn't changed. Each write is a transaction that checks `revision`, so a
   stale tab gets a conflict dialog instead of overwriting. Failed saves retry with
   backoff and immediately on reconnect; a device-local copy covers crashes.
2. **Live posts** never change on autosave: edits go to `blog_autosaves/{id}`
   (visible in Preview) until **Update**.
3. **Publish / Update / Schedule** re-validate (title, slug format and uniqueness,
   excerpt length, content length, cover alt text), apply the edits and status in
   one transaction, record a revision, and clear the autosave. Changing a live
   article's slug writes a 301 from the old URL and collapses redirect chains.
4. **Scheduling.** The author picks a wall-clock time and IANA time zone; the CMS
   stores UTC (`scheduledAt`). `server/_lib/scheduler.ts` publishes due posts inside
   transactions (no double publication), rejects incomplete ones back to draft with
   a reason, retries transient failures up to 5 times, records each run in
   `system/scheduler`, and triggers a rebuild.
5. **After publishing** the CMS asks the site to rebuild (deploy hook) so the
   prerendered crawler HTML, OG cards and `redirects.json` refresh. RSS and the blog
   sitemap don't need it: they're served live.

## 5. Environment variables (public site)

See `frontend/.env.example`. Server-only (Cloudflare Pages secrets, never `VITE_`):

| Variable | Required for |
|---|---|
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | All functions and prerender (existing) |
| `ADMIN_EMAIL` | CMS endpoints (fail closed if unset) |
| `ADMIN_ORIGINS` | CORS for the CMS (default `https://admin.saadmaz.com`) |
| `PREVIEW_SECRET` (≥32 chars) | Draft previews |
| `CRON_SECRET` (≥16 chars) | Scheduler endpoint (sent by the GitHub workflow) |
| `DEPLOY_HOOK_URL` | Automatic rebuilds via a Cloudflare Pages deploy hook (optional) |
| `ANALYTICS_SALT` (≥16 chars) | Analytics, 404 log, reactions |
| `REACTIONS_SALT` | Optional separate reactions key |
| `PUBLIC_SITE_URL` | Optional preview-link origin override |
| `GA4_PROPERTY_ID`, `GA4_SERVICE_ACCOUNT_EMAIL`, `GSC_SITE_URL`, `GSC_SERVICE_ACCOUNT_EMAIL` | Reserved for GA4/Search Console reporting (see §8) |

Scheduler: the cron Worker in `workers/scheduler` calls the endpoint every 10 minutes.
Its secret `CRON_SECRET` must match the one on the Pages project.

Admin app: optional `VITE_SITE_URL` (defaults to `https://www.saadmaz.com`).

## 6. Images

- Uploaded through the CMS image pipeline: type/size validation, real dimensions,
  WebP renditions at 640/1280/1920 px (never above the original), largest becomes
  the main URL; GIFs untouched; browsers without WebP encoding upload the original.
- Stored in Firebase Storage under `blog/covers`, `blog/social`, `blog/inline`,
  `blog/authors`, `blog/series`; recorded in `media` (the media library).
- The site renders `srcset`/`sizes`, intrinsic `width`/`height` (no layout shift),
  `object-position` from the focal point, `loading="lazy"` in articles and
  `fetchpriority="high"` for the article cover.
- Removing an image from a post doesn't delete the file (revisions may reference
  it); deleting from the media library removes every rendition.

## 7. SEO

- Per-article `<title>`, description, canonical (custom or self), `og:*`,
  `twitter:*`, `article:published_time/modified_time/author/section/tag`; the
  social image falls back to the cover, then the generated card.
- JSON-LD: `BlogPosting` (headline, description, image, author `Person`,
  publisher, dates, `mainEntityOfPage`, section, keywords, word count, series),
  `BreadcrumbList`, `CollectionPage` (blog/category), `ProfilePage` + `Person`
  (authors), `CreativeWorkSeries` (series). The site-wide Person/WebSite schema
  on the homepage is unchanged.
- Sitemaps: `/sitemaps/blog.xml` lists only indexable, self-canonical articles,
  plus category/author/series pages that have live articles. Drafts, scheduled,
  unlisted, no-index and preview URLs are never included.
- Redirects: `middleware.ts` serves 301/302 from `redirects.json` (built from
  Firestore); the article page also follows rules created since the last build.
- 404s: the NotFound page beacons the path to `api/track`; the CMS 404 monitor
  lists them by frequency with a one-click "Redirect".

## 8. Analytics

First-party counters are live once `ANALYTICS_SALT` is set: views, unique visitors
(per article per day, daily-rotating keyed hash), engaged time (tab visible only),
scroll depth buckets, referrer hosts. The CMS shows them with a 30-day chart and
never fills gaps with estimates.

GA4 is already collecting via the existing gtag snippet. **Pulling GA4 or Search
Console data into the CMS is not implemented**: the status endpoint reports
whether credentials are configured, and the analytics page links the
author to those dashboards. Adding it means a server-side provider in
`server/_lib/` using the GA4 Data API / Search Console API with a service account
(the variables in §5), exposed through `api/admin?action=…`.

## 9. Deployment & migration

Order matters because the new rules reject the old site's slug query:

1. Set the new variables and secrets on the site's Cloudflare Pages project
   (`ADMIN_EMAIL`, `PREVIEW_SECRET`, `CRON_SECRET`, `ANALYTICS_SALT`, optionally
   `DEPLOY_HOOK_URL`, `ADMIN_ORIGINS`).
2. **Deploy the site** (new queries filter on `published`; adds functions,
   middleware, cron).
3. **Then deploy the rules**:
   `firebase deploy --only firestore:rules,storage`
4. Deploy the admin app (its CSP now allows calling and framing the site).
5. Deploy the scheduler Worker: in `workers/scheduler`, run `npx wrangler deploy`,
   then `npx wrangler secret put CRON_SECRET` (same value as on Pages).
6. In the CMS: create an author profile (the first becomes the default) and review
   Blog settings.

No data migration is required: legacy fields keep working. Opening and updating a
legacy post in the CMS fills the new fields (status, reading time, JSON document,
figure markup for old images).

## 10. Testing

| Command (in `frontend/`) | Covers |
|---|---|
| `npm test` | `prompts` (variable detection, fill-in, copy-all format, Markdown/TXT exports, file names); `article-core` (previous/next article, H1 demotion, reading time vectors, slugs, heading ids, visibility, dates, related, featured, series, redirects incl. loops/chains, publish checks, JSON-LD, RSS, sitemap); services (published-only queries, rules denials); API (scheduler decisions incl. double-publish/rejection/redirects, preview tokens, admin auth, cron auth, tracking validation, reactions, rate limiting) |
| `npm run test:rules` | Firestore rules against the emulator (needs the Firebase CLI + Java). Not part of CI by default. |
| `npm run typecheck`, `npm run lint`, `npm run build` | As before; build also runs prerender + CSP check |

The admin repo's tests cover the editor (lossless round-trip of every block and
of legacy content, embed allow-list, chart data), autosave behaviour, SEO
analysis, diffing, time-zone conversion and the image pipeline.

## 11. Interactive content blocks

The editor's developer blocks are plain HTML with `data-*` markers, so they're
in the prerendered crawler HTML as real text. `CmsContent` enhances them in
place after sanitising, with no extra requests:

| Markup | Reader experience |
|---|---|
| `div[data-prompt]` (`data-label`, `data-stage`, `data-language`, `data-variant`) with `[data-prompt-description]`, `pre`, `[data-prompt-usage]`, `[data-prompt-note]` | `PromptCard`: number, title (an `h3`), stage/language badges, Copy (the exact original text), *Customise* with an input per `[VARIABLE]` (live preview in the text, copy customised or original), collapse for long prompts, `role="status"` confirmations. Anchored as `#prompt-01`… Code-language prompts are syntax-highlighted. Legacy prompts (label + `pre`, or inline-code runs) still work. |
| `pre[data-wrap]`, `pre[data-line-numbers]` | Wrapped lines; a line-number gutter (not shown when wrapping is on, since wrapped lines can't line up with it). |
| `ol[data-steps] > li[data-step]` | Numbered steps on a rail. |
| `div[data-comparison]` | Columns side by side, stacked on phones; ✓ / ✕ markers by tone. |
| `div[data-resources]` | Link cards; links open in a new tab with `noopener noreferrer`. |
| `div[data-attachment]` | File card with type badge, size and a download link. |

Article-level:

- **Prompt tools** bar (only when an article has prompts): copy all prompts
  (`# Stage…` / `## Prompt 01: Title` / prompt / `---`), download as `.md`
  (title, author, stages, numbered prompts in fences longer than any backticks
  inside) or `.txt`. Both are built in the browser; share and copy link.
- **Navigation:** the sticky desktop sidebar and the collapsible mobile TOC list
  sections and prompts (numbered, grouped by stage) and highlight the one in view.
  Turning the article's TOC off hides section links but keeps prompt navigation.
- **Footer:** previous / next article by publish date (hidden inside a series,
  which has its own navigation).
- **One H1:** `<h1>`s in the body become `<h2>`s on the page and in the
  prerendered HTML (`demoteH1` in `article-core.js`).

Deploy the Storage rules after this change so attachment uploads work:
`firebase deploy --only storage`.
