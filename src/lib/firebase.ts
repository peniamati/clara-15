import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  initializeFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  setDoc,
  getDoc
} from 'firebase/firestore';

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || '';
const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim() || '';
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim() || '';
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || (projectId ? `${projectId}.firebaseapp.com` : '');
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || '';
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || (projectId ? `${projectId}.firebasestorage.app` : '');
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID?.trim() || '(default)';

const firebaseConfig = {
  projectId,
  appId,
  apiKey: apiKey || 'NO_KEY_CONFIGURED',
  authDomain,
  messagingSenderId,
  storageBucket,
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Initialize Firestore with auto-detect long polling to prevent "unavailable / could not reach Cloud Firestore backend" in sandboxed environments
export const db = (!firestoreDatabaseId || firestoreDatabaseId === '(default)')
  ? initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
  : initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, firestoreDatabaseId);

export { 
  collection, addDoc, getDocs, onSnapshot, query, orderBy, 
  serverTimestamp, updateDoc, doc, setDoc, getDoc,
  signInWithEmailAndPassword, signOut, onAuthStateChanged
};

