import { apiClient } from '../shared/services/api-client';
import { Project, ApiResponse } from '../types';
import { projects as staticProjects } from '../data/static/projects';

export class ProjectService {
  static async getAll(): Promise<Project[]> {
    try {
      const response = await apiClient.get<ApiResponse<Project[]>>('/projects') as unknown as ApiResponse<Project[]>;
      return response.data;
    } catch (error) {
      console.warn('Falling back to static projects data');
      return staticProjects;
    }
  }

  static async getFeatured(): Promise<Project[]> {
    try {
      const response = await apiClient.get<ApiResponse<Project[]>>('/projects/featured') as unknown as ApiResponse<Project[]>;
      return response.data;
    } catch (error) {
      console.warn('Falling back to static featured projects');
      return staticProjects.slice(0, 3); // Fallback logic
    }
  }

  static async getBySlug(slug: string): Promise<Project | null> {
    try {
      const response = await apiClient.get<ApiResponse<Project>>(`/projects/${slug}`) as unknown as ApiResponse<Project>;
      return response.data;
    } catch (error) {
      return staticProjects.find(p => p.slug === slug) || null;
    }
  }
}
