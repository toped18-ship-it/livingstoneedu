import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "./firebase";

/**
 * Client-side live data bus.
 *
 * Every admin panel change is persisted to the backend API and then broadcast two ways:
 *  1. instantly in this tab via `notifyDataChanged()` -> window event -> REST refetch;
 *  2. to every open tab/device via the backend's `live/*` Firebase RTDB sync (5s).
 * `useLiveData` views automatically re-render whenever the store updates.
 */

export const LIVE_DATA_EVENT = "app:data-changed";

interface LiveEntry {
  data: any;
  version: number;
}

interface StoreConfig {
  path: string;
  decode: (payload: any) => any;
}

const FEMALE_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80";
const MALE_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80";
const STORE_AVATAR =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80";

const STORE_CONFIG: Record<string, StoreConfig> = {
  students: {
    path: "/api/students",
    decode: (payload: any) =>
      (payload?.data || []).map((s: any) => ({
        avatar: s?.avatar || (s?.gender === "Female" ? FEMALE_AVATAR : MALE_AVATAR),
        ...s,
      })),
  },
  teachers: {
    path: "/api/teachers",
    decode: (payload: any) =>
      (payload?.data || []).map((t: any) => ({
        avatar: t?.avatar || STORE_AVATAR,
        phone: t?.phone || "+234 800 000 0000",
        ...t,
      })),
  },
  teacherInvitations: {
    path: "/api/teachers/invitations",
    decode: (payload: any) => payload?.data || [],
  },
  questionBank: {
    path: "/api/question-bank",
    decode: (payload: any) => payload?.data || [],
  },
  libraryBooks: {
    path: "/api/library/books",
    decode: (payload: any) => payload?.data || [],
  },
  emailSubscribers: {
    path: "/api/gmail/subscribers",
    decode: (payload: any) => payload?.data || [],
  },
  attendanceRegister: {
    path: "/api/attendance/registers",
    decode: (payload: any) => payload?.data || [],
  },
  teacherLessons: {
    path: "/api/teacher/lesson-notes",
    decode: (payload: any) => payload?.data || [],
  },
  teacherExams: {
    path: "/api/teacher/exams",
    decode: (payload: any) => payload?.data || [],
  },
  users: {
    path: "/api/superadmin/users",
    decode: (payload: any) => payload?.data || [],
  },
  studentFees: {
    path: "/api/student/fees",
    decode: (payload: any) => payload?.data || [],
  },
  lessonNotes: {
    path: "/api/lesson-notes",
    decode: (payload: any) => payload?.data || [],
  },
  appSettings: {
    path: "/api/settings",
    decode: (payload: any) => (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data) ? payload.data : (payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {})),
  },
};

/** Snapshot shape written by the server into RTDB `live/<store>` */
function decodeSnapshot(name: string, val: any): any {
  if (val === null || val === undefined) return name === "appSettings" ? {} : [];
  if (name === "appSettings") {
    return typeof val === "object" && !Array.isArray(val) ? val : {};
  }
  const items = Array.isArray(val) ? val : Object.values(val);
  const cfg = STORE_CONFIG[name];
  return cfg ? cfg.decode({ data: items }) : items;
}

const StoreContext = createContext<{ entries: Record<string, LiveEntry> } | null>(null);

