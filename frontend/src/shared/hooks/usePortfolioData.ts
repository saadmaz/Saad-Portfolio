/**
 * usePortfolioData - Centralized TanStack Query hooks for all portfolio data.
 * All hooks use the shared `dataManager` which calls the backend API with axios.
 * Data is cached for 5 minutes (staleTime) to avoid unnecessary refetches on navigation.
 * Each hook returns the standard TanStack Query result shape: { data, isLoading, isError, error }
 */
import { useQuery } from "@tanstack/react-query";
import { dataManager } from "@/shared/lib/dataManager";
import type {
  Blog,
  WorkExperience,
  Certificate,
  Skill,
  Project,
  Event,
  Newsletter,
  Hosting,
} from "@/shared/lib/dataManager";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

/** All blog posts */
export const useBlogs = () =>
  useQuery<Blog[]>({
    queryKey: ["blogs"],
    queryFn: () => dataManager.getBlogs(),
    staleTime: STALE_TIME,
  });

/** Featured/recent blogs, optional limit */
export const useFeaturedBlogs = (limit?: number) =>
  useQuery<Blog[]>({
    queryKey: ["blogs", "featured", limit],
    queryFn: () => dataManager.getFeaturedBlogs(limit),
    staleTime: STALE_TIME,
  });

/** Work experience entries */
export const useWorkExperience = () =>
  useQuery<WorkExperience[]>({
    queryKey: ["work-experience"],
    queryFn: () => dataManager.getWorkExperience(),
    staleTime: STALE_TIME,
  });

/** All certificates */
export const useCertificates = () =>
  useQuery<Certificate[]>({
    queryKey: ["certificates"],
    queryFn: () => dataManager.getCertificates(),
    staleTime: STALE_TIME,
  });

/** Skills grouped by category */
export const useSkills = () =>
  useQuery<Skill[]>({
    queryKey: ["skills"],
    queryFn: () => dataManager.getSkills(),
    staleTime: STALE_TIME,
  });

/** All projects */
export const useProjects = () =>
  useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => dataManager.getProjects(),
    staleTime: STALE_TIME,
  });

/** Featured projects (flagged or latest), optional limit */
export const useFeaturedProjects = (limit?: number) =>
  useQuery<Project[]>({
    queryKey: ["projects", "featured", limit],
    queryFn: () => dataManager.getFeaturedProjects(limit),
    staleTime: STALE_TIME,
  });

/** Recent projects by date, optional limit */
export const useRecentProjects = (limit?: number) =>
  useQuery<Project[]>({
    queryKey: ["projects", "recent", limit],
    queryFn: () => dataManager.getRecentProjects(limit),
    staleTime: STALE_TIME,
  });

/** All events */
export const useEvents = () =>
  useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: () => dataManager.getEvents(),
    staleTime: STALE_TIME,
  });

/** All newsletters */
export const useNewsletters = () =>
  useQuery<Newsletter[]>({
    queryKey: ["newsletters"],
    queryFn: () => dataManager.getNewsletters(),
    staleTime: STALE_TIME,
  });

/** Newsletters filtered by type */
export const useNewslettersByType = (type: "founder" | "cse") =>
  useQuery<Newsletter[]>({
    queryKey: ["newsletters", type],
    queryFn: () => dataManager.getNewslettersByType(type),
    staleTime: STALE_TIME,
  });

/** All hosting entries */
export const useHosting = () =>
  useQuery<Hosting[]>({
    queryKey: ["hosting"],
    queryFn: () => dataManager.getHosting(),
    staleTime: STALE_TIME,
  });

/** Active hosting entries only */
export const useActiveHosting = () =>
  useQuery<Hosting[]>({
    queryKey: ["hosting", "active"],
    queryFn: () => dataManager.getActiveHosting(),
    staleTime: STALE_TIME,
  });
