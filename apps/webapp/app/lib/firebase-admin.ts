import { getApps, getApp, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ??
  "sceneblikk-96f17"; // Fallback to your existing projectId

const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY_RAW = process.env.GOOGLE_PRIVATE_KEY;

let adminApp: ReturnType<typeof getApp> | null = null;
let adminDb: ReturnType<typeof getFirestore> | null = null;
let adminAuth: ReturnType<typeof getAuth> | null = null;

// Initialize Firebase Admin only if credentials are available
// Don't throw error if not available - routes will fall back to cookies
if (CLIENT_EMAIL && PRIVATE_KEY_RAW) {
  try {
    // Handle both escaped and unescaped newlines, and remove quotes
    let PRIVATE_KEY = PRIVATE_KEY_RAW.trim();
    
    // Remove surrounding quotes if present
    if ((PRIVATE_KEY.startsWith('"') && PRIVATE_KEY.endsWith('"')) ||
        (PRIVATE_KEY.startsWith("'") && PRIVATE_KEY.endsWith("'"))) {
      PRIVATE_KEY = PRIVATE_KEY.slice(1, -1);
    }
    
    // Replace escaped newlines with actual newlines
    PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, "\n");
    
    // Ensure the key starts with -----BEGIN
    if (!PRIVATE_KEY.includes("-----BEGIN")) {
      throw new Error("Private key does not appear to be in PEM format");
    }

    adminApp =
      getApps().length > 0
        ? getApp()
        : initializeApp({
            credential: cert({
              projectId: PROJECT_ID,
              clientEmail: CLIENT_EMAIL,
              privateKey: PRIVATE_KEY,
            }),
          });

    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    console.error("Routes will fall back to cookie-based token storage");
    // Don't throw - allow the app to continue with cookie fallback
    adminApp = null;
    adminDb = null;
    adminAuth = null;
  }
} else {
  console.warn(
    "Firebase Admin credentials not configured. Routes will use cookie-based token storage.",
  );
}

export { adminDb, adminAuth };

/**
 * Verify Firebase ID token from request and return user ID.
 * Returns null if token is invalid, missing, or Firebase Admin is not initialized.
 */
export async function verifyFirebaseToken(
  idToken: string | null | undefined,
): Promise<string | null> {
  if (!idToken || !adminAuth) {
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.error("Failed to verify Firebase token:", error);
    return null;
  }
}


