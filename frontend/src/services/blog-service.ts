import { apiClient } from '../shared/services/api-client';
import { BlogPost, ApiResponse } from '../types';

export class BlogService {
  static async getAll(): Promise<BlogPost[]> {
    try {
      const response = await apiClient.get<any, ApiResponse<BlogPost[]>>('/blog-posts');
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, returning empty blog posts');
      return [];
    }
  }

  static async getLatest(): Promise<BlogPost | null> {
    try {
      const response = await apiClient.get<any, ApiResponse<BlogPost>>('/blog-posts/latest');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  static async getBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const response = await apiClient.get<any, ApiResponse<BlogPost>>(`/blog-posts/${slug}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
}
