/**
 * LivingstoneEDU Production Reusable Email Template System
 * Responsive HTML + Plain Text for all academic & operational categories
 */

export function escapeHtml(str: any): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface EmailTemplateRenderResult {
  subject: string;
  html: string;
  text: string;
}

export interface BaseTemplateParams {
  recipientName?: string;
  schoolName?: string;
  schoolLogoUrl?: string;
  actionUrl?: string;
  actionText?: string;
  supportEmail?: string;
  unsubscribeUrl?: string;
  footerNote?: string;
}

// Global Shell Wrapper
function renderEmailShell(contentHtml: string, params: BaseTemplateParams): string {
  const cleanSchool = (params.schoolName && !params.schoolName.includes("Institution") && !params.schoolName.includes("LivingstoneEDU School"))
    ? params.schoolName
    : "Destiny way International Schools";
  const schoolName = escapeHtml(cleanSchool);
  const supportEmail = escapeHtml(params.supportEmail || "livingstoneedu64@gmail.com");
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${schoolName} Notification</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 32px 12px; }
    .main { background: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06); }
    .header { background: linear-gradient(135deg, #065f46 0%, #047857 50%, #0d9488 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0; font-weight: 500; }
    .content { padding: 32px 28px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .btn { display: inline-block; background: #059669; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; box-shadow: 0 2px 8px rgba(5, 150, 105, 0.35); text-align: center; }
    .btn:hover { background: #047857; }
    .otp-box { background: #064e3b; color: #34d399; font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; text-align: center; padding: 18px 24px; border-radius: 12px; margin: 24px 0; box-shadow: inset 0 2px 6px rgba(0,0,0,0.3); border: 2px solid #059669; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 28px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6; }
    .footer a { color: #059669; text-decoration: none; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-info { background: #e0f2fe; color: #075985; }
    @media only screen and (max-width: 600px) {
      .content { padding: 24px 18px !important; }
      .header { padding: 24px 18px !important; }
      .otp-box { font-size: 28px !important; letter-spacing: 6px !important; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <div class="main">
            <!-- Header with Registered School Name -->
            <div class="header">
              <h1>${schoolName}</h1>
              <p>Official Academic &amp; Operational Portal Notification</p>
            </div>

            <!-- Content Area -->
            <div class="content">
              ${contentHtml}
            </div>

            <!-- Footer -->
            <div class="footer">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #334155;">
                ${schoolName} • Verified Educational Notification System
              </p>
              <p style="margin: 0 0 8px 0;">
                Official Support: <a href="mailto:${supportEmail}">${supportEmail}</a> • Website: <a href="https://livingstoneedu.name.ng" style="color: #059669; font-weight: 600;">livingstoneedu.name.ng</a>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 10px;">
                © ${year} LivingstoneEDU Technologies Ltd. No. 5 Ibobo Road Abocho Kogi State, Nigeria.
                ${params.unsubscribeUrl ? ` | <a href="${escapeHtml(params.unsubscribeUrl)}" style="color: #94a3b8;">Unsubscribe</a>` : ""}
              </p>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;
}

// 1. OTP Verification Email Template
export function renderOtpVerificationEmail(params: {
  otp: string;
  recipientName: string;
  schoolName: string;
  purpose?: "registration" | "login" | "password_reset" | "email_verification";
  expiresInMinutes?: number;
}): EmailTemplateRenderResult {
  const { otp, recipientName, schoolName, purpose = "registration", expiresInMinutes = 10 } = params;
  const name = escapeHtml(recipientName || "Student / Teacher");
  const school = escapeHtml(schoolName || "LivingstoneEDU School");

  const purposeText =
    purpose === "registration"
      ? "verify your new account registration"
      : purpose === "password_reset"
      ? "authorize your password reset request"
      : purpose === "email_verification"
      ? "confirm your registered email address"
      : "complete your two-factor security login";

  const subject = `🔐 [${otp}] ${school} Security Verification Code`;

  const html = renderEmailShell(
    `
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge badge-info">Security Verification</span>
        <h2 style="color: #0f172a; margin: 12px 0 6px 0; font-size: 20px; font-weight: 800;">One-Time Password (OTP)</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">Account Verification for ${school}</p>
      </div>

      <p style="font-size: 15px; color: #1e293b; margin: 0 0 14px 0;">Dear <strong>${name}</strong>,</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
        Please use the 6-digit numeric verification code below to ${purposeText}. This security challenge is single-use and will expire in <strong>${expiresInMinutes} minutes</strong>.
      </p>

      <div class="otp-box">
        ${escapeHtml(otp)}
      </div>

      <div class="card" style="background: #fffbeb; border-color: #fef3c7;">
        <p style="margin: 0; color: #92400e; font-size: 12px; line-height: 1.5;">
          <strong>Security Notice:</strong> Never disclose this code to anyone, including teachers or administrators. LivingstoneEDU staff will never ask for your verification code.
        </p>
      </div>

      <p style="font-size: 12px; color: #64748b; margin: 20px 0 0 0; line-height: 1.5;">
        If you did not initiate this request, please disregard this email or notify your school administrator immediately.
      </p>
    `,
    { schoolName, recipientName }
  );

  const text = `LIVINGSTONEEDU - Security Verification Code\n\nDear ${recipientName},\n\nYour 6-digit verification code is: ${otp}\n\nSchool: ${schoolName}\nExpires in: ${expiresInMinutes} minutes.\nPurpose: ${purposeText}\n\nNever share this code with anyone.`;

  return { subject, html, text };
}

// 2. Welcome Email Template (Post-Verification)
export function renderWelcomeEmail(params: {
  recipientName: string;
  role: string;
  schoolName: string;
  admissionNo?: string;
  staffId?: string;
  portalUrl?: string;
}): EmailTemplateRenderResult {
  const { recipientName, role, schoolName, admissionNo, staffId, portalUrl = "https://livingstoneedu.name.ng/app/dashboard" } = params;
  const name = escapeHtml(recipientName);
  const school = escapeHtml(schoolName);
  const userRole = escapeHtml(role);

  const subject = `🎉 Welcome to ${school} — Your ${userRole} Portal is Ready!`;

  const html = renderEmailShell(
    `
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="badge badge-success">Account Verified</span>
        <h2 style="color: #0f172a; margin: 12px 0 6px 0; font-size: 22px; font-weight: 800;">Welcome to ${school}!</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">Your ${userRole} account has been successfully created and verified.</p>
      </div>

      <p style="font-size: 15px; color: #1e293b; margin: 0 0 14px 0;">Dear <strong>${name}</strong>,</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
        We are thrilled to welcome you to the <strong>${school}</strong> digital learning and school management platform powered by LivingstoneEDU.
      </p>

      <div class="card">
        <h4 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase;">Your Account Profile</h4>
        <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;">System Role:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #065f46;">${userRole}</td>
          </tr>
          ${admissionNo ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Admission Number:</td>
            <td style="padding: 6px 0; font-weight: 700; font-family: monospace; color: #0f172a;">${escapeHtml(admissionNo)}</td>
          </tr>` : ""}
          ${staffId ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Staff ID No:</td>
            <td style="padding: 6px 0; font-weight: 700; font-family: monospace; color: #0f172a;">${escapeHtml(staffId)}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Institution:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${school}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Status:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #059669;">Active & Verified</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${escapeHtml(portalUrl)}" class="btn">Log In to Your Portal →</a>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
        You can now access your timetable, lesson notes, examinations, report cards, fee statements, and announcements directly from any computer, tablet, or smartphone.
      </p>
    `,
    { schoolName, recipientName, actionUrl: portalUrl }
  );

  const text = `Welcome to ${schoolName}!\n\nDear ${recipientName},\n\nYour ${role} account is now active and verified.\n\nLogin URL: ${portalUrl}\nInstitution: ${schoolName}\n${admissionNo ? `Admission No: ${admissionNo}\n` : ""}${staffId ? `Staff ID: ${staffId}\n` : ""}\nThank you for choosing LivingstoneEDU.`;

  return { subject, html, text };
}

// 3. Password Reset Email Template
export function renderPasswordResetEmail(params: {
  recipientName: string;
  schoolName: string;
  resetUrl: string;
  otpCode: string;
  expiresInMinutes?: number;
}): EmailTemplateRenderResult {
  const { recipientName, schoolName, resetUrl, otpCode, expiresInMinutes = 15 } = params;
  const name = escapeHtml(recipientName || "User");
  const school = escapeHtml(schoolName || "LivingstoneEDU School");

  const subject = `🔑 Password Reset Instructions & Code: ${otpCode} (${school})`;

  const html = renderEmailShell(
    `
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge badge-warning">Security Action</span>
        <h2 style="color: #0f172a; margin: 12px 0 6px 0; font-size: 20px; font-weight: 800;">Password Reset Request</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">${school}</p>
      </div>

      <p style="font-size: 15px; color: #1e293b; margin: 0 0 14px 0;">Hello <strong>${name}</strong>,</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
        We received a request to reset your password for your account associated with <strong>${school}</strong>. Use the 6-digit verification code below or click the reset button:
      </p>

      <div class="otp-box" style="background: #1e1b4b; color: #818cf8; border-color: #6366f1;">
        ${escapeHtml(otpCode)}
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${escapeHtml(resetUrl)}" class="btn" style="background: #4f46e5;">Reset Your Password Now →</a>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
        This password reset code will expire in <strong>${expiresInMinutes} minutes</strong>. If you did not request this, please ignore this email and your existing password will remain unchanged and secure.
      </p>
    `,
    { schoolName, recipientName, actionUrl: resetUrl }
  );

  const text = `Password Reset Request - ${schoolName}\n\nHello ${recipientName},\n\nYour reset code is: ${otpCode}\n\nReset Link: ${resetUrl}\nExpires in ${expiresInMinutes} minutes.\n\nIf you did not request this, ignore this email.`;

  return { subject, html, text };
}

// 4. Password Changed Security Confirmation Email
export function renderPasswordChangedEmail(params: {
  recipientName: string;
  schoolName: string;
  timestamp: string;
  ipAddress?: string;
  device?: string;
}): EmailTemplateRenderResult {
  const { recipientName, schoolName, timestamp, ipAddress = "Verified Device", device = "Web Browser" } = params;
  const name = escapeHtml(recipientName);
  const school = escapeHtml(schoolName);

  const subject = `🛡️ Security Alert: Your Password Was Changed (${school})`;

  const html = renderEmailShell(
    `
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge badge-success">Security Notification</span>
        <h2 style="color: #0f172a; margin: 12px 0 6px 0; font-size: 20px; font-weight: 800;">Password Updated Successfully</h2>
      </div>

      <p style="font-size: 15px; color: #1e293b; margin: 0 0 14px 0;">Dear <strong>${name}</strong>,</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
        This email confirms that the security password for your account associated with <strong>${school}</strong> was successfully changed.
      </p>

      <div class="card">
        <table style="width: 100%; font-size: 13px; color: #334155;">
          <tr>
            <td style="padding: 5px 0; color: #64748b; width: 120px;">Date & Time:</td>
            <td style="padding: 5px 0; font-weight: 700;">${escapeHtml(timestamp)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b;">Device / Client:</td>
            <td style="padding: 5px 0; font-weight: 700;">${escapeHtml(device)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b;">IP Address:</td>
            <td style="padding: 5px 0; font-weight: 700; font-family: monospace;">${escapeHtml(ipAddress)}</td>
          </tr>
        </table>
      </div>

      <div class="card" style="background: #fff1f2; border-color: #ffe4e6;">
        <p style="margin: 0; color: #9f1239; font-size: 12px; line-height: 1.5;">
          <strong>Did you not make this change?</strong> If you did not authorize this password update, please contact your school administrator immediately to secure your account.
        </p>
      </div>
    `,
    { schoolName, recipientName }
  );

  const text = `Security Alert - ${schoolName}\n\nDear ${recipientName},\n\nYour account password was successfully updated on ${timestamp}.\nDevice: ${device}\nIP: ${ipAddress}\n\nIf you did not make this change, please alert your school administrator immediately.`;

  return { subject, html, text };
}

// 5. Assignment Published Email Template
export function renderAssignmentEmail(params: {
  studentName: string;
  schoolName: string;
  subject: string;
  classLevel: string;
  title: string;
  dueDate: string;
  instructions: string;
  teacherName?: string;
  portalUrl?: string;
}): EmailTemplateRenderResult {
  const { studentName, schoolName, subject: assignmentSubject, classLevel, title, dueDate, instructions, teacherName = "Subject Teacher", portalUrl = "https://livingstoneedu.name.ng/app/dashboard" } = params;

  const subject = `📚 New Homework Assignment: ${assignmentSubject} (${classLevel}) — Due ${dueDate}`;

  const html = renderEmailShell(
    `
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge badge-info">${escapeHtml(classLevel)} • ${escapeHtml(assignmentSubject)}</span>
        <h2 style="color: #0f172a; margin: 12px 0 6px 0; font-size: 20px; font-weight: 800;">New Assignment Published</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">Set by ${escapeHtml(teacherName)}</p>
      </div>

      <p style="font-size: 15px; color: #1e293b; margin: 0 0 14px 0;">Dear <strong>${escapeHtml(studentName)}</strong>,</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
        A new homework exercise has been assigned for your class. Please review the instructions and submit your responses before the deadline.
      </p>

      <div class="card">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #065f46; font-weight: 800;">${escapeHtml(title)}</h3>
        <p style="margin: 0 0 14px 0; font-size: 13px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(instructions)}</p>
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 12px; margin-top: 12px; font-size: 12px; color: #64748b;">
          <strong>Due Date:</strong> <span style="color: #b91c1c; font-weight: 700;">${escapeHtml(dueDate)}</span>
        </div>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${escapeHtml(portalUrl)}" class="btn">View & Submit Homework Online →</a>
      </div>
    `,
    { schoolName, recipientName: studentName, actionUrl: portalUrl }
  );

  const text = `New Assignment: ${title}\nSubject: ${assignmentSubject}\nClass: ${classLevel}\nDue Date: ${dueDate}\nTeacher: ${teacherName}\n\nInstructions:\n${instructions}\n\nLogin to submit: ${portalUrl}`;

  return { subject, html, text };
}

// 6. Examination Announcement / Timetable Email Template
export function renderExamAnnouncementEmail(params: {
  recipientName: string;
  schoolName: string;
  examTitle: string;
  classLevel: string;
  examDate: string;
  durationMinutes: number;
  instructions: string;
  portalUrl?: string;
}): EmailTemplateRenderResult {
  const { recipientName, schoolName, examTitle, classLevel, examDate, durationMinutes, instructions, portalUrl = "https://livingstoneedu.name.ng/app/dashboard" } = params;

  const subject = `📝 Official Exam Schedule: ${examTitle} (${classLevel}) — ${examDate}`;

  const html = renderEmailShell(
    `
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge badge-warning">Examination Timetable</span>
        <h2 style="color: #0f172a; margin: 12px 0 6px 0; font-size: 20px; font-weight: 800;">${escapeHtml(examTitle)}</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">${escapeHtml(classLevel)} Examination Session</p>
      </div>

      <p style="font-size: 15px; color: #1e293b; margin: 0 0 14px 0;">Dear <strong>${escapeHtml(recipientName)}</strong>,</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
        Please find the examination timetable schedule and instructions for <strong>${escapeHtml(schoolName)}</strong> below:
      </p>

      <div class="card">
        <table style="width: 100%; font-size: 13px; color: #334155;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 120px;">Date & Time:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${escapeHtml(examDate)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Duration:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${durationMinutes} Minutes</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Class Stream:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${escapeHtml(classLevel)}</td>
          </tr>
        </table>
        ${instructions ? `
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 12px; margin-top: 12px;">
          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #0f172a;">Special Instructions:</p>
          <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">${escapeHtml(instructions)}</p>
        </div>` : ""}
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${escapeHtml(portalUrl)}" class="btn">Open CBT & Exam Portal →</a>
      </div>
    `,
    { schoolName, recipientName, actionUrl: portalUrl }
  );

  const text = `Examination Announcement: ${examTitle}\nClass: ${classLevel}\nDate: ${examDate}\nDuration: ${durationMinutes} Mins\n\nInstructions: ${instructions}\nPortal: ${portalUrl}`;

  return { subject, html, text };
}

// 7. Report Card Availability Email Template
export function renderReportCardReadyEmail(params: {
  studentName: string;
  parentName?: string;
  schoolName: string;
  term: string;
  classLevel: string;
  overallScore?: number;
  positionInClass?: string;
  reportCardUrl: string;
}): EmailTemplateRenderResult {
  const { studentName, parentName, schoolName, term, classLevel, overallScore, positionInClass, reportCardUrl } = params;

  const subject = `📊 Official Report Card Ready: ${studentName} (${term}, ${classLevel}) — ${schoolName}`;

  const greeting = parentName ? `Dear Parent / Guardian of <strong>${escapeHtml(studentName)}</strong>` : `Dear <strong>${escapeHtml(studentName)}</strong>`;

  const html = renderEmailShell(
    `
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge badge-success">Official Terminal Result</span>
        <h2 style="color: #0f172a; margin: 12px 0 6px 0; font-size: 20px; font-weight: 800;">Academic Report Card Published</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">${escapeHtml(term)} • ${escapeHtml(classLevel)}</p>
      </div>

      <p style="font-size: 15px; color: #1e293b; margin: 0 0 14px 0;">${greeting},</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
        We are pleased to inform you that the official academic progress and terminal report card for <strong>${escapeHtml(studentName)}</strong> at <strong>${escapeHtml(schoolName)}</strong> has been compiled and is now available for secure inspection and download.
      </p>

      <div class="card">
        <table style="width: 100%; font-size: 13px; color: #334155;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;">Student Name:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${escapeHtml(studentName)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Class Level:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${escapeHtml(classLevel)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Academic Term:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${escapeHtml(term)}</td>
          </tr>
          ${overallScore !== undefined ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Cumulative Score:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #065f46;">${overallScore} Points</td>
          </tr>` : ""}
          ${positionInClass ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Position in Stream:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #065f46;">${escapeHtml(positionInClass)}</td>
          </tr>` : ""}
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${escapeHtml(reportCardUrl)}" class="btn">View & Download Official PDF Report Card →</a>
      </div>

      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
        Note: Access requires authenticated login to the LivingstoneEDU School Portal for student privacy protection.
      </p>
    `,
    { schoolName, recipientName: studentName, actionUrl: reportCardUrl }
  );

  const text = `Report Card Ready: ${studentName}\nSchool: ${schoolName}\nTerm: ${term}\nClass: ${classLevel}\n\nView Official Report: ${reportCardUrl}`;

  return { subject, html, text };
}

// 8. General School Announcement Email Template
export function renderSchoolAnnouncementEmail(params: {
  recipientName: string;
  schoolName: string;
  title: string;
  content: string;
  authorName?: string;
  authorRole?: string;
  category?: string;
  actionUrl?: string;
  actionText?: string;
  unsubscribeUrl?: string;
}): EmailTemplateRenderResult {
  const { recipientName, schoolName, title, content, authorName = "Principal / Administration", authorRole = "School Management", category = "General Announcement", actionUrl, actionText, unsubscribeUrl } = params;

  const subject = `📢 ${title} — ${schoolName}`;

  const html = renderEmailShell(
    `
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge badge-info">${escapeHtml(category)}</span>
        <h2 style="color: #0f172a; margin: 12px 0 6px 0; font-size: 20px; font-weight: 800;">${escapeHtml(title)}</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">${escapeHtml(schoolName)}</p>
      </div>

      <p style="font-size: 15px; color: #1e293b; margin: 0 0 14px 0;">Dear <strong>${escapeHtml(recipientName)}</strong>,</p>

      <div class="card" style="background: #ffffff; border-color: #cbd5e1; padding: 24px;">
        <div style="font-size: 14px; color: #334155; line-height: 1.7; white-space: pre-wrap;">
          ${escapeHtml(content)}
        </div>
      </div>

      ${actionUrl && actionText ? `
      <div style="text-align: center; margin: 24px 0;">
        <a href="${escapeHtml(actionUrl)}" class="btn">${escapeHtml(actionText)} →</a>
      </div>` : ""}

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
        <p style="margin: 0;"><strong>Issued by:</strong> ${escapeHtml(authorName)} (${escapeHtml(authorRole)})</p>
        <p style="margin: 2px 0 0 0;"><strong>Institution:</strong> ${escapeHtml(schoolName)}</p>
      </div>
    `,
    { schoolName, recipientName, unsubscribeUrl }
  );

  const text = `School Announcement: ${title}\nInstitution: ${schoolName}\n\n${content}\n\nIssued by: ${authorName} (${authorRole})`;

  return { subject, html, text };
}

// 9. Payment Receipt Email Template
export function renderPaymentReceiptEmail(params: {
  payerName: string;
  studentName: string;
  schoolName: string;
  transactionRef: string;
  amountFormatted: string;
  paymentDate: string;
  paymentMethod: string;
  term: string;
  items?: Array<{ description: string; amount: string }>;
  receiptUrl?: string;
}): EmailTemplateRenderResult {
  const { payerName, studentName, schoolName, transactionRef, amountFormatted, paymentDate, paymentMethod, term, items, receiptUrl } = params;

  const subject = `🧾 Official Payment Receipt: ${amountFormatted} for ${studentName} — ${schoolName}`;

  const html = renderEmailShell(
    `
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge badge-success">Payment Received</span>
        <h2 style="color: #0f172a; margin: 12px 0 6px 0; font-size: 22px; font-weight: 800;">Official Payment Receipt</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">Transaction Ref: <span style="font-family: monospace; font-weight: 700;">${escapeHtml(transactionRef)}</span></p>
      </div>

      <p style="font-size: 15px; color: #1e293b; margin: 0 0 14px 0;">Dear <strong>${escapeHtml(payerName)}</strong>,</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
        Thank you for your payment. This email serves as the official transaction receipt for school fees paid for <strong>${escapeHtml(studentName)}</strong> at <strong>${escapeHtml(schoolName)}</strong>.
      </p>

      <div class="card" style="background: #f0fdf4; border-color: #bbf7d0;">
        <div style="text-align: center; padding: 12px 0 18px 0; border-bottom: 1px dashed #86efac; margin-bottom: 16px;">
          <span style="font-size: 12px; color: #166534; font-weight: 700; text-transform: uppercase;">Amount Paid</span>
          <div style="font-size: 32px; font-weight: 800; color: #14532d; font-family: monospace; margin-top: 4px;">${escapeHtml(amountFormatted)}</div>
        </div>

        <table style="width: 100%; font-size: 13px; color: #334155;">
          <tr>
            <td style="padding: 5px 0; color: #64748b; width: 140px;">Student Name:</td>
            <td style="padding: 5px 0; font-weight: 700; color: #0f172a;">${escapeHtml(studentName)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b;">Academic Term:</td>
            <td style="padding: 5px 0; font-weight: 700; color: #0f172a;">${escapeHtml(term)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b;">Payment Date:</td>
            <td style="padding: 5px 0; font-weight: 700; color: #0f172a;">${escapeHtml(paymentDate)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b;">Payment Channel:</td>
            <td style="padding: 5px 0; font-weight: 700; color: #0f172a;">${escapeHtml(paymentMethod)}</td>
          </tr>
        </table>

        ${items && items.length > 0 ? `
        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #86efac;">
          <table style="width: 100%; font-size: 12px;">
            <tr style="color: #166534; font-weight: 700;">
              <td style="padding-bottom: 6px;">Item Description</td>
              <td style="padding-bottom: 6px; text-align: right;">Amount</td>
            </tr>
            ${items.map(it => `
            <tr style="color: #334155;">
              <td style="padding: 3px 0;">${escapeHtml(it.description)}</td>
              <td style="padding: 3px 0; text-align: right; font-weight: 600;">${escapeHtml(it.amount)}</td>
            </tr>`).join("")}
          </table>
        </div>` : ""}
      </div>

      ${receiptUrl ? `
      <div style="text-align: center; margin: 24px 0;">
        <a href="${escapeHtml(receiptUrl)}" class="btn">Download Official Stamped Receipt PDF →</a>
      </div>` : ""}
    `,
    { schoolName, recipientName: payerName }
  );

  const text = `Official Payment Receipt\n\nSchool: ${schoolName}\nStudent: ${studentName}\nAmount Paid: ${amountFormatted}\nTransaction Ref: ${transactionRef}\nDate: ${paymentDate}\nMethod: ${paymentMethod}\nTerm: ${term}\n\nThank you for your payment.`;

  return { subject, html, text };
}

// 10. AI Lesson Notes Generation Complete Email Template
export function renderAiLessonNotesReadyEmail(params: {
  teacherName: string;
  schoolName: string;
  topic: string;
  subject: string;
  classLevel: string;
  week: string;
  term: string;
  lessonNotesUrl?: string;
}): EmailTemplateRenderResult {
  const { teacherName, schoolName, topic, subject: lessonSubject, classLevel, week, term, lessonNotesUrl = "https://livingstoneedu.name.ng/app/dashboard" } = params;

  const subject = `✨ sSolutAI Lesson Note Ready: ${topic} (${lessonSubject}, ${classLevel})`;

  const html = renderEmailShell(
    `
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="badge badge-success">AI Generation Complete</span>
        <h2 style="color: #0f172a; margin: 12px 0 6px 0; font-size: 20px; font-weight: 800;">NERDC Lesson Note Generated</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">${escapeHtml(lessonSubject)} • ${escapeHtml(classLevel)}</p>
      </div>

      <p style="font-size: 15px; color: #1e293b; margin: 0 0 14px 0;">Dear <strong>${escapeHtml(teacherName)}</strong>,</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
        Your AI-assisted NERDC curriculum lesson note generation job has completed successfully and is ready for your classroom review and teaching.
      </p>

      <div class="card">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #065f46; font-weight: 800;">${escapeHtml(topic)}</h3>
        <table style="width: 100%; font-size: 13px; color: #334155;">
          <tr>
            <td style="padding: 4px 0; color: #64748b; width: 130px;">Subject & Level:</td>
            <td style="padding: 4px 0; font-weight: 700;">${escapeHtml(lessonSubject)} (${escapeHtml(classLevel)})</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Curriculum Period:</td>
            <td style="padding: 4px 0; font-weight: 700;">Week ${escapeHtml(week)} • ${escapeHtml(term)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Standard:</td>
            <td style="padding: 4px 0; font-weight: 700; color: #059669;">WAEC / NERDC Compliant</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${escapeHtml(lessonNotesUrl)}" class="btn">Open Lesson Note in Teacher Portal →</a>
      </div>
    `,
    { schoolName, recipientName: teacherName, actionUrl: lessonNotesUrl }
  );

  const text = `AI Lesson Note Ready: ${topic}\nSubject: ${lessonSubject}\nClass: ${classLevel}\nWeek: ${week}\nTerm: ${term}\n\nView Lesson Note: ${lessonNotesUrl}`;

  return { subject, html, text };
}

// 11. Staff / Teacher Account Invitation Email Template
export function renderStaffInvitationEmail(params: {
  recipientName: string;
  schoolName: string;
  role?: string;
  subject?: string;
  assignedClass?: string;
  staffId?: string;
  teacherId?: string;
  tempPassword?: string;
  loginEmail?: string;
  inviteLink: string;
  expiresInDays?: number;
}): EmailTemplateRenderResult {
  const {
    recipientName,
    schoolName,
    role = "Teacher / Form Teacher",
    subject: staffSubject,
    assignedClass,
    staffId = "FAC-PENDING",
    teacherId,
    tempPassword,
    loginEmail,
    inviteLink,
    expiresInDays = 7
  } = params;

  const resolvedTeacherId = teacherId || staffId;
  const rawSchool = (schoolName && !schoolName.includes("Institution") && !schoolName.includes("LivingstoneEDU School"))
    ? schoolName
    : "Destiny way International Schools";
  const resolvedSchoolName = rawSchool;
  const emailSubject = `✉️ ${resolvedSchoolName} — Official Faculty Invitation & Login Credentials`;

  const html = renderEmailShell(
    `
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="badge badge-info">Faculty Onboarding</span>
        <h2 style="color: #0f172a; margin: 12px 0 4px 0; font-size: 22px; font-weight: 800;">Official Faculty Invitation</h2>
        <p style="color: #059669; font-size: 15px; font-weight: 700; margin: 0;">${escapeHtml(resolvedSchoolName)}</p>
      </div>

      <p style="font-size: 15px; color: #1e293b; margin: 0 0 14px 0;">Dear <strong>${escapeHtml(recipientName || "Educator")}</strong>,</p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
        You have been officially appointed to the academic faculty of <strong>${escapeHtml(resolvedSchoolName)}</strong>. Your official teacher profile and credentials have been created automatically.
      </p>

      <!-- Prominent Credentials Box -->
      <div class="card" style="background-color: #f0fdf4; border: 2px solid #059669; border-radius: 14px; padding: 22px; margin: 24px 0;">
        <div style="text-align: center; margin-bottom: 16px; border-bottom: 1px solid #bbf7d0; padding-bottom: 12px;">
          <span style="font-size: 20px;">🔑</span>
          <h3 style="margin: 4px 0 0 0; font-size: 16px; font-weight: 800; color: #065f46; letter-spacing: 0.5px;">YOUR OFFICIAL LOGIN CREDENTIALS</h3>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #047857;">Please store these credentials safely for logging into the portal</p>
        </div>

        <table style="width: 100%; font-size: 13px; color: #1e293b; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #065f46; font-weight: 700; width: 140px;">Teacher ID:</td>
            <td style="padding: 8px 0; font-weight: 800; font-family: monospace; font-size: 15px; color: #0f172a;">${escapeHtml(resolvedTeacherId)}</td>
          </tr>
          ${staffId && staffId !== resolvedTeacherId ? `
          <tr>
            <td style="padding: 6px 0; color: #065f46; font-weight: 600;">Staff ID Ref:</td>
            <td style="padding: 6px 0; font-weight: 700; font-family: monospace; color: #334155;">${escapeHtml(staffId)}</td>
          </tr>` : ""}
          ${loginEmail ? `
          <tr>
            <td style="padding: 8px 0; color: #065f46; font-weight: 700;">Login Email:</td>
            <td style="padding: 8px 0; font-weight: 700; font-family: monospace; color: #0f172a;">${escapeHtml(loginEmail)}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 8px 0; color: #065f46; font-weight: 700;">System Password:</td>
            <td style="padding: 8px 0;">
              <span style="display: inline-block; background: #ffffff; border: 1.5px dashed #059669; border-radius: 8px; padding: 6px 14px; font-family: monospace; font-size: 15px; font-weight: 800; color: #065f46; letter-spacing: 1px;">
                ${escapeHtml(tempPassword || "Available on Activation")}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #065f46; font-weight: 700;">Assigned Role:</td>
            <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${escapeHtml(role)}</td>
          </tr>
          ${staffSubject ? `
          <tr>
            <td style="padding: 6px 0; color: #065f46; font-weight: 600;">Subject(s):</td>
            <td style="padding: 6px 0; font-weight: 700; color: #1e293b;">${escapeHtml(staffSubject)}</td>
          </tr>
          ` : ""}
          ${assignedClass ? `
          <tr>
            <td style="padding: 6px 0; color: #065f46; font-weight: 600;">Class Stream:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #1e293b;">${escapeHtml(assignedClass)}</td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding: 6px 0; color: #065f46; font-weight: 600;">Validity:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${expiresInDays} Days</td>
          </tr>
        </table>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${escapeHtml(inviteLink)}" class="btn" style="background-color: #059669; color: #ffffff; padding: 14px 34px; border-radius: 12px; font-weight: 800; font-size: 15px; text-decoration: none; display: inline-block; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);">
          Log In to ${escapeHtml(resolvedSchoolName)} Teacher Portal →
        </a>
      </div>

      <!-- Login Instructions -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 20px 0; font-size: 13px; color: #334155;">
        <p style="margin: 0 0 8px 0; font-weight: 700; color: #0f172a;">Quick Sign-In Instructions:</p>
        <ol style="margin: 0; padding-left: 18px; line-height: 1.6;">
          <li>Click the green button above or open the direct link below.</li>
          <li>Enter your <strong>Teacher ID (${escapeHtml(resolvedTeacherId)})</strong> or <strong>Email (${escapeHtml(loginEmail || "")})</strong>.</li>
          <li>Enter your temporary password: <strong>${escapeHtml(tempPassword || "")}</strong>.</li>
          <li>You can update your password anytime in your profile settings.</li>
        </ol>
      </div>

      <div style="background-color: #f1f5f9; border-radius: 10px; padding: 12px; margin: 20px 0;">
        <p style="font-size: 11px; color: #475569; font-weight: 600; margin: 0 0 6px 0;">
          Direct Portal URL:
        </p>
        <a href="${escapeHtml(inviteLink)}" style="color: #059669; word-break: break-all; font-size: 11px; font-family: monospace; text-decoration: underline;">
          ${escapeHtml(inviteLink)}
        </a>
      </div>

      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 16px 0 0 0;">
        Security Notice: This official invitation and credentials were generated specifically for your registered address.
      </p>
    `,
    { schoolName: resolvedSchoolName, recipientName, actionUrl: inviteLink }
  );

  const text = `Official Faculty Invitation & Credentials — ${resolvedSchoolName}\n\nDear ${recipientName || "Educator"},\n\nYou have been officially invited to join the faculty of ${resolvedSchoolName}.\n\nYOUR OFFICIAL LOGIN CREDENTIALS:\n- Teacher ID: ${resolvedTeacherId}\n${staffId && staffId !== resolvedTeacherId ? `- Staff ID: ${staffId}\n` : ""}- Login Email: ${loginEmail || ""}\n- Temporary Password: ${tempPassword || ""}\n- Assigned Role: ${role}\n${staffSubject ? `- Teaching Subject(s): ${staffSubject}\n` : ""}${assignedClass ? `- Class Stream: ${assignedClass}\n` : ""}\n\nSign in using your Teacher ID or Email and the temporary password above.\nDirect Portal Link: ${inviteLink}\nValidity: ${expiresInDays} days.\nInstitution: ${resolvedSchoolName}`;

  return { subject: emailSubject, html, text };
}
