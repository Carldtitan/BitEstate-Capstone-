import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDYrdy-ALKekM0fC6UQ2JuAXgOrpMMmxZ0",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "bitestate-a77a3.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "bitestate-a77a3",
  appId: process.env.FIREBASE_APP_ID || "1:403297736948:web:0bf79bff07e4a8e3e626a1",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
