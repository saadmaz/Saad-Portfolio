import { apiClient } from './api-client';
import { Project, ApiResponse } from '../types';
import { projects as staticProjects } from '../data/static/projects';

export class ProjectService {
  static async getAll(): Promise<Project[]> {
    try {
      const response = await apiClient.get<any, ApiResponse<Project[]>>('/projects');
      return response.data;
    } catch (error) {
      console.warn('Falling back to static projects data');
      return staticProjects;
    }
  }

  static async getFeatured(): Promise<Project[]> {
    try {
      const response = await apiClient.get<any, ApiResponse<Project[]>>('/projects/featured');
      return response.data;
    } catch (error) {
      console.warn('Falling back to static featured projects');
      return staticProjects.slice(0, 3); // Fallback logic
    }
  }

  static async getBySlug(slug: string): Promise<Project | null> {
    try {
      const response = await apiClient.get<any, ApiResponse<Project>>(`/projects/${slug}`);
      return response.data;
    } catch (error) {
      return staticProjects.find(p => p.slug === slug) || null;
    }
  }
}
