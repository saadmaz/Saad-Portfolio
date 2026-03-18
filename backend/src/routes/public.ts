import { Router } from 'express';
import * as ProjectController from '../controllers/ProjectController.js';
import * as BlogController from '../controllers/BlogController.js';
import * as CommonController from '../controllers/CommonController.js';
import { validate } from '../middleware/validate.js';
import { ContactMessageSchema } from '../schemas/index.js';
import { z } from 'zod';

const router = Router();

// Project routes
router.get('/projects', ProjectController.getProjects);
router.get('/projects/featured', ProjectController.getFeaturedProjects);
router.get('/projects/id/:id', ProjectController.getProjectById);
router.get('/projects/:slug', ProjectController.getProjectBySlug);

// Blog routes
router.get('/blog-posts', BlogController.getBlogPosts);
router.get('/blog-posts/latest', BlogController.getLatestBlogPost);
router.get('/blog-posts/id/:id', BlogController.getBlogPostById);
router.get('/blog-posts/:slug', BlogController.getBlogPostBySlug);

// Experience & Skills & Certificates
router.get('/work-experience', CommonController.getWorkExperience);
router.get('/skills', CommonController.getSkills);
router.get('/certificates', CommonController.getCertificates);
router.get('/events', CommonController.getEvents);
router.get('/newsletters', CommonController.getNewsletters);
router.get('/hosting', CommonController.getHosting);
// Contact route with validation
router.post('/contact', validate(z.object({ body: ContactMessageSchema })), CommonController.submitContactForm);

export default router;