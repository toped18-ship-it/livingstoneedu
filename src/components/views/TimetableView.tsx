import React, { useState, useEffect, useCallback } from "react";
import { CalendarDays, Plus, Trash2, AlertTriangle, CheckCircle2, RefreshCw, Loader2, BookOpen, User, LayoutGrid, ChevronDown, Clock } from "lucide-react";
import { ALL_CLASSES, ALL_SUBJECTS } from "../../types";

interface TimetableSlot {
  id: string;
  day: string;
  period: string;
  className: string;
  subject: string;
  teacher: string;
  room: string;
}

interface Conflict {
  slot?: TimetableSlot;
  withSlotId?: string;
  reason: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = ["08:00-08:40", "08:40-09:20", "09:20-10:00", "10:20-11:00", "11:00-11:40", "11:40-12:20"];
const DEFAULT_SUBJECTS = ALL_SUBJECTS;
const EMPTY_FORM = { day: "Monday", period: PERIODS[0], className: ALL_CLASSES[0], subject: DEFAULT_SUBJECTS[0], teacher: "", room: "" };

export const TimetableView: React.FC = () => {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ttRes, confRes] = await Promise.all([
        fetch("/api/timetable"),
        fetch("/api/timetable/conflicts"),
      ]);
      const tt = await ttRes.json();
      const conf = await confRes.json();
      if (tt.ok && tt.data) setSlots(tt.data);
      if (conf.ok && conf.data) setConflicts(conf.data);
    } catch {
      setError("Could not load timetable. Check that the API server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setField = (key: keyof typeof EMPTY_FORM, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleAddSlot = async () => {
    if (!form.subject.trim() || !form.teacher.trim() || !form.room.trim()) {
      setError("Subject, teacher and room are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/timetable/slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message || "Failed to add slot");
      setForm((prev) => ({ ...prev, subject: "" as any, teacher: "", room: "" }));
      await refresh();
    } catch {
      setError("Failed to add slot. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (id: string) => {
    setBusy(true);
    try {
      await fetch(`/api/timetable/slot/${id}`, { method: "DELETE" });
      await refresh();
    } catch {
      setError("Failed to remove slot. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const totalSlots = slots.length;
  const uniqueSubjects = new Set(slots.map((s) => s.subject)).size;
  const uniqueClasses = new Set(slots.map((s) => s.className)).size;

  const slotsByPeriod = (day: string, period: string) =>
    slots.filter((s) => s.day === day && s.period === period);

  const inputClass =
    "w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:outline-none text-slate-800 dark:text-slate-200";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <CalendarDays className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Timetable Builder</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visual weekly timetable with automatic teacher &amp; room conflict detection.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-2 shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            Add Slot
            <ChevronDown className={`w-4 h-4 transition-transform ${formOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <span className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <LayoutGrid className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Slots</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{totalSlots}</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <span className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase">Unique Subjects</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{uniqueSubjects}</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <span className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <User className="w-5 h-5" />
          </span>
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase">Unique Classes</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{uniqueClasses}</span>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            Add Timetable Slot
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <select value={form.day} onChange={(e) => setField("day", e.target.value)} className={inputClass}>
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select value={form.period} onChange={(e) => setField("period", e.target.value)} className={inputClass}>
              {PERIODS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select value={form.className} onChange={(e) => setField("className", e.target.value)} className={inputClass}>
              {ALL_CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              list="subject-options"
              value={form.subject}
              onChange={(e) => setField("subject", e.target.value)}
              placeholder="Subject"
              className={inputClass}
            />
            <datalist id="subject-options">
              {DEFAULT_SUBJECTS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <input
              value={form.teacher}
              onChange={(e) => setField("teacher", e.target.value)}
              placeholder="Teacher"
              className={inputClass}
            />
            <input
              value={form.room}
              onChange={(e) => setField("room", e.target.value)}
              placeholder="Room"
              className={inputClass}
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            {error && <span className="text-xs text-rose-500 font-semibold">{error}</span>}
            <button
              onClick={handleAddSlot}
              disabled={busy}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white inline-flex items-center gap-2 shadow-md shadow-emerald-600/30"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Add Slot
            </button>
          </div>
        </div>
      )}

      {conflicts.length === 0 ? (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">No conflicts</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400">— every teacher and room is free at their scheduled time.</span>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Conflicts Detected</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold">{conflicts.length}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {conflicts.map((c, idx) => {
              const slot = c.slot;
              const s = slot || slots[idx];
              return (
                <div key={idx} className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      {c.reason}
                    </p>
                    <button
                      onClick={() => slot && handleRemove(slot.id)}
                      className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                    >
                      Resolve
                    </button>
                  </div>
                  {s && (
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50">{s.day}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50">{s.period}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50">{s.subject}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50">{s.className}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-indigo-600" />
          Weekly Schedule Grid
        </h3>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[130px_repeat(5,minmax(160px,1fr))] gap-2 min-w-[900px]">
            <div className="px-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-slate-400">
              <Clock className="w-4 h-4" />Period
            </div>
            {DAYS.map((day) => (
              <div key={day} className="px-2 py-2 text-center text-xs font-bold">{day}</div>
            ))}
            {loading ? (
              <>
                <div className="col-span-6 py-12 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading timetable...
                </div>
              </>
            ) : (
              slots && PERIODS.map((period) => (
                <React.Fragment key={period}>
                  <div className="px-2 py-2 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center">
                    <Clock className="w-4 h-4 mr-1" />{period}
                  </div>
                  {DAYS.map((day) => (
                    <div key={`${day}-${period}`} className="space-y-2 rounded-xl bg-slate-50 dark:bg-slate-900 px-2 py-2 min-h-[80px]">
                      {slotsByPeriod(day, period).map((slot) => (
                        <div
                          key={slot.id}
                          className="group relative p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-indigo-800 dark:text-indigo-200">{slot.subject}</span>
                            <button
                              onClick={() => handleRemove(slot.id)}
                              className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-1">{slot.className}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{slot.teacher}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{slot.room}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};