import { describe, expect, it } from "vitest";
import { SERIES as SITE_SERIES } from "../src/lib/newsletter";
import {
  CONFIRM_TTL_MS,
  SERIES,
  signToken,
  subscriberId,
  validateSubscribe,
  verifyToken,
} from "./_lib/subscribe";

const SECRET = "s".repeat(40);

describe("validateSubscribe", () => {
  it("normalises the email and defaults to every series", () => {
    expect(validateSubscribe({ email: "  Jane@Example.COM " })).toEqual({
      ok: true,
      value: { email: "jane@example.com", topics: [...SERIES] },
    });
  });
  it("keeps only known series", () => {
    const r = validateSubscribe({ email: "a@b.co", topics: ["tech-news", "spam"] });
    expect(r.ok && r.value.topics).toEqual(["tech-news"]);
  });
  it("maps the old founder/cse topics onto the six series", () => {
    const r = validateSubscribe({ email: "a@b.co", topics: ["cse"] });
    expect(r.ok && r.value.topics).toEqual(["ai-and-technology", "ai-tutorials", "tech-news"]);
  });
  it("uses the same series ids as the site", () => {
    expect([...SERIES]).toEqual(SITE_SERIES.map((s) => s.id));
  });
  it("rejects bad emails", () => {
    for (const email of ["", "nope", "a@b", "a b@c.com", 42])
      expect(validateSubscribe({ email }).ok).toBe(false);
  });
});

describe("subscriberId", () => {
  it("is the same for differently-cased emails", () => {
    expect(subscriberId("A@B.co")).toBe(subscriberId(" a@b.co"));
  });
});

describe("tokens", () => {
  const id = subscriberId("a@b.co");
  it("round-trips confirm and unsubscribe tokens", () => {
    expect(verifyToken(signToken("confirm", id, SECRET), "confirm", SECRET)).toEqual({ ok: true, id });
    expect(verifyToken(signToken("unsub", id, SECRET), "unsub", SECRET)).toEqual({ ok: true, id });
  });
  it("expires confirm links but not unsubscribe links", () => {
    const later = Date.now() + CONFIRM_TTL_MS + 1000;
    expect(verifyToken(signToken("confirm", id, SECRET), "confirm", SECRET, later)).toMatchObject({
      reason: "expired",
    });
    expect(verifyToken(signToken("unsub", id, SECRET), "unsub", SECRET, later).ok).toBe(true);
  });
  it("rejects tampering, wrong secrets and wrong actions", () => {
    const t = signToken("confirm", id, SECRET);
    expect(verifyToken(t, "unsub", SECRET)).toMatchObject({ reason: "action" });
    expect(verifyToken(t, "confirm", "x".repeat(40))).toMatchObject({ reason: "signature" });
    expect(verifyToken(`${t}x`, "confirm", SECRET)).toMatchObject({ reason: "signature" });
    expect(verifyToken("junk", "confirm", SECRET)).toMatchObject({ reason: "malformed" });
  });
});
