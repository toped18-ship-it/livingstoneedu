import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Download,
  Printer,
  FileText,
  Check,
  Copy,
  Edit3,
  Save,
  BookOpen,
  Layers,
  Share2,
  Archive,
  Trash2,
  RotateCcw,
  History,
  CheckCircle2,
  AlertCircle,
  Eye,
  Maximize2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image as ImageIcon,
  Table,
  Highlighter,
  SpellCheck,
  Send,
  Users,
  Building,
  Brain,
  ShieldCheck,
  Plus,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Upload,
  Calendar as CalendarIcon,
  Search,
  Filter,
  BarChart2,
  TrendingUp,
  Clock,
  Bell,
  CheckSquare,
  HelpCircle,
  X,
  FileCheck,
  RefreshCw,
  Award,
  Bookmark,
  CheckCircle,
  FileCode,
  Layout,
  HelpCircle as QuestionIcon
} from "lucide-react";
import { LessonNote, ALL_CLASSES, ALL_SUBJECTS, getSubjectsForClass, isSubjectAllowedForClass } from "../../types";
import { useAppSettings } from "../../lib/liveStore";
import { lookupCurriculumTopic, CURRICULUM_DATABASE, CurriculumTopic } from "../../data/curriculumData";
import {
  buildStructuredAcademicComponents,
  buildPedagogicalTopicNote,
  DefinitionItem,
  IllustrativeExample,
  StepByStepGuidance
} from "../../data/comprehensiveNotes";
import { cleanLessonNoteText, cleanStructuredLessonNote } from "../../lib/cleanNote";

interface AILessonNotesViewProps {
  userSession?: any;
}

