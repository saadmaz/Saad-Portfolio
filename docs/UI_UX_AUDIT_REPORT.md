# UI/UX Defect Audit — Saad-Portfolio

**Scope note:** The requested target ("polish-station-pos", including a PIN entry flow) does not exist in this workspace. This repository is **Saad-Portfolio** — a personal portfolio site (public pages + an `/admin` CRUD dashboard). Per user direction, this audit covers Saad-Portfolio instead, substituting the admin login form and admin CRUD forms for the PIN-pad-specific checks in the original brief. Read-only inventory pass — **no files were modified** to produce these findings (this report itself is a new file, not an edit to audited code).

Audited with four parallel passes across `frontend/src` (all public pages, all `/admin` pages, all shared/section/ui components) plus `frontend/src/app/index.css` and `frontend/tailwind.config.ts` for the design-token baseline.

---

## 1. Responsive Layout

**Breakpoint system:** The codebase is consistent — Tailwind's default mobile-first breakpoints (`sm/md/lg/xl`, plus a `2xl: 1400px` container override in `tailwind.config.ts`) are used almost everywhere, with the same `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` / `flex-col md:flex-row` idioms repeated across public pages, sections, and 21/23 admin list pages (all of which use reflowing card/list layouts rather than raw `<table>`). Two minor exceptions: one legacy desktop-first `@media (max-width: 639px)` rule in `index.css:551` (duplicates the `sm` boundary, harmless), and a handful of admin forms using bare `grid-cols-2`/`grid-cols-3` with no responsive override (listed below).

### Blocking

| File | Component | Issue | Fix |
|---|---|---|---|
| `frontend/src/components/sections/HeroSection/HeroSection.tsx:235,252` | HeroSection | `<h1>` "Hi, I'm Saad Mazhar" and the subtitle both use `whitespace-nowrap` with large font sizes. At 320–414px this text cannot wrap, causing overflow/clipping on the homepage hero. | Remove `whitespace-nowrap` or scope it to `md:` and up. |
| `frontend/src/components/admin/AdminEntityDialog.tsx:93` + `frontend/src/components/ui/dialog.tsx:39` | AdminEntityDialog (shared by 12 admin pages: Volunteer, Testimonials, TestScores, Publications, Patents, Organizations, Newsletters, Languages, Hackathons, Courses, Causes, Awards) | `DialogContent` has no `max-h-[90vh]`/`overflow-y-auto`. Longer forms can exceed a short mobile viewport with no way to reach Save/Cancel. Contrast with `AdminEvents.tsx:100` and `AdminCertificates.tsx`, which handle this correctly. | Add `max-h-[90vh] overflow-y-auto` to the shared `DialogContent`. |

### Degraded

| File | Component | Issue | Fix |
|---|---|---|---|
| `frontend/src/components/admin/ProjectForm.tsx:361` | ProjectForm | `grid-cols-3` (Type/Category/Stage) with no responsive override — cramped at 320px. | Add `grid-cols-1 sm:grid-cols-3`. |
| `frontend/src/components/admin/ProjectForm.tsx:332,632` | ProjectForm | `grid-cols-2` (Title/Slug, Status/Order) with no `sm:` override. | Add `grid-cols-1 sm:grid-cols-2`. |
| `frontend/src/components/admin/ExperienceForm.tsx:260` | ExperienceForm (RoleSubForm dates) | `grid-cols-2` date pickers cramped below ~360px. | Add mobile stacking fallback. |
| `frontend/src/components/admin/CertificateForm.tsx:152` | CertificateForm | Issuer/Platform `grid-cols-2` with no responsive override. | Add `grid-cols-1 sm:grid-cols-2`. |
| `frontend/src/components/sections/TestimonialsSection/TestimonialsSection.tsx:86` | TestimonialsSection | Cards are `w-[350px]` in a horizontal scroller — wider than a 320–375px viewport, so the first card isn't fully visible on first paint. | Use `w-[85vw] max-w-[350px]`. |

### Cosmetic

| File | Component | Issue | Fix |
|---|---|---|---|
| `frontend/src/pages/CertificateDetailPage.tsx:133` | CertificateDetailPage | `sticky top-24` applied unconditionally, including in the mobile single-column layout. | Scope with `lg:sticky`. |
| `frontend/src/pages/ContactPage.tsx:172` | ContactPage (Calendly embed) | Fixed `minHeight: 600px` iframe adds excessive scroll length on short mobile viewports. | Reduce min-height on mobile via a responsive class. |
| `frontend/src/pages/BlogsPage.css` | BlogsPage | Entire stylesheet is dead code — not imported/used by `BlogsPage.tsx` (built with Tailwind utilities instead). | Delete or wire up. |
| `frontend/src/components/blog/BlogTemplate/BlogTemplate.{tsx,css}` | BlogTemplate | Not imported anywhere; `BlogDetailPage.tsx` uses its own inline styles instead. Dead code (the CSS itself is well-built with `clamp()` fluid type). | Remove if superseded. |
| `frontend/src/components/ui/carousel.tsx` | Embla Carousel primitive | Unused anywhere in the app; `CarouselPrevious`/`CarouselNext` sit 48px outside bounds, which would clip if ever placed near a viewport edge inside `overflow-hidden`. | No action unless adopted. |

