/**
 * Sends one email through SendGrid's v3 REST API (plain fetch, so it runs on
 * Cloudflare). Env: SENDGRID_API_KEY (starts with "SG."), FROM_EMAIL.
 */

export const emailConfigured = () => (process.env.SENDGRID_API_KEY ?? "").startsWith("SG.");

export async function sendEmail(msg: { to: string; subject: string; html: string; replyTo?: string }) {
  const key = process.env.SENDGRID_API_KEY ?? "";
  if (!key.startsWith("SG.")) throw new Error("SendGrid is not configured");
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: msg.to }] }],
      from: { email: process.env.FROM_EMAIL || "noreply@saadmaz.com" },
      ...(msg.replyTo ? { reply_to: { email: msg.replyTo } } : {}),
      subject: msg.subject,
      content: [{ type: "text/html", value: msg.html }],
    }),
  });
  if (!res.ok) throw new Error(`SendGrid returned ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
