import { z } from 'zod';

export const ProjectSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  long_description: z.string().optional(),
  date: z.string().optional(),
  status: z.string(),
  stage: z.string(),
  featured: z.boolean().default(false),
  order_index: z.number().optional(),
  tech_stack: z.object({
    frontend: z.array(z.string()).optional(),
    backend: z.array(z.string()).optional(),
    database: z.array(z.string()).optional(),
    devops: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
  }).optional(),
});

export const BlogPostSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  date: z.string(),
  category: z.string(),
  author: z.string(),
  published: z.boolean().default(false),
  is_latest: z.boolean().default(false),
});

export const ContactMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;
export type BlogPostInput = z.infer<typeof BlogPostSchema>;
export type ContactMessageInput = z.infer<typeof ContactMessageSchema>;
