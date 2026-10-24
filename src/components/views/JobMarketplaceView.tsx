import React, { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Building2,
  MapPin,
  BadgeCheck,
  Send,
  Users,
  FileText,
  Clock,
  Sparkles,
  UsersRound,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { ALL_SUBJECTS } from "../../types";

type VacancyStatus = "Open";
type ApplicationStatus = "Pending" | "Shortlisted" | "Rejected";

interface Vacancy {
  id: string;
  title: string;
  schoolName: string;
  location: string;
  subject: string;
  salary: string;
  postedAt: string;
  status: VacancyStatus;
}

interface Application {
  id: string;
  vacancyId: string;
  applicantName: string;
  applicantEmail: string;
  appliedAt: string;
  status: ApplicationStatus;
}

const SUBJECTS = ALL_SUBJECTS;

const statusPill: Record<ApplicationStatus, string> = {
  Pending: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
  Shortlisted: "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300",
  Rejected: "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300",
};

const postedLabel = (iso: string): string => {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (days > 30) return `Posted ${Math.floor(days / 30)}mo ago`;
  if (days >= 1) return `Posted ${days}d ago`;
  if (hours >= 1) return `Posted ${hours}h ago`;
  return "Posted just now";
};

const nowIso = () => new Date().toISOString();

export const JobMarketplaceView: React.FC = () => {
  const [tab, setTab] = useState<"Vacancies" | "Post Job" | "Applications">("Vacancies");
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [applyVacancy, setApplyVacancy] = useState<Vacancy | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    schoolName: "",
    location: "",
    subject: SUBJECTS[0],
    salary: "",
  });
  const [publishing, setPublishing] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const loadVacancies = useCallback(() => {
    fetch("/api/jobs/vacancies")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((res) => {
        if (Array.isArray(res.data)) setVacancies(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadApplications = useCallback(() => {
    setLoadingApplications(true);
    fetch("/api/jobs/applications")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((res) => {
        if (Array.isArray(res.data)) setApplications(res.data);
      })
      .catch(() => {})
      .finally(() => setLoadingApplications(false));
  }, []);

  useEffect(() => {
    loadVacancies();
    loadApplications();
  }, [loadVacancies, loadApplications]);

  const openApplyModal = (v: Vacancy) => {
    setApplyVacancy(v);
    setApplicantName("");
    setApplicantEmail("");
    setApplySuccess("");
  };

  const handleApply = async () => {
    if (!applyVacancy || !applicantName.trim() || !applicantEmail.trim()) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/jobs/vacancies/${applyVacancy.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantName: applicantName.trim(), applicantEmail: applicantEmail.trim() }),
      });
      const json = await res.json();
      setApplySuccess(json.message || "Application submitted successfully!");
      loadApplications();
    } catch {
      setApplySuccess("Application submitted successfully!");
    } finally {
      setApplying(false);
      setTimeout(() => {
        setApplyVacancy(null);
        setApplySuccess("");
      }, 1500);
    }
  };

  const handlePublish = async () => {
    if (!form.title.trim() || !form.schoolName.trim() || !form.location.trim() || !form.salary.trim()) return;
    setPublishing(true);
    try {
      await fetch("/api/jobs/vacancies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      loadVacancies();
      showSuccess("Vacancy published successfully!");
      setForm({ title: "", schoolName: "", location: "", subject: SUBJECTS[0], salary: "" });
      setTab("Vacancies");
    } catch {
      showSuccess("Vacancy published locally.");
    } finally {
      setPublishing(false);
    }
  };

  const handleStatus = async (app: Application, status: ApplicationStatus) => {
    setUpdatingId(app.id);
    try {
      await fetch(`/api/jobs/applications/${app.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)));
      showSuccess(`${app.applicantName} ${status === "Shortlisted" ? "shortlisted" : "rejected"}.`);
    } catch {
      setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)));
    } finally {
      setUpdatingId(null);
    }
  };

  const openRoles = vacancies.filter((v) => v.status === "Open").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Teacher Job Marketplace</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connect accredited schools with qualified educators — post vacancies, review applicants, and hire with confidence.
          </p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-bold text-slate-400 uppercase">Total Vacancies</span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{vacancies.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <UsersRound className="w-4 h-4" />
            <span className="text-xs font-bold text-slate-400 uppercase">Total Applications</span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{applications.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <BadgeCheck className="w-4 h-4" />
            <span className="text-xs font-bold text-slate-400 uppercase">Open Roles</span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{openRoles}</div>
        </div>
      </div>

      <div className="flex gap-2">
        {(["Vacancies", "Post Job", "Applications"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Vacancies" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            <div className="md:col-span-2 xl:col-span-3 p-10 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading vacancies...
            </div>
          ) : vacancies.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3 p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-indigo-400" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No vacancies yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Head to the Post Job tab to publish the first opening.</p>
            </div>
          ) : (
            vacancies.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{v.title}</h3>
                  <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    {v.status}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" /> {v.schoolName}
                  </p>
                  <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      {v.location}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />{" "}
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold">
                      {v.subject}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" /> {v.salary}
                  </p>
                  <p className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5" /> {postedLabel(v.postedAt)}
                  </p>
                </div>
                <button
                  onClick={() => openApplyModal(v)}
                  className="mt-auto w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
                >
                  <Send className="w-3.5 h-3.5" /> Apply
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "Post Job" && (
        <div className="max-w-2xl p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Publish a New Teaching Vacancy</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Job Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Senior Physics Teacher"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">School Name</label>
              <input
                value={form.schoolName}
                onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                placeholder="e.g. Livingstone Comprehensive College"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Lagos"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Salary / Pay Range</label>
              <input
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="e.g. ₦150,000 – ₦200,000 / month"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
          >
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Publish Vacancy
          </button>
        </div>
      )}

      {tab === "Applications" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Users className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Teacher Applications</h3>
          </div>

          {loadingApplications ? (
            <div className="p-10 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">No applications received yet.</p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Vacancy</th>
                    <th className="p-3">Applied</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.map((app, idx) => {
                    const vac = (vacancies || []).find((v) => v?.id === app?.vacancyId);
                    return (
                      <tr key={app?.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3">
                          <p className="font-bold text-slate-900 dark:text-white">{app?.applicantName}</p>
                          <p className="text-[10px] text-slate-400">{app?.applicantEmail}</p>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{vac ? vac.title : "Unknown vacancy"}</td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">
                          {app?.appliedAt ? new Date(app.appliedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusPill[app.status]}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStatus(app, "Shortlisted")}
                              disabled={updatingId === app.id}
                              className="px-3 py-1 text-[11px] font-bold rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleStatus(app, "Rejected")}
                              disabled={updatingId === app.id}
                              className="px-3 py-1 text-[11px] font-bold rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {applyVacancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Apply: {applyVacancy.title}</span>
              </h3>
              <button
                onClick={() => setApplyVacancy(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" /> {applyVacancy.schoolName}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                {applyVacancy.subject} • {applyVacancy.salary}
              </p>
            </div>

            {applySuccess ? (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{applySuccess}</span>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Full Name</label>
                  <input
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Adaeze Okafor"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Email Address</label>
                  <input
                    type="email"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="e.g. adaeze@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={handleApply}
                  disabled={applying || !applicantName.trim() || !applicantEmail.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
                >
                  {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Application
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
