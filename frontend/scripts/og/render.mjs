/**
 * og/render.mjs
 * ─────────────────────────────────────────────────────────────
 * 1200×630 social preview images (Open Graph / Twitter cards), drawn with
 * satori (layout → SVG) and resvg (SVG → PNG). Built from the Figma file's
 * "06 - Socials" templates (Social/Header, Social/Footer, FB/Cover): the same
 * variables, Geist type scale and segmented S mark, re-proportioned for 1200×630.
 *
 *   renderOg({ eyebrow, title, soft, meta, visual }) → PNG Buffer
 *
 * visual: { kind: "portrait" } | { kind: "photo", src } | { kind: "figure", text } | undefined (type only)
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const here = dirname(fileURLToPath(import.meta.url));
const font = (file) => readFileSync(join(here, "fonts", file));

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// Figma variables (01 - Design System), identical to src/app/index.css.
const C = {
  bg: "#111113",
  fg: "#F5F5F2",
  fg2: "#A3A39E",
  fg3: "#8E8E89",
  accent: "#FF5F00",
  line: "rgba(255,255,255,0.11)",
};

const PAD = 64; // space/64
const HEADER = 56;
const FOOTER = 2 + 24 + 26; // rule + space/24 + one mono line

const FONTS = [
  { name: "Geist", data: font("Geist-Light.ttf"), weight: 300, style: "normal" },
  { name: "Geist", data: font("Geist-Medium.ttf"), weight: 500, style: "normal" },
  { name: "Geist Mono", data: font("GeistMono-Medium.ttf"), weight: 500, style: "normal" },
];

const svgUri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

// Brand/Mark from Figma (node 27:2913), in its 420px frame. This is the current
// mark; scripts/brand/build-icons.mjs builds the favicons from the same paths.
const MARK = `
  <path fill="#F5F5F2" d="M192.404 234.82C176.508 232.409 161.512 226.768 148.664 218.366C135.816 209.964 125.487 199.044 118.539 186.515C111.59 173.986 108.222 160.211 108.715 146.336C109.207 132.462 113.547 118.889 121.372 106.748L174.549 132.098C171.419 136.954 169.683 142.383 169.486 147.933C169.289 153.483 170.636 158.993 173.415 164.005C176.195 169.016 180.326 173.384 185.466 176.745C190.605 180.106 196.603 182.362 202.961 183.327L192.404 234.82Z"/>
  <path fill="#F5F5F2" d="M131.25 94.1549C142.349 82.3668 156.835 73.2744 173.273 67.7768C189.712 62.2792 207.534 60.5668 224.978 62.8088C242.422 65.0508 258.883 71.1697 272.734 80.5604C286.586 89.951 297.347 102.288 303.954 116.352L247.582 135.939C244.939 130.314 240.634 125.379 235.094 121.623C229.553 117.866 222.969 115.419 215.991 114.522C209.014 113.625 201.885 114.31 195.309 116.509C188.734 118.708 182.94 122.345 178.5 127.061L131.25 94.1549Z"/>
  <path fill="#FF5F00" d="M227.596 185.18C243.492 187.591 258.488 193.232 271.336 201.634C284.184 210.036 294.513 220.956 301.461 233.485C308.41 246.014 311.778 259.789 311.285 273.664C310.793 287.538 306.453 301.111 298.628 313.252L245.451 287.902C248.581 283.046 250.317 277.617 250.514 272.067C250.711 266.517 249.364 261.007 246.585 255.995C243.805 250.984 239.674 246.616 234.534 243.255C229.395 239.894 223.397 237.638 217.038 236.673L227.596 185.18Z"/>
  <path fill="#FF5F00" d="M288.75 325.845C277.651 337.633 263.165 346.726 246.727 352.223C230.288 357.721 212.466 359.433 195.022 357.191C177.578 354.949 161.117 348.83 147.266 339.44C133.414 330.049 122.653 317.712 116.046 303.648L172.418 284.06C175.061 289.686 179.366 294.621 184.906 298.377C190.447 302.133 197.031 304.581 204.009 305.478C210.986 306.375 218.115 305.69 224.691 303.491C231.266 301.292 237.06 297.655 241.5 292.939L288.75 325.845Z"/>`;

// Brand/App icon (27:2923): graphite squircle, ember glow top-right, mark at 72%.
const APP_ICON = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
  <defs>
    <linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#333337"/><stop offset="1" stop-color="#111113"/></linearGradient>
    <radialGradient id="g" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="matrix(28 0 0 28 39.2 16.8)"><stop offset="0" stop-color="#FF6B3D" stop-opacity="0.28"/><stop offset="1" stop-color="#FF6B3D" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="0.33" y="0.33" width="55.34" height="55.34" rx="12.69" fill="url(#f)" stroke="rgba(255,255,255,0.1)" stroke-width="0.66"/>
  <rect x="0.33" y="0.33" width="55.34" height="55.34" rx="12.69" fill="url(#g)"/>
  <g transform="translate(7.3 7.3) scale(0.09636)">${MARK}</g>
</svg>`);

// FB/Cover's watermark: the mark at 4% over the glow.
const WATERMARK = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="0 0 420 420"><g opacity="0.04">${MARK.replace(/fill="#[0-9A-F]+"/g, 'fill="#F5F5F2"')}</g></svg>`,
);

/**
 * Figma's social glow: an elliptical radial (45% wide, 75% tall) centred at
 * 78% / 45%, 28% ember fading through 6% at 60%. Drawn in SVG because satori's
 * radial-gradient can't express separate radii and a three-stop falloff.
 */
