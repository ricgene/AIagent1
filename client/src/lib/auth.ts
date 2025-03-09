import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged as onFirebaseAuthStateChanged
} from "firebase/auth";
import { auth } from "./firebase";

// Function to register a new user
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error registering user:", error.message);
    throw error;
  }
};

// Function to sign in existing user
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error logging in:", error.message);
    throw error;
  }
};

// Function to sign out
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error: any) {
    console.error("Error signing out:", error.message);
    throw error;
  }
};

// Function to reset password
export const resetPassword = async (email: string) => {
  try {
    console.log("Attempting to send password reset email to:", email);
    const actionCodeSettings = {
      url: `${window.location.protocol}//${window.location.host}/auth`, // Full absolute URL
      handleCodeInApp: false // Explicitly set to false for email link handling
    };
    console.log("Reset password settings:", actionCodeSettings);
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    console.log("Password reset email sent successfully");
    return true;
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    // Add more specific error messages
    const errorMessage = error.code === 'auth/user-not-found'
      ? "No account found with this email address."
      : error.code === 'auth/invalid-email'
      ? "Please enter a valid email address."
      : error.code === 'auth/too-many-requests'
      ? "Too many password reset attempts. Please try again later."
      : "Failed to send password reset email. Please try again.";
    throw new Error(errorMessage);
  }
};

// Auth state change listener
export const onAuthStateChanged = (callback: (user: any) => void) => {
  return onFirebaseAuthStateChanged(auth, callback);
};