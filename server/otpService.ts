import crypto from "crypto";

export interface OtpChallenge {
  id: string;
  email: string;
  hashedCode: string;
  salt: string;
  purpose: "registration" | "login" | "password_reset" | "email_verification";
  schoolId?: string;
  schoolName?: string;
  role?: string;
  metadata?: Record<string, any>;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  expiresAt: number;
  verified: boolean;
  verifiedAt?: number;
  ipAddress?: string;
}

export interface PendingRegistration {
  id: string;
  email: string;
  fullName: string;
  role: "student" | "teacher" | "school_admin";
  schoolId: string;
  schoolName: string;
  hashedPassword?: string;
  classLevel?: string;
  admissionNo?: string;
  staffId?: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory persistent OTP challenges store
export const otpChallengesStore: OtpChallenge[] = [];
export const pendingRegistrationsStore: PendingRegistration[] = [];

// Rate limiting & cooldown tracking
const resendCooldownTracker: Map<string, number> = new Map(); // email -> timestamp
const ipRequestTracker: Map<string, { count: number; resetAt: number }> = new Map(); // ip -> rate tracking

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 5;
const MAX_IP_REQUESTS_PER_HOUR = 30;

function hashOtp(otp: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(otp).digest("hex");
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP and stores only the salt and hash.
 */
export function generateOtpChallenge(params: {
  email: string;
  purpose?: "registration" | "login" | "password_reset" | "email_verification";
  schoolId?: string;
  schoolName?: string;
  role?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  bypassCooldown?: boolean;
}): { success: boolean; rawOtp?: string; challengeId?: string; error?: string; cooldownSecondsRemaining?: number } {
  const { email, purpose = "registration", schoolId, schoolName, role, metadata, ipAddress = "127.0.0.1", bypassCooldown = false } = params;
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "A valid email address is required." };
  }

  // 1. IP Rate Limiting Check
  const now = Date.now();
  const ipRecord = ipRequestTracker.get(ipAddress) || { count: 0, resetAt: now + 3600000 };
  if (now > ipRecord.resetAt) {
    ipRecord.count = 0;
    ipRecord.resetAt = now + 3600000;
  }
  if (ipRecord.count >= MAX_IP_REQUESTS_PER_HOUR && !bypassCooldown) {
    return { success: false, error: "Too many verification requests from this network. Please wait a few minutes." };
  }
  ipRecord.count++;
  ipRequestTracker.set(ipAddress, ipRecord);

  // 2. Resend Cooldown Check (60 seconds)
  const lastSent = resendCooldownTracker.get(cleanEmail);
  if (!bypassCooldown && lastSent && now - lastSent < RESEND_COOLDOWN_MS) {
    const remaining = Math.ceil((RESEND_COOLDOWN_MS - (now - lastSent)) / 1000);
    return {
      success: false,
      error: `Please wait ${remaining} seconds before requesting a new verification code.`,
      cooldownSecondsRemaining: remaining,
    };
  }

  // 3. Invalidate any existing active OTP challenges for this email and purpose
  otpChallengesStore.forEach((c) => {
    if (c.email === cleanEmail && c.purpose === purpose && !c.verified) {
      c.expiresAt = now - 1000; // Invalidate
    }
  });

  // 4. Generate 6-Digit Cryptographic Numeric OTP
  const rawNumeric = crypto.randomInt(100000, 1000000).toString();
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedCode = hashOtp(rawNumeric, salt);

