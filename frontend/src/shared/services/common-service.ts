import { apiClient } from './api-client';
import { Experience, SkillSet, Certificate, ApiResponse } from '../../types';

export class CommonService {
  static async getWorkExperience(): Promise<Experience[]> {
    try {
      const response = await apiClient.get<ApiResponse<Experience[]>>('/work-experience') as unknown as ApiResponse<Experience[]>;
      return response.data;
    } catch (error) {
      console.error('Error fetching work experience:', error);
      return [];
    }
  }

  static async getSkills(): Promise<SkillSet[]> {
    try {
      const response = await apiClient.get<ApiResponse<SkillSet[]>>('/skills') as unknown as ApiResponse<SkillSet[]>;
      return response.data;
    } catch (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
  }

  static async getCertificates(): Promise<Certificate[]> {
    try {
      const response = await apiClient.get<ApiResponse<Certificate[]>>('/certificates') as unknown as ApiResponse<Certificate[]>;
      return response.data;
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  }

  // Experience CRUD
  static async createExperience(data: Partial<Experience>): Promise<Experience> {
    const response = await apiClient.post<ApiResponse<Experience>>('/admin/experience', data) as unknown as ApiResponse<Experience>;
    return response.data;
  }
  static async updateExperience(id: string | number, data: Partial<Experience>): Promise<Experience> {
    const response = await apiClient.put<ApiResponse<Experience>>(`/admin/experience/${id}`, data) as unknown as ApiResponse<Experience>;
    return response.data;
  }
  static async deleteExperience(id: string | number): Promise<void> {
    await apiClient.delete(`/admin/experience/${id}`);
  }

  // Skills CRUD
  static async updateSkills(data: SkillSet[]): Promise<SkillSet[]> {
    const response = await apiClient.post<ApiResponse<SkillSet[]>>('/admin/skills', { skillSets: data }) as unknown as ApiResponse<SkillSet[]>;
    return response.data;
  }

  // Certificates CRUD
  static async createCertificate(data: Partial<Certificate>): Promise<Certificate> {
    const response = await apiClient.post<ApiResponse<Certificate>>('/admin/certificates', data) as unknown as ApiResponse<Certificate>;
    return response.data;
  }
  static async updateCertificate(id: string | number, data: Partial<Certificate>): Promise<Certificate> {
    const response = await apiClient.put<ApiResponse<Certificate>>(`/admin/certificates/${id}`, data) as unknown as ApiResponse<Certificate>;
    return response.data;
  }
  static async deleteCertificate(id: string | number): Promise<void> {
    await apiClient.delete(`/admin/certificates/${id}`);
  }

  static async submitContact(data: { name: string; email: string; subject?: string; message: string }): Promise<void> {
    await apiClient.post('/contact', data);
  }
}
