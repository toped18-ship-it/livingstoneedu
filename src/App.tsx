import React, { useState, useEffect, useRef } from "react";
import { WifiOff, RefreshCw, AlertTriangle, Clock, CreditCard, Sparkles } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { AIAssistantModal } from "./components/AIAssistantModal";
import { DashboardView } from "./components/views/DashboardView";
import { AILessonNotesView } from "./components/views/AILessonNotesView";
import { AIExamGeneratorView } from "./components/views/AIExamGeneratorView";
import { QuestionBankView } from "./components/views/QuestionBankView";
import { ReportCardView } from "./components/views/ReportCardView";
import { StudentsView } from "./components/views/StudentsView";
import { TeachersView } from "./components/views/TeachersView";
import { FinanceView } from "./components/views/FinanceView";
import { LibraryView } from "./components/views/LibraryView";
import { CommunicationView } from "./components/views/CommunicationView";
import { SettingsView } from "./components/views/SettingsView";
import { WebsiteBuilderView } from "./components/views/WebsiteBuilderView";
import { SubscriptionView } from "./components/views/SubscriptionView";
import { SuperAdminView } from "./components/views/SuperAdminView";
import { TeacherPortalView } from "./components/views/TeacherPortalView";
import { SchoolPortalView } from "./components/views/SchoolPortalView";
import { StudentParentPortalView } from "./components/views/StudentParentPortalView";
import { AuthView } from "./components/views/AuthView";
import { AttendanceTrackerView } from "./components/views/AttendanceTrackerView";
import { StudentIdCardView } from "./components/views/StudentIdCardView";
import { EntranceExamView } from "./components/views/EntranceExamView";
import { TimetableView } from "./components/views/TimetableView";
import { PayrollView } from "./components/views/PayrollView";
import { ChatView } from "./components/views/ChatView";
import { GamifiedLearningView } from "./components/views/GamifiedLearningView";
import { JobMarketplaceView } from "./components/views/JobMarketplaceView";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { InstallPrompt } from "./components/InstallPrompt";
import { PremiumSubscriptionModal } from "./components/PremiumSubscriptionModal";
import { SystemDiagnosticsModal } from "./components/SystemDiagnosticsModal";
import { UserRole, ActiveTab } from "./types";

