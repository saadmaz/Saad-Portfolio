import { describe, expect, it } from "vitest";
import { splitLinks } from "./linkify";

describe("splitLinks", () => {
  it("links a full URL and keeps the surrounding text", () => {
    expect(splitLinks("Website: https://tanksudda.com/ today")).toEqual([
      "Website: ",
      { url: "https://tanksudda.com/", label: "https://tanksudda.com/" },
      " today",
    ]);
  });

  it("adds https to www links and leaves trailing punctuation out", () => {
    expect(splitLinks("See www.example.com.")).toEqual([
      "See ",
      { url: "https://www.example.com", label: "www.example.com" },
      ".",
    ]);
  });

  it("returns plain text untouched", () => {
    expect(splitLinks("No links here")).toEqual(["No links here"]);
  });
});
