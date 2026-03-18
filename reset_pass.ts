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

const email = 'saadmaz@gmail.com';
const newPassword = 'SAAD@2003';

async function resetPassword() {
  try {
    const user = await getAuth().getUserByEmail(email);
    console.log(`Found user: ${user.uid}`);
    
    await getAuth().updateUser(user.uid, {
      password: newPassword
    });
    
    console.log(`✅ SUCCESS: Password for ${email} has been reset to: ${newPassword}`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ FAILURE: Could not reset password');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
