import { describe, expect, it } from "vitest";
import { CONTACT_LIMITS, escapeHtml, isRateLimited, validateContact } from "./contact";

const valid = {
  name: "  Ada Lovelace ",
  email: "ada@example.com",
  subject: "Hello",
  message: "This is a perfectly reasonable message.",
};

describe("validateContact", () => {
  it("accepts a valid body and trims every field", () => {
    const result = validateContact(valid);
    expect(result).toEqual({
      ok: true,
      value: { ...valid, name: "Ada Lovelace" },
    });
  });

  it("treats a missing subject as empty", () => {
    const { subject: _subject, ...rest } = valid;
    const result = validateContact(rest);
    expect(result.ok && result.value.subject).toBe("");
  });

  it.each([
    ["missing name", { ...valid, name: "   " }],
    ["over-long name", { ...valid, name: "a".repeat(CONTACT_LIMITS.name.max + 1) }],
    ["email without domain", { ...valid, email: "ada@" }],
    ["email with spaces", { ...valid, email: "ada lovelace@example.com" }],
    ["short message", { ...valid, message: "too short" }],
    ["over-long message", { ...valid, message: "a".repeat(CONTACT_LIMITS.message.max + 1) }],
    ["over-long subject", { ...valid, subject: "a".repeat(CONTACT_LIMITS.subject.max + 1) }],
    ["non-string fields", { ...valid, name: 42 }],
  ])("rejects %s", (_label, body) => {
    expect(validateContact(body).ok).toBe(false);
  });

  it.each([null, undefined, "string", 123])("rejects non-object body %p", (body) => {
    expect(validateContact(body).ok).toBe(false);
  });
});

describe("isRateLimited", () => {
  it("allows 5 requests per window, then blocks, then recovers", () => {
    const key = `test-${Math.random()}`;
    const t0 = 1_000_000;
    for (let i = 0; i < 5; i++) expect(isRateLimited(key, t0 + i)).toBe(false);
    expect(isRateLimited(key, t0 + 10)).toBe(true);
    expect(isRateLimited(key, t0 + 11 * 60 * 1000)).toBe(false);
  });

  it("tracks keys independently", () => {
    const t0 = 2_000_000;
    for (let i = 0; i < 6; i++) isRateLimited("noisy", t0);
    expect(isRateLimited(`quiet-${Math.random()}`, t0)).toBe(false);
  });
});

describe("escapeHtml", () => {
  it("escapes every HTML-significant character", () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; onclick=&#039;y&#039;&gt;&amp;&lt;/a&gt;",
    );
  });
});
