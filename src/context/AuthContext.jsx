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
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDYrdy-ALKekM0fC6UQ2JuAXgOrpMMmxZ0",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "bitestate-a77a3.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "bitestate-a77a3",
  appId: process.env.FIREBASE_APP_ID || "1:403297736948:web:0bf79bff07e4a8e3e626a1",
};

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

let app;
let auth;

function ensureFirebase() {
  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
    } catch (err) {
      console.warn("Firebase initialization error (will use demo mode):", err.message);
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
    try {
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
    } catch (err) {
      console.warn("Firebase auth setup failed, using demo mode:", err.message);
      setFirebaseReady(false);
      setLoading(false);
    }
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
