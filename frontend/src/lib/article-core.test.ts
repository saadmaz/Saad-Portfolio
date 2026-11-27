import { describe, expect, it } from "vitest";
import {
  articleSchema,
  blogSchema,
  assignHeadingIds,
  buildBlogSitemap,
  CATEGORY_MIN_POSTS,
  buildRss,
  canonicalOf,
  countWords,
  featuredPosts,
  isIndexable,
  normalizePath,
  planSlugRedirect,
  publishBlockers,
  readingMinutesOf,
  readingTimeMinutes,
  relatedPosts,
  adjacentPosts,
  demoteH1,
  sameText,
  resolveRedirect,
  seriesKicker,
  seriesParts,
  seriesPosition,
  slugify,
  socialImageOf,
  stripHtml,
  updatedAtOf,
  wasUpdated,
} from "./article-core.js";
import type { BlogPost } from "@/types/blog";

const BASE = "https://www.example.com";
const post = (over: Partial<BlogPost> & { id: string }): BlogPost => ({
  slug: over.id,
  title: `Post ${over.id}`,
  excerpt: "An excerpt",
  content: "<p>Hello world</p>",
  date: "2025-01-01T00:00:00.000Z",
  category: "Tech",
  author: "Saad Mazhar",
  published: true,
  ...over,
});

/**
 * Shared reading-time vectors. The admin CMS repo runs the same cases
 * (src/shared/lib/article.test.ts) so the stored and computed values agree.
 */
export const READING_VECTORS: [string, string, number, number][] = [
  ["empty", "", 225, 1],
  ["tags are not words", `<p class="x" data-y="z">${"word ".repeat(450)}</p>`, 225, 2],
  ["markdown syntax ignored", `## Heading\n\n**bold** _it_ [link](https://x.y) ${"w ".repeat(220)}`, 225, 1],
  ["entities decoded, not counted", `<p>${"a&nbsp;b ".repeat(300)}</p>`, 200, 3],
  ["scripts dropped", `<script>${"x ".repeat(5000)}</script><p>${"w ".repeat(680)}</p>`, 225, 3],
  ["custom wpm", `<p>${"w ".repeat(1000)}</p>`, 250, 4],
];

describe("reading time", () => {
  it.each(READING_VECTORS)("%s", (_label, html, wpm, minutes) => {
    expect(readingTimeMinutes(html, wpm)).toBe(minutes);
  });

  it("counts hyphenated and apostrophe words once", () => {
    expect(countWords("state-of-the-art isn't hard")).toBe(3);
  });

  it("strips tags and keeps text", () => {
    expect(stripHtml("<h2>Title</h2><p>Body &amp; more</p>")).toBe("Title Body & more");
  });

  it("prefers the stored value, computing only for legacy posts", () => {
    expect(readingMinutesOf({ readingTimeMinutes: 7, content: "x" })).toBe(7);
    expect(readingMinutesOf({ content: `<p>${"w ".repeat(900)}</p>` })).toBe(4);
  });
});

describe("slugify", () => {
  it.each([
    ["48th Big Debate!", "48th-big-debate"],
    ["Café & Crème", "cafe-and-creme"],
    ["  --Already--Slugged-- ", "already-slugged"],
  ])("%s → %s", (input, out) => expect(slugify(input)).toBe(out));
});

describe("assignHeadingIds", () => {
  it("generates stable, unique ids and keeps author anchors", () => {
    const ids = assignHeadingIds(
      [{ text: "Intro" }, { text: "Setup", id: "intro" }, { text: "Intro" }, { text: "Intro" }],
      ["top"],
    );
    // "intro" is reserved by the author's anchor, so generated ones skip it.
    expect(ids).toEqual(["intro-2", "intro", "intro-3", "intro-4"]);
  });

  it("is deterministic", () => {
    const h = [{ text: "A b" }, { text: "C" }];
    expect(assignHeadingIds(h)).toEqual(assignHeadingIds(h));
  });
});

describe("visibility", () => {
  it("excludes drafts, unlisted and no-index posts from indexing", () => {
    expect(isIndexable(post({ id: "a" }))).toBe(true);
    expect(isIndexable(post({ id: "b", published: false }))).toBe(false);
    expect(isIndexable(post({ id: "c", unlisted: true }))).toBe(false);
    expect(isIndexable(post({ id: "d", noIndex: true }))).toBe(false);
  });

  it("uses a valid custom canonical, else the article URL", () => {
    expect(canonicalOf(post({ id: "a" }), BASE)).toBe(`${BASE}/blog/a`);
    expect(canonicalOf(post({ id: "a", canonicalUrl: "https://medium.com/x" }), BASE)).toBe(
      "https://medium.com/x",
    );
    expect(canonicalOf(post({ id: "a", canonicalUrl: "javascript:alert(1)" }), BASE)).toBe(`${BASE}/blog/a`);
  });

  it("falls back from social image to cover to legacy image", () => {
    expect(socialImageOf(post({ id: "a", image: "/legacy.jpg" }))?.url).toBe("/legacy.jpg");
    expect(socialImageOf(post({ id: "a", cover: { url: "/c.jpg" }, image: "/c.jpg" }))?.url).toBe("/c.jpg");
    expect(
      socialImageOf(post({ id: "a", cover: { url: "/c.jpg" }, socialImage: { url: "/s.jpg" } }))?.url,
    ).toBe("/s.jpg");
  });
});

