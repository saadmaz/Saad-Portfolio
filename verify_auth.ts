import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDj2ey71wzBBXyTAQdpv50RJ4ApDpTbisM",
  authDomain: "saadportfolio03.firebaseapp.com",
  projectId: "saadportfolio03",
  storageBucket: "saadportfolio03.firebasestorage.app",
  messagingSenderId: "929582814050",
  appId: "1:929582814050:web:98cc7b1fa382a804be523b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const email = 'saadmaz@gmail.com';
const password = 'testing-password-check'; // We just want to see if we get WRONG_PASSWORD or CONFIG_NOT_FOUND

console.log('--- Firebase Auth Verification Test ---');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Attempting login for:', email);

signInWithEmailAndPassword(auth, email, password)
  .then(() => {
    console.log('✅ SUCCESS: Authenticated successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ FAILURE: Auth Error');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    process.exit(1);
  });
