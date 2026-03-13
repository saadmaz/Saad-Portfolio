import { getDB } from '../utils/database.js';
import { ContactMessage } from '../types/index.js';

export class ContactMessageModel {
  private static collection = 'contact_messages';

  static async create(message: Omit<ContactMessage, 'id' | 'created_at' | 'sent'>): Promise<ContactMessage> {
    const db = getDB();
    const now = new Date();

    const messageData = {
      ...message,
      sent: false,
      created_at: now
    };

    const docRef = await db.collection(this.collection).add(messageData);

    return {
      id: parseInt(docRef.id),
      ...messageData
    };
  }

  static async findAll(): Promise<ContactMessage[]> {
    const db = getDB();
    const snapshot = await db.collection(this.collection)
      .orderBy('created_at', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    } as ContactMessage));
  }

  static async markAsSent(id: string): Promise<void> {
    const db = getDB();
    await db.collection(this.collection).doc(id).update({
      sent: true
    });
  }

  static async delete(id: string): Promise<void> {
    const db = getDB();
    await db.collection(this.collection).doc(id).delete();
  }
}