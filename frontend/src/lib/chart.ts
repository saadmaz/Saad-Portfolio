export interface ChartData {
  labels: string[];
  series: { name: string; values: number[] }[];
}

/** Validates untrusted JSON from the content into chart data, or null. */
export function parseChartData(raw: string | undefined | null): ChartData | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as { labels?: unknown; series?: unknown };
    if (!Array.isArray(data.labels) || !Array.isArray(data.series)) return null;
    const labels = data.labels.slice(0, 24).map((l) => String(l).slice(0, 40));
    const series = data.series
      .slice(0, 4)
      .map((s) => {
        const entry = s as { name?: unknown; values?: unknown };
        return {
          name: String(entry.name ?? "").slice(0, 40),
          values: (Array.isArray(entry.values) ? entry.values : [])
            .slice(0, labels.length)
            .map((v) => Number(v) || 0),
        };
      })
      .filter((s) => s.values.length);
    return labels.length && series.length ? { labels, series } : null;
  } catch {
    return null;
  }
}
