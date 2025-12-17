import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Only initialize if we have required config
let app;
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
} else {
  console.warn("Firebase config incomplete. Firestore will not work. Set all FIREBASE_* env vars.");
  app = getApps().length ? getApps()[0] : initializeApp({ projectId: "dummy" });
}

export const db = getFirestore(app);
