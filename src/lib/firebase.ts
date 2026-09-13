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

const required = (name: string, value?: string) => {
  const clean = value?.trim();
  if (!clean) throw new Error(`Falta configurar ${name}. Revisá los secrets del despliegue.`);
  return clean;
};

const firebaseConfig = {
  projectId: required('VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID),
  appId: required('VITE_FIREBASE_APP_ID', import.meta.env.VITE_FIREBASE_APP_ID),
  apiKey: required('VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: required('VITE_FIREBASE_AUTH_DOMAIN', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  messagingSenderId: required('VITE_FIREBASE_MESSAGING_SENDER_ID', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Initialize Firestore with auto-detect long polling to prevent "unavailable / could not reach Cloud Firestore backend" in sandboxed environments
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID?.trim() || '(default)';

export const db = initializeFirestore(
  app, 
  {
    experimentalAutoDetectLongPolling: true,
  }, 
  firestoreDatabaseId
);

export { 
  collection, addDoc, getDocs, onSnapshot, query, orderBy, 
  serverTimestamp, updateDoc, doc, setDoc, getDoc,
  signInWithEmailAndPassword, signOut, onAuthStateChanged
};

