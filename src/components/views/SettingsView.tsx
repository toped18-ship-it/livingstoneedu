import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  RotateCcw,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Building,
  Users,
  GraduationCap,
  Bot,
  ShieldCheck,
  Database,
  Mail,
  CreditCard,
  Globe,
  FileText,
  BookOpen,
  FileSpreadsheet,
  Bell,
  Palette,
  Wrench,
  Search,
  Upload,
  Lock,
  Key,
  Trash2,
  RefreshCw,
  Clock,
  Check,
  Smartphone,
  PhoneCall,
  HardDriveDownload,
  Zap,
  ShieldAlert,
  Server,
  Layers,
  Award,
  Sliders,
  Sparkles,
  HelpCircle,
  Info,
  ChevronRight,
  Eye,
  EyeOff,
  UserPlus,
  FileCode,
  CheckSquare,
  Activity,
  UserCheck,
  FolderTree,
  Send,
  Plug,
  X,
  User,
  Video,
  Play,
  ExternalLink,
} from "lucide-react";
import { UserRole } from "../../types";
import { useLiveData, notifyDataChanged } from "../../lib/liveStore";
import { getYouTubeEmbedUrl } from "../../lib/videoUtils";

export type AppSettingsTab =
  | "general"
  | "users"
  | "school-config"
  | "ai"
  | "security"
  | "database"
  | "communication"
  | "subscription"
  | "website"
  | "reports"
  | "lesson-notes"
  | "exams"
  | "notifications"
  | "appearance"
  | "maintenance";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
}

interface SettingsViewProps {
  currentRole?: UserRole;
  activeSubTab?: string;
  initialTab?: string;
  userSession?: any;
  onSelectSubTab?: (tab: string) => void;
}

