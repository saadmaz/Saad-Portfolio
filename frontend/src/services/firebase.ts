import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDj2ey71wzBBXyTAQdpv50RJ4ApDpTbisM",
  authDomain: "saadportfolio03.firebaseapp.com",
  projectId: "saadportfolio03",
  storageBucket: "saadportfolio03.firebasestorage.app",
  messagingSenderId: "929582814050",
  appId: "1:929582814050:web:98cc7b1fa382a804be523b",
  measurementId: "G-B9DKBTHYF6"
};

let app;
let auth;

try {
  console.log("🔥 Firebase Init: Using hardcoded config for saadportfolio03");
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("✅ Firebase Auth Initialized");
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  // Fallback to avoid breaking imports
  app = {} as any;
  auth = {} as any;
}

export { auth };
export default app;
