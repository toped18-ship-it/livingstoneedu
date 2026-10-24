import React, { useState, useEffect } from "react";
import { lookupCurriculumTopic } from "../../data/curriculumData";
import { WebsiteBuilderView } from "./WebsiteBuilderView";
import { TeachersView } from "./TeachersView";
import { AIResultCompilationModule } from "./AIResultCompilationModule";
import { AILessonNotesView } from "./AILessonNotesView";
import { AIExamGeneratorView } from "./AIExamGeneratorView";
import { QuestionBankView } from "./QuestionBankView";
import { AttendanceTrackerView } from "./AttendanceTrackerView";
import { SubscriptionView } from "./SubscriptionView";
import { SettingsView } from "./SettingsView";
import { FinanceView } from "./FinanceView";
import { CommunicationView } from "./CommunicationView";
import { useLiveData, useGlobalRefresh, notifyDataChanged } from "../../lib/liveStore";
import { UserRole } from "../../types";
import { Logo } from "../Logo";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  Users,
  Award,
  AlertCircle,
  Plus,
  Search,
  Download,
  Send,
  Printer,
  ChevronRight,
  TrendingUp,
  Brain,
  MessageSquare,
  Paperclip,
  Share2,
  Check,
  X,
  Copy,
  FolderOpen,
  Upload,
  RefreshCw,
  BarChart2,
  UserCheck,
  ShieldCheck,
  FileCheck,
  HelpCircle,
  Cpu,
  UserPlus,
  FileSpreadsheet,
  User,
  Phone,
  Mail,
  Lock,
  CheckSquare,
  Layers,
  Bell,
  PieChart,
  Filter,
  ArrowUpRight,
  Sliders,
  ShieldAlert,
  Globe,
  Wallet,
  GraduationCap,
  Building,
  PiggyBank,
  Clipboard,
  History,
  School,
  Briefcase,
  Settings,
  Database,
  Shield,
  FileKey,
  Globe as GlobeIcon,
  CreditCard,
  FileBadge,
  Clock8,
  BookDown,
  Wifi,
  Target,
  Edit,
  Trash2,
  Info,
  FileInput,
  BarChart3,
  Menu,
  ChevronLeft,
  Building2,
  PanelLeft,
  PanelLeftClose,
  LogOut,
} from "lucide-react";

interface SchoolPortalProps {
  currentRole?: string;
  userSession?: any;
  onSelectTab?: (tab: any) => void;
  initialSection?: SchoolPortalSection;
  onLogout?: () => void;
}

type SchoolPortalSection =
  | "dashboard"
  | "school-profile"
  | "teachers-staff"
  | "subject-allocation"
  | "student-management"
  | "student-behaviour"
  | "admissions"
  | "curriculum"
  | "lesson-library"
  | "ai-lesson-library"
  | "examinations"
  | "reports"
  | "finance"
  | "communication"
  | "subscription"
  | "roles-permissions"
  | "audit-logs"
  | "system-settings";

const SIDEBAR_ITEMS: { id: SchoolPortalSection; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "school-profile", label: "School Profile", icon: School },
  { id: "teachers-staff", label: "Teachers & Staff Management", icon: UserCheck },
  { id: "subject-allocation", label: "Subject Allocation Matrix", icon: BookOpen },
  { id: "student-management", label: "Student Management", icon: Users },
  { id: "student-behaviour", label: "Students Behaviour", icon: ShieldAlert },
  { id: "admissions", label: "Admissions", icon: UserPlus },
  { id: "curriculum", label: "Curriculum Management", icon: BookOpen },
  { id: "lesson-library", label: "Master Lesson Note Library", icon: FileText },
  { id: "ai-lesson-library", label: "AI Lesson Library", icon: Sparkles },
  { id: "examinations", label: "Examination Management", icon: Cpu },
  { id: "reports", label: "Report Card Management", icon: FileSpreadsheet },
  { id: "finance", label: "Finance", icon: PiggyBank },
  { id: "communication", label: "Communication", icon: MessageSquare },
  { id: "subscription", label: "Subscription & Billing", icon: CreditCard },
  { id: "roles-permissions", label: "Roles & Permissions", icon: Shield },
  { id: "audit-logs", label: "Audit Logs", icon: History },
  { id: "system-settings", label: "System Settings", icon: Settings },
];

