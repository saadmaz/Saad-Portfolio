import { describe, expect, it } from "vitest";
import type { VercelRequest } from "@vercel/node";
import { decideScheduled, snapshotOf, SNAPSHOT_FIELDS } from "./_lib/scheduler";
import { signPreviewToken, verifyPreviewToken } from "./_lib/preview-token";
import { isAdminClaims, requireAdmin } from "./_lib/auth";
import { createRateLimiter, jsonBody } from "./_lib/http";
import { isAuthorizedCron } from "./cron/publish-scheduled";
import { depthBucket, fieldKey, parseTrackEvent, refHostOf } from "./track";
import { validateReaction } from "./reactions";
import { integrationStatus } from "./admin";

const NOW = new Date("2026-06-01T12:00:00.000Z");
const ready = {
  id: "p1",
  status: "scheduled" as const,
  title: "A complete article",
  slug: "a-complete-article",
  excerpt: "A useful summary of the article.",
  content: `<p>${"word ".repeat(30)}</p>`,
  date: "2026-05-01T00:00:00.000Z",
  revision: 4,
};

describe("decideScheduled", () => {
  it("skips posts that aren't scheduled or aren't due", () => {
    expect(decideScheduled({ ...ready, status: "draft" }, NOW)).toEqual({
      action: "skip",
      reason: "not-scheduled",
    });
    expect(decideScheduled({ ...ready, scheduledAt: "2026-06-01T12:00:01.000Z" }, NOW)).toEqual({
      action: "skip",
      reason: "not-due",
    });
  });

  it("publishes a due post, dating it at the scheduled time on first publication", () => {
    const d = decideScheduled({ ...ready, scheduledAt: "2026-06-01T09:00:00.000Z" }, NOW);
    expect(d.action).toBe("publish");
    if (d.action !== "publish") return;
    expect(d.update).toMatchObject({
      status: "published",
      published: true,
      publishedAt: "2026-06-01T09:00:00.000Z",
      date: "2026-06-01T09:00:00.000Z",
      scheduledAt: null,
      scheduleError: null,
      publishedSlug: "a-complete-article",
      revision: 5,
    });
    expect(d.slugMove).toBeNull();
  });

  it("keeps the original publication date when republishing", () => {
    const d = decideScheduled(
      {
        ...ready,
        scheduledAt: "2026-06-01T09:00:00.000Z",
        publishedAt: "2025-01-01T00:00:00.000Z",
        date: "2025-01-01T00:00:00.000Z",
      },
      NOW,
    );
    if (d.action !== "publish") throw new Error("expected publish");
    expect(d.update.publishedAt).toBe("2025-01-01T00:00:00.000Z");
    expect(d.update.date).toBe("2025-01-01T00:00:00.000Z");
    expect(d.update.lastUpdatedAt).toBe(NOW.toISOString());
  });

  it("plans a redirect when the slug changed since it was last live", () => {
    const d = decideScheduled(
      {
        ...ready,
        scheduledAt: "2026-06-01T09:00:00.000Z",
        publishedAt: "2025-01-01T00:00:00.000Z",
        publishedSlug: "old-slug",
      },
      NOW,
    );
    if (d.action !== "publish") throw new Error("expected publish");
    expect(d.slugMove).toEqual({ from: "/blog/old-slug", to: "/blog/a-complete-article" });
  });

  it("rejects incomplete posts back to draft with the reasons", () => {
    const d = decideScheduled({ ...ready, scheduledAt: "2026-06-01T09:00:00.000Z", excerpt: "" }, NOW);
    expect(d.action).toBe("reject");
    if (d.action !== "reject") return;
    expect(d.update).toMatchObject({ status: "draft", published: false });
    expect(String(d.update.scheduleError)).toContain("Excerpt");
  });

  it("rejects a scheduled post without a valid time", () => {
    expect(decideScheduled({ ...ready, scheduledAt: "not a date" }, NOW).action).toBe("reject");
  });

  it("snapshots only content fields", () => {
    const snap = snapshotOf({ title: "T", content: "C", revision: 3, published: true, extra: 1 });
    expect(snap).toEqual({ title: "T", content: "C" });
    expect(SNAPSHOT_FIELDS).toContain("contentJson");
  });
});

describe("preview tokens", () => {
  const secret = "s".repeat(40);
  it("verifies a fresh token for the same post", () => {
    expect(verifyPreviewToken(signPreviewToken("abc", secret, 1000), "abc", secret, 2000)).toEqual({
      ok: true,
    });
  });
  it("rejects expired, tampered, wrong-post and wrong-secret tokens", () => {
    const token = signPreviewToken("abc", secret, 1000, 500);
    expect(verifyPreviewToken(token, "abc", secret, 2000)).toEqual({ ok: false, reason: "expired" });
    const fresh = signPreviewToken("abc", secret, 1000);
    expect(verifyPreviewToken(fresh, "other", secret, 2000)).toEqual({ ok: false, reason: "post" });
    expect(verifyPreviewToken(fresh, "abc", "x".repeat(40), 2000)).toEqual({
      ok: false,
      reason: "signature",
    });
    const [payload, sig] = fresh.split(".");
    const forged = Buffer.from(JSON.stringify({ id: "abc", exp: 9e15 })).toString("base64url");
    expect(verifyPreviewToken(`${forged}.${sig}`, "abc", secret, 2000).ok).toBe(false);
    expect(verifyPreviewToken(payload, "abc", secret, 2000)).toEqual({ ok: false, reason: "malformed" });
  });
});

