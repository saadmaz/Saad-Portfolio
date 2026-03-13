import { useState, useEffect } from "react";
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

/**
 * Hook to get blogs data
 */
export const useBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBlogs(dataManager.getBlogs());
    setLoading(false);
  }, []);

  return { blogs, loading };
};

/**
 * Hook to get featured blogs
 */
export const useFeaturedBlogs = (limit?: number) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBlogs(dataManager.getFeaturedBlogs(limit));
    setLoading(false);
  }, [limit]);

  return { blogs, loading };
};

/**
 * Hook to get work experience
 */
export const useWorkExperience = () => {
  const [experience, setExperience] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setExperience(dataManager.getWorkExperience());
    setLoading(false);
  }, []);

  return { experience, loading };
};

/**
 * Hook to get certificates
 */
export const useCertificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCertificates(dataManager.getCertificates());
    setLoading(false);
  }, []);

  return { certificates, loading };
};

/**
 * Hook to get skills
 */
export const useSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSkills(dataManager.getSkills());
    setLoading(false);
  }, []);

  return { skills, loading };
};

/**
 * Hook to get projects
 */
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProjects(dataManager.getProjects());
    setLoading(false);
  }, []);

  return { projects, loading };
};

/**
 * Hook to get a small set of projects for spotlight sections.
 * Historically this returned projects with the `featured` flag; we
 * now fetch the most recent items to satisfy the "top 3 most recent
 * projects" requirement. The old behaviour is still available via
 * `dataManager.getFeaturedProjects` if callers need it.
 */
export const useFeaturedProjects = (limit?: number) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProjects(dataManager.getRecentProjects(limit));
    setLoading(false);
  }, [limit]);

  return { projects, loading };
};

/**
 * Hook to get events
 */
export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEvents(dataManager.getEvents());
    setLoading(false);
  }, []);

  return { events, loading };
};

/**
 * Hook to get newsletters
 */
export const useNewsletters = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setNewsletters(dataManager.getNewsletters());
    setLoading(false);
  }, []);

  return { newsletters, loading };
};

/**
 * Hook to get newsletters by type
 */
export const useNewslettersByType = (type: "founder" | "cse") => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setNewsletters(dataManager.getNewslettersByType(type));
    setLoading(false);
  }, [type]);

  return { newsletters, loading };
};

/**
 * Hook to get hosting info
 */
export const useHosting = () => {
  const [hosting, setHosting] = useState<Hosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHosting(dataManager.getHosting());
    setLoading(false);
  }, []);

  return { hosting, loading };
};

/**
 * Hook to get active hosting
 */
export const useActiveHosting = () => {
  const [hosting, setHosting] = useState<Hosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHosting(dataManager.getActiveHosting());
    setLoading(false);
  }, []);

  return { hosting, loading };
};
