import { apiClient } from '../shared/services/api-client';
import { BlogPost, ApiResponse } from '../types';

export class BlogService {
  static async getAll(): Promise<BlogPost[]> {
    try {
      const response = await apiClient.get<ApiResponse<BlogPost[]>>('/admin/blogs') as unknown as ApiResponse<BlogPost[]>;
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, returning empty blog posts');
      return [];
    }
  }

  static async getPublished(): Promise<BlogPost[]> {
    try {
      const response = await apiClient.get<ApiResponse<BlogPost[]>>('/blog-posts') as unknown as ApiResponse<BlogPost[]>;
      return response.data;
    } catch (error) {
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

  static async getById(id: string): Promise<BlogPost | null> {
    try {
      const response = await apiClient.get<ApiResponse<BlogPost>>(`/blog-posts/id/${id}`) as unknown as ApiResponse<BlogPost>;
      return response.data;
    } catch (error) {
      console.error(`Error fetching blog by id ${id}:`, error);
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

  static async create(post: Partial<BlogPost>): Promise<BlogPost> {
    const response = await apiClient.post<ApiResponse<BlogPost>>('/admin/blogs', post) as unknown as ApiResponse<BlogPost>;
    return response.data;
  }

  static async update(id: string | number, post: Partial<BlogPost>): Promise<BlogPost> {
    const response = await apiClient.put<ApiResponse<BlogPost>>(`/admin/blogs/${id}`, post) as unknown as ApiResponse<BlogPost>;
    return response.data;
  }

  static async delete(id: string | number): Promise<void> {
    await apiClient.delete(`/admin/blogs/${id}`);
  }
}
