import type { Project } from "@/types";

export interface VentureCompanyInput {
  name: string;
  role: string;
  period: string;
  summary?: string;
  url?: string;
  logo?: string;
  path: string;
  ids?: string[];
  current?: boolean;
}

export interface Venture {
  name: string;
  role: string;
  period: string;
  summary: string;
  url: string;
  logo: string;
  path: string;
  projects: Project[];
}

export function venturesFrom(companies: VentureCompanyInput[], projects: Project[]): Venture[];
export function experienceFaq(
  ventures: Venture[],
  companies: VentureCompanyInput[],
): { question: string; answer: string }[];
