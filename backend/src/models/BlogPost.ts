import { getDB } from '../utils/database.js';
import { BlogPost } from '../types/index.js';

export class BlogPostModel {
  private static collection = 'blog_posts';

  static async findAll(): Promise<BlogPost[]> {
    const db = getDB();
    const snapshot = await db.collection(this.collection)
      .where('published', '==', true)
      .orderBy('date', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as BlogPost));
  }

  static async findBySlug(slug: string): Promise<BlogPost | null> {
    const db = getDB();
    const snapshot = await db.collection(this.collection)
      .where('slug', '==', slug)
      .where('published', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as BlogPost;
  }

  static async findLatest(): Promise<BlogPost[]> {
    const db = getDB();
    const snapshot = await db.collection(this.collection)
      .where('is_latest', '==', true)
      .where('published', '==', true)
      .orderBy('date', 'desc')
      .limit(5)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as BlogPost));
  }

  static async create(blogPost: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> {
    const db = getDB();
    const now = new Date();

    const blogData = {
      ...blogPost,
      created_at: now,
      updated_at: now
    };

    const docRef = await db.collection(this.collection).add(blogData);

    return {
      id: docRef.id,
      ...blogData
    };
  }

  static async update(id: string, updates: Partial<BlogPost>): Promise<void> {
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