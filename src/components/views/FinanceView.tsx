import React, { useState, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  ArrowUpRight,
  Check,
  AlertCircle,
  FileText,
  Download,
  ShieldCheck,
  Lock,
  Building,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Landmark,
  Key
} from "lucide-react";
import { useLiveData, useAppSettings } from "../../lib/liveStore";
import { initialInvoices } from "../../data/initialData";
import { FinanceInvoice } from "../../types";

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  accountType: string;
  isDefault: boolean;
  isActive: boolean;
}

const NIGERIAN_BANKS = [
  "Access Bank",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Guaranty Trust Bank (GTBank)",
  "Heritage Bank",
  "Jaiz Bank",
  "Keystone Bank",
  "Kuda Bank",
  "Moniepoint Microfinance Bank",
  "OPay (PayCom)",
  "PalmPay",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "SunTrust Bank",
  "Taj Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "VBank (VFD)",
  "Wema Bank / ALAT",
  "Zenith Bank"
];

export const FinanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"accounts" | "invoices" | "gateways">("accounts");
  const liveInvoicesData = useLiveData<any>("financeInvoices").data;
  const [invoices, setInvoices] = useState<FinanceInvoice[]>([]);

  useEffect(() => {
    if (Array.isArray(liveInvoicesData)) {
      if (liveInvoicesData.length > 0 && Array.isArray(liveInvoicesData[0])) {
        setInvoices(liveInvoicesData.flat());
      } else {
        setInvoices(liveInvoicesData);
      }
    }
  }, [liveInvoicesData]);

  useEffect(() => {
    fetch("/api/finance/invoices")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setInvoices(data.data);
        }
      })
      .catch(() => {});
  }, []);
  const [activePaymentInvoice, setActivePaymentInvoice] = useState<FinanceInvoice | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<"Flutterwave" | "Paystack">("Paystack");
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState("");

  const { settings } = useAppSettings();
  const currentSchoolName = settings?.schoolName || (typeof window !== "undefined" ? localStorage.getItem("livingstone_registered_school") : "") || "Livingstone Institution";

  // Bank Accounts State
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("livingstone_school_bank_accounts");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: "PAY-001",
        bankName: "Guaranty Trust Bank (GTBank)",
        accountName: currentSchoolName,
        accountNumber: "0123456789",
        sortCode: "058",
        accountType: "Current",
        isDefault: true,
        isActive: true
      }
    ];
  });

  const [savingAccounts, setSavingAccounts] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load from backend on mount
  useEffect(() => {
    fetch("/api/school/bank-accounts")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setBankAccounts(data.data);
          try {
            localStorage.setItem("livingstone_school_bank_accounts", JSON.stringify(data.data));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveAccounts = async () => {
    setSavingAccounts(true);
    try {
      localStorage.setItem("livingstone_school_bank_accounts", JSON.stringify(bankAccounts));
      await fetch("/api/school/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accounts: bankAccounts })
      });
      setSavedSuccess(true);
      setPaymentSuccessMsg("✓ School bank account details saved successfully!");
      setTimeout(() => {
        setSavedSuccess(false);
        setPaymentSuccessMsg("");
      }, 4000);
    } catch (e) {
      setPaymentSuccessMsg("✓ Account details saved to local memory!");
      setTimeout(() => setPaymentSuccessMsg(""), 3500);
    } finally {
      setSavingAccounts(false);
    }
  };

  const handleAddAccount = () => {
    const newAccount: BankAccount = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      bankName: "Access Bank",
      accountName: "",
      accountNumber: "",
      sortCode: "",
      accountType: "Current",
      isDefault: bankAccounts.length === 0,
      isActive: true
    };
    setBankAccounts([...bankAccounts, newAccount]);
  };

  const handleRemoveAccount = (id: string) => {
    const filtered = bankAccounts.filter((a) => a.id !== id);
    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    setBankAccounts(filtered);
  };

  const handleSetDefault = (id: string) => {
    setBankAccounts(
      bankAccounts.map((a) => ({
        ...a,
        isDefault: a.id === id
      }))
    );
  };

  const handleSimulatePayment = (inv: FinanceInvoice) => {
    setActivePaymentInvoice(inv);
  };

  const handleConfirmPayment = () => {
    if (!activePaymentInvoice) return;
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === activePaymentInvoice.id
          ? { ...i, paidAmount: i.totalAmount, status: "Paid" }
          : i
      )
    );
    setPaymentSuccessMsg(
      `Payment of ₦${(activePaymentInvoice.totalAmount - activePaymentInvoice.paidAmount).toLocaleString()} via ${paymentGateway} successfully confirmed!`
    );
    setActivePaymentInvoice(null);
    setTimeout(() => setPaymentSuccessMsg(""), 4000);
  };

  const totalExpected = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0);
  const totalOutstanding = Math.max(0, totalExpected - totalCollected);
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;
  const pendingCount = invoices.filter((inv) => inv.status !== "Paid").length;

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Landmark className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Finance, Bank Settlement & Tuition Billing
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure school bank accounts for fee collection, review student invoices, and manage payment processors.
          </p>
        </div>

        {paymentSuccessMsg && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{paymentSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1.5 max-w-xl">
        <button
          onClick={() => setActiveTab("accounts")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "accounts"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>School Bank Accounts</span>
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "invoices"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Tuition Invoices</span>
        </button>
        <button
          onClick={() => setActiveTab("gateways")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "gateways"
              ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Payment Gateway Keys</span>
        </button>
      </div>

      {/* TAB 1: SCHOOL BANK ACCOUNTS FOR FEE PAYMENT */}
      {activeTab === "accounts" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-emerald-600" /> Official School Bank Account Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Enter your school's bank account numbers so parents and students can make direct tuition and fee payments.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddAccount}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Account</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveAccounts}
                  disabled={savingAccounts}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                >
                  {savingAccounts ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Accounts...</span>
                    </>
                  ) : savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Bank Accounts</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {bankAccounts.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Landmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No bank accounts added yet.</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add Another Account" to enter your school's banking information.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {bankAccounts.map((acct, index) => (
                  <div
                    key={acct.id}
                    className={`p-5 rounded-2xl border transition-all space-y-4 ${
                      acct.isDefault
                        ? "border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                          <Building className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            Account #{index + 1}
                          </span>
                          {acct.isDefault && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                              Primary Default
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!acct.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(acct.id)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-300 hover:text-emerald-800 transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        {bankAccounts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAccount(acct.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Bank Name <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={acct.bankName}
                          onChange={(e) => {
                            const updated = [...bankAccounts];
                            updated[index] = { ...updated[index], bankName: e.target.value };
                            setBankAccounts(updated);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                        >
                          {NIGERIAN_BANKS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Account Name (Beneficiary) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={acct.accountName}
                          onChange={(e) => {
                            const updated = [...bankAccounts];
                            updated[index] = { ...updated[index], accountName: e.target.value };
                            setBankAccounts(updated);
                          }}
                          placeholder="e.g. Destiny way International Schools"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            10-Digit NUBAN Account Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={10}
                            value={acct.accountNumber}
                            onChange={(e) => {
                              const clean = e.target.value.replace(/\D/g, "").slice(0, 10);
                              const updated = [...bankAccounts];
                              updated[index] = { ...updated[index], accountNumber: clean };
                              setBankAccounts(updated);
                            }}
                            placeholder="0123456789"
                            className="w-full px-3 py-2 text-xs font-mono font-bold tracking-widest rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Account Type
                          </label>
                          <select
                            value={acct.accountType}
                            onChange={(e) => {
                              const updated = [...bankAccounts];
                              updated[index] = { ...updated[index], accountType: e.target.value };
                              setBankAccounts(updated);
                            }}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                          >
                            <option>Current Account</option>
                            <option>Savings Account</option>
                            <option>Collection Account</option>
                            <option>Domiciliary (USD / GBP)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> These bank account details are automatically displayed on digital invoices, print receipts, and the student payment portal for direct transfer reconciliation.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES TABLE */}
      {activeTab === "invoices" && (
        <div className="space-y-6">
          {/* Financial Overview Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Term Total Tuition Expected</span>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">₦{totalExpected.toLocaleString()}</div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
                1st Term 2026/2027 Budget
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Tuition Collected To Date</span>
              <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">₦{totalCollected.toLocaleString()}</div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
                {collectionRate}% Collection Rate
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Outstanding Pending Deficit</span>
              <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">₦{totalOutstanding.toLocaleString()}</div>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1 block">
                {pendingCount} Students Pending Clearance
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Student Tuition Invoices</h3>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Invoice ID</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Class Stream</th>
                    <th className="p-3 text-right">Total Amount</th>
                    <th className="p-3 text-right">Amount Paid</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Pay via Gateway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                        No student tuition invoices generated yet. Invoices created in the School Portal fee billing module will appear here automatically.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{inv.id}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{inv.studentName}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{inv.class}</td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                          ₦{inv.totalAmount.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          ₦{inv.paidAmount.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === "Paid"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                                : inv.status === "Partial"
                                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                                : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {inv.status !== "Paid" ? (
                            <button
                              onClick={() => handleSimulatePayment(inv)}
                              className="px-3 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            >
                              Pay Balance
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400">Receipt Issued</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT GATEWAY KEYS */}
      {activeTab === "gateways" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-sky-600" /> Payment Gateway API Keys
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Connect Paystack or Flutterwave so student tuition can be paid via card, bank transfer, and USSD directly into your account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Paystack Integration</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700">Supported</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Paystack Public Key</label>
                <input
                  type="text"
                  placeholder="pk_live_xxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Flutterwave Integration</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Supported</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Flutterwave Public Key</label>
                <input
                  type="text"
                  placeholder="FLWPUBK-xxxxxxxxxxxx"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal Simulator */}
      {activePaymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Secure Tuition Payment Gateway</span>
              </h3>
              <button
                onClick={() => setActivePaymentInvoice(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <span className="text-slate-400 block">Paying Tuition For:</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {activePaymentInvoice.studentName} ({activePaymentInvoice.class})
              </p>
              <div className="flex justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500">Balance Due:</span>
                <span className="font-black text-rose-600 dark:text-rose-400 text-sm">
                  ₦{(activePaymentInvoice.totalAmount - activePaymentInvoice.paidAmount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                Select Payment Processor Gateway
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentGateway("Paystack")}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    paymentGateway === "Paystack"
                      ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300"
                      : "border-slate-200 dark:border-slate-800 text-slate-600"
                  }`}
                >
                  Paystack Gateway
                </button>
                <button
                  onClick={() => setPaymentGateway("Flutterwave")}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    paymentGateway === "Flutterwave"
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                      : "border-slate-200 dark:border-slate-800 text-slate-600"
                  }`}
                >
                  Flutterwave
                </button>
              </div>
            </div>

            <button
              onClick={handleConfirmPayment}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Simulate Gateway Authorization</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
