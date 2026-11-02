/**
 * og/render.mjs
 * ─────────────────────────────────────────────────────────────
 * 1200×630 social preview images (Open Graph / Twitter cards), drawn with
 * satori (layout → SVG) and resvg (SVG → PNG). Same graphite + ember system
 * as the site: tokens below mirror src/app/index.css, type is Geist.
 *
 *   renderOg({ eyebrow, title, soft, meta, visual }) → PNG Buffer
 *
 * visual: { kind: "portrait" } | { kind: "photo", src } | { kind: "figure", text }
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

const C = {
  bg: "#19191B",
  surface: "#212124",
  fg: "#EDEDEA",
  fg2: "#A3A39E",
  fg3: "#8E8E89",
  accent: "#FF6A3D",
  line: "rgba(255,255,255,0.08)",
};

const FONTS = [
  { name: "Geist", data: font("Geist-Light.ttf"), weight: 300, style: "normal" },
  { name: "Geist", data: font("Geist-Medium.ttf"), weight: 500, style: "normal" },
  { name: "Geist Mono", data: font("GeistMono-Medium.ttf"), weight: 500, style: "normal" },
];

// The segmented "S" mark from src/components/brand/Logo.tsx.
const LOGO = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#202023"/><path fill="#EDEDEA" d="M229.179 290.556C209.639 286.984 191.33 279.558 175.696 268.863C160.061 258.168 147.529 244.496 139.086 228.925C130.644 213.355 126.521 196.31 127.044 179.136C127.567 161.962 132.721 145.126 142.1 129.957L218.033 164.679C214.907 169.735 213.189 175.347 213.015 181.072C212.84 186.797 214.215 192.478 217.029 197.669C219.843 202.859 224.02 207.416 229.232 210.981C234.443 214.546 240.546 217.021 247.06 218.212L229.179 290.556ZM157.18 110.729C171.49 96.0627 189.97 84.8307 210.823 78.1257C231.676 71.4207 254.192 69.4709 276.18 72.466C298.169 75.461 318.881 83.299 336.304 95.2175C353.727 107.136 367.267 122.73 375.607 140.481L295.869 168.187C293.089 162.27 288.576 157.072 282.768 153.099C276.96 149.126 270.056 146.514 262.727 145.515C255.397 144.517 247.892 145.167 240.941 147.402C233.99 149.637 227.83 153.381 223.06 158.27L157.18 110.729Z"/><path fill="#FF6A3D" d="M282.821 221.444C302.361 225.016 320.67 232.442 336.304 243.137C351.939 253.832 364.471 267.504 372.914 283.075C381.356 298.645 385.479 315.69 384.956 332.864C384.433 350.039 379.279 366.874 369.9 382.043L293.967 347.321C297.093 342.265 298.811 336.653 298.985 330.928C299.16 325.203 297.785 319.522 294.971 314.332C292.157 309.141 287.98 304.584 282.768 301.019C277.557 297.454 271.454 294.979 264.94 293.788L282.821 221.444ZM354.82 401.271C340.51 415.937 322.029 427.169 301.177 433.874C280.324 440.579 257.808 442.529 235.82 439.534C213.831 436.539 193.118 428.701 175.696 416.783C158.273 404.864 144.733 389.271 136.393 371.519L216.131 343.813C218.911 349.73 223.424 354.928 229.232 358.901C235.039 362.874 241.944 365.486 249.273 366.485C256.603 367.483 264.108 366.833 271.059 364.598C278.01 362.363 284.17 358.619 288.94 353.73L354.82 401.271Z"/></svg>`,
).toString("base64")}`;

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

/** Bigger type for short titles; long ones step down so they fit three lines. */
function titleSize(text, narrow) {
  const n = text.length;
  const steps = narrow
    ? [
        [22, 72],
        [40, 60],
        [64, 50],
        [Infinity, 42],
      ]
    : [
        [24, 84],
        [44, 70],
        [72, 58],
        [Infinity, 48],
      ];
  return steps.find(([max]) => n <= max)[1];
}

const clip = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s || "");

