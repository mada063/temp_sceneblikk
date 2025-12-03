import { getApps, getApp, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ??
  "sceneblikk-96f17"; // Fallback to your existing projectId

const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY;

if (!CLIENT_EMAIL || !PRIVATE_KEY_RAW) {
  throw new Error(
    "Firebase Admin credentials are not configured (GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY).",
  );
}

const PRIVATE_KEY = PRIVATE_KEY_RAW.replace(/\\n/g, "\n");

const adminApp =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId: PROJECT_ID,
          clientEmail: CLIENT_EMAIL,
          privateKey: PRIVATE_KEY,
        }),
      });

export const adminDb = getFirestore(adminApp);


