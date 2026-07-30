import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  FacebookAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { api } from "../api/client";

export interface UserProfile {
  id: number;
  firebaseUid: string; // Updated to camelCase to match your backend Prisma schema exactly
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null; // Added address to match backend capability
  role: string;
  status: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

/**
 * 1. Registers a new user with Firebase and passes form metadata to the dynamic sync gateway
 */
export const registerUser = async (
  email: string,
  password: string,
  name: string | null,
  phone: string | null,
  address: string | null,
): Promise<AuthResponse> => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);

    const response = await api.post<AuthResponse>("/auth/sync", {
      name,
      phone,
      address,
    });

    return response.data;
  } catch (error) {
    console.error("Registration and backend database sync failure:", error);
    throw error;
  }
};

/**
 * 2. Authenticates an existing user and hits the sync gateway to verify/retrieve their database row
 */
export const loginUser = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("triggered");
    // No body payload needed for normal login.
    // The backend middleware decodes the token, and the upsert runs the update branch safely.
    const response = await api.post<AuthResponse>("/auth/sync", {});
    return response.data;
  } catch (error) {
    console.error("Login session and database refresh failure:", error);
    throw error;
  }
};

/**
 * 3. Triggers Facebook popup login and passes the identity context to the sync gateway
 */
export const loginWithFacebook = async (): Promise<AuthResponse> => {
  try {
    const provider = new FacebookAuthProvider();
    await signInWithPopup(auth, provider);

    // No body payload needed here either!
    // Your updated backend controller automatically falls back to token claims:
    // finalName = bodyName || firebaseName || ""
    const response = await api.post<AuthResponse>("/auth/sync", {});
    return response.data;
  } catch (error) {
    console.error("Facebook authentication and database sync failure:", error);
    throw error;
  }
};

/**
 * 4. Clears the active authentication session tokens
 */
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout execution failure:", error);
    throw error;
  }
};
