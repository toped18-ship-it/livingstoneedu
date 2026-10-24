import React, { useState, useEffect } from "react";
import { Database, Search, Plus, Trash2, Edit3, Filter, Download, Check, Sparkles, BookOpen } from "lucide-react";
import { ObjectiveQuestion, ALL_CLASSES, ALL_SUBJECTS } from "../../types";
import { useLiveData, notifyDataChanged } from "../../lib/liveStore";

interface QuestionBankViewProps {
  userSession?: any;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({ userSession }) => {
  const isTeacherUser = userSession?.role === "Teacher" || userSession?.role === "Class Teacher" || userSession?.role === "Subject Teacher";
  const teacherAssignedSubjects: string[] = (isTeacherUser && Array.isArray(userSession?.assignedSubjects) && userSession.assignedSubjects.length > 0)
    ? userSession.assignedSubjects
    : (isTeacherUser && userSession?.subjectSpecialization
        ? String(userSession.subjectSpecialization).split(",").map((s: string) => s.trim()).filter(Boolean)
        : (isTeacherUser && userSession?.subject ? String(userSession.subject).split(",").map((s: string) => s.trim()).filter(Boolean) : []));

  const live = useLiveData<any>("questionBank");
  const [questions, setQuestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(() => (isTeacherUser && teacherAssignedSubjects.length > 0 ? "All" : "All"));
  const [selectedClass, setSelectedClass] = useState("All");
  const [loading, setLoading] = useState(true);

  // Keep this view live: any question added/removed anywhere refreshes instantly.
  useEffect(() => {
    if (live.data && live.data.length) setQuestions(live.data);
  }, [live.data]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/question-bank");
      const data = await res.json();
      if (data.success && data.data) {
        setQuestions(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    fetch(`/api/question-bank/${id}`, { method: "DELETE" })
      .then(() => notifyDataChanged(["questionBank"]))
      .catch(() => {});
  };

  const filteredQuestions = questions.filter((q) => {
    // Strict Subject Access Control: Teacher ONLY has access to their assigned subjects
    if (isTeacherUser && teacherAssignedSubjects.length > 0) {
      const qSub = (q.subject || "").toLowerCase();
      if (!teacherAssignedSubjects.some(as => qSub === as.toLowerCase() || qSub.includes(as.toLowerCase()))) {
        return false;
      }
    }
    const matchesQuery =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.topic && q.topic.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === "All" || q.subject === selectedSubject;
    const matchesClass = selectedClass === "All" || q.class === selectedClass;
    return matchesQuery && matchesSubject && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Institutional Question Bank Repository
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized bank storing past AI-generated and teacher-submitted examination questions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchQuestions}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            Refresh Bank
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by topic or keyword..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="All">{isTeacherUser && teacherAssignedSubjects.length > 0 ? "All My Assigned Subjects" : "All Subjects"}</option>
            {(isTeacherUser && teacherAssignedSubjects.length > 0 ? teacherAssignedSubjects : ALL_SUBJECTS).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="All">All Classes</option>
            {ALL_CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Question List Container */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading Question Bank...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No questions match your current search criteria.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                    {q.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
                    Class: {q.class || "SS2"}
                  </span>
                  {q.difficulty && (
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                      {q.difficulty}
                    </span>
                  )}
                  {q.bloomTaxonomy && (
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium text-[10px]">
                      Bloom: {q.bloomTaxonomy}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-relaxed">
                Q{idx + 1}. {q.question}
              </h3>

              {q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 pt-1">
                  {q.options.map((opt: string, optIdx: number) => (
                    <div
                      key={optIdx}
                      className={`px-3 py-1.5 rounded-lg border text-xs ${
                        optIdx === q.correctOptionIndex
                          ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-800 dark:text-emerald-300 font-bold"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="font-bold mr-1">{String.fromCharCode(65 + optIdx)}.</span>
                      {opt}
                    </div>
                  ))}
                </div>
              )}

              {q.explanation && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                  <strong className="text-slate-800 dark:text-slate-200">Solution/Marking Scheme: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
