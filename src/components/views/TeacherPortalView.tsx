import React, { useState, useEffect } from "react";
import { useLiveData, useGlobalRefresh, useAppSettings } from "../../lib/liveStore";
import { Logo } from "../Logo";
import { AIResultCompilationModule } from "./AIResultCompilationModule";
import { AILessonNotesView } from "./AILessonNotesView";
import { AIExamGeneratorView } from "./AIExamGeneratorView";
import { AttendanceTrackerView } from "./AttendanceTrackerView";
import { QuestionBankView } from "./QuestionBankView";
import { CommunicationView } from "./CommunicationView";
import { FCMPushAlertManager } from "../FCMPushAlertManager";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  ClipboardList,
  Sparkles,
  FileText,
  Clock,
  CalendarDays,
  Award,
  MessageSquare,
  CheckCircle2,
  FileDown,
  FileInput,
  HelpCircle,
  BarChart3,
  Send,
  RefreshCw,
  Search,
  Wifi,
  ShieldCheck,
  Bell,
  User,
  Edit,
  Plus,
  TrendingUp,
  Target,
  GraduationCap,
  Menu,
  X,
  Printer,
  Download,
  Phone,
  LogOut,
} from "lucide-react";

interface TeacherPortalProps {
  currentRole?: string;
  userSession?: any;
  onSelectTab?: (tab: string) => void;
  onLogout?: () => void;
}

type TeacherPortalSection =
  | "dashboard"
  | "my-classes"
  | "my-subjects"
  | "lesson-notes"
  | "scheme-of-work"
  | "weekly-planner"
  | "attendance"
  | "continuous-assessment"
  | "ai-exam-gen"
  | "question-bank"
  | "grade-entry"
  | "student-results"
  | "communication"
  | "messages"
  | "calendar"
  | "profile";

const SIDEBAR_ITEMS: { id: TeacherPortalSection; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "my-classes", label: "My Classes", icon: Users },
  { id: "my-subjects", label: "My Subjects", icon: BookOpen },
  { id: "lesson-notes", label: "Lesson Notes", icon: FileText },
  { id: "scheme-of-work", label: "Scheme of Work", icon: Calendar },
  { id: "weekly-planner", label: "Weekly Planner", icon: CalendarDays },
  { id: "attendance", label: "Attendance", icon: ClipboardList },
  { id: "continuous-assessment", label: "Continuous Assessment", icon: Award },
  { id: "ai-exam-gen", label: "AI Exam Generator", icon: Sparkles },
  { id: "question-bank", label: "Question Bank", icon: HelpCircle },
  { id: "grade-entry", label: "Grade Entry", icon: FileInput },
  { id: "student-results", label: "Student Results", icon: BarChart3 },
  { id: "communication", label: "Communication & Broadcasts", icon: MessageSquare },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "profile", label: "Profile", icon: User },
];

const TEACHER_ROLES = ["Teacher", "Class Teacher", "Subject Teacher", "Lab Assistant", "Teaching Assistant"];

