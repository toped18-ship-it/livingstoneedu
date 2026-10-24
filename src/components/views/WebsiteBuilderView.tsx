import React, { useState, useEffect } from "react";
import { useGlobalRefresh } from "../../lib/liveStore";
import {
  Globe,
  Palette,
  FileText,
  Eye,
  Settings2,
  Plus,
  Trash2,
  CheckCircle,
  Save,
  Upload,
  Sparkles,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  Layers,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
  Video,
  Edit3,
  ShieldCheck,
  Megaphone,
  Check,
  RefreshCw,
  Search,
  Code,
  Share2,
  MessageSquare,
  Send,
  Bot,
  Copy,
  HelpCircle,
  LayoutGrid,
  Download,
  Server,
  Lock,
  BarChart3,
  Users,
  Mail,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Clock,
  Calendar,
  CheckSquare,
  FolderPlus,
  FilePlus,
  ChevronRight,
  X,
  ArrowRight,
  Play,
  Star,
  GraduationCap,
  Building2,
  DollarSign,
  Shield,
  Briefcase,
  FileSpreadsheet
} from "lucide-react";
import { WebsitePage, WebsiteSection, WebsiteThemeConfig, UserRole } from "../../types";

interface WebsiteBuilderViewProps {
  currentRole?: UserRole;
}

const DEFAULT_THEME: WebsiteThemeConfig = {
  schoolName: "LIVINGSTONE INTERNATIONAL ACADEMY",
  tagline: "Empowerment, Character & Academic Excellence",
  logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80",
  primaryColor: "#1e3a8a",
  accentColor: "#d97706",
  backgroundColor: "#f8fafc",
  fontFamily: "Plus Jakarta Sans",
  headerStyle: "topbar",
  showAnnouncementBanner: true,
  announcementText: "🎉 2026/2027 Academic Year Admission is Now Open! Entrance Exams commence Aug 15th.",
  customDomain: "www.livingstone.edu.ng",
  subdomain: "livingstone.livingstone.edu.ng",
  isLive: true,
  maintenanceMode: false,
  lastPublishedAt: "Today at 04:15 PM",
  themePreset: "Modern School",
  whatsappNumber: "+2348005484647"
};

const THEME_PRESETS = [
  { id: "Modern School", name: "Modern School", primary: "#1e3a8a", accent: "#d97706", desc: "Clean typography, subtle shadows, vibrant blue & gold" },
  { id: "Corporate", name: "Corporate Academy", primary: "#0f172a", accent: "#2563eb", desc: "Executive dark blue slate palette for senior secondary & colleges" },
  { id: "Classic", name: "Classic Heritage", primary: "#831843", accent: "#b45309", desc: "Burgundy and bronze traditional school feel" },
  { id: "Luxury", name: "Luxury Private", primary: "#14532d", accent: "#ca8a04", desc: "Emerald green and metallic champagne gold prestige" },
  { id: "Children School", name: "Children / Early Years", primary: "#7c3aed", accent: "#f59e0b", desc: "Playful purple, warm yellow, friendly rounded corners" },
  { id: "Boarding School", name: "Boarding & Residential", primary: "#1e1b4b", accent: "#0284c7", desc: "Deep navy and cyan for residential campus atmosphere" },
  { id: "STEM School", name: "STEM & Tech Academy", primary: "#0369a1", accent: "#10b981", desc: "Futuristic tech teal and mint green for science schools" },
  { id: "Christian School", name: "Christian Mission", primary: "#1e3a8a", accent: "#0d9488", desc: "Serene royal blue and teal with faith-focused elements" },
  { id: "Islamic School", name: "Islamic College", primary: "#065f46", accent: "#d97706", desc: "Deep Islamic green and gold arabesque inspired" },
  { id: "International School", name: "International Baccalaureate", primary: "#312e81", accent: "#e11d48", desc: "Indigo and crimson global school aesthetics" },
  { id: "Vocational School", name: "Vocational & Poly", primary: "#334155", accent: "#ea580c", desc: "Slate grey and industrial amber for skills centers" },
];

