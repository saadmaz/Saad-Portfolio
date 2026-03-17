import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let db: admin.firestore.Firestore | null = null;
let isInitialized = false;

/**
 * Initializes the Firebase Admin SDK and returns the Firestore instance.
 * Supports both service account JSON file and environment variables.
 */
export const connectDB = async (): Promise<admin.firestore.Firestore | null> => {
  if (isInitialized) {
    return db;
  }

  try {
    // Check if Firebase is already initialized via admin.apps
    if (admin.apps.length > 0) {
      db = admin.firestore();
      isInitialized = true;
      console.log('✅ Firebase already initialized');
      return db;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (!projectId && !serviceAccountPath) {
      console.warn('⚠️  Firebase credentials not set. Running without database connection.');
      return null;
    }

    let credential;

    if (serviceAccountPath) {
      try {
        const absolutePath = resolve(process.cwd(), serviceAccountPath);
        const serviceAccount = JSON.parse(readFileSync(absolutePath, 'utf8'));
        credential = admin.credential.cert(serviceAccount);
      } catch (err: any) {
        console.error(`❌ Failed to load service account from ${serviceAccountPath}:`, err.message);
        // Fallback to individual env vars instead of throwing
        console.warn('Trying individual environment variables instead...');
        credential = admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        } as admin.ServiceAccount);
      }
    } else {
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      } as admin.ServiceAccount);
    }

    admin.initializeApp({
      credential,
      databaseURL: `https://${projectId || 'portfolio'}.firebaseio.com`
    });

    db = admin.firestore();
    isInitialized = true;
    console.log('✅ Firebase connected successfully');
    return db;
  } catch (error: any) {
    console.error('❌ Firebase connection failed:', error.message);
    db = null;
    isInitialized = false;
    return null;
  }
};

/**
 * Returns the initialized Firestore instance.
 * @throws Error if Firebase is not connected.
 */
export const getDB = (): admin.firestore.Firestore => {
  if (!db) {
    throw new Error('Firebase not connected. Please call connectDB() first and ensure configuration is correct.');
  }
  return db;
};

/**
 * Checks if the database is currently connected.
 */
export const isDBConnected = (): boolean => isInitialized && db !== null;