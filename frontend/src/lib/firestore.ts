/**
 * lib/firestore.ts
 * ─────────────────────────────────────────────────────────────
 * Read-only Firestore helpers shared by every service.
 *
 * Errors are deliberately NOT swallowed here: they propagate to
 * TanStack Query so components get a real `isError` state instead of
 * an empty list that looks like "no data".
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
export async function fetchCollection<T>(
  name: CollectionName,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const snap = await getDocs(query(collection(db, name), ...constraints));
  return snap.docs.map((d) => toEntity<T>(d));
}

/** Fetch a collection sorted ascending by `field`. */
export function fetchOrdered<T>(name: CollectionName, field: string, direction: "asc" | "desc" = "asc") {
  return fetchCollection<T>(name, orderBy(field, direction));
}

/** Fetch one document by ID, or `null` if it doesn't exist. */
export async function fetchById<T>(name: CollectionName, id: string): Promise<T | null> {
  const snap = await getDoc(doc(db, name, id));
  return snap.exists() ? toEntity<T>(snap) : null;
}

/** Fetch the first document where `field == value`, or `null`. */
export async function fetchFirstWhere<T>(
  name: CollectionName,
  field: string,
  value: unknown,
): Promise<T | null> {
  const snap = await getDocs(query(collection(db, name), where(field, "==", value), limit(1)));
  return snap.empty ? null : toEntity<T>(snap.docs[0]);
}
