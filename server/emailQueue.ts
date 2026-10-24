import { sendEmail, SendEmailOptions, EmailSendResult } from "./resendService";

export type EmailJobStatus = "queued" | "processing" | "delivered" | "failed" | "bounced" | "cancelled";

export interface EmailJob {
  id: string;
  idempotencyKey?: string;
  category: string;
  schoolId?: string;
  schoolName?: string;
  recipient: string;
  recipientName?: string;
  subject: string;
  payload: SendEmailOptions;
  status: EmailJobStatus;
  attempts: number;
  maxRetries: number;
  lastAttemptAt?: string;
  nextAttemptAt?: number;
  error?: string;
  messageId?: string;
  providerResponse?: any;
  createdAt: string;
  completedAt?: string;
}

export interface EmailDeliveryEvent {
  id: string;
  jobId?: string;
  messageId?: string;
  recipient: string;
  event: "sent" | "delivered" | "delayed" | "bounced" | "complained" | "rejected";
  schoolId?: string;
  timestamp: string;
  rawPayload?: any;
}

export interface NotificationRule {
  id: string;
  schoolId: string;
  category: string;
  enabled: boolean;
  autoSendParents: boolean;
  autoSendTeachers: boolean;
  autoSendStudents: boolean;
  minimumGradeThreshold?: number;
  updatedAt: string;
}

export interface UserEmailPreferences {
  email: string;
  schoolId?: string;
  unsubscribedAllNonEssential: boolean;
  academicAnnouncements: boolean;
  assignmentReminders: boolean;
  examReminders: boolean;
  aiJobCompletion: boolean;
  schoolEvents: boolean;
  feeNotices: boolean;
  updatedAt: string;
}

// Global in-memory persistent stores
export const emailJobsStore: EmailJob[] = [];
export const emailDeliveryEventsStore: EmailDeliveryEvent[] = [];
export const notificationRulesStore: NotificationRule[] = [];
export const emailPreferencesStore: UserEmailPreferences[] = [];

// Idempotency cache (key -> jobId)
const idempotencyCache = new Map<string, string>();

let isProcessingQueue = false;
let queueInterval: NodeJS.Timeout | null = null;

/**
 * Adds an email to the persistent background queue with duplicate prevention and idempotency.
 */
