import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Zap,
  BookOpen,
  FileSpreadsheet,
  Megaphone,
  Smartphone,
  ShieldCheck,
  Send,
  X,
  Clock,
  Sparkles,
  RefreshCw,
  Sliders
} from "lucide-react";
import {
  requestFCMPermissionAndGetToken,
  listenToForegroundFCMMessages
} from "../lib/fcm";
import { UserRole } from "../types";

interface FCMPushAlertManagerProps {
  currentRole?: UserRole;
  userSession?: any;
  compact?: boolean;
}

export const FCMPushAlertManager: React.FC<FCMPushAlertManagerProps> = ({
  currentRole,
  userSession,
  compact = false,
}) => {
  const [permissionState, setPermissionState] = useState<string>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });

  const [fcmToken, setFcmToken] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Alerts history log
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeToast, setActiveToast] = useState<any | null>(null);

  // Dispatch modal / form
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendCategory, setSendCategory] = useState<"lesson_note" | "exam_schedule" | "announcement">("announcement");
  const [sendTitle, setSendTitle] = useState("");
  const [sendBody, setSendBody] = useState("");
  const [sendTargetRole, setSendTargetRole] = useState<"all" | "teachers" | "students" | "parents">("all");
  const [isSending, setIsSending] = useState(false);

  const schoolId = userSession?.schoolId || "SCH-101";

  // Fetch real-time FCM alerts from server
  const fetchAlerts = async () => {
    try {
      const res = await fetch(`/api/fcm/alerts?schoolId=${encodeURIComponent(schoolId)}&role=${encodeURIComponent(currentRole || "all")}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAlerts(data.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchAlerts();

    // Listen for foreground FCM alerts
    listenToForegroundFCMMessages((newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
      setActiveToast(newAlert);
      setTimeout(() => {
        setActiveToast(null);
      }, 6000);
    });
  }, [schoolId, currentRole]);

  const handleEnablePushAlerts = async () => {
    setIsRegistering(true);
    setStatusMessage(null);

    const res = await requestFCMPermissionAndGetToken(
      currentRole,
      schoolId,
      userSession?.id
    );

    setIsRegistering(false);
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionState(Notification.permission);
    }

    if (res.success) {
      setFcmToken(res.token || "");
      setStatusMessage({ text: res.message });
      fetchAlerts();
    } else {
      setStatusMessage({ text: res.message, isError: true });
    }
  };

  const handleDispatchPushAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendTitle || !sendBody) {
      alert("Please provide both a title and alert message body.");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/fcm/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sendTitle,
          body: sendBody,
          category: sendCategory,
          targetRole: sendTargetRole,
          schoolId,
          senderName: userSession?.fullName || userSession?.name || `${currentRole} Admin`,
        }),
      });

      const data = await res.json();
      setIsSending(false);

      if (data.success) {
        setStatusMessage({ text: `✓ FCM Push Alert sent to ${data.data?.deliveredCount || 1} target subscriber device(s)!` });
        setSendTitle("");
        setSendBody("");
        setIsSendModalOpen(false);
        fetchAlerts();
      } else {
        alert(data.message || "Failed to dispatch push alert");
      }
    } catch (err) {
      setIsSending(false);
      alert("Network error sending FCM push alert");
    }
  };

  const getCategoryBadge = (cat: string) => {
    if (cat === "lesson_note") {
      return (
        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center gap-1 border border-blue-500/30">
          <BookOpen className="w-3 h-3 text-blue-500" /> Lesson Note
        </span>
      );
    }
    if (cat === "exam_schedule") {
      return (
        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-[10px] flex items-center gap-1 border border-purple-500/30">
          <FileSpreadsheet className="w-3 h-3 text-purple-500" /> Exam Schedule
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px] flex items-center gap-1 border border-amber-500/30">
        <Megaphone className="w-3 h-3 text-amber-500" /> Announcement
      </span>
    );
  };

  if (compact) {
    return (
      <div className="relative inline-block">
        <button
          onClick={handleEnablePushAlerts}
          disabled={isRegistering}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            permissionState === "granted"
              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
          }`}
          title="Firebase Cloud Messaging Real-Time Push Alerts"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{permissionState === "granted" ? "FCM Alerts Active" : "Enable Closed-App Push Alerts"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* FLOATING REAL-TIME FOREGROUND TOAST ALERT */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-[99999] max-w-sm w-full bg-slate-900 border-2 border-amber-500 text-white p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-300">FCM Push Alert</span>
                {getCategoryBadge(activeToast.category)}
              </div>
              <h4 className="text-sm font-bold text-white mt-1">{activeToast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{activeToast.body}</p>
            </div>
          </div>
          <button onClick={() => setActiveToast(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FCM MAIN MANAGEMENT CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Firebase Cloud Messaging (FCM) Real-Time Push Alerts
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-extrabold uppercase border border-indigo-500/30">
                  Closed-App Enabled
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Delivers instant push alerts for new lesson notes, exam schedules, and school announcements even when the app is closed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEnablePushAlerts}
              disabled={isRegistering}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                permissionState === "granted"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>
                {isRegistering
                  ? "Registering FCM Token..."
                  : permissionState === "granted"
                  ? "✓ Push Alerts Enabled"
                  : "Enable Closed-App Push Alerts"}
              </span>
            </button>

            <button
              onClick={() => setIsSendModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Push Alert</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
              statusMessage.isError
                ? "bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
            }`}
          >
            {statusMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* ALERTS HISTORY STREAM */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Recent Real-Time FCM Alerts Ledger ({alerts.length})</span>
            </h4>
            <button
              onClick={fetchAlerts}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {alerts.map((a, idx) => (
              <div
                key={a.id || idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(a.category)}
                    <span className="font-bold text-slate-900 dark:text-white">{a.title}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">{a.body}</p>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                    <span>Sender: {a.senderName || "School Admin"}</span>
                    <span>•</span>
                    <span>Target: {a.targetRole || "All Members"}</span>
                    <span>•</span>
                    <span>Delivered to {a.deliveredCount || 1} Device(s)</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No FCM push alerts sent yet. Click &quot;Dispatch Push Alert&quot; to broadcast real-time notifications to teachers and students.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DISPATCH PUSH ALERT MODAL */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-600" />
                <span>Broadcast Real-Time FCM Push Alert</span>
              </h3>
              <button onClick={() => setIsSendModalOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchPushAlert} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alert Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSendCategory("announcement")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      sendCategory === "announcement"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    📢 Announcement
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendCategory("lesson_note")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      sendCategory === "lesson_note"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    📚 Lesson Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendCategory("exam_schedule")}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      sendCategory === "exam_schedule"
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    📝 Exam Schedule
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Audience
                </label>
                <select
                  value={sendTargetRole}
                  onChange={(e) => setSendTargetRole(e.target.value as any)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white outline-none"
                >
                  <option value="all">All School Members (Teachers, Students & Parents)</option>
                  <option value="teachers">Teachers & Staff Only</option>
                  <option value="students">Students Only</option>
                  <option value="parents">Parents Only</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alert Title
                </label>
                <input
                  type="text"
                  placeholder={
                    sendCategory === "lesson_note"
                      ? "e.g. New Mathematics Lesson Note Published for SS2"
                      : sendCategory === "exam_schedule"
                      ? "e.g. First Term CBT Exam Timetable Released"
                      : "e.g. Urgent Notice: Parent-Teacher Association Meeting"
                  }
                  value={sendTitle}
                  onChange={(e) => setSendTitle(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alert Message Body
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed push alert notification message..."
                  value={sendBody}
                  onChange={(e) => setSendBody(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Broadcasting FCM Alert...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch Real-Time FCM Push Alert</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
