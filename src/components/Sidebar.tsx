import React, { useState, useEffect } from "react";
import { ActiveTab, UserRole } from "../types";
import {
  LayoutDashboard,
  Globe,
  BookOpen,
  CalendarDays,
  Sparkles,
  FileSpreadsheet,
  Database,
  Award,
  CheckCircle2,
  GraduationCap,
  Users,
  Zap,
  CreditCard,
  Receipt,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Library,
  MessageSquare,
  Bell,
  Mail,
  Smartphone,
  Send,
  UserCheck,
  Bus,
  Home,
  Settings,
  Sliders,
  Layers,
  ShieldCheck,
  Key,
  Bot,
  Plug,
  PanelLeft,
  PanelLeftClose,
  LogOut,
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
  Palette,
  Wrench,
  HelpCircle,
  X,
  UserPlus,
  ArrowRightLeft,
  UserCheck2,
  Calendar,
  BarChart3,
  BookMarked,
  HardDriveDownload,
  PhoneCall,
  Briefcase,
  BadgeCheck,
  Trophy,
  UsersRound,
   Building2,
   School,
   MapPin,
   ClipboardList,
   FileBadge,
   Wallet,
} from "lucide-react";
import { ClearDataButton } from "./ClearDataButton";

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentRole: UserRole;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentRole,
  collapsed: externalCollapsed,
  onToggleCollapse,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Expandable accordions state with local storage persistence
  const [academicOpen, setAcademicOpen] = useState(() => {
    return localStorage.getItem("sb_academic_open") !== "false";
  });
  const [studentsOpen, setStudentsOpen] = useState(() => {
    return localStorage.getItem("sb_students_open") === "true";
  });
  const [teachersOpen, setTeachersOpen] = useState(() => {
    return localStorage.getItem("sb_teachers_open") === "true";
  });
  const [financeOpen, setFinanceOpen] = useState(() => {
    return localStorage.getItem("sb_finance_open") === "true";
  });
  const [libraryOpen, setLibraryOpen] = useState(() => {
    return localStorage.getItem("sb_library_open") === "true";
  });
  const [commOpen, setCommOpen] = useState(() => {
    return localStorage.getItem("sb_comm_open") === "true";
  });
  const [settingsOpen, setSettingsOpen] = useState(() => {
    return localStorage.getItem("sb_settings_open") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sb_academic_open", String(academicOpen));
  }, [academicOpen]);

  useEffect(() => {
    localStorage.setItem("sb_students_open", String(studentsOpen));
  }, [studentsOpen]);

  useEffect(() => {
    localStorage.setItem("sb_teachers_open", String(teachersOpen));
  }, [teachersOpen]);

  useEffect(() => {
    localStorage.setItem("sb_finance_open", String(financeOpen));
  }, [financeOpen]);

  useEffect(() => {
    localStorage.setItem("sb_library_open", String(libraryOpen));
  }, [libraryOpen]);

  useEffect(() => {
    localStorage.setItem("sb_comm_open", String(commOpen));
  }, [commOpen]);

  useEffect(() => {
    localStorage.setItem("sb_settings_open", String(settingsOpen));
  }, [settingsOpen]);

  // Allow controlled or uncontrolled collapse
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  // Active section highlights
  const isAcademicActive = activeTab.startsWith("academic-") || activeTab === "ai-lesson-notes" || activeTab === "ai-exam-generator" || activeTab === "question-bank" || activeTab === "report-cards";
  const isStudentsActive = activeTab === "students";
  const isTeachersActive = activeTab === "teachers" || activeTab === "teacher-portal" || activeTab === "school-portal";
  const isFinanceActive = activeTab.startsWith("finance") || activeTab === "finance-fees" || activeTab === "finance-payments";
  const isLibraryActive = activeTab === "library";
  const isCommActive = activeTab.startsWith("communication") || activeTab === "communication-announcements";
  const isSettingsActive = activeTab.startsWith("settings");

  // Admin role check: Administration is strictly accessible to logged-in administrators
  const isAdminUser =
    currentRole === "Super Administrator" ||
    currentRole === "School Administrator" ||
    currentRole === "Principal" ||
    currentRole === "Admin";
  const isSuperAdmin = currentRole === "Super Administrator" || currentRole === "Super Admin";
  const isStudentOrParent = currentRole === "Student" || currentRole === "Parent";
  const isTeacher = currentRole === "Teacher" || currentRole === "Class Teacher" || currentRole === "Subject Teacher";

  // Filter helper for search
  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const handleItemClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (onCloseMobile) onCloseMobile();
          }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden cursor-pointer"
        />
      )}

      <aside
        className={`${
          isMobileOpen
            ? "fixed inset-y-0 left-0 z-50 w-72 flex shadow-2xl"
            : `hidden md:flex ${isCollapsed ? "md:w-16" : "md:w-64"}`
        } shrink-0 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] border-r border-slate-800 flex-col justify-between p-3 select-none transition-all duration-300`}
      >
      <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-8rem)] pr-0.5 custom-scrollbar">
        {/* Header & Role Badge */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          {!isCollapsed && (
            <div className="flex items-center gap-1.5 px-1 overflow-hidden">
              <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 truncate">
                {currentRole || "Enterprise User"}
              </span>
            </div>
          )}
          {isMobileOpen ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onCloseMobile) onCloseMobile();
              }}
              title="Close Sidebar"
              className="p-1.5 rounded-lg text-white hover:text-white bg-white/10 hover:bg-white/20 transition-colors ml-auto cursor-pointer"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse();
              }}
              title={isCollapsed ? "Expand Menu" : "Collapse Menu"}
              className={`p-1.5 rounded-lg text-white hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer ${
                isCollapsed ? "mx-auto" : "ml-auto"
              }`}
              id="sidebar-collapse-btn"
            >
              {isCollapsed ? (
                <PanelLeft className="w-5 h-5 text-white" />
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-white">
                  <PanelLeftClose className="w-4 h-4 text-white" />
                  <span className="text-[11px] font-medium text-white">Collapse</span>
                </div>
              )}
            </button>
          )}
        </div>

        {/* Sidebar Search */}
        {!isCollapsed && (
          <div className="mb-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search all modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* 1. MAIN DASHBOARD */}
        {matchesSearch("Main Dashboard") && (
          <button
            onClick={() => onSelectTab("dashboard")}
            title={isCollapsed ? "Main Dashboard" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0" : "justify-between px-3"
            } py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "hover:bg-slate-800/80 text-slate-300"
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
              <LayoutDashboard className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              {!isCollapsed && <span>Main Dashboard</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase font-bold">
                HQ
              </span>
            )}
          </button>
        )}

        {/* SCHOOL PANEL (MANAGE SCHOOL) */}
        {!isStudentOrParent && (matchesSearch("School Panel") || matchesSearch("Manage School")) && (
          <button
            onClick={() => onSelectTab("school-portal")}
            title={isCollapsed ? "School Panel" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0" : "justify-between px-3"
            } py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "school-portal"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/30 font-bold"
                : "hover:bg-slate-800/80 text-slate-300"
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
              <School className="w-4 h-4 text-teal-400 flex-shrink-0" />
              {!isCollapsed && <span>School Panel</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 uppercase font-bold">
                Admin
              </span>
            )}
          </button>
        )}

        {/* 2. ACADEMIC PORTAL ACCORDION */}
        {!isStudentOrParent && (
          <div>
            <button
            onClick={() => {
              if (isCollapsed) {
                toggleCollapse();
                setAcademicOpen(true);
              } else {
                setAcademicOpen(!academicOpen);
              }
            }}
            title={isCollapsed ? "Academic Portal" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0" : "justify-between px-3"
            } py-2 rounded-lg text-xs font-semibold transition-all ${
              isAcademicActive
                ? "text-indigo-400 font-bold bg-slate-800/60"
                : "hover:bg-slate-800/80 text-slate-300"
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
              <BookOpen className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              {!isCollapsed && <span>Academic Portal</span>}
            </div>
            {!isCollapsed &&
              (academicOpen ? (
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              ))}
          </button>

          {(!isCollapsed && (academicOpen || !!searchQuery.trim())) && (
            <div className="ml-4 pl-2.5 border-l border-slate-800 mt-1 space-y-0.5">
              {matchesSearch("Curriculum & Syllabus") && (
                <button
                  onClick={() => onSelectTab("academic-curriculum")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "academic-curriculum"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5 text-teal-400" />
                  <span>Curriculum & Syllabus</span>
                </button>
              )}

              {!isStudentOrParent && matchesSearch("AI Lesson Notes") && (
                <button
                  onClick={() => onSelectTab("academic-ai-lesson-notes")}
                  className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                    activeTab === "academic-ai-lesson-notes" || activeTab === "ai-lesson-notes"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Lesson Notes</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 uppercase font-bold">
                    AI
                  </span>
                </button>
              )}

              {matchesSearch("Lesson Notes Repository") && (
                <button
                  onClick={() => onSelectTab("academic-lesson-notes")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "academic-lesson-notes"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Lesson Notes Repository</span>
                </button>
              )}

              {matchesSearch("Assignments & Homework") && (
                <button
                  onClick={() => onSelectTab("academic-assignments")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "academic-assignments"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                  <span>Assignments & Homework</span>
                </button>
              )}

              {!isStudentOrParent && matchesSearch("AI Exam Generator") && (
                <button
                  onClick={() => onSelectTab("academic-ai-exam-generator")}
                  className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                    activeTab === "academic-ai-exam-generator" || activeTab === "ai-exam-generator"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Exam Generator</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-400/20 text-indigo-300 uppercase font-bold">
                    AI
                  </span>
                </button>
              )}

              {matchesSearch("CBT Exam Bank") && (
                <button
                  onClick={() => onSelectTab("academic-question-bank")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "academic-question-bank" || activeTab === "question-bank"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-purple-400" />
                  <span>CBT Exam Bank</span>
                </button>
              )}

              {matchesSearch("Continuous Assessment") && (
                <button
                  onClick={() => onSelectTab("academic-report-cards")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "academic-report-cards"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-rose-400" />
                  <span>Continuous Assessment</span>
                </button>
              )}

              {matchesSearch("Report Card Engine") && (
                <button
                  onClick={() => onSelectTab("academic-report-cards")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "academic-report-cards"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Report Card Engine</span>
                </button>
              )}

              {matchesSearch("Attendance Log") && (
                <button
                  onClick={() => onSelectTab("academic-attendance")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "academic-attendance"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Attendance Log</span>
                </button>
              )}

              {matchesSearch("Attendance Tracker") && (
                <button
                  onClick={() => onSelectTab("attendance")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "attendance"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Attendance Tracker</span>
                </button>
              )}

              {matchesSearch("Entrance Exams") && (
                <button
                  onClick={() => onSelectTab("entrance-exams")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "entrance-exams"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileBadge className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Entrance Exams</span>
                </button>
              )}

              {matchesSearch("Gamified Learning") && (
                <button
                  onClick={() => onSelectTab("gamified-learning")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "gamified-learning"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gamified Learning</span>
                </button>
              )}
            </div>
          )}
        </div>
        )}

        {/* 3. STUDENTS ACCORDION */}
        {!isStudentOrParent && (
          <div>
            <button
              onClick={() => {
                if (isCollapsed) {
                  toggleCollapse();
                  setStudentsOpen(true);
                } else {
                  setStudentsOpen(!studentsOpen);
                }
              }}
              title={isCollapsed ? "Students" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center px-0" : "justify-between px-3"
              } py-2 rounded-lg text-xs font-semibold transition-all ${
                isStudentsActive
                  ? "text-indigo-400 font-bold bg-slate-800/60"
                  : "hover:bg-slate-800/80 text-slate-300"
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                <GraduationCap className="w-4 h-4 text-sky-400 flex-shrink-0" />
                {!isCollapsed && <span>Students</span>}
              </div>
              {!isCollapsed &&
                (studentsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                ))}
            </button>

            {(!isCollapsed && (studentsOpen || !!searchQuery.trim())) && (
              <div className="ml-4 pl-2.5 border-l border-slate-800 mt-1 space-y-0.5">
                {(matchesSearch("Manage Students") || matchesSearch("Student Directory")) && (
                  <button
                    onClick={() => onSelectTab("students")}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "students"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>Manage Students</span>
                  </button>
                )}

                {matchesSearch("Admission") && (
                  <button
                    onClick={() => onSelectTab("students")}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "students"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5 text-teal-400" />
                    <span>Admission & Enrollment</span>
                  </button>
                )}

                {matchesSearch("Student Profile") && (
                  <button
                    onClick={() => onSelectTab("students")}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "students"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <UserCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Student Profile</span>
                  </button>
                )}

                {matchesSearch("Promotion") && (
                  <button
                    onClick={() => onSelectTab("students")}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "students"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Class Promotion</span>
                  </button>
                )}

                {matchesSearch("Student Transfer") && (
                  <button
                    onClick={() => onSelectTab("students")}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "students"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                    <span>Student Transfer</span>
                  </button>
                )}

                {matchesSearch("Alumni") && (
                  <button
                    onClick={() => onSelectTab("students")}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "students"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    <span>Alumni Network</span>
                  </button>
                )}

                {matchesSearch("Student ID Cards") && (
                  <button
                    onClick={() => onSelectTab("id-cards")}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "id-cards"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <BadgeCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Student ID Cards</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. TEACHERS & STAFF ACCORDION */}
        {!isStudentOrParent && (
          <div>
            <button
              onClick={() => {
                if (isCollapsed) {
                  toggleCollapse();
                  setTeachersOpen(true);
                } else {
                  setTeachersOpen(!teachersOpen);
                }
              }}
              title={isCollapsed ? "Teachers & Staff" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center px-0" : "justify-between px-3"
              } py-2 rounded-lg text-xs font-semibold transition-all ${
                isTeachersActive
                  ? "text-indigo-400 font-bold bg-slate-800/60"
                  : "hover:bg-slate-800/80 text-slate-300"
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                <Users className="w-4 h-4 text-purple-400 flex-shrink-0" />
                {!isCollapsed && <span>Teachers & Staff</span>}
              </div>
              {!isCollapsed &&
                (teachersOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                ))}
            </button>

            {(!isCollapsed && (teachersOpen || !!searchQuery.trim())) && (
              <div className="ml-4 pl-2.5 border-l border-slate-800 mt-1 space-y-0.5">
                {(matchesSearch("Manage Teachers") || matchesSearch("Teachers Directory")) && (
                  <button
                    onClick={() => onSelectTab("teachers")}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "teachers"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Manage Teachers</span>
                  </button>
                )}

                 

                {matchesSearch("Staff Management") && (
                  <button
                    onClick={() => onSelectTab("teachers")}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "teachers"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Staff Management</span>
                  </button>
                )}

                {matchesSearch("Subject Allocation") && (
                  <button
                    onClick={() => onSelectTab("teachers")}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "teachers"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Subject Allocation</span>
                  </button>
                )}

                {matchesSearch("Timetable") && (
                  <button
                    onClick={() => onSelectTab("teachers")}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "teachers"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>Timetable & Schedule</span>
                  </button>
                )}

                {matchesSearch("Performance") && (
                  <button
                    onClick={() => onSelectTab("teachers")}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "teachers"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Staff Performance</span>
                  </button>
                )}

                {matchesSearch("Timetable Builder") && (
                  <button
                    onClick={() => onSelectTab("timetable")}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "timetable"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>Timetable Builder</span>
                  </button>
                )}

                {matchesSearch("Job Marketplace") && (
                  <button
                    onClick={() => onSelectTab("job-marketplace")}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "job-marketplace"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                    <span>Job Marketplace</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5. FINANCE & TUITION FEES ACCORDION */}
        {!isStudentOrParent && !isTeacher && (
          <div>
            <button
            onClick={() => {
              if (isCollapsed) {
                toggleCollapse();
                setFinanceOpen(true);
              } else {
                setFinanceOpen(!financeOpen);
              }
            }}
            title={isCollapsed ? "Finance & Tuition Fees" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0" : "justify-between px-3"
            } py-2 rounded-lg text-xs font-semibold transition-all ${
              isFinanceActive
                ? "text-indigo-400 font-bold bg-slate-800/60"
                : "hover:bg-slate-800/80 text-slate-300"
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
              <CreditCard className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              {!isCollapsed && <span>Finance & Tuition Fees</span>}
            </div>
            {!isCollapsed &&
              (financeOpen ? (
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              ))}
          </button>

          {(!isCollapsed && (financeOpen || !!searchQuery.trim())) && (
            <div className="ml-4 pl-2.5 border-l border-slate-800 mt-1 space-y-0.5">
              {matchesSearch("School Fees") && (
                <button
                  onClick={() => onSelectTab("finance-fees")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "finance-fees" || activeTab === "finance"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>School Fees</span>
                </button>
              )}

              {matchesSearch("Bank & Payment Accounts") && (
                <button
                  onClick={() => onSelectTab("finance-accounts")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "finance-accounts"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bank & Payment Accounts</span>
                </button>
              )}

              {matchesSearch("Payments") && (
                <button
                  onClick={() => onSelectTab("finance-payments")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "finance-payments"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Payments</span>
                </button>
              )}

              {matchesSearch("Receipts") && (
                <button
                  onClick={() => onSelectTab("finance-receipts")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "finance-receipts"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5 text-teal-400" />
                  <span>Receipts</span>
                </button>
              )}

              {!isStudentOrParent && matchesSearch("Debtors") && (
                <button
                  onClick={() => onSelectTab("finance-debtors")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "finance-debtors"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Outstanding Fees / Debtors</span>
                </button>
              )}

              {!isStudentOrParent && matchesSearch("Expenses") && (
                <button
                  onClick={() => onSelectTab("finance-expenses")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "finance-expenses"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Expenses</span>
                </button>
              )}

              {!isStudentOrParent && matchesSearch("Financial Reports") && (
                <button
                  onClick={() => onSelectTab("finance-reports")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "finance-reports"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Payroll & Financial Reports</span>
                </button>
              )}

              {matchesSearch("Payroll") && (
                <button
                  onClick={() => onSelectTab("payroll")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "payroll"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Payroll</span>
                </button>
              )}
            </div>
          )}
        </div>
        )}

        {/* 6. LIBRARY ACCORDION */}
        {!isStudentOrParent && (
          <div>
            <button
            onClick={() => {
              if (isCollapsed) {
                toggleCollapse();
                setLibraryOpen(true);
              } else {
                setLibraryOpen(!libraryOpen);
              }
            }}
            title={isCollapsed ? "Library" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0" : "justify-between px-3"
            } py-2 rounded-lg text-xs font-semibold transition-all ${
              isLibraryActive
                ? "text-indigo-400 font-bold bg-slate-800/60"
                : "hover:bg-slate-800/80 text-slate-300"
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
              <Library className="w-4 h-4 text-amber-400 flex-shrink-0" />
              {!isCollapsed && <span>Library</span>}
            </div>
            {!isCollapsed &&
              (libraryOpen ? (
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              ))}
          </button>

          {(!isCollapsed && (libraryOpen || !!searchQuery.trim())) && (
            <div className="ml-4 pl-2.5 border-l border-slate-800 mt-1 space-y-0.5">
              {matchesSearch("Books") && (
                <button
                  onClick={() => onSelectTab("library")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "library"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5 text-amber-400" />
                  <span>Book Catalog</span>
                </button>
              )}

              {matchesSearch("Borrowing") && (
                <button
                  onClick={() => onSelectTab("library")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "library"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Send className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Borrowing Records</span>
                </button>
              )}

              {matchesSearch("Returns") && (
                <button
                  onClick={() => onSelectTab("library")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "library"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Book Returns</span>
                </button>
              )}

              {matchesSearch("Digital Library") && (
                <button
                  onClick={() => onSelectTab("library")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "library"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Digital Library & E-books</span>
                </button>
              )}
            </div>
          )}
        </div>
        )}

        {/* 7. TRANSPORT & BUSES */}
        {!isStudentOrParent && matchesSearch("Transport & Buses") && (
          <button
            onClick={() => onSelectTab("transport")}
            title={isCollapsed ? "Transport & Buses" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0" : "gap-3 px-3"
            } py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "transport"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "hover:bg-slate-800/80 text-slate-300"
            }`}
          >
            <Bus className="w-4 h-4 text-amber-400 flex-shrink-0" />
            {!isCollapsed && <span>Transport & Buses</span>}
          </button>
        )}

        {/* 8. HOSTEL BOARDING */}
        {!isStudentOrParent && matchesSearch("Hostel Boarding") && (
          <button
            onClick={() => onSelectTab("hostel")}
            title={isCollapsed ? "Hostel Boarding" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0" : "gap-3 px-3"
            } py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "hostel"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "hover:bg-slate-800/80 text-slate-300"
            }`}
          >
            <Home className="w-4 h-4 text-teal-400 flex-shrink-0" />
            {!isCollapsed && <span>Hostel Boarding</span>}
          </button>
        )}


        {/* 10. COMMUNICATION & NOTICES ACCORDION */}
        {!isStudentOrParent && (
          <div>
            <button
            onClick={() => {
              if (isCollapsed) {
                toggleCollapse();
                setCommOpen(true);
              } else {
                setCommOpen(!commOpen);
              }
            }}
            title={isCollapsed ? "Communication & Notices" : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center px-0" : "justify-between px-3"
            } py-2 rounded-lg text-xs font-semibold transition-all ${
              isCommActive
                ? "text-indigo-400 font-bold bg-slate-800/60"
                : "hover:bg-slate-800/80 text-slate-300"
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
              <MessageSquare className="w-4 h-4 text-rose-400 flex-shrink-0" />
              {!isCollapsed && <span>Communication</span>}
            </div>
            {!isCollapsed &&
              (commOpen ? (
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              ))}
          </button>

          {(!isCollapsed && (commOpen || !!searchQuery.trim())) && (
            <div className="ml-4 pl-2.5 border-l border-slate-800 mt-1 space-y-0.5">
              {matchesSearch("Announcements") && (
                <button
                  onClick={() => onSelectTab("communication-announcements")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "communication-announcements" || activeTab === "communication"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Announcements</span>
                </button>
              )}

              {matchesSearch("Messages") && (
                <button
                  onClick={() => onSelectTab("communication-messages")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "communication-messages"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Send className="w-3.5 h-3.5 text-teal-400" />
                  <span>Direct Messages</span>
                </button>
              )}

              {matchesSearch("SMS") && (
                <button
                  onClick={() => onSelectTab("communication-sms")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "communication-sms"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SMS Broadcasts</span>
                </button>
              )}

              {matchesSearch("Email") && (
                <button
                  onClick={() => onSelectTab("communication-email")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "communication-email"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Email Broadcasts</span>
                </button>
              )}

              {matchesSearch("WhatsApp") && (
                <button
                  onClick={() => onSelectTab("communication-whatsapp")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "communication-whatsapp"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp Integration</span>
                </button>
              )}

              {matchesSearch("Real-Time Chat") && (
                <button
                  onClick={() => onSelectTab("chat")}
                  className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "chat"
                      ? "bg-indigo-600/30 text-indigo-300 font-bold"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                  <span>Real-Time Chat</span>
                </button>
              )}
            </div>
          )}
        </div>
        )}

        {/* 11. DEDICATED SUPER ADMIN PANEL */}
        {isSuperAdmin && (
          <div>
            <button
              onClick={() => {
                if (isCollapsed) {
                  toggleCollapse();
                  setSettingsOpen(true);
                } else {
                  setSettingsOpen(!settingsOpen);
                }
              }}
              title={isCollapsed ? "Admin Panel & Settings" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center px-0" : "justify-between px-3"
              } py-2 rounded-lg text-xs font-semibold transition-all ${
                isSettingsActive || activeTab === "website-builder" || activeTab === "subscription" || activeTab === "superadmin"
                  ? "text-indigo-400 font-bold bg-slate-800/60"
                  : "hover:bg-slate-800/80 text-slate-300"
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                <Settings className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex items-center gap-1.5">
                    <span>Admin Panel</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 uppercase font-mono font-extrabold border border-indigo-500/30">
                      ADMIN
                    </span>
                  </div>
                )}
              </div>
              {!isCollapsed &&
                (settingsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                ))}
            </button>

            {(!isCollapsed && (settingsOpen || !!searchQuery.trim())) && (
              <div className="ml-4 pl-2.5 border-l border-slate-800 mt-1 space-y-0.5">
                {matchesSearch("Website Builder") && (
                  <button
                    onClick={() => onSelectTab("website-builder")}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                      activeTab === "website-builder" || activeTab === "settings:website"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Website Builder</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 uppercase font-bold">
                      CMS
                    </span>
                  </button>
                )}
                {matchesSearch("General Settings") && (
                  <button
                    onClick={() => onSelectTab("settings:general" as ActiveTab)}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "settings:general" || activeTab === "settings"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>General Settings</span>
                  </button>
                )}

                {matchesSearch("User Management") && (
                  <button
                    onClick={() => onSelectTab("settings:users" as ActiveTab)}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "settings:users"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    <span>User Management</span>
                  </button>
                )}

                {matchesSearch("School Configuration") && (
                  <button
                    onClick={() => onSelectTab("settings:school-config" as ActiveTab)}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "settings:school-config"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                    <span>School Configuration</span>
                  </button>
                )}

                {matchesSearch("AI Settings") && (
                  <button
                    onClick={() => onSelectTab("settings:ai" as ActiveTab)}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                      activeTab === "settings:ai"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                      <span>AI Settings</span>
                    </div>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 uppercase font-bold">
                      GEMINI
                    </span>
                  </button>
                )}

                {matchesSearch("Security") && (
                  <button
                    onClick={() => onSelectTab("settings:security" as ActiveTab)}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "settings:security"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                    <span>Security & Auth</span>
                  </button>
                )}

                {matchesSearch("Database") && (
                  <button
                    onClick={() => onSelectTab("settings:database" as ActiveTab)}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "settings:database"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <HardDriveDownload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Database & Cloud</span>
                  </button>
                )}

                {matchesSearch("Communication") && (
                  <button
                    onClick={() => onSelectTab("settings:communication" as ActiveTab)}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "settings:communication"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    <span>Communication</span>
                  </button>
                )}

                {matchesSearch("Subscription") && (
                  <button
                    onClick={() => onSelectTab("settings:subscription" as ActiveTab)}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                      activeTab === "settings:subscription" || activeTab === "subscription"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Subscription & Billing</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-extrabold tracking-wider">
                      PRO
                    </span>
                  </button>
                )}

                {matchesSearch("Website Builder") && (
                  <button
                    onClick={() => onSelectTab("settings:website" as ActiveTab)}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                      activeTab === "settings:website" || activeTab === "website-builder"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Website Builder</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 uppercase font-bold">
                      CMS
                    </span>
                  </button>
                )}

                {matchesSearch("Report Card Settings") && (
                  <button
                    onClick={() => onSelectTab("settings:reports" as ActiveTab)}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "settings:reports"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Report Card Settings</span>
                  </button>
                )}

                {matchesSearch("Lesson Notes Settings") && (
                  <button
                    onClick={() => onSelectTab("settings:lesson-notes" as ActiveTab)}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "settings:lesson-notes"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                    <span>Lesson Notes Settings</span>
                  </button>
                )}

                {matchesSearch("Exam Settings") && (
                  <button
                    onClick={() => onSelectTab("settings:exams" as ActiveTab)}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "settings:exams"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Exam Settings</span>
                  </button>
                )}

                {matchesSearch("Notifications") && (
                  <button
                    onClick={() => onSelectTab("settings:notifications" as ActiveTab)}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "settings:notifications"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Notifications</span>
                  </button>
                )}

                {matchesSearch("Appearance") && (
                  <button
                    onClick={() => onSelectTab("settings:appearance" as ActiveTab)}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "settings:appearance"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5 text-pink-400" />
                    <span>Appearance</span>
                  </button>
                )}

                {matchesSearch("Maintenance") && (
                  <button
                    onClick={() => onSelectTab("settings:maintenance" as ActiveTab)}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      activeTab === "settings:maintenance"
                        ? "bg-indigo-600/30 text-indigo-300 font-bold"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5 text-orange-400" />
                    <span>Maintenance & Logs</span>
                  </button>
                )}

                {isSuperAdmin && matchesSearch("Super Admin") && (
                  <button
                    onClick={() => onSelectTab("superadmin")}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                      activeTab === "superadmin"
                        ? "bg-rose-600/30 text-rose-300 font-bold"
                        : "hover:bg-slate-800 text-rose-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                      <span>Super Admin Node</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 uppercase font-extrabold tracking-wider">
                      ROOT
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-slate-800 space-y-1">
        <button
          onClick={() => onSelectTab("support")}
          title={isCollapsed ? "Support & System Docs" : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center px-0" : "gap-3 px-3"
          } py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === "support"
              ? "bg-slate-800 text-white font-semibold"
              : "hover:bg-slate-800/60 text-slate-400 hover:text-slate-200"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {!isCollapsed && <span>Help & Support</span>}
        </button>

        {isSuperAdmin && <ClearDataButton isCollapsed={isCollapsed} />}

        {/* Secure Sign Out Button */}
        <button
          onClick={() => {
            if (onLogout) onLogout();
          }}
          title={isCollapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center px-0" : "gap-3 px-3"
          } py-2 mt-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all border border-rose-500/20`}
        >
          <LogOut className="w-4 h-4 text-rose-400 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out / Logout</span>}
        </button>
      </div>
    </aside>
    </>
  );
};
