import React, { useState } from "react";
import { UserRole } from "../types";
import { Logo } from "./Logo";
import {
  GraduationCap,
  Sun,
  Moon,
  Bell,
  Sparkles,
  ChevronDown,
  CloudSun,
  Search,
  UserCheck,
  ShieldCheck,
  Building,
  School,
  BookOpen,
  User,
  CreditCard,
  FileCheck,
  Library,
  PhoneCall,
  LogOut,
  Settings,
  Menu,
} from "lucide-react";
import { FCMPushAlertManager } from "./FCMPushAlertManager";

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAIAssistant: () => void;
  onSelectTab: (tab: any) => void;
  notificationsCount: number;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  onToggleMobileMenu?: () => void;
}

const ALL_ROLES: { role: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
  { role: "Super Admin", label: "Super Admin (HQ)", icon: <ShieldCheck className="w-4 h-4" />, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  { role: "School Administrator", label: "School Admin", icon: <Building className="w-4 h-4" />, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { role: "Principal", label: "Principal", icon: <School className="w-4 h-4" />, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" },
  { role: "Vice Principal", label: "Vice Principal", icon: <School className="w-4 h-4" />, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300" },
  { role: "Teacher", label: "Teacher / Faculty", icon: <BookOpen className="w-4 h-4" />, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  { role: "Class Teacher", label: "Class Teacher", icon: <UserCheck className="w-4 h-4" />, color: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300" },
  { role: "Subject Teacher", label: "Subject Specialist", icon: <BookOpen className="w-4 h-4" />, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { role: "Student", label: "Student Portal", icon: <User className="w-4 h-4" />, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  { role: "Account Officer", label: "Finance Officer", icon: <CreditCard className="w-4 h-4" />, color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" },
  { role: "Exam Officer", label: "Exam Officer", icon: <FileCheck className="w-4 h-4" />, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  { role: "Librarian", label: "Librarian", icon: <Library className="w-4 h-4" />, color: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  { role: "Receptionist", label: "Front Desk", icon: <PhoneCall className="w-4 h-4" />, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
];

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  isDark,
  onToggleTheme,
  onOpenAIAssistant,
  onSelectTab,
  notificationsCount,
  isAuthenticated = false,
  onLogout,
  onToggleMobileMenu,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const activeRoleObj = ALL_ROLES.find((r) => r.role === currentRole) || ALL_ROLES[1];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-3 md:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors w-full">
      {/* Left: Mobile Menu Toggle, Brand Identity & Search */}
      <div className="flex items-center gap-2.5 md:gap-4">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Toggle Menu"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        )}

        <Logo variant="full" size="md" />

        {/* Global Search */}
        <div className="relative hidden lg:block w-64 xl:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, teachers, AI notes, exams..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Controls: Role Switcher, AI Copilot, Weather, Notifications, Theme */}
      <div className="flex items-center gap-2 md:gap-3">
        <FCMPushAlertManager compact />
        {/* Weather Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
          <CloudSun className="w-4 h-4 text-amber-500" />
          <span>28°C Lagos</span>
        </div>

        {/* Floating AI Copilot Trigger */}
        <button
          onClick={onOpenAIAssistant}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm shadow-indigo-500/20 active:scale-95 transition-all"
          title="Open AI Assistant (Generate Lesson Notes, Exams, Timetable, Letters)"
        >
          <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Active Authenticated Role Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold ${activeRoleObj.color}`}>
          {activeRoleObj.icon}
          <span className="hidden md:inline">{activeRoleObj.label}</span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => onSelectTab("communication")}
          className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Notifications & Announcements"
        >
          <Bell className="w-4 h-4" />
          {notificationsCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-bounce">
              {notificationsCount}
            </span>
          )}
        </button>

        {/* Settings Quick Access (Admin Only) */}
        {(currentRole === "Super Admin" || currentRole === "School Administrator" || currentRole === "Principal" || currentRole === "Admin") && (
          <button
            onClick={() => onSelectTab("settings")}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Open Settings & System Preferences"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* Auth / Sign Out Button */}
        {isAuthenticated ? (
          <button
            onClick={() => {
              if (onLogout) onLogout();
              else onSelectTab("auth");
            }}
            className="px-2.5 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Sign out of current session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectTab("auth")}
            className="px-2.5 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Open Authentication System Page"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portal Login</span>
          </button>
        )}

        {/* Dark/Light Mode Switcher */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
