import React, { useState } from "react";
import { Trash2, AlertTriangle, RefreshCw, X } from "lucide-react";

interface ClearDataButtonProps {
  /** If true, renders as a small inline button; if false, renders as a full-width sidebar button */
  variant?: "inline" | "sidebar";
  isCollapsed?: boolean;
}

export const ClearDataButton: React.FC<ClearDataButtonProps> = ({ variant = "sidebar", isCollapsed = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleClear = async () => {
    setClearing(true);
    setResult(null);
    try {
      const res = await fetch("/api/data/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      }).then((r) => r.json());

      if (res.success) {
        setResult({ type: "success", message: res.message || "All data cleared! Portal reset to factory defaults." });
        setTimeout(() => {
          setShowModal(false);
          setResult(null);
          window.location.reload();
        }, 2000);
      } else {
        setResult({ type: "error", message: res.message || "Failed to clear data." });
      }
    } catch (e) {
      setResult({ type: "error", message: "Network error. Server may be unreachable." });
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        title={isCollapsed ? "Clear All Data" : undefined}
        className={`w-full flex items-center ${
          isCollapsed ? "justify-center px-0" : "gap-3 px-3"
        } py-2 rounded-lg text-xs font-semibold text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-all border border-amber-500/20`}
      >
        <Trash2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
        {!isCollapsed && <span>Clear All Data</span>}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold">Clear All Data?</h3>
              </div>
              <button onClick={() => !clearing && setShowModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently wipe <strong className="text-white">every record</strong> on the platform —
              students, teachers, fees, exams, lesson notes, attendance, announcements, report cards, chat messages,
              timetable, payroll, and all audit logs — and restore initial system data. <strong className="text-rose-400">This action cannot be undone.</strong>
            </p>

            {result && (
              <div className={`px-3 py-2 rounded-lg text-xs font-medium ${
                result.type === "success"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}>
                {result.message}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                disabled={clearing}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                disabled={clearing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-2 disabled:opacity-60"
              >
                {clearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{clearing ? "Clearing..." : "Yes, Clear All Data"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
