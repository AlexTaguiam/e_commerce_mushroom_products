import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  FacebookAuthProvider,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

import { api } from "../api/client";

export interface UserProfile {
  id: number;
  firebaseUid: string;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  role: string;
  status: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export const registerUser = async (
  email: string,
  password: string,
  name: string | null,
  phone: string | null,
  address: string | null,
): Promise<AuthResponse> => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);

    const result = await api.post<AuthResponse>("/auth/sync", {
      name,
      phone,
      address,
    });
    console.log("Registration Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Registration and backend database sync failure:", error);
    throw error;
  }
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);

    const result = await api.post<AuthResponse>("/auth/sync", {});
    console.log("Login Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Login session and database refresh failure:", error);
    throw error;
  }
};

interface SocialAuthResult {
  data: AuthResponse;
  isNewUser: boolean;
}

export const socialAuth = async (
  provider: "google" | "facebook",
): Promise<SocialAuthResult> => {
  try {
    const authProvider =
      provider === "google"
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider();

    await signInWithPopup(auth, authProvider);

    const result = await api.post<AuthResponse>("/auth/sync", {});
    console.log("Social Auth Result: ", result.data);

    return {
      data: result.data,
      isNewUser: result.status === 201,
    };
  } catch (error) {
    console.error(`Social auth via ${provider} failed:`, error);
    throw error;
  }
};

export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout execution failure:", error);
    throw error;
  }
};
