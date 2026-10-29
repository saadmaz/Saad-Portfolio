/**
 * services/content-service.ts
 * ─────────────────────────────────────────────────────────────
 * Read-only queries for every portfolio entity that isn't a Project
 * or BlogPost. Writes happen in the separate admin app.
 *
 * Note: Firestore's orderBy() omits documents that lack the sort
 * field, so ordered collections only return documents that have it.
 */

import { COLLECTIONS, fetchCollection, fetchOrdered } from "@/lib/firestore";
import type {
  Award,
  Cause,
  Certificate,
  Course,
  Education,
  Event,
  Experience,
  Hackathon,
  Language,
  Newsletter,
  Organization,
  Patent,
  Publication,
  SkillSet,
  Testimonial,
  TestScore,
  VolunteerExperience,
} from "@/types";

export const ContentService = {
  getWorkExperience: () => fetchOrdered<Experience>(COLLECTIONS.experience, "order_index"),
  getSkills: () => fetchCollection<SkillSet>(COLLECTIONS.skills),
  getCertificates: () => fetchCollection<Certificate>(COLLECTIONS.certificates),
  getAwards: () => fetchCollection<Award>(COLLECTIONS.awards),
  getLanguages: () => fetchCollection<Language>(COLLECTIONS.languages),
  getHackathons: () => fetchCollection<Hackathon>(COLLECTIONS.hackathons),
  getTestimonials: () => fetchCollection<Testimonial>(COLLECTIONS.testimonials),
  getVolunteerExperience: () => fetchCollection<VolunteerExperience>(COLLECTIONS.volunteer),
  getEducation: () => fetchCollection<Education>(COLLECTIONS.education),
  getEvents: () => fetchOrdered<Event>(COLLECTIONS.events, "date"),
  getNewsletters: () => fetchOrdered<Newsletter>(COLLECTIONS.newsletters, "date"),
  getCourses: () => fetchCollection<Course>(COLLECTIONS.courses),
  getPublications: () => fetchOrdered<Publication>(COLLECTIONS.publications, "date"),
  getPatents: () => fetchCollection<Patent>(COLLECTIONS.patents),
  getTestScores: () => fetchCollection<TestScore>(COLLECTIONS.testScores),
  getOrganizations: () => fetchCollection<Organization>(COLLECTIONS.organizations),
  getCauses: () => fetchCollection<Cause>(COLLECTIONS.causes),
};
