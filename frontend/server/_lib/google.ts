/**
 * Google credentials without firebase-admin (which can't run on Cloudflare):
 *   - accessToken(): an OAuth token minted from the service account
 *     (FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY) for one scope (Firestore by
 *     default; GA4 / Search Console read-only for reports), cached per scope and
 *     isolate until shortly before it expires;
 *   - verifyIdToken(): checks a Firebase Auth ID token's signature, issuer,
 *     audience and expiry against Google's published keys.
 *
 * Revocation isn't checked (the Admin SDK's checkRevoked); tokens live for an
 * hour and the admin endpoints also require ADMIN_EMAIL.
 */

import { createRemoteJWKSet, importPKCS8, jwtVerify, SignJWT } from "jose";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DATASTORE_SCOPE = "https://www.googleapis.com/auth/datastore";
const SECURETOKEN_JWKS = new URL(
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
);

const cache = new Map<string, { token: string; expiresAt: number }>();

export async function accessToken(now = Date.now(), scope = DATASTORE_SCOPE): Promise<string> {
  const cached = cache.get(scope);
  if (cached && cached.expiresAt - 60_000 > now) return cached.token;
  const email = process.env.FIREBASE_CLIENT_EMAIL ?? "";
  const pem = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  if (!email || !pem) throw new Error("Firebase service account is not configured");

  const key = await importPKCS8(pem, "RS256");
  const iat = Math.floor(now / 1000);
  const assertion = await new SignJWT({ scope })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(email)
    .setSubject(email)
    .setAudience(TOKEN_URL)
    .setIssuedAt(iat)
    .setExpirationTime(iat + 3600)
    .sign(key);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed (${res.status})`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cache.set(scope, { token: data.access_token, expiresAt: now + data.expires_in * 1000 });
  return data.access_token;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

export async function verifyIdToken(token: string): Promise<{ email?: string; email_verified?: boolean }> {
  const project = process.env.FIREBASE_PROJECT_ID;
  if (!project) throw new Error("FIREBASE_PROJECT_ID is not configured");
  jwks ??= createRemoteJWKSet(SECURETOKEN_JWKS);
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `https://securetoken.google.com/${project}`,
    audience: project,
    algorithms: ["RS256"],
  });
  if (!payload.sub) throw new Error("Token has no subject");
  return payload as { email?: string; email_verified?: boolean };
}