export function TeacherPortalView({ currentRole = "Teacher", userSession, onSelectTab, onLogout }: TeacherPortalProps) {
  const { settings } = useAppSettings();
  const [activeSection, setActiveSection] = useState<TeacherPortalSection>("dashboard");
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [schoolName, setSchoolName] = useState(() => settings?.schoolName || userSession?.schoolName || "Livingstone Institution");

  const handleTeacherLogout = () => {
    try {
      localStorage.removeItem("livingstone_user_session");
      sessionStorage.removeItem("livingstone_user_session");
    } catch (e) {}
    if (onLogout) {
      onLogout();
    } else if (onSelectTab) {
      onSelectTab("auth");
    } else {
      window.location.reload();
    }
  };

  useEffect(() => {
    if (settings?.schoolName) setSchoolName(settings.schoolName);
  }, [settings?.schoolName]);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedClassTab, setSelectedClassTab] = useState<string>("");
  const [classRosterSearch, setClassRosterSearch] = useState<string>("");
  const [classGenderFilter, setClassGenderFilter] = useState<"All" | "Male" | "Female">("All");
  const [selectedStudentForView, setSelectedStudentForView] = useState<any | null>(null);

  const liveStudents = useLiveData<any>("students").data;
  const liveTeachers = useLiveData<any>("teachers").data;
  const liveAttendance = useLiveData<any>("attendanceRegister").data;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    fetchDashboard();
    return () => clearTimeout(timer);
  }, []);

  useGlobalRefresh(
    () => {
      fetchDashboard();
    },
    activeSection === "dashboard"
  );

  useEffect(() => {
    if (userSession?.schoolName) {
      setSchoolName(userSession.schoolName);
    }
  }, [userSession]);

  const fetchDashboard = async () => {
    try {
      const email = userSession?.email || "";
      const staffId = userSession?.staffId || userSession?.teacherId || "";
      const res = await fetch(`/api/teacher/dashboard?email=${encodeURIComponent(email)}&staffId=${encodeURIComponent(staffId)}`);
      const json = await res.json();
      if (json.success) {
        setDashboardData(json.metrics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const teacherClasses: string[] = (userSession?.assignedClasses && Array.isArray(userSession.assignedClasses) && userSession.assignedClasses.length > 0)
    ? userSession.assignedClasses
    : (userSession?.assignedClass ? [userSession.assignedClass] : (dashboardData?.assignedClasses || []));

  const teacherSubjects: string[] = (userSession?.assignedSubjects && Array.isArray(userSession.assignedSubjects) && userSession.assignedSubjects.length > 0)
    ? userSession.assignedSubjects
    : (userSession?.subjectSpecialization
        ? String(userSession.subjectSpecialization).split(",").map((s: string) => s.trim()).filter(Boolean)
        : (userSession?.subject ? String(userSession.subject).split(",").map((s: string) => s.trim()).filter(Boolean) : (dashboardData?.assignedSubjects || [])));

  const assignedStudents = liveStudents.filter((s: any) => {
    if (teacherClasses.length === 0) return true;
    return s.class && teacherClasses.map((c: string) => c.toLowerCase()).includes(s.class.toLowerCase());
  });
  const totalStudents = assignedStudents.length;

  const pendingGrades = assignedStudents.filter((s: any) =>
    !s.caScore && s.caScore !== 0
  ).length;

  const todayAttendance = liveAttendance.filter((a: any) => {
    const today = new Date().toISOString().split("T")[0];
    return a.date === today || (typeof a.date === "string" && a.date.startsWith(today));
  });
  const todayPresent = todayAttendance.filter((a: any) => (a.status || "").toLowerCase() === "present").length;
  const todayAttendanceRate = todayAttendance.length > 0 ? Math.round((todayPresent / todayAttendance.length) * 100) : 0;

  const myLessonsCount = dashboardData?.lessonNotesStats?.totalGenerated || 0;

  const filteredItems = SIDEBAR_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              My Students
            </span>
            <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{totalStudents}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {teacherClasses.length > 0
              ? `Across ${teacherClasses.length} assigned class${teacherClasses.length > 1 ? "es" : ""}`
              : "Enrolled student directory"}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Today's Attendance
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{todayAttendanceRate}%</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{todayPresent} present today</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Grades
            </span>
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <FileInput className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{pendingGrades}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">CA scores awaiting entry</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              My Lessons
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{myLessonsCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lesson notes this term</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Clock className="w-5 h-5 text-emerald-600" />
              Today's Schedule
            </div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              {(dashboardData?.todaysTimetable || []).length} Periods
            </span>
          </div>

          <div className="space-y-3">
            {(dashboardData?.todaysTimetable || []).map((item: any, idx: number) => (
              <div
                key={item?.id || idx}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                    {item?.period ? item.period.split(" ")[0] : "1"}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{item?.subject || "Subject"}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item?.class} · {item?.room}</div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {item?.period}
                </span>
              </div>
            ))}
            {(!dashboardData?.todaysTimetable || dashboardData.todaysTimetable.length === 0) && (
              <div className="text-center py-8 text-slate-400 text-sm">
                No classes scheduled for today.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              <Award className="w-5 h-5 text-amber-500" />
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setActiveSection("attendance")}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 transition-all group"
              >
                <ClipboardList className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Take Attendance</span>
              </button>
              <button
                onClick={() => setActiveSection("lesson-notes")}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 transition-all group"
              >
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Lesson Notes</span>
              </button>
              <button
                onClick={() => setActiveSection("ai-exam-gen")}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 transition-all group"
              >
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Exam</span>
              </button>
              <button
                onClick={() => setActiveSection("messages")}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 transition-all group"
              >
                <MessageSquare className="w-5 h-5 text-rose-600 dark:text-rose-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Messages</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-4">
              <Bell className="w-5 h-5 text-amber-400" />
              Recent Activity
            </div>
            <div className="space-y-3">
              {(dashboardData?.recentActivities || []).map((act: any, idx: number) => (
                <div key={act?.id || idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{act.title}</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{act.time}</span>
                </div>
              ))}
              {(!dashboardData?.recentActivities || dashboardData.recentActivities.length === 0) && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No recent activity.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlaceholder = (label: string, icon: React.ElementType) => {
    const Icon = icon;
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Icon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">{label}</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          This module is connected to the backend and synchronised with Firebase. The full {label}
          interface is being prepared for your school <strong className="text-slate-700 dark:text-slate-200">{schoolName}</strong>.
        </p>
        <button
          onClick={() => setActiveSection("dashboard")}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 mx-auto"
        >
          <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    );
  };

  const handleExportRosterCSV = (className: string, studentsToExport: any[]) => {
    if (!studentsToExport || studentsToExport.length === 0) {
      showToast("No students to export in this class");
      return;
    }
    const headers = ["Admission No", "Full Name", "Class", "Gender", "Parent Name", "Parent Phone", "Status"];
    const rows = studentsToExport.map((s, idx) => [
      `"${s.admissionNo || s.admissionNumber || `ADM-${1000 + idx}`}"`,
      `"${s.name || s.fullName || "Student"}"`,
      `"${s.class || className}"`,
      `"${s.gender || "N/A"}"`,
      `"${s.parentName || "Guardian"}"`,
      `"${s.parentPhone || "N/A"}"`,
      `"${s.status || "Active"}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${className.replace(/\s+/g, "_")}_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Exported ${className} roster (${studentsToExport.length} students)`);
  };

  const renderMyClasses = () => {
    const hasAssignedClasses = teacherClasses.length > 0;
    const activeClassesList: string[] = hasAssignedClasses
      ? teacherClasses
      : (dashboardData?.assignedClasses && dashboardData.assignedClasses.length > 0)
        ? dashboardData.assignedClasses
        : (settings?.activeClasses && settings.activeClasses.length > 0)
          ? settings.activeClasses
          : ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"];

    const currentActiveClass = (selectedClassTab && activeClassesList.includes(selectedClassTab))
      ? selectedClassTab
      : (activeClassesList[0] || "JSS 1");

    const currentClassStudents = liveStudents.filter((s: any) =>
      (s.class || "").toLowerCase().trim() === currentActiveClass.toLowerCase().trim()
    );

    const classBoysCount = currentClassStudents.filter((s: any) => (s.gender || "").toLowerCase() === "male").length;
    const classGirlsCount = currentClassStudents.filter((s: any) => (s.gender || "").toLowerCase() === "female").length;

    const filteredClassStudents = currentClassStudents.filter((s: any) => {
      const q = classRosterSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        (s.name || "").toLowerCase().includes(q) ||
        (s.admissionNo || s.admissionNumber || "").toLowerCase().includes(q) ||
        (s.parentName || "").toLowerCase().includes(q);
      const matchesGender =
        classGenderFilter === "All" ||
        (s.gender || "").toLowerCase() === classGenderFilter.toLowerCase();
      return matchesSearch && matchesGender;
    });

    const todayStr = new Date().toISOString().split("T")[0];
    const classAttendanceToday = liveAttendance.filter((a: any) =>
      (a.class || "").toLowerCase().trim() === currentActiveClass.toLowerCase().trim() &&
      (a.date === todayStr || (typeof a.date === "string" && a.date.startsWith(todayStr)))
    );
    const classPresentCount = classAttendanceToday.filter((a: any) => (a.status || "").toLowerCase() === "present").length;
    const classAttendancePercent = currentClassStudents.length > 0 && classAttendanceToday.length > 0
      ? Math.round((classPresentCount / currentClassStudents.length) * 100)
      : null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">My Assigned Classes</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                {hasAssignedClasses ? `${teacherClasses.length} Appointed Class${teacherClasses.length === 1 ? "" : "es"}` : "School Classes Directory"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {hasAssignedClasses
                ? "Official form and subject classes assigned to your teacher account. Inspect student rosters, student profiles, attendance, and manage classroom records."
                : "Standard school classes. Contact your school administrator to configure dedicated form class assignments for your teacher profile."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection("attendance")}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ClipboardList className="w-4 h-4" /> Take Attendance
            </button>
            <button
              onClick={() => setActiveSection("student-results")}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Award className="w-4 h-4" /> Enter CA Grades
            </button>
          </div>
        </div>

        {/* Assigned Classes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeClassesList.map((cls, idx) => {
            const isSelected = cls === currentActiveClass;
            const studentsInCls = liveStudents.filter((s: any) =>
              (s.class || "").toLowerCase().trim() === cls.toLowerCase().trim()
            );
            const boys = studentsInCls.filter((s: any) => (s.gender || "").toLowerCase() === "male").length;
            const girls = studentsInCls.filter((s: any) => (s.gender || "").toLowerCase() === "female").length;
            const isPrimary = idx === 0 && hasAssignedClasses;

            return (
              <div
                key={cls}
                onClick={() => setSelectedClassTab(cls)}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white dark:bg-slate-900 border-indigo-500 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-indigo-500/20 shadow-lg"
                        : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                    }`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        {cls}
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                        )}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {isPrimary ? "Primary Form Class" : "Assigned Class"}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isSelected
                      ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}>
                    {isSelected ? "Active View" : "Select"}
                  </span>
                </div>

                {/* Metrics */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Enrolled</div>
                    <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {studentsInCls.length} Students
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {boys} Boys · {girls} Girls
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Subjects</div>
                    <div className="text-base font-black text-slate-900 dark:text-white mt-0.5 truncate">
                      {teacherSubjects.length > 0 ? `${teacherSubjects.length} Subject${teacherSubjects.length === 1 ? "" : "s"}` : "General"}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {teacherSubjects.slice(0, 2).join(", ") || "All Curricula"}
                    </div>
                  </div>
                </div>

                {/* Quick actions for this class */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClassTab(cls);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 transition-colors text-center"
                  >
                    View Roster ({studentsInCls.length})
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSection("attendance");
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    title="Take Attendance"
                  >
                    Attendance
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSection("student-results");
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    title="Enter CA Scores"
                  >
                    CA Grades
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Class Roster Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Roster Controls Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {currentActiveClass} Student Roster
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {currentClassStudents.length} Total Enrolled
                  </span>
                  {classAttendancePercent !== null && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {classAttendancePercent}% Present Today
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Complete class register, student profiles, parent contacts, and status for {currentActiveClass}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Roster
                </button>
                <button
                  type="button"
                  onClick={() => handleExportRosterCSV(currentActiveClass, filteredClassStudents)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={classRosterSearch}
                  onChange={(e) => setClassRosterSearch(e.target.value)}
                  placeholder={`Search ${currentActiveClass} students, admission no, parent...`}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                {classRosterSearch && (
                  <button
                    onClick={() => setClassRosterSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Gender Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setClassGenderFilter("All")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    classGenderFilter === "All"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  All ({currentClassStudents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setClassGenderFilter("Male")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    classGenderFilter === "Male"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Boys ({classBoysCount})
                </button>
                <button
                  type="button"
                  onClick={() => setClassGenderFilter("Female")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    classGenderFilter === "Female"
                      ? "bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Girls ({classGirlsCount})
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredClassStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Admission No</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Gender</th>
                    <th className="py-3 px-4">Parent / Guardian</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredClassStudents.map((st: any, idx: number) => {
                    const studentName = st.name || st.fullName || "Student";
                    const admNo = st.admissionNo || st.admissionNumber || `ADM-${1000 + idx}`;
                    const gender = st.gender || "Male";
                    const isFemale = gender.toLowerCase() === "female";
                    const parentName = st.parentName || "Guardian";
                    const parentPhone = st.parentPhone || st.phone || "Not recorded";

                    return (
                      <tr key={st.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white ${
                              isFemale ? "bg-gradient-to-tr from-pink-500 to-rose-400" : "bg-gradient-to-tr from-indigo-500 to-sky-400"
                            }`}>
                              {studentName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{studentName}</div>
                              <div className="text-[11px] text-slate-400">{admNo}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-600 dark:text-slate-300">{admNo}</td>
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{st.class || currentActiveClass}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isFemale
                              ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300"
                              : "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300"
                          }`}>
                            {gender}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-900 dark:text-white font-medium">{parentName}</div>
                          {parentPhone !== "Not recorded" ? (
                            <a
                              href={`tel:${parentPhone}`}
                              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3 h-3" /> {parentPhone}
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400">No phone</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {st.status || "Active"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForView(st)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-colors"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {classRosterSearch
                  ? `No students found matching "${classRosterSearch}"`
                  : `No students enrolled in ${currentActiveClass} yet`}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {classRosterSearch
                  ? "Try searching by a different name, admission number, or clearing your search filters."
                  : "Students enrolled into this class by the school administrator will automatically appear here."}
              </p>
              {classRosterSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setClassRosterSearch("");
                    setClassGenderFilter("All");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Student Details Quick Modal */}
        {selectedStudentForView && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black">
                    {(selectedStudentForView.name || "S").charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {selectedStudentForView.name || selectedStudentForView.fullName}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {selectedStudentForView.admissionNo || selectedStudentForView.admissionNumber || "ADM"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudentForView(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Class</span>
                    <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {selectedStudentForView.class || currentActiveClass}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Gender</span>
                    <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {selectedStudentForView.gender || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Parent / Guardian Information</span>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Name:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedStudentForView.parentName || "Guardian Not Listed"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Contact:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedStudentForView.parentPhone || "Not recorded"}
                    </span>
                  </div>
                  {selectedStudentForView.parentPhone && (
                    <a
                      href={`tel:${selectedStudentForView.parentPhone}`}
                      className="mt-2 w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Parent ({selectedStudentForView.parentPhone})
                    </a>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentForView(null);
                      setActiveSection("attendance");
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-center"
                  >
                    Mark Attendance
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentForView(null);
                      setActiveSection("student-results");
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center"
                  >
                    Enter CA Scores
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard();
      case "my-classes":
        return renderMyClasses();
      case "my-subjects":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">My Appointed Teaching Subjects</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                    {teacherSubjects.length} Appointed Subject{teacherSubjects.length === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You are officially authorized to teach, generate lesson notes, create exams, and enter student continuous assessment grades for these subjects only.
                </p>
              </div>
            </div>

            {/* Appointed Subjects Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teacherSubjects.map((subj, idx) => (
                <div key={subj || idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      Authorized
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{subj}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Assigned Classes: {teacherClasses.join(", ") || "All Allocated"}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <button
                      onClick={() => setActiveSection("lesson-notes")}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      Lesson Notes
                    </button>
                    <button
                      onClick={() => setActiveSection("ai-exam-gen")}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 transition-colors"
                    >
                      AI Exams
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <AIResultCompilationModule userSession={userSession} userRole={currentRole} schoolName={schoolName} defaultClass={teacherClasses[0] || "JSS 1"} />
          </div>
        );
      case "lesson-notes":
      case "scheme-of-work":
      case "weekly-planner":
        return <TeacherLessonNotesDocView userSession={userSession} />;
      case "attendance":
        return (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <AttendanceTrackerView
              userSession={userSession}
              assignedClasses={teacherClasses}
              teacherName={userSession?.name || userSession?.fullName || "Class Teacher"}
              defaultClass={teacherClasses[0] || "JSS 1"}
            />
          </div>
        );
      case "continuous-assessment":
      case "grade-entry":
      case "student-results":
        return (
          <div className="space-y-6">
            <AIResultCompilationModule userSession={userSession} userRole={currentRole} schoolName={schoolName} defaultClass={teacherClasses[0] || "JSS 1"} />
          </div>
        );
      case "ai-exam-gen":
        return (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <AIExamGeneratorView userSession={userSession} />
          </div>
        );
      case "question-bank":
        return (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <QuestionBankView userSession={userSession} />
          </div>
        );
      case "communication":
      case "messages":
        return (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
            <CommunicationView userRole={currentRole} userSession={userSession} isTeacherView={true} />
          </div>
        );
      case "calendar":
        return renderPlaceholder("Academic Calendar", Calendar);
      case "profile":
        return (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black text-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {userSession?.name || "Teacher Staff Profile"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {userSession?.email || "teacher@livingstoneedu.name.ng"} • {currentRole}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTeacherLogout}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block font-medium mb-1">Designation</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentRole}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block font-medium mb-1">Assigned Classes</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {teacherClasses.length > 0 ? teacherClasses.join(", ") : "All Primary & Secondary Classes"}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block font-medium mb-1">Institution</span>
                <span className="font-bold text-slate-900 dark:text-white">{schoolName}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block font-medium mb-1">Portal Session</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Authenticated (Active)</span>
              </div>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="h-full min-h-screen w-full max-w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased overflow-x-hidden">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-emerald-400 border border-emerald-500/30 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 w-full max-w-full overflow-x-hidden">
        {/* URL Bar */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-mono">
          <span className="text-indigo-500 dark:text-indigo-400">●</span>
          <span className="font-semibold">portal.livingstoneedu.name.ng</span>
          <span className="text-slate-400 dark:text-slate-500">/</span>
          <span className="font-semibold text-slate-500 dark:text-slate-400">teacher</span>
          <span className="ml-auto flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500 dark:text-emerald-400">Connected</span>
          </span>
        </div>

        {/* Organization Header */}
        <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white border-b border-indigo-700/60 w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Logo variant="icon" size="md" />
            <div>
              <h1 className="text-base sm:text-lg font-black text-white truncate max-w-[200px] sm:max-w-none">{schoolName}</h1>
              <p className="text-[10px] sm:text-xs text-indigo-200">Teacher Portal • Session: 2026/2027</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <FCMPushAlertManager compact />
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/10 border border-white/20 text-[11px] sm:text-xs font-semibold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Role: </span>{currentRole}
            </div>
            <button
              type="button"
              onClick={handleTeacherLogout}
              className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-500/50 text-[11px] sm:text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Sign Out of Teacher Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content Area with Internal Sidebar */}
        <div className="flex flex-1 min-h-0 relative w-full overflow-x-hidden">
          {/* Mobile Backdrop */}
          {mobileMenuOpen && (
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
            />
          )}

          {/* Internal Sidebar */}
          <div className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto transform transition-transform duration-200 shadow-2xl md:shadow-none ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden ml-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto">
              {(filteredItems || []).map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeSection === item?.id;
                return (
                  <button
                    key={item?.id || idx}
                    onClick={() => {
                      if (item?.id) setActiveSection(item.id);
                      setSearchQuery("");
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold rounded-xl mx-2 transition-all ${
                      isActive
                        ? "bg-indigo-600/10 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive
                            ? "text-indigo-600 dark:text-indigo-300"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                    )}
                    {item?.label}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onSelectTab) onSelectTab("dashboard");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                Back to Admin Dashboard
              </button>
              <button
                type="button"
                onClick={handleTeacherLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Log Out
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 w-full min-w-0 max-w-full overflow-x-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherLessonNotesDocView({ userSession }: { userSession?: any }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const teacherAssignedSubs: string[] = (Array.isArray(userSession?.assignedSubjects) && userSession.assignedSubjects.length > 0)
    ? userSession.assignedSubjects
    : (userSession?.subjectSpecialization
        ? String(userSession.subjectSpecialization).split(",").map((s: string) => s.trim()).filter(Boolean)
        : (userSession?.subject ? String(userSession.subject).split(",").map((s: string) => s.trim()).filter(Boolean) : []));

  useEffect(() => {
    const email = userSession?.email || "";
    const staffId = userSession?.staffId || "";
    fetch(`/api/teacher/lesson-notes?email=${encodeURIComponent(email)}&staffId=${encodeURIComponent(staffId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          let list = d.data;
          if (teacherAssignedSubs.length > 0) {
            list = list.filter((n: any) => {
              if (!n.subject) return false;
              const sub = n.subject.toLowerCase();
              return teacherAssignedSubs.some(as => sub.includes(as.toLowerCase()) || as.toLowerCase().includes(sub));
            });
          }
          setNotes(list);
          if (list.length > 0) setSelectedNote(list[0]);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [userSession?.email]);

  const filtered = notes.filter(
    (n) =>
      (n.topic || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.class || n.className || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Lesson Notes (Document Library)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access official NERDC curriculum lesson notes dispatched by the school administration in standard document format.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search topic, subject, class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3 max-h-[650px] overflow-y-auto pr-1">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading lesson notes...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No lesson notes available from school dispatch.</div>
          ) : (
            filtered.map((note) => (
              <div
                key={note.id || Math.random()}
                onClick={() => setSelectedNote(note)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedNote?.id === note.id
                    ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-sky-600 dark:text-sky-400 mb-1">
                  <span>{note.subject || "General"}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                    {note.status || "Approved"}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{note.topic || "Untitled Lesson"}</h4>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  <span>{note.class || note.className || "All Classes"}</span>
                  <span>{note.week || "Week 1"}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          {selectedNote ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
                    {selectedNote.subject} • {selectedNote.class || selectedNote.className} • {selectedNote.week}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2">{selectedNote.topic}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const w = window.open("", "_blank");
                      if (w) {
                        w.document.write(`<html><head><title>${selectedNote.topic}</title><style>body{font-family:sans-serif;padding:30px;line-height:1.6;color:#111;}</style></head><body><h1>${selectedNote.topic}</h1><p><strong>Subject:</strong> ${selectedNote.subject} | <strong>Class:</strong> ${selectedNote.class || selectedNote.className} | <strong>Week:</strong> ${selectedNote.week}</p><hr/><pre style="white-space:pre-wrap;font-family:sans-serif;">${selectedNote.content || "No content"}</pre></body></html>`);
                        w.document.close();
                        w.print();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([selectedNote.content || ""], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${selectedNote.topic || "Lesson_Note"}.txt`;
                      a.click();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Doc
                  </button>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                {selectedNote.content || "No document body found for this lesson note."}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">
              Select a lesson note from the left list to read its document format.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