### Verified — no responsive issues found

Public pages: `Index.tsx`, `AboutPage.tsx`, `ProjectsPage.tsx`, `ProjectDetailPage.tsx`, `BlogsPage.tsx`, `BlogDetailPage.tsx` (has thorough 768/480px media queries), `CertificationsPage.tsx`, `EducationPage.tsx`, `EventsPage.tsx`, `EventDetailPage.tsx`, `ExperiencePage.tsx`, `NewslettersPage.tsx`, `PublicationsPage.tsx`, `SkillsOnlyPage.tsx`, `NotFound.tsx`.
Layout: `Header.tsx` (proper `hidden lg:flex` / hamburger split), `Footer.tsx`, `Layout.tsx`.
Sections: `FeaturedProjects`, `CertificatesPreview`, `EventsPreview`, `ExperienceSection`, `EducationSection`, `LanguagesSection`, `AwardsSection`, `AboutSection`, `NewsletterSection`, `ContactSection`, `SkillsSection` — all consistent grid patterns; modals correctly use `max-h-[85–90vh]` + internal scroll.
Blog/Project/Education: `BlogCard.tsx`, `ProjectCard.tsx`, `EducationDialog.tsx`.
ui/: `dialog.tsx`, `drawer.tsx`, `sheet.tsx`, `sidebar.tsx` (swaps to `Sheet` on mobile), `table.tsx`, `tabs.tsx`, `navigation-menu.tsx`, `select.tsx`, `dropdown-menu.tsx`, `ImageCarousel.tsx`/`LightboxModal.tsx` (touch-swipe, 44×44 targets, `max-h-[90vh]`).
Admin: `AdminLayout.tsx` (custom sidebar correctly responsive), `ConfirmDialog.tsx`, `BackButton.tsx`, upload widgets, `EducationForm.tsx` (the one form that gets `grid-cols-1 sm:grid-cols-2` right), `BlogForm.tsx`. Admin pages: `AdminDashboard.tsx`, `AdminProjects.tsx`, `AdminAwards.tsx`, `AdminMessages.tsx`, `AdminLogs.tsx`, `AdminLoginPage.tsx`, `AdminExperience.tsx`, `AdminEvents.tsx`, `AdminCertificates.tsx` (best-handled overflow case), and the 12 pages sharing `AdminEntityDialog` (only issue is the shared dialog overflow gap above).

---

## 2. Color Contrast

All ratios computed from actual HSL→sRGB token conversions using the WCAG relative-luminance formula (not estimated); opacity-modified text was alpha-composited against its real backing surface before computing. Three themes evaluated: **LIGHT** (`:root`), **DARK** (`.dark`), **ADMIN** (`.admin-panel`, always-dark, wraps all `/admin` routes).

### Blocking (fails 3:1 UI/large-text, or fails 4.5:1 for body text)

**B1 — `.admin-panel .text-white/NN` and `hsl(var(--foreground)/0.NN)` (pervasive).** Ivory `#ede9e3` on navy `#070b17`/card `#11192c`. Below `/50` this fails; below `/25` it fails even the 3:1 floor.

| Opacity | On bg `#070b17` | On card `#11192c` | Verdict |
|---|---|---|---|
| /50 | 4.59:1 | 4.50:1 | passes (barely) |
| /40 | 3.32:1 | 3.35:1 | fails 4.5, clears 3:1 only |
| /30 | 2.35:1 | 2.44:1 | **fails 3:1** |
| /25 | 1.97:1 | 2.07:1 | **fails 3:1** |
| /22 | 1.78:1 | 1.88:1 | **fails 3:1** |
| /20 | 1.66:1 | 1.76:1 | **fails 3:1** |
| /15 | 1.42:1 | 1.50:1 | **fails 3:1** |
| /10 | 1.23:1 | 1.29:1 | **fails 3:1** |

Real body-visible usages at failing levels: `AdminLayout.tsx:203` (nav section headers, `/0.18`→1.56:1), `:267` (nav count badge, `/0.15`→1.42:1), `:288` (collapsed tooltip count, `/0.35`→2.80–2.86:1), `:319` (sidebar footer email, `/0.22`→1.78–1.88:1), `:345` (collapsed sign-out icon, `/0.22`→1.78:1), `:360` (sign-out label, `/0.25`→1.97–2.07:1); `BlogForm.tsx:423` (`/0.35`→2.80–2.95:1), `:511` (`/0.30`→2.44–2.60:1), `:531,702,719,761` (`/0.22–0.25`→1.97–2.07:1); `AdminLoginPage.tsx:80` (subtitle, `/0.36`→2.90–2.95:1), `:132` (`/0.28`→2.19–2.28:1), `:186` (footer, `/0.20`→1.66–1.76:1); `ProjectForm.tsx:121,404,410,453,458,496,539,552,586,598,607,615,623` (`/0.20–0.40`→1.66–3.35:1); `MultiImageUpload.tsx:161,182`, `LogoUpload.tsx:73,84`, `ImageUpload.tsx:105`, `AdminEvents.tsx:133,145,166,199,233` — same failing band.
**Fix:** nothing below `/50` for real text; icon-only floor `/45` (≈3.9:1), push to `/60`+ for anything actually read.

