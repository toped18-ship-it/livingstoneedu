import { getAdminDatabase } from "./firebaseAdmin";

interface RegisteredStore {
  name: string;
  getData: () => unknown;
  setData: (items: unknown) => void;
}

const registeredStores: RegisteredStore[] = [];
let syncSuccessLogged = false;
let lastSyncError: string | null = null;
let consecutiveFailures = 0;

export function encodeKey(key: string): string {
  return key
    .replaceAll(".", "_DOT_")
    .replaceAll("#", "_HASH_")
    .replaceAll("$", "_DOLLAR_")
    .replaceAll("/", "_SLASH_")
    .replaceAll("[", "_LBRACKET_")
    .replaceAll("]", "_RBRACKET_");
}

export function decodeKey(key: string): string {
  return key
    .replaceAll("_RBRACKET_", "]")
    .replaceAll("_LBRACKET_", "[")
    .replaceAll("_SLASH_", "/")
    .replaceAll("_DOLLAR_", "$")
    .replaceAll("_HASH_", "#")
    .replaceAll("_DOT_", ".");
}

export function registerStore(
  name: string,
  getData: () => unknown,
  setData: (items: unknown) => void
): void {
  registeredStores.push({ name, getData, setData });
}

export function getRegisteredStoreCount(): number {
  return registeredStores.length;
}

export function getRegisteredStoresSnapshot(): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};
  for (const store of registeredStores) {
    try {
      snapshot[store.name] = store.getData();
    } catch (e) {}
  }
  return snapshot;
}

export function restoreRegisteredStoresFromSnapshot(snapshot: Record<string, unknown>): number {
  if (!snapshot || typeof snapshot !== "object") return 0;
  let restored = 0;
  for (const store of registeredStores) {
    const savedData = snapshot[store.name];
    if (savedData !== undefined && savedData !== null) {
      try {
        store.setData(savedData);
        restored++;
      } catch (e) {
        console.warn(`[FirebaseStore] Notice restoring ${store.name}:`, e);
      }
    }
  }
  return restored;
}

export function getSyncStatus(): { storeCount: number; lastError: string | null; consecutiveFailures: number } {
  return { storeCount: registeredStores.length, lastError: lastSyncError, consecutiveFailures };
}

let isHydrationCompleted = false;
const intentionalEmptyStores = new Set<string>();

export function markHydrationCompleted(completed: boolean = true): void {
  isHydrationCompleted = completed;
}

export function isStoreHydrated(): boolean {
  return isHydrationCompleted;
}

export function markStoreIntentionalEmpty(storeName: string): void {
  intentionalEmptyStores.add(storeName);
}

export function markAllStoresIntentionalEmpty(): void {
  for (const store of registeredStores) {
    intentionalEmptyStores.add(store.name);
  }
}

export function clearStoreIntentionalEmpty(storeName: string): void {
  intentionalEmptyStores.delete(storeName);
}

export async function persistDemoPurgedToCloud(): Promise<void> {
  const db = getAdminDatabase();
  if (!db) return;
  try {
    await db.ref("system/demoPurged").set(true);
    await db.ref("system/demoPurgedAt").set(new Date().toISOString());
  } catch (e) {
    console.warn("[Firebase RTDB] Failed to write system/demoPurged to cloud:", e);
  }
}

