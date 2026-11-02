/**
 * backfill-slugs.mjs
 * ─────────────────────────────────────────────────────────────
 * Gives every event and certificate a readable URL slug from its title
 * (/events/48th-big-debate instead of /events/3Q4zqPrFusY5KMQaw0U9).
 * Docs that already have a slug are left alone; the admin sets slugs for
 * new items itself (withSlug in the admin's common-service.ts, same rules).
 *
 *   node scripts/backfill-slugs.mjs           preview only
 *   node scripts/backfill-slugs.mjs --write   apply
 *
 * Old ID links keep working: the detail pages accept either and redirect.
 * Needs ../serviceAccountKey.json (git-ignored).
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WRITE = process.argv.includes("--write");

export function toSlug(title) {
  return String(title)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

initializeApp({
  credential: cert(JSON.parse(readFileSync(join(__dirname, "..", "..", "serviceAccountKey.json"), "utf8"))),
});
const db = getFirestore();

for (const name of ["events", "certificates"]) {
  const docs = (await db.collection(name).get()).docs;
  const taken = new Set(docs.map((d) => d.data().slug).filter(Boolean));
  let changed = 0;
  console.log(`\n${name}`);
  for (const d of docs) {
    const { slug: existing, title } = d.data();
    if (existing || !title) continue;
    const base = toSlug(title) || "item";
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    taken.add(slug);
    changed++;
    console.log(`  ${d.id}  →  ${slug}`);
    if (WRITE) await d.ref.update({ slug });
  }
  console.log(`  ${changed} of ${docs.length} ${WRITE ? "updated" : "would change"}`);
}
if (!WRITE) console.log("\nPreview only. Re-run with --write to apply.");
