import { Router } from 'express';

const router = Router();

// Placeholder admin routes (authentication to be added later)
router.get('/projects', (req, res) => {
  res.json({ success: true, data: [], message: 'Admin projects endpoint - coming soon' });
});

router.get('/blog-posts', (req, res) => {
  res.json({ success: true, data: [], message: 'Admin blog posts endpoint - coming soon' });
});

router.get('/contact-messages', (req, res) => {
  res.json({ success: true, data: [], message: 'Admin contact messages endpoint - coming soon' });
});

export default router;