const BACKGROUND = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
  <defs>
    <radialGradient id="g" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="matrix(540 0 0 472 936 284)">
      <stop offset="0" stop-color="#FF6B3D" stop-opacity="0.28"/>
      <stop offset="0.6" stop-color="#FF6B3D" stop-opacity="0.06"/>
      <stop offset="1" stop-color="#FF6B3D" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="${C.bg}"/>
  <rect width="100%" height="100%" fill="url(#g)"/>
</svg>`);

/**
 * The portrait sits on black; the site blends it with mix-blend-lighten. Here the
 * same effect is baked once: an SVG filter turns brightness into alpha, so the
 * black falls away and the photo melts into whatever is behind it.
 */
const PORTRAIT = (() => {
  const src = readFileSync(join(here, "..", "..", "public", "profile-photo.png")).toString("base64");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800" height="800">
    <filter id="k" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1.1 2.2 0.4 0 -0.04"/>
    </filter>
    <image width="800" height="800" filter="url(#k)" xlink:href="data:image/png;base64,${src}"/>
  </svg>`;
  return `data:image/png;base64,${new Resvg(svg).render().asPng().toString("base64")}`;
})();

/** Minimal element factory: satori takes React-shaped objects. */
const h = (type, style, children, extra = {}) => ({ type, props: { style, children, ...extra } });
const img = (src, width, height, style = {}) =>
  h("img", { width, height, ...style }, undefined, { src, width, height });

// satori 0.33 ignores `inset`; without explicit edges, absolute layers start inside the padding.
const fill = { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex" };

const clip = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s || "");

/** Fetch a remote cover and inline it; satori can't decode WebP, so only PNG/JPEG are used. */
export async function loadPhoto(url) {
  if (!url) return null;
  // Firebase Storage is sometimes slow from build machines; retry once so a
  // cover isn't silently swapped for the type-only card.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      const type = res.headers.get("content-type") || "";
      if (!res.ok || !/image\/(png|jpe?g)/.test(type)) return null;
      return `data:${type.split(";")[0]};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
    } catch (err) {
      if (attempt === 2) console.warn(`⚠️  Cover skipped (${err.name}): ${url.slice(0, 80)}…`);
    }
  }
  return null;
}

/**
 * Greedy word wrap with Geist's average advance (~0.52em at -0.045em tracking).
 * Only picks the type size; satori does the real wrapping and lineClamp catches
 * anything the estimate gets wrong.
 */
function lineCount(text, size, width) {
  const perLine = Math.floor(width / (size * 0.52));
  let lines = 1;
  let used = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const n = used ? used + 1 + word.length : word.length;
    if (n <= perLine) used = n;
    else {
      lines++;
      used = word.length;
    }
  }
  return lines;
}

// Display/XL, Display/L, Display/M, Mobile/Display, Heading/H1.
const SIZES = [136, 96, 64, 56, 48];
const MAX_LINES = 4;

/** Cut at a word boundary so an over-long title never ends mid-word. */
function clipWords(s, n) {
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : cut.length).replace(/[\s,:;·–—-]+$/, "")}…`;
}

/** Largest token size where title + soft fit the space between header and footer; else the smallest, trimmed. */
function fitTitle(title, soft, width) {
  const room = OG_HEIGHT - PAD * 2 - HEADER - FOOTER - 64;
  for (const size of SIZES) {
    const t = lineCount(title, size, width);
    const s = soft ? lineCount(soft, size, width) : 0;
    const gap = soft ? Math.round(size / 6) : 0;
    if (t + s <= MAX_LINES && (t + s) * size * 0.95 + gap <= room) return { size, gap, title };
  }
  const size = SIZES.at(-1);
  const lines = MAX_LINES - (soft ? lineCount(soft, size, width) : 0);
  return { size, gap: 8, title: clipWords(title, Math.floor(width / (size * 0.52)) * lines - 4) };
}

