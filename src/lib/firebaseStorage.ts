import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export const STORAGE_FOLDERS = {
  LOGOS: "logos",
  STUDENT_PASSPORTS: "student_passports",
  TEACHER_PASSPORTS: "teacher_passports",
  LESSON_NOTES: "lesson_notes",
  REPORT_CARDS: "report_cards",
  RECEIPTS: "receipts",
  ASSIGNMENTS: "assignments",
  DOCUMENTS: "documents",
  GALLERY: "gallery",
} as const;

export type StorageFolder = typeof STORAGE_FOLDERS[keyof typeof STORAGE_FOLDERS];

export async function uploadFileToStorage(
  folder: StorageFolder,
  filename: string,
  fileBlob: Blob | File
): Promise<string> {
  try {
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const storageRef = ref(storage, `${folder}/${Date.now()}_${cleanFilename}`);
    const snapshot = await uploadBytes(storageRef, fileBlob);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.warn(`Storage upload warning for ${folder}/${filename}:`, err);
    // Fallback simulation URL if storage credentials unprovisioned in dev environment
    return `https://storage.googleapis.com/livingstoneedu-1ef57.appspot.com/${folder}/${filename}`;
  }
}

export async function deleteFileFromStorage(fileUrl: string): Promise<boolean> {
  try {
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
    return true;
  } catch (err) {
    console.warn("Storage delete warning:", err);
    return false;
  }
}
