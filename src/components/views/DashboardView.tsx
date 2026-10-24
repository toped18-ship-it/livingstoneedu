import React from "react";
import { UserRole, ActiveTab } from "../../types";
import { useLiveData, useAppSettings } from "../../lib/liveStore";
import {
  Users,
  GraduationCap,
  Sparkles,
  CreditCard,
  FileCheck,
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Award,
  BookOpen,
  AlertCircle,
  Plus,
  CheckCircle2,
  Globe,
} from "lucide-react";

interface DashboardViewProps {
  currentRole: UserRole;
  userSession?: any;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAIAssistant: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentRole,
  userSession,
  onSelectTab,
  onOpenAIAssistant,
}) => {
  const { settings } = useAppSettings();
  const currentSchoolName = (() => {
    if (settings?.schoolName) return settings.schoolName;
    if (userSession?.schoolName) return userSession.schoolName;
    if (userSession?.school?.name) return userSession.school?.name;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("livingstone_registered_school");
        if (saved) return saved;
        const details = localStorage.getItem("livingstone_school_details");
        if (details) {
          const parsed = JSON.parse(details);
          if (parsed && typeof parsed === "object" && parsed.name) return parsed.name;
          if (typeof parsed === "string") return parsed;
        }
      } catch (e) {}
    }
    return "Livingstone Institution";
  })();

  // Live enrollment/faculty totals from the shared data bus (real authentic data)
  const liveStudents = useLiveData<any>("students").data || [];
  const liveTeachers = useLiveData<any>("teachers").data || [];
  const liveFees = useLiveData<any>("studentFees").data || [];
  const liveLessons = useLiveData<any>("lessonNotes").data || [];

  const studentTotal = liveStudents.length;
  const studentPresent = liveStudents.filter((s: any) => s.status !== "Inactive").length;
  const teacherTotal = liveTeachers.length;
  const teacherOnDuty = liveTeachers.filter((t: any) => t.status !== "On Leave" && t.status !== "Suspended").length;
  const attendanceRate = studentTotal > 0 ? Math.round((studentPresent / studentTotal) * 100) : 0;

  const totalUnpaidFees = liveFees
    .filter((f: any) => f.status === "Pending" || f.status === "Overdue" || f.status === "Unpaid")
    .reduce((acc: number, f: any) => acc + (Number(f.amount) || Number(f.balance) || 0), 0);

  const totalPaidFees = liveFees
    .filter((f: any) => f.status === "Paid")
    .reduce((acc: number, f: any) => acc + (Number(f.amount) || Number(f.amountPaid) || 0), 0);

  const feeCollectionRate = (totalPaidFees + totalUnpaidFees) > 0 
    ? Math.round((totalPaidFees / (totalPaidFees + totalUnpaidFees)) * 100) 
    : 100;

  const notesCount = liveLessons.length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Role Context & AI Insight */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 shadow-xl">
        <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-300/30">
                School: {currentSchoolName}
              </span>
              <span className="text-xs text-indigo-300">
                1st Term 2026/2027 Academic Session
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Welcome back, <span className="text-amber-300">{currentRole}</span>
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl mt-1">
              Here is today's real-time school operations summary, AI lesson notes activity, attendance stats, and upcoming examination milestones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onSelectTab("academic-ai-lesson-notes")}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Lesson Notes</span>
            </button>
            <button
              onClick={() => onSelectTab("academic-ai-exam-generator")}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all active:scale-95"
            >
              <FileCheck className="w-4 h-4 text-sky-300" />
              <span>Generate AI Exam</span>
            </button>
          </div>
        </div>

        {/* AI Insight Pill */}
        <div className="mt-5 pt-4 border-t border-indigo-700/60 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 mt-0.5 flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs text-indigo-100 leading-relaxed">
            <strong className="text-amber-300 font-bold">AI Pedagogy Recommendation:</strong> JSS 3 English Literature test score average increased by 14% following the latest sSolutAI-generated WAEC practice sheets. Consider scheduling mid-term mock revision.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid - Tailored per role */}
      {currentRole === "Student" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Class Rank
              </span>
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                3rd
              </span>
              <span className="text-xs font-medium text-slate-400">
                / 38 in SS 2
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>84.5% Overall Score</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Attendance Record
              </span>
              <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                98%
              </span>
              <span className="text-xs font-medium text-slate-400">
                (49/50 days)
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Good Standing</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pending Assignments
              </span>
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                2
              </span>
              <span className="text-xs font-medium text-slate-400">
                due this week
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Maths & Chemistry</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                CBT Practice Exams
              </span>
              <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                4 Ready
              </span>
              <span className="text-xs font-medium text-slate-400">
                WAEC/JAMB
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Instant AI Marking</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Students Present */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Students Present Today
              </span>
              <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {studentPresent.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-slate-400">
                / {studentTotal.toLocaleString()} total
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{attendanceRate}% Attendance Rate</span>
            </div>
          </div>

          {/* Card 2: Teachers Present */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Teachers On Duty
              </span>
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {teacherOnDuty.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-slate-400">
                / {teacherTotal.toLocaleString()} total
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{teacherTotal - teacherOnDuty} Staff on Leave/Off</span>
            </div>
          </div>

          {/* Card 3: Pending Tuition Fees */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Outstanding Fees
              </span>
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                ₦{totalUnpaidFees.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-slate-400">
                uncollected
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{feeCollectionRate}% tuition collected</span>
            </div>
          </div>

          {/* Card 4: AI Lesson Notes Generated */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                AI Notes & Curriculum
              </span>
              <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {notesCount}
              </span>
              <span className="text-xs font-medium text-slate-400">
                active notes
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>NERDC / WAEC Compliant</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Charts & Performance vs. Quick Actions & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Quick Action Buttons & Recent Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Bar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Quick Administrative & Academic Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => onSelectTab("academic-ai-lesson-notes")}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-200 border border-slate-200/60 dark:border-slate-700/60 transition-all group"
              >
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 mb-2 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  AI Lesson Note
                </span>
                <span className="text-[10px] text-slate-400">NERDC / WAEC</span>
              </button>

              <button
                onClick={() => onSelectTab("academic-ai-exam-generator")}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-200 border border-slate-200/60 dark:border-slate-700/60 transition-all group"
              >
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 mb-2 group-hover:scale-110 transition-transform">
                  <FileCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Generate Exam
                </span>
                <span className="text-[10px] text-slate-400">CA & Mid-Term</span>
              </button>

              <button
                onClick={() => onSelectTab("academic-report-cards")}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-200 border border-slate-200/60 dark:border-slate-700/60 transition-all group"
              >
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 mb-2 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Report Cards
                </span>
                <span className="text-[10px] text-slate-400">Auto Calculate</span>
              </button>

              <button
                onClick={() => onSelectTab("finance")}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-200 border border-slate-200/60 dark:border-slate-700/60 transition-all group"
              >
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 mb-2 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Collect Tuition
                </span>
                <span className="text-[10px] text-slate-400">Invoices & Receipts</span>
              </button>
            </div>
          </div>

          {/* Recent Live Operations Feed */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                <span>Live School Activity Log</span>
              </h3>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                View All Audit Logs
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Mrs. Okonkwo Chioma generated SS2 Math Exam
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 10 mins ago
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Generated 40 objective questions with marking scheme via sSolutAI AI engine.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      JSS 3 Report Card Verified
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 25 mins ago
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Vice Principal approved automatic class ranking calculation (38 students).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300 mt-0.5">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Tuition Fee Receipt Issued #LIV-8821
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 1 hour ago
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    ₦165,000 full tuition clearance recorded for student Fatima Abubakar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Events & Academic Calendar */}
        <div className="space-y-6">
          {/* Upcoming Events Widget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>School Events & Calendar</span>
              </h3>
              <button
                onClick={() => onSelectTab("communication")}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Notice Board
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                <div className="text-center px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white font-black text-xs min-w-[48px]">
                  AUG
                  <span className="block text-sm">05</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Inter-House Sports Competition
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Main Stadium • 9:00 AM
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-center px-2.5 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 text-white font-black text-xs min-w-[48px]">
                  AUG
                  <span className="block text-sm">12</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Mid-Term CA Examinations
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    All Secondary Class Halls
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-center px-2.5 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 text-white font-black text-xs min-w-[48px]">
                  AUG
                  <span className="block text-sm">20</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    PTA General Assembly & STEM Fair
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Grand Auditorium • 11:00 AM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick AI Tutor Widget */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-900 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                LIVINGSTONEEDU AI Copilot
              </h4>
            </div>
            <h3 className="text-sm font-bold">Have a pedagogy question or task?</h3>
            <p className="text-xs text-indigo-200 mt-1">
              Ask sSolutAI to outline syllabus units, draft lesson plans, or convert notes into printable PDFs.
            </p>
            <button
              onClick={onOpenAIAssistant}
              className="mt-4 w-full py-2 px-3 text-xs font-bold rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 shadow-sm transition-all text-center"
            >
              Launch AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
