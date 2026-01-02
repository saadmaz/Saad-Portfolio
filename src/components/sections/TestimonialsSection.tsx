import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "John is one of the most talented engineers I've worked with. His ability to architect complex systems while maintaining clean code is impressive.",
    author: "Sarah Chen",
    role: "Engineering Manager at Tech Corp",
  },
  {
    quote: "Working with John on our startup was a game-changer. His technical leadership and product intuition helped us scale from 0 to 10K users.",
    author: "Michael Rodriguez",
    role: "Co-Founder at PreviousStartup",
  },
  {
    quote: "A rare combination of technical excellence and business acumen. John understands both the code and the customer.",
    author: "Emily Watson",
    role: "Product Lead at Innovation Labs",
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-padding">
      <div className="section-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="section-title">Testimonials</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            What People Say
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-card rounded-xl border border-border p-6 h-full flex flex-col">
                <Quote className="w-8 h-8 text-accent/30 mb-4" />
                <blockquote className="text-foreground text-sm leading-relaxed flex-1 mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="pt-4 border-t border-border">
                  <p className="font-medium text-foreground">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
