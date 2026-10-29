import React, { Suspense } from "react";
import { LazyMotion } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { ScrollToTop } from "@/hooks/useScrollToTop";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// domMax includes layout animations used on /certifications and /events
const loadMotionFeatures = () => import("framer-motion").then((mod) => mod.domMax);

// --- Lazy loaded routes ---
const Index = React.lazy(() => import("../pages/Index"));
const ProjectsPage = React.lazy(() => import("../pages/ProjectsPage"));
const ExperiencePage = React.lazy(() => import("../pages/ExperiencePage"));
const SkillsOnlyPage = React.lazy(() => import("../pages/SkillsOnlyPage"));
const CertificationsPage = React.lazy(() => import("../pages/CertificationsPage"));
const CertificateDetailPage = React.lazy(() => import("../pages/CertificateDetailPage"));
const AboutPage = React.lazy(() => import("../pages/AboutPage"));
const ContactPage = React.lazy(() => import("../pages/ContactPage"));
const BlogsPage = React.lazy(() => import("../pages/BlogsPage"));
const BlogDetailPage = React.lazy(() => import("../pages/BlogDetailPage"));
const NewslettersPage = React.lazy(() => import("../pages/NewslettersPage"));
const EventsPage = React.lazy(() => import("../pages/EventsPage"));
const EventDetailPage = React.lazy(() => import("../pages/EventDetailPage"));
const ProjectDetailPage = React.lazy(() => import("../pages/ProjectDetailPage"));
const NotFound = React.lazy(() => import("../pages/NotFound"));

const PublicationsPage = React.lazy(() => import("../pages/PublicationsPage"));
const EducationPage = React.lazy(() => import("../pages/EducationPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin" />
      <span className="text-sm text-muted-foreground font-medium animate-pulse">Loading...</span>
    </div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Toaster />
          <Analytics />
          <LazyMotion features={loadMotionFeatures}>
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                  <Route path="/experience" element={<ExperiencePage />} />
                  <Route path="/skills" element={<SkillsOnlyPage />} />
                  <Route path="/certifications" element={<CertificationsPage />} />
                  <Route path="/certifications/:id" element={<CertificateDetailPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/blog" element={<BlogsPage />} />
                  <Route path="/blog/:slug" element={<BlogDetailPage />} />
                  <Route path="/newsletters" element={<NewslettersPage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:id" element={<EventDetailPage />} />
                  <Route path="/publications" element={<PublicationsPage />} />
                  <Route path="/education" element={<EducationPage />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </LazyMotion>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </HelmetProvider>
);

export default App;
