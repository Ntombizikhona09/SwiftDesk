import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  Timestamp 
} from 'firebase/firestore'; // Add necessary Firestore functions
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgb8fIs4QYfkmcEUAdUKOHlb8eLws5Pro", // Your API Key
  authDomain: "swiftdesk-67ad8.firebaseapp.com",
  projectId: "swiftdesk-67ad8",
  storageBucket: "swiftdesk-67ad8.firebasestorage.app",
  messagingSenderId: "513588911430",
  appId: "1:513588911430:web:d38570f42dee2845d35947",
  measurementId: "G-0ZNY3PQL8K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app); // Initialize Firebase Auth
const db = getFirestore(app); // Initialize Firestore
const analytics = getAnalytics(app); // Initialize Firebase Analytics

// Export necessary functions and services
export { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  setDoc, 
  doc, 
  collection, 
  getDocs, 
  addDoc, 
  Timestamp // Export the Timestamp function
};
