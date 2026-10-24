import { initializeApp, cert, getApps, getApp, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getDatabase, Database } from "firebase-admin/database";
import { getAppCheck, AppCheck } from "firebase-admin/app-check";

const FALLBACK_KEY_B64 = "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2d0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktrd2dnU2xBZ0VBQW9JQkFRREE4T0NpL1JTRkQwdTIKQ1FvczFYK0JRVjcvNzJrU2xPTW5ya2xycmRhQ2xiaU5rSy9xQ01CWFBSM1BiOUtxeXpaUEEzejFTcTdXMmNjbQprU1BITEZreHVtV3FCRGE0d2ZjQWRSWlU3WTNKVzNrcG5XUm1TRFBqM2ZBNWl1YTlERFplZzR2QXhlMUI4dmxlCkNyRUVaU0FCT0lPRERKK3NlVkc0RmV0SlFMUDNudzlneVNqSzQ2STgvRktEV3gzcDQ1eFVUaWtqQTA5QmhoaDEKN3l3TjZFWkhuSVFnVVl2eHU0bDMvcU9UV0tZZkIycEdqNjdaSHpzLzFXU0JkMHA0b00rdUxqYmNZeGpYNTFHZwpIVmRwRGdLbVFpWTdpYU4xTXpGN2NCWmV3V3NEVlg1VFNaaUFsNXYxY2g2citWcFM5OFo1blJ3R2Q0SlIvZFEzCjZMckgxSEdUQWdNQkFBRUNnZ0VBTVpjWDNieVhwQldJMjZwYUk2amlRMG9XalVpdkpIZ0JKSWRPMXE3UkpqSXUKUTdDUERtT2VjQzNFdGpiakdrUHQyd1FsLzNQcEdVN1RPWTN2ZUxkazIzdXh1cStua3ZoRHNLbm5pZitleEVUUApFUXVqclFoYzBmSU8xdk5sRiswR0ltZkVLVkdXQ0MvWHVUeWRQK2h2Ly9CVEdRRkxId3oxbkkrQnNJdkJWZURwClVkb1JFYUdUZDRpSGNuZ3hoTWtKWGhWUmtjTlA4Zk1qS3dIUlJjdU5hK1lNV2xkQVM5MUNxUGd5UXA2dEhJcVoKdmF1eVdXSllHSnVhbENZdmhKY0NzeGU4NG9ZTXRCdVVFSVJkZkV5V29xQUpJdHpzTmNKN25lMUpYZXJwb0JTaQpvcXhrVEdaVUR0WkV0eVZndEduSFJzWWMvQWtFeklUczhrbTU5NDA2NlFLQmdRRGlxWHV0bC9OYUNwaUs2Slo3CjgwdVRGc1hSY0g1cmh1U1BLYnhMdGdqRkNpYjRkMUs3YU9aTUtYSlcwbE0wcndlN0N3RXJsK3FDSGJ4ekxzN3EKdHE1V2pHUERaMVhLSlZGbFJjbGY0NmRPNHUvVzFnS3Fkd1k3MDNUMHRlZGRUZHFjcDVDRW1UN3Q4QlZHZytNbQpnRnYvTkEyaHhWMWV0Z2trckl6T3ZiMllTUUtCZ1FEWjZnam05cjdQd29paWY4Sm9CNGZ5Wld5UThrU3EvZE8xCnoxZFMrS055Z2FyaTJoRk82d0NtMkVBUVlESmhMaHIxMkdSSkErN1VJQksxYnBSb3ZqRmZaSlFrVVcvVTRINTQKYWloWldzenVkQ3NvRXQ5MS8vc3lOcDA2SjhlbDkvT09ndGtUeFNSSkxrY2tHKzFTa0VGSHJXNklSYVZ1Q0U0dAp3R2VOVm1NUyt3S0JnUUNUOW91VU1PTmRYaGxpWko4SDN6VHdtaWNjcDlEL0pKbkRrejBtTjNqV0YrQ0V4bkF0Cmd6Y0RkUEw5Rm1QV3VvUFRhRVdsVFpCNnpDcWZEbWxvODBRdm40bm9uMlp6aFpUekJYR0Z0VGtjMkN3MUZKTzgKNytJVDMrQXpkeVBIMXZEazNzWUtxWGRaSUNialYybExVdk83VHlHdS93WUtzODZZTUVQakdoM1FjUUtCZ1FDaQpsQ0FtS1FzOU9CYjJuYmp1SWtoRUNYV1JRcDhHcjY5SElyVTAydm9lMFMwc2FLT25MRjlsRzB2WXE5eUtjbnA4CjF3QWpGWU1XMGdNRFI4Z0R5WHBPZ0Z5aUovdjJaN01UcGFnSzJscXd3UXo5cmU3NE80NHU3VjRxYUVsa3d2UDgKYkJVRzBmdDdlY0pyNTBZTlprQzkrRi9SM1p4SjFucDFXZW9vSWI1ekJ3S0JnUUNHUVJzUVg0R051VGY0L2lqRwo2RWNzdmNrTTJMV0NHbitZUzljM2F0ZGNUUnBtdWFUSEo1VVF6MDNFeVBsZXlFbkhWUUgrblhnNGhHYU1QYS9hCnh4R2hQcS9xR1phTmJ3MlZiMmxDbXMwdTNCM3BtRjFNZ1E1T2Y4SE42dytHdjZvWXFJVVJhMnFJZFJMNGk1ZkoKdGFPaEVUclpKQ3VFQ1ZhdmdWdno4aTZFNkE9PQotLS0tLUVORCBQUklWQVRFIEtFWS0tLS0t";

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : Buffer.from(FALLBACK_KEY_B64, "base64").toString("utf-8");

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@livingstoneedu-1ef57.iam.gserviceaccount.com";
const projectId = process.env.FIREBASE_PROJECT_ID || "livingstoneedu-1ef57";
const databaseURL = process.env.FIREBASE_DATABASE_URL || "https://livingstoneedu-1ef57-default-rtdb.firebaseio.com/";

