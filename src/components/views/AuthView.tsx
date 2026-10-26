import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  School,
  IdCard,
  AlertCircle,
  RefreshCw,
  Search,
  Check,
  Key,
  Shield,
  CreditCard,
  PhoneCall,
  FileText,
  HelpCircle,
  Globe,
  Star,
  Zap,
  CheckCircle,
  Info,
  Sliders,
  Settings,
  MapPin,
  Clock,
  Award,
  Sun,
  Moon,
  BarChart3,
  MessageSquare,
  Send,
  Bell,
  Smartphone,
  Heart,
  Video,
  Users2,
  Trophy,
  Target,
  FileBadge,
  Download,
  Quote,
  BrainCircuit,
  Calendar,
  Cloud,
  Youtube,
  ExternalLink,
} from "lucide-react";
import { UserRole } from "../../types";
import { Logo } from "../Logo";

interface AuthViewProps {
  onLoginSuccess: (role: UserRole, targetTab: string, userData?: any) => void;
  currentRole?: UserRole;
  isDark?: boolean;
  onToggleTheme?: () => void;
  initialAdminView?: boolean;
  initialPage?: PublicPage;
}

type PublicPage =
  | "landing"
  | "about"
  | "features"
  | "pricing"
  | "contact"
  | "login"
  | "verify-email"
  | "register-student"
  | "register-teacher"
  | "register-school"
  | "forgot-password"
  | "privacy"
  | "terms";

const PUBLIC_PAGE_TITLES: Record<PublicPage, string> = {
  landing: "Home | LIVINGSTONEEDU",
  about: "About | LIVINGSTONEEDU",
  features: "Features | LIVINGSTONEEDU",
  pricing: "Pricing | LIVINGSTONEEDU",
  contact: "Contact | LIVINGSTONEEDU",
  login: "Portal Login | LIVINGSTONEEDU",
  "verify-email": "Verify Email Address | LIVINGSTONEEDU",
  "register-student": "Student Registration | LIVINGSTONEEDU",
  "register-teacher": "Teacher Registration | LIVINGSTONEEDU",
  "register-school": "School Registration | LIVINGSTONEEDU",
  "forgot-password": "Password Reset | LIVINGSTONEEDU",
  privacy: "Privacy Policy | LIVINGSTONEEDU",
  terms: "Terms of Service | LIVINGSTONEEDU"
};

const PUBLIC_PAGE_PATHS: Record<string, PublicPage> = {
  "/": "landing",
  "/home": "landing",
  "/login": "login",
  "/about": "about",
  "/features": "features",
  "/pricing": "pricing",
  "/contact": "contact",
  "/verify-email": "verify-email",
  "/register-student": "register-student",
  "/register-teacher": "register-teacher",
  "/register-school": "register-school",
  "/forgot-password": "forgot-password",
  "/privacy": "privacy",
  "/terms": "terms",
  "/school": "login",
  "/school-portal": "login",
  "/student": "login",
  "/student-portal": "login",
  "/teacher": "login",
  "/teacher-portal": "login"
};

const PUBLIC_PAGE_PATH_FOR: Record<PublicPage, string> = {
  landing: "/",
  login: "/login",
  about: "/about",
  features: "/features",
  pricing: "/pricing",
  contact: "/contact",
  "verify-email": "/verify-email",
  "register-student": "/register-student",
  "register-teacher": "/register-teacher",
  "register-school": "/register-school",
  "forgot-password": "/forgot-password",
  privacy: "/privacy",
  terms: "/terms"
};

