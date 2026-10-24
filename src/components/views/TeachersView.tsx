import React, { useState, useEffect } from "react";
import { Users, Plus, Mail, Phone, BookOpen, Award, Check, QrCode, Trash2, AlertTriangle, CheckSquare, Square, LayoutGrid, Table, Pencil, X, Send, Copy, Link as LinkIcon, Sparkles, ExternalLink, Clock, Printer, Building, Search, RefreshCw } from "lucide-react";
import { initialTeachers } from "../../data/initialData";
import { TeacherRecord, ALL_SUBJECTS, GRADE_SUBJECTS, JSS_SUBJECTS, SS_SCIENCE_SUBJECTS, SS_COMMERCIAL_SUBJECTS, SS_ARTS_SUBJECTS, SS_VOCATIONAL_TRADE_SUBJECTS } from "../../types";
import { useLiveData, notifyDataChanged } from "../../lib/liveStore";

const CURRICULUM_SUBJECT_CATEGORIES = [
  { id: "all", label: "All Subjects", subjects: ALL_SUBJECTS },
  { id: "science", label: "Sciences & Math", subjects: SS_SCIENCE_SUBJECTS },
  { id: "commercial", label: "Commercial & Business", subjects: SS_COMMERCIAL_SUBJECTS },
  { id: "arts", label: "Arts & Humanities", subjects: SS_ARTS_SUBJECTS },
  { id: "junior", label: "Junior Secondary", subjects: JSS_SUBJECTS },
  { id: "primary", label: "Primary & Basic", subjects: GRADE_SUBJECTS },
  { id: "vocational", label: "Vocational & Trade", subjects: SS_VOCATIONAL_TRADE_SUBJECTS },
] as const;

interface CurriculumSubjectSelectorProps {
  appointedSubjects: string[];
  onToggleSubject: (subject: string) => void;
  accentColor?: "purple" | "indigo";
}

