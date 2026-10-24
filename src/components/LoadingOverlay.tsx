import React from "react";
import { Sparkles, ShieldCheck, BookOpen, CheckCircle2, School, Globe } from "lucide-react";
import { Logo } from "./Logo";

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
  subMessage?: string;
  indeterminate?: boolean;
}

const verificationBadges = [
  { icon: ShieldCheck, label: "NERDC Curriculum Verified" },
  { icon: BookOpen, label: "WAEC & NERDC Aligned" },
  { icon: School, label: "Nigerian Curriculum Compliant" },
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  message = "Initializing LIVINGSTONEEDU...",
  subMessage = "Securing your session and verifying NERDC curriculum alignment",
  indeterminate = false,
}) => {
  const [forceHide, setForceHide] = React.useState(false);
  const [showSkip, setShowSkip] = React.useState(false);

  React.useEffect(() => {
    if (show) {
      setForceHide(false);
      setShowSkip(false);
      const skipTimer = setTimeout(() => setShowSkip(true), 700);
      const hardTimer = setTimeout(() => setForceHide(true), 1500);
      return () => {
        clearTimeout(skipTimer);
        clearTimeout(hardTimer);
      };
    }
  }, [show]);

  if (!show || forceHide) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden bg-slate-950 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white animate-fade-in">
      {/* Ambient glowing background effects */}
      <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-indigo-600/30 blur-3xl animate-glow-pulse" />
      <div className="absolute top-1/3 -right-32 w-[24rem] h-[24rem] rounded-full bg-teal-500/20 blur-3xl animate-glow-pulse-delayed" />
      <div className="absolute -bottom-40 left-1/4 w-[26rem] h-[26rem] rounded-full bg-purple-600/25 blur-3xl animate-glow-pulse" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Animated school badge */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-indigo-500/40 blur-2xl animate-pulse" />
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-400/60 animate-spin-slow" />
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 shadow-2xl shadow-indigo-600/50 flex items-center justify-center animate-float">
          <Logo variant="icon" size="md" />
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-amber-300 animate-twinkle" />
          <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-teal-300 animate-twinkle-delayed" />
        </div>
      </div>

      <div className="mb-6">
        <Logo variant="full" size="lg" textColor="text-white" />
      </div>
      <p className="text-sm text-slate-300 mb-8 max-w-md text-center px-6">{message}</p>

      {/* Progress indicator bar */}
      <div className="w-64 md:w-80 h-2 rounded-full bg-slate-800 overflow-hidden mb-6">
        <div
          className={
            indeterminate
              ? "h-full w-full rounded-full bg-gradient-to-r from-indigo-500 via-teal-400 to-indigo-500 animate-shimmer"
              : "h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-400 animate-loading-progress"
          }
        />
      </div>
      {!indeterminate && <p className="text-xs text-slate-400 mb-8">{subMessage}</p>}

      {/* NERDC curriculum verification badges */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-lg px-6">
        {verificationBadges.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300"
          >
            <Icon className="w-3.5 h-3.5 text-emerald-400" />
            {label}
            <CheckCircle2 className="w-3 h-3 text-teal-400" />
          </div>
        ))}
      </div>

      {showSkip && (
        <button
          type="button"
          onClick={() => setForceHide(true)}
          className="mt-6 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer shadow-lg"
        >
          Enter Workspace Now &rarr;
        </button>
      )}
    </div>
  );
};
