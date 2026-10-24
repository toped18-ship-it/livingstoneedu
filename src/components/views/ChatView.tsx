import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, Send, Plus, Search, Circle, Check } from "lucide-react";

const SELF_ID = "usr-1";
const SELF_NAME = "Dr. Emmanuel Livingstone";

const SAMPLE_STAFF = [
  { id: "usr-3", name: "Mr. David Alabi" },
  { id: "usr-4", name: "Mrs. Okonkwo Beatrice" },
  { id: "usr-5", name: "Mr. Joe Nnamdi" },
];

const AUTO_REPLIES = [
  "Noted with thanks. I will get back to you shortly.",
  "Good idea. Let me review and respond properly.",
  "Yes, that works for me. Thank you.",
  "Alright, received. Kindly send the full details.",
];

interface Participant {
  id: string;
  name: string;
}

interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage: string;
  lastTime: string;
  unread: number;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  sentAt: string;
}

const fmtTime = (t: string) =>
  t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

const initials = (name?: string) =>
  (name || "Staff")
    .split(/\s+/)
    .map((p) => p?.[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase() || "S";

const peerName = (conv?: Conversation) => {
  const peer = (conv?.participants || []).find((p) => p?.id !== SELF_ID);
  return peer?.name || conv?.participants?.[0]?.name || "Staff";
};

const fetchP = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  return (await res.json()) as T;
};

export const ChatView: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeName, setActiveName] = useState("");
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [recipientId, setRecipientId] = useState(SAMPLE_STAFF[0]?.id || "usr-1");
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshConversations = useCallback(async () => {
    try {
      const res = await fetchP<{ ok: boolean; data: Conversation[] }>("/api/chat/conversations");
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch {
      /* keep existing list */
    }
  }, []);

  const refreshMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetchP<{ ok: boolean; data: ChatMessage[] }>(
        `/api/chat/conversations/${convId}/messages`
      );
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch {
      /* keep existing list */
    }
  }, []);

  const pushLocal = useCallback(
    (msg: ChatMessage, convName: string) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId ? { ...c, lastMessage: msg.text, lastTime: msg.sentAt } : c
        )
      );
      setActiveName((prev) => (prev ? prev : convName));
    },
    []
  );

  useEffect(() => {
    refreshConversations();
    const poll = setInterval(refreshConversations, 4000);
    return () => clearInterval(poll);
  }, [refreshConversations]);

  useEffect(() => {
    if (!activeId) return;
    refreshMessages(activeId);
    const poll = setInterval(() => refreshMessages(activeId), 4000);
    return () => clearInterval(poll);
  }, [activeId, refreshMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, activeId]);

  const openConversation = (conv: Conversation) => {
    setActiveId(conv.id);
    setActiveName(peerName(conv));
  };

  const handleNewChat = async () => {
    const recipient = (SAMPLE_STAFF || []).find((s) => s?.id === recipientId) || SAMPLE_STAFF?.[0] || { id: "usr-1", name: "Staff Member" };
    setCreating(true);
    try {
      const res = await fetchP<{ ok: boolean; data: Conversation }>("/api/chat/conversations", {
        method: "POST",
        body: JSON.stringify({ id: recipient.id, name: recipient.name }),
      });
      if (res.data?.id) {
        await refreshConversations();
        setActiveId(res.data.id);
        setActiveName(recipient.name);
        setShowNew(false);
        setRecipientId(SAMPLE_STAFF?.[0]?.id || "usr-1");
      }
    } catch {
      /* ignore */
    } finally {
      setCreating(false);
    }
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !activeId || sending) return;
    const convName = activeName;
    setSending(true);
    setDraft("");
    try {
      const res = await fetchP<{ ok: boolean; data: ChatMessage }>("/api/chat/messages", {
        method: "POST",
        body: JSON.stringify({ conversationId: activeId, text, senderId: SELF_ID, senderName: SELF_NAME }),
      });
      if (res.data) pushLocal(res.data, convName);

      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      setTimeout(async () => {
        try {
          const rep = await fetchP<{ ok: boolean; data: ChatMessage }>("/api/chat/messages", {
            method: "POST",
            body: JSON.stringify({ conversationId: activeId, text: reply, senderId: "usr-x", senderName: convName }),
          });
          if (rep.data) pushLocal(rep.data, convName);
        } catch {
          /* ignore */
        }
      }, 1800);
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  };

  const filtered = conversations.filter(
    (c) =>
      peerName(c).toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const activeConv = (conversations || []).find((c) => c?.id === activeId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Real-Time Messaging</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              SchoolHub-style staff messaging with auto-refresh.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/70 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Realtime On</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: "600px" }}>
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-3 space-y-2">
            <button
              onClick={() => setShowNew(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">No conversations yet.</div>
            )}
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  activeId === conv.id
                    ? "bg-indigo-50 dark:bg-indigo-950/50"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-center min-w-[38px] h-[38px] rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                  {initials(peerName(conv))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {peerName(conv)}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">{fmtTime(conv.lastTime)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {conv.lastMessage}
                    </span>
                    {conv.unread > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {!activeId || !activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <span className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 mb-3">
                <MessageSquare className="w-8 h-8" />
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Select a conversation</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Pick a staff member from the list or start a new chat to begin messaging.
              </p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/60 dark:bg-slate-800/40">
                <div className="relative">
                  <div className="flex items-center justify-center min-w-[40px] h-[40px] rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    {initials(activeName)}
                  </div>
                  <span className="absolute -bottom-0 -right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{activeName}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    Online
                  </div>
                </div>
              </div>

              <div
                ref={scrollRef}
                className="h-72 flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40"
              >
                {messages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No messages yet. Say hello!
                  </div>
                )}
                {messages.map((m) => {
                  const mine = m.senderId === SELF_ID;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] px-3.5 py-2 rounded-2xl shadow-sm ${
                          mine
                            ? "bg-indigo-600 text-white rounded-br-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm"
                        }`}
                      >
                        {!mine && (
                          <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">
                            {m.senderName || activeName}
                          </div>
                        )}
                        <p className="text-xs leading-relaxed break-words">{m.text}</p>
                        <div
                          className={`text-[10px] mt-1 flex items-center gap-1 ${
                            mine ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {fmtTime(m.sentAt)}
                          {mine && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                />
                <button
                  onClick={sendMessage}
                  disabled={!draft.trim() || sending}
                  className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/30"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showNew && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowNew(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <Plus className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Start a New Chat</h3>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Recipient
              </label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
              >
                {SAMPLE_STAFF.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleNewChat}
                disabled={creating}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                {creating ? "Creating..." : "Start Chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};