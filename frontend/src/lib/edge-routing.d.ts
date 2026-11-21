/** Types for edge-routing.js (plain JS so middleware and prerender share it). */

export type ContentKind = "series" | "category" | "post" | "event" | "certificate" | "project" | "author";

export const DETAIL_ROUTES: { re: RegExp; kind: ContentKind }[];
export const PASS_PREFIXES: string[];

export type PathClass =
  | { type: "known" }
  | { type: "pass" }
  | { type: "lookup"; kind: ContentKind; key: string }
  | { type: "missing" };

export function classifyPath(pathname: string, known: Set<string>): PathClass;
