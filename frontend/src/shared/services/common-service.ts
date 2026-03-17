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

  static async submitContact(data: { name: string; email: string; subject?: string; message: string }): Promise<void> {
    await apiClient.post('/contact', data);
  }
}