**B2 — AdminDashboard stat-card gradients (18 cards).** `AdminDashboard.tsx:187-217` renders white/white-72% text near the *light end* of each 135° category gradient.

| Category | Light-end stop | White solid | White/72% label |
|---|---|---|---|
| organizations | `#88cc19` | **1.96:1** | **1.63:1** |
| hackathons | `#e7b008` | **1.98:1** | **1.64:1** |
| blogs | `#f59f0a` | **2.13:1** | **1.72:1** |
| courses | `#21c45d` | **2.30:1** | **1.81:1** |
| publications | `#07b6d5` | **2.42:1** | **1.87:1** |
| experience | `#10b77f` | **2.59:1** | **1.98:1** |
| education | `#5ea5fd` | **2.54:1** | **1.99:1** |
| certs | `#1dafa1` | **2.73:1** | **2.07:1** |
| awards | `#f87116` | **2.85:1** | **2.13:1** |
| languages | `#0da2e7` | **2.86:1** | **2.14:1** |
| events/testimonials/volunteer/projects | — | 3.6–3.8:1 | 2.5–2.6:1 |

10 of 18 categories fail 3:1 even for the large bold count number; the label fails 4.5:1 on all 18. This is the admin dashboard's landing screen. **Fix:** darken each gradient's light-end stop (≥L 30–35%) or add a dark scrim behind the text.

**B3 — ADMIN `text-muted-foreground/70`** (not remapped by the admin override rules, unlike `text-white/NN`). `#938c80` blended:

| Opacity | On bg | On card | On secondary |
|---|---|---|---|
| /70 | 3.41:1 | 3.23:1 | 3.02:1 |
| /60 | 2.79:1 | 2.71:1 | 2.58:1 |
| /50 | 2.28:1 | 2.26:1 | 2.19:1 |

`/70` is the standard admin body-copy/placeholder class, used as real text (not just icons) — fails 4.5:1 everywhere. Repeats near-identically across ~20 `Admin*.tsx` list pages (e.g. `AdminAwards.tsx:168`, `AdminCourses.tsx:166`, `AdminMessages.tsx:119`, `AdminDashboard.tsx:149,232,269,328`, etc.) and ~30 `placeholder:text-muted-foreground/70` form fields (`AdminBlogs.tsx:167`, `AdminCertificates.tsx:428,439,448,459,502,512,524`, `AdminEntityDialog.tsx:112,146`, etc.). **Fix:** drop the opacity modifier — plain `text-muted-foreground` already passes at 5.9/5.26.

**B4 — Public-site `text-muted-foreground/NN`, LIGHT theme** — fails at every tested opacity:

| Opacity | On bg `#f9fbfb` | On card `#ffffff` |
|---|---|---|
| /80 | 3.53:1 | 3.62:1 |
| /70 | 2.92:1 | 2.98:1 |
| /60 | 2.44:1 | 2.48:1 |
| /50 | 2.06:1 | 2.08:1 |
| /40 | 1.75:1 | 1.77:1 |
| /30 | 1.51:1 | 1.52:1 |

Even `/80` fails 4.5:1; by `/60` icons fail 3:1 too. Affected: `PublicationsPage.tsx:53` (`/30`→1.51, icon fails 3:1), `EducationPage.tsx:149,217,236,258,330,436,635,637`, `AboutPage.tsx:34,126,151,161`, `EducationSection.tsx:127,210,227,250,322,429,447,553,572,622`, `AboutSection.tsx:76,105`. (Dark theme is more forgiving: `/70`=4.86, `/50`=3.01, still fails 4.5:1 below `/70`.) **Fix:** floor at `/80`+ for light-theme text, `/55`+ for icons, or drop the modifier entirely.

**B5 — Hardcoded `color: white !important` on accent gradient buttons** (`.btn-primary`, `.btn-accent`, `.btn-outline:hover` in `index.css:238-336`; `.blogs-reset-btn` in `BlogsPage.css:204-205`) bypasses the theme's `--accent-foreground` token.

| Theme | Gradient stop 1 | White text | Stop 2 | White text |
|---|---|---|---|---|
| LIGHT | `#1ba799` | **2.99:1** | `#176d6d` | 6.10:1 |
| DARK | `#1fc1b1` | **2.25:1** | `#1d8787` | 4.31:1 |
| DARK hover | `#2cddcb` | **1.71:1** | `#22a0a0` | 3.18:1 |
| ADMIN | `#10b77f` | **2.59:1** | `#147b5a` | 5.24:1 |
| ADMIN hover | `#37d28a` | **1.95:1** | `#10b77f` | 2.59:1 |

Every primary/accent CTA fails 3:1 near the gradient's start in dark mode (worst on hover) and in light mode at rest. **Fix:** replace `color: white !important` with `color: hsl(var(--accent-foreground))` (already correct as a token; see B7 for admin's copy of the same token).

**B6 — `text-success`/`text-warning`/success badge** — tokens are defined only in `:root`, never overridden in `.dark`, so LIGHT theme fails:

| Pairing | Light | Dark |
|---|---|---|
| `text-success` on page bg | **2.22–2.30:1** | 7.99–8.52:1 |
| `text-warning` on page bg | **2.05:1** | 8.62–9.20:1 |
| `success-foreground` (white) on `bg-success` badge | **2.30:1 (both themes)** | **2.30:1** |

Affected: `ProjectDetailPage.tsx:210,224,335,474` (icons + bold score number, fails in light theme); `EventsPreview.tsx:12`, `EventsPage.tsx:28`, `EventDetailPage.tsx:135` ("Speaker" badge fails 3:1/4.5:1 in both themes). **Fix:** darken `--success`/`--warning` for light-theme use; darken `--success` further or switch `--success-foreground` to dark navy.

**B7 — ADMIN `--accent-foreground` (white) on `--accent` (emerald)** → **2.59:1**, fails the 3:1 UI/large-text floor outright. This is the base pair for every solid-emerald button/pill in the admin panel. **Fix:** darken `--accent` to ~L 30%, or make `--accent-foreground` dark navy (mirrors how the public dark theme already does this correctly: 8.71:1).

### Degraded (clears 3:1 but fails 4.5:1 body text; or 2–2.9:1 large text/icons)

| # | File : line | Pairing | Ratio | Threshold | Fix |
|---|---|---|---|---|---|
| D1 | `index.css:243,272,356` + `SkillsOnlyPage.tsx:12`, `PublicationsPage.tsx:81`, section eyebrow labels (LIGHT) | `text-accent` as small body/label text, `#178c81` on `#f9fbfb`/`#ffffff` | 3.96 / 4.11 | 4.5:1 | darken light `--accent` for text use, or reserve for ≥18px/bold-14px |
| D2 | `index.css:238` `.tech-chip:hover` etc. (LIGHT) | white on `#178c81` | 4.11 | 4.5:1 | same as D1 |
| D3 | `components/ui/badge.tsx:13` destructive variant (LIGHT) | white on `#ef4343` | 3.78 | 4.5:1 | darken light `--destructive` to ~L50% |
| D4 | `BlogForm.tsx:789` dialog description | `foreground/0.45` | 3.89–3.91 | 4.5:1 | bump to `/60`+ |
| D5 | `AdminLayout.tsx:256` inactive nav-link label | `foreground/0.48` | 4.25–4.31 | 4.5:1 | bump to `/55`+ |
| D6 | `focus:ring-accent/30–50` across admin forms (`ProjectForm.tsx:92`, `AdminBlogs.tsx:167`, `AdminAwards.tsx:123`, `AdminCourses.tsx:116`, `AdminEvents.tsx:46,362`, `AdminCertificates.tsx` ×7, `AdminNewsletters.tsx:137`, etc.) | ring vs. background | LIGHT 1.45–1.90 · DARK 1.77–2.93 · ADMIN 1.65–2.64 | 3:1 (UI indicator) | stop overriding the default `--ring` token, which already passes (7.25–8.71:1) |
| D7 | `ContactSection.tsx:145,169` `ArrowRight` icon | white/30 on `--gradient-contact` | 2.62–2.69 | 3:1 | bump to `/45`+ |
| D8 | `ContactSection.tsx:36,42` label/heading (LIGHT theme, section is hardcoded dark) | `#178c81` on `#091a20`/`#0f2e2e` | 3.52–4.33 | 4.5:1 | force dark-theme accent value here regardless of site theme |
| D9 | `AdminLogs.tsx` violet status-default, if used as text | `#7c3bed` on `#11192c` | 3.09 | 4.5:1 (passes 3:1 as dot/icon) | darken/lighten if used as label text |
| D10 | ADMIN `destructive-foreground` on `destructive` badge | `#ede9e3` on `#cf3030` | 4.22 | 4.5:1 | darken `--destructive` to ~L44% |
| D11 | ADMIN `destructive` solid on card (delete icon buttons) | `#cf3030` on `#11192c` | 3.43 | 4.5:1 if text (passes 3:1 as icon) | check usage — `BlogForm.tsx:474,808` is icon-only, OK |

### Cosmetic (4.3–4.49:1)

- `AdminLayout.tsx:256,435` — `foreground/0.48` nav label/breadcrumb, 4.25–4.31:1.
- `.tech-chip:hover` white-on-accent (light), 4.11:1 — repeated from D2, straddles the boundary.

### Needs manual visual check (not reducible to a single ratio)

