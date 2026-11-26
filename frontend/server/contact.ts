/**
 * api/contact.ts
 * ─────────────────────────────────────────────────────────────
 * The only path through which contact messages are written.
 * (Firestore rules deny client-side writes to `contact_messages`.)
 *
 * What it does:
 *   1. Rejects non-POST requests, bots (honeypot) and floods (rate limit)
 *   2. Validates and normalises the request body
 *   3. Saves the message to Firestore (server credentials)
 *   4. Sends an email notification via Resend
 *
 * Responds 200 if at least one of (3) or (4) succeeded, 500 otherwise.
 *
 * Required environment variables (Cloudflare Pages → Settings → Variables and secrets):
 *   FIREBASE_PROJECT_ID    – e.g. saadportfolio03
 *   FIREBASE_CLIENT_EMAIL  – service account email
 *   FIREBASE_PRIVATE_KEY   – service account private key (\n may be escaped)
 *   RESEND_API_KEY         – starts with re_
 *   TO_EMAIL               – where contact emails are delivered
 *   FROM_EMAIL             – sender on a domain verified in Resend
 */

import type { ApiRequest, ApiResponse } from "./_lib/adapter.js";
import { adminDb } from "./_lib/firebase.js";
import { clientIp } from "./_lib/http.js";
import { emailConfigured, sendEmail } from "./_lib/email.js";

// ─── Validation ──────────────────────────────────────────────────

export const CONTACT_LIMITS = {
  name: { min: 1, max: 100 },
  email: { min: 3, max: 254 },
  subject: { min: 0, max: 200 },
  message: { min: 10, max: 5000 },
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ValidationResult = { ok: true; value: ContactMessage } | { ok: false; error: string };

/** Validates and trims an untrusted request body. */
export function validateContact(body: unknown): ValidationResult {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const value: ContactMessage = {
    name: str(input.name),
    email: str(input.email),
    subject: str(input.subject),
    message: str(input.message),
  };

  if (value.name.length < CONTACT_LIMITS.name.min || value.name.length > CONTACT_LIMITS.name.max) {
    return { ok: false, error: `Name is required (max ${CONTACT_LIMITS.name.max} characters)` };
  }
  if (!EMAIL_RE.test(value.email) || value.email.length > CONTACT_LIMITS.email.max) {
    return { ok: false, error: "Valid email is required" };
  }
  if (value.subject.length > CONTACT_LIMITS.subject.max) {
    return { ok: false, error: `Subject must be at most ${CONTACT_LIMITS.subject.max} characters` };
  }
  if (
    value.message.length < CONTACT_LIMITS.message.min ||
    value.message.length > CONTACT_LIMITS.message.max
  ) {
    return {
      ok: false,
      error: `Message must be ${CONTACT_LIMITS.message.min}-${CONTACT_LIMITS.message.max} characters`,
    };
  }
  return { ok: true, value };
}

// ─── Rate limiting ───────────────────────────────────────────────
// Best-effort, per warm instance. Stops casual floods; a distributed
// attacker needs an edge rate limit (Cloudflare WAF rate limiting rule) or a captcha.

const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 5 };
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > RATE_LIMIT.max;
}

// ─── Request handler ──────────────────────────────────────────────

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Honeypot: real users never see or fill the `website` field.
  // Pretend success so bots don't learn they were filtered.
  if (typeof req.body?.website === "string" && req.body.website.length > 0) {
    return res.status(200).json({ success: true });
  }

  if (isRateLimited(clientIp(req))) {
    return res.status(429).json({ error: "Too many messages. Please try again later." });
  }

  const result = validateContact(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }
  const { name, email, subject, message } = result.value;

  let saved = false;
  let emailed = false;

  try {
    await adminDb().collection("contact_messages").add({
      name,
      email,
      subject,
      message,
      created_at: new Date(),
      read: false,
    });
    saved = true;
  } catch (dbErr) {
    console.error("[contact] Firestore write failed:", dbErr);
  }

  if (!emailConfigured() || !process.env.TO_EMAIL) {
    console.warn("[contact] Resend not configured - email skipped");
  } else {
    try {
      await sendEmail({
        to: process.env.TO_EMAIL,
        replyTo: email,
        subject: `Portfolio Contact: ${subject || "New Message"}`,
        html: renderEmail(result.value),
      });
      emailed = true;
    } catch (emailErr) {
      console.error("[contact] Resend send failed:", emailErr);
    }
  }

  if (!saved && !emailed) {
    return res.status(500).json({ error: "Could not deliver your message. Please try again later." });
  }
  return res.status(200).json({ success: true });
}

// ─── Email rendering ─────────────────────────────────────────────

function renderEmail({ name, email, subject, message }: ContactMessage): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Portfolio Contact</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; font-weight: bold;">Name:</td>
            <td style="padding: 8px;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Email:</td>
            <td style="padding: 8px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        ${
          subject
            ? `<tr><td style="padding: 8px; font-weight: bold;">Subject:</td>
            <td style="padding: 8px;">${escapeHtml(subject)}</td></tr>`
            : ""
        }
      </table>
      <h3 style="color: #333; margin-top: 20px;">Message:</h3>
      <p style="background: #f5f5f5; padding: 16px; border-radius: 4px; white-space: pre-wrap;">${escapeHtml(message)}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin-top: 24px;" />
      <p style="font-size: 12px; color: #999;">Sent from your portfolio contact form</p>
    </div>
  `;
}

/** Escape user-supplied strings before injecting into HTML. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