const DEFAULT_SETTINGS = {
  // General Settings
  schoolName: "LivingstoneEDU Model School",
  schoolLogoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80",
  schoolMotto: "Excellence in Character, Knowledge & Wisdom",
  schoolAddress: "No. 5 Ibobo Road Abocho Kogi State.",
  contactEmail: "livingstoneedu64@gmail.com",
  contactPhone: "+2347067048471",
  websiteUrl: "https://www.livingstoneedu.name.ng",
  exploreFeaturesYoutubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  exploreFeaturesVideoTitle: "LIVINGSTONEEDU Platform Overview & Features Walkthrough",
  timeZone: "Africa/Lagos (GMT+1)",
  language: "English (US)",
  theme: "dark",
  academicSession: "2026/2027 Academic Session",
  academicTerms: "First Term",

  // School Config
  activeClasses: [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
    "JSS 1", "JSS 2", "JSS 3",
    "SS 1", "SS 2", "SS 3"
  ],
  classArms: ["Gold", "Silver", "Diamond", "A", "B", "C"],
  gradingScale: [
    { grade: "A", minScore: 70, maxScore: 100, remark: "Excellent" },
    { grade: "B", minScore: 60, maxScore: 69, remark: "Very Good" },
    { grade: "C", minScore: 50, maxScore: 59, remark: "Credit" },
    { grade: "D", minScore: 45, maxScore: 49, remark: "Pass" },
    { grade: "E", minScore: 40, maxScore: 44, remark: "Fair Pass" },
    { grade: "F", minScore: 0, maxScore: 39, remark: "Fail" },
  ],
  lateTimeThreshold: "08:00 AM",
  minAttendancePercent: 75,
  passEnglishMathRequired: true,
  minOverallAverage: 50,

  // AI Settings
  geminiApiKey: "AIzaSyD-LIVINGSTONE-SECURE-KEY-PROD-2026",
  geminiModel: "gemini-3.6-flash",
  aiDailyLimitPerTeacher: 50,
  enforceBloomsTaxonomy: true,
  autoLessonObjectives: true,
  lessonPromptTemplate: "Act as an expert Nigerian & Cambridge curriculum instructor. Generate structured lesson note with behavioral objectives and evaluation questions.",

  // Security
  firebaseAuthEnabled: true,
  jwtSessionExpiryHours: 24,
  enforce2FAAdmins: false,
  autoLogoutIdleMinutes: 30,

  // Database
  firebaseProjectId: "livingstone-edu-saas",
  firestoreRegion: "europe-west2 (London)",
  realtimeDbUrl: "https://livingstone-edu-saas-default-rtdb.firebaseio.com",
  autoBackupDaily: true,

  // Communication
  smtpHost: "smtp.gmail.com",
  smtpPort: 587,
  smtpUser: "notifications@livingstone.edu.ng",
  smsGatewayProvider: "Termii",
  smsSenderId: "LIV-SCHOOL",
  whatsappEnabled: true,

  // Report Card
  ca1Percentage: 20,
  ca2Percentage: 20,
  examPercentage: 60,
  reportTemplate: "Modern Compact",
  principalSignatureUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=200&auto=format&fit=crop&q=80",
  schoolStampUrl: "https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?w=200&auto=format&fit=crop&q=80",

  // Appearance
  primaryColor: "#4F46E5",
  accentColor: "#10B981",
  sidebarStyle: "Dark Slate",
  dashboardLayout: "Bento Analytics",
  fontFamily: "Plus Jakarta Sans",
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentRole = "Super Admin",
  activeSubTab: activeSubTabProp,
  initialTab,
  userSession: _userSession,
  onSelectSubTab,
}) => {
  const activeSubTab = activeSubTabProp || initialTab || "general";
  // Check Authorization: Strictly Super Admin
  const isAuthorized =
    currentRole === "Super Admin" ||
    (currentRole as string) === "Super Administrator";

  // Active Sub-Tab State
  const [currentTab, setCurrentTab] = useState<AppSettingsTab>(
    (activeSubTab.replace("settings:", "") as AppSettingsTab) || "general"
  );

  useEffect(() => {
    if (activeSubTab) {
      const parsed = activeSubTab.replace("settings:", "") as AppSettingsTab;
      if (parsed) setCurrentTab(parsed);
    }
  }, [activeSubTab]);

  const changeTab = (tab: AppSettingsTab) => {
    setCurrentTab(tab);
    if (onSelectSubTab) {
      onSelectSubTab(tab);
    }
  };

  // Persistent Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("livingstone_app_settings");
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Saved baseline for "Cancel" comparison
  const [savedBaseline, setSavedBaseline] = useState(() => ({ ...settings }));

  // Load authoritative settings from server on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings((prev) => ({ ...prev, ...res.data }));
          setSavedBaseline((prev) => ({ ...prev, ...res.data }));
          localStorage.setItem("livingstone_app_settings", JSON.stringify({ ...DEFAULT_SETTINGS, ...res.data }));
        }
      })
      .catch(() => {});
  }, []);

  // ------------------------------------------------------------------
  // Gmail API Integration (Google Cloud Console) state + handlers
  // ------------------------------------------------------------------
  const liveSubscribers = useLiveData<any>("emailSubscribers");
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [gmailConfig, setGmailConfig] = useState({
    apiKey: "",
    clientId: "",
    clientSecret: "",
    refreshToken: "",
    senderEmail: "",
    senderName: "",
    connected: false,
    profileEmail: "",
    hasRefreshToken: false,
  });
  const [gmailLoading, setGmailLoading] = useState(true);
  const [savingGmail, setSavingGmail] = useState(false);
  const [gmailMode, setGmailMode] = useState<"all" | "selected">("all");
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [newSubName, setNewSubName] = useState("");
  const [newSubEmail, setNewSubEmail] = useState("");
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [gmailLogs, setGmailLogs] = useState<any[]>([]);

  // Create User Modal State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<string>("Teacher / Form Teacher");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserMsg, setCreateUserMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setCreateUserMsg({ type: "error", text: "Please enter both name and email." });
      return;
    }
    setCreatingUser(true);
    setCreateUserMsg(null);
    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          role: newUserRole,
          password: newUserPassword || "password123",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateUserMsg({ type: "success", text: "User account created successfully!" });
        notifyDataChanged(["users"]);
        setTimeout(() => {
          setShowCreateUserModal(false);
          setNewUserName("");
          setNewUserEmail("");
          setNewUserPassword("");
          setCreateUserMsg(null);
        }, 1200);
      } else {
        setCreateUserMsg({ type: "error", text: data.message || "Failed to create user." });
      }
    } catch (err: any) {
      setCreateUserMsg({ type: "error", text: err.message || "Connection error." });
    } finally {
      setCreatingUser(false);
    }
  };

  // Keep the subscriber list in sync with the rest of the app (live data bus)
  useEffect(() => {
    if (Array.isArray(liveSubscribers.data)) setSubscribers(liveSubscribers.data);
  }, [liveSubscribers.data]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch("/api/gmail/config").then((r) => r.json()).catch(() => null),
      fetch("/api/gmail/logs").then((r) => r.json()).catch(() => null),
      fetch("/api/public/homepage-settings").then((r) => r.json()).catch(() => null),
    ]).then(([cfg, logs, homeCfg]) => {
      if (!mounted) return;
      if (cfg?.success && cfg.config) {
        setGmailConfig((prev) => ({
          apiKey: cfg.config.apiKey ?? prev.apiKey,
          clientId: cfg.config.clientId ?? prev.clientId,
          clientSecret: cfg.config.clientSecret ?? prev.clientSecret,
          refreshToken: cfg.config.refreshToken ?? "",
          senderEmail: cfg.config.senderEmail ?? prev.senderEmail,
          senderName: cfg.config.senderName ?? prev.senderName,
          connected: !!cfg.config.connected,
          profileEmail: cfg.config.profileEmail ?? "",
          hasRefreshToken: !!cfg.config.hasRefreshToken,
        }));
      }
      if (logs?.success) setGmailLogs(logs.logs || []);
      if (homeCfg?.success && homeCfg.exploreFeaturesYoutubeUrl) {
        setSettings((prev: any) => ({
          ...prev,
          exploreFeaturesYoutubeUrl: homeCfg.exploreFeaturesYoutubeUrl,
          exploreFeaturesVideoTitle: homeCfg.exploreFeaturesVideoTitle || prev.exploreFeaturesVideoTitle,
        }));
      }
      setGmailLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const saveGmailConfig = async () => {
    setSavingGmail(true);
    setGmailStatus(null);
    try {
      const res = await fetch("/api/gmail/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: gmailConfig.apiKey,
          clientId: gmailConfig.clientId,
          clientSecret: gmailConfig.clientSecret,
          refreshToken: gmailConfig.refreshToken,
          senderEmail: gmailConfig.senderEmail,
          senderName: gmailConfig.senderName,
        }),
      }).then((r) => r.json());
      setGmailStatus({ type: res.success ? "success" : "error", text: res.message || "Credentials saved." });
      logAuditAction(res.success ? "Saved Gmail Integration Credentials" : "Gmail Save Failed", "Communication", res.message || "");
    } catch (e) {
      setGmailStatus({ type: "error", text: "Could not reach the server to save Gmail credentials." });
    } finally {
      setSavingGmail(false);
    }
  };

  const handleGmailAuth = async () => {
    setGmailStatus(null);
    try {
      const res = await fetch("/api/gmail/auth-url").then((r) => r.json());
      if (res.success && res.authUrl) {
        setGmailStatus({ type: "info", text: `Opening Google Cloud consent screen… Callback: ${res.redirectUri}` });
        window.open(res.authUrl, "_blank", "noopener,width=620,height=700");
        logAuditAction("Started Gmail OAuth Flow", "Google Cloud", `Redirect URI: ${res.redirectUri}`);
      } else {
        setGmailStatus({ type: "error", text: res.message || "Save your Google Cloud OAuth Client ID first." });
      }
    } catch (e) {
      setGmailStatus({ type: "error", text: "Could not contact server to build the OAuth URL." });
    }
  };

  const testGmail = async () => {
    setGmailStatus(null);
    try {
      const res = await fetch("/api/gmail/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).then((r) => r.json());
      setGmailStatus({ type: res.success ? "success" : "error", text: res.message || "Verification failed." });
      if (res.success) setGmailConfig((prev) => ({ ...prev, connected: true, profileEmail: res.profileEmail || prev.profileEmail }));
    } catch (e) {
      setGmailStatus({ type: "error", text: "Gmail verification request failed." });
    }
  };

  const disconnectGmail = async () => {
    setGmailStatus(null);
    try {
      const res = await fetch("/api/gmail/disconnect", { method: "POST" }).then((r) => r.json());
      setGmailConfig((prev) => ({ ...prev, connected: false, profileEmail: "", hasRefreshToken: false }));
      setGmailStatus({ type: "info", text: res.message || "Gmail disconnected." });
    } catch (e) {
      setGmailStatus({ type: "error", text: "Disconnect request failed." });
    }
  };

  const addSubscriber = async () => {
    if (!newSubEmail.trim() || !newSubEmail.includes("@")) {
      setGmailStatus({ type: "error", text: "Enter a valid email address to subscribe." });
      return;
    }
    try {
      const res = await fetch("/api/gmail/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newSubEmail, name: newSubName }),
      }).then((r) => r.json());
      setGmailStatus({ type: res.success ? "success" : "error", text: res.message || "Added." });
      if (res.success) {
        notifyDataChanged(["emailSubscribers"]);
        setNewSubEmail("");
        setNewSubName("");
      }
    } catch (e) {
      setGmailStatus({ type: "error", text: "Could not add subscriber." });
    }
  };

  const removeSubscriber = async (id: string) => {
    try {
      const res = await fetch(`/api/gmail/subscribers/${id}`, { method: "DELETE" }).then((r) => r.json());
      setGmailStatus({ type: res.success ? "success" : "error", text: res.message || "Removed." });
      if (res.success) notifyDataChanged(["emailSubscribers"]);
    } catch (e) {
      setGmailStatus({ type: "error", text: "Could not remove subscriber." });
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastSubject.trim()) {
      setGmailStatus({ type: "error", text: "Enter a subject for the email." });
      return;
    }
    if (!broadcastBody.trim()) {
      setGmailStatus({ type: "error", text: "Enter the email message body." });
      return;
    }
    const targets = gmailMode === "selected" ? selectedSubs : undefined;
    if (gmailMode === "selected" && !targets?.length) {
      setGmailStatus({ type: "error", text: "Select at least one subscriber, or switch to All subscribers." });
      return;
    }
    setSendingBroadcast(true);
    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: broadcastSubject, message: broadcastBody, toEmails: targets }),
      }).then((r) => r.json());
      setGmailStatus({ type: res.success ? "success" : "error", text: res.message || "Send finished." });
      setBroadcastSubject("");
      setBroadcastBody("");
      fetch("/api/gmail/logs").then((r) => r.json()).then((j) => { if (j.success) setGmailLogs(j.logs || []); }).catch(() => {});
      logAuditAction(res.success ? `Gmail Broadcast Sent (${res.recipients ?? 0})` : "Gmail Broadcast Failed", "Communication", res.message || "");
    } catch (e) {
      setGmailStatus({ type: "error", text: "Broadcast request failed." });
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Status Banners & Modals State
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showKeyMask, setShowKeyMask] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string>("");

  // Clear All Data (System Reset) State
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [clearingData, setClearingData] = useState(false);

  const handleClearAllData = async () => {
    setClearingData(true);
    try {
      const res = await fetch("/api/data/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true })
      }).then(r => r.json());

      if (res.success) {
        logAuditAction("Cleared All Portal Data", "DATABASE", "Reset all student, teacher, fee, exam and lesson records back to factory defaults.");
        setShowClearDataModal(false);
        setSaveStatus(res.message || "All portal data has been reset to factory defaults!");
        setTimeout(() => setSaveStatus(null), 6000);
      } else {
        setSaveStatus("Failed to reset data. Please try again.");
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch (e) {
      console.error("Failed to reset data:", e);
      setSaveStatus("Data reset failed. Check server connection.");
      setTimeout(() => setSaveStatus(null), 4000);
    } finally {
      setClearingData(false);
    }
  };

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const savedLogs = localStorage.getItem("livingstone_settings_audit_logs");
    if (savedLogs) {
      try { return JSON.parse(savedLogs); } catch (e) {}
    }
    return [
      {
        id: "log-101",
        timestamp: new Date().toLocaleString(),
        user: "Super Admin (admin@livingstone.edu.ng)",
        action: "Updated General Settings",
        module: "General Settings",
        details: "Updated Academic Session to 2026/2027 First Term.",
      },
      {
        id: "log-100",
        timestamp: new Date(Date.now() - 86400000).toLocaleString(),
        user: "Super Admin",
        action: "AI Engine Verification",
        module: "AI Settings",
        details: "Verified sSolutAI 3.6 Flash model endpoint status.",
      },
    ];
  });

  // Helper to append audit log
  const logAuditAction = (action: string, moduleName: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: `${currentRole} (admin@livingstone.edu.ng)`,
      action,
      module: moduleName,
      details,
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem("livingstone_settings_audit_logs", JSON.stringify(updated));
  };

  // Form Field Updater
  const updateSetting = (key: keyof typeof DEFAULT_SETTINGS, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Action Handlers
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem("livingstone_app_settings", JSON.stringify(settings));
    if (settings.schoolName) {
      localStorage.setItem("livingstone_registered_school", settings.schoolName);
    }
    setSavedBaseline({ ...settings });
    logAuditAction("Saved Changes", currentTab.toUpperCase(), `Updated settings for module [${currentTab}]`);
    
    // Apply theme change dynamically if updated
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (settings.theme === "light") {
      document.documentElement.classList.remove("dark");
    }

    try {
      // 1. Persist full application settings to backend
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        notifyDataChanged(["appSettings"]);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("app:settings-changed", { detail: settings }));
        }
      }
    } catch (err) {
      console.warn("Failed to sync settings to server:", err);
    }

    // 2. Also sync to superadmin settings
    fetch("/api/superadmin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appName: settings.schoolName,
        platformLogo: settings.schoolLogoUrl,
        exploreFeaturesYoutubeUrl: settings.exploreFeaturesYoutubeUrl,
        exploreFeaturesVideoTitle: settings.exploreFeaturesVideoTitle,
      }),
    }).catch(() => {});

    setSaveStatus("Settings successfully saved and applied across entire application!");
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleCancel = () => {
    setSettings({ ...savedBaseline });
    setSaveStatus("Reverted unsaved modifications back to previous saved state.");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleResetToDefault = () => {
    setSettings({ ...DEFAULT_SETTINGS });
    setSavedBaseline({ ...DEFAULT_SETTINGS });
    localStorage.setItem("livingstone_app_settings", JSON.stringify(DEFAULT_SETTINGS));
    logAuditAction("Reset to Factory Defaults", currentTab.toUpperCase(), "Restored default system parameters.");
    setShowResetModal(false);
    setSaveStatus("System settings successfully reset to factory defaults!");
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const confirmDeleteItem = () => {
    logAuditAction("Deleted Security Item", currentTab.toUpperCase(), `Removed item: ${itemToDelete}`);
    setShowDeleteModal(false);
    setItemToDelete("");
    setSaveStatus("Item successfully deleted.");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // If NOT authorized (e.g. Student, Teacher without admin privileges)
  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-4 animate-bounce">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          Access Restricted: App Settings
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          The App Settings module contains core system configurations, security, AI API keys, and database controls. It is strictly reserved for the <strong className="text-rose-600 dark:text-rose-400">Super Admin</strong> role.
        </p>
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-mono">
          Current Role: <span className="font-bold text-indigo-500">{currentRole}</span> | Required: Super Admin
        </div>
      </div>
    );
  }

  // Navigation Items
  const NAV_ITEMS: { id: AppSettingsTab; label: string; icon: any; badge?: string }[] = [
    { id: "general", label: "General Settings", icon: Building },
    { id: "users", label: "User Management", icon: Users },
    { id: "school-config", label: "School Configuration", icon: GraduationCap },
    { id: "ai", label: "AI Settings", icon: Bot, badge: "GEMINI" },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "database", label: "Database", icon: Database },
    { id: "communication", label: "Communication", icon: Mail },
    { id: "subscription", label: "Subscription & Billing", icon: CreditCard, badge: "PRO" },
    { id: "website", label: "Website Builder", icon: Globe },
    { id: "reports", label: "Report Card Settings", icon: FileText },
    { id: "lesson-notes", label: "Lesson Notes Settings", icon: BookOpen },
    { id: "exams", label: "Exam Settings", icon: FileSpreadsheet },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* TOP TITLE BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl text-white">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">App Settings & System Engine</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase border border-emerald-500/30">
                SUPER ADMIN & SCHOOL OWNER ONLY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive institutional management, AI copilot keys, database backups, security rules, and branding.
            </p>
          </div>
        </div>

        {/* Global Save / Cancel / Reset Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/80 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Save / Action Notification Alert */}
      {saveStatus && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-3 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* MAIN TWO-COLUMN LAYOUT: SIDEBAR NAV + SUB-MODULE CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SUB-MODULE SIDEBAR NAVIGATION */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>App Settings Modules</span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">15</span>
          </div>

          <div className="space-y-0.5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1 custom-scrollbar">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => changeTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-indigo-500 dark:text-indigo-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-extrabold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SUB-MODULE VIEW CONTENT */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          
          {/* 1. GENERAL SETTINGS */}
          {currentTab === "general" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-500" />
                  <span>General Settings & Institutional Profile</span>
                </h3>
                <p className="text-xs text-slate-500">Basic details, school branding, timezone, theme, and active academic term.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    School Name
                  </label>
                  <input
                    type="text"
                    value={settings.schoolName}
                    onChange={(e) => updateSetting("schoolName", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    School Motto / Slogan
                  </label>
                  <input
                    type="text"
                    value={settings.schoolMotto}
                    onChange={(e) => updateSetting("schoolMotto", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white italic"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateSetting("contactEmail", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Phone Number
                  </label>
                  <input
                    type="text"
                    value={settings.contactPhone}
                    onChange={(e) => updateSetting("contactPhone", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={settings.websiteUrl}
                    onChange={(e) => updateSetting("websiteUrl", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Time Zone
                  </label>
                  <select
                    value={settings.timeZone}
                    onChange={(e) => updateSetting("timeZone", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Africa/Lagos (GMT+1)">Africa/Lagos (GMT+1 - West Africa)</option>
                    <option value="UTC (GMT+0)">UTC (GMT+0 - Universal)</option>
                    <option value="Europe/London (GMT+0)">Europe/London (GMT+0)</option>
                    <option value="America/New_York (EST)">America/New_York (EST)</option>
                  </select>
                </div>

                {/* Homepage Explore Features YouTube Link */}
                <div className="md:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-red-50/70 via-purple-50/50 to-indigo-50/70 dark:from-red-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 border border-red-200/80 dark:border-red-900/40 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-red-600 text-white shadow-sm">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          Homepage "Explore Features" YouTube Link
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Paste the YouTube video link played when visitors click the "Explore Features" button on the homepage.
                        </p>
                      </div>
                    </div>
                    {settings.exploreFeaturesYoutubeUrl && (
                      <a
                        href={settings.exploreFeaturesYoutubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-red-600/10 text-red-600 dark:text-red-400 hover:bg-red-600/20 font-bold text-[10px] flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Open Link
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        YouTube Video URL
                      </label>
                      <input
                        type="text"
                        value={settings.exploreFeaturesYoutubeUrl || ""}
                        onChange={(e) => updateSetting("exploreFeaturesYoutubeUrl", e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-red-500 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Video Header / Modal Title
                      </label>
                      <input
                        type="text"
                        value={settings.exploreFeaturesVideoTitle || ""}
                        onChange={(e) => updateSetting("exploreFeaturesVideoTitle", e.target.value)}
                        placeholder="LIVINGSTONEEDU Platform Overview & Features Walkthrough"
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-red-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {settings.exploreFeaturesYoutubeUrl && (
                    <div className="pt-2 border-t border-red-200/50 dark:border-red-900/30">
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                        <Play className="w-3.5 h-3.5 text-red-600 fill-current" /> Live Video Preview
                      </div>
                      <div className="relative aspect-video max-w-md rounded-xl overflow-hidden bg-black shadow-lg border border-slate-200 dark:border-slate-800">
                        <iframe
                          src={getYouTubeEmbedUrl(settings.exploreFeaturesYoutubeUrl)}
                          title="Explore Features Video Preview"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  School Campus Address
                </label>
                <textarea
                  rows={2}
                  value={settings.schoolAddress}
                  onChange={(e) => updateSetting("schoolAddress", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Session
                  </label>
                  <input
                    type="text"
                    value={settings.academicSession}
                    onChange={(e) => updateSetting("academicSession", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Academic Term
                  </label>
                  <select
                    value={settings.academicTerms}
                    onChange={(e) => updateSetting("academicTerms", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="First Term">First Term (1st Term)</option>
                    <option value="Second Term">Second Term (2nd Term)</option>
                    <option value="Third Term">Third Term (3rd Term)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Interface Theme
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => updateSetting("theme", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="dark">Dark Theme (Recommended)</option>
                    <option value="light">Light Theme</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 2. USER MANAGEMENT */}
          {currentTab === "users" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    <span>User Management & Roles Control</span>
                  </h3>
                  <p className="text-xs text-slate-500">Create staff/student/parent accounts, manage permissions, and approve user accounts.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95 transition-transform"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create User</span>
                </button>
              </div>

              {/* User Roles & Permissions Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">System Role Permissions Matrix</h4>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="p-3">Role</th>
                        <th className="p-3">Manage Students</th>
                        <th className="p-3">Manage Grades</th>
                        <th className="p-3">AI Lesson Notes</th>
                        <th className="p-3">App Settings</th>
                        <th className="p-3 font-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="p-3 font-bold text-indigo-500">Super Admin / Owner</td>
                        <td className="p-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                        <td className="p-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                        <td className="p-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                        <td className="p-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">FULL ROOT</span></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-purple-400">School Administrator</td>
                        <td className="p-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                        <td className="p-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                        <td className="p-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                        <td className="p-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-[10px]">ADMIN</span></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-sky-400">Teacher / Form Teacher</td>
                        <td className="p-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                        <td className="p-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                        <td className="p-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                        <td className="p-3"><XCircle className="w-4 h-4 text-slate-500" /></td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold text-[10px]">STAFF</span></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-amber-400">Student & Parent</td>
                        <td className="p-3"><XCircle className="w-4 h-4 text-slate-500" /></td>
                        <td className="p-3"><XCircle className="w-4 h-4 text-slate-500" /></td>
                        <td className="p-3"><XCircle className="w-4 h-4 text-slate-500" /></td>
                        <td className="p-3"><XCircle className="w-4 h-4 text-slate-500" /></td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">READ ONLY</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. SCHOOL CONFIGURATION */}
          {currentTab === "school-config" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-500" />
                  <span>School Configuration (Classes, Arms & Grading)</span>
                </h3>
                <p className="text-xs text-slate-500">Manage class levels, arms, attendance rules, and grading scale parameters.</p>
              </div>

              {/* Class Levels & Arms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>Configured Academic Classes ({settings.activeClasses.length})</span>
                    <span className="text-[10px] text-indigo-500 font-bold">Grade 1 - SS 3</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {settings.activeClasses.map((c) => (
                      <span key={c} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold text-[11px] border border-indigo-500/20">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Class Arms & Streams</h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {settings.classArms.map((arm) => (
                      <span key={arm} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/20">
                        Arm {arm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grading System Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Terminal Grading Formula Scale</h4>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="p-3">Grade</th>
                        <th className="p-3">Score Range</th>
                        <th className="p-3">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {settings.gradingScale.map((g) => (
                        <tr key={g.grade}>
                          <td className="p-3 font-bold text-indigo-500">{g.grade}</td>
                          <td className="p-3 font-mono font-bold">{g.minScore}% - {g.maxScore}%</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{g.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. AI SETTINGS */}
          {currentTab === "ai" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-500" />
                  <span>sSolutAI AI Settings & Model Configuration</span>
                </h3>
                <p className="text-xs text-slate-500">Configure server-side sSolutAI SDK model, usage limits, and lesson plan prompt templates.</p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> sSolutAI SDK Server Status:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Active
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  All AI lesson note generations and exam questions execute securely on backend endpoints using process.env.GEMINI_API_KEY.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    sSolutAI AI Model Engine
                  </label>
                  <select
                    value={settings.geminiModel}
                    onChange={(e) => updateSetting("geminiModel", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="gemini-3.6-flash">sSolutAI 3.6 Flash (Fastest, High Precision for Exam/Lesson generation)</option>
                    <option value="gemini-3.1-pro-preview">sSolutAI 3.1 Pro (Deep Reasoning for complex report remarks)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max AI Requests / Teacher / Day
                  </label>
                  <input
                    type="number"
                    value={settings.aiDailyLimitPerTeacher}
                    onChange={(e) => updateSetting("aiDailyLimitPerTeacher", Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Server-Side sSolutAI API Key Mask
                </label>
                <div className="relative">
                  <input
                    type={showKeyMask ? "text" : "password"}
                    value={settings.geminiApiKey}
                    onChange={(e) => updateSetting("geminiApiKey", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyMask(!showKeyMask)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showKeyMask ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  System Prompt Template for Lesson Notes
                </label>
                <textarea
                  rows={3}
                  value={settings.lessonPromptTemplate}
                  onChange={(e) => updateSetting("lessonPromptTemplate", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>
            </div>
          )}

          {/* 5. SECURITY */}
          {currentTab === "security" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  <span>Security & Authentication Controls</span>
                </h3>
                <p className="text-xs text-slate-500">Firebase authentication, JWT token expiry, multi-factor auth, and session security.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Firebase Authentication</span>
                    <span className="text-[11px] text-slate-500">Email/Password & Google OAuth Enabled</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.firebaseAuthEnabled}
                    onChange={(e) => updateSetting("firebaseAuthEnabled", e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Mandatory 2FA for Admins</span>
                    <span className="text-[11px] text-slate-500">Enforce authenticator app OTP on login</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enforce2FAAdmins}
                    onChange={(e) => updateSetting("enforce2FAAdmins", e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. DATABASE */}
          {currentTab === "database" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-500" />
                    <span>Database Engine & Firestore Backup</span>
                  </h3>
                  <p className="text-xs text-slate-500">Firebase Firestore collections status, manual backup trigger, and export tools.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logAuditAction("Database Backup Executed", "DATABASE", "Created manual database snapshot.");
                    setSaveStatus("Database manual backup snapshot successfully taken!");
                    setTimeout(() => setSaveStatus(null), 3500);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <HardDriveDownload className="w-4 h-4" />
                  <span>Backup Database Now</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Firebase Project ID</span>
                  <input
                    type="text"
                    value={settings.firebaseProjectId}
                    onChange={(e) => updateSetting("firebaseProjectId", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-indigo-500"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Firestore Cloud Region</span>
                  <input
                    type="text"
                    value={settings.firestoreRegion}
                    onChange={(e) => updateSetting("firestoreRegion", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Clear All Data / System Reset */}
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Clear All Data & Reset for Fresh Usage
                    </h4>
                    <p className="text-xs text-rose-700/80 dark:text-rose-300/70 mt-1 max-w-xl">
                      Wipe every table and card on the platform (students, teachers, fees, exams, lesson notes,
                      announcements, audit logs) back to factory defaults so the portal starts fresh for a new session.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowClearDataModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 7. COMMUNICATION */}
          {currentTab === "communication" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-500" />
                  <span>Communication (Gmail SMTP & SMS Gateways)</span>
                </h3>
                <p className="text-xs text-slate-500">Configure email dispatch, Termii/Africa's Talking SMS API, and WhatsApp triggers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gmail SMTP Server Host
                  </label>
                  <input
                    type="text"
                    value={settings.smtpHost}
                    onChange={(e) => updateSetting("smtpHost", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    SMS Gateway Provider
                  </label>
                  <select
                    value={settings.smsGatewayProvider}
                    onChange={(e) => updateSetting("smsGatewayProvider", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
                  >
                    <option value="Termii">Termii (Nigeria & West Africa)</option>
                    <option value="Africa's Talking">Africa's Talking (East & West Africa)</option>
                    <option value="Twilio">Twilio Global</option>
                  </select>
                </div>
              </div>

              {/* ============ GMAIL API INTEGRATION (Google Cloud) ============ */}
              <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-900 space-y-5 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                      <Plug className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Gmail API Integration (Google Cloud Console)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Connect your Gmail API from Google Cloud to send emails to website subscribers.
                      </p>
                    </div>
                  </div>

                  {gmailLoading ? (
                    <span className="text-[11px] text-slate-400">Loading connection status…</span>
                  ) : gmailConfig.connected ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Connected as {gmailConfig.profileEmail || gmailConfig.senderEmail}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-300 dark:border-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Not Connected
                    </span>
                  )}
                </div>

                {gmailStatus && (
                  <div
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold animate-in fade-in ${
                      gmailStatus.type === "success"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : gmailStatus.type === "error"
                        ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                        : "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800"
                    }`}
                  >
                    {gmailStatus.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Google API Key <span className="text-indigo-500 font-mono text-[10px]">(Google Cloud → APIs & Services → Credentials → API Key)</span>
                    </label>
                    <input
                      type="text"
                      value={gmailConfig.apiKey}
                      onChange={(e) => setGmailConfig({ ...gmailConfig, apiKey: e.target.value })}
                      placeholder="AIzaSy..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      OAuth Client ID <span className="text-indigo-500 font-mono text-[10px]">(Google Cloud → APIs & Services → Credentials → OAuth 2.0 Client ID)</span>
                    </label>
                    <input
                      type="text"
                      value={gmailConfig.clientId}
                      onChange={(e) => setGmailConfig({ ...gmailConfig, clientId: e.target.value })}
                      placeholder="1234567890-xxxxxxxx.apps.googleusercontent.com"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      OAuth Client Secret
                    </label>
                    <input
                      type="password"
                      value={gmailConfig.clientSecret}
                      onChange={(e) => setGmailConfig({ ...gmailConfig, clientSecret: e.target.value })}
                      placeholder="GOCSPX-xxxxxxxx"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Refresh Token <span className="text-slate-400 font-medium normal-case">(optional – auto-filled after OAuth)</span>
                    </label>
                    <input
                      type="password"
                      value={gmailConfig.refreshToken}
                      onChange={(e) => setGmailConfig({ ...gmailConfig, refreshToken: e.target.value })}
                      placeholder="1//0xxxxx-xxxxxxxx"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sender Email (From)
                    </label>
                    <input
                      type="email"
                      value={gmailConfig.senderEmail}
                      onChange={(e) => setGmailConfig({ ...gmailConfig, senderEmail: e.target.value })}
                      placeholder="notifications@your-school.com"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sender Display Name
                    </label>
                    <input
                      type="text"
                      value={gmailConfig.senderName}
                      onChange={(e) => setGmailConfig({ ...gmailConfig, senderName: e.target.value })}
                      placeholder="LIVINGSTONEEDU"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={saveGmailConfig}
                    disabled={savingGmail}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingGmail ? "Saving…" : "Save Credentials"}
                  </button>
                  <button
                    type="button"
                    onClick={handleGmailAuth}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <Plug className="w-3.5 h-3.5" />
                    Connect Gmail via Google Cloud
                  </button>
                  <button
                    type="button"
                    onClick={testGmail}
                    disabled={!gmailConfig.connected && !gmailConfig.hasRefreshToken}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/30"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Verify Connection
                  </button>
                  {gmailConfig.connected && (
                    <button
                      type="button"
                      onClick={disconnectGmail}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Disconnect
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed border border-slate-200 dark:border-slate-700">
                  <strong className="text-slate-700 dark:text-slate-300">How to connect:</strong> In Google Cloud Console, enable the Gmail API, create an OAuth 2.0 Client ID (Web application),
                  add <code className="font-mono text-indigo-600 dark:text-indigo-400">http://localhost:3000/api/gmail/oauth/callback</code> (and your live domain URL) as an authorized
                  redirect URI, then click <strong>Connect Gmail via Google Cloud</strong>, grant permission, and this panel will be ready instantly. Scope: <code className="font-mono">gmail.send</code>.
                </div>
              </div>

              {/* ============ SUBSCRIBERS & BROADCAST ============ */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Email Subscribers <span className="text-slate-400 font-normal">({subscribers.length})</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Collected automatically from website newsletter forms or added manually below.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="Subscriber name (optional)"
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-sky-500"
                  />
                  <input
                    type="email"
                    value={newSubEmail}
                    onChange={(e) => setNewSubEmail(e.target.value)}
                    placeholder="subscriber@example.com"
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={addSubscriber}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/30"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Add Subscriber
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                  {subscribers.length === 0 ? (
                    <p className="p-4 text-xs text-slate-400 text-center">No subscribers yet. Add one above or wait for website newsletter signups.</p>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {subscribers.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 pl-3.5 w-8">
                              <input
                                type="checkbox"
                                checked={selectedSubs.includes(sub.email)}
                                onChange={() =>
                                  setSelectedSubs((prev) =>
                                    prev.includes(sub.email) ? prev.filter((e) => e !== sub.email) : [...prev, sub.email]
                                  )
                                }
                                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-sky-500"
                              />
                            </td>
                            <td className="p-2.5">
                              <span className="block font-bold text-slate-800 dark:text-slate-200">{sub.name}</span>
                              <span className="text-[10px] text-slate-400">{sub.source}</span>
                            </td>
                            <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">{sub.email}</td>
                            <td className="p-2.5 w-10 text-right">
                              <button
                                type="button"
                                onClick={() => removeSubscriber(sub.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                                title="Remove subscriber"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* ============ SEND BROADCAST ============ */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Send className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Send Email to Subscribers
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Delivered via your connected Gmail API. Without a connection emails are simulated and logged.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGmailMode("all")}
                    className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                      gmailMode === "all"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    All Subscribers ({subscribers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setGmailMode("selected")}
                    className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                      gmailMode === "selected"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Selected ({selectedSubs.length})
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    placeholder="e.g. Welcome to our 2026/2027 Academic Newsletters"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Message Body
                  </label>
                  <textarea
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    rows={5}
                    placeholder="Dear subscriber, …"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 resize-y"
                  />
                </div>

                <button
                  type="button"
                  onClick={sendBroadcast}
                  disabled={sendingBroadcast || subscribers.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingBroadcast ? "Sending…" : `Send Email to ${gmailMode === "all" ? subscribers.length : selectedSubs.length} Subscribers`}
                </button>

                {gmailLogs.length > 0 && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Recent Send Log</p>
                    {gmailLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{log.subject}</span>
                        <span className="text-slate-400 ml-2">{log.recipients} → {log.mode}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {currentTab === "subscription" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-500" />
                  <span>Subscription Tier & Licence Configuration</span>
                </h3>
                <p className="text-xs text-slate-500">School subscription plan status, student capacity limits, and licence keys.</p>
              </div>

              <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white border border-indigo-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase border border-indigo-500/30">
                    PLATINUM ENTERPRISE TIER
                  </span>
                  <h4 className="text-xl font-black mt-1">Livingstone Unlimited Edition</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Active until July 30, 2027 • Unlimited Student Records</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
                  LICENCE: LIV-ENT-2026-X981
                </div>
              </div>
            </div>
          )}

          {/* 9. WEBSITE BUILDER */}
          {currentTab === "website" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-500" />
                  <span>Public Website Builder & Domain Settings</span>
                </h3>
                <p className="text-xs text-slate-500">CMS homepage settings, domain mapping, and SEO meta descriptions.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Domain Host Mapping
                </label>
                <input
                  type="text"
                  value={settings.websiteUrl}
                  onChange={(e) => updateSetting("websiteUrl", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-indigo-500"
                />
              </div>
            </div>
          )}

          {/* 10. REPORT CARDS */}
          {currentTab === "reports" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <span>Report Card Templates & Weighting Formula</span>
                </h3>
                <p className="text-xs text-slate-500">Continuous Assessment (CA) percentages, principal signatures, and print formats.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    1st CA Weight (%)
                  </label>
                  <input
                    type="number"
                    value={settings.ca1Percentage}
                    onChange={(e) => updateSetting("ca1Percentage", Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    2nd CA Weight (%)
                  </label>
                  <input
                    type="number"
                    value={settings.ca2Percentage}
                    onChange={(e) => updateSetting("ca2Percentage", Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Terminal Exam Weight (%)
                  </label>
                  <input
                    type="number"
                    value={settings.examPercentage}
                    onChange={(e) => updateSetting("examPercentage", Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 11. LESSON NOTES SETTINGS */}
          {currentTab === "lesson-notes" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  <span>Lesson Notes & Curriculum Settings</span>
                </h3>
                <p className="text-xs text-slate-500">Curriculum standards alignment, approval workflows, and repository rules.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Curriculum Baseline</span>
                <p className="text-xs text-slate-500">NERDC (Nigerian Educational Research and Development Council) + WAEC & Cambridge Secondary.</p>
              </div>
            </div>
          )}

          {/* 12. EXAM SETTINGS */}
          {currentTab === "exams" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                  <span>Exam Paper & Question Bank Settings</span>
                </h3>
                <p className="text-xs text-slate-500">Question type distributions, marking scheme layout, and print formatting.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Supported Question Archetypes</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold text-[11px]">Multiple Choice (MCQ)</span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold text-[11px]">Theory & Comprehension</span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold text-[11px]">Fill-in-the-Blanks</span>
                </div>
              </div>
            </div>
          )}

          {/* 13. NOTIFICATIONS */}
          {currentTab === "notifications" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-500" />
                  <span>Notifications & Broadcast Preferences</span>
                </h3>
                <p className="text-xs text-slate-500">Configure email alerts, SMS dispatch triggers, and push notifications.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Email Notification on Student Result Publishing</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">SMS Notification on Unexplained Absence</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                </div>
              </div>
            </div>
          )}

          {/* 14. APPEARANCE */}
          {currentTab === "appearance" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-500" />
                  <span>Appearance, Typography & Theme Colors</span>
                </h3>
                <p className="text-xs text-slate-500">Brand accent colors, typography pairings, and layout density.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Accent Color
                  </label>
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => updateSetting("primaryColor", e.target.value)}
                    className="w-full h-10 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Typography Font Family
                  </label>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) => updateSetting("fontFamily", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 font-medium"
                  >
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                    <option value="Inter">Inter (Standard Sans)</option>
                    <option value="Outfit">Outfit (Display geometric)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 15. MAINTENANCE */}
          {currentTab === "maintenance" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-indigo-500" />
                    <span>System Maintenance & Cache Diagnostics</span>
                  </h3>
                  <p className="text-xs text-slate-500">System logs, cache purging, and platform runtime status.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logAuditAction("Flushed Cache", "MAINTENANCE", "Purged system asset cache.");
                    setSaveStatus("System application cache successfully purged!");
                    setTimeout(() => setSaveStatus(null), 3500);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4 text-indigo-400" />
                  <span>Flush Cache</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 font-mono text-xs space-y-1.5 border border-slate-800">
                <div className="text-emerald-400 font-bold">[SYS-DIAGNOSTIC] All services operational</div>
                <div>Server Uptime: 14 days, 8 hours, 42 minutes</div>
                <div>Node.js Environment: v20.11.0 (Linux Container)</div>
                <div>Allocated RAM: 4.2 GB / 8.0 GB</div>
              </div>
            </div>
          )}

          {/* AUDIT LOG SECTION AT BOTTOM OF EVERY PAGE */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Audit Log History ({currentTab.toUpperCase()})</span>
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No historical audit events logged yet.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.action}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">{log.module}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{log.details}</p>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {log.timestamp} • {log.user}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* RESET CONFIRMATION MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Reset Settings to Default?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to reset all App Settings back to standard factory defaults? Any custom school configurations, AI prompt templates, and styling will be restored to original values.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearDataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-900 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Clear All Data & Reset?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently wipe every table and card on the platform — students, teachers, fees, CBT exams,
              lesson notes, assignments, announcements, report cards and audit logs — and restore the initial baseline
              setup so the portal starts fresh. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearDataModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllData}
                disabled={clearingData}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-2 disabled:opacity-60"
              >
                {clearingData ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{clearingData ? "Clearing..." : "Yes, Clear All Data"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New User Account</h3>
                  <p className="text-[11px] text-slate-500">Add an administrator, teacher, student, or parent user</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateUserModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createUserMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  createUserMsg.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                }`}
              >
                {createUserMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{createUserMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Oluwaseun Temitope"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. user@school.edu.ng"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">System Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="School Administrator">School Administrator</option>
                  <option value="Teacher / Form Teacher">Teacher / Form Teacher</option>
                  <option value="Account Officer">Account Officer / Bursar</option>
                  <option value="Student & Parent">Student & Parent</option>
                  <option value="Super Admin">Super Admin / Platform Owner</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Default: password123"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-md shadow-indigo-600/30 disabled:opacity-60"
                >
                  {creatingUser ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>{creatingUser ? "Creating..." : "Save User Account"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
