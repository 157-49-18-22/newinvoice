// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration object
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCpLd8DGvg-0c1AgT13bgw5JLhWVw3Im-A",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "invocie-837b4.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "invocie-837b4",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "invocie-837b4.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "791682358736",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:791682358736:web:823c6f8cec66b5b7df2dd5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Debug: Log Firebase initialization
console.log('🔥 Firebase initialized with config:', firebaseConfig);
console.log('🔥 Firestore database object:', db);
console.log('🔥 Environment variables check:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
});

export default app;
