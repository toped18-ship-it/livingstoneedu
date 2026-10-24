import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  UserPlus,
  ClipboardList,
  Trophy,
  Plus,
  Trash2,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Users,
  BookOpen,
  Building2,
  Award,
  Timer,
  FilePlus2,
} from "lucide-react";

const ENTRANCE_CLASSES = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3"
];

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  classApplied: string;
  examDate: string;
  status: string;
}

interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
}

interface EntranceExam {
  id: string;
  title: string;
  classApplied: string;
  durationMinutes: number;
  totalQuestions: number;
  questions: ExamQuestion[];
  status: string;
}

interface MeritEntry {
  candidateId: string;
  examId: string;
  examTitle: string;
  score: number;
  total: number;
  percent: number;
  status: "Passed" | "Failed";
  submittedAt: string;
}

interface DraftQuestion {
  question: string;
  options: string[];
  correct: number;
}

const statusPill: Record<string, string> = {
  Scheduled: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Written: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Admitted: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Passed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Failed: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

const pill = (status: string) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusPill[status] || "bg-slate-500/15 text-slate-600 dark:text-slate-400"}`}>
    {status}
  </span>
);

export const EntranceExamView: React.FC = () => {
  const [mode, setMode] = useState<"candidates" | "exam" | "results">("candidates");

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    classApplied: "JSS 1",
    examDate: new Date().toISOString().split("T")[0],
  });
  const [regMsg, setRegMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [exams, setExams] = useState<EntranceExam[]>([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newExam, setNewExam] = useState({ title: "", classApplied: "JSS 1", durationMinutes: 30 });
  const [draft, setDraft] = useState<DraftQuestion>({ question: "", options: ["", "", "", ""], correct: 0 });
  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const [draftError, setDraftError] = useState("");
  const [examMsg, setExamMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [activeExam, setActiveExam] = useState<EntranceExam | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ score: number; total: number; percent: number; status: string } | null>(null);

  const [merit, setMerit] = useState<MeritEntry[]>([]);
  const [meritLoading, setMeritLoading] = useState(true);

  const loadCandidates = () => {
    setCandidatesLoading(true);
    fetch("/api/entrance/candidates")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setCandidates(d.data);
      })
      .catch(() => {})
      .finally(() => setCandidatesLoading(false));
  };

  const loadExams = () => {
    setExamsLoading(true);
    fetch("/api/entrance/exams")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setExams(d.data);
      })
      .catch(() => {})
      .finally(() => setExamsLoading(false));
  };

  const loadMerit = () => {
    setMeritLoading(true);
    fetch("/api/entrance/merit")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setMerit(d.data);
      })
      .catch(() => {})
      .finally(() => setMeritLoading(false));
  };

  useEffect(() => {
    if (mode === "candidates") loadCandidates();
    if (mode === "exam") loadExams();
    if (mode === "results") {
      loadMerit();
      if (!candidates.length) loadCandidates();
    }
  }, [mode]);

const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().slice(0, 10);
    if (!form.name.trim() || !form.email.trim()) {
      setRegMsg({ ok: false, text: "Name and email are required." });
      return;
    }
    fetch("/api/entrance/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, examDate: form.examDate || todayStr }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          const todayStr = new Date().toISOString().slice(0, 10);
          setRegMsg({ ok: true, text: `${d.data.name} registered successfully.` });
          setForm({ name: "", email: "", phone: "", classApplied: "JSS 1", examDate: todayStr });
          loadCandidates();
        } else {
          setRegMsg({ ok: false, text: d.message || "Registration failed." });
        }
      })
      .catch(() => setRegMsg({ ok: false, text: "Network error during registration." }));
  };

  const handleAdmit = (c: Candidate) => {
    if (!c?.id) return;
    fetch(`/api/entrance/candidates/${c.id}/admit`, { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) loadCandidates();
      })
      .catch(() => {});
  };

  const updateDraft = (idx: number, val: string) => {
    setDraft((prev) => {
      const options = prev.options.map((o, i) => (i === idx ? val : o));
      return { ...prev, options };
    });
  };

  const addDraft = () => {
    if (!draft.question.trim()) {
      setDraftError("Question text cannot be empty.");
      return;
    }
    if (draft.options.some((o) => !o.trim())) {
      setDraftError("All four options must be filled in.");
      return;
    }
    setDraftError("");
    setDrafts((prev) => [...prev, { ...draft, options: [...draft.options] }]);
    setDraft({ question: "", options: ["", "", "", ""], correct: 0 });
  };

  const removeDraft = (idx: number) => setDrafts((prev) => prev.filter((_, i) => i !== idx));

  const handleCreateExam = () => {
    if (!newExam.title.trim()) {
      setExamMsg({ ok: false, text: "Exam title is required." });
      return;
    }
    if (!drafts.length) {
      setExamMsg({ ok: false, text: "Add at least one question before creating the exam." });
      return;
    }
    fetch("/api/entrance/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newExam.title,
        classApplied: newExam.classApplied,
        durationMinutes: Number(newExam.durationMinutes),
        questions: drafts.map((q) => ({
          question: q.question,
          options: q.options,
          correctOptionIndex: q.correct,
          marks: 2,
        })),
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setExamMsg({ ok: true, text: `"${d.data.title}" created with ${d.data.questions.length} questions.` });
          setShowCreate(false);
          setNewExam({ title: "", classApplied: "JSS 1", durationMinutes: 30 });
          setDrafts([]);
          loadExams();
        } else {
          setExamMsg({ ok: false, text: d.message || "Failed to create exam." });
        }
      })
      .catch(() => setExamMsg({ ok: false, text: "Network error creating exam." }));
  };

  const openCbt = (exam: EntranceExam) => {
    setActiveExam(exam);
    setQIndex(0);
    setAnswers(Array(exam.questions.length).fill(-1));
    setResult(null);
  };

  const selectOption = (optionIndex: number) => {
    setAnswers((prev) => prev.map((a, i) => (i === qIndex ? optionIndex : a)));
  };

  const submitExam = () => {
    if (!activeExam?.id) return;
    fetch(`/api/entrance/exams/${activeExam.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, candidateId: "ENT-2026-002" }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setResult(d.data);
      })
      .catch(() => {});
  };

  const next = () => {
    if (!activeExam || !activeExam.questions) return;
    if (qIndex < activeExam.questions.length - 1) setQIndex((i) => i + 1);
    else submitExam();
  };

  const candidateName = (id: string) => {
    const c = (candidates || []).find((x) => x?.id === id);
    return c ? c.name : id;
  };

  const tabBtn = (key: "candidates" | "exam" | "results", icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setMode(key)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
        mode === key
          ? "bg-indigo-600 text-white shadow-sm"
          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const inputCls =
    "w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200";

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-white/20">
            <GraduationCap className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold">Entrance Examination</h1>
            <p className="text-xs text-white/80 mt-0.5">
              Register candidates, run computer-based tests and publish the merit list.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabBtn("candidates", <Users className="w-4 h-4" />, "Candidates")}
        {tabBtn("exam", <ClipboardList className="w-4 h-4" />, "Exams & CBT")}
        {tabBtn("results", <Trophy className="w-4 h-4" />, "Merit List")}
      </div>

      {mode === "candidates" && (
        <>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <UserPlus className="w-5 h-5" />
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Candidate Registration</h2>
            </div>
            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className={inputCls} />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" type="email" className={inputCls} />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" type="tel" className={inputCls} />
              <select value={form.classApplied} onChange={(e) => setForm({ ...form, classApplied: e.target.value })} className={inputCls}>
                {ENTRANCE_CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} type="date" className={inputCls} />
              <div className="flex items-center">
                <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Register Candidate
                </button>
              </div>
            </form>
            {regMsg && (
              <p className={`mt-3 text-xs font-medium ${regMsg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {regMsg.text}
              </p>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Registered Candidates</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold">{candidates.length}</span>
              </div>
              <button onClick={loadCandidates} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200">
                Refresh
              </button>
            </div>
            {candidatesLoading ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4">Loading candidates...</p>
            ) : candidates.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4">No candidates registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 uppercase text-[10px] tracking-wider">
                      <th className="py-2 pr-3">Name</th>
                      <th className="py-2 pr-3">Contact</th>
                      <th className="py-2 pr-3">Class Applied</th>
                      <th className="py-2 pr-3">Exam Date</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(candidates || []).map((c) => (
                      <tr key={c?.id || c?.name} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <td className="py-2 pr-3 font-semibold text-slate-800 dark:text-slate-200">{c?.name}</td>
                        <td className="py-2 pr-3 text-slate-500 dark:text-slate-400">
                          {c?.email}
                          <span className="block">{c?.phone}</span>
                        </td>
                        <td className="py-2 pr-3 text-slate-600 dark:text-slate-300">{c?.classApplied}</td>
                        <td className="py-2 pr-3 text-slate-600 dark:text-slate-300">{c?.examDate}</td>
                        <td className="py-2 pr-3">{pill(c?.status || "Pending")}</td>
                        <td className="py-2">
                          {c?.status === "Admitted" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Admitted
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAdmit(c)}
                              className="px-3 py-1.5 text-[11px] font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Admit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {mode === "exam" && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <ClipboardList className="w-5 h-5" />
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Entrance Exams</h2>
            </div>
            <button
              onClick={() => {
                setShowCreate((s) => !s);
                setExamMsg(null);
              }}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5"
            >
              <FilePlus2 className="w-4 h-4" /> Create New Exam
            </button>
          </div>

          {showCreate && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-4 space-y-3">
              <div className="flex items-start justify-between">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Build Exam Paper</p>
                <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input value={newExam.title} onChange={(e) => setNewExam({ ...newExam, title: e.target.value })} placeholder="Exam title (e.g. Entrance Test 2026)" className={inputCls} />
                <select value={newExam.classApplied} onChange={(e) => setNewExam({ ...newExam, classApplied: e.target.value })} className={inputCls}>
                  {ENTRANCE_CLASSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input value={newExam.durationMinutes} onChange={(e) => setNewExam({ ...newExam, durationMinutes: Number(e.target.value) })} type="number" min={5} className={inputCls} placeholder="Duration (mins)" />
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <input value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} placeholder="Question text" className={inputCls} />
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="correct"
                        checked={draft.correct === i}
                        onChange={() => setDraft({ ...draft, correct: i })}
                        className="accent-indigo-600"
                        title={`Correct: option ${["A", "B", "C", "D"][i]}`}
                      />
                      <input value={draft.options[i]} onChange={(e) => updateDraft(i, e.target.value)} placeholder={`Option ${["A", "B", "C", "D"][i]}`} className={inputCls} />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-400">Select the radio beside the correct option. Marks: 2 per question.</p>
                  <button onClick={addDraft} className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>
                {draftError && <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">{draftError}</p>}
              </div>

              {drafts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Added Questions ({drafts.length})</p>
                  {drafts.map((q, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <span className="text-indigo-600 dark:text-indigo-400">Q{i + 1}.</span> {q.question}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          A: {q.options[0]} · B: {q.options[1]} · C: {q.options[2]} · D: {q.options[3]} · Correct: {["A", "B", "C", "D"][q.correct]}
                        </p>
                      </div>
                      <button onClick={() => removeDraft(i)} className="text-rose-500 hover:text-rose-600 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                {examMsg && <p className={`text-xs font-medium ${examMsg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{examMsg.text}</p>}
                <button onClick={handleCreateExam} className="ml-auto px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
                  Create Exam
                </button>
              </div>
            </div>
          )}

          {examsLoading ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-4">Loading exams...</p>
          ) : exams.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-4">No exams created yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exams.map((ex) => (
                <div key={ex.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{ex.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ex.classApplied}</p>
                    </div>
                    {pill(ex.status)}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> {ex.durationMinutes} mins</span>
                    <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {ex.totalQuestions} questions</span>
                  </div>
                  <button onClick={() => openCbt(ex)} className="px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center gap-1.5">
                    <ClipboardList className="w-4 h-4" />  Take / Sample CBT
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeExam && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeExam.title}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Question {qIndex + 1} of {activeExam.questions.length} · Candidate ENT-2026-002
                    </p>
                  </div>
                  <button onClick={() => setActiveExam(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {result ? (
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{result.percent}%</p>
                    <div className="mt-2">{pill(result.status)}</div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Score</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{result.score}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Total</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{result.total}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Result</p>
                        <p className={`text-lg font-bold ${result.status === "Passed" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {result.status}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setActiveExam(null)} className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3">
                      <span className="text-indigo-600 dark:text-indigo-400">Q{qIndex + 1}.</span> {activeExam.questions[qIndex].question}
                    </p>
                    <div className="space-y-2">
                      {activeExam.questions[qIndex].options.map((opt, i) => {
                        const selected = answers[qIndex] === i;
                        return (
                          <button
                            key={i}
                            onClick={() => selectOption(i)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs border text-slate-700 dark:text-slate-200 flex items-center justify-between transition ${
                              selected
                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            <span>
                              <span className="font-bold mr-2">{["A", "B", "C", "D"][i]}.</span>
                              {opt}
                            </span>
                            {selected && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {answers.filter((a) => a !== -1).length} answered
                      </span>
                      <div className="flex items-center gap-2">
                        {qIndex > 0 && (
                          <button onClick={() => setQIndex((i) => i - 1)} className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <ChevronLeft className="w-3.5 h-3.5" /> Prev
                          </button>
                        )}
                        <button onClick={next} className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1">
                          {qIndex < activeExam.questions.length - 1 ? (<>Next <ChevronRight className="w-3.5 h-3.5" /></>) : "Submit"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === "results" && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <Trophy className="w-5 h-5" />
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Merit List</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">{merit.length} placed</span>
            </div>
            <button onClick={loadMerit} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200">
              Refresh
            </button>
          </div>
          {meritLoading ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-4">Loading merit list...</p>
          ) : merit.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-4">No submissions yet — candidates must take the CBT first.</p>
          ) : (
            <div className="space-y-2">
              {merit.map((m, idx) => {
                const rank = idx + 1;
                const pass = m.status === "Passed";
                return (
                  <div key={`${m.candidateId}-${m.examId}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold ${
                      rank === 1 ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" : rank === 2 ? "bg-slate-400/20 text-slate-500 dark:text-slate-300" : rank === 3 ? "bg-orange-500/20 text-orange-600 dark:text-orange-400" : "bg-slate-500/15 text-slate-500 dark:text-slate-400"
                    }`}>
                      {rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{candidateName(m.candidateId)}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{m.score}/{m.total} · {m.examTitle}</span>
                          {pill(m.status)}
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pass ? "bg-emerald-500" : "bg-rose-500"}`}
                            style={{ width: `${Math.min(100, m.percent)}%` }}
                          />
                        </div>
                        <span className={`text-[11px] font-bold w-10 text-right ${pass ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {m.percent}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};