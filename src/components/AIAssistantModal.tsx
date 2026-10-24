import React, { useEffect, useState } from "react";
import { Sparkles, X, Send, Bot, User, Copy, Check, FileText, Calendar, BookOpen, GraduationCap } from "lucide-react";
import { UserRole } from "../types";

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
}

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, currentRole }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: `Hello! I am your LIVINGSTONEEDU AI Copilot powered by sSolutAI. I am optimized for your active role as [${currentRole}].\n\nHow can I assist you today? You can ask me to generate NERDC/WAEC lesson plans, draft official circulars, solve math equations, or compose examination questions!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Update the intro greeting when the active role changes.
  useEffect(() => {
    if (!isOpen) return;
    setMessages((prev) =>
      prev.length === 1 && prev[0].sender === "ai"
        ? [
            {
              ...prev[0],
              text: `Hello! I am your LIVINGSTONEEDU AI Copilot powered by sSolutAI. I am optimized for your active role as [${currentRole}].\n\nHow can I assist you today? You can ask me to generate NERDC/WAEC lesson plans, draft official circulars, solve math equations, or compose examination questions!`,
            },
          ]
        : prev
    );
  }, [currentRole, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          role: currentRole,
          context: "Floating Assistant Modal",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.error || `Request failed (${res.status}).`);
      }
      const aiReply = data.reply || "AI process complete.";

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      const msg =
        err?.message === "Failed to fetch"
          ? "I could not reach the AI engine. This build appears to be a frontend-only deployment (e.g. GitHub Pages) where the /api endpoints are not available. Please run the full app server to enable AI features."
          : `I encountered a network issue while contacting the sSolutAI AI engine. Please verify system connection.`;
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: msg,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
    } catch {
      setCopiedIndex(idx);
    } finally {
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const quickPrompts = [
    { label: "Draft Parent Circular", icon: <FileText className="w-3.5 h-3.5" />, text: "Draft an official school circular to parents announcing the upcoming Inter-House Sports and Mid-Term Break." },
    { label: "Generate SS2 Math Note", icon: <BookOpen className="w-3.5 h-3.5" />, text: "Generate a detailed lesson plan on Quadratic Equations for SS2 Mathematics adhering to NERDC syllabus." },
    { label: "Create Exam Paper", icon: <GraduationCap className="w-3.5 h-3.5" />, text: "Draft 5 multiple choice questions and 2 theory questions on Physics Wave Motion with marking scheme." },
    { label: "Class Timetable Draft", icon: <Calendar className="w-3.5 h-3.5" />, text: "Generate a balanced 5-day weekly class timetable for JSS 3 including STEM labs and break times." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[600px] max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2">
                LIVINGSTONEEDU AI Copilot
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                  sSolutAI 3.6
                </span>
              </h3>
              <p className="text-[11px] text-indigo-200 font-medium">
                Active Context: <span className="underline font-semibold">{currentRole}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
            Quick Actions:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.text)}
              disabled={loading}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all flex-shrink-0 shadow-xs"
            >
              <span className="text-indigo-500">{qp.icon}</span>
              <span>{qp.label}</span>
            </button>
          ))}
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[90%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-sm"
                }`}
              >
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 shadow-sm rounded-tl-none whitespace-pre-wrap"
                }`}
              >
                <div>{msg.text}</div>
                <div className="flex items-center justify-between gap-4 mt-2 pt-1 border-t border-slate-200/40 dark:border-slate-700/40 text-[10px] opacity-70">
                  <span>{msg.timestamp}</span>
                  {msg.sender === "ai" && (
                    <button
                      onClick={() => copyToClipboard(msg.text, idx)}
                      className="flex items-center gap-1 hover:underline text-indigo-500 font-semibold"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Response</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 mr-auto max-w-[80%]">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>sSolutAI AI is analyzing pedagogy requirements...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Ask sSolutAI AI anything for ${currentRole}...`}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputPrompt.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
