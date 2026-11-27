/**
 * Puts the six series (src/lib/newsletter.ts) into Firestore as blog series
 * (`blog_series/{id}`) and moves the old founder/cse newsletter ids onto them:
 * subscriber `topics` and newsletter issue `type`.
 * Safe to re-run: series have fixed ids and are merged, keeping their posts,
 * cover and slug; edit them afterwards in the admin.
 *
 *   node scripts/seed-series.mjs                         # dry run
 *   node scripts/seed-series.mjs --write --firebase-cli  # writes to Firestore
 *
 * Credentials: see scripts/_firestore-admin.mjs.
 */

import { SERIES } from "../src/lib/newsletter.ts";
import { openStore } from "./_firestore-admin.mjs";

/** Same mapping as server/_lib/subscribe.ts and seriesOf(). */
const LEGACY_TOPICS = {
  founder: ["building-in-public", "startups", "personal-branding"],
  cse: ["ai-and-technology", "ai-tutorials", "tech-news"],
};
const LEGACY_TYPE = { founder: "startups", cse: "ai-and-technology" };

const write = process.argv.includes("--write");
const store = await openStore();
const now = new Date().toISOString();
const writes = [];

for (const [i, s] of SERIES.entries()) {
  const old = await store.get("blog_series", s.id);
  const data = { title: s.title, label: s.label, order: i + 1, description: s.blurb, updatedAt: now };
  writes.push(
    old
      ? { col: "blog_series", id: s.id, merge: true, data }
      : {
          col: "blog_series",
          id: s.id,
          merge: false,
          data: { ...data, slug: s.id, postIds: [], published: true, createdAt: now },
        },
  );
  console.log(`${old ? "update" : "create"}  series ${s.number} / ${s.title} (${s.label})`);
}

for (const { id, data } of await store.list("subscribers")) {
  const topics = data.topics ?? [];
  if (!topics.some((t) => t in LEGACY_TOPICS)) continue;
  const next = [...new Set(topics.flatMap((t) => LEGACY_TOPICS[t] ?? [t]))];
  writes.push({ col: "subscribers", id, merge: true, data: { topics: next } });
  console.log(`migrate subscriber ${data.email}: ${topics.join(",")} → ${next.join(",")}`);
}

for (const { id, data } of await store.list("newsletters")) {
  if (!(data.type in LEGACY_TYPE)) continue;
  writes.push({ col: "newsletters", id, merge: true, data: { type: LEGACY_TYPE[data.type] } });
  console.log(`migrate issue "${data.title}": ${data.type} → ${LEGACY_TYPE[data.type]}`);
}

if (!write) {
  console.log(`\nDry run: ${writes.length} writes. Re-run with --write to save.`);
  process.exit(0);
}
// Firestore commits take up to 500 writes.
for (let i = 0; i < writes.length; i += 500) await store.commit(writes.slice(i, i + 500));
console.log(`\nSaved ${writes.length} writes.`);
