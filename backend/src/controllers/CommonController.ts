import { Request, Response } from 'express';
import { 
  experienceRepository, 
  skillRepository, 
  certificateRepository, 
  contactRepository 
} from '../models/index.js';
import { ContactMessageSchema } from '../schemas/index.js';

export const getWorkExperience = async (req: Request, res: Response) => {
  try {
    const experience = await experienceRepository.getOrdered();
    res.json({ success: true, data: experience });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getSkills = async (req: Request, res: Response) => {
  try {
    const skills = await skillRepository.getAll();
    res.json({ success: true, data: skills });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getCertificates = async (req: Request, res: Response) => {
  try {
    const certificates = await certificateRepository.getAll();
    res.json({ success: true, data: certificates });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    // Note: validation happens in middleware
    const contactData = req.body;
    const newMessage = await contactRepository.create({
      ...contactData,
      sent: true,
      user_agent: req.headers['user-agent'],
      ip_address: req.ip
    });
    
    // TODO: Integrate with SendGrid if needed
    
    res.status(201).json({ 
      success: true, 
      data: newMessage, 
      message: 'Contact form submitted successfully' 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};
