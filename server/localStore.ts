import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const PERSISTENT_FILE = path.join(DATA_DIR, "persistent_users_data.json");

export interface PersistentPayload {
  users?: any[];
  students?: any[];
  teachers?: any[];
  teacherInvitations?: any[];
  staffAccounts?: any[];
  superAdminSchools?: any[];
  superAdminUsers?: any[];
  studentProfiles?: any[];
  verifiedSchools?: any[];
  superAdminPayments?: any[];
  allStores?: Record<string, any>;
  demoPurged?: boolean;
  lastSaved?: string;
}

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("[LocalStore] Could not create data directory:", e);
}

/**
 * Load persistent users and records from local disk.
 * Runs synchronously on server startup before serving requests.
 */
export function loadPersistentUsersData(): PersistentPayload | null {
  try {
    if (fs.existsSync(PERSISTENT_FILE)) {
      const raw = fs.readFileSync(PERSISTENT_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      console.log(
        `[LocalStore] Successfully restored registered records from disk (${parsed.users?.length || 0} users, ${parsed.students?.length || 0} students, ${parsed.teachers?.length || 0} teachers, ${parsed.teacherInvitations?.length || 0} teacher invites).`
      );
      return parsed;
    }
  } catch (err: any) {
    console.warn("[LocalStore] Notice: Error reading persistent data file:", err?.message || err);
  }
  return null;
}

let saveDebounceTimer: NodeJS.Timeout | null = null;
let lastPayload: PersistentPayload | null = null;

function executeDiskWrite(payload: PersistentPayload): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const dataToSave: PersistentPayload = {
      ...payload,
      lastSaved: new Date().toISOString()
    };
    fs.writeFileSync(PERSISTENT_FILE, JSON.stringify(dataToSave, null, 2), "utf-8");
  } catch (err: any) {
    console.warn("[LocalStore] Could not write persistent data to disk:", err?.message || err);
  }
}

/**
 * Save persistent users and records to local disk.
 * When immediate is true, writes synchronously without debounce.
 */
export function savePersistentUsersData(payload: PersistentPayload, immediate = false): void {
  lastPayload = payload;

  if (immediate) {
    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
      saveDebounceTimer = null;
    }
    executeDiskWrite(payload);
    return;
  }

  if (saveDebounceTimer) clearTimeout(saveDebounceTimer);

  saveDebounceTimer = setTimeout(() => {
    saveDebounceTimer = null;
    if (lastPayload) executeDiskWrite(lastPayload);
  }, 200);
}

// Emergency flush on server shutdown signals to prevent any data loss
if (typeof process !== "undefined") {
  const flushOnExit = () => {
    if (lastPayload) {
      try {
        executeDiskWrite(lastPayload);
      } catch (e) {}
    }
  };
  process.on("beforeExit", flushOnExit);
}
