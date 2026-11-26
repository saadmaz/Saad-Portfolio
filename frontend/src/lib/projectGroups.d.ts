export type ProjectGroupId = "venture" | "client" | "lab" | "academic";
export type ProjectStatusId = "live" | "building" | "other";

interface ProjectLike {
  title?: string;
  techStack?: string[];
  technologies?: string[];
  group?: string;
  role?: string;
  category?: string;
  type?: string;
  client?: string;
  stage?: string;
  date?: string;
  start_date?: string;
}

export const PROJECT_GROUPS: {
  id: ProjectGroupId;
  label: string;
  title: string;
  soft: string;
  intro: string;
  noun: [string, string];
}[];
export function projectGroupOf(p: ProjectLike): ProjectGroupId;
export const PROJECT_STATUSES: { id: ProjectStatusId; label: string }[];
export function projectStatusOf(p: ProjectLike): ProjectStatusId;
export function firstProjectYear(projects: ProjectLike[]): number | null;
export function projectsFaq(projects: ProjectLike[]): { question: string; answer: string }[];
