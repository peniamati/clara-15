import { initializeApp } from 'firebase/app';
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
  setDoc 
} from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0219785326",
  appId: "1:614613073026:web:acf601be5b10ff74c3889b",
  apiKey: "AIzaSyDZW7-QOy2LaSgpSxDtG4JVhrn1rdfSals",
  authDomain: "gen-lang-client-0219785326.firebaseapp.com",
  storageBucket: "gen-lang-client-0219785326.firebasestorage.app",
  messagingSenderId: "614613073026",
};

export const app = initializeApp(firebaseConfig);

// Initialize Firestore with auto-detect long polling to prevent "unavailable / could not reach Cloud Firestore backend" in sandboxed environments
export const db = initializeFirestore(
  app, 
  {
    experimentalAutoDetectLongPolling: true,
  }, 
  "ai-studio-maestro15platafo-9d6f18a3-120c-410d-ac5d-13793017bfbd"
);

export { collection, addDoc, getDocs, onSnapshot, query, orderBy, serverTimestamp, updateDoc, doc, setDoc };