describe("dates", () => {
  it("never reports an update before publication", () => {
    const p = post({
      id: "a",
      publishedAt: "2025-03-01T00:00:00.000Z",
      lastUpdatedAt: "2025-01-01T00:00:00.000Z",
    });
    expect(updatedAtOf(p)).toBe("2025-03-01T00:00:00.000Z");
    expect(wasUpdated(p)).toBe(false);
  });

  it("shows an update made days later", () => {
    const p = post({
      id: "a",
      publishedAt: "2025-03-01T00:00:00.000Z",
      lastUpdatedAt: "2025-03-05T00:00:00.000Z",
    });
    expect(wasUpdated(p)).toBe(true);
  });
});

describe("relatedPosts", () => {
  const base = post({ id: "base", category: "AI", tags: ["llm", "agents"], relatedPostIds: ["manual"] });
  const all = [
    base,
    post({ id: "manual", category: "Life" }),
    post({ id: "strong", category: "AI", tags: ["llm"] }),
    post({ id: "weak", category: "AI" }),
    post({ id: "none", category: "Food", date: "2026-01-01T00:00:00.000Z" }),
  ];

  it("puts manual picks first, then the best automatic matches", () => {
    expect(relatedPosts(base, all, 3).map((p) => p.id)).toEqual(["manual", "strong", "weak"]);
  });

  it("tops up with the latest posts when nothing matches", () => {
    expect(relatedPosts(base, all, 5).map((p) => p.id)).toEqual(["manual", "strong", "weak", "none"]);
  });

  it("ignores manual picks that aren't live", () => {
    const p = post({ id: "x", relatedPostIds: ["gone"] });
    expect(relatedPosts(p, [p, post({ id: "y" })]).map((r) => r.id)).toEqual(["y"]);
  });
});

describe("featuredPosts", () => {
  it("orders by featuredOrder and drops unpublished or unlisted posts", () => {
    const list = [
      post({ id: "b", featured: true, featuredOrder: 2 }),
      post({ id: "a", featured: true, featuredOrder: 1 }),
      post({ id: "draft", featured: true, featuredOrder: 0, published: false }),
      post({ id: "hidden", featured: true, unlisted: true }),
      post({ id: "plain" }),
    ];
    expect(featuredPosts(list).map((p) => p.id)).toEqual(["a", "b"]);
  });
});

describe("seriesPosition", () => {
  it("counts only live posts and finds neighbours", () => {
    const live = new Map([
      ["1", post({ id: "1", seriesId: "s" })],
      ["3", post({ id: "3", seriesId: "s" })],
    ]);
    const pos = seriesPosition({ id: "s", postIds: ["1", "2-draft", "3"] }, post({ id: "3" }), live);
    expect(pos).toMatchObject({ index: 1, total: 2 });
    expect(pos?.previous?.id).toBe("1");
    expect(pos?.next).toBeNull();
  });

  it("includes members the series order doesn't list yet, oldest first, and drops posts moved out", () => {
    const live = new Map([
      ["a", post({ id: "a", seriesId: "s", publishedAt: "2025-03-01T00:00:00.000Z" })],
      ["b", post({ id: "b", seriesId: "s", publishedAt: "2025-01-01T00:00:00.000Z" })],
      ["c", post({ id: "c", seriesId: "s", publishedAt: "2025-02-01T00:00:00.000Z" })],
      ["moved", post({ id: "moved", seriesId: "other" })],
    ]);
    expect(seriesParts({ id: "s", postIds: ["a", "moved"] }, live).map((p) => p.id)).toEqual(["a", "b", "c"]);
  });
});

describe("seriesKicker", () => {
  it("joins the padded order and label, skipping what's missing", () => {
    expect(seriesKicker({ order: 1, label: "Projects" })).toBe("01 / Projects");
    expect(seriesKicker({ label: "News" })).toBe("News");
    expect(seriesKicker({})).toBe("");
  });
});

