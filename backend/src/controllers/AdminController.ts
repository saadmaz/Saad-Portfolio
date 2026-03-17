import { Request, Response } from 'express';
import { 
  projectRepository,
  experienceRepository,
  skillRepository,
  certificateRepository,
  eventRepository,
  newsletterRepository,
  hostingRepository,
  blogRepository
} from '../models/index.js';

/**
 * Generic handler for creating data in any collection
 */
export const createItem = (repository: any) => async (req: Request, res: Response) => {
  try {
    const newItem = await repository.create(req.body);
    res.status(201).json({ success: true, data: newItem });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Generic handler for updating data in any collection
 */
export const updateItem = (repository: any) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await repository.update(id, req.body);
    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Generic handler for deleting data from any collection
 */
export const deleteItem = (repository: any) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await repository.delete(id);
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Specialized Admin Controllers for entities that might need extra logic
export const createProject = createItem(projectRepository);
export const updateProject = updateItem(projectRepository);
export const deleteProject = deleteItem(projectRepository);

export const createExperience = createItem(experienceRepository);
export const updateExperience = updateItem(experienceRepository);
export const deleteExperience = deleteItem(experienceRepository);

export const createSkill = createItem(skillRepository);
export const updateSkill = updateItem(skillRepository);
export const deleteSkill = deleteItem(skillRepository);

export const createCertificate = createItem(certificateRepository);
export const updateCertificate = updateItem(certificateRepository);
export const deleteCertificate = deleteItem(certificateRepository);

export const createEvent = createItem(eventRepository);
export const updateEvent = updateItem(eventRepository);
export const deleteEvent = deleteItem(eventRepository);

export const createNewsletter = createItem(newsletterRepository);
export const updateNewsletter = updateItem(newsletterRepository);
export const deleteNewsletter = deleteItem(newsletterRepository);

export const createHosting = createItem(hostingRepository);
export const updateHosting = updateItem(hostingRepository);
export const deleteHosting = deleteItem(hostingRepository);

export const createBlog = createItem(blogRepository);
export const updateBlog = updateItem(blogRepository);
export const deleteBlog = deleteItem(blogRepository);