const mono = (color, extra = {}) => ({
  display: "flex",
  fontFamily: "Geist Mono",
  fontWeight: 500,
  fontSize: 22,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color,
  ...extra,
});

function visualLayer(visual) {
  if (!visual)
    return h("div", { position: "absolute", right: -40, top: 84, display: "flex" }, [
      img(WATERMARK, 520, 520),
    ]);
  if (visual.kind === "portrait")
    // Fade the left and bottom edges to transparent (not to bg colour, which would seam against the glow).
    return h(
      "div",
      {
        position: "absolute",
        right: -20,
        bottom: 0,
        display: "flex",
        maskImage: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 36%)",
      },
      [
        h(
          "div",
          { display: "flex", maskImage: "linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 26%)" },
          [img(PORTRAIT, 580, 580)],
        ),
      ],
    );
  if (visual.kind === "photo") {
    const w = 456;
    const ht = 342;
    return h(
      "div",
      {
        position: "absolute",
        right: PAD,
        top: PAD + HEADER + (OG_HEIGHT - PAD * 2 - HEADER - FOOTER - ht) / 2,
        display: "flex",
        borderRadius: 24, // radius/xl: media
        overflow: "hidden",
        border: `1px solid ${C.line}`,
        boxShadow: "0 32px 64px rgba(0,0,0,0.45)",
      },
      [img(visual.src, w, ht, { objectFit: "cover" })],
    );
  }
  if (visual.kind === "figure")
    // FB/Cover's name row: big type closed by an ember dot, here as a faint year.
    return h(
      "div",
      {
        position: "absolute",
        right: PAD,
        bottom: PAD + FOOTER + 36,
        display: "flex",
        alignItems: "flex-end",
      },
      [
        h(
          "div",
          {
            display: "flex",
            fontFamily: "Geist",
            fontWeight: 500,
            fontSize: 280,
            letterSpacing: "-0.05em",
            lineHeight: 0.8,
            color: "rgba(237,237,234,0.06)",
          },
          visual.text,
        ),
        h("div", {
          width: 30,
          height: 30,
          marginLeft: 10,
          marginBottom: 4,
          borderRadius: 30,
          backgroundColor: C.accent,
        }),
      ],
    );
  return null;
}

export async function renderOg({ eyebrow, title, soft, meta, visual }) {
  const narrow = visual?.kind === "portrait" || visual?.kind === "photo";
  const width = narrow ? 600 : OG_WIDTH - PAD * 2;
  const softText = clip(soft, 48);
  const { size, gap, title: heading } = fitTitle(clipWords(title || "", 120), softText, width);
  const type = {
    display: "block",
    width,
    fontFamily: "Geist",
    fontSize: size,
    lineHeight: 0.95,
    letterSpacing: "-0.045em",
  };

  const tree = h(
    "div",
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      padding: PAD,
      backgroundColor: C.bg,
      fontFamily: "Geist",
      color: C.fg,
    },
    [
      h("div", fill, [img(BACKGROUND, OG_WIDTH, OG_HEIGHT)]),
      visualLayer(visual),
      // Social/Header
      h("div", { display: "flex", alignItems: "center", height: HEADER, gap: 20, width: "100%" }, [
        img(APP_ICON, 56, 56),
        h("div", mono(C.fg), "Saad Mazhar"),
        h("div", { flexGrow: 1 }),
        eyebrow ? h("div", mono(C.accent), clip(eyebrow, 40)) : null,
      ]),
      // Title: Display in primary, the soft half in Accent (Light) muted, as in Post/Statement.
      h("div", { display: "flex", flexDirection: "column", gap }, [
        h(
          "div",
          { ...type, fontWeight: 500, color: C.fg, lineClamp: softText ? MAX_LINES - 1 : MAX_LINES },
          heading,
        ),
        softText ? h("div", { ...type, fontWeight: 300, color: C.fg3, lineClamp: 2 }, softText) : null,
      ]),
      // Social/Footer
      h("div", { display: "flex", flexDirection: "column", gap: 24, width: "100%" }, [
        h("div", { height: 2, width: "100%", backgroundColor: C.line }),
        h("div", { display: "flex", alignItems: "center", width: "100%" }, [
          h(
            "div",
            mono(C.fg2, { maxWidth: 780, whiteSpace: "nowrap", overflow: "hidden" }),
            clip(meta || "Founder · Engineer · Host", 50),
          ),
          h("div", { flexGrow: 1 }),
          h("div", mono(C.fg2), "saadmaz.com ↗"),
        ]),
      ]),
    ].filter(Boolean),
  );

  const svg = await satori(tree, { width: OG_WIDTH, height: OG_HEIGHT, fonts: FONTS });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } }).render().asPng();
}
