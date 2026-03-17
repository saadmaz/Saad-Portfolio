import { BaseRepository } from './BaseRepository.js';
import { WorkExperience, Skill, Certificate, ContactMessage } from '../types/index.js';

export class ExperienceRepository extends BaseRepository<WorkExperience> {
  constructor() {
    super('work_experience');
  }

  async getOrdered(): Promise<WorkExperience[]> {
    const snapshot = await this.collection.orderBy('start_date', 'desc').get();
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as unknown as WorkExperience));
  }
}

export class SkillRepository extends BaseRepository<Skill> {
  constructor() {
    super('skills');
  }
}

export class CertificateRepository extends BaseRepository<Certificate> {
  constructor() {
    super('certificates');
  }
  
  async getFeatured(): Promise<Certificate[]> {
    const snapshot = await this.collection.where('is_featured', '==', true).get();
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as unknown as Certificate));
  }
}

export class ContactRepository extends BaseRepository<ContactMessage> {
  constructor() {
    super('contact_messages');
  }

  async getRecent(): Promise<ContactMessage[]> {
    const snapshot = await this.collection.orderBy('created_at', 'desc').get();
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as unknown as ContactMessage));
  }
}

export const experienceRepository = new ExperienceRepository();
export const skillRepository = new SkillRepository();
export const certificateRepository = new CertificateRepository();
export const contactRepository = new ContactRepository();
