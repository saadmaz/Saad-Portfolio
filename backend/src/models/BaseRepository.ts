import * as admin from 'firebase-admin';
import { getDB } from '../utils/database.js';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Base Repository class providing common Firestore operations
 * with built-in zero-dependency memory caching.
 */
export abstract class BaseRepository<T extends { id?: string | number }> {
  protected collectionName: string;
  private cache = new Map<string, CacheEntry<any>>();

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get collection() {
    return getDB().collection(this.collectionName);
  }

  protected getCache<K>(key: string): K | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      return entry.data as K;
    }
    if (entry) this.cache.delete(key);
    return null;
  }

  protected setCache<K>(key: string, data: K): void {
    this.cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
  }

  protected invalidateCache(): void {
    this.cache.clear();
  }

  /**
   * Get all documents in the collection safely (relies heavily on caching).
   */
  async getAll(): Promise<T[]> {
    const cacheKey = `${this.collectionName}_all`;
    const cached = this.getCache<T[]>(cacheKey);
    if (cached) return cached;

    const snapshot = await this.collection.get();
    const result = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as unknown as T));

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Get a document by its ID (caches individual entries).
   */
  async getById(id: string): Promise<T | null> {
    const cacheKey = `${this.collectionName}_${id}`;
    const cached = this.getCache<T>(cacheKey);
    if (cached) return cached;

    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    
    const result = {
      ...doc.data(),
      id: doc.id
    } as unknown as T;
    
    this.setCache(cacheKey, result);
    return result;
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
    this.invalidateCache();
    
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
    this.invalidateCache();
  }

  /**
   * Delete a document.
   */
  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
    this.invalidateCache();
  }

  /**
   * Query documents with a single filter.
   */
  async findByField(field: string, op: admin.firestore.WhereFilterOp, value: any): Promise<T[]> {
    const cacheKey = `${this.collectionName}_${field}_${op}_${value}`;
    const cached = this.getCache<T[]>(cacheKey);
    if (cached) return cached;

    const snapshot = await this.collection.where(field, op, value).get();
    const result = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as unknown as T));

    this.setCache(cacheKey, result);
    return result;
  }
}
