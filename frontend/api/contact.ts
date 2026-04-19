/**
 * api/contact.ts
 * ─────────────────────────────────────────────────────────────
 * Vercel serverless function - the ONLY server-side code in the project.
 *
 * Why this needs to be a server function (not browser code):
 *   • The SendGrid API key must never be shipped in the browser bundle.
 *   • Firebase Admin SDK (service-account credentials) must stay server-side.
 *
 * What it does:
 *   1. Validates the incoming request body
 *   2. Saves the message to Firestore via Firebase Admin SDK
 *   3. Sends an email notification via SendGrid
 *
 * Deployed URL: POST /api/contact
 *
 * Required environment variables (set in Vercel dashboard):
 *   FIREBASE_PROJECT_ID    – e.g. saadportfolio03
 *   FIREBASE_CLIENT_EMAIL  – service account email
 *   FIREBASE_PRIVATE_KEY   – service account private key (with escaped \n)
 *   SENDGRID_API_KEY       – starts with SG.
 *   TO_EMAIL               – where contact emails are delivered
 *   FROM_EMAIL             – verified SendGrid sender address
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import sgMail from "@sendgrid/mail";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ─── Firebase Admin initialisation ───────────────────────────────
// getApps() prevents re-initialisation on warm function invocations.
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel stores multi-line secrets with escaped \n - unescape them
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// ─── Request handler ──────────────────────────────────────────────
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── 1. Validate input ────────────────────────────────────────────
  const { name, email, subject, message } = req.body ?? {};

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "Name is required" });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email is required" });
  }
  if (!message || typeof message !== "string" || message.trim().length < 10) {
    return res.status(400).json({ error: "Message must be at least 10 characters" });
  }

  // ── 2. Save to Firestore ─────────────────────────────────────────
  // Using Admin SDK so this bypasses Firestore Security Rules
  // (the function itself is the trusted server).
  const db = getFirestore();
  let docRef: FirebaseFirestore.DocumentReference | null = null;

  try {
    docRef = await db.collection("contact_messages").add({
      name:       name.trim(),
      email:      email.trim(),
      subject:    subject?.trim() ?? "",
      message:    message.trim(),
      created_at: new Date(),
      read:       false,
    });
  } catch (dbErr) {
    // Log but don't fail the request - still try to send the email
    console.error("[contact] Firestore write failed:", dbErr);
  }

  // ── 3. Send email via SendGrid ───────────────────────────────────
  const apiKey = process.env.SENDGRID_API_KEY ?? "";
  if (!apiKey.startsWith("SG.")) {
    // Email is misconfigured - still return 200 since the message was saved
    console.warn("[contact] SENDGRID_API_KEY not set or invalid - email skipped");
    return res.status(200).json({ success: true, message: "Message saved (email skipped)" });
  }

  try {
    sgMail.setApiKey(apiKey);

    // Build a clean HTML email body
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Portfolio Contact</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; font-weight: bold;">Name:</td>
              <td style="padding: 8px;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Email:</td>
              <td style="padding: 8px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          ${subject ? `<tr><td style="padding: 8px; font-weight: bold;">Subject:</td>
              <td style="padding: 8px;">${escapeHtml(subject)}</td></tr>` : ""}
        </table>
        <h3 style="color: #333; margin-top: 20px;">Message:</h3>
        <p style="background: #f5f5f5; padding: 16px; border-radius: 4px; white-space: pre-wrap;">${escapeHtml(message)}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 24px;" />
        <p style="font-size: 12px; color: #999;">Sent from your portfolio contact form</p>
      </div>
    `;

    await sgMail.send({
      to:       process.env.TO_EMAIL!,
      from:     process.env.FROM_EMAIL ?? "noreply@saadmaz.com",
      replyTo:  email.trim(),
      subject:  `Portfolio Contact: ${subject?.trim() ?? "New Message"}`,
      html:     htmlBody,
    });
  } catch (emailErr) {
    // Email failed - the message is already in Firestore so we don't surface
    // this error to the user (they don't need to know about SendGrid internals)
    console.error("[contact] SendGrid send failed:", emailErr);
  }

  return res.status(200).json({ success: true });
}

// ─── Utility ─────────────────────────────────────────────────────

/** Escape user-supplied strings before injecting into HTML. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#039;");
}
