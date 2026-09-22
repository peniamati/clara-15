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

import appletConfig from '../../firebase-applet-config.json';

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || appletConfig.projectId;
const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim() || appletConfig.appId;
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim() || appletConfig.apiKey;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || appletConfig.authDomain;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || appletConfig.messagingSenderId;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || appletConfig.storageBucket;
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID?.trim() || appletConfig.firestoreDatabaseId || '(default)';

const firebaseConfig = {
  projectId,
  appId,
  apiKey,
  authDomain,
  messagingSenderId,
  storageBucket,
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Initialize Firestore with auto-detect long polling to prevent "unavailable / could not reach Cloud Firestore backend" in sandboxed environments
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

