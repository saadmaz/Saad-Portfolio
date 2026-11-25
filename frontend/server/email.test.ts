import { afterEach, describe, expect, it, vi } from "vitest";
import { emailConfigured, sendEmail } from "./_lib/email";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.RESEND_API_KEY;
  delete process.env.FROM_EMAIL;
});

describe("sendEmail (Resend)", () => {
  it("is off without a re_ key", async () => {
    process.env.RESEND_API_KEY = "SG.old";
    expect(emailConfigured()).toBe(false);
    await expect(sendEmail({ to: "a@b.co", subject: "s", html: "h" })).rejects.toThrow("not configured");
  });

  it("posts the message to Resend with the sender and reply-to", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.FROM_EMAIL = "hello@saadmaz.com";
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await sendEmail({ to: "a@b.co", subject: "Hi", html: "<p>x</p>", replyTo: "r@b.co" });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer re_test");
    expect(JSON.parse(String(init.body))).toEqual({
      from: "Saad Mazhar <hello@saadmaz.com>",
      to: ["a@b.co"],
      reply_to: "r@b.co",
      subject: "Hi",
      html: "<p>x</p>",
    });
  });

  it("surfaces Resend errors", async () => {
    process.env.RESEND_API_KEY = "re_test";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("domain not verified", { status: 403 })),
    );
    await expect(sendEmail({ to: "a@b.co", subject: "s", html: "h" })).rejects.toThrow("Resend returned 403");
  });
});
