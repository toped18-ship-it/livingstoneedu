import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarCheck2,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
  Save,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  TrendingUp,
  Download,
  Plus,
  Check,
  X,
  Printer,
  UserCheck,
  AlertCircle,
  Trash2,
  Calendar,
  Search,
  BookOpen,
  Filter,
} from "lucide-react";
import { useLiveData, notifyDataChanged } from "../../lib/liveStore";

export type AttendanceStatus = "Present" | "Late" | "Absent" | "Excused";

export interface AttendanceStudentItem {
  id: string;
  name: string;
  admissionNo: string;
  gender?: string;
  status: AttendanceStatus;
  remark?: string;
  isManuallyAdded?: boolean;
}

export interface RegisterRecord {
  id: string;
  date: string;
  class: string;
  sessionType?: string;
  subject?: string;
  takenBy: string;
  present: number;
  late: number;
  absent: number;
  excused?: number;
  records: { studentId: string; studentName?: string; status: AttendanceStatus; remark?: string }[];
}

export interface AttendanceTrackerViewProps {
  userSession?: any;
  assignedClasses?: string[];
  teacherName?: string;
  defaultClass?: string;
}

const STATUS_CONFIG: { key: AttendanceStatus; label: string; activeClass: string; badgeClass: string }[] = [
  {
    key: "Present",
    label: "Present",
    activeClass: "bg-emerald-600 text-white shadow-emerald-500/20 shadow-sm",
    badgeClass: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  {
    key: "Late",
    label: "Late",
    activeClass: "bg-amber-600 text-white shadow-amber-500/20 shadow-sm",
    badgeClass: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  {
    key: "Absent",
    label: "Absent",
    activeClass: "bg-rose-600 text-white shadow-rose-500/20 shadow-sm",
    badgeClass: "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
  {
    key: "Excused",
    label: "Excused",
    activeClass: "bg-indigo-600 text-white shadow-indigo-500/20 shadow-sm",
    badgeClass: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  },
];

export const AttendanceTrackerView: React.FC<AttendanceTrackerViewProps> = ({
  userSession,
  assignedClasses = [],
  teacherName = "",
  defaultClass = "",
}) => {
  const liveStudents = useLiveData<any>("students").data;
  const liveAttendance = useLiveData<any>("attendanceRegister").data;

  // Active view tab: "mark" | "history"
  const [activeTab, setActiveTab] = useState<"mark" | "history">("mark");

  // Selection states
  const [classesList, setClassesList] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (defaultClass) return defaultClass;
    if (assignedClasses.length > 0) return assignedClasses[0];
    return "JSS 1";
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [sessionType, setSessionType] = useState<string>("Morning Assembly Roll Call");
  const [subjectPeriod, setSubjectPeriod] = useState<string>("");
  const [takenByTeacher, setTakenByTeacher] = useState<string>(() => {
    return teacherName || userSession?.name || userSession?.fullName || "Class Teacher";
  });

  // Roll marking state
  const [roll, setRoll] = useState<AttendanceStudentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | AttendanceStatus>("All");

  // Manual student add to roll
  const [showAddStudentRow, setShowAddStudentRow] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentAdmNo, setNewStudentAdmNo] = useState("");
  const [newStudentGender, setNewStudentGender] = useState<"Male" | "Female">("Male");

  // Create Register Roll Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [modalClass, setModalClass] = useState(selectedClass);
  const [modalDate, setModalDate] = useState(selectedDate);
  const [modalSessionType, setModalSessionType] = useState("Morning Assembly Roll Call");

  // Saved registers history
  const [registers, setRegisters] = useState<RegisterRecord[]>([]);
  const [expandedRegisterId, setExpandedRegisterId] = useState<string | null>(null);
  const [viewRegisterDetails, setViewRegisterDetails] = useState<RegisterRecord | null>(null);

  // Loading & status
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Load classes from API
  useEffect(() => {
    fetch("/api/attendance/classes")
      .then((r) => r.json())
      .then((d) => {
        const fetched = d.data || [];
        const combined = Array.from(new Set([...assignedClasses, ...fetched])).filter(Boolean);
        setClassesList(combined);
        if (!selectedClass && combined.length > 0) {
          setSelectedClass(combined[0]);
        }
      })
      .catch(() => {
        const fallback = ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"];
        setClassesList(Array.from(new Set([...assignedClasses, ...fallback])));
      });
    fetchSavedRegisters();
  }, [assignedClasses]);

  const fetchSavedRegisters = () => {
    fetch("/api/attendance/registers")
      .then((r) => r.json())
      .then((d) => setRegisters(d.data || []))
      .catch(() => undefined);
  };

  // Sync with live store registers when updated
  useEffect(() => {
    if (liveAttendance && Array.isArray(liveAttendance) && liveAttendance.length > 0) {
      setRegisters(liveAttendance);
    }
  }, [liveAttendance]);

  // Load / generate roll for selected class
  const loadClassRoll = async (clsName: string) => {
    if (!clsName) return;
    setLoadingRoster(true);
    try {
      // 1. First check live students for instant snappy UI
      const matchingLive = (liveStudents || []).filter((s: any) => {
        const c = String(s.class || s.classLevel || "").toLowerCase().trim();
        return c === clsName.toLowerCase().trim();
      });

      // 2. Fetch from backend API
      const res = await fetch(`/api/attendance/roster?class=${encodeURIComponent(clsName)}`);
      const json = await res.json();
      const serverData = json.data || [];

      // Combine by ID or admission number
      const map = new Map<string, AttendanceStudentItem>();

      matchingLive.forEach((s: any, idx: number) => {
        const id = s.id || `live-${idx}`;
        map.set(id, {
          id,
          name: s.name || s.fullName || "Student",
          admissionNo: s.admissionNo || s.admissionNumber || `ADM-${1000 + idx}`,
          gender: s.gender || "Male",
          status: "Present",
          remark: "",
        });
      });

      serverData.forEach((s: any, idx: number) => {
        const id = s.id || `srv-${idx}`;
        if (!map.has(id)) {
          map.set(id, {
            id,
            name: s.name || "Student",
            admissionNo: s.admissionNo || `ADM-${2000 + idx}`,
            gender: s.gender || "Male",
            status: "Present",
            remark: "",
          });
        }
      });

      const items = Array.from(map.values());
      setRoll(items);
      showToast(`Loaded ${items.length} student${items.length === 1 ? "" : "s"} for ${clsName} roll call.`);
    } catch {
      showToast("Could not load class roster from server.", false);
    } finally {
      setLoadingRoster(false);
    }
  };

  // Auto-load roll when class changes if empty
  useEffect(() => {
    if (selectedClass && roll.length === 0) {
      loadClassRoll(selectedClass);
    }
  }, [selectedClass]);

  // Quick marking actions
  const markAllStatus = (newStatus: AttendanceStatus) => {
    setRoll((prev) =>
      prev.map((s) => ({
        ...s,
        status: newStatus,
      }))
    );
    showToast(`Marked all ${roll.length} students as ${newStatus}.`);
  };

  const updateStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setRoll((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  };

  const updateStudentRemark = (studentId: string, remark: string) => {
    setRoll((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, remark } : s))
    );
  };

  const handleAddManualStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    const newId = `man-${Date.now()}`;
    const newStudent: AttendanceStudentItem = {
      id: newId,
      name: newStudentName.trim(),
      admissionNo: newStudentAdmNo.trim() || `ROLL-${roll.length + 1}`,
      gender: newStudentGender,
      status: "Present",
      remark: "Added on roll",
      isManuallyAdded: true,
    };
    setRoll((prev) => [...prev, newStudent]);
    setNewStudentName("");
    setNewStudentAdmNo("");
    setShowAddStudentRow(false);
    showToast(`Added ${newStudent.name} to current roll call.`);
  };

  const handleRemoveStudentFromRoll = (studentId: string) => {
    setRoll((prev) => prev.filter((s) => s.id !== studentId));
  };

  // Create Register Roll Modal Submit
  const handleCreateRegisterRollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedClass(modalClass);
    setSelectedDate(modalDate);
    setSessionType(modalSessionType);
    setCreateModalOpen(false);
    loadClassRoll(modalClass);
    showToast(`Created new roll call sheet for ${modalClass} (${modalDate})`);
  };

  // Save register to server
  const handleSaveRegister = async () => {
    if (!selectedClass) {
      showToast("Please select a class before saving.", false);
      return;
    }
    if (roll.length === 0) {
      showToast("Roll is empty. Add students or load roster first.", false);
      return;
    }

    setSaving(true);
    try {
      const records = roll.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        admissionNo: s.admissionNo,
        status: s.status,
        remark: s.remark || "",
      }));

      const payload = {
        className: selectedClass,
        date: selectedDate,
        sessionType,
        subject: subjectPeriod,
        takenBy: takenByTeacher,
        records,
      };

      const res = await fetch("/api/attendance/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-name": takenByTeacher,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.ok || json.success) {
        showToast(`✓ Attendance Register saved for ${selectedClass} (${selectedDate})!`);
        notifyDataChanged(["attendanceRegister"]);
        fetchSavedRegisters();
      } else {
        showToast(json.message || "Failed to save attendance register.", false);
      }
    } catch {
      showToast("Network error while saving register.", false);
    } finally {
      setSaving(false);
    }
  };

  // Delete register
  const handleDeleteRegister = async (registerId: string) => {
    if (!confirm("Are you sure you want to remove this attendance register record?")) return;
    try {
      await fetch(`/api/attendance/register/${registerId}`, { method: "DELETE" });
      setRegisters((prev) => prev.filter((r) => r.id !== registerId));
      notifyDataChanged(["attendanceRegister"]);
      showToast("Attendance register removed.");
    } catch {
      showToast("Failed to remove register.", false);
    }
  };

  // Roll metrics
  const totalOnRoll = roll.length;
  const presentCount = roll.filter((s) => s.status === "Present").length;
  const lateCount = roll.filter((s) => s.status === "Late").length;
  const absentCount = roll.filter((s) => s.status === "Absent").length;
  const excusedCount = roll.filter((s) => s.status === "Excused").length;
  const presentPct = totalOnRoll > 0 ? Math.round(((presentCount + lateCount) / totalOnRoll) * 100) : 0;

  // Filtered roll view
  const filteredRoll = useMemo(() => {
    return roll.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q);
      const matchesStatus = filterStatus === "All" || s.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [roll, searchQuery, filterStatus]);

  // Export history CSV
  const handleExportCsv = () => {
    if (registers.length === 0) {
      showToast("No attendance registers to export.", false);
      return;
    }
    const headers = ["Date", "Class", "Session Type", "Subject", "Taken By", "Present", "Late", "Absent", "Excused", "Total"];
    const rows = registers.map((r) => [
      `"${r.date}"`,
      `"${r.class}"`,
      `"${r.sessionType || "Roll Call"}"`,
      `"${r.subject || "General"}"`,
      `"${r.takenBy || "Teacher"}"`,
      r.present,
      r.late,
      r.absent,
      r.excused || 0,
      r.present + r.late + r.absent + (r.excused || 0),
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Registers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Exported ${registers.length} registers to CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs font-bold shadow-xl animate-in fade-in slide-in-from-bottom-2 ${
            toast.ok
              ? "bg-slate-900 text-emerald-400 border-emerald-500/40"
              : "bg-slate-900 text-rose-400 border-rose-500/40"
          }`}
        >
          {toast.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
          <span>{toast.msg}</span>
          <button className="ml-3 text-slate-400 hover:text-white" onClick={() => setToast(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <CalendarCheck2 className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Attendance Register & Roll Call</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Take daily class attendance, create new register rolls, track punctuality, and submit official records.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Create Register Roll
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Nav Tabs: [Mark Attendance / Roll Call] vs [Registers History] */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("mark")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "mark"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <UserCheck className="w-4 h-4" /> Mark Attendance (Roll Call)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("history");
              fetchSavedRegisters();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Saved Registers ({registers.length})
          </button>
        </div>

        {activeTab === "mark" && (
          <span className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            Class: <strong className="text-slate-900 dark:text-white font-bold">{selectedClass}</strong> · Date:{" "}
            <strong className="text-slate-900 dark:text-white font-bold">{selectedDate}</strong>
          </span>
        )}
      </div>

      {/* VIEW 1: MARK ATTENDANCE / ROLL CALL */}
      {activeTab === "mark" && (
        <div className="space-y-6">
          {/* Roll Call Setup Controls Bar */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Roll Call Parameters
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadClassRoll(selectedClass)}
                  disabled={loadingRoster}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {loadingRoster ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Reload Roster
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Sheet
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Class Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Class / Form
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    const nextClass = e.target.value;
                    setSelectedClass(nextClass);
                    loadClassRoll(nextClass);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {assignedClasses.length > 0 && (
                    <optgroup label="My Assigned Classes">
                      {assignedClasses.map((c) => (
                        <option key={`my-${c}`} value={c}>
                          {c} (Assigned)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="All School Classes">
                    {classesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Roll Call Session
                </label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Morning Assembly Roll Call">Morning Assembly Roll Call</option>
                  <option value="Afternoon Register">Afternoon Register</option>
                  <option value="Subject Lecture Period">Subject Lecture Period</option>
                  <option value="Hostel / Evening Roll Call">Hostel / Evening Roll Call</option>
                </select>
              </div>

              {/* Subject / Teacher Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Teacher / Taken By
                </label>
                <input
                  type="text"
                  value={takenByTeacher}
                  onChange={(e) => setTakenByTeacher(e.target.value)}
                  placeholder="Teacher Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Real-time Summary Cards Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled</span>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{totalOnRoll}</div>
              <span className="text-[10px] text-slate-400">Students on roll</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Present</span>
              <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{presentCount}</div>
              <span className="text-[10px] text-slate-400">{presentPct}% attendance</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Late</span>
              <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{lateCount}</div>
              <span className="text-[10px] text-slate-400">Marked tardy</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Absent</span>
              <div className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">{absentCount}</div>
              <span className="text-[10px] text-slate-400">Unexcused</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Excused</span>
              <div className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">{excusedCount}</div>
              <span className="text-[10px] text-slate-400">Sick / Permission</span>
            </div>
          </div>

          {/* Roll Sheet Workspace */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Quick Actions & Search Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Attendance Roll Sheet: {selectedClass}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Click status badges to mark student attendance. Changes are staged until submitted.
                  </p>
                </div>

                {/* Bulk Marking Fast Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => markAllStatus("Present")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => markAllStatus("Absent")}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Mark All Absent
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddStudentRow(!showAddStudentRow)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Student
                  </button>
                </div>
              </div>

              {/* Inline Add Student Form */}
              {showAddStudentRow && (
                <form
                  onSubmit={handleAddManualStudent}
                  className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex flex-wrap items-center gap-3 animate-in fade-in"
                >
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Student Full Name</label>
                    <input
                      type="text"
                      required
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="e.g. Ibrahim Abubakar"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                    />
                  </div>
                  <div className="w-36">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Admission No</label>
                    <input
                      type="text"
                      value={newStudentAdmNo}
                      onChange={(e) => setNewStudentAdmNo(e.target.value)}
                      placeholder="e.g. LIV/2026/042"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Gender</label>
                    <select
                      value={newStudentGender}
                      onChange={(e) => setNewStudentGender(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2 pt-5">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                    >
                      Add to Roll
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddStudentRow(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Search & Status Filter Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student by name or admission no..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  {(["All", "Present", "Late", "Absent", "Excused"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFilterStatus(tab)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        filterStatus === tab
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-black"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Students Roll Table */}
            {filteredRoll.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4 min-w-[200px]">Student Details</th>
                      <th className="py-3 px-4 w-32">Admission No</th>
                      <th className="py-3 px-4 min-w-[280px]">Attendance Status</th>
                      <th className="py-3 px-4 min-w-[200px]">Teacher Remark</th>
                      <th className="py-3 px-4 w-12 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredRoll.map((student, idx) => {
                      const isFemale = (student.gender || "").toLowerCase() === "female";
                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white flex-shrink-0 ${
                                  isFemale
                                    ? "bg-gradient-to-tr from-pink-500 to-rose-400"
                                    : "bg-gradient-to-tr from-indigo-500 to-sky-400"
                                }`}
                              >
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  {student.name}
                                  {student.isManuallyAdded && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                                      Added
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {student.gender || "Student"} · {selectedClass}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-500 dark:text-slate-400">
                            {student.admissionNo}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              {STATUS_CONFIG.map((cfg) => {
                                const active = student.status === cfg.key;
                                return (
                                  <button
                                    key={cfg.key}
                                    type="button"
                                    onClick={() => updateStudentStatus(student.id, cfg.key)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                      active
                                        ? cfg.activeClass
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                                  >
                                    {cfg.label}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={student.remark || ""}
                              onChange={(e) => updateStudentRemark(student.id, e.target.value)}
                              placeholder="Add remark..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            {student.isManuallyAdded && (
                              <button
                                type="button"
                                onClick={() => handleRemoveStudentFromRoll(student.id)}
                                title="Remove from roll"
                                className="p-1 rounded text-slate-400 hover:text-rose-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {searchQuery ? `No students found matching "${searchQuery}"` : `No students enrolled in ${selectedClass} yet`}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {searchQuery
                    ? "Try adjusting your search criteria or clearing your status filter."
                    : "You can click '+ Add Student' above to add students to this roll call, or click 'Create Register Roll' to select another class."}
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddStudentRow(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                  >
                    + Add Student to Roll
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    Create Register Roll
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Save Register Bar */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Register summary: <strong className="text-slate-900 dark:text-white">{presentCount} Present</strong> ·{" "}
                <strong className="text-slate-900 dark:text-white">{lateCount} Late</strong> ·{" "}
                <strong className="text-slate-900 dark:text-white">{absentCount} Absent</strong> ·{" "}
                <strong className="text-slate-900 dark:text-white">{excusedCount} Excused</strong>
              </div>

              <button
                type="button"
                onClick={handleSaveRegister}
                disabled={saving || roll.length === 0}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save & Submit Attendance Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SAVED REGISTERS HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Attendance Registers Archive</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Past attendance rolls, attendance records, and submitted register sheets.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchSavedRegisters}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh History
            </button>
          </div>

          {registers.length > 0 ? (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Session Type</th>
                      <th className="py-3 px-4">Taken By</th>
                      <th className="py-3 px-4">Present</th>
                      <th className="py-3 px-4">Late</th>
                      <th className="py-3 px-4">Absent</th>
                      <th className="py-3 px-4">Attendance Rate</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {registers.map((reg) => {
                      const total = reg.present + reg.late + reg.absent + (reg.excused || 0);
                      const pct = total > 0 ? Math.round(((reg.present + reg.late) / total) * 100) : 0;
                      const isExpanded = expandedRegisterId === reg.id;

                      return (
                        <React.Fragment key={reg.id}>
                          <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                              {reg.date}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{reg.class}</td>
                            <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                              {reg.sessionType || "Morning Roll Call"}
                            </td>
                            <td className="py-3 px-4">{reg.takenBy || "Class Teacher"}</td>
                            <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                              {reg.present}
                            </td>
                            <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">{reg.late}</td>
                            <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400">{reg.absent}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                                {pct}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setExpandedRegisterId(isExpanded ? null : reg.id)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1"
                                >
                                  {isExpanded ? "Collapse" : "Details"}
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setViewRegisterDetails(reg)}
                                  title="Print or view full roll"
                                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 hover:text-slate-900 dark:hover:text-white"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRegister(reg.id)}
                                  title="Delete register"
                                  className="p-1 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Student Roll Breakdown */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={9} className="p-4 bg-slate-50/80 dark:bg-slate-950/50">
                                <div className="space-y-3">
                                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>Individual Student Attendance Records ({reg.records?.length || 0})</span>
                                    <span className="text-[11px] font-normal text-slate-400">
                                      Recorded by: {reg.takenBy}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {(reg.records || []).map((rec, rIdx) => {
                                      const stConfig = STATUS_CONFIG.find((c) => c.key === rec.status) || STATUS_CONFIG[0];
                                      return (
                                        <div
                                          key={rec.studentId || rIdx}
                                          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                                        >
                                          <div>
                                            <div className="font-bold text-slate-900 dark:text-white">
                                              {rec.studentName || `Student ${rec.studentId}`}
                                            </div>
                                            {rec.remark && (
                                              <div className="text-[10px] text-slate-400 italic">“{rec.remark}”</div>
                                            )}
                                          </div>
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${stConfig.badgeClass}`}>
                                            {rec.status}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <ClipboardList className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No attendance registers saved yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Once you complete and save a roll call sheet in the "Mark Attendance" tab, it will be securely archived here.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("mark")}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                Start Roll Call Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CREATE REGISTER ROLL MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Plus className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Create New Register Roll</h3>
                  <p className="text-xs text-slate-400">Setup attendance sheet for classroom roll call</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRegisterRollSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Select Form Class
                </label>
                <select
                  value={modalClass}
                  onChange={(e) => setModalClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  {assignedClasses.length > 0 && (
                    <optgroup label="My Assigned Classes">
                      {assignedClasses.map((c) => (
                        <option key={`m-${c}`} value={c}>
                          {c} (Assigned Form Class)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Other Classes">
                    {classesList.map((c) => (
                      <option key={`o-${c}`} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Roll Date
                </label>
                <input
                  type="date"
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Roll Call Session Type
                </label>
                <select
                  value={modalSessionType}
                  onChange={(e) => setModalSessionType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="Morning Assembly Roll Call">Morning Assembly Roll Call</option>
                  <option value="Afternoon Register">Afternoon Register</option>
                  <option value="Subject Lecture Period">Subject Lecture Period</option>
                  <option value="Hostel / Evening Roll Call">Hostel / Evening Roll Call</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800 text-[11px] text-indigo-700 dark:text-indigo-300">
                Opening this roll call sheet will automatically load all enrolled students in{" "}
                <strong>{modalClass}</strong> and set default status to <strong>Present</strong>.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  Generate & Mark Roll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW FULL REGISTER DETAILS & PRINT MODAL */}
      {viewRegisterDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Official Attendance Register Sheet
                </h3>
                <p className="text-xs text-slate-400">
                  {viewRegisterDetails.class} · {viewRegisterDetails.date} · {viewRegisterDetails.sessionType}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setViewRegisterDetails(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] font-bold uppercase text-emerald-600">Present</div>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">{viewRegisterDetails.present}</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <div className="text-[10px] font-bold uppercase text-amber-600">Late</div>
                  <div className="text-xl font-black text-amber-600 mt-0.5">{viewRegisterDetails.late}</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <div className="text-[10px] font-bold uppercase text-rose-600">Absent</div>
                  <div className="text-xl font-black text-rose-600 mt-0.5">{viewRegisterDetails.absent}</div>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                  <div className="text-[10px] font-bold uppercase text-indigo-600">Excused</div>
                  <div className="text-xl font-black text-indigo-600 mt-0.5">{viewRegisterDetails.excused || 0}</div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(viewRegisterDetails.records || []).map((r, i) => {
                      const cfg = STATUS_CONFIG.find((c) => c.key === r.status) || STATUS_CONFIG[0];
                      return (
                        <tr key={i}>
                          <td className="py-2 px-3 text-center text-slate-400 font-bold">{i + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                            {r.studentName || `Student ${r.studentId}`}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cfg.badgeClass}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-500 italic">{r.remark || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setViewRegisterDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};