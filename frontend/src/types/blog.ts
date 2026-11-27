/**
 * Blog content model, shared with the admin CMS (Saad-Portfolio-Admin,
 * src/types/blog.ts keeps the same shape). Every field added after the
 * original model is optional, so posts written before the editorial CMS
 * still type-check and render; `lib/article-core.js` holds the fallbacks.
 */

export type ArticleStatus = "draft" | "in_review" | "scheduled" | "published" | "archived";

/** A responsive rendition of an uploaded image (WebP, made at upload time). */
export interface ImageVariant {
  width: number;
  url: string;
}

/** An image plus everything needed to display and credit it. */
export interface ImageAsset {
  url: string;
  alt?: string;
  caption?: string;
  credit?: string;
  creditUrl?: string;
  width?: number;
  height?: number;
  /** Focal point in percent (0–100); covers crop around it. */
  focalX?: number;
  focalY?: number;
  variants?: ImageVariant[];
}

export interface ArticleSource {
  title: string;
  url?: string;
  publisher?: string;
  note?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  /** Rendered HTML (what the site displays). */
  content: string;
  /** Editor document (TipTap JSON, stringified) - the structured source of `content`. */
  contentJson?: string;
  /** Publication date (ISO). Kept as the sort key the site has always queried on. */
  date: string;
  category: string;
  articleType?: string;
  /** Legacy display name; `authorId` takes precedence when set. */
  author: string;
  authorId?: string;
  /** Legacy cover URL, mirrored from `cover.url`. */
  image?: string;
  cover?: ImageAsset;
  socialImage?: ImageAsset;
  tags?: string[];

  /** Mirrors `status === "published"`; Firestore rules and public queries rely on it. */
  published: boolean;
  status?: ArticleStatus;
  /** Live, but only reachable by direct link: hidden from lists, feeds and search. */
  unlisted?: boolean;
  is_latest?: boolean;

  /* SEO */
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string; // comma-separated
  canonicalUrl?: string;
  noIndex?: boolean;

  /* Publishing */
  scheduledDate?: string; // legacy; superseded by scheduledAt
  scheduledAt?: string; // ISO (UTC)
  scheduledTimezone?: string; // IANA zone the author picked
  scheduleError?: string;
  publishedAt?: string;
  lastUpdatedAt?: string;
  readingTimeMinutes?: number;
  wordCount?: number;

  /* Presentation */
  featured?: boolean;
  featuredOrder?: number;
  tableOfContents?: boolean; // default on; false hides it
  reactionsEnabled?: boolean; // default on
  socialShareEnabled?: boolean; // default on
  /** Readers can download the article's prompts as .md / .txt (default on). */
  promptDownloads?: boolean;

  /* Relations */
  relatedPostIds?: string[];
  relatedPostSlugs?: string[]; // legacy
  seriesId?: string;
  sources?: ArticleSource[];
  previousSlugs?: string[];

  /* CTA */
  ctaText?: string;
  ctaUrl?: string;

  /** Optimistic-concurrency counter, bumped by every CMS write. */
  revision?: number;
}

export interface AuthorLink {
  label: string;
  url: string;
}

export interface Author {
  id: string;
  slug: string;
  name: string;
  title?: string;
  bio?: string;
  avatar?: string;
  website?: string;
  linkedin?: string;
  x?: string;
  github?: string;
  links?: AuthorLink[];
  isDefault?: boolean;
  /** Topics the author is an expert in; falls back to what they write about. */
  expertise?: string[];
}

export interface BlogSeries {
  id: string;
  slug: string;
  title: string;
  /** Short name shown with the number, e.g. "Projects". */
  label?: string;
  /** Display position, 1-based; shown as "01". */
  order?: number;
  description?: string;
  cover?: ImageAsset;
  /** Ordered article ids. */
  postIds: string[];
  published: boolean;
}

export interface ArticleTypeOption {
  id: string;
  label: string;
}

export interface CategoryOption {
  slug: string;
  label: string;
  description?: string;
}

/** `blog_settings/config` - central taxonomy and blog-wide switches. */
export interface BlogSettings {
  articleTypes?: ArticleTypeOption[];
  categories?: CategoryOption[];
  readingWpm?: number;
  reactionsEnabled?: boolean;
  defaultAuthorId?: string;
  postsPerPage?: number;
}

export type ReactionId = "helpful" | "insightful" | "interesting" | "loved";
export type ReactionCounts = Partial<Record<ReactionId, number>>;

export interface Redirect {
  id: string;
  from: string;
  to: string;
  statusCode: 301 | 302;
  source: "auto" | "manual";
}
