import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { AuthContext, type AuthUserTemplate } from "./AuthContext";
import {
  loginUser,
  registerUser,
  loginWithFacebook,
  logOut,
} from "../services/authService";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthUserTemplate | null>(null);
  const [role, setRole] = useState<"admin" | "customer" | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const authInstance = getAuth();

    const unsubscribe = onAuthStateChanged(
      authInstance,
      async (currentUser) => {
        setLoading(true);
        if (currentUser) {
          setUser(currentUser);
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            phoneNumber: currentUser.phoneNumber,
            photoURL: currentUser.photoURL,
          });

          try {
            const tokenResult = await currentUser.getIdTokenResult();
            const extractedRole = tokenResult.claims.role as
              | "admin"
              | "customer";
            setRole(extractedRole || "customer");
          } catch (error) {
            console.error("Error reading Firebase custom token claims:", error);
            setRole("customer");
          }
        } else {
          setUser(null);
          setProfile(null);
          setRole(null);
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await loginUser(email, password);
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    name: string,
    phone: string,
  ) => {
    setLoading(true);
    try {
      await registerUser(email, password, name, phone);
    } finally {
      setLoading(false);
    }
  };

  const loginWithFB = async () => {
    setLoading(true);
    try {
      await loginWithFacebook();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logOut();
      setUser(null);
      setProfile(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithFB,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
