// Who is signed in, and how they sign in.
//
// This file was never committed, so a clean clone could not build: App.jsx,
// Navbar, LoginPage, UploadPage, VerifyPage and WalletContext all import it.
//
// It provides exactly what those six read: { user, login, logout, loading,
// isAdmin, authError }.
//
// Firebase is optional here, on purpose, and for the same reason
// `bitestateStore` falls back to localStorage when Firestore is absent: an
// unconfigured checkout should still build and still run. With no
// configuration the app renders signed out and says why rather than hanging on
// a loading screen.
//
// Configuration, all read from the environment:
//   REACT_APP_FIREBASE_*        the web app config (see firebaseClient.js)
//   REACT_APP_ADMIN_EMAILS      comma-separated addresses allowed to register
//                               a source. Empty means nobody is an admin.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getFirebaseApp } from "../services/firebaseClient";

const AuthContext = createContext(null);

const ADMIN_EMAILS = String(process.env.REACT_APP_ADMIN_EMAILS || "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const NOT_CONFIGURED =
  "Sign-in is not configured for this deployment. Set REACT_APP_FIREBASE_API_KEY " +
  "and REACT_APP_FIREBASE_PROJECT_ID to enable it.";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  // Watch the signed-in user. Firebase is imported lazily so that a build
  // without configuration never pulls the auth bundle into the first paint.
  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;

    const app = getFirebaseApp();
    if (!app) {
      setLoading(false);
      return undefined;
    }

    import("firebase/auth")
      .then(({ getAuth, onAuthStateChanged }) => {
        if (cancelled) return;
        unsubscribe = onAuthStateChanged(
          getAuth(app),
          (next) => {
            if (cancelled) return;
            setUser(next || null);
            setLoading(false);
          },
          (error) => {
            if (cancelled) return;
            setAuthError(error?.message || "Could not check the sign-in state.");
            setLoading(false);
          },
        );
      })
      .catch((error) => {
        if (cancelled) return;
        setAuthError(error?.message || "Could not load sign-in.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = useCallback(async () => {
    setAuthError("");
    const app = getFirebaseApp();
    if (!app) {
      setAuthError(NOT_CONFIGURED);
      throw new Error(NOT_CONFIGURED);
    }
    try {
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import(
        "firebase/auth"
      );
      const result = await signInWithPopup(getAuth(app), new GoogleAuthProvider());
      setUser(result?.user || null);
      return result?.user || null;
    } catch (error) {
      // A closed popup is the user changing their mind, not a failure worth
      // putting on screen.
      const code = error?.code || "";
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setAuthError(error?.message || "Could not sign in.");
      }
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthError("");
    const app = getFirebaseApp();
    if (!app) {
      setUser(null);
      return;
    }
    try {
      const { getAuth, signOut } = await import("firebase/auth");
      await signOut(getAuth(app));
      setUser(null);
    } catch (error) {
      setAuthError(error?.message || "Could not sign out.");
      throw error;
    }
  }, []);

  const isAdmin = useMemo(() => {
    const email = String(user?.email || "").trim().toLowerCase();
    return Boolean(email) && ADMIN_EMAILS.includes(email);
  }, [user]);

  const value = useMemo(
    () => ({ user, login, logout, loading, isAdmin, authError }),
    [user, login, logout, loading, isAdmin, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return value;
}

export default AuthContext;
