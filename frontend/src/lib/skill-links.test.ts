import { describe, expect, it } from "vitest";
import { skillLink } from "./skill-links.js";

const s = (name: string, url?: string) => ({ name, url });

describe("skillLink", () => {
  it("prefers the CMS url when it is a real http(s) link", () => {
    expect(skillLink(s("React.js", "https://example.com/react"))).toBe("https://example.com/react");
    expect(skillLink(s("React.js", "javascript:alert(1)"))).toBe("https://react.dev");
  });

  it("folds .js suffixes, punctuation and parentheticals", () => {
    expect(skillLink(s("Node.js"))).toBe("https://nodejs.org");
    expect(skillLink(s("AWS (EC2, S3, IAM)"))).toBe("https://aws.amazon.com");
    expect(skillLink(s("VS Code"))).toBe("https://code.visualstudio.com");
  });

  it("keeps AngularJS and Angular apart", () => {
    expect(skillLink(s("AngularJS"))).toBe("https://angularjs.org");
    expect(skillLink(s("Angular"))).toBe("https://angular.dev");
  });

  it("returns undefined for unknown skills", () => {
    expect(skillLink(s("Rect"))).toBeUndefined();
  });
});
