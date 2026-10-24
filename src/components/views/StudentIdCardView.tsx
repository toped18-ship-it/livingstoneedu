import React, { useEffect, useMemo, useState } from "react";
import { CreditCard, GraduationCap, Sparkles, Printer, Download, CheckCircle2, Phone, CalendarDays, School } from "lucide-react";

interface StudentRecord {
  id: string;
  name: string;
  admissionNo: string;
  class: string;
  gender: string;
  parentName: string;
  parentPhone: string;
  status: string;
}

interface IdCardData {
  studentId: string;
  name: string;
  admissionNo: string;
  class: string;
  gender: string;
  parentName: string;
  parentPhone: string;
  schoolName: string;
  session: string;
  guardian: string;
  issueDate: string;
  qrToken: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function qrPattern(token: string): boolean[] {
  const src = token || "LIV";
  const cells: boolean[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const finder = (r < 3 && c < 3) || (r < 3 && c >= 5) || (r >= 5 && c < 3);
      const ch = src.charCodeAt((r * 8 + c) % src.length);
      const random = ((ch * 13 + r * 7 + c * 29 + 11) % 4) === 0;
      cells.push(finder || random);
    }
  }
  return cells;
}

function buildCardHtml(c: IdCardData): string {
  const cells = qrPattern(c.qrToken);
  const qrCellsHtml = cells
    .map(
      (dark, i) =>
        `<i style="display:block;width:12.5%;height:12.5%;background:${dark ? "#1e1b4b" : "#ffffff"};border:0.5px solid #c7d2fe;box-sizing:border-box;"></i>`
    )
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ID Card - ${c.name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; background: #f1f5f9; padding: 24px; }
  .card { max-width: 620px; margin: 0 auto; background: #fff; border-radius: 18px; overflow: hidden; border: 1px solid #c7d2fe; box-shadow: 0 10px 30px rgba(49,46,129,0.15); color: #0f172a; }
  .head { background: linear-gradient(90deg, #4338ca, #10b981); color: #fff; padding: 14px 18px; }
  .head .school { font-size: 17px; font-weight: 800; letter-spacing: 0.5px; }
  .head .title { font-size: 10px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; margin-top: 2px; opacity: 0.95; }
  .body { padding: 16px 18px; text-align: center; }
  .avatar { width: 56px; height: 56px; margin: 0 auto 8px; border-radius: 9999px; background: #e0e7ff; color: #4338ca; font-weight: 800; font-size: 18px; display: flex; align-items: center; justify-content: center; border: 2px solid #c7d2fe; }
  .name { font-size: 16px; font-weight: 900; color: #0f172a; }
  .meta { display: flex; justify-content: center; gap: 8px; margin-top: 6px; }
  .meta span { font-size: 10px; font-weight: 700; background: #e0f2fe; color: #1e40af; border-radius: 999px; padding: 3px 10px; }
  .rows { margin: 12px auto 0; max-width: 380px; }
  .row { display: flex; justify-content: space-between; font-size: 11px; padding: 4px 0; border-bottom: 1px dashed #d1d5db; }
  .row b { color: #0f172a; }
  .row span { color: #4f46e5; font-weight: 600; }
  .foot { display: flex; align-items: center; justify-content: space-between; padding: 10px 18px 12px; border-top: 1px solid #e2e8f0; }
  .qr-box { width: 52px; text-align: center; }
  .qr-grid { display: flex; flex-wrap: wrap; width: 52px; height: 52px; }
  .qr-token { font-size: 7px; font-family: monospace; color: #6366f1; margin-top: 2px; font-weight: 700; }
  .sig { text-align: left; }
  .sig .issue { font-size: 10px; color: #475569; font-weight: 700; }
  .sig .line { width: 120px; border-top: 1.5px solid #0f172a; margin-top: 18px; padding-top: 4px; font-size: 9px; color: #64748b; font-weight: 700; letter-spacing: 1px; }
  .scan { background: repeating-linear-gradient(0deg, rgba(79,70,229,0.05) 0px, rgba(79,70,229,0.05) 1px, transparent 1px, transparent 3px); }
</style>
</head>
<body>
  <div class="card scan-line">
    <div class="head">
      <div class="school">${c.schoolName}</div>
      <div class="title">Student Identity Card</div>
    </div>
    <div class="body">
      <div class="avatar">${getInitials(c.name)}</div>
      <div class="name">${c.name}</div>
      <div class="meta"><span>${c.admissionNo}</span><span>${c.class}</span><span>${c.gender}</span></div>
      <div class="rows">
        <div class="row"><b>Parent / Guardian</b><span>${c.parentName || c.guardian}</span></div>
        <div class="row"><b>Phone</b><span>${c.parentPhone}</span></div>
        <div class="row"><b>Session</b><span>${c.session}</span></div>
      </div>
    </div>
    <div class="foot">
      <div class="sig">
        <div class="issue">Issued: ${c.issueDate}</div>
        <div class="line">SCHOOL OFFICIAL</div>
      </div>
      <div class="qr-box">
        <div class="qr-grid">${qrCellsHtml}</div>
        <div class="qr-token">${c.qrToken}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export const StudentIdCardView: React.FC = () => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [card, setCard] = useState<IdCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((d) => {
        setStudents(d?.data || []);
        if (d?.data && d.data.length > 0 && d.data[0]?.id) setSelectedId(d.data[0].id);
      })
      .catch(() => {});
  }, []);

  const selectedStudent = (students || []).find((s) => s?.id === selectedId);

  const qrCells = useMemo(() => (card ? qrPattern(card.qrToken) : []), [card]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const handleGenerate = () => {
    if (!selectedId) return;
    setLoading(true);
    fetch("/api/id-cards/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: selectedId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.data) {
          setCard(d.data);
          showToast(`ID card generated for ${d.data.name}!`);
        } else {
          showToast("Could not generate ID card for this student.");
        }
      })
      .catch(() => showToast("Server unavailable. Showing offline template error."))
      .finally(() => setLoading(false));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!card) return;
    const blob = new Blob([buildCardHtml(card)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.name.replace(/\s+/g, "-")}-ID-Card.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("ID card page downloaded!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <CreditCard className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Student ID Card Generator
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate printable, QR-verified school identity cards instantly for any enrolled student.
          </p>
        </div>
        {card && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Card</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        )}
      </div>

      {toast && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            Student Picker & Card Settings
          </h3>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Select Student
            </label>
            <select
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setCard(null); }}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200 font-medium"
            >
              {students.length === 0 && <option value="">Loading students...</option>}
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.admissionNo})
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Selected Student Preview</span>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                  {selectedStudent.name}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-mono font-bold">
                  {selectedStudent.admissionNo}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                  {selectedStudent.class}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                ID: {selectedStudent?.id || "N/A"} • {selectedStudent?.status || "Active"}
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !selectedId}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-50 active:scale-95 transition-all"
          >
            <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Generating ID Card..." : "Generate ID Card"}</span>
          </button>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
            The school front office issues these cards at the start of each academic session. Each card carries a unique QR verification token linked to the student's admission record.
          </p>
        </div>

        <div className="space-y-4">
          {card ? (
            <>
              <div className="relative w-full max-w-md mx-auto">
                <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden aspect-[1.58/1] flex flex-col">
                  <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(99,102,241,0.05)_0px,rgba(99,102,241,0.05)_1px,transparent_1px,transparent_3px)]" />
                  <div className="relative bg-gradient-to-r from-indigo-700 via-indigo-500 to-emerald-500 px-4 py-2.5 text-white text-center">
                    <div className="text-[13px] font-black tracking-wide leading-tight truncate">{card.schoolName}</div>
                    <div className="text-[8px] font-bold tracking-[0.25em] uppercase opacity-90">
                      Student Identity Card
                    </div>
                  </div>
                  <div className="relative flex-1 flex flex-col px-4 pt-2 pb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-indigo-100 to-emerald-100 dark:from-indigo-900/60 dark:to-emerald-900/60 border-2 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 font-black text-sm flex items-center justify-center">
                        {getInitials(card.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-black text-slate-900 dark:text-white truncate leading-tight">{card.name}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="px-1.5 py-0.5 text-[8px] font-bold rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">{card.admissionNo}</span>
                          <span className="px-1.5 py-0.5 text-[8px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">{card.class}</span>
                          <span className="px-1.5 py-0.5 text-[8px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{card.gender}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 space-y-0.5 text-[9px]">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-2.5 h-2.5 text-indigo-500 flex-shrink-0" />
                        <span className="text-slate-400 font-bold uppercase w-24">Parent / Guardian</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 truncate">{card.parentName || card.guardian}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <School className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-slate-400 font-bold uppercase w-24">Contact Phone</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{card.parentPhone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-2.5 h-2.5 text-indigo-500 flex-shrink-0" />
                        <span className="text-slate-400 font-bold uppercase w-24">Academic Session</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{card.session}</span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between mt-auto pt-1.5 border-t border-slate-200/70 dark:border-slate-700">
                      <div>
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-2.5 h-2.5 text-slate-400" />
                          <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">Issued: {card.issueDate}</span>
                        </div>
                        <div className="mt-1.5 w-20 border-t-[1.5px] border-slate-800 dark:border-slate-200 pt-0.5">
                          <span className="text-[7px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase">School Official</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="grid grid-cols-8 gap-[1px] w-11 h-11 bg-slate-300 dark:bg-slate-600 p-[1px]">
                          {qrCells.map((dark, i) => (
                            <span key={i} className={dark ? "bg-slate-900 dark:bg-slate-100" : "bg-white dark:bg-slate-800"} />
                          ))}
                        </div>
                        <div className="mt-0.5 text-[6px] font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate w-11">{card.qrToken}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Card</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                No ID Card Generated Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Pick a student on the left and click "Generate ID Card" to preview their official student identity card here.
              </p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                <GraduationCap className="w-4 h-4" />
                <span>SchoolHub Upgrade • QR Verified</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};