import { query } from '../utils/database.js';
import { ContactMessage } from '../types/index.js';

export class ContactMessageModel {
  static async create(message: Omit<ContactMessage, 'id' | 'created_at' | 'sent'>): Promise<ContactMessage> {
    const { name, email, subject, message: msg, ip_address, user_agent } = message;

    const result = await query(`
      INSERT INTO contact_messages (name, email, subject, message, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [name, email, subject, msg, ip_address, user_agent]);

    return result.rows[0];
  }

  static async findAll(): Promise<ContactMessage[]> {
    const result = await query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    return result.rows;
  }

  static async markAsSent(id: number): Promise<void> {
    await query('UPDATE contact_messages SET sent = true WHERE id = $1', [id]);
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM contact_messages WHERE id = $1', [id]);
  }
}