import { BaseRepository } from './BaseRepository.js';
import { BlogPost } from '../types/index.js';

export class BlogRepository extends BaseRepository<BlogPost> {
  constructor() {
    super('blog_posts');
  }

  /**
   * Get all published blog posts.
   */
  async getPublished(): Promise<BlogPost[]> {
    const cacheKey = `${this.collectionName}_published`;
    const cached = this.getCache<BlogPost[]>(cacheKey);
    if (cached) return cached;

    const snapshot = await this.collection.where('published', '==', true).orderBy('date', 'desc').get();
    const result = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as unknown as BlogPost));
    
    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Get a blog post by its slug.
   */
  async getBySlug(slug: string): Promise<BlogPost | null> {
    const posts = await this.findByField('slug', '==', slug);
    return posts.length > 0 ? posts[0] : null;
  }

  /**
   * Get the latest published blog post.
   */
  async getLatest(): Promise<BlogPost | null> {
    const cacheKey = `${this.collectionName}_latest`;
    const cached = this.getCache<BlogPost>(cacheKey);
    if (cached) return cached;

    const snapshot = await this.collection
      .where('published', '==', true)
      .where('is_latest', '==', true)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    const result = {
      ...snapshot.docs[0].data(),
      id: snapshot.docs[0].id
    } as unknown as BlogPost;
    
    this.setCache(cacheKey, result);
    return result;
  }
}

export const blogRepository = new BlogRepository();
