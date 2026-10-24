import React, { useState, useEffect } from "react";
import { GraduationCap, Search, Plus, Filter, Mail, Phone, MoreVertical, ShieldCheck, Check, UserCheck, X, Trash2, AlertTriangle, CheckSquare, Square, Pencil } from "lucide-react";
import { initialStudents } from "../../data/initialData";
import { StudentRecord } from "../../types";
import { useLiveData, notifyDataChanged } from "../../lib/liveStore";

export const StudentsView: React.FC = () => {
  const live = useLiveData<StudentRecord>("students");
  const [students, setStudents] = useState<StudentRecord[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentRecord | null>(null);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  // Student Full Edit State
  const [editStudentName, setEditStudentName] = useState("");
  const [editAdmissionNo, setEditAdmissionNo] = useState("");
  const [editStudentClass, setEditStudentClass] = useState("");
  const [editGender, setEditGender] = useState<"Male" | "Female">("Male");
  const [editParentName, setEditParentName] = useState("");
  const [editParentPhone, setEditParentPhone] = useState("");
  const [editStudentStatus, setEditStudentStatus] = useState<"Active" | "Graduated" | "Transferred" | "Suspended">("Active");

  const openEditStudentModal = (st: StudentRecord) => {
    if (!st) return;
    setSelectedStudentDetail(st);
    setEditStudentName(st?.name || "");
    setEditAdmissionNo(st?.admissionNo || "");
    setEditStudentClass(st?.class || "");
    setEditGender(st?.gender || "Male");
    setEditParentName(st?.parentName || "");
    setEditParentPhone(st?.parentPhone || "");
    setEditStudentStatus((st?.status as any) || "Active");
    setEditingClass(st?.class || "");
  };

  const handleSaveStudentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentDetail?.id || !editStudentName.trim()) return;

    const studentId = selectedStudentDetail.id;
    const updated: StudentRecord = {
      ...selectedStudentDetail,
      name: editStudentName,
      admissionNo: editAdmissionNo,
      class: editStudentClass,
      gender: editGender,
      parentName: editParentName,
      parentPhone: editParentPhone,
      status: editStudentStatus as any,
    };

    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedStudentDetail(updated);
    setSuccessMsg(`✓ Saved updated student profile for ${editStudentName}`);
    setTimeout(() => setSuccessMsg(""), 3500);
    fetch(`/api/students/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })
      .then(() => notifyDataChanged(["students"]))
      .catch(() => {});
  };

  // Multi-select & Bulk Delete State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);

  // Class Change / Promotion State (Teacher / Admin Only)
  const [editingClass, setEditingClass] = useState("");
  const [promotionReason, setPromotionReason] = useState("Academic Promotion");
  const [promotionSuccessMsg, setPromotionSuccessMsg] = useState("");

  // New Student Form State
  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState("Grade 1 Gold");
  const [newGender, setNewGender] = useState<"Male" | "Female">("Male");
  const [newParentName, setNewParentName] = useState("");
  const [newParentPhone, setNewParentPhone] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sync the directory to the live server store; every admin edit elsewhere updates this view.
  useEffect(() => {
    if (Array.isArray(live.data)) setStudents(live.data);
  }, [live.data]);

  const toggleSelectStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (filteredItems: StudentRecord[]) => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((s) => s.id));
    }
  };

  const triggerDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    setDeleteTargetIds(ids);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setStudents((prev) => prev.filter((s) => !deleteTargetIds.includes(s.id)));
    setSelectedIds((prev) => prev.filter((id) => !deleteTargetIds.includes(id)));
    setSuccessMsg(`✓ Deleted ${deleteTargetIds.length} student record(s) successfully.`);
    setDeleteModalOpen(false);
    setDeleteTargetIds([]);
    setTimeout(() => setSuccessMsg(""), 3500);
    Promise.all(
      deleteTargetIds.map((id) =>
        fetch(`/api/students/${id}`, { method: "DELETE" }).catch(() => {})
      )
    ).then(() => notifyDataChanged(["students"]));
  };

  const handlePromoteClass = async () => {
    if (!selectedStudentDetail?.id || !editingClass) return;
    const studentId = selectedStudentDetail.id;
    try {
      await fetch(`/api/students/${studentId}/class`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newClassLevel: editingClass,
          changedBy: "Teacher / School Administrator",
          reason: promotionReason
        })
      });
      notifyDataChanged(["students"]);
    } catch (e) {}

    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, class: editingClass } : s))
    );
    setSelectedStudentDetail(prev => prev ? { ...prev, class: editingClass } : null);
    setPromotionSuccessMsg(`✓ Class updated to ${editingClass}. Change logged in audit trail.`);
    setTimeout(() => setPromotionSuccessMsg(""), 4000);
  };

  const filtered = (students || []).filter((s) => {
    if (!s) return false;
    const matchesSearch =
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.admissionNo || "").toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClass === "All" || (s.class || "").startsWith(selectedClass);
    return matchesSearch && matchesClass;
  });

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newParentName.trim()) return;

    const newStudent: StudentRecord = {
      id: `STD-2027-${String(students.length + 1).padStart(3, "0")}`,
      name: newName,
      admissionNo: `DIS/2027/${String(500 + students.length + 1).padStart(3, "0")}`,
      class: newClass,
      gender: newGender,
      parentName: newParentName,
      parentPhone: newParentPhone || "+234 800 000 0000",
      status: "Active",
      avatar: newGender === "Male"
        ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    };

    setStudents([newStudent, ...students]);
    setSuccessMsg(`Enrolled student ${newName} successfully!`);
    setNewName("");
    setNewParentName("");
    setNewParentPhone("");
    setEnrollModalOpen(false);
    setTimeout(() => setSuccessMsg(""), 3500);
    fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStudent)
    })
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) setStudents((prev) => prev.map((s) => (s.id === newStudent.id ? json.data : s)));
        notifyDataChanged(["students"]);
      })
      .catch(() => notifyDataChanged(["students"]));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Student Information & Enrollment Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive profile records for Grade 1–6, JSS 1–3, and SS 1–3 streams.
          </p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <button
          onClick={() => setEnrollModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Filter & Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or admission number..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={() => triggerDelete(selectedIds)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 active:scale-95 transition-all w-full sm:w-auto justify-center animate-in fade-in"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent text-slate-800 dark:text-slate-200"
        >
          <option value="All">All Class Levels (Grade 1-6, JSS 1-3, SS 1-3)</option>
          <option value="Grade 1">Grade 1</option>
          <option value="Grade 2">Grade 2</option>
          <option value="Grade 3">Grade 3</option>
          <option value="Grade 4">Grade 4</option>
          <option value="Grade 5">Grade 5</option>
          <option value="Grade 6">Grade 6</option>
          <option value="JSS 1">JSS 1</option>
          <option value="JSS 2">JSS 2</option>
          <option value="JSS 3">JSS 3</option>
          <option value="SS 1">SS 1</option>
          <option value="SS 2">SS 2</option>
          <option value="SS 3">SS 3</option>
        </select>
      </div>

      {/* Student Records Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-3.5 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filtered.length && filtered.length > 0}
                  onChange={() => toggleSelectAll(filtered)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              <th className="p-3.5">Student</th>
              <th className="p-3.5">Admission No</th>
              <th className="p-3.5">Class Stream</th>
              <th className="p-3.5">Gender</th>
              <th className="p-3.5">Parent / Guardian</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((st) => {
              const isSelected = selectedIds.includes(st.id);
              return (
                <tr
                  key={st.id}
                  onClick={() => openEditStudentModal(st)}
                  className={`hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 cursor-pointer transition-colors ${isSelected ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""}`}
                >
                  <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectStudent(st.id)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-3.5 flex items-center gap-3">
                    <img
                      src={st?.avatar}
                      alt={st?.name || "Student"}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{st?.name}</span>
                      <span className="text-[10px] text-slate-400">ID: {st?.id}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">{st?.admissionNo}</td>
                  <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{st?.class}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">{st?.gender}</td>
                  <td className="p-3.5">
                    <span className="block font-medium text-slate-800 dark:text-slate-200">{st?.parentName}</span>
                    <span className="text-[10px] text-slate-400">{st?.parentPhone}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {st?.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEditStudentModal(st)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 inline-flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Edit Profile
                    </button>
                    <button
                      onClick={() => triggerDelete([st.id])}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete Student"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CONFIRM DELETION MODAL DIALOG */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm Deletion
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  This operation is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-rose-600 dark:text-rose-400">{deleteTargetIds.length}</strong> selected student record(s) from the directory?
            </p>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs max-h-32 overflow-y-auto space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Items to be removed:</span>
              {students
                .filter((st) => deleteTargetIds.includes(st.id))
                .slice(0, 5)
                .map((st) => (
                  <div key={st.id} className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>{st.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">{st.admissionNo}</span>
                  </div>
                ))}
              {deleteTargetIds.length > 5 && (
                <p className="text-[10px] text-slate-400 italic">...and {deleteTargetIds.length - 5} more record(s)</p>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PROFILE & EDIT MODAL */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <form onSubmit={handleSaveStudentEdit} className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                  <Pencil className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Student Record
                  </h3>
                  <p className="text-[11px] text-slate-500">ID: {selectedStudentDetail.id}</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedStudentDetail(null)} className="text-slate-400 hover:text-slate-600 font-bold p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <img
                src={selectedStudentDetail?.avatar}
                alt={selectedStudentDetail?.name || "Student"}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editStudentName || selectedStudentDetail?.name}
                </h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                  {editAdmissionNo || selectedStudentDetail?.admissionNo}
                </p>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                  {editStudentClass || selectedStudentDetail?.class}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Student Name
                </label>
                <input
                  type="text"
                  required
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Admission Number
                </label>
                <input
                  type="text"
                  value={editAdmissionNo}
                  onChange={(e) => setEditAdmissionNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Gender
                </label>
                <select
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Class Stream
                </label>
                <select
                  value={editStudentClass}
                  onChange={(e) => setEditStudentClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
                >
                  <optgroup label="Nursery">
                    <option value="Nursery 1">Nursery 1</option>
                    <option value="Nursery 2">Nursery 2</option>
                  </optgroup>
                  <optgroup label="Primary School (Primary 1 - 6)">
                    <option value="Primary 1">Primary 1</option>
                    <option value="Primary 2">Primary 2</option>
                    <option value="Primary 3">Primary 3</option>
                    <option value="Primary 4">Primary 4</option>
                    <option value="Primary 5">Primary 5</option>
                    <option value="Primary 6">Primary 6</option>
                  </optgroup>
                  <optgroup label="Junior Secondary (JSS 1 - 3)">
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="JSS 3">JSS 3</option>
                  </optgroup>
                  <optgroup label="Senior Secondary (SS 1 - 3)">
                    <option value="SS 1">SS 1</option>
                    <option value="SS 2">SS 2</option>
                    <option value="SS 3">SS 3</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Enrollment Status
                </label>
                <select
                  value={editStudentStatus}
                  onChange={(e) => setEditStudentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="Active">Active</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  value={editParentName}
                  onChange={(e) => setEditParentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Parent Phone Contact
                </label>
                <input
                  type="text"
                  value={editParentPhone}
                  onChange={(e) => setEditParentPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="w-1/3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Save Student Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ENROLL NEW STUDENT MODAL */}
      {enrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleEnrollSubmit} className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Enroll New Student
              </h3>
              <button type="button" onClick={() => setEnrollModalOpen(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Student Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Okafor Miracle"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Class Stream
                  </label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  >
                    <optgroup label="Primary School (Primary 1 - 6)">
                      <option value="Primary 1">Primary 1</option>
                      <option value="Primary 2">Primary 2</option>
                      <option value="Primary 3">Primary 3</option>
                      <option value="Primary 4">Primary 4</option>
                      <option value="Primary 5">Primary 5</option>
                      <option value="Primary 6">Primary 6</option>
                    </optgroup>
                    <optgroup label="Junior Secondary (JSS 1 - 3)">
                      <option value="JSS 1">JSS 1</option>
                      <option value="JSS 2">JSS 2</option>
                      <option value="JSS 3">JSS 3</option>
                    </optgroup>
                    <optgroup label="Senior Secondary (SS 1 - 3)">
                      <option value="SS 1">SS 1</option>
                      <option value="SS 2">SS 2</option>
                      <option value="SS 3">SS 3</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as "Male" | "Female")}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  required
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  placeholder="e.g., Mr. Okafor Dennis"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Parent Phone Number
                </label>
                <input
                  type="text"
                  value={newParentPhone}
                  onChange={(e) => setNewParentPhone(e.target.value)}
                  placeholder="+234 803 123 4567"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setEnrollModalOpen(false)}
                className="w-1/3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                Save Enrollment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
