/**
 * Firestore security rules tests for the blog/CMS collections.
 *
 * Needs the Firestore emulator, so it is NOT part of `npm test`. Run:
 *   npm run test:rules
 * (wraps vitest in `firebase emulators:exec --only firestore`; requires the
 * Firebase CLI and Java 11+).
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";

// Must match isAdmin() in firestore.rules.
const ADMIN = { email: "saadmazaa@gmail.com", email_verified: true };

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "rules-test",
    firestore: { rules: readFileSync(resolve(__dirname, "../../../firestore.rules"), "utf8") },
  });
});
afterAll(() => env?.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "blog_posts/live"), { slug: "live", published: true, status: "published" });
    await setDoc(doc(db, "blog_posts/draft"), { slug: "draft", published: false, status: "draft" });
    await setDoc(doc(db, "blog_posts/scheduled"), {
      slug: "scheduled",
      published: false,
      status: "scheduled",
    });
    await setDoc(doc(db, "blog_posts/draft/revisions/r1"), { reason: "x" });
    await setDoc(doc(db, "blog_autosaves/live"), { data: {} });
    await setDoc(doc(db, "blog_series/s1"), { published: true });
    await setDoc(doc(db, "blog_series/hidden"), { published: false });
    await setDoc(doc(db, "blog_stats/live"), { views: 3 });
    await setDoc(doc(db, "not_found/x"), { path: "/x", count: 1 });
    await setDoc(doc(db, "blog_reactions/live"), { helpful: 1 });
    await setDoc(doc(db, "system/scheduler"), { lastRunAt: "now" });
  });
});

const anon = () => env.unauthenticatedContext().firestore();
const stranger = () =>
  env.authenticatedContext("u1", { email: "someone@example.com", email_verified: true }).firestore();
const admin = () => env.authenticatedContext("admin", ADMIN).firestore();

describe("blog_posts", () => {
  it("public can read live posts and query published ones", async () => {
    await assertSucceeds(getDoc(doc(anon(), "blog_posts/live")));
    await assertSucceeds(getDocs(query(collection(anon(), "blog_posts"), where("published", "==", true))));
    await assertSucceeds(
      getDocs(
        query(collection(anon(), "blog_posts"), where("slug", "==", "live"), where("published", "==", true)),
      ),
    );
  });

  it("drafts and scheduled posts are never readable by the public or other users", async () => {
    await assertFails(getDoc(doc(anon(), "blog_posts/draft")));
    await assertFails(getDoc(doc(anon(), "blog_posts/scheduled")));
    await assertFails(getDoc(doc(stranger(), "blog_posts/draft")));
    // A query that could return unpublished docs is rejected outright.
    await assertFails(getDocs(collection(anon(), "blog_posts")));
    await assertFails(getDocs(query(collection(anon(), "blog_posts"), where("slug", "==", "draft"))));
  });

  it("revisions and autosaves are admin-only", async () => {
    await assertFails(getDoc(doc(anon(), "blog_posts/draft/revisions/r1")));
    await assertFails(getDoc(doc(anon(), "blog_autosaves/live")));
    await assertSucceeds(getDoc(doc(admin(), "blog_posts/draft/revisions/r1")));
    await assertSucceeds(getDoc(doc(admin(), "blog_autosaves/live")));
  });

  it("only the admin can write", async () => {
    await assertFails(setDoc(doc(anon(), "blog_posts/new"), { published: true }));
    await assertFails(setDoc(doc(stranger(), "blog_posts/new"), { published: true }));
    await assertSucceeds(setDoc(doc(admin(), "blog_posts/new"), { published: false }));
    await assertSucceeds(getDoc(doc(admin(), "blog_posts/draft")));
  });
});

describe("supporting collections", () => {
  it("hidden series are private; visible ones are public", async () => {
    await assertSucceeds(getDoc(doc(anon(), "blog_series/s1")));
    await assertFails(getDoc(doc(anon(), "blog_series/hidden")));
  });

  it("authors, settings and redirects are public-read, admin-write", async () => {
    for (const path of ["authors/a", "blog_settings/config", "redirects/r"]) {
      await assertSucceeds(getDoc(doc(anon(), path)));
      await assertFails(setDoc(doc(anon(), path), { x: 1 }));
      await assertSucceeds(setDoc(doc(admin(), path), { x: 1 }));
    }
  });

  it("server-written collections can't be written from any client", async () => {
    await assertSucceeds(getDoc(doc(anon(), "blog_reactions/live")));
    await assertFails(setDoc(doc(anon(), "blog_reactions/live"), { helpful: 999 }));
    await assertFails(setDoc(doc(admin(), "blog_reactions/live"), { helpful: 999 }));
    await assertFails(setDoc(doc(anon(), "reaction_votes/v"), { a: 1 }));
    await assertFails(setDoc(doc(admin(), "blog_stats/live"), { views: 1e6 }));
    await assertFails(setDoc(doc(anon(), "not_found/y"), { path: "/y" }));
  });

  it("analytics, the 404 log and job status are admin-read only", async () => {
    await assertFails(getDoc(doc(anon(), "blog_stats/live")));
    await assertFails(getDoc(doc(anon(), "not_found/x")));
    await assertFails(getDoc(doc(anon(), "system/scheduler")));
    await assertSucceeds(getDoc(doc(admin(), "blog_stats/live")));
    await assertSucceeds(getDoc(doc(admin(), "system/scheduler")));
    await assertSucceeds(deleteDoc(doc(admin(), "not_found/x")));
  });

  it("media library is admin-only", async () => {
    await assertFails(getDoc(doc(anon(), "media/m")));
    await assertSucceeds(setDoc(doc(admin(), "media/m"), { url: "u" }));
  });
});