export default function App() {
  const [userSession, setUserSession] = useState<any>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("livingstone_user_session");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.role) return parsed;
          localStorage.removeItem("livingstone_user_session");
        }
      } catch (e) {}
    }
    return null;
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("livingstone_user_session");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.role) return parsed.role as UserRole;
        }
      } catch (e) {}
    }
    return "Teacher";
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("livingstone_user_session");
        if (!saved) return false;
        const parsed = JSON.parse(saved);
        return !!parsed?.role;
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [accessDeniedMessage, setAccessDeniedMessage] = useState("");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return true; // Default to dark theme to prevent white flash
    }
    return true;
  });
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [schoolSubscription, setSchoolSubscription] = useState<any>(null);

  const checkSubscriptionStatus = async (schoolIdOverride?: string) => {
    try {
      const schId = schoolIdOverride || userSession?.schoolId || userSession?.school?.id || "SCH-101";
      const res = await fetch(`/api/subscription/status?schoolId=${encodeURIComponent(schId)}`);
      const data = await res.json();
      if (data.success) {
        setSchoolSubscription(data);
        // Automatically pop up subscription modal after 7 days if unpaid
        if (data.isTrialExpired && !data.isPaid && (currentRole as string) !== "Super Admin") {
          setIsSubscriptionModalOpen(true);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      checkSubscriptionStatus();
    }
  }, [isAuthenticated, userSession?.schoolId]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [startupLoading, setStartupLoading] = useState(false);
  const [transition, setTransition] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const [publicPage, setPublicPage] = useState<"privacy" | "terms" | null>(null);

  // Remove static HTML preloader as soon as React App mounts
  useEffect(() => {
    const preloader = document.getElementById("app-preloader");
    if (preloader) {
      preloader.style.opacity = "0";
      setTimeout(() => preloader.remove(), 250);
    }
  }, []);

  // Internet Connectivity Enforcement: App is disabled offline per specification
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [checkingConnection, setCheckingConnection] = useState<boolean>(false);
  const offlineFailsRef = useRef<number>(0);

  useEffect(() => {
    const handleOnline = () => {
      offlineFailsRef.current = 0;
      setIsOnline(true);
    };
    const handleOffline = () => {
      offlineFailsRef.current++;
      if (offlineFailsRef.current >= 2) setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic heartbeat to verify server reachability with 3-strike resilience
    const interval = setInterval(() => {
      fetch("/api/health", { method: "GET", cache: "no-store" })
        .then((res) => {
          if (res.ok) {
            offlineFailsRef.current = 0;
            setIsOnline(true);
          } else {
            offlineFailsRef.current++;
            if (offlineFailsRef.current >= 3) setIsOnline(false);
          }
        })
        .catch(() => {
          offlineFailsRef.current++;
          if (offlineFailsRef.current >= 3) setIsOnline(false);
        });
    }, 20000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const checkConnectivity = async () => {
    setCheckingConnection(true);
    try {
      const res = await fetch("/api/health", { method: "GET", cache: "no-store" });
      if (res.ok) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch (e) {
      setIsOnline(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  const PUBLIC_PATHS = [
    "/",
    "/home",
    "/login",
    "/about",
    "/features",
    "/pricing",
    "/contact",
    "/register-student",
    "/register-teacher",
    "/register-school",
    "/forgot-password",
    "/school",
    "/school-portal",
    "/student",
    "/student-portal",
    "/teacher",
    "/teacher-portal"
  ];

  // Map an app tab to its own URL address
  const routeForTab = (tab: string) =>
    tab === "superadmin" ? "/admin" : `/app/${tab.replace(/:/g, "/")}`;

  // Map a URL address back to an app tab
  const tabForRoute = (path: string): string => {
    const m = path.match(/^\/app\/(.+)$/);
    return m ? m[1].replace(/\//g, ":") : "dashboard";
  };

  const APP_PAGE_TITLES: Record<string, string> = {
    dashboard: "Dashboard",
    "school-portal": "School Panel",
    "teacher-portal": "Teacher Portal",
    "student-parent-portal": "Student & Parent Portal",
    superadmin: "Super Admin HQ",
    students: "Students",
    teachers: "Teachers",
    finance: "Finance & Billing",
    library: "Library",
    communication: "Communication",
    "ai-lesson-notes": "AI Lesson Notes",
    "ai-exam-generator": "AI Exam Generator",
    "question-bank": "Question Bank",
    "report-cards": "Report Cards",
    "website-builder": "Website Builder",
    subscription: "Subscription & Billing",
    settings: "Settings"
  };

  // Sync URL -> app state on initial load and browser back/forward
  const isAuthedRef = useRef(isAuthenticated);
  useEffect(() => {
    isAuthedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    const applyRoute = () => {
      const p = window.location.pathname;
      if (p === "/privacy") {
        setPublicPage("privacy");
        return;
      }
      if (p === "/terms") {
        setPublicPage("terms");
        return;
      }
      setPublicPage(null);
      if (p === "/admin" || p.startsWith("/admin")) {
        setIsAuthenticated(true);
        setCurrentRole("Super Admin");
        setActiveTab("superadmin");
        return;
      }
      if (p === "/school-portal" || p === "/school") {
        if (isAuthedRef.current) {
          setActiveTab("school-portal");
        }
        return;
      }
      if (p === "/student-portal" || p === "/student") {
        if (isAuthedRef.current) {
          setActiveTab("student-parent-portal");
        }
        return;
      }
      if (p === "/teacher-portal" || p === "/teacher") {
        if (isAuthedRef.current) {
          setActiveTab("teacher-portal");
        }
        return;
      }
      if (PUBLIC_PATHS.includes(p)) return;
      if (isAuthedRef.current) {
        setActiveTab(tabForRoute(p) as any);
      }
    };
    applyRoute();
    window.addEventListener("popstate", applyRoute);
    return () => window.removeEventListener("popstate", applyRoute);
  }, []);

  // Sync app state -> URL so every page has its own shareable address
  const firstRouteSync = useRef(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (publicPage) {
      const target = publicPage === "privacy" ? "/privacy" : "/terms";
      document.title = publicPage === "privacy" ? "Privacy Policy | LIVINGSTONEEDU" : "Terms of Service | LIVINGSTONEEDU";
      if (window.location.pathname !== target) window.history.pushState(null, "", target);
      return;
    }
    if (!isAuthenticated) {
      const p = window.location.pathname;
      if (p.startsWith("/app/") || p === "/admin" || p.startsWith("/admin")) {
        window.history.replaceState(null, "", "/login" + window.location.search);
        document.title = "Portal Login | LIVINGSTONEEDU";
      }
      return;
    }
    const target = routeForTab(activeTab);
    if (window.location.pathname !== target) {
      if (firstRouteSync.current) {
        window.history.replaceState(null, "", target);
        firstRouteSync.current = false;
      } else {
        window.history.pushState(null, "", target);
      }
    }
    const label = APP_PAGE_TITLES[activeTab.split(":")[0]] || APP_PAGE_TITLES[activeTab] || "Portal";
    document.title = `${label} | LIVINGSTONEEDU`;
  }, [activeTab, isAuthenticated, publicPage]);

  // Branded startup overlay before revealing the auth page or dashboard
  useEffect(() => {
    const t = setTimeout(() => setStartupLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const runTransition = (message: string, durationMs = 800) => {
    setTransition({ show: true, message });
    setTimeout(() => setTransition({ show: false, message: "" }), durationMs);
  };

  // Sync dark class on root document element and localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Sync theme and settings changes made by admin dynamically across entire application
  useEffect(() => {
    const handleSettingsChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.theme) {
        setIsDark(detail.theme === "dark");
      }
    };
    window.addEventListener("app:settings-changed", handleSettingsChanged);
    return () => window.removeEventListener("app:settings-changed", handleSettingsChanged);
  }, []);

  // Verify authenticated user profile & role from backend on session restore
  useEffect(() => {
    if (isAuthenticated && userSession) {
      const isStudent = userSession?.role === "Student" || userSession?.role === "Parent";
      const isTeacher = userSession?.role === "Teacher" || userSession?.role === "Class Teacher" || userSession?.role === "Subject Teacher";
      fetch("/api/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userSession?.email,
          role: userSession?.role,
          portalType: isStudent ? "student" : isTeacher ? "teacher" : "school",
          studentId: userSession?.id || userSession?.studentId,
          staffId: userSession?.staffId
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.userRole) {
            setCurrentRole(data.userRole as UserRole);
            if (data.redirectTab) {
              setActiveTab(data.redirectTab as any);
            } else if (data.userRole === "Student" || data.userRole === "Parent") {
              setActiveTab("student-parent-portal");
            } else if (data.userRole === "Super Admin") {
              setActiveTab("superadmin");
            } else if (data.userRole === "Teacher" || data.userRole === "Class Teacher" || data.userRole === "Subject Teacher") {
              setActiveTab("teacher-portal");
            } else {
              setActiveTab("school-portal");
            }
            if (data.user) {
              setUserSession((prev: any) => ({ ...prev, ...data.user, role: data.userRole }));
            }
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Test Resend Email connection to current authenticated user
  const [testEmailStatus, setTestEmailStatus] = useState<{ loading: boolean; message: string; success?: boolean } | null>(null);

  const testResendEmailConnection = async (targetEmailOverride?: string) => {
    const targetEmail = targetEmailOverride || userSession?.email || "dtemitope60@gmail.com";
    setTestEmailStatus({ loading: true, message: `Sending test email to ${targetEmail} via Resend...` });
    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await response.json();
      if (data.success) {
        setTestEmailStatus({
          loading: false,
          success: true,
          message: `✅ Resend Connection Verified: Test email sent to ${targetEmail}!`,
        });
      } else {
        setTestEmailStatus({
          loading: false,
          success: false,
          message: `❌ Resend test failed: ${data.resend?.error || data.message || "Failed to send email"}`,
        });
      }
    } catch (err: any) {
      setTestEmailStatus({
        loading: false,
        success: false,
        message: `❌ Network error sending test email: ${err?.message || err}`,
      });
    }
    setTimeout(() => {
      setTestEmailStatus(null);
    }, 7000);
  };

  // Expose test function on window object for easy manual developer execution
  useEffect(() => {
    (window as any).testResendConnection = testResendEmailConnection;
    (window as any).sendTestEmail = testResendEmailConnection;
  }, [userSession]);

  const handleSelectTab = (tab: ActiveTab | string, overrideRole?: UserRole) => {
    const effectiveRole = overrideRole || currentRole;

    // 1. Student or Parent Route Protection
    if (effectiveRole === "Student" || effectiveRole === "Parent") {
      setAccessDeniedMessage("");
      setActiveTab("student-parent-portal");
      return;
    }

    // 2. Teacher Route Protection
    const isTeacher = effectiveRole === "Teacher" || effectiveRole === "Class Teacher" || effectiveRole === "Subject Teacher";
    const forbiddenForTeacher = [
      "superadmin",
      "finance",
      "subscription",
      "settings:permissions",
      "settings:users",
      "settings:security",
      "settings:database"
    ];

    if (isTeacher && forbiddenForTeacher.some((f) => tab === f || tab.startsWith(f))) {
       setAccessDeniedMessage("Access denied. You do not have permission to access this page.");
      setTimeout(() => setAccessDeniedMessage(""), 4000);
      setActiveTab("teacher-portal");
      return;
    }

    setAccessDeniedMessage("");
    setActiveTab(tab as any);
  };

  const handleLoginSuccess = (detectedRole: UserRole, targetTab: string, userData?: any) => {
    setIsAuthenticated(true);
    setCurrentRole(detectedRole);
    setUserSession(userData || null);
    setPublicPage(null);

    const sessionData = {
      ...(userData || {}),
      role: detectedRole,
      loginTime: Date.now()
    };
    try {
      localStorage.setItem("livingstone_user_session", JSON.stringify(sessionData));
    } catch (e) {}

    if (
      targetTab === "school-portal" ||
      detectedRole === "Principal" ||
      detectedRole === "Vice Principal" ||
      detectedRole === "School Owner" ||
      detectedRole === "Proprietor" ||
      detectedRole === "Proprietress" ||
      detectedRole === "Head Teacher" ||
      detectedRole === "Assistant Head Teacher" ||
      detectedRole === "School Administrator" ||
      detectedRole === "School Admin" ||
      detectedRole === "Admin" ||
      detectedRole === "ICT Administrator" ||
      detectedRole === "Registrar" ||
      detectedRole === "Admission Officer" ||
      detectedRole === "Bursar" ||
      detectedRole === "Accountant"
    ) {
      setActiveTab("school-portal");
      handleSelectTab("school-portal", detectedRole);
    } else if (detectedRole === "Super Admin" || targetTab === "superadmin") {
      handleSelectTab("superadmin", detectedRole);
    } else if (detectedRole === "Student" || detectedRole === "Parent") {
      setActiveTab("student-parent-portal");
      handleSelectTab("student-parent-portal", detectedRole);
    } else if (detectedRole === "Teacher" || detectedRole === "Class Teacher" || detectedRole === "Subject Teacher") {
      setActiveTab("teacher-portal");
      handleSelectTab("teacher-portal", detectedRole);
    } else if (window.location.pathname === "/admin" || window.location.hash === "#admin") {
      handleSelectTab("settings", detectedRole);
    } else {
      handleSelectTab(targetTab || "dashboard", detectedRole);
    }

    runTransition(
      detectedRole === "Super Admin"
        ? "Authenticating Super Admin Dashboard..."
        : "Authenticating your secure portal...",
      1200
    );

    // Subscription check: after 7 days, pop up subscription modal for real payment
    if (userData?.subscription) {
      setSchoolSubscription(userData.subscription);
      if (userData.subscription.isTrialExpired && !userData.subscription.isPaid && detectedRole !== "Super Admin") {
        setTimeout(() => {
          setIsSubscriptionModalOpen(true);
        }, 1200);
      }
    } else {
      setTimeout(() => {
        checkSubscriptionStatus(userData?.schoolId || userData?.school?.id);
      }, 1000);
    }

    // If user just completed registration verification, pop up the Premium Subscription Modal
    if (typeof window !== "undefined") {
      try {
        const justReg = sessionStorage.getItem("livingstone_just_registered");
        if (justReg === "true") {
          sessionStorage.removeItem("livingstone_just_registered");
          setTimeout(() => {
            setIsSubscriptionModalOpen(true);
          }, 1500);
        }
      } catch (e) {}
    }
  };

  const handleLogout = () => {
    setTransition({ show: true, message: "Signing you out securely..." });
    setTimeout(() => {
      setIsAuthenticated(false);
      setUserSession(null);
      setPublicPage(null);
      try {
        localStorage.removeItem("livingstone_user_session");
      } catch (e) {}
      setActiveTab("auth");
      setTransition({ show: false, message: "" });
    }, 950);
  };

  const renderCurrentView = () => {
    // 1. School Administrator, Principal, Proprietor, School Owner Portal
    if (
      activeTab === "school-portal" ||
      currentRole === "School Administrator" ||
      currentRole === "School Admin" ||
      currentRole === "Principal" ||
      currentRole === "Vice Principal" ||
      currentRole === "School Owner" ||
      currentRole === "Proprietor" ||
      currentRole === "Proprietress" ||
      currentRole === "Head Teacher" ||
      currentRole === "Assistant Head Teacher" ||
      currentRole === "ICT Administrator" ||
      currentRole === "Registrar" ||
      currentRole === "Admission Officer" ||
      currentRole === "Bursar" ||
      currentRole === "Accountant" ||
      currentRole === "Admin"
    ) {
      if (activeTab === "school-portal" || activeTab === "dashboard" || activeTab === "student-parent-portal") {
        return <SchoolPortalView currentRole={currentRole} userSession={userSession} onSelectTab={handleSelectTab} onLogout={handleLogout} />;
      }
    }

    // 2. Student or Parent role strictly view the Student & Parent Academic Portal
    if (
      (currentRole === "Student" || currentRole === "Parent") &&
      (activeTab === "student-parent-portal" || activeTab === "parents" || activeTab === "dashboard")
    ) {
      return <StudentParentPortalView currentRole={currentRole === "Student" || currentRole === "Parent" ? currentRole : "Student"} userSession={userSession} />;
    }

    switch (true) {
      case activeTab === "dashboard":
        return (
          <DashboardView
            currentRole={currentRole}
            userSession={userSession}
            onSelectTab={(tab) => setActiveTab(tab)}
            onOpenAIAssistant={() => setIsAiModalOpen(true)}
          />
        );
      case (activeTab as string) === "school-portal":
        return <SchoolPortalView currentRole={currentRole} userSession={userSession} onSelectTab={handleSelectTab} onLogout={handleLogout} />;
      case activeTab === "teacher-portal":
        return <TeacherPortalView currentRole={currentRole} userSession={userSession} onSelectTab={handleSelectTab} onLogout={handleLogout} />;
      case activeTab === "student-parent-portal" || activeTab === "parents":
        return <StudentParentPortalView currentRole={currentRole} userSession={userSession} />;
      case activeTab === "website-builder":
        return <WebsiteBuilderView currentRole={currentRole} />;
      case activeTab === "subscription":
        return <SubscriptionView currentRole={currentRole} />;
      case activeTab === "ai-lesson-notes" || activeTab.startsWith("academic-"):
        if (activeTab === "academic-ai-exam-generator" || activeTab === "ai-exam-generator") {
          return <AIExamGeneratorView userSession={userSession} />;
        }
        if (activeTab === "academic-question-bank" || activeTab === "question-bank") {
          return <QuestionBankView userSession={userSession} />;
        }
        if (activeTab === "academic-report-cards" || activeTab === "report-cards" || activeTab === "academic-attendance") {
          return <ReportCardView userSession={userSession} />;
        }
        return <AILessonNotesView userSession={userSession} />;
      case activeTab === "ai-exam-generator":
        return <AIExamGeneratorView userSession={userSession} />;
      case activeTab === "question-bank":
        return <QuestionBankView userSession={userSession} />;
      case activeTab === "report-cards":
        return <ReportCardView userSession={userSession} />;
      case activeTab === "students":
        return <StudentsView />;
      case activeTab === "teachers":
        return <TeachersView userSession={userSession} />;
      case activeTab === "attendance":
        return <AttendanceTrackerView />;
      case activeTab === "id-cards":
        return <StudentIdCardView />;
      case activeTab === "entrance-exams":
        return <EntranceExamView />;
      case activeTab === "timetable":
        return <TimetableView />;
      case activeTab === "payroll":
        return <PayrollView />;
      case activeTab === "chat":
        return <ChatView />;
      case activeTab === "gamified-learning":
        return <GamifiedLearningView />;
      case activeTab === "job-marketplace":
        return <JobMarketplaceView />;
      case activeTab.startsWith("finance") || activeTab === "finance":
        return <FinanceView />;
      case activeTab === "library":
        return <LibraryView />;
      case activeTab.startsWith("communication") || activeTab === "communication" || activeTab === "transport" || activeTab === "hostel" || activeTab === "support":
        return <CommunicationView />;
      case activeTab.startsWith("settings") || activeTab === "settings":
        return (
          <SettingsView
            currentRole={currentRole}
            activeSubTab={activeTab}
            onSelectSubTab={(sub) => setActiveTab(`settings:${sub}`)}
          />
        );
      default:
        return (
          <DashboardView
            currentRole={currentRole}
            onSelectTab={(tab) => setActiveTab(tab)}
            onOpenAIAssistant={() => setIsAiModalOpen(true)}
          />
        );
    }
  };

  const renderContent = () => {
    // 0. PUBLIC LEGAL PAGES: /privacy and /terms are public and render regardless of auth state
    if (publicPage === "privacy" || publicPage === "terms") {
      return (
        <AuthView
          currentRole={currentRole}
          onLoginSuccess={handleLoginSuccess}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          initialPage={publicPage}
        />
      );
    }

    // 1. PUBLIC LAYOUT: Render AuthView when user is not authenticated
    if (!isAuthenticated) {
      return (
        <AuthView
          currentRole={currentRole}
          onLoginSuccess={handleLoginSuccess}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
        />
      );
    }

    // 2. PLATFORM SUPER ADMIN LAYOUT: Completely separate layout without School Sidebar or Header
    if (currentRole === "Super Admin" || activeTab === "superadmin") {
      return (
        <SuperAdminView
          onLogout={handleLogout}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          onSwitchRole={(role) => {
            setCurrentRole(role);
            if (role !== "Super Admin") {
              setActiveTab("dashboard");
            }
          }}
        />
      );
    }

    // 3. STUDENT & PARENT STANDALONE LAYOUT: Single Student Sidebar layout without duplicate outer sidebar/header
    if (currentRole === "Student" || currentRole === "Parent") {
      return (
        <StudentParentPortalView
          currentRole={currentRole}
          userSession={userSession}
          onLogout={handleLogout}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
        />
      );
    }

    // 3b. TEACHER STANDALONE LAYOUT: Teacher has its own internal sidebar — no shared outer sidebar/header
    if (currentRole === "Teacher" || currentRole === "Class Teacher" || currentRole === "Subject Teacher") {
      return (
        <TeacherPortalView
          currentRole={currentRole}
          userSession={userSession}
          onSelectTab={handleSelectTab}
        />
      );
    }

    // 4. SCHOOL DASHBOARD LAYOUT: Standard layout for School Owners, Admins
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors">
        {/* School Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          currentRole={currentRole}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={handleLogout}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 w-full max-w-full min-h-screen overflow-x-hidden">
          {/* Access Denied Warning Toast/Banner */}
          {accessDeniedMessage && (
            <div className="bg-rose-600 text-white text-xs font-bold px-4 py-2 text-center shadow-lg animate-fade-in flex items-center justify-center gap-2">
              <span>⚠️ {accessDeniedMessage}</span>
            </div>
          )}

          {/* Resend Connection Test Status Toast */}
          {testEmailStatus && (
            <div className={`text-white text-xs font-bold px-4 py-2.5 text-center shadow-lg animate-fade-in flex items-center justify-center gap-2 ${
              testEmailStatus.loading ? "bg-indigo-600 animate-pulse" : testEmailStatus.success ? "bg-emerald-600" : "bg-rose-600"
            }`}>
              <span>{testEmailStatus.message}</span>
            </div>
          )}

          {/* Top Header */}
          <Header
            currentRole={currentRole}
             onRoleChange={(role) => {
              setCurrentRole(role);
              if (role === "Super Admin") {
                handleSelectTab("superadmin");
              } else if (role === "Student" || role === "Parent") {
                handleSelectTab("student-parent-portal");
              } else if (role === "Teacher" || role === "Class Teacher" || role === "Subject Teacher") {
                handleSelectTab("teacher-portal");
              } else {
                handleSelectTab("dashboard");
              }
            }}
            isDark={isDark}
            onToggleTheme={() => setIsDark(!isDark)}
            onOpenAIAssistant={() => setIsAiModalOpen(true)}
            onSelectTab={handleSelectTab}
            notificationsCount={3}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            onToggleMobileMenu={() => setMobileSidebarOpen((prev) => !prev)}
            onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
          />

          {/* 7-Day Free Trial / Expired Warning Banner */}
          {isAuthenticated && (currentRole as string) !== "Super Admin" && schoolSubscription && (
            <>
              {schoolSubscription.isTrialExpired && !schoolSubscription.isPaid ? (
                <div className="bg-gradient-to-r from-rose-700 via-amber-700 to-rose-800 text-white px-4 py-2 text-xs font-bold shadow-md flex flex-wrap items-center justify-between gap-3 border-b border-rose-500/50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-300 animate-pulse" />
                    <span>
                      <strong>7-Day Free Trial Ended:</strong> Your complimentary evaluation period has completed. Subscribe with real payment to continue uninterrupted school operations.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSubscriptionModalOpen(true)}
                      className="px-3 py-1 rounded-lg bg-white text-rose-800 hover:bg-rose-50 text-xs font-black uppercase tracking-wider shrink-0 shadow-sm cursor-pointer"
                    >
                      Subscribe with Real Payment
                    </button>
                  </div>
                </div>
              ) : !schoolSubscription.isPaid ? (
                <div className="bg-slate-900/95 text-indigo-200 border-b border-indigo-900/60 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      <strong>7-Day Free Trial:</strong> Day {schoolSubscription.daysElapsed + 1} of 7 ({schoolSubscription.daysRemaining} days remaining). Real payment required after 7 days.
                    </span>
                  </div>
                  <button
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    className="text-[11px] font-bold text-amber-300 hover:text-white underline cursor-pointer"
                  >
                    Subscribe Now
                  </button>
                </div>
              ) : null}
            </>
          )}

          {/* View Render Area */}
          <main className="flex-1 p-3 md:p-5 max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
            {renderCurrentView()}
          </main>
        </div>

        {/* Floating AI Assistant Copilot Modal */}
        <AIAssistantModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          currentRole={currentRole}
        />

        {/* Premium Subscription Pop-up Modal */}
        <PremiumSubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          onNavigateToBilling={() => {
            setIsSubscriptionModalOpen(false);
            handleSelectTab("subscription");
          }}
          userRole={currentRole}
          userSession={userSession}
          onPaymentSuccess={(updatedSub) => {
            setSchoolSubscription(updatedSub);
          }}
        />

        {/* System Diagnostics & Functional Verification Modal */}
        <SystemDiagnosticsModal
          isOpen={isDiagnosticsOpen}
          onClose={() => setIsDiagnosticsOpen(false)}
          currentRole={currentRole}
          onSwitchRole={(role) => {
            setCurrentRole(role);
            if (role === "Super Admin") {
              handleSelectTab("superadmin");
            } else if (role === "Student" || role === "Parent") {
              handleSelectTab("student-parent-portal");
            } else if (role === "Teacher" || role === "Class Teacher" || role === "Subject Teacher") {
              handleSelectTab("teacher-portal");
            } else {
              handleSelectTab("dashboard");
            }
          }}
        />
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      <InstallPrompt />
      <LoadingOverlay
        show={startupLoading || transition.show}
        message={transition.show ? transition.message : "Initializing LIVINGSTONEEDU..."}
        indeterminate={transition.show}
      />

      {/* Strict Online Enforcement: Block App completely when no internet connection */}
      {!isOnline && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 text-center animate-fadeIn">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500">
              <WifiOff className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">Internet Connection Required</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                LIVINGSTONEEDU cannot operate offline. An active internet connection is required to authenticate, access real-time student databases, run CBT exams, and sync school records.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-400">
              Please connect your device to cellular data or a Wi-Fi network to continue.
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={checkConnectivity}
                disabled={checkingConnection}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {checkingConnection ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Connection...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> Check & Reconnect
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsOnline(true)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm transition-all border border-slate-700 cursor-pointer"
              >
                Dismiss & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
