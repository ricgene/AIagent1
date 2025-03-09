import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Verify that all required environment variables are present
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

console.log('Current Firebase Project ID:', firebaseConfig.projectId);
console.log('Firebase Configuration:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  // Don't log apiKey or appId for security
});

let auth: any; // Declare auth outside the try block
let analytics: any;

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  console.log('Connected to Firebase project:', firebaseConfig.projectId);

  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
  analytics = getAnalytics(app);
  console.log('Firebase auth and analytics initialized successfully');

  // Enable persistence to remember user between page reloads
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Firebase auth persistence set to local');
    })
    .catch((error) => {
      console.error('Error setting auth persistence:', error);
    });
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Export the auth instance at the module level
export { auth, analytics };