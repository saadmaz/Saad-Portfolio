import { apiClient } from './api-client';
import { Experience, SkillSet, Certificate, ApiResponse } from '../../types';
import { workExperiences as staticExperiences } from '../../data/static/workExperience';
import { skillSets as staticSkills } from '../../data/static/skills';
import { certificates as staticCertificates } from '../../data/static/certificates';

export class CommonService {
  static async getWorkExperience(): Promise<Experience[]> {
    try {
      const response = await apiClient.get<ApiResponse<Experience[]>>('/work-experience') as unknown as ApiResponse<Experience[]>;
      return response.data;
    } catch (error) {
      return staticExperiences;
    }
  }

  static async getSkills(): Promise<SkillSet[]> {
    try {
      const response = await apiClient.get<ApiResponse<SkillSet[]>>('/skills') as unknown as ApiResponse<SkillSet[]>;
      return response.data;
    } catch (error) {
      return staticSkills;
    }
  }

  static async getCertificates(): Promise<Certificate[]> {
    try {
      const response = await apiClient.get<ApiResponse<Certificate[]>>('/certificates') as unknown as ApiResponse<Certificate[]>;
      return response.data;
    } catch (error) {
      return staticCertificates;
    }
  }

  static async submitContact(data: { name: string; email: string; subject?: string; message: string }): Promise<void> {
    await apiClient.post('/contact', data);
  }
}
