import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Zap,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Users,
  Sparkles,
  Calendar,
  Clock,
  Download,
  ArrowUpRight,
  Check,
  Lock,
  Building,
  RefreshCw,
  FileText,
  HelpCircle,
} from "lucide-react";
import { SubscriptionPlan, SubscriptionStatus, UserRole } from "../../types";

interface SubscriptionViewProps {
  currentRole?: UserRole;
  userSession?: any;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: "plan-starter",
    name: "Starter School",
    priceTerm: 30000,
    priceMonthly: 10000,
    priceAnnual: 90000,
    studentLimit: 200,
    aiCreditsMonthly: 2000,
    badge: "Starter",
    subtitle: "Ideal for primary schools & tutorial centers (up to 200 students).",
    features: [
      "Student & Teacher Portals",
      "Attendance & Lesson Notes",
      "Digital Report Cards",
    ],
  },
  {
    id: "plan-standard-enterprise",
    name: "Standard Enterprise",
    priceTerm: 80000,
    priceMonthly: 27000,
    priceAnnual: 240000,
    studentLimit: 2000,
    aiCreditsMonthly: 10000,
    badge: "Most Popular",
    isPopular: true,
    subtitle: "For secondary schools & comprehensive colleges (up to 2000 students).",
    features: [
      "Unlimited AI Lesson Notes",
      "Online CBT Examination Engine",
      "Full Finance & Fee Invoicing",
      "School Website Builder",
    ],
  },
  {
    id: "plan-multi-campus",
    name: "Multi-Campus Group",
    priceTerm: "Custom pricing",
    priceMonthly: 0,
    priceAnnual: 0,
    studentLimit: "Unlimited",
    aiCreditsMonthly: "Unlimited",
    badge: "Enterprise",
    subtitle: "For institutions with multiple campuses & custom integrations.",
    features: [
      "Custom Domain & Branding",
      "Dedicated Account Manager",
      "24/7 SLA Priority Support",
    ],
  },
];

const INITIAL_STATUS: SubscriptionStatus = {
  currentPlanId: "plan-standard-enterprise",
  planName: "Standard Enterprise",
  billingCycle: "Term",
  status: "Active",
  activeStudentsUsed: 1248,
  maxStudentsLimit: 2000,
  aiCreditsUsed: 3420,
  maxAiCreditsLimit: 10000,
  renewalDate: "End of First Term 2026",
  autoRenew: true,
  amountPaid: "₦80,000 / term",
  lastPaymentDate: "September 10, 2026",
};

