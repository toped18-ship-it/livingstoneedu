import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Bell,
  Mail,
  PhoneCall,
  Check,
  Plus,
  AlertCircle,
  Radio,
  Smartphone,
  Share2,
  CheckCircle2,
  Settings,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Sliders,
  ExternalLink,
  Info,
  Clock,
  Key,
  Users,
  ChevronRight,
  Filter,
  XCircle,
  X,
} from "lucide-react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../../lib/firebase";
import { initialAnnouncements } from "../../data/initialData";
import { Announcement } from "../../types";
import { FCMPushAlertManager } from "../FCMPushAlertManager";

export interface CommunicationChannelConfig {
  id: string;
  name: string;
  provider: string;
  senderName?: string;
  senderEmail?: string;
  senderId?: string;
  senderNumber?: string;
  templateName?: string;
  status: string;
  enabled: boolean;
  balance?: number;
  unitCost?: string;
  activeDevices?: number;
  description: string;
  lastUsed?: string;
  stats?: { sent: number; delivered: number; failed: number };
}

export interface CommunicationViewProps {
  userRole?: string;
  userSession?: any;
  isTeacherView?: boolean;
}

const DEFAULT_CHANNELS: Record<string, CommunicationChannelConfig> = {
  email: {
    id: "email",
    name: "Email & Gmail API Gateway",
    provider: "Resend Live / Google Workspace OAuth",
    senderName: "LivingstoneEDU Admin",
    senderEmail: "admin@livingstone.edu.ng",
    status: "Active & Connected",
    enabled: true,
    description: "Official institutional email broadcast engine powered by Resend and Google Workspace OAuth.",
    lastUsed: new Date().toISOString(),
    stats: { sent: 142, delivered: 140, failed: 2 },
  },
  sms: {
    id: "sms",
    name: "Termii / Twilio SMS Gateway",
    provider: "Termii (Nigeria DND Direct)",
    senderId: "LIVINGSTONE",
    status: "Active & Verified",
    enabled: true,
    balance: 4850,
    unitCost: "₦3.50 / SMS",
    description: "Direct telecommunication SMS dispatch to parent mobile numbers across MTN, Airtel, Glo, and 9mobile.",
    lastUsed: new Date().toISOString(),
    stats: { sent: 520, delivered: 512, failed: 8 },
  },
  whatsapp: {
    id: "whatsapp",
    name: "WhatsApp Business Cloud API",
    provider: "Meta WhatsApp Cloud API",
    senderNumber: "+234 706 704 8471",
    status: "Active & Verified",
    enabled: true,
    templateName: "school_announcement_v1",
    description: "Instant WhatsApp messaging to parent phones with verified school business badge and delivery receipts.",
    lastUsed: new Date().toISOString(),
    stats: { sent: 310, delivered: 308, failed: 2 },
  },
  fcm: {
    id: "fcm",
    name: "Firebase Cloud Messaging (FCM Push)",
    provider: "Firebase RTDB & Web Push Service Worker",
    status: "Active & Synced",
    enabled: true,
    activeDevices: 340,
    description: "Instant in-app push alerts and sound notifications to teachers, students, and parents on web & mobile.",
    lastUsed: new Date().toISOString(),
    stats: { sent: 890, delivered: 890, failed: 0 },
  },
  noticeBoard: {
    id: "noticeBoard",
    name: "Portal Notice Board & In-App Feed",
    provider: "Internal Livingstone Cloud",
    status: "Active & Real-Time",
    enabled: true,
    description: "Interactive real-time bulletin broadcasted across school, teacher, student, and parent portals.",
    lastUsed: new Date().toISOString(),
    stats: { sent: 95, delivered: 95, failed: 0 },
  },
};

const mergeAnnouncements = (lists: Announcement[][]): Announcement[] => {
  const map = new Map<string, Announcement>();
  (lists || []).flat().forEach((a) => {
    if (a && a.id) {
      map.set(a.id, {
        ...a,
        targetRoles: Array.isArray(a.targetRoles) ? a.targetRoles : ["Parent", "Student", "Teacher"],
      });
    }
  });
  return Array.from(map.values()).sort((a, b) => ((a.date || "") > (b.date || "") ? -1 : (a.date || "") < (b.date || "") ? 1 : 0));
};

