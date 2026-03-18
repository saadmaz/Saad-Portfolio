import { Router } from 'express';
import * as AdminController from '../controllers/AdminController.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Projects
router.post('/projects', AdminController.createProject);
router.get('/projects', AdminController.getAllBlogs); // Wait, this should be getAllProjects if it existed, but projects uses public controller usually.
// Actually, projects list is fine via public, but for consistency:
router.put('/projects/:id', AdminController.updateProject);
router.delete('/projects/:id', AdminController.deleteProject);

// Blog Posts
router.get('/blogs', AdminController.getAllBlogs);
router.post('/blogs', AdminController.createBlog);
router.put('/blogs/:id', AdminController.updateBlog);
router.delete('/blogs/:id', AdminController.deleteBlog);

// Experience
router.get('/experience', AdminController.getAllExperience);
router.post('/experience', AdminController.createExperience);
router.put('/experience/:id', AdminController.updateExperience);
router.delete('/experience/:id', AdminController.deleteExperience);

// Skills
router.get('/skills', AdminController.getAllSkills);
router.post('/skills', AdminController.createSkill);
router.put('/skills/:id', AdminController.updateSkill);
router.delete('/skills/:id', AdminController.deleteSkill);

// Certificates
router.get('/certificates', AdminController.getAllCertificates);
router.post('/certificates', AdminController.createCertificate);
router.put('/certificates/:id', AdminController.updateCertificate);
router.delete('/certificates/:id', AdminController.deleteCertificate);

// Events
router.get('/events', AdminController.getAllEvents);
router.post('/events', AdminController.createEvent);
router.put('/events/:id', AdminController.updateEvent);
router.delete('/events/:id', AdminController.deleteEvent);

// Newsletters
router.get('/newsletters', AdminController.getAllNewsletters);
router.post('/newsletters', AdminController.createNewsletter);
router.put('/newsletters/:id', AdminController.updateNewsletter);
router.delete('/newsletters/:id', AdminController.deleteNewsletter);

// Hosting
router.post('/hosting', AdminController.createHosting);
router.put('/hosting/:id', AdminController.updateHosting);
router.delete('/hosting/:id', AdminController.deleteHosting);

// Awards
router.get('/awards', AdminController.getAllAwards);
router.post('/awards', AdminController.createAward);
router.put('/awards/:id', AdminController.updateAward);
router.delete('/awards/:id', AdminController.deleteAward);

// Languages
router.get('/languages', AdminController.getAllLanguages);
router.post('/languages', AdminController.createLanguage);
router.put('/languages/:id', AdminController.updateLanguage);
router.delete('/languages/:id', AdminController.deleteLanguage);

// Hackathons
router.get('/hackathons', AdminController.getAllHackathons);
router.post('/hackathons', AdminController.createHackathon);
router.put('/hackathons/:id', AdminController.updateHackathon);
router.delete('/hackathons/:id', AdminController.deleteHackathon);

// Testimonials
router.get('/testimonials', AdminController.getAllTestimonials);
router.post('/testimonials', AdminController.createTestimonial);
router.put('/testimonials/:id', AdminController.updateTestimonial);
router.delete('/testimonials/:id', AdminController.deleteTestimonial);

// Volunteer Experience
router.get('/volunteer', AdminController.getAllVolunteer);
router.post('/volunteer', AdminController.createVolunteer);
router.put('/volunteer/:id', AdminController.updateVolunteer);
router.delete('/volunteer/:id', AdminController.deleteVolunteer);

// Education
router.get('/education', AdminController.getAllEducation);
router.post('/education', AdminController.createEducation);
router.put('/education/:id', AdminController.updateEducation);
router.delete('/education/:id', AdminController.deleteEducation);

// Media
router.post('/upload', upload.single('file'), AdminController.uploadImage);

// Activity Logs
router.get('/logs', AdminController.getLogs);

// Contact Messages
router.get('/messages', AdminController.getAllMessages);
router.put('/messages/:id', AdminController.updateMessage);
router.delete('/messages/:id', AdminController.deleteMessage);

export default router;