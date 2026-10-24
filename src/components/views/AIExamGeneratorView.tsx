import React, { useState, useEffect } from "react";
import { Sparkles, Printer, Download, Save, Check, Copy, FileCheck, Layers, HelpCircle, FileText } from "lucide-react";
import { ExamPaper, ALL_CLASSES, getSubjectsForClass } from "../../types";
import { useAppSettings } from "../../lib/liveStore";

interface AIExamGeneratorViewProps {
  userSession?: any;
}

export const AIExamGeneratorView: React.FC<AIExamGeneratorViewProps> = ({ userSession }) => {
  const { settings } = useAppSettings();
  const currentSchoolName = settings?.schoolName || userSession?.schoolName || "School Assessment";
  const [className, setClassName] = useState("SS 2");

  const isTeacherUser = userSession?.role === "Teacher" || userSession?.role === "Class Teacher" || userSession?.role === "Subject Teacher";
  const teacherAssignedSubjects: string[] = (isTeacherUser && Array.isArray(userSession?.assignedSubjects) && userSession.assignedSubjects.length > 0)
    ? userSession.assignedSubjects
    : (isTeacherUser && userSession?.subjectSpecialization
        ? String(userSession.subjectSpecialization).split(",").map((s: string) => s.trim()).filter(Boolean)
        : (isTeacherUser && userSession?.subject ? String(userSession.subject).split(",").map((s: string) => s.trim()).filter(Boolean) : []));

  const allClassSubjects = getSubjectsForClass(className);
  // Strict Subject Access Control: Teacher ONLY has access to their assigned subjects
  const availableSubjects = (isTeacherUser && teacherAssignedSubjects.length > 0)
    ? teacherAssignedSubjects
    : allClassSubjects;

  const [subject, setSubject] = useState(() => (isTeacherUser && teacherAssignedSubjects.length > 0 ? teacherAssignedSubjects[0] : "Mathematics"));

  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.includes(subject)) {
      setSubject(availableSubjects[0]);
    }
  }, [availableSubjects, subject]);
  const [term, setTerm] = useState(settings?.academicTerms || "First Term");
  const [session, setSession] = useState(settings?.academicSession ? settings.academicSession.replace(/[^0-9/]/g, "") : "2026/2027");
  const [examType, setExamType] = useState("Mid-Term Examination");
  const [questionCount, setQuestionCount] = useState(20);
  const [difficulty, setDifficulty] = useState("Medium");
  const [topics, setTopics] = useState("Quadratic Equations, Indices & Logarithms, Trigonometric Ratios");

  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<ExamPaper | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState("");

  const handleGenerateExam = async () => {
    setLoading(true);
    setSavedSuccessMsg("");
    try {
      const res = await fetch("/api/ai/exam-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className,
          subject,
          term,
          session,
          examType,
          questionCount,
          difficulty,
          topics,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedExam(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToQuestionBank = async () => {
    if (!generatedExam) return;
    try {
      for (const objQ of generatedExam.objectives) {
        await fetch("/api/question-bank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: generatedExam.subject,
            class: generatedExam.className,
            term: generatedExam.term,
            topic: topics,
            difficulty,
            type: "objective",
            question: objQ.question,
            options: objQ.options,
            correctOptionIndex: objQ.correctOptionIndex,
            explanation: objQ.explanation,
            bloomTaxonomy: objQ.bloomTaxonomy,
          }),
        });
      }
      setSavedSuccessMsg("Exam Questions successfully saved to Question Bank!");
      setTimeout(() => setSavedSuccessMsg(""), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              AI Exam & Question Paper Generator
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated WAEC/NECO style paper generation with randomized options, marking scheme, and Bloom Taxonomy alignment.
          </p>
        </div>

        {savedSuccessMsg && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exam Config Controls */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            Examination Configuration
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Class Level
              </label>
              <select
                value={className}
                onChange={(e) => {
                  const newClass = e.target.value;
                  setClassName(newClass);
                  const newSubjs = (isTeacherUser && teacherAssignedSubjects.length > 0)
                    ? teacherAssignedSubjects
                    : getSubjectsForClass(newClass);
                  if (!newSubjs.includes(subject)) {
                    setSubject(newSubjs[0] || "Mathematics");
                  }
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200 font-medium"
              >
                <optgroup label="Primary School (Primary 1 - 6)">
                  <option value="Primary 1">Primary 1 (Basic 1)</option>
                  <option value="Primary 2">Primary 2 (Basic 2)</option>
                  <option value="Primary 3">Primary 3 (Basic 3)</option>
                  <option value="Primary 4">Primary 4 (Basic 4)</option>
                  <option value="Primary 5">Primary 5 (Basic 5)</option>
                  <option value="Primary 6">Primary 6 (Basic 6)</option>
                </optgroup>
                <optgroup label="Junior Secondary (JSS 1 - 3)">
                  <option value="JSS 1">JSS 1 (Basic 7)</option>
                  <option value="JSS 2">JSS 2 (Basic 8)</option>
                  <option value="JSS 3">JSS 3 (Basic 9 / BECE)</option>
                </optgroup>
                <optgroup label="Senior Secondary (SS 1 - 3)">
                  <option value="SS 1">SS 1 (Senior Secondary 1)</option>
                  <option value="SS 2">SS 2 (Senior Secondary 2)</option>
                  <option value="SS 3">SS 3 (WAEC / NECO)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Subject ({availableSubjects.length} Available)
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200 font-medium"
              >
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Exam Assessment Type
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
              >
                <option value="Continuous Assessment (CA 1)">Continuous Assessment (CA 1)</option>
                <option value="Continuous Assessment (CA 2)">Continuous Assessment (CA 2)</option>
                <option value="Mid-Term Examination">Mid-Term Examination</option>
                <option value="Terminal Final Examination">Terminal Final Examination</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Question Count
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
              >
                <option value={20}>20 Objective Questions</option>
                <option value={30}>30 Objective Questions</option>
                <option value={40}>40 Objective Questions</option>
                <option value={50}>50 Objective Questions</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
              >
                <option value="Easy">Easy (Foundation)</option>
                <option value="Medium">Medium (Standard WAEC)</option>
                <option value="Hard">Hard (Advanced / Olympiad)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Academic Session
              </label>
              <input
                type="text"
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Topics Covered (Comma Separated)
            </label>
            <textarea
              rows={3}
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <button
            onClick={handleGenerateExam}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
          >
            <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Generating Examination..." : "Generate AI Examination"}</span>
          </button>
        </div>

        {/* Generated Exam Paper Output */}
        <div className="lg:col-span-2 space-y-4">
          {generatedExam ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm print:shadow-none print:border-none space-y-5">
              {/* Controls Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                    {generatedExam.subject} • {generatedExam.className}
                  </span>
                  <button
                    onClick={() => setShowAnswerKey(!showAnswerKey)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      showAnswerKey
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {showAnswerKey ? "Answer Key & Scheme: ON" : "Answer Key: OFF"}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveToQuestionBank}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to Question Bank</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Exam</span>
                  </button>
                </div>
              </div>

              {/* Exam Official Header */}
              <div className="text-center border-b-2 border-slate-900 dark:border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                  {currentSchoolName}
                </h2>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  {generatedExam.title}
                </p>
                <div className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center justify-center gap-4">
                  <span>TIME ALLOWED: {generatedExam.timeAllowed}</span>
                  <span>SESSION: {session}</span>
                </div>
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-700 dark:text-slate-300 italic">
                  <strong>General Instructions:</strong> {generatedExam.instructions}
                </div>
              </div>

              {/* Section A: Objectives */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span>SECTION A: MULTIPLE CHOICE OBJECTIVE QUESTIONS</span>
                  <span>(1 Mark Each)</span>
                </h3>

                <div className="space-y-4">
                  {generatedExam.objectives.map((obj, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {idx + 1}. {obj.question}
                        </span>
                        {obj.bloomTaxonomy && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex-shrink-0 font-medium">
                            {obj.bloomTaxonomy}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                        {obj.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                              showAnswerKey && optIdx === obj.correctOptionIndex
                                ? "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 text-emerald-800 dark:text-emerald-300 font-bold"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span className="font-bold mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                            {opt}
                          </div>
                        ))}
                      </div>

                      {showAnswerKey && obj.explanation && (
                        <div className="mt-1 p-2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-[11px] text-indigo-900 dark:text-indigo-200">
                          <strong>Solution Explanation:</strong> {obj.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section B: Theory Questions */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span>SECTION B: ESSAY & THEORY QUESTIONS</span>
                  <span>(Answer 2 Questions)</span>
                </h3>

                <div className="space-y-4">
                  {generatedExam.theoryQuestions.map((th, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2 font-bold text-slate-900 dark:text-white">
                        <span>{th.question}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-black flex-shrink-0">[{th.marks} Marks]</span>
                      </div>

                      {showAnswerKey && (
                        <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 whitespace-pre-line">
                          <strong>Official Marking Scheme:</strong>
                          {"\n" + th.markingScheme}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                No Examination Paper Generated
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Configure exam type, question count, and topics on the left to auto-generate a complete examination paper with marking scheme.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