describe("redirects", () => {
  it("normalises paths", () => {
    expect(normalizePath("https://x.com/Blog/Old/?a=1#h")).toBe("/blog/old");
    expect(normalizePath("blog//old/")).toBe("/blog/old");
  });

  it("follows chains to the final destination", () => {
    const map = { "/blog/a": { to: "/blog/b" }, "/blog/b": { to: "/blog/c" } };
    expect(resolveRedirect(map, "/blog/a")).toEqual({ to: "/blog/c", statusCode: 301 });
  });

  it("returns null on loops instead of redirecting forever", () => {
    const map = { "/a": { to: "/b" }, "/b": { to: "/a" } };
    expect(resolveRedirect(map, "/a")).toBeNull();
  });

  it("keeps a temporary status code", () => {
    expect(resolveRedirect({ "/a": { to: "/b", statusCode: 302 } }, "/a")).toEqual({
      to: "/b",
      statusCode: 302,
    });
  });
});

describe("planSlugRedirect", () => {
  it("creates a redirect and collapses chains onto the new slug", () => {
    const plan = planSlugRedirect(
      [{ id: "r1", from: "/blog/older", to: "/blog/old" }],
      "/blog/old",
      "/blog/new",
    );
    expect(plan.create).toEqual({ from: "/blog/old", to: "/blog/new", statusCode: 301 });
    expect(plan.repoint).toEqual([{ id: "r1", to: "/blog/new" }]);
  });

  it("removes the reverse redirect when a slug is changed back (no loop)", () => {
    const plan = planSlugRedirect([{ id: "r1", from: "/blog/a", to: "/blog/b" }], "/blog/b", "/blog/a");
    expect(plan.remove).toEqual(["r1"]);
    expect(plan.create).toEqual({ from: "/blog/b", to: "/blog/a", statusCode: 301 });
  });

  it("does nothing for an unchanged slug or an existing redirect", () => {
    expect(planSlugRedirect([], "/blog/a", "/blog/a/")).toEqual({ create: null, repoint: [], remove: [] });
    expect(
      planSlugRedirect([{ id: "r", from: "/blog/a", to: "/blog/b" }], "/blog/a", "/blog/b").create,
    ).toBeNull();
  });
});

describe("publishBlockers", () => {
  const ready = post({
    id: "a",
    title: "A good title",
    slug: "a-good-title",
    content: `<p>${"word ".repeat(20)}</p>`,
  });
  it("passes a complete post", () => expect(publishBlockers(ready)).toEqual([]));
  it("lists every missing piece", () => {
    expect(
      publishBlockers({
        ...ready,
        title: "x",
        slug: "Bad Slug",
        excerpt: "",
        content: "<p>hi</p>",
        cover: { url: "u" },
      }),
    ).toHaveLength(5);
  });
});

describe("articleSchema", () => {
  it("includes every field Google's Article rich result reads", () => {
    const schema = articleSchema(
      post({
        id: "a",
        seoTitle: "SEO title",
        metaDescription: "Desc",
        cover: { url: "https://cdn/c.jpg" },
        publishedAt: "2025-01-02T00:00:00.000Z",
        lastUpdatedAt: "2025-02-02T00:00:00.000Z",
      }),
      {
        baseUrl: BASE,
        author: { name: "Ada", slug: "ada", linkedin: "https://linkedin.com/in/ada" },
        publisher: { name: "Site", logo: "/logo.png" },
      },
    );
    expect(schema).toMatchObject({
      "@type": "BlogPosting",
      headline: "SEO title",
      description: "Desc",
      image: ["https://cdn/c.jpg"],
      author: {
        "@type": "Person",
        name: "Ada",
        url: `${BASE}/authors/ada`,
        sameAs: ["https://linkedin.com/in/ada"],
      },
      publisher: { "@type": "Person", name: "Site", logo: { url: `${BASE}/logo.png` } },
      datePublished: "2025-01-02T00:00:00.000Z",
      dateModified: "2025-02-02T00:00:00.000Z",
      mainEntityOfPage: { "@id": `${BASE}/blog/a` },
    });
  });
});

