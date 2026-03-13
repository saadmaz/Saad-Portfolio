import { Request, Response, NextFunction } from 'express';
import { ProjectModel } from '../models/Project.js';
import { BlogPostModel } from '../models/BlogPost.js';
import { ContactMessageModel } from '../models/ContactMessage.js';
import { ApiResponse, CreateContactMessageRequest } from '../types/index.js';
import { sendContactEmail } from '../utils/email.js';
import { isDBConnected } from '../utils/database.js';

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isDBConnected()) {
      return res.json({
        success: true,
        data: [],
        message: 'Database not connected. Please configure DATABASE_URL.'
      });
    }

    const projects = await ProjectModel.findAll();
    const response: ApiResponse = {
      success: true,
      data: projects
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getProjectBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isDBConnected()) {
      return res.status(404).json({
        success: false,
        error: 'Database not connected'
      });
    }

    const { slug } = req.params;
    const project = await ProjectModel.findBySlug(slug);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: project
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isDBConnected()) {
      return res.json({
        success: true,
        data: [],
        message: 'Database not connected. Please configure DATABASE_URL.'
      });
    }

    const projects = await ProjectModel.findFeatured();
    const response: ApiResponse = {
      success: true,
      data: projects
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getBlogPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isDBConnected()) {
      return res.json({
        success: true,
        data: [],
        message: 'Database not connected. Please configure DATABASE_URL.'
      });
    }

    const blogPosts = await BlogPostModel.findAll();
    const response: ApiResponse = {
      success: true,
      data: blogPosts
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getBlogPostBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isDBConnected()) {
      return res.status(404).json({
        success: false,
        error: 'Database not connected'
      });
    }

    const { slug } = req.params;
    const blogPost = await BlogPostModel.findBySlug(slug);

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: blogPost
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const submitContactForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, subject, message }: CreateContactMessageRequest = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Save to database if connected
    let contactMessageId = null;
    if (isDBConnected()) {
      const contactMessage = await ContactMessageModel.create({
        name,
        email,
        subject,
        message,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });
      contactMessageId = contactMessage.id;

      // Send email
      try {
        await sendContactEmail({ name, email, subject, message });
        await ContactMessageModel.markAsSent(contactMessage.id);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.warn('⚠️  Contact form submitted but database not connected');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Message sent successfully! I\'ll get back to you soon.',
      data: contactMessageId ? { id: contactMessageId } : null
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};