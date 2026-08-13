import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Mode flags
export const IS_DEMO_MODE: boolean = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
export const IS_FIREBASE_CONFIGURED: boolean = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID
);

// Firebase Configuration loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "unconfigured",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "unconfigured.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "unconfigured",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "unconfigured.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Export standard Firebase Authentication and Firestore Database instances
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export default app;


