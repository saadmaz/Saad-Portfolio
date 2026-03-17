import { Request, Response } from 'express';
import { blogRepository } from '../models/BlogRepository.js';

export const getBlogPosts = async (req: Request, res: Response) => {
  try {
    const posts = await blogRepository.getPublished();
    res.json({ success: true, data: posts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getBlogPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const post = await blogRepository.getBySlug(slug);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }
    res.json({ success: true, data: post });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getLatestBlogPost = async (req: Request, res: Response) => {
  try {
    const post = await blogRepository.getLatest();
    res.json({ success: true, data: post });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};
