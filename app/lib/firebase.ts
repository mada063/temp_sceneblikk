import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

// NOTE:
// For production, it's best practice to move these values into environment
// variables and read them via process.env.NEXT_PUBLIC_...
// For now we use your provided config directly.
const firebaseConfig = {
  apiKey: "AIzaSyCKqe2ohKrdutBUyUWk7kqpvHfa1Pw-PzY",
  authDomain: "sceneblikk-b439f.firebaseapp.com",
  projectId: "sceneblikk-b439f",
  storageBucket: "sceneblikk-b439f.firebasestorage.app",
  messagingSenderId: "171035470784",
  appId: "1:171035470784:web:d9ffb3f18b07ca2e683625",
  measurementId: "G-7XF57GYMN0",
};

// Ensure we don't re-initialize in hot reload / multiple imports
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

let analyticsInstance: Analytics | null = null;

// Analytics must only be used in the browser and only if supported
export const getAnalyticsClient = async (): Promise<Analytics | null> => {
  if (analyticsInstance) return analyticsInstance;

  if (typeof window === "undefined") return null;

  const supported = await isSupported().catch(() => false);
  if (!supported) return null;

  analyticsInstance = getAnalytics(app);
  return analyticsInstance;
};

export default app;


