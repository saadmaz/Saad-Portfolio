import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { CertificatesPreview } from "@/components/sections/CertificatesPreview";
import { EventsPreview } from "@/components/sections/EventsPreview";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { LanguagesSection } from "@/components/sections/LanguagesSection";
import { AwardsSection } from "@/components/sections/AwardsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { PAGE_SEO, PERSON_SCHEMA, BASE_URL } from "@/lib/seo-content";

const Index = () => {
  return (
    <Layout>
      <SEO
        title={PAGE_SEO["/"].title}
        description={PAGE_SEO["/"].description}
        url={BASE_URL}
        structuredData={PERSON_SCHEMA}
      />
      <HeroSection />
      <FeaturedProjects />
      <CertificatesPreview />
      <EventsPreview />
      <ExperienceSection />
      <EducationSection preview />
      <SkillsSection />
      <LanguagesSection />
      <AwardsSection />
      <AboutSection />
      <TestimonialsSection />
      <NewsletterSection />
      <ContactSection />
    </Layout>
  );
};

export default Index;