- **`.gradient-text`** (`index.css:247-250`) — defined but currently unused anywhere in `.tsx` (verified via grep). Flag for whoever adopts it: sample both gradient endpoints against the page background.
- **`.social-icon-branded` hover** (`HeroSection.tsx:120-158`, `ContactSection.tsx:85-114`) — brand colors (LinkedIn blue, GitHub lavender `hsl(262 93% 76%)`, Instagram pink, Facebook blue, X gray) against theme-dependent card color. GitHub's light lavender on the LIGHT-theme white card is likely weak — spot-check.
- **`.dark body` background** (`index.css:189`) uses a 3-stop gradient (`--gradient-hero`), not a flat color — any text sitting directly on `<body>` (rare) should be checked against all three stops.

### Passing baseline (compliance inventory, solid full-opacity tokens)

| Pairing | LIGHT | DARK | ADMIN |
|---|---|---|---|
| foreground / background | 16.55 ✅ | 17.82 ✅ | 16.24 ✅ |
| foreground / card | 17.19 ✅ | 16.70 ✅ | 14.48 ✅ |
| muted-foreground / background | 5.33 ✅ | 9.01 ✅ | 5.90 ✅ |
| muted-foreground / card | 5.53 ✅ | 8.44 ✅ | 5.26 ✅ |
| muted-foreground / muted or secondary | 4.68 ✅ | 7.21 ✅ | 4.71 ✅ |
| secondary-foreground / secondary | 15.24 ✅ | 14.26 ✅ | 12.98 ✅ |
| primary-foreground / primary | 17.19 ✅ | 17.01 ✅ | 16.24 ✅ |
| accent-foreground / accent | 4.11 ⚠️ D2 | 8.71 ✅ | 2.59 ❌ B7 |
| accent / background (large text/UI) | 3.96 ✅ | 8.71 ✅ | 7.58 ✅ |
| destructive-foreground / destructive | 3.78 ❌ D3 | 9.10 ✅ | 4.22 ⚠️ D10 |
| Input/Textarea placeholder (full opacity) | 5.33 ✅ | 9.01 ✅ | 5.90 ✅ |
| `.status-live/.status-mvp/.status-progress` badges | 6.37–6.78 ✅ | 7.53–8.47 ✅ | n/a |
| ADMIN `status-create/update/delete` on bg | 7.58/5.40/4.86 ✅ | — | — |
| Dialog close-X icon | 6.37 ✅ | 8.54 ✅ | 7.61 ✅ |
| Accordion chevron (solid foreground) | 16.55+ ✅ | 17.82+ ✅ | 16.24+ ✅ |
| `badge.tsx` default/secondary/outline | 15–17:1 ✅ | 14–17:1 ✅ | 13–16:1 ✅ |

**Contrast summary:** the public site's *solid* design tokens are well-tuned (comments in `index.css` even note deliberate contrast fixes). The real risk is concentrated in: (1) opacity-modifier utilities (`/NN` on text) used pervasively below a safe floor, worst in admin and light-theme public pages; (2) the admin dashboard's 18 gradient stat cards; (3) hardcoded `color: white` breaking the theme's own correct `accent-foreground` flip.

---

## 3. Keyboard Navigation

Method: grepped `onClick=`, `outline-none`, `tabIndex`, Radix override props (`onEscapeKeyDown`, `onInteractOutside`, `modal={false}`, `onOpenAutoFocus`, `onCloseAutoFocus` — zero matches, confirming no Radix defaults are overridden anywhere), and `Escape` (one match repo-wide). Cross-checked every `<div onClick=`/`<m.div onClick=` against presence of `tabIndex`/`role`/`onKeyDown`.

### Blocking (unreachable/unusable via keyboard, or a true trap/focus loss)

