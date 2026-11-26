/**
 * Company-name matching for linking projects to experience: "Stopwash (PVT) Ltd."
 * and "STOPWASH PVT LTD" are the same company. Shared by lib/experience.ts and
 * scripts/prerender.mjs.
 */

const LEGAL = /\b(pvt|private|ltd|limited|inc|llc|plc|co|company|corp|corporation|the|group)\b/g;

/** "Stopwash (PVT) Ltd." → "stopwash". */
export function orgKey(name) {
  return String(name ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(LEGAL, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Same organisation, ignoring case, punctuation and legal suffixes. */
export function sameOrg(a, b) {
  const x = orgKey(a);
  const y = orgKey(b);
  return !!x && !!y && x === y;
}
