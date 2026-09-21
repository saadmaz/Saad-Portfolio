import { useRef } from "react";
import { m } from "framer-motion";
import { Quote, Linkedin, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTestimonials } from "@/shared/hooks/useCommon";

export function TestimonialsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { data: testimonials = [], isLoading } = useTestimonials();

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <section className="section-padding">
        <div className="section-container">
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-shrink-0 w-[85vw] max-w-[350px] h-52 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section aria-labelledby="testimonials-heading" className="section-padding">
      <div className="section-container">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="section-title">Testimonials</span>
          <h2 id="testimonials-heading" className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            What People Say
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Feedback from colleagues, mentors, and collaborators I've had the pleasure of working with.
          </p>
        </m.div>

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
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {testimonials.map((testimonial, index) => (
            <m.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
              className="flex-shrink-0 w-[85vw] max-w-[350px] snap-center"
            >
              <div className="bg-card rounded-xl border border-border p-6 h-full flex flex-col card-hover transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-accent/30">
                <Quote className="w-8 h-8 text-accent/30 mb-4 shrink-0" />
                <blockquote className="text-foreground text-sm leading-relaxed flex-1 mb-6 line-clamp-4">
                  "{testimonial.content}"
                </blockquote>
                <div className="pt-4 border-t border-border flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-accent/20 shrink-0 bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      testimonial.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {testimonial.position}
                      {testimonial.company ? ` at ${testimonial.company}` : ""}
                    </p>
                  </div>
                  {testimonial.link && (
                    <a
                      href={testimonial.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-secondary/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 shrink-0"
                      aria-label={`${testimonial.name}'s LinkedIn`}
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </m.div>
          ))}
        </div>

        {testimonials.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {testimonials.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-border" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