/** Fetch a remote cover and inline it; satori can't decode WebP, so only PNG/JPEG are used. */
export async function loadPhoto(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !/image\/(png|jpe?g)/.test(type)) return null;
    return `data:${type.split(";")[0]};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

function visualLayer(visual) {
  if (!visual) return null;
  if (visual.kind === "portrait")
    return h("div", { position: "absolute", right: -30, bottom: 0, display: "flex" }, [
      h("img", { width: 560, height: 560 }, undefined, { src: PORTRAIT, width: 560, height: 560 }),
      // Melt the portrait's left and bottom edges into the background.
      h("div", {
        position: "absolute",
        inset: 0,
        backgroundImage: `linear-gradient(90deg, ${C.bg} 0%, rgba(25,25,27,0) 38%), linear-gradient(0deg, ${C.bg} 0%, rgba(25,25,27,0) 30%)`,
      }),
    ]);
  if (visual.kind === "photo")
    return h(
      "div",
      {
        position: "absolute",
        right: 64,
        top: 150,
        width: 420,
        height: 330,
        display: "flex",
        borderRadius: 24,
        overflow: "hidden",
        border: `1px solid ${C.line}`,
        boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
      },
      [
        h("img", { width: 420, height: 330, objectFit: "cover" }, undefined, {
          src: visual.src,
          width: 420,
          height: 330,
        }),
      ],
    );
  if (visual.kind === "figure")
    return h(
      "div",
      {
        position: "absolute",
        right: 56,
        bottom: 96,
        display: "flex",
        fontFamily: "Geist",
        fontWeight: 500,
        fontSize: 230,
        letterSpacing: "-0.06em",
        lineHeight: 0.8,
        color: "rgba(237,237,234,0.06)",
      },
      visual.text,
    );
  return null;
}

export async function renderOg({ eyebrow, title, soft, meta, visual }) {
  const narrow = visual?.kind === "portrait" || visual?.kind === "photo";
  const full = soft ? `${title} ${soft}` : title;
  const size = titleSize(full, narrow);
  const maxChars = narrow ? 70 : 96;

  const tree = h(
    "div",
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      padding: "60px 72px 56px",
      backgroundColor: C.bg,
      backgroundImage:
        "radial-gradient(circle at 92% 0%, rgba(255,106,61,0.30), rgba(255,106,61,0) 52%), radial-gradient(circle at 0% 100%, rgba(255,106,61,0.08), rgba(255,106,61,0) 45%)",
      fontFamily: "Geist",
      color: C.fg,
    },
    [
      visualLayer(visual),
      // Top bar: brand + section label
      h("div", { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }, [
        h("div", { display: "flex", alignItems: "center", gap: 16 }, [
          h("img", { width: 44, height: 44 }, undefined, { src: LOGO, width: 44, height: 44 }),
          h(
            "div",
            { display: "flex", fontSize: 26, fontWeight: 500, letterSpacing: "-0.01em" },
            "Saad Mazhar",
          ),
        ]),
        eyebrow
          ? h(
              "div",
              {
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontFamily: "Geist Mono",
                fontSize: 17,
                letterSpacing: "0.12em",
                color: C.fg2,
                textTransform: "uppercase",
                padding: "10px 18px",
                borderRadius: 999,
                border: `1px solid ${C.line}`,
                backgroundColor: "rgba(33,33,36,0.7)",
              },
              [h("div", { width: 8, height: 8, borderRadius: 8, backgroundColor: C.accent }), eyebrow],
            )
          : h("div", {}),
      ]),
      // Title
      h(
        "div",
        {
          display: "flex",
          flexWrap: "wrap",
          maxWidth: narrow ? 640 : 1000,
          fontSize: size,
          lineHeight: 1.04,
          letterSpacing: "-0.04em",
          fontWeight: 500,
        },
        // One span per word so the two tones wrap together like a single line of text.
        [
          ...clip(title, maxChars)
            .split(/\s+/)
            .map((w) => ({ w, soft: false })),
          ...(soft
            ? clip(soft, 40)
                .split(/\s+/)
                .map((w) => ({ w, soft: true }))
            : []),
        ].map(({ w, soft: isSoft }) =>
          h("span", { marginRight: size * 0.24, ...(isSoft ? { fontWeight: 300, color: C.fg3 } : {}) }, w),
        ),
      ),
      // Footer: meta + domain
      h(
        "div",
        {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          paddingTop: 24,
          borderTop: `1px solid ${C.line}`,
        },
        [
          h(
            "div",
            {
              display: "flex",
              maxWidth: 820,
              fontFamily: "Geist Mono",
              fontSize: 18,
              letterSpacing: "0.06em",
              color: C.fg3,
              textTransform: "uppercase",
            },
            clip(meta || "Founder · Engineer · Host", 64),
          ),
          h("div", { display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 500 }, [
            "saadmaz.com",
            h("div", { display: "flex", color: C.accent }, "↗"),
          ]),
        ],
      ),
    ].filter(Boolean),
  );

  const svg = await satori(tree, { width: OG_WIDTH, height: OG_HEIGHT, fonts: FONTS });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } }).render().asPng();
}
