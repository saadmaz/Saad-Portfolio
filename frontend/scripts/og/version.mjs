/**
 * og/version.mjs
 * ─────────────────────────────────────────────────────────────
 * Short hash of everything that changes how a card looks (renderer, fonts,
 * portrait). Appended as ?v= to og:image URLs by both prerender.mjs and
 * SEO.tsx (via Vite's define), so LinkedIn/WhatsApp/X refetch after a redesign
 * but keep their cache across ordinary deploys.
 */

import { createHash } from "crypto";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const here = dirname(fileURLToPath(import.meta.url));

export function ogVersion() {
  const hash = createHash("sha256");
  const files = [
    join(here, "render.mjs"),
    ...readdirSync(join(here, "fonts"))
      .sort()
      .map((f) => join(here, "fonts", f)),
    join(here, "..", "..", "public", "profile-photo.png"),
  ];
  for (const file of files) hash.update(readFileSync(file));
  return hash.digest("hex").slice(0, 8);
}
