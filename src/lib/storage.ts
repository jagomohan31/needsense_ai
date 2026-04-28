// ============================================================
// Firebase Storage Service
// Handles image uploads for need requests
// ============================================================
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload an image file to Firebase Storage
 * Returns the public download URL
 */
export async function uploadRequestImage(
  file: File,
  requestId: string
): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `requests/${requestId}/image.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: { uploadedAt: new Date().toISOString() },
  });

  return getDownloadURL(storageRef);
}

/**
 * Upload volunteer profile photo
 */
export async function uploadProfilePhoto(
  file: File,
  userId: string
): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `profiles/${userId}/avatar.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

/**
 * Delete an image from Firebase Storage
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // Silently fail if image doesn't exist
  }
}