let firebaseAdminApp: App | null = null;

export function getFirebaseAdmin(): App | null {
  if (!firebaseAdminApp) {
    if (getApps().length > 0) {
      firebaseAdminApp = getApp();
    } else {
      try {
        if (!privateKey || !privateKey.includes("PRIVATE KEY")) {
          console.error("[Firebase Admin] INVALID: FIREBASE_PRIVATE_KEY must be a valid PEM key with BEGIN/END headers");
          console.error("[Firebase Admin] Current key starts with:", privateKey?.substring(0, 30) || "(empty)");
          return null;
        }
        if (!clientEmail || !clientEmail.includes("@")) {
          console.error("[Firebase Admin] INVALID: FIREBASE_CLIENT_EMAIL must be a valid email (got:", clientEmail, ")");
          return null;
        }
        if (!databaseURL || !databaseURL.includes("firebaseio.com")) {
          console.error("[Firebase Admin] INVALID: FIREBASE_DATABASE_URL must be a valid RTDB URL (got:", databaseURL, ")");
          return null;
        }

        firebaseAdminApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          databaseURL,
        });
        console.log("[Firebase Admin] Initialized successfully for project:", projectId);
        console.log("[Firebase Admin] Database URL:", databaseURL);
        console.log("[Firebase Admin] Service account:", clientEmail);
      } catch (err) {
        console.error("[Firebase Admin] INITIALIZATION FAILED:", (err as any)?.message || err);
        console.error("[Firebase Admin] This means Firebase RTDB persistence is DISABLED. All data will be in-memory only.");
        console.error("[Firebase Admin] Check: FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID");
      }
    }
  }
  return firebaseAdminApp;
}

export function getAdminAuth(): Auth | null {
  const app = getFirebaseAdmin();
  return app ? getAuth(app) : null;
}

export function getAdminDatabase(): Database | null {
  const app = getFirebaseAdmin();
  return app ? getDatabase(app) : null;
}

export function getAdminAppCheck(): AppCheck | null {
  const app = getFirebaseAdmin();
  return app ? getAppCheck(app) : null;
}