export const LiveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<Record<string, LiveEntry>>({});
  const entriesRef = useRef<Record<string, LiveEntry>>({});
  const hashesRef = useRef<Record<string, string>>({});

  const commit = useCallback((name: string, data: any) => {
    const key = JSON.stringify(data);
    if (hashesRef.current[name] === key) return;
    hashesRef.current[name] = key;
    const prev = entriesRef.current[name];
    entriesRef.current = {
      ...entriesRef.current,
      [name]: { data, version: (prev?.version ?? 0) + 1 },
    };
    setEntries(entriesRef.current);
  }, []);

  const loadFromApi = useCallback(
    async (name: string) => {
      const cfg = STORE_CONFIG[name];
      if (!cfg) return;
      try {
        const res = await fetch(cfg.path);
        const payload = await res.json();
        commit(name, cfg.decode(payload));
      } catch (err) {
        console.warn(`LiveStore: failed to fetch ${cfg.path}`, err);
      }
    },
    [commit]
  );

  // Initial REST load + realtime RTDB subscription for every configured store
  useEffect(() => {
    const unsubs: (() => void)[] = [];
    Object.keys(STORE_CONFIG).forEach((name) => {
      loadFromApi(name);
      try {
        const dbRef = ref(rtdb, `live/${name}`);
        unsubs.push(
          onValue(dbRef, (snap) => {
            commit(name, decodeSnapshot(name, snap.val()));
          })
        );
      } catch (err) {
        console.warn(`LiveStore: RTDB subscription failed for "${name}":`, err);
      }
    });
    return () => unsubs.forEach((un) => un());
  }, [loadFromApi, commit]);

  // Reroute same-tab changes (and other tabs) into the live bus
  useEffect(() => {
    const handler = (e: Event) => {
      const names = (e as CustomEvent<{ names?: string[] }>).detail?.names;
      const targets = names && names.length ? names : Object.keys(STORE_CONFIG);
      targets.forEach((n) => loadFromApi(n));
    };
    window.addEventListener(LIVE_DATA_EVENT, handler);
    return () => window.removeEventListener(LIVE_DATA_EVENT, handler);
  }, [loadFromApi]);

  const value = useMemo(() => ({ entries }), [entries]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

/** Subscribe a view to a live store. Re-renders on every server-side/broadcast change. */
export function useLiveData<T = any>(name: string): { data: T[]; version: number } {
  const ctx = useContext(StoreContext);
  const entry = ctx?.entries[name];
  return {
    data: (entry?.data as T[]) || [],
    version: entry?.version ?? 0,
  };
}

/** Subscribe to live application & school settings; auto-updates when admin saves changes */
export function useAppSettings(): {
  settings: Record<string, any>;
  updateSettings: (newSettings: Partial<Record<string, any>>) => Promise<void>;
  version: number;
} {
  const ctx = useContext(StoreContext);
  const entry = ctx?.entries["appSettings"];
  const [localSettings, setLocalSettings] = useState<Record<string, any>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("livingstone_app_settings");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  const merged = useMemo(() => {
    const live = entry?.data && typeof entry.data === "object" && !Array.isArray(entry.data) ? entry.data : {};
    return { ...localSettings, ...live };
  }, [entry?.data, localSettings]);

  useEffect(() => {
    const handleSettingsChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail === "object") {
        setLocalSettings((prev) => ({ ...prev, ...detail }));
      }
    };
    window.addEventListener("app:settings-changed", handleSettingsChanged);
    return () => window.removeEventListener("app:settings-changed", handleSettingsChanged);
  }, []);

  const updateSettings = useCallback(
    async (newSettings: Partial<Record<string, any>>) => {
      const next = { ...merged, ...newSettings };
      setLocalSettings(next);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("livingstone_app_settings", JSON.stringify(next));
          if (next.schoolName) {
            localStorage.setItem("livingstone_registered_school", next.schoolName);
          }
          window.dispatchEvent(new CustomEvent("app:settings-changed", { detail: next }));
        } catch (e) {}
      }
      try {
        await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        notifyDataChanged(["appSettings"]);
      } catch (e) {}
    },
    [merged]
  );

  return {
    settings: merged,
    updateSettings,
    version: entry?.version ?? 0,
  };
}

/** Broadcast that one or more stores changed; every subscribed view refetches immediately. */
export function notifyDataChanged(names: string[]): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(LIVE_DATA_EVENT, { detail: { names } }));
}

/** Run `handler` whenever any store in the app changes (e.g. self-contained dashboards). */
export function useGlobalRefresh(handler: () => void, enabled = true): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    if (!enabled) return;
    const listener = () => handlerRef.current();
    window.addEventListener(LIVE_DATA_EVENT, listener);
    return () => window.removeEventListener(LIVE_DATA_EVENT, listener);
  }, [enabled]);
}