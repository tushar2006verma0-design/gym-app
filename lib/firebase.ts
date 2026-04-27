import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Test connection
import { doc as fsDoc, getDocFromCache, getDocFromServer } from 'firebase/firestore';

async function testConnection() {
  try {
    await getDocFromServer(fsDoc(db, 'test_connection', 'ping'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error("Firebase is offline. Check configuration.");
    }
  }
}
if (typeof window !== 'undefined') {
  testConnection();
}

export function handleFirestoreError(error: any): never {
  throw new Error(error.message);
}
