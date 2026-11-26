import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { SNAPSHOT_ELEMENT_ID, seedQueryCache } from "./querySnapshot";

/** Just enough of a Document for seedQueryCache. */
function page(json?: string) {
  let present = json !== undefined;
  const el = { textContent: json ?? "", remove: () => (present = false) };
  return {
    doc: {
      getElementById: (id: string) => (present && id === SNAPSHOT_ELEMENT_ID ? el : null),
    },
    removed: () => !present,
  };
}

describe("seedQueryCache", () => {
  it("seeds every entry with the build time and removes the element", () => {
    const client = new QueryClient();
    const p = page(
      JSON.stringify({
        builtAt: 1000,
        entries: [
          [["projects"], [{ id: "a" }]],
          [["blog", "settings"], {}],
        ],
      }),
    );
    expect(seedQueryCache(client, p.doc)).toBe(2);
    expect(client.getQueryData(["projects"])).toEqual([{ id: "a" }]);
    expect(client.getQueryState(["projects"])?.dataUpdatedAt).toBe(1000);
    expect(p.removed()).toBe(true);
  });
  it("ignores a missing or malformed snapshot", () => {
    expect(seedQueryCache(new QueryClient(), page().doc)).toBe(0);
    expect(seedQueryCache(new QueryClient(), page("{nope").doc)).toBe(0);
  });
});
