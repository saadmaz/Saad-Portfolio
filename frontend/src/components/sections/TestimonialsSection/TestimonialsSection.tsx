import { useRef } from "react";
import { motion } from "framer-motion";
import { Quote, Linkedin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    quote: "Saad is one of the most talented engineers I've worked with. His ability to architect complex systems while maintaining clean code is impressive.",
    author: "Sarah Chen",
    role: "Engineering Manager at Tech Corp",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
    linkedIn: "https://linkedin.com/in/sarahchen",
  },
  {
    quote: "Working with Saad on our startup was a game-changer. His technical leadership and product intuition helped us scale from 0 to 10K users.",
    author: "Michael Rodriguez",
    role: "Co-Founder at PreviousStartup",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
    linkedIn: "https://linkedin.com/in/michaelrodriguez",
  },
  {
    quote: "A rare combination of technical excellence and business acumen. Saad understands both the code and the customer.",
    author: "Emily Watson",
    role: "Product Lead at Innovation Labs",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&q=80",
    linkedIn: "https://linkedin.com/in/emilywatson",
  },
  {
    quote: "Saad's ability to break down complex problems and communicate solutions clearly makes him an exceptional team member.",
    author: "David Park",
    role: "CTO at Startup XYZ",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80",
    linkedIn: "https://linkedin.com/in/davidpark",
  },
  {
    quote: "One of the most dedicated and passionate developers I've mentored. His growth trajectory is phenomenal.",
    author: "Lisa Thompson",
    role: "Senior Director at Big Tech",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&q=80",
    linkedIn: "https://linkedin.com/in/lisathompson",
  },
  {
    quote: "Saad brings energy and innovation to every project. His contributions to our open-source tools were invaluable.",
    author: "James Miller",
    role: "Open Source Maintainer",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&q=80",
    linkedIn: "https://linkedin.com/in/jamesmiller",
  },
  {
    quote: "His presentation skills and ability to engage audiences made our conference a huge success.",
    author: "Amanda Foster",
    role: "Event Director at TechConf",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80",
    linkedIn: "https://linkedin.com/in/amandafoster",
  },
  {
    quote: "Saad's work ethic and attention to detail are unmatched. He consistently delivers beyond expectations.",
    author: "Robert Kim",
    role: "VP Engineering at Growth Co",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
    linkedIn: "https://linkedin.com/in/robertkim",
  },
];

export function TestimonialsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="section-padding">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="section-title">Testimonials</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            What People Say
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Feedback from colleagues, mentors, and collaborators I've had the pleasure of working with.
          </p>
        </motion.div>

        <div className="flex justify-end gap-2 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            className="rounded-full hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            className="rounded-full hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-shrink-0 w-[350px] snap-center"
            >
              <div className="bg-card rounded-xl border border-border p-6 h-full flex flex-col card-hover">
                <Quote className="w-8 h-8 text-accent/30 mb-4" />
                <blockquote className="text-foreground text-sm leading-relaxed flex-1 mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="pt-4 border-t border-border flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-accent/20"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <a
                    href={testimonial.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-secondary/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                    aria-label={`${testimonial.author}'s LinkedIn`}
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-1 mt-6">
          {testimonials.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-border"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
