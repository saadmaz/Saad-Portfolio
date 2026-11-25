export const CSP: string;
export const PREVIEW_CSP: string;
export const SECURITY_HEADERS: Record<string, string>;
export const PREVIEW_HEADERS: Record<string, string>;
export const HEADER_RULES: { path: string; headers: Record<string, string> }[];
export function headersFile(rules?: { path: string; headers: Record<string, string> }[]): string;
