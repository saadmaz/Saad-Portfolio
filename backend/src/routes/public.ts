import { Router } from 'express';
import {
  getProjects,
  getProjectBySlug,
  getFeaturedProjects,
  getBlogPosts,
  getBlogPostBySlug,
  submitContactForm
} from '../controllers/publicController.js';

const router = Router();

// Project routes
router.get('/projects', getProjects);
router.get('/projects/featured', getFeaturedProjects);
router.get('/projects/:slug', getProjectBySlug);

// Blog routes
router.get('/blog-posts', getBlogPosts);
router.get('/blog-posts/:slug', getBlogPostBySlug);

// Contact route
router.post('/contact', submitContactForm);

// Placeholder routes for other data (to be implemented)
router.get('/work-experience', (req, res) => {
  res.json({ success: true, data: [], message: 'Work experience endpoint - coming soon' });
});

router.get('/skills', (req, res) => {
  res.json({ success: true, data: [], message: 'Skills endpoint - coming soon' });
});

router.get('/certificates', (req, res) => {
  res.json({ success: true, data: [], message: 'Certificates endpoint - coming soon' });
});

export default router;