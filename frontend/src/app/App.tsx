import { lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScrollToTop } from "@/hooks/useScrollToTop";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = lazy(() => import("../pages/Index"));
const ProjectsPage = lazy(() => import("../pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("../pages/ProjectDetailPage"));
const ExperiencePage = lazy(() => import("../pages/ExperiencePage"));
const ExperienceDetailPage = lazy(() => import("../pages/ExperienceDetailPage"));
const SkillsPage = lazy(() => import("../pages/SkillsPage"));
const CertificationsPage = lazy(() => import("../pages/CertificationsPage"));
const CertificateDetailPage = lazy(() => import("../pages/CertificateDetailPage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const EducationPage = lazy(() => import("../pages/EducationPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const BlogsPage = lazy(() => import("../pages/BlogsPage"));
const BlogDetailPage = lazy(() => import("../pages/BlogDetailPage"));
const SeriesPage = lazy(() => import("../pages/SeriesPage"));
const AuthorPage = lazy(() => import("../pages/AuthorPage"));
const PreviewPage = lazy(() => import("../pages/PreviewPage"));
const NewslettersPage = lazy(() => import("../pages/NewslettersPage"));
const PublicationsPage = lazy(() => import("../pages/PublicationsPage"));
const EventsPage = lazy(() => import("../pages/EventsPage"));
const EventDetailPage = lazy(() => import("../pages/EventDetailPage"));
const NotFound = lazy(() => import("../pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false } },
});

const App = () => (
  <HelmetProvider>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Analytics />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<div className="min-h-screen bg-base" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path="/experience" element={<ExperiencePage />} />
              <Route path="/experience/:slug" element={<ExperienceDetailPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/languages" element={<Navigate to="/about#languages" replace />} />
              <Route path="/certifications" element={<CertificationsPage />} />
              <Route path="/certifications/:id" element={<CertificateDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog" element={<BlogsPage />} />
              <Route path="/blog/category/:category" element={<BlogsPage />} />
              <Route path="/blog/series/:slug" element={<SeriesPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/authors/:slug" element={<AuthorPage />} />
              <Route path="/preview/:id" element={<PreviewPage />} />
              <Route path="/newsletters" element={<NewslettersPage />} />
              <Route path="/publications" element={<PublicationsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </HelmetProvider>
);

export default App;
