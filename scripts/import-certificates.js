/**
 * One-time script: import certificates.json → Firestore "certificates" collection
 *
 * Usage:
 *   1. Place your Firebase service account key at the project root as:
 *        serviceAccountKey.json
 *   2. From the project root, run:
 *        node scripts/import-certificates.js
 *
 * The script is idempotent — run it again to overwrite with the latest JSON.
 * It deletes all existing docs first, then writes fresh ones.
 */

const admin = require("firebase-admin");
const path  = require("path");
const fs    = require("fs");

// ── Load service account ─────────────────────────────────────────────────────
const keyPath = path.resolve(__dirname, "../serviceAccountKey.json");
if (!fs.existsSync(keyPath)) {
  console.error("\n❌  serviceAccountKey.json not found at project root.");
  console.error("    Download it from: Firebase Console → Project Settings → Service accounts\n");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(keyPath)),
});

const db = admin.firestore();
const COLLECTION = "certificates";

// ── Load JSON data ────────────────────────────────────────────────────────────
const jsonPath = path.resolve(__dirname, "../frontend/src/data/certificates.json");
const certificates = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

// ── Import ────────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n📦  Importing ${certificates.length} certificates into Firestore...\n`);

  // 1. Delete existing documents
  const existing = await db.collection(COLLECTION).listDocuments();
  if (existing.length > 0) {
    const batch = db.batch();
    existing.forEach((ref) => batch.delete(ref));
    await batch.commit();
    console.log(`🗑   Cleared ${existing.length} existing document(s).`);
  }

  // 2. Write each certificate (use the JSON "id" as the Firestore document ID)
  const batches = [];
  let batch = db.batch();
  let opCount = 0;

  for (const cert of certificates) {
    const { id, ...data } = cert;
    const docRef = db.collection(COLLECTION).doc(String(id));
    batch.set(docRef, {
      ...data,
      imported_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    opCount++;

    // Firestore batch limit is 500 operations
    if (opCount === 499) {
      batches.push(batch.commit());
      batch = db.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    batches.push(batch.commit());
  }

  await Promise.all(batches);

  console.log(`✅  Done! ${certificates.length} certificates written to "${COLLECTION}".\n`);
}

run().catch((err) => {
  console.error("❌  Import failed:", err);
  process.exit(1);
});
