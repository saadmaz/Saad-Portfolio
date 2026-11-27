/**
 * Puts the experience list into Firestore (work_experience), in display order.
 * Safe to re-run: every entry has a fixed document ID and is merged, so it
 * updates in place instead of duplicating. Edit details afterwards in the admin.
 *
 *   node scripts/seed-experience.mjs           # dry run: prints what it would write
 *   node scripts/seed-experience.mjs --write   # writes to Firestore
 *
 * Credentials: see scripts/_firestore-admin.mjs (add --firebase-cli to reuse `firebase login`).
 */

import { openStore } from "./_firestore-admin.mjs";

const LOCATION = "Colombo, Sri Lanka";

/**
 * `id` reuses the existing document where one already exists (Spectrify AI,
 * Stopwash) so those keep their logos. Dates are left empty on purpose.
 */
const ENTRIES = [
  { id: "tanksudda", company: "TankSudda", role: "Founder", type: "Self-employed", current: true },
  {
    id: "pAVpYzhDjJC4E5U2Kjr4",
    company: "Stopwash (PVT) Ltd.",
    role: "Founder",
    type: "Self-employed",
    current: true,
  },
  { id: "team-sudda", company: "Team Sudda", role: "Founder", type: "Self-employed", current: true },
  { id: "polish-station", company: "Polish Station", role: "Founder", type: "Self-employed", current: true },
  {
    id: "icta",
    company: "ICTA (Information and Communication Technology Agency of Sri Lanka)",
    role: "Project Coordinator",
    type: "Full-time",
    current: false,
  },
  {
    id: "GL5rpQfBCgzgVfGRnGsS",
    company: "Spectrify AI",
    role: "Business Development Associate",
    type: "Full-time",
    current: true,
  },
  { id: "mycocoon-life", company: "MyCocoon.life", role: "Trainer", type: "Part-time", current: false },
];

const write = process.argv.includes("--write");

function toDoc(e, order) {
  return {
    company_name: e.company,
    company: e.company, // legacy alias read by older views
    employment_type: e.type,
    employmentType: e.type,
    location: LOCATION,
    location_type: "On-site",
    workMode: "On-site",
    is_current: e.current,
    isCurrent: e.current,
    roles: [
      {
        role_title: e.role,
        role_is_current: e.current,
        description: "",
        skills: [],
        media: [],
      },
    ],
    // The site lists in this order (queries order_index; sorts by display_order).
    order_index: order,
    display_order: order,
    is_featured: false,
    updated_at: new Date(),
  };
}

const docs = ENTRIES.map((e, i) => ({ id: e.id, data: toDoc(e, i) }));

if (!write) {
  console.log("Dry run. Re-run with --write to save.\n");
  for (const { id, data } of docs)
    console.log(
      `${String(data.order_index + 1).padStart(2)}. ${data.roles[0].role_title} · ${data.company_name}  [${id}]`,
    );
  process.exit(0);
}

const store = await openStore();
const writes = [];
for (const { id, data } of docs) {
  const old = await store.get("work_experience", id);
  if (old) {
    // Existing entry: keep its dates, logo, description and skills; only set the
    // role title, current flag and position in the list.
    const roles = old.roles?.length ? [...old.roles] : data.roles;
    roles[0] = { ...roles[0], role_title: data.roles[0].role_title, role_is_current: data.is_current };
    writes.push({
      col: "work_experience",
      id,
      merge: true,
      data: {
        roles,
        is_current: data.is_current,
        isCurrent: data.is_current,
        order_index: data.order_index,
        display_order: data.display_order,
        updated_at: data.updated_at,
      },
    });
  } else {
    writes.push({ col: "work_experience", id, merge: false, data: { ...data, created_at: new Date() } });
  }
  console.log(`${old ? "update" : "create"}  ${data.roles[0].role_title} · ${data.company_name}`);
}
await store.commit(writes);
console.log(`
Saved ${docs.length} entries.`);
