import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "prizmpoc.firebaseapp.com",
  projectId: "prizmpoc",
  storageBucket: "prizmpoc.appspot.com",
  messagingSenderId: "324482404818",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-QGEQ4MTXR7"
};

console.log('Starting Firebase initialization with project:', firebaseConfig.projectId);

let app: any;
let auth: any;
let analytics: any;
let initialized = false;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');

  // Initialize Firebase Authentication
  auth = getAuth(app);
  console.log('Firebase auth initialized');

  // Initialize Analytics
  analytics = getAnalytics(app);
  console.log('Firebase analytics initialized');

  // Set persistence
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Firebase auth persistence set to local');
      initialized = true;
      console.log('Firebase initialization complete');
    })
    .catch((error) => {
      console.error('Error setting auth persistence:', error);
      // Don't throw the error, just log it
      console.error('Firebase initialization failed but continuing');
      initialized = false;
    });
} catch (error) {
  console.error('Critical error during Firebase initialization:', error);
  initialized = false;
}

// Export a function to check if Firebase is initialized
export function isFirebaseInitialized() {
  return initialized && !!auth;
}

// Export the Firebase instances
export { auth, analytics };