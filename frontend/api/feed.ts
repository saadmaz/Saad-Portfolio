/**
 * GET /api/feed?type=rss|sitemap
 *
 * Served at /rss.xml and /sitemaps/blog.xml (rewrites in vercel.json).
 * Built live from Firestore and CDN-cached for 10 minutes, so publishing,
 * editing or unpublishing an article updates both without a redeploy.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminDb, hasAdminCredentials } from "./_lib/firebase.js";
import { allowMethods } from "./_lib/http.js";
import { buildBlogSitemap, buildRss, categoriesOf, isIndexable } from "../src/lib/article-core.js";
import { BASE_URL, PAGE_SEO, SITE_NAME } from "../src/lib/seo-content.js";
import type { Author, BlogPost, BlogSeries } from "../src/types/blog.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["GET", "HEAD"])) return;
  const type = req.query.type === "sitemap" ? "sitemap" : "rss";
  if (!hasAdminCredentials()) return res.status(503).send("Feed unavailable");

  try {
    const db = adminDb();
    const [postsSnap, authorsSnap, seriesSnap] = await Promise.all([
      db.collection("blog_posts").where("published", "==", true).get(),
      db.collection("authors").get(),
      db.collection("blog_series").where("published", "==", true).get(),
    ]);
    const posts = postsSnap.docs.map((d) => ({ ...d.data(), id: d.id }) as BlogPost).filter((p) => p.slug);
    const authors = authorsSnap.docs.map((d) => ({ ...d.data(), id: d.id }) as Author);

    const xml =
      type === "rss"
        ? buildRss(posts, {
            baseUrl: BASE_URL,
            title: `${SITE_NAME} - Blog`,
            description: PAGE_SEO["/blog"].description,
            authorsById: new Map(authors.map((a) => [a.id, a])),
          })
        : buildBlogSitemap({
            baseUrl: BASE_URL,
            posts,
            authors,
            series: seriesSnap.docs.map((d) => ({ ...d.data(), id: d.id }) as BlogSeries),
            categories: categoriesOf(posts.filter(isIndexable)),
          });

    res.setHeader(
      "Content-Type",
      type === "rss" ? "application/rss+xml; charset=utf-8" : "application/xml; charset=utf-8",
    );
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400");
    return res.status(200).send(xml);
  } catch (err) {
    console.error(`[feed] ${type} failed:`, err);
    return res.status(500).send("Feed error");
  }
}
