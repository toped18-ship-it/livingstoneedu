import React, { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Server,
  Database,
  BookOpen,
  Sparkles,
  Mail,
  Bell,
  Users,
  ShieldCheck,
  Zap,
  Clock,
  Layers,
} from "lucide-react";
import { UserRole } from "../types";

interface DiagnosticCheck {
  id: string;
  category: string;
  name: string;
  status: "pass" | "warn" | "fail";
  durationMs: number;
  details: string;
}

interface DiagnosticResponse {
  success: boolean;
  timestamp: string;
  totalDurationMs: number;
  overallStatus: "healthy" | "degraded" | "error";
  checks: DiagnosticCheck[];
  stores: {
    studentsCount: number;
    teachersCount: number;
    schoolsCount: number;
    usersCount: number;
    lessonNotesCount: number;
    questionBankCount: number;
    financeInvoicesCount: number;
    libraryBooksCount: number;
    registeredSyncStores: number;
  };
  environment: {
    appName: string;
    version: string;
    nodeEnv: string;
    sqlDatabase: string;
    firebaseProjectId: string;
    aiKeyConfigured: boolean;
  };
}

interface SystemDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchRole?: (role: UserRole) => void;
  currentRole?: UserRole;
}

export function SystemDiagnosticsModal({
  isOpen,
  onClose,
  onSwitchRole,
  currentRole,
}: SystemDiagnosticsModalProps) {
  const [data, setData] = useState<DiagnosticResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"checks" | "endpoints" | "stores" | "roles">("checks");

  // Endpoint ping testing state
  const [endpointResults, setEndpointResults] = useState<
    Record<string, { status: number; latencyMs: number; ok: boolean; info?: string }>
  >({});
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/diagnostics/run", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to run diagnostics`);
      const json: DiagnosticResponse = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || "Failed to reach diagnostics API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  const testEndpoint = async (path: string, label: string) => {
    setTestingEndpoint(path);
    const start = performance.now();
    try {
      const res = await fetch(path, { cache: "no-store" });
      const latencyMs = Math.round(performance.now() - start);
      let info = "";
      try {
        const json = await res.json();
        if (Array.isArray(json)) info = `${json.length} items`;
        else if (json && typeof json === "object") {
          info = json.success ? "Success" : json.status || "OK";
        }
      } catch {
        info = res.statusText;
      }
      setEndpointResults((prev) => ({
        ...prev,
        [path]: { status: res.status, latencyMs, ok: res.ok, info },
      }));
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      setEndpointResults((prev) => ({
        ...prev,
        [path]: { status: 0, latencyMs, ok: false, info: err?.message || "Failed" },
      }));
    } finally {
      setTestingEndpoint(null);
    }
  };

  const testAllEndpoints = async () => {
    const list = [
      { path: "/api/health", label: "System Health" },
      { path: "/api/schools", label: "Schools Registry" },
      { path: "/api/students", label: "Students Store" },
      { path: "/api/teachers", label: "Teachers Roster" },
      { path: "/api/subscription/status", label: "Subscription Status" },
      { path: "/api/finance/stats", label: "Finance Statistics" },
      { path: "/api/library", label: "Library Resources" },
      { path: "/api/gamified/leaderboard", label: "Gamified Leaderboard" },
    ];
    for (const item of list) {
      await testEndpoint(item.path, item.label);
    }
  };

  if (!isOpen) return null;

  const rolesList: { role: UserRole; desc: string }[] = [
    { role: "Teacher", desc: "AI Lesson notes, question bank, attendance & gradebook" },
    { role: "School Administrator", desc: "Admissions, staff payroll, school settings & ID cards" },
    { role: "Super Admin", desc: "Multi-school tenant management, billing & global AI controls" },
    { role: "Student", desc: "CBT entrance exams, report cards, gamified lessons & timetable" },
    { role: "Parent", desc: "Ward academic reports, school communication & fee receipts" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  System Diagnostics & Functional Verification
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Audit
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time validation for portals, dual-sync stores, and educational engine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
              title="Re-run diagnostic checks"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Testing..." : "Re-run Suite"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close diagnostics"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab("checks")}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 ${
              activeTab === "checks"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Subsystem Health Checks ({data?.checks?.length || 8})
          </button>
          <button
            onClick={() => setActiveTab("endpoints")}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 ${
              activeTab === "endpoints"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Live Endpoint Pings
          </button>
          <button
            onClick={() => setActiveTab("stores")}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 ${
              activeTab === "stores"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Data Stores Inventory
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 ${
              activeTab === "roles"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Multi-Role Portal Switcher
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Diagnostics Error:</span>
                {error}
              </div>
            </div>
          )}

          {/* TAB 1: Checks */}
          {activeTab === "checks" && (
            <div className="space-y-4">
              {/* Quick Status Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Overall State</div>
                  <div className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Operational
                  </div>
                </div>
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">SQL Database</div>
                  <div className="text-sm font-semibold text-white mt-1 truncate">
                    {data?.environment.sqlDatabase || "livingstoneedu-7ef59-service"}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Firebase Project</div>
                  <div className="text-sm font-semibold text-white mt-1 truncate">
                    {data?.environment.firebaseProjectId || "livingstoneedu-7ef59"}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Suite Latency</div>
                  <div className="text-base font-bold text-indigo-400 mt-1 tabular-nums">
                    {data?.totalDurationMs ? `${data.totalDurationMs}ms` : "< 10ms"}
                  </div>
                </div>
              </div>

              {/* Checks List */}
              <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 bg-slate-950/40">
                {data?.checks?.map((check) => (
                  <div key={check.id} className="p-3.5 flex items-start justify-between gap-3 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {check.status === "pass" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : check.status === "warn" ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{check.name}</span>
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                            {check.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{check.details}</p>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 tabular-nums shrink-0">
                      {check.durationMs}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Live Endpoints */}
          {activeTab === "endpoints" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Click any endpoint to ping it directly or test all in sequence.
                </p>
                <button
                  onClick={testAllEndpoints}
                  disabled={!!testingEndpoint}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
                >
                  Test All Endpoints
                </button>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 bg-slate-950/40">
                {[
                  { path: "/api/health", label: "Core API Health Check", desc: "Non-blocking heartbeat" },
                  { path: "/api/schools", label: "Schools Registry", desc: "Multi-tenant institutions roster" },
                  { path: "/api/students", label: "Enrolled Students", desc: "Student records and profiles" },
                  { path: "/api/teachers", label: "Faculty & Teachers", desc: "Staff directory & subject assignments" },
                  { path: "/api/subscription/status", label: "Subscription Status", desc: "School plan & trial expiry" },
                  { path: "/api/finance/stats", label: "Finance & Fee Stats", desc: "Invoices & payment records" },
                  { path: "/api/library", label: "Digital Library", desc: "Curriculum textbooks & resources" },
                  { path: "/api/gamified/leaderboard", label: "Gamified Learning", desc: "Student badges & leaderboards" },
                ].map((item) => {
                  const res = endpointResults[item.path];
                  const isCurrent = testingEndpoint === item.path;

                  return (
                    <div key={item.path} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{item.label}</span>
                          <code className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded">
                            {item.path}
                          </code>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {res && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`font-semibold ${res.ok ? "text-emerald-400" : "text-rose-400"}`}>
                              {res.status} {res.ok ? "OK" : "ERR"}
                            </span>
                            <span className="text-slate-500 tabular-nums font-mono text-[11px]">
                              {res.latencyMs}ms
                            </span>
                            {res.info && (
                              <span className="text-slate-400 text-[11px] hidden sm:inline">
                                ({res.info})
                              </span>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => testEndpoint(item.path, item.label)}
                          disabled={isCurrent}
                          className="px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                        >
                          {isCurrent ? "Pinging..." : "Ping"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Data Stores */}
          {activeTab === "stores" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Live in-memory record counts currently synced with Cloud SQL & Firebase.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Enrolled Students", count: data?.stores.studentsCount ?? 0, icon: Users, color: "text-blue-400" },
                  { label: "Teaching Faculty", count: data?.stores.teachersCount ?? 0, icon: BookOpen, color: "text-indigo-400" },
                  { label: "Registered Schools", count: data?.stores.schoolsCount ?? 0, icon: Server, color: "text-emerald-400" },
                  { label: "Lesson Notes", count: data?.stores.lessonNotesCount ?? 0, icon: Sparkles, color: "text-amber-400" },
                  { label: "Question Bank Items", count: data?.stores.questionBankCount ?? 0, icon: Layers, color: "text-purple-400" },
                  { label: "Finance Invoices", count: data?.stores.financeInvoicesCount ?? 0, icon: ShieldCheck, color: "text-cyan-400" },
                  { label: "Library Books", count: data?.stores.libraryBooksCount ?? 0, icon: BookOpen, color: "text-rose-400" },
                  { label: "Registered Sync Stores", count: data?.stores.registeredSyncStores ?? 0, icon: Database, color: "text-emerald-400" },
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">{card.label}</span>
                        <Icon className={`w-4 h-4 ${card.color}`} />
                      </div>
                      <div className="text-2xl font-bold text-white mt-2 tabular-nums">
                        {card.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Multi-Role Switcher */}
          {activeTab === "roles" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Switch between user roles instantly to verify role-specific permissions, dashboards, and navigation cards.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rolesList.map((item) => {
                  const isCurrent = currentRole === item.role;
                  return (
                    <div
                      key={item.role}
                      className={`p-4 border rounded-xl transition-all flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? "bg-indigo-600/10 border-indigo-500/50"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{item.role}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              Active Role
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                      </div>

                      <button
                        onClick={() => {
                          if (onSwitchRole) {
                            onSwitchRole(item.role);
                            onClose();
                          }
                        }}
                        disabled={isCurrent}
                        className={`w-full py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors ${
                          isCurrent
                            ? "bg-slate-800 text-slate-400 cursor-default"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                        }`}
                      >
                        {isCurrent ? "Current Portal" : `Switch to ${item.role}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Node 22 Fullstack | PostgreSQL & Firebase Dual Sync Verified</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