| File | Component | Issue | Fix |
|---|---|---|---|
| `components/ui/ImageCarousel.tsx:52-59` | ImageCarousel | Main slide `<div role="region" onClick=...>` has no `tabIndex`/`onKeyDown` — opening the lightbox from the main image is mouse-only (arrows/dots are real buttons, fine). | Add `tabIndex={0} role="button" aria-label` + `onKeyDown` for Enter/Space. |
| `components/ui/LightboxModal.tsx` | LightboxModal | Custom overlay (not Radix). Escape works (the only place in the repo that handles it), but no focus trap, no initial focus, no focus restoration on close. | Add focus trap, `autoFocus` close button, restore `document.activeElement` on close. |
| `components/admin/ImageUpload.tsx:82-84` | ImageUpload | Empty-state dropzone `<div onClick>` has no keyboard access — can't trigger the file picker via keyboard. | Add `role="button" tabIndex={0}` + `onKeyDown`, or use a real `<button>`. |
| `components/admin/LogoUpload.tsx:51-54` | LogoUpload | Same pattern. | Same fix. |
| `components/admin/MultiImageUpload.tsx:137-144` | MultiImageUpload | Same pattern (click/drop zone, no keyboard trigger). | Same fix; keep drag handlers, add keyboard trigger. |
| `components/admin/ExperienceForm.tsx:219-221` | ExperienceForm (RoleAccordion header) | `<div onClick={onToggle}>` — can't expand/collapse role entries via keyboard. | Convert to `<button type="button">` or add role/tabIndex/onKeyDown. |
| `components/admin/EducationForm.tsx:149-151,241-243,374-376` | EducationForm (3 collapsible headers) | Same `<div onClick>` pattern ×3. | Same fix. |
| `pages/ProjectDetailPage.tsx:178-190,244-256,350-360` | ProjectDetailPage | Hero image / diagram / screenshots are `<div onClick>` with `cursor-zoom-in`, none keyboard-reachable. Resulting lightbox (`:534-560`) also has no Escape handling, no focus trap, no initial focus (close button is a real, reachable `<button>` though). | Make triggers `tabIndex={0} role="button" onKeyDown`; add Escape + focus management to the lightbox. |
| `sections/ExperienceSection/ExperienceSection.tsx` (~L226-276) and `pages/ExperiencePage.tsx` (~L178-216) `MediaStrip` | Experience media lightbox (duplicated) | Trigger thumbnails are real `<button>`s (fine), but the lightbox has no Escape/trap/initial-focus/restore. | Add Escape + focus management to both copies; consider de-duplicating. |
| `sections/EducationSection/EducationSection.tsx:384-406` `EducationCard` (Cards view) | EducationSection | `<m.div onClick={onSelect}>` with no tabIndex/role/onKeyDown — contrast with `PreviewCard:526-531` in the same file, which does this correctly. | Apply the same `role="button" tabIndex={0} onKeyDown` pattern as `PreviewCard`. |
| `EducationSection.tsx` `EducationDetailModal` (~L137-380) and `MediaLightbox` (~L75-133) | EducationSection | Custom portals — no Escape, no trap, no initial focus, no restore. Close buttons are real (reachable). | Add Escape handling + focus trap/restore. |
| `pages/EducationPage.tsx:426-428` | EducationPage timeline row | `<div onClick={onToggle}>` row has no keyboard handler (adjacent logo button at `:410-421` is fine). Page duplicates the same no-Escape modal pattern as EducationSection. | Add keyboard support, or move the toggle onto the existing button. |

### Degraded (reachable but missing focus indicator / order / ARIA)

