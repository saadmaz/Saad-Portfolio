import { apiClient } from '../shared/services/api-client';
import { BlogPost, ApiResponse } from '../types';

export class BlogService {
  static async getAll(): Promise<BlogPost[]> {
    try {
      const response = await apiClient.get<ApiResponse<BlogPost[]>>('/blog-posts') as unknown as ApiResponse<BlogPost[]>;
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, returning empty blog posts');
      return [];
    }
  }

  static async getLatest(): Promise<BlogPost | null> {
    try {
      const response = await apiClient.get<ApiResponse<BlogPost>>('/blog-posts/latest') as unknown as ApiResponse<BlogPost>;
      return response.data;
    } catch (error) {
      return null;
    }
  }

  static async getBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const response = await apiClient.get<ApiResponse<BlogPost>>(`/blog-posts/${slug}`) as unknown as ApiResponse<BlogPost>;
      return response.data;
    } catch (error) {
      return null;
    }
  }
}
