"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// NOTE:
// For production, it's best practice to move these values into environment
// variables and read them via process.env.NEXT_PUBLIC_...
// For now we use your provided config directly.
const firebaseConfig = {
  apiKey: "AIzaSyBKxkNC-ENj4eIJp_i3jeTKH1StJ3D7710",
  authDomain: "sceneblikk-96f17.firebaseapp.com",
  projectId: "sceneblikk-96f17",
  storageBucket: "sceneblikk-96f17.firebasestorage.app",
  messagingSenderId: "210994839928",
  appId: "1:210994839928:web:7aaaccf18f5ba30054088d",
  measurementId: "G-LPV42DD3XE",
};

// Ensure we don't re-initialize in hot reload / multiple imports
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;


