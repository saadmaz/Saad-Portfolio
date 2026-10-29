/**
 * scripts/check-csp.mjs
 * ─────────────────────────────────────────────────────────────
 * Post-build guard: every executable inline <script> in dist/**.html
 * must have its SHA-256 hash listed in vercel.json's script-src.
 *
 * The CSP doesn't allow 'unsafe-inline' scripts, so editing an inline
 * script (e.g. the gtag snippet in index.html) without updating the
 * hash would silently break it in production. This fails the build
 * instead and prints the hash to add.
 */

import { createHash } from "crypto";
import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const DIST = "dist";

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return htmlFiles(p);
    return p.endsWith(".html") ? [p] : [];
  });
}

const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const csp =
  vercel.headers.flatMap((h) => h.headers).find((h) => h.key === "Content-Security-Policy")?.value ?? "";
const scriptSrc = csp.split(";").find((d) => d.trim().startsWith("script-src")) ?? "";

const missing = new Map();
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, "utf8");
  for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    // External scripts are covered by host allow-lists; JSON-LD is data, not code.
    if (/\bsrc=/.test(attrs) || /application\/ld\+json/.test(attrs)) continue;
    const hash = `'sha256-${createHash("sha256").update(body).digest("base64")}'`;
    if (!scriptSrc.includes(hash) && !missing.has(hash)) missing.set(hash, relative(DIST, file));
  }
}

if (missing.size) {
  console.error("❌  Inline scripts not allowed by the CSP in vercel.json (script-src):");
  for (const [hash, file] of missing) console.error(`    ${hash}  (first seen in ${file})`);
  process.exit(1);
}
console.log("✅  CSP covers every inline script.");