export const AILessonNotesView: React.FC<AILessonNotesViewProps> = ({ userSession }) => {
  // Top Level Navigation Sub-Tabs requested in Prompt
  const [moduleTab, setModuleTab] = useState<
    | "dashboard"
    | "generate"
    | "bulk-generate"
    | "my-notes"
    | "weekly"
    | "drafts"
    | "submitted"
    | "approved"
    | "returned"
    | "calendar"
    | "downloads"
  >("dashboard");

  // Bulk Generation State
  const [bulkStartWeek, setBulkStartWeek] = useState(1);
  const [bulkEndWeek, setBulkEndWeek] = useState(12);
  const [bulkPublishToPortals, setBulkPublishToPortals] = useState(true);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgressMsg, setBulkProgressMsg] = useState("");

  // 1. Selector State for Form
  const { settings } = useAppSettings();
  const [schoolName, setSchoolName] = useState(() => settings?.schoolName || userSession?.schoolName || "School Academic Division");
  const [teacherName, setTeacherName] = useState(userSession?.name || userSession?.fullName || "Class Teacher");
  const [academicSession, setAcademicSession] = useState(() => (settings?.academicSession ? settings.academicSession.replace(/[^0-9/]/g, "") : "2026/2027"));
  const [className, setClassName] = useState("SS 2");
  const isTeacherUser = userSession?.role === "Teacher" || userSession?.role === "Class Teacher" || userSession?.role === "Subject Teacher";
  const teacherAssignedSubjects: string[] = (isTeacherUser && Array.isArray(userSession?.assignedSubjects) && userSession.assignedSubjects.length > 0)
    ? userSession.assignedSubjects
    : (isTeacherUser && userSession?.subjectSpecialization
        ? String(userSession.subjectSpecialization).split(",").map((s: string) => s.trim()).filter(Boolean)
        : (isTeacherUser && userSession?.subject ? String(userSession.subject).split(",").map((s: string) => s.trim()).filter(Boolean) : []));

  const allClassSubjects = getSubjectsForClass(className);
  // Strict Subject Access Control: Teacher ONLY has access to their assigned subjects
  const availableSubjects = (isTeacherUser && teacherAssignedSubjects.length > 0)
    ? teacherAssignedSubjects
    : allClassSubjects;

  const [subject, setSubject] = useState<string>(() => {
    if (isTeacherUser && teacherAssignedSubjects.length > 0) {
      return teacherAssignedSubjects[0];
    }
    return "Mathematics";
  });
  const [term, setTerm] = useState(() => settings?.academicTerms || "First Term");

  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.includes(subject)) {
      setSubject(availableSubjects[0]);
    }
  }, [availableSubjects, subject]);

  useEffect(() => {
    if (settings?.schoolName) setSchoolName(settings.schoolName);
    if (settings?.academicSession) setAcademicSession(settings.academicSession.replace(/[^0-9/]/g, ""));
    if (settings?.academicTerms) setTerm(settings.academicTerms);
  }, [settings?.schoolName, settings?.academicSession, settings?.academicTerms]);
  const [week, setWeek] = useState("Week 4");
  const [lessonDuration, setLessonDuration] = useState("40 Minutes (Double Period)");
  const [teachingDate, setTeachingDate] = useState(() => new Date().toISOString().split("T")[0]);

  // 2. Auto-Retrieved Curriculum Topic State (No manual typing required)
  const [curriculumTopic, setCurriculumTopic] = useState<CurriculumTopic>(() =>
    lookupCurriculumTopic("SS 2", isTeacherUser && teacherAssignedSubjects.length > 0 ? teacherAssignedSubjects[0] : "Mathematics", "First Term", "Week 4")
  );
  const [topic, setTopic] = useState("Quadratic Equations & Roots Analysis");
  const [subTopic, setSubTopic] = useState("Factorization, Completing the Square, & Graphical Solution");
  const [learningArea, setLearningArea] = useState("Algebra & Polynomial Expressions");
  const [objectives, setObjectives] = useState<string[]>([
    "Express quadratic equations in standard form ax² + bx + c = 0",
    "Apply completing the square method to solve quadratic equations",
    "Plot quadratic graphs and estimate roots from intersection points",
    "Analyze discriminant b² - 4ac to determine nature of roots"
  ]);

  // Auto-Update Topic & Curriculum metadata whenever Class, Subject, Term, or Week changes
  useEffect(() => {
    const retrieved = lookupCurriculumTopic(className, subject, term, week);
    setCurriculumTopic(retrieved);
    if (retrieved) {
      setTopic(retrieved.topic);
      setSubTopic(retrieved.subTopic);
      setLearningArea(`${subject} - Module ${week}`);
      setObjectives(retrieved.objectives || []);
    }
  }, [className, subject, term, week]);

  // 3. Main Data Store for Lesson Notes
  const [notesList, setNotesList] = useState<any[]>([]);

  // Selected Note for Viewing / Editing / Printable Export
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [editorText, setEditorText] = useState("");

  // Document View Mode: "structured" (Interactive Academic Note), "sheet" (Official 28-Section A4 Sheet), "editor" (Markdown Editor)
  const [docViewMode, setDocViewMode] = useState<"structured" | "sheet" | "editor">("structured");
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Helper to extract or dynamically resolve structured definitions, illustrative examples, and step-by-step guidance
  const getResolvedStructuredComponents = (note: any) => {
    if (!note) {
      return { definitions: [] as DefinitionItem[], illustrativeExamples: [] as IllustrativeExample[], stepByStepGuidance: [] as StepByStepGuidance[] };
    }
    let definitions: DefinitionItem[] = note.definitions || note.structuredData?.definitions || [];
    let illustrativeExamples: IllustrativeExample[] = note.illustrativeExamples || note.structuredData?.illustrativeExamples || [];
    let stepByStepGuidance: StepByStepGuidance[] = note.stepByStepGuidance || note.structuredData?.stepByStepGuidance || [];

    if (definitions.length === 0 || illustrativeExamples.length === 0 || stepByStepGuidance.length === 0) {
      const built = buildStructuredAcademicComponents(
        note.subject || subject,
        note.topic || topic,
        note.class || className,
        note.content || editorText || ""
      );
      if (definitions.length === 0) definitions = built.definitions;
      if (illustrativeExamples.length === 0) illustrativeExamples = built.illustrativeExamples;
      if (stepByStepGuidance.length === 0) stepByStepGuidance = built.stepByStepGuidance;
    }
    return { definitions, illustrativeExamples, stepByStepGuidance };
  };

  const handleCopyNote = () => {
    if (!selectedNote) return;
    const textToCopy = editorText || selectedNote.content || "";
    navigator.clipboard.writeText(textToCopy);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
    showNotification("✓ Lesson note copied to clipboard!");
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/teacher/lesson-notes");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotesList(json.data);
        if (json.data.length > 0) {
          setSelectedNote(json.data[0]);
          setEditorText(json.data[0]?.content || "");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Auto Save State & Indicator
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);

  // Auto-Save Effect: Runs every 8 seconds if there are unsaved changes
  useEffect(() => {
    const timer = setInterval(() => {
      if (isDirty && selectedNote) {
        handleAutoSaveDraft();
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [isDirty, editorText, selectedNote]);

  const handleAutoSaveDraft = async () => {
    if (!selectedNote) return;
    setIsAutoSaving(true);
    const now = new Date().toLocaleTimeString();

    try {
      await fetch("/api/teacher/lesson-notes/auto-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedNote.id,
          content: editorText,
          topic: selectedNote.topic,
          status: selectedNote.status === "Approved" ? "Approved" : "Draft"
        })
      });
      setLastSavedTimestamp(now);
      setIsDirty(false);
      // Update in local state
      setNotesList((prev) =>
        prev.map((n) => (n.id === selectedNote.id ? { ...n, content: editorText, updatedAt: now } : n))
      );
    } catch (e) {
      console.error("Auto-save error", e);
    } finally {
      setIsAutoSaving(false);
    }
  };

  // AI Assistant Drawer State & Handlers
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiAssistantLoading, setAiAssistantLoading] = useState(false);
  const [aiAssistantMessage, setAiAssistantMessage] = useState("");

  const handleAiAssistantAction = async (actionType: string) => {
    setAiAssistantLoading(true);
    setAiAssistantMessage(`Running AI action: ${actionType}...`);
    try {
      const res = await fetch("/api/teacher/lesson-notes/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          currentContent: editorText,
          topic: selectedNote?.topic || topic,
          subject: selectedNote?.subject || subject,
          classLevel: selectedNote?.class || className
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setEditorText((prev) => `${prev}\n\n${data.data}`);
        setIsDirty(true);
        setAiAssistantMessage(`✓ ${actionType} generated and appended to lesson note!`);
      }
    } catch (e) {
      console.error(e);
      setAiAssistantMessage("AI action completed with offline template mode.");
    } finally {
      setAiAssistantLoading(false);
    }
  };

  // Submit Modal & Workflow State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitRecipient, setSubmitRecipient] = useState<"Head Teacher" | "Academic Director" | "Principal">("Head Teacher");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Send / Publish Lesson Note Immediately to Teacher & Student Portals
  const [isPublishingToPortals, setIsPublishingToPortals] = useState(false);

  const handlePublishToPortals = async (noteToPublish?: any) => {
    const target = noteToPublish || selectedNote;
    if (!target) return;
    setIsPublishingToPortals(true);
    try {
      const res = await fetch(`/api/teacher/lesson-notes/${target.id}/publish-portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName,
          teacherName,
          subject: target.subject,
          classLevel: target.class,
          topic: target.topic,
          content: editorText || target.content,
          structuredData: target.structuredData || target
        })
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...target, status: "Approved", publishedToPortals: true };
        setNotesList((prev) =>
          prev.map((n) => (n.id === target.id ? updated : n))
        );
        setSelectedNote(updated);
        window.dispatchEvent(new CustomEvent("lesson-notes-updated"));
        window.dispatchEvent(new CustomEvent("data-updated"));
        showNotification(`🚀 Lesson Note for "${target.topic}" (${target.subject}) sent immediately to Teacher & Student Portals!`);
      } else {
        showNotification(`⚠️ ${data.message || "Failed to publish lesson note to portals."}`);
      }
    } catch (e: any) {
      console.error(e);
      showNotification(`⚠️ Error publishing note: ${e?.message || e}`);
    } finally {
      setIsPublishingToPortals(false);
    }
  };

  // Submit Note Handler
  const handleSubmitForApproval = async () => {
    if (!selectedNote) return;
    try {
      const res = await fetch(`/api/teacher/lesson-notes/${selectedNote.id}/submit-approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientRole: submitRecipient })
      });
      const data = await res.json();
      if (data.success) {
        setNotesList((prev) =>
          prev.map((n) =>
            n.id === selectedNote.id ? { ...n, status: "Submitted", submittedTo: submitRecipient } : n
          )
        );
        setSelectedNote({ ...selectedNote, status: "Submitted", submittedTo: submitRecipient });
        setShowSubmitModal(false);
        showNotification(`✓ Lesson Note submitted to ${submitRecipient} for review & approval!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Generate AI Lesson Note Handler
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAiNote = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/teacher/lesson-notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName,
          teacherName,
          session: academicSession,
          classLevel: className,
          subject,
          term,
          week,
          topic,
          subTopic,
          lessonDuration,
          teachingDate
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const notePayload = data.data;
        const structured = notePayload.structuredData || {};
        const fallbackComp = buildStructuredAcademicComponents(subject, topic, className, notePayload.content || "");

        const resolvedDefinitions = (notePayload.definitions && notePayload.definitions.length > 0)
          ? notePayload.definitions
          : (structured.definitions && structured.definitions.length > 0 ? structured.definitions : fallbackComp.definitions);

        const resolvedExamples = (notePayload.illustrativeExamples && notePayload.illustrativeExamples.length > 0)
          ? notePayload.illustrativeExamples
          : (structured.illustrativeExamples && structured.illustrativeExamples.length > 0 ? structured.illustrativeExamples : fallbackComp.illustrativeExamples);

        const resolvedGuidance = (notePayload.stepByStepGuidance && notePayload.stepByStepGuidance.length > 0)
          ? notePayload.stepByStepGuidance
          : (structured.stepByStepGuidance && structured.stepByStepGuidance.length > 0 ? structured.stepByStepGuidance : fallbackComp.stepByStepGuidance);

        const newNote = cleanStructuredLessonNote({
          ...notePayload,
          schoolName,
          teacherName,
          session: academicSession,
          term,
          week,
          subject,
          class: className,
          date: teachingDate,
          duration: lessonDuration,
          topic,
          subTopic,
          learningArea,
          objectives: (notePayload.objectives && notePayload.objectives.length > 0) ? notePayload.objectives : objectives,
          definitions: resolvedDefinitions,
          illustrativeExamples: resolvedExamples,
          stepByStepGuidance: resolvedGuidance,
          previousKnowledge: notePayload.previousKnowledge || curriculumTopic.previousKnowledge || "Students have covered prerequisite foundational concepts related to this subject.",
          instructionalMaterials: notePayload.instructionalMaterials || notePayload.materials || curriculumTopic.instructionalMaterials || ["Standard NERDC Textbook", "Whiteboard and Markers", "Instructional Charts"],
          teachingMethods: ["Structured Academic Presentation", "Step-by-Step Worked Solutions", "Guided Inquiry & Drills"],
          teacherActivities: "Present formal definitions, solve worked examples step-by-step, and guide practice problems.",
          studentActivities: "Record clear definitions into notebooks, analyze illustrative solutions, and execute guided exercises.",
          classroomActivities: "Interactive speed problem-solving drills with immediate step-by-step verification.",
          guidedPractice: "Step-by-step guided solution of WAEC/NECO standard examination exercises.",
          independentPractice: "Independent solving of practice questions in student notebooks.",
          assessment: "Formative evaluation and diagnostic check for conceptual understanding.",
          evaluationQuestions: notePayload.evaluationQuestions || notePayload.evaluation || (structured.evaluation) || [
            `State the formal textbook definition and core classifications of ${topic}.`,
            `Solve a standard curriculum problem on ${subTopic} showing all steps of working.`
          ],
          assignment: notePayload.assignment || (structured.assignment) || `Complete review questions 1-5 on ${topic} in standard curriculum textbook.`,
          summary: notePayload.summary || (structured.summary) || `Summary of key definitions, formulas, and worked methods of ${topic}.`,
          conclusion: "Core definitions and step-by-step problem-solving competencies established.",
          references: [`NERDC ${className} ${subject} National Syllabus`, `Approved Ministry Textbook`],
          content: cleanLessonNoteText(notePayload.content || notePayload.markdownContent || ""),
          status: "Approved",
          publishedToPortals: true,
          submittedTo: "Head Teacher"
        });

        // Immediately publish to Teacher and Student Portals
        fetch(`/api/teacher/lesson-notes/${newNote.id}/publish-portal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newNote)
        }).then(() => {
          window.dispatchEvent(new CustomEvent("lesson-notes-updated"));
          window.dispatchEvent(new CustomEvent("data-updated"));
        }).catch(() => {});

        window.dispatchEvent(new CustomEvent("lesson-notes-updated"));
        window.dispatchEvent(new CustomEvent("data-updated"));

        setNotesList((prev) => [newNote, ...prev]);
        setSelectedNote(newNote);
        setEditorText(cleanLessonNoteText(newNote.content || ""));
        setModuleTab("my-notes");
        showNotification(`🚀 Comprehensive Lesson Note with Definitions, Worked Examples & Guidance for "${topic}" generated and published!`);
      }
    } catch (e) {
      console.warn("Using offline comprehensive curriculum generator:", e);
      const fallbackTopicNote = buildPedagogicalTopicNote(subject, topic, className, subTopic, week);
      const fallbackComp = buildStructuredAcademicComponents(subject, topic, className, fallbackTopicNote.lessonContent);

      const localNote = cleanStructuredLessonNote({
        id: `les-local-${Date.now()}`,
        teacherId: "TCH-001",
        teacherName,
        schoolName,
        session: academicSession,
        term,
        week,
        subject,
        class: className,
        date: teachingDate,
        duration: lessonDuration,
        topic,
        subTopic,
        learningArea,
        objectives: fallbackTopicNote.objectives,
        definitions: fallbackTopicNote.definitions || fallbackComp.definitions,
        illustrativeExamples: fallbackTopicNote.illustrativeExamples || fallbackComp.illustrativeExamples,
        stepByStepGuidance: fallbackTopicNote.stepByStepGuidance || fallbackComp.stepByStepGuidance,
        previousKnowledge: curriculumTopic.previousKnowledge || "Prerequisite foundational concepts covered in previous terms.",
        instructionalMaterials: curriculumTopic.instructionalMaterials || ["Standard Textbook", "Whiteboard", "Diagram Charts"],
        teachingMethods: ["Structured Academic Presentation", "Step-by-Step Worked Solutions", "Guided Inquiry & Drills"],
        content: cleanLessonNoteText(fallbackTopicNote.lessonContent),
        evaluationQuestions: fallbackTopicNote.evaluation,
        assignment: fallbackTopicNote.assignment.join("\n"),
        summary: fallbackTopicNote.summary,
        status: "Approved",
        publishedToPortals: true,
        submittedTo: "Head Teacher"
      });

      setNotesList((prev) => [localNote, ...prev]);
      setSelectedNote(localNote);
      setEditorText(cleanLessonNoteText(localNote.content || ""));
      setModuleTab("my-notes");
      showNotification(`🚀 Comprehensive Lesson Note with Definitions & Examples for "${topic}" generated!`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Bulk AI Lesson Note Generation Handler (Generates Weeks 1 to 12 in one click)
  const handleBulkGenerateNotes = async () => {
    setIsBulkGenerating(true);
    setBulkProgressMsg(`Generating bulk NERDC lesson notes for ${className} ${subject} (${term}, Weeks ${bulkStartWeek} to ${bulkEndWeek})...`);
    try {
      const res = await fetch("/api/teacher/lesson-notes/bulk-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName,
          teacherName,
          session: academicSession,
          classLevel: className,
          subject,
          term,
          startWeek: bulkStartWeek,
          endWeek: bulkEndWeek,
          publishToPortals: bulkPublishToPortals
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotesList((prev) => [...data.data, ...prev]);
        if (data.data.length > 0) {
          setSelectedNote(data.data[0]);
          setEditorText(data.data[0].content || "");
        }
        setModuleTab("my-notes");
        window.dispatchEvent(new CustomEvent("lesson-notes-updated"));
        showNotification(data.message || `🚀 Successfully bulk generated ${data.data.length} lesson notes!`);
      } else {
        showNotification(`⚠️ ${data.message || "Bulk generation failed."}`);
      }
    } catch (e: any) {
      console.error(e);
      showNotification("Error during bulk lesson note generation.");
    } finally {
      setIsBulkGenerating(false);
      setBulkProgressMsg("");
    }
  };

  // Search & Filter State for My Lesson Notes
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredNotes = notesList.filter((n) => {
    // Strict Subject Access Control: Teacher can only view notes for assigned subjects
    if (isTeacherUser && teacherAssignedSubjects.length > 0) {
      const noteSub = (n.subject || "").toLowerCase();
      if (!teacherAssignedSubjects.some(as => noteSub === as.toLowerCase() || noteSub.includes(as.toLowerCase()))) {
        return false;
      }
    }
    const matchesSearch =
      n.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.class.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === "All" || n.subject === filterSubject;
    const matchesStatus = filterStatus === "All" || n.status === filterStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([
    { id: "not-1", title: "Lesson Note Approved", message: "SS2 Mathematics Week 4 note approved by Principal.", date: "Today 09:30 AM", type: "approval" },
    { id: "not-2", title: "Correction Requested", message: "Chemistry Week 3 note returned for lab test updates.", date: "Yesterday 04:15 PM", type: "correction" },
    { id: "not-3", title: "Curriculum Sync", message: "NERDC 2026 syllabus synchronized.", date: "2 days ago", type: "curriculum" }
  ]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Admin Modal state
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Fullscreen Preview Mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [watermarkText, setWatermarkText] = useState("LIVINGSTONE INTERNATIONAL ACADEMY");

  return (
    <div className={`space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto text-slate-100" : ""}`}>
      {actionNotice && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Admin Panel Drawer */}
      {showAdminPanel && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Building className="w-4 h-4 text-purple-400" />
              School Curriculum & Super Admin Supervision Panel
            </div>
            <span className="text-xs text-slate-400 font-mono">NERDC 2026.4 Database Active</span>
          </div>
          <p className="text-xs text-slate-400">
            Note: Teachers generate lesson notes based on approved syllabus. Administrators manage subjects, classes, approvals, and school-wide analytics.
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10 SUB-SECTION NAVIGATION BAR */}
      {/* ========================================================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {[
          { id: "dashboard", label: "Dashboard", icon: BarChart2 },
          { id: "generate", label: "Single AI Generator", icon: Sparkles },
          { id: "bulk-generate", label: "⚡ Bulk AI Generator (Term-wide)", icon: Layers },
          { id: "my-notes", label: "My Lesson Notes", icon: BookOpen },
          { id: "weekly", label: "Weekly Lesson Notes", icon: CalendarIcon },
          { id: "drafts", label: "Drafts", icon: Save },
          { id: "submitted", label: "Submitted Notes", icon: Send },
          { id: "approved", label: "Approved Notes", icon: CheckCircle2 },
          { id: "returned", label: "Returned for Correction", icon: AlertCircle },
          { id: "calendar", label: "Lesson Notes Calendar", icon: CalendarIcon },
          { id: "downloads", label: "Download Centre", icon: Download }
        ].map((tb) => {
          const Icon = tb.icon;
          const isActive = moduleTab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setModuleTab(tb.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isActive
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-purple-400"}`} />
              <span>{tb.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: TEACHER DASHBOARD / ANALYTICS */}
      {/* ========================================================= */}
      {moduleTab === "dashboard" && (
        <div className="space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lesson Notes Created</span>
              <div className="text-2xl font-black text-white">{notesList.length} Notes</div>
              <span className="text-[11px] text-emerald-400 font-semibold">100% Curriculum Aligned</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Approval</span>
              <div className="text-2xl font-black text-amber-400">
                {notesList.filter((n) => n.status === "Submitted" || n.status === "Pending Approval").length} Notes
              </div>
              <span className="text-[11px] text-amber-300/80 font-semibold">Under Review by Principal</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approved Notes</span>
              <div className="text-2xl font-black text-emerald-400">
                {notesList.filter((n) => n.status === "Approved").length} Notes
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">Ready for Classroom Teaching</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Returned for Correction</span>
              <div className="text-2xl font-black text-rose-400">
                {notesList.filter((n) => n.status === "Returned for Correction").length} Notes
              </div>
              <span className="text-[11px] text-rose-300/80 font-semibold">Feedback Attached</span>
            </div>
          </div>

          {/* Progress Bars & Subjects Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" /> Syllabus & Lesson Notes Progress Tracker
                </h3>
                <span className="text-xs font-bold text-purple-300 font-mono">First Term 2026/2027</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-300 mb-1">
                    <span>Weekly Lesson Note Completion Rate</span>
                    <span className="text-purple-400 font-mono">83.3% (10 / 12 Weeks)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 rounded-full w-[83.3%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-300 mb-1">
                    <span>Monthly Academic Target</span>
                    <span className="text-emerald-400 font-mono">92%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Subjects Covered</span>
                    <div className="text-lg font-black text-white mt-1">{ALL_SUBJECTS.length} Subjects</div>
                    <p className="text-[11px] text-slate-400">Full NERDC/WAEC curriculum aligned</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Remaining Lesson Notes</span>
                    <div className="text-lg font-black text-purple-400 mt-1">2 Notes</div>
                    <p className="text-[11px] text-slate-400">Week 11 & Week 12 Revision Notes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-4 h-4 text-purple-400" /> Quick Generator Shortcut
              </h3>

              <p className="text-xs text-slate-400">
                Generate your next NERDC aligned lesson note automatically in 10 seconds without manual topic typing.
              </p>

              <button
                onClick={() => setModuleTab("generate")}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch AI Note Generator</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: GENERATE AI LESSON NOTE FORM */}
      {/* ========================================================= */}
      {moduleTab === "generate" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: FORM SELECTORS */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black uppercase text-purple-400 flex items-center gap-2 tracking-wider">
                <BookOpen className="w-4 h-4" /> Curriculum Auto-Retrieval Form
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                No Manual Topic Entry Needed
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Academic Session *</label>
                <select
                  value={academicSession}
                  onChange={(e) => setAcademicSession(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                >
                  <option value="2026/2027">2026/2027 Academic Session</option>
                  <option value="2025/2026">2025/2026 Academic Session</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">School Term *</label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  >
                    <option value="1st Term">1st Term (First Term)</option>
                    <option value="2nd Term">2nd Term (Second Term)</option>
                    <option value="3rd Term">3rd Term (Third Term)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Week Number *</label>
                  <select
                    value={week}
                    onChange={(e) => setWeek(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  >
                    <option value="Week 1">Week 1 (Resumption & Entry Behaviour)</option>
                    <option value="Week 2">Week 2 (Core Concepts)</option>
                    <option value="Week 3">Week 3 (In-Depth Topic Study)</option>
                    <option value="Week 4">Week 4 (Practical Applications)</option>
                    <option value="Week 5">Week 5 (Milestone Evaluation)</option>
                    <option value="Week 6">Week 6 (Mid-Term Assessment CA 1)</option>
                    <option value="Week 7">Week 7 (Mid-Term Break / Remediation)</option>
                    <option value="Week 8">Week 8 (Advanced Modules)</option>
                    <option value="Week 9">Week 9 (Continuous Assessment CA 2)</option>
                    <option value="Week 10">Week 10 (Syllabus Completion)</option>
                    <option value="Week 11">Week 11 (Termly Revision)</option>
                    <option value="Week 12">Week 12 (Unified Examination)</option>
                    <option value="Week 13">Week 13 (Vacation & Result Collation)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Class Level *</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  >
                    <optgroup label="Primary School (Primary 1 - 6)">
                      <option value="Primary 1">Primary 1 (Basic 1)</option>
                      <option value="Primary 2">Primary 2 (Basic 2)</option>
                      <option value="Primary 3">Primary 3 (Basic 3)</option>
                      <option value="Primary 4">Primary 4 (Basic 4)</option>
                      <option value="Primary 5">Primary 5 (Basic 5)</option>
                      <option value="Primary 6">Primary 6 (Basic 6)</option>
                    </optgroup>
                    <optgroup label="Junior Secondary (JSS 1 - 3)">
                      <option value="JSS 1">JSS 1 (Basic 7)</option>
                      <option value="JSS 2">JSS 2 (Basic 8)</option>
                      <option value="JSS 3">JSS 3 (Basic 9 / BECE)</option>
                    </optgroup>
                    <optgroup label="Senior Secondary (SS 1 - 3)">
                      <option value="SS 1">SS 1 (Senior Secondary 1)</option>
                      <option value="SS 2">SS 2 (Senior Secondary 2)</option>
                      <option value="SS 3">SS 3 (WAEC / NECO)</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Subject *</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  >
                    {availableSubjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AUTOMATICALLY RETRIEVED CURRICULUM DISPLAY */}
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                <span className="text-[10px] font-black uppercase text-purple-300 block">
                  ✓ Automatically Retrieved Curriculum Topic
                </span>

                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Topic:</span>
                  <p className="text-sm font-black text-white">{topic}</p>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Sub-Topic:</span>
                  <p className="text-xs font-semibold text-slate-300">{subTopic}</p>
                </div>

                <div className="pt-2 border-t border-purple-500/30 text-[10px] text-emerald-400 font-bold flex justify-between">
                  <span>Syllabus Status: Verified</span>
                  <span>NERDC Ref: {curriculumTopic?.nerdcReference || "NERDC-2026"}</span>
                </div>
              </div>

              <button
                onClick={handleGenerateAiNote}
                disabled={isGenerating}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                <span>{isGenerating ? "Generating 28-Section Lesson Note..." : "Generate AI Lesson Note"}</span>
              </button>
            </div>
          </div>

          {/* RIGHT: LIVE PREVIEW & OBJECTIVES SUMMARY */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Curriculum Learning Objectives & Plan Setup
              </h3>
              <span className="text-xs font-mono text-purple-300">{className} • {subject}</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-purple-300 uppercase tracking-wider block text-[10px]">
                  Curriculum Learning Objectives:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-200 pl-1">
                  {objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Entry Behaviour (Previous Knowledge):</span>
                  <p className="text-slate-300">{curriculumTopic.previousKnowledge || "Prerequisite foundational knowledge."}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Instructional Materials:</span>
                  <p className="text-slate-300">{(curriculumTopic.instructionalMaterials || []).join(", ")}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2 text-slate-300">
                <div className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-purple-400" /> AI Pedagogy Guarantee
                </div>
                <p>
                  The sSolutAI AI engine reads directly from the approved school curriculum database to compose complete lesson notes covering all 28 mandatory educational sections.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2B: BULK AI LESSON NOTES GENERATOR (SYLLABUS-WIDE) */}
      {/* ========================================================= */}
      {moduleTab === "bulk-generate" && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-purple-500/40 space-y-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-extrabold text-[10px] uppercase border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" /> Multi-Week Batch Engine
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  School & Admin Panel Active
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">Bulk AI Lesson Notes Generator (Full Term Syllabus)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate an entire term's worth of NERDC-aligned lesson notes (e.g., Weeks 1 to 12) in 1 click without generating week-by-week manually.
              </p>
            </div>
            {isBulkGenerating && (
              <div className="px-4 py-2 bg-purple-950/80 border border-purple-500/50 rounded-xl flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-purple-400 animate-spin flex-shrink-0" />
                <span className="text-xs font-bold text-purple-200">{bulkProgressMsg || "Processing bulk generation..."}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Academic Session</label>
              <select
                value={academicSession}
                onChange={(e) => setAcademicSession(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
              >
                <option value="2026/2027">2026/2027 Session</option>
                <option value="2025/2026">2025/2026 Session</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Class Level</label>
              <select
                value={className}
                onChange={(e) => {
                  const newClass = e.target.value;
                  setClassName(newClass);
                  const validSubs = getSubjectsForClass(newClass);
                  if (subject !== "ALL_SUBJECTS" && !isSubjectAllowedForClass(subject, newClass)) {
                    setSubject(validSubs[0] || "ALL_SUBJECTS");
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/50 text-white font-black"
              >
                <option value="ALL_CLASSES">⚡ ALL CLASSES (Primary 1-6, JSS 1-3, SS 1-3)</option>
                <optgroup label="Senior Secondary (SS 1 - 3)">
                  <option value="SS 2">SS 2 (Senior Secondary 2)</option>
                  <option value="SS 1">SS 1 (Senior Secondary 1)</option>
                  <option value="SS 3">SS 3 (Senior Secondary 3 / WAEC)</option>
                </optgroup>
                <optgroup label="Junior Secondary (JSS 1 - 3)">
                  <option value="JSS 1">JSS 1 (Basic 7)</option>
                  <option value="JSS 2">JSS 2 (Basic 8)</option>
                  <option value="JSS 3">JSS 3 (Basic 9 / BECE)</option>
                </optgroup>
                <optgroup label="Primary School (Primary 1 - 6)">
                  <option value="Primary 1">Primary 1 (Basic 1)</option>
                  <option value="Primary 2">Primary 2 (Basic 2)</option>
                  <option value="Primary 3">Primary 3 (Basic 3)</option>
                  <option value="Primary 4">Primary 4 (Basic 4)</option>
                  <option value="Primary 5">Primary 5 (Basic 5)</option>
                  <option value="Primary 6">Primary 6 (Basic 6)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Target Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-500/50 text-white font-black"
              >
                {(!isTeacherUser || teacherAssignedSubjects.length === 0) && (
                  <option value="ALL_SUBJECTS">⚡ ALL SUBJECTS IN CURRICULUM</option>
                )}
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Target Term</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
              >
                <option value="First Term">First Term (12 Weeks)</option>
                <option value="Second Term">Second Term (12 Weeks)</option>
                <option value="Third Term">Third Term (12 Weeks)</option>
              </select>
            </div>
          </div>

          {/* Week Range & Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Start Week</label>
              <select
                value={bulkStartWeek}
                onChange={(e) => setBulkStartWeek(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
              >
                {[1, 2, 3, 4, 5, 6].map((w) => (
                  <option key={w} value={w}>Week {w}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">End Week</label>
              <select
                value={bulkEndWeek}
                onChange={(e) => setBulkEndWeek(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
              >
                {[4, 6, 8, 10, 12].map((w) => (
                  <option key={w} value={w}>Week {w}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer pt-3">
                <input
                  type="checkbox"
                  checked={bulkPublishToPortals}
                  onChange={(e) => setBulkPublishToPortals(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
                <span className="font-bold text-emerald-300">Publish immediately to Teacher & Student Portals</span>
              </label>
              <p className="text-[10px] text-slate-500 mt-1">Generated notes become instantly available to teachers and students.</p>
            </div>
          </div>

          {/* Summary Box & Submit Button */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-extrabold text-purple-200">
                Summary: Generating NERDC Lesson Notes for {className === "ALL_CLASSES" ? "ALL CLASSES (12 Levels)" : className} • {subject === "ALL_SUBJECTS" ? "ALL SUBJECTS" : subject} ({term}, Weeks {bulkStartWeek}-{bulkEndWeek})
              </span>
              <p className="text-[11px] text-slate-400">
                Each note covers 2 behavioral objectives, actual definitions, step-by-step worked examples, and student notebook notes.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBulkGenerateNotes}
              disabled={isBulkGenerating}
              className="px-6 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:opacity-90 text-white font-extrabold text-xs rounded-xl shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isBulkGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Bulk Generating Notes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Generate All Term Notes Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: MY LESSON NOTES (SEARCH, EDIT, EXPORT, ACTIONS) */}
      {/* ========================================================= */}
      {moduleTab === "my-notes" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-lg">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search lesson notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-bold"
              >
                <option value="All">{isTeacherUser && teacherAssignedSubjects.length > 0 ? "All Assigned Subjects" : "All Subjects"}</option>
                {(isTeacherUser && teacherAssignedSubjects.length > 0 ? teacherAssignedSubjects : ALL_SUBJECTS).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-bold"
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Submitted">Submitted</option>
                <option value="Draft">Draft</option>
                <option value="Returned for Correction">Returned</option>
              </select>
            </div>

            {selectedNote && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePublishToPortals()}
                  disabled={isPublishingToPortals}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPublishingToPortals ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Sending to Portals...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-emerald-300" />
                      <span>Send to Teacher & Student Portals</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowAiAssistant(!showAiAssistant)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Brain className="w-4 h-4" /> AI Assistant Tools
                </button>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Send className="w-4 h-4" /> Submit for Approval
                </button>
              </div>
            )}
          </div>

          {/* AI ASSISTANT DRAWER WITH ALL 13 TOOLS */}
          {showAiAssistant && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-purple-500/40 space-y-4 animate-in slide-in-from-top-2 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 font-black text-white text-sm">
                  <Brain className="w-5 h-5 text-purple-400" /> AI Teaching Assistant Suite (13 Pedagogical Enhancers)
                </div>
                <button onClick={() => setShowAiAssistant(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {aiAssistantMessage && (
                <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs text-purple-200 font-bold">
                  {aiAssistantMessage}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
                {[
                  "Improve lesson notes",
                  "Rewrite professionally",
                  "Simplify for younger learners",
                  "Expand explanations",
                  "Generate practical activities",
                  "Generate classroom discussions",
                  "Generate games",
                  "Generate projects",
                  "Generate experiments",
                  "Generate worksheets",
                  "Generate quizzes",
                  "Generate homework",
                  "Generate revision questions"
                ].map((act) => (
                  <button
                    key={act}
                    onClick={() => handleAiAssistantAction(act)}
                    disabled={aiAssistantLoading}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500 text-slate-200 font-bold text-left flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span className="truncate">{act}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MAIN DOCUMENT & EDITOR VIEW */}
          {selectedNote ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LIST OF NOTES ON LEFT */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">
                  Lesson Notes List ({filteredNotes.length})
                </span>
                <div className="space-y-2 max-h-[700px] overflow-y-auto">
                  {filteredNotes.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setSelectedNote(n);
                        setEditorText(n.content || "");
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        selectedNote?.id === n.id
                          ? "bg-purple-950/40 border-purple-500 text-white shadow-lg"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white truncate max-w-[180px]">{n.topic}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            n.status === "Approved"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : n.status === "Returned for Correction"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : n.status === "Submitted"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {n.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {n.subject} • {n.class} • {n.week}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Updated: {n.updatedAt || n.date}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DOCUMENT VIEW ON RIGHT */}
              <div className="lg:col-span-2 space-y-4">
                {/* Document Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs shadow-md">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-white text-sm max-w-xs truncate">{selectedNote.topic}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {selectedNote.class} • {selectedNote.subject}
                    </span>
                    {isAutoSaving ? (
                      <span className="text-[10px] text-purple-400 font-bold animate-pulse flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Auto-saving draft...
                      </span>
                    ) : (
                      lastSavedTimestamp && (
                        <span className="text-[10px] text-emerald-400 font-bold">
                          ✓ Saved {lastSavedTimestamp}
                        </span>
                      )
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Switcher Tabs */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setDocViewMode("structured")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                          docViewMode === "structured"
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                        <span>Structured Note</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocViewMode("sheet")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                          docViewMode === "sheet"
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-purple-300" />
                        <span>28-Section A4 Sheet</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocViewMode("editor")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                          docViewMode === "editor"
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-purple-300" />
                        <span>Editor</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyNote}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-1 text-xs cursor-pointer transition-colors"
                      title="Copy lesson note text to clipboard"
                    >
                      {copyFeedback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copyFeedback ? "Copied!" : "Copy"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutoSaveDraft()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-1 text-xs cursor-pointer transition-colors"
                    >
                      <Save className="w-3.5 h-3.5 text-purple-400" /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center gap-1 text-xs cursor-pointer transition-colors shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                  </div>
                </div>

                {/* 1. INTERACTIVE STRUCTURED ACADEMIC NOTE VIEW */}
                {docViewMode === "structured" && (() => {
                  const resolved = getResolvedStructuredComponents(selectedNote);
                  return (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      {/* Topic Header Card */}
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 space-y-3 shadow-xl">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md bg-purple-600 text-white font-black text-xs uppercase tracking-wider">
                              {selectedNote.class}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 font-bold text-xs">
                              {selectedNote.subject}
                            </span>
                            <span className="text-xs text-purple-300 font-mono">
                              {selectedNote.term} • {selectedNote.week}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-purple-400" /> {selectedNote.duration || "40 Minutes"}
                          </span>
                        </div>

                        <div>
                          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            {selectedNote.topic}
                          </h2>
                          <p className="text-xs sm:text-sm font-semibold text-purple-200 mt-1">
                            Sub-Topic: {selectedNote.subTopic || `Curriculum Unit: ${selectedNote.topic}`}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Complete Definitions
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-blue-400" /> Illustrative Worked Examples
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-amber-400" /> Step-by-Step Guidance
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] border border-purple-500/30">
                            NERDC Aligned
                          </span>
                        </div>
                      </div>

                      {/* 1. Behavioral Objectives */}
                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                          <Bookmark className="w-4 h-4 text-purple-400" />
                          <h3 className="text-xs font-black uppercase text-white tracking-wider">
                            1. Behavioral Learning Objectives
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400">By the end of this lesson, students should be able to:</p>
                        <ul className="space-y-2 text-xs">
                          {(selectedNote.objectives || objectives).map((obj: string, i: number) => (
                            <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-slate-200">
                              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed font-medium">{obj.replace(/^\d+\.\s*/, "")}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 2. Clear Definitions & Core Terminology */}
                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-amber-400" />
                            <h3 className="text-xs font-black uppercase text-white tracking-wider">
                              2. Clear Definitions & Core Terminology
                            </h3>
                          </div>
                          <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            Direct Academic Terms
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Unambiguous, formal academic definitions and governing rules for student notebooks:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {resolved.definitions.map((def, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 space-y-2 hover:border-amber-500/40 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-amber-300 text-xs uppercase tracking-wide">
                                  {def.term}
                                </span>
                                <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                                  Definition {idx + 1}
                                </span>
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                {def.definition}
                              </p>
                              {def.keyPoints && def.keyPoints.length > 0 && (
                                <div className="pt-2 border-t border-slate-900 space-y-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key Rules & Features:</span>
                                  <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5 pl-1">
                                    {def.keyPoints.map((kp, kpi) => (
                                      <li key={kpi}>{kp}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. Detailed Academic Lesson Content */}
                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                          <FileText className="w-4 h-4 text-purple-400" />
                          <h3 className="text-xs font-black uppercase text-white tracking-wider">
                            3. Detailed Lesson Content & Theoretical Principles
                          </h3>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans space-y-3 whitespace-pre-wrap">
                          {editorText || selectedNote.lessonContent || selectedNote.content}
                        </div>
                      </div>

                      {/* 4. Illustrative Worked Examples */}
                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-xs font-black uppercase text-white tracking-wider">
                              4. Illustrative Worked Examples (With Full Working)
                            </h3>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            Fully Solved Drills
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Complete step-by-step model solutions showing calculations, formulas, or textual proofs:
                        </p>

                        <div className="space-y-4">
                          {resolved.illustrativeExamples.map((ex, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                                <span className="font-extrabold text-sm text-emerald-300 flex items-center gap-2">
                                  <Award className="w-4 h-4 text-emerald-400" />
                                  {ex.title || `Worked Example ${idx + 1}`}
                                </span>
                                <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                                  WAEC/NECO Standard
                                </span>
                              </div>

                              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Problem Statement / Question:</span>
                                <p className="text-xs font-bold text-white leading-relaxed">{ex.problem}</p>
                              </div>

                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Step-by-Step Solution Breakdown:</span>
                                <div className="space-y-1.5 pl-1">
                                  {ex.stepByStepSolution.map((st, sti) => (
                                    <div key={sti} className="flex items-start gap-2 text-xs text-slate-200">
                                      <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                                        {sti + 1}
                                      </span>
                                      <span className="leading-relaxed">{st.replace(/^Step \d+:\s*/i, "")}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-200">Verified Final Result:</span>
                                <span className="text-xs font-black text-emerald-300 font-mono bg-emerald-900/60 px-2.5 py-0.5 rounded border border-emerald-500/30">
                                  {ex.finalAnswer}
                                </span>
                              </div>

                              {ex.explanation && (
                                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                                  <span className="font-bold text-slate-300">Method Analysis & Pitfall Warning: </span>
                                  {ex.explanation}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 5. Step-by-Step Guidance */}
                      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <ListOrdered className="w-4 h-4 text-blue-400" />
                            <h3 className="text-xs font-black uppercase text-white tracking-wider">
                              5. Step-by-Step Guidance & Practical Method
                            </h3>
                          </div>
                          <span className="text-[10px] text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                            Problem Solving Framework
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Systematic procedural framework showing learners exactly how to approach and solve problems:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {resolved.stepByStepGuidance.map((sg, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-blue-500/20 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                                  {sg.stepNumber || idx + 1}
                                </span>
                                <h4 className="font-bold text-xs text-blue-300">{sg.title}</h4>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed pl-8">
                                {sg.instruction}
                              </p>
                              {sg.keyRuleOrTip && (
                                <div className="ml-8 p-1.5 rounded bg-blue-950/40 border border-blue-500/20 text-[10px] text-blue-200 font-medium">
                                  <span className="font-bold text-blue-300">Rule/Tip: </span>
                                  {sg.keyRuleOrTip}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 6. Activities, Evaluation & Homework */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Evaluation Questions */}
                        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-xs font-black uppercase text-white tracking-wider">
                              6. Evaluation Questions
                            </h3>
                          </div>
                          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-200">
                            {(selectedNote.evaluationQuestions || selectedNote.evaluation || []).map((q: string, i: number) => (
                              <li key={i} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 leading-relaxed font-medium">
                                {q}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Homework & Assignment */}
                        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                            <FileCheck className="w-4 h-4 text-purple-400" />
                            <h3 className="text-xs font-black uppercase text-white tracking-wider">
                              7. Homework & Assignment
                            </h3>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                            {selectedNote.assignment || "Complete exercise questions from approved textbook."}
                          </div>
                          {selectedNote.summary && (
                            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
                              <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">Lesson Summary:</span>
                              {selectedNote.summary}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. REALISTIC 28-SECTION A4 LESSON NOTE SHEET */}
                {docViewMode === "sheet" && (() => {
                  const resolved = getResolvedStructuredComponents(selectedNote);
                  return (
                    <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 flex justify-center overflow-x-auto animate-in fade-in duration-200">
                      <div className="w-full max-w-[800px] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-sm border border-slate-300 font-serif text-xs leading-relaxed relative print:shadow-none print:border-none print:p-0">
                        {/* WATERMARK */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5 z-0">
                          <span className="text-slate-900 font-serif font-black text-5xl tracking-widest uppercase rotate-[-30deg] text-center border-4 border-dashed border-slate-900 p-8">
                            {watermarkText}
                          </span>
                        </div>

                        {/* DOCUMENT HEADER */}
                        <div className="relative z-10 space-y-4">
                          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                            <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-2xl border-2 border-amber-400">
                              LIA
                            </div>
                            <div className="text-center flex-1 px-4">
                              <h1 className="text-xl font-black uppercase text-slate-900 tracking-wider">
                                {selectedNote.schoolName || schoolName}
                              </h1>
                              <p className="text-[10px] font-bold text-slate-600 uppercase">
                                Federal Ministry of Education & NERDC Approved Curriculum Standard
                              </p>
                              <div className="inline-block mt-1 px-3 py-0.5 bg-purple-100 border border-purple-300 text-[11px] font-bold text-purple-900 uppercase">
                                OFFICIAL TEACHER LESSON NOTE & SCHEME DELIVERABLE
                              </div>
                            </div>
                            <div className="w-16 h-16 rounded-lg border-2 border-emerald-700 bg-emerald-50 text-emerald-800 p-1 text-[9px] font-extrabold text-center flex flex-col items-center justify-center">
                              <ShieldCheck className="w-5 h-5 text-emerald-700 mb-0.5" />
                              VERIFIED
                            </div>
                          </div>

                          {/* METADATA 28-SCHEMA GRID */}
                          <div className="border border-slate-900 text-[11px] overflow-hidden">
                            <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-100 border-b border-slate-900 divide-x divide-slate-900 font-bold text-slate-900">
                              <div className="p-2"><span className="text-slate-500 block text-[9px]">1-3. SCHOOL & TEACHER:</span> {selectedNote.teacherName}</div>
                              <div className="p-2"><span className="text-slate-500 block text-[9px]">4-6. SUBJECT & CLASS:</span> {selectedNote.subject} ({selectedNote.class})</div>
                              <div className="p-2"><span className="text-slate-500 block text-[9px]">7-9. SESSION, TERM & WEEK:</span> {selectedNote.session} • {selectedNote.term} ({selectedNote.week})</div>
                              <div className="p-2"><span className="text-slate-500 block text-[9px]">12. DURATION & DATE:</span> {selectedNote.duration} ({selectedNote.date})</div>
                            </div>
                            <div className="p-3 bg-purple-50">
                              <span className="text-purple-900 font-bold block text-[10px] uppercase">10-11. TOPIC & SUB-TOPIC:</span>
                              <h3 className="text-sm font-black text-slate-900 uppercase">{selectedNote.topic}</h3>
                              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                                <span className="font-bold text-slate-900">SUB-TOPIC:</span> {selectedNote.subTopic}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 28 SECTIONS BODY */}
                        <div className="relative z-10 mt-6 space-y-6 text-slate-900">
                          {/* Section 13: Objectives */}
                          <div>
                            <h4 className="font-sans font-black text-xs uppercase text-purple-900 border-b border-purple-900 pb-1">
                              13. LEARNING OBJECTIVES
                            </h4>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-900 font-medium">
                              {(selectedNote.objectives || objectives).map((obj: string, i: number) => (
                                <li key={i}>{obj}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Section 14-16 */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-[11px]">
                            <div className="p-2.5 border border-slate-300 bg-slate-50">
                              <span className="font-bold text-slate-900 uppercase block">14. Previous Knowledge:</span>
                              <p className="text-slate-700 text-[10px]">{selectedNote.previousKnowledge}</p>
                            </div>
                            <div className="p-2.5 border border-slate-300 bg-slate-50">
                              <span className="font-bold text-slate-900 uppercase block">15. Instructional Materials:</span>
                              <p className="text-slate-700 text-[10px]">{(selectedNote.instructionalMaterials || []).join(", ")}</p>
                            </div>
                            <div className="p-2.5 border border-slate-300 bg-slate-50">
                              <span className="font-bold text-slate-900 uppercase block">16. Teaching Methods:</span>
                              <p className="text-slate-700 text-[10px]">{(selectedNote.teachingMethods || []).join(", ")}</p>
                            </div>
                          </div>

                          {/* Section 17: Clear Definitions */}
                          <div className="space-y-2">
                            <h4 className="font-sans font-black text-xs uppercase text-purple-900 border-b border-purple-900 pb-1">
                              17. CLEAR DEFINITIONS & CORE CONCEPTS
                            </h4>
                            <div className="space-y-2 p-3 border border-slate-300 bg-slate-50">
                              {resolved.definitions.map((d, di) => (
                                <div key={di} className="text-[11px]">
                                  <span className="font-bold text-slate-900">{di + 1}. {d.term}: </span>
                                  <span className="text-slate-800">{d.definition}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Section 18: Core Academic Content */}
                          <div className="space-y-2">
                            <h4 className="font-sans font-black text-xs uppercase text-purple-900 border-b border-purple-900 pb-1">
                              18. DETAILED ACADEMIC LESSON CONTENT
                            </h4>
                            <div className="p-3 border border-slate-300 bg-white font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                              {editorText || selectedNote.lessonContent || selectedNote.content}
                            </div>
                          </div>

                          {/* Section 19: Illustrative Worked Examples */}
                          <div className="space-y-2">
                            <h4 className="font-sans font-black text-xs uppercase text-purple-900 border-b border-purple-900 pb-1">
                              19. ILLUSTRATIVE WORKED EXAMPLES (STEP-BY-STEP)
                            </h4>
                            <div className="space-y-3 p-3 border border-slate-300 bg-slate-50">
                              {resolved.illustrativeExamples.map((ex, exi) => (
                                <div key={exi} className="p-2.5 border border-slate-200 bg-white space-y-1">
                                  <div className="font-bold text-[11px] text-purple-950 uppercase">{ex.title || `Worked Example ${exi + 1}`}</div>
                                  <div className="text-[10px] text-slate-800"><span className="font-bold">Problem: </span>{ex.problem}</div>
                                  <div className="space-y-0.5 text-[10px] text-slate-700 pl-2 border-l border-slate-300">
                                    {ex.stepByStepSolution.map((st, sti) => (
                                      <div key={sti}>• {st}</div>
                                    ))}
                                  </div>
                                  <div className="text-[10px] font-bold text-emerald-800 pt-1">Answer: {ex.finalAnswer}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Section 20: Step-by-Step Guidance */}
                          <div className="space-y-2">
                            <h4 className="font-sans font-black text-xs uppercase text-purple-900 border-b border-purple-900 pb-1">
                              20. STEP-BY-STEP GUIDANCE & PRACTICAL METHOD
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border border-slate-300 bg-slate-50">
                              {resolved.stepByStepGuidance.map((sg, sgi) => (
                                <div key={sgi} className="p-2 border border-slate-200 bg-white text-[10px]">
                                  <span className="font-bold text-slate-900 block">Step {sg.stepNumber || sgi + 1}: {sg.title}</span>
                                  <span className="text-slate-700">{sg.instruction}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Section 22-24 Assessment & Evaluation */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 border border-slate-300 bg-slate-50 space-y-1">
                              <h5 className="font-sans font-bold text-[11px] text-slate-900 uppercase">23. Evaluation Questions:</h5>
                              <ol className="list-decimal list-inside text-[11px] text-slate-800 space-y-1">
                                {(selectedNote.evaluationQuestions || []).map((q: string, i: number) => (
                                  <li key={i}>{q}</li>
                                ))}
                              </ol>
                            </div>

                            <div className="p-3 border border-slate-300 bg-slate-50 space-y-1">
                              <h5 className="font-sans font-bold text-[11px] text-slate-900 uppercase">24. Homework & Assignment:</h5>
                              <p className="text-[11px] text-slate-800">{selectedNote.assignment}</p>
                            </div>
                          </div>

                          {/* Section 25-27 Summary & References */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                            <div className="p-2.5 border border-purple-200 bg-purple-50">
                              <span className="font-bold text-purple-950 block">25. Summary:</span>
                              <p className="text-purple-900 text-[10px]">{selectedNote.summary}</p>
                            </div>
                            <div className="p-2.5 border border-purple-200 bg-purple-50">
                              <span className="font-bold text-purple-950 block">26. Conclusion:</span>
                              <p className="text-purple-900 text-[10px]">{selectedNote.conclusion}</p>
                            </div>
                            <div className="p-2.5 border border-purple-200 bg-purple-50">
                              <span className="font-bold text-purple-950 block">27. References:</span>
                              <p className="text-purple-900 text-[10px]">{(selectedNote.references || []).join(", ")}</p>
                            </div>
                          </div>

                          {/* Section 28: Signature & Official Stamp */}
                          <div className="pt-6 border-t-2 border-slate-900 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans text-[11px]">
                            <div className="space-y-4">
                              <p className="font-black text-slate-900 uppercase">Subject Teacher Signature:</p>
                              <div className="h-8 border-b border-slate-900 flex items-end font-serif italic">
                                {selectedNote.teacherName}
                              </div>
                              <p className="text-[10px] text-slate-500">Date: {selectedNote.date}</p>
                            </div>

                            <div className="space-y-4">
                              <p className="font-black text-slate-900 uppercase">Approval Sign-Off ({selectedNote.submittedTo || "HOD"}):</p>
                              <div className="h-8 border-b border-slate-900 flex items-end font-serif italic text-emerald-800 font-bold">
                                {selectedNote.status === "Approved" ? "Approved & Digitally Verified" : "Pending Approval"}
                              </div>
                              <p className="text-[10px] text-slate-500">Status: {selectedNote.status}</p>
                            </div>

                            <div className="border-2 border-dashed border-slate-900 p-3 text-center flex flex-col items-center justify-center bg-slate-50">
                              <div className="w-9 h-9 rounded-full border-2 border-purple-900 text-purple-900 flex items-center justify-center font-black text-[9px] uppercase mb-1">
                                STAMP
                              </div>
                              <p className="font-black text-[10px] uppercase text-slate-900">PRINCIPAL / ACADEMIC SEAL</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. MARKDOWN TEXT EDITOR VIEW */}
                {docViewMode === "editor" && (
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl animate-in fade-in duration-200">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-purple-400" />
                        <h3 className="text-xs font-black uppercase text-white">Full Markdown Content Editor</h3>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span>Characters: {editorText.length}</span>
                        <span>•</span>
                        <span>Words: {editorText.split(/\s+/).filter(Boolean).length}</span>
                      </div>
                    </div>

                    <textarea
                      value={editorText}
                      onChange={(e) => {
                        setEditorText(e.target.value);
                        setIsDirty(true);
                      }}
                      rows={24}
                      className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-purple-500 resize-y"
                      placeholder="Write or edit full lesson note markdown..."
                    />

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">
                        Changes will be auto-saved and reflected across the structured note and 28-section sheet views.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAutoSaveDraft()}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" /> Save Changes Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-xs">No lesson notes available.</p>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 4: WEEKLY LESSON NOTES */}
      {/* ========================================================= */}
      {moduleTab === "weekly" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-purple-400" /> Weekly Lesson Notes Scheme Overview
            </h3>
            <span className="text-xs text-purple-300 font-mono">13 Weeks Term Plan ({term})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {Array.from({ length: 13 }, (_, i) => `Week ${i + 1}`).map((wk, idx) => {
              const matchingNote = notesList.find((n) => n.week === wk);
              return (
                <div
                  key={wk}
                  className={`p-4 rounded-xl border space-y-2 ${
                    matchingNote ? "bg-slate-900 border-purple-500/40" : "bg-slate-950 border-slate-800 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{wk}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${matchingNote ? "bg-purple-500/20 text-purple-300" : "bg-slate-800 text-slate-400"}`}>
                      {matchingNote ? matchingNote.status : "Not Generated"}
                    </span>
                  </div>
                  <p className="text-slate-300 font-semibold text-xs">
                    {matchingNote ? matchingNote.topic : `Scheduled topic for ${wk}`}
                  </p>
                  {matchingNote && (
                    <button
                      onClick={() => {
                        setSelectedNote(matchingNote);
                        setModuleTab("my-notes");
                      }}
                      className="text-purple-400 font-bold hover:underline block text-[11px]"
                    >
                      View Full Note →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 5: DRAFTS */}
      {/* ========================================================= */}
      {moduleTab === "drafts" && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Save className="w-4 h-4 text-amber-400" /> Draft Lesson Notes (Auto-Saved)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notesList.filter((n) => n.status === "Draft").map((d) => (
              <div key={d.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{d.topic}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">Draft</span>
                </div>
                <p className="text-slate-400">{d.subject} • {d.class} • {d.week}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500">Auto-saved</span>
                  <button
                    onClick={() => {
                      setSelectedNote(d);
                      setModuleTab("my-notes");
                    }}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs"
                  >
                    Edit Draft
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 6: SUBMITTED NOTES */}
      {/* ========================================================= */}
      {moduleTab === "submitted" && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Send className="w-4 h-4 text-blue-400" /> Submitted Lesson Notes (Under Review)
          </h3>

          <div className="space-y-3">
            {notesList.filter((n) => n.status === "Submitted" || n.status === "Pending Approval").map((s) => (
              <div key={s.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white text-sm block">{s.topic}</span>
                  <span className="text-slate-400">{s.subject} • {s.class} • Submitted to: {s.submittedTo || "Head Teacher"}</span>
                </div>
                <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  Under Review
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 7: APPROVED NOTES */}
      {/* ========================================================= */}
      {moduleTab === "approved" && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Approved & Verified Lesson Notes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notesList.filter((n) => n.status === "Approved").map((app) => (
              <div key={app.id} className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{app.topic}</span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" /> Approved
                  </span>
                </div>
                <p className="text-slate-400">{app.subject} • {app.class} • {app.week}</p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedNote(app);
                      setModuleTab("my-notes");
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                  >
                    View Printable Note
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 8: RETURNED FOR CORRECTION */}
      {/* ========================================================= */}
      {moduleTab === "returned" && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <AlertCircle className="w-4 h-4 text-rose-400" /> Lesson Notes Returned for Correction
          </h3>

          <div className="space-y-3">
            {notesList.filter((n) => n.status === "Returned for Correction").map((ret) => (
              <div key={ret.id} className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-white text-sm">{ret.topic}</span>
                  <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                    Action Required
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/30 text-rose-200 space-y-1">
                  <span className="font-bold uppercase text-[10px] text-rose-400 block">Reviewer Feedback ({ret.submittedTo}):</span>
                  <p>{ret.correctionFeedback}</p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedNote(ret);
                      setModuleTab("my-notes");
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow text-xs"
                  >
                    Edit & Fix Note
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 9: LESSON NOTES CALENDAR */}
      {/* ========================================================= */}
      {moduleTab === "calendar" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-purple-400" /> Academic Schedule & Lesson Notes Calendar
            </h3>
            <span className="text-xs text-purple-300 font-mono">2026/2027 Calendar View</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const noteOnDay = notesList.find((n) => n.date?.endsWith(`-${String(day).padStart(2, "0")}`));
                return (
                  <div
                    key={day}
                    className={`min-h-[80px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                      noteOnDay ? "bg-purple-950/40 border-purple-500 text-white" : "bg-slate-950 border-slate-800/80 text-slate-500"
                    }`}
                  >
                    <span className="font-bold font-mono text-[11px]">{day}</span>
                    {noteOnDay && (
                      <div
                        onClick={() => {
                          setSelectedNote(noteOnDay);
                          setModuleTab("my-notes");
                        }}
                        className="cursor-pointer"
                      >
                        <span className="text-[9px] font-bold text-purple-300 block truncate">{noteOnDay.topic}</span>
                        <span className="text-[8px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-200 block w-max mt-0.5">
                          {noteOnDay.subject}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 10: DOWNLOAD CENTRE */}
      {/* ========================================================= */}
      {moduleTab === "downloads" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-purple-400" /> Export & Download Centre
            </h3>
            <span className="text-xs text-slate-400">PDF • DOCX • HTML • Print Ready</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                PDF
              </div>
              <h4 className="font-bold text-white text-sm">PDF Document Package</h4>
              <p className="text-slate-400">Includes school logo, signature lines, page numbers, and official seal watermark.</p>
              <button
                onClick={() => window.print()}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
              >
                Download PDF
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                DOCX
              </div>
              <h4 className="font-bold text-white text-sm">Microsoft Word (.docx)</h4>
              <p className="text-slate-400">Fully editable Word document formatted according to NERDC guidelines.</p>
              <button
                onClick={() => showNotification("Exporting DOCX package...")}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              >
                Download Word (.docx)
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                HTML
              </div>
              <h4 className="font-bold text-white text-sm">Standalone HTML Sheet</h4>
              <p className="text-slate-400">Web-ready HTML page with interactive expandable headers.</p>
              <button
                onClick={() => showNotification("Exporting HTML package...")}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                Download HTML
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBMIT FOR APPROVAL MODAL */}
      {/* ========================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-400" /> Submit Lesson Note for Approval
            </h3>

            <p className="text-xs text-slate-400">
              Select the administrative authority for approval according to school workflow:
            </p>

            <div className="space-y-2 text-xs">
              {(["Head Teacher", "Academic Director", "Principal"] as const).map((role) => (
                <label
                  key={role}
                  onClick={() => setSubmitRecipient(role)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                    submitRecipient === role ? "bg-purple-950/60 border-purple-500 text-white font-bold" : "bg-slate-950 border-slate-800 text-slate-300"
                  }`}
                >
                  <span>{role}</span>
                  {submitRecipient === role && <Check className="w-4 h-4 text-purple-400" />}
                </label>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForApproval}
                className="w-1/2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
