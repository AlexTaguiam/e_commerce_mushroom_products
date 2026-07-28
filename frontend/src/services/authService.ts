import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  FacebookAuthProvider,
  signInWithPopup,
  type UserCredential, // 👈 Added 'type' keyword for verbatimModuleSyntax compatibility
} from "firebase/auth";

import { api } from "../api/client";

export interface UserProfile {
  id: number;
  firebase_uid: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  status: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

/**
 * Registers a new user with Email/Password and syncs the profile to the database
 */
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  phone: string,
): Promise<AuthResponse> => {
  try {
    // Fixed casing: changed variable name from 'UserCredential' to 'userCredential' to avoid clashing with the type
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const firebaseUser = userCredential.user;

    const signupData = {
      firebase_uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: name,
      phone: phone,
    };

    const response = await api.post<AuthResponse>("/auth/signup", signupData);
    return response.data;
  } catch (error) {
    console.error("Registration and sync service failure:", error);
    throw error;
  }
};

/**
 * Authenticates an existing user using Email/Password and retrieves their profile
 */
export const loginUser = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);

    const response = await api.get<AuthResponse>("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Login session service failure:", error);
    throw error;
  }
};

/**
 * Authenticates a user using Facebook Pop-up Login and syncs/retrieves their profile
 */
export const loginWithFacebook = async (): Promise<AuthResponse> => {
  try {
    const provider = new FacebookAuthProvider();

    // Triggers the official Facebook authentication popup window
    const userCredential: UserCredential = await signInWithPopup(
      auth,
      provider,
    );
    const firebaseUser = userCredential.user;

    // Package Facebook profile data to synchronize with your Prisma database
    const socialSyncData = {
      firebase_uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || "Facebook User",
      phone: firebaseUser.phoneNumber || null,
    };

    // Hits a sync endpoint that logs them in if they exist, or registers them as a 'customer' if new
    const response = await api.post<AuthResponse>(
      "/auth/social-sync",
      socialSyncData,
    );
    return response.data;
  } catch (error) {
    console.error("Facebook authentication and sync failure:", error);
    throw error;
  }
};

/**
 * Signs the user out of the active Firebase session
 */
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout execution failure:", error);
    throw error;
  }
};
