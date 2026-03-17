import { apiClient } from '../shared/services/api-client';
import { Project, ApiResponse } from '../types';

export class ProjectService {
  static async getAll(): Promise<Project[]> {
    try {
      const response = await apiClient.get<ApiResponse<Project[]>>('/projects') as unknown as ApiResponse<Project[]>;
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  static async getFeatured(): Promise<Project[]> {
    try {
      const response = await apiClient.get<ApiResponse<Project[]>>('/projects/featured') as unknown as ApiResponse<Project[]>;
      return response.data;
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      return [];
    }
  }

  static async getBySlug(slug: string): Promise<Project | null> {
    try {
      const response = await apiClient.get<ApiResponse<Project>>(`/projects/${slug}`) as unknown as ApiResponse<Project>;
      return response.data;
    } catch (error) {
      console.error(`Error fetching project by slug ${slug}:`, error);
      return null;
    }
  }
}