export function SchoolPortalView({ currentRole = "Principal", userSession, onSelectTab, initialSection = "dashboard", onLogout }: SchoolPortalProps) {
  const [activeSection, setActiveSection] = useState<SchoolPortalSection>(initialSection);
  const [portalSidebarCollapsed, setPortalSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalSearchQuery, setPortalSearchQuery] = useState("");

  const handleSchoolLogout = () => {
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

  // School Profile & Management State
  const [schoolAddress, setSchoolAddress] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const details = localStorage.getItem("livingstone_school_details");
        if (details) return JSON.parse(details).address || "12 Educational Avenue, Victoria Island, Lagos State";
      } catch (e) {}
    }
    return "12 Educational Avenue, Victoria Island, Lagos State";
  });
  const [schoolMotto, setSchoolMotto] = useState("Excellence in Knowledge, Wisdom & Integrity");
  const [schoolPhone, setSchoolPhone] = useState("+234 803 111 2233");
  const [schoolEmail, setSchoolEmail] = useState("admin@livingstone.edu.ng");
  const [schoolPrincipal, setSchoolPrincipal] = useState(userSession?.fullName || userSession?.name || "Dr. Emmanuel Livingstone");
  const [schoolCurriculum, setSchoolCurriculum] = useState("Nigerian NERDC / WAEC & NECO Standard");
  const [schoolSession, setSchoolSession] = useState("2026/2027 Session");
  const [schoolTerm, setSchoolTerm] = useState("First Term");
  const [schoolCode, setSchoolCode] = useState("LIV-LAG-01");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "student-management" | "teachers-staff" | "academic-management" | "classroom-management" | "reports" | "ai-tools" | "website-builder" | "school-fees"
  >("dashboard");
  const [studentSubTab, setStudentSubTab] = useState<
    "directory" | "admission" | "profiles" | "academic-records" | "attendance" | "promotion" | "report-cards" | "discipline"
  >("directory");

  const [academicSubTab, setAcademicSubTab] = useState<
    "lesson-notes" | "scheme" | "assignments" | "exam-generator" | "question-bank" | "cbt" | "marking"
  >("lesson-notes");

  const [classroomSubTab, setClassroomSubTab] = useState<"classes" | "timetable" | "subject-allocation" | "register" | "announcements">("classes");
  const [reportsSubTab, setReportsSubTab] = useState<"report-cards" | "class-performance" | "student-analytics" | "ca-exam-reports">("report-cards");
  const [aiSubTab, setAiSubTab] = useState<"planner" | "exam-gen" | "question-gen" | "marking-assistant" | "insights" | "copilot">("copilot");

  // Dashboard & Classroom Data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("JSS 1");
  const [attendanceRecords, setAttendanceRecords] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any>(null);

  // Admission Form State
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentGender, setNewStudentGender] = useState("Male");
  const [newStudentClass, setNewStudentClass] = useState("JSS 1");
  const [newStudentParent, setNewStudentParent] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");

  // Lesson Note State
  const [lessonNotes, setLessonNotes] = useState<any[]>([]);
  const [noteSubject, setNoteSubject] = useState("Mathematics");
  const [noteClass, setNoteClass] = useState("SS 2");
  const [noteWeek, setNoteWeek] = useState("Week 4");
  const [noteTopic, setNoteTopic] = useState("Quadratic Equations & Roots Analysis");
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [generatedNoteText, setGeneratedNoteText] = useState("");

  // School Fee Structure State
  const [feeItems, setFeeItems] = useState<any[]>([
    { description: "School Fee", amount: 150000 },
    { description: "Lesson Fee", amount: 50000 },
    { description: "Exam Fee", amount: 35000 },
    { description: "Hostel Fee (For Boarders)", amount: 80000 },
    { description: "Transport Fee", amount: 30000 },
    { description: "P.T.A Fee", amount: 20000 },
    { description: "Craft Fee (For Those Who Pay)", amount: 20000 }
  ]);
  const [feeInvoiceSummary, setFeeInvoiceSummary] = useState<any>(null);
  const [feeSaving, setFeeSaving] = useState(false);

  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([
    { id: "PAY-001", bankName: "Guaranty Trust Bank", accountName: "LivingstoneEDU Model School", accountNumber: "0123456789", sortCode: "058", accountType: "Current", isDefault: true, isActive: true }
  ]);

  // Exam Generator State
  const [exams, setExams] = useState<any[]>([]);
  const [examSubject, setExamSubject] = useState("Mathematics");
  const [examClass, setExamClass] = useState("SS2");
  const [examType, setExamType] = useState("First Term Mid-Term CA Test");
  const [numObj, setNumObj] = useState(20);
  const [numTheory, setNumTheory] = useState(2);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [generatedExamResult, setGeneratedExamResult] = useState<any>(null);

  // CA & Report Card State
  const [caEntries, setCaEntries] = useState<any[]>([]);
  const [selectedStudentForCa, setSelectedStudentForCa] = useState<string>("STD-2026-001");
  const [assignmentScore, setAssignmentScore] = useState<number>(18);
  const [testScore, setTestScore] = useState<number>(16);
  const [projectScore, setProjectScore] = useState<number>(9);
  const [examScore, setExamScore] = useState<number>(58);
  const [teacherRemark, setTeacherRemark] = useState<string>("");
  const [behaviourPunctuality, setBehaviourPunctuality] = useState("Excellent");
  const [behaviourNeatness, setBehaviourNeatness] = useState("Good");
  const [behaviourDiscipline, setBehaviourDiscipline] = useState("Compliant");

  // Homework state
  const [assignments, setAssignments] = useState<any[]>([]);

  // Promotions State
  const [promotionsList, setPromotionsList] = useState<any[]>([]);

  // Discipline & Behaviour State
  const [disciplineLogs, setDisciplineLogs] = useState<any[]>([]);

  // AI Co-Pilot & Assistant State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiChatLogs, setAiChatLogs] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Hello! I am your LIVINGSTONEEDU AI Assistant. I can generate lesson plans, design exam papers, create marking rubrics, suggest remedial tasks, or analyze student weak points. How can I assist you today?"
    }
  ]);
  const [isAiReplying, setIsAiReplying] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const liveStudents = useLiveData<any>("students").data;
  const liveTeachers = useLiveData<any>("teachers").data;
  const liveAttendance = useLiveData<any>("attendanceRegister").data;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Secondary School Multi-Subject Allocation & Appointment Matrix State
  const [allocationClassFilter, setAllocationClassFilter] = useState<string>("All Classes");
  const [allocationDeptFilter, setAllocationDeptFilter] = useState<string>("All Departments");
  const [allocationSearchQuery, setAllocationSearchQuery] = useState<string>("");
  const [allocationViewTab, setAllocationViewTab] = useState<"roster" | "matrix" | "schedule">("roster");
  const [appointingTeacher, setAppointingTeacher] = useState<any | null>(null);
  const [appointedSubjectsList, setAppointedSubjectsList] = useState<string[]>([]);
  const [customSubjectToAdd, setCustomSubjectToAdd] = useState<string>("");
  const [assignedClassesForSubjects, setAssignedClassesForSubjects] = useState<string[]>(["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"]);
  const [isSavingSubjectAppointment, setIsSavingSubjectAppointment] = useState<boolean>(false);
  const [appointmentModalDeptTab, setAppointmentModalDeptTab] = useState<string>("All");

  // School name dynamically resolved from session or registered institution
  const [schoolName, setSchoolName] = useState(() => {
    if (userSession?.schoolName) return userSession.schoolName;
    if (userSession?.name && (currentRole === "Principal" || currentRole === "School Owner" || currentRole === "School Administrator")) return userSession.name;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("livingstone_registered_school");
        if (saved) return saved;
        const details = localStorage.getItem("livingstone_school_details");
        if (details) return JSON.parse(details)?.name || "LivingstoneEDU Model School";
      } catch (e) {}
    }
    return userSession?.schoolName || "LivingstoneEDU Model School";
  });

  useEffect(() => {
    if (userSession?.schoolName) {
      setSchoolName(userSession.schoolName);
    } else if (typeof window !== "undefined") {
      const saved = localStorage.getItem("livingstone_registered_school");
      if (saved) setSchoolName(saved);
    }
  }, [userSession]);

  // Load latest school settings from backend on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          if (res.data.schoolName) setSchoolName(res.data.schoolName);
          setSchoolSettings((prev) => ({
            ...prev,
            schoolName: res.data.schoolName || prev.schoolName,
            schoolMotto: res.data.schoolMotto || prev.schoolMotto,
            schoolAddress: res.data.schoolAddress || prev.schoolAddress,
            schoolPhone: res.data.contactPhone || prev.schoolPhone,
            schoolEmail: res.data.contactEmail || prev.schoolEmail,
            schoolWebsite: res.data.websiteUrl || prev.schoolWebsite,
            schoolLogo: res.data.schoolLogoUrl || prev.schoolLogo,
            academicSession: res.data.academicSession || prev.academicSession,
            currentTerm: res.data.academicTerms || prev.currentTerm,
          }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleSettingsChanged = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d && typeof d === "object") {
        if (d.schoolName) setSchoolName(d.schoolName);
        setSchoolSettings((prev) => ({
          ...prev,
          schoolName: d.schoolName || prev.schoolName,
          schoolMotto: d.schoolMotto || prev.schoolMotto,
          schoolAddress: d.schoolAddress || prev.schoolAddress,
          schoolPhone: d.contactPhone || prev.schoolPhone,
          schoolEmail: d.contactEmail || prev.schoolEmail,
          schoolWebsite: d.websiteUrl || prev.schoolWebsite,
          schoolLogo: d.schoolLogoUrl || prev.schoolLogo,
          academicSession: d.academicSession || prev.academicSession,
          currentTerm: d.academicTerms || d.currentTerm || prev.currentTerm,
        }));
      }
    };
    window.addEventListener("app:settings-changed", handleSettingsChanged);
    return () => window.removeEventListener("app:settings-changed", handleSettingsChanged);
  }, []);

  // --- Firebase RTDB immediate sync: load fee structure ---
  useEffect(() => {
    let mounted = true;
    fetch("/api/teacher/fees/items")
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        if (json.success) {
          setFeeInvoiceSummary(json.invoice);
          if (Array.isArray(json.invoice?.items) && json.invoice.items.length) {
            setFeeItems(json.invoice.items);
          }
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // --- Curriculum topic auto-fill ---
  useEffect(() => {
    const curriculum = lookupCurriculumTopic(noteClass, noteSubject, "First Term", noteWeek);
    if (curriculum && curriculum.topic) {
      setNoteTopic(curriculum.topic);
    }
  }, [noteClass, noteSubject, noteWeek]);

  const isPrincipalOrAdmin =
    currentRole === "Principal" ||
    currentRole === "Vice Principal" ||
    currentRole === "School Owner" ||
    currentRole === "Admin" ||
    currentRole === "Super Administrator" ||
    currentRole === "Proprietor" ||
    currentRole === "Proprietress" ||
    currentRole === "Registrar" ||
    currentRole === "Admission Officer" ||
    currentRole === "ICT Administrator" ||
    currentRole === "School Administrator";

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    fetchDashboard();
    fetchStudents();
    fetchLessonNotes();
    fetchExams();
    fetchCaData();
    return () => clearTimeout(timer);
  }, []);

  useGlobalRefresh(() => {
    fetchDashboard();
    fetchStudents();
    fetchLessonNotes();
    fetchExams();
    fetchCaData();
  });

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/teacher/dashboard");
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

  const fetchStudents = async () => {
    try {
      const res = await fetch(`/api/teacher/students?className=${selectedClass}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStudents(json.data);
        const initialAttendance: any = {};
        json.data.forEach((s: any) => {
          if (s?.id) initialAttendance[s.id] = "Present";
        });
        setAttendanceRecords(initialAttendance);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLessonNotes = async () => {
    try {
      const res = await fetch("/api/teacher/lesson-notes");
      const json = await res.json();
      if (json.success) setLessonNotes(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await fetch("/api/teacher/exams");
      const json = await res.json();
      if (json.success) setExams(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCaData = async () => {
    try {
      const res = await fetch("/api/teacher/ca");
      const json = await res.json();
      if (json.success) setCaEntries(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const updateFeeItem = (index: number, field: "description" | "amount", value: any) => {
    setFeeItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: field === "amount" ? Number(value) : value } : it))
    );
  };
  const addFeeItem = () => setFeeItems((prev) => [...prev, { description: "", amount: 0 }]);
  const removeFeeItem = (index: number) => setFeeItems((prev) => prev.filter((_, i) => i !== index));

  const handlePostFees = async () => {
    const cleaned = feeItems
      .filter((it) => it && typeof it.description === "string" && it.description.trim() !== "")
      .map((it) => ({ description: it.description.trim(), amount: Math.max(0, Number(it.amount) || 0) }));
    if (!cleaned.length) {
      showToast("Add at least one fee description and amount before posting.");
      return;
    }
    setFeeSaving(true);
    try {
      const res = await fetch("/api/teacher/fees/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cleaned })
      }).then((r) => r.json());
      if (res.success) {
        setFeeItems(cleaned);
        setFeeInvoiceSummary(res.invoice);
        showToast(res.message || "Fee structure posted to the student portal!");
      } else {
        showToast(res.message || "Could not post fee structure.");
      }
    } catch (e) {
      showToast("Network error posting fee structure.");
    } finally {
      setFeeSaving(false);
    }
  };

  const handleTakeAttendance = async () => {
    const recordsPayload = (students || []).map((s) => ({
      studentId: s?.id || "",
      studentName: s?.name || "",
      status: attendanceRecords[s?.id] || "Present",
      remark: "Taken via School Panel"
    }));

    try {
      const res = await fetch("/api/teacher/attendance/take", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className: selectedClass, records: recordsPayload })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Attendance submitted for ${selectedClass}!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddStudentAdmission = () => {
    if (!newStudentName.trim()) return;
    const newId = `STD-2027-${String(students.length + 10).padStart(3, "0")}`;
    const newAdmissionNo = `DIS/2027/${String(500 + students.length + 10).padStart(3, "0")}`;
    const newRecord = {
      id: newId,
      admissionNo: newAdmissionNo,
      name: newStudentName,
      gender: newStudentGender,
      class: newStudentClass,
      parentName: newStudentParent || "Chief Adeyemi",
      phone: newStudentPhone || "+234 803 123 4567",
      email: newStudentEmail || "parent@livingstone.edu",
      gpa: "3.50",
      attendanceRate: "98%"
    };
    setStudents((prev) => [newRecord, ...prev]);
    setNewStudentName("");
    setNewStudentParent("");
    setNewStudentPhone("");
    setNewStudentEmail("");
    showToast(`Student ${newStudentName} admitted into ${newStudentClass} successfully!`);
    setStudentSubTab("directory");
  };

  const handleGenerateAiNote = async () => {
    setIsGeneratingNote(true);
    try {
      const res = await fetch("/api/teacher/lesson-notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: noteSubject,
          classLevel: noteClass,
          topic: noteTopic,
          week: noteWeek,
          term: "First Term"
        })
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedNoteText(json.data.content);
        fetchLessonNotes();
        showToast("AI Lesson Note generated and saved as Draft!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingNote(false);
    }
  };

  const handleGenerateAiExam = async () => {
    setIsGeneratingExam(true);
    try {
      const res = await fetch("/api/teacher/exams/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: examSubject,
          classLevel: examClass,
          examType,
          numObjective: numObj,
          numTheory: numTheory
        })
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedExamResult(json.data);
        fetchExams();
        showToast("AI Examination paper created with Marking Scheme!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingExam(false);
    }
  };

  const handleSaveCa = async () => {
    try {
      const res = await fetch("/api/teacher/ca/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentForCa,
          assignmentScore,
          test1Score: testScore,
          projectScore,
          examScore
        })
      });
      const json = await res.json();
      if (json.success) {
        fetchCaData();
        showToast(`CA Entry saved for ${selectedStudentForCa}. Score: ${json.data.finalTotal}% (${json.data.grade})`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAiRemarkGenerate = async () => {
    try {
      const res = await fetch("/api/teacher/report-cards/remarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName: "Adeyemi Chinedu", totalScore: 88 })
      });
      const json = await res.json();
      if (json.success) {
        setTeacherRemark(json.remark);
        showToast("AI Teacher Remark generated!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendAiMessage = async () => {
    if (!aiPrompt.trim()) return;
    const userMsg = aiPrompt;
    setAiPrompt("");
    setAiChatLogs((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsAiReplying(true);

    try {
      const res = await fetch("/api/teacher/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      const json = await res.json();
      if (json.success) {
        setAiChatLogs((prev) => [...prev, { sender: "ai", text: json.reply }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiReplying(false);
    }
  };

  const togglePromotionStatus = (id: string) => {
    setPromotionsList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus =
            item.status === "Approved by Principal"
              ? "Pending Principal Approval"
              : "Approved by Principal";
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
    showToast("Promotion approval status updated!");
  };

  const filteredStudents = (students || []).filter(
    (s) =>
      (s?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s?.admissionNo || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAdminPlaceholder = (label: string, icon: React.ElementType, description: string) => {
    const Icon = icon;
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Icon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">{label}</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
          {description}
        </p>
        <button
          onClick={() => setActiveSection("dashboard")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 mx-auto"
        >
          <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    );
  };

  const [schoolSettings, setSchoolSettings] = useState({
    schoolName: schoolName,
    schoolMotto: "Excellence in Education",
    schoolAddress: "12 Victoria Island, Lagos, Nigeria",
    schoolPhone: "+234 801 234 5678",
    schoolEmail: "admin@livingstone.edu.ng",
    schoolWebsite: "https://livingstone.edu.ng",
    schoolLogo: "",
    academicSession: "2026/2027",
    currentTerm: "First Term",
    termStartDate: "2026-09-08",
    termEndDate: "2026-12-18",
    schoolOpeningTime: "07:30",
    schoolClosingTime: "15:00",
    gradingSystem: "WAEC Standard",
    passMark: "40",
    caWeight: "40",
    examWeight: "60",
    schoolType: "Day & Boarding",
    maxStudentsPerClass: "35",
    notificationEmails: true,
    parentSmsAlerts: true,
    autoReportCards: false,
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const renderSchoolSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600" /> School Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure your school's profile, academic calendar, and operational preferences.</p>
          </div>
          {settingsSaved && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">Saved!</span>
          )}
        </div>

        <div className="p-6 space-y-8">
          {/* School Profile */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-600" /> School Profile
            </h3>

            {/* Logo Upload */}
            <div className="mb-6 p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-sm">
                  {schoolSettings.schoolLogo ? (
                    <img src={schoolSettings.schoolLogo} alt="School Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <School className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">School Logo</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Upload your school crest or logo. PNG, JPG, SVG. Max 2MB.</p>
                  <div className="flex items-center gap-2">
                    <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors shadow-sm">
                      <Upload className="w-3.5 h-3.5" /> Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) {
                            showToast("Logo must be under 2MB.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setSchoolSettings({ ...schoolSettings, schoolLogo: ev.target?.result as string });
                            showToast("Logo uploaded! Click Save to apply.");
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {schoolSettings.schoolLogo && (
                      <button
                        onClick={() => setSchoolSettings({ ...schoolSettings, schoolLogo: "" })}
                        className="px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">School Name</label>
                <input value={schoolSettings.schoolName} onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolName: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">School Motto</label>
                <input value={schoolSettings.schoolMotto} onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolMotto: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">School Type</label>
                <select value={schoolSettings.schoolType} onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolType: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  <option>Day Only</option>
                  <option>Boarding Only</option>
                  <option>Day & Boarding</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Address</label>
                <input value={schoolSettings.schoolAddress} onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolAddress: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Phone</label>
                <input value={schoolSettings.schoolPhone} onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolPhone: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Email</label>
                <input value={schoolSettings.schoolEmail} onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolEmail: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Website</label>
                <input value={schoolSettings.schoolWebsite} onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolWebsite: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Academic Calendar */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" /> Academic Calendar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Session</label>
                <input value={schoolSettings.academicSession} onChange={(e) => setSchoolSettings({ ...schoolSettings, academicSession: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Current Term</label>
                <select value={schoolSettings.currentTerm} onChange={(e) => setSchoolSettings({ ...schoolSettings, currentTerm: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  <option>First Term</option>
                  <option>Second Term</option>
                  <option>Third Term</option>
                </select>
              </div>
              <div></div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Term Start</label>
                <input type="date" value={schoolSettings.termStartDate} onChange={(e) => setSchoolSettings({ ...schoolSettings, termStartDate: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Term End</label>
                <input type="date" value={schoolSettings.termEndDate} onChange={(e) => setSchoolSettings({ ...schoolSettings, termEndDate: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* School Hours */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" /> School Hours
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Opening Time</label>
                <input type="time" value={schoolSettings.schoolOpeningTime} onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolOpeningTime: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Closing Time</label>
                <input type="time" value={schoolSettings.schoolClosingTime} onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolClosingTime: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Max Students Per Class</label>
                <input type="number" value={schoolSettings.maxStudentsPerClass} onChange={(e) => setSchoolSettings({ ...schoolSettings, maxStudentsPerClass: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Grading */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" /> Grading Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Grading System</label>
                <select value={schoolSettings.gradingSystem} onChange={(e) => setSchoolSettings({ ...schoolSettings, gradingSystem: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  <option>WAEC Standard</option>
                  <option>CBC (Competency-Based)</option>
                  <option>British System</option>
                  <option>Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Pass Mark (%)</label>
                <input type="number" value={schoolSettings.passMark} onChange={(e) => setSchoolSettings({ ...schoolSettings, passMark: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">CA Weight (%)</label>
                <input type="number" value={schoolSettings.caWeight} onChange={(e) => setSchoolSettings({ ...schoolSettings, caWeight: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Exam Weight (%)</label>
                <input type="number" value={schoolSettings.examWeight} onChange={(e) => setSchoolSettings({ ...schoolSettings, examWeight: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-600" /> Notifications & Alerts
            </h3>
            <div className="space-y-3">
              {[
                { key: "notificationEmails", label: "Email Notifications", desc: "Receive email alerts for important school events" },
                { key: "parentSmsAlerts", label: "Parent SMS Alerts", desc: "Send SMS notifications to parents on attendance and results" },
                { key: "autoReportCards", label: "Auto-Generate Report Cards", desc: "Automatically compile report cards at end of term" },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => setSchoolSettings({ ...schoolSettings, [item.key]: !(schoolSettings as any)[item.key] })}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors ${(schoolSettings as any)[item.key] ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"} relative`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${(schoolSettings as any)[item.key] ? "translate-x-5.5" : "translate-x-0.5"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button onClick={() => setActiveSection("dashboard")} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                const payload = {
                  schoolName: schoolSettings.schoolName,
                  schoolMotto: schoolSettings.schoolMotto,
                  schoolAddress: schoolSettings.schoolAddress,
                  contactPhone: schoolSettings.schoolPhone,
                  contactEmail: schoolSettings.schoolEmail,
                  websiteUrl: schoolSettings.schoolWebsite,
                  schoolLogoUrl: schoolSettings.schoolLogo,
                  academicSession: schoolSettings.academicSession,
                  academicTerms: schoolSettings.currentTerm,
                  gradingSystem: schoolSettings.gradingSystem,
                  passMark: schoolSettings.passMark,
                  caWeight: schoolSettings.caWeight,
                  examWeight: schoolSettings.examWeight,
                };
                const res = await fetch("/api/settings", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (data.success) {
                  setSchoolName(schoolSettings.schoolName);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("livingstone_registered_school", schoolSettings.schoolName);
                    localStorage.setItem("livingstone_app_settings", JSON.stringify(schoolSettings));
                    window.dispatchEvent(new CustomEvent("app:settings-changed", { detail: schoolSettings }));
                  }
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 3000);
                  showToast("School settings saved and applied across entire application!");
                }
              } catch (e) {
                console.error("Failed to save school settings:", e);
                showToast("Failed to save school settings to server");
              }
            }}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> Save School Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => setActiveSection("student-management")}
                className="bg-white hover:bg-emerald-50/50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-left transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider group-hover:text-emerald-700">
                  <span>Assigned Classes</span>
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {dashboardData?.assignedClasses && dashboardData.assignedClasses.length > 0
                    ? `${dashboardData.assignedClasses.length} Class${dashboardData.assignedClasses.length > 1 ? "es" : ""}`
                    : "0 Classes"}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {dashboardData?.assignedClasses && dashboardData.assignedClasses.length > 0
                    ? dashboardData.assignedClasses.join(", ")
                    : "No classes assigned yet"}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("reports")}
                className="bg-white hover:bg-emerald-50/50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-left transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider group-hover:text-emerald-700">
                  <span>Today's Attendance</span>
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {dashboardData?.attendanceSummary?.attendanceRate || "0.0%"}
                </div>
                <div className="text-xs text-emerald-600 font-semibold">
                  {dashboardData?.attendanceSummary?.totalStudents && dashboardData.attendanceSummary.totalStudents > 0
                    ? `${dashboardData.attendanceSummary.presentToday || 0} Present / ${dashboardData.attendanceSummary.absentToday || 0} Absent / ${dashboardData.attendanceSummary.lateToday || 0} Late`
                    : "No attendance recorded today"}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("curriculum")}
                className="bg-white hover:bg-amber-50/50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-left transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider group-hover:text-amber-700">
                  <span>Lesson Notes Status</span>
                  <FileCheck className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {dashboardData?.lessonNotesStats?.approved || 0} Approved
                </div>
                <div className="text-xs text-amber-600 font-medium">
                  {dashboardData?.lessonNotesStats?.pending && dashboardData.lessonNotesStats.pending > 0
                    ? `${dashboardData.lessonNotesStats.pending} Pending Principal Sign-off`
                    : "0 Pending Sign-off"}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("examinations")}
                className="bg-white hover:bg-blue-50/50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-left transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider group-hover:text-blue-700">
                  <span>Active CBT & Exams</span>
                  <Cpu className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {(dashboardData?.examsStats?.totalExamsCreated || 0) + (dashboardData?.examsStats?.activeCbtSessions || 0)} Examinations
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  {dashboardData?.examsStats?.activeCbtSessions && dashboardData.examsStats.activeCbtSessions > 0
                    ? `${dashboardData.examsStats.activeCbtSessions} Active CBT Session${dashboardData.examsStats.activeCbtSessions > 1 ? "s" : ""}`
                    : "No active examinations"}
                </div>
              </button>
            </div>

            {/* Quick Action: Secondary School Subject Allocation Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    Subject Allocation & Appointment Matrix
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Multi-Subject
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Appoint more than one subject to teach per teacher across Junior (JSS 1-3) and Senior Secondary (SS 1-3).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection("subject-allocation")}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Open Matrix <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    Today's Teaching Schedule (Wednesday)
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {(dashboardData?.todaysTimetable || []).length} Periods
                  </span>
                </div>

                <div className="space-y-3">
                  {dashboardData?.todaysTimetable?.map((item: any, idx: number) => (
                    <div key={item?.id || idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {item?.period ? item.period.split(" ")[0] : "1"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{item?.subject || "Subject"}</div>
                          <div className="text-xs text-slate-500">{item?.class} • {item?.room}</div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">
                        {item?.period}
                      </span>
                    </div>
                  ))}
                  {(!dashboardData?.todaysTimetable || dashboardData.todaysTimetable.length === 0) && (
                    <div className="text-center py-8 text-slate-400 text-sm">No classes scheduled for today.</div>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Sparkles className="w-5 h-5" />
                    sSolutAI AI Co-Pilot Prompt
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Generate instant marking schemes, WAEC practice questions, or remedial exercises for assigned students.
                  </p>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Generate 5 theory practice questions on Quadratic Equations for JSS 1..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  onClick={() => {
                    handleSendAiMessage();
                  }}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Ask sSolutAI Assistant
                </button>
              </div>
            </div>
          </div>
        );

      case "school-profile":
        return renderSchoolSettings();

      case "teachers-staff":
        return (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm">
            <TeachersView />
          </div>
        );

      case "subject-allocation":
        return renderSubjectAllocation();

      case "student-management":
        return renderStudentManagement();

      case "student-behaviour":
        return (
          <div className="space-y-4">
            {renderStudentManagement("discipline")}
          </div>
        );

      case "admissions":
        return renderStudentManagement();

      case "curriculum":
        return renderAcademicOperations();

      case "lesson-library":
        return <AILessonNotesView userSession={userSession} />;

      case "ai-lesson-library":
        return <AILessonNotesView userSession={userSession} />;

      case "examinations":
        return <AIExamGeneratorView />;

      case "reports":
        return renderReportsAnalytics();

      case "finance":
        return <FinanceView />;

      case "communication":
        return <CommunicationView userRole={currentRole} userSession={userSession} isTeacherView={false} />;

      case "subscription":
        return <SubscriptionView currentRole={currentRole as UserRole} userSession={userSession} />;

      case "roles-permissions":
        return <SettingsView initialTab="roles" currentRole={currentRole as UserRole} userSession={userSession} />;

      case "audit-logs":
        return <SettingsView initialTab="audit-logs" currentRole={currentRole as UserRole} userSession={userSession} />;

      case "system-settings":
        return <SettingsView initialTab="general" currentRole={currentRole as UserRole} userSession={userSession} />;

      default:
        return renderDashboard();
    }
  };

  // === Render helpers for sections with existing content ===

  function renderStudentManagement(overrideSubTab?: string) {
    const activeSub = overrideSubTab || studentSubTab;

    return (
      <div className="space-y-6">
        {/* Sub-navigation bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
          {[
            { id: "directory", label: "Student Directory", icon: Users },
            { id: "admission", label: "Student Admission", icon: UserPlus },
            { id: "profiles", label: "Profiles & Parent Contact", icon: User },
            { id: "academic-records", label: "Academic Records & CA", icon: Award },
            { id: "attendance", label: "Daily Attendance", icon: CheckCircle2 },
            { id: "promotion", label: "Student Promotion", icon: GraduationCap },
            { id: "report-cards", label: "Report Cards & Remarks", icon: FileText },
            { id: "discipline", label: "Behaviour & Discipline", icon: ShieldAlert }
          ].map((sub) => {
            const Icon = sub.icon;
            const isActive = activeSub === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  setStudentSubTab(sub.id as any);
                  if (activeSection === "student-behaviour" && sub.id !== "discipline") {
                    setActiveSection("student-management");
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                {sub.label}
              </button>
            );
          })}
        </div>

        {/* SUB-TAB: STUDENT DIRECTORY */}
        {activeSub === "directory" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Student Directory</h2>
                <p className="text-xs text-slate-500">Search and view all enrolled students for {schoolName}.</p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student or admission no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Admission No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Parent Name & Contact</th>
                    <th className="p-3">GPA</th>
                    <th className="p-3">Attendance</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st, idx) => (
                    <tr key={st?.id || idx} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-emerald-700">{st?.admissionNo}</td>
                      <td className="p-3 font-bold text-slate-900">{st?.name}</td>
                      <td className="p-3 font-semibold text-slate-700">{st.class}</td>
                      <td className="p-3 text-slate-600">{st.gender}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{st.parentName}</div>
                        <div className="text-[10px] text-slate-500">{st.phone}</div>
                      </td>
                      <td className="p-3 font-bold text-emerald-800 font-mono">{st.gpa || "3.85"}</td>
                      <td className="p-3 font-bold text-teal-700 font-mono">{st.attendanceRate || "98%"}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudentDetail(st);
                            setStudentSubTab("profiles");
                          }}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-TAB: STUDENT ADMISSION */}
        {studentSubTab === "admission" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Student Admission & Registration</h2>
                <p className="text-xs text-slate-500">Register new students into school classes with parent contact setup.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" /> Admission Officer Access
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700">Student Full Name *</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Adebayo Blessing"
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Gender *</label>
                <select value={newStudentGender} onChange={(e) => setNewStudentGender(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700">Assigned Class *</label>
                <select value={newStudentClass} onChange={(e) => setNewStudentClass(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold">
                  <option value="JSS 1">JSS 1</option>
                  <option value="JSS 2">JSS 2</option>
                  <option value="JSS 3">JSS 3</option>
                  <option value="SS 1">SS 1</option>
                  <option value="SS 2">SS 2</option>
                  <option value="SS 3">SS 3</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700">Parent / Guardian Full Name</label>
                <input type="text" value={newStudentParent} onChange={(e) => setNewStudentParent(e.target.value)} placeholder="e.g. Chief Adebayo Samuel" className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900" />
              </div>
              <div>
                <label className="font-bold text-slate-700">Parent Phone Number</label>
                <input type="text" value={newStudentPhone} onChange={(e) => setNewStudentPhone(e.target.value)} placeholder="+234 803 999 0000" className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono" />
              </div>
              <div>
                <label className="font-bold text-slate-700">Parent Email Address</label>
                <input type="email" value={newStudentEmail} onChange={(e) => setNewStudentEmail(e.target.value)} placeholder="adebayo@gmail.com" className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900" />
              </div>
            </div>

            <button
              onClick={handleAddStudentAdmission}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Complete Student Admission
            </button>
          </div>
        )}

        {/* SUB-TAB: PROFILES & PARENT CONTACT */}
        {studentSubTab === "profiles" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">Student Profiles & Guardian Contact Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((st, idx) => (
                <div key={st?.id || idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      {st.admissionNo}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {st.class}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{st?.name}</h3>
                    <p className="text-xs text-slate-500">Gender: {st?.gender} • Status: Active Enrolled</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-600" /> Parent: {st?.parentName}
                    </div>
                    <div className="text-slate-600 flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> {st?.phone}
                    </div>
                    <div className="text-slate-600 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" /> {st?.email}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => showToast(`Contacting guardian of ${st?.name || "Student"}...`)}
                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Contact Parent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB: PROMOTION */}
        {studentSubTab === "promotion" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Student Academic Promotion Engine</h2>
                <p className="text-xs text-slate-500">Review class promotion list. Promotion finalization requires Principal or Admin sign-off.</p>
              </div>
              {isPrincipalOrAdmin ? (
                <span className="px-3 py-1 bg-purple-100 text-purple-900 text-xs font-bold rounded-full border border-purple-300">
                  👑 Principal Approval Override Active
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full border border-amber-300">
                  🔒 Teacher Recommendation Mode (Requires Principal Approval)
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold">
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Current Class</th>
                    <th className="p-3">Target Class</th>
                    <th className="p-3">Cumulative GPA</th>
                    <th className="p-3">Promotion Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {promotionsList.map((prom, idx) => (
                    <tr key={prom?.id || idx}>
                      <td className="p-3 font-mono font-bold text-emerald-700">{prom?.id}</td>
                      <td className="p-3 font-bold text-slate-900">{prom?.name}</td>
                      <td className="p-3 text-slate-600">{prom?.currentClass}</td>
                      <td className="p-3 font-bold text-purple-700">{prom?.nextClass}</td>
                      <td className="p-3 font-mono font-bold text-emerald-800">{prom?.gpa}</td>
                      <td className="p-3 font-bold">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          (prom?.status || "").includes("Approved")
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}>
                          {prom?.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => prom?.id && togglePromotionStatus(prom.id)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
                        >
                          Toggle Approval
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-TAB: DISCIPLINE */}
        {activeSub === "discipline" && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Student Behaviour & Discipline Remarks</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Log commendations, disciplinary observations, and conduct notes.</p>
              </div>
              <div className="flex items-center gap-2">
                {disciplineLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDisciplineLogs([]);
                      showToast("All behaviour records cleared!");
                    }}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Records
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const targetStudent = (students && students.length > 0) ? students[0] : null;
                    setDisciplineLogs((prev) => [
                      {
                        id: `DISC-${Date.now()}`,
                        studentName: targetStudent ? targetStudent.name : "Enrolled Student",
                        class: targetStudent ? targetStudent.class : "General",
                        type: "Commendation",
                        note: "Exhibits excellent leadership and academic discipline in class.",
                        date: new Date().toISOString().split("T")[0],
                        teacher: userSession?.name || "Teacher"
                      },
                      ...prev
                    ]);
                    showToast("New behaviour record logged!");
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Log Behaviour Note
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {disciplineLogs.map((log, idx) => (
                <div key={log?.id || idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                      <span>{log?.studentName}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">({log?.class})</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${(log?.type || "").includes("Commendation") ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"}`}>
                        {log?.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{log?.note}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs text-slate-400 font-mono">
                      <div>{log?.date}</div>
                      <div className="text-[10px] text-slate-500">{log?.teacher}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDisciplineLogs((prev) => prev.filter((l) => l?.id !== log?.id));
                        showToast("Behaviour record deleted!");
                      }}
                      title="Delete record"
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
              {disciplineLogs.length === 0 && (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No behaviour records logged yet.</p>
                  <p>Click "Log Behaviour Note" above to record official observations.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUB-TAB: ATTENDANCE */}
        {activeSub === "attendance" && (
          <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <AttendanceTrackerView />
          </div>
        )}

        {/* SUB-TAB: ACADEMIC RECORDS & REPORT CARDS */}
        {(activeSub === "academic-records" || activeSub === "report-cards") && (
          <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <AIResultCompilationModule userRole={currentRole} schoolName={schoolName} defaultClass="JSS 1" />
          </div>
        )}
      </div>
    );
  }

  // === SECONDARY SCHOOL SUBJECT ALLOCATION & APPOINTMENT MATRIX ===
  function renderSubjectAllocation() {
    const SECONDARY_CLASSES = ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"];

    const SECONDARY_SUBJECT_CATALOG = [
      // Science & Mathematics
      { name: "Mathematics", dept: "Science & Mathematics", level: "All Secondary", tagColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
      { name: "Further Mathematics", dept: "Science & Mathematics", level: "Senior Secondary", tagColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
      { name: "Physics", dept: "Science & Mathematics", level: "Senior Secondary", tagColor: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
      { name: "Chemistry", dept: "Science & Mathematics", level: "Senior Secondary", tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { name: "Biology", dept: "Science & Mathematics", level: "Senior Secondary", tagColor: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
      { name: "Agricultural Science", dept: "Science & Mathematics", level: "All Secondary", tagColor: "bg-green-500/20 text-green-300 border-green-500/30" },
      { name: "Computer Studies / ICT", dept: "Science & Mathematics", level: "All Secondary", tagColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
      { name: "Physical & Health Education (PHE)", dept: "Science & Mathematics", level: "All Secondary", tagColor: "bg-sky-500/20 text-sky-300 border-sky-500/30" },

      // Arts & Humanities
      { name: "English Language", dept: "Arts & Humanities", level: "All Secondary", tagColor: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
      { name: "Literature in English", dept: "Arts & Humanities", level: "Senior Secondary", tagColor: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30" },
      { name: "Government", dept: "Arts & Humanities", level: "Senior Secondary", tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      { name: "Civic Education", dept: "Arts & Humanities", level: "All Secondary", tagColor: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
      { name: "Christian Religious Studies (CRS)", dept: "Arts & Humanities", level: "All Secondary", tagColor: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
      { name: "Islamic Religious Studies (IRS)", dept: "Arts & Humanities", level: "All Secondary", tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { name: "History", dept: "Arts & Humanities", level: "All Secondary", tagColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
      { name: "French Language", dept: "Arts & Humanities", level: "All Secondary", tagColor: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
      { name: "Yoruba Language", dept: "Arts & Humanities", level: "All Secondary", tagColor: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
      { name: "Igbo Language", dept: "Arts & Humanities", level: "All Secondary", tagColor: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
      { name: "Hausa Language", dept: "Arts & Humanities", level: "All Secondary", tagColor: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
      { name: "Cultural & Creative Arts (CCA)", dept: "Arts & Humanities", level: "Junior Secondary", tagColor: "bg-pink-500/20 text-pink-300 border-pink-500/30" },

      // Commercial & Business
      { name: "Economics", dept: "Commercial & Business", level: "Senior Secondary", tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      { name: "Commerce", dept: "Commercial & Business", level: "Senior Secondary", tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      { name: "Financial Accounting", dept: "Commercial & Business", level: "Senior Secondary", tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { name: "Business Studies", dept: "Commercial & Business", level: "Junior Secondary", tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      { name: "Office Practice", dept: "Commercial & Business", level: "Senior Secondary", tagColor: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
      { name: "Marketing", dept: "Commercial & Business", level: "Senior Secondary", tagColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },

      // Vocational & Technical Trades
      { name: "Data Processing", dept: "Vocational & Trade", level: "Senior Secondary", tagColor: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
      { name: "Technical Drawing", dept: "Vocational & Trade", level: "Senior Secondary", tagColor: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
      { name: "Basic Science", dept: "Vocational & Trade", level: "Junior Secondary", tagColor: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
      { name: "Basic Technology", dept: "Vocational & Trade", level: "Junior Secondary", tagColor: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { name: "Animal Husbandry", dept: "Vocational & Trade", level: "Senior Secondary", tagColor: "bg-lime-500/20 text-lime-300 border-lime-500/30" },
      { name: "Fisheries", dept: "Vocational & Trade", level: "Senior Secondary", tagColor: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
      { name: "Catering Craft Practice", dept: "Vocational & Trade", level: "Senior Secondary", tagColor: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
      { name: "Garment Making", dept: "Vocational & Trade", level: "Senior Secondary", tagColor: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30" },
      { name: "Electrical Installation", dept: "Vocational & Trade", level: "Senior Secondary", tagColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
      { name: "Home Economics", dept: "Vocational & Trade", level: "Junior Secondary", tagColor: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
    ];

    const SUBJECT_PRESET_BUNDLES = [
      { name: "STEM Trio", subjects: ["Mathematics", "Further Mathematics", "Physics"], desc: "Senior Science & Tech" },
      { name: "Pure Sciences", subjects: ["Chemistry", "Biology", "Agricultural Science"], desc: "Medical & Life Science" },
      { name: "Commercial Core", subjects: ["Economics", "Commerce", "Financial Accounting"], desc: "Business & Accounts" },
      { name: "Arts & Humanities", subjects: ["English Language", "Literature in English", "Government"], desc: "Senior Humanities" },
      { name: "Junior Science & Tech", subjects: ["Basic Science", "Basic Technology", "Computer Studies / ICT"], desc: "JSS 1 - JSS 3" },
      { name: "Core Compulsory", subjects: ["English Language", "Mathematics", "Civic Education"], desc: "General Curriculum" },
    ];

    const teachersList = (liveTeachers && liveTeachers.length > 0)
      ? liveTeachers.map((t: any) => {
          const subs = (t?.assignedSubjects && Array.isArray(t.assignedSubjects) && t.assignedSubjects.length > 0)
            ? t.assignedSubjects
            : (t?.subjectSpecialization ? t.subjectSpecialization.split(",").map((s: string) => s.trim()).filter(Boolean) : ["Mathematics", "Further Mathematics"]);
          const classes = (t?.assignedClasses && Array.isArray(t.assignedClasses) && t.assignedClasses.length > 0)
            ? t.assignedClasses
            : (t?.assignedClass ? [t.assignedClass] : ["JSS 1", "SS 1"]);
          return {
            ...t,
            name: t.name || t.fullName || "Teacher",
            assignedSubjects: subs,
            assignedClasses: classes,
          };
        })
      : [];

    // Filter teachers by search, class and department
    const filteredTeachers = teachersList.filter((t: any) => {
      const nameMatch = (t.name || "").toLowerCase().includes(allocationSearchQuery.toLowerCase()) ||
        (t.staffId || "").toLowerCase().includes(allocationSearchQuery.toLowerCase()) ||
        t.assignedSubjects.some((s: string) => s.toLowerCase().includes(allocationSearchQuery.toLowerCase()));
      const classMatch = allocationClassFilter === "All Classes" ||
        (t.assignedClasses || []).some((c: string) => c.toLowerCase().includes(allocationClassFilter.toLowerCase())) ||
        (t.assignedClass || "").toLowerCase().includes(allocationClassFilter.toLowerCase());
      const deptMatch = allocationDeptFilter === "All Departments" ||
        t.assignedSubjects.some((s: string) => {
          const item = SECONDARY_SUBJECT_CATALOG.find((cat) => cat.name.toLowerCase() === s.toLowerCase());
          return item && item.dept === allocationDeptFilter;
        });
      return nameMatch && classMatch && deptMatch;
    });

    // Subject coverage mapping: which teachers are appointed to each subject
    const subjectCoverage = SECONDARY_SUBJECT_CATALOG.map((sub) => {
      const appointed = teachersList.filter((t: any) =>
        t.assignedSubjects.some((s: string) => s.toLowerCase() === sub.name.toLowerCase())
      );
      return {
        ...sub,
        appointedTeachers: appointed,
        isCovered: appointed.length > 0,
      };
    });

    const totalCoveredCount = subjectCoverage.filter((s) => s.isCovered).length;
    const multiAppointedCount = teachersList.filter((t: any) => (t.assignedSubjects || []).length > 1).length;

    const openAppointModal = (teacher: any) => {
      setAppointingTeacher(teacher);
      setAppointedSubjectsList([...teacher.assignedSubjects]);
      setAssignedClassesForSubjects(teacher.assignedClasses || ["JSS 1", "JSS 2", "SS 1"]);
      setCustomSubjectToAdd("");
      setAppointmentModalDeptTab("All");
    };

    const toggleSubjectInModal = (subName: string) => {
      setAppointedSubjectsList((prev) =>
        prev.includes(subName) ? prev.filter((s) => s !== subName) : [...prev, subName]
      );
    };

    const applyPresetBundle = (bundleSubs: string[]) => {
      const merged = Array.from(new Set([...appointedSubjectsList, ...bundleSubs]));
      setAppointedSubjectsList(merged);
    };

    const handleAddCustomSubject = () => {
      const clean = customSubjectToAdd.trim();
      if (clean && !appointedSubjectsList.includes(clean)) {
        setAppointedSubjectsList([...appointedSubjectsList, clean]);
        setCustomSubjectToAdd("");
      }
    };

    const toggleClassInModal = (cls: string) => {
      setAssignedClassesForSubjects((prev) =>
        prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
      );
    };

    const handleSaveAppointment = async () => {
      if (!appointingTeacher?.id) return;
      setIsSavingSubjectAppointment(true);
      const finalSubs = appointedSubjectsList.length > 0 ? appointedSubjectsList : ["General Secondary Subjects"];
      const finalClasses = assignedClassesForSubjects.length > 0 ? assignedClassesForSubjects : ["JSS 1"];
      const mergedSpec = finalSubs.join(", ");

      try {
        await fetch(`/api/teachers/${appointingTeacher.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...appointingTeacher,
            assignedSubjects: finalSubs,
            subjectSpecialization: mergedSpec,
            assignedClasses: finalClasses,
            assignedClass: finalClasses[0],
          }),
        });
        notifyDataChanged(["teachers"]);
        showToast(`✓ Successfully appointed ${finalSubs.length} subject(s) to ${appointingTeacher.name}!`);
        setAppointingTeacher(null);
      } catch (err) {
        showToast("Error updating teacher subject appointment.");
      } finally {
        setIsSavingSubjectAppointment(false);
      }
    };

    const handleQuickRemoveSubject = async (teacher: any, subToRemove: string) => {
      const updated = (teacher.assignedSubjects || []).filter((s: string) => s !== subToRemove);
      const finalSubs = updated.length > 0 ? updated : ["General Secondary Subjects"];
      try {
        await fetch(`/api/teachers/${teacher.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...teacher,
            assignedSubjects: finalSubs,
            subjectSpecialization: finalSubs.join(", "),
          }),
        });
        notifyDataChanged(["teachers"]);
        showToast(`Removed ${subToRemove} from ${teacher.name}`);
      } catch (err) {
        showToast("Error updating subjects.");
      }
    };

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Secondary School Academic Administration
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  WAEC / NECO / NERDC Curriculum
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Multi-Subject Appointment Active
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Subject Allocation Matrix & Appointments
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Appoint more than one subject to teach per faculty member across Junior Secondary (JSS 1–3) and Senior Secondary (SS 1–3) divisions. Allocate cross-disciplinary loads (e.g. Mathematics + Further Maths + Physics), prevent curriculum gaps, and keep schedules synchronized.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {teachersList.length > 0 && (
                <button
                  type="button"
                  onClick={() => openAppointModal(teachersList[0])}
                  className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Appoint Subjects
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-800/40">
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-emerald-800/40">
              <span className="text-[11px] font-semibold text-slate-400">Appointed Faculty</span>
              <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{teachersList.length} Teachers</p>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-emerald-800/40">
              <span className="text-[11px] font-semibold text-slate-400">Multi-Subject Teachers</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{multiAppointedCount} Appointed (2+)</p>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-emerald-800/40">
              <span className="text-[11px] font-semibold text-slate-400">Secondary Subjects</span>
              <p className="text-xl sm:text-2xl font-black text-sky-400 mt-0.5">{SECONDARY_SUBJECT_CATALOG.length} Subjects</p>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-emerald-800/40">
              <span className="text-[11px] font-semibold text-slate-400">Curriculum Coverage</span>
              <p className="text-xl sm:text-2xl font-black text-purple-400 mt-0.5">{totalCoveredCount} / {SECONDARY_SUBJECT_CATALOG.length} Covered</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs & Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => setAllocationViewTab("roster")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                allocationViewTab === "roster"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Faculty Appointment Roster ({filteredTeachers.length})
            </button>
            <button
              type="button"
              onClick={() => setAllocationViewTab("matrix")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                allocationViewTab === "matrix"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Subject Coverage Matrix ({SECONDARY_SUBJECT_CATALOG.length})
            </button>
            <button
              type="button"
              onClick={() => setAllocationViewTab("schedule")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                allocationViewTab === "schedule"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Class Schedule (JSS 1 - SS 3)
            </button>
          </div>

          {/* Search & Department Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={allocationSearchQuery}
                onChange={(e) => setAllocationSearchQuery(e.target.value)}
                placeholder="Search teacher or subject..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={allocationClassFilter}
              onChange={(e) => setAllocationClassFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="All Classes">All Classes</option>
              {SECONDARY_CLASSES.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            <select
              value={allocationDeptFilter}
              onChange={(e) => setAllocationDeptFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="All Departments">All Departments</option>
              <option value="Science & Mathematics">Science & Mathematics</option>
              <option value="Arts & Humanities">Arts & Humanities</option>
              <option value="Commercial & Business">Commercial & Business</option>
              <option value="Vocational & Trade">Vocational & Trade</option>
            </select>
          </div>
        </div>

        {/* TAB 1: FACULTY APPOINTMENT ROSTER */}
        {allocationViewTab === "roster" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTeachers.map((teacher: any) => {
                const subCount = (teacher.assignedSubjects || []).length;
                return (
                  <div
                    key={teacher.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Teacher Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {teacher.name.charAt(0) || "T"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-white">{teacher.name}</h3>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-emerald-400 border border-emerald-500/20">
                                {subCount} Subject{subCount > 1 ? "s" : ""} Appointed
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              ID: <span className="font-mono text-slate-300">{teacher.staffId || teacher.id}</span> • Form Class: <strong className="text-white">{teacher.assignedClass || "SS 1"}</strong>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openAppointModal(teacher)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Edit className="w-3.5 h-3.5" /> Appoint Subjects
                        </button>
                      </div>

                      {/* Appointed Subjects Badges List */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                          <span>Appointed Teaching Subjects to Teach:</span>
                          <span className="text-emerald-400">{subCount} Assigned</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 min-h-[46px] items-center">
                          {teacher.assignedSubjects.map((sub: string, sIdx: number) => {
                            const cat = SECONDARY_SUBJECT_CATALOG.find((c) => c.name.toLowerCase() === sub.toLowerCase());
                            return (
                              <span
                                key={sIdx}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                                  cat?.tagColor || "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                }`}
                              >
                                <span>{sub}</span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickRemoveSubject(teacher, sub)}
                                  className="hover:text-rose-400 transition-colors cursor-pointer"
                                  title={`Remove ${sub}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          })}
                          {teacher.assignedSubjects.length === 0 && (
                            <span className="text-xs text-slate-500 italic">No subjects appointed yet. Click 'Appoint Subjects' to assign.</span>
                          )}
                        </div>
                      </div>

                      {/* Target Classes Covered */}
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                        <span>Target Secondary Classes:</span>
                        <div className="flex flex-wrap gap-1">
                          {(teacher.assignedClasses || [teacher.assignedClass || "JSS 1"]).map((c: string, cIdx: number) => (
                            <span key={cIdx} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Scheme & Timetable
                      </span>
                      <span>Estimated Workload: ~{subCount * 6} periods/wk</span>
                    </div>
                  </div>
                );
              })}

              {filteredTeachers.length === 0 && (
                <div className="col-span-2 text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-base">No teachers match this filter</h3>
                  <p className="text-xs text-slate-400">Try adjusting your search query, class level, or department filter.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SUBJECT COVERAGE MATRIX */}
        {allocationViewTab === "matrix" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectCoverage.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between space-y-3 ${
                    item.isCovered ? "border-slate-800" : "border-amber-500/40 bg-amber-950/10"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.tagColor}`}>
                            {item.dept}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {item.level}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white">{item.name}</h4>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.isCovered ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {item.isCovered ? `${item.appointedTeachers.length} Appointed` : "Unassigned"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <span className="text-[11px] text-slate-400 font-semibold block">Appointed Teacher(s):</span>
                      <div className="space-y-1.5">
                        {item.appointedTeachers.map((t: any) => (
                          <div key={t.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200">
                            <span className="font-semibold text-white truncate max-w-[150px]">{t.name}</span>
                            <span className="text-[10px] text-emerald-400 font-mono">{t.assignedClass}</span>
                          </div>
                        ))}
                        {item.appointedTeachers.length === 0 && (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                            No teacher currently appointed to teach {item.name}.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                    {teachersList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => openAppointModal(teachersList[0])}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Appoint Teacher
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CLASS SCHEDULE BREAKDOWN */}
        {allocationViewTab === "schedule" && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div>
              <h3 className="font-bold text-base text-white">Class-by-Class Secondary Allocation Overview</h3>
              <p className="text-xs text-slate-400 mt-1">Cross-reference which teachers cover core disciplines across Junior & Senior Secondary classes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SECONDARY_CLASSES.map((cls) => {
                const classTeachers = teachersList.filter((t: any) =>
                  (t.assignedClasses || []).includes(cls) || t.assignedClass === cls
                );
                return (
                  <div key={cls} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-sm font-black text-white">{cls} Division</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                        {classTeachers.length} Faculty
                      </span>
                    </div>

                    <div className="space-y-2">
                      {classTeachers.map((t: any) => (
                        <div key={t.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{t.name}</span>
                            <span className="text-[10px] text-slate-400">{t.staffId}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(t.assignedSubjects || []).map((s: string, idx: number) => (
                              <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      {classTeachers.length === 0 && (
                        <p className="text-xs text-slate-500 italic py-2">No teachers explicitly linked to {cls}.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MULTI-SUBJECT APPOINTMENT MODAL (ALLOWS 1, 2, 3+ SUBJECTS) */}
        {/* ======================================================== */}
        {appointingTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
            <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                      Multi-Subject Appointment
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {appointingTeacher.staffId || appointingTeacher.id}</span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">Appoint Subjects to Teach: {appointingTeacher.name}</h3>
                  <p className="text-xs text-slate-400">Select multiple subjects to assign to this teacher. Click presets or individual subjects below.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAppointingTeacher(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Selection Badges */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">
                    Currently Selected Subjects ({appointedSubjectsList.length}):
                  </span>
                  <span className="text-emerald-400 text-[11px] font-semibold">
                    Can appoint multiple subjects
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 min-h-[48px] items-center">
                  {appointedSubjectsList.map((sub, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm"
                    >
                      <span>{sub}</span>
                      <button
                        type="button"
                        onClick={() => toggleSubjectInModal(sub)}
                        className="hover:bg-emerald-700 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {appointedSubjectsList.length === 0 && (
                    <span className="text-xs text-slate-500 italic">No subjects selected yet. Click any subject or bundle below.</span>
                  )}
                </div>
              </div>

              {/* 1-Click Preset Subject Bundles */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Quick Preset Bundles (Click to add to selection):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUBJECT_PRESET_BUNDLES.map((bundle, bIdx) => (
                    <button
                      key={bIdx}
                      type="button"
                      onClick={() => applyPresetBundle(bundle.subjects)}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-emerald-950/60 hover:border-emerald-500/40 border border-slate-700/80 text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-emerald-300">
                        <span>{bundle.name}</span>
                        <Plus className="w-3.5 h-3.5 text-emerald-400 opacity-60 group-hover:opacity-100" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">{bundle.subjects.join(", ")}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Catalog Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Secondary Subject Catalog (Click to toggle):
                  </span>
                  <div className="flex gap-1 text-[10px]">
                    {["All", "Science & Mathematics", "Arts & Humanities", "Commercial & Business", "Vocational & Trade"].map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setAppointmentModalDeptTab(dept)}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                          appointmentModalDeptTab === dept
                            ? "bg-emerald-500 text-slate-950 font-bold"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {dept === "All" ? "All" : dept.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar p-2 rounded-2xl bg-slate-950/80 border border-slate-800">
                  {SECONDARY_SUBJECT_CATALOG.filter((sub) =>
                    appointmentModalDeptTab === "All" || sub.dept === appointmentModalDeptTab
                  ).map((sub) => {
                    const isSelected = appointedSubjectsList.includes(sub.name);
                    return (
                      <button
                        key={sub.name}
                        type="button"
                        onClick={() => toggleSubjectInModal(sub.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60"
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 opacity-60" />}
                        <span>{sub.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Subject */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-300 block">Add Custom Subject:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSubjectToAdd}
                    onChange={(e) => setCustomSubjectToAdd(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomSubject();
                      }
                    }}
                    placeholder="e.g. Robotics & Coding, Technical Drawing..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSubject}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    + Add to List
                  </button>
                </div>
              </div>

              {/* Target Secondary Classes */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 block">
                  Secondary Classes Taught by this Teacher:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SECONDARY_CLASSES.map((cls) => {
                    const isSelected = assignedClassesForSubjects.includes(cls);
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => toggleClassInModal(cls)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-purple-600 text-white shadow-sm"
                            : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                        }`}
                      >
                        {cls}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAppointingTeacher(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAppointment}
                  disabled={isSavingSubjectAppointment}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSavingSubjectAppointment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving Appointments...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Appointed Subjects ({appointedSubjectsList.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderAcademicOperations(overrideSubTab?: string) {
    const activeSub = overrideSubTab || academicSubTab;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
          {[
            { id: "lesson-notes", label: "AI Lesson Notes", icon: BookOpen },
            { id: "scheme", label: "Scheme of Work", icon: Calendar },
            { id: "assignments", label: "Homework & Assignments", icon: FileText },
            { id: "exam-generator", label: "AI Exam Generator", icon: GraduationCap },
            { id: "question-bank", label: "Question Bank", icon: FolderOpen },
            { id: "cbt", label: "CBT Management", icon: Cpu },
            { id: "marking", label: "Marking & Grading", icon: Award }
          ].map((sub) => {
            const Icon = sub.icon;
            const isActive = activeSub === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setAcademicSubTab(sub.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-slate-900 text-emerald-400 border border-slate-800 shadow"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                {sub.label}
              </button>
            );
          })}
        </div>

        {/* AI LESSON NOTES */}
        {activeSub === "lesson-notes" && (
          <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <AILessonNotesView userSession={userSession} />
          </div>
        )}

        {/* AI EXAM GENERATOR */}
        {activeSub === "exam-generator" && (
          <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <AIExamGeneratorView />
          </div>
        )}

        {/* SUB-TAB: QUESTION BANK */}
        {activeSub === "question-bank" && (
          <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <QuestionBankView />
          </div>
        )}

        {/* SUB-TAB: CBT MANAGEMENT */}
        {activeSub === "cbt" && (
          <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <AIExamGeneratorView />
          </div>
        )}

        {/* SUB-TAB: MARKING & GRADING */}
        {activeSub === "marking" && (
          <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <AIResultCompilationModule userRole={currentRole} schoolName={schoolName} defaultClass="JSS 1" />
          </div>
        )}

        {/* SUB-TAB: SCHEME OF WORK */}
        {activeSub === "scheme" && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  NERDC Standard Scheme of Work
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Approved national curriculum topics, weekly objectives, and instructional frameworks for {schoolName}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAcademicSubTab("lesson-notes")}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate AI Lesson Note</span>
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Class Level</label>
                <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-900 dark:text-white">
                  <option value="SS 2">SS 2 (Senior Secondary)</option>
                  <option value="SS 1">SS 1</option>
                  <option value="SS 3">SS 3</option>
                  <option value="JSS 1">JSS 1</option>
                  <option value="JSS 2">JSS 2</option>
                  <option value="JSS 3">JSS 3</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Subject</label>
                <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-900 dark:text-white">
                  <option value="English Language">English Language</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Economics">Economics</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Academic Term</label>
                <select className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-900 dark:text-white">
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>
            </div>

            {/* Scheme Table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                    <th className="p-3 w-16">Week</th>
                    <th className="p-3">Topic & Subtopic</th>
                    <th className="p-3">NERDC Reference</th>
                    <th className="p-3">Behavioral Objectives</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-emerald-600">Week 1</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">Reading Comprehension & Summary Writing Techniques</div>
                      <div className="text-[11px] text-slate-500">Skimming, scanning, intensive reading & summary sentence extraction</div>
                    </td>
                    <td className="p-3 text-[11px] font-mono text-slate-500">NERDC JSS1/SS2 Eng. Module 1.1</td>
                    <td className="p-3 text-[11px]">
                      1. Define Reading Comprehension as understanding author's intention.<br/>
                      2. Extract key summary sentences using complete, grammatically sound words.
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setAcademicSubTab("lesson-notes")}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow"
                      >
                        Create Lesson Note
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-emerald-600">Week 2</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">Nouns & Grammatical Functions</div>
                      <div className="text-[11px] text-slate-500">Proper, Common, Abstract, Collective, Countable & Uncountable Nouns</div>
                    </td>
                    <td className="p-3 text-[11px] font-mono text-slate-500">NERDC JSS1/SS2 Eng. Module 1.2</td>
                    <td className="p-3 text-[11px]">
                      1. Define a Noun as the name of a person, animal, place, or thing.<br/>
                      2. Classify and apply types of nouns in standard sentence structures.
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setAcademicSubTab("lesson-notes")}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow"
                      >
                        Create Lesson Note
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-emerald-600">Week 3</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">Quadratic Equations & Roots Analysis</div>
                      <td className="p-3 text-[11px] font-mono text-slate-500">NERDC SS2 Math Module 2.1</td>
                      <td className="p-3 text-[11px]">
                        1. State standard quadratic form ax² + bx + c = 0.<br/>
                        2. Solve quadratic equations by factorization, completing the square, and formula.
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setAcademicSubTab("lesson-notes")}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow"
                        >
                          Create Lesson Note
                        </button>
                      </td>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-TAB: HOMEWORK & ASSIGNMENTS */}
        {activeSub === "assignments" && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Homework & Continuous Assessments Manager
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Create, publish, and grade take-home assignments for {schoolName} students.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("Assignment creation form ready. Enter title, target class, instructions, and click Publish to Student Portal.")}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Assignment</span>
              </button>
            </div>

            {/* Assignments List */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-slate-800/80 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold uppercase">SS 2</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">English Language</span>
                    <span className="text-[10px] text-slate-500 font-mono">10 Marks • Due Next Monday</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Summary Writing & Comprehension Drill</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">Read passage on Page 24 of textbook and write 3 summary sentences in complete words.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Published to Portal
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold uppercase">JSS 1</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Mathematics</span>
                    <span className="text-[10px] text-slate-500 font-mono">15 Marks • Due Friday</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Algebraic Equations & Problem Solving</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">Solve exercise questions 1-10 in General Mathematics Workbook 1.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Published to Portal
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderReportsAnalytics() {
    return (
      <div className="space-y-6">
        <AIResultCompilationModule userRole={currentRole} schoolName={schoolName} defaultClass="JSS 1" />
      </div>
    );
  }

  function renderFinance() {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-100 border border-white/20">
              <Wallet className="w-3.5 h-3.5" /> Bursary & Fee Ledger
            </span>
            <h2 className="text-2xl font-extrabold">School Fee Structure Manager</h2>
            <p className="text-emerald-100 text-sm">
              Enter fee items and post them to the student fee ledger. Students see the updated invoice instantly.
            </p>
            {feeInvoiceSummary && (
              <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/20">{feeInvoiceSummary.id}</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/20">{feeInvoiceSummary.term}</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/20">{feeInvoiceSummary.studentName} • {feeInvoiceSummary.class}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div><h3 className="font-extrabold text-slate-900 text-base">Fee Items</h3><p className="text-xs text-slate-500">Each item below appears as a line on the student fee invoice.</p></div>
            <button onClick={addFeeItem} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Fee Item</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead><tr className="bg-slate-100 text-slate-700 font-bold">
                <th className="p-2.5">S/N</th><th className="p-2.5">Description</th><th className="p-2.5 w-40">Amount (₦)</th><th className="p-2.5 w-16"></th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {feeItems.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-2.5">
                      <input type="text" value={it.description} onChange={(e) => updateFeeItem(idx, "description", e.target.value)} placeholder="e.g. School Fee" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </td>
                    <td className="p-2.5">
                      <input type="number" min="0" value={it.amount} onChange={(e) => updateFeeItem(idx, "amount", e.target.value)} placeholder="0" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </td>
                    <td className="p-2.5 text-right">
                      <button onClick={() => removeFeeItem(idx)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors" title="Remove item"><X className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {!feeItems.length && (
                  <tr><td colSpan={4} className="p-6 text-center text-slate-400 text-xs">No fee items yet. Click "Add Fee Item" to begin.</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-50 font-bold text-slate-900">
                  <td className="p-2.5" colSpan={2}>Total Fees per Term</td>
                  <td className="p-2.5 font-mono text-emerald-700">₦{feeItems.reduce((sum, it) => sum + (Math.max(0, Number(it.amount) || 0)), 0).toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">Posting overwrites the current invoice items and resets payments on the student ledger.</p>
            <button onClick={handlePostFees} disabled={feeSaving} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2">
              {feeSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {feeSaving ? "Posting to Student Portal..." : "Post to Student Portal"}
            </button>
          </div>
        </div>

        {/* Payment Accounts Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" /> Payment Accounts
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Add your school's bank accounts so students can pay fees directly.</p>
            </div>
            <button
              onClick={() => setPaymentAccounts([
                ...paymentAccounts,
                { id: `PAY-${Date.now()}`, bankName: "", accountName: "", accountNumber: "", sortCode: "", accountType: "Current", isDefault: false, isActive: true }
              ])}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Account
            </button>
          </div>

          <div className="p-6 space-y-4">
            {paymentAccounts.length === 0 && (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">No payment accounts added yet.</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add Account" to enter your school's bank details for fee collection.</p>
              </div>
            )}

            {paymentAccounts.map((acct, idx) => (
              <div key={acct?.id || idx} className={`p-5 rounded-2xl border transition-all ${acct?.isDefault ? "border-emerald-300 bg-emerald-50/50 shadow-sm" : "border-slate-200 bg-white"}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {acct?.isDefault && (
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase">Default</span>
                    )}
                    <span className="text-xs font-mono text-slate-400">{acct?.id}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!acct.isDefault && (
                      <button
                        onClick={() => {
                          const updated = paymentAccounts.map((a, i) => ({ ...a, isDefault: i === idx }));
                          setPaymentAccounts(updated);
                          showToast("Default payment account updated!");
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => setPaymentAccounts(paymentAccounts.filter((_, i) => i !== idx))}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bank Name</label>
                    <select
                      value={acct.bankName}
                      onChange={(e) => {
                        const updated = [...paymentAccounts];
                        updated[idx] = { ...updated[idx], bankName: e.target.value };
                        setPaymentAccounts(updated);
                      }}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Bank</option>
                      <option>Access Bank</option>
                      <option>Ecobank Nigeria</option>
                      <option>Fidelity Bank</option>
                      <option>First Bank of Nigeria</option>
                      <option>First City Monument Bank</option>
                      <option>Guaranty Trust Bank</option>
                      <option>Key Stone Bank</option>
                      <option>Kuda Bank</option>
                      <option>Polaris Bank</option>
                      <option>Providus Bank</option>
                      <option>Stanbic IBTC Bank</option>
                      <option>Standard Chartered Bank</option>
                      <option>Sterling Bank</option>
                      <option>Union Bank</option>
                      <option>United Bank for Africa</option>
                      <option>Unity Bank</option>
                      <option>VBank</option>
                      <option>Wema Bank</option>
                      <option>Zenith Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account Name</label>
                    <input
                      type="text"
                      value={acct.accountName}
                      onChange={(e) => {
                        const updated = [...paymentAccounts];
                        updated[idx] = { ...updated[idx], accountName: e.target.value };
                        setPaymentAccounts(updated);
                      }}
                      placeholder="e.g. Livingstone International Academy"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account Number</label>
                    <input
                      type="text"
                      value={acct.accountNumber}
                      onChange={(e) => {
                        const updated = [...paymentAccounts];
                        updated[idx] = { ...updated[idx], accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10) };
                        setPaymentAccounts(updated);
                      }}
                      placeholder="0123456789"
                      maxLength={10}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-white border border-slate-200 text-slate-900 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sort Code</label>
                    <input
                      type="text"
                      value={acct.sortCode}
                      onChange={(e) => {
                        const updated = [...paymentAccounts];
                        updated[idx] = { ...updated[idx], sortCode: e.target.value };
                        setPaymentAccounts(updated);
                      }}
                      placeholder="000"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account Type</label>
                    <select
                      value={acct.accountType}
                      onChange={(e) => {
                        const updated = [...paymentAccounts];
                        updated[idx] = { ...updated[idx], accountType: e.target.value };
                        setPaymentAccounts(updated);
                      }}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option>Current</option>
                      <option>Savings</option>
                      <option>Domiciliary</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {paymentAccounts.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  showToast("Payment accounts saved! Students will see these details when paying fees.");
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Payment Accounts
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderAiTools(overrideSubTab?: string) {
    const activeSub = overrideSubTab || aiSubTab;
    const aiTabs = [
      { id: "planner", label: "AI Planner", icon: Calendar },
      { id: "exam-gen", label: "Exam Generator", icon: GraduationCap },
      { id: "question-gen", label: "Question Generator", icon: HelpCircle },
      { id: "marking-assistant", label: "Marking Assistant", icon: Award },
      { id: "insights", label: "Analytics Insights", icon: PieChart },
      { id: "copilot", label: "Co-Pilot Chat", icon: Brain }
    ];

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">LIVINGSTONEEDU AI Assistant</h2>
            <p className="text-xs text-slate-500">AI Lesson Planner, Question Generator, Marking Assistant & Co-Pilot.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none mb-4">
          {aiTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSub === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAiSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-slate-900 text-amber-400 border border-slate-800 shadow"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeSub === "copilot" && (
          <>
            <div className="h-96 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              {aiChatLogs.map((chat, idx) => (
                <div key={idx} className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                    chat.sender === "user"
                      ? "bg-emerald-600 text-white font-medium shadow-sm"
                      : "bg-white text-slate-800 border border-slate-200 shadow-sm"
                  }`}>
                    {chat.text}
                  </div>
                </div>
              ))}
              {isAiReplying && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl p-3 text-xs flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-500" /> sSolutAI AI Assistant is drafting response...
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendAiMessage()}
                placeholder="Ask anything..."
                className="flex-1 bg-slate-100 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              />
              <button onClick={handleSendAiMessage} className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2">
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
          </>
        )}

        {activeSub !== "copilot" && (
          <div className="text-center py-12 text-slate-400">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">The {(aiTabs || []).find((t) => t?.id === activeSub)?.label || "AI"} module is being prepared for your school.</p>
          </div>
        )}
      </div>
    );
  }

  const renderDashboard = renderSectionContent;

  interface SchoolNavItem {
    id: SchoolPortalSection;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }

  const schoolNavItems: { group: string; items: SchoolNavItem[] }[] = [
    {
      group: "Core Management",
      items: [
        {
          id: "school-profile" as SchoolPortalSection,
          label: "Manage School",
          icon: School,
          badge: "Settings",
        },
        {
          id: "teachers-staff" as SchoolPortalSection,
          label: "Manage Teachers",
          icon: UserCheck,
          badge: `${liveTeachers?.length || 14}`,
        },
        {
          id: "subject-allocation" as SchoolPortalSection,
          label: "Subject Allocation Matrix",
          icon: BookOpen,
          badge: "Multi-Subject",
        },
        {
          id: "student-management" as SchoolPortalSection,
          label: "Manage Students",
          icon: Users,
          badge: `${liveStudents?.length || 48}`,
        },
        {
          id: "student-behaviour" as SchoolPortalSection,
          label: "Students Behaviour",
          icon: ShieldAlert,
          badge: `${disciplineLogs.length}`,
        },
      ],
    },
    {
      group: "Academics & CBT",
      items: [
        {
          id: "dashboard" as SchoolPortalSection,
          label: "Dashboard Overview",
          icon: LayoutDashboard,
        },
        {
          id: "admissions" as SchoolPortalSection,
          label: "Admissions & Entry",
          icon: UserPlus,
        },
        {
          id: "curriculum" as SchoolPortalSection,
          label: "Curriculum & Notes",
          icon: BookOpen,
        },
        {
          id: "examinations" as SchoolPortalSection,
          label: "Exams & CBT",
          icon: Cpu,
        },
        {
          id: "reports" as SchoolPortalSection,
          label: "Report Cards",
          icon: FileSpreadsheet,
        },
      ],
    },
    {
      group: "School Administration",
      items: [
        {
          id: "finance" as SchoolPortalSection,
          label: "Finance & Fees",
          icon: PiggyBank,
        },
        {
          id: "communication" as SchoolPortalSection,
          label: "Announcements & AI",
          icon: MessageSquare,
        },
        {
          id: "system-settings" as SchoolPortalSection,
          label: "System Settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <div className="h-full bg-slate-950 text-slate-100 flex flex-col font-sans antialiased overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-emerald-400 border border-emerald-500/30 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* School Header Navigation */}
      <div className="flex items-center justify-between px-3 md:px-6 py-3 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white border-b border-emerald-700/60 w-full shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPortalSidebarCollapsed(!portalSidebarCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
            title={portalSidebarCollapsed ? "Expand School Sidebar" : "Collapse School Sidebar"}
          >
            {portalSidebarCollapsed ? <PanelLeft className="w-4 h-4 text-white" /> : <PanelLeftClose className="w-4 h-4 text-white" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
            title="Open School Menu"
          >
            <Menu className="w-4 h-4 text-white" />
          </button>
          <Logo variant="icon" size="md" />
          <div>
            <h1 className="text-base sm:text-lg font-black text-white truncate max-w-[180px] sm:max-w-none">{schoolName}</h1>
            <p className="text-[10px] sm:text-xs text-emerald-200">School Admin Panel • Session: 2026/2027</p>
          </div>
        </div>

        {/* Quick Top Switcher for School, Teachers, Students */}
        <div className="hidden lg:flex items-center gap-1.5 bg-black/25 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveSection("school-profile")}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === "school-profile"
                ? "bg-white text-emerald-900 shadow-sm"
                : "text-emerald-100 hover:text-white hover:bg-white/10"
            }`}
          >
            <School className="w-3.5 h-3.5" /> Manage School
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("teachers-staff")}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === "teachers-staff"
                ? "bg-white text-emerald-900 shadow-sm"
                : "text-emerald-100 hover:text-white hover:bg-white/10"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Manage Teachers
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("subject-allocation")}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === "subject-allocation"
                ? "bg-white text-emerald-900 shadow-sm"
                : "text-emerald-100 hover:text-white hover:bg-white/10"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Appoint Subjects
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("student-management")}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSection === "student-management"
                ? "bg-white text-emerald-900 shadow-sm"
                : "text-emerald-100 hover:text-white hover:bg-white/10"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Manage Students
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/10 border border-white/20 text-[11px] sm:text-xs font-semibold text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Role: </span>{currentRole}
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/10 border border-white/20 text-[11px] sm:text-xs font-semibold text-amber-300">
            <Bell className="w-3.5 h-3.5" /> <span className="hidden sm:inline">5 notices</span>
          </div>
          <button
            type="button"
            onClick={handleSchoolLogout}
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-500/50 text-[11px] sm:text-xs font-bold transition-all shadow-sm cursor-pointer ml-1"
            title="Sign Out of School Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Container with Sidebar + Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Desktop School Panel Sidebar with Emerald Theme */}
        <aside
          className={`${
            portalSidebarCollapsed ? "w-16" : "w-64"
          } shrink-0 bg-[#064e3b] dark:bg-[#032e23] border-r border-emerald-800/60 text-emerald-100 flex flex-col justify-between transition-all duration-300 select-none hidden md:flex`}
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
            {/* Quick Header in Sidebar */}
            <div className="flex items-center justify-between pb-2 border-b border-emerald-800/60">
              {!portalSidebarCollapsed ? (
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <School className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white truncate">School Management</span>
                </div>
              ) : (
                <div className="mx-auto">
                  <School className="w-4 h-4 text-emerald-300" />
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPortalSidebarCollapsed(!portalSidebarCollapsed);
                }}
                className={`p-1.5 rounded-lg text-white bg-white/15 hover:bg-white/25 transition-colors cursor-pointer ${
                  portalSidebarCollapsed ? "mx-auto" : "ml-auto"
                }`}
                title={portalSidebarCollapsed ? "Expand Sidebar" : "Close Sidebar"}
              >
                {portalSidebarCollapsed ? <PanelLeft className="w-4 h-4 text-white" /> : <PanelLeftClose className="w-4 h-4 text-white" />}
              </button>
            </div>

            {/* Sidebar Search */}
            {!portalSidebarCollapsed && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-emerald-300/70 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter school menu..."
                  value={portalSearchQuery}
                  onChange={(e) => setPortalSearchQuery(e.target.value)}
                  className="w-full bg-emerald-900/60 border border-emerald-700/60 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-emerald-300/60 outline-none focus:ring-1 focus:ring-emerald-400"
                />
                {portalSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setPortalSearchQuery("")}
                    className="absolute right-2 top-2 text-emerald-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Nav Groups */}
            {schoolNavItems.map((group) => {
              const visibleItems = group.items.filter((item) =>
                portalSearchQuery ? item.label.toLowerCase().includes(portalSearchQuery.toLowerCase()) : true
              );
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.group} className="space-y-1">
                  {!portalSidebarCollapsed && (
                    <div className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                      {group.group}
                    </div>
                  )}
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    const isCore = item.id === "school-profile" || item.id === "teachers-staff" || item.id === "student-management" || item.id === "student-behaviour";

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveSection(item.id);
                        }}
                        title={portalSidebarCollapsed ? item.label : undefined}
                        className={`w-full flex items-center ${
                          portalSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-2.5 py-2"
                        } rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-950/40"
                            : isCore
                            ? "hover:bg-emerald-800/60 text-emerald-100 bg-emerald-900/30"
                            : "hover:bg-emerald-800/60 text-emerald-200/90 hover:text-white"
                        }`}
                      >
                        <div className={`flex items-center ${portalSidebarCollapsed ? "justify-center" : "gap-2.5"} min-w-0`}>
                          <Icon className={`w-4 h-4 flex-shrink-0 ${
                            isActive
                              ? "text-white"
                              : item.id === "school-profile"
                              ? "text-emerald-300"
                              : item.id === "teachers-staff"
                              ? "text-teal-300"
                              : item.id === "student-management"
                              ? "text-cyan-300"
                              : item.id === "student-behaviour"
                              ? "text-amber-300"
                              : "text-emerald-200"
                          }`} />
                          {!portalSidebarCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </div>

                        {!portalSidebarCollapsed && item.badge && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-emerald-900/70 text-emerald-200 border border-emerald-700/50"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          {!portalSidebarCollapsed && (
            <div className="p-3 border-t border-emerald-800/60 text-[11px] text-emerald-300 bg-[#032e23]/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="truncate max-w-[130px] font-medium">{schoolName}</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
              <button
                type="button"
                onClick={handleSchoolLogout}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </aside>

        {/* Mobile School Panel Drawer with Emerald Theme */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] flex md:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(false);
              }}
            />
            <aside className="relative w-72 max-w-[85vw] bg-[#064e3b] dark:bg-[#032e23] border-r border-emerald-800/70 text-emerald-100 flex flex-col justify-between p-3 z-10 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-800/60 mb-3">
                <div className="flex items-center gap-2">
                  <School className="w-5 h-5 text-emerald-300" />
                  <span className="font-extrabold text-sm text-white">School Panel</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileMenuOpen(false);
                  }}
                  className="p-1.5 rounded-lg text-white bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {schoolNavItems.map((group) => (
                  <div key={group.group} className="space-y-1">
                    <div className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                      {group.group}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveSection(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-950/40"
                              : "hover:bg-emerald-800/60 text-emerald-100"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className={`w-4 h-4 flex-shrink-0 ${
                              isActive
                                ? "text-white"
                                : item.id === "school-profile"
                                ? "text-emerald-300"
                                : item.id === "teachers-staff"
                                ? "text-teal-300"
                                : item.id === "student-management"
                                ? "text-cyan-300"
                                : item.id === "student-behaviour"
                                ? "text-amber-300"
                                : "text-emerald-200"
                            }`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 font-bold border border-emerald-700/50">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Mobile Drawer Logout */}
              <div className="pt-3 mt-3 border-t border-emerald-800/60">
                <button
                  type="button"
                  onClick={handleSchoolLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Workspace Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 w-full min-w-0 max-w-full overflow-x-hidden bg-slate-900/60 dark:bg-slate-950 text-slate-100">
          {renderSectionContent()}
        </main>
      </div>
    </div>
  );
}
