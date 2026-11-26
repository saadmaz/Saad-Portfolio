import { describe, expect, it } from "vitest";
import { resizedImage, resizedUrl } from "./images";

const own =
  "https://firebasestorage.googleapis.com/v0/b/saadportfolio03.firebasestorage.app/o/x.png?alt=media";

describe("resizedUrl", () => {
  it("routes the site's own Storage images through Cloudflare on the live domain", () => {
    expect(resizedUrl(own, 680, true)).toBe(
      `/cdn-cgi/image/width=680,format=auto,quality=80,fit=scale-down/${own}`,
    );
  });
  it("leaves other hosts, other buckets and non-live environments alone", () => {
    expect(resizedUrl("https://example.com/a.png", 680, true)).toBe("https://example.com/a.png");
    expect(resizedUrl(own.replace("saadportfolio03", "other"), 680, true)).toContain("/b/other.");
    expect(resizedUrl(own, 680, false)).toBe(own);
  });
  it("builds a srcset of three widths", () => {
    expect(resizedImage(own, "50vw", true).srcSet?.split(", ")).toHaveLength(3);
    expect(resizedImage(own, "50vw", false)).toEqual({ src: own });
  });
});
