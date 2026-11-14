"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  type User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type UserCredential,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { saveUserToDatabase, type UserProfileData } from "@/lib/user-service";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  dbSaving: boolean;
  dbSynced: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<UserCredential | null>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbSaving, setDbSaving] = useState(false);
  const [dbSynced, setDbSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncUser = useCallback(async (firebaseUser: User) => {
    try {
      setDbSaving(true);
      const profile = await saveUserToDatabase(firebaseUser);
      setUserProfile(profile);
      setDbSynced(true);
    } catch (err) {
      console.error("Error saving user to Firestore database:", err);
      setDbSynced(false);
    } finally {
      setDbSaving(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          await syncUser(currentUser);
        } else {
          setUserProfile(null);
          setDbSynced(false);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Firebase auth state change error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [syncUser]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<UserCredential | null> => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUser(result.user);
      }
      return result;
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      // Ignore user closing the popup window manually
      if (
        authError.code === "auth/popup-closed-by-user" ||
        authError.code === "auth/cancelled-popup-request"
      ) {
        return null;
      }
      const message = authError.message || "Failed to sign in with Google";
      setError(message);
      console.error("Error signing in with Google:", err);
      throw err;
    }
  }, [syncUser]);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setDbSynced(false);
    } catch (err: unknown) {
      const authError = err as { message?: string };
      setError(authError.message || "Failed to sign out");
      console.error("Error signing out:", err);
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        dbSaving,
        dbSynced,
        error,
        signInWithGoogle,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
