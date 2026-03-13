import { query } from '../utils/database.js';
import { Project, BlogPost, WorkExperience, Skill, Certificate, ContactMessage, User } from '../types/index.js';

export class ProjectModel {
  static async findAll(): Promise<Project[]> {
    const result = await query('SELECT * FROM projects ORDER BY order_index ASC, created_at DESC');
    return result.rows;
  }

  static async findBySlug(slug: string): Promise<Project | null> {
    const result = await query('SELECT * FROM projects WHERE slug = $1', [slug]);
    return result.rows[0] || null;
  }

  static async findFeatured(): Promise<Project[]> {
    const result = await query('SELECT * FROM projects WHERE featured = true ORDER BY order_index ASC');
    return result.rows;
  }

  static async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const {
      slug, title, description, long_description, date, start_date, end_date, duration,
      status, stage, version, image, images, thumbnail, video, live_preview, link,
      github, case_study, figma, documentation, play_store, app_store, type, category,
      tags, featured, order_index, technologies, tech_stack, metrics, role, team_size,
      contributions, challenges, learnings, highlights, colour
    } = project;

    const result = await query(`
      INSERT INTO projects (
        slug, title, description, long_description, date, start_date, end_date, duration,
        status, stage, version, image, images, thumbnail, video, live_preview, link,
        github, case_study, figma, documentation, play_store, app_store, type, category,
        tags, featured, order_index, technologies, tech_stack, metrics, role, team_size,
        contributions, challenges, learnings, highlights, colour
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
        $33, $34, $35, $36, $37, $38
      ) RETURNING *
    `, [
      slug, title, description, long_description, date, start_date, end_date, duration,
      status, stage, version, image, JSON.stringify(images), thumbnail, video, live_preview, link,
      github, case_study, figma, documentation, play_store, app_store, type, category,
      JSON.stringify(tags), featured, order_index, JSON.stringify(technologies),
      JSON.stringify(tech_stack), JSON.stringify(metrics), role, team_size,
      JSON.stringify(contributions), JSON.stringify(challenges), JSON.stringify(learnings),
      JSON.stringify(highlights), colour
    ]);

    return result.rows[0];
  }
}