const CurriculumSubjectSelector: React.FC<CurriculumSubjectSelectorProps> = ({
  appointedSubjects,
  onToggleSubject,
  accentColor = "purple"
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const currentCat = CURRICULUM_SUBJECT_CATEGORIES.find(c => c.id === activeCategory) || CURRICULUM_SUBJECT_CATEGORIES[0];
  const listToFilter = currentCat.subjects;
  const filtered = listToFilter.filter((s) => s.toLowerCase().includes(search.toLowerCase().trim()));

  const activeBg = accentColor === "indigo" ? "bg-indigo-600 text-white font-bold" : "bg-purple-600 text-white font-bold";
  const hoverBorder = accentColor === "indigo" ? "hover:border-indigo-500" : "hover:border-purple-500";

  return (
    <div className="space-y-2 mt-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          All Approved Curriculum Subjects ({ALL_SUBJECTS.length} Available):
        </p>
        <div className="relative">
          <input
            type="text"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-44 px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar text-[10px]">
        {CURRICULUM_SUBJECT_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                isActive
                  ? activeBg
                  : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {cat.label} ({cat.subjects.length})
            </button>
          );
        })}
      </div>

      {/* Scrollable Subjects Grid */}
      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto custom-scrollbar p-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
        {filtered.map((suggestion) => {
          const isAssigned = appointedSubjects.includes(suggestion);
          return (
            <button
              key={suggestion}
              type="button"
              onClick={() => onToggleSubject(suggestion)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                isAssigned
                  ? activeBg
                  : `bg-white dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 ${hoverBorder}`
              }`}
            >
              {isAssigned ? `✓ ${suggestion}` : `+ ${suggestion}`}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-[11px] text-slate-400 py-2 w-full text-center">
            No subjects matching "{search}".
          </div>
        )}
      </div>
    </div>
  );
};

const SECONDARY_SUBJECT_SUGGESTIONS = [
  "Mathematics",
  "Further Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English Language",
  "Literature in English",
  "Economics",
  "Commerce",
  "Financial Accounting",
  "Government",
  "Civic Education",
  "Agricultural Science",
  "Basic Science",
  "Basic Technology",
  "Computer Studies / ICT",
  "Data Processing",
  "Technical Drawing",
  "Social Studies",
  "Christian Religious Studies (CRS)",
  "Islamic Religious Studies (IRS)",
  "Physical & Health Education (PHE)",
  "Cultural & Creative Arts (CCA)",
  "French Language",
  "History",
  "Animal Husbandry",
  "Food & Nutrition",
];

export interface TeachersViewProps {
  userSession?: any;
}

export const TeachersView: React.FC<TeachersViewProps> = ({ userSession }) => {
  const live = useLiveData<TeacherRecord>("teachers");
  const [teachers, setTeachers] = useState<TeacherRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("livingstone_invited_teachers");
        const cached = localStorage.getItem("livingstone_cached_teachers");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const realOnly = parsed.filter(
              (t: TeacherRecord) => t.status !== "Invited" && !["TCH-001", "TCH-002", "TCH-003", "TCH-004", "TCH-005"].includes(t.id)
            );
            localStorage.setItem("livingstone_cached_teachers", JSON.stringify(realOnly));
            return realOnly;
          }
        }
      } catch (e) {}
    }
    return initialTeachers;
  });

  // Status and Search Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "invited">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sync the faculty directory to the live server store.
  useEffect(() => {
    if (Array.isArray(live.data)) {
      if (live.data.length === 0) {
        setTeachers([]);
        try {
          localStorage.setItem("livingstone_cached_teachers", JSON.stringify([]));
        } catch (e) {}
        return;
      }
      setTeachers((prev) => {
        // Merge server live data with any locally known invited teachers
        const map = new Map<string, TeacherRecord>();
        live.data.forEach((t) => {
          if (t?.id) map.set(t.id, t);
        });
        // Retain any pending invited teachers
        (prev || []).forEach((t) => {
          if (t?.status === "Invited" && t?.email) {
            const hasServerMatch = Array.from(map.values()).some(
              (m) => m.email?.toLowerCase() === t.email?.toLowerCase()
            );
            if (!hasServerMatch) {
              map.set(t.id, t);
            }
          }
        });
        const merged = Array.from(map.values());
        try {
          localStorage.setItem("livingstone_cached_teachers", JSON.stringify(merged));
        } catch (e) {}
        return merged;
      });
    }
  }, [live.data]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [idCardModalTeacher, setIdCardModalTeacher] = useState<TeacherRecord | null>(null);

  // Email Invitation State
  const [modalTab, setModalTab] = useState<"form" | "invite">("invite");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteSubject, setInviteSubject] = useState("Mathematics");
  const [inviteAppointedSubjects, setInviteAppointedSubjects] = useState<string[]>(["Mathematics"]);
  const [inviteCustomSubjectInput, setInviteCustomSubjectInput] = useState("");
  const [inviteClass, setInviteClass] = useState("JSS 1");
  const [inviteAssignedClasses, setInviteAssignedClasses] = useState<string[]>(["JSS 1"]);
  const [inviteSending, setInviteSending] = useState(false);
  const [dispatchedNotice, setDispatchedNotice] = useState<{ email: string; schoolName: string; link: string; teacherId?: string; staffId?: string; autoPassword?: string } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [sendDirectInviteOnCreate, setSendDirectInviteOnCreate] = useState(true);

  const [activeSchoolName, setActiveSchoolName] = useState(() => {
    if (userSession?.schoolName && !userSession.schoolName.includes("LIVINGSTONEEDU Institution")) {
      return userSession.schoolName;
    }
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("livingstone_registered_school") || localStorage.getItem("livingstone_school_name");
      if (saved && !saved.includes("LIVINGSTONEEDU Institution")) return saved;
      try {
        const session = localStorage.getItem("livingstone_user_session");
        if (session) {
          const parsed = JSON.parse(session);
          if (parsed?.schoolName && !parsed.schoolName.includes("LIVINGSTONEEDU Institution")) return parsed.schoolName;
        }
      } catch (e) {}
    }
    return "Destiny way International Schools";
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.schoolName && !data.data.schoolName.includes("LIVINGSTONEEDU Institution")) {
          setActiveSchoolName(data.data.schoolName);
          try {
            localStorage.setItem("livingstone_registered_school", data.data.schoolName);
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  const getActiveSchoolName = () => {
    if (activeSchoolName && !activeSchoolName.includes("LIVINGSTONEEDU Institution")) {
      return activeSchoolName;
    }
    if (userSession?.schoolName && !userSession.schoolName.includes("LIVINGSTONEEDU Institution")) {
      return userSession.schoolName;
    }
    return "Destiny way International Schools";
  };

  // Fetch teachers directly from backend directory with local cache recovery
  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/teachers").then((r) => r.json());
      if (res.success && Array.isArray(res.data)) {
        setTeachers((prev) => {
          const map = new Map<string, TeacherRecord>();
          res.data.forEach((t: TeacherRecord) => {
            if (t?.id) map.set(t.id, t);
          });
          // Restore any cached invited teachers
          try {
            const cachedInv = localStorage.getItem("livingstone_invited_teachers");
            if (cachedInv) {
              const parsed: any[] = JSON.parse(cachedInv);
              if (Array.isArray(parsed)) {
                parsed.forEach((inv) => {
                  const emailKey = inv.email?.toLowerCase();
                  const already = Array.from(map.values()).some(
                    (t) => (t.email && t.email.toLowerCase() === emailKey) || t.id === inv.id
                  );
                  if (!already && inv.email) {
                    const fallbackTeacher: TeacherRecord = {
                      id: inv.id || `TCH-${Date.now()}`,
                      name: inv.name || "Invited Teacher",
                      fullName: inv.name || "Invited Teacher",
                      staffId: inv.staffId || `STF-LIV-${Math.floor(100 + Math.random() * 900)}`,
                      subjectSpecialization: inv.subject || "Mathematics",
                      assignedSubjects: inv.assignedSubjects || [inv.subject || "Mathematics"],
                      assignedClass: inv.assignedClass || "JSS 1",
                      assignedClasses: inv.assignedClasses || [inv.assignedClass || "JSS 1"],
                      email: inv.email,
                      phone: "+234 800 000 0000",
                      status: "Invited",
                      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                    };
                    map.set(fallbackTeacher.id, fallbackTeacher);
                    // Proactively sync up to server in background
                    fetch("/api/teachers/invite", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email: inv.email,
                        name: inv.name,
                        subject: inv.subject,
                        assignedSubjects: inv.assignedSubjects,
                        assignedClass: inv.assignedClass,
                        assignedClasses: inv.assignedClasses,
                        schoolName: inv.schoolName
                      })
                    }).catch(() => {});
                  }
                });
              }
            }
          } catch (e) {}
          const merged = Array.from(map.values());
          try {
            localStorage.setItem("livingstone_cached_teachers", JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    } catch (e) {}
  };

  // Fetch pending invitations on load
  const fetchInvitations = async () => {
    try {
      const res = await fetch("/api/teachers/invitations").then((r) => r.json());
      if (res.success && res.data) {
        setPendingInvitations(res.data);
        try {
          localStorage.setItem("livingstone_invited_teachers", JSON.stringify(res.data));
        } catch (e) {}
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchTeachers();
    fetchInvitations();
  }, []);

  const handleSendEmailInvite = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteSending(true);
    try {
      const schoolName = getActiveSchoolName();
      const finalSubjects = inviteAppointedSubjects.length > 0
        ? inviteAppointedSubjects
        : (inviteSubject.trim() ? inviteSubject.split(",").map((s) => s.trim()).filter(Boolean) : ["Mathematics"]);

      const finalClasses = inviteAssignedClasses.length > 0 ? inviteAssignedClasses : [inviteClass || "JSS 1"];
      const primaryClass = inviteClass || finalClasses[0] || "JSS 1";

      const res = await fetch("/api/teachers/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          name: inviteName.trim() || undefined,
          subject: finalSubjects.join(", "),
          assignedSubjects: finalSubjects,
          assignedClass: primaryClass,
          assignedClasses: finalClasses,
          schoolName
        })
      }).then(r => r.json());

      if (res.success) {
        const inviteLink = res.inviteLink || `https://livingstoneedu.name.ng/app/dashboard?role=teacher&schoolId=SCH-001&email=${encodeURIComponent(inviteEmail.trim())}`;
        setDispatchedNotice({
          email: inviteEmail.trim(),
          schoolName: schoolName,
          link: inviteLink,
          teacherId: res.invitation?.teacherId || res.teacher?.teacherId || "TCH-101",
          staffId: res.invitation?.staffId || res.teacher?.staffId || "STF-LIV-101",
          autoPassword: res.invitation?.autoPassword || res.teacher?.teacherId || "TCH-101"
        });
        setSuccessMsg(`✓ Official invitation email dispatched to ${inviteEmail} for ${finalSubjects.join(", ")}!`);
        
        if (res.invitation) {
          setPendingInvitations(prev => {
            const next = [res.invitation, ...prev.filter(i => i.id !== res.invitation.id && i.email !== res.invitation.email)];
            try {
              localStorage.setItem("livingstone_invited_teachers", JSON.stringify(next));
            } catch (e) {}
            return next;
          });
        }

        const returnedTeacher: TeacherRecord = res.teacher || {
          id: `TCH-${Date.now()}`,
          name: inviteName.trim() || inviteEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          fullName: inviteName.trim() || inviteEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          staffId: `STF-LIV-${Math.floor(100 + Math.random() * 900)}`,
          subjectSpecialization: finalSubjects.join(", "),
          assignedSubjects: finalSubjects,
          assignedClass: primaryClass,
          assignedClasses: finalClasses,
          email: inviteEmail.trim(),
          phone: "+234 800 000 0000",
          status: "Invited",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        };

        setTeachers(prev => {
          const filtered = (prev || []).filter(
            (t) => t.id !== returnedTeacher.id && t.email?.toLowerCase() !== returnedTeacher.email?.toLowerCase()
          );
          const next = [returnedTeacher, ...filtered];
          try {
            localStorage.setItem("livingstone_cached_teachers", JSON.stringify(next));
          } catch (e) {}
          return next;
        });

        notifyDataChanged(["teachers", "teacherInvitations"]);
        setInviteEmail("");
        setInviteName("");
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        setSuccessMsg(`✗ ${res.message || "Failed to send invitation."}`);
      }
    } catch (err) {
      console.error(err);
      setSuccessMsg("✗ Error dispatching invitation.");
    } finally {
      setInviteSending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // Edit Teacher Modal State
  const [editModalTeacher, setEditModalTeacher] = useState<TeacherRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editStaffId, setEditStaffId] = useState("");
  const [editSubjectSpecialization, setEditSubjectSpecialization] = useState("");
  const [editAppointedSubjects, setEditAppointedSubjects] = useState<string[]>([]);
  const [editCustomSubjectInput, setEditCustomSubjectInput] = useState("");
  const [editAssignedClass, setEditAssignedClass] = useState("");
  const [editAssignedClasses, setEditAssignedClasses] = useState<string[]>(["JSS 1"]);
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState<"Active" | "On Leave" | "Suspended">("Active");

  const openEditModal = (t: TeacherRecord) => {
    if (!t) return;
    setEditModalTeacher(t);
    setEditName(t?.name || "");
    setEditStaffId(t?.staffId || "");
    setEditSubjectSpecialization(t?.subjectSpecialization || "");
    const initialSubs = (t?.assignedSubjects && Array.isArray(t?.assignedSubjects) && t.assignedSubjects.length > 0)
      ? t.assignedSubjects
      : (t?.subjectSpecialization ? t.subjectSpecialization.split(",").map((s) => s.trim()).filter(Boolean) : []);
    setEditAppointedSubjects(initialSubs);
    setEditCustomSubjectInput("");
    const initialClasses = (t?.assignedClasses && Array.isArray(t.assignedClasses) && t.assignedClasses.length > 0)
      ? t.assignedClasses
      : (t?.assignedClass ? [t.assignedClass] : ["JSS 1"]);
    setEditAssignedClasses(initialClasses);
    setEditAssignedClass(t?.assignedClass || initialClasses[0] || "JSS 1");
    setEditEmail(t?.email || "");
    setEditPhone(t?.phone || "");
    setEditStatus((t?.status as any) || "Active");
  };

  const handleSaveEditTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalTeacher?.id || !editName.trim()) return;

    const teacherId = editModalTeacher.id;
    const finalSubs = editAppointedSubjects.length > 0
      ? editAppointedSubjects
      : (editSubjectSpecialization.trim() ? editSubjectSpecialization.split(",").map((s) => s.trim()).filter(Boolean) : ["General Secondary Subjects"]);
    const mergedSpecialization = finalSubs.join(", ");

    const finalClasses = editAssignedClasses.length > 0 ? editAssignedClasses : [editAssignedClass || "JSS 1"];
    const primaryClass = editAssignedClass || finalClasses[0] || "JSS 1";

    setTeachers((prev) =>
      (prev || []).map((t) =>
        t?.id === teacherId
          ? {
              ...t,
              name: editName,
              staffId: editStaffId,
              subjectSpecialization: mergedSpecialization,
              assignedSubjects: finalSubs,
              assignedClass: primaryClass,
              assignedClasses: finalClasses,
              email: editEmail,
              phone: editPhone,
              status: editStatus,
            }
          : t
      )
    );
    setSuccessMsg(`✓ Updated teacher record & appointed classes/subjects for ${editName}!`);
    setEditModalTeacher(null);
    setTimeout(() => setSuccessMsg(""), 3500);
    fetch(`/api/teachers/${teacherId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        staffId: editStaffId,
        subjectSpecialization: mergedSpecialization,
        assignedSubjects: finalSubs,
        assignedClass: primaryClass,
        assignedClasses: finalClasses,
        email: editEmail,
        phone: editPhone,
        status: editStatus,
      })
    })
      .then(() => notifyDataChanged(["teachers"]))
      .catch(() => {});
  };

  // Multi-select & Bulk Delete state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [name, setName] = useState("");
  const [subjectSpecialization, setSubjectSpecialization] = useState("Mathematics, Further Mathematics");
  const [appointedSubjects, setAppointedSubjects] = useState<string[]>(["Mathematics", "Further Mathematics"]);
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [assignedClass, setAssignedClass] = useState("JSS 1");
  const [assignedClasses, setAssignedClasses] = useState<string[]>(["JSS 1"]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === (teachers || []).length) {
      setSelectedIds([]);
    } else {
      setSelectedIds((teachers || []).map((t) => t?.id).filter(Boolean));
    }
  };

  const triggerDelete = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    setDeleteTargetIds(ids);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setTeachers((prev) => (prev || []).filter((t) => !deleteTargetIds.includes(t?.id)));
    setSelectedIds((prev) => (prev || []).filter((id) => !deleteTargetIds.includes(id)));
    setSuccessMsg(`✓ Deleted ${deleteTargetIds.length} teacher record(s) successfully.`);
    setDeleteModalOpen(false);
    setDeleteTargetIds([]);
    setTimeout(() => setSuccessMsg(""), 3500);
    Promise.all(
      deleteTargetIds.map((id) =>
        fetch(`/api/teachers/${id}`, { method: "DELETE" }).catch(() => {})
      )
    ).then(() => notifyDataChanged(["teachers"]));
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalSubs = appointedSubjects.length > 0
      ? appointedSubjects
      : (subjectSpecialization.trim() ? subjectSpecialization.split(",").map((s) => s.trim()).filter(Boolean) : ["Mathematics"]);
    const mergedSpecialization = finalSubs.join(", ");

    const finalClasses = assignedClasses.length > 0 ? assignedClasses : [assignedClass || "JSS 1"];
    const primaryClass = assignedClass || finalClasses[0] || "JSS 1";

    const newTeacher: TeacherRecord = {
      id: `TCH-${String(teachers.length + 1).padStart(3, "0")}`,
      name,
      staffId: `STF-LIV-${Math.floor(100 + Math.random() * 900)}`,
      subjectSpecialization: mergedSpecialization,
      assignedSubjects: finalSubs,
      assignedClass: primaryClass,
      assignedClasses: finalClasses,
      email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@livingstone.edu`,
      phone: phone || "+234 800 000 0000",
      status: "Active",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    };

    setTeachers([newTeacher, ...teachers]);
    setSuccessMsg(`Added teacher ${name} with ${finalSubs.length} appointed subject(s) and ${finalClasses.length} class(es)!`);

    if (sendDirectInviteOnCreate && email) {
      const schoolName = getActiveSchoolName();
      fetch("/api/teachers/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          subject: mergedSpecialization,
          assignedSubjects: finalSubs,
          assignedClass: primaryClass,
          assignedClasses: finalClasses,
          schoolName
        })
      })
        .then(r => r.json())
        .then(json => {
          if (json?.invitation) {
            setPendingInvitations(prev => [json.invitation, ...prev]);
          }
        })
        .catch(() => {});
    }

    setName("");
    setEmail("");
    setPhone("");
    setAddModalOpen(false);
    setTimeout(() => setSuccessMsg(""), 3500);
    fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTeacher)
    })
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) setTeachers((prev) => (prev || []).map((t) => (t?.id === newTeacher.id ? json.data : t)));
        notifyDataChanged(["teachers"]);
      })
  };

  const invitedCount = (teachers || []).filter((t) => t?.status === "Invited").length;
  const activeCount = (teachers || []).filter((t) => t?.status !== "Invited").length;

  const displayedTeachers = (teachers || []).filter((t) => {
    if (statusFilter === "active" && t?.status === "Invited") return false;
    if (statusFilter === "invited" && t?.status !== "Invited") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (t?.name || "").toLowerCase().includes(q);
      const matchEmail = (t?.email || "").toLowerCase().includes(q);
      const matchId = (t?.staffId || t?.id || "").toLowerCase().includes(q);
      const matchSubject = (t?.subjectSpecialization || (t?.assignedSubjects || []).join(" ")).toLowerCase().includes(q);
      const matchClass = (t?.assignedClass || (t?.assignedClasses || []).join(" ")).toLowerCase().includes(q);
      return matchName || matchEmail || matchId || matchSubject || matchClass;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Faculty & Teaching Staff Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Academic qualifications, subject specializations, form class assignments for Primary & Secondary divisions.
          </p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setModalTab("invite");
              setAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 shadow-sm active:scale-95 transition-all"
          >
            <Mail className="w-4 h-4 text-indigo-500" />
            <span>Invite Staff via Email</span>
          </button>
          <button
            onClick={() => {
              setModalTab("form");
              setAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Teacher</span>
          </button>
        </div>
      </div>

      {/* Pending Invitations Alert Banner */}
      {invitedCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
              <Mail className="w-5 h-5" />
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <span>{invitedCount} Staff Invitation{invitedCount > 1 ? "s" : ""} Stored on School Portal</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-black">
                  Active
                </span>
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Teacher profiles, assigned subjects, and login credentials have been reserved and persisted. You can copy direct invite links below.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === "invited" ? "all" : "invited")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                statusFilter === "invited"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200"
              }`}
            >
              {statusFilter === "invited" ? "Show All Staff" : `View ${invitedCount} Invited`}
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Tabs Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Staff ({teachers.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "active"
                ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("invited")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "invited"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Invited</span>
            {invitedCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                statusFilter === "invited"
                  ? "bg-white/30 text-white"
                  : "bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300"
              }`}>
                {invitedCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, email, subject, or class..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-purple-500 shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Multi-Select Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
          >
            {selectedIds.length === displayedTeachers.length && displayedTeachers.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>
              {selectedIds.length === displayedTeachers.length && displayedTeachers.length > 0
                ? "Deselect All"
                : `Select All (${displayedTeachers.length})`}
            </span>
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={() => triggerDelete(selectedIds)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 active:scale-95 transition-all animate-in fade-in"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "grid"
                ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "table"
                ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
            title="Table View"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty State when no teachers match filter */}
      {displayedTeachers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            No faculty records match your criteria
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search query or switching the status filter tab."
              : "No teachers currently registered. You can invite faculty members via email or register them manually."}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {(searchQuery || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => {
                setModalTab("invite");
                setAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" /> Invite Staff
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTeachers.map((t, idx) => {
            const isSelected = selectedIds.includes(t?.id);
            const isInvited = t?.status === "Invited";
            const inviteLink = t.inviteLink || `https://livingstoneedu.name.ng/app/dashboard?role=teacher&schoolId=SCH-001&email=${encodeURIComponent(t.email || "")}`;
            return (
              <div
                key={t?.id || idx}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border ${
                  isSelected
                    ? "border-purple-500 ring-2 ring-purple-500/20"
                    : isInvited
                    ? "border-amber-300/80 dark:border-amber-800/80 bg-amber-500/[0.02]"
                    : "border-slate-200/80 dark:border-slate-800"
                } shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between relative group`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => t?.id && toggleSelect(t.id)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <img
                        src={t?.avatar}
                        alt={t?.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t?.name}</h3>
                          {isInvited && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60">
                              Invited
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1 max-w-[200px]">
                          {(t?.assignedSubjects && Array.isArray(t.assignedSubjects) && t.assignedSubjects.length > 0
                            ? t.assignedSubjects
                            : (t?.subjectSpecialization ? t.subjectSpecialization.split(",").map((s) => s.trim()).filter(Boolean) : ["General Subjects"])
                          ).map((sub, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">ID: {t?.staffId}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => t?.id && triggerDelete([t.id])}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Teacher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Assigned Classes & Form Class:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{t.assignedClasses && t.assignedClasses.length > 0 ? t.assignedClasses.join(", ") : (t.assignedClass || "JSS 1")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{t.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{t.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    isInvited
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                      : t?.status === "On Leave"
                      ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                      : t?.status === "Suspended"
                      ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                      : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                  }`}>
                    {isInvited ? <Mail className="w-2.5 h-2.5" /> : null}
                    {isInvited ? "Invited (Pending)" : (t.status || "Active")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isInvited && (
                      <button
                        onClick={() => copyToClipboard(inviteLink)}
                        className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 flex items-center gap-1 cursor-pointer border border-amber-200/60"
                        title="Copy direct educator login link"
                      >
                        <Copy className="w-3 h-3" /> Link
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(t)}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 hover:bg-purple-100 flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setIdCardModalTeacher(t)}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 cursor-pointer"
                    >
                      ID Badge
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === displayedTeachers.length && displayedTeachers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </th>
                <th className="p-3.5">Staff Name</th>
                <th className="p-3.5">Staff ID</th>
                <th className="p-3.5">Subject Specialization</th>
                <th className="p-3.5">Form Class</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedTeachers.map((t, idx) => {
                const isSelected = selectedIds.includes(t?.id);
                const isInvited = t?.status === "Invited";
                const inviteLink = t.inviteLink || `https://livingstoneedu.name.ng/app/dashboard?role=teacher&schoolId=SCH-001&email=${encodeURIComponent(t.email || "")}`;
                return (
                  <tr
                    key={t?.id || idx}
                    onClick={() => openEditModal(t)}
                    className={`hover:bg-purple-50/40 dark:hover:bg-purple-950/20 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-purple-50/50 dark:bg-purple-950/20"
                        : isInvited
                        ? "bg-amber-50/30 dark:bg-amber-950/10"
                        : ""
                    }`}
                  >
                    <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => t?.id && toggleSelect(t.id)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={t?.avatar} alt={t?.name} className="w-8 h-8 rounded-full object-cover border" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {t?.name}
                          {isInvited && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              Invited
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400">{t?.email}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">{t?.staffId}</td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(t?.assignedSubjects && Array.isArray(t.assignedSubjects) && t.assignedSubjects.length > 0
                          ? t.assignedSubjects
                          : (t?.subjectSpecialization ? t.subjectSpecialization.split(",").map((s) => s.trim()).filter(Boolean) : ["General Subjects"])
                        ).map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 whitespace-nowrap"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {t?.assignedClasses && t.assignedClasses.length > 0 ? t.assignedClasses.join(", ") : (t?.assignedClass || "JSS 1")}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{t?.phone}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                        isInvited
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                          : t?.status === "On Leave"
                          ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                          : t?.status === "Suspended"
                          ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                          : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                      }`}>
                        {isInvited ? <Mail className="w-2.5 h-2.5" /> : null}
                        {isInvited ? "Invited (Pending)" : (t?.status || "Active")}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      {isInvited && (
                        <button
                          onClick={() => copyToClipboard(inviteLink)}
                          className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 inline-flex items-center gap-1 border border-amber-200/60"
                          title="Copy direct teacher invite login link"
                        >
                          <Copy className="w-3 h-3" /> Copy Link
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(t)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 hover:bg-purple-100 inline-flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => setIdCardModalTeacher(t)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                      >
                        ID Badge
                      </button>
                      <button
                        onClick={() => t?.id && triggerDelete([t.id])}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete Record"
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
      )}

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
              Are you sure you want to delete <strong className="text-rose-600 dark:text-rose-400">{deleteTargetIds.length}</strong> selected teacher record(s) from the staff directory?
            </p>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs max-h-32 overflow-y-auto space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Items to be removed:</span>
              {(teachers || [])
                .filter((t) => deleteTargetIds.includes(t?.id))
                .slice(0, 5)
                .map((t, idx) => (
                  <div key={t?.id || idx} className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>{t?.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">{t?.staffId}</span>
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

      {/* TEACHER ID CARD MODAL */}
      {idCardModalTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Official Staff ID Badge
              </h3>
              <button onClick={() => setIdCardModalTeacher(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-700 shadow-lg text-center space-y-3 relative">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-300 block">
                LIVINGSTONE ACADEMY STAFF ID
              </span>
              <img
                src={idCardModalTeacher?.avatar}
                alt={idCardModalTeacher?.name || "Teacher"}
                className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-indigo-400"
              />
              <div>
                <h4 className="font-bold text-sm text-white">{idCardModalTeacher?.name}</h4>
                <p className="text-[11px] text-indigo-200 font-semibold">{idCardModalTeacher?.subjectSpecialization}</p>
                <p className="text-[10px] font-mono text-indigo-300 mt-1">STAFF NO: {idCardModalTeacher?.staffId}</p>
              </div>

              <div className="pt-2 border-t border-indigo-800 flex justify-center">
                <QrCode className="w-10 h-10 text-slate-200" />
              </div>
            </div>

            <button
              onClick={() => {
                window.print();
                setIdCardModalTeacher(null);
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Staff Badge</span>
            </button>
          </div>
        </div>
      )}

      {/* ADD NEW TEACHER & INVITATION MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overflow-y-auto py-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {modalTab === "invite" ? "Send Official Staff Invitation Email" : "Add New Staff / Teacher Record"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {modalTab === "invite" ? "Dispatches an official invitation email bearing your school name with portal login access" : "Register a teacher directly or dispatch an instant email invite"}
                </p>
              </div>
              <button type="button" onClick={() => setAddModalOpen(false)} className="text-slate-400 font-bold hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>

            {/* Modal Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => setModalTab("invite")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  modalTab === "invite"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email Invitation</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab("form")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  modalTab === "form"
                    ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manual Entry Form</span>
              </button>
            </div>

            {modalTab === "form" ? (
              <form onSubmit={handleAddTeacher} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Teacher Name & Title
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Mrs. Adeleke Comfort"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Appointed Subjects to Teach
                      </label>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                        {appointedSubjects.length} Appointed
                      </span>
                    </div>

                    {/* Appointed Subject Chips */}
                    <div className="flex flex-wrap gap-1.5 min-h-[34px] p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      {appointedSubjects.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-600 text-white shadow-xs"
                        >
                          {sub}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = appointedSubjects.filter((_, i) => i !== sIdx);
                              setAppointedSubjects(updated);
                              setSubjectSpecialization(updated.join(", "));
                            }}
                            className="hover:bg-purple-700 rounded p-0.5"
                            title={`Remove ${sub}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {appointedSubjects.length === 0 && (
                        <span className="text-xs text-slate-400 italic">No subjects appointed yet. Select below or add custom.</span>
                      )}
                    </div>

                    {/* Quick Add Custom Subject */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSubjectInput}
                        onChange={(e) => setCustomSubjectInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (customSubjectInput.trim() && !appointedSubjects.includes(customSubjectInput.trim())) {
                              const updated = [...appointedSubjects, customSubjectInput.trim()];
                              setAppointedSubjects(updated);
                              setSubjectSpecialization(updated.join(", "));
                              setCustomSubjectInput("");
                            }
                          }
                        }}
                        placeholder="Type custom subject (e.g. Data Processing, Technical Drawing)..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customSubjectInput.trim() && !appointedSubjects.includes(customSubjectInput.trim())) {
                            const updated = [...appointedSubjects, customSubjectInput.trim()];
                            setAppointedSubjects(updated);
                            setSubjectSpecialization(updated.join(", "));
                            setCustomSubjectInput("");
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shrink-0"
                      >
                        + Add Subject
                      </button>
                    </div>

                    {/* Complete Curriculum Subject Selector */}
                    <CurriculumSubjectSelector
                      appointedSubjects={appointedSubjects}
                      onToggleSubject={(sug) => {
                        const isAssigned = appointedSubjects.includes(sug);
                        const updated = isAssigned
                          ? appointedSubjects.filter((s) => s !== sug)
                          : [...appointedSubjects, sug];
                        setAppointedSubjects(updated);
                        setSubjectSpecialization(updated.join(", "));
                      }}
                      accentColor="purple"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Appointed Classes ({assignedClasses.length})
                      </label>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                        Multi-Class Appointment
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {assignedClasses.map((cls, cIdx) => (
                        <span key={cIdx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-xs">
                          {cls}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = assignedClasses.filter((_, i) => i !== cIdx);
                              setAssignedClasses(updated);
                              if (assignedClass === cls && updated.length > 0) setAssignedClass(updated[0]);
                            }}
                            className="hover:bg-indigo-700 rounded p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {assignedClasses.length === 0 && (
                        <span className="text-xs text-slate-400 italic">Select classes below...</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Toggle Classes (Click to assign multiple):
                      </p>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar p-1 rounded-lg bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                        {["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"].map((cls) => {
                          const isAssigned = assignedClasses.includes(cls);
                          return (
                            <button
                              key={cls}
                              type="button"
                              onClick={() => {
                                const updated = isAssigned
                                  ? assignedClasses.filter((c) => c !== cls)
                                  : [...assignedClasses, cls];
                                setAssignedClasses(updated);
                                if (!isAssigned && assignedClasses.length === 0) setAssignedClass(cls);
                              }}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                                isAssigned
                                  ? "bg-indigo-600 text-white font-bold"
                                  : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-600"
                              }`}
                            >
                              {isAssigned ? `✓ ${cls}` : `+ ${cls}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Form Class
                    </label>
                    <select
                      value={assignedClass}
                      onChange={(e) => setAssignedClass(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                    >
                      {assignedClasses.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      {assignedClasses.length === 0 && (
                        <option value="JSS 1">JSS 1</option>
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="teacher@livingstoneedu.name.ng"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Phone Contact
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 803 000 0000"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Email Invite Option checkbox */}
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Send Official Email Invitation on Save</p>
                      <p className="text-[10px] text-indigo-700 dark:text-indigo-300">Dispatches an email bearing {getActiveSchoolName()} with portal link</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={sendDirectInviteOnCreate}
                      onChange={(e) => setSendDirectInviteOnCreate(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="w-1/3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30"
                  >
                    Save Teacher Record
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 animate-in fade-in">
                {/* Active School Badge */}
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div className="truncate">
                      <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">Sending on behalf of School</p>
                      <p className="font-bold text-indigo-950 dark:text-indigo-200 truncate">{getActiveSchoolName()}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0 font-bold">
                    www.livingstoneedu.name.ng
                  </span>
                </div>

                <form onSubmit={handleSendEmailInvite} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Recipient Educator Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="teacher@example.com"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Teacher Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="e.g. Mr. Emmanuel Okafor"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Appointed Subjects ({inviteAppointedSubjects.length})
                      </label>
                      <span className="text-[10px] text-indigo-500 font-semibold">Can appoint 2 or more subjects</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-h-[34px]">
                      {inviteAppointedSubjects.map((sub, sIdx) => (
                        <span key={sIdx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-600 text-white">
                          {sub}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = inviteAppointedSubjects.filter((_, i) => i !== sIdx);
                              setInviteAppointedSubjects(updated);
                              setInviteSubject(updated.join(", "));
                            }}
                            className="hover:bg-indigo-700 rounded p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inviteCustomSubjectInput}
                        onChange={(e) => setInviteCustomSubjectInput(e.target.value)}
                        placeholder="Add subject (e.g. Further Maths, Physics)..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (inviteCustomSubjectInput.trim() && !inviteAppointedSubjects.includes(inviteCustomSubjectInput.trim())) {
                              const updated = [...inviteAppointedSubjects, inviteCustomSubjectInput.trim()];
                              setInviteAppointedSubjects(updated);
                              setInviteSubject(updated.join(", "));
                              setInviteCustomSubjectInput("");
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (inviteCustomSubjectInput.trim() && !inviteAppointedSubjects.includes(inviteCustomSubjectInput.trim())) {
                            const updated = [...inviteAppointedSubjects, inviteCustomSubjectInput.trim()];
                            setInviteAppointedSubjects(updated);
                            setInviteSubject(updated.join(", "));
                            setInviteCustomSubjectInput("");
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0"
                      >
                        + Add
                      </button>
                    </div>

                    {/* Complete Curriculum Subject Selector */}
                    <CurriculumSubjectSelector
                      appointedSubjects={inviteAppointedSubjects}
                      onToggleSubject={(sug) => {
                        const sel = inviteAppointedSubjects.includes(sug);
                        const updated = sel
                          ? inviteAppointedSubjects.filter((s) => s !== sug)
                          : [...inviteAppointedSubjects, sug];
                        setInviteAppointedSubjects(updated);
                        setInviteSubject(updated.join(", "));
                      }}
                      accentColor="indigo"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Appointed Classes ({inviteAssignedClasses.length})
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {inviteAssignedClasses.map((cls, cIdx) => (
                        <span key={cIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white">
                          {cls}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = inviteAssignedClasses.filter((_, i) => i !== cIdx);
                              setInviteAssignedClasses(updated);
                              if (inviteClass === cls && updated.length > 0) setInviteClass(updated[0]);
                            }}
                            className="hover:bg-indigo-700 rounded p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar p-1 rounded-lg bg-slate-100/60 dark:bg-slate-800/40">
                      {["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"].map((cls) => {
                        const sel = inviteAssignedClasses.includes(cls);
                        return (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => {
                              const updated = sel ? inviteAssignedClasses.filter((c) => c !== cls) : [...inviteAssignedClasses, cls];
                              setInviteAssignedClasses(updated);
                              if (!sel && inviteAssignedClasses.length === 0) setInviteClass(cls);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              sel ? "bg-indigo-600 text-white font-bold" : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                            }`}
                          >
                            {sel ? `✓ ${cls}` : `+ ${cls}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Form Class
                    </label>
                    <select
                      value={inviteClass}
                      onChange={(e) => setInviteClass(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    >
                      {inviteAssignedClasses.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      {inviteAssignedClasses.length === 0 && (
                        <option value="JSS 1">JSS 1</option>
                      )}
                    </select>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      disabled={inviteSending || !inviteEmail.trim()}
                      className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all"
                    >
                      {inviteSending ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>Dispatching Invitation Email...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Invitation Email to {inviteEmail ? inviteEmail : "Recipient"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Dispatched Confirmation Box */}
                {dispatchedNotice && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2.5 animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                          Official Invitation Email Dispatched!
                        </p>
                        <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                          An official onboarding email from <strong>{dispatchedNotice.schoolName}</strong> with portal access instructions and auto-generated password has been sent directly to <strong>{dispatchedNotice.email}</strong>.
                        </p>
                        <div className="mt-2 p-2.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50 text-[11px] space-y-1 font-mono text-emerald-950 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700">
                          <p><strong>Teacher ID (Auto Password):</strong> <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded font-bold text-indigo-600 dark:text-indigo-400">{dispatchedNotice.autoPassword || dispatchedNotice.teacherId}</span></p>
                          <p><strong>Staff Reference ID:</strong> {dispatchedNotice.staffId}</p>
                          <p className="truncate"><strong>Invitation Link:</strong> {dispatchedNotice.link}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Invitations */}
                {pendingInvitations.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Recent Dispatched Email Invitations</span>
                    <div className="max-h-32 overflow-y-auto space-y-1.5">
                      {pendingInvitations.slice(0, 4).map((inv: any) => (
                        <div key={inv.id} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs">
                          <div className="truncate pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{inv.email}</p>
                            </div>
                            <p className="text-[10px] text-slate-500">{inv.schoolName || getActiveSchoolName()} • {inv.subject} • {inv.assignedClass}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                            Sent
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT TEACHER MODAL */}
      {editModalTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <form onSubmit={handleSaveEditTeacher} className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
                  <Pencil className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Faculty Record
                  </h3>
                  <p className="text-[11px] text-slate-500">ID: {editModalTeacher?.id}</p>
                </div>
              </div>
              <button type="button" onClick={() => setEditModalTeacher(null)} className="text-slate-400 hover:text-slate-600 font-bold p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name & Title
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-purple-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Staff ID Number
                </label>
                <input
                  type="text"
                  value={editStaffId}
                  onChange={(e) => setEditStaffId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-purple-500 text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Employment Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Appointed Teaching Subjects ({editAppointedSubjects.length})
                  </label>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                    Multi-Subject Appointment
                  </span>
                </div>

                {/* Currently Appointed Subject Badges */}
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                  {editAppointedSubjects.map((sub, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-600 text-white shadow-xs"
                    >
                      {sub}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editAppointedSubjects.filter((_, i) => i !== sIdx);
                          setEditAppointedSubjects(updated);
                          setEditSubjectSpecialization(updated.join(", "));
                        }}
                        className="hover:bg-purple-700 rounded p-0.5"
                        title={`Remove ${sub}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {editAppointedSubjects.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No subjects appointed yet. Select from suggestions below or add custom.</span>
                  )}
                </div>

                {/* Add Custom Subject */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editCustomSubjectInput}
                    onChange={(e) => setEditCustomSubjectInput(e.target.value)}
                    placeholder="Add custom subject (e.g. Further Mathematics)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (editCustomSubjectInput.trim() && !editAppointedSubjects.includes(editCustomSubjectInput.trim())) {
                          const updated = [...editAppointedSubjects, editCustomSubjectInput.trim()];
                          setEditAppointedSubjects(updated);
                          setEditSubjectSpecialization(updated.join(", "));
                          setEditCustomSubjectInput("");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editCustomSubjectInput.trim() && !editAppointedSubjects.includes(editCustomSubjectInput.trim())) {
                        const updated = [...editAppointedSubjects, editCustomSubjectInput.trim()];
                        setEditAppointedSubjects(updated);
                        setEditSubjectSpecialization(updated.join(", "));
                        setEditCustomSubjectInput("");
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shrink-0"
                  >
                    + Add Subject
                  </button>
                </div>

                {/* Complete Curriculum Subject Selector */}
                <CurriculumSubjectSelector
                  appointedSubjects={editAppointedSubjects}
                  onToggleSubject={(sug) => {
                    const isAssigned = editAppointedSubjects.includes(sug);
                    const updated = isAssigned
                      ? editAppointedSubjects.filter((s) => s !== sug)
                      : [...editAppointedSubjects, sug];
                    setEditAppointedSubjects(updated);
                    setEditSubjectSpecialization(updated.join(", "));
                  }}
                  accentColor="purple"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Appointed Classes ({editAssignedClasses.length})
                  </label>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                    Multi-Class Appointment
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                  {editAssignedClasses.map((cls, cIdx) => (
                    <span key={cIdx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-600 text-white shadow-xs">
                      {cls}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editAssignedClasses.filter((_, i) => i !== cIdx);
                          setEditAssignedClasses(updated);
                          if (editAssignedClass === cls && updated.length > 0) setEditAssignedClass(updated[0]);
                        }}
                        className="hover:bg-purple-700 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {editAssignedClasses.length === 0 && (
                    <span className="text-xs text-slate-400 italic">Select classes below...</span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Toggle Classes (Click to assign multiple):
                  </p>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar p-1 rounded-lg bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                    {["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"].map((cls) => {
                      const isAssigned = editAssignedClasses.includes(cls);
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => {
                            const updated = isAssigned
                              ? editAssignedClasses.filter((c) => c !== cls)
                              : [...editAssignedClasses, cls];
                            setEditAssignedClasses(updated);
                            if (!isAssigned && editAssignedClasses.length === 0) setEditAssignedClass(cls);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                            isAssigned
                              ? "bg-purple-600 text-white font-bold"
                              : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-600"
                          }`}
                        >
                          {isAssigned ? `✓ ${cls}` : `+ ${cls}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Form Class
                </label>
                <select
                  value={editAssignedClass}
                  onChange={(e) => setEditAssignedClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  {editAssignedClasses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  {editAssignedClasses.length === 0 && (
                    <option value="JSS 1">JSS 1</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Contact
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditModalTeacher(null)}
                className="w-1/3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Save Updated Details
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
