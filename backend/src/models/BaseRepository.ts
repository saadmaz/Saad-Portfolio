import * as admin from 'firebase-admin';
import { getDB } from '../utils/database.js';

/**
 * Base Repository class providing common Firestore operations.
 */
export abstract class BaseRepository<T extends { id?: string | number }> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get collection() {
    return getDB().collection(this.collectionName);
  }

  /**
   * Get all documents in the collection.
   */
  async getAll(): Promise<T[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as unknown as T));
  }

  /**
   * Get a document by its ID (slug or auto-generated ID).
   */
  async getById(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      ...doc.data(),
      id: doc.id
    } as unknown as T;
  }

  /**
   * Create a new document.
   */
  async create(data: Omit<T, 'id'>, id?: string): Promise<T> {
    const docRef = id ? this.collection.doc(id) : this.collection.doc();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    const docData = {
      ...data,
      created_at: timestamp,
      updated_at: timestamp,
    };

    await docRef.set(docData);
    
    return {
      ...docData,
      id: docRef.id
    } as unknown as T;
  }

  /**
   * Update an existing document.
   */
  async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<void> {
    const docRef = this.collection.doc(id);
    await docRef.update({
      ...data,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  /**
   * Delete a document.
   */
  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  /**
   * Query documents with a single filter.
   */
  async findByField(field: string, op: admin.firestore.WhereFilterOp, value: any): Promise<T[]> {
    const snapshot = await this.collection.where(field, op, value).get();
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as unknown as T));
  }
}
