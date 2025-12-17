import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

let app;
let auth;

function ensureFirebase() {
  if (!app) {
    // Check if Firebase config is properly set
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn(
        "Firebase not configured via .env. Falling back to local demo auth. " +
        "Set FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_APP_ID to enable."
      );
      return null;
    }
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
    } catch (err) {
      console.warn("Firebase initialization failed:", err.message);
      return null;
    }
  }
  return auth;
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const provider = useMemo(() => new GoogleAuthProvider(), []);

  useEffect(() => {
    const auth = ensureFirebase();
    if (!auth) {
      setFirebaseReady(false);
      setLoading(false);
      return;
    }
    setFirebaseReady(true);
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      const email = u?.email?.toLowerCase();
      setIsAdmin(email ? adminEmails.includes(email) : false);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      if (!firebaseReady) {
        const demoUser = { uid: "local-demo", displayName: "Demo User", email: "demo@local" };
        setUser(demoUser);
        setIsAdmin(true);
        return;
      }
      const auth = ensureFirebase();
      if (!auth) throw new Error("Firebase not initialized");
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (!firebaseReady) {
        setUser(null);
        return;
      }
      const auth = ensureFirebase();
      if (auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
