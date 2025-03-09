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
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent successfully");
    return true;
  } catch (error: any) {
    console.error("Error sending password reset email:", error.message);
    throw error;
  }
};

// Auth state change listener
export const onAuthStateChanged = (callback: (user: any) => void) => {
  return onFirebaseAuthStateChanged(auth, callback);
};
