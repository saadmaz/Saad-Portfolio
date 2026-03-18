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

  static async getById(id: string): Promise<Project | null> {
    try {
      const response = await apiClient.get<ApiResponse<Project>>(`/projects/id/${id}`) as unknown as ApiResponse<Project>;
      return response.data;
    } catch (error) {
      console.error(`Error fetching project by id ${id}:`, error);
      return null;
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

  static async create(project: Partial<Project>): Promise<Project> {
    const response = await apiClient.post<ApiResponse<Project>>('/admin/projects', project) as unknown as ApiResponse<Project>;
    return response.data;
  }

  static async update(id: string | number, project: Partial<Project>): Promise<Project> {
    const response = await apiClient.put<ApiResponse<Project>>(`/admin/projects/${id}`, project) as unknown as ApiResponse<Project>;
    return response.data;
  }

  static async delete(id: string | number): Promise<void> {
    await apiClient.delete(`/admin/projects/${id}`);
  }
}
