/**
 * scripts/check-csp.mjs
 * ─────────────────────────────────────────────────────────────
 * Post-build guard: every executable inline <script> in dist/**.html
 * must have its SHA-256 hash in script-src (src/lib/security-headers.js).
 *
 * The CSP doesn't allow 'unsafe-inline' scripts, so editing an inline
 * script (e.g. the gtag snippet in index.html) without updating the
 * hash would silently break it in production. This fails the build
 * instead and prints the hash to add.
 */

import { createHash } from "crypto";
import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";
import { CSP as csp } from "../src/lib/security-headers.js";

const DIST = "dist";

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return htmlFiles(p);
    return p.endsWith(".html") ? [p] : [];
  });
}

const scriptSrc = csp.split(";").find((d) => d.trim().startsWith("script-src")) ?? "";

const missing = new Map();
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, "utf8");
  for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    // External scripts are covered by host allow-lists; JSON blocks (JSON-LD, the
    // query snapshot) are data the browser never executes, so CSP does not apply.
    if (/\bsrc=/.test(attrs) || /type="application\/(ld\+)?json"/.test(attrs)) continue;
    const hash = `'sha256-${createHash("sha256").update(body).digest("base64")}'`;
    if (!scriptSrc.includes(hash) && !missing.has(hash)) missing.set(hash, relative(DIST, file));
  }
}

if (missing.size) {
  console.error("❌  Inline scripts not allowed by the CSP in src/lib/security-headers.js (script-src):");
  for (const [hash, file] of missing) console.error(`    ${hash}  (first seen in ${file})`);
  process.exit(1);
}
console.log("✅  CSP covers every inline script.");
