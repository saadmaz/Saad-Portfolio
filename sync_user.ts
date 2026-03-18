import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const serviceAccountPath = './backend/saadportfolio03-firebase-adminsdk-fbsvc-0756564855.json';
const absolutePath = resolve(process.cwd(), serviceAccountPath);
const serviceAccount = JSON.parse(readFileSync(absolutePath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const correctEmail = 'saadmaz@gmail.com'; // The one user wants
const correctPassword = 'SAAD@2003';

async function syncUser() {
  try {
    let user;
    try {
      user = await getAuth().getUserByEmail(correctEmail);
      console.log(`User ${correctEmail} already exists. Updating password...`);
      await getAuth().updateUser(user.uid, { password: correctPassword });
    } catch (e: any) {
      console.log(`User ${correctEmail} does not exist. Creating...`);
      user = await getAuth().createUser({
        email: correctEmail,
        password: correctPassword,
        emailVerified: true
      });
    }
    
    console.log(`✅ SUCCESS: User ${correctEmail} is ready with password ${correctPassword}`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ FAILURE: Could not sync user');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

syncUser();
