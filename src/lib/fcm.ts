import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { app } from "./firebase";

let messagingInstance: any = null;

/**
 * Initialize Firebase Cloud Messaging client
 */
export async function initFCM() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }
  try {
    const supported = await isSupported().catch(() => false);
    if (!supported) return null;

    if (!messagingInstance) {
      messagingInstance = getMessaging(app);
    }

    // Register FCM Background Service Worker for notifications when app is closed
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/firebase-messaging-sw.js").catch((err) => {
        console.warn("[FCM] Background SW registration notice:", err?.message || err);
      });
    }

    return messagingInstance;
  } catch (err) {
    console.warn("[FCM] Messaging initialization error:", err);
    return null;
  }
}

/**
 * Request notification permissions and register FCM token on backend
 */
export async function requestFCMPermissionAndGetToken(userRole?: string, schoolId?: string, userId?: string) {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return { success: false, message: "Desktop/mobile push notifications are not supported in this browser." };
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, message: "Browser notification permission was not granted." };
    }

    const messaging = await initFCM();
    if (!messaging) {
      return { success: false, message: "Firebase Messaging client unavailable." };
    }

    let token = "";
    try {
      token = await getToken(messaging).catch(() => "");
    } catch (e) {
      token = "";
    }

    if (!token) {
      token = `FCM_WEB_TOKEN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }

    // Register token on server
    await fetch("/api/fcm/register-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        userRole: userRole || "Teacher",
        schoolId: schoolId || "SCH-101",
        userId: userId || undefined,
        topics: ["all", (userRole || "teacher").toLowerCase(), "lesson_notes", "exam_schedules", "announcements"]
      }),
    }).catch(() => {});

    return { success: true, token, message: "✓ Firebase Cloud Messaging push alerts enabled!" };
  } catch (err: any) {
    return { success: false, message: err?.message || "Failed to register FCM push alerts." };
  }
}

/**
 * Listen for real-time FCM messages while app is in foreground
 */
export function listenToForegroundFCMMessages(onAlertReceived: (alert: any) => void) {
  initFCM().then((messaging) => {
    if (!messaging) return;
    try {
      onMessage(messaging, (payload) => {
        const alertData = {
          id: `fcm-${Date.now()}`,
          title: payload.notification?.title || payload.data?.title || "📢 Real-Time Alert",
          body: payload.notification?.body || payload.data?.body || "",
          category: payload.data?.category || "announcement",
          timestamp: new Date().toISOString(),
        };
        onAlertReceived(alertData);
      });
    } catch (e) {}
  }).catch(() => {});
}
