// Firebase configuration (v9.22.0)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Initialize Firebase with your configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpLd8DGvg-0c1AgT13bgw5JLhWVw3Im-A",
  authDomain: "invocie-837b4.firebaseapp.com",
  projectId: "invocie-837b4",
  storageBucket: "invocie-837b4.appspot.com",
  messagingSenderId: "791682358736",
  appId: "1:791682358736:web:823c6f8cec66b5b7df2dd5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

// Log initialization
console.log('Firebase initialized successfully');

// Export the services
export { db, auth };
export default app;
