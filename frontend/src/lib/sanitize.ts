/**
 * Sanitisation for CMS HTML before it reaches the DOM.
 *
 * Article HTML is written only by the admin, but it's still treated as
 * untrusted: a compromised admin session must not become stored XSS for
 * every reader. Two profiles:
 *   - sanitizeArticle: the editor's output (structural tags, data-* block
 *     markers, images, tables). No scripts, frames, forms, SVG or inline CSS
 *     (except text-align, which the editor's alignment control produces).
 *   - sanitizeHtmlBlock: the "Custom HTML" block - same, but stricter
 *     (no data-* attributes, so it can't impersonate enhanced blocks).
 * Embeds are never raw iframes: they're rebuilt from a provider + id by
 * lib/embeds.ts.
 */

import DOMPurify from "dompurify";

const FORBID_TAGS = [
  "style",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "base",
];
const ALIGN_RE = /^\s*text-align\s*:\s*(left|right|center|justify)\s*;?\s*$/i;

let hooked = false;
function installHooks() {
  if (hooked) return;
  hooked = true;
  DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
    if (data.attrName === "style") {
      const match = data.attrValue.match(ALIGN_RE);
      if (match) data.attrValue = `text-align: ${match[1].toLowerCase()}`;
      else data.keepAttr = false;
    }
  });
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      const href = node.getAttribute("href") ?? "";
      if (/^https?:\/\//i.test(href) && !href.startsWith(window.location.origin)) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      } else if (node.getAttribute("target") === "_blank") {
        node.setAttribute("rel", "noopener noreferrer");
      }
    }
  });
}

export function sanitizeArticle(html: string): string {
  installHooks();
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS,
    ADD_ATTR: ["target", "loading", "decoding", "srcset", "sizes"],
    ALLOW_DATA_ATTR: true,
  });
}

export function sanitizeHtmlBlock(html: string): string {
  installHooks();
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS,
    FORBID_ATTR: ["id", "class"],
    ALLOW_DATA_ATTR: false,
  });
}
