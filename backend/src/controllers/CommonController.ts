import { Request, Response } from 'express';
import { 
  experienceRepository, 
  skillRepository, 
  certificateRepository, 
  contactRepository,
  eventRepository,
  newsletterRepository,
  hostingRepository,
  awardRepository,
  languageRepository,
  hackathonRepository,
  testimonialRepository,
  volunteerRepository,
  educationRepository
} from '../models/index.js';
import { ContactMessageSchema } from '../schemas/index.js';
import { sendContactEmail } from '../utils/email.js';

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
    // Validation happens in middleware via ContactMessageSchema
    const { name, email, subject, message } = req.body;

    // 1. Save to Firestore
    const newMessage = await contactRepository.create({
      name,
      email,
      subject,
      message,
      sent: false,
      user_agent: req.headers['user-agent'],
      ip_address: req.ip
    });

    // 2. Send email notification via SendGrid (non-blocking on failure)
    try {
      await sendContactEmail({ name, email, subject, message });
      // Mark as sent in Firestore only if email succeeded
      await contactRepository.update(newMessage.id as string, { sent: true });
    } catch (emailError: unknown) {
      const emailMsg = emailError instanceof Error ? emailError.message : 'Unknown email error';
      console.error('⚠️  Email notification failed (message still saved):', emailMsg);
    }

    res.status(201).json({ 
      success: true, 
      data: { id: newMessage.id }, 
      message: "Message sent successfully! I'll get back to you soon." 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await eventRepository.getAll();
    res.json({ success: true, data: events });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getNewsletters = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    let newsletters;
    
    if (type === 'founder' || type === 'cse') {
      newsletters = await newsletterRepository.getByType(type);
    } else {
      newsletters = await newsletterRepository.getAll();
    }
    
    res.json({ success: true, data: newsletters });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getHosting = async (req: Request, res: Response) => {
  try {
    const { active } = req.query;
    let hosting;
    
    if (active === 'true') {
      hosting = await hostingRepository.getActive();
    } else {
      hosting = await hostingRepository.getAll();
    }
    
    res.json({ success: true, data: hosting });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getAwards = async (req: Request, res: Response) => {
  try {
    const awards = await awardRepository.getAll();
    res.json({ success: true, data: awards });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getLanguages = async (req: Request, res: Response) => {
  try {
    const languages = await languageRepository.getAll();
    res.json({ success: true, data: languages });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getHackathons = async (req: Request, res: Response) => {
  try {
    const hackathons = await hackathonRepository.getAll();
    res.json({ success: true, data: hackathons });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await testimonialRepository.getAll();
    res.json({ success: true, data: testimonials });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getVolunteerExperience = async (req: Request, res: Response) => {
  try {
    const volunteer = await volunteerRepository.getAll();
    res.json({ success: true, data: volunteer });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getEducation = async (req: Request, res: Response) => {
  try {
    const education = await educationRepository.getAll();
    res.json({ success: true, data: education });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};
