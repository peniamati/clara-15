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

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0219785326",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:614613073026:web:acf601be5b10ff74c3889b",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDZW7-QOy2LaSgpSxDtG4JVhrn1rdfSals",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0219785326.firebaseapp.com",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0219785326.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "614613073026",
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

