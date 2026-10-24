import { sendEmail, EmailSendResult, APP_BASE_URL } from "./resendService";
import {
  renderOtpVerificationEmail,
  renderWelcomeEmail,
  renderPasswordResetEmail,
  renderPasswordChangedEmail,
  renderAssignmentEmail,
  renderExamAnnouncementEmail,
  renderReportCardReadyEmail,
  renderSchoolAnnouncementEmail,
  renderPaymentReceiptEmail,
  renderAiLessonNotesReadyEmail,
  renderStaffInvitationEmail,
} from "./emailTemplates";
import { queueEmailJob, isRecipientOptedIn, emailDeliveryEventsStore } from "./emailQueue";
import { generateOtpChallenge, verifyOtpChallenge } from "./otpService";

export interface SendOtpParams {
  email: string;
  fullName?: string;
  role?: string;
  schoolName?: string;
  schoolId?: string;
  purpose?: "registration" | "login" | "password_reset" | "email_verification";
  ipAddress?: string;
  bypassCooldown?: boolean;
}

export interface SendAnnouncementParams {
  title: string;
  content: string;
  schoolId: string;
  schoolName: string;
  senderName: string;
  senderRole: string;
  category?: string;
  targetAudience: "all" | "students" | "teachers" | "parents" | "class";
  targetClass?: string;
  recipients: Array<{ email: string; name: string }>;
}

export class EmailNotificationService {
  /**
   * 1. Send OTP Verification Email via Resend
   */
  static async sendOtp(params: SendOtpParams): Promise<{ success: boolean; message: string; challengeId?: string; rawOtp?: string; cooldownSeconds?: number; error?: string }> {
    const { email, fullName = "Student / Teacher", role, schoolName = "LivingstoneEDU School", schoolId, purpose = "registration", ipAddress, bypassCooldown = false } = params;

    const challenge = generateOtpChallenge({
      email,
      purpose,
      schoolId,
      schoolName,
      role,
      ipAddress,
      bypassCooldown,
    });

    if (!challenge.success || !challenge.rawOtp) {
      return {
        success: false,
        message: challenge.error || "Failed to generate security verification code.",
        cooldownSeconds: challenge.cooldownSecondsRemaining,
        error: challenge.error,
      };
    }

    const { rawOtp, challengeId } = challenge;
    const template = renderOtpVerificationEmail({
      otp: rawOtp,
      recipientName: fullName,
      schoolName,
      purpose,
      expiresInMinutes: 10,
    });

    const emailRes: EmailSendResult = await sendEmail({
      to: email,
      from: `"${schoolName}" <notifications@livingstoneedu.name.ng>`,
      schoolName,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [{ name: "category", value: "otp_verification" }],
    });

    if (!emailRes.success) {
      console.warn(`[EmailNotificationService] Resend dispatch returned error for ${email}: ${emailRes.error}`);
    }

    return {
      success: true,
      message: emailRes.success
        ? `Verification code dispatched to ${email}. Please check your inbox.`
        : `Verification code generated. (Resend: ${emailRes.error || "Ready"})`,
      challengeId,
      rawOtp,
    };
  }

  /**
   * 2. Verify OTP Challenge
   */
  static verifyOtp(params: { email: string; otp: string; purpose?: any }): { success: boolean; message: string; error?: string; attemptsRemaining?: number } {
    const result = verifyOtpChallenge(params);
    if (!result.success) {
      return {
        success: false,
        message: result.error || "Verification failed.",
        error: result.error,
        attemptsRemaining: result.attemptsRemaining,
      };
    }

    return {
      success: true,
      message: "✓ Security code verified successfully!",
    };
  }