export async function hydrateStoresFromFirebase(): Promise<void> {
  const db = getAdminDatabase();
  if (!db) {
    console.warn("[Firebase RTDB] Admin Database unavailable — skipping Firebase RTDB store hydration.");
    isHydrationCompleted = true;
    return;
  }

  try {
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => {
        console.warn("[Firebase RTDB] Hydration probe timed out (2.5s) — continuing with local storage state.");
        resolve(null);
      }, 2500)
    );
    const snap = await Promise.race([db.ref("live").get(), timeoutPromise]);
    if (!snap) {
      isHydrationCompleted = true;
      return;
    }
    const liveData = snap.val();
    if (!liveData || typeof liveData !== "object") {
      console.log("[Firebase RTDB] No live data found in Firebase RTDB yet.");
      isHydrationCompleted = true;
      return;
    }

    let hydratedCount = 0;
    for (const store of registeredStores) {
      const rawStoreData = liveData[store.name];
      if (rawStoreData === undefined || rawStoreData === null) continue;

      try {
        let parsedData: unknown = rawStoreData;
        const currentData = store.getData();
        if (Array.isArray(currentData)) {
          if (Array.isArray(rawStoreData)) {
            parsedData = rawStoreData;
          } else if (typeof rawStoreData === "object") {
            parsedData = Object.values(rawStoreData);
          }
        } else if (currentData && typeof currentData === "object") {
          if (typeof rawStoreData === "object" && !Array.isArray(rawStoreData)) {
            const decodedObj: Record<string, unknown> = {};
            Object.entries(rawStoreData).forEach(([k, v]) => {
              decodedObj[decodeKey(k)] = v;
            });
            parsedData = decodedObj;
          }
        }

        if (parsedData !== undefined && parsedData !== null) {
          if (Array.isArray(parsedData)) {
            const DEMO_EMAILS = new Set([
              "admin@livingstone.edu",
              "admin@livingstone.edu.ng",
              "admin@school.com",
              "admin",
              "principal@livingstone.edu",
              "david.alabi@livingstone.edu",
              "beatrice.okonkwo@livingstone.edu",
              "bursar@livingstone.edu",
              "exam.officer@livingstone.edu",
              "abubakar.musa@gmail.com",
              "peter.obioma@destiny.edu.ng",
              "folake.balogun@destiny.edu.ng",
              "ibrahim.danjuma@destiny.edu.ng",
            ]);
            const DEMO_IDS = new Set([
              "usr-1",
              "usr-1-ng",
              "usr-001",
              "usr-002",
              "usr-003",
              "usr-004",
              "usr-005",
              "usr-006",
              "usr-destiny-admin",
              "usr-destiny-admin-2",
              "usr-admin-alias",
              "usr-admin-school",
              "STD-2026-001",
              "STD-2026-002",
              "STD-2026-003",
              "STD-2026-004",
              "STD-2026-005",
              "STD-2026-006",
              "inv-901",
              "inv-902",
              "inv-903",
              "b-1",
              "b-2",
              "b-3",
              "b-4",
            ]);
            parsedData = (parsedData as any[]).filter((item) => {
              if (!item || typeof item !== "object") return false;
              if (item.isDemo) return false;
              const id = String(item.id || item.uid || item.studentId || "").trim();
              const email = String(item.email || "").toLowerCase().trim();
              if (DEMO_IDS.has(id)) return false;
              if (email && DEMO_EMAILS.has(email)) return false;
              if (email.endsWith("@destiny.edu.ng") || (email.endsWith("@livingstone.edu") && !email.includes("livingstoneedu64@gmail.com"))) return false;
              return true;
            });
          }
          store.setData(parsedData);
          hydratedCount++;
        }
      } catch (storeErr) {
        console.warn(`[Firebase RTDB] Failed to hydrate store "${store.name}":`, storeErr);
      }
    }

    isHydrationCompleted = true;
    console.log(`[Firebase RTDB] Successfully hydrated ${hydratedCount} stores from Firebase Realtime Database as authoritative primary store.`);
  } catch (err: any) {
    isHydrationCompleted = true;
    console.error("[Firebase RTDB] Error during store hydration from Firebase:", err?.message || err);
  }
}