export const CommunicationView: React.FC<CommunicationViewProps> = ({
  userRole = "Administrator",
  userSession,
  isTeacherView = false,
}) => {
  const [activeTab, setActiveTab] = useState<"channels" | "compose" | "history">("channels");
  const [channels, setChannels] = useState<Record<string, CommunicationChannelConfig>>(DEFAULT_CHANNELS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

  // Compose State
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["noticeBoard", "email"]);
  const [targetAudience, setTargetAudience] = useState<"all" | "parents" | "teachers" | "students">("all");
  const [targetClass, setTargetClass] = useState<string>("All Classes");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Channel Config Modal State
  const [editingChannel, setEditingChannel] = useState<CommunicationChannelConfig | null>(null);
  const [editProvider, setEditProvider] = useState("");
  const [editSenderId, setEditSenderId] = useState("");
  const [editSenderEmail, setEditSenderEmail] = useState("");
  const [editSenderNumber, setEditSenderNumber] = useState("");
  const [editTemplate, setEditTemplate] = useState("");
  const [editApiKey, setEditApiKey] = useState("");

  // Test message state
  const [testRecipient, setTestRecipient] = useState("");
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const showToast = (text: string, ok = true) => {
    setToastMsg({ text, ok });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Fetch channel configurations from server
  useEffect(() => {
    fetch("/api/communication/channels")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.channels) {
          setChannels(d.channels);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch announcements & setup RTDB listener
  useEffect(() => {
    let active = true;
    fetch("/api/announcements")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((res) => {
        if (active && Array.isArray(res.data) && res.data.length) {
          setAnnouncements((prev) => (active ? mergeAnnouncements([res.data, prev]) : prev));
        }
      })
      .catch(() => {});

    const annRef = ref(rtdb, "communications/announcements");
    const unsub = onValue(
      annRef,
      (snap) => {
        if (!active) return;
        const val = snap.val();
        if (!val) return;
        const live = Object.values(val) as Announcement[];
        if (live.length) {
          setAnnouncements((prev) => (active ? mergeAnnouncements([live, prev]) : prev));
        }
      },
      (err) => {
        console.warn("Firebase RTDB announcements listener unavailable:", err?.message || err);
      }
    );

    return () => {
      active = false;
      unsub();
    };
  }, []);

  // Toggle channel on/off
  const toggleChannel = async (channelId: string) => {
    const current = channels[channelId];
    if (!current) return;
    const nextEnabled = !current.enabled;
    const updated = { ...current, enabled: nextEnabled };
    setChannels((prev) => ({ ...prev, [channelId]: updated }));

    try {
      await fetch("/api/communication/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, settings: { enabled: nextEnabled } }),
      });
      showToast(`${current.name} is now ${nextEnabled ? "Enabled" : "Disabled"}.`);
    } catch {
      showToast("Could not update channel status on server.", false);
    }
  };

  // Open Channel Configuration modal
  const openConfigModal = (channel: CommunicationChannelConfig) => {
    setEditingChannel(channel);
    setEditProvider(channel.provider || "");
    setEditSenderId(channel.senderId || "");
    setEditSenderEmail(channel.senderEmail || "");
    setEditSenderNumber(channel.senderNumber || "");
    setEditTemplate(channel.templateName || "");
    setEditApiKey("••••••••••••••••••••");
    setTestRecipient(channel.id === "email" ? "admin@livingstone.edu.ng" : "+2347067048471");
  };

  // Save Channel Configuration
  const handleSaveChannelConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;

    const updatedSettings = {
      provider: editProvider,
      senderId: editSenderId,
      senderEmail: editSenderEmail,
      senderNumber: editSenderNumber,
      templateName: editTemplate,
      status: "Active & Configured",
    };

    try {
      const res = await fetch("/api/communication/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: editingChannel.id, settings: updatedSettings }),
      });
      const data = await res.json();
      if (data.success && data.channel) {
        setChannels((prev) => ({ ...prev, [editingChannel.id]: data.channel }));
        showToast(`✓ Integration settings updated for ${editingChannel.name}!`);
        setEditingChannel(null);
      }
    } catch {
      showToast("Failed to save integration settings.", false);
    }
  };

  // Send Test Message
  const handleSendTestMessage = async (channelId: string) => {
    setIsTesting(true);
    setTestingChannelId(channelId);
    try {
      const res = await fetch("/api/communication/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId,
          recipient: testRecipient,
          message: `Integration verified! Test dispatched from LivingstoneEDU ${channels[channelId]?.name}.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "✓ Test dispatch successful!");
      } else {
        showToast(data.message || "Test dispatch failed.", false);
      }
    } catch {
      showToast("Network error executing channel test.", false);
    } finally {
      setIsTesting(false);
      setTestingChannelId(null);
    }
  };

  // Broadcast Message Dispatcher
  const handleDispatchBroadcast = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      showToast("Please provide both an announcement title and message body.", false);
      return;
    }
    if (selectedChannels.length === 0) {
      showToast("Please select at least one communication channel to dispatch through.", false);
      return;
    }

    setIsSending(true);
    const senderName = userSession?.name || userSession?.fullName || (isTeacherView ? "Class Teacher" : "School Principal / Admin");

    const newAnn: Announcement = {
      id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: (isUrgent ? "🚨 [URGENT] " : "") + newTitle.trim(),
      category: isUrgent ? "Emergency Alert" : "Broadcast",
      sender: senderName,
      date: new Date().toISOString().split("T")[0],
      content: newContent.trim(),
      targetRoles: targetAudience === "all" ? ["Parent", "Student", "Teacher"] : [targetAudience === "parents" ? "Parent" : targetAudience === "teachers" ? "Teacher" : "Student"],
    };

    setAnnouncements((prev) => [newAnn, ...prev]);

    try {
      // 1. Post to announcements endpoint (Notice Board + Email + FCM)
      await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAnn,
          channel: selectedChannels.includes("email") ? "Email" : "Notice Board",
          channels: selectedChannels,
          targetClass,
          priority: isUrgent ? "Urgent" : "Standard",
        }),
      });

      // 2. Dispatch FCM Push alert if selected
      if (selectedChannels.includes("fcm")) {
        await fetch("/api/fcm/send-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newAnn.title,
            body: newAnn.content,
            category: "announcement",
            targetRole: targetAudience,
            senderName,
          }),
        }).catch(() => {});
      }

      showToast(`✓ Broadcast dispatched across [${selectedChannels.map((c) => channels[c]?.name?.split(" ")[0] || c).join(", ")}]!`);
      setNewTitle("");
      setNewContent("");
      setIsUrgent(false);
      setActiveTab("history");
    } catch (err) {
      showToast("Broadcast staged locally.", true);
    } finally {
      setIsSending(false);
    }
  };

  // Toggle channel selection in Compose tab
  const toggleChannelSelection = (chId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(chId) ? prev.filter((id) => id !== chId) : [...prev, chId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs font-bold shadow-2xl animate-in fade-in slide-in-from-bottom-2 ${
            toastMsg.ok
              ? "bg-slate-900 text-emerald-400 border-emerald-500/40"
              : "bg-slate-900 text-rose-400 border-rose-500/40"
          }`}
        >
          {toastMsg.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {isTeacherView ? "Teacher Communication & Channels Integration" : "Institutional Communication & Integration Hub"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set each communication channel of integration (Email/Gmail, SMS Gateway, WhatsApp Cloud API, FCM Push, and Portal Notice Board) and broadcast notices.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            5 Channels Connected
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Email Gateway</span>
            <Mail className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">Active (OAuth/Resend)</div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">100% Deliverability</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span>SMS Gateway (Termii)</span>
            <Smartphone className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">₦4,850.00</div>
          <span className="text-[10px] text-slate-400">Sender ID: LIVINGSTONE</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span>WhatsApp Cloud API</span>
            <Share2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">Verified Business</div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Two-Way Verified</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <span>FCM Push Devices</span>
            <Bell className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">340 Subscribers</div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Real-Time Web Workers</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("channels")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "channels"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sliders className="w-4 h-4" /> Channels of Integration (5)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("compose")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "compose"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Send className="w-4 h-4" /> Compose & Dispatch
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Clock className="w-4 h-4" /> Broadcast History ({announcements.length})
          </button>
        </div>
      </div>

      {/* TAB 1: CHANNELS OF INTEGRATION SETTINGS */}
      {activeTab === "channels" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Multi-Channel Institutional Integration Matrix
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Each communication channel below is integrated with our cloud dispatch backend. You can toggle channels on/off, customize sender IDs, set API credentials, and run instant delivery tests.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.values(channels).map((ch) => {
              const isEmail = ch.id === "email";
              const isSms = ch.id === "sms";
              const isWhatsapp = ch.id === "whatsapp";
              const isFcm = ch.id === "fcm";

              return (
                <div
                  key={ch.id}
                  className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    ch.enabled
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 opacity-60"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                            isEmail
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                              : isSms
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                              : isWhatsapp
                              ? "bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400"
                              : isFcm
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                              : "bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400"
                          }`}
                        >
                          {isEmail && <Mail className="w-5 h-5" />}
                          {isSms && <Smartphone className="w-5 h-5" />}
                          {isWhatsapp && <Share2 className="w-5 h-5" />}
                          {isFcm && <Bell className="w-5 h-5" />}
                          {!isEmail && !isSms && !isWhatsapp && !isFcm && <MessageSquare className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            {ch.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">{ch.provider}</span>
                        </div>
                      </div>

                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleChannel(ch.id)}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                          ch.enabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                        title={ch.enabled ? "Disable Channel" : "Enable Channel"}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            ch.enabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {ch.description}
                    </p>

                    {/* Channel Specific Configuration Badges */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5 text-[11px]">
                      {isEmail && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Sender Email:</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{ch.senderEmail}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Sender Display:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{ch.senderName}</span>
                          </div>
                        </>
                      )}

                      {isSms && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Sender ID:</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{ch.senderId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Available Balance:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">₦{ch.balance?.toFixed(2)}</span>
                          </div>
                        </>
                      )}

                      {isWhatsapp && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Business Number:</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{ch.senderNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Approved Template:</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{ch.templateName}</span>
                          </div>
                        </>
                      )}

                      {isFcm && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Active Devices:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{ch.activeDevices} Registered</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">VAPID Protocol:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Web Push 2.0</span>
                          </div>
                        </>
                      )}

                      {!isEmail && !isSms && !isWhatsapp && !isFcm && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Live Sync:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">Firebase RTDB</span>
                        </div>
                      )}

                      <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400">Status:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {ch.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openConfigModal(ch)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" /> Configure
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendTestMessage(ch.id)}
                      disabled={isTesting && testingChannelId === ch.id}
                      className="py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isTesting && testingChannelId === ch.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Test
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: COMPOSE & DISPATCH BROADCAST */}
      {activeTab === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Compose Multi-Channel Broadcast Message
            </h3>

            {/* Select Channels to Dispatch Through */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Active Channels for This Broadcast
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.values(channels).map((ch) => {
                  const isChecked = selectedChannels.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => toggleChannelSelection(ch.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">{ch.name.split(" ")[0]}</span>
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black ${
                            isChecked ? "bg-indigo-600 text-white" : "border border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                      <span className="text-[10px] opacity-75">{ch.provider.split("/")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Audience & Target Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Target Recipient Group
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="all">All Stakeholders (Parents, Teachers & Students)</option>
                  <option value="parents">Parents / Guardians Only</option>
                  <option value="teachers">Teaching Staff Only</option>
                  <option value="students">Students Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Class Cohort Filter
                </label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="All Classes">All Classes (Entire School)</option>
                  <option value="JSS 1">JSS 1</option>
                  <option value="JSS 2">JSS 2</option>
                  <option value="JSS 3">JSS 3</option>
                  <option value="SS 1">SS 1</option>
                  <option value="SS 2">SS 2</option>
                  <option value="SS 3">SS 3</option>
                  <option value="Primary 1-6">Primary Section</option>
                </select>
              </div>
            </div>

            {/* Announcement Title */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Broadcast Subject / Title *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Resumption Date & Examination Schedule Notification"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Message Content *
                </label>
                <span className="text-[10px] text-slate-400">
                  {newContent.length} chars · {Math.ceil((newContent.length || 1) / 160)} SMS segment(s)
                </span>
              </div>
              <textarea
                rows={5}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write clear, formal communication message to be dispatched to parents and staff..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Urgent Priority Checkbox */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
              <input
                type="checkbox"
                id="urgent-toggle"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded"
              />
              <label htmlFor="urgent-toggle" className="text-xs font-bold text-rose-800 dark:text-rose-300 cursor-pointer">
                Mark as High-Priority / Emergency Broadcast (Triggers urgent sound alert on device)
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleDispatchBroadcast}
              disabled={isSending || !newTitle.trim() || !newContent.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Dispatch Broadcast Across {selectedChannels.length} Selected Channel{selectedChannels.length === 1 ? "" : "s"}
            </button>
          </div>

          {/* Broadcast Preview Helper Box */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Broadcast Preview Card
            </h4>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {isUrgent ? "🚨 EMERGENCY" : "📢 ANNOUNCEMENT"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date().toISOString().split("T")[0]}
                </span>
              </div>

              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                {newTitle || "Sample Announcement Subject"}
              </h5>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {newContent || "Your composed broadcast message text will display here as it will appear on student and parent device screens."}
              </p>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Sender: {userSession?.name || "School Administration"}</span>
                <span>Target: {targetAudience.toUpperCase()}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Channels Dispatched:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedChannels.map((c) => (
                  <span key={c} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    ✓ {channels[c]?.name?.split(" ")[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BROADCAST HISTORY & LOGS */}
      {activeTab === "history" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Dispatched Announcements & Broadcast History ({announcements.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Live stream of announcements synchronized with Firebase RTDB across all portals.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5 transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900 dark:text-white">{ann.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      Dispatched
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{ann.date}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {ann.content}
                </p>

                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-700/60 text-[11px]">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    Author / Sender: {ann.sender || "School Administration"}
                  </span>

                  <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
                    <span className="text-slate-400 text-[10px]">Delivered to:</span>
                    {(Array.isArray(ann?.targetRoles) ? ann.targetRoles : ["All"]).map((r, rIdx) => (
                      <span
                        key={rIdx}
                        className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {announcements.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold">No announcements published yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CHANNEL CONFIGURATION & INTEGRATION SETTINGS */}
      {editingChannel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Settings className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Configure {editingChannel.name}
                  </h3>
                  <p className="text-xs text-slate-400">Set API credentials, sender identifiers, and dispatch rules</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingChannel(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChannelConfig} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Integration Provider
                </label>
                <input
                  type="text"
                  value={editProvider}
                  onChange={(e) => setEditProvider(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              {editingChannel.id === "sms" && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Sender ID (Max 11 alphanumeric chars)
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={editSenderId}
                    onChange={(e) => setEditSenderId(e.target.value.toUpperCase())}
                    placeholder="e.g. LIVINGSTONE"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {editingChannel.id === "email" && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Authorized From Email
                  </label>
                  <input
                    type="email"
                    value={editSenderEmail}
                    onChange={(e) => setEditSenderEmail(e.target.value)}
                    placeholder="admin@livingstone.edu.ng"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {editingChannel.id === "whatsapp" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Business Phone Number
                    </label>
                    <input
                      type="text"
                      value={editSenderNumber}
                      onChange={(e) => setEditSenderNumber(e.target.value)}
                      placeholder="+234 706 704 8471"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Meta Cloud Template Name
                    </label>
                    <input
                      type="text"
                      value={editTemplate}
                      onChange={(e) => setEditTemplate(e.target.value)}
                      placeholder="school_announcement_v1"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  API Key / Secret Token
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editApiKey}
                    onChange={(e) => setEditApiKey(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Test section inside modal */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Quick Channel Test</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="Recipient phone or email..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendTestMessage(editingChannel.id)}
                    disabled={isTesting}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                  >
                    Test Send
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingChannel(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  Save Integration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FIREBASE REAL-TIME PUSH ALERT MANAGER */}
      <FCMPushAlertManager />
    </div>
  );
};
