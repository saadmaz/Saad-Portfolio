import { Request, Response } from 'express';
import { getStorage } from 'firebase-admin/storage';
import { 
  projectRepository,
  experienceRepository,
  skillRepository,
  certificateRepository,
  eventRepository,
  newsletterRepository,
  hostingRepository,
  blogRepository,
  awardRepository,
  languageRepository,
  hackathonRepository,
  testimonialRepository,
  volunteerRepository,
  educationRepository,
  activityLogRepository
} from '../models/index.js';

/**
 * Helper to log admin activity
 */
const logActivity = async (req: Request, action: 'CREATE' | 'UPDATE' | 'DELETE', entityType: string, entityId?: string, details: string = '') => {
  try {
    const user = (req as any).user;
    if (!user) return;

    await activityLogRepository.create({
      admin_id: user.uid,
      admin_email: user.email || 'unknown',
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      timestamp: new Date()
    } as any);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

/**
 * Generic handler for creating data in any collection
 */
export const createItem = (repository: any, entityType: string) => async (req: Request, res: Response) => {
  try {
    const newItem = await repository.create(req.body);
    await logActivity(req, 'CREATE', entityType, newItem.id, `Created new ${entityType}`);
    res.status(201).json({ success: true, data: newItem });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Generic handler for updating data in any collection
 */
export const updateItem = (repository: any, entityType: string) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await repository.update(id, req.body);
    await logActivity(req, 'UPDATE', entityType, id, `Updated ${entityType}`);
    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Generic handler for deleting data from any collection
 */
export const deleteItem = (repository: any, entityType: string) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await repository.delete(id);
    await logActivity(req, 'DELETE', entityType, id, `Deleted ${entityType}`);
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Specialized Admin Controllers for entities that might need extra logic
export const createProject = createItem(projectRepository, 'Project');
export const updateProject = updateItem(projectRepository, 'Project');
export const deleteProject = deleteItem(projectRepository, 'Project');

export const createExperience = createItem(experienceRepository, 'Experience');
export const updateExperience = updateItem(experienceRepository, 'Experience');
export const deleteExperience = deleteItem(experienceRepository, 'Experience');

export const createSkill = createItem(skillRepository, 'Skill');
export const updateSkill = updateItem(skillRepository, 'Skill');
export const deleteSkill = deleteItem(skillRepository, 'Skill');

export const createCertificate = createItem(certificateRepository, 'Certificate');
export const updateCertificate = updateItem(certificateRepository, 'Certificate');
export const deleteCertificate = deleteItem(certificateRepository, 'Certificate');

export const createEvent = createItem(eventRepository, 'Event');
export const updateEvent = updateItem(eventRepository, 'Event');
export const deleteEvent = deleteItem(eventRepository, 'Event');

export const createNewsletter = createItem(newsletterRepository, 'Newsletter');
export const updateNewsletter = updateItem(newsletterRepository, 'Newsletter');
export const deleteNewsletter = deleteItem(newsletterRepository, 'Newsletter');

export const createHosting = createItem(hostingRepository, 'Hosting');
export const updateHosting = updateItem(hostingRepository, 'Hosting');
export const deleteHosting = deleteItem(hostingRepository, 'Hosting');

export const createBlog = createItem(blogRepository, 'Blog');
export const updateBlog = updateItem(blogRepository, 'Blog');
export const deleteBlog = deleteItem(blogRepository, 'Blog');

export const createAward = createItem(awardRepository, 'Award');
export const updateAward = updateItem(awardRepository, 'Award');
export const deleteAward = deleteItem(awardRepository, 'Award');
export const getAllAwards = async (req: Request, res: Response) => {
  try {
    const awards = await awardRepository.getAll();
    res.json({ success: true, data: awards });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createLanguage = createItem(languageRepository, 'Language');
export const updateLanguage = updateItem(languageRepository, 'Language');
export const deleteLanguage = deleteItem(languageRepository, 'Language');
// ... public getAll handled in common controller if needed, but redundant here

export const createHackathon = createItem(hackathonRepository, 'Hackathon');
export const updateHackathon = updateItem(hackathonRepository, 'Hackathon');
export const deleteHackathon = deleteItem(hackathonRepository, 'Hackathon');

export const createTestimonial = createItem(testimonialRepository, 'Testimonial');
export const updateTestimonial = updateItem(testimonialRepository, 'Testimonial');
export const deleteTestimonial = deleteItem(testimonialRepository, 'Testimonial');

export const createVolunteer = createItem(volunteerRepository, 'Volunteer');
export const updateVolunteer = updateItem(volunteerRepository, 'Volunteer');
export const deleteVolunteer = deleteItem(volunteerRepository, 'Volunteer');

export const createEducation = createItem(educationRepository, 'Education');
export const updateEducation = updateItem(educationRepository, 'Education');
export const deleteEducation = deleteItem(educationRepository, 'Education');
export const getAllEducation = async (req: Request, res: Response) => {
  try {
    const education = await educationRepository.getAll();
    res.json({ success: true, data: education });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await blogRepository.getAll();
    res.json({ success: true, data: blogs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Handle image uploads to Firebase Storage
 */
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const bucket = getStorage().bucket();
    const blob = bucket.file(`uploads/${Date.now()}-${req.file.originalname}`);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on('error', (err) => {
      res.status(500).json({ success: false, error: err.message });
    });

    blobStream.on('finish', async () => {
      // Make the file public if needed, or get a signed URL
      // For simplicity, we'll use the public URL format if the bucket is public
      // Or better, get the download URL
      await blob.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      
      res.json({ 
        success: true, 
        data: { 
          url: publicUrl,
          name: blob.name 
        } 
      });
    });

    blobStream.end(req.file.buffer);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const logs = await activityLogRepository.getRecent();
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
