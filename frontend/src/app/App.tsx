import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/shared/hooks/useTheme";
import { ScrollToTop } from "@/shared/hooks/useScrollToTop";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// --- Lazy loaded routes for Code Splitting ---
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      retry: 1,                      // retry once
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
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <ErrorBoundary>
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

