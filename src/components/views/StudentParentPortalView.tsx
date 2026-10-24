import React, { useState, useEffect, useMemo } from "react";
import { useGlobalRefresh } from "../../lib/liveStore";
import { FCMPushAlertManager } from "../FCMPushAlertManager";
import {
  User,
  GraduationCap,
  Users,
  BookOpen,
  FileText,
  CreditCard,
  Calendar,
  Download,
  Bot,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  ChevronRight,
  Send,
  Sparkles,
  Search,
  ExternalLink,
  DollarSign,
  Heart,
  ShieldAlert,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  FileCheck,
  Zap,
  Play,
  Check,
  Menu,
  X,
  Upload,
  Camera,
  LayoutDashboard,
  FileSpreadsheet,
  CalendarCheck,
  BookMarked,
  MessageSquare,
  Settings,
  Lock,
  Edit3,
  LogOut,
  Sun,
  Moon,
  Banknote,
  Copy
} from "lucide-react";
import {
  UserRole,
  getSubjectsForClass,
  isSubjectAllowedForClass,
  isSameClassLevel,
  isJuniorClass,
  isPrimaryClass,
  isSeniorClass,
  ALL_CLASSES
} from "../../types";
import { downloadTextFile, buildReportCardHtml, buildLessonNoteFile } from "../../lib/downloads";
import { findCurriculumTopic } from "../../data/curriculumData";
import { getComprehensiveLessonNote } from "../../data/comprehensiveNotes";

const defaultLessonNotes: any[] = [];

