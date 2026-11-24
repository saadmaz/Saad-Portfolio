import { describe, expect, it } from "vitest";
import { roadPath } from "./journey";

describe("roadPath", () => {
  it("is empty without stops", () => {
    expect(roadPath([], 500)).toBe("");
  });

  it("runs straight through a single stop from top to bottom", () => {
    expect(roadPath([{ x: 40, y: 100 }], 300)).toBe("M 40 0 L 40 100 L 40 300");
  });

  it("curves between stops with vertical tangents at each one", () => {
    expect(
      roadPath(
        [
          { x: 100, y: 100 },
          { x: 300, y: 300 },
        ],
        400,
      ),
    ).toBe("M 100 0 L 100 100 C 100 200 300 200 300 300 L 300 400");
  });
});
