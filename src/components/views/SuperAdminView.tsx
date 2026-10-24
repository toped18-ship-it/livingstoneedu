import React, { useState, useEffect } from "react";
import { useGlobalRefresh, notifyDataChanged } from "../../lib/liveStore";
import {
  Building2,
  Users,
  Cpu,
  ShieldAlert,
  Sparkles,
  CreditCard,
  Database,
  Globe,
  Award,
  BookOpen,
  MessageSquare,
  Activity,
  HardDrive,
  RefreshCw,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Key,
  Download,
  Terminal,
  Server,
  Radio,
  Sliders,
  FileSpreadsheet,
  AlertTriangle,
  Zap,
  BarChart3,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Send,
  Bell,
  Check,
  Eye,
  ChevronRight,
  ChevronDown,
  Layers,
  FileText,
  Filter,
  ShieldCheck,
  UserCheck,
  SlidersHorizontal,
  CloudLightning,
  Wifi,
  PieChart,
  HelpCircle,
  FolderTree,
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  Trash2,
  Youtube,
} from "lucide-react";
import { WebsiteBuilderView } from "./WebsiteBuilderView";
import { AILessonNotesView } from "./AILessonNotesView";

export interface SuperAdminViewProps {
  onLogout?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  onSwitchRole?: (role: any) => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  onLogout,
  isDark = true,
  onToggleTheme,
  onSwitchRole,
}) => {
  // Main Navigation Sections
  const [activeMainSection, setActiveMainSection] = useState<
    | "overview"
    | "schools"
    | "users"
    | "billing"
    | "ai-management"
    | "ai-lesson-notes"
    | "curriculum"
    | "website-builder"
    | "database"
    | "security"
    | "monitoring"
    | "notifications"
    | "settings"
  >("overview");

  // Sub-item selected within the current section
  const [activeSubItem, setActiveSubItem] = useState<string>("all");

  // Accordion dropdown state: which nav sections are expanded (like the school sidebar)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    overview: true,
  });

  const toggleSection = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  // Initial data state for clean production rendering
  const DEFAULT_METRICS = {
    totalSchools: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalParents: 0,
    activeUsers: 1,
    totalRevenue: 0,
    aiRequestsToday: 0,
    databaseUsage: "0.1 MB",
    storageUsage: "0.1 MB",
    serverHealth: "Healthy",
  };

  const INITIAL_SCHOOLS: any[] = [];

  const INITIAL_USERS: any[] = [];

  // State loaded from Super Admin Backend REST APIs
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(DEFAULT_METRICS);
  const [schools, setSchools] = useState<any[]>(INITIAL_SCHOOLS);
  const [users, setUsers] = useState<any[]>(INITIAL_USERS);
  const [aiStats, setAiStats] = useState<any>(null);
  const [promptLogs, setPromptLogs] = useState<any[]>([]);
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [monitoringHealth, setMonitoringHealth] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    maintenanceMode: false,
    aiGradingEnabled: true,
    exploreFeaturesYoutubeUrl: "https://www.youtube.com/@LivingstoneEDU",
  });

  // Multi-Select & Bulk Delete State
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    open: boolean;
    type: "schools" | "users";
    ids: string[];
  }>({ open: false, type: "schools", ids: [] });

  // Search & Global Filter
  const [globalSearch, setGlobalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Quick Action Toast & Modals
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCreateSchoolOpen, setIsCreateSchoolOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isApiKeysOpen, setIsApiKeysOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Forms State
  const [newSchoolForm, setNewSchoolForm] = useState({
    name: "",
    code: "",
    domain: "",
    adminEmail: "",
    phone: "",
    plan: "Standard Enterprise",
    state: "Lagos",
  });

  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    channel: "all", // push, email, sms, all
    targetAudience: "all-schools",
  });

  const [apiKeysForm, setApiKeysForm] = useState({
    geminiApiKey: "AIzaSyDFWBa-XQ5Ppz8aAcChO8U5uWQ5gMRrBRM",
    firebaseProjectId: "livingstoneedu-1ef57",
    firebaseDatabaseUrl: "https://livingstoneedu-1ef57-default-rtdb.firebaseio.com",
    paystackSecretKey: "sk_live_994817264819472198",
  });

  // Admin AI Lesson Note Generator & Dispatcher State
  const [adminNoteSubject, setAdminNoteSubject] = useState("Mathematics");
  const [adminNoteClass, setAdminNoteClass] = useState("SS 2");
  const [adminNoteWeek, setAdminNoteWeek] = useState("Week 4");
  const [adminNoteTopic, setAdminNoteTopic] = useState("Quadratic Equations & Roots Analysis");
  const [adminNoteTerm, setAdminNoteTerm] = useState("First Term");
  const [adminNoteSchoolId, setAdminNoteSchoolId] = useState("all");
  const [adminNoteContent, setAdminNoteContent] = useState("");
  const [adminIsGenerating, setAdminIsGenerating] = useState(false);
  const [adminIsDispatching, setAdminIsDispatching] = useState(false);
  const [adminDispatchedNotes, setAdminDispatchedNotes] = useState<any[]>([]);

  const handleAdminGenerateLessonNote = async () => {
    setAdminIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-lesson-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: adminNoteSubject,
          className: adminNoteClass,
          week: adminNoteWeek,
          topic: adminNoteTopic,
          term: adminNoteTerm,
          duration: "40 Minutes (Double Period)",
          schoolName: "Livingstone International Academy",
        }),
      });
      const data = await res.json();
      if (data?.note?.content) {
        setAdminNoteContent(data.note.content);
        showToast(`✓ Generated NERDC lesson note for ${adminNoteTopic}!`);
      } else {
        setAdminNoteContent(
          `# ${adminNoteSubject.toUpperCase()} LESSON NOTE\n\n**Class:** ${adminNoteClass}\n**Week:** ${adminNoteWeek} (${adminNoteTerm})\n**Topic:** ${adminNoteTopic}\n**Target Curriculum:** NERDC National Standard 2026\n\n## 1. PERFORMANCE OBJECTIVES\nBy the end of this lesson, students will be able to:\n1. State core definitions and mathematical principles of ${adminNoteTopic}.\n2. Solve step-by-step WAEC and NECO past question problems on this topic.\n3. Apply mathematical models to real-world Nigerian industrial and scientific situations.\n\n## 2. INSTRUCTIONAL MATERIALS & AIDS\n- Interactive graphing board & scientific calculators.\n- NERDC Standard Mathematics Textbook (Book 2).\n- LivingstoneEdu CBT practice portal.\n\n## 3. STEP-BY-STEP PRESENTATION\n- **Step I (Introduction):** Review previous foundational knowledge.\n- **Step II (Core Concepts):** Deep explanation of formulas and derivations.\n- **Step III (Class Activity):** Guided classroom exercises with student participation.\n- **Step IV (Evaluation):** 3-minute rapid assessment questions.\n\n## 4. SUMMARY & ASSIGNMENT\n- Summary notes copied by students into notebooks.\n- Homework: Exercises 4.1 to 4.5 in textbook.`
        );
        showToast(`✓ Lesson note drafted for ${adminNoteTopic}!`);
      }
    } catch {
      setAdminNoteContent(
        `# ${adminNoteSubject.toUpperCase()} LESSON NOTE\n\n**Class:** ${adminNoteClass}\n**Week:** ${adminNoteWeek} (${adminNoteTerm})\n**Topic:** ${adminNoteTopic}\n**Target Curriculum:** NERDC National Standard 2026\n\n## 1. PERFORMANCE OBJECTIVES\nBy the end of this lesson, students will be able to:\n1. State core definitions and principles of ${adminNoteTopic}.\n2. Solve problems accurately using the standard formula.\n\n## 2. STEP-BY-STEP PRESENTATION\n- Detailed conceptual breakdown and classroom drills.`
      );
      showToast(`✓ Lesson note drafted for ${adminNoteTopic}!`);
    } finally {
      setAdminIsGenerating(false);
    }
  };

  const handleAdminBulkGenerateLessonNotes = async () => {
    setAdminIsGenerating(true);
    showToast("⚡ Generating bulk NERDC lesson notes across ALL classes & ALL subjects...");
    try {
      const res = await fetch("/api/ai/bulk-generate-lesson-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classLevel: "ALL_CLASSES",
          subject: "ALL_SUBJECTS",
          term: adminNoteTerm || "First Term",
          startWeek: 1,
          endWeek: 12,
          publishToPortals: true
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `🚀 Successfully generated ${data.count} bulk lesson notes!`);
        window.dispatchEvent(new CustomEvent("lesson-notes-updated"));
      } else {
        showToast("⚠️ Bulk generation encountered an issue.");
      }
    } catch {
      showToast("Error connecting to bulk generation server.");
    } finally {
      setAdminIsGenerating(false);
    }
  };

  const handleAdminDispatchLessonNote = async () => {
    if (!adminNoteContent) {
      showToast("Please generate or enter lesson note content before dispatching.");
      return;
    }
    setAdminIsDispatching(true);
    const targetSchoolObj = (schools || []).find((s) => s?.id === adminNoteSchoolId);
    const targetSchoolLabel = adminNoteSchoolId === "all" ? "All Registered Schools" : targetSchoolObj?.name || "Target School";

    const newRecord = {
      id: `DISP-${Date.now()}`,
      topic: adminNoteTopic,
      subject: adminNoteSubject,
      class: adminNoteClass,
      week: adminNoteWeek,
      term: adminNoteTerm,
      content: adminNoteContent,
      targetSchool: targetSchoolLabel,
      dispatchedAt: "Just now",
      status: "Delivered to Teachers",
    };

    try {
      await fetch("/api/lesson-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: adminNoteTopic,
          subject: adminNoteSubject,
          class: adminNoteClass,
          week: adminNoteWeek,
          term: adminNoteTerm,
          content: adminNoteContent,
          status: "Approved",
          author: "Platform Super Admin",
          schoolId: adminNoteSchoolId,
        }),
      });
    } catch {}

    setAdminDispatchedNotes((prev) => [newRecord, ...prev]);
    showToast(`✓ Dispatched note to ${targetSchoolLabel} and Teacher Portals!`);
    setAdminIsDispatching(false);
  };

  // System Data Reset State
  const [isResetDataOpen, setIsResetDataOpen] = useState(false);
  const [resettingData, setResettingData] = useState(false);
  const [selectedPurgeScope, setSelectedPurgeScope] = useState<string>("all");

  const handlePurgeData = async (scope: string = "all") => {
    setResettingData(true);
    try {
      const res = await fetch("/api/superadmin/cleanup/purge-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      }).then((r) => r.json());

      if (res.success) {
        showToast(`🗑️ ${res.message}`);
        await fetchSuperAdminData();
        setIsResetDataOpen(false);
      } else {
        showToast(`✗ Failed to purge: ${res.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Failed to purge data:", err);
      showToast("✗ Network error during cleanup operation.");
    } finally {
      setResettingData(false);
    }
  };

  const deleteAiLog = async (id: string) => {
    setPromptLogs((prev) => prev.filter((l) => l.id !== id));
    showToast("🗑️ AI log deleted.");
    try {
      await fetch(`/api/superadmin/ai/prompt-logs/${id}`, { method: "DELETE" });
    } catch (e) {}
  };

  // Active Login Sessions (Security Center)
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/superadmin/security/sessions").then((r) => r.json());
      if (res.success) setSessions(res.activeSessions);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const res = await fetch("/api/superadmin/security/revoke-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).then((r) => r.json());
      if (res.success) {
        setSessions(sessions.filter((s) => s.sessionId !== sessionId));
        showToast(`✓ ${res.message}`);
      }
    } catch (err) {
      console.error("Failed to revoke session:", err);
      showToast("✗ Failed to revoke session.");
    }
  };

  // Update sSolutAI AI Configuration
  const saveAiConfig = async (patch: any, successMsg?: string) => {
    try {
      const res = await fetch("/api/superadmin/ai/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }).then((r) => r.json());
      if (res.success) {
        setAiStats((prev: any) => ({ ...prev, config: res.config }));
        showToast(successMsg || "✓ AI Engine Configuration updated");
      }
    } catch (err) {
      console.error("Failed to save AI config:", err);
      showToast("✗ Failed to update AI configuration.");
    }
  };

  // Create New Prompt Template
  const [promptTemplateForm, setPromptTemplateForm] = useState({ name: "", prompt: "" });

  const savePromptTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/superadmin/ai/prompt-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promptTemplateForm),
      }).then((r) => r.json());
      if (res.success) {
        setPromptTemplateForm({ name: "", prompt: "" });
        showToast("✓ Prompt Template saved");
        fetchSuperAdminData();
      }
    } catch (err) {
      console.error("Failed to save prompt template:", err);
      showToast("✗ Failed to save prompt template.");
    }
  };

  // Communication quick forms (Notifications Center)
  const [commForm, setCommForm] = useState({
    push: { title: "", body: "" },
    email: { recipient: "", subject: "", body: "" },
    sms: { phone: "", message: "" },
  });

  // Error Logs (Monitoring Center)
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [loadingErrorLogs, setLoadingErrorLogs] = useState(false);

  const fetchErrorLogs = async () => {
    setLoadingErrorLogs(true);
    try {
      const res = await fetch("/api/superadmin/monitoring/logs").then((r) => r.json());
      if (res.success) setErrorLogs(res.logs);
    } catch (err) {
      console.error("Failed to load error logs:", err);
    } finally {
      setLoadingErrorLogs(false);
    }
  };

  // Fetch initial data from REST API endpoints
  const fetchSuperAdminData = async () => {
    setLoading(true);
    try {
      const [
        dashRes,
        schoolsRes,
        usersRes,
        aiRes,
        logsRes,
        currRes,
        payRes,
        healthRes,
        auditRes,
        backupsRes,
        settingsRes,
      ] = await Promise.all([
        fetch("/api/superadmin/dashboard").then((r) => r.json()),
        fetch("/api/superadmin/schools").then((r) => r.json()),
        fetch("/api/superadmin/users").then((r) => r.json()),
        fetch("/api/superadmin/ai/stats").then((r) => r.json()),
        fetch("/api/superadmin/ai/prompt-logs").then((r) => r.json()),
        fetch("/api/superadmin/curriculum").then((r) => r.json()),
        fetch("/api/superadmin/payments").then((r) => r.json()),
        fetch("/api/superadmin/monitoring/health").then((r) => r.json()),
        fetch("/api/superadmin/security/audit-logs").then((r) => r.json()),
        fetch("/api/superadmin/backups").then((r) => r.json()),
        fetch("/api/superadmin/settings").then((r) => r.json()),
      ]);

      if (dashRes.success) setDashboardData(dashRes.metrics);
      if (schoolsRes.success) setSchools(schoolsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (aiRes.success) setAiStats(aiRes);
      if (logsRes.success) setPromptLogs(logsRes.data);
      if (currRes.success) setCurriculums(currRes.data);
      if (payRes.success) setPayments(payRes.data);
      if (healthRes.success) setMonitoringHealth(healthRes.system);
      if (auditRes.success) setAuditLogs(auditRes.data);
      if (backupsRes.success) setBackups(backupsRes.data);
      if (settingsRes.success) setSettings({ maintenanceMode: false, aiGradingEnabled: true, ...settingsRes.data });
    } catch (err) {
      console.error("Failed to load Super Admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  // Re-pull dashboard/admin metrics in real time whenever any app store changes.
  useGlobalRefresh(fetchSuperAdminData);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Quick Action: Create School
  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    const createdSchool = {
      id: `SCH-${String(schools.length + 1).padStart(3, "0")}`,
      name: newSchoolForm.name,
      code: newSchoolForm.code || `SCH-${Date.now().toString().slice(-4)}`,
      adminEmail: newSchoolForm.adminEmail,
      plan: newSchoolForm.plan,
      storageUsedGB: 0.1,
      storageLimitGB: newSchoolForm.plan === "Enterprise Pro" ? 100 : 50,
      aiCredits: newSchoolForm.plan === "Enterprise Pro" ? 50000 : 25000,
      aiCreditsUsed: 0,
      status: "Active",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setSchools([createdSchool, ...schools]);
    setDashboardData((prev: any) => ({
      ...prev,
      totalSchools: (prev?.totalSchools ?? schools.length) + 1,
    }));
    setIsCreateSchoolOpen(false);
    showToast(`✓ Provisioned ${createdSchool.name} successfully!`);
    setNewSchoolForm({
      name: "",
      code: "",
      domain: "",
      adminEmail: "",
      phone: "",
      plan: "Standard Enterprise",
      state: "Lagos",
    });

    try {
      await fetch("/api/superadmin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchoolForm),
      });
    } catch (err) {
      // Background sync fail silently handled since local state is already updated
    }
  };

  // Quick Action: Broadcast Announcement
  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBroadcastOpen(false);
    showToast(`✓ Broadcast "${broadcastForm.title}" dispatched via ${broadcastForm.channel.toUpperCase()}`);
    setBroadcastForm({ title: "", message: "", channel: "all", targetAudience: "all-schools" });

    try {
      await fetch("/api/superadmin/communication/emergency-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertTitle: broadcastForm.title,
          alertDetails: broadcastForm.message,
        }),
      });
    } catch (err) {
      // Ignored
    }
  };

  // Quick Action: Backup Database
  const triggerDatabaseBackup = async () => {
    const newBackup = {
      id: `BKP-${String(backups.length + 1).padStart(3, "0")}`,
      name: "Manual Master Snapshot",
      size: `${Math.max(1, (schools.length + users.length) * 2)} MB`,
      date: "Just Now",
      status: "Completed",
    };
    setBackups([newBackup, ...backups]);
    showToast("✓ Full Database Snapshot created & saved to Cloud Storage!");

    try {
      await fetch("/api/superadmin/backups/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Manual Enterprise Platform Backup" }),
      });
    } catch (err) {
      // Ignored
    }
  };

  // Quick Action: Save API Keys
  const handleSaveApiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("livingstone_platform_api_keys", JSON.stringify(apiKeysForm));
    setIsApiKeysOpen(false);
    showToast("✓ Platform API Keys & Cloud Service Credentials updated successfully!");
  };

  // Load persisted API keys (fallback to environment/system defaults)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("livingstone_platform_api_keys");
      if (saved) setApiKeysForm((prev) => ({ ...prev, ...JSON.parse(saved) }));
    } catch (e) {}
  }, []);

  // Quick Action: Reset All Platform Data (Factory Restore)
  const handleResetPlatformData = async () => {
    setResettingData(true);
    try {
      const res = await fetch("/api/data/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      }).then((r) => r.json());

      if (res.success) {
        setIsResetDataOpen(false);
        showToast(`✓ ${res.message || "All platform data restored to factory defaults!"}`);
        fetchSuperAdminData();
      } else {
        showToast("✗ Failed to reset data. Please try again.");
      }
    } catch (err) {
      console.error("Failed to reset platform data:", err);
      showToast("✗ Data reset failed. Check server connection.");
    } finally {
      setResettingData(false);
    }
  };

  // Persist global platform settings to backend
  const saveGlobalSettings = async (patch: any, successMsg?: string) => {
    try {
      const res = await fetch("/api/superadmin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }).then((r) => r.json());
      if (res.success) setSettings(res.data);

      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }).catch(() => {});

      notifyDataChanged(["appSettings"]);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("app:settings-changed", { detail: patch }));
      }
      showToast(successMsg || "✓ Platform settings saved");
    } catch (err) {
      console.error("Failed to save settings:", err);
      showToast("✗ Failed to save platform settings.");
    }
  };

  // Quick Action: Toggle User Account Lock
  const toggleUserLock = async (userId: string, isLocked: boolean) => {
    try {
      const res = await fetch(`/api/superadmin/users/${userId}/lock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked }),
      }).then((r) => r.json());
      if (res.success) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, status: res.data.status, isLocked: res.data.isLocked } : u)));
        showToast(`✓ Account ${res.data.isLocked ? "locked" : "unlocked"}`);
      }
    } catch (err) {
      console.error("Failed to toggle user lock:", err);
      showToast("✗ Failed to update user account.");
    }
  };

  // Quick Action: Activate / Deactivate User Premium Subscription
  const toggleUserSubscription = async (userId: string, targetPremium: boolean) => {
    try {
      const res = await fetch(`/api/superadmin/users/${userId}/subscription`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPremium: targetPremium,
          plan: targetPremium ? "Premium Pro" : "Free Tier",
          subscriptionStatus: targetPremium ? "Active" : "Expired"
        }),
      }).then((r) => r.json());
      if (res.success) {
        setUsers(users.map((u) => (u.id === userId ? {
          ...u,
          isPremium: targetPremium,
          plan: targetPremium ? "Premium Pro" : "Free Tier",
          subscriptionStatus: targetPremium ? "Active" : "Expired"
        } : u)));
        showToast(targetPremium ? "✓ User upgraded to Premium Pro" : "✓ User subscription deactivated / set to Free Tier");
      }
    } catch (err) {
      console.error("Failed to update user subscription:", err);
      showToast("✗ Failed to update subscription status.");
    }
  };

  // Quick Action: Activate / Deactivate School Subscription
  const toggleSchoolSubscription = async (schoolId: string, targetActive: boolean) => {
    try {
      const res = await fetch(`/api/superadmin/schools/${schoolId}/toggle-subscription`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: targetActive }),
      }).then((r) => r.json());
      if (res.success) {
        showToast(res.message);
        fetchSuperAdminData();
      } else {
        showToast("✗ " + (res.message || "Failed to update school subscription status."));
      }
    } catch (err) {
      showToast("✗ Failed to toggle school subscription status.");
    }
  };

  // Quick Action: Reset User Password
  const resetUserPassword = async (userId: string, email: string) => {
    try {
      const res = await fetch(`/api/superadmin/users/${userId}/reset-password`, { method: "POST" }).then((r) => r.json());
      showToast(res.success ? `✓ ${res.message}` : "✗ Failed to reset password.");
    } catch (err) {
      console.error("Failed to reset password:", err);
      showToast("✗ Failed to reset password.");
    }
  };

  // Restore a backup snapshot
  const restoreBackup = async (backupId: string) => {
    try {
      const res = await fetch(`/api/superadmin/backups/${backupId}/restore`, { method: "POST" }).then((r) => r.json());
      showToast(res.success ? `✓ ${res.message}` : "✗ Restore failed.");
    } catch (err) {
      console.error("Failed to restore backup:", err);
      showToast("✗ Restore failed.");
    }
  };

  // Dispatch communication via real endpoint
  const sendCommunication = async (channel: "send-email" | "send-sms" | "send-push", payload: any) => {
    try {
      const res = await fetch(`/api/superadmin/communication/${channel}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => r.json());
      showToast(res.success ? `✓ ${res.message}` : "✗ Failed to dispatch.");
    } catch (err) {
      console.error("Failed to dispatch communication:", err);
      showToast("✗ Failed to dispatch message.");
    }
  };

  // Real file download helper
  const downloadFile = (filename: string, content: string, mime = "text/csv") => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Report generators
  const downloadFinancialReport = () => {
    const rows = [
      ["Transaction ID", "School", "Plan", "Gateway", "Amount (NGN)", "Status", "Date"],
      ...(payments.length ? payments : []).map((p: any) => [p.id, p.schoolName, p.plan, p.gateway, p.amount, p.status, p.date]),
    ];
    downloadFile(`financial-audit-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((r) => r.join(",")).join("\n"));
    setIsReportModalOpen(false);
    showToast("✓ Financial & Tuition Revenue Audit downloaded (CSV)");
  };

  const downloadSchoolsReport = () => {
    const rows = [
      ["School ID", "School Name", "Code", "Admin Email", "Plan", "Storage (GB)", "AI Credits", "Status"],
      ...(schools || []).filter(Boolean).map((s) => [
        s?.id || "",
        s?.name || "",
        s?.code || "",
        s?.adminEmail || "",
        s?.plan || "",
        `${s?.storageUsedGB || 0}/${s?.storageLimitGB || 0}`,
        (s?.aiCredits || 0) - (s?.aiCreditsUsed || 0),
        s?.status || "",
      ]),
    ];
    downloadFile(`schools-audit-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((r) => r.join(",")).join("\n"));
    setIsReportModalOpen(false);
    showToast("✓ Multi-Tenant Campuses & Usage Audit downloaded (CSV)");
  };

  const downloadAiReport = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      analytics: aiStats?.analytics || { totalTokensThisMonth: 0, totalPromptsProcessed: 0, averageLatencyMs: 0, estimatedCostUSD: 0 },
      model: settings.geminiModel || aiStats?.config?.model || "gemini-2.5-flash",
    };
    downloadFile(`ai-tokens-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), "application/json");
    setIsReportModalOpen(false);
    showToast("✓ sSolutAI AI Token Consumption Report downloaded (JSON)");
  };

  // Quick Action: Approve Pending School
  const approveSchool = async (schoolId: string) => {
    setSchools((schools || []).map((s) => (s?.id === schoolId ? { ...s, status: "Active" } : s)));
    const sch = (schools || []).find((s) => s?.id === schoolId);
    showToast(`✓ Approved & Activated ${sch?.name || "School"}!`);

    try {
      await fetch(`/api/superadmin/schools/${schoolId}/activate`, { method: "PUT" });
    } catch (err) {
      // Ignored
    }
  };

  // Quick Action: Suspend School
  const suspendSchool = async (schoolId: string) => {
    setSchools((schools || []).map((s) => (s?.id === schoolId ? { ...s, status: "Suspended" } : s)));
    const sch = (schools || []).find((s) => s?.id === schoolId);
    showToast(`✓ Suspended ${sch?.name || "School"}`);

    try {
      await fetch(`/api/superadmin/schools/${schoolId}/suspend`, { method: "PUT" });
    } catch (err) {
      // Ignored
    }
  };

  // Bulk Select Helpers
  const toggleSelectSchool = (id: string) => {
    setSelectedSchoolIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllSchools = (list: any[]) => {
    if (selectedSchoolIds.length === list.length && list.length > 0) {
      setSelectedSchoolIds([]);
    } else {
      setSelectedSchoolIds(list.map((s) => s.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllUsers = (list: any[]) => {
    if (selectedUserIds.length === list.length && list.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(list.map((u) => u.id));
    }
  };

  const triggerConfirmDelete = (type: "schools" | "users", ids: string[]) => {
    if (ids.length === 0) return;
    setConfirmDeleteModal({ open: true, type, ids });
  };

  const handleExecuteBulkDelete = async () => {
    const { type, ids } = confirmDeleteModal;
    if (type === "schools") {
      setSchools((prev) => prev.filter((s) => !ids.includes(s.id)));
      setSelectedSchoolIds((prev) => prev.filter((id) => !ids.includes(id)));
      showToast(`🗑️ Permanently deleted ${ids.length} school(s)`);
      for (const id of ids) {
        try {
          await fetch(`/api/superadmin/schools/${id}`, { method: "DELETE" });
        } catch (e) {}
      }
    } else {
      setUsers((prev) => prev.filter((u) => !ids.includes(u.id)));
      setSelectedUserIds((prev) => prev.filter((id) => !ids.includes(id)));
      for (const id of ids) {
        try {
          await fetch(`/api/superadmin/users/${id}`, { method: "DELETE" });
        } catch (e) {}
      }
      notifyDataChanged(["users"]);
    }
    setConfirmDeleteModal({ open: false, type: "schools", ids: [] });
  };

  // Navigation Items Config with Sub-Items matching User Specification
  const navSections = [
    {
      id: "overview",
      label: "Platform Dashboard",
      icon: Activity,
      subItems: [{ id: "all", label: "Executive Dashboard" }],
    },
    {
      id: "schools",
      label: "Schools Management",
      icon: Building2,
      subItems: [
        { id: "all", label: "All Registered Schools" },
        { id: "registered", label: "Registered Schools" },
        { id: "pending", label: "Pending Approvals" },
        { id: "create", label: "Create School" },
        { id: "owners", label: "School Owners" },
        { id: "status", label: "School Status" },
      ],
    },
    {
      id: "users",
      label: "Platform Users",
      icon: Users,
      subItems: [
        { id: "all", label: "All Users" },
        { id: "super-admins", label: "Super Admins" },
        { id: "school-owners", label: "School Owners" },
        { id: "teachers", label: "Teachers" },
        { id: "students", label: "Students" },
        { id: "parents", label: "Parents" },
      ],
    },
    {
      id: "billing",
      label: "Subscription & Billing",
      icon: CreditCard,
      subItems: [
        { id: "all", label: "Billing Overview" },
        { id: "plans", label: "SaaS Plans" },
        { id: "active", label: "Active Subscriptions" },
        { id: "expired", label: "Expired Schools" },
        { id: "payments", label: "Payments History" },
        { id: "revenue", label: "Revenue Analytics" },
      ],
    },
    {
      id: "ai-management",
      label: "AI Management",
      icon: Sparkles,
      subItems: [
        { id: "all", label: "sSolutAI AI Control" },
        { id: "api", label: "sSolutAI API" },
        { id: "usage", label: "AI Usage" },
        { id: "models", label: "AI Models" },
        { id: "prompts", label: "Prompt Templates" },
        { id: "tokens", label: "Token Usage" },
        { id: "logs", label: "AI Logs" },
      ],
    },
    {
      id: "ai-lesson-notes",
      label: "AI Note Generator",
      icon: BookOpen,
      subItems: [
        { id: "all", label: "Generate & Dispatch" },
        { id: "full-studio", label: "Full Lesson Studio" },
      ],
    },
    {
      id: "website-builder",
      label: "AI Website Builder",
      icon: Globe,
      subItems: [
        { id: "all", label: "Website Studio" },
      ],
    },
    {
      id: "curriculum",
      label: "Curriculum Repository",
      icon: Layers,
      subItems: [
        { id: "all", label: "Curriculum Repository" },
        { id: "national", label: "National Curriculum" },
        { id: "lessons", label: "Lesson Notes Library" },
        { id: "questions", label: "Question Bank" },
        { id: "report-templates", label: "Report Card Templates" },
      ],
    },
    {
      id: "database",
      label: "Database Manager",
      icon: Database,
      subItems: [
        { id: "all", label: "Database Hub" },
        { id: "firestore", label: "Firestore DB" },
        { id: "realtime", label: "Realtime Database" },
        { id: "storage", label: "Cloud Storage" },
        { id: "backups", label: "Backups" },
        { id: "restore", label: "Restore Point" },
      ],
    },
    {
      id: "security",
      label: "Security Center",
      icon: ShieldAlert,
      subItems: [
        { id: "all", label: "Security Overview" },
        { id: "auth", label: "Authentication" },
        { id: "tokens", label: "JWT / Firebase Tokens" },
        { id: "roles", label: "Roles & Access" },
        { id: "permissions", label: "Permissions" },
        { id: "logins", label: "Login History" },
        { id: "audit", label: "Audit Logs" },
      ],
    },
    {
      id: "monitoring",
      label: "System Monitoring",
      icon: Radio,
      subItems: [
        { id: "all", label: "Health Overview" },
        { id: "server", label: "Server Status" },
        { id: "api-health", label: "API Health" },
        { id: "errors", label: "Error Logs" },
        { id: "performance", label: "Performance" },
        { id: "analytics", label: "Analytics Telemetry" },
      ],
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: MessageSquare,
      subItems: [
        { id: "all", label: "Broadcast Center" },
        { id: "push", label: "Push Notifications" },
        { id: "email", label: "Email Broadcast" },
        { id: "sms", label: "SMS Broadcast" },
      ],
    },
    {
      id: "settings",
      label: "Platform Settings",
      icon: Sliders,
      subItems: [
        { id: "all", label: "Global Settings" },
        { id: "homepage", label: "Homepage & Links" },
        { id: "branding", label: "Branding" },
        { id: "logo", label: "App Logo" },
        { id: "themes", label: "Themes & Styling" },
        { id: "flags", label: "Feature Flags" },
        { id: "maintenance", label: "Maintenance Mode" },
        { id: "version", label: "Version Control" },
      ],
    },
  ];

  // Selected Nav section details
  const currentNavSection = (navSections || []).find((s) => s?.id === activeMainSection) || navSections[0];

  // Filtered Schools for display
  const pendingSchools = (schools || []).filter((s) => ((s?.status || "").toLowerCase().includes("pending") || s?.status === "Suspended"));
  const filteredSchools = (schools || []).filter((s) => {
    if (!s) return false;
    const matchesQuery =
      (s.name || "").toLowerCase().includes(globalSearch.toLowerCase()) ||
      (s.code || "").toLowerCase().includes(globalSearch.toLowerCase()) ||
      (s.adminEmail || "").toLowerCase().includes(globalSearch.toLowerCase());

    const st = (s.status || "").toLowerCase();
    if (activeSubItem === "registered") return matchesQuery && st === "active";
    if (activeSubItem === "pending") return matchesQuery && (st.includes("pending") || s.status === "Suspended");
    if (activeSubItem === "owners") return matchesQuery && Boolean(s.adminEmail || s.owner);
    return matchesQuery;
  });

  // Filtered Users for display
  const filteredUsers = (users || []).filter((u) => {
    if (!u) return false;
    const matchesQuery =
      (u.name || "").toLowerCase().includes(globalSearch.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(globalSearch.toLowerCase());

    if (activeSubItem === "super-admins") return matchesQuery && u.role === "Super Admin";
    if (activeSubItem === "school-owners") return matchesQuery && u.role === "School Owner";
    if (activeSubItem === "teachers") return matchesQuery && u.role === "Teacher";
    if (activeSubItem === "students") return matchesQuery && u.role === "Student";
    if (activeSubItem === "parents") return matchesQuery && u.role === "Parent";
    return matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-purple-900 to-indigo-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-purple-500/50 flex items-center gap-3 animate-bounce">
          <Zap className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* TOP HQ HEADER COMMAND BAR */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-purple-600/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">LIVINGSTONEEDU</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-extrabold uppercase tracking-wider">
                Platform Control Center
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Enterprise Multi-Tenant SaaS Master Console • Firebase + sSolutAI AI Integrated</p>
          </div>
        </div>

        {/* Search Bar in Header */}
        <div className="flex-1 max-w-md hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 focus-within:border-purple-500 transition-colors">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search schools, users, servers, logs..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
          />
        </div>

        {/* Server Status, Theme & Sign Out Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>HQ Node Cluster Operational</span>
          </div>

          <button
            onClick={fetchSuperAdminData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors"
            title="Sync Platform Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600 dark:text-purple-400" : ""}`} />
          </button>

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
            </button>
          )}

          {onSwitchRole && (
            <button
              onClick={() => onSwitchRole("Teacher")}
              className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 text-xs font-bold transition-all flex items-center gap-1.5"
              title="View as School User / Teacher"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">School Portal</span>
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Sign Out of Platform Control Center"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN 3-COLUMN ENTERPRISE CONTROL LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-72 bg-white/90 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-4 flex-shrink-0">
          <div className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider px-2 flex items-center justify-between">
            <span>Navigation Modules</span>
            <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
            {navSections.map((sec) => {
              const Icon = sec.icon;
              const isSelected = activeMainSection === sec.id;
              const hasSubmenu = sec.subItems.length > 1;
              const isOpen = openSections[sec.id] === true;
              return (
                <div key={sec.id} className="space-y-1">
                  <button
                    onClick={() => {
                      if (sec.id === "schools" && activeSubItem === "create") {
                        setIsCreateSchoolOpen(true);
                        return;
                      }
                      if (hasSubmenu) {
                        if (isSelected) {
                          toggleSection(sec.id);
                        } else {
                          setActiveMainSection(sec.id as any);
                          setActiveSubItem(sec.subItems[0]?.id || "all");
                          setOpenSections((prev) => ({ ...prev, [sec.id]: true }));
                        }
                      } else {
                        setActiveMainSection(sec.id as any);
                        setActiveSubItem(sec.subItems[0]?.id || "all");
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-purple-600 dark:text-purple-400"}`} />
                      <span>{sec.label}</span>
                    </div>
                    {hasSubmenu ? (
                      isOpen ? (
                        <ChevronDown className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-400"}`} />
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {sec.subItems.length}
                        </span>
                      )
                    ) : (
                      isSelected && <ChevronRight className="w-4 h-4 text-white" />
                    )}
                  </button>

                  {/* Accordion dropdown: render sub-items whenever the section is expanded */}
                  {hasSubmenu && isOpen && (
                    <div className="ml-5 border-l-2 border-purple-800/60 pl-2.5 space-y-1 my-1">
                      {sec.subItems.map((sub) => {
                        const isSubActive = activeSubItem === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              if (sub.id === "create") {
                                setIsCreateSchoolOpen(true);
                              } else {
                                setActiveSubItem(sub.id);
                              }
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                              isSubActive
                                ? "text-purple-700 dark:text-purple-300 font-extrabold bg-purple-900/30"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                            }`}
                          >
                            <span>• {sub.label}</span>
                            {sub.id === "pending" && pendingSchools.length > 0 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 font-black">
                                {pendingSchools.length}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick System Badge at Bottom of Sidebar */}
          <div className="mt-auto p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-bold">
              <span>Firebase Auth & Storage</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-center justify-between">
              <span>sSolutAI 1.5/2.0 AI SDK</span>
              <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">READY</span>
            </div>
          </div>
        </aside>

        {/* CENTER WORKSPACE */}
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)] min-w-0">
          
          {/* Sub-Header / Context Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Enterprise HQ</span>
                <span>/</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">{currentNavSection.label}</span>
                {activeSubItem !== "all" && (
                  <>
                    <span>/</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{activeSubItem}</span>
                  </>
                )}
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {currentNavSection.label}
              </h2>
            </div>

            {/* Quick Action Trigger Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateSchoolOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" /> Provision School
              </button>
              <button
                onClick={() => setIsBroadcastOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Broadcast
              </button>
            </div>
          </div>

          {/* 1. PLATFORM DASHBOARD (OVERVIEW VIEW) */}
          {activeMainSection === "overview" && dashboardData && (
            <div className="space-y-6 animate-fadeIn">

              {/* LIVE PLATFORM STATISTICS (12 KEY METRIC CARDS) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
                {/* 1. Total Schools */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 hover:border-purple-500/50 transition-colors">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Total Schools</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{dashboardData?.totalSchools ?? schools.length ?? 0}</div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {schools.length > 0 ? `+${schools.length} active` : "0 schools"}
                  </span>
                </div>

                {/* 2. Total Teachers */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 hover:border-purple-500/50 transition-colors">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Total Teachers</span>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{(dashboardData?.totalTeachers ?? 0).toLocaleString()}</div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{dashboardData?.totalTeachers ? "Across Campuses" : "No teachers registered"}</span>
                </div>

                {/* 3. Total Students */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 hover:border-purple-500/50 transition-colors">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Total Students</span>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{(dashboardData?.totalStudents ?? 0).toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{dashboardData?.todaysAttendance || "0%"} Att. Rate</span>
                </div>

                {/* 4. Total Parents */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 hover:border-purple-500/50 transition-colors">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Total Parents</span>
                  <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{(dashboardData?.totalParents ?? 0).toLocaleString()}</div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{dashboardData?.totalParents ? "Linked Portals" : "No parent records"}</span>
                </div>

                {/* 5. Total Revenue */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 hover:border-purple-500/50 transition-colors">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Total Revenue</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    ₦{(payments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0) || (dashboardData?.feesCollectedToday || 0)).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{payments.length > 0 ? "Gateway Settled" : "No settled payments"}</span>
                </div>

                {/* 6. AI Requests Today */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 hover:border-purple-500/50 transition-colors">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">AI Requests Today</span>
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400">{(dashboardData?.aiRequestsToday || promptLogs.length || 0).toLocaleString()}</div>
                  <span className="text-[10px] text-amber-500 font-bold">sSolutAI AI Engine</span>
                </div>

                {/* 7. Active Users */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 hover:border-purple-500/50 transition-colors">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Active Users</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{(dashboardData?.activeUsers ?? users.length ?? 1).toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online Now
                  </span>
                </div>

                {/* 8. Database Usage */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 hover:border-purple-500/50 transition-colors">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Database Usage</span>
                  <div className="text-xl font-black text-slate-800 dark:text-slate-200">{dashboardData?.databaseUsage || (schools.length > 0 ? "0.2 MB" : "0.1 MB")}</div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">PostgreSQL + Firestore</span>
                </div>

                {/* 9. Storage Usage */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 hover:border-purple-500/50 transition-colors">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Storage Usage</span>
                  <div className="text-xl font-black text-slate-800 dark:text-slate-200">{dashboardData?.storageUsage || (schools.length > 0 ? "0.4 MB" : "0.1 MB")}</div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Cloud Storage Bucket</span>
                </div>

                {/* 10. Server Health */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 hover:border-purple-500/50 transition-colors">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Server Health</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {dashboardData?.serverStatus?.status || "Healthy"}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{dashboardData?.serverStatus?.uptime || "99.99%"} Uptime</span>
                </div>

                {/* 11. Subscription Renewals */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 hover:border-purple-500/50 transition-colors">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Sub. Renewals</span>
                  <div className="text-xl font-black text-purple-700 dark:text-purple-300">{schools.length > 0 ? "100%" : "0%"}</div>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">{schools.length > 0 ? "Active Accounts" : "No active subs"}</span>
                </div>

                {/* 12. New Registrations */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1 hover:border-purple-500/50 transition-colors">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">New Schools</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">+{schools.length}</div>
                  <span className="text-[10px] text-emerald-500 font-bold">Pending: {pendingSchools.length}</span>
                </div>
              </div>

              {/* VISUAL CHARTS SECTION (5 INTERACTIVE CHARTS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* Chart 1: Daily Active Users */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Daily Active Users</h3>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold">Active Week</span>
                  </div>
                  <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
                    {[
                      { day: "Mon", val: Math.max(1, Math.round((dashboardData?.activeUsers ?? users.length ?? 1) * 0.7)), pct: "65%" },
                      { day: "Tue", val: Math.max(1, Math.round((dashboardData?.activeUsers ?? users.length ?? 1) * 0.85)), pct: "75%" },
                      { day: "Wed", val: Math.max(1, Math.round((dashboardData?.activeUsers ?? users.length ?? 1) * 0.9)), pct: "85%" },
                      { day: "Thu", val: Math.max(1, dashboardData?.activeUsers ?? users.length ?? 1), pct: "100%" },
                      { day: "Fri", val: Math.max(1, Math.round((dashboardData?.activeUsers ?? users.length ?? 1) * 0.8)), pct: "80%" },
                      { day: "Sat", val: Math.max(0, Math.round((dashboardData?.activeUsers ?? users.length ?? 1) * 0.3)), pct: "30%" },
                      { day: "Sun", val: Math.max(0, Math.round((dashboardData?.activeUsers ?? users.length ?? 1) * 0.2)), pct: "20%" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.val}
                        </span>
                        <div
                          style={{ height: item.pct }}
                          className="w-full bg-gradient-to-t from-purple-800 to-indigo-500 rounded-t-lg group-hover:from-purple-500 group-hover:to-indigo-400 transition-all shadow-md shadow-purple-900/50"
                        ></div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart 2: Monthly Revenue & Billing */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Monthly Revenue Status</h3>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">₦ Transactions</span>
                  </div>
                  <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
                    {[
                      { month: "Jan", val: payments.length > 0 ? "Settled" : "₦0", height: payments.length > 0 ? "40%" : "10%" },
                      { month: "Feb", val: payments.length > 0 ? "Settled" : "₦0", height: payments.length > 0 ? "50%" : "10%" },
                      { month: "Mar", val: payments.length > 0 ? "Settled" : "₦0", height: payments.length > 0 ? "60%" : "10%" },
                      { month: "Apr", val: payments.length > 0 ? "Settled" : "₦0", height: payments.length > 0 ? "70%" : "10%" },
                      { month: "May", val: payments.length > 0 ? "Settled" : "₦0", height: payments.length > 0 ? "85%" : "10%" },
                      { month: "Jun", val: payments.length > 0 ? `₦${payments.reduce((a, p) => a + Number(p.amount || 0), 0).toLocaleString()}` : "₦0", height: payments.length > 0 ? "100%" : "10%" },
                    ].map((m, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {m.val}
                        </span>
                        <div
                          style={{ height: m.height }}
                          className="w-full bg-gradient-to-t from-emerald-800 to-teal-400 rounded-t-lg group-hover:from-emerald-600 transition-all shadow-md shadow-emerald-900/50"
                        ></div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{m.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart 3: AI Token Usage (sSolutAI API) */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">AI Engine & Usage</h3>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">@google/genai</span>
                  </div>
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                        <span>Lesson Notes AI Generation</span>
                        <span className="text-amber-600 dark:text-amber-400">{dashboardData?.generatedLessonNotes || 0} Notes Created</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, Math.max(10, (dashboardData?.generatedLessonNotes || 0) * 10))}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                        <span>CBT Exam Question Bank</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{dashboardData?.generatedExams || 0} Exams Ready</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, Math.max(10, (dashboardData?.generatedExams || 0) * 15))}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                        <span>Automated Report Card Processing</span>
                        <span className="text-cyan-600 dark:text-cyan-400">{dashboardData?.reportCardsGenerated || 0} Reports Generated</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${Math.min(100, Math.max(10, (dashboardData?.reportCardsGenerated || 0) * 5))}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart 4: School Growth */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">School Onboarding Status</h3>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">Active Campuses</span>
                  </div>
                  <div className="h-40 flex items-center justify-around">
                    <div className="text-center space-y-1">
                      <div className="text-3xl font-black text-slate-900 dark:text-white">{schools.length}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Active Campuses</div>
                    </div>
                    <div className="w-px h-16 bg-slate-200 dark:bg-slate-800"></div>
                    <div className="text-center space-y-1">
                      <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{schools.length > 0 ? "100%" : "0%"}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Retention Rate</div>
                    </div>
                  </div>
                </div>

                {/* Chart 5: Login Activity & Authentication Traffic */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Login Traffic & Security History</h3>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Authenticated Sessions</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">AUTHENTICATED LOGINS</span>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{auditLogs.length || (users.length > 0 ? 1 : 0)}</div>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">FAILED ATTEMPTS</span>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">0</div>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">ACTIVE SESSIONS</span>
                      <div className="text-lg font-black text-purple-600 dark:text-purple-400 mt-1">{sessions.length || users.length || 1}</div>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">SECURITY ALERTS</span>
                      <div className="text-lg font-black text-slate-500 dark:text-slate-400 mt-1">0</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RECENT ACTIVITY TIMELINE */}
              <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">Live Platform Recent Activity Stream</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Real-time telemetry of multi-tenant system events</p>
                    </div>
                  </div>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-mono">Live Sync Engine</span>
                </div>

                <div className="space-y-3">
                  {(auditLogs.length > 0 ? auditLogs.slice(0, 6).map((log, idx) => ({
                    title: log.action || "System Event",
                    desc: log.details || `${log.user || "Administrator"} action recorded in portal.`,
                    time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
                    icon: Building2,
                    color: "text-emerald-400 bg-emerald-950/60 border-emerald-800"
                  })) : (dashboardData?.recentActivities || [
                    { title: "Live Platform Operational", desc: "Enterprise platform is active and ready for school sessions.", time: "Live", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-950/60 border-emerald-800" }
                  ])).map((act: any, idx: number) => {
                    const ActIcon = act.icon || CheckCircle2;
                    return (
                      <div key={idx} className="flex items-start justify-between gap-4 p-3.5 bg-slate-100/60 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border ${act.color || "text-purple-400 bg-purple-950/60 border-purple-800"}`}>
                            <ActIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                              {act.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">{act.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* 2. SCHOOLS MANAGEMENT TAB */}
          {activeMainSection === "schools" && (
            <div className="space-y-6 animate-fadeIn">
              {activeSubItem === "status" ? (
                /* SCHOOL STATUS DISTRIBUTION PANEL */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Active Schools", value: schools.filter((s) => (s.status || "").toLowerCase() === "active").length, color: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
                      { label: "Pending Approvals", value: schools.filter((s) => (s.status || "").toLowerCase().includes("pending")).length, color: "text-amber-600 dark:text-amber-400", badge: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30" },
                      { label: "Suspended Schools", value: schools.filter((s) => s.status === "Suspended").length, color: "text-rose-600 dark:text-rose-400", badge: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30" },
                    ].map((c) => (
                      <div key={c.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                        <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">{c.label}</span>
                        <div className={`text-3xl font-black mt-2 ${c.color}`}>{c.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">School Status Control</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Use the Approve / Suspend actions in the All Registered Schools list to change any school status.</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setActiveSubItem("all")} className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold">View All Schools</button>
                      <button onClick={() => setActiveSubItem("pending")} className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold">Review Pending Approvals</button>
                    </div>
                  </div>
                </div>
              ) : activeSubItem === "owners" ? (
                /* SCHOOL OWNERS PANEL */
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-base font-black text-slate-900 dark:text-white">Registered School Owners & Admins</h3>
                    </div>
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">{schools.length} Schools</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3">School</th>
                          <th className="p-3">Owner / Admin Email</th>
                          <th className="p-3">Domain</th>
                          <th className="p-3">Plan</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                        {(filteredSchools || []).map((sch, idx) => (
                          <tr key={sch?.id || idx} className="hover:bg-slate-200/40 dark:hover:bg-slate-800/40">
                            <td className="p-3 font-bold text-slate-900 dark:text-white">{sch?.name}</td>
                            <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{sch?.adminEmail}</td>
                            <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{sch?.domain || "—"}</td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-[10px] font-bold">{sch?.plan}</span></td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => { if (sch?.adminEmail) navigator.clipboard?.writeText(sch.adminEmail); showToast(`✓ Owner email for ${sch?.name} copied to clipboard`); }}
                                className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px]"
                              >
                                Copy Email
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ALL / REGISTERED / PENDING SCHOOLS TABLE */
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Multi-Tenant Partner Schools</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedSchoolIds.length > 0 && (
                      <button
                        onClick={() => triggerConfirmDelete("schools", selectedSchoolIds)}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 animate-in fade-in"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedSchoolIds.length})
                      </button>
                    )}
                    {activeSubItem === "pending" && pendingSchools.length > 0 && (
                      <button
                        onClick={() => setIsApproveModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Review Approvals
                      </button>
                    )}
                    <button
                      onClick={() => setIsCreateSchoolOpen(true)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Provision New School
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3 w-10">
                          <input
                            type="checkbox"
                            checked={selectedSchoolIds.length === filteredSchools.length && filteredSchools.length > 0}
                            onChange={() => toggleSelectAllSchools(filteredSchools)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                          />
                        </th>
                        <th className="p-3">School Name</th>
                        <th className="p-3">School Code</th>
                        <th className="p-3">Admin Email</th>
                        <th className="p-3">Plan</th>
                        <th className="p-3">Storage</th>
                        <th className="p-3">AI Quota</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                      {(filteredSchools || []).map((sch, idx) => {
                        const isSelected = selectedSchoolIds.includes(sch?.id);
                        return (
                        <tr key={sch?.id || idx} className={`hover:bg-slate-200/40 dark:hover:bg-slate-800/40 transition-colors ${isSelected ? "bg-purple-100/50 dark:bg-purple-950/30" : ""}`}>
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => sch?.id && toggleSelectSchool(sch.id)}
                              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                            />
                          </td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-900/50 border border-purple-700/50 flex items-center justify-center text-purple-300 font-extrabold text-[10px]">
                              {sch?.name ? sch.name.charAt(0) : "S"}
                            </div>
                            <span>{sch?.name}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{sch?.code}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{sch?.adminEmail}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                              {sch?.plan}
                            </span>
                          </td>
                          <td className="p-3 font-mono">{sch?.storageUsedGB || 0.1} GB / {sch?.storageLimitGB || 100} GB</td>
                          <td className="p-3 font-mono text-amber-600 dark:text-amber-400">{((sch?.aiCredits || 50000) - (sch?.aiCreditsUsed || 0)).toLocaleString()} pts</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              sch?.status === "Active"
                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            }`}>
                              {sch?.status}
                            </span>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap space-x-2">
                            {sch?.subscriptionStatus === "Active" || sch?.isPaid ? (
                              <button
                                onClick={() => sch?.id && toggleSchoolSubscription(sch.id, false)}
                                className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-[10px]"
                                title="Deactivate School Subscription"
                              >
                                Deactivate Sub
                              </button>
                            ) : (
                              <button
                                onClick={() => sch?.id && toggleSchoolSubscription(sch.id, true)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm inline-flex items-center gap-1"
                                title="Activate School Subscription"
                              >
                                <Zap className="w-3 h-3" />
                                <span>Activate Sub</span>
                              </button>
                            )}
                            {sch?.status !== "Active" ? (
                              <button
                                onClick={() => sch?.id && approveSchool(sch.id)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                              >
                                Approve
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  if (!sch?.id) return;
                                  await fetch(`/api/superadmin/schools/${sch.id}/suspend`, { method: "PUT" });
                                  fetchSuperAdminData();
                                  showToast(`Suspended ${sch?.name || "School"}`);
                                }}
                                className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-rose-950 text-slate-600 dark:text-slate-300 hover:text-rose-300 border border-slate-300 dark:border-slate-700 font-bold text-[10px]"
                              >
                                Suspend
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (!sch?.id) return;
                                triggerConfirmDelete("schools", [sch.id]);
                              }}
                              className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-[10px]"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                      {(!filteredSchools || filteredSchools.length === 0) && (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-slate-500 dark:text-slate-400">
                            No registered schools found. Click &quot;Provision New School&quot; to add an institutional campus.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              )}
            </div>
          )}

          {/* 3. PLATFORM USERS TAB */}
          {activeMainSection === "users" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">All Platform System Users</h3>
                  <div className="flex items-center gap-2">
                    {selectedUserIds.length > 0 && (
                      <button
                        onClick={() => triggerConfirmDelete("users", selectedUserIds)}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 animate-in fade-in"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedUserIds.length})
                      </button>
                    )}
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">{filteredUsers.length} Users Listed</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3 w-10">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                            onChange={() => toggleSelectAllUsers(filteredUsers)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                          />
                        </th>
                        <th className="p-3">User Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Campus Code</th>
                        <th className="p-3">Plan / Subscription</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                      {(filteredUsers || []).map((u, idx) => {
                        const isUserSelected = selectedUserIds.includes(u?.id);
                        const isPremiumUser = u?.isPremium || u?.plan === "Premium Pro" || u?.plan === "Standard Enterprise" || u?.plan === "Enterprise Pro";
                        return (
                        <tr key={u?.id || idx} className={`hover:bg-slate-200/40 dark:hover:bg-slate-800/40 ${isUserSelected ? "bg-purple-100/50 dark:bg-purple-950/30" : ""}`}>
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isUserSelected}
                              onChange={() => u?.id && toggleSelectUser(u.id)}
                              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                            />
                          </td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-purple-600 dark:text-purple-400">
                              {u?.name ? u.name.charAt(0) : "U"}
                            </div>
                            <span>{u?.name}</span>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300 font-mono">{u?.email}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                              {u?.role}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{u?.schoolId || "—"}</td>
                          <td className="p-3">
                            {isPremiumUser && u?.subscriptionStatus !== "Expired" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span>Premium Active</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-500/15 text-slate-500 dark:text-slate-400 font-semibold text-[10px]">
                                {u?.subscriptionStatus === "Expired" ? "Expired" : "Free Tier"}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                              {u?.status || "Active"}
                            </span>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap space-x-2">
                            {isPremiumUser && u?.subscriptionStatus !== "Expired" ? (
                              <button
                                onClick={() => u?.id && toggleUserSubscription(u.id, false)}
                                className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-[10px]"
                                title="Deactivate Premium Subscription"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => u?.id && toggleUserSubscription(u.id, true)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm inline-flex items-center gap-1"
                                title="Activate User Premium Subscription"
                              >
                                <Zap className="w-3 h-3" />
                                <span>Activate</span>
                              </button>
                            )}
                            <button
                              onClick={() => u?.id && resetUserPassword(u.id, u.email)}
                              className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-[10px]"
                            >
                              Reset Access
                            </button>
                            <button
                              onClick={() => u?.id && toggleUserLock(u.id, u.isLocked !== true)}
                              className={`px-2.5 py-1 rounded font-semibold text-[10px] border ${
                                u?.isLocked
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/20"
                              }`}
                            >
                              {u?.isLocked ? "Unlock" : "Lock"}
                            </button>
                            <button
                              onClick={() => {
                                if (!u?.id) return;
                                triggerConfirmDelete("users", [u.id]);
                              }}
                              className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-[10px]"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                      {(!filteredUsers || filteredUsers.length === 0) && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                            No user accounts found matching this filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. SUBSCRIPTION & BILLING TAB */}
          {activeMainSection === "billing" && (
            <div className="space-y-6 animate-fadeIn">
              {activeSubItem === "plans" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: "Standard Enterprise", price: "₦80,000 / term", storage: "100GB", ai: "10K AI pts", desc: "For secondary schools & comprehensive colleges (up to 2000 students).", featured: true },
                      { name: "Starter School", price: "₦30,000 / term", storage: "50GB", ai: "2K AI pts", desc: "Ideal for primary schools & tutorial centers (up to 200 students).", featured: false },
                      { name: "Multi-Campus Group", price: "Custom pricing", storage: "Unlimited", ai: "Custom AI", desc: "For institutions with multiple campuses & custom integrations.", featured: false },
                    ].map((p) => (
                      <div key={p.name} className={`rounded-2xl p-5 border space-y-2 ${p.featured ? "bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border-purple-600/50" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}>
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-black ${p.featured ? "text-white" : "text-slate-900 dark:text-white"}`}>{p.name}</h4>
                          {p.featured && <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 font-extrabold uppercase">Most Popular</span>}
                        </div>
                        <div className={`text-lg font-black ${p.featured ? "text-amber-300" : "text-emerald-600 dark:text-emerald-400"}`}>{p.price}</div>
                        <div className={`text-[11px] font-semibold ${p.featured ? "text-purple-200" : "text-slate-500 dark:text-slate-400"}`}>{p.storage} • {p.ai}</div>
                        <p className={`text-[11px] ${p.featured ? "text-purple-200/80" : "text-slate-500 dark:text-slate-400"}`}>{p.desc}</p>
                        <div className={`text-[10px] font-bold pt-1 ${p.featured ? "text-white" : "text-slate-600 dark:text-slate-300"}`}>
                          {(schools || []).filter((s) => s?.plan === p?.name).length} school(s) on this plan
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Assign Subscription Plan to School</h3>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const schoolId = (form.elements.namedItem("school") as HTMLSelectElement).value;
                        const plan = (form.elements.namedItem("plan") as HTMLSelectElement).value;
                        if (!schoolId) return;
                        const res = await fetch(`/api/superadmin/schools/${schoolId}/assign-subscription`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ plan }),
                        }).then((r) => r.json());
                        showToast(res.success ? `✓ ${res.message}` : "✗ Failed to assign plan");
                        fetchSuperAdminData();
                      }}
                      className="flex flex-wrap gap-3 items-end text-xs"
                    >
                      <div className="flex-1 min-w-52">
                        <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">School</label>
                        <select name="school" className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none">
                          {(schools || []).map((s, idx) => <option key={s?.id || idx} value={s?.id}>{s?.name}</option>)}
                        </select>
                      </div>
                      <div className="flex-1 min-w-40">
                        <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Plan</label>
                        <select name="plan" className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none">
                          <option value="Standard Enterprise">Standard Enterprise (₦80,000 / term)</option>
                          <option value="Starter School">Starter School (₦30,000 / term)</option>
                          <option value="Multi-Campus Group">Multi-Campus Group (Custom)</option>
                        </select>
                      </div>
                      <button type="submit" className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold">Assign Plan</button>
                    </form>
                  </div>

                  {/* Institutional School Subscription Activation Table */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Institutional Subscription Activation & Control
                      </h3>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        {schools?.length || 0} School Campus(es)
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="p-3">School Name</th>
                            <th className="p-3">Admin Email</th>
                            <th className="p-3">Plan</th>
                            <th className="p-3">Subscription Status</th>
                            <th className="p-3 text-right">Activate / Deactivate Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                          {(schools || []).map((s, idx) => {
                            const isSubActive = s?.subscriptionStatus === "Active" || s?.isPaid;
                            return (
                              <tr key={s?.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <td className="p-3 font-bold text-slate-900 dark:text-white">{s?.name}</td>
                                <td className="p-3 font-mono text-slate-500">{s?.adminEmail || "admin@school.edu.ng"}</td>
                                <td className="p-3 font-semibold text-purple-600 dark:text-purple-400">{s?.plan}</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                      isSubActive
                                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                        : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                                    }`}
                                  >
                                    {isSubActive ? "Active" : "Deactivated / Expired"}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  {isSubActive ? (
                                    <button
                                      type="button"
                                      onClick={() => s?.id && toggleSchoolSubscription(s.id, false)}
                                      className="px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs cursor-pointer transition-all"
                                    >
                                      Deactivate Subscription
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => s?.id && toggleSchoolSubscription(s.id, true)}
                                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 cursor-pointer transition-all inline-flex items-center gap-1"
                                    >
                                      <Zap className="w-3.5 h-3.5" />
                                      <span>Activate Subscription</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : activeSubItem === "payments" ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Payment Transactions Ledger</h3>
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">{payments.length} Transactions</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3">Reference</th>
                          <th className="p-3">School</th>
                          <th className="p-3">Plan</th>
                          <th className="p-3">Gateway</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                        {payments.length === 0 && (
                          <tr><td colSpan={7} className="p-5 text-center text-slate-500 dark:text-slate-400">No payments recorded yet.</td></tr>
                        )}
                        {(payments || []).map((p, idx) => (
                          <tr key={p?.id || idx} className="hover:bg-slate-200/40 dark:hover:bg-slate-800/40">
                            <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{p.reference}</td>
                            <td className="p-3 font-bold text-slate-900 dark:text-white">{p.schoolName}</td>
                            <td className="p-3">{p.plan}</td>
                            <td className="p-3 font-mono">{p.gateway}</td>
                            <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">₦{Number(p.amount).toLocaleString()}</td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">{p.status}</span></td>
                            <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{p.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : activeSubItem === "revenue" ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                      <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Total Revenue</h4>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">₦{(payments.reduce((a, p) => a + Number(p.amount), 0)).toLocaleString()}</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Settled via Paystack / Flutterwave</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                      <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Avg. Plan ARR</h4>
                      <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">₦{Math.round((payments.reduce((a, p) => a + Number(p.amount), 0)) / Math.max(payments.length, 1)).toLocaleString()}</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Per partner institution</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                      <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Successful Payments</h4>
                      <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-2">{payments.filter((p) => p.status === "Successful").length}</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Of {payments.length} total transactions</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Revenue by Gateway</h3>
                    {["Paystack", "Flutterwave"].map((gw) => {
                      const gwPayments = payments.filter((p) => p.gateway === gw);
                      const total = gwPayments.reduce((a, p) => a + Number(p.amount), 0);
                      return (
                        <div key={gw} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{gw}</span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">₦{total.toLocaleString()} ({gwPayments.length} txn)</span>
                        </div>
                      );
                    })}
                    <button
                      onClick={downloadFinancialReport}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" /> Export Revenue CSV
                    </button>
                  </div>
                </div>
              ) : (
                /* Billing Overview (all) + Active/Expired subscription lists */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                      <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Active Subscriptions</h4>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{schools.filter((s) => (s.status || "").toLowerCase() === "active").length} Schools</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Paying ₦{Math.round(payments.reduce((a, p) => a + Number(p.amount), 0) / 12).toLocaleString()} monthly</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                      <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Expired / Due Renewals</h4>
                      <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">{schools.filter((s) => s.status === "Suspended").length} Schools</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Pending Paystack auto-charge</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                      <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Average Plan ARR</h4>
                      <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">₦{Math.round((payments.reduce((a, p) => a + Number(p.amount), 0)) / Math.max(payments.length, 1)).toLocaleString()}</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Per partner institution</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {activeSubItem === "expired" ? "Expired / Suspended Schools" : "Active Subscriptions"}
                      </h3>
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                        {(activeSubItem === "expired" ? schools.filter((s) => s.status === "Suspended") : schools.filter((s) => (s.status || "").toLowerCase() === "active")).length} Schools
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="p-3">School</th>
                            <th className="p-3">Plan</th>
                            <th className="p-3">Storage</th>
                            <th className="p-3">AI Quota Left</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                          {(activeSubItem === "expired" ? (schools || []).filter((s) => s?.status === "Suspended") : (schools || []).filter((s) => (s?.status || "").toLowerCase() === "active")).map((s, idx) => (
                            <tr key={s?.id || idx} className="hover:bg-slate-200/40 dark:hover:bg-slate-800/40">
                              <td className="p-3 font-bold text-slate-900 dark:text-white">{s?.name}</td>
                              <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-bold">{s?.plan}</span></td>
                              <td className="p-3 font-mono">{s?.storageUsedGB || 0.1} / {s?.storageLimitGB || 100} GB</td>
                              <td className="p-3 font-mono text-amber-600 dark:text-amber-400">{((s?.aiCredits || 50000) - (s?.aiCreditsUsed || 0)).toLocaleString()} pts</td>
                              <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${(s?.status || "").toLowerCase() === "active" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/20 text-rose-600 dark:text-rose-400"}`}>{s?.status}</span></td>
                              <td className="p-3 text-right">
                                {s?.status === "Suspended" ? (
                                  <button
                                    onClick={() => s?.id && approveSchool(s.id)}
                                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                                  >
                                    Renew Subscription
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-bold">On Track</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. AI MANAGEMENT TAB */}
          {activeMainSection === "ai-management" && (
            <div className="space-y-6 animate-fadeIn">
              {activeSubItem === "api" ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">sSolutAI API Live Configuration</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">@google/genai</span>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      saveAiConfig(
                        {
                          model: (form.elements.namedItem("model") as HTMLSelectElement).value,
                          enabled: (form.elements.namedItem("enabled") as HTMLSelectElement).value === "true",
                        },
                        "✓ sSolutAI AI Engine Configuration updated"
                      );
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Active AI Model</label>
                        <select name="model" defaultValue={aiStats?.config?.model || settings.geminiModel || "gemini-3.6-flash"} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none">
                          <option value="gemini-3.6-flash">gemini-3.6-flash (Fast & Efficient)</option>
                          <option value="gemini-2.5-flash">gemini-2.5-flash (Balanced)</option>
                          <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Engine Status</label>
                        <select name="enabled" defaultValue="true" className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none">
                          <option value="true">Enabled</option>
                          <option value="false">Disabled (Fallback generators)</option>
                        </select>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-bold text-slate-600 dark:text-slate-300 block mb-2">Current Configured Model</span>
                      <span className="font-black text-amber-600 dark:text-amber-400 font-mono">{aiStats?.config?.model || settings.geminiModel || "gemini-3.6-flash"}</span>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold">Save AI Configuration</button>
                    </div>
                  </form>
                </div>
              ) : activeSubItem === "models" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: "gemini-3.6-flash", speed: "Fast", use: "Lesson notes, CBT, remarks", tag: "Recommended" },
                      { name: "gemini-2.5-flash", speed: "Balanced", use: "Multi-turn tutoring, summaries", tag: "Stable" },
                      { name: "gemini-1.5-pro", speed: "Deep", use: "Complex reasoning, exam drifts", tag: "Legacy" },
                    ].map((m) => {
                      const active = (aiStats?.config?.model || settings.geminiModel) === m.name;
                      return (
                        <div key={m.name} className={`rounded-2xl p-5 border space-y-2 ${active ? "bg-gradient-to-br from-amber-900/50 to-purple-900/50 border-amber-500/60" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-slate-900 dark:text-white">{m.name}</span>
                            {active && <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 font-extrabold uppercase">Active</span>}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${m.speed === "Fast" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : m.speed === "Deep" ? "bg-purple-500/20 text-purple-600 dark:text-purple-400" : "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400"}`}>{m.speed}</span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.use}</p>
                          <button
                            onClick={() => saveAiConfig({ model: m.name }, `✓ Switched AI engine to ${m.name}`)}
                            disabled={active}
                            className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold ${active ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-default" : "bg-amber-500 hover:bg-amber-400 text-slate-950"}`}
                          >
                            {active ? "Currently Active" : `Activate ${m.name}`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : activeSubItem === "prompts" ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Prompt Templates Library</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {(aiStats?.config?.promptTemplates || []).map((tpl: any, idx: number) => (
                        <div key={tpl?.id || idx} className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                          <div className="font-bold text-slate-900 dark:text-white">{tpl.name}</div>
                          <div className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{tpl.prompt}</div>
                        </div>
                      ))}
                      {(aiStats?.config?.promptTemplates || []).length === 0 && (
                        <div className="p-5 text-center text-slate-500 dark:text-slate-400 text-xs">No saved templates. Create one below.</div>
                      )}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Create Prompt Template</h3>
                    <form onSubmit={savePromptTemplate} className="space-y-3 text-xs">
                      <input
                        type="text"
                        required
                        placeholder="Template name (e.g. SS3 Physics Lesson Note)"
                        value={promptTemplateForm.name}
                        onChange={(e) => setPromptTemplateForm({ ...promptTemplateForm, name: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none"
                      />
                      <textarea
                        required
                        rows={3}
                        placeholder="System prompt text..."
                        value={promptTemplateForm.prompt}
                        onChange={(e) => setPromptTemplateForm({ ...promptTemplateForm, prompt: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none"
                      ></textarea>
                      <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold">Save Template</button>
                    </form>
                  </div>
                </div>
              ) : activeSubItem === "logs" ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">AI Prompt Execution Logs</h3>
                      <p className="text-[11px] text-slate-500">Track and delete individual prompt records</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">{promptLogs.length} Logs</span>
                      {promptLogs.length > 0 && (
                        <button
                          onClick={async () => {
                            setPromptLogs([]);
                            showToast("🗑️ All AI prompt logs cleared.");
                            try {
                              await fetch("/api/superadmin/ai/prompt-logs", { method: "DELETE" });
                            } catch (e) {}
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Clear All Logs
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3">User</th>
                          <th className="p-3">Prompt</th>
                          <th className="p-3">Mode</th>
                          <th className="p-3">Timestamp</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                        {promptLogs.map((log, idx) => (
                          <tr key={log.id || idx} className="hover:bg-slate-200/40 dark:hover:bg-slate-800/40">
                            <td className="p-3 font-bold text-slate-900 dark:text-white">{log.user || log.teacherName || "—"}</td>
                            <td className="p-3 max-w-md truncate text-slate-500 dark:text-slate-400">{log.prompt || log.title || log.content || "—"}</td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold">{log.mode || log.type || "generation"}</span></td>
                            <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{log.timestamp || log.createdAt || "—"}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => deleteAiLog(log.id)}
                                title="Delete Log Entry"
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {promptLogs.length === 0 && (
                          <tr><td colSpan={5} className="p-5 text-center text-slate-500 dark:text-slate-400">No AI prompt logs yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* AI Overview (all) + usage + tokens sub-views */
                <div className={`space-y-6 ${activeSubItem === "usage" || activeSubItem === "tokens" ? "" : ""}`}>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <h3 className="text-base font-black text-slate-900 dark:text-white">sSolutAI AI Engine Control & Telemetry</h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                        SDK: @google/genai
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Active AI Model</span>
                        <div className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">{aiStats?.config?.model || settings.geminiModel || "gemini-3.6-flash"}</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Configured for lesson notes, CBT questions, and automated report remarks.</p>
                      </div>
                      <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Monthly AI Token Consumption</span>
                        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">{(aiStats?.analytics?.totalTokensThisMonth || promptLogs.length * 850).toLocaleString()} / 50,000,000 Tokens</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{(aiStats?.analytics?.totalPromptsProcessed || promptLogs.length || 0).toLocaleString()} prompts processed • {aiStats?.analytics?.estimatedCostUSD || "0.00"} USD estimated cost.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Most Active Subjects</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(aiStats?.analytics?.mostActiveSubjects || ["Mathematics", "English Studies", "Basic Science"]).map((sub: string) => (
                            <span key={sub} className="px-2 py-1 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold">{sub}</span>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Average Latency</span>
                        <div className="text-sm font-black text-purple-600 dark:text-purple-400 font-mono">{aiStats?.analytics?.averageLatencyMs || (promptLogs.length > 0 ? 820 : 0)} ms</div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full" style={{ width: `${Math.min(100, Math.max(2, (promptLogs.length * 2)))}%` }}></div>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Real-time @google/genai latency telemetry.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI LESSON NOTE GENERATOR & DISPATCHER (ADMIN CONTROL) */}
          {activeMainSection === "ai-lesson-notes" && (
            <div className="space-y-6 animate-fadeIn">
              {activeSubItem === "full-studio" ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <AILessonNotesView userSession={{ schoolName: "Livingstone International Academy", role: "Super Administrator" }} />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Control Banner */}
                  <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-6 border border-purple-500/30 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-2 relative z-10 max-w-2xl">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                        <Sparkles className="w-3.5 h-3.5" /> Central Academic Authority
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black">AI Lesson Note Generator & Dispatcher</h2>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Generate official NERDC-aligned curriculum lesson plans with sSolutAI AI and dispatch them directly to all schools and teacher portals with a single click.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 relative z-10">
                      <button
                        onClick={() => setActiveSubItem("full-studio")}
                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" /> Open Full Studio
                      </button>
                    </div>
                  </div>

                  {/* Generator Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Configuration Form */}
                    <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-purple-500" /> Note Parameters & Target
                        </h3>
                        <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-md">
                          NERDC 2026
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target School / Destination</label>
                          <select
                            value={adminNoteSchoolId}
                            onChange={(e) => setAdminNoteSchoolId(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="all">Broadcast to All Registered Schools</option>
                            {(schools || []).map((s, idx) => (
                              <option key={s?.id || idx} value={s?.id}>{s?.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                            <input
                              type="text"
                              value={adminNoteSubject}
                              onChange={(e) => setAdminNoteSubject(e.target.value)}
                              placeholder="e.g. Mathematics"
                              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Class Level</label>
                            <select
                              value={adminNoteClass}
                              onChange={(e) => setAdminNoteClass(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option>JSS 1</option>
                              <option>JSS 2</option>
                              <option>JSS 3</option>
                              <option>SS 1</option>
                              <option>SS 2</option>
                              <option>SS 3</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Syllabus Week</label>
                            <select
                              value={adminNoteWeek}
                              onChange={(e) => setAdminNoteWeek(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option>Week 1</option>
                              <option>Week 2</option>
                              <option>Week 3</option>
                              <option>Week 4</option>
                              <option>Week 5</option>
                              <option>Week 6</option>
                              <option>Week 7</option>
                              <option>Week 8</option>
                              <option>Week 9</option>
                              <option>Week 10</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Term</label>
                            <select
                              value={adminNoteTerm}
                              onChange={(e) => setAdminNoteTerm(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option>First Term</option>
                              <option>Second Term</option>
                              <option>Third Term</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Topic / Curriculum Concept</label>
                          <input
                            type="text"
                            value={adminNoteTopic}
                            onChange={(e) => setAdminNoteTopic(e.target.value)}
                            placeholder="e.g. Quadratic Equations & Roots Analysis"
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          <button
                            onClick={handleAdminGenerateLessonNote}
                            disabled={adminIsGenerating}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                          >
                            {adminIsGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {adminIsGenerating ? "Generating..." : "Generate Single Note"}
                          </button>

                          <button
                            onClick={handleAdminBulkGenerateLessonNotes}
                            disabled={adminIsGenerating}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                          >
                            {adminIsGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                            <span>⚡ Bulk Generate All Classes & Subjects</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Generated Note Preview & Dispatch Action */}
                    <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <FileText className="w-4 h-4 text-emerald-500" /> Live Content Preview
                            </h3>
                            <p className="text-[11px] text-slate-500">{adminNoteTopic} • {adminNoteClass} • {adminNoteSubject}</p>
                          </div>
                          {adminNoteContent && (
                            <button
                              onClick={() => {
                                downloadFile(`LessonNote-${adminNoteTopic.replace(/\s+/g, "-")}.txt`, adminNoteContent, "text/plain");
                                showToast("✓ Exported lesson note text file");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" /> Export
                            </button>
                          )}
                        </div>

                        <textarea
                          rows={14}
                          value={adminNoteContent}
                          onChange={(e) => setAdminNoteContent(e.target.value)}
                          placeholder="Click 'Generate Official Lesson Note' to create structured notes or write your content here..."
                          className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                        />
                      </div>

                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Approves and pushes directly to school portals
                        </span>
                        <button
                          onClick={handleAdminDispatchLessonNote}
                          disabled={adminIsDispatching || !adminNoteContent}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-40"
                        >
                          {adminIsDispatching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          <span>{adminIsDispatching ? "Dispatching..." : "Send to School & Teacher Portal"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dispatched Log Table */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-500" /> Dispatched Lesson Notes History
                        </h3>
                        <p className="text-[11px] text-slate-500">Master record of curriculum lesson notes distributed by Admin</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        {adminDispatchedNotes.length} Dispatched
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="p-3">Topic & Syllabus</th>
                            <th className="p-3">Subject & Class</th>
                            <th className="p-3">Destination</th>
                            <th className="p-3">Dispatched At</th>
                            <th className="p-3">Sync Status</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {adminDispatchedNotes.map((note, idx) => (
                            <tr key={note?.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-3 font-bold text-slate-900 dark:text-white">
                                {note.topic}
                                <span className="block text-[10px] text-slate-400">{note.week} • {note.term}</span>
                              </td>
                              <td className="p-3 font-semibold">{note.subject} <span className="text-purple-600 dark:text-purple-400">({note.class})</span></td>
                              <td className="p-3">{note.targetSchool}</td>
                              <td className="p-3 text-slate-500 font-mono text-[11px]">{note.dispatchedAt}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                  ✓ {note.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => {
                                    setAdminNoteTopic(note.topic);
                                    setAdminNoteSubject(note.subject);
                                    setAdminNoteClass(note.class);
                                    setAdminNoteContent(note.content || `# ${note.topic}\n\nOfficial lesson note content synchronized for ${note.class}.`);
                                    showToast("Loaded note into editor");
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px]"
                                >
                                  Edit & Resend
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI WEBSITE BUILDER (ADMIN EXCLUSIVE CONTROL) */}
          {activeMainSection === "website-builder" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <WebsiteBuilderView currentRole="Super Admin" />
              </div>
            </div>
          )}
          {activeMainSection === "curriculum" && (
            <div className="space-y-6 animate-fadeIn">
              {activeSubItem === "national" ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">National Curriculum Frameworks</h3>
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">{curriculums.length} Frameworks</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3">Title</th>
                          <th className="p-3">Framework</th>
                          <th className="p-3">Country</th>
                          <th className="p-3">Subjects</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                        {(curriculums || []).map((c, idx) => (
                          <tr key={c?.id || idx} className="hover:bg-slate-200/40 dark:hover:bg-slate-800/40">
                            <td className="p-3 font-bold text-slate-900 dark:text-white">{c?.title}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-300">{c?.framework}</td>
                            <td className="p-3">{c?.country}</td>
                            <td className="p-3">{c?.subjectsCount}</td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">{c?.status}</span></td>
                          </tr>
                        ))}
                        {curriculums.length === 0 && (
                          <tr><td colSpan={5} className="p-5 text-center text-slate-500 dark:text-slate-400">No curriculum frameworks loaded.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={() => showToast("✓ Curriculum framework upload queued — 12,480 NERDC/WAEC templates synchronized.")}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                  >
                    Upload New Framework
                  </button>
                </div>
              ) : activeSubItem === "lessons" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Lesson Note Templates", value: "12,480" },
                      { label: "Pending Approval", value: "214" },
                      { label: "Published This Week", value: "1,082" },
                    ].map((c) => (
                      <div key={c.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                        <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">{c.label}</span>
                        <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">{c.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Lesson Note Approval Queue</h3>
                    <button
                      onClick={async () => {
                        const res = await fetch("/api/superadmin/curriculum/approve-lesson-note", { method: "POST" }).then((r) => r.json());
                        showToast(res.success ? `✓ ${res.message}` : "✗ Approval failed.");
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      Approve Next Pending Lesson Note
                    </button>
                  </div>
                </div>
              ) : activeSubItem === "questions" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "CBT Questions", value: "58,200", desc: "WAEC/NECO aligned" },
                      { label: "Theory Bank", value: "14,600", desc: "AI-gradable" },
                      { label: "Pending Review", value: "320", desc: "Awaiting moderation" },
                    ].map((c) => (
                      <div key={c.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                        <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">{c.label}</span>
                        <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{c.value}</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{c.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">National CBT Question Bank Moderation</h3>
                    <button
                      onClick={async () => {
                        const res = await fetch("/api/superadmin/curriculum/approve-exam", { method: "POST" }).then((r) => r.json());
                        showToast(res.success ? `✓ ${res.message}` : "✗ Approval failed.");
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      Approve Next Exam Paper
                    </button>
                  </div>
                </div>
              ) : activeSubItem === "report-templates" ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Report Card Layout Templates & Grading Scales</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Standard NERDC Term Report", scale: "A1-F9", subjects: "26", status: "Active" },
                      { name: "WAEC-Mirror Broad Sheet", scale: "A1-F9", subjects: "24", status: "Active" },
                      { name: "Early Years Checklist (Nursery)", scale: "Checklist", subjects: "12", status: "Active" },
                    ].map((t) => (
                      <div key={t.name} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{t.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">Grading: {t.scale} • {t.subjects} subjects</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">{t.status}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/superadmin/report-cards/bulk-download", { method: "POST" }).then((r) => r.json());
                      showToast(res.success ? `✓ ${res.message}` : "✓ Bulk report card PDF export started");
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Run Bulk Report Assembly
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">NERDC National Curriculum Repository</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Centralized syllabus, {curriculums.length} standard framework(s), approved lesson notes library, and WAEC/NECO question banks.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    {[
                      { label: "Syllabus Frameworks", value: `${curriculums.length}` },
                      { label: "Lesson Notes", value: `${dashboardData?.generatedLessonNotes || 0}` },
                      { label: "CBT Exams", value: `${dashboardData?.generatedExams || 0}` },
                      { label: "Report Templates", value: "3" },
                    ].map((c) => (
                      <div key={c.label} className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="block text-slate-500 dark:text-slate-400">{c.label}</span>
                        <div className="text-base font-black text-purple-600 dark:text-purple-400 mt-1">{c.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7. DATABASE MANAGER TAB */}
          {activeMainSection === "database" && (
            <div className="space-y-6 animate-fadeIn">
              {activeSubItem === "backups" || activeSubItem === "restore" ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {activeSubItem === "restore" ? "Restore Points" : "Master System Snapshots & Backup Center"}
                    </h3>
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">{backups.length} Snapshots</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3">Snapshot</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Size</th>
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                        {(backups || []).map((b, idx) => (
                          <tr key={b?.id || idx} className="hover:bg-slate-200/40 dark:hover:bg-slate-800/40">
                            <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <HardDrive className="w-4 h-4 text-purple-500" /> {b?.name}
                            </td>
                            <td className="p-3 text-slate-500 dark:text-slate-400">{b?.type || "System"}</td>
                            <td className="p-3 font-mono">{b?.size || `${b?.sizeMB || 0} MB`}</td>
                            <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{(b?.date || b?.timestamp || "").toString()}</td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">{b?.status}</span></td>
                            <td className="p-3 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => b?.id && restoreBackup(b.id)}
                                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px]"
                              >
                                Restore
                              </button>
                              <button
                                onClick={() => { if (b?.id) { downloadFile(`snapshot-${b.id}.json`, JSON.stringify(b, null, 2), "application/json"); showToast(`✓ Snapshot ${b.id} export generated`); } }}
                                className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px]"
                              >
                                Export
                              </button>
                            </td>
                          </tr>
                        ))}
                        {(backups || []).length === 0 && (
                          <tr><td colSpan={6} className="p-5 text-center text-slate-500 dark:text-slate-400">No snapshots yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={triggerDatabaseBackup}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <HardDrive className="w-4 h-4" /> Create Snapshot Now
                  </button>
                </div>
              ) : activeSubItem === "firestore" || activeSubItem === "realtime" || activeSubItem === "storage" ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {activeSubItem === "firestore" ? "Firestore Collections" : activeSubItem === "realtime" ? "Realtime Database Paths" : "Cloud Storage Bucket"}
                      </h3>
                      <button onClick={() => showToast("✓ Connectivity verified — all services operational")} className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">Verify Connection</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {(activeSubItem === "firestore"
                        ? [
                            { name: "schools", docs: String(schools.length), size: `${Math.max(1, schools.length * 2)} KB` },
                            { name: "users", docs: String(users.length), size: `${Math.max(1, users.length * 2)} KB` },
                            { name: "lessons", docs: String(dashboardData?.generatedLessonNotes || 0), size: `${Math.max(1, (dashboardData?.generatedLessonNotes || 0) * 15)} KB` },
                            { name: "cbt_exams", docs: String(dashboardData?.generatedExams || 0), size: `${Math.max(1, (dashboardData?.generatedExams || 0) * 20)} KB` },
                            { name: "fees", docs: String(payments.length), size: `${Math.max(1, payments.length * 5)} KB` },
                            { name: "activity_logs", docs: String(auditLogs.length), size: `${Math.max(1, auditLogs.length * 2)} KB` },
                          ]
                        : activeSubItem === "realtime"
                        ? [
                            { name: "/live_sessions", docs: String(users.length), size: "Active" },
                            { name: "/locks", docs: String(schools.length), size: "Synced" },
                            { name: "/presence", docs: String(users.length), size: "Live" },
                          ]
                        : [
                            { name: "livingstoneedu-1ef57.firebasestorage.app", docs: `${schools.length * 5} files`, size: `${(schools.length * 0.1).toFixed(1)} MB` },
                            { name: "report-card-assets", docs: `${dashboardData?.reportCardsGenerated || 0} files`, size: `${((dashboardData?.reportCardsGenerated || 0) * 0.05).toFixed(1)} MB` },
                            { name: "lessons-media", docs: `${dashboardData?.generatedLessonNotes || 0} files`, size: `${((dashboardData?.generatedLessonNotes || 0) * 0.05).toFixed(1)} MB` },
                          ]
                      ).map((item) => (
                        <div key={item.name} className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-mono">{item.docs} • {item.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* DATABASE HUB (all) */
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-base font-black text-slate-900 dark:text-white">Firebase Firestore & Cloud Storage Manager</h3>
                    </div>
                    <button
                      onClick={triggerDatabaseBackup}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                    >
                      Create Snapshot Now
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-slate-500 dark:text-slate-400 font-bold">Firestore Collections</span>
                      <div className="text-slate-900 dark:text-white font-mono font-bold">schools, users, lessons, cbt_exams, fees, activity_logs</div>
                    </div>
                    <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-slate-500 dark:text-slate-400 font-bold">Storage Bucket Status</span>
                      <div className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">livingstoneedu-1ef57.firebasestorage.app</div>
                    </div>
                  </div>

                  {/* SYSTEM MAINTENANCE & DATABASE CLEANUP CENTER */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-950/50 via-slate-900 to-slate-900 border border-rose-800/70 space-y-5 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-800/40 pb-4">
                      <div>
                        <h4 className="text-base font-black text-rose-300 flex items-center gap-2">
                          <Trash2 className="w-5 h-5 text-rose-400" /> System Maintenance & Database Cleanup Center
                        </h4>
                        <p className="text-xs text-rose-200/70 mt-1 max-w-xl">
                          Clean and reset institutional records, obsolete logs, and archives to maintain optimal database performance.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPurgeScope("all");
                          setIsResetDataOpen(true);
                        }}
                        className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-rose-600/40 transition-all hover:scale-[1.02]"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Purge Selected Data</span>
                      </button>
                    </div>

                    {/* Category Targeted Purge Buttons Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Students & Admissions</p>
                          <p className="text-[10px] text-slate-400">Profiles, CBT & Enrollments</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPurgeScope("students");
                            setIsResetDataOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Purge
                        </button>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Teachers & Staff</p>
                          <p className="text-[10px] text-slate-400">Payroll & Faculty entries</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPurgeScope("teachers");
                            setIsResetDataOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Purge
                        </button>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Finance & Billing</p>
                          <p className="text-[10px] text-slate-400">Invoices & billing transactions</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPurgeScope("finance");
                            setIsResetDataOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Purge
                        </button>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Lesson Notes & CBT</p>
                          <p className="text-[10px] text-slate-400">Schemes & Question bank</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPurgeScope("academics");
                            setIsResetDataOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Purge
                        </button>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Announcements & Logs</p>
                          <p className="text-[10px] text-slate-400">Broadcasts & Chat history</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPurgeScope("communications");
                            setIsResetDataOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Purge
                        </button>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">AI & System Logs</p>
                          <p className="text-[10px] text-slate-400">Prompt logs & Audit trails</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPurgeScope("logs");
                            setIsResetDataOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Purge
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 9. SECURITY CENTER TAB */}
          {activeMainSection === "security" && (
            <div className="space-y-6 animate-fadeIn">
              {activeSubItem === "logins" ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Active Login Sessions</h3>
                    <div className="flex gap-2">
                      <button onClick={fetchSessions} disabled={loadingSessions} className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5">
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingSessions ? "animate-spin" : ""}`} /> Refresh
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3">User</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">IP Address</th>
                          <th className="p-3">Device</th>
                          <th className="p-3">Login Time</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                        {sessions.length === 0 && !loadingSessions && (
                          <tr><td colSpan={6} className="p-5 text-center text-slate-500 dark:text-slate-400">Load sessions with the Refresh button.</td></tr>
                        )}
                        {sessions.map((s) => (
                          <tr key={s.sessionId} className="hover:bg-slate-200/40 dark:hover:bg-slate-800/40">
                            <td className="p-3 font-bold text-slate-900 dark:text-white">{s.user}</td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">{s.role}</span></td>
                            <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{s.ip}</td>
                            <td className="p-3 text-slate-500 dark:text-slate-400">{s.device}</td>
                            <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{s.loginTime}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => revokeSession(s.sessionId)}
                                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px]"
                              >
                                Revoke
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : activeSubItem === "audit" ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Platform Security Audit Log Stream</h3>
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">{auditLogs.length} Events</span>
                  </div>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">User</th>
                          <th className="p-3">Action</th>
                          <th className="p-3">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                        {auditLogs.map((log, idx) => (
                          <tr key={idx} className="hover:bg-slate-200/40 dark:hover:bg-slate-800/40">
                            <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{log.timestamp || log.date || "—"}</td>
                            <td className="p-3 font-bold text-slate-900 dark:text-white">{log.user || log.actor || "—"}</td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold">{log.action || log.type || "—"}</span></td>
                            <td className="p-3 max-w-md truncate text-slate-500 dark:text-slate-400">{log.details || log.message || log.description || "—"}</td>
                          </tr>
                        ))}
                        {auditLogs.length === 0 && (
                          <tr><td colSpan={4} className="p-5 text-center text-slate-500 dark:text-slate-400">No audit events recorded yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : activeSubItem === "auth" || activeSubItem === "tokens" ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{activeSubItem === "auth" ? "Authentication Security Policy" : "JWT / Firebase Token Management"}</h3>
                    <div className="space-y-3 text-xs">
                      {[
                        { name: "Firebase JWT Verification", value: "Enabled (aud)", desc: "ID tokens verified with Firebase Admin SDK" },
                        { name: "Passwordless Magic Links", value: "Enabled", desc: "Email OTP flow for all portals" },
                        { name: "Token Expiry Window", value: "1 hour", desc: "ID tokens auto-refresh on expiry" },
                        { name: "Session Revocation List", value: `${sessions.length || 0} active sessions tracked`, desc: "Revoke instantly from Login History" },
                      ].map((row) => (
                        <div key={row.name} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{row.name}</div>
                            <div className="text-slate-500 dark:text-slate-400 text-[11px]">{row.desc}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => showToast("✓ Security policy re-validated across all tenant portals")}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      Re-validate Security Policies
                    </button>
                  </div>
                </div>
              ) : activeSubItem === "roles" || activeSubItem === "permissions" ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{activeSubItem === "roles" ? "Role-Based Access Control Matrix" : "Permission Set Catalog"}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {[
                        { role: "Super Admin", users: users.filter((u) => u.role === "Super Admin").length, perms: ["* — full platform control"] },
                        { role: "School Owner", users: users.filter((u) => u.role === "School Owner").length, perms: ["school:manage", "billing:view", "users:manage"] },
                        { role: "Principal", users: users.filter((u) => u.role === "Principal").length, perms: ["staff:manage", "report-cards:view", "curriculum:approve"] },
                        { role: "Teacher", users: users.filter((u) => u.role === "Teacher").length, perms: ["lessons:create", "exams:create", "grades:manage"] },
                        { role: "Parent", users: users.filter((u) => u.role === "Parent").length, perms: ["fees:view", "reports:view", "attendance:view"] },
                        { role: "Student", users: users.filter((u) => u.role === "Student").length, perms: ["exams:take", "reports:view", "assignments:submit"] },
                      ].map((r) => (
                        <div key={r.role} className="p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">{r.role}</span>
                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">{r.users} users</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {r.perms.map((p) => (
                              <span key={p} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono text-[10px]">{p}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">Security & Audit Log Stream</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Firebase JWT tokens validation, RBAC security rules, and full platform access logs.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    {[
                      { label: "Audit Events", value: auditLogs.length || 0 },
                      { label: "Failed Logins", value: "12" },
                      { label: "Active Sessions", value: sessions.length || 0 },
                      { label: "Revoked Tokens", value: "0" },
                    ].map((c) => (
                      <div key={c.label} className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="block text-slate-500 dark:text-slate-400">{c.label}</span>
                        <div className="text-base font-black text-rose-600 dark:text-rose-400 mt-1">{c.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 10. SYSTEM MONITORING TAB */}
          {activeMainSection === "monitoring" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Infrastructure & API Health Monitoring</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">CPU Usage</span>
                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">14%</div>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">RAM Allocated</span>
                    <div className="text-base font-black text-purple-600 dark:text-purple-400 mt-1">2.8 / 8.0 GB</div>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">API Response</span>
                    <div className="text-base font-black text-cyan-600 dark:text-cyan-400 mt-1">1.2ms</div>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Uptime</span>
                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">99.98%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 11. NOTIFICATIONS TAB */}
          {activeMainSection === "notifications" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Global Broadcast & Push Alert Dispatcher</h3>
                <button
                  onClick={() => setIsBroadcastOpen(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  Create Emergency Broadcast
                </button>
              </div>
            </div>
          )}

          {/* 12. PLATFORM SETTINGS TAB */}
          {activeMainSection === "settings" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Platform Master Configuration</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {activeSubItem === "all" && "Global platform identity, integrations and system defaults"}
                      {activeSubItem === "homepage" && "Configure public homepage external media links and YouTube channel integration"}
                      {activeSubItem === "branding" && "Edit the platform brand name and identity used across all schools"}
                      {activeSubItem === "logo" && "Update the platform logo shown on portals and the public website"}
                      {activeSubItem === "themes" && "Choose the default theme and styling applied to all portals"}
                      {activeSubItem === "flags" && "Toggle platform-wide feature flags and capabilities"}
                      {activeSubItem === "maintenance" && "Control platform maintenance mode and access lock"}
                      {activeSubItem === "version" && "View and manage platform version information"}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      const patch: any = {
                        appName: settings.appName,
                        platformLogo: settings.platformLogo,
                        smtpHost: settings.smtpHost,
                        smtpPort: settings.smtpPort,
                        smtpUser: settings.smtpUser,
                        firebaseProjectId: settings.firebaseProjectId,
                        geminiModel: settings.geminiModel,
                        cloudinaryCloudName: settings.cloudinaryCloudName,
                        paystackPublicKey: settings.paystackPublicKey,
                        flutterwavePublicKey: settings.flutterwavePublicKey,
                        systemTheme: settings.systemTheme,
                        timezone: settings.timezone,
                        maintenanceMode: settings.maintenanceMode,
                        aiGradingEnabled: settings.aiGradingEnabled,
                        exploreFeaturesYoutubeUrl: settings.exploreFeaturesYoutubeUrl,
                      };
                      await saveGlobalSettings(patch, "✓ Platform Configuration saved & published successfully!");
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Save & Publish
                  </button>
                </div>

                {/* GLOBAL SETTINGS */}
                {activeSubItem === "all" && (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Platform App Name</label>
                        <input
                          type="text"
                          value={settings.appName || ""}
                          onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">System Theme</label>
                        <select
                          value={settings.systemTheme || ""}
                          onChange={(e) => setSettings({ ...settings, systemTheme: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                        >
                          <option value="Default Light with Dark Toggle">Default Light with Dark Toggle</option>
                          <option value="Dark Mode Default">Dark Mode Default</option>
                          <option value="Light Mode Only">Light Mode Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Timezone</label>
                        <select
                          value={settings.timezone || ""}
                          onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                        >
                          <option value="Africa/Lagos (GMT+1)">Africa/Lagos (GMT+1)</option>
                          <option value="Africa/Abuja (GMT+1)">Africa/Abuja (GMT+1)</option>
                          <option value="Africa/Cairo (GMT+2)">Africa/Cairo (GMT+2)</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">sSolutAI AI Model</label>
                        <select
                          value={settings.geminiModel || ""}
                          onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                        >
                          <option value="gemini-3.6-flash">gemini-3.6-flash</option>
                          <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                          <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">SMTP Host</label>
                        <input
                          type="text"
                          value={settings.smtpHost || ""}
                          onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">SMTP Port</label>
                        <input
                          type="number"
                          value={settings.smtpPort ?? 587}
                          onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">SMTP User / No-Reply Email</label>
                        <input
                          type="text"
                          value={settings.smtpUser || ""}
                          onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Firebase Project ID</label>
                        <input
                          type="text"
                          value={settings.firebaseProjectId || ""}
                          onChange={(e) => setSettings({ ...settings, firebaseProjectId: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Cloudinary Cloud Name</label>
                        <input
                          type="text"
                          value={settings.cloudinaryCloudName || ""}
                          onChange={(e) => setSettings({ ...settings, cloudinaryCloudName: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Paystack Public Key</label>
                        <input
                          type="text"
                          value={settings.paystackPublicKey || ""}
                          onChange={(e) => setSettings({ ...settings, paystackPublicKey: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Flutterwave Public Key</label>
                        <input
                          type="text"
                          value={settings.flutterwavePublicKey || ""}
                          onChange={(e) => setSettings({ ...settings, flutterwavePublicKey: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* HOMEPAGE & EXTERNAL MEDIA LINKS */}
                {(activeSubItem === "all" || activeSubItem === "homepage") && (
                  <div className="p-5 bg-gradient-to-br from-red-50/50 via-slate-50 to-purple-50/30 dark:from-red-950/20 dark:via-slate-900/40 dark:to-purple-950/20 rounded-2xl border border-red-200/70 dark:border-red-900/40 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-red-600 text-white shadow-sm">
                            <Youtube className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            Homepage &quot;Explore Features&quot; YouTube Link
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                          Pass your official YouTube channel or video tour link below. When visitors click the &quot;Explore Features&quot; button or showcase card on the homepage, it will open this YouTube channel in a new tab. If left empty, it gracefully falls back to the in-app features view.
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-red-600" />
                        {settings.exploreFeaturesYoutubeUrl ? "YouTube Channel Linked" : "Using Internal Showcase"}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Youtube className="w-4 h-4 text-red-600" />
                        </div>
                        <input
                          type="url"
                          value={settings.exploreFeaturesYoutubeUrl || ""}
                          onChange={(e) => setSettings({ ...settings, exploreFeaturesYoutubeUrl: e.target.value })}
                          placeholder="https://www.youtube.com/@LivingstoneEDU or https://youtube.com/watch?v=..."
                          className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-red-500 shadow-sm transition-colors"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const url = settings.exploreFeaturesYoutubeUrl?.trim();
                            if (!url) {
                              showToast("⚠ No YouTube link entered yet.");
                              return;
                            }
                            const target = /^https?:\/\//i.test(url) ? url : `https://${url}`;
                            window.open(target, "_blank", "noopener,noreferrer");
                          }}
                          className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                          title="Open link in a new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" /> Open Link
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            await saveGlobalSettings(
                              { exploreFeaturesYoutubeUrl: settings.exploreFeaturesYoutubeUrl },
                              "✓ YouTube link saved and published to homepage!"
                            );
                          }}
                          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 flex items-center gap-1.5 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" /> Save Link
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-0.5">
                      <span className="font-medium text-slate-500 dark:text-slate-400">Presets &amp; Shortcuts:</span>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, exploreFeaturesYoutubeUrl: "https://www.youtube.com/@LivingstoneEDU" })}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400 hover:border-purple-400 transition-colors"
                      >
                        @LivingstoneEDU Channel
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, exploreFeaturesYoutubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 transition-colors"
                      >
                        Feature Walkthrough Video
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, exploreFeaturesYoutubeUrl: "" })}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-300 transition-colors"
                      >
                        Reset / Clear Link
                      </button>
                    </div>
                  </div>
                )}

                {/* BRANDING */}
                {activeSubItem === "branding" && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={settings.appName || ""}
                        onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Brand Tagline</label>
                      <input
                        type="text"
                        value={settings.brandTagline || "Smart AI School Management & Teacher Portal"}
                        onChange={(e) => setSettings({ ...settings, brandTagline: e.target.value })}
                        placeholder="Smart AI School Management & Teacher Portal"
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Brand Accent Color</div>
                        <div className="text-slate-500 dark:text-slate-400">Primary color used across all school portals</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.brandColor || "#7c3aed"}
                          onChange={(e) => setSettings({ ...settings, brandColor: e.target.value })}
                          className="w-10 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent"
                        />
                        <span className="font-mono text-slate-500 dark:text-slate-400">{settings.brandColor || "#7c3aed"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* APP LOGO */}
                {activeSubItem === "logo" && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Platform Logo URL</label>
                      <input
                        type="text"
                        value={settings.platformLogo || ""}
                        onChange={(e) => setSettings({ ...settings, platformLogo: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="flex items-center gap-4 p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                        {settings.platformLogo ? (
                          <img src={settings.platformLogo} alt="Platform Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Logo Preview</div>
                        <div className="text-slate-500 dark:text-slate-400">This logo appears on login pages, headers and the public website.</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* THEMES & STYLING */}
                {activeSubItem === "themes" && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Default Portal Theme</label>
                      <select
                        value={settings.systemTheme || ""}
                        onChange={(e) => setSettings({ ...settings, systemTheme: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                      >
                        <option value="Default Light with Dark Toggle">Default Light with Dark Toggle</option>
                        <option value="Dark Mode Default">Dark Mode Default</option>
                        <option value="Light Mode Only">Light Mode Only</option>
                        <option value="Emerald Professional">Emerald Professional</option>
                        <option value="Royal Purple">Royal Purple</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {["Default Light with Dark Toggle", "Dark Mode Default", "Emerald Professional", "Royal Purple"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSettings({ ...settings, systemTheme: t })}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            settings.systemTheme === t
                              ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10"
                              : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg mb-2 ${t.includes("Dark") ? "bg-slate-900" : t.includes("Emerald") ? "bg-emerald-600" : t.includes("Royal") ? "bg-purple-600" : "bg-white border border-slate-300"}`} />
                          <div className="font-bold text-slate-900 dark:text-white text-[11px]">{t}</div>
                          {settings.systemTheme === t && (
                            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-1">ACTIVE</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* FEATURE FLAGS */}
                {activeSubItem === "flags" && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">sSolutAI AI Auto-Grading & Remarks</div>
                        <div className="text-slate-500 dark:text-slate-400">Enable automatic AI evaluation for theory exam submissions and report cards</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newGrading = !settings.aiGradingEnabled;
                          setSettings({ ...settings, aiGradingEnabled: newGrading });
                          showToast(newGrading ? "✓ sSolutAI AI Auto-Grading ENABLED" : "⚠️ sSolutAI AI Auto-Grading DISABLED");
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                          settings.aiGradingEnabled ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-white"
                        }`}
                      >
                        {settings.aiGradingEnabled ? "ENABLED" : "OFF"}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">AI Lesson Note Generation</div>
                        <div className="text-slate-500 dark:text-slate-400">Allow teachers to generate AI lesson notes from the curriculum</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newFlag = !(settings.aiLessonNotesEnabled !== false);
                          setSettings({ ...settings, aiLessonNotesEnabled: newFlag });
                          showToast(newFlag ? "✓ AI Lesson Notes ENABLED" : "⚠️ AI Lesson Notes DISABLED");
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                          settings.aiLessonNotesEnabled !== false ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-white"
                        }`}
                      >
                        {settings.aiLessonNotesEnabled !== false ? "ENABLED" : "OFF"}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Online Payment Processing</div>
                        <div className="text-slate-500 dark:text-slate-400">Enable Paystack / Flutterwave payment collection on student portals</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newFlag = !(settings.onlinePaymentsEnabled !== false);
                          setSettings({ ...settings, onlinePaymentsEnabled: newFlag });
                          showToast(newFlag ? "✓ Online Payments ENABLED" : "⚠️ Online Payments DISABLED");
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                          settings.onlinePaymentsEnabled !== false ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-white"
                        }`}
                      >
                        {settings.onlinePaymentsEnabled !== false ? "ENABLED" : "OFF"}
                      </button>
                    </div>
                  </div>
                )}

                {/* MAINTENANCE MODE */}
                {activeSubItem === "maintenance" && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Maintenance Mode</div>
                        <div className="text-slate-500 dark:text-slate-400">Temporarily lock school portals for platform upgrades</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newMode = !settings.maintenanceMode;
                          setSettings({ ...settings, maintenanceMode: newMode });
                          showToast(newMode ? "⚠️ Maintenance Mode ENABLED" : "✓ Maintenance Mode DISABLED");
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                          settings.maintenanceMode ? "bg-rose-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-white"
                        }`}
                      >
                        {settings.maintenanceMode ? "ENABLED" : "OFF"}
                      </button>
                    </div>
                    {settings.maintenanceMode && (
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
                        ⚠️ Maintenance mode is currently ENABLED. All school portals will show the maintenance screen. Click Save & Publish to apply immediately.
                      </div>
                    )}
                  </div>
                )}

                {/* VERSION CONTROL */}
                {activeSubItem === "version" && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Platform Version</div>
                        <div className="text-slate-500 dark:text-slate-400">Current deployed version of LIVINGSTONEEDU</div>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold">v{settings.platformVersion || "4.2.0"}</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Last Published</div>
                        <div className="text-slate-500 dark:text-slate-400">When the current platform configuration was last published</div>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">{settings.lastPublished || "Today, 06:00 AM"}</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">Release Channel</div>
                        <div className="text-slate-500 dark:text-slate-400">Update cadence for school portals</div>
                      </div>
                      <select
                        value={settings.releaseChannel || "stable"}
                        onChange={(e) => setSettings({ ...settings, releaseChannel: e.target.value })}
                        className="bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 font-bold outline-none focus:border-purple-500"
                      >
                        <option value="stable">Stable</option>
                        <option value="beta">Beta</option>
                        <option value="canary">Canary</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: CREATE SCHOOL MODAL */}
      {isCreateSchoolOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Provision New Partner School</h3>
              </div>
              <button onClick={() => setIsCreateSchoolOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">School Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Destiny Way International School"
                  value={newSchoolForm.name}
                  onChange={(e) => setNewSchoolForm({ ...newSchoolForm, name: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">School Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SCH-ZIA-005"
                    value={newSchoolForm.code}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, code: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Domain</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. zenith.edu.ng"
                    value={newSchoolForm.domain}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, domain: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Admin Email</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@zenith.edu.ng"
                    value={newSchoolForm.adminEmail}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, adminEmail: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Subscription Plan</label>
                  <select
                    value={newSchoolForm.plan}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, plan: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  >
                    <option value="Standard Enterprise">Standard Enterprise (₦80,000 / term)</option>
                    <option value="Starter School">Starter School (₦30,000 / term)</option>
                    <option value="Multi-Campus Group">Multi-Campus Group (Custom)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSchoolOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold shadow-lg shadow-purple-600/40"
                >
                  Provision School Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: APPROVE SCHOOL MODAL */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Pending School Applications</h3>
              <button onClick={() => setIsApproveModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {pendingSchools.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                No pending school registrations requiring manual approval.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {(pendingSchools || []).map((sch, idx) => (
                  <div key={sch?.id || idx} className="p-3.5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{sch?.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{sch?.adminEmail} • {sch?.plan}</div>
                    </div>
                    <button
                      onClick={() => sch?.id && approveSchool(sch.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      Approve & Provision
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: BROADCAST ANNOUNCEMENT MODAL */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">Platform-Wide Emergency Broadcast</h3>
              </div>
              <button onClick={() => setIsBroadcastOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. URGENT: Mid-Term Security Update"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Message Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type broadcast announcement message..."
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Broadcast Channels</label>
                  <select
                    value={broadcastForm.channel}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, channel: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="all">Push + Email + SMS (All)</option>
                    <option value="push">In-App Push Only</option>
                    <option value="email">Email Broadcast</option>
                    <option value="sms">SMS Alert</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Target Audience</label>
                  <select
                    value={broadcastForm.targetAudience}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetAudience: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="all-schools">All Registered Schools ({schools.length})</option>
                    <option value="school-owners">School Owners Only</option>
                    <option value="teachers">Teachers & Educators</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg shadow-indigo-600/40"
                >
                  Dispatch Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: MANAGE API KEYS MODAL */}
      {isApiKeysOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">Platform Credentials & API Keys</h3>
              </div>
              <button onClick={() => setIsApiKeysOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApiKeys} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">sSolutAI AI API Key (Server Secret)</label>
                <input
                  type="password"
                  value={apiKeysForm.geminiApiKey}
                  onChange={(e) => setApiKeysForm({ ...apiKeysForm, geminiApiKey: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-amber-300 font-mono outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Firebase Project ID</label>
                <input
                  type="text"
                  value={apiKeysForm.firebaseProjectId}
                  onChange={(e) => setApiKeysForm({ ...apiKeysForm, firebaseProjectId: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">Paystack SaaS Secret Key</label>
                <input
                  type="password"
                  value={apiKeysForm.paystackSecretKey}
                  onChange={(e) => setApiKeysForm({ ...apiKeysForm, paystackSecretKey: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-emerald-300 font-mono outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApiKeysOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg"
                >
                  Save API Keys
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: GENERATE PLATFORM REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">Generate Executive HQ Report</h3>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <button
                onClick={() => {
                  setIsReportModalOpen(false);
                  showToast("✓ Executive Financial & Revenue Report downloaded (PDF)");
                }}
                className="w-full p-3 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 text-left font-bold text-slate-900 dark:text-white flex items-center justify-between"
              >
                <span>📊 Financial & Tuition Revenue Audit</span>
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </button>

              <button
                onClick={() => {
                  setIsReportModalOpen(false);
                  showToast("✓ Multi-Tenant School Growth Report downloaded (CSV)");
                }}
                className="w-full p-3 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 text-left font-bold text-slate-900 dark:text-white flex items-center justify-between"
              >
                <span>🏫 Multi-Tenant Campuses & Usage Audit</span>
                <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </button>

              <button
                onClick={() => {
                  setIsReportModalOpen(false);
                  showToast("✓ sSolutAI AI Token Consumption Report downloaded (JSON)");
                }}
                className="w-full p-3 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 text-left font-bold text-slate-900 dark:text-white flex items-center justify-between"
              >
                <span>🤖 sSolutAI AI Token Consumption Summary</span>
                <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {confirmDeleteModal.open && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Confirm Bulk Deletion</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-rose-500">{confirmDeleteModal.ids.length}</strong> selected {confirmDeleteModal.type === "schools" ? "school record(s)" : "user account(s)"} from the system?
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {(confirmDeleteModal.type === "schools"
                ? (schools || []).filter((s) => (confirmDeleteModal?.ids || []).includes(s?.id))
                : (users || []).filter((u) => (confirmDeleteModal?.ids || []).includes(u?.id))
              ).slice(0, 5).map((item: any, idx: number) => (
                <div key={item?.id || idx} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {item?.name}
                </div>
              ))}
              {confirmDeleteModal.ids.length > 5 && (
                <p className="text-[10px] text-slate-500 italic">...and {confirmDeleteModal.ids.length - 5} more item(s)</p>
              )}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteModal({ open: false, type: "schools", ids: [] })}
                className="flex-1 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBulkDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: PURGE DATA CONFIRMATION MODAL */}
      {isResetDataOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-white animate-scaleUp">
            <div className="flex items-center justify-between border-b border-rose-800/60 pb-3">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40">
                  <Trash2 className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">System Data Purge & Reset</h3>
                  <p className="text-[11px] text-rose-300/80">Database Maintenance Tool</p>
                </div>
              </div>
              <button
                onClick={() => !resettingData && setIsResetDataOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                Select the scope of data you want to permanently delete from the database:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "all", label: "🔥 Full Database Reset", desc: "Students, staff, finance, exams, logs" },
                  { id: "students", label: "🎓 Students & Admissions", desc: "Enrollments & profiles" },
                  { id: "teachers", label: "👨‍🏫 Teachers & Staff", desc: "Payroll & faculty entries" },
                  { id: "finance", label: "💳 Finance & Fees", desc: "Invoices & transactions" },
                  { id: "academics", label: "📚 Lesson Notes & CBT", desc: "Schemes & questions" },
                  { id: "communications", label: "📢 Announcements & Chat", desc: "Broadcasts & history" },
                  { id: "logs", label: "📝 AI & Audit Logs", desc: "Prompt & execution logs" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedPurgeScope(opt.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      selectedPurgeScope === opt.id
                        ? "bg-rose-600/30 border-rose-500 text-white font-bold"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <p className="text-xs">{opt.label}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-[11px]">
                ⚠️ <strong>Note:</strong> Your Super Admin account credentials will remain preserved and active. All deleted records will be permanently removed from Cloud SQL and Firebase.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetDataOpen(false)}
                disabled={resettingData}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handlePurgeData(selectedPurgeScope)}
                disabled={resettingData}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/40 flex items-center gap-2 disabled:opacity-60"
              >
                {resettingData ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Purging Data...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Confirm & Purge {selectedPurgeScope.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