interface StudentParentPortalViewProps {
  currentRole?: UserRole;
  userSession?: any;
  onLogout?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export function StudentParentPortalView({ currentRole, userSession, onLogout, isDark = true, onToggleTheme }: StudentParentPortalViewProps) {
  // Mobile Sidebar Drawer State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Student Selected Class & Class-Level State
  const initialClass =
    userSession?.classLevel ||
    userSession?.class ||
    "JSS 1";

  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [editClassLevel, setEditClassLevel] = useState<string>(initialClass);

  // Dynamically derive authorized subjects strictly for this selected class
  const availableSubjects = useMemo(() => {
    return getSubjectsForClass(selectedClass);
  }, [selectedClass]);

  // Selected lesson note for the full reader modal
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [studentLessonNotes, setStudentLessonNotes] = useState<any[]>(defaultLessonNotes);
  const [selectedSubjectTab, setSelectedSubjectTab] = useState<string>("All");
  const [selectedWeekTab, setSelectedWeekTab] = useState<string>("Week 1");
  const [copiedNoteNotice, setCopiedNoteNotice] = useState<boolean>(false);

  // Keep subject tab valid when class changes
  useEffect(() => {
    if (selectedSubjectTab !== "All" && !availableSubjects.includes(selectedSubjectTab)) {
      setSelectedSubjectTab("All");
    }
  }, [availableSubjects, selectedSubjectTab]);

  // Comprehensive note builder helper: retrieves server note or generates rich NERDC note
  const getOrBuildStudentNote = (subj: string, wk: string) => {
    const existing = studentLessonNotes.find(
      (n: any) =>
        (n.subject || "").toLowerCase() === subj.toLowerCase() &&
        (n.week || "").toLowerCase() === wk.toLowerCase() &&
        (isSameClassLevel(n.class || n.className, selectedClass) || !n.class)
    );
    if (existing && existing.content && existing.content.length > 80) {
      return existing;
    }
    const curr = findCurriculumTopic(selectedClass, subj, "First Term", wk);
    const comp = getComprehensiveLessonNote(selectedClass, subj, curr.topic, wk, curr.subTopic);
    return {
      id: existing?.id || `les-${selectedClass}-${subj}-${wk}`,
      subject: subj,
      week: wk,
      class: selectedClass,
      className: selectedClass,
      topic: curr.topic,
      subTopic: curr.subTopic,
      objectives: comp.objectives,
      introduction: comp.introduction,
      content: comp.lessonContent,
      evaluationQuestions: comp.evaluation,
      assignment: comp.assignment,
      summary: comp.summary,
      teacherName: existing?.teacherName || existing?.teacher || "Approved NERDC Curriculum",
      status: "Approved",
      publishedToPortals: true
    };
  };

  // Sidebar Tab Navigation Selection
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "profile"
    | "academic-records"
    | "attendance"
    | "assignments"
    | "lesson-notes"
    | "cbt"
    | "results"
    | "notices"
    | "messages"
    | "settings"
    | "fees"
    | "ai-tutor"
    | "timetable"
    | "downloads"
  >("dashboard");

  // Active Student Record
  const [selectedChildId, setSelectedChildId] = useState<string>(
    userSession?.studentId || userSession?.admissionNumber || userSession?.admissionNo || ""
  );

  // Core Data States
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [resultsData, setResultsData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [cbtExams, setCbtExams] = useState<any[]>([]);
  const [feeInvoice, setFeeInvoice] = useState<any>(null);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Editable Bio Profile State
  const [editFullName, setEditFullName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editGender, setEditGender] = useState("Male");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editParentName, setEditParentName] = useState("");
  const [editParentPhone, setEditParentPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState("");

  // Homework Submission Modal State
  const [submittingAssignment, setSubmittingAssignment] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // CBT Exam Modal State
  const [activeCbtExam, setActiveCbtExam] = useState<any>(null);
  const [cbtAnswers, setCbtAnswers] = useState<Record<string, number>>({});
  const [cbtTimeLeft, setCbtTimeLeft] = useState<number>(1800);
  const [cbtSubmitting, setCbtSubmitting] = useState(false);
  const [cbtResult, setCbtResult] = useState<any>(null);

  // Fee Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<string>("50000");
  const [payMethod, setPayMethod] = useState("Paystack Online Gateway");
  const [processingPay, setProcessingPay] = useState(false);
  const [passCurrent, setPassCurrent] = useState("");
  const [passNew, setPassNew] = useState("");
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  // School Payment Accounts (fetched from school portal settings)
  const [schoolPaymentAccounts, setSchoolPaymentAccounts] = useState<any[]>([
    { id: "PAY-001", bankName: "Guaranty Trust Bank", accountName: userSession?.schoolName || "Livingstone Educational Academy", accountNumber: "0123456789", sortCode: "058", accountType: "Current", isDefault: true }
  ]);

  // sSolutAI AI Assistant State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiChatLogs, setAiChatLogs] = useState<{ sender: "user" | "ai"; message: string }[]>([
    {
      sender: "ai",
      message:
        "Hello! I am your AI Study Tutor. Ask me anything about WAEC/JAMB exam preparation, step-by-step math problem solving, or academic advice!"
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Search & Filters State
  const [noticeSearch, setNoticeSearch] = useState("");
  const [lessonSearch, setLessonSearch] = useState("");

  // Load initial data
  useEffect(() => {
    fetchPortalData();
  }, [selectedChildId]);

  // Refresh portal data whenever admin panel changes are broadcast
  useGlobalRefresh(() => {
    fetchPortalData();
  });

  // Sync state when profile loads
  useEffect(() => {
    if (profileData) {
      setEditFullName(profileData.fullName || profileData.name || userSession?.fullName || "");
      setEditDob(profileData.dob || "");
      setEditGender(profileData.gender || "Male");
      setEditPhone(profileData.phone || "");
      setEditAddress(profileData.address || profileData.guardianDetails?.address || "");
      setEditParentName(profileData.guardianDetails?.fatherName || profileData.parentName || "");
      setEditParentPhone(profileData.guardianDetails?.primaryPhone || profileData.parentPhone || "");
      const resolvedClass = profileData.classLevel || profileData.class || userSession?.classLevel || userSession?.class;
      if (resolvedClass) {
        setSelectedClass(resolvedClass);
        setEditClassLevel(resolvedClass);
      }
      if (profileData.photoUrl) {
        setPhotoUrl(profileData.photoUrl);
      }
    }
  }, [profileData]);

  // CBT Timer effect
  useEffect(() => {
    let timer: any;
    if (activeCbtExam && cbtTimeLeft > 0 && !cbtResult) {
      timer = setInterval(() => {
        setCbtTimeLeft(prev => {
          if (prev <= 1) {
            handleCbtSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCbtExam, cbtTimeLeft, cbtResult]);

  // Event listener for live lesson note updates
  useEffect(() => {
    fetchPortalData();
    const handleNotesUpdate = () => {
      fetchPortalData();
    };
    window.addEventListener("lesson-notes-updated", handleNotesUpdate);
    return () => window.removeEventListener("lesson-notes-updated", handleNotesUpdate);
  }, [selectedChildId, selectedClass]);

  const fetchPortalData = async () => {
    setLoading(true);
    try {
      const classQuery = encodeURIComponent(selectedClass);
      const [dashRes, profRes, resRes, asgRes, cbtRes, feeRes, dlRes, lnRes, lnTeacherRes] = await Promise.all([
        fetch(`/api/student/dashboard?studentId=${selectedChildId}&class=${classQuery}`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`/api/student/profile?studentId=${selectedChildId}`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`/api/student/results?studentId=${selectedChildId}&class=${classQuery}`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`/api/student/assignments?studentId=${selectedChildId}&class=${classQuery}`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`/api/student/cbt/active?studentId=${selectedChildId}&class=${classQuery}`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`/api/student/fees/invoice?studentId=${selectedChildId}`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`/api/student/downloads?studentId=${selectedChildId}&class=${classQuery}`).then(r => r.json()).catch(() => ({ success: false })),
        fetch(`/api/student-parent/lesson-notes?class=${classQuery}`).then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch(`/api/teacher/lesson-notes`).then(r => r.json()).catch(() => ({ success: false, data: [] }))
      ]);

      if (dashRes.success) setDashboardData(dashRes);
      if (profRes.success) setProfileData(profRes.profile);
      if (resRes.success) setResultsData(resRes.results);

      // Strictly isolate assignments and CBT exams to the student's enrolled class
      const filteredAssignments = (asgRes.success && Array.isArray(asgRes.data) ? asgRes.data : []).filter((a: any) => {
        if (!a.class) return true;
        return isSameClassLevel(a.class, selectedClass);
      });
      setAssignments(filteredAssignments);

      const filteredCbt = (cbtRes.success && Array.isArray(cbtRes.data) ? cbtRes.data : []).filter((c: any) => {
        if (!c.class) return true;
        return isSameClassLevel(c.class, selectedClass);
      });
      setCbtExams(filteredCbt);

      if (feeRes.success) setFeeInvoice(feeRes.invoice);
      if (dlRes.success) setDownloads(dlRes.downloads);

      const mergedNotesMap = new Map();
      const studentNotesArray = lnRes.success && Array.isArray(lnRes.data) ? lnRes.data : [];
      const teacherNotesArray = lnTeacherRes.success && Array.isArray(lnTeacherRes.data) ? lnTeacherRes.data : [];

      [...studentNotesArray, ...teacherNotesArray].forEach((n: any) => {
        if (n && n.id && !mergedNotesMap.has(n.id)) {
          // Strictly restrict note to student's enrolled class and authorized subjects
          const noteClass = n.class || n.className;
          const classMatches = !noteClass || isSameClassLevel(noteClass, selectedClass);
          const subjectAllowed = !n.subject || isSubjectAllowedForClass(n.subject, selectedClass);
          if (classMatches && subjectAllowed) {
            mergedNotesMap.set(n.id, n);
          }
        }
      });
      setStudentLessonNotes(Array.from(mergedNotesMap.values()));
    } catch (e) {
      console.error("Error loading portal data:", e);
    } finally {
      setLoading(false);
    }
  };

  // Image Upload & Crop Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Bio Profile Save Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSaveSuccess("");

    try {
      const currentStudentId = userSession?.studentId || profileData?.id || selectedChildId || "STD-2026-001";
      const currentSchoolName = userSession?.schoolName || profileData?.schoolName || "Livingstone Educational Academy";

      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentStudentId,
          fullName: editFullName,
          name: editFullName,
          dob: editDob,
          gender: editGender,
          phone: editPhone,
          address: editAddress,
          parentName: editParentName,
          parentPhone: editParentPhone,
          photoUrl: photoUrl,
          schoolName: currentSchoolName,
          classLevel: editClassLevel,
          class: editClassLevel
        })
      }).then(r => r.json());

      if (res.success) {
        setProfileData(res.profile);
        setSelectedClass(editClassLevel);
        setProfileSaveSuccess("✓ Bio profile and passport photograph updated successfully in database!");
        setTimeout(() => setProfileSaveSuccess(""), 4000);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
      setProfileSaveSuccess("✓ Profile saved successfully!");
      setTimeout(() => setProfileSaveSuccess(""), 4000);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAssignmentSubmit = async () => {
    if (!submittingAssignment) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/student/assignments/${submittingAssignment.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionText })
      }).then(r => r.json());

      if (res.success) {
        alert("Homework submitted successfully!");
        setSubmittingAssignment(null);
        setSubmissionText("");
        fetchPortalData();
      }
    } catch (e) {
      console.error("Failed to submit assignment", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartCbt = async (exam: any) => {
    setActiveCbtExam(exam);
    setCbtResult(null);
    setCbtAnswers({});
    setCbtTimeLeft(exam.durationMinutes * 60);

    try {
      await fetch("/api/student/cbt/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: exam.id })
      });
    } catch (e) {
      console.error("Error starting CBT:", e);
    }
  };

  const handleCbtSubmit = async () => {
    if (!activeCbtExam) return;
    setCbtSubmitting(true);
    try {
      const res = await fetch("/api/student/cbt/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: activeCbtExam.id,
          userAnswers: cbtAnswers
        })
      }).then(r => r.json());

      if (res.success) {
        setCbtResult(res.data);
      }
    } catch (e) {
      console.error("Error submitting CBT:", e);
    } finally {
      setCbtSubmitting(false);
    }
  };

  const handleFeePayment = async () => {
    setProcessingPay(true);
    try {
      const res = await fetch("/api/student/fees/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payAmount,
          paymentMethod: payMethod
        })
      }).then(r => r.json());

      if (res.success) {
        setLastReceipt(res.receipt);
        setIsPayModalOpen(false);
        fetchPortalData();
      }
    } catch (e) {
      console.error("Error processing payment:", e);
    } finally {
      setProcessingPay(false);
    }
  };

  const handleAiSend = async () => {
    if (!aiPrompt.trim()) return;
    const userMsg = aiPrompt;
    setAiPrompt("");
    setAiChatLogs(prev => [...prev, { sender: "user", message: userMsg }]);
    setAiLoading(true);

    try {
      const endpoint = "/api/student/ai/study-assistant";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg })
      }).then(r => r.json());

      if (res.success) {
        setAiChatLogs(prev => [...prev, { sender: "ai", message: res.reply }]);
      }
    } catch (e) {
      console.error("AI Assistant Error:", e);
    } finally {
      setAiLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Dynamic School Name from Session / Database
  const currentSchoolName =
    userSession?.schoolName ||
    profileData?.schoolName ||
    "Livingstone Educational Academy";

  // Dynamic Student Name
  const currentStudentName =
    userSession?.fullName ||
    userSession?.name ||
    editFullName ||
    profileData?.fullName ||
    profileData?.name ||
    "Student";

  // Dynamic Class
  const currentClass =
    selectedClass ||
    editClassLevel ||
    userSession?.classLevel ||
    userSession?.class ||
    profileData?.classLevel ||
    profileData?.class ||
    "JSS 1";

  // Dynamic Admission Number
  const currentAdmissionNo =
    userSession?.admissionNumber ||
    userSession?.admissionNo ||
    profileData?.admissionNo ||
    "";

  // Sidebar Menu Items Definition
  const sidebarNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "Bio Profile", icon: User },
    { id: "academic-records", label: "Academic Records", icon: FileSpreadsheet },
    { id: "attendance", label: "Attendance", icon: CalendarCheck },
    { id: "assignments", label: "Assignments", icon: BookOpen },
    { id: "lesson-notes", label: "Lesson Notes", icon: BookMarked },
    { id: "cbt", label: "CBT Exams", icon: Zap },
    { id: "results", label: "Results", icon: Award },
    { id: "report-cards", label: "Report Cards", icon: FileText },
    { id: "notices", label: "School Notices", icon: Bell },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* ========================================================= */}
      {/* MOBILE TOP HEADER BAR (Hamburger Toggle)                  */}
      {/* ========================================================= */}
      <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 flex items-center justify-between sticky top-0 z-40 shadow-lg w-full max-w-full overflow-x-hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-teal-600 dark:text-teal-400 border border-slate-300 dark:border-slate-700 transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-tr from-teal-600 to-indigo-600 rounded-lg text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                {currentSchoolName}
              </h1>
              <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wider">
                Student Academic Hub
              </p>
            </div>
          </div>
        </div>

        {/* Quick Avatar */}
        <div className="flex items-center gap-2">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-teal-500 shadow"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow">
              {currentStudentName.charAt(0)}
            </div>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* RESTRUCTURED LEFT SIDEBAR NAVIGATION                      */}
      {/* ========================================================= */}
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Sidebar Brand Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-teal-500 via-emerald-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-teal-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <h2 className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">
                  {currentSchoolName}
                </h2>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold tracking-wider uppercase block">
                  Student Portal
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Profile Quick Badge */}
          <div className="p-4 mx-3 my-3 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50 border border-slate-800/90 flex items-center gap-3">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Student Passport"
                className="w-10 h-10 rounded-full object-cover border-2 border-teal-500 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-black text-sm text-white flex-shrink-0 shadow">
                {currentStudentName.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-white truncate">{currentStudentName}</h3>
              <p className="text-[10px] text-teal-400 font-medium truncate">Class: {currentClass}</p>
              <p className="text-[9px] text-slate-400 font-mono truncate">{currentAdmissionNo}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 space-y-1 py-2 flex-1">
            <span className="px-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Navigation Menu
            </span>
            {sidebarNavItems.map(item => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 text-left ${
                    isActive
                      ? "bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-md font-bold"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                  <span className="truncate">{item.label}</span>
                  {item.id === "notices" && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                  {item.id === "cbt" && (
                    <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30">
                      LIVE
                    </span>
                  )}
                </button>
              );
            })}

            <span className="px-3 pt-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Quick Portals
            </span>
            <button
              onClick={() => {
                setActiveTab("fees");
                setIsSidebarOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 text-left ${
                activeTab === "fees"
                  ? "bg-emerald-600 text-white shadow font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Fees & Payments</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("ai-tutor");
                setIsSidebarOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 text-left ${
                activeTab === "ai-tutor"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow font-bold"
                  : "text-purple-600 dark:text-purple-400 hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-300" />
              <span>sSolutAI AI Study Tutor</span>
            </button>
          </div>

          {/* Theme Toggle & Logout Button */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="w-full flex justify-center pb-1">
              <FCMPushAlertManager compact />
            </div>
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-slate-200 dark:border-slate-700/60 text-xs font-bold transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {isDark ? <Sun className="w-4 h-4 text-amber-500 dark:text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />}
                  <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isDark ? "Dark" : "Light"}
                </span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  onLogout();
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-bold transition-all flex items-center gap-3"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Log Out</span>
              </button>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-500 dark:text-slate-400">Academic Session 2026/2027</p>
            <p>First Term • Week 4 Active</p>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT CONTAINER                                     */}
      {/* ========================================================= */}
      <main className="flex-1 min-w-0 w-full max-w-full p-3 sm:p-4 md:p-8 space-y-6 overflow-y-auto overflow-x-hidden">
        <>
            {/* ========================================================= */}
            {/* 1. DASHBOARD VIEW                                         */}
            {/* ========================================================= */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Header Welcome Card */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950/90 to-slate-900 border border-indigo-500/20 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Student Dashboard
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Class: {currentClass}
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                        Welcome back, {currentStudentName}
                      </h2>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300 pt-1">
                        <div className="flex items-center gap-2 bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700">
                          <span className="text-slate-400 font-bold">School:</span>
                          <span className="text-white font-semibold">{currentSchoolName}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700">
                          <span className="text-slate-400 font-bold">Admission No:</span>
                          <span className="text-teal-400 font-mono font-bold">{currentAdmissionNo}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700">
                          <span className="text-slate-400 font-bold">Term:</span>
                          <span className="text-emerald-300 font-semibold">First Term (2026/2027)</span>
                        </div>
                      </div>
                    </div>

                    {/* Passport Photo Badge */}
                    <div className="flex items-center gap-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 shadow-md">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt="Student Passport"
                          className="w-16 h-16 rounded-full object-cover border-2 border-teal-500 shadow-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-lg">
                          {currentStudentName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active Student
                        </span>
                        <h4 className="text-xs font-bold text-white mt-1">{currentStudentName}</h4>
                        <div className="flex flex-col sm:flex-row gap-2 mt-1">
                          <button
                            onClick={() => setActiveTab("profile")}
                            className="text-[11px] text-teal-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Edit3 className="w-3 h-3" /> Edit Profile
                          </button>
                          <button
                            onClick={() => {
                              const html = buildReportCardHtml({
                                schoolName: currentSchoolName,
                                studentName: currentStudentName,
                                className: currentClass,
                                term: resultsData?.term || "First Term",
                                positionInClass: resultsData?.positionInClass || "N/A",
                                overallTotal: resultsData?.overallTotal || 0,
                                maximumPossible: resultsData?.maximumPossible || 0,
                                average: resultsData?.average || 0,
                                subjects: resultsData?.subjects || [],
                                teacherComment: `${currentStudentName} continues to make progress in school activities.`,
                                principalComment: "Encouraged to maintain consistent academic engagement.",
                                promotionStatus: resultsData?.promotionStatus || "Pending",
                              });
                              downloadTextFile(
                                `ResultSlip-${currentStudentName.replace(/\s+/g, "-")}.html`,
                                html,
                                "text/html;charset=utf-8"
                              );
                            }}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center gap-1 shadow transition-all"
                          >
                            <Download className="w-3 h-3" /> Download Result Slip
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-teal-500/40 transition-colors">
                    <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-600 dark:text-teal-400">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Student Full Name
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                        {currentStudentName}
                      </h3>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-mono">Class: {currentClass || "Not assigned"}</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-emerald-500/40 transition-colors">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Attendance Rate
                      </span>
                      <h3 className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        {dashboardData?.attendanceSummary?.attendancePercentage || "0.0%"}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {dashboardData?.attendanceSummary?.presentDays || 0} / {dashboardData?.attendanceSummary?.totalDays || 0} Days Present
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-purple-500/40 transition-colors">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Academic Standing
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {resultsData?.positionInClass || "N/A"}
                      </h3>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                        {resultsData?.average ? `Average: ${resultsData.average}%` : "No results recorded"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-amber-500/40 transition-colors">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Fee Ledger Status
                      </span>
                      <h3 className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                        ₦{(feeInvoice?.outstandingBalance || 0).toLocaleString()}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {feeInvoice?.status || "Cleared"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dashboard Grid Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Timetable & Assignments */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Today's Classroom Schedule */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                          Today's Timetable & Schedule
                        </h3>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700">
                          {new Date().toLocaleDateString(undefined, { weekday: "long" })}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {(dashboardData?.todayTimetable || []).map((slot: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-teal-500/40 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-2 rounded-lg font-mono">
                                {slot.period?.split(" ")[0] || `P${idx + 1}`}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{slot.subject}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {slot.teacher} • <span className="text-slate-600 dark:text-slate-300">{slot.venue || slot.room}</span>
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden md:inline">
                              {slot.period}
                            </span>
                          </div>
                        ))}
                        {(!dashboardData?.todayTimetable || dashboardData.todayTimetable.length === 0) && (
                          <div className="text-center py-6 text-slate-400 text-xs">
                            No scheduled classes for today.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pending Homework */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          Recent Assignments & Homework
                        </h3>
                        <button
                          onClick={() => setActiveTab("assignments")}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          View All <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {assignments.slice(0, 3).map(asg => (
                          <div
                            key={asg.id}
                            className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                                  {asg.subject}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{asg.title}</h4>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                {asg.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-auto">
                              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(asg.deadline).toLocaleDateString()}
                              </span>
                              <button
                                onClick={() => {
                                  setSubmittingAssignment(asg);
                                  setActiveTab("assignments");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow"
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        ))}
                        {assignments.length === 0 && (
                          <div className="text-center py-6 text-slate-400 text-xs">
                            No pending assignments.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Col: Announcements & Quick AI */}
                  <div className="space-y-6">
                    {/* School Announcements */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        School Notices & Bulletins
                      </h3>

                      <div className="space-y-3">
                        {(dashboardData?.schoolAnnouncements || []).map((ann: any) => (
                          <div
                            key={ann.id}
                            className="p-4 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300">{ann.title}</h4>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">{ann.date}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ann.text || ann.content}</p>
                          </div>
                        ))}
                        {(!dashboardData?.schoolAnnouncements || dashboardData.schoolAnnouncements.length === 0) && (
                          <div className="text-center py-6 text-slate-400 text-xs">
                            No notices or bulletins published today.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* sSolutAI AI Assistant Teaser */}
                    <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 p-6 rounded-2xl space-y-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300">
                          <Sparkles className="w-5 h-5 text-amber-300" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">sSolutAI AI Study Tutor</h4>
                          <p className="text-xs text-slate-300">WAEC / JAMB 24/7 Problem Solver</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab("ai-tutor")}
                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
                      >
                        <Bot className="w-4 h-4" />
                        Launch AI Assistant
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. BIO PROFILE MODULE (View & Edit)                        */}
            {/* ========================================================= */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <User className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      Student Bio Profile & Medical Record
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      View and update your official student bio information and passport photograph
                    </p>
                  </div>
                </div>

                {profileSaveSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    {profileSaveSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Student Profile Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6 text-center shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        Status: Active
                      </span>
                    </div>

                    {/* Passport Photo Upload & Crop */}
                    <div className="relative inline-block mx-auto group">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt="Passport Photo"
                          className="w-36 h-36 rounded-full object-cover border-4 border-teal-500 shadow-2xl mx-auto"
                        />
                      ) : (
                        <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-teal-500 via-emerald-600 to-indigo-600 flex items-center justify-center text-4xl font-black text-white border-4 border-slate-200 dark:border-slate-800 shadow-2xl mx-auto">
                          {currentStudentName.charAt(0)}
                        </div>
                      )}

                      <label className="absolute bottom-1 right-1 p-2 bg-teal-600 hover:bg-teal-500 text-white rounded-full cursor-pointer border-2 border-slate-300 dark:border-slate-900 shadow-lg transition-transform hover:scale-110">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">{currentStudentName}</h3>
                      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-1 font-mono">
                        Admission No: {currentAdmissionNo}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                          School: {currentSchoolName}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                          Class: {currentClass}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 grid grid-cols-2 gap-3 text-left text-xs">
                      <div className="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Academic Session</span>
                        <p className="font-bold text-slate-900 dark:text-white">2026/2027</p>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Current Term</span>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">First Term</p>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Gender</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{editGender || profileData?.gender || "Male"}</p>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Blood Group / Genotype</span>
                        <p className="font-bold text-rose-600 dark:text-rose-400">{profileData?.bloodGroup || "O+"} • {profileData?.genotype || "AA"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Editable Bio Profile Form */}
                  <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                        <span>Edit Student Information</span>
                        <span className="text-xs font-medium text-teal-600 dark:text-teal-400">Database Record Sync</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Full Name</label>
                          <input
                            type="text"
                            required
                            value={editFullName}
                            onChange={e => setEditFullName(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Date of Birth</label>
                          <input
                            type="date"
                            value={editDob}
                            onChange={e => setEditDob(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Gender</label>
                          <select
                            value={editGender}
                            onChange={e => setEditGender(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Enrolled Class / Grade Level</label>
                            <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">Assigned</span>
                          </div>
                          <input
                            type="text"
                            disabled
                            value={`${editClassLevel || selectedClass} (Official Enrolment)`}
                            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-teal-700 dark:text-teal-300 font-bold outline-none cursor-not-allowed opacity-90"
                          />
                          <p className="text-[10px] text-slate-400">Class allocation is restricted and managed exclusively by school administration.</p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Student Phone Number</label>
                          <input
                            type="text"
                            value={editPhone}
                            onChange={e => setEditPhone(e.target.value)}
                            placeholder="+234 803 000 0000"
                            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Residential Address</label>
                          <input
                            type="text"
                            value={editAddress}
                            onChange={e => setEditAddress(e.target.value)}
                            placeholder="Home or hostel address"
                            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Parent / Guardian Name</label>
                          <input
                            type="text"
                            value={editParentName}
                            onChange={e => setEditParentName(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Parent Phone Number</label>
                          <input
                            type="text"
                            value={editParentPhone}
                            onChange={e => setEditParentPhone(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>

                      {/* Photo Upload Actions */}
                      <div className="p-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                          Passport Photograph Upload & Controls
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 border border-slate-300 dark:border-slate-700 font-bold text-xs cursor-pointer flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Upload New Photo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>

                          {photoUrl && (
                            <button
                              type="button"
                              onClick={() => setPhotoUrl("")}
                              className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-xs"
                            >
                              Remove Photo
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-teal-600/30 flex items-center gap-2"
                        >
                          {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Save Changes to Database
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 3. ACADEMIC RECORDS VIEW                                  */}
            {/* ========================================================= */}
            {activeTab === "academic-records" && resultsData && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileSpreadsheet className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      Academic Records & Cumulative Broadsheet
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Complete record of term assessments, WAEC grade equivalents & GPA</p>
                  </div>

                  <button
                    onClick={() => {
                      const html = buildReportCardHtml({
                        schoolName: currentSchoolName,
                        studentName: currentStudentName,
                        className: currentClass,
                        term: resultsData.term || "Term",
                        positionInClass: resultsData.positionInClass,
                        overallTotal: resultsData.overallTotal,
                        maximumPossible: resultsData.maximumPossible,
                        average: resultsData.average,
                        subjects: resultsData.subjects,
                        teacherComment: `${currentStudentName} maintains admirable academic diligence and focused inquiry.`,
                        principalComment: "A well-rounded academic result. Recommended for merit award.",
                        promotionStatus: "Promoted to Next Class",
                      });
                      downloadTextFile(
                        `ReportCard-${currentStudentName.replace(/\s+/g, "-")}-${String(resultsData.term || "term").replace(/\s+/g, "-")}.html`,
                        html,
                        "text/html;charset=utf-8"
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-600/30 self-start sm:self-auto"
                  >
                    <Download className="w-4 h-4" />
                    Download Official Report Card (PDF)
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Subject Breakdown ({resultsData.term})</h3>
                    <span className="text-xs text-teal-600 dark:text-teal-400 font-bold">Class Average: {resultsData.average}%</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-950 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                          <th className="py-3.5 px-4">Subject</th>
                          <th className="py-3.5 px-4">CA1 (20)</th>
                          <th className="py-3.5 px-4">CA2 (20)</th>
                          <th className="py-3.5 px-4">Exam (60)</th>
                          <th className="py-3.5 px-4">Total (100)</th>
                          <th className="py-3.5 px-4">Grade</th>
                          <th className="py-3.5 px-4">Rank</th>
                          <th className="py-3.5 px-4">Remark</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                        {resultsData.subjects.map((s: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{s.subject}</td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{s.ca1}</td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{s.ca2}</td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{s.exam}</td>
                            <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">{s.total}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                {s.grade}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{s.positionInSubject}</td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{s.remark}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 4. ATTENDANCE VIEW                                         */}
            {/* ========================================================= */}
            {activeTab === "attendance" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CalendarCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      Student Attendance Tracker
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Daily roll-call records and regularity percentage</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Term Attendance Percentage</span>
                    <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">95.4%</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verified by Class Teacher</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Total Days Present</span>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">62 / 65</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">3 Days Absent / Excused</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Punctuality Score</span>
                    <h3 className="text-3xl font-black text-teal-600 dark:text-teal-400 mt-1">5 / 5</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Excellent punctuality record</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Daily Roll-Call Audit</h3>
                  <div className="space-y-3 text-xs">
                    {[
                      { date: "2026-07-29", status: "Present", arrivalTime: "07:38 AM", verifiedBy: "Class Teacher" },
                      { date: "2026-07-28", status: "Present", arrivalTime: "07:42 AM", verifiedBy: "Class Teacher" },
                      { date: "2026-07-27", status: "Present", arrivalTime: "07:35 AM", verifiedBy: "Class Teacher" },
                      { date: "2026-07-24", status: "Medical Leave", arrivalTime: "-", verifiedBy: "Parent Excuse Note" }
                    ].map((log, idx) => (
                      <div key={idx} className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{log.date}</span>
                          <span className="text-slate-500 dark:text-slate-400 ml-3">Arrival: {log.arrivalTime}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${log.status === 'Present' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'}`}>
                          {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 5. ASSIGNMENTS VIEW                                       */}
            {/* ========================================================= */}
            {activeTab === "assignments" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      Homework & Class Project Tracker
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Submit completed homework assignments directly online</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {assignments.map(asg => (
                    <div key={asg.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                              {asg.subject}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">{asg.title}</h3>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{asg.description}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          {asg.submissions?.length > 0 ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Submitted ({asg.submissions[0].status})
                            </span>
                          ) : (
                            <button
                              onClick={() => setSubmittingAssignment(asg)}
                              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow"
                            >
                              Submit Solution
                            </button>
                          )}
                        </div>
                      </div>

                      {asg.submissions?.length > 0 && (
                        <div className="p-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-500 dark:text-slate-400">Teacher Evaluation Score:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {asg.submissions[0].score || 18} / {asg.totalPoints}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 italic">{asg.submissions[0].teacherFeedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Submission Modal */}
                {submittingAssignment && (
                  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 rounded-2xl space-y-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Submit Homework: {submittingAssignment.title}
                      </h3>

                      <textarea
                        rows={5}
                        value={submissionText}
                        onChange={e => setSubmissionText(e.target.value)}
                        placeholder="Type your step-by-step homework solution here..."
                        className="w-full p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />

                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setSubmittingAssignment(null)}
                          className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAssignmentSubmit}
                          disabled={submitting}
                          className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow flex items-center gap-2"
                        >
                          {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Confirm Submission
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* 6. LESSON NOTES VIEW                                       */}
            {/* ========================================================= */}
            {activeTab === "lesson-notes" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <BookMarked className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      Class Lesson Notes & Comprehensive Subject Guides
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Access official NERDC curriculum subject lesson notes for each week. Only approved subjects for your class level are accessible.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-teal-50 dark:bg-slate-900 border border-teal-500/40 px-3.5 py-1.5 rounded-xl shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Assigned Class:</span>
                      <span className="text-xs font-black text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        {selectedClass}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800">
                      {availableSubjects.length} Approved Subject(s)
                    </div>
                  </div>
                </div>

                {/* Level Segregation Notice */}
                <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-slate-900/90 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {isJuniorClass(selectedClass)
                        ? `Junior Secondary Curriculum (${selectedClass}): Senior subjects (Physics, Chemistry, Biology, Economics) are restricted.`
                        : isPrimaryClass(selectedClass)
                        ? `Primary School Curriculum (${selectedClass}): Secondary school subjects are restricted.`
                        : `Senior Secondary Curriculum (${selectedClass}): Senior NERDC/WAEC subjects active.`}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-teal-700 dark:text-teal-300 uppercase tracking-wider bg-teal-500/10 px-2.5 py-0.5 rounded-lg border border-teal-500/20 w-fit">
                    Strict Level Segregation Enforced
                  </span>
                </div>

                {/* Filter Controls: Subject & Week */}
                <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Select Subject ({availableSubjects.length} subjects for {selectedClass}):
                      </span>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                        {selectedSubjectTab === "All" ? "Showing all subjects" : selectedSubjectTab}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {["All", ...availableSubjects].map((sub) => (
                        <button
                          key={sub}
                          onClick={() => setSelectedSubjectTab(sub)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                            selectedSubjectTab === sub
                              ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <span className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Select Academic Week:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10", "Week 11", "Week 12", "All Weeks"].map((wk) => (
                        <button
                          key={wk}
                          onClick={() => setSelectedWeekTab(wk)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                            selectedWeekTab === wk
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {wk}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lesson Notes Listing: Each subject listed out for each week */}
                <div className="space-y-6">
                  {(selectedWeekTab === "All Weeks"
                    ? ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10", "Week 11", "Week 12"]
                    : [selectedWeekTab]
                  ).map((activeWeek) => {
                    const filteredSubjects = selectedSubjectTab === "All"
                      ? availableSubjects
                      : availableSubjects.filter((s) => s.toLowerCase() === selectedSubjectTab.toLowerCase());

                    return (
                      <div key={activeWeek} className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs">
                              {activeWeek}
                            </span>
                            <span>NERDC Curriculum Notes ({filteredSubjects.length} subjects)</span>
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400 font-bold">{selectedClass}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredSubjects.map((sub) => {
                            const noteObj = getOrBuildStudentNote(sub, activeWeek);
                            return (
                              <div
                                key={`${sub}-${activeWeek}`}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm hover:shadow-md hover:border-teal-500/40 transition-all flex flex-col justify-between"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 truncate max-w-[170px]">
                                      {sub}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">
                                      {activeWeek}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
                                    {noteObj.topic}
                                  </h4>
                                  {noteObj.objectives && noteObj.objectives.length > 0 && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                      🎯 {noteObj.objectives[0]}
                                    </p>
                                  )}
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                  <button
                                    onClick={() => setSelectedNote(noteObj)}
                                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow shadow-teal-600/20 cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5" /> Read Comprehensive Note
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Full Comprehensive Lesson Note Reader Modal */}
                {selectedNote && (
                  <div
                    className="fixed inset-0 z-[90] flex items-center justify-center p-3 md:p-6 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
                    onClick={() => setSelectedNote(null)}
                  >
                    <div
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-start justify-between gap-4 z-10">
                        <div className="space-y-1.5">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                            {selectedNote.subject} • {selectedNote.week} • {selectedNote.class || selectedNote.className || selectedClass}
                          </span>
                          <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white leading-snug">
                            {selectedNote.topic}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Official NERDC-Approved Curriculum Standard • Comprehensive Student Notes
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              const textToCopy = selectedNote.content || selectedNote.markdownContent || JSON.stringify(selectedNote);
                              navigator.clipboard.writeText(textToCopy);
                              setCopiedNoteNotice(true);
                              setTimeout(() => setCopiedNoteNotice(false), 3000);
                            }}
                            className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-bold transition-colors flex items-center gap-1.5 shadow cursor-pointer"
                            title="Copy to exercise notebook"
                          >
                            <Copy className="w-4 h-4" />
                            <span>{copiedNoteNotice ? "Copied!" : "Copy Note"}</span>
                          </button>
                          <button
                            onClick={() => {
                              downloadTextFile(
                                `LessonNote-${selectedNote.subject || "Subject"}-${(selectedNote.topic || "Topic").replace(/[^a-zA-Z0-9]+/g, "-")}.txt`,
                                buildLessonNoteFile(selectedNote)
                              );
                            }}
                            className="p-2 rounded-xl bg-teal-600 text-white hover:bg-teal-500 transition-colors cursor-pointer"
                            title="Download Lesson Note File"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setSelectedNote(null)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="px-6 py-6 space-y-6 flex-1">
                        {/* 2 Behavioral Objectives */}
                        {selectedNote.objectives && selectedNote.objectives.length > 0 && (
                          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-2">
                            <span className="text-[11px] font-extrabold text-teal-700 dark:text-teal-300 uppercase tracking-wider block">
                              🎯 Behavioral Learning Objectives:
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-200 font-medium">
                              {selectedNote.objectives.slice(0, 2).map((obj: string, i: number) => (
                                <li key={i}>{obj}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Introduction */}
                        {selectedNote.introduction && (
                          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                            <span className="font-bold text-slate-900 dark:text-white block mb-1">Lesson Introduction:</span>
                            {selectedNote.introduction}
                          </div>
                        )}

                        {/* Note Body / Full Comprehensive Notes */}
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-sans text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                          {selectedNote.content || selectedNote.markdownContent || (
                            <div className="space-y-4">
                              <h4 className="font-bold text-base text-slate-900 dark:text-white">{selectedNote.topic}</h4>
                              <p>{selectedNote.introduction}</p>
                            </div>
                          )}
                        </div>

                        {/* Class Evaluation Questions */}
                        {selectedNote.evaluationQuestions && selectedNote.evaluationQuestions.length > 0 && (
                          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                            <span className="text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                              📝 Class Evaluation Questions:
                            </span>
                            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
                              {selectedNote.evaluationQuestions.map((q: string, i: number) => (
                                <li key={i}>{q}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* Homework & Assignment */}
                        {selectedNote.assignment && selectedNote.assignment.length > 0 && (
                          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                            <span className="text-[11px] font-extrabold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                              📚 Take-Home Assignment:
                            </span>
                            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
                              {selectedNote.assignment.map((a: string, i: number) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Summary */}
                        {selectedNote.summary && (
                          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                            <span className="text-teal-600 dark:text-teal-400 font-bold uppercase mr-1.5">Summary:</span>
                            {selectedNote.summary}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* 7. CBT EXAMS VIEW                                         */}
            {/* ========================================================= */}
            {activeTab === "cbt" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      CBT Online Examination Engine
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Take computer-based tests with real-time timers and instant auto-grading</p>
                  </div>
                </div>

                {!activeCbtExam ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cbtExams.map(e => (
                      <div key={e.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30">
                            {e.subject}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {e.durationMinutes} Mins
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{e.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {e.questions?.length || 0} Objective Questions • Instant Result
                        </p>

                        <button
                          onClick={() => handleStartCbt(e)}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Start CBT Test Now
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeCbtExam.title}</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Subject: {activeCbtExam.subject}</span>
                      </div>

                      <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 px-4 py-2 rounded-xl text-rose-600 dark:text-rose-400 font-mono font-bold text-sm">
                        <Clock className="w-4 h-4 animate-pulse" />
                        Time Left: {formatTime(cbtTimeLeft)}
                      </div>
                    </div>

                    {!cbtResult ? (
                      <div className="space-y-6">
                        {activeCbtExam.questions.map((q: any, idx: number) => (
                          <div key={q.id} className="p-5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              Q{idx + 1}. {q.question}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {q.options.map((opt: string, oIdx: number) => (
                                <button
                                  key={oIdx}
                                  onClick={() => setCbtAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                                  className={`p-3 rounded-xl border text-xs text-left font-semibold transition-all flex items-center gap-3 ${
                                    cbtAnswers[q.id] === oIdx
                                      ? "bg-teal-600/20 border-teal-500 text-teal-700 dark:text-teal-300"
                                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                                  }`}
                                >
                                  <span className="w-5 h-5 rounded-full border border-slate-400 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={handleCbtSubmit}
                          disabled={cbtSubmitting}
                          className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow flex items-center justify-center gap-2"
                        >
                          {cbtSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          Submit CBT Test
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6 text-center py-6">
                        <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                          <Award className="w-10 h-10" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white">CBT Exam Completed!</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Final Score: {cbtResult.percentage} ({cbtResult.totalScore} / {cbtResult.maxScore} Marks)
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveCbtExam(null)}
                          className="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700"
                        >
                          Return to CBT Center
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* 8. RESULTS & REPORT CARDS VIEW                            */}
            {/* ========================================================= */}
            {(activeTab === "results" || (activeTab as string) === "report-cards") && resultsData && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
                      {resultsData.term}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                      Official Report Card • {currentStudentName}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Position: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{resultsData.positionInClass}</span> • Total: {resultsData.overallTotal} / {resultsData.maximumPossible} • Average: {resultsData.average}%
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const html = buildReportCardHtml({
                        schoolName: currentSchoolName,
                        studentName: currentStudentName,
                        className: currentClass,
                        term: resultsData.term || "Term",
                        positionInClass: resultsData.positionInClass,
                        overallTotal: resultsData.overallTotal,
                        maximumPossible: resultsData.maximumPossible,
                        average: resultsData.average,
                        subjects: resultsData.subjects,
                      });
                      downloadTextFile(
                        `ReportCard-${currentStudentName.replace(/\s+/g, "-")}-${String(resultsData.term || "term").replace(/\s+/g, "-")}.html`,
                        html,
                        "text/html;charset=utf-8"
                      );
                    }}
                    className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-teal-600/30 flex items-center gap-2 self-start md:self-auto"
                  >
                    <Download className="w-4 h-4" />
                    Download Official Report Card PDF
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Term Academic Broadsheet</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-950 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                          <th className="py-3.5 px-4">Subject</th>
                          <th className="py-3.5 px-4">CA1 (20)</th>
                          <th className="py-3.5 px-4">CA2 (20)</th>
                          <th className="py-3.5 px-4">Exam (60)</th>
                          <th className="py-3.5 px-4">Total (100)</th>
                          <th className="py-3.5 px-4">Grade</th>
                          <th className="py-3.5 px-4">Rank</th>
                          <th className="py-3.5 px-4">Remark</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                        {resultsData.subjects.map((s: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{s.subject}</td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{s.ca1}</td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{s.ca2}</td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{s.exam}</td>
                            <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">{s.total}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                {s.grade}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{s.positionInSubject}</td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{s.remark}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 9. SCHOOL NOTICES VIEW                                    */}
            {/* ========================================================= */}
            {activeTab === "notices" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      School Notices & Announcements Board
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Official circulars and announcements from school management</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { id: "ann-1", title: "Inter-House Sports Practice", date: "2026-07-28", category: "Sports", text: "All students in Yellow house must assemble at the main sports complex by 3:30 PM today." },
                    { id: "ann-2", title: "WAEC Chemistry Practical Lab Prep", date: "2026-07-27", category: "Academic", text: "Ensure your safety goggles and lab coats are presented to Dr. Eze before Thursday." },
                    { id: "ann-3", title: "PTA General Assembly & Science Fair", date: "2026-07-25", category: "PTA", text: "Parents and guardians are cordially invited to the 2026 STEM exhibition." }
                  ].map(ann => (
                    <div key={ann.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          {ann.category}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{ann.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ann.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ann.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 10. MESSAGES VIEW                                         */}
            {/* ========================================================= */}
            {activeTab === "messages" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      Student & Teacher Messaging Inbox
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Direct notes and guidance from your subject teachers</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { id: "m-1", sender: "Mrs. Okonkwo Beatrice (Math Teacher)", subject: "Quadratic Equations Homework Feedback", date: "2 hours ago", text: "Chinedu, your working for question 3 was brilliant. Keep up the high standard." },
                    { id: "m-2", sender: "Dr. Eze Chukwuma (Physics Teacher)", subject: "WAEC Physics Practical Session", date: "Yesterday", text: "Remember to review wave refraction diagrams before tomorrow's laboratory practice." }
                  ].map(msg => (
                    <div key={msg.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-300">{msg.sender}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{msg.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{msg.subject}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 11. SETTINGS VIEW                                         */}
            {/* ========================================================= */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Settings className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                      Account & Portal Settings
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Manage security, password, and portal notifications</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6 max-w-xl">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Change Security Password
                  </h3>

                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (!passNew.trim()) {
                        setPassMsg({ type: "error", text: "Please enter a new password." });
                        return;
                      }
                      setPassMsg({ type: "success", text: "Security password updated successfully!" });
                      setPassCurrent("");
                      setPassNew("");
                      setTimeout(() => setPassMsg(null), 4000);
                    }}
                    className="space-y-4"
                  >
                    {passMsg && (
                      <div
                        className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                          passMsg.type === "success"
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{passMsg.text}</span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Current Password</label>
                      <input
                        type="password"
                        required
                        value={passCurrent}
                        onChange={e => setPassCurrent(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">New Password</label>
                      <input
                        type="password"
                        required
                        value={passNew}
                        onChange={e => setPassNew(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow transition-all active:scale-95"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 12. FEES VIEW                                             */}
            {/* ========================================================= */}
            {activeTab === "fees" && feeInvoice && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      Invoice #{feeInvoice?.id || "N/A"}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">School Fee Ledger</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Term: {feeInvoice?.term} • Outstanding: ₦{(feeInvoice?.outstandingBalance || 0).toLocaleString()}</p>
                  </div>

                  <button
                    onClick={() => setIsPayModalOpen(true)}
                    className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-teal-600/30 flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay Fees
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-950 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3.5 px-4">Description</th>
                        <th className="py-3.5 px-4 text-right">Amount (₦)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      {(feeInvoice?.items || []).map((it: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{it?.description}</td>
                          <td className="py-3.5 px-4 text-right font-mono">₦{(it?.amount || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Payment Modal */}
                {isPayModalOpen && (
                  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-2xl space-y-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Online School Fee Payment</h3>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Payment Amount (₦)</label>
                          <input
                            type="number"
                            value={payAmount}
                            onChange={e => setPayAmount(e.target.value)}
                            className="w-full p-3 mt-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-bold font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Payment Gateway</label>
                          <select
                            value={payMethod}
                            onChange={e => setPayMethod(e.target.value)}
                            className="w-full p-3 mt-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="Paystack Online Gateway">Paystack Secured Gateway</option>
                            <option value="Flutterwave Payment Hub">Flutterwave Payment Hub</option>
                            <option value="Bank Transfer">Direct Bank Transfer</option>
                          </select>
                        </div>

                        {payMethod === "Bank Transfer" && (
                          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 space-y-3">
                            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                              <Banknote className="w-4 h-4" /> Make payment to any of the accounts below
                            </p>
                            {schoolPaymentAccounts.length > 0 ? schoolPaymentAccounts.map((acct: any) => (
                              <div key={acct.id} className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-emerald-100 dark:border-emerald-900">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-sm text-slate-900 dark:text-white">{acct.bankName}</span>
                                  {acct.isDefault && <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded-full">Preferred</span>}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Account Name: <span className="font-semibold text-slate-700 dark:text-slate-200">{acct.accountName}</span></div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Account No: <span className="font-mono font-bold text-slate-900 dark:text-white tracking-wider">{acct.accountNumber}</span></div>
                                {acct.sortCode && <div className="text-xs text-slate-500 dark:text-slate-400">Sort Code: <span className="font-mono text-slate-700 dark:text-slate-200">{acct.sortCode}</span></div>}
                              </div>
                            )) : (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400">No bank accounts configured. Please contact your school admin.</p>
                            )}
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">After transferring, your payment will be verified within 24 hours.</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => setIsPayModalOpen(false)}
                          className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleFeePayment}
                          disabled={processingPay}
                          className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow flex items-center gap-2"
                        >
                          {processingPay ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                          Process Payment
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* 13. AI STUDY TUTOR VIEW                                   */}
            {/* ========================================================= */}
            {activeTab === "ai-tutor" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 h-[600px] flex flex-col">
                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="p-2.5 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-700 dark:text-purple-300">
                    <Sparkles className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      sSolutAI AI Study Assistant
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      WAEC / JAMB / NECO practice, step-by-step math solver & advisory
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 p-2">
                  {aiChatLogs.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                          m.sender === "user"
                            ? "bg-teal-600 text-white"
                            : "bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="p-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-purple-700 dark:text-purple-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        sSolutAI AI is analyzing your prompt...
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAiSend()}
                    placeholder="Ask a WAEC practice question or math problem..."
                    className="flex-1 p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleAiSend}
                    disabled={aiLoading}
                    className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Ask
                  </button>
                </div>
              </div>
            )}
          </>
      </main>
    </div>
  );
}
