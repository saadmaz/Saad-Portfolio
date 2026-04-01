/**
 * services/storage.ts
 * ─────────────────────────────────────────────────────────────
 * Firebase Storage helpers for file uploads.
 *
 * Replaces the old backend flow of:
 *   browser → POST /admin/upload (multer) → Firebase Admin SDK → Storage
 *
 * New flow (no server needed):
 *   browser → Firebase Storage SDK → Storage directly
 *
 * Security: Firebase Storage Rules (configured in Firebase Console)
 * should restrict uploads to authenticated users only:
 *
 *   rules_version = '2';
 *   service firebase.storage {
 *     match /b/{bucket}/o {
 *       match /uploads/{allPaths=**} {
 *         allow read: if true;
 *         allow write: if request.auth != null;
 *       }
 *     }
 *   }
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 *
 * @param file     - The File object from an <input type="file"> element
 * @param folder   - Storage folder path (default: "uploads")
 * @returns        - The permanent public download URL
 *
 * @example
 *   const url = await uploadImage(file);
 *   // store `url` in your Firestore document as heroImage, etc.
 */
export const uploadImage = async (
  file: File,
  folder: string = "uploads"
): Promise<string> => {
  // Build a unique filename using a timestamp to avoid collisions
  const filename  = `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `${folder}/${filename}`);

  // Upload the raw file bytes
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  // Return the permanent public URL
  return getDownloadURL(snapshot.ref);
};

/**
 * Deletes a file from Firebase Storage by its full URL.
 * Useful when replacing an image or deleting a record.
 *
 * @param url - The full download URL returned by uploadImage()
 */
export const deleteImage = async (url: string): Promise<void> => {
  // Firebase gives us a path-based ref from the full URL
  const fileRef = ref(storage, url);
  await deleteObject(fileRef);
};
