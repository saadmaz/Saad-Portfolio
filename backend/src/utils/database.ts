import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore | null = null;

export const connectDB = async () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps && admin.apps.length > 0) {
      db = admin.firestore();
      console.log('✅ Firebase already initialized');
      return;
    }

    // Check if we have Firebase credentials
    if (!process.env.FIREBASE_PROJECT_ID && !process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      console.warn('⚠️  Firebase credentials not set. Running without database connection.');
      return;
    }

    // Initialize Firebase Admin SDK
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      // Use service account file
      serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    } else {
      // Use environment variables
      serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      };
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id}.firebaseio.com`
    });

    db = admin.firestore();
    console.log('✅ Firebase connected successfully');
  } catch (error) {
    console.warn('⚠️  Firebase connection failed. Running without database:', error.message);
    db = null;
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Firebase not connected. Please check your Firebase configuration.');
  }
  return db;
};

export const isDBConnected = () => db !== null;