import { query } from '../utils/database.js';
import { BlogPost } from '../types/index.js';

export class BlogPostModel {
  static async findAll(): Promise<BlogPost[]> {
    const result = await query('SELECT * FROM blog_posts WHERE published = true ORDER BY date DESC');
    return result.rows;
  }

  static async findBySlug(slug: string): Promise<BlogPost | null> {
    const result = await query('SELECT * FROM blog_posts WHERE slug = $1 AND published = true', [slug]);
    return result.rows[0] || null;
  }

  static async findLatest(): Promise<BlogPost[]> {
    const result = await query('SELECT * FROM blog_posts WHERE is_latest = true AND published = true ORDER BY date DESC LIMIT 5');
    return result.rows;
  }

  static async create(blogPost: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> {
    const {
      slug, title, excerpt, content, date, category, read_time, author,
      is_latest, tags, cover_image, published
    } = blogPost;

    const result = await query(`
      INSERT INTO blog_posts (
        slug, title, excerpt, content, date, category, read_time, author,
        is_latest, tags, cover_image, published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *
    `, [
      slug, title, excerpt, content, date, category, read_time, author,
      is_latest, JSON.stringify(tags), cover_image, published
    ]);

    return result.rows[0];
  }
}