| File | Component | Issue | Fix |
|---|---|---|---|
| `components/ui/navigation-menu.tsx:38` | `navigationMenuTriggerStyle` (shadcn base, used by Header's desktop dropdown triggers) | `focus:outline-none` with no `focus-visible:ring-*` replacement. | Add `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` to the base class. |
| `components/layout/Header.tsx:148` | Header hamburger button | `focus:outline-none`, no replacement. | Remove or pair with a ring. |
| `components/layout/Header.tsx:200` | `MobileNavSection` accordion button | Same. | Same fix. |
| `components/layout/Header.tsx:157-185` | Mobile nav overlay | No Escape-to-close, no focus trap, no initial focus, no restore to the hamburger button. | Add Escape handler, initial focus, trap/`inert`, restore focus. |
| `components/admin/AdminLayout.tsx:182-192` | Sidebar collapse toggle | Icon-only button, no `aria-label`, no `aria-expanded`. | Add both. |
| `components/admin/AdminLayout.tsx:399-407` | Mobile sidebar drawer | Backdrop click-to-close exists, but no Escape, no trap, no initial focus. | Add Escape + focus management. |
| `pages/admin/AdminLoginPage.tsx:106,137` | Login inputs | `outline-none` replaced only with an 8%-opacity box-shadow on focus — likely fails the ~3:1 visible-focus-indicator requirement (WCAG 2.4.11). | Increase focus-indicator contrast. |
| `pages/admin/AdminLoginPage.tsx:97-102,123-127` | Login labels | `<label>` has no `htmlFor`; inputs have no matching `id` — only visually associated. | Add `id`/`htmlFor` pairs. |
| `ImageUpload.tsx:61-79`, `LogoUpload.tsx:59-65`, `MultiImageUpload.tsx:104-113` | Upload overlays | "Change/Remove" buttons revealed only via `group-hover:opacity-100` — invisible when keyboard-focused (no `group-focus-within`). | Add `group-focus-within:opacity-100`. |
| `components/projects/ProjectCard/ProjectCard.tsx:63-84` | ProjectCard (non-compact) | GitHub/Live icon `<a>` nested inside the outer `<Link>` (invalid HTML, unpredictable focus/click); also hover-only visible, no `group-focus-within`. | Restructure as siblings of the outer `Link`; add focus-within visibility. |
| `sections/SkillsSection/SkillsSection.tsx:104-124` | Category tabs | Native buttons (reachable), but no `role="tablist"/"tab"`, `aria-selected`, `aria-controls`. | Add ARIA tab pattern, or `aria-pressed` if treated as a button group. |
| `EducationSection.tsx:801-811` / `EducationPage.tsx` view toggle | Cards/Timeline switch | Native buttons, reachable, but no `aria-pressed`/`aria-selected`. | Add `aria-pressed={view==='card'}` etc. |
| `sections/HeroSection/HeroSection.tsx:217,335` | Hero two-column layout | `order-2 lg:order-1`/`order-1 lg:order-2` — visual order (photo first on mobile) doesn't match DOM/tab order (text first). Low impact — photo column has no interactive content today. | Note only; reorder DOM if interactive content is added later. |
| `components/ui/command.tsx:47` | CommandInput (cmdk) | `outline-none`, no ring. Component appears unused currently. | Add ring if/when adopted. |

### Compliant — verified, no action needed

`button.tsx`, `input.tsx`, `textarea.tsx`, `checkbox.tsx`, `switch.tsx`, `slider.tsx`, `toggle.tsx`, `tabs.tsx`, `badge.tsx`, `dialog.tsx`, `sheet.tsx`, `alert-dialog.tsx` — all correctly pair `focus-visible:outline-none` with a visible ring. `dropdown-menu.tsx`, `context-menu.tsx`, `menubar.tsx`, `select.tsx` — standard Radix roving-focus + background-swap pattern. `AdminEntityDialog.tsx`, `ConfirmDialog.tsx`, `EducationDialog.tsx` — thin Radix `Dialog`/`AlertDialog` wrappers, no override props found; Radix's default trap/Escape/focus-return applies. `NavLink.tsx` — native `<a>` via react-router. `BlogCard.tsx`, `AboutSection.tsx`, `NewsletterSection.tsx`, `ContactSection.tsx`, `TestimonialsSection.tsx`, `AwardsSection.tsx`, `LanguagesSection.tsx`, `FeaturedProjects.tsx`, `Footer.tsx` — native `<a>`/`<Link>`/`<button>` throughout. `ProtectedRoute.tsx` — no interactive elements. `index.css` — zero `outline: none`/`outline:0` matches; `.social-icon`, `.hero-btn-primary`, `.nav-link`, `.tech-chip`, `.toggle-professional`, `.card-hover` all preserve the browser default focus ring. `CertificatesPreview.tsx` pagination — real buttons with `aria-label` and `disabled` state.

**Highest-priority fixes:** (1) Escape + focus-trap/restore on every custom lightbox/modal except `LightboxModal.tsx` (needs only trap/restore) — the most repeated pattern (ProjectDetailPage, ExperienceSection/ExperiencePage MediaStrip, EducationSection/EducationPage). (2) Make click-to-zoom `<div>`s keyboard-operable (ImageCarousel, ProjectDetailPage, EducationCard, EducationPage timeline row). (3) Fix the 4 admin accordion headers (ExperienceForm, EducationForm ×3). (4) Add `focus-visible:ring-2` to `navigationMenuTriggerStyle`.

---

## 4. Enter-Key / Form Submission

Method: grepped `<form`, `onSubmit`, `onKeyDown`, `KeyboardEvent`, `preventDefault` across `src/`.

### Blocking — Enter does nothing (no native `<form>` to submit)

Only 6 files in the whole repo contain a `<form>` element. **Four of the admin entity forms have none at all** — every field is a bare `<Input>`/`<Textarea>` and Save is wired only to a button's `onClick={handleSubmit(...)}`, so pressing Enter in any single-line field is a complete no-op (react-hook-form's `handleSubmit` is never invoked).

| File | Fields affected | Current | Fix |
|---|---|---|---|
| `components/admin/BlogForm.tsx` | Title, Slug, Category, Author, Keywords (~L498,514,715,729,768) | Root is a `<div>` (L401); Save/Publish are `type="button"` calling `onClick={handleSubmit(...)}` (L442,454) | Wrap in `<form onSubmit={handleSubmit(d => onSubmit(d, false))}>`, make Save `type="submit"`. |
| `components/admin/ProjectForm.tsx` | Title, Slug, Tagline, Date, Role, Category, Description, Video/Live/GitHub URLs, Order Index (L335-654) | No `<form>`; Save `onClick={handleSubmit(onSubmit)}` (L311) | Wrap in `<form onSubmit={handleSubmit(onSubmit)}>`, Save `type="submit"`. |
| `components/admin/ExperienceForm.tsx` | Company name, Location (L633,654) | No `<form>`; Save `onClick={handleSubmit(onSubmit)}` (L609) | Same fix. |
| `components/admin/CertificateForm.tsx` | Title, Issuer, Platform, Credential URL, PDF link, Issue date, Category, Type (L148-226) | No `<form>`; Save `onClick={handleSubmit(onSubmit)}` (L127) | Same fix. |

Note: the tag/skill "Add" chip inputs in these same forms already correctly `preventDefault()` on Enter to add an item (`BlogForm.tsx:388-391`, `ProjectForm.tsx:124-126`, `ExperienceForm.tsx:334,820`) — that's moot today since there's no enclosing `<form>` to accidentally submit.

### Compliant — verified correct

