/**
 * Sends one email through Resend's REST API (plain fetch, so it runs on
 * Cloudflare). Env: RESEND_API_KEY (starts with "re_"), FROM_EMAIL (an
 * address on a domain verified in Resend, e.g. hello@saadmaz.com).
 */

export const emailConfigured = () => (process.env.RESEND_API_KEY ?? "").startsWith("re_");

export async function sendEmail(msg: { to: string; subject: string; html: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY ?? "";
  if (!key.startsWith("re_")) throw new Error("Resend is not configured");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: `Saad Mazhar <${process.env.FROM_EMAIL || "hello@saadmaz.com"}>`,
      to: [msg.to],
      ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      subject: msg.subject,
      html: msg.html,
    }),
  });
  if (!res.ok) throw new Error(`Resend returned ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
