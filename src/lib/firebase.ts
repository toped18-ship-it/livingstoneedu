import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { initializeAppCheck, CustomProvider } from "firebase/app-check";
import firebaseAppletConfig from "../../firebase-applet-config.json";

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: firebaseAppletConfig?.apiKey || metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyDFWBa-XQ5Ppz8aAcChO8U5uWQ5gMRrBRM",
  authDomain: firebaseAppletConfig?.authDomain || metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "livingstoneedu-1ef57.firebaseapp.com",
  projectId: firebaseAppletConfig?.projectId || metaEnv.VITE_FIREBASE_PROJECT_ID || "livingstoneedu-1ef57",
  storageBucket: firebaseAppletConfig?.storageBucket || metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "livingstoneedu-1ef57.firebasestorage.app",
  messagingSenderId: firebaseAppletConfig?.messagingSenderId || metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "862725103424",
  appId: firebaseAppletConfig?.appId || metaEnv.VITE_FIREBASE_APP_ID || "1:862725103424:web:dd47f90a610e60d93424a5",
  measurementId: firebaseAppletConfig?.measurementId || metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "G-MLJ844W1NY",
  databaseURL: (firebaseAppletConfig as any)?.databaseURL || metaEnv.VITE_FIREBASE_DATABASE_URL || "https://livingstoneedu-1ef57-default-rtdb.firebaseio.com",
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = firebaseAppletConfig?.firestoreDatabaseId && firebaseAppletConfig.firestoreDatabaseId !== "(default)"
  ? getFirestore(app, firebaseAppletConfig.firestoreDatabaseId)
  : getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

// Initialize Firebase App Check with custom backend token provider
export let appCheck: any = null;
if (typeof window !== "undefined") {
  try {
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    appCheck = initializeAppCheck(app, {
      provider: new CustomProvider({
        getToken: async () => {
          try {
            const res = await fetch("/api/firebase/app-check-token");
            const data = await res.json();
            if (data && data.token) {
              return {
                token: data.token,
                expireTimeMillis: data.expireTimeMillis || Date.now() + 3600000,
              };
            }
          } catch (e) {
            console.warn("[Firebase App Check] Fallback token provider engaged:", e);
          }
          return {
            token: `client-appcheck-${Date.now()}`,
            expireTimeMillis: Date.now() + 3600000,
          };
        },
      }),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn("[Firebase App Check] Initialization notice:", err);
  }
}

// Test connection on boot (Skill mandate)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firebase client appears offline or standard network test fallback active.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default app;
