/**
 * GET /share-image/:slug.jpg?v=<hash>  (rewritten here by vercel.json)
 *
 * A post's share image (uploaded social image, else its cover) as a
 * 1200×630 JPEG on the site's own domain. Uploads are WebP, which LinkedIn
 * and some chat apps won't show in link previews; JPEG works everywhere.
 *
 * api/blog-page.ts points og:image here with ?v= derived from the source
 * URL, so a new upload gets a new image URL and the response itself can be
 * cached for a long time.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import sharp from "sharp";
import { allowMethods } from "./_lib/http.js";
import { findPublishedPost } from "./_lib/posts.js";
import { SLUG_RE, socialImageOf } from "../src/lib/article-core.js";
import { BASE_URL } from "../src/lib/seo-content.js";

export const SHARE_WIDTH = 1200;
export const SHARE_HEIGHT = 630;
const FALLBACK = `${BASE_URL}/og/blog.png`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ["GET", "HEAD"])) return;
  const slug = String(req.query.slug ?? "")
    .toLowerCase()
    .replace(/\.jpe?g$/, "");
  const fallback = () => {
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
    return res.redirect(302, FALLBACK);
  };
  if (!SLUG_RE.test(slug)) return fallback();

  const post = await findPublishedPost(slug);
  const src = post ? socialImageOf(post)?.url : null;
  if (!src) return fallback();

  try {
    const r = await fetch(src, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error(`source returned ${r.status}`);
    const jpeg = await sharp(Buffer.from(await r.arrayBuffer()))
      .rotate()
      .resize(SHARE_WIDTH, SHARE_HEIGHT, { fit: "cover", position: "attention" })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
    res.setHeader("Content-Type", "image/jpeg");
    // Versioned URLs never change content; unversioned ones refresh hourly.
    res.setHeader(
      "Cache-Control",
      req.query.v
        ? "public, max-age=31536000, immutable"
        : "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    );
    if (req.method === "HEAD") return res.status(200).end();
    return res.status(200).send(jpeg);
  } catch (err) {
    console.error(`[share-image] ${slug} failed:`, err);
    return fallback();
  }
}
