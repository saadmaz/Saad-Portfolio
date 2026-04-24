import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { CertificatesPreview } from "@/components/sections/CertificatesPreview";
import { EventsPreview } from "@/components/sections/EventsPreview";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ContactSection } from "@/components/sections/ContactSection";

const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Saad Mazhar",
  url: "https://saadmaz.com",
  image: "https://saadmaz.com/logo.png",
  sameAs: [
    "https://linkedin.com/in/saadmaz/",
    "https://github.com/saadmaz/",
    "https://instagram.com/saaadmaz/",
    "https://facebook.com/saadmazhar",
    "https://x.com/SaadMazhar_",
  ],
  jobTitle: "Startup Founder & Full-Stack Developer",
  worksFor: { "@type": "Organization", name: "TankSudda" },
  address: { "@type": "PostalAddress", addressLocality: "Colombo", addressCountry: "LK" },
};

const Index = () => {
  return (
    <Layout>
      <SEO
        title="Saad Mazhar | Startup Founder, Tech Speaker & Full-Stack Developer in Sri Lanka"
        description="Portfolio of Saad Mazhar - startup founder, tech speaker, and full-stack developer based in Colombo, Sri Lanka. Building AI-powered products, web apps, and mobile solutions that create real-world impact."
        url="https://saadmaz.com"
        structuredData={PERSON_SCHEMA}
      />
      <HeroSection />
      <FeaturedProjects />
      <CertificatesPreview />
      <EventsPreview />
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
