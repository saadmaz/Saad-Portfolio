import { getDB } from '../utils/database.js';
import { Project } from '../types/index.js';

export class ProjectModel {
  private static collection = 'projects';

  static async findAll(): Promise<Project[]> {
    const db = getDB();
    const snapshot = await db.collection(this.collection)
      .orderBy('order_index', 'asc')
      .orderBy('created_at', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    } as Project));
  }

  static async findBySlug(slug: string): Promise<Project | null> {
    const db = getDB();
    const snapshot = await db.collection(this.collection)
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: parseInt(doc.id),
      ...doc.data()
    } as Project;
  }

  static async findFeatured(): Promise<Project[]> {
    const db = getDB();
    const snapshot = await db.collection(this.collection)
      .where('featured', '==', true)
      .orderBy('order_index', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    } as Project));
  }

  static async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const db = getDB();
    const now = new Date();

    const projectData = {
      ...project,
      created_at: now,
      updated_at: now
    };

    const docRef = await db.collection(this.collection).add(projectData);

    return {
      id: parseInt(docRef.id),
      ...projectData
    };
  }

  static async update(id: string, updates: Partial<Project>): Promise<void> {
    const db = getDB();
    await db.collection(this.collection).doc(id).update({
      ...updates,
      updated_at: new Date()
    });
  }

  static async delete(id: string): Promise<void> {
    const db = getDB();
    await db.collection(this.collection).doc(id).delete();
  }
}