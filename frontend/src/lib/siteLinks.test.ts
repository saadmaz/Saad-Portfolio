import { describe, expect, it } from "vitest";
import { internalPath, isExternalHref } from "./siteLinks";

describe("siteLinks", () => {
  it("maps links to this site to in-app paths", () => {
    expect(internalPath("https://www.saadmaz.com/projects/stopwash-os")).toBe("/projects/stopwash-os");
    expect(internalPath("https://saadmaz.com/blog/x?a=1#faq")).toBe("/blog/x?a=1#faq");
    expect(internalPath("https://www.saadmaz.com")).toBe("/");
  });

  it("leaves other sites and relative links alone", () => {
    expect(internalPath("https://www.agentivex.online/")).toBeNull();
    expect(internalPath("https://evil-saadmaz.com/")).toBeNull();
    expect(internalPath("/projects")).toBeNull();
  });

  it("only flags off-site http(s) links as external", () => {
    expect(isExternalHref("https://github.com/saadmaz")).toBe(true);
    expect(isExternalHref("https://www.saadmaz.com/about")).toBe(false);
    expect(isExternalHref("/about")).toBe(false);
    expect(isExternalHref("mailto:hello@saadmaz.com")).toBe(false);
  });
});
