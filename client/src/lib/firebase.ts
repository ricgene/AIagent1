import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !import.meta.env[envVar]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required Firebase configuration: ${missingEnvVars.join(', ')}`
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "324482404818",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-QGEQ4MTXR7"
};

console.log('Initializing Firebase with project:', firebaseConfig.projectId);

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
      throw error;
    });
} catch (error) {
  console.error('Error during Firebase initialization:', error);
  throw error;
}

// Export a function to check if Firebase is initialized
export function isFirebaseInitialized() {
  return initialized;
}

// Export the Firebase instances
export { auth, analytics };