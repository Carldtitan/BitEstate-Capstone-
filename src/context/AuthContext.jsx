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
    if (!firebaseConfig.apiKey) {
      throw new Error("Firebase config missing");
    }
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
  return auth;
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const provider = useMemo(() => new GoogleAuthProvider(), []);

  useEffect(() => {
    try {
      ensureFirebase();
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        const email = u?.email?.toLowerCase();
        setIsAdmin(email ? adminEmails.includes(email) : !firebaseReady && !!u);
        setLoading(false);
      });
      return unsubscribe;
    } catch (err) {
      console.warn("Firebase not configured, staying in mock auth mode", err);
      setFirebaseReady(false);
      setLoading(false);
    }
  }, []);

  const login = async () => {
    try {
      if (!firebaseReady) {
        const demoUser = { uid: "local-demo", displayName: "Demo User" };
        setUser(demoUser);
        setIsAdmin(true);
        return;
      }
      ensureFirebase();
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
      ensureFirebase();
      await signOut(auth);
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