  /**
   * 3. Send Welcome Onboarding Email
   */
  static async sendWelcome(params: {
    email: string;
    fullName: string;
    role: string;
    schoolName: string;
    admissionNo?: string;
    staffId?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { email, fullName, role, schoolName, admissionNo, staffId } = params;
    const template = renderWelcomeEmail({
      recipientName: fullName,
      role,
      schoolName,
      admissionNo,
      staffId,
      portalUrl: `${APP_BASE_URL}/app/dashboard`,
    });

    const emailRes: EmailSendResult = await sendEmail({
      to: email,
      from: `"${schoolName}" <notifications@livingstoneedu.name.ng>`,
      schoolName,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [
        { name: "category", value: "welcome_onboarding" },
        { name: "school", value: (schoolName || "livingstone").substring(0, 30) },
      ],
    });

    if (!emailRes.success) {
      console.warn(`[EmailNotificationService] Resend welcome email failed for ${email}: ${emailRes.error}`);
    }

    return {
      success: emailRes.success,
      messageId: emailRes.messageId,
      error: emailRes.error,
    };
  }

  /**
   * 4. Send Password Reset Email
   */
  static async sendPasswordReset(params: {
    email: string;
    fullName: string;
    schoolName: string;
    schoolId?: string;
    ipAddress?: string;
  }): Promise<{ success: boolean; message: string }> {
    const { email, fullName, schoolName, schoolId, ipAddress } = params;

    const challenge = generateOtpChallenge({
      email,
      purpose: "password_reset",
      schoolId,
      schoolName,
      ipAddress,
    });

    if (!challenge.success || !challenge.rawOtp) {
      return { success: false, message: challenge.error || "Failed to initiate password reset." };
    }

    const resetUrl = `${APP_BASE_URL}/login?action=reset-password&email=${encodeURIComponent(email)}&code=${challenge.rawOtp}`;
    const template = renderPasswordResetEmail({
      recipientName: fullName,
      schoolName,
      resetUrl,
      otpCode: challenge.rawOtp,
      expiresInMinutes: 15,
    });

    const result = await sendEmail({
      to: email,
      from: `"${schoolName}" <notifications@livingstoneedu.name.ng>`,
      schoolName,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [{ name: "category", value: "password_reset" }],
    });

    return {
      success: true,
      message: result.success
        ? `Password reset code sent to ${email}.`
        : `Password reset instructions dispatched.`,
    };
  }

  /**
   * 5. Send Password Changed Security Notification
   */
  static async sendPasswordChanged(params: {
    email: string;
    fullName: string;
    schoolName: string;
    ipAddress?: string;
    device?: string;
  }): Promise<void> {
    const { email, fullName, schoolName, ipAddress, device } = params;
    const template = renderPasswordChangedEmail({
      recipientName: fullName,
      schoolName,
      timestamp: new Date().toUTCString(),
      ipAddress,
      device,
    });

    queueEmailJob({
      category: "security_alert",
      recipient: email,
      recipientName: fullName,
      subject: template.subject,
      payload: {
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      },
      schoolName,
    });
  }

  /**
   * 6. Send Assignment Notification to Students
   */
  static async sendAssignmentPublished(params: {
    recipients: Array<{ email: string; name: string }>;
    subject: string;
    classLevel: string;
    title: string;
    dueDate: string;
    instructions: string;
    teacherName: string;
    schoolName: string;
    schoolId: string;
  }): Promise<{ queuedCount: number }> {
    const { recipients, subject: assignSubject, classLevel, title, dueDate, instructions, teacherName, schoolName, schoolId } = params;

    let queuedCount = 0;
    for (const r of recipients) {
      if (!isRecipientOptedIn(r.email, "assignment")) continue;

      const template = renderAssignmentEmail({
        studentName: r.name,
        schoolName,
        subject: assignSubject,
        classLevel,
        title,
        dueDate,
        instructions,
        teacherName,
        portalUrl: `${APP_BASE_URL}/app/dashboard`,
      });

      queueEmailJob({
        category: "assignment",
        recipient: r.email,
        recipientName: r.name,
        subject: template.subject,
        payload: {
          to: r.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        },
        schoolId,
        schoolName,
        idempotencyKey: `asg-${title}-${r.email}-${dueDate}`,
      });
      queuedCount++;
    }

    return { queuedCount };
  }

  /**
   * 7. Send Exam Timetable & Reminder
   */
  static async sendExamAnnouncement(params: {
    recipients: Array<{ email: string; name: string }>;
    examTitle: string;
    classLevel: string;
    examDate: string;
    durationMinutes: number;
    instructions: string;
    schoolName: string;
    schoolId: string;
  }): Promise<{ queuedCount: number }> {
    const { recipients, examTitle, classLevel, examDate, durationMinutes, instructions, schoolName, schoolId } = params;

    let queuedCount = 0;
    for (const r of recipients) {
      if (!isRecipientOptedIn(r.email, "exam")) continue;

      const template = renderExamAnnouncementEmail({
        recipientName: r.name,
        schoolName,
        examTitle,
        classLevel,
        examDate,
        durationMinutes,
        instructions,
        portalUrl: `${APP_BASE_URL}/app/dashboard`,
      });

      queueEmailJob({
        category: "exam",
        recipient: r.email,
        recipientName: r.name,
        subject: template.subject,
        payload: {
          to: r.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        },
        schoolId,
        schoolName,
        idempotencyKey: `exam-${examTitle}-${r.email}-${examDate}`,
      });
      queuedCount++;
    }

    return { queuedCount };
  }

  /**
   * 8. Send Report Card Ready Notification
   */
  static async sendReportCardReady(params: {
    email: string;
    studentName: string;
    parentName?: string;
    schoolName: string;
    schoolId: string;
    term: string;
    classLevel: string;
    overallScore?: number;
    positionInClass?: string;
  }): Promise<{ success: boolean; message: string }> {
    const { email, studentName, parentName, schoolName, schoolId, term, classLevel, overallScore, positionInClass } = params;

    const reportCardUrl = `${APP_BASE_URL}/login?tab=report-cards&student=${encodeURIComponent(studentName)}&term=${encodeURIComponent(term)}`;
    const template = renderReportCardReadyEmail({
      studentName,
      parentName,
      schoolName,
      term,
      classLevel,
      overallScore,
      positionInClass,
      reportCardUrl,
    });

    const job = queueEmailJob({
      category: "report_card",
      recipient: email,
      recipientName: studentName,
      subject: template.subject,
      payload: {
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      },
      schoolId,
      schoolName,
      idempotencyKey: `rc-${studentName}-${term}-${classLevel}`,
    });

    return {
      success: job.queued,
      message: `Report card notification queued for ${studentName} (${email})`,
    };
  }

  /**
   * 9. Send AI Lesson Note Completion Notification to Teacher
   */
  static async sendAiLessonNoteReady(params: {
    teacherEmail: string;
    teacherName: string;
    schoolName: string;
    topic: string;
    subject: string;
    classLevel: string;
    week: string;
    term: string;
  }): Promise<void> {
    const { teacherEmail, teacherName, schoolName, topic, subject, classLevel, week, term } = params;

    if (!isRecipientOptedIn(teacherEmail, "ai_lesson_note")) return;

    const template = renderAiLessonNotesReadyEmail({
      teacherName,
      schoolName,
      topic,
      subject,
      classLevel,
      week,
      term,
      lessonNotesUrl: `${APP_BASE_URL}/login?tab=curriculum`,
    });

    queueEmailJob({
      category: "ai_lesson_note",
      recipient: teacherEmail,
      recipientName: teacherName,
      subject: template.subject,
      payload: {
        to: teacherEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      },
      schoolName,
      idempotencyKey: `note-${topic}-${teacherEmail}-${Date.now()}`,
    });
  }

  /**
   * 10. Send Staff Invitation Email
   */
  static async sendStaffInvitation(params: {
    email: string;
    fullName: string;
    role?: string;
    subject?: string;
    assignedClass?: string;
    staffId?: string;
    teacherId?: string;
    tempPassword?: string;
    schoolName: string;
    schoolId: string;
    inviteToken?: string;
    baseUrl?: string;
  }): Promise<{ success: boolean; message: string; inviteLink: string }> {
    const {
      email,
      fullName,
      role = "Teacher / Form Teacher",
      subject: staffSubject,
      assignedClass,
      staffId = `STF-${Math.floor(100 + Math.random() * 900)}`,
      teacherId,
      tempPassword,
      schoolName,
      schoolId,
      inviteToken = `INV-${Date.now()}`,
      baseUrl = APP_BASE_URL
    } = params;

    const resolvedTeacherId = teacherId || staffId;
    const inviteLink = `${baseUrl}/app/dashboard?role=teacher&schoolId=${encodeURIComponent(schoolId)}&token=${encodeURIComponent(inviteToken)}&email=${encodeURIComponent(email)}&teacherId=${encodeURIComponent(resolvedTeacherId)}`;
    const template = renderStaffInvitationEmail({
      recipientName: fullName,
      schoolName,
      role,
      subject: staffSubject,
      assignedClass,
      staffId,
      teacherId: resolvedTeacherId,
      tempPassword,
      loginEmail: email,
      inviteLink,
      expiresInDays: 7,
    });

    const fromAddress = `"${schoolName}" <notifications@livingstoneedu.name.ng>`;

    const result = await sendEmail({
      to: email,
      from: fromAddress,
      schoolName,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [
        { name: "category", value: "staff_invitation" },
        { name: "school", value: (schoolName || "livingstone").substring(0, 30) }
      ],
    });

    return {
      success: result.success,
      inviteLink,
      message: result.success
        ? `Official invitation email dispatched to ${email} for ${schoolName}`
        : `Failed to dispatch invitation: ${result.error}`,
    };
  }

  /**
   * 11. Send Payment Receipt Notification
   */
  static async sendPaymentReceipt(params: {
    payerEmail: string;
    payerName: string;
    studentName: string;
    schoolName: string;
    schoolId: string;
    transactionRef: string;
    amountFormatted: string;
    paymentDate: string;
    paymentMethod: string;
    term: string;
    items?: Array<{ description: string; amount: string }>;
  }): Promise<{ success: boolean; message: string }> {
    const { payerEmail, payerName, studentName, schoolName, schoolId, transactionRef, amountFormatted, paymentDate, paymentMethod, term, items } = params;

    const template = renderPaymentReceiptEmail({
      payerName,
      studentName,
      schoolName,
      transactionRef,
      amountFormatted,
      paymentDate,
      paymentMethod,
      term,
      items,
      receiptUrl: `${APP_BASE_URL}/login?tab=fees`,
    });

    const job = queueEmailJob({
      category: "payment_receipt",
      recipient: payerEmail,
      recipientName: payerName,
      subject: template.subject,
      payload: {
        to: payerEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      },
      schoolId,
      schoolName,
      idempotencyKey: `pay-${transactionRef}-${payerEmail}`,
    });

    return {
      success: job.queued,
      message: `Official payment receipt queued for dispatch to ${payerEmail}`,
    };
  }

  /**
   * 12. Send Bulk School Announcement with Recipient Isolation & BCC Protection
   */
  static async sendBulkAnnouncement(params: SendAnnouncementParams): Promise<{ totalRecipients: number; queuedCount: number; message: string }> {
    const { title, content, schoolId, schoolName, senderName, senderRole, category = "School Announcement", recipients } = params;

    const validRecipients = recipients.filter((r) => r.email && r.email.includes("@") && isRecipientOptedIn(r.email, "announcement"));

    let queuedCount = 0;
    for (const r of validRecipients) {
      const unsubscribeUrl = `${APP_BASE_URL}/api/email/unsubscribe?email=${encodeURIComponent(r.email)}&schoolId=${schoolId}`;
      const template = renderSchoolAnnouncementEmail({
        recipientName: r.name || "Member of LivingstoneEDU Community",
        schoolName,
        title,
        content,
        authorName: senderName,
        authorRole: senderRole,
        category,
        unsubscribeUrl,
      });

      queueEmailJob({
        category: "announcement",
        recipient: r.email,
        recipientName: r.name,
        subject: template.subject,
        payload: {
          to: r.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        },
        schoolId,
        schoolName,
        idempotencyKey: `ann-${title}-${r.email}-${Date.now().toString().slice(0, 7)}`,
      });
      queuedCount++;
    }

    return {
      totalRecipients: recipients.length,
      queuedCount,
      message: `Announcement "${title}" queued for ${queuedCount} recipients.`,
    };
  }
}

export const EmailNotifications = EmailNotificationService;