export async function syncStoresToFirebase(options?: { allowEmptyStoreDeletion?: boolean }): Promise<void> {
  const db = getAdminDatabase();
  if (!db) {
    console.warn("[Firebase RTDB] syncStores: Admin Database unavailable — skipping sync");
    return;
  }

  if (consecutiveFailures >= 3 && consecutiveFailures % 10 !== 0) {
    consecutiveFailures++;
    return;
  }

  const updates: Record<string, unknown> = {};

  for (const store of registeredStores) {
    try {
      const data = store.getData();
      if (Array.isArray(data)) {
        if (data.length === 0) {
          // Empty store is the user's intentional clean zero state: clear in Firebase RTDB
          updates[store.name] = null;
        } else {
          intentionalEmptyStores.delete(store.name);
          const keyed: Record<string, unknown> = {};
          data.forEach((item) => {
            if (!item || typeof item !== "object") return;
            const rawId =
              (item as Record<string, unknown>).id ??
              (item as Record<string, unknown>).studentId ??
              (item as Record<string, unknown>).admissionNumber ??
              (item as Record<string, unknown>).code ??
              `k-${Math.random().toString(36).slice(2, 8)}`;
            keyed[encodeKey(String(rawId))] = item;
          });
          updates[store.name] = keyed;
        }
      } else if (data && typeof data === "object") {
        const keyed: Record<string, unknown> = {};
        Object.entries(data as Record<string, unknown>).forEach(([k, v]) => {
          keyed[encodeKey(k)] = v;
        });
        updates[store.name] = keyed;
      }
    } catch (err) {
      console.error(`[Firebase RTDB] sync failed for "${store.name}":`, (err as any)?.message || err);
    }
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  try {
    await Promise.all(
      Object.entries(updates).map(([storeName, val]) =>
        db.ref(`live/${storeName}`).set(val)
      )
    );
    lastSyncError = null;
    consecutiveFailures = 0;
    if (!syncSuccessLogged) {
      console.log("[Firebase RTDB] First successful sync —", Object.keys(updates).length, "stores synchronized to live/");
      syncSuccessLogged = true;
    }
  } catch (err: any) {
    consecutiveFailures++;
    lastSyncError = err?.message || String(err);
    console.error("[Firebase RTDB] live update FAILED:", err?.message || err);
  }
}

/**
 * Test Firebase connectivity: write a test record, read it back, then delete it.
 * Returns detailed diagnostic information.
 */
export async function testFirebaseWrite(): Promise<{
  success: boolean;
  firebase: string;
  database: string;
  writePath?: string;
  writeTime?: string;
  readBack?: boolean;
  error?: string;
}> {
  const db = getAdminDatabase();
  if (!db) {
    return {
      success: false,
      firebase: "disconnected",
      database: "none",
      error: "Admin Database unavailable — Firebase Admin SDK not initialized. Check FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID.",
    };
  }

  const testPath = `firebaseDiagnostics/${Date.now()}`;
  const testData = {
    test: true,
    timestamp: new Date().toISOString(),
    message: "LIVINGSTONEEDU Firebase connectivity test",
  };

  try {
    // WRITE
    await db.ref(testPath).set(testData);
    const writeTime = new Date().toISOString();

    // READ BACK
    const snap = await db.ref(testPath).get();
    const readData = snap.val();
    const readBack = readData !== null && readData.test === true && readData.timestamp === testData.timestamp;

    // CLEANUP
    await db.ref(testPath).remove();

    return {
      success: true,
      firebase: "connected",
      database: "realtime",
      writePath: testPath,
      writeTime,
      readBack,
    };
  } catch (err) {
    return {
      success: false,
      firebase: "error",
      database: "realtime",
      error: (err as any)?.message || String(err),
    };
  }
}

/**
 * Get Firebase health status without writing test data.
 */
export async function getFirebaseHealth(): Promise<{
  success: boolean;
  firebase: string;
  database: string;
  registeredStores: number;
  syncStatus: string;
  lastSyncError: string | null;
  consecutiveFailures: number;
  error?: string;
}> {
  const db = getAdminDatabase();
  if (!db) {
    return {
      success: false,
      firebase: "disconnected",
      database: "none",
      registeredStores: registeredStores.length,
      syncStatus: "skipped",
      lastSyncError: null,
      consecutiveFailures: 0,
      error: "Admin Database unavailable",
    };
  }

  try {
    // Quick read test — read one store to verify RTDB connectivity
    const snap = await db.ref("live").limitToFirst(1).get();
    return {
      success: true,
      firebase: "connected",
      database: "realtime",
      registeredStores: registeredStores.length,
      syncStatus: consecutiveFailures > 0 ? `failing (${consecutiveFailures} consecutive)` : "healthy",
      lastSyncError,
      consecutiveFailures,
    };
  } catch (err) {
    return {
      success: false,
      firebase: "error",
      database: "realtime",
      registeredStores: registeredStores.length,
      syncStatus: "error",
      lastSyncError: (err as any)?.message || String(err),
      consecutiveFailures,
      error: (err as any)?.message || String(err),
    };
  }
}