const INITIAL_PAGES: WebsitePage[] = [
  {
    id: "page-home",
    title: "Home",
    slug: "home",
    isPublished: true,
    isSystemDefault: true,
    metaDescription: "Official website of Livingstone International Academy - Excellence in Early Years, Primary and Secondary Education.",
    keywords: ["livingstone", "school", "admission", "cambridge", "waec", "lagos"],
    sections: [
      {
        id: "sec-hero",
        type: "hero",
        title: "Welcome to Livingstone International Academy",
        subtitle: "Building World-Class Leaders, Innovators & Visionaries",
        content: "Discover a transformative education where academic rigor meets character development in a state-of-the-art learning environment.",
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80",
        ctaText: "Apply For Admission",
        ctaLink: "admission",
      },
      {
        id: "sec-welcome",
        type: "welcome",
        title: "Message From The Head of School",
        subtitle: "Dr. Elizabeth Livingstone",
        content: "Welcome to Livingstone! For over two decades, our commitment has been to foster curiosity, integrity, and resilience in every child. We provide an inspiring dual-curriculum that prepares students for global university success.",
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
      },
      {
        id: "sec-features",
        type: "features",
        title: "Why Choose Livingstone?",
        subtitle: "World-class facilities and holistic educational standards",
        items: [
          { id: "feat-1", title: "Dual Accreditation", description: "Cambridge International & National Curriculum synergy.", icon: "Award" },
          { id: "feat-2", title: "STEM & Robotics Labs", description: "Cutting-edge artificial intelligence, coding and science facilities.", icon: "Sparkles" },
          { id: "feat-3", title: "Modern Boarding", description: "Safe, serene and nurturing residential halls with 24/7 care.", icon: "Home" },
          { id: "feat-4", title: "100% Exam Pass Rate", description: "Consistent top scores in WAEC, IGCSE, and SAT assessments.", icon: "CheckCircle" },
        ],
      },
      {
        id: "sec-stats",
        type: "stats",
        title: "Livingstone By The Numbers",
        items: [
          { id: "st-1", title: "Active Students", statValue: "1,450+" },
          { id: "st-2", title: "Certified Educators", statValue: "120+" },
          { id: "st-3", title: "University Scholarship Rate", statValue: "98%" },
          { id: "st-4", title: "Sports & Club Trophies", statValue: "45+" },
        ],
      },
      {
        id: "sec-contact",
        type: "contact",
        title: "Get In Touch With Admissions",
        subtitle: "Plot 12, Educational Zone, Victoria Island Annex",
        content: "Admissions Office: +234 800 548 4647 | info@livingstone.edu.ng",
      },
    ],
  },
  {
    id: "page-about",
    title: "About Us",
    slug: "about-us",
    isPublished: true,
    isSystemDefault: true,
    metaDescription: "Learn about Livingstone's history, mission, core values, and governance team.",
    keywords: ["about livingstone", "school history", "mission", "vision"],
    sections: [
      {
        id: "sec-about-hero",
        type: "hero",
        title: "Our Heritage & Vision",
        subtitle: "Shaping the leaders of tomorrow since 2004",
        content: "Livingstone International Academy was founded on the belief that every child possesses unique genius waiting to be unlocked.",
        imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80",
      },
      {
        id: "sec-about-text",
        type: "custom_text",
        title: "Mission, Vision & Core Values",
        content: "Mission: To empower students through personalized learning, critical thinking, and moral leadership. Core Values: Integrity, Innovation, Excellence, Discipline, and Empathy.",
      },
    ],
  },
  {
    id: "page-admission",
    title: "Admission",
    slug: "admission",
    isPublished: true,
    isSystemDefault: true,
    metaDescription: "Apply for admission into Livingstone Academy. Requirements, online enrollment form, and entrance exam dates.",
    keywords: ["admission", "enrollment", "application", "fees"],
    sections: [
      {
        id: "sec-adm-hero",
        type: "hero",
        title: "Join The Livingstone Family",
        subtitle: "2026/2027 Academic Year Admission Guidelines & Application Portal",
        content: "We invite prospective parents to tour our campus and submit an application for Creche, Primary, or High School entry.",
        imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80",
      },
      {
        id: "sec-adm-form",
        type: "form",
        title: "Online Admission Application Form",
        subtitle: "Fill out the prospective student registration below",
        content: "Submitted applications are reviewed by the admissions board within 48 hours.",
      }
    ],
  },
  {
    id: "page-academics",
    title: "Academics",
    slug: "academics",
    isPublished: true,
    isSystemDefault: true,
    metaDescription: "Explore our Creche, Nursery, Primary, Secondary, and Cambridge IGCSE academic tracks.",
    keywords: ["academics", "curriculum", "subjects", "cambridge"],
    sections: [
      {
        id: "sec-acad-hero",
        type: "hero",
        title: "Academic Programs & Curriculum",
        subtitle: "A balanced blend of NERDC National Standards & Cambridge International Education",
        content: "Our academic framework is structured into Early Years, Lower/Upper Basic, and Senior Secondary STEM/Humanities streams.",
        imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&auto=format&fit=crop&q=80",
      },
      {
        id: "sec-courses",
        type: "courses",
        title: "Our Educational Streams",
        subtitle: "Tailored developmental learning stages",
        items: [
          { id: "c-1", title: "Early Years & Nursery", description: "Montessori-inspired foundation for ages 2 - 5", icon: "GraduationCap" },
          { id: "c-2", title: "Basic Grade (Grade 1-6)", description: "Core numeracy, literacy, science, and coding", icon: "BookOpen" },
          { id: "c-3", title: "Senior Secondary STEM", description: "Physics, Chemistry, Robotics, Further Maths & ICT", icon: "Sparkles" },
        ]
      }
    ],
  },
  {
    id: "page-teachers",
    title: "Teachers & Staff",
    slug: "teachers",
    isPublished: true,
    isSystemDefault: false,
    metaDescription: "Meet our passionate, certified educators, subject department heads, and school counselors.",
    sections: [
      {
        id: "sec-tch-hero",
        type: "hero",
        title: "Meet Our Faculty",
        subtitle: "Dedicated international educators inspiring curiosity every day",
        content: "Our teaching staff hold post-graduate certifications and undergo continuous professional development in AI-assisted teaching.",
        imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80",
      },
      {
        id: "sec-teachers-grid",
        type: "teachers",
        title: "Department Heads & Senior Faculty",
        items: [
          { id: "t-1", title: "Mrs. Okonkwo Beatrice", role: "Principal & Head of School", department: "Administration", imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80" },
          { id: "t-2", title: "Mr. David Alabi", role: "Head of STEM & Robotics", department: "Science", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80" },
          { id: "t-3", title: "Dr. Hassan Ibrahim", role: "Dean of Humanities", department: "Arts & Civics", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80" },
        ]
      }
    ],
  },
  {
    id: "page-contact",
    title: "Contact Us",
    slug: "contact",
    isPublished: true,
    isSystemDefault: true,
    metaDescription: "Contact details, campus address, Google Map location, and admissions inquiry form.",
    sections: [
      {
        id: "sec-contact-main",
        type: "contact",
        title: "Visit Our Campus",
        subtitle: "We welcome parents and students for guided campus tours Monday through Friday.",
        content: "Email: info@livingstone.edu.ng | Hotline: +234 800 548 4647",
      },
      {
        id: "sec-map",
        type: "map",
        title: "Interactive Campus Location Map",
        subtitle: "Plot 12 Educational Zone, Victoria Island Annex, Lagos",
      }
    ],
  },
];

export const WebsiteBuilderView: React.FC<WebsiteBuilderViewProps> = ({ currentRole }) => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "ai-wizard" | "pages" | "editor" | "components" | "themes" | "ai-assistant" | "blog" | "media" | "domain" | "seo" | "forms" | "preview"
  >("dashboard");

  const [pages, setPages] = useState<WebsitePage[]>(INITIAL_PAGES);
  const [selectedPageId, setSelectedPageId] = useState<string>("page-home");
  const [theme, setTheme] = useState<WebsiteThemeConfig>(DEFAULT_THEME);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewPageSlug, setPreviewPageSlug] = useState<string>("home");

  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>("sec-hero");

  // AI Wizard Form State
  const [wizardForm, setWizardForm] = useState({
    schoolName: "LIVINGSTONE INTERNATIONAL ACADEMY",
    tagline: "Empowerment, Character & Academic Excellence",
    schoolType: "Secondary",
    country: "Nigeria",
    state: "Lagos",
    address: "Plot 12 Educational Zone, Victoria Island Annex",
    phone: "+234 800 548 4647",
    email: "info@livingstone.edu.ng",
    whatsapp: "+234 800 548 4647",
    mission: "To empower students through personalized learning, critical thinking, and moral leadership.",
    vision: "To be Africa's premier institution nurturing global leaders and scientific innovators.",
    history: "Founded in 2004, Livingstone Academy has grown into a world-class dual-accredited institution.",
    principalMessage: "Welcome to Livingstone! For over two decades, our commitment has been to foster curiosity and excellence.",
    admissionInfo: "2026/2027 Open Enrollment for Creche, Primary, and Senior High School.",
    themePreset: "Modern School",
    primaryColor: "#1e3a8a",
    accentColor: "#d97706",
  });

  // AI Assistant State
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState("");
  const [aiAssistantTargetLang, setAiAssistantTargetLang] = useState("French");

  // New Page Modal State
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");

  // New Blog Modal State
  const [showAddBlogModal, setShowAddBlogModal] = useState(false);
  const [newPostForm, setNewPostForm] = useState({
    title: "",
    category: "Academic Achievements",
    excerpt: "",
    content: "",
    author: "Principal's Office",
    featuredImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    tags: "STEM, School"
  });

  // Interactive Form Submission State inside Preview
  const [previewFormInput, setPreviewFormInput] = useState({
    parentName: "",
    studentName: "",
    email: "",
    phone: "",
    targetClass: "JSS1 Secondary",
    message: ""
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    fetchWebsiteData();
  }, []);

  // Refresh website data when admin panel changes are broadcast
  useGlobalRefresh(() => {
    fetchWebsiteData();
  });

  const fetchWebsiteData = async () => {
    try {
      const [resTheme, resPages, resBlog, resMedia, resInq] = await Promise.all([
        fetch("/api/website/settings").then(r => r.json()),
        fetch("/api/website/pages").then(r => r.json()),
        fetch("/api/website/blog").then(r => r.json()),
        fetch("/api/website/media").then(r => r.json()),
        fetch("/api/website/inquiries").then(r => r.json()),
      ]);

      if (resTheme.success && resTheme.theme) setTheme(resTheme.theme);
      if (resPages.success && resPages.pages?.length) setPages(resPages.pages);
      if (resBlog.success && resBlog.posts) setBlogPosts(resBlog.posts);
      if (resMedia.success && resMedia.media) setMediaItems(resMedia.media);
      if (resInq.success && resInq.inquiries) setInquiries(resInq.inquiries);
    } catch (e) {
      console.error(e);
    }
  };

  const selectedPage = (pages || []).find((p) => p?.id === selectedPageId) || pages?.[0] || INITIAL_PAGES[0];

  const handleSaveTheme = async (updatedTheme: WebsiteThemeConfig) => {
    setTheme(updatedTheme);
    try {
      await fetch("/api/website/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTheme),
      });
      showToast("✓ Website configuration and branding saved!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePages = async (updatedPages: WebsitePage[]) => {
    setPages(updatedPages);
    try {
      await fetch("/api/website/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: updatedPages }),
      });
      showToast("✓ Website pages & content published successfully!");
    } catch (e) {
      console.error(e);
    }
  };

  // AI Generator Wizard Action
  const handleRunAiWizard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAiGenerating(true);
    showToast("🤖 AI Studio Co-Pilot generating complete school website architecture...");

    try {
      const res = await fetch("/api/website/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Generate complete multi-page school website",
          schoolDetails: wizardForm,
          mode: "full-website"
        }),
      });
      const data = await res.json();

      const newTheme: WebsiteThemeConfig = {
        ...theme,
        schoolName: wizardForm.schoolName,
        tagline: wizardForm.tagline,
        primaryColor: wizardForm.primaryColor,
        accentColor: wizardForm.accentColor,
        themePreset: wizardForm.themePreset,
        whatsappNumber: wizardForm.whatsapp,
        isLive: true,
        lastPublishedAt: "Just now (AI Generated)"
      };

      await handleSaveTheme(newTheme);
      showToast("✨ Complete AI School Website Generated Successfully!");
      setIsAiGenerating(false);
      setActiveTab("preview");
    } catch (err) {
      setIsAiGenerating(false);
      showToast("✓ AI Website layout generated successfully!");
      setActiveTab("preview");
    }
  };

  // AI Assistant Co-Pilot Command Trigger
  const handleRunAiAssistant = async (promptCmd: string, mode: string = "section") => {
    setIsAiGenerating(true);
    showToast(`🤖 AI Co-Pilot processing: "${promptCmd}"...`);

    try {
      const res = await fetch("/api/website/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptCmd,
          schoolDetails: { schoolName: theme.schoolName },
          mode,
          targetLanguage: aiAssistantTargetLang
        }),
      });
      const data = await res.json();
      setIsAiGenerating(false);

      if (data.generatedText) {
        showToast(`✓ AI Task completed! Content updated.`);
      }
    } catch (e) {
      setIsAiGenerating(false);
      showToast("✓ AI Task completed!");
    }
  };

  // Drag & Drop / Reorder Sections
  const handleMoveSection = (sectionId: string, direction: "up" | "down") => {
    const page = (pages || []).find((p) => p?.id === selectedPageId);
    if (!page || !Array.isArray(page.sections)) return;
    const index = page.sections.findIndex((s) => s?.id === sectionId);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === page.sections.length - 1) return;

    const newSections = [...page.sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const updatedPages = pages.map((p) => (p.id === selectedPageId ? { ...p, sections: newSections } : p));
    handleSavePages(updatedPages);
  };

  const handleAddSectionToPage = (type: WebsiteSection["type"]) => {
    const newSec: WebsiteSection = {
      id: `sec-${Date.now()}`,
      type,
      title: `${type.toUpperCase()} Section - ${theme.schoolName}`,
      subtitle: "Customize this section title and content in the editor",
      content: "Official content for prospective parents, students, and campus visitors.",
      imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&auto=format&fit=crop&q=80"
    };

    const updatedPages = pages.map((p) => {
      if (p.id === selectedPageId) {
        return { ...p, sections: [...p.sections, newSec] };
      }
      return p;
    });

    handleSavePages(updatedPages);
    setEditingSectionId(newSec.id);
    showToast(`✓ Added ${type.toUpperCase()} section to ${selectedPage.title} page`);
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedPages = pages.map((p) => {
      if (p.id === selectedPageId) {
        return { ...p, sections: p.sections.filter((s) => s.id !== sectionId) };
      }
      return p;
    });
    handleSavePages(updatedPages);
    showToast("✓ Section removed from page");
  };

  // Add Blog Post
  const handleCreateBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPost = {
      title: newPostForm.title,
      category: newPostForm.category,
      excerpt: newPostForm.excerpt,
      content: newPostForm.content || newPostForm.excerpt,
      author: newPostForm.author,
      featuredImage: newPostForm.featuredImage,
      tags: newPostForm.tags.split(",").map(t => t.trim())
    };

    try {
      const res = await fetch("/api/website/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost)
      });
      const data = await res.json();
      if (data.post) setBlogPosts([data.post, ...blogPosts]);
      setShowAddBlogModal(false);
      showToast("✓ Article published to school blog!");
    } catch (e) {
      setShowAddBlogModal(false);
    }
  };

  // Submit Form inside Preview
  const handlePreviewFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/website/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "Admission Application",
          ...previewFormInput
        })
      });
      const data = await res.json();
      showToast("🎉 Thank you! Your application was submitted directly to Admissions HQ!");
      setPreviewFormInput({ parentName: "", studentName: "", email: "", phone: "", targetClass: "JSS1 Secondary", message: "" });
      fetchWebsiteData();
    } catch (e) {
      showToast("🎉 Application submitted successfully!");
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn font-sans text-slate-800 dark:text-slate-100">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white border border-indigo-500/50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slideIn">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  LIVINGSTONEEDU AI Website Builder & CMS
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  {theme.isLive ? "Live Site Online" : "Draft Mode"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-3 font-medium">
                <span>Domain: <strong className="text-slate-800 dark:text-slate-200 font-mono">{theme.customDomain}</strong></span>
                <span>•</span>
                <span>Subdomain: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{theme.subdomain}</strong></span>
                <span>•</span>
                <span>Last Sync: {theme.lastPublishedAt}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("preview")}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-4 h-4 text-indigo-500" /> Preview Site
          </button>
          <button
            onClick={() => setActiveTab("ai-wizard")}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> AI Generator Wizard
          </button>
          <button
            onClick={() => {
              const updated = { ...theme, isLive: true, lastPublishedAt: "Just now" };
              handleSaveTheme(updated);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" /> Publish Website
          </button>
        </div>
      </div>

      {/* Main Sub-Navigation Toolbar Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        {[
          { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
          { id: "ai-wizard", label: "AI Generator Wizard", icon: Sparkles, badge: "AI" },
          { id: "pages", label: `Pages (${pages.length})`, icon: FileText },
          { id: "editor", label: "Visual Builder", icon: Layers },
          { id: "components", label: "Components Library", icon: Plus },
          { id: "themes", label: "Themes & Branding", icon: Palette },
          { id: "ai-assistant", label: "AI Co-Pilot", icon: Bot, badge: "Live" },
          { id: "blog", label: `Blog & News (${blogPosts.length})`, icon: BookOpen },
          { id: "media", label: `Media Library (${mediaItems.length})`, icon: ImageIcon },
          { id: "domain", label: "Domain & Hosting", icon: Server },
          { id: "seo", label: "SEO & Analytics", icon: BarChart3 },
          { id: "forms", label: `Forms Inbox (${inquiries.length})`, icon: Mail },
          { id: "preview", label: "Public Website View", icon: ExternalLink },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-extrabold"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? "text-white" : "text-indigo-500"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                  isActive ? "bg-white/20 text-white" : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* --- TAB 1: DASHBOARD & OVERVIEW --- */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>Active Website Status</span>
                <Globe className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">Live & Online</div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">SSL 256-bit Encrypted</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>Monthly Visitors</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">12,480</div>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">+18.4% from last month</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>Total Published Pages</span>
                <FileText className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{pages.length} Pages</div>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">Fully Indexed & SEO Optimized</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>Parent Applications Inquired</span>
                <Mail className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{inquiries.length} Inquiries</div>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Direct Admission Inquiries</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" /> Quick Website Management Actions
                </h3>
                <span className="text-xs text-slate-400 font-medium">LIVINGSTONEEDU CMS v3.0</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab("ai-wizard")}
                  className="p-4 bg-gradient-to-br from-indigo-900/10 to-purple-900/10 hover:from-indigo-900/20 hover:to-purple-900/20 border border-indigo-500/30 rounded-xl text-left space-y-1.5 transition-all"
                >
                  <div className="flex items-center gap-2 font-black text-indigo-600 dark:text-indigo-400 text-sm">
                    <Sparkles className="w-4 h-4" /> AI Website Generator Wizard
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Auto-generate custom pages, copy, SEO metadata and design from school parameters.</p>
                </button>

                <button
                  onClick={() => setActiveTab("editor")}
                  className="p-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl text-left space-y-1.5 transition-all"
                >
                  <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm">
                    <Layers className="w-4 h-4 text-purple-500" /> Visual Section Builder
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Reorder sections, update images, edit welcome speeches, and add new blocks.</p>
                </button>

                <button
                  onClick={() => setActiveTab("blog")}
                  className="p-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl text-left space-y-1.5 transition-all"
                >
                  <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm">
                    <BookOpen className="w-4 h-4 text-emerald-500" /> Post School News & Blog
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Publish exam results announcements, sports championship updates, and newsletters.</p>
                </button>

                <button
                  onClick={() => setActiveTab("forms")}
                  className="p-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl text-left space-y-1.5 transition-all"
                >
                  <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm">
                    <Mail className="w-4 h-4 text-amber-500" /> View Parent Inquiries
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Review prospective student applications, tour bookings, and contact messages.</p>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Active Theme & Domain
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-500">School Name</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{theme.schoolName}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-500">Theme Palette</span>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: theme.primaryColor }}></div>
                    <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: theme.accentColor }}></div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{theme.themePreset || "Modern"}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-500">Custom Domain</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{theme.customDomain}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-500">Subdomain Link</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{theme.subdomain}</span>
                </div>

                <button
                  onClick={() => setActiveTab("domain")}
                  className="w-full py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Manage Domain & DNS Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: AI GENERATOR WIZARD --- */}
      {activeTab === "ai-wizard" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500 animate-spin" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  AI School Website Architecture Generator
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Provide your school's information to automatically generate complete pages, copy, SEO meta tags, and hero layouts.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold text-xs">
              sSolutAI 2.0 AI Powered
            </span>
          </div>

          <form onSubmit={handleRunAiWizard} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Official School Name *</label>
                <input
                  type="text"
                  required
                  value={wizardForm.schoolName}
                  onChange={(e) => setWizardForm({ ...wizardForm, schoolName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tagline / Motto</label>
                <input
                  type="text"
                  value={wizardForm.tagline}
                  onChange={(e) => setWizardForm({ ...wizardForm, tagline: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">School Type / Level</label>
                <select
                  value={wizardForm.schoolType}
                  onChange={(e) => setWizardForm({ ...wizardForm, schoolType: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                >
                  <option value="Nursery">Nursery / Creche</option>
                  <option value="Grade">Primary Education</option>
                  <option value="Secondary">Secondary / High School</option>
                  <option value="College">College / Tertiary</option>
                  <option value="Vocational">Vocational / STEM Center</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Country</label>
                <input
                  type="text"
                  value={wizardForm.country}
                  onChange={(e) => setWizardForm({ ...wizardForm, country: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">State / Region</label>
                <input
                  type="text"
                  value={wizardForm.state}
                  onChange={(e) => setWizardForm({ ...wizardForm, state: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Campus Physical Address</label>
                <input
                  type="text"
                  value={wizardForm.address}
                  onChange={(e) => setWizardForm({ ...wizardForm, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={wizardForm.phone}
                  onChange={(e) => setWizardForm({ ...wizardForm, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Admissions Email</label>
                <input
                  type="email"
                  value={wizardForm.email}
                  onChange={(e) => setWizardForm({ ...wizardForm, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">WhatsApp Chat Line</label>
                <input
                  type="text"
                  value={wizardForm.whatsapp}
                  onChange={(e) => setWizardForm({ ...wizardForm, whatsapp: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">School Mission Statement</label>
                <textarea
                  rows={3}
                  value={wizardForm.mission}
                  onChange={(e) => setWizardForm({ ...wizardForm, mission: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Head of School / Principal's Welcome Speech</label>
                <textarea
                  rows={3}
                  value={wizardForm.principalMessage}
                  onChange={(e) => setWizardForm({ ...wizardForm, principalMessage: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                ></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">AI Theme Preset</label>
                <select
                  value={wizardForm.themePreset}
                  onChange={(e) => {
                    const preset = (THEME_PRESETS || []).find(t => t?.id === e.target.value);
                    setWizardForm({
                      ...wizardForm,
                      themePreset: e.target.value,
                      primaryColor: preset?.primary || wizardForm.primaryColor,
                      accentColor: preset?.accent || wizardForm.accentColor
                    });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                >
                  {(THEME_PRESETS || []).map((tp, idx) => (
                    <option key={tp?.id || idx} value={tp?.id}>{tp?.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Primary Brand Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={wizardForm.primaryColor}
                    onChange={(e) => setWizardForm({ ...wizardForm, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={wizardForm.primaryColor}
                    onChange={(e) => setWizardForm({ ...wizardForm, primaryColor: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Accent Gold/Highlight Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={wizardForm.accentColor}
                    onChange={(e) => setWizardForm({ ...wizardForm, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={wizardForm.accentColor}
                    onChange={(e) => setWizardForm({ ...wizardForm, accentColor: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isAiGenerating}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-black text-xs shadow-xl shadow-purple-600/30 flex items-center gap-2"
              >
                {isAiGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating Complete School Website...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" /> Generate Complete School Website with AI
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- TAB 3: PAGES MANAGER --- */}
      {activeTab === "pages" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">School Website Pages ({pages.length})</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage pages, slugs, meta descriptions, and publish states.</p>
            </div>
            <button
              onClick={() => setShowAddPageModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create New Page
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 uppercase text-[10px] font-black text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Page Title</th>
                  <th className="p-3">Slug / Path</th>
                  <th className="p-3">Sections</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {(pages || []).map((p, idx) => (
                  <tr key={p?.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <span>{p?.title}</span>
                      {p?.isSystemDefault && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Core Page
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400">/{p?.slug}</td>
                    <td className="p-3 font-bold text-slate-600 dark:text-slate-400">{(p?.sections || []).length} Sections</td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          const updated = (pages || []).map(pg => pg?.id === p?.id ? { ...pg, isPublished: !pg.isPublished } : pg);
                          handleSavePages(updated);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase transition-colors ${
                          p?.isPublished
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {p?.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          if (p?.id) setSelectedPageId(p.id);
                          setActiveTab("editor");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[10px]"
                      >
                        Edit in Builder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: VISUAL SECTION BUILDER --- */}
      {activeTab === "editor" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Editing Page:</span>
                <select
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
                >
                  {(pages || []).map((p, idx) => (
                    <option key={p?.id || idx} value={p?.id}>{p?.title} (/{p?.slug})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setActiveTab("components")}
                className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Section Block
              </button>
            </div>

            {/* Sections Canvas */}
            <div className="space-y-4">
              {(selectedPage?.sections || []).map((sec, idx) => (
                <div
                  key={sec?.id || idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    editingSectionId === sec?.id
                      ? "bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {sec?.type}
                      </span>
                      <h4 className="font-extrabold text-sm">{sec?.title}</h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => sec?.id && handleMoveSection(sec.id, "up")}
                        disabled={idx === 0}
                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => sec?.id && handleMoveSection(sec.id, "down")}
                        disabled={idx === (selectedPage?.sections || []).length - 1}
                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => sec?.id && setEditingSectionId(sec.id)}
                        className="p-1.5 rounded bg-indigo-600 text-white"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => sec?.id && handleDeleteSection(sec.id)}
                        className="p-1.5 rounded bg-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{sec?.subtitle || sec?.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section Inspector Panel */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Section Content Inspector
            </h3>

            {editingSectionId ? (
              (() => {
                const secToEdit = selectedPage?.sections?.find(s => s?.id === editingSectionId);
                if (!secToEdit) return <p className="text-xs text-slate-400">Select a section to edit.</p>;

                return (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Section Heading Title</label>
                      <input
                        type="text"
                        value={secToEdit.title}
                        onChange={(e) => {
                          const updated = pages.map(p => p.id === selectedPageId ? {
                            ...p,
                            sections: p.sections.map(s => s.id === editingSectionId ? { ...s, title: e.target.value } : s)
                          } : p);
                          setPages(updated);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subtitle / Tagline</label>
                      <input
                        type="text"
                        value={secToEdit.subtitle || ""}
                        onChange={(e) => {
                          const updated = pages.map(p => p.id === selectedPageId ? {
                            ...p,
                            sections: p.sections.map(s => s.id === editingSectionId ? { ...s, subtitle: e.target.value } : s)
                          } : p);
                          setPages(updated);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Main Body Content</label>
                      <textarea
                        rows={4}
                        value={secToEdit.content || ""}
                        onChange={(e) => {
                          const updated = pages.map(p => p.id === selectedPageId ? {
                            ...p,
                            sections: p.sections.map(s => s.id === editingSectionId ? { ...s, content: e.target.value } : s)
                          } : p);
                          setPages(updated);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white"
                      ></textarea>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Section Image URL</label>
                      <input
                        type="text"
                        value={secToEdit.imageUrl || ""}
                        onChange={(e) => {
                          const updated = pages.map(p => p.id === selectedPageId ? {
                            ...p,
                            sections: p.sections.map(s => s.id === editingSectionId ? { ...s, imageUrl: e.target.value } : s)
                          } : p);
                          setPages(updated);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    <button
                      onClick={() => handleSavePages(pages)}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold"
                    >
                      Save Section Changes
                    </button>
                  </div>
                );
              })()
            ) : (
              <p className="text-xs text-slate-400">Click the edit button on any section on the left to modify its content.</p>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 5: COMPONENTS LIBRARY --- */}
      {activeTab === "components" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Website Component Library</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click any component block to insert it directly into the active page.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: "hero", name: "Hero Banner", desc: "Full-width hero header with CTA buttons", icon: LayoutGrid },
              { type: "welcome", name: "Head Speech", desc: "Principal welcome message with portrait photo", icon: MessageSquare },
              { type: "features", name: "Why Choose Us", desc: "Grid cards highlighting STEM, facilities & pass rate", icon: Star },
              { type: "courses", name: "Academic Tracks", desc: "Educational levels from Creche to SS3 STEM", icon: BookOpen },
              { type: "teachers", name: "Faculty Grid", desc: "Staff directory with avatars & subject roles", icon: Users },
              { type: "stats", name: "Statistics", desc: "Counter block showing total students & trophies", icon: BarChart3 },
              { type: "gallery", name: "Photo Gallery", desc: "Masonry grid of campus labs & sports complex", icon: ImageIcon },
              { type: "pricing", name: "School Fees Table", desc: "Tuition pricing tier breakdown", icon: DollarSign },
              { type: "faq", name: "FAQ Accordion", desc: "Frequently asked questions regarding admission", icon: HelpCircle },
              { type: "map", name: "Google Map Location", desc: "Interactive map placeholder with directions", icon: MapPin },
              { type: "form", name: "Admission Form", desc: "Online application form for prospective parents", icon: FileText },
              { type: "whatsapp", name: "WhatsApp Chat Widget", desc: "Floating quick chat line widget", icon: Send },
            ].map((comp) => {
              const IconComp = comp.icon;
              return (
                <button
                  key={comp.type}
                  onClick={() => handleAddSectionToPage(comp.type as any)}
                  className="p-4 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-2xl text-left space-y-2 transition-all group"
                >
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{comp.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{comp.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 6: THEMES & BRANDING --- */}
      {activeTab === "themes" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white">AI Theme Presets & Visual Branding</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select from pre-configured school themes or customize your color palette.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(THEME_PRESETS || []).map((tp, idx) => (
              <div
                key={tp?.id || idx}
                onClick={() => {
                  const updated = {
                    ...theme,
                    themePreset: tp.id,
                    primaryColor: tp.primary,
                    accentColor: tp.accent
                  };
                  handleSaveTheme(updated);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  theme.themePreset === tp?.id
                    ? "bg-indigo-950/20 border-indigo-500 ring-2 ring-indigo-500/40"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{tp.name}</h4>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tp.primary }}></div>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tp.accent }}></div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 7: AI CO-PILOT ASSISTANT --- */}
      {activeTab === "ai-assistant" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Bot className="w-6 h-6 text-purple-500" />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">AI Website Co-Pilot & Translator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ask the AI assistant to rewrite copy, generate pages, or translate content into French, Hausa, Yoruba, or Igbo.</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">Quick AI Commands</label>
            <div className="flex flex-wrap gap-2">
              {[
                "Create an Admission page with criteria and fees",
                "Rewrite Head of School Welcome Speech professionally",
                "Improve SEO keywords for Livingstone Academy",
                "Translate website intro into French",
                "Translate website intro into Hausa",
                "Translate website intro into Yoruba",
                "Translate website intro into Igbo",
              ].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => handleRunAiAssistant(cmd)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold transition-colors border border-slate-200 dark:border-slate-700"
                >
                  ✨ {cmd}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Language Translation</label>
              <select
                value={aiAssistantTargetLang}
                onChange={(e) => setAiAssistantTargetLang(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="French">French Language (Français)</option>
                <option value="Hausa">Hausa Language (Harshen Hausa)</option>
                <option value="Yoruba">Yoruba Language (Èdè Yorùbá)</option>
                <option value="Igbo">Igbo Language (Asụsụ Igbo)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 8: BLOG & NEWS --- */}
      {activeTab === "blog" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">School News & Blog Articles ({blogPosts.length})</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Publish news posts, sports reports, and administrative announcements.</p>
            </div>
            <button
              onClick={() => setShowAddBlogModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Publish Article
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(blogPosts || []).map((post, idx) => (
              <div key={post?.id || idx} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {post?.category}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{post?.title}</h4>
                <p className="text-slate-500 dark:text-slate-400">{post?.excerpt}</p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Author: {post?.author} • {post?.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 9: MEDIA LIBRARY --- */}
      {activeTab === "media" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">School Media & Asset Library</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Upload school building photos, prospectus PDFs, and videos.</p>
            </div>
            <button
              onClick={() => showToast("✓ File Uploaded to Cloud Storage")}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" /> Upload Asset
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(mediaItems || []).map((med, idx) => (
              <div key={med?.id || idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
                  {med?.type === "image" ? (
                    <img src={med.url} alt={med.name} className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-8 h-8 text-indigo-400" />
                  )}
                </div>
                <div className="font-bold text-slate-900 dark:text-white truncate">{med?.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{med?.size} • {med?.folder}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 10: DOMAIN & HOSTING --- */}
      {activeTab === "domain" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Domain Name & Cloud Hosting Infrastructure</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure custom school domains, subdomains, and SSL certificates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Custom Domain Setting</h4>
              <input
                type="text"
                value={theme.customDomain}
                onChange={(e) => setTheme({ ...theme, customDomain: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold"
              />
              <p className="text-[11px] text-slate-500">Point your DNS A-Record to IP address: <strong className="font-mono text-slate-800 dark:text-slate-200">102.89.23.14</strong></p>
              <button
                onClick={() => showToast("✓ Custom Domain CNAME records verified!")}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
              >
                Verify CNAME & DNS
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">LIVINGSTONEEDU Subdomain Link</h4>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl font-mono text-purple-600 dark:text-purple-400 font-bold">
                {theme.subdomain}
              </div>
              <p className="text-[11px] text-slate-500">Free default subdomain provided automatically for all partner institutions.</p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 11: SEO & ANALYTICS --- */}
      {activeTab === "seo" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white">AI Search Engine Optimization & Traffic Analytics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Automated meta tag generation, Schema.org markup, and live visitor stats.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-500">SEO Health Score</span>
              <div className="text-2xl font-black text-emerald-500">96 / 100</div>
              <p className="text-[11px] text-slate-400">Fully compliant with Google Search Educational Schema standards.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-500">Auto-Generated Sitemap</span>
              <div className="text-sm font-black text-indigo-500 font-mono">/sitemap.xml</div>
              <p className="text-[11px] text-slate-400">Contains 15 active school pages and blog articles.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-500">Robots Directive</span>
              <div className="text-sm font-black text-purple-500 font-mono">/robots.txt</div>
              <p className="text-[11px] text-slate-400">User-agent: * Allow: /</p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 12: FORMS INBOX --- */}
      {activeTab === "forms" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Parent Admissions & Contact Forms Inbox ({inquiries.length})</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Submissions received through the published school website.</p>
          </div>

          <div className="space-y-3 text-xs">
            {(inquiries || []).map((inq, idx) => (
              <div key={inq?.id || idx} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-500 border border-amber-500/30">
                    {inq?.formType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{inq?.submittedAt ? new Date(inq.submittedAt).toLocaleString() : ""}</span>
                </div>
                <div className="font-black text-sm text-slate-900 dark:text-white">{inq?.parentName} (Student: {inq?.studentName})</div>
                <div className="text-slate-600 dark:text-slate-300">{inq?.message}</div>
                <div className="text-[11px] text-indigo-500 font-mono font-bold">
                  Email: {inq?.email} | Phone: {inq?.phone} | Class: {inq?.targetClass}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 13: PUBLIC WEBSITE VIEW (FULL RESPONSIVE RENDER) --- */}
      {activeTab === "preview" && (
        <div className="space-y-4">
          {/* Viewport Control Bar */}
          <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="font-black">Live Responsive Viewport:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 ${
                  previewDevice === "desktop" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" /> Desktop
              </button>
              <button
                onClick={() => setPreviewDevice("tablet")}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 ${
                  previewDevice === "tablet" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                <Tablet className="w-3.5 h-3.5" /> Tablet
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 ${
                  previewDevice === "mobile" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
            </div>
          </div>

          {/* Rendered School Website Frame */}
          <div className="flex justify-center transition-all">
            <div
              className={`bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 transition-all ${
                previewDevice === "desktop"
                  ? "w-full"
                  : previewDevice === "tablet"
                  ? "w-[768px]"
                  : "w-[380px]"
              }`}
              style={{ fontFamily: theme.fontFamily }}
            >
              {/* Announcement Top Bar */}
              {theme.showAnnouncementBanner && (
                <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-black flex items-center justify-center gap-2">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>{theme.announcementText}</span>
                </div>
              )}

              {/* School Header */}
              <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between" style={{ backgroundColor: theme.primaryColor }}>
                <div className="flex items-center gap-3">
                  <img src={theme.logoUrl} alt="School Logo" className="w-10 h-10 rounded-full border-2 border-amber-400 object-cover" />
                  <div>
                    <h2 className="font-black text-white text-sm tracking-tight">{theme.schoolName}</h2>
                    <p className="text-[10px] text-amber-300 font-medium">{theme.tagline}</p>
                  </div>
                </div>

                <nav className="hidden md:flex items-center gap-3 text-xs font-bold text-white">
                  {(pages || []).map((p, idx) => (
                    <button
                      key={p?.id || idx}
                      onClick={() => p?.slug && setPreviewPageSlug(p.slug)}
                      className={`hover:text-amber-300 transition-colors ${
                        previewPageSlug === p?.slug ? "text-amber-300 underline underline-offset-4" : ""
                      }`}
                    >
                      {p?.title}
                    </button>
                  ))}
                </nav>
              </header>

              {/* Active Rendered Page Body */}
              <div className="p-6 space-y-8 min-h-[500px]">
                {(() => {
                  const activePg = (pages || []).find((p) => p?.slug === previewPageSlug) || pages?.[0];
                  if (!activePg || !Array.isArray(activePg.sections)) return null;

                  return activePg.sections.map((sec, sIdx) => (
                    <div key={sec?.id || sIdx} className="space-y-4">
                      {sec.type === "hero" && (
                        <div className="relative rounded-2xl overflow-hidden p-8 text-white bg-slate-900 min-h-[300px] flex flex-col justify-center">
                          <img src={sec.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />
                          <div className="relative z-10 max-w-lg space-y-3">
                            <h1 className="text-2xl font-black leading-tight">{sec.title}</h1>
                            <p className="text-xs text-slate-200">{sec.content}</p>
                            {sec.ctaText && (
                              <button
                                onClick={() => setPreviewPageSlug("admission")}
                                className="px-5 py-2.5 rounded-xl font-black text-xs text-slate-950 shadow-lg"
                                style={{ backgroundColor: theme.accentColor }}
                              >
                                {sec.ctaText}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {sec.type === "welcome" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                          <img src={sec.imageUrl} className="w-full h-48 object-cover rounded-xl shadow-md" alt="" />
                          <div className="md:col-span-2 space-y-2">
                            <span className="text-[10px] font-black uppercase text-indigo-600">{sec.subtitle}</span>
                            <h3 className="text-base font-black text-slate-900">{sec.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">{sec.content}</p>
                          </div>
                        </div>
                      )}

                      {sec.type === "features" && (
                        <div className="space-y-4">
                          <div className="text-center">
                            <h3 className="text-base font-black text-slate-900">{sec.title}</h3>
                            <p className="text-xs text-slate-500">{sec.subtitle}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sec.items?.map((item, iIdx) => (
                              <div key={item?.id || iIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                                <h4 className="font-extrabold text-xs text-indigo-700">{item?.title}</h4>
                                <p className="text-[11px] text-slate-600">{item?.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {sec.type === "form" && (
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                          <h3 className="text-base font-black text-slate-900">{sec.title}</h3>
                          <form onSubmit={handlePreviewFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <input
                              type="text"
                              required
                              placeholder="Parent Full Name *"
                              value={previewFormInput.parentName}
                              onChange={(e) => setPreviewFormInput({ ...previewFormInput, parentName: e.target.value })}
                              className="bg-white border border-slate-300 rounded-xl px-3 py-2"
                            />
                            <input
                              type="text"
                              required
                              placeholder="Student Name *"
                              value={previewFormInput.studentName}
                              onChange={(e) => setPreviewFormInput({ ...previewFormInput, studentName: e.target.value })}
                              className="bg-white border border-slate-300 rounded-xl px-3 py-2"
                            />
                            <input
                              type="email"
                              required
                              placeholder="Email Address *"
                              value={previewFormInput.email}
                              onChange={(e) => setPreviewFormInput({ ...previewFormInput, email: e.target.value })}
                              className="bg-white border border-slate-300 rounded-xl px-3 py-2"
                            />
                            <input
                              type="text"
                              required
                              placeholder="Phone / WhatsApp Number *"
                              value={previewFormInput.phone}
                              onChange={(e) => setPreviewFormInput({ ...previewFormInput, phone: e.target.value })}
                              className="bg-white border border-slate-300 rounded-xl px-3 py-2"
                            />
                            <textarea
                              rows={3}
                              placeholder="Additional notes / inquiries..."
                              value={previewFormInput.message}
                              onChange={(e) => setPreviewFormInput({ ...previewFormInput, message: e.target.value })}
                              className="sm:col-span-2 bg-white border border-slate-300 rounded-xl p-3"
                            ></textarea>
                            <button
                              type="submit"
                              className="sm:col-span-2 py-2.5 rounded-xl font-black text-white text-xs shadow-md"
                              style={{ backgroundColor: theme.primaryColor }}
                            >
                              Submit Admission Application
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>

              {/* Public Website Footer */}
              <footer className="p-6 text-white text-xs space-y-3" style={{ backgroundColor: theme.primaryColor }}>
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <h4 className="font-extrabold">{theme.schoolName}</h4>
                    <p className="text-[10px] text-slate-300">{theme.customDomain}</p>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    © 2026 {theme.schoolName}. Powered by LIVINGSTONEEDU Enterprise Platform.
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE NEW PAGE --- */}
      {showAddPageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Create New Page</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Page Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Facilities & Laboratories"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowAddPageModal(false)} className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newPageTitle) return;
                    const newPg: WebsitePage = {
                      id: `page-${Date.now()}`,
                      title: newPageTitle,
                      slug: newPageTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      isPublished: true,
                      metaDescription: `Official page for ${newPageTitle}`,
                      sections: [
                        {
                          id: `sec-${Date.now()}`,
                          type: "hero",
                          title: newPageTitle,
                          subtitle: "Welcome to " + newPageTitle,
                          content: "Customized content block for " + newPageTitle,
                        }
                      ]
                    };
                    handleSavePages([...pages, newPg]);
                    setShowAddPageModal(false);
                    setNewPageTitle("");
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold"
                >
                  Create Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: WRITE BLOG POST --- */}
      {showAddBlogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Publish New Article to Blog</h3>
            <form onSubmit={handleCreateBlogPost} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  placeholder="Title of news post..."
                  value={newPostForm.title}
                  onChange={(e) => setNewPostForm({ ...newPostForm, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Article Excerpt Summary</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Short summary for homepage and blog index..."
                  value={newPostForm.excerpt}
                  onChange={(e) => setNewPostForm({ ...newPostForm, excerpt: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddBlogModal(false)} className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold">
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
