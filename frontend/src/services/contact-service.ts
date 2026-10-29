/**
 * services/contact-service.ts
 * ─────────────────────────────────────────────────────────────
 * Contact form submission. Goes through the /api/contact serverless
 * function only - it validates, rate-limits, stores the message and
 * emails it. The browser never writes to Firestore directly.
 */

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  /** Honeypot - must stay empty. Bound to a visually hidden input. */
  website?: string;
}

export const ContactService = {
  async submit(data: ContactPayload): Promise<void> {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? `Request failed (${res.status})`);
    }
  },
};