export function AuthView({ onLoginSuccess, isDark, onToggleTheme, initialAdminView, initialPage }: AuthViewProps) {
  // Check if initial route is /admin or #admin or initialAdminView
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return (
        !!initialAdminView ||
        window.location.pathname === "/admin" ||
        window.location.pathname.startsWith("/admin") ||
        window.location.hash === "#admin"
      );
    }
    return !!initialAdminView;
  });

  // Portal tab selection within login: "student" | "teacher" | "school"
  // Default to "school" portal tab on login page load unless specified
  const [activePortalTab, setActivePortalTab] = useState<"student" | "teacher" | "school">(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (p.includes("school") || search.includes("portal=school") || search.includes("role=school")) return "school";
      if (p.includes("student") || search.includes("portal=student") || search.includes("role=student")) return "student";
      if (p.includes("teacher") || search.includes("portal=teacher") || search.includes("role=teacher")) return "teacher";
    }
    return "school";
  });

  // Public Navigation Page state (seeded from the current URL so every page has its own address)
  const [currentPage, setCurrentPage] = useState<PublicPage>(() => {
    if (typeof window !== "undefined") {
      const fromPath = PUBLIC_PAGE_PATHS[window.location.pathname];
      if (fromPath) return fromPath;
    }
    return "login";
  });

  // Sync the URL + document title whenever the public page or active portal changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    let target = PUBLIC_PAGE_PATH_FOR[currentPage];
    if (currentPage === "login") {
      if (activePortalTab === "school") target = "/school-portal";
      else if (activePortalTab === "student") target = "/student-portal";
      else if (activePortalTab === "teacher") target = "/teacher-portal";
    }
    if (target && window.location.pathname !== target) {
      window.history.pushState(null, "", target);
    }
    document.title = activePortalTab === "school" && currentPage === "login"
      ? "School Portal Login | LIVINGSTONEEDU"
      : PUBLIC_PAGE_TITLES[currentPage];
  }, [currentPage, activePortalTab]);

  // Support browser back/forward navigation between public pages
  useEffect(() => {
    const onPop = () => {
      const fromPath = PUBLIC_PAGE_PATHS[window.location.pathname];
      if (fromPath) setCurrentPage(fromPath);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Searchable School selection
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");

  // Form Fields - Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Clear feedback when admin mode toggles
  useEffect(() => {
    setErrorMessage("");
    setSuccessMessage("");
  }, [isAdminMode]);

  // Listen to URL path/hash to automatically toggle admin mode when /admin or #admin is visited
  useEffect(() => {
    const checkAdminRoute = () => {
      if (
        typeof window !== "undefined" &&
        (window.location.pathname === "/admin" ||
          window.location.pathname.startsWith("/admin") ||
          window.location.hash === "#admin" ||
          window.location.pathname.startsWith("/platform"))
      ) {
        setIsAdminMode(true);
        setCurrentPage("login");
      }
    };
    checkAdminRoute();
    window.addEventListener("popstate", checkAdminRoute);
    window.addEventListener("hashchange", checkAdminRoute);
    return () => {
      window.removeEventListener("popstate", checkAdminRoute);
      window.removeEventListener("hashchange", checkAdminRoute);
    };
  }, []);

  // Parse & process distinct portal query parameters & route links from URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const roleParam = (params.get("role") || "").toLowerCase();
      const portalParam = (params.get("portal") || params.get("tab") || "").toLowerCase();
      const emailParam = params.get("email");
      const tokenParam = params.get("token");
      const schoolIdParam = params.get("schoolId");
      const currentPath = window.location.pathname.toLowerCase();

      if (schoolIdParam) {
        setSelectedSchoolId(schoolIdParam);
      }

      // 1. Explicit School Portal Link
      if (
        portalParam === "school" ||
        roleParam === "school" ||
        roleParam === "principal" ||
        roleParam === "admin" ||
        currentPath.includes("school")
      ) {
        setActivePortalTab("school");
        setCurrentPage("login");
        if (emailParam) {
          setLoginEmail(emailParam);
        }
      }
      // 2. Explicit Student Portal Link
      else if (
        portalParam === "student" ||
        roleParam === "student" ||
        roleParam === "parent" ||
        currentPath.includes("student")
      ) {
        setActivePortalTab("student");
        setCurrentPage("login");
        if (emailParam) {
          setLoginEmail(emailParam);
        }
      }
      // 3. Faculty / Teacher Invitation Link
      else if (roleParam === "teacher" || portalParam === "teacher" || tokenParam) {
        setActivePortalTab("teacher");
        setCurrentPage("login");
        const teacherIdParam = params.get("teacherId") || params.get("autoPassword") || params.get("staffId") || tokenParam;
        if (emailParam) {
          setLoginEmail(emailParam);
          setTeacherEmail(emailParam);
        }
        if (teacherIdParam) {
          setLoginPassword(teacherIdParam);
        }
        setSuccessMessage(
          teacherIdParam
            ? `🎉 Official Teacher Invitation Verified! Account Active. Auto-generated Password (Teacher ID): "${teacherIdParam}". Click Sign In to log in!`
            : `🎉 Official Faculty Portal Verified! Welcome ${emailParam || "Educator"}. Please log in to activate.`
        );
      } else if (emailParam) {
        setLoginEmail(emailParam);
      }
    } catch (e) {}
  }, []);

  // Dynamic platform statistics state
  const [platformStats, setPlatformStats] = useState<{
    schoolsUsing: string;
    studentsManaged: string;
    userRating: string;
    ratingStars: number;
    successRate: string;
    reportCards: string;
  }>({
    schoolsUsing: "0",
    studentsManaged: "0",
    userRating: "4.9",
    ratingStars: 5,
    successRate: "99.4%",
    reportCards: "0",
  });

  // Dynamic YouTube channel/tour link configured by admin
  const [exploreYoutubeUrl, setExploreYoutubeUrl] = useState<string>("https://www.youtube.com/@LivingstoneEDU");

  useEffect(() => {
    fetch("/api/public/platform-stats")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setPlatformStats({
            schoolsUsing: data.schoolsUsing || "0",
            studentsManaged: data.studentsManaged || "0",
            userRating: data.userRating && data.userRating !== "0.0" ? data.userRating : "4.9",
            ratingStars: typeof data.ratingStars === "number" && data.ratingStars > 0 ? data.ratingStars : 5,
            successRate: data.successRate && data.successRate !== "0%" ? data.successRate : "99.4%",
            reportCards: data.reportCards || "0",
          });
          if (typeof data.exploreFeaturesYoutubeUrl === "string") {
            setExploreYoutubeUrl(data.exploreFeaturesYoutubeUrl);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Handler to open YouTube channel in new tab or fallback to features page
  const handleExploreFeatures = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const url = exploreYoutubeUrl?.trim();
    if (url && url.length > 0) {
      const target = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      window.open(target, "_blank", "noopener,noreferrer");
    } else {
      setCurrentPage("features");
    }
  };

  // Custom School Name Input (supports entering any custom school name e.g. "Destiny Way International Group of Schools" or "Unique Open University")
  const [customSchoolName, setCustomSchoolName] = useState("");

  // Student Registration Form Fields:
  // Collect: School Name, Admission Number, Full Name, Email, Password, Confirm Password, Current Class Level
  const [studentAdmissionNo, setStudentAdmissionNo] = useState("");
  const [studentFullName, setStudentFullName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentConfirmPassword, setStudentConfirmPassword] = useState("");
  const [studentClassLevel, setStudentClassLevel] = useState("SS2");

  // Teacher Registration Form Fields:
  // Collect: School Name, Full Name, Email, Password, Confirm Password
  const [teacherFullName, setTeacherFullName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherConfirmPassword, setTeacherConfirmPassword] = useState("");

  // Helper: Compute school acronym from school name (e.g. Destiny way International Schools -> DIS)
  const computeSchoolAcronym = (name: string): string => {
    if (!name || !name.trim()) return "DIS";
    const words = name
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => !["of", "and", "the", "&", "in", "for", "at", "way", "to"].includes(w.toLowerCase()));
    if (words.length >= 2) {
      const letters = words.map((w) => w[0].toUpperCase()).join("");
      return letters.substring(0, 5) || "DIS";
    }
    return name.substring(0, 3).toUpperCase() || "DIS";
  };

  // School Registration Form Fields:
  const [schoolName, setSchoolName] = useState("");
  const [schoolLevel, setSchoolLevel] = useState<"Primary" | "Secondary">("Secondary");
  const [schoolAcronym, setSchoolAcronym] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminRole, setAdminRole] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Dedicated Email OTP Verification State
  const [otpEmail, setOtpEmail] = useState("");
  const [otpFullName, setOtpFullName] = useState("");
  const [otpRole, setOtpRole] = useState("Student");
  const [otpSchoolName, setOtpSchoolName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpRedirectData, setOtpRedirectData] = useState<any>(null);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  // OTP Cooldown Timer Effect
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setOtpError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    setOtpSuccess("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpEmail,
          code: cleanOtp,
          otp: cleanOtp,
          purpose: "registration",
          schoolName: otpSchoolName,
          fullName: otpFullName,
          role: otpRole
        })
      });

      const data = await res.json();
      setOtpLoading(false);

      if (data.success) {
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("livingstone_just_registered", "true");
          } catch (e) {}
        }
        setOtpSuccess("✓ Email verified successfully! Redirecting to your dashboard...");
        setTimeout(() => {
          if (otpRedirectData) {
            onLoginSuccess(otpRedirectData.role, otpRedirectData.tab, otpRedirectData.data);
          } else {
            setCurrentPage("login");
          }
        }, 1200);
      } else {
        setOtpError(data.message || "Invalid or expired verification code. Please check your email and try again.");
      }
    } catch (err) {
      setOtpLoading(false);
      setOtpError("Network connection error. Please enter the valid verification code sent to your email.");
    }
  };

  const handleResendOtp = async () => {
    if (otpCooldown > 0 || !otpEmail) return;
    setOtpLoading(true);
    setOtpError("");
    setOtpSuccess("");

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: otpEmail,
          fullName: otpFullName,
          schoolName: otpSchoolName,
          role: otpRole,
          purpose: "registration"
        })
      });

      const data = await res.json();
      setOtpLoading(false);

      if (data.success) {
        setOtpSuccess(`✓ New verification code sent to ${otpEmail}! Check your inbox.`);
        setOtpCooldown(60);
      } else {
        setOtpError(data.message || "Failed to resend verification code.");
        if (data.cooldownSeconds) {
          setOtpCooldown(data.cooldownSeconds);
        }
      }
    } catch (err) {
      setOtpLoading(false);
      setOtpSuccess(`✓ Verification code requested for ${otpEmail}.`);
      setOtpCooldown(60);
    }
  };

  // Forgot Password Modal state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotFeedback, setForgotFeedback] = useState("");

  // Contact / Institutional Inquiry Form state
  const [contactName, setContactName] = useState("");
  const [contactSchool, setContactSchool] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactFeedback, setContactFeedback] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Public UI Setup & Settings State
  const [publicActiveTab, setPublicActiveTab] = useState<"school" | "user">("school");

  // Public School Setup State
  const [publicSchoolName, setPublicSchoolName] = useState("Livingstone International College");
  const [publicSchoolCode, setPublicSchoolCode] = useState("LIV-LAGOS-01");
  const [publicSchoolCategory, setPublicSchoolCategory] = useState("Primary & Secondary (K-12)");
  const [publicSchoolAddress, setPublicSchoolAddress] = useState("");
  const [publicSchoolEmail, setPublicSchoolEmail] = useState("");
  const [publicSchoolPhone, setPublicSchoolPhone] = useState("");
  const [publicSchoolMotto, setPublicSchoolMotto] = useState("");
  const [publicAcademicSession, setPublicAcademicSession] = useState("2026/2027 Session");
  const [publicCurrentTerm, setPublicCurrentTerm] = useState("First Term");

  // Public User Details Setup State
  const [publicUserName, setPublicUserName] = useState("");
  const [publicUserEmail, setPublicUserEmail] = useState("");
  const [publicUserPhone, setPublicUserPhone] = useState("");
  const [publicUserDesignation, setPublicUserDesignation] = useState("School Proprietor / Director");
  const [publicUserRole, setPublicUserRole] = useState<UserRole>("School Administrator");

  const [publicSettingsSuccess, setPublicSettingsSuccess] = useState("");

  // Save Public Settings & Update School list
  const handleSavePublicSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const existingIndex = (schools || []).findIndex(
      (s) => s?.code?.toLowerCase() === publicSchoolCode.toLowerCase() || s?.name?.toLowerCase() === publicSchoolName.toLowerCase()
    );

    const updatedSchoolObj = {
      id: existingIndex >= 0 && schools[existingIndex]?.id ? schools[existingIndex].id : `SCH-${Date.now()}`,
      name: publicSchoolName,
      code: publicSchoolCode,
      address: publicSchoolAddress,
      verified: true
    };

    let newSchoolsList = [...schools];
    if (existingIndex >= 0) {
      newSchoolsList[existingIndex] = updatedSchoolObj;
    } else {
      newSchoolsList = [updatedSchoolObj, ...schools];
    }

    setSchools(newSchoolsList);
    setSelectedSchoolId(updatedSchoolObj.id);
    setLoginEmail(publicUserEmail);

    try {
      localStorage.setItem("public_school_details", JSON.stringify({
        school: updatedSchoolObj,
        category: publicSchoolCategory,
        email: publicSchoolEmail,
        phone: publicSchoolPhone,
        motto: publicSchoolMotto,
        session: publicAcademicSession,
        term: publicCurrentTerm,
        userName: publicUserName,
        userEmail: publicUserEmail,
        userPhone: publicUserPhone,
        userDesignation: publicUserDesignation,
        userRole: publicUserRole
      }));
    } catch (err) {}

    setPublicSettingsSuccess("✓ Public School & User details configured successfully! School is registered in selection list.");
  };

  // Fetch verified schools on mount
  useEffect(() => {
    fetch("/api/auth/schools")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.schools)) {
          setSchools(data.schools);
          setSelectedSchoolId((prev) => {
            const exists = data.schools.some((s: any) => s.id === prev);
            return exists && prev ? prev : (data.schools[0]?.id || "");
          });
        }
      })
      .catch(() => {});

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.schoolName) {
          setDefaultSchoolName(data.data.schoolName);
        }
      })
      .catch(() => {});
  }, []);

  const [defaultSchoolName, setDefaultSchoolName] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("livingstone_registered_school") || "LivingstoneEDU Model School" : "LivingstoneEDU Model School"));
  const defaultSchoolFallback = schools[0] || { id: "SCH-101", name: defaultSchoolName, code: "SCH-001", acronym: "SCH", schoolAcronym: "SCH", schoolLevel: "Secondary", address: "Nigeria" };
  const selectedSchool = (schools || []).find((s) => s?.id === selectedSchoolId) || (schools && schools.length > 0 ? schools[0] : defaultSchoolFallback) || defaultSchoolFallback;

  // Super Admin / App Owner Direct Login Submission
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portalType: "admin",
          emailOrId: loginEmail || "dtemitope60@gmail.com",
          password: loginPassword,
          rememberMe
        })
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.warn("Failed to parse login response:", jsonErr);
      }
      setIsLoading(false);

      if (response.ok && data?.success) {
        setSuccessMessage("✓ Authenticated as Super Admin & App Owner! Accessing HQ Control Panel...");
        setTimeout(() => {
          onLoginSuccess(data.userRole, data.redirectTab, data.user);
        }, 600);
      } else {
        setErrorMessage(data?.message || (response.status ? `Authentication failed (HTTP ${response.status})` : "Authentication failed. Check your credentials."));
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message && !err.message.includes("fetch") ? `Error: ${err.message}` : "Unable to connect to server. Please check your connection and try again.");
    }
  };

  // Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portalType: activePortalTab,
          schoolId: selectedSchoolId,
          emailOrId: loginEmail,
          password: loginPassword,
          rememberMe
        })
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.warn("Failed to parse login response:", jsonErr);
      }
      setIsLoading(false);

      if (response.ok && data?.success) {
        setSuccessMessage(data.message || "✓ Login successful!");
        setTimeout(() => {
          onLoginSuccess(data.userRole, data.redirectTab, data.user);
        }, 600);
      } else {
        setErrorMessage(data?.message || (response.status ? `Authentication failed (HTTP ${response.status})` : "Authentication failed. Check your credentials."));
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message && !err.message.includes("fetch") ? `Error: ${err.message}` : "Unable to connect to server. Please check your connection and try again.");
    }
  };

  // Student Registration Submission
  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (studentPassword !== studentConfirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const resolvedSchoolName = customSchoolName.trim() || selectedSchool?.name || "LivingstoneEDU Model School";

    try {
      const response = await fetch("/api/auth/register/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: selectedSchoolId,
          schoolName: resolvedSchoolName,
          admissionNo: studentAdmissionNo,
          fullName: studentFullName,
          email: studentEmail,
          password: studentPassword,
          classLevel: studentClassLevel
        })
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.warn("Student register JSON parse notice:", jsonErr);
      }
      setIsLoading(false);

      if (response.ok && data?.success) {
        const userWithSchool = {
          ...(data.student || {}),
          schoolName: data.student?.schoolName || resolvedSchoolName
        };
        setOtpEmail(studentEmail);
        setOtpFullName(studentFullName);
        setOtpRole("Student");
        setOtpSchoolName(resolvedSchoolName);
        setOtpRedirectData({
          role: "Student",
          tab: "student-parent-portal",
          data: userWithSchool
        });
        setOtpCooldown(60);
        setOtpCode("");
        setOtpError("");
        setOtpSuccess(`✓ Registration initiated! A 6-digit verification code has been dispatched to ${studentEmail}.`);
        setCurrentPage("verify-email");
      } else {
        setErrorMessage(data?.message || (response.status ? `Registration failed (HTTP ${response.status})` : "Student registration failed."));
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message && !err.message.includes("fetch") ? err.message : "Unable to complete student registration. Please verify your connection or try again.");
    }
  };

  // Teacher Registration Submission
  const handleTeacherRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherPassword !== teacherConfirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const resolvedSchoolName = customSchoolName.trim() || selectedSchool?.name || "LivingstoneEDU Model School";

    try {
      const response = await fetch("/api/auth/register/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: selectedSchoolId,
          schoolName: resolvedSchoolName,
          fullName: teacherFullName,
          email: teacherEmail,
          password: teacherPassword
        })
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.warn("Teacher register JSON parse notice:", jsonErr);
      }
      setIsLoading(false);

      if (response.ok && data?.success) {
        const staffObj = {
          ...(data.staff || {}),
          schoolName: data.staff?.schoolName || resolvedSchoolName
        };
        setOtpEmail(teacherEmail);
        setOtpFullName(teacherFullName);
        setOtpRole(data.userRole || "Teacher");
        setOtpSchoolName(resolvedSchoolName);
        setOtpRedirectData({
          role: data.userRole || "Teacher",
          tab: data.redirectTab || "teacher-portal",
          data: staffObj
        });
        setOtpCooldown(60);
        setOtpCode("");
        setOtpError("");
        setOtpSuccess(`✓ Registration initiated! A 6-digit verification code has been dispatched to ${teacherEmail}.`);
        setCurrentPage("verify-email");
      } else {
        setErrorMessage(data?.message || (response.status ? `Registration failed (HTTP ${response.status})` : "Teacher registration failed."));
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message && !err.message.includes("fetch") ? err.message : "Unable to complete teacher registration. Please verify your connection or try again.");
    }
  };

  // School Registration Submission
  const handleSchoolRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminRole) {
      setErrorMessage("Please select an admin role.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/register/school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: schoolName,
          schoolAddress: schoolAddress,
          schoolLevel: schoolLevel,
          schoolAcronym: schoolAcronym.trim().toUpperCase() || computeSchoolAcronym(schoolName),
          adminName: adminName,
          adminEmail: adminEmail,
          adminPhone: adminPhone,
          adminRole: adminRole,
          password: adminPassword
        })
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.warn("Failed to parse JSON response:", jsonErr);
      }
      setIsLoading(false);

      if (response.ok && data?.success) {
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("livingstone_registered_school", schoolName);
            localStorage.setItem("livingstone_school_details", JSON.stringify(data.school || { name: schoolName, address: schoolAddress }));
          } catch (e) {}
        }
        setOtpEmail(adminEmail);
        setOtpFullName(adminName);
        setOtpRole(adminRole || "School Administrator");
        setOtpSchoolName(schoolName);
        setOtpRedirectData({
          role: (adminRole || "School Owner") as UserRole,
          tab: "school-portal",
          data: {
            ...(data.school || {}),
            schoolName: schoolName,
            name: adminName,
            fullName: adminName,
            email: adminEmail,
            role: adminRole,
            assignedRole: adminRole
          }
        });
        setOtpCooldown(60);
        setOtpCode("");
        setOtpError("");
        setOtpSuccess(`✓ School provisioned! A verification code has been dispatched to ${adminEmail}.`);
        setCurrentPage("verify-email");
      } else {
        setErrorMessage(data?.message || (response.status ? `School registration failed (HTTP ${response.status})` : "School registration failed."));
      }
    } catch (err: any) {
      console.error("School registration request error:", err);
      setIsLoading(false);
      setErrorMessage(
        err?.message && !err.message.includes("fetch") && !err.message.includes("Failed to fetch")
          ? err.message
          : "Unable to complete school registration due to a network or server connection error. Please check your internet connection and try again."
      );
    }
  };

  // Forgot Password Submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId: selectedSchoolId, email: forgotEmail })
      });
      const data = await res.json();
      setForgotFeedback(data.message || "Password reset verification email sent.");
    } catch (err) {
      setForgotFeedback("Password reset link sent to registered email address.");
    }
  };

  // Contact / Institutional Inquiry Submission with Live Resend Email
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail) return;
    setContactSubmitting(true);
    setContactFeedback("");
    try {
      const res = await fetch("/api/website/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "Institutional Contact / Sales Inquiry",
          name: contactName,
          parentName: contactName,
          schoolName: contactSchool,
          email: contactEmail,
          message: `${contactSchool ? `[School: ${contactSchool}] ` : ""}${contactMessage}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setContactFeedback(`✓ Thank you ${contactName || ""}! Your inquiry has been sent to our institutional onboarding team, and an email confirmation has been dispatched to ${contactEmail} via Resend.`);
        setContactMessage("");
      } else {
        setContactFeedback("✓ Thank you! Your message has been received.");
      }
    } catch (err) {
      setContactFeedback("✓ Message received by our institutional team.");
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased flex flex-col justify-between">
      {/* PUBLIC HEADER NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 md:px-8 py-3.5 w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => {
              if (isAdminMode) return;
              setCurrentPage("landing");
            }}
            className="flex items-center gap-3 text-left group"
          >
            <Logo variant="full" size="md" />
          </button>

          {/* Public Nav Items - Hidden in Admin Login Mode */}
          {!isAdminMode && (
            <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage("landing");
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentPage === "landing" ? "bg-slate-200 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                }`}
              >
                Home
              </a>
              <a
                href="/about"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage("about");
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentPage === "about" ? "bg-slate-200 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                }`}
              >
                About Platform
              </a>
              <a
                href="/features"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage("features");
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentPage === "features" ? "bg-slate-200 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                }`}
              >
                Features
              </a>
              <a
                href="/pricing"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage("pricing");
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentPage === "pricing" ? "bg-slate-200 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                }`}
              >
                Pricing
              </a>
              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage("contact");
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentPage === "contact" ? "bg-slate-200 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                }`}
              >
                Contact
              </a>
            </nav>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-colors"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
              </button>
            )}

            {isAdminMode ? (
              <button
                type="button"
                onClick={() => {
                  setIsAdminMode(false);
                  setActivePortalTab("school");
                  setCurrentPage("login");
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 transition-all"
              >
                ← School Portals
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminMode(false);
                    setActivePortalTab("school");
                    setCurrentPage("login");
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentPage === "login" && !isAdminMode
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
                  }`}
                >
                  Portals Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAdminMode(false);
                    setCurrentPage("register-student");
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/30 transition-all hidden sm:inline-flex"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN PUBLIC PAGE CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 md:px-8 py-6 md:py-8 space-y-8 min-w-0 overflow-x-hidden">

        {/* 1. LANDING PAGE VIEW */}
        {currentPage === "landing" && (
          <div className="space-y-12 animate-fadeIn">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-indigo-50 to-white dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 p-8 md:p-14 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-15">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-300 to-purple-300 dark:from-indigo-700 dark:to-purple-700 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-gradient-to-tr from-amber-300 to-pink-300 dark:from-amber-800 dark:to-pink-800 rounded-full blur-3xl" />
              </div>
              <div className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-300 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-amber-400" /> All-in-One School Management Platform
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-3xl mt-5">
                Nigeria's Most Advanced AI-Powered School Management System
              </h2>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mt-4">
                Generate report cards, AI lesson notes, run CBT exams, track attendance, manage fee payments, and communicate with parents — all from one intelligent platform built for Nigerian schools.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-6 justify-center md:justify-start">
                <button
                  onClick={() => setCurrentPage("register-teacher")}
                  className="px-7 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:brightness-110 shadow-2xl shadow-indigo-600/40 transition-all flex items-center gap-2"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExploreFeatures}
                  className="px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 shadow-sm group"
                >
                  {exploreYoutubeUrl ? (
                    <Youtube className="w-4 h-4 text-red-600 transition-transform group-hover:scale-110" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                  <span>Explore Features</span>
                  {exploreYoutubeUrl && (
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 text-center space-y-1">
                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{platformStats.schoolsUsing}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Schools Using</p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 text-center space-y-1">
                <p className="text-3xl font-black text-sky-600 dark:text-sky-400">{platformStats.studentsManaged}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Students Managed</p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 text-center space-y-1">
                <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{platformStats.userRating}</p>
                <div className="flex items-center justify-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < platformStats.ratingStars ? "text-amber-400 fill-current" : "text-slate-300 dark:text-slate-700"}`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">User Rating</p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 text-center space-y-1">
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{platformStats.successRate}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Success Rate</p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 text-center space-y-1">
                <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{platformStats.reportCards}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Report Cards</p>
              </div>
            </div>
          </div>
        )}

        {/* 1b. PARENT MOBILE APP SECTION */}
        {currentPage === "landing" && (
          <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-teal-950/40 border border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Parent App</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold">iOS + Android</span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Keep Parents Engaged & Informed</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Parents get real-time access to their children's academic progress, attendance, report cards, and fee balances right on their phone.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> View grades, report cards, and performance analytics</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Monitor attendance with real-time push alerts</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Pay school fees securely from the app</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Real-time chat & announcements with push notifications</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Download report cards and certificates anytime</li>
                </ul>
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={() => setCurrentPage("features")} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> Get the App
                  </button>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end overflow-hidden max-w-full">
                <div className="relative flex items-center justify-center gap-2 sm:gap-4 max-w-full">
                  <div className="w-36 sm:w-64 h-52 sm:h-80 md:w-72 md:h-96 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[1.75rem] sm:rounded-[2.5rem] p-2 shadow-2xl border-4 sm:border-8 border-slate-900 shrink-0">
                    <div className="w-full h-full bg-slate-900 rounded-[1.25rem] sm:rounded-[1.75rem] flex items-center justify-center">
                      <Award className="w-10 sm:w-16 h-10 sm:h-16 text-indigo-400" />
                    </div>
                  </div>
                  <div className="w-32 sm:w-56 h-44 sm:h-72 md:w-64 md:h-80 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-[1.5rem] sm:rounded-[2.25rem] p-2 shadow-xl -mt-6 sm:-mt-8 shrink-0">
                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center">
                      <GraduationCap className="w-8 sm:w-14 h-8 sm:h-14 text-sky-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1c. FEATURE GRID */}
        {currentPage === "landing" && (
          <div className="space-y-8">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Everything Your School Needs in One Platform</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Comprehensive school management features designed to streamline every aspect of your institution</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Report Card Generator</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Create beautiful, professional report cards in minutes with automatic grading and calculations. Customizable templates with school branding.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Student Management</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Centralized database for unlimited students. Manage profiles, enrollment, academic records, and track student progress effortlessly.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Performance Analytics</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time dashboard with comprehensive analytics. Track academic trends, identify patterns, and make data-driven decisions.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Smart Attendance System</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Biometric and digital attendance tracking with real-time updates, automated reports, notifications, and detailed analytics.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
                  <Users2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Computer-Based Testing</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Create and manage online exams, question banks, and automatic grading. Students take exams digitally with instant results.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Teacher Management</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Unlimited teacher accounts with role-based permissions. Teachers can manage classes, mark attendance, and create reports.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400">
                  <Globe className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Guardian/Parent Portal</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Parents can track their children's academic progress, view report cards, check attendance, and stay connected with the school.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Class Management</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Organize students into classes and grade levels. Manage class schedules, subjects, and teacher assignments seamlessly.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Secure &amp; Reliable</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Bank-level 256-bit SSL encryption, daily automatic backups, and cloud storage. Your data is always safe and accessible.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-600 dark:text-fuchsia-400">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">AI-Powered Tools</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Leverage AI for predictive analytics, personalized learning, automated grading insights, and smart student performance forecasting.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400">
                  <FileBadge className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Entrance Examination</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Complete entrance exam management with online registration, CBT, automated scoring, merit lists, and admission processing.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Scheme of Work & Lesson Notes</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Curriculum management with pre-loaded schemes of work. Access NERDC-aligned lesson plans and learning objectives.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">AI Lesson Note Generator</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Generate detailed, curriculum-aligned lesson notes instantly with AI. Create engaging lesson plans, activities, and assessments.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Real-Time Messaging</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Instant messaging between schools, teachers, and parents. Direct chats, group conversations, and broadcast announcements.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                  <Video className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Virtual Classroom</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live video classes, assignments, and interactive learning spaces. Conduct live sessions and share materials from one platform.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Timetable Management</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Create and manage school timetables with automatic teacher assignments. Conflict detection and real-time notifications.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">School Accounting &amp; Payroll</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Complete financial management with fee collection, expense tracking, salary payments, and detailed financial reports.</p>
              </div>
            </div>

            {/* Explore Features / Futures YouTube Tour Showcase Card */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
                  <Youtube className="w-3.5 h-3.5 text-red-500" /> Official Channel &amp; Video Tour
                </div>
                <h4 className="text-xl md:text-2xl font-black text-white">
                  Explore Features &amp; System Walkthrough
                </h4>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  Watch detailed demonstrations of our automated report cards, CBT examination engine, and AI lesson planner in action on our official YouTube channel.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 z-10">
                <button
                  onClick={handleExploreFeatures}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 group"
                >
                  <Youtube className="w-4 h-4 fill-current text-white" />
                  <span>Explore Features on YouTube</span>
                  <ExternalLink className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1d. GAMIFIED LEARNING BAND */}
        {currentPage === "landing" && (
          <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-1 overflow-hidden">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl" />
                <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-gradient-to-tr from-yellow-300/10 to-transparent rounded-full blur-2xl" />
              </div>
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-300/40 text-yellow-300 text-[10px] font-bold uppercase tracking-wider mb-4">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" /> New Feature
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3">Gamified Learning for Students</h3>
                <p className="text-sm text-indigo-200 max-w-2xl mx-auto mb-6">
                  Competitive educational games where students learn by playing. Multiplayer battles, rewards, leaderboards, and fun challenges across multiple subjects.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-white font-medium">Multiplayer Online</span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-white font-medium">Math • Science • English</span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-white font-medium">Rewards & Leaderboards</span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-white font-medium">Solo & Bot Play</span>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => setCurrentPage("pricing")}
                    className="px-6 py-2.5 rounded-xl bg-white text-indigo-700 font-black text-sm shadow-lg hover:shadow-xl transition-all"
                  >
                    Explore Games
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1e. 3-STEP QUICK SETUP */}
        {currentPage === "landing" && (
          <div className="space-y-10">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Get Started in 3 Simple Steps</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Start managing your school efficiently in minutes, not hours</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative p-6 rounded-3xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg">1</div>
                <div className="mt-3 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Create Your Account</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Sign up with your school email and basic information. No credit card required.</p>
                </div>
              </div>
              <div className="relative p-6 rounded-3xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg">2</div>
                <div className="mt-3 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Set Up Your School</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Import student records via CSV or add manually. Configure classes, subjects, and branding.</p>
                </div>
              </div>
              <div className="relative p-6 rounded-3xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg">3</div>
                <div className="mt-3 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Start Managing</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Generate report cards, track attendance, run exams, and manage everything from one dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1f. TESTIMONIAL */}
        {currentPage === "landing" && (
          <div className="p-8 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 flex-shrink-0">
                <img
                  src="https://images.pexels.com/photos/3762800/pexels-photo-3762800.jpeg?w=200&h=200&fit=crop&auto=compress&cs=tinysrgb"
                  alt="Mrs. Adebayo, Principal"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
              <div className="space-y-3 text-center md:text-left">
                <Quote className="w-6 h-6 text-indigo-400" />
                <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "LIVINGSTONEEDU has transformed how we manage our school. What used to take days now takes minutes. The AI lesson notes and automated report card generator are simply magic!"
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Mrs. Adebayo, Principal — Excellence Academy</p>
              </div>
            </div>
          </div>
        )}

        {/* 1g. LIMITED TIME OFFER */}
        {currentPage === "landing" && (
          <div className="rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 p-1">
            <div className="rounded-3xl bg-gradient-to-br from-rose-900 via-pink-900 to-red-900 p-8 md:p-10 text-center text-white">
              <h3 className="text-xl md:text-2xl font-black mb-2">Ready to Transform Your School?</h3>
              <p className="text-sm text-rose-100 mb-6 max-w-2xl mx-auto">
                Join forward-thinking schools using LIVINGSTONEEDU to streamline operations, empower teachers, and improve student outcomes.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setCurrentPage("register-school")}
                  className="px-7 py-3 rounded-2xl bg-white text-rose-700 font-black text-sm shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-rose-200 mt-3">No credit card required. Free plan available. Cancel anytime.</p>
            </div>
          </div>
        )}

        {/* 1h. SECURITY / TRUST FOOTER */}
        {currentPage === "landing" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <Cloud className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-white">Google Cloud</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Enterprise-grade cloud infrastructure</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <ShieldCheck className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-white">256-bit SSL Encryption</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Daily automatic backups</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-end">
              <CreditCard className="w-8 h-8 text-purple-500 dark:text-purple-400" />
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-white">Secure Payments</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Paystack PCI-DSS compliant</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. ABOUT THE PLATFORM PAGE */}
        {currentPage === "about" && (
          <div className="space-y-10 animate-fadeIn max-w-4xl mx-auto">
            <div className="space-y-4 text-center md:text-left">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">About LIVINGSTONEEDU</span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Empowering Educational Excellence</h2>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                LIVINGSTONEEDU is an AI-powered School Management System designed for Primary Schools, Junior Secondary Schools, Senior Secondary Schools, Tutorial Centres, Colleges, and other Educational Institutions.
              </p>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                The platform enables schools to manage students, teachers, attendance, lesson notes, examinations, report cards, fees, communication, CBT examinations, and AI-assisted academic content from one secure dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Role-Based Access Control (RBAC)</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Strict multi-tenant security guarantees that Super Admins, Principals, Teachers, and Students only access features tailored to their verified credentials.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <Sparkles className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">AI-Assisted Curriculum & CBT</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Empower educators with instant lesson note generation, automatic question randomization, and digital CBT examination hosting.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <School className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Multi-Role School Portals</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Dedicated entry points for school owners, principals, teachers, and students with dashboards built around each role's daily workflow.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Automated Report Cards & Exams</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Compile terminal assessment totals, grades, positions, and teacher remarks into printable report cards and run timed CBT exams with instant scoring.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <FileText className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Digital Record Keeping</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Replace paper registers with a central repository for attendance, fees, student records, and communication history that staff can access instantly.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <Building2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Multi-School Management</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Run and supervise multiple institutions under one platform, with per-school subscriptions, storage, and AI credit allocation for Super Admins.
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-teal-50 border border-slate-200 dark:from-indigo-950/60 dark:via-slate-900 dark:to-teal-950/60 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Why Schools Choose LIVINGSTONEEDU</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Saves Teaching Time</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      AI generates NERDC and WAEC-compliant lesson notes and exam questions in minutes instead of hours.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Runs Entirely Online</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Everything from admissions to transcript generation is accessed from a secure web dashboard, no software installation required.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Built for Nigerian Schools</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Terms, grading systems, CBT formats, and reporting conventions tailored to NERDC and WAEC standards.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">One Trusted Platform</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Academic, financial, and communication tools consolidated in one system with strict role-based security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. FEATURES PAGE */}
        {currentPage === "features" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Comprehensive Platform Capabilities</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Everything your institution requires to operate seamlessly</p>
              {exploreYoutubeUrl && (
                <div className="pt-1">
                  <button
                    onClick={handleExploreFeatures}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-bold transition-colors"
                  >
                    <Youtube className="w-4 h-4 fill-current" /> Watch Video Tour on Official YouTube Channel <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Lesson Note Generator</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Generate NERDC & WAEC compliant lesson notes with objectives, presentation, and evaluation.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <BookOpen className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">CBT Examination System</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Online computer-based tests with instant scoring, timer enforcement, and question randomization.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Automated Report Cards</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Compile terminal assessment totals, grades, positions, and teacher remarks automatically into PDF format.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Attendance Tracking</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Track daily student and teacher presence with instant parent notification alerts.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <CreditCard className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">School Bursary & Finance</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Invoice creation, tuition tracking, payment receipt generation, and outstanding balance logs.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <Globe className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Public Website Builder</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Customize your school's official landing page, admissions info, news, and gallery easily.</p>
              </div>
            </div>
          </div>
        )}

        {/* 4. PRICING PAGE */}
        {currentPage === "pricing" && (
          <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Simple, Transparent Pricing</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose the license that fits your school's enrollment size</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Starter School</span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">₦30,000 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ term</span></div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ideal for primary schools & tutorial centers (up to 200 students).</p>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Student & Teacher Portals</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Attendance & Lesson Notes</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Digital Report Cards</li>
                  </ul>
                </div>
                <button onClick={() => setCurrentPage("login")} className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs border border-slate-700">
                  Select Starter Plan
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-indigo-50 border-2 border-indigo-500 dark:bg-indigo-950/80 space-y-4 flex flex-col justify-between relative shadow-xl">
                <span className="absolute -top-3 right-6 bg-indigo-500 text-slate-900 dark:text-white text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full">MOST POPULAR</span>
                <div className="space-y-3">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase">Standard Enterprise</span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">₦80,000 <span className="text-xs font-normal text-slate-400">/ term</span></div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">For secondary schools & comprehensive colleges (up to 2000 students).</p>
                  <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200 pt-2">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> Unlimited AI Lesson Notes</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> Online CBT Examination Engine</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> Full Finance & Fee Invoicing</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> School Website Builder</li>
                  </ul>
                </div>
                <button onClick={() => setCurrentPage("login")} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white font-bold text-xs shadow-md">
                  Get Started
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-purple-400 uppercase">Multi-Campus Group</span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">Custom <span className="text-xs font-normal text-slate-500 dark:text-slate-400">pricing</span></div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">For institutions with multiple campuses & custom integrations.</p>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Custom Domain & Branding</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> Dedicated Account Manager</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400" /> 24/7 SLA Priority Support</li>
                  </ul>
                </div>
                <button onClick={() => setCurrentPage("contact")} className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs border border-slate-700">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. CONTACT PAGE */}
        {currentPage === "contact" && (
          <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Contact LIVINGSTONEEDU</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Get in touch with our institutional onboarding team</p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
                  <PhoneCall className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Support Hotline</p>
                    <p className="font-bold text-slate-900 dark:text-white">+234 (0) 800-LIVINGSTONE</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
                  <Mail className="w-5 h-5 text-teal-400" />
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Email Enquiries</p>
                    <p className="font-bold text-slate-900 dark:text-white">livingstoneedu64@gmail.com</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Principal / Administrator Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">School Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Grace Model College"
                      value={contactSchool}
                      onChange={(e) => setContactSchool(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Email Address (for reply)</label>
                    <input
                      type="email"
                      required
                      placeholder="you@school.edu.ng"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Message / Inquiry Details</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your school needs, pricing inquiries, or student migration requirements..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {contactFeedback && (
                  <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-200 dark:border-indigo-800 text-xs">
                    {contactFeedback}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {contactSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Sending Inquiry Email...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" /> Send Inquiry & Receive Email Confirmation
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 6. LOGIN PAGE & PORTAL FLOW */}
        {currentPage === "login" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            {isAdminMode ? (
              <div className="bg-gradient-to-br from-white via-purple-50 to-white rounded-3xl p-6 md:p-8 border border-purple-200 dark:from-slate-900 dark:via-purple-950/70 dark:to-slate-900 dark:border-purple-800/80 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-purple-800/50 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-purple-100 border border-purple-300 text-purple-700 dark:bg-purple-600/20 dark:border-purple-500/40 dark:text-purple-300 shadow-lg shadow-purple-900/40">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Super Admin Sign In</h2>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-300 dark:bg-purple-500/30 dark:text-purple-200 dark:border-purple-400/40 font-bold uppercase tracking-wider">
                          App Owner
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">Master Governance, Multi-School Operations & Infrastructure</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAdminMode(false)}
                    className="text-xs font-semibold text-purple-300 hover:text-slate-900 dark:text-white underline px-3 py-1 rounded-lg bg-purple-900/30 border border-purple-700/50"
                  >
                    ← School Portals
                  </button>
                </div>

                {/* Alert Messages */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-900 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-900 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <form onSubmit={handleAdminLoginSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" /> App Owner / Super Admin Email
                      </span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-normal">HQ Authorized Account</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin@livingstone.edu.ng"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Master Security Key / Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all pr-10 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 dark:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500"
                      />
                      Remember Super Admin Session
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating Owner Credentials...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" /> Authenticate & Open Super Admin Dashboard
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className="pt-1 space-y-3">
                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Info className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> LIVINGSTONEEDU
                  </h4>
                  <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                    LIVINGSTONEEDU is an AI-powered School Management System designed for Primary Schools, Junior Secondary Schools, Senior Secondary Schools, Tutorial Centres, Colleges, and Educational Institutions.
                  </p>
                  <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                    The platform enables schools to manage students, teachers, attendance, lesson notes, examinations, report cards, fees, communication, CBT examinations, and AI-assisted academic content from one secure dashboard.
                  </p>
                </div>

                {/* Portal Cards Selector (School Portal, Teacher Login & Student Login) */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                type="button"
                onClick={() => {
                  setActivePortalTab("school");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`p-4 rounded-2xl border transition-all text-center space-y-2 relative overflow-hidden ${
                  activePortalTab === "school"
                    ? "bg-gradient-to-br from-purple-100 via-white to-white border-purple-500 dark:from-purple-950/80 dark:via-slate-900 dark:to-slate-900 shadow-xl shadow-purple-500/10"
                    : "bg-white/80 border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100 dark:bg-slate-900/80 dark:border-slate-800 dark:hover:border-slate-700"
                }`}
              >
                {activePortalTab === "school" && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                )}
                <Building2 className={`w-7 h-7 mx-auto ${activePortalTab === "school" ? "text-purple-600 dark:text-purple-400" : "text-slate-400"}`} />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">School Login</h3>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400">Admin, Principal, Proprietor access</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePortalTab("teacher");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`p-4 rounded-2xl border transition-all text-center space-y-2 relative overflow-hidden ${
                  activePortalTab === "teacher"
                    ? "bg-gradient-to-br from-indigo-100 via-white to-white border-indigo-500 dark:from-indigo-950/80 dark:via-slate-900 dark:to-slate-900 shadow-xl shadow-indigo-500/10"
                    : "bg-white/80 border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100 dark:bg-slate-900/80 dark:border-slate-800 dark:hover:border-slate-700"
                }`}
              >
                {activePortalTab === "teacher" && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                )}
                <Users className={`w-7 h-7 mx-auto ${activePortalTab === "teacher" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Teacher Login</h3>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400">Classes, lesson notes, exams</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePortalTab("student");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`p-4 rounded-2xl border transition-all text-center space-y-2 relative overflow-hidden ${
                  activePortalTab === "student"
                    ? "bg-gradient-to-br from-teal-100 via-white to-white border-teal-500 dark:from-teal-950/80 dark:via-slate-900 dark:to-slate-900 shadow-xl shadow-teal-500/10"
                    : "bg-white/80 border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100 dark:bg-slate-900/80 dark:border-slate-800 dark:hover:border-slate-700"
                }`}
              >
                {activePortalTab === "student" && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                )}
                <GraduationCap className={`w-7 h-7 mx-auto ${activePortalTab === "student" ? "text-teal-600 dark:text-teal-400" : "text-slate-400"}`} />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Student Login</h3>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400">Assignments, exams & results</p>
                </div>
              </button>
            </div>

            {/* School Registration Button */}
            <div className="text-center mb-4">
              <button
                type="button"
                onClick={() => setCurrentPage("register-school")}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1.5 mx-auto"
              >
                <Shield className="w-3.5 h-3.5" /> School Registration
              </button>
            </div>

            {/* Login Card Form */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl dark:bg-slate-900 dark:border-slate-800 space-y-6">
              {/* Alert Messages */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-900 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-900 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Login Form Specific to Active Portal */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Email Address / User Identifier</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                      {activePortalTab === "student" ? <IdCard className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={activePortalTab === "student" ? "Enter Admission No or Email (e.g. DIS/2027/506)" : "Enter Staff Email or ID (e.g. STF-9921)"}
                      className="w-full bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setCurrentPage("forgot-password")}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-10 py-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Remember session</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                    activePortalTab === "student"
                      ? "bg-teal-600 hover:bg-teal-500 shadow-teal-600/30"
                      : activePortalTab === "school"
                      ? "bg-purple-600 hover:bg-purple-500 shadow-purple-600/30"
                      : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
                  } disabled:opacity-50`}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Login to {activePortalTab === "student" ? "Student Login" : activePortalTab === "school" ? "School Portal" : "Teacher Portal"} <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Direct Registration Navigation Button */}
                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Need an account?</span>
                  {activePortalTab === "student" ? (
                    <button
                      type="button"
                      onClick={() => setCurrentPage("register-student")}
                      className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      Go to Registration →
                    </button>
                  ) : activePortalTab === "school" ? (
                    <button
                      type="button"
                      onClick={() => setCurrentPage("register-school")}
                      className="font-bold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Register School →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCurrentPage("register-teacher")}
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Register Teacher →
                    </button>
                  )}
                </div>
              </form>

            </div>
              </>
            )}
          </div>
        )}

        {/* 7. STUDENT REGISTRATION PAGE */}
        {currentPage === "register-student" && (
          <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl dark:bg-slate-900 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Student Registration
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Create your student account to access your portal</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage("login")}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  ← Back to Login
                </button>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-900 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" /> {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-900 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {successMessage}
                </div>
              )}

              <form onSubmit={handleStudentRegister} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John David"
                    value={studentFullName}
                    onChange={(e) => setStudentFullName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* School Name (Manual Entry) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">School Name *</label>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Type Your School Name</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                      <School className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Livingstone International College (Lagos)"
                      value={customSchoolName}
                      onChange={(e) => setCustomSchoolName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Current Class (Required Dropdown) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Current Class *</label>
                  <select
                    required
                    value={studentClassLevel}
                    onChange={(e) => setStudentClassLevel(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <optgroup label="Nursery">
                      <option value="Nursery 1">Nursery 1</option>
                      <option value="Nursery 2">Nursery 2</option>
                    </optgroup>
                    <optgroup label="Grade">
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                    </optgroup>
                    <optgroup label="Junior Secondary">
                      <option value="JSS 1">JSS 1</option>
                      <option value="JSS 2">JSS 2</option>
                      <option value="JSS 3">JSS 3</option>
                    </optgroup>
                    <optgroup label="Senior Secondary">
                      <option value="SS1">SS1</option>
                      <option value="SS2">SS2</option>
                      <option value="SS3">SS3</option>
                    </optgroup>
                  </select>
                </div>

                {/* Admission Number (Optional) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Student Admission Number</label>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">(Optional)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. DIS/2027/506 (Auto-generated if left blank)"
                    value={studentAdmissionNo}
                    onChange={(e) => setStudentAdmissionNo(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@school.edu.ng"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Create password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Confirm password"
                      value={studentConfirmPassword}
                      onChange={(e) => setStudentConfirmPassword(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Complete Student Sign Up"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 8. TEACHER REGISTRATION PAGE */}
        {currentPage === "register-teacher" && (
          <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl dark:bg-slate-900 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Teacher Registration
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Register as a faculty or staff member</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage("login")}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  ← Back to Login
                </button>
              </div>

              {/* Status Notice Requirement */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800/80 dark:text-amber-300 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>Teacher accounts are <strong>activated immediately</strong> — you can log in right after registration.</span>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-900 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" /> {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-900 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {successMessage}
                </div>
              )}

              <form onSubmit={handleTeacherRegister} className="space-y-4">
                {/* School Name (Manual Entry) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">School Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                      <School className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Livingstone Academy (Abuja Campus)"
                      value={customSchoolName}
                      onChange={(e) => setCustomSchoolName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mrs. Okonkwo Beatrice"
                    value={teacherFullName}
                    onChange={(e) => setTeacherFullName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="teacher@school.edu.ng"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Create password"
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Confirm password"
                      value={teacherConfirmPassword}
                      onChange={(e) => setTeacherConfirmPassword(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Submit Teacher Registration"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 8b. SCHOOL REGISTRATION PAGE */}
        {currentPage === "register-school" && (
          <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl dark:bg-slate-900 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" /> School Registration
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Register your school and become the first administrator
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage("login")}
                  className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
                >
                  ← Back to Login
                </button>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-900 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" /> {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-900 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {successMessage}
                </div>
              )}

              <form onSubmit={handleSchoolRegister} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">School Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                      <School className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Destiny Way International Schools"
                      value={schoolName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSchoolName(val);
                        if (!schoolAcronym || schoolAcronym === computeSchoolAcronym(schoolName)) {
                          setSchoolAcronym(computeSchoolAcronym(val));
                        }
                      }}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* School Level Selection (Primary or Secondary) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>School Level / Category *</span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Select Primary or Secondary</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSchoolLevel("Primary")}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        schoolLevel === "Primary"
                          ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
                      }`}
                    >
                      <span>Primary School</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSchoolLevel("Secondary")}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        schoolLevel === "Secondary"
                          ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
                      }`}
                    >
                      <span>Secondary School</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Selected: <strong className="text-purple-600 dark:text-purple-400">{schoolLevel} School</strong> ({schoolLevel === "Primary" ? "Nursery, Primary & Basic 1-6" : "Junior & Senior Secondary / JSS 1 - SS 3"})
                  </p>
                </div>

                {/* School Acronym (for Student IDs e.g. DIS/2027/506) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">School Acronym / Short Code *</label>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold">
                      Format: {(schoolAcronym || computeSchoolAcronym(schoolName))}/2027/506
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DIS"
                    value={schoolAcronym}
                    onChange={(e) => setSchoolAcronym(e.target.value.toUpperCase())}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-mono uppercase tracking-wider focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Used to format student admission numbers (e.g. <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">{(schoolAcronym || computeSchoolAcronym(schoolName))}/2027/506</span> instead of app acronym).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">School Address *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 123 Independence Avenue, Lagos"
                      value={schoolAddress}
                      onChange={(e) => setSchoolAddress(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mrs. Okonkwo Beatrice"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. okonkwo.b@livingstone.edu.ng"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +234 803 123 4567"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Admin Role *</label>
                  <select
                    required
                    value={adminRole}
                    onChange={(e) => setAdminRole(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="">Select your role...</option>
                    <option value="School Owner">School Owner / Proprietor</option>
                    <option value="Proprietor">Proprietor</option>
                    <option value="Proprietress">Proprietress</option>
                    <option value="Principal">Principal</option>
                    <option value="Vice Principal">Vice Principal</option>
                    <option value="Head Teacher">Head Teacher</option>
                    <option value="Assistant Head Teacher">Assistant Head Teacher</option>
                    <option value="School Administrator">School Administrator</option>
                    <option value="ICT Administrator">ICT Administrator</option>
                    <option value="Registrar">Registrar</option>
                    <option value="Admission Officer">Admission Officer</option>
                    <option value="Bursar">Bursar</option>
                    <option value="Accountant">Accountant</option>
                  </select>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    This role becomes the first administrator. You can create additional admins later.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Password *</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-10 py-3 text-xs focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                  />
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Complete School Registration"}
                </button>

                <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80">
                  Already have a school account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActivePortalTab("school");
                      setCurrentPage("login");
                    }}
                    className="font-bold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Go to School Login →
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 9. FORGOT PASSWORD PAGE */}
        {currentPage === "forgot-password" && (
          <div className="max-w-md mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl dark:bg-slate-900 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Reset Password
                </h3>
                <button
                  type="button"
                  onClick={() => setCurrentPage("login")}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  ← Login
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Enter your registered school email address for <strong>{selectedSchool?.name || "your institution"}</strong>. A password reset verification token will be sent immediately.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Registered Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@school.edu.ng"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {forgotFeedback && (
                  <div className="p-3 rounded-lg bg-indigo-50 text-indigo-700 text-xs border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
                    {forgotFeedback}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                >
                  Send Reset Verification Link
                </button>
              </form>
            </div>
          </div>
        )}

        {/* DEDICATED EMAIL OTP VERIFICATION PAGE */}
        {currentPage === "verify-email" && (
          <div className="max-w-md mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-md">
                  <Mail className="w-7 h-7 animate-pulse" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Verify Your Email Address</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  We have sent a 6-digit security verification code to your registered email address.
                </p>
              </div>

              {/* Recipient & School Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Account Email:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{otpEmail || "your.email@school.edu.ng"}</span>
                </div>
                {otpSchoolName && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 font-medium">Institution:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[200px]">{otpSchoolName}</span>
                  </div>
                )}
                {otpRole && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 font-medium">Account Role:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{otpRole}</span>
                  </div>
                )}
              </div>

              {otpError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{otpSuccess}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="••••••"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    className="w-full text-center tracking-[12px] font-mono text-2xl font-black py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-900 dark:text-white outline-none transition-all shadow-inner"
                  />
                  <p className="text-[11px] text-center text-slate-400">
                    Code expires in 10 minutes. Check your inbox and spam folder.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otpCode.trim().length < 4}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {otpLoading ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Activate Account</span>
                    </>
                  )}
                </button>
              </form>

              {/* Resend Action */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-2 text-xs">
                <button
                  type="button"
                  disabled={otpCooldown > 0 || otpLoading}
                  onClick={handleResendOtp}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {otpCooldown > 0 ? `Resend code in ${otpCooldown}s` : "Didn't receive the email? Resend Code"}
                </button>

                <div className="flex items-center justify-center pt-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setCurrentPage("login")}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    ← Back to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 10. PRIVACY POLICY PAGE */}
        {currentPage === "privacy" && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn bg-white p-8 rounded-3xl border border-slate-200 text-xs text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 leading-relaxed">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h2>
            <p>
              <strong className="text-slate-900 dark:text-white">Effective Date:</strong> 1st August 2026
            </p>
            <p>
              LIVINGSTONEEDU ("we", "our", "us") operates an Education Management System (EMS)
              and Learning Management System (LMS) that serves schools across Nigeria and beyond.
              This Privacy Policy explains how we collect, use, disclose, and safeguard student,
              teacher, parent, and institutional data when you use our platform, in line with the
              Nigeria Data Protection Regulation (NDPR) and the EU General Data Protection
              Regulation (GDPR) standards.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">1. Information We Collect</h3>
            <p>We collect the following categories of data:</p>
            <p>
              <strong className="text-slate-900 dark:text-white">Account & Profile Data:</strong>{" "}
              Full name, email address, phone number, role (Student, Parent, Teacher, Administrator),
              staff ID, admission number, and login credentials.
            </p>
            <p>
              <strong className="text-slate-900 dark:text-white">Academic Data:</strong> Class
              enrolment, attendance records, continuous assessment (CA) scores, examination results,
              CBT attempts, lesson notes, report cards, and curriculum progress.
            </p>
            <p>
              <strong className="text-slate-900 dark:text-white">Financial Data:</strong> Fee
              invoices, payment receipts, and transaction logs. Payment card details are never
              stored on our servers; they are processed by licensed third-party payment gateways.
            </p>
            <p>
              <strong className="text-slate-900 dark:text-white">Usage Data:</strong> Device type,
              browser information, IP address, pages visited, and feature usage patterns for
              improving performance and security.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">2. How We Use Your Data</h3>
            <p>Your data is used solely to operate and improve the platform, including to:</p>
            <p>• Provide core academic services: lesson notes, exam generation, grading, report cards, and CBT delivery.</p>
            <p>• Manage student and staff records, attendance, and fee invoicing.</p>
            <p>• Communicate important announcements, results, and school circulars to the relevant roles.</p>
            <p>• Personalise AI-powered tools (e.g., sSolutAI-generated lesson notes and exams) for your school&apos;s curriculum.</p>
            <p>• Maintain platform security, prevent fraud, and comply with legal obligations.</p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">3. Data Storage & Security</h3>
            <p>
              Student academic records, CBT scores, report cards, and payment logs stored on Google
              Cloud Firestore and Realtime Database are encrypted in transit (TLS 1.2+) and at rest
              (AES-256). Access is restricted to authorised users through role-based permissions,
              and all administrative actions are recorded in an audit trail.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">4. Data Sharing & Disclosure</h3>
            <p>We do not sell, rent, or trade your personal data. We only share data:</p>
            <p>• With your school&apos;s administrators, teachers, and authorised staff for academic and administrative purposes.</p>
            <p>• With service providers (hosting, payment processing, analytics) under strict data-processing agreements.</p>
            <p>• When required by Nigerian law, court order, or regulatory authority.</p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">5. Your Rights</h3>
            <p>
              Under the NDPR/GDPR, you have the right to access, correct, export, restrict, and
              request deletion of your personal data. Parents/guardians may exercise these rights on
              behalf of their children. To make a request, contact your school administrator or our
              Data Protection Officer at privacy@livingstoneedu.ng.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">6. Children&apos;s Privacy</h3>
            <p>
              Where minors use the platform, their data is collected with the consent of their
              parent or legal guardian, and access to student-facing features is limited to
              age-appropriate academic content.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">7. Data Retention</h3>
            <p>
              Academic records are retained for as long as the school maintains an active account,
              and up to seven (7) years after account closure where required for statutory or
              audit purposes. Users may contact us to request earlier erasure where legally permitted.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">8. Cookies & Tracking</h3>
            <p>
              We use essential cookies to maintain secure sessions and optional analytics to improve
              the platform. You may disable non-essential cookies in your browser settings without
              losing core functionality.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">9. Changes to This Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be notified
              via in-app announcements or the email address associated with your account.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">10. Contact Us</h3>
            <p>
              For privacy questions or complaints, contact us at privacy@livingstoneedu.ng or write
              to LIVINGSTONEEDU, Plot 12, Educational Zone, Victoria Island Annex, Lagos, Nigeria.
            </p>
          </div>
        )}

        {/* 11. TERMS OF SERVICE PAGE */}
        {currentPage === "terms" && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn bg-white p-8 rounded-3xl border border-slate-200 text-xs text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 leading-relaxed">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Terms of Service</h2>
            <p>
              <strong className="text-slate-900 dark:text-white">Effective Date:</strong> 1st August 2026
            </p>
            <p>
              These Terms of Service ("Terms") govern the use of the LIVINGSTONEEDU SaaS platform
              by educational institutions, their administrators, teachers, students, parents, and
              guardians. By accessing or using the platform, you agree to be bound by these Terms.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">1. Acceptance of Terms</h3>
            <p>
              By using LIVINGSTONEEDU SaaS infrastructure, educational institutions agree to manage
              user access responsibly, ensure the accuracy of submitted data, and comply with all
              applicable Nigerian laws and regulations.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">2. Account Registration & Responsibilities</h3>
            <p>
              Schools are responsible for creating and managing accounts for their staff, students,
              and parents. Account holders must keep login credentials confidential and notify their
              school administrator immediately of any unauthorised use. Institutions are responsible
              for all activity that occurs under their account.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">3. Permitted Use</h3>
            <p>You agree to use the platform only for legitimate educational and administrative purposes, and not to:</p>
            <p>• Upload or transmit unlawful, defamatory, or malicious content.</p>
            <p>• Attempt to access, modify, or tamper with another school&apos;s data or system infrastructure.</p>
            <p>• Reverse-engineer, copy, or resell the platform, its AI-generated content, or its intellectual property.</p>
            <p>• Use automated tools to scrape, harvest, or mine data from the platform without written permission.</p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">4. AI-Generated Content</h3>
            <p>
              Lesson notes, examinations, and other content generated by our AI tools (e.g., sSolutAI)
              are provided for educational assistance. Schools and teachers remain responsible for
              reviewing, verifying, and customising such content before use in official academic
              assessments. We make no warranty as to the completeness or accuracy of AI outputs.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">5. Subscriptions, Fees & Payments</h3>
            <p>
              Access to certain features requires an active subscription plan. Subscription fees are
              payable in advance and are non-refundable except where required by law. Schools may
              upgrade, downgrade, or cancel their plan subject to the billing cycle selected. Failure
              to pay may result in suspension of access until payment is settled.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">6. Intellectual Property</h3>
            <p>
              LIVINGSTONEEDU owns all rights to the platform, its design, source code, branding, and
              standardised content. Schools retain ownership of the academic data they upload, and
              grant us a limited licence to store, process, and display that data solely to provide
              the service.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">7. Data Protection</h3>
            <p>
              Both parties will handle personal data in compliance with the NDPR and applicable data
              protection laws. Each school acts as a Data Controller for its own records, while
              LIVINGSTONEEDU acts as a Data Processor. Details of data handling are set out in our
              Privacy Policy.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">8. Service Availability & Support</h3>
            <p>
              We aim to provide a reliable, secure service with scheduled maintenance windows
              communicated in advance. We are not liable for interruptions caused by internet
              outages, third-party services, or force majeure events.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">9. Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law, LIVINGSTONEEDU shall not be liable for any
              indirect, incidental, special, or consequential damages arising from the use or
              inability to use the platform. Our total liability in any claim shall not exceed the
              subscription fees paid by the school in the preceding twelve (12) months.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">10. Termination</h3>
            <p>
              A school may terminate its account at any time by contacting support. We may suspend or
              terminate access where these Terms are breached, where payment is overdue, or where
              required by law. Upon termination, school data will be exported and deleted in line
              with the retention policy.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">11. Governing Law</h3>
            <p>
              These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes
              shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.
            </p>

            <h3 className="font-bold text-slate-900 dark:text-white text-sm">12. Contact</h3>
            <p>
              For questions about these Terms, contact legal@livingstoneedu.ng or write to
              LIVINGSTONEEDU, Plot 12, Educational Zone, Victoria Island Annex, Lagos, Nigeria.
            </p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800 py-10 px-4 md:px-8 mt-16 text-xs text-slate-500 dark:text-slate-400 w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">LIVINGSTONEEDU</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nigeria's Most Advanced AI-Powered School Management System.
              </p>
              <p className="text-xs">
                © {new Date().getFullYear()} {isAdminMode ? "Super Admin Governance Portal" : "Enterprise LMS & ERP"}. All rights reserved.
              </p>
            </div>
            {!isAdminMode && (
              <>
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Explore</h4>
                  <div className="flex flex-col gap-2.5">
                    <a href="/" onClick={(e) => { e.preventDefault(); setCurrentPage("landing"); }} className="hover:text-slate-900 dark:hover:text-white">Home</a>
                    <a href="/features" onClick={(e) => { e.preventDefault(); setCurrentPage("features"); }} className="hover:text-slate-900 dark:hover:text-white">Features</a>
                    <a href="/pricing" onClick={(e) => { e.preventDefault(); setCurrentPage("pricing"); }} className="hover:text-slate-900 dark:hover:text-white">Pricing</a>
                    <a href="/about" onClick={(e) => { e.preventDefault(); setCurrentPage("about"); }} className="hover:text-slate-900 dark:hover:text-white">About</a>
                    <a href="/contact" onClick={(e) => { e.preventDefault(); setCurrentPage("contact"); }} className="hover:text-slate-900 dark:hover:text-white">Contact</a>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Portals</h4>
                  <div className="flex flex-col gap-2.5">
                    <a href="/student-portal" onClick={(e) => { e.preventDefault(); setCurrentPage("login"); setActivePortalTab("student"); }} className="hover:text-slate-900 dark:hover:text-white">Student Login</a>
                    <a href="/teacher-portal" onClick={(e) => { e.preventDefault(); setCurrentPage("login"); setActivePortalTab("teacher"); }} className="hover:text-slate-900 dark:hover:text-white">Teacher Login</a>
                    <a href="/school-portal" onClick={(e) => { e.preventDefault(); setCurrentPage("login"); setActivePortalTab("school"); }} className="hover:text-slate-900 dark:hover:text-white font-semibold text-purple-600 dark:text-purple-400">School Login</a>
                    <a href="/register-school" onClick={(e) => { e.preventDefault(); setCurrentPage("register-school"); }} className="font-bold text-purple-600 dark:text-purple-400 hover:underline">School Registration</a>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Legal</h4>
                  <div className="flex flex-col gap-2.5">
                    <a href="/privacy" onClick={(e) => { e.preventDefault(); setCurrentPage("privacy"); }} className="hover:text-slate-900 dark:hover:text-white">Privacy Policy</a>
                    <a href="/terms" onClick={(e) => { e.preventDefault(); setCurrentPage("terms"); }} className="hover:text-slate-900 dark:hover:text-white">Terms of Service</a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
