import { apiClient } from './api-client';
import { 
  Experience, 
  SkillSet, 
  Certificate, 
  ApiResponse, 
  Award, 
  Language, 
  Hackathon, 
  Testimonial, 
  VolunteerExperience, 
  Education, 
  ActivityLog 
} from '../../types';

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

  // Awards CRUD
  static async getAwards(): Promise<Award[]> {
    const response = await apiClient.get<ApiResponse<Award[]>>('/awards') as unknown as ApiResponse<Award[]>;
    return response.data;
  }
  static async createAward(data: Partial<Award>): Promise<Award> {
    const response = await apiClient.post<ApiResponse<Award>>('/admin/awards', data) as unknown as ApiResponse<Award>;
    return response.data;
  }
  static async updateAward(id: string, data: Partial<Award>): Promise<Award> {
    const response = await apiClient.put<ApiResponse<Award>>(`/admin/awards/${id}`, data) as unknown as ApiResponse<Award>;
    return response.data;
  }
  static async deleteAward(id: string): Promise<void> {
    await apiClient.delete(`/admin/awards/${id}`);
  }

  // Languages CRUD
  static async getLanguages(): Promise<Language[]> {
    const response = await apiClient.get<ApiResponse<Language[]>>('/languages') as unknown as ApiResponse<Language[]>;
    return response.data;
  }
  static async createLanguage(data: Partial<Language>): Promise<Language> {
    const response = await apiClient.post<ApiResponse<Language>>('/admin/languages', data) as unknown as ApiResponse<Language>;
    return response.data;
  }
  static async updateLanguage(id: string, data: Partial<Language>): Promise<Language> {
    const response = await apiClient.put<ApiResponse<Language>>(`/admin/languages/${id}`, data) as unknown as ApiResponse<Language>;
    return response.data;
  }
  static async deleteLanguage(id: string): Promise<void> {
    await apiClient.delete(`/admin/languages/${id}`);
  }

  // Hackathons CRUD
  static async getHackathons(): Promise<Hackathon[]> {
    const response = await apiClient.get<ApiResponse<Hackathon[]>>('/hackathons') as unknown as ApiResponse<Hackathon[]>;
    return response.data;
  }
  static async createHackathon(data: Partial<Hackathon>): Promise<Hackathon> {
    const response = await apiClient.post<ApiResponse<Hackathon>>('/admin/hackathons', data) as unknown as ApiResponse<Hackathon>;
    return response.data;
  }
  static async updateHackathon(id: string, data: Partial<Hackathon>): Promise<Hackathon> {
    const response = await apiClient.put<ApiResponse<Hackathon>>(`/admin/hackathons/${id}`, data) as unknown as ApiResponse<Hackathon>;
    return response.data;
  }
  static async deleteHackathon(id: string): Promise<void> {
    await apiClient.delete(`/admin/hackathons/${id}`);
  }

  // Testimonials CRUD
  static async getTestimonials(): Promise<Testimonial[]> {
    const response = await apiClient.get<ApiResponse<Testimonial[]>>('/testimonials') as unknown as ApiResponse<Testimonial[]>;
    return response.data;
  }
  static async createTestimonial(data: Partial<Testimonial>): Promise<Testimonial> {
    const response = await apiClient.post<ApiResponse<Testimonial>>('/admin/testimonials', data) as unknown as ApiResponse<Testimonial>;
    return response.data;
  }
  static async updateTestimonial(id: string, data: Partial<Testimonial>): Promise<Testimonial> {
    const response = await apiClient.put<ApiResponse<Testimonial>>(`/admin/testimonials/${id}`, data) as unknown as ApiResponse<Testimonial>;
    return response.data;
  }
  static async deleteTestimonial(id: string): Promise<void> {
    await apiClient.delete(`/admin/testimonials/${id}`);
  }

  // Volunteer Experience CRUD
  static async getVolunteerExperience(): Promise<VolunteerExperience[]> {
    const response = await apiClient.get<ApiResponse<VolunteerExperience[]>>('/volunteer') as unknown as ApiResponse<VolunteerExperience[]>;
    return response.data;
  }
  static async createVolunteerExperience(data: Partial<VolunteerExperience>): Promise<VolunteerExperience> {
    const response = await apiClient.post<ApiResponse<VolunteerExperience>>('/admin/volunteer', data) as unknown as ApiResponse<VolunteerExperience>;
    return response.data;
  }
  static async updateVolunteerExperience(id: string, data: Partial<VolunteerExperience>): Promise<VolunteerExperience> {
    const response = await apiClient.put<ApiResponse<VolunteerExperience>>(`/admin/volunteer/${id}`, data) as unknown as ApiResponse<VolunteerExperience>;
    return response.data;
  }
  static async deleteVolunteerExperience(id: string): Promise<void> {
    await apiClient.delete(`/admin/volunteer/${id}`);
  }

  // Education CRUD
  static async getEducation(): Promise<Education[]> {
    const response = await apiClient.get<ApiResponse<Education[]>>('/education') as unknown as ApiResponse<Education[]>;
    return response.data;
  }
  static async createEducation(data: Partial<Education>): Promise<Education> {
    const response = await apiClient.post<ApiResponse<Education>>('/admin/education', data) as unknown as ApiResponse<Education>;
    return response.data;
  }
  static async updateEducation(id: string, data: Partial<Education>): Promise<Education> {
    const response = await apiClient.put<ApiResponse<Education>>(`/admin/education/${id}`, data) as unknown as ApiResponse<Education>;
    return response.data;
  }
  static async deleteEducation(id: string): Promise<void> {
    await apiClient.delete(`/admin/education/${id}`);
  }

  // Activity Logs
  static async getActivityLogs(): Promise<ActivityLog[]> {
    const response = await apiClient.get<ApiResponse<ActivityLog[]>>('/admin/logs') as unknown as ApiResponse<ActivityLog[]>;
    return response.data;
  }

  static async submitContact(data: { name: string; email: string; subject?: string; message: string }): Promise<void> {
    await apiClient.post('/contact', data);
  }
}