const INVOICE_HISTORY = [
  { id: "INV-2026-001", date: "Sep 10, 2026", amount: "₦80,000", plan: "Standard Enterprise (First Term)", status: "Paid", gateway: "Paystack Card" },
  { id: "INV-2025-003", date: "May 04, 2026", amount: "₦80,000", plan: "Standard Enterprise (Third Term)", status: "Paid", gateway: "Bank Transfer" },
  { id: "INV-2025-002", date: "Jan 12, 2026", amount: "₦80,000", plan: "Standard Enterprise (Second Term)", status: "Paid", gateway: "Paystack Card" },
];

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ currentRole }) => {
  const [status, setStatus] = useState<SubscriptionStatus>(INITIAL_STATUS);
  const [invoices, setInvoices] = useState<any[]>(INVOICE_HISTORY);
  const [billingCycle, setBillingCycle] = useState<"Term" | "Monthly" | "Annual">("Term");
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<SubscriptionPlan | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<"Paystack" | "Flutterwave" | "BankTransfer">("Paystack");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState("");
  const [topupCreditsModalOpen, setTopupCreditsModalOpen] = useState(false);
  const [creditsToBuy, setCreditsToBuy] = useState(2000);
  const [schoolsList, setSchoolsList] = useState<any[]>([]);

  const isAdmin = currentRole === "Super Admin" || currentRole === "School Administrator" || currentRole === "Principal" || currentRole === "Account Officer";

  const loadSchools = async () => {
    try {
      const res = await fetch("/api/superadmin/schools");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSchoolsList(data.data);
      }
    } catch (e) {
      // Ignored
    }
  };

  // Fetch real subscription status from server
  useEffect(() => {
    fetch("/api/subscription/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus((prev) => ({
            ...prev,
            currentPlanId:
              data.currentPlan === "Starter School"
                ? "plan-starter"
                : data.currentPlan === "Multi-Campus Group"
                ? "plan-multi-campus"
                : "plan-standard-enterprise",
            planName: data.currentPlan || prev.planName,
            status: data.subscriptionStatus as any,
            billingCycle: data.billingCycle || "Term",
            amountPaid: data.amountPaid ? `₦${Number(data.amountPaid).toLocaleString()}` : prev.amountPaid,
            lastPaymentDate: data.paidAt
              ? new Date(data.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : prev.lastPaymentDate,
            renewalDate: data.subscriptionExpiresAt
              ? new Date(data.subscriptionExpiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : prev.renewalDate,
          }));
        }
      })
      .catch(() => {});

    loadSchools();
  }, []);

  const toggleSchoolSub = async (schoolId: string, targetActive: boolean) => {
    try {
      const res = await fetch(`/api/superadmin/schools/${schoolId}/toggle-subscription`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: targetActive }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentSuccessMsg(data.message);
        setTimeout(() => setPaymentSuccessMsg(""), 4000);
        loadSchools();
      }
    } catch (err) {
      alert("Failed to update school subscription status.");
    }
  };

  const handleDownloadReceipt = (inv: any) => {
    const receiptContent = `=====================================================
OFFICIAL SUBSCRIPTION PAYMENT RECEIPT
LivingstoneEDU Model School - LivingstoneEDU SaaS
=====================================================
Receipt Number: ${inv.id}
Billing Date:   ${inv.date}
Plan Name:      ${inv.plan}
Amount Paid:    ${inv.amount}
Payment Method: ${inv.gateway}
Payment Status: ${inv.status}
=====================================================
Issued by LivingstoneEDU School Management Platform
Customer Support: billing@livingstone.edu.ng
Official Electronic Transaction Record.
=====================================================`;

    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt-${inv.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSelectUpgrade = (plan: SubscriptionPlan) => {
    if (!isAdmin) {
      alert("Only School Administrators, Principals, or Account Officers can modify subscription plans.");
      return;
    }
    setSelectedUpgradePlan(plan);
  };

  const handleConfirmPayment = async () => {
    if (!selectedUpgradePlan) return;
    setIsProcessingPayment(true);
    const newAmount =
      billingCycle === "Annual"
        ? Number(selectedUpgradePlan?.priceAnnual) || 0
        : Number(selectedUpgradePlan?.priceTerm) || Number(selectedUpgradePlan?.priceMonthly) || 0;

    try {
      const res = await fetch("/api/subscription/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: "SCH-101",
          planId: selectedUpgradePlan.id,
          planName: selectedUpgradePlan.name,
          cycle: billingCycle,
          amount: newAmount,
          gateway: paymentGateway,
        }),
      });
      const data = await res.json();
      setIsProcessingPayment(false);

      if (data.success && data.receipt) {
        setStatus((prev) => ({
          ...prev,
          currentPlanId: selectedUpgradePlan.id,
          planName: selectedUpgradePlan.name,
          billingCycle,
          maxStudentsLimit: selectedUpgradePlan.studentLimit,
          maxAiCreditsLimit: selectedUpgradePlan.aiCreditsMonthly,
          status: "Active",
          amountPaid: `₦${newAmount.toLocaleString()}`,
          lastPaymentDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          renewalDate: data.receipt.validUntil
            ? new Date(data.receipt.validUntil).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : prev.renewalDate,
        }));
        setInvoices((prev) => [
          {
            id: data.receipt.receiptNo,
            date: data.receipt.paymentDate,
            amount: `₦${newAmount.toLocaleString()}`,
            plan: `${selectedUpgradePlan.name} (${billingCycle})`,
            status: "Paid",
            gateway: data.receipt.gateway,
          },
          ...prev,
        ]);
        setPaymentSuccessMsg(`✓ Real payment confirmed! Upgraded to ${selectedUpgradePlan.name} via ${data.receipt.gateway}.`);
        setSelectedUpgradePlan(null);
        setTimeout(() => setPaymentSuccessMsg(""), 5000);
      } else {
        alert(data.message || "Payment could not be processed.");
      }
    } catch (err) {
      setIsProcessingPayment(false);
      alert("Payment processing network error. Please try again.");
    }
  };

  const handleTopupCredits = () => {
    setStatus((prev) => ({
      ...prev,
      maxAiCreditsLimit: Number(prev.maxAiCreditsLimit) + Number(creditsToBuy),
    }));
    setTopupCreditsModalOpen(false);
    setPaymentSuccessMsg(`Added +${creditsToBuy.toLocaleString()} AI Generation Credits to your school account!`);
    setTimeout(() => setPaymentSuccessMsg(""), 4000);
  };

  const handleToggleAutoRenew = () => {
    if (!isAdmin) return;
    setStatus((prev) => ({ ...prev, autoRenew: !prev.autoRenew }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                School Subscription & License Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage SaaS platform licenses, AI credits, student limits, and payment billing for LIVINGSTONEEDU.
              </p>
            </div>
          </div>
        </div>

        {paymentSuccessMsg && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{paymentSuccessMsg}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            License: {status.status}
          </span>
        </div>
      </div>

      {/* Current Plan Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Plan Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 opacity-10">
            <ShieldCheck className="w-48 h-48" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-indigo-500/30 border border-indigo-400/30 text-indigo-200">
                Active Plan
              </span>
              <span className="text-xs font-bold text-indigo-300">
                {status.billingCycle} Billing
              </span>
            </div>

            <h3 className="text-xl font-black mt-3">{status.planName}</h3>
            <p className="text-xs text-slate-300 mt-1">
              Registered Institution: <strong>Livingstone International Academy</strong>
            </p>

            <div className="mt-4 pt-4 border-t border-indigo-800/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Next Renewal Date:</span>
                <strong className="text-white">{status.renewalDate}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Last Payment Amount:</span>
                <strong className="text-emerald-400">₦{status.amountPaid.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-indigo-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <RefreshCw className={`w-4 h-4 ${status.autoRenew ? "text-emerald-400" : "text-amber-400"}`} />
              <span className="text-slate-300">Auto-Renewal:</span>
              <strong className={status.autoRenew ? "text-emerald-400" : "text-amber-400"}>
                {status.autoRenew ? "Enabled" : "Disabled"}
              </strong>
            </div>
            <button
              onClick={handleToggleAutoRenew}
              disabled={!isAdmin}
              className="text-[11px] font-bold text-indigo-300 hover:text-white underline disabled:opacity-50"
            >
              Toggle
            </button>
          </div>
        </div>

        {/* Student Enrollment Capacity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-500" />
                <span>Student Capacity</span>
              </h3>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {Math.round((Number(status.activeStudentsUsed) / (Number(status.maxStudentsLimit) || 1)) * 100)}% Used
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {status.activeStudentsUsed.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                / {status.maxStudentsLimit.toLocaleString()} Seats
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 mt-3 overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${(Number(status.activeStudentsUsed) / (Number(status.maxStudentsLimit) || 1)) * 100}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Covers all Grade 1–6, JSS 1–3, and SS 1–3 active student profiles.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] text-slate-500 font-medium">
              Need capacity for over {status.maxStudentsLimit.toLocaleString()} students? Upgrade to Enterprise plan below.
            </p>
          </div>
        </div>

        {/* AI Credits Usage */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Generation Credits</span>
              </h3>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {Math.round((Number(status.aiCreditsUsed) / (Number(status.maxAiCreditsLimit) || 1)) * 100)}% Used
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {status.aiCreditsUsed.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                / {status.maxAiCreditsLimit.toLocaleString()} Credits
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 mt-3 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${(Number(status.aiCreditsUsed) / (Number(status.maxAiCreditsLimit) || 1)) * 100}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Used for AI Lesson Note Generation, Exam Creation & Assistant Copilot.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setTopupCreditsModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Top-Up Extra AI Credits</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans & Pricing Upgrade Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Available Subscription Plans & Upgrades
            </h2>
            <p className="text-xs text-slate-500">
              Select the optimal SaaS license plan tailored for Livingstone International Academy.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto">
            <button
              onClick={() => setBillingCycle("Term")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                billingCycle === "Term"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Per Term Billing
            </button>
            <button
              onClick={() => setBillingCycle("Annual")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === "Annual"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <span>Annual (3 Terms)</span>
            </button>
            <button
              onClick={() => setBillingCycle("Monthly")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                billingCycle === "Monthly"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = status.currentPlanId === plan.id;
            
            let displayPrice = "";
            let displayUnit = "";
            if (billingCycle === "Term") {
              displayPrice = typeof plan.priceTerm === "number" ? `₦${plan.priceTerm.toLocaleString()}` : String(plan.priceTerm || "Custom pricing");
              displayUnit = typeof plan.priceTerm === "number" ? "/ term" : "";
            } else if (billingCycle === "Annual") {
              displayPrice = typeof plan.priceAnnual === "number" && plan.priceAnnual > 0 ? `₦${plan.priceAnnual.toLocaleString()}` : "Custom pricing";
              displayUnit = typeof plan.priceAnnual === "number" && plan.priceAnnual > 0 ? "/ year" : "";
            } else {
              displayPrice = typeof plan.priceMonthly === "number" && plan.priceMonthly > 0 ? `₦${plan.priceMonthly.toLocaleString()}` : "Custom pricing";
              displayUnit = typeof plan.priceMonthly === "number" && plan.priceMonthly > 0 ? "/ month" : "";
            }

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                  plan.isPopular
                    ? "border-indigo-500 dark:border-indigo-600 shadow-lg ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                        plan.isPopular
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {plan.badge}
                    </span>
                    {isCurrent && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Current Plan
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {displayPrice}
                    </span>
                    {displayUnit && (
                      <span className="text-xs text-slate-500 font-semibold">
                        {displayUnit}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
                    {plan.subtitle}
                  </p>

                  <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Included Features:
                    </p>
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleSelectUpgrade(plan)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isCurrent
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                        : plan.isPopular
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30"
                        : "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90"
                    }`}
                  >
                    <span>{isCurrent ? "Active Plan" : "Select & Upgrade"}</span>
                    {!isCurrent && <ArrowUpRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing & Invoice History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              <span>Subscription Payment Receipts & History</span>
            </h3>
            <p className="text-xs text-slate-500">
              Official invoices for audit and financial accounting.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Plan Description</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    {inv.id}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {inv.date}
                  </td>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">
                    {inv.plan}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {inv.gateway}
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                    {inv.amount}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDownloadReceipt(inv)}
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 inline-flex items-center gap-1 text-[11px] active:scale-95 transition-transform"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TENANT SCHOOLS ACTIVATION / DEACTIVATION CONTROL PANEL */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Registered Schools Subscription Activation / Deactivation Directory
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Super Admin & School Administrators can explicitly activate or deactivate any registered institution's subscription status.
            </p>
          </div>
          <button
            type="button"
            onClick={loadSchools}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Schools</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[10px] bg-slate-50 dark:bg-slate-800/50">
                <th className="py-3 px-4">School Institution</th>
                <th className="py-3 px-4">Administrator Email</th>
                <th className="py-3 px-4">Current Plan</th>
                <th className="py-3 px-4">Subscription Status</th>
                <th className="py-3 px-4 text-right">Activate / Deactivate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {schoolsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 dark:text-slate-400 font-medium">
                    No registered schools found. Newly registered tenant schools will appear here automatically.
                  </td>
                </tr>
              ) : (
                schoolsList.map((sch) => {
                  const isActive = sch.subscriptionStatus === "Active" || sch.isPaid || sch.status === "Active";
                  return (
                    <tr key={sch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building className="w-4 h-4 text-indigo-500" />
                        <span>{sch.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {sch.adminEmail || sch.email || "admin@school.edu.ng"}
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                        {sch.plan || "Standard Enterprise"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            isActive
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800"
                          }`}
                        >
                          {isActive ? "Active Subscription" : "Deactivated / Expired"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isActive ? (
                          <button
                            type="button"
                            onClick={() => toggleSchoolSub(sch.id, false)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs cursor-pointer transition-all inline-flex items-center gap-1 active:scale-95"
                          >
                            <span>Deactivate Subscription</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleSchoolSub(sch.id, true)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 cursor-pointer transition-all inline-flex items-center gap-1 active:scale-95"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Activate Subscription</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {selectedUpgradePlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest">
                  Secure Checkout
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Confirm Subscription Upgrade
                </h3>
              </div>
              <button
                onClick={() => setSelectedUpgradePlan(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Selected Plan:</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">{selectedUpgradePlan?.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Billing Interval:</span>
                <span className="font-bold text-slate-900 dark:text-white">{billingCycle}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Student Record Capacity:</span>
                <span className="font-bold text-slate-900 dark:text-white">{(selectedUpgradePlan?.studentLimit || 0).toLocaleString()} Seats</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Monthly AI Credits:</span>
                <span className="font-bold text-slate-900 dark:text-white">{(selectedUpgradePlan?.aiCreditsMonthly || 0).toLocaleString()} Credits</span>
              </div>
              <div className="pt-2 border-t border-indigo-200 dark:border-indigo-800 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Total Amount Payable:</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  ₦{((billingCycle === "Annual" ? selectedUpgradePlan?.priceAnnual : selectedUpgradePlan?.priceMonthly) || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentGateway("Paystack")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    paymentGateway === "Paystack"
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300"
                      : "border-slate-200 dark:border-slate-800 text-slate-600"
                  }`}
                >
                  Paystack (Card/USSD)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentGateway("Flutterwave")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    paymentGateway === "Flutterwave"
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300"
                      : "border-slate-200 dark:border-slate-800 text-slate-600"
                  }`}
                >
                  Flutterwave
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentGateway("BankTransfer")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    paymentGateway === "BankTransfer"
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300"
                      : "border-slate-200 dark:border-slate-800 text-slate-600"
                  }`}
                >
                  Direct Bank Transfer
                </button>
              </div>
            </div>

            {paymentGateway === "BankTransfer" && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1 font-mono">
                <p className="font-bold text-slate-900 dark:text-white">Bank: Zenith Bank PLC</p>
                <p>Account Name: Livingstone Education SaaS Ltd</p>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold">Account No: 1014889201</p>
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSelectedUpgradePlan(null)}
                className="w-1/3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment}
                className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Gateway...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirm & Pay ₦{(billingCycle === "Annual" ? selectedUpgradePlan.priceAnnual : selectedUpgradePlan.priceMonthly).toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP-UP AI CREDITS MODAL */}
      {topupCreditsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Top-Up AI Generation Credits
              </h3>
              <button onClick={() => setTopupCreditsModalOpen(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Additional AI Credits Package
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { amount: 1000, price: "₦15,000" },
                  { amount: 2000, price: "₦25,000" },
                  { amount: 5000, price: "₦50,000" },
                ].map((item) => (
                  <button
                    key={item.amount}
                    onClick={() => setCreditsToBuy(item.amount)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      creditsToBuy === item.amount
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/50 ring-2 ring-amber-500/20"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="text-xs font-black text-slate-900 dark:text-white">+{item.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 font-bold mt-1">{item.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleTopupCredits}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Confirm & Add +{creditsToBuy.toLocaleString()} Credits</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
