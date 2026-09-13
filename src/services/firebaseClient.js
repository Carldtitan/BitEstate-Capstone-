// Firestore, when it is configured, and null when it is not.
//
// This module used to be gitignored, so a clean clone could not build: every
// import of `./firebaseClient` failed to resolve. The configuration is read
// from the environment instead of being written down here, which is what the
// rest of the app already does for the contract address and the RPC URL.
//
// Returning null is a supported answer. `bitestateStore` checks for it and
// falls back to localStorage, so an unconfigured build still runs.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

let app = null;
let appTried = false;
let db = null;
let tried = false;

export function getFirebaseApp() {
  if (appTried) return app;
  appTried = true;
  if (!config.apiKey || !config.projectId) return null;
  try {
    app = getApps().length ? getApp() : initializeApp(config);
  } catch (error) {
    console.warn("Firebase unavailable.", error);
    app = null;
  }
  return app;
}

export function getFirebaseDb() {
  if (tried) return db;
  tried = true;

  // apiKey and projectId are the two Firestore cannot start without.
  const instance = getFirebaseApp();
  if (!instance) return null;

  try {
    db = getFirestore(instance);
  } catch (error) {
    console.warn("Firestore unavailable; using local storage.", error);
    db = null;
  }
  return db;
}

export default getFirebaseDb;
