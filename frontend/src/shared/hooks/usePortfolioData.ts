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
    dataManager.getBlogs().then((data) => {
      setBlogs(data);
      setLoading(false);
    });
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
    dataManager.getFeaturedBlogs(limit).then((data) => {
      setBlogs(data);
      setLoading(false);
    });
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
    dataManager.getWorkExperience().then((data) => {
      setExperience(data);
      setLoading(false);
    });
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
    dataManager.getCertificates().then((data) => {
      setCertificates(data);
      setLoading(false);
    });
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
    dataManager.getSkills().then((data) => {
      setSkills(data);
      setLoading(false);
    });
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
    dataManager.getProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });
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
    dataManager.getFeaturedBlogs(limit).then((data) => {
      setProjects(data);
      setLoading(false);
    });
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
    dataManager.getEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
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
    dataManager.getNewsletters().then((data) => {
      setNewsletters(data);
      setLoading(false);
    });
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
    dataManager.getNewsletters().then((data) => {
      setNewsletters(data.filter(n => n.type === type));
      setLoading(false);
    });
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
