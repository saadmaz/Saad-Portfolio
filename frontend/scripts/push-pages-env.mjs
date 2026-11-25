/**
 * scripts/push-pages-env.mjs
 * ─────────────────────────────────────────────────────────────
 * Uploads a KEY=VALUE env file to a Cloudflare Pages project (Production
 * environment) as encrypted variables, in one go:
 *
 *   node scripts/push-pages-env.mjs .env.cloudflare --project saadmaz-portfolio
 *   node scripts/push-pages-env.mjs .env.cloudflare --project saadmaz-portfolio --dry-run
 *
 * It skips leftovers that must not be uploaded (old Vercel/SendGrid/legacy
 * keys), refuses to upload while any required key is missing or still a
 * placeholder, and prints key names only - never values. Requires
 * `npx wrangler login` first. The temporary JSON it hands to Wrangler is
 * deleted afterwards.
 */

import { readFileSync, writeFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawnSync } from "child_process";

const REQUIRED = [
  "NODE_VERSION",
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "RESEND_API_KEY",
  "TO_EMAIL",
  "FROM_EMAIL",
  "ADMIN_EMAIL",
  "ADMIN_ORIGINS",
  "PREVIEW_SECRET",
  "SUBSCRIBE_SECRET",
  "CRON_SECRET",
  "ANALYTICS_SALT",
  "REACTIONS_SALT",
];
const OPTIONAL = ["DEPLOY_HOOK_URL", "PUBLIC_SITE_URL", "GSC_SITE_URL", "GSC_SERVICE_ACCOUNT_EMAIL"];
const ALLOWED = new Set([...REQUIRED, ...OPTIONAL]);
const MIN_LENGTH = {
  PREVIEW_SECRET: 32,
  SUBSCRIBE_SECRET: 32,
  CRON_SECRET: 16,
  ANALYTICS_SALT: 16,
  REACTIONS_SALT: 16,
};
const PLACEHOLDER = /^\[SENSITIVE\]$|^$|xxx|your_|you@example\.com|\.\.\./i;

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const project = args[args.indexOf("--project") + 1];
const dryRun = args.includes("--dry-run");
if (!file || !args.includes("--project") || !project) {
  console.error(
    "Usage: node scripts/push-pages-env.mjs <env file> --project <pages project name> [--dry-run]",
  );
  process.exit(1);
}

/** KEY=VALUE lines; surrounding quotes removed, escapes such as \n kept as written. */
function parse(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

const env = parse(readFileSync(file, "utf8"));
const upload = {};
const skipped = [];
for (const [k, v] of Object.entries(env)) {
  if (!ALLOWED.has(k)) skipped.push(k);
  else if (!PLACEHOLDER.test(v)) upload[k] = v;
}

const problems = [];
for (const k of REQUIRED) {
  if (!(k in upload)) problems.push(`${k}: missing or still a placeholder`);
  else if (MIN_LENGTH[k] && upload[k].length < MIN_LENGTH[k])
    problems.push(`${k}: shorter than ${MIN_LENGTH[k]} characters`);
}
if (upload.RESEND_API_KEY && !upload.RESEND_API_KEY.startsWith("re_"))
  problems.push("RESEND_API_KEY: should start with re_");
if (upload.FIREBASE_PRIVATE_KEY && !upload.FIREBASE_PRIVATE_KEY.includes("BEGIN PRIVATE KEY"))
  problems.push("FIREBASE_PRIVATE_KEY: doesn't look like a private key");

if (skipped.length) console.log(`Skipping (not used on Cloudflare): ${skipped.join(", ")}`);
console.log(`Ready to upload: ${Object.keys(upload).join(", ")}`);
if (problems.length) {
  console.error("\nFix these in the file first, then run again:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
if (dryRun) {
  console.log("\nDry run: nothing uploaded.");
  process.exit(0);
}

const tmp = join(tmpdir(), `pages-env-${process.pid}.json`);
try {
  writeFileSync(tmp, JSON.stringify(upload), { mode: 0o600 });
  const r = spawnSync(
    "npx",
    ["--yes", "wrangler@4", "pages", "secret", "bulk", tmp, "--project-name", project],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
    },
  );
  process.exitCode = r.status ?? 1;
} finally {
  rmSync(tmp, { force: true });
}
