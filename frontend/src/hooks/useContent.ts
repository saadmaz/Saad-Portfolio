/**
 * hooks/useContent.ts
 * ─────────────────────────────────────────────────────────────
 * TanStack Query hooks for all non-project, non-blog portfolio data,
 * plus the contact form mutation.
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { ContentService } from "@/services/content-service";
import { ContactService, type ContactPayload } from "@/services/contact-service";
import { queryKeys } from "@/lib/queryKeys";

export const useExperience = () =>
  useQuery({ queryKey: queryKeys.experience.all, queryFn: ContentService.getWorkExperience });

export const useSkills = () =>
  useQuery({ queryKey: queryKeys.skills.all, queryFn: ContentService.getSkills });

export const useCertificates = () =>
  useQuery({ queryKey: queryKeys.certificates.all, queryFn: ContentService.getCertificates });

/**
 * One certificate by ID, derived from the cached certificate list so
 * navigating from /certifications to a detail page needs no extra fetch.
 */
export const useCertificate = (id: string | undefined) =>
  useQuery({
    queryKey: queryKeys.certificates.all,
    queryFn: ContentService.getCertificates,
    select: (certs) => certs.find((c) => String(c.id) === String(id)) ?? null,
    enabled: !!id,
  });

export const useAwards = () =>
  useQuery({ queryKey: queryKeys.awards.all, queryFn: ContentService.getAwards });

export const useLanguages = () =>
  useQuery({ queryKey: queryKeys.languages.all, queryFn: ContentService.getLanguages });

export const useHackathons = () =>
  useQuery({ queryKey: queryKeys.hackathons.all, queryFn: ContentService.getHackathons });

export const useTestimonials = () =>
  useQuery({ queryKey: queryKeys.testimonials.all, queryFn: ContentService.getTestimonials });

export const useVolunteer = () =>
  useQuery({ queryKey: queryKeys.volunteer.all, queryFn: ContentService.getVolunteerExperience });

export const useEducation = () =>
  useQuery({ queryKey: queryKeys.education.all, queryFn: ContentService.getEducation });

export const useEvents = () =>
  useQuery({ queryKey: queryKeys.events.all, queryFn: ContentService.getEvents });

export const useNewsletters = () =>
  useQuery({ queryKey: queryKeys.newsletters.all, queryFn: ContentService.getNewsletters });

export const useCourses = () =>
  useQuery({ queryKey: queryKeys.courses.all, queryFn: ContentService.getCourses });

export const usePublications = () =>
  useQuery({ queryKey: queryKeys.publications.all, queryFn: ContentService.getPublications });

export const usePatents = () =>
  useQuery({ queryKey: queryKeys.patents.all, queryFn: ContentService.getPatents });

export const useTestScores = () =>
  useQuery({ queryKey: queryKeys.testScores.all, queryFn: ContentService.getTestScores });

export const useOrganizations = () =>
  useQuery({ queryKey: queryKeys.organizations.all, queryFn: ContentService.getOrganizations });

export const useCauses = () =>
  useQuery({ queryKey: queryKeys.causes.all, queryFn: ContentService.getCauses });

export const useContactMutation = () =>
  useMutation({ mutationFn: (data: ContactPayload) => ContactService.submit(data) });
