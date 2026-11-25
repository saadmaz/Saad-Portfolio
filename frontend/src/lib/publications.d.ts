import type { Publication } from "@/types";

export type PubTypeId = "paper" | "article" | "talk" | "book" | "patent";
export const PUB_TYPES: Record<PubTypeId, { label: string; color: string }>;
export function pubType(p: Partial<Publication> | null | undefined): PubTypeId;
export function citeApa(p: Publication): string;
export function citeBibtex(p: Publication): string;
export function publicationSchema(p: Publication, personRef?: object): Record<string, unknown>;
