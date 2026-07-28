import { createContext, useContext } from "react";
import type { User } from "firebase/auth";

export interface AuthUserTemplate {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
}

export interface AuthContextType {
  user: User | null;
  profile: AuthUserTemplate | null;
  role: "admin" | "customer" | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    password: string,
    name: string,
    phone: string,
  ) => Promise<void>;
  loginWithFB: () => Promise<void>;
  logout: () => Promise<void>;
}

// 1. Create the base context instance
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// 2. Export the custom hook cleanly from here
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth must be called from inside an active AuthProvider context shell.",
    );
  }
  return context;
};
