import type { Award, Education, Event, Project, VolunteerExperience } from "@/types";

export interface SchoolContent {
  honours: NonNullable<Education["honors_and_awards"]>;
  awards: Award[];
  volunteer: VolunteerExperience[];
  events: Event[];
  projects: Project[];
}

export function schoolNameOf(e: Partial<Education> | null | undefined): string;
export function schoolSlugOf(e: Partial<Education> | null | undefined): string;
export function rolesOf(e: Partial<Education> | null | undefined): string[];
export function schoolContent(
  edu: Partial<Education>,
  sources: { awards?: Award[]; volunteer?: VolunteerExperience[]; events?: Event[]; projects?: Project[] },
): SchoolContent;
export function isSchoolPageIndexable(edu: Partial<Education>, content: SchoolContent): boolean;
