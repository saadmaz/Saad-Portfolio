/** Types for article-core.js (kept as JS so scripts/prerender.mjs can import it). */
import type {
  ArticleTypeOption,
  Author,
  BlogPost,
  BlogSeries,
  CategoryOption,
  ImageAsset,
} from "../types/blog";

type PostLike = Partial<BlogPost> & { id: string };

export const DEFAULT_WPM: number;
export const ARTICLE_TYPES: ArticleTypeOption[];
export const REACTIONS: { id: string; label: string; emoji: string }[];
export const REACTION_IDS: string[];
export const SLUG_RE: RegExp;

export function stripHtml(html: string | undefined | null): string;
export function countWords(text: string | undefined | null): number;
export function readingTimeMinutes(html: string | undefined | null, wpm?: number): number;
export function readingMinutesOf(post: Partial<BlogPost> | undefined | null, wpm?: number): number;
export function slugify(input: string | undefined | null, max?: number): string;
export function assignHeadingIds(
  headings: { text: string; id?: string | null }[],
  reserved?: Iterable<string>,
): string[];

export function articlePath(post: { id: string; slug?: string }): string;
export function isListed(post: Partial<BlogPost> | undefined | null): boolean;
export function isIndexable(post: Partial<BlogPost> | undefined | null): boolean;
export function seoTitleOf(post: Pick<BlogPost, "title"> & Partial<BlogPost>): string;
export function seoDescriptionOf(post: Partial<BlogPost>): string;
export function canonicalOf(post: PostLike, baseUrl: string): string;
export function coverOf(post: Partial<BlogPost>): ImageAsset | null;
export function socialImageOf(post: Partial<BlogPost>): ImageAsset | null;
export function toIso(value: unknown): string | null;
export function publishedAtOf(post: Partial<BlogPost>): string | null;
export function updatedAtOf(post: Partial<BlogPost>): string | null;
export function wasUpdated(post: Partial<BlogPost>): boolean;
export function articleTypeLabel(id: string | undefined, types?: ArticleTypeOption[]): string;

export function relatedScore(a: Partial<BlogPost>, b: Partial<BlogPost>): number;
export function relatedPosts<T extends PostLike>(post: PostLike, candidates: T[], limit?: number): T[];
export function featuredPosts<T extends PostLike>(posts: T[]): T[];

export interface SeriesPosition<T> {
  index: number;
  total: number;
  items: T[];
  previous: T | null;
  next: T | null;
}
export function seriesParts<T extends PostLike>(
  series: Pick<BlogSeries, "id" | "postIds"> | null | undefined,
  livePostsById: Map<string, T>,
): T[];
export function seriesPosition<T extends PostLike>(
  series: Pick<BlogSeries, "id" | "postIds"> | null | undefined,
  post: PostLike,
  livePostsById: Map<string, T>,
): SeriesPosition<T> | null;

export function normalizePath(path: string | undefined | null): string;
export function resolveRedirect(
  map: Record<string, { to: string; statusCode?: number }>,
  path: string,
  maxHops?: number,
): { to: string; statusCode: 301 | 302 } | null;

export interface RedirectPlan {
  create: { from: string; to: string; statusCode: 301 } | null;
  repoint: { id: string; to: string }[];
  remove: string[];
}
export function planSlugRedirect(
  existing: { id: string; from: string; to: string }[],
  fromPath: string,
  toPath: string,
): RedirectPlan;
export function publishBlockers(post: Partial<BlogPost>): string[];

export function personSchema(
  author: Partial<Author> | null | undefined,
  baseUrl: string,
): Record<string, unknown> | undefined;
export function articleSchema(
  post: PostLike,
  opts: {
    baseUrl: string;
    author?: Partial<Author> | null;
    /** `id`: the site owner's Person @id; the author gets it too when the names match. */
    publisher: { name: string; logo?: string; id?: string };
    series?: Pick<BlogSeries, "title" | "slug"> | null;
    wordCount?: number;
  },
): Record<string, unknown>;

export function escapeXml(s: unknown): string;
export function buildRss(
  posts: PostLike[],
  opts: {
    baseUrl: string;
    title: string;
    description: string;
    authorsById?: Map<string | undefined, { name: string }>;
    limit?: number;
  },
): string;
export function buildBlogSitemap(opts: {
  baseUrl: string;
  posts: PostLike[];
  authors?: Pick<Author, "id" | "slug">[];
  series?: Pick<BlogSeries, "slug" | "postIds" | "published">[];
  categories?: CategoryOption[];
}): string;
export function categoriesOf(posts: Partial<BlogPost>[]): CategoryOption[];
