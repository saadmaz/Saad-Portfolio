/**
 * Puts the experience list into Firestore (work_experience), in display order.
 * Safe to re-run: every entry has a fixed document ID and is merged, so it
 * updates in place instead of duplicating. Edit details afterwards in the admin.
 *
 *   node scripts/seed-experience.mjs           # dry run: prints what it would write
 *   node scripts/seed-experience.mjs --write   # writes to Firestore
 *
 * Credentials (admin access, same as the Vercel functions), either:
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in the environment, or
 *   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json, or
 *   --firebase-cli: reuse the Firebase CLI login on this machine (`firebase login`),
 *   if that Google account has access to the project.
 */

import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { cert, applicationDefault, initializeApp, refreshToken } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

function credential() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return applicationDefault();
  if (process.argv.includes("--firebase-cli")) {
    // The CLI's stored session plus its public OAuth client (firebase-tools lib/api.js).
    const store = JSON.parse(
      readFileSync(join(homedir(), ".config/configstore/firebase-tools.json"), "utf8"),
    );
    const token = store.tokens?.refresh_token;
    if (!token) throw new Error("Not logged in to the Firebase CLI. Run `firebase login` first.");
    return {
      cli: true,
      refresh: refreshToken({
        type: "authorized_user",
        client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
        client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
        refresh_token: token,
      }),
    };
  }
  return null;
}

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

const cred = credential();
if (!cred) {
  console.error(
    "No admin credentials. Set FIREBASE_* or GOOGLE_APPLICATION_CREDENTIALS (see the header of this file).",
  );
  process.exit(1);
}

const PROJECT = process.env.FIREBASE_PROJECT_ID || "saadportfolio03";

/**
 * Two ways to talk to Firestore: the Admin SDK (service account) or, for a
 * Firebase CLI login (which the Admin SDK's Firestore client refuses), the
 * REST API with that login's access token. Both expose get + commit.
 */
function adminStore() {
  const db = getFirestore(initializeApp({ credential: cred, projectId: PROJECT }));
  const col = db.collection("work_experience");
  return {
    async get(id) {
      const snap = await col.doc(id).get();
      return snap.exists ? snap.data() : null;
    },
    async commit(writes) {
      const batch = db.batch();
      for (const w of writes) batch.set(col.doc(w.id), w.data, w.merge ? { merge: true } : {});
      await batch.commit();
    },
  };
}

const enc = (v) => {
  if (v === null || v === undefined) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: v.length ? { values: v.map(enc) } : {} };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "object")
    return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
  return { stringValue: String(v) };
};
const dec = (v) => {
  if ("mapValue" in v)
    return Object.fromEntries(Object.entries(v.mapValue.fields ?? {}).map(([k, x]) => [k, dec(x)]));
  if ("arrayValue" in v) return (v.arrayValue.values ?? []).map(dec);
  if ("integerValue" in v) return Number(v.integerValue);
  if ("timestampValue" in v) return new Date(v.timestampValue);
  return Object.values(v)[0];
};

async function restStore() {
  const { access_token: token } = await cred.refresh.getAccessToken();
  const base = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  return {
    async get(id) {
      const res = await fetch(`${base}/work_experience/${id}`, { headers });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Read failed (${res.status}): ${await res.text()}`);
      return dec({ mapValue: { fields: (await res.json()).fields ?? {} } });
    },
    async commit(writes) {
      const body = {
        writes: writes.map((w) => ({
          update: {
            name: `projects/${PROJECT}/databases/(default)/documents/work_experience/${w.id}`,
            fields: enc(w.data).mapValue.fields,
          },
          ...(w.merge ? { updateMask: { fieldPaths: Object.keys(w.data) } } : {}),
        })),
      };
      const res = await fetch(`${base}:commit`, { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`Write failed (${res.status}): ${await res.text()}`);
    },
  };
}

const store = cred.cli ? await restStore() : adminStore();
const writes = [];
for (const { id, data } of docs) {
  const old = await store.get(id);
  if (old) {
    // Existing entry: keep its dates, logo, description and skills; only set the
    // role title, current flag and position in the list.
    const roles = old.roles?.length ? [...old.roles] : data.roles;
    roles[0] = { ...roles[0], role_title: data.roles[0].role_title, role_is_current: data.is_current };
    writes.push({
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
    writes.push({ id, merge: false, data: { ...data, created_at: new Date() } });
  }
  console.log(`${old ? "update" : "create"}  ${data.roles[0].role_title} · ${data.company_name}`);
}
await store.commit(writes);
console.log(`
Saved ${docs.length} entries.`);
