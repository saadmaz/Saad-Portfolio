import { BaseRepository } from './BaseRepository.js';
import { 
  WorkExperience, 
  Skill, 
  Certificate, 
  ContactMessage, 
  Event, 
  Newsletter, 
  Hosting,
  Award,
  Language,
  Hackathon,
  Testimonial,
  VolunteerExperience,
  Education,
  ActivityLog
} from '../types/index.js';

export class ExperienceRepository extends BaseRepository<WorkExperience> {
  constructor() {
    super('work_experience');
  }

  async getOrdered(): Promise<WorkExperience[]> {
    const cacheKey = `${this.collectionName}_ordered`;
    const cached = this.getCache<WorkExperience[]>(cacheKey);
    if (cached) return cached;

    const snapshot = await this.collection.orderBy('start_date', 'desc').get();
    const result = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as unknown as WorkExperience));
    
    this.setCache(cacheKey, result);
    return result;
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
    const cacheKey = `${this.collectionName}_featured`;
    const cached = this.getCache<Certificate[]>(cacheKey);
    if (cached) return cached;

    const snapshot = await this.collection.where('is_featured', '==', true).get();
    const result = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as unknown as Certificate));
    
    this.setCache(cacheKey, result);
    return result;
  }
}

export class ContactRepository extends BaseRepository<ContactMessage> {
  constructor() {
    super('contact_messages');
  }

  async getRecent(): Promise<ContactMessage[]> {
    const cacheKey = `${this.collectionName}_recent`;
    const cached = this.getCache<ContactMessage[]>(cacheKey);
    if (cached) return cached;

    const snapshot = await this.collection.orderBy('created_at', 'desc').get();
    const result = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as unknown as ContactMessage));
    
    this.setCache(cacheKey, result);
    return result;
  }
}

export class EventRepository extends BaseRepository<Event> {
  constructor() {
    super('events');
  }
}

export class NewsletterRepository extends BaseRepository<Newsletter> {
  constructor() {
    super('newsletters');
  }

  async getByType(type: 'founder' | 'cse'): Promise<Newsletter[]> {
    const cacheKey = `${this.collectionName}_type_${type}`;
    const cached = this.getCache<Newsletter[]>(cacheKey);
    if (cached) return cached;

    const snapshot = await this.collection.where('type', '==', type).get();
    const result = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as unknown as Newsletter));
    
    this.setCache(cacheKey, result);
    return result;
  }
}

export class HostingRepository extends BaseRepository<Hosting> {
  constructor() {
    super('hosting');
  }

  async getActive(): Promise<Hosting[]> {
    const cacheKey = `${this.collectionName}_active`;
    const cached = this.getCache<Hosting[]>(cacheKey);
    if (cached) return cached;

    const snapshot = await this.collection.where('status', '==', 'active').get();
    const result = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as unknown as Hosting));
    
    this.setCache(cacheKey, result);
    return result;
  }
}

export class AwardRepository extends BaseRepository<Award> {
  constructor() {
    super('awards');
  }
}

export class LanguageRepository extends BaseRepository<Language> {
  constructor() {
    super('languages');
  }
}

export class HackathonRepository extends BaseRepository<Hackathon> {
  constructor() {
    super('hackathons');
  }
}

export class TestimonialRepository extends BaseRepository<Testimonial> {
  constructor() {
    super('testimonials');
  }
}

export class VolunteerRepository extends BaseRepository<VolunteerExperience> {
  constructor() {
    super('volunteer_experience');
  }
}

export class EducationRepository extends BaseRepository<Education> {
  constructor() {
    super('education');
  }
}

export class ActivityLogRepository extends BaseRepository<ActivityLog> {
  constructor() {
    super('activity_logs');
  }

  async getRecent(limit: number = 50): Promise<ActivityLog[]> {
    const snapshot = await this.collection.orderBy('timestamp', 'desc').limit(limit).get();
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      timestamp: doc.data().timestamp?.toDate()
    } as unknown as ActivityLog));
  }
}

export const experienceRepository = new ExperienceRepository();
export const skillRepository = new SkillRepository();
export const certificateRepository = new CertificateRepository();
export const contactRepository = new ContactRepository();
export const eventRepository = new EventRepository();
export const newsletterRepository = new NewsletterRepository();
export const hostingRepository = new HostingRepository();
export const awardRepository = new AwardRepository();
export const languageRepository = new LanguageRepository();
export const hackathonRepository = new HackathonRepository();
export const testimonialRepository = new TestimonialRepository();
export const volunteerRepository = new VolunteerRepository();
export const educationRepository = new EducationRepository();
export const activityLogRepository = new ActivityLogRepository();