describe("feeds", () => {
  const posts = [
    post({
      id: "live",
      title: "Tom & Jerry <3",
      publishedAt: "2025-05-01T00:00:00.000Z",
      cover: { url: "https://c/x.webp" },
    }),
    post({ id: "draft", published: false }),
    post({ id: "scheduled", published: false, status: "scheduled" }),
    post({ id: "unlisted", unlisted: true }),
    post({ id: "noindex", noIndex: true }),
    post({ id: "elsewhere", canonicalUrl: "https://medium.com/x" }),
  ];

  it("RSS lists only indexable posts, escaped", () => {
    const xml = buildRss(posts, { baseUrl: BASE, title: "Blog", description: "D" });
    expect(xml).toContain("<title>Tom &amp; Jerry &lt;3</title>");
    expect(xml).toContain(`<link>${BASE}/blog/live</link>`);
    expect(xml).toContain('type="image/webp"');
    for (const hidden of ["draft", "scheduled", "unlisted", "noindex"])
      expect(xml).not.toContain(`/blog/${hidden}<`);
  });

  it("sitemap skips drafts, scheduled, unlisted, no-index and cross-canonical posts", () => {
    const xml = buildBlogSitemap({
      baseUrl: BASE,
      posts,
      categories: [
        { slug: "tech", label: "Tech" },
        { slug: "empty", label: "Empty" },
      ],
      authors: [{ id: "x", slug: "nobody" }],
    });
    expect(xml).toContain(`<loc>${BASE}/blog/live</loc>`);
    for (const hidden of ["draft", "scheduled", "unlisted", "noindex", "elsewhere"])
      expect(xml).not.toContain(`/blog/${hidden}<`);
    expect(xml).not.toContain("category/empty");
    expect(xml).not.toContain("authors/nobody");
  });

  it("sitemap lists a category only once it has CATEGORY_MIN_POSTS live articles", () => {
    const categories = [{ slug: "tech", label: "Tech" }];
    // `posts` has one live Tech article (plus hidden ones, which don't count).
    expect(buildBlogSitemap({ baseUrl: BASE, posts, categories })).not.toContain("category/tech");
    const more = Array.from({ length: CATEGORY_MIN_POSTS - 1 }, (_, i) => post({ id: `more-${i}` }));
    expect(buildBlogSitemap({ baseUrl: BASE, posts: [...posts, ...more], categories })).toContain(
      `<loc>${BASE}/blog/category/tech</loc>`,
    );
  });
});

describe("adjacentPosts", () => {
  const a = post({ id: "a", date: "2025-01-01T00:00:00.000Z" });
  const b = post({ id: "b", date: "2025-02-01T00:00:00.000Z" });
  const c = post({ id: "c", date: "2025-03-01T00:00:00.000Z" });

  it("finds the older and newer neighbours regardless of input order", () => {
    const r = adjacentPosts(b, [c, a, b]);
    expect([r.previous?.id, r.next?.id]).toEqual(["a", "c"]);
  });

  it("has no previous for the oldest and no next for the newest", () => {
    expect(adjacentPosts(a, [a, b, c]).previous).toBeNull();
    expect(adjacentPosts(c, [a, b, c]).next).toBeNull();
  });
});

describe("demoteH1", () => {
  it("turns body H1s into H2s, keeping attributes", () => {
    expect(demoteH1('<h1 id="a">Intro</h1><p>x</p><H1>B</H1>')).toBe(
      '<h2 id="a">Intro</h2><p>x</p><h2>B</h2>',
    );
  });

  it("leaves other tags and escaped text alone", () => {
    const html = "<h2>Keep</h2><hr><p>&lt;h1&gt; in text</p><h10x>";
    expect(demoteH1(html)).toBe(html);
  });
});

describe("sameText", () => {
  it("ignores case, punctuation and spacing", () => {
    expect(
      sameText("WSO2 to Choreo Labs: A Brand in Transition", "wso2 to choreo labs  a brand in transition"),
    ).toBe(true);
    expect(sameText("20 AI Prompts", "20 AI Prompts to Build")).toBe(false);
    expect(sameText("", "")).toBe(false);
  });
});

describe("blogSchema", () => {
  it("lists only listed posts with absolute URLs and the owner as author", () => {
    const schema = blogSchema(
      [
        post({
          id: "a",
          slug: "a",
          title: "A",
          excerpt: "Ex",
          cover: { url: "/a.jpg" },
          publishedAt: "2025-01-02T00:00:00.000Z",
        }),
        post({ id: "b", slug: "b", title: "B", unlisted: true }),
      ],
      {
        baseUrl: BASE,
        name: "Blog",
        url: `${BASE}/blog`,
        publisher: { name: "Site", id: `${BASE}/#person` },
      },
    );
    expect(schema).toMatchObject({ "@type": "Blog", author: { "@id": `${BASE}/#person` } });
    const items = schema.blogPost as Record<string, unknown>[];
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      "@type": "BlogPosting",
      headline: "A",
      url: `${BASE}/blog/a`,
      image: `${BASE}/a.jpg`,
      datePublished: "2025-01-02T00:00:00.000Z",
    });
  });
});

describe("buildBlogSitemap authors", () => {
  it("lists the default author for posts with no author set", () => {
    const xml = buildBlogSitemap({
      baseUrl: BASE,
      posts: [post({ id: "p1", slug: "p1", title: "P", publishedAt: "2025-01-02T00:00:00.000Z" })],
      authors: [{ id: "a1", slug: "ada", isDefault: true }],
    });
    expect(xml).toContain(`${BASE}/authors/ada`);
  });
});
