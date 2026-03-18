import { Router } from 'express';
import * as AdminController from '../controllers/AdminController.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Projects
router.post('/projects', AdminController.createProject);
router.put('/projects/:id', AdminController.updateProject);
router.delete('/projects/:id', AdminController.deleteProject);

// Blog Posts
router.get('/blogs', AdminController.getAllBlogs);
router.post('/blogs', AdminController.createBlog);
router.put('/blogs/:id', AdminController.updateBlog);
router.delete('/blogs/:id', AdminController.deleteBlog);

// Experience
router.post('/experience', AdminController.createExperience);
router.put('/experience/:id', AdminController.updateExperience);
router.delete('/experience/:id', AdminController.deleteExperience);

// Skills
router.post('/skills', AdminController.createSkill);
router.put('/skills/:id', AdminController.updateSkill);
router.delete('/skills/:id', AdminController.deleteSkill);

// Certificates
router.post('/certificates', AdminController.createCertificate);
router.put('/certificates/:id', AdminController.updateCertificate);
router.delete('/certificates/:id', AdminController.deleteCertificate);

// Events
router.post('/events', AdminController.createEvent);
router.put('/events/:id', AdminController.updateEvent);
router.delete('/events/:id', AdminController.deleteEvent);

// Newsletters
router.post('/newsletters', AdminController.createNewsletter);
router.put('/newsletters/:id', AdminController.updateNewsletter);
router.delete('/newsletters/:id', AdminController.deleteNewsletter);

// Hosting
router.post('/hosting', AdminController.createHosting);
router.put('/hosting/:id', AdminController.updateHosting);
router.delete('/hosting/:id', AdminController.deleteHosting);

// Media
router.post('/upload', upload.single('file'), AdminController.uploadImage);

export default router;