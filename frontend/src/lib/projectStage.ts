/** Where the product is: live, being built, or an experiment. */
export function stageTone(stage?: string): "live" | "building" | "muted" {
  const s = (stage ?? "").toLowerCase();
  if (s === "production" || s === "maintained") return "live";
  if (s === "beta" || s === "development") return "building";
  return "muted";
}