| File | Verified behavior |
|---|---|
| `pages/admin/AdminLoginPage.tsx` | `<form onSubmit={handleLogin}>` (L94) wraps Email (L103) and Password (L134); submit button `type="submit"` (L154); no field-level `onKeyDown`. Enter behaves identically in either field. |
| `pages/ContactPage.tsx` | `<form onSubmit={handleSubmit}>` (L189) wraps Name/Email/Subject inputs + message `<Textarea>`. Enter in inputs submits; Enter in the textarea inserts a newline (no override in `ui/textarea.tsx`). |
| `components/admin/EducationForm.tsx` | The one admin entity form with a real `<form onSubmit={handleSubmit(onSubmit)}>` (L681), `type="submit"` Save (L1189), `type="button"` Cancel. Nested "add" inputs use local state, not RHF — no premature-submit risk. |
| `components/admin/AdminEntityDialog.tsx` | `<form onSubmit={form.handleSubmit(handleSubmit)}>` (L98); Save `type="submit"`, Cancel and Delete both `type="button"` — Enter can't trigger the wrong action. |
| `pages/admin/AdminEvents.tsx` (`EventFormDialog`) | `<form onSubmit=...>` (L105); Highlights chip input's Enter→`addHighlight()` correctly `preventDefault`s (L217); Save `type="submit"`, Cancel `type="button"`. |
| `pages/admin/AdminCertificates.tsx` (Sheet form) | `<form id="cert-sheet-form" onSubmit=...>` (L414); Save button lives outside the form in the sheet footer but is wired via `type="submit" form="cert-sheet-form"` (L550-552) — the HTML5 `form` attribute pattern, so Enter still submits natively. Delete is a separate button. |
| `components/admin/ConfirmDialog.tsx` + `ProjectForm.tsx`'s delete `AlertDialog` | Traced into Radix's `alert-dialog` source: Radix auto-focuses **Cancel** on open, not the destructive action — pressing Enter right after opening a delete confirmation activates Cancel, not Delete. Safe default, not a footgun. |
| `components/ui/input.tsx`, `textarea.tsx`, `form.tsx` | Plain passthrough wrappers, no Enter interception. Repo-wide grep for keyboard handling in `ui/` only hits `carousel.tsx` (arrow keys) and `sidebar.tsx` (Cmd/Ctrl+B) — neither Enter-related. |
| `ImageUpload.tsx`, `LogoUpload.tsx`, `MultiImageUpload.tsx` | No text/URL input alongside the dropzones — only a hidden `<input type="file">`; no Enter surface. |
| Admin list-page search/filter inputs (AdminBlogs, AdminProjects, AdminMessages, AdminAwards, AdminCourses, AdminLogs, AdminNewsletters, AdminPatents, AdminOrganizations, AdminPublications, AdminTestScores, AdminExperience) | No `<form>` wrapping any of these; filtering is live via `onChange`. Enter is a no-op but there's nothing for it to do — no page reload risk. |

### Cosmetic / Degraded

- **`NewslettersPage.tsx`/`NewsletterSection.tsx`**: no email-signup input exists — both only link out to an external LinkedIn newsletter. Nothing to audit here (the original brief assumed a signup form that isn't present).
- **`ContactSection.tsx`** (homepage section, as opposed to `ContactPage.tsx`): link cards only (mailto/tel/`Link to="/contact"`), not an inline form.
- **Inconsistency**: `EducationForm.tsx` and the dialog-based forms (`AdminEntityDialog`, `AdminEvents`, `AdminCertificates`) submit correctly on Enter; the four full-page forms in the Blocking section above do not. Real workflow inconsistency within the same admin panel.
- **`input-otp.tsx`, `command.tsx`**: present but unused anywhere in `src/` — no live Enter surface to audit.

**Summary:** highest-impact fix is adding `<form onSubmit>` + `type="submit"` to `BlogForm.tsx`, `ProjectForm.tsx`, `ExperienceForm.tsx`, `CertificateForm.tsx` — the four content-heaviest admin editors, where typing a title and pressing Enter out of habit currently does nothing. Everything else (login, public contact form, dialog-based CRUD, tag inputs, textareas, delete confirmations, search filters, uploads) is correct.

---

## Overall priority list

1. **Enter-key blocking bug** in 4 admin forms (BlogForm, ProjectForm, ExperienceForm, CertificateForm) — no `<form>` wrapper at all.
2. **Admin dashboard contrast** — 10/18 gradient stat cards fail 3:1 for their headline number; labels fail on all 18.
3. **Admin `--accent-foreground`/`--accent` pair (2.59:1)** — base token for every solid-emerald admin button.
4. **Keyboard traps/unreachable controls** in every custom lightbox/modal (ProjectDetailPage, Experience media strip, Education detail modal, upload dropzones, accordion headers).
5. **Hero `whitespace-nowrap` overflow** on the homepage at ≤414px.
6. **`AdminEntityDialog` missing `max-h`/scroll** — affects 12 admin CRUD dialogs.
7. **Opacity-modifier text utilities** (`text-white/NN` in admin, `text-muted-foreground/NN` in both admin and light-theme public) — systemic pattern behind most contrast failures; fixing the floor (admin `/50`+, light-public `/80`+) resolves the bulk of the "Blocking" contrast list at once.
