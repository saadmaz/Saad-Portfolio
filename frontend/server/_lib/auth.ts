/**
 * Admin authentication for CMS-only endpoints.
 *
 * The CMS sends the signed-in user's Firebase ID token as a bearer token.
 * We verify it against Google's keys (signature, issuer, audience, expiry) and then
 * require the same single admin identity the Firestore rules allow
 * (ADMIN_EMAIL, verified). Fails closed when ADMIN_EMAIL isn't configured.
 */

import type { ApiRequest } from "./adapter.js";
import { verifyIdToken } from "./google.js";

export type AdminCheck = { ok: true; email: string } | { ok: false; status: 401 | 403 | 500; error: string };

export interface TokenClaims {
  email?: string;
  email_verified?: boolean;
}

/** Pure part of the check, separated for tests. */
export function isAdminClaims(claims: TokenClaims, adminEmail: string | undefined): boolean {
  if (!adminEmail) return false;
  return (
    !!claims.email &&
    claims.email_verified === true &&
    claims.email.toLowerCase() === adminEmail.toLowerCase()
  );
}

export async function requireAdmin(
  req: ApiRequest,
  verify: (token: string) => Promise<TokenClaims> = verifyIdToken,
): Promise<AdminCheck> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return { ok: false, status: 500, error: "ADMIN_EMAIL is not configured" };
  const header = String(req.headers.authorization ?? "");
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return { ok: false, status: 401, error: "Missing credentials" };
  try {
    const claims = await verify(token);
    return isAdminClaims(claims, adminEmail)
      ? { ok: true, email: claims.email! }
      : { ok: false, status: 403, error: "Not allowed" };
  } catch {
    return { ok: false, status: 401, error: "Invalid or expired credentials" };
  }
}