describe("admin auth", () => {
  it("accepts only the verified admin email", () => {
    expect(isAdminClaims({ email: "Admin@Example.com", email_verified: true }, "admin@example.com")).toBe(
      true,
    );
    expect(isAdminClaims({ email: "admin@example.com", email_verified: false }, "admin@example.com")).toBe(
      false,
    );
    expect(isAdminClaims({ email: "other@example.com", email_verified: true }, "admin@example.com")).toBe(
      false,
    );
    expect(isAdminClaims({ email: "admin@example.com", email_verified: true }, undefined)).toBe(false);
  });

  const req = (authorization?: string) => ({ headers: { authorization } }) as unknown as VercelRequest;

  it("fails closed without ADMIN_EMAIL, a token, or a valid token", async () => {
    const prev = process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_EMAIL;
    expect(await requireAdmin(req("Bearer t"), async () => ({}))).toMatchObject({ ok: false, status: 500 });
    process.env.ADMIN_EMAIL = "admin@example.com";
    expect(await requireAdmin(req(), async () => ({}))).toMatchObject({ ok: false, status: 401 });
    expect(
      await requireAdmin(req("Bearer bad"), async () => {
        throw new Error("bad token");
      }),
    ).toMatchObject({ ok: false, status: 401 });
    expect(
      await requireAdmin(req("Bearer t"), async () => ({
        email: "intruder@example.com",
        email_verified: true,
      })),
    ).toMatchObject({ ok: false, status: 403 });
    expect(
      await requireAdmin(req("Bearer t"), async () => ({ email: "admin@example.com", email_verified: true })),
    ).toEqual({ ok: true, email: "admin@example.com" });
    if (prev === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = prev;
  });
});

describe("cron auth", () => {
  it("requires the exact bearer secret, and a strong secret", () => {
    const secret = "c".repeat(32);
    expect(isAuthorizedCron(`Bearer ${secret}`, secret)).toBe(true);
    expect(isAuthorizedCron(`Bearer ${secret}x`, secret)).toBe(false);
    expect(isAuthorizedCron(undefined, secret)).toBe(false);
    expect(isAuthorizedCron("Bearer short", "short")).toBe(false);
    expect(isAuthorizedCron("Bearer ", undefined)).toBe(false);
  });
});

describe("tracking", () => {
  it("reduces referrers to a host and classifies internal/direct", () => {
    expect(refHostOf("https://www.google.com/search?q=secret")).toBe("google.com");
    expect(refHostOf("https://www.saadmaz.com/blog")).toBe("internal");
    expect(refHostOf("")).toBe("direct");
    expect(refHostOf("not a url")).toBe("direct");
    expect(fieldKey("news.ycombinator.com")).toBe("news_ycombinator_com");
  });

  it("validates events and strips query strings from 404 paths", () => {
    expect(parseTrackEvent({ t: "view", postId: "abc" })).toEqual({
      t: "view",
      postId: "abc",
      refHost: "direct",
    });
    expect(parseTrackEvent({ t: "view", postId: "../etc" })).toBeNull();
    expect(parseTrackEvent({ t: "404", path: "/missing?email=a@b.c#x" })).toMatchObject({ path: "/missing" });
    expect(parseTrackEvent({ t: "404", path: "//evil.com" })).toBeNull();
    expect(parseTrackEvent({ t: "engage", postId: "a", ms: 1e9, depth: 140 })).toMatchObject({
      ms: 30 * 60 * 1000,
      depth: 100,
    });
    expect(parseTrackEvent({ t: "nope" })).toBeNull();
  });

  it("buckets scroll depth", () => {
    expect([10, 30, 60, 80, 99].map(depthBucket)).toEqual([null, "d25", "d50", "d75", "d100"]);
  });
});

describe("reactions", () => {
  it("accepts only known reactions on well-formed ids", () => {
    expect(validateReaction({ postId: "abc", reaction: "helpful" })).toMatchObject({ ok: true });
    expect(validateReaction({ postId: "abc", reaction: "angry" })).toMatchObject({ ok: false });
    expect(validateReaction({ postId: "a/b", reaction: "helpful" })).toMatchObject({ ok: false });
  });
});

describe("http helpers", () => {
  it("parses beacon text bodies and ignores junk", () => {
    expect(jsonBody({ body: '{"t":"view"}' } as VercelRequest)).toEqual({ t: "view" });
    expect(jsonBody({ body: { a: 1 } } as unknown as VercelRequest)).toEqual({ a: 1 });
    expect(jsonBody({ body: "not json" } as VercelRequest)).toEqual({});
    expect(jsonBody({ body: "x".repeat(20_000) } as VercelRequest)).toEqual({});
  });

  it("rate-limits per key", () => {
    const limited = createRateLimiter({ windowMs: 1000, max: 2 });
    expect([limited("a", 0), limited("a", 1), limited("a", 2), limited("b", 2), limited("a", 1500)]).toEqual([
      false,
      false,
      true,
      false,
      false,
    ]);
  });

  it("reports integration status as booleans only", () => {
    const status = integrationStatus({
      VERCEL_DEPLOY_HOOK_URL: "https://hook",
      PREVIEW_SECRET: "short",
    } as NodeJS.ProcessEnv);
    expect(status).toEqual({
      deployHook: true,
      previewSecret: false,
      cronSecret: false,
      analyticsSalt: false,
      ga4: false,
      searchConsole: false,
    });
  });
});