  const challengeId = `otp-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const challenge: OtpChallenge = {
    id: challengeId,
    email: cleanEmail,
    hashedCode,
    salt,
    purpose,
    schoolId,
    schoolName,
    role,
    metadata,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
    verified: false,
    ipAddress,
  };

  otpChallengesStore.unshift(challenge);
  resendCooldownTracker.set(cleanEmail, now);

  // Prune expired records older than 24 hours
  pruneExpiredChallenges();

  return {
    success: true,
    rawOtp: rawNumeric,
    challengeId,
  };
}

/**
 * Verifies a submitted OTP challenge securely with attempt limits, expiry, and single-use enforcement.
 */
export function verifyOtpChallenge(params: {
  email: string;
  otp: string;
  purpose?: "registration" | "login" | "password_reset" | "email_verification";
  ipAddress?: string;
}): { success: boolean; error?: string; challenge?: OtpChallenge; attemptsRemaining?: number } {
  const { email, otp, purpose = "registration" } = params;
  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = String(otp || "").trim();
  const now = Date.now();

  if (!cleanEmail || !cleanOtp) {
    return { success: false, error: "Email address and 6-digit verification code are required." };
  }

  const activeChallenge = otpChallengesStore.find(
    (c) => c.email === cleanEmail && c.purpose === purpose && !c.verified && c.expiresAt > now
  );

  if (!activeChallenge) {
    return {
      success: false,
      error: "Verification code is invalid or has expired. Please request a new code.",
    };
  }

  // Check attempt threshold
  if (activeChallenge.attempts >= activeChallenge.maxAttempts) {
    activeChallenge.expiresAt = now - 1000; // Expire permanently
    return {
      success: false,
      error: "Maximum verification attempts exceeded. For security, please request a new verification code.",
    };
  }

  activeChallenge.attempts++;
  const computedHash = hashOtp(cleanOtp, activeChallenge.salt);

  if (crypto.timingSafeEqual(Buffer.from(computedHash, "hex"), Buffer.from(activeChallenge.hashedCode, "hex"))) {
    // Correct OTP verified!
    activeChallenge.verified = true;
    activeChallenge.verifiedAt = now;
    return {
      success: true,
      challenge: activeChallenge,
    };
  } else {
    const attemptsLeft = activeChallenge.maxAttempts - activeChallenge.attempts;
    if (attemptsLeft <= 0) {
      activeChallenge.expiresAt = now - 1000;
    }
    return {
      success: false,
      error: attemptsLeft > 0
        ? `Incorrect verification code. ${attemptsLeft} attempt${attemptsLeft > 1 ? "s" : ""} remaining.`
        : "Incorrect verification code. Maximum attempts reached. Please request a new code.",
      attemptsRemaining: attemptsLeft,
    };
  }
}

export function savePendingRegistration(data: Omit<PendingRegistration, "id" | "createdAt" | "expiresAt">): PendingRegistration {
  const now = Date.now();
  const cleanEmail = data.email.trim().toLowerCase();

  // Remove existing pending registrations for this email
  const existingIdx = pendingRegistrationsStore.findIndex((p) => p.email.toLowerCase() === cleanEmail);
  if (existingIdx >= 0) {
    pendingRegistrationsStore.splice(existingIdx, 1);
  }

  const record: PendingRegistration = {
    ...data,
    id: `preg-${now}-${crypto.randomBytes(4).toString("hex")}`,
    email: cleanEmail,
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
  };

  pendingRegistrationsStore.unshift(record);
  return record;
}

export function getPendingRegistration(email: string): PendingRegistration | null {
  const now = Date.now();
  const cleanEmail = email.trim().toLowerCase();
  const record = pendingRegistrationsStore.find((p) => p.email.toLowerCase() === cleanEmail && p.expiresAt > now);
  return record || null;
}

export function removePendingRegistration(email: string): void {
  const cleanEmail = email.trim().toLowerCase();
  const idx = pendingRegistrationsStore.findIndex((p) => p.email.toLowerCase() === cleanEmail);
  if (idx >= 0) {
    pendingRegistrationsStore.splice(idx, 1);
  }
}

function pruneExpiredChallenges() {
  const cutoff = Date.now() - 24 * 3600 * 1000;
  for (let i = otpChallengesStore.length - 1; i >= 0; i--) {
    if (otpChallengesStore[i].expiresAt < cutoff) {
      otpChallengesStore.splice(i, 1);
    }
  }
  for (let i = pendingRegistrationsStore.length - 1; i >= 0; i--) {
    if (pendingRegistrationsStore[i].expiresAt < cutoff) {
      pendingRegistrationsStore.splice(i, 1);
    }
  }
}
