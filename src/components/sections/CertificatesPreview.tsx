import { motion } from "framer-motion";
import { ArrowRight, Award, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

/**
 * DATA OBJECT: Array of certification objects.
 * Storing data outside the JSX makes it easier to manage, 
 * especially when fetching from an API or CMS later.
 */
const certificates = [
  {
    title: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    issuerLogo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    year: "2024",
    color: "from-orange-500/20 to-amber-500/20",
  },
  {
    title: "Google Cloud Professional Data Engineer",
    issuer: "Google Cloud",
    issuerLogo: "https://www.gstatic.com/devrel-devsite/prod/v0e0f589edd85502a40d78d7d0825db8ea5ef3b99ab4070381ee86977c9168730/cloud/images/cloud-logo.svg",
    year: "2024",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Meta Front-End Developer",
    issuer: "Meta",
    issuerLogo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png",
    year: "2023",
    color: "from-indigo-500/20 to-blue-500/20",
  },
  {
    title: "TensorFlow Developer Certificate",
    issuer: "Google",
    issuerLogo: "https://www.gstatic.com/devrel-devsite/prod/v0e0f589edd85502a40d78d7d0825db8ea5ef3b99ab4070381ee86977c9168730/cloud/images/cloud-logo.svg",
    year: "2023",
    color: "from-yellow-500/20 to-orange-500/20",
  },
  {
    title: "MongoDB Certified Developer",
    issuer: "MongoDB University",
    issuerLogo: "https://webimages.mongodb.com/_com_assets/cms/mongodb_logo1-76twgcu2dm.png",
    year: "2023",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    title: "GitHub Actions Certification",
    issuer: "GitHub",
    issuerLogo: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    year: "2024",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    title: "Docker Certified Associate",
    issuer: "Docker",
    issuerLogo: "https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png",
    year: "2024",
    color: "from-sky-500/20 to-blue-500/20",
  },
];

export function CertificatesPreview() {
  return (
    // 'py-16' used instead of 'section-padding' to slightly reduce vertical footprint
    <section className="py-16 bg-secondary/30">
      <div className="section-container">
        
        {/* --- SECTION HEADER --- */}
        {/* Entrance animation using framer-motion's whileInView to trigger when visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10" // Reduced bottom margin for a tighter layout
        >
          <span className="section-title">Credentials</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Licenses & Certifications
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Industry-recognized credentials validating my expertise across cloud, 
                development, and data engineering.
              </p>
            </div>
          </div>
        </motion.div>

        {/* --- CERTIFICATES CAROUSEL --- */}
        {/* Wrap in motion.div to provide a smooth fade-in as the section appears */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <Carousel
            opts={{
              align: "start", // Keeps the first item aligned to the left
              loop: true,     // Infinite scrolling for better UX
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {/* Mapping through data to generate individual slides */}
              {certificates.map((cert, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  {/* Internal card animation: Scale and hover translation */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="h-full"
                  >
                    {/* The Card: Uses group hover states for the gradient reveal effect */}
                    <div className={`h-full bg-card rounded-xl border border-border p-5 relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:border-accent/30`}>
                      
                      {/* HOVER GRADIENT: Hidden by default, reveals on group-hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${cert.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      
                      {/* CARD CONTENT: Relative z-index to stay above the gradient background */}
                      <div className="relative z-10">
                        {/* ISSUER ICON: Simplified placeholder box with an Award icon */}
                        <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center mb-4 border border-border group-hover:border-accent/30 transition-colors">
                          <Award className="w-6 h-6 text-accent" />
                        </div>
                        
                        {/* CERTIFICATE TEXT: Line-clamp used to prevent layout break with long titles */}
                        <h4 className="font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-accent transition-colors">
                          {cert.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">{cert.issuer}</p>
                        <span className="text-xs text-muted-foreground">{cert.year}</span>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
              
              {/* --- "SEE ALL" CTA CARD --- */}
              {/* Last item in carousel leading users to the full skills/certifications page */}
              <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <Link to="/skills#courses" className="block h-full">
                  <div className="h-full bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/30 p-5 flex flex-col items-center justify-center gap-3 hover:bg-accent/15 transition-all duration-300 min-h-[180px] group">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                      <ExternalLink className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-medium text-accent text-center">See All Certificates</span>
                    {/* Arrow animation to nudge users visually towards the link */}
                    <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </CarouselItem>
            </CarouselContent>
            
            {/* NAVIGATION CONTROLS: Hidden on mobile to save space, visible from 'md' screens up */}
            <CarouselPrevious className="hidden md:flex -left-4 bg-background border-border hover:bg-secondary" />
            <CarouselNext className="hidden md:flex -right-4 bg-background border-border hover:bg-secondary" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}