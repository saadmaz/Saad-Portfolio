/**
 * indexnow.mjs
 * ─────────────────────────────────────────────────────────────
 * Tells Bing (and the other IndexNow engines: Yandex, Seznam, Naver) which
 * pages changed, so they recrawl in minutes instead of weeks. Bing's index
 * also feeds ChatGPT search and Copilot, so this is the fastest route into
 * AI answers. Google doesn't use IndexNow; it reads the sitemaps.
 *
 * prerender.mjs hashes each indexable page's crawler-visible content. This
 * compares those hashes with the ones stored in Firestore (system/indexnow)
 * after the last successful submit and sends only the URLs that changed, so
 * CMS edits and new posts are picked up with no CMS involvement.
 *
 * Runs only on Vercel production builds (VERCEL_ENV=production) with
 * Firebase Admin credentials; INDEXNOW_DISABLED=1 turns it off. Never fails
 * the build. Engines fetch a submitted URL some minutes later, by which time
 * this build is normally live.
 *
 * The key is public by design: it's served at /<key>.txt (public/) so
 * engines can confirm the submission came from this site's owner.
 */

export const INDEXNOW_KEY = "bfae025aa8ce3f634b3d4657ae802319";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS = 10_000;

/** URLs whose hash is new or different from `previous`. */
export function changedUrls(current, previous = {}) {
  return Object.keys(current).filter((url) => previous[url] !== current[url]);
}

export async function submitChangedUrls(hashes, { baseUrl }) {
  if (process.env.INDEXNOW_DISABLED === "1") return console.log("ℹ️  IndexNow: disabled.");
  if (process.env.VERCEL_ENV !== "production")
    return console.log("ℹ️  IndexNow: skipped (not a production build).");
  try {
    const { getApps } = await import("firebase-admin/app");
    if (!getApps().length) return console.log("ℹ️  IndexNow: skipped (no Firebase Admin credentials).");
    const { getFirestore } = await import("firebase-admin/firestore");
    const ref = getFirestore().collection("system").doc("indexnow");
    const snap = await ref.get();
    const previous = snap.exists ? (snap.get("hashes") ?? {}) : {};
    const urlList = changedUrls(hashes, previous).slice(0, MAX_URLS);
    if (!urlList.length) return console.log("✅ IndexNow: no content changes to submit.");

    const host = new URL(baseUrl).host;
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${baseUrl}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });
    // 200 = accepted, 202 = accepted, key validation pending.
    if (res.status !== 200 && res.status !== 202) {
      return console.warn(`⚠️  IndexNow: submit returned ${res.status}; will retry these on the next build.`);
    }
    await ref.set({ hashes, submittedAt: new Date().toISOString(), lastCount: urlList.length });
    console.log(`✅ IndexNow: submitted ${urlList.length} changed URL(s).`);
  } catch (err) {
    console.warn(`⚠️  IndexNow: ${err instanceof Error ? err.message : err}`);
  }
}
