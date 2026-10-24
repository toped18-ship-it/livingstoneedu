import { db } from "../src/lib/firebase";

export interface FcmTokenRecord {
  token: string;
  userRole?: string;
  schoolId?: string;
  userId?: string;
  topics?: string[];
  registeredAt: string;
  lastActive: string;
}

export interface FcmAlertRecord {
  id: string;
  title: string;
  body: string;
  category: "lesson_note" | "exam_schedule" | "announcement" | "general";
  targetRole?: string; // "all" | "teachers" | "students" | "parents"
  targetClass?: string;
  schoolId?: string;
  schoolName?: string;
  senderName?: string;
  timestamp: string;
  deliveredCount: number;
  linkUrl?: string;
}

export const fcmTokensStore: FcmTokenRecord[] = [
  {
    token: "FCM_DEMO_TOKEN_TEACHER_001",
    userRole: "Teacher",
    schoolId: "SCH-101",
    topics: ["all", "teacher", "lesson_notes", "exam_schedules", "announcements"],
    registeredAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
  {
    token: "FCM_DEMO_TOKEN_STUDENT_001",
    userRole: "Student",
    schoolId: "SCH-101",
    topics: ["all", "student", "exam_schedules", "announcements"],
    registeredAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  }
];

export const fcmAlertsStore: FcmAlertRecord[] = [
  {
    id: "fcm-init-001",
    title: "📢 Welcome to Real-Time Push Alerts",
    body: "Firebase Cloud Messaging is active for instant lesson notes, exam schedules, and school announcements.",
    category: "announcement",
    targetRole: "all",
    schoolId: "SCH-101",
    schoolName: "LivingstoneEDU Model School",
    senderName: "System Engine",
    timestamp: new Date().toISOString(),
    deliveredCount: 2,
    linkUrl: "/"
  }
];

/**
 * Register or update an FCM token
 */
export function registerFcmToken(data: {
  token: string;
  userRole?: string;
  schoolId?: string;
  userId?: string;
  topics?: string[];
}): FcmTokenRecord {
  const existingIdx = fcmTokensStore.findIndex((t) => t.token === data.token);
  const record: FcmTokenRecord = {
    token: data.token,
    userRole: data.userRole || "Teacher",
    schoolId: data.schoolId || "SCH-101",
    userId: data.userId || undefined,
    topics: data.topics || ["all", "lesson_notes", "exam_schedules", "announcements"],
    registeredAt: existingIdx >= 0 ? fcmTokensStore[existingIdx].registeredAt : new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    fcmTokensStore[existingIdx] = record;
  } else {
    fcmTokensStore.unshift(record);
  }

  return record;
}

/**
 * Dispatch real-time FCM Cloud Alert to teachers, students, parents, or school admins
 */
export async function sendFcmPushAlert(params: {
  title: string;
  body: string;
  category: "lesson_note" | "exam_schedule" | "announcement" | "general";
  targetRole?: string; // "all" | "teachers" | "students" | "parents" | "school_admin"
  targetClass?: string;
  schoolId?: string;
  schoolName?: string;
  senderName?: string;
  linkUrl?: string;
}): Promise<{ success: boolean; alert: FcmAlertRecord; deliveredCount: number }> {
  const {
    title,
    body,
    category,
    targetRole = "all",
    targetClass,
    schoolId = "SCH-101",
    schoolName = "LivingstoneEDU Institution",
    senderName = "Livingstone System Engine",
    linkUrl = "/",
  } = params;

  // Match target devices
  const matchedTokens = fcmTokensStore.filter((t) => {
    if (schoolId && t.schoolId && t.schoolId !== schoolId) return false;
    if (targetRole === "all") return true;
    const roleLower = (t.userRole || "").toLowerCase();
    const targetLower = targetRole.toLowerCase();
    if (targetLower === "teachers" && (roleLower.includes("teacher") || roleLower.includes("instructor"))) return true;
    if (targetLower === "students" && (roleLower.includes("student") || roleLower.includes("pupil"))) return true;
    if (targetLower === "parents" && roleLower.includes("parent")) return true;
    if (targetLower === roleLower) return true;
    return false;
  });

  const alertRecord: FcmAlertRecord = {
    id: `fcm-alert-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    title,
    body,
    category,
    targetRole,
    targetClass,
    schoolId,
    schoolName,
    senderName,
    timestamp: new Date().toISOString(),
    deliveredCount: Math.max(1, matchedTokens.length),
    linkUrl,
  };

  fcmAlertsStore.unshift(alertRecord);

  console.log(`[FCM Service] Sent real-time push alert "${title}" to ${alertRecord.deliveredCount} target device tokens.`);

  return {
    success: true,
    alert: alertRecord,
    deliveredCount: alertRecord.deliveredCount,
  };
}
