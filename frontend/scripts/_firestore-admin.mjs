/**
 * Admin Firestore access for the seed scripts. Credentials, either:
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

const PROJECT = process.env.FIREBASE_PROJECT_ID || "saadportfolio03";

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

/** Admin SDK store (service account). */
function adminStore(cred) {
  const db = getFirestore(initializeApp({ credential: cred, projectId: PROJECT }));
  return {
    async list(col) {
      const snap = await db.collection(col).get();
      return snap.docs.map((d) => ({ id: d.id, data: d.data() }));
    },
    async get(col, id) {
      const snap = await db.collection(col).doc(id).get();
      return snap.exists ? snap.data() : null;
    },
    async commit(writes) {
      const batch = db.batch();
      for (const w of writes)
        batch.set(db.collection(w.col).doc(w.id), w.data, w.merge ? { merge: true } : {});
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
const fieldsOf = (doc) => dec({ mapValue: { fields: doc.fields ?? {} } });

/**
 * REST store for a Firebase CLI login, whose token the Admin SDK's Firestore
 * client refuses.
 */
async function restStore(cred) {
  const { access_token: token } = await cred.refresh.getAccessToken();
  const root = `projects/${PROJECT}/databases/(default)/documents`;
  const base = `https://firestore.googleapis.com/v1/${root}`;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  return {
    async list(col) {
      const out = [];
      let page = "";
      do {
        const res = await fetch(`${base}/${col}?pageSize=300${page ? `&pageToken=${page}` : ""}`, {
          headers,
        });
        if (!res.ok) throw new Error(`List failed (${res.status}): ${await res.text()}`);
        const body = await res.json();
        for (const d of body.documents ?? []) out.push({ id: d.name.split("/").pop(), data: fieldsOf(d) });
        page = body.nextPageToken ?? "";
      } while (page);
      return out;
    },
    async get(col, id) {
      const res = await fetch(`${base}/${col}/${id}`, { headers });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Read failed (${res.status}): ${await res.text()}`);
      return fieldsOf(await res.json());
    },
    async commit(writes) {
      if (!writes.length) return;
      const body = {
        writes: writes.map((w) => ({
          update: { name: `${root}/${w.col}/${w.id}`, fields: enc(w.data).mapValue.fields },
          ...(w.merge ? { updateMask: { fieldPaths: Object.keys(w.data) } } : {}),
        })),
      };
      const res = await fetch(`${base}:commit`, { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`Write failed (${res.status}): ${await res.text()}`);
    },
  };
}

/**
 * { list(col), get(col, id), commit([{ col, id, data, merge }]) }, or exits
 * when there are no credentials.
 */
export async function openStore() {
  const cred = credential();
  if (!cred) {
    console.error(
      "No admin credentials. Set FIREBASE_* or GOOGLE_APPLICATION_CREDENTIALS, or pass --firebase-cli.",
    );
    process.exit(1);
  }
  return cred.cli ? restStore(cred) : adminStore(cred);
}
