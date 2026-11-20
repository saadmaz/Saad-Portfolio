import { describe, expect, it } from "vitest";
import { injectArticle, postHeadMeta, shareImageOf } from "./blog-page";
import { applyHeadMeta, imageMimeOf } from "../src/lib/share-meta.js";

const SHELL = `<html><head>
<title>Home - Saad Mazhar</title>
<meta
  name="description"
  content="Home description" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://www.saadmaz.com/" />
<meta property="og:title" content="Home" />
<meta
  property="og:description"
  content="Home" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.saadmaz.com" />
<meta property="og:image" content="https://www.saadmaz.com/og/home.png" />
<meta property="og:image:alt" content="Home" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="Home" />
<meta name="twitter:description" content="Home" />
<meta name="twitter:image" content="https://www.saadmaz.com/og/home.png" />
</head><body><div id="root"></div></body></html>`;

const og = (html: string, key: string) =>
  html.match(new RegExp(`<meta\\s+(?:property|name)="${key}"\\s+content="([^"]*)"`))?.[1];

const post = {
  id: "p1",
  slug: "wso2-to-choreo-labs",
  title: "WSO2 to Choreo Labs",
  seoTitle: "WSO2 Rebrand",
  metaDescription: "Why WSO2 rebranded.",
  published: true,
  content: "<p>Body & more</p>",
  cover: { url: "https://cdn/cover.webp", width: 1672, height: 940 },
  socialImage: { url: "https://cdn/social.jpg?alt=media", width: 1200, height: 630 },
};

describe("share image", () => {
  it("prefers the uploaded social image, with the title as alt", () => {
    expect(shareImageOf(post, true)).toEqual({ ...post.socialImage, alt: post.title });
  });

  it("keeps the build's generated card when there is no social image", () => {
    expect(shareImageOf({ ...post, socialImage: undefined }, true)).toBeNull();
  });

  it("falls back to the cover, then the blog card, for posts the build hasn't seen", () => {
    expect(shareImageOf({ ...post, socialImage: undefined }, false)?.url).toBe("https://cdn/cover.webp");
    expect(shareImageOf({ id: "x", title: "T" }, false)?.url).toBe("https://www.saadmaz.com/og/blog.png");
  });
});

describe("live head meta", () => {
  it("rewrites title, description, url and the share image", () => {
    const html = applyHeadMeta(SHELL, postHeadMeta(post, true));
    expect(html).toContain("<title>WSO2 Rebrand - Saad Mazhar</title>");
    expect(og(html, "description")).toBe("Why WSO2 rebranded.");
    expect(og(html, "og:title")).toBe("WSO2 Rebrand - Saad Mazhar");
    expect(og(html, "og:type")).toBe("article");
    expect(og(html, "og:url")).toBe("https://www.saadmaz.com/blog/wso2-to-choreo-labs");
    expect(html).toContain(
      '<link rel="canonical" href="https://www.saadmaz.com/blog/wso2-to-choreo-labs" />',
    );
    expect(og(html, "og:image")).toBe("https://cdn/social.jpg?alt=media");
    expect(og(html, "twitter:image")).toBe("https://cdn/social.jpg?alt=media");
    expect(og(html, "og:image:type")).toBe("image/jpeg");
    expect(og(html, "twitter:card")).toBe("summary_large_image");
    expect(og(html, "robots")).toBe("index, follow");
  });

  it("is idempotent, so a prerendered page can be rewritten again", () => {
    const once = applyHeadMeta(SHELL, postHeadMeta(post, true));
    expect(applyHeadMeta(once, postHeadMeta(post, true))).toBe(once);
  });

  it("leaves the existing card alone when there's no image to set", () => {
    const html = applyHeadMeta(SHELL, postHeadMeta({ ...post, socialImage: undefined }, true));
    expect(og(html, "og:image")).toBe("https://www.saadmaz.com/og/home.png");
  });

  it("marks unlisted posts noindex without duplicating the robots tag", () => {
    const html = applyHeadMeta(SHELL, postHeadMeta({ ...post, unlisted: true }, true));
    expect(og(html, "robots")).toBe("noindex, nofollow");
    expect(html.match(/name="robots"/g)).toHaveLength(1);
  });

  it("escapes CMS text and doesn't expand $-patterns", () => {
    const html = applyHeadMeta(
      SHELL,
      postHeadMeta({ ...post, seoTitle: 'A "$&" <b>', metaDescription: "$1" }, true),
    );
    expect(html).toContain("<title>A &quot;$&amp;&quot; &lt;b&gt; - Saad Mazhar</title>");
    expect(og(html, "description")).toBe("$1");
  });

  it("detects image types from the URL path", () => {
    expect(imageMimeOf("https://x/a.webp?alt=media&token=1")).toBe("image/webp");
    expect(imageMimeOf("https://x/a.JPG")).toBe("image/jpeg");
    expect(imageMimeOf("https://x/a")).toBe("image/png");
  });
});

describe("article fallback body", () => {
  it("puts the article into #root for crawlers", () => {
    const html = injectArticle(SHELL, post);
    expect(html).toContain('<div id="root"><div data-prerendered><header>\n<h1>WSO2 to Choreo Labs</h1>');
    expect(html).toContain("<p>Body & more</p>");
  });
});
