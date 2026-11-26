/**
 * lib/firestore.ts
 * ─────────────────────────────────────────────────────────────
 * Read-only Firestore helpers shared by every service.
 *
 * Errors are deliberately NOT swallowed here: they propagate to
 * TanStack Query so components get a real `isError` state instead of
 * an empty list that looks like "no data".
 */

import type { DocumentData, DocumentSnapshot, QueryDocumentSnapshot } from "firebase/firestore";

/**
 * The Firebase SDK is loaded on first use, not with the page: pages render from
 * the build-time snapshot (lib/querySnapshot.ts) and only reach for Firestore to
 * refresh, so the SDK stays off the critical path.
 */
const sdk = () => Promise.all([import("firebase/firestore"), import("@/lib/firebase")]);

/** An equality filter, built without loading the SDK: `where("published", "==", true)`. */
export interface Where {
  field: string;
  op: "==";
  value: unknown;
}
export const where = (field: string, op: "==", value: unknown): Where => ({ field, op, value });

/** Every Firestore collection the public site reads from. */
export const COLLECTIONS = {
  projects: "projects",
  blogPosts: "blog_posts",
  experience: "work_experience",
  skills: "skills",
  certificates: "certificates",
  awards: "awards",
  languages: "languages",
  hackathons: "hackathons",
  testimonials: "testimonials",
  volunteer: "volunteer_experience",
  education: "education",
  events: "events",
  newsletters: "newsletters",
  courses: "courses",
  publications: "publications",
  patents: "patents",
  testScores: "test_scores",
  organizations: "organizations",
  causes: "causes",
  authors: "authors",
  blogSeries: "blog_series",
  blogSettings: "blog_settings",
  siteSettings: "site_settings",
  blogReactions: "blog_reactions",
  redirects: "redirects",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/**
 * Converts a snapshot into a plain object with its document ID.
 * A stored `id` field takes precedence over the document ID, matching
 * how legacy imported documents were addressed in URLs.
 */
export function toEntity<T>(snap: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): T {
  return { id: snap.id, ...snap.data() } as T;
}

/** Fetch every document in a collection, optionally filtered/sorted. */
export async function fetchCollection<T>(name: CollectionName, ...filters: Where[]): Promise<T[]> {
  const [fs, { db }] = await sdk();
  const q = fs.query(fs.collection(db, name), ...filters.map((f) => fs.where(f.field, f.op, f.value)));
  const snap = await fs.getDocs(q);
  return snap.docs.map((d) => toEntity<T>(d));
}

/** Fetch a collection sorted ascending by `field`. */
export async function fetchOrdered<T>(
  name: CollectionName,
  field: string,
  direction: "asc" | "desc" = "asc",
): Promise<T[]> {
  const [fs, { db }] = await sdk();
  const snap = await fs.getDocs(fs.query(fs.collection(db, name), fs.orderBy(field, direction)));
  return snap.docs.map((d) => toEntity<T>(d));
}

/** Fetch one document by ID, or `null` if it doesn't exist. */
export async function fetchById<T>(name: CollectionName, id: string): Promise<T | null> {
  const [fs, { db }] = await sdk();
  const snap = await fs.getDoc(fs.doc(db, name, id));
  return snap.exists() ? toEntity<T>(snap) : null;
}

/** Fetch the first document matching every filter, or `null`. */
export async function fetchFirst<T>(name: CollectionName, ...filters: Where[]): Promise<T | null> {
  const [fs, { db }] = await sdk();
  const q = fs.query(
    fs.collection(db, name),
    ...filters.map((f) => fs.where(f.field, f.op, f.value)),
    fs.limit(1),
  );
  const snap = await fs.getDocs(q);
  return snap.empty ? null : toEntity<T>(snap.docs[0]);
}

/** Fetch the first document where `field == value`, or `null`. */
export async function fetchFirstWhere<T>(
  name: CollectionName,
  field: string,
  value: unknown,
): Promise<T | null> {
  return fetchFirst<T>(name, where(field, "==", value));
}
