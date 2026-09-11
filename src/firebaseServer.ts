import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let db: any = null;
let isInitialized = false;

export function initFirebase() {
  if (isInitialized) return db;

  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      console.warn('[Firebase] Config file "firebase-applet-config.json" not found. Falling back to local storage.');
      return null;
    }

    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    isInitialized = true;
    console.log(`[Firebase] Initialized successfully with project ID: ${firebaseConfig.projectId}`);
    return db;
  } catch (error) {
    console.error('[Firebase] Failed to initialize Firebase:', error);
    return null;
  }
}

/**
 * Fetches dataset value from Cloud Firestore with local filesystem fallback
 */
export async function getDataset(key: string, localFallbackPath: string): Promise<any> {
  const firestoreDb = initFirebase();
  
  if (!firestoreDb) {
    // Fall back to reading local file
    console.log(`[Firebase] Using local filesystem fallback for read: ${key}`);
    if (fs.existsSync(localFallbackPath)) {
      const content = await fs.promises.readFile(localFallbackPath, 'utf-8');
      return JSON.parse(content);
    }
    return null;
  }

  try {
    const docRef = doc(firestoreDb, 'clan_data_store', key);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const firestoreValue = docSnap.data().value;
      console.log(`[Firebase] Read dataset from Firestore: ${key}`);
      
      // Keep local file in sync as a cache/backup
      try {
        const dir = path.dirname(localFallbackPath);
        if (!fs.existsSync(dir)) {
          await fs.promises.mkdir(dir, { recursive: true });
        }
        await fs.promises.writeFile(localFallbackPath, JSON.stringify(firestoreValue, null, 2), 'utf-8');
      } catch (err) {
        console.warn(`[Firebase] Failed to update local backup cache for ${key}:`, err);
      }
      
      return firestoreValue;
    } else {
      console.log(`[Firebase] Dataset ${key} not found in Firestore. Seeding from local backup...`);
      if (fs.existsSync(localFallbackPath)) {
        const content = await fs.promises.readFile(localFallbackPath, 'utf-8');
        const localData = JSON.parse(content);
        // Seed to Firestore asynchronously
        await setDoc(docRef, { value: localData });
        console.log(`[Firebase] Successfully seeded dataset to Firestore: ${key}`);
        return localData;
      }
      return null;
    }
  } catch (error) {
    console.error(`[Firebase] Error reading dataset "${key}" from Firestore:`, error);
    // Graceful fallback to local file
    if (fs.existsSync(localFallbackPath)) {
      const content = await fs.promises.readFile(localFallbackPath, 'utf-8');
      return JSON.parse(content);
    }
    throw error;
  }
}

/**
 * Saves dataset value to both Cloud Firestore and local filesystem backup
 */
export async function saveDataset(key: string, data: any, localFallbackPath: string): Promise<boolean> {
  // First, always save to local filesystem backup so we have a copy
  try {
    const dir = path.dirname(localFallbackPath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(localFallbackPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[Firebase] Saved local backup file: ${key}`);
  } catch (err) {
    console.error(`[Firebase] Failed to write local backup for ${key}:`, err);
  }

  const firestoreDb = initFirebase();
  if (!firestoreDb) {
    console.warn(`[Firebase] Firestore not initialized, data is saved locally only for key: ${key}`);
    return false;
  }

  try {
    const docRef = doc(firestoreDb, 'clan_data_store', key);
    await setDoc(docRef, { value: data });
    console.log(`[Firebase] Saved dataset to Firestore: ${key}`);
    return true;
  } catch (error) {
    console.error(`[Firebase] Failed to save dataset "${key}" to Firestore:`, error);
    return false;
  }
}
