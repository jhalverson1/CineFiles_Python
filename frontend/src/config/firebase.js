import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: 'cinefiles-82dda.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || ''
};

// For debugging
if (!process.env.REACT_APP_FIREBASE_API_KEY) {
  console.error('Firebase API key is missing. Make sure your environment variables are properly configured.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure Google provider
const googleProvider = new GoogleAuthProvider();

// Set custom OAuth parameters
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider }; 