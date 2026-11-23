/**
 * Generates every favicon / app icon from the Figma "Brand/Mark" geometry
 * (node 27:2913, the same paths scripts/og/render.mjs draws), with no
 * background. Run after changing the mark:
 *
 *   node scripts/brand/build-icons.mjs
 *
 * Output (public/):
 *   favicon.ico                      16/32/48, for browsers and crawlers that request it by default
 *   icons/favicon-v4.svg             adaptive: light top on dark UI, dark top on light UI
 *   icons/favicon-v4-{48,96,192}.png dark-top variant (readable on Google's light results page)
 *   icons/icon-v4-{192,512}.png      web app manifest
 *   icons/logo-v4-512.png            structured-data logo
 *   apple-touch-icon.png             180px, light top (iOS always fills transparency with black)
 *
 * File names carry a version so search engines and browsers can't keep
 * serving a cached older logo; bump it when the mark changes.
 */

import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Resvg } from "@resvg/resvg-js";

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "public");
const ICONS = join(PUBLIC, "icons");

const LIGHT = "#F5F5F2"; // upper strokes on dark surfaces
const INK = "#111113"; // upper strokes on light surfaces
const EMBER = "#FF5F00";

// Figma Brand/Mark, 420px frame. Upper pieces, then lower pieces.
const UPPER = [
  "M192.404 234.82C176.508 232.409 161.512 226.768 148.664 218.366C135.816 209.964 125.487 199.044 118.539 186.515C111.59 173.986 108.222 160.211 108.715 146.336C109.207 132.462 113.547 118.889 121.372 106.748L174.549 132.098C171.419 136.954 169.683 142.383 169.486 147.933C169.289 153.483 170.636 158.993 173.415 164.005C176.195 169.016 180.326 173.384 185.466 176.745C190.605 180.106 196.603 182.362 202.961 183.327L192.404 234.82Z",
  "M131.25 94.1549C142.349 82.3668 156.835 73.2744 173.273 67.7768C189.712 62.2792 207.534 60.5668 224.978 62.8088C242.422 65.0508 258.883 71.1697 272.734 80.5604C286.586 89.951 297.347 102.288 303.954 116.352L247.582 135.939C244.939 130.314 240.634 125.379 235.094 121.623C229.553 117.866 222.969 115.419 215.991 114.522C209.014 113.625 201.885 114.31 195.309 116.509C188.734 118.708 182.94 122.345 178.5 127.061L131.25 94.1549Z",
];
const LOWER = [
  "M227.596 185.18C243.492 187.591 258.488 193.232 271.336 201.634C284.184 210.036 294.513 220.956 301.461 233.485C308.41 246.014 311.778 259.789 311.285 273.664C310.793 287.538 306.453 301.111 298.628 313.252L245.451 287.902C248.581 283.046 250.317 277.617 250.514 272.067C250.711 266.517 249.364 261.007 246.585 255.995C243.805 250.984 239.674 246.616 234.534 243.255C229.395 239.894 223.397 237.638 217.038 236.673L227.596 185.18Z",
  "M288.75 325.845C277.651 337.633 263.165 346.726 246.727 352.223C230.288 357.721 212.466 359.433 195.022 357.191C177.578 354.949 161.117 348.83 147.266 339.44C133.414 330.049 122.653 317.712 116.046 303.648L172.418 284.06C175.061 289.686 179.366 294.621 184.906 298.377C190.447 302.133 197.031 304.581 204.009 305.478C210.986 306.375 218.115 305.69 224.691 303.491C231.266 301.292 237.06 297.655 241.5 292.939L288.75 325.845Z",
];

// The mark spans x 108–312, y 61–360 in the frame; a square box around it with a
// small margin so it fills a browser tab.
const VIEWBOX = "50 52 320 320";

const svg = (upper) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}">` +
  UPPER.map((d) => `<path fill="${upper}" d="${d}"/>`).join("") +
  LOWER.map((d) => `<path fill="${EMBER}" d="${d}"/>`).join("") +
  `</svg>`;

/** Favicon that follows the visitor's light/dark setting (supported by Chromium and Firefox). */
const adaptive =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}">` +
  `<style>.u{fill:${INK}}@media (prefers-color-scheme:dark){.u{fill:${LIGHT}}}</style>` +
  UPPER.map((d) => `<path class="u" d="${d}"/>`).join("") +
  LOWER.map((d) => `<path fill="${EMBER}" d="${d}"/>`).join("") +
  `</svg>\n`;

const png = (source, size) =>
  new Resvg(source, { fitTo: { mode: "width", value: size }, background: "rgba(0,0,0,0)" }).render().asPng();

/** ICO container holding PNG images (supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt8(0, e + 2);
    header.writeUInt8(0, e + 3);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.data)]);
}

mkdirSync(ICONS, { recursive: true });
const onLight = svg(INK);
const onDark = svg(LIGHT);

writeFileSync(join(ICONS, "favicon-v4.svg"), adaptive);
for (const size of [48, 96, 192]) writeFileSync(join(ICONS, `favicon-v4-${size}.png`), png(onLight, size));
for (const size of [192, 512]) writeFileSync(join(ICONS, `icon-v4-${size}.png`), png(onLight, size));
writeFileSync(join(ICONS, "logo-v4-512.png"), png(onLight, 512));
writeFileSync(join(PUBLIC, "apple-touch-icon.png"), png(onDark, 180));
writeFileSync(
  join(PUBLIC, "favicon.ico"),
  ico([16, 32, 48].map((size) => ({ size, data: png(onLight, size) }))),
);
console.log("Icons written to public/ and public/icons/");
