import { BaseRepository } from './BaseRepository.js';
import { Project } from '../types/index.js';

export class ProjectRepository extends BaseRepository<Project> {
  constructor() {
    super('projects');
  }

  /**
   * Get all featured projects.
   */
  async getFeatured(): Promise<Project[]> {
    const snapshot = await this.collection.where('featured', '==', true).orderBy('order_index', 'asc').get();
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as unknown as Project));
  }

  /**
   * Get a project by its slug.
   */
  async getBySlug(slug: string): Promise<Project | null> {
    const projects = await this.findByField('slug', '==', slug);
    return projects.length > 0 ? projects[0] : null;
  }
}

export const projectRepository = new ProjectRepository();
