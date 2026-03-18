import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
let auth;

try {
  console.log("🔥 Firebase Init Check:", import.meta.env.VITE_FIREBASE_PROJECT_ID ? "Config Detected" : "MISSING CONFIG");
  
  // Check if critical config is missing
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    console.error("❌ CRITICAL: VITE_FIREBASE_API_KEY is missing! Auth will fail.");
    app = initializeApp({ apiKey: "none", authDomain: "none", projectId: "none", storageBucket: "none", messagingSenderId: "none", appId: "none" });
  } else {
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase Initialized for:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
  }
  auth = getAuth(app);
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  // Fallback to avoid breaking imports
  app = {} as any;
  auth = {} as any;
}

export { auth };
export default app;
