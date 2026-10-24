import React, { useEffect, useState } from "react";
import { Wallet, Users, CheckCircle, Clock, Banknote, Receipt, Calendar, ShieldCheck, Plus, Loader2 } from "lucide-react";

interface PayrollStaff {
  id: string;
  name: string;
  role: string;
  department: string;
  bankAccount: string;
  basicSalary: number;
  allowances?: number;
  deductions: number;
  netPay: number;
  paymentDate: string;
  status: "Paid" | "Pending";
}

interface PayrollRun {
  id: string;
  month: string;
  staffCount: number;
  gross: number;
  net: number;
  status: string;
  processedAt: string;
}

const naira = (n: number) => `₦${(n || 0).toLocaleString()}`;
const nowMonth = () => new Date().toISOString().slice(0, 7);

export const PayrollView: React.FC = () => {
  const [staff, setStaff] = useState<PayrollStaff[]>([]);
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [month, setMonth] = useState(nowMonth());
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    const [staffRes, runsRes] = await Promise.all([
      fetch("/api/payroll/staff").then((r) => r.json()).catch(() => null),
      fetch("/api/payroll/runs").then((r) => r.json()).catch(() => null),
    ]);
    if (!staffRes && !runsRes) {
      showToast("error", "Could not load payroll data.");
      setLoading(false);
      return;
    }
    if (staffRes?.ok) setStaff(staffRes.data || []);
    if (runsRes?.ok) setRuns(runsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunPayroll = async () => {
    if (!month) return;
    setRunning(true);
    try {
      const res = await fetch("/api/payroll/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });
      const json = await res.json();
      if (json.ok) {
        showToast("success", `Payroll run for ${month} processed successfully!`);
        const runsRes = await fetch("/api/payroll/runs").then((r) => r.json()).catch(() => null);
        if (runsRes?.ok) setRuns(runsRes.data || []);
      } else {
        showToast("error", json.error || "Payroll run failed.");
      }
    } catch {
      showToast("error", "Network error running payroll.");
    } finally {
      setRunning(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    setPayingId(id);
    try {
      const res = await fetch(`/api/payroll/staff/${id}/pay`, { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setStaff((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "Paid", paymentDate: nowMonth() } : s))
        );
        showToast("success", "Staff marked as paid.");
      } else {
        showToast("error", json.error || "Failed to mark as paid.");
      }
    } catch {
      showToast("error", "Network error marking staff as paid.");
    } finally {
      setPayingId(null);
    }
  };

  const totalStaff = staff.length;
  const netPayroll = staff.reduce((sum, s) => sum + (s.netPay || 0), 0);
  const paidCount = staff.filter((s) => s.status === "Paid").length;
  const pendingCount = staff.filter((s) => s.status === "Pending").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Payroll & Staff Salaries
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Run monthly payroll batches, track staff payments, and reconcile bank disbursements.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Payroll Month
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 text-slate-800 dark:text-slate-200"
            />
          </div>
          <button
            onClick={handleRunPayroll}
            disabled={running}
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{running ? "Processing..." : "Run Payroll"}</span>
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold ${
            toast.type === "success"
              ? "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : (
            <Clock className="w-4 h-4 text-rose-600" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Total Staff
          </span>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{totalStaff}</div>
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1 block">
            Active Payroll
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
            <Banknote className="w-3.5 h-3.5" /> Net Payroll
          </span>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {naira(netPayroll)}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
            Net Salary Payable
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Paid
          </span>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{paidCount}</div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
            Salary Disbursed
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</div>
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1 block">
            Awaiting Payment
          </span>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Receipt className="w-4 h-4 text-indigo-600" />
          Staff Salary Register
        </h3>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Staff</th>
                <th className="p-3">Role</th>
                <th className="p-3">Bank Account</th>
                <th className="p-3 text-right">Basic Salary</th>
                <th className="p-3 text-right">Allowances</th>
                <th className="p-3 text-right">Deductions</th>
                <th className="p-3 text-right">Net Pay</th>
                <th className="p-3">Payment Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-semibold">
                    Loading payroll data...
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-semibold">
                    No staff payroll records found.
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{s.name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {s.role}
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500">{s.department}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{s.bankAccount}</td>
                    <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">{naira(s.basicSalary)}</td>
                    <td className="p-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">{naira(s.allowances || 0)}</td>
                    <td className="p-3 text-right font-semibold text-rose-600 dark:text-rose-400">{naira(s.deductions)}</td>
                    <td className="p-3 text-right font-black text-indigo-700 dark:text-indigo-300">{naira(s.netPay)}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{s.paymentDate || "—"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === "Paid"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {s.status === "Pending" ? (
                        <button
                          onClick={() => handleMarkPaid(s.id)}
                          disabled={payingId === s.id}
                          className="px-3 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white shadow-xs flex items-center gap-1 ml-auto"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{payingId === s.id ? "Paying..." : "Mark Paid"}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          Payroll Runs History
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {runs.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold col-span-full">
              No payroll runs recorded yet. Run your first payroll above.
            </p>
          ) : (
            runs.map((run) => (
              <div
                key={run.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{run.month}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      String(run.status).toLowerCase() === "paid"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {run.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Staff</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{run.staffCount}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Gross</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{naira(run.gross)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Net</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{naira(run.net)}</span>
                  </div>
                </div>
                <p className="text-[10px] font-semibold text-slate-400">
                  Processed: {new Date(run.processedAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};