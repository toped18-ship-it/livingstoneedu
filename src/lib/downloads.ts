export function downloadTextFile(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function buildReportCardHtml(opts: {
  schoolName: string;
  studentName: string;
  className: string;
  term: string;
  positionInClass?: string | number;
  overallTotal?: string | number;
  maximumPossible?: string | number;
  average?: string | number;
  subjects?: Array<{
    subject: string;
    ca1?: string | number;
    ca2?: string | number;
    exam?: string | number;
    total?: string | number;
    grade?: string;
    positionInSubject?: string | number;
    remark?: string;
  }>;
  teacherComment?: string;
  principalComment?: string;
  promotionStatus?: string;
  qrVerificationToken?: string;
}) {
  const {
    schoolName,
    studentName,
    className,
    term,
    positionInClass,
    overallTotal,
    maximumPossible,
    average,
    subjects = [],
    teacherComment,
    principalComment,
    promotionStatus,
    qrVerificationToken,
  } = opts;

  const rows = subjects
    .map(
      (s) => `<tr>
        <td style="font-weight:600;">${s.subject}</td>
        <td>${s.ca1 ?? "-"}</td>
        <td>${s.ca2 ?? "-"}</td>
        <td>${s.exam ?? "-"}</td>
        <td style="font-weight:700; color:#0f766e;">${s.total ?? "-"}</td>
        <td style="font-weight:700;">${s.grade ?? "-"}</td>
        <td>${s.positionInSubject ?? "-"}</td>
        <td>${s.remark ?? "-"}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Official Report Card - ${studentName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; background: #f8fafc; padding: 24px; }
  .card { max-width: 850px; margin: 0 auto; background: #fff; border: 2px solid #0f766e; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); color: #fff; text-align: center; padding: 28px 20px; }
  .header h1 { font-size: 24px; letter-spacing: 1px; margin-bottom: 4px; font-weight: 800; }
  .header .sub { font-size: 13px; opacity: 0.95; }
  .banner { text-align: center; padding: 12px; background: #fef3c7; border-bottom: 1px solid #fcd34d; font-size: 13px; font-weight: 800; color: #92400e; letter-spacing: 1.5px; }
  .info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; padding: 20px 24px; border-bottom: 2px solid #0f766e; font-size: 13px; background: #fafafa; }
  .info .row { display: flex; justify-content: space-between; gap: 12px; }
  .info .label { color: #64748b; font-weight: 600; }
  .info .value { font-weight: 800; color: #0f172a; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
  th { background: #0f766e; color: #fff; font-size: 11.5px; font-weight: 700; letter-spacing: 0.5px; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  .summary { display: flex; flex-wrap: wrap; gap: 12px; padding: 16px 24px; font-size: 13px; background: #f0fdfa; border-top: 2px solid #0f766e; }
  .summary span { background: #fff; border: 1.5px solid #99f6e4; border-radius: 8px; padding: 6px 14px; font-weight: 800; color: #134e4a; }
  .remarks-box { padding: 18px 24px; border-top: 1px dashed #cbd5e1; font-size: 12.5px; background: #fff; }
  .remark-item { margin-bottom: 10px; }
  .remark-item strong { color: #0f766e; display: block; margin-bottom: 2px; }
  .signatures { display: flex; justify-content: space-between; gap: 20px; padding: 24px 24px 12px; font-size: 12px; color: #475569; }
  .signatures div { text-align: center; flex: 1; }
  .signatures .line { border-top: 1.5px solid #94a3b8; margin-top: 36px; padding-top: 6px; font-weight: 600; }
  .footer { text-align: center; padding: 12px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; background: #f8fafc; }
  @media print {
    body { background: #fff; padding: 0; }
    .card { border: none; border-radius: 0; max-width: none; box-shadow: none; }
  }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>${schoolName}</h1>
      <div class="sub">Excellence in Academic Rigour, Integrity & Moral Leadership</div>
    </div>
    <div class="banner">OFFICIAL CONTINUOUS ASSESSMENT & TERMINAL REPORT SHEET — ${term.toUpperCase()}</div>
    <div class="info">
      <div class="row"><span class="label">Student Name:</span><span class="value">${studentName}</span></div>
      <div class="row"><span class="label">Class / Stream:</span><span class="value">${className}</span></div>
      <div class="row"><span class="label">Position in Class:</span><span class="value" style="color:#0f766e;">${positionInClass ?? "1st in Class"}</span></div>
      <div class="row"><span class="label">Cumulative Total:</span><span class="value">${overallTotal ?? "-"} / ${maximumPossible ?? "-"}</span></div>
      <div class="row"><span class="label">Terminal Average:</span><span class="value" style="color:#0f766e;">${average ?? "-"}%</span></div>
      <div class="row"><span class="label">Promotion Status:</span><span class="value" style="color:#047857;">${promotionStatus ?? "Promoted to Next Class"}</span></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Subject</th><th>CA1 (20)</th><th>CA2 (20)</th><th>Exam (60)</th><th>Total (100)</th><th>Grade</th><th>Rank</th><th>Remarks</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="8" style="text-align:center">No examination records available.</td></tr>'}
      </tbody>
    </table>
    <div class="summary">
      <span>Total: ${overallTotal ?? "-"} / ${maximumPossible ?? "-"}</span>
      <span>Average: ${average ?? "-"}%</span>
      <span>Position: ${positionInClass ?? "-"}</span>
      ${promotionStatus ? `<span>Status: ${promotionStatus}</span>` : ""}
    </div>
    <div class="remarks-box">
      <div class="remark-item">
        <strong>Teacher's Pedagogical Assessment & Remarks:</strong>
        <p>${teacherComment || `${studentName} demonstrates exceptional consistency, intellectual curiosity, and commendable discipline across all subjects.`}</p>
      </div>
      <div class="remark-item">
        <strong>Principal's Endorsement & Directive:</strong>
        <p>${principalComment || `An outstanding academic performance. Recommended for academic merit honors.`}</p>
      </div>
    </div>
    <div class="signatures">
      <div><div class="line">Class Form Teacher</div></div>
      <div><div class="line">Principal / Head of School</div></div>
      <div><div class="line">Parent / Guardian Signature</div></div>
    </div>
    <div class="footer">
      Verification Token: ${qrVerificationToken || `VERIFY-${Math.random().toString(36).slice(2, 9).toUpperCase()}`} • LIVINGSTONEEDU Unified School Cloud
    </div>
  </div>
</body>
</html>`;
}

export function buildLessonNoteFile(note: any): string {
  if (note.content || note.markdownContent) {
    return note.content || note.markdownContent;
  }
  const lines: string[] = [];
  lines.push(`${note.subject} — Lesson Note`);
  lines.push(`Topic: ${note.topic}`);
  lines.push(`Class: ${note.className}  |  Week: ${note.week}`);
  lines.push(`Teacher: ${note.teacher}  |  Duration: ${note.durationMinutes} minutes`);
  lines.push("");
  lines.push("INTRODUCTION");
  lines.push(note.introduction || "");
  lines.push("");
  if (Array.isArray(note.behavioralObjectives)) {
    lines.push("BEHAVIORAL OBJECTIVES");
    note.behavioralObjectives.forEach((o: string, i: number) => lines.push(`${i + 1}. ${o}`));
    lines.push("");
  }
  if (Array.isArray(note.instructionalMaterials)) {
    lines.push("INSTRUCTIONAL MATERIALS");
    lines.push(note.instructionalMaterials.join(", "));
    lines.push("");
  }
  if (Array.isArray(note.coreContent)) {
    lines.push("CORE CONTENT");
    note.coreContent.forEach((block: any) => {
      lines.push(`[${block.heading}]`);
      lines.push(block.content || block.body || "");
      lines.push("");
    });
  }
  lines.push("TEACHER DEMONSTRATION");
  lines.push(note.teacherDemonstration || "");
  lines.push("");
  if (Array.isArray(note.studentActivities)) {
    lines.push("STUDENT ACTIVITIES");
    note.studentActivities.forEach((a: string, i: number) => lines.push(`${i + 1}. ${a}`));
    lines.push("");
  }
  if (Array.isArray(note.evaluationQuestions)) {
    lines.push("EVALUATION QUESTIONS");
    note.evaluationQuestions.forEach((q: string, i: number) => lines.push(`${i + 1}. ${q}`));
    lines.push("");
  }
  lines.push("SUMMARY / WRAP-UP");
  lines.push(note.summaryWrapUp || "");
  lines.push("");
  lines.push("ASSIGNMENT");
  lines.push(note.assignment || "");
  lines.push("");
  lines.push("— Generated by LIVINGSTONEEDU School Management Suite —");
  return lines.join("\n");
}

export function buildBroadsheetCsv(rows: any[]): string {
  const header = "Student,Subject,CA (30%),Exam (70%),Total (100%),Grade";
  const body = rows
    .map((c) =>
      [
        `"${String(c.studentName || "").replace(/"/g, '""')}"`,
        `"${String(c.subject || "").replace(/"/g, '""')}"`,
        c.totalCaScore ?? "",
        c.examScore ?? "",
        c.finalTotal != null ? `${c.finalTotal}%` : "",
        c.grade ?? "",
      ].join(",")
    )
    .join("\n");
  return `${header}\n${body}`;
}