export function queueEmailJob(params: {
  category: string;
  recipient: string;
  recipientName?: string;
  subject: string;
  payload: SendEmailOptions;
  schoolId?: string;
  schoolName?: string;
  idempotencyKey?: string;
  maxRetries?: number;
}): { queued: boolean; jobId: string; duplicate?: boolean } {
  const {
    category,
    recipient,
    recipientName,
    subject,
    payload,
    schoolId,
    schoolName,
    idempotencyKey,
    maxRetries = 3,
  } = params;

  const cleanRecipient = recipient.trim().toLowerCase();

  // 1. Idempotency Check
  if (idempotencyKey) {
    const existingJobId = idempotencyCache.get(idempotencyKey);
    if (existingJobId) {
      const existingJob = emailJobsStore.find((j) => j.id === existingJobId);
      if (existingJob) {
        return { queued: false, jobId: existingJobId, duplicate: true };
      }
    }
  }

  const jobId = `job-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const newJob: EmailJob = {
    id: jobId,
    idempotencyKey,
    category,
    schoolId,
    schoolName,
    recipient: cleanRecipient,
    recipientName,
    subject,
    payload: {
      ...payload,
      to: cleanRecipient,
      subject,
    },
    status: "queued",
    attempts: 0,
    maxRetries,
    createdAt: new Date().toISOString(),
  };

  emailJobsStore.unshift(newJob);

  if (idempotencyKey) {
    idempotencyCache.set(idempotencyKey, jobId);
  }

  // Trigger instant queue worker
  processQueueImmediately();

  return { queued: true, jobId };
}

/**
 * Background worker to process pending queued email jobs with exponential backoff.
 */
export async function processEmailQueue(): Promise<{ processed: number; successCount: number; failureCount: number }> {
  if (isProcessingQueue) return { processed: 0, successCount: 0, failureCount: 0 };
  isProcessingQueue = true;

  let processed = 0;
  let successCount = 0;
  let failureCount = 0;

  try {
    const now = Date.now();
    const readyJobs = emailJobsStore.filter(
      (job) =>
        (job.status === "queued" || (job.status === "failed" && job.attempts < job.maxRetries)) &&
        (!job.nextAttemptAt || job.nextAttemptAt <= now)
    );

    for (const job of readyJobs.slice(0, 10)) {
      processed++;
      job.status = "processing";
      job.attempts++;
      job.lastAttemptAt = new Date().toISOString();

      const sendResult: EmailSendResult = await sendEmail(job.payload);

      if (sendResult.success) {
        successCount++;
        job.status = "delivered";
        job.messageId = sendResult.messageId;
        job.providerResponse = sendResult.data;
        job.completedAt = new Date().toISOString();
        job.error = undefined;

        emailDeliveryEventsStore.unshift({
          id: `evt-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          jobId: job.id,
          messageId: sendResult.messageId,
          recipient: job.recipient,
          event: "sent",
          schoolId: job.schoolId,
          timestamp: new Date().toISOString(),
          rawPayload: sendResult.data,
        });
      } else {
        failureCount++;
        job.error = sendResult.error;

        // Is error permanent (e.g. invalid email format) or temporary (network / rate limit)?
        const isPermanent =
          sendResult.errorCode === "INVALID_RECIPIENT_FORMAT" ||
          sendResult.errorCode === "MISSING_RECIPIENT" ||
          (sendResult.error && sendResult.error.toLowerCase().includes("not allowed to send"));

        if (isPermanent || job.attempts >= job.maxRetries) {
          job.status = "failed";
          job.completedAt = new Date().toISOString();
        } else {
          // Exponential backoff: attempt 1 -> 5s, attempt 2 -> 25s, attempt 3 -> 125s
          const backoffDelay = Math.pow(5, job.attempts) * 1000;
          job.status = "failed";
          job.nextAttemptAt = Date.now() + backoffDelay;
        }

        emailDeliveryEventsStore.unshift({
          id: `evt-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          jobId: job.id,
          recipient: job.recipient,
          event: "rejected",
          schoolId: job.schoolId,
          timestamp: new Date().toISOString(),
          rawPayload: { error: sendResult.error, code: sendResult.errorCode },
        });
      }
    }
  } catch (err) {
    console.error("[EmailQueue Error]", err);
  } finally {
    isProcessingQueue = false;
  }

  return { processed, successCount, failureCount };
}

function processQueueImmediately() {
  setTimeout(() => {
    processEmailQueue().catch(() => {});
  }, 50);
}

// Start recurring background processor (every 10 seconds)
export function startEmailQueueWorker() {
  if (queueInterval) return;
  queueInterval = setInterval(() => {
    processEmailQueue().catch(() => {});
  }, 10000);
}

// Retry a specific failed job
export async function retryEmailJob(jobId: string): Promise<{ success: boolean; message: string }> {
  const job = emailJobsStore.find((j) => j.id === jobId);
  if (!job) {
    return { success: false, message: "Email job not found." };
  }

  job.status = "queued";
  job.nextAttemptAt = undefined;
  processQueueImmediately();

  return { success: true, message: `Job ${jobId} queued for immediate retry.` };
}

// Email Preferences Helper
export function getUserPreferences(email: string): UserEmailPreferences {
  const cleanEmail = email.trim().toLowerCase();
  const existing = emailPreferencesStore.find((p) => p.email.toLowerCase() === cleanEmail);
  if (existing) return existing;

  return {
    email: cleanEmail,
    unsubscribedAllNonEssential: false,
    academicAnnouncements: true,
    assignmentReminders: true,
    examReminders: true,
    aiJobCompletion: true,
    schoolEvents: true,
    feeNotices: true,
    updatedAt: new Date().toISOString(),
  };
}

export function saveUserPreferences(prefs: Partial<UserEmailPreferences> & { email: string }): UserEmailPreferences {
  const cleanEmail = prefs.email.trim().toLowerCase();
  let existing = emailPreferencesStore.find((p) => p.email.toLowerCase() === cleanEmail);

  if (existing) {
    Object.assign(existing, prefs, { updatedAt: new Date().toISOString() });
  } else {
    existing = {
      email: cleanEmail,
      schoolId: prefs.schoolId,
      unsubscribedAllNonEssential: prefs.unsubscribedAllNonEssential ?? false,
      academicAnnouncements: prefs.academicAnnouncements ?? true,
      assignmentReminders: prefs.assignmentReminders ?? true,
      examReminders: prefs.examReminders ?? true,
      aiJobCompletion: prefs.aiJobCompletion ?? true,
      schoolEvents: prefs.schoolEvents ?? true,
      feeNotices: prefs.feeNotices ?? true,
      updatedAt: new Date().toISOString(),
    };
    emailPreferencesStore.unshift(existing);
  }

  return existing;
}

export function isRecipientOptedIn(email: string, category: string): boolean {
  const prefs = getUserPreferences(email);
  if (prefs.unsubscribedAllNonEssential) {
    // Essential security/transactional categories bypass non-essential unsubscribe
    const isEssential =
      category === "otp" ||
      category === "welcome" ||
      category === "password_reset" ||
      category === "password_changed" ||
      category === "security_alert" ||
      category === "payment_receipt" ||
      category === "staff_invitation";
    return isEssential;
  }

  if (category === "assignment" && !prefs.assignmentReminders) return false;
  if (category === "exam" && !prefs.examReminders) return false;
  if (category === "announcement" && !prefs.academicAnnouncements) return false;
  if (category === "ai_lesson_note" && !prefs.aiJobCompletion) return false;
  if (category === "event" && !prefs.schoolEvents) return false;
  if (category === "finance" && !prefs.feeNotices) return false;

  return true;
}
