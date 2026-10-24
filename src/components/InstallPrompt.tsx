import React, { useEffect, useState } from "react";
import { X, Download, Smartphone, MonitorSmartphone } from "lucide-react";

const DISMISS_KEY = "livingstone_install_dismissed_at";
const REQUEST_DELAY_MS = 4000;
const RE_DISMISS_MS = 7 * 24 * 60 * 60 * 1000; // don't ask again for a week after dismissal

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as any).standalone === true;

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

const isAndroid = () => /Android/i.test(navigator.userAgent);

const wasRecentlyDismissed = () => {
  try {
    const ts = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Date.now() - ts < RE_DISMISS_MS;
  } catch {
    return false;
  }
};

export const InstallPrompt: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [iosMode, setIosMode] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) return;

    const show = () => {
      // iOS has no beforeinstallprompt, so fall back to manual instructions.
      if (isIOS()) {
        setIosMode(true);
        setTimeout(() => setVisible(true), REQUEST_DELAY_MS);
        return;
      }
      if ((window as any).__livingstoneInstallPrompt) {
        setTimeout(() => setVisible(true), REQUEST_DELAY_MS);
      }
    };

    window.addEventListener("app:installable", show);
    // If the prompt is already captured (e.g. re-visits), show anyway.
    const t = setTimeout(() => {
      if ((window as any).__livingstoneInstallPrompt && !isStandalone()) {
        setVisible(true);
      }
    }, REQUEST_DELAY_MS + 1000);

    return () => {
      window.removeEventListener("app:installable", show);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const onInstalled = () => setVisible(false);
    window.addEventListener("app:installed", onInstalled);
    return () => window.removeEventListener("app:installed", onInstalled);
  }, []);

  if (!visible) return null;

  const dismiss = (remember = true) => {
    if (remember) {
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
    }
    setVisible(false);
  };

  const handleInstall = async () => {
    const prompt = (window as any).__livingstoneInstallPrompt;
    if (prompt) {
      try {
        prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice && choice.outcome === "accepted") {
          dismiss(false);
        }
      } catch {
        dismiss(true);
      }
      return;
    }
    dismiss(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] max-w-sm w-[calc(100vw-2rem)] sm:w-96 animate-in slide-in-from-bottom-4 fade-in">
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-indigo-900/20 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25">
                {iosMode ? <Smartphone className="w-5 h-5" /> : <MonitorSmartphone className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  Install LIVINGSTONEEDU
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-bold uppercase tracking-wide">
                    App
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  School management on the go — works offline, opens like an app.
                </p>
              </div>
            </div>
            <button
              onClick={() => dismiss(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
              One-tap access from your home screen
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
              Offline lesson notes, exams & report cards
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
              Full-screen experience with no browser chrome
            </li>
          </ul>

          {iosMode ? (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong className="font-bold">On iPhone/iPad:</strong> tap the{" "}
              <span className="font-bold">Share</span> button in Safari, then choose{" "}
              <span className="font-bold">"Add to Home Screen"</span>.
            </div>
          ) : null}

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              {iosMode ? "Show Me How" : "Install App"}
            </button>
            <button
              onClick={() => dismiss(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};