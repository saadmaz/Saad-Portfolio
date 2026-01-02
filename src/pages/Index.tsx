import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ContactSection } from "@/components/sections/ContactSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedProjects />
      <ExperienceSection />
      <SkillsSection />
      <AboutSection />
      <TestimonialsSection />
      <NewsletterSection />
      <ContactSection />
    </Layout>
  );
};

export default Index;
