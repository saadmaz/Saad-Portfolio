/**
 * api/subscribe.ts
 * ─────────────────────────────────────────────────────────────
 * Newsletter sign-up, double opt-in. POST only, one JSON body:
 *
 *   { action: "subscribe", email, topics?, website }  → stores a pending
 *       subscriber and emails a confirm link (/newsletters?confirm=TOKEN)
 *   { action: "confirm", token }       → marks the subscriber active
 *   { action: "unsubscribe", token }   → marks the subscriber unsubscribed
 *
 * Confirm and unsubscribe are POSTs fired by the page (not GET links) so
 * mail scanners that pre-fetch links can't confirm or unsubscribe anyone.
 * Responses never reveal whether an address is already on the list.
 *
 * Env: FIREBASE_* (see _lib/firebase.ts), SENDGRID_API_KEY, FROM_EMAIL,
 *      SUBSCRIBE_SECRET (32+ chars; falls back to PREVIEW_SECRET).
 */

import type { ApiRequest, ApiResponse } from "./_lib/adapter.js";
import { FieldValue } from "./_lib/firestore.js";
import { emailConfigured, sendEmail } from "./_lib/email.js";
import { adminDb } from "./_lib/firebase.js";
import { allowMethods, clientIp, createRateLimiter, jsonBody } from "./_lib/http.js";
import {
  signToken,
  subscribeSecret,
  subscriberId,
  validateSubscribe,
  verifyToken,
} from "./_lib/subscribe.js";
import { BASE_URL } from "../src/lib/seo-content.js";
import { escapeHtml } from "./contact.js";

const isRateLimited = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });
const COLLECTION = "subscribers";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["POST"])) return;
  const body = jsonBody(req);
  const secret = subscribeSecret();
  if (!secret) {
    console.error("[subscribe] SUBSCRIBE_SECRET/PREVIEW_SECRET missing or too short");
    return res.status(500).json({ error: "Subscriptions are not available right now." });
  }

  if (body.action === "confirm" || body.action === "unsubscribe") {
    const action = body.action === "confirm" ? "confirm" : "unsub";
    const check = verifyToken(body.token, action, secret);
    if (!check.ok) {
      return res.status(400).json({
        error:
          check.reason === "expired"
            ? "This link has expired. Please subscribe again."
            : "This link isn’t valid.",
      });
    }
    const ref = adminDb().collection(COLLECTION).doc(check.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Subscription not found." });
    await ref.update(
      action === "confirm"
        ? { status: "active", confirmed_at: FieldValue.serverTimestamp() }
        : { status: "unsubscribed", unsubscribed_at: FieldValue.serverTimestamp() },
    );
    return res.status(200).json({ success: true });
  }

  // Honeypot: pretend success so bots don't learn they were filtered.
  if (typeof body.website === "string" && body.website.length > 0)
    return res.status(200).json({ success: true });
  if (isRateLimited(clientIp(req))) {
    return res.status(429).json({ error: "Too many attempts. Please try again later." });
  }
  const result = validateSubscribe(body);
  if (!result.ok) return res.status(400).json({ error: result.error });
  const { email, topics } = result.value;
  const id = subscriberId(email);
  const ref = adminDb().collection(COLLECTION).doc(id);

  try {
    const snap = await ref.get();
    if (snap.exists && snap.get("status") === "active") {
      await ref.update({ topics, updated_at: FieldValue.serverTimestamp() });
      return res.status(200).json({ success: true });
    }
    await ref.set(
      {
        email,
        topics,
        status: "pending",
        source: typeof body.source === "string" ? body.source.slice(0, 40) : "site",
        created_at: snap.exists ? snap.get("created_at") : FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    console.error("[subscribe] Firestore write failed:", err);
    return res.status(500).json({ error: "Could not subscribe right now. Please try again later." });
  }

  if (!emailConfigured()) {
    console.error("[subscribe] SendGrid not configured - confirmation email skipped");
    return res.status(500).json({ error: "Could not send the confirmation email. Please try again later." });
  }
  try {
    await sendEmail({
      to: email,
      subject: "Confirm your subscription to Saad Mazhar’s newsletter",
      html: renderConfirmEmail(
        `${BASE_URL}/newsletters?confirm=${signToken("confirm", id, secret)}`,
        `${BASE_URL}/newsletters?unsubscribe=${signToken("unsub", id, secret)}`,
      ),
    });
  } catch (err) {
    console.error("[subscribe] SendGrid send failed:", err);
    return res.status(500).json({ error: "Could not send the confirmation email. Please try again later." });
  }
  return res.status(200).json({ success: true });
}

function renderConfirmEmail(confirmUrl: string, unsubUrl: string): string {
  const c = escapeHtml(confirmUrl);
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
      <h2 style="margin:0 0 12px">One click to confirm</h2>
      <p>Thanks for subscribing to <strong>Notes from the build</strong>: shipping products, applied AI and the Sri Lankan startup scene.</p>
      <p style="margin:28px 0">
        <a href="${c}" style="background:#ff5f00;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">Confirm subscription</a>
      </p>
      <p style="color:#666;font-size:13px">The link works for 7 days. If you didn’t sign up, ignore this email and nothing happens.</p>
      <p style="color:#999;font-size:12px">Changed your mind later? <a href="${escapeHtml(unsubUrl)}" style="color:#999">Unsubscribe</a></p>
    </div>`;
}
