import type { Certificate } from "@/types";

/** One colour per learning area, assigned by how many certificates each has. */
export const AREA_COLORS = [
  "#ff5f00",
  "#8b5cf6",
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
  "#64748b",
];

export function areaColors(certs: Certificate[]): Map<string, string> {
  const counts = new Map<string, number>();
  for (const c of certs) if (c.category) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  return new Map(
    [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cat], i) => [cat, AREA_COLORS[i % AREA_COLORS.length]]),
  );
}
