/**
 * Firestore access shared by every handler, through the REST client in
 * ./firestore.ts (firebase-admin doesn't run on Cloudflare).
 *
 * Env: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.
 */

import { Firestore } from "./firestore.js";

let db: Firestore | null = null;
export const adminDb = () => (db ??= new Firestore());

export const hasAdminCredentials = () =>
  !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
