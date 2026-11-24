export interface Point {
  x: number;
  y: number;
}

/**
 * SVG path for the experience road: enters from the top above the first stop,
 * S-curves through each stop's centre, and leaves at the bottom under the last.
 */
export function roadPath(points: Point[], height: number): string {
  if (points.length === 0) return "";
  const [first] = points;
  const last = points[points.length - 1];
  let d = `M ${first.x} 0 L ${first.x} ${first.y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const mid = (b.y - a.y) / 2;
    d += ` C ${a.x} ${a.y + mid} ${b.x} ${b.y - mid} ${b.x} ${b.y}`;
  }
  return `${d} L ${last.x} ${height}`;
}
