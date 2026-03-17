import { apiClient } from './api-client';
import { Experience, SkillSet, Certificate, ApiResponse } from '../types';
import { workExperiences as staticExperiences } from '../data/static/workExperience';
import { skillSets as staticSkills } from '../data/static/skills';
import { certificates as staticCertificates } from '../data/static/certificates';

export class CommonService {
  static async getWorkExperience(): Promise<Experience[]> {
    try {
      const response = await apiClient.get<any, ApiResponse<Experience[]>>('/work-experience');
      return response.data;
    } catch (error) {
      return staticExperiences;
    }
  }

  static async getSkills(): Promise<SkillSet[]> {
    try {
      const response = await apiClient.get<any, ApiResponse<SkillSet[]>>('/skills');
      return response.data;
    } catch (error) {
      return staticSkills;
    }
  }

  static async getCertificates(): Promise<Certificate[]> {
    try {
      const response = await apiClient.get<any, ApiResponse<Certificate[]>>('/certificates');
      return response.data;
    } catch (error) {
      return staticCertificates;
    }
  }

  static async submitContact(data: { name: string; email: string; subject?: string; message: string }): Promise<void> {
    await apiClient.post('/contact', data);
  }
}
