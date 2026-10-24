export type UserRole =
  | "Super Admin"
  | "Super Administrator"
  | "School Owner"
  | "Proprietor"
  | "Proprietress"
  | "Head Teacher"
  | "Assistant Head Teacher"
  | "Principal"
  | "Vice Principal"
  | "School Administrator"
  | "School Admin"
  | "Admin"
  | "ICT Administrator"
  | "Registrar"
  | "Admission Officer"
  | "Bursar"
  | "Accountant"
  | "Teacher"
  | "Class Teacher"
  | "Subject Teacher"
  | "Student"
  | "Parent"
  | "Account Officer"
  | "Exam Officer"
  | "Librarian"
  | "Receptionist";

export type ActiveTab =
  | "auth"
  | "dashboard"
  | "superadmin"
  | "school-portal"
  | "teacher-portal"
  | "student-parent-portal"
  | "academic-curriculum"
  | "academic-lesson-notes"
  | "academic-ai-lesson-notes"
  | "ai-lesson-notes"
  | "academic-assignments"
  | "academic-scheme-of-work"
  | "academic-exams"
  | "academic-ai-exam-generator"
  | "ai-exam-generator"
  | "academic-question-bank"
  | "question-bank"
  | "academic-report-cards"
  | "report-cards"
  | "academic-attendance"
  | "attendance"
  | "students"
  | "teachers"
  | "subject-allocation"
  | "finance"
  | "finance-fees"
  | "finance-accounts"
  | "finance-payments"
  | "finance-receipts"
  | "finance-debtors"
  | "finance-expenses"
  | "finance-reports"
  | `finance:${string}`
  | "library"
  | "communication"
  | "communication-announcements"
  | "communication-messages"
  | "communication-sms"
  | "communication-email"
  | "communication-whatsapp"
  | `communication:${string}`
  | "parents"
  | "transport"
  | "hostel"
  | "settings"
  | "support"
  | "website-builder"
  | "subscription"
  | "id-cards"
  | "entrance-exams"
  | "timetable"
  | "payroll"
  | "chat"
  | "gamified-learning"
  | "job-marketplace"
  | `settings:${string}`;

export const PRIMARY_CLASSES = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6"
] as const;

export const JSS_CLASSES = [
  "JSS 1",
  "JSS 2",
  "JSS 3"
] as const;

export const SS_CLASSES = [
  "SS 1",
  "SS 2",
  "SS 3"
] as const;

export const ALL_CLASSES = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
] as const;

export const ALL_TERMS = [
  "1st Term",
  "2nd Term",
  "3rd Term"
] as const;

export const GRADE_SUBJECTS = [
  "Mathematics",
  "English Studies / English Language",
  "Basic Science & Technology",
  "Social Studies",
  "Civic Education",
  "Agricultural Science",
  "Computer Studies / ICT & Coding",
  "Cultural & Creative Arts (CCA)",
  "Physical & Health Education (PHE)",
  "Home Economics",
  "Christian Religious Studies (CRS)",
  "Islamic Religious Studies (IRS)",
  "Verbal Reasoning",
  "Quantitative Reasoning",
  "Vocational Aptitude",
  "Security Education",
  "History (National Values)",
  "Handwriting & Phonics",
  "Literature in English (Primary)",
  "Fine Arts",
  "Music",
  "French Language",
  "Arabic Language",
  "Yoruba Language",
  "Igbo Language",
  "Hausa Language",
] as const;

export const PRIMARY_SUBJECTS = GRADE_SUBJECTS;

export const JSS_SUBJECTS = [
  "Mathematics",
  "English Language",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Civic Education",
  "Agricultural Science",
  "Business Studies",
  "Computer Studies / ICT & Data Processing",
  "Home Economics",
  "Physical & Health Education (PHE)",
  "Cultural & Creative Arts (CCA)",
  "Fine Arts",
  "Music",
  "Christian Religious Studies (CRS)",
  "Islamic Religious Studies (IRS)",
  "French Language",
  "Arabic Language",
  "Security Education",
  "History",
  "Literature in English",
  "Yoruba Language",
  "Igbo Language",
  "Hausa Language",
] as const;

export const SS_SCIENCE_SUBJECTS = [
  "Mathematics",
  "English Language",
  "Physics",
  "Chemistry",
  "Biology",
  "Further Mathematics",
  "Agricultural Science",
  "Computer Studies / ICT",
  "Data Processing",
  "Civic Education",
  "Technical Drawing",
  "Health Science / Health Education",
  "Physical & Health Education (PHE)",
  "Animal Husbandry",
  "Fishery",
  "Food & Nutrition",
  "Geography",
  "Economics",
] as const;

export const SS_COMMERCIAL_SUBJECTS = [
  "Mathematics",
  "English Language",
  "Financial Accounting",
  "Commerce",
  "Economics",
  "Business Methods / Management",
  "Marketing",
  "Office Practice",
  "Book Keeping",
  "Civic Education",
  "Computer Studies / ICT",
  "Data Processing",
  "Store Management",
  "Insurance",
  "Secretarial Studies",
  "Government",
] as const;

export const SS_ARTS_SUBJECTS = [
  "Mathematics",
  "English Language",
  "Literature in English",
  "Government",
  "History",
  "Christian Religious Studies (CRS)",
  "Islamic Religious Studies (IRS)",
  "Geography",
  "Civic Education",
  "Economics",
  "Visual Art / Fine Arts",
  "Music",
  "French Language",
  "Arabic Language",
  "Yoruba Language",
  "Igbo Language",
  "Hausa Language",
  "Computer Studies / ICT",
  "Data Processing",
] as const;

export const SS_VOCATIONAL_TRADE_SUBJECTS = [
  "Catering Craft Practice",
  "Garment Making",
  "Clothing & Textiles",
  "Food & Nutrition",
  "Home Management",
  "Woodwork",
  "Metal Work",
  "Auto Mechanics",
  "Building Construction",
  "Electrical Installation & Maintenance Work",
  "Radio, TV & Electronics",
  "Painting & Decorating",
  "Printing Craft Practice",
  "Cosmetology",
  "Tourism",
  "Dyeing & Bleaching",
  "Photography",
  "Leather Goods Manufacturing",
  "Plumbing & Pipe Fitting",
  "Bricklaying & Blocklaying",
  "Animal Husbandry",
  "Fishery",
  "Data Processing",
  "Marketing",
  "Book Keeping",
  "Store Management",
] as const;

export const SS_SUBJECTS = [
  "Mathematics",
  "English Language",
  "Physics",
  "Chemistry",
  "Biology",
  "Further Mathematics",
  "Agricultural Science",
  "Computer Studies / ICT",
  "Data Processing",
  "Economics",
  "Financial Accounting",
  "Commerce",
  "Government",
  "Literature in English",
  "Geography",
  "Civic Education",
  "Christian Religious Studies (CRS)",
  "Islamic Religious Studies (IRS)",
  "History",
  "Technical Drawing",
  "Health Science / Health Education",
  "Food & Nutrition",
  "Home Economics",
  "Home Management",
  "Clothing & Textiles",
  "Catering Craft Practice",
  "Garment Making",
  "Animal Husbandry",
  "Fishery",
  "Marketing",
  "Office Practice",
  "Book Keeping",
  "Insurance",
  "Store Management",
  "Secretarial Studies",
  "Fine Arts",
  "Visual Art / Fine Arts",
  "Music",
  "Physical & Health Education (PHE)",
  "Woodwork",
  "Metal Work",
  "Auto Mechanics",
  "Building Construction",
  "Electrical Installation & Maintenance Work",
  "Radio, TV & Electronics",
  "Painting & Decorating",
  "Cosmetology",
  "Tourism",
  "French Language",
  "Arabic Language",
  "Yoruba Language",
  "Igbo Language",
  "Hausa Language",
] as const;

export const ALL_SUBJECTS = Array.from(
  new Set([
    ...GRADE_SUBJECTS,
    ...JSS_SUBJECTS,
    ...SS_SUBJECTS,
    ...SS_VOCATIONAL_TRADE_SUBJECTS
  ])
);

export function isPrimaryClass(className: string): boolean {
  if (!className) return false;
  const norm = className.toUpperCase().trim();
  return (
    norm.includes("GRADE") ||
    norm.includes("PRIMARY") ||
    norm.startsWith("PRI") ||
    norm.includes("BASIC 1") ||
    norm.includes("BASIC 2") ||
    norm.includes("BASIC 3") ||
    norm.includes("BASIC 4") ||
    norm.includes("BASIC 5") ||
    norm.includes("BASIC 6") ||
    /^P[1-6]\b/.test(norm)
  );
}

export function isJuniorClass(className: string): boolean {
  if (!className) return false;
  const norm = className.toUpperCase().trim();
  return (
    norm.includes("JSS") ||
    norm.includes("J.S.S") ||
    norm.includes("JS 1") ||
    norm.includes("JS 2") ||
    norm.includes("JS 3") ||
    norm.includes("JS1") ||
    norm.includes("JS2") ||
    norm.includes("JS3") ||
    norm.includes("JUNIOR") ||
    norm.includes("BASIC 7") ||
    norm.includes("BASIC 8") ||
    norm.includes("BASIC 9")
  );
}

export function isSeniorClass(className: string): boolean {
  if (!className) return false;
  const norm = className.toUpperCase().trim();
  // Ensure JSS is not confused with SSS
  if (isJuniorClass(className)) return false;
  return (
    norm.includes("SS 1") ||
    norm.includes("SS 2") ||
    norm.includes("SS 3") ||
    norm.includes("SS1") ||
    norm.includes("SS2") ||
    norm.includes("SS3") ||
    norm.includes("SSS") ||
    norm.includes("S.S.S") ||
    norm.includes("SENIOR") ||
    norm.startsWith("SS")
  );
}

export function getSubjectsForClass(className: string): string[] {
  if (!className) return [...JSS_SUBJECTS];
  const norm = className.toUpperCase().trim();

  if (norm === "ALL_CLASSES" || norm === "ALL CLASSES" || norm === "ALL") {
    return [...ALL_SUBJECTS];
  }

  // 1. Primary / Grade 1-6 / Basic 1-6
  if (isPrimaryClass(className)) {
    return [...PRIMARY_SUBJECTS];
  }

  // 2. Junior Secondary (JSS 1 - 3 / Basic 7 - 9)
  // Strictly junior subjects: Physics, Chemistry, Biology, Economics, etc. are NOT allowed.
  if (isJuniorClass(className)) {
    return [...JSS_SUBJECTS];
  }

  // 3. Senior Secondary Streams
  if (norm.includes("SCIENCE")) {
    return [...SS_SCIENCE_SUBJECTS];
  }
  if (norm.includes("COMMERCIAL") || norm.includes("COMMERCE") || norm.includes("BUSINESS")) {
    return [...SS_COMMERCIAL_SUBJECTS];
  }
  if (norm.includes("ART") || norm.includes("HUMANITIES")) {
    return [...SS_ARTS_SUBJECTS];
  }

  // 4. Senior Secondary (SS 1 - 3 / SSS)
  if (isSeniorClass(className)) {
    return [...SS_SUBJECTS];
  }

  // Default safely to JSS subjects so senior subjects (Physics, Chemistry, etc.) never leak
  return [...JSS_SUBJECTS];
}

export function isSubjectAllowedForClass(subject: string, className: string): boolean {
  if (!subject) return false;
  const allowed = getSubjectsForClass(className);
  const cleanSub = subject.toLowerCase().trim();
  return allowed.some(s => s.toLowerCase().trim() === cleanSub || cleanSub.includes(s.toLowerCase().trim()) || s.toLowerCase().trim().includes(cleanSub));
}

export function isSameClassLevel(classA?: string, classB?: string): boolean {
  if (!classA || !classB) return false;
  const a = classA.toUpperCase().replace(/\s+/g, " ").trim();
  const b = classB.toUpperCase().replace(/\s+/g, " ").trim();
  if (a === b) return true;

  const extractCanonicalLevel = (c: string): string => {
    // Check JSS 1, 2, 3 (or Basic 7, 8, 9) - NEVER match with SS 1, 2, 3
    const jssMatch = c.match(/(?:JSS|J\.S\.S|JS|BASIC)\s*([1-3]|7|8|9)/i);
    if (jssMatch) {
      const num = jssMatch[1];
      if (num === "7") return "JSS 1";
      if (num === "8") return "JSS 2";
      if (num === "9") return "JSS 3";
      return `JSS ${num}`;
    }
    // Check SS 1, 2, 3 (or SSS 1, 2, 3)
    const ssMatch = c.match(/(?:^|\b)(?:SS|SSS|S\.S\.S)\s*([1-3])/i);
    if (ssMatch) return `SS ${ssMatch[1]}`;
    // Check Primary 1 - 6 (or Grade 1 - 6 or Basic 1 - 6)
    const priMatch = c.match(/(?:PRIMARY|GRADE|BASIC|PRI)\s*([1-6])/i);
    if (priMatch) return `PRIMARY ${priMatch[1]}`;
    return c;
  };

  const canonA = extractCanonicalLevel(a);
  const canonB = extractCanonicalLevel(b);
  return canonA === canonB;
}

export const ALL_WEEKS = [
  "Week 1",
  "Week 2",
  "Week 3",
  "Week 4",
  "Week 5",
  "Week 6 (Mid-Term)",
  "Week 7",
  "Week 8",
  "Week 9",
  "Week 10",
  "Week 11 (Revision)",
  "Week 12 (Examination)",
  "Week 13 (Vacation & Result Collation)",
] as const;

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceTerm?: number | string;
  priceMonthly?: number;
  priceAnnual?: number;
  studentLimit?: number | string;
  aiCreditsMonthly?: number | string;
  badge?: string;
  subtitle?: string;
  isPopular?: boolean;
  features: string[];
}

export interface SubscriptionStatus {
  currentPlanId: string;
  planName: string;
  billingCycle: "Term" | "Monthly" | "Annual";
  status: "Active" | "Trial" | "Expired" | "Pending Payment";
  activeStudentsUsed: number;
  maxStudentsLimit: number | string;
  aiCreditsUsed: number;
  maxAiCreditsLimit: number | string;
  renewalDate: string;
  autoRenew: boolean;
  amountPaid: number | string;
  lastPaymentDate: string;
}

export interface WebsiteSectionItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  statValue?: string;
  price?: string;
  role?: string;
  department?: string;
  date?: string;
}

export interface WebsiteSection {
  id: string;
  type:
    | "hero"
    | "welcome"
    | "features"
    | "news"
    | "gallery"
    | "stats"
    | "testimonials"
    | "contact"
    | "custom_text"
    | "teachers"
    | "courses"
    | "pricing"
    | "faq"
    | "timeline"
    | "partners"
    | "map"
    | "form"
    | "newsletter"
    | "whatsapp";
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  items?: WebsiteSectionItem[];
}

export interface WebsitePage {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  isSystemDefault?: boolean;
  metaDescription: string;
  keywords?: string[];
  sections: WebsiteSection[];
}

export interface WebsiteThemeConfig {
  schoolName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor?: string;
  fontFamily: string;
  headerStyle: "standard" | "centered" | "topbar";
  showAnnouncementBanner: boolean;
  announcementText: string;
  customDomain: string;
  subdomain?: string;
  isLive: boolean;
  maintenanceMode?: boolean;
  lastPublishedAt: string;
  themePreset?: string;
  whatsappNumber?: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  admissionNo: string;
  class: string;
  gender: "Male" | "Female";
  parentName: string;
  parentPhone: string;
  status: "Active" | "Graduated" | "Suspended";
  avatar: string;
}

export interface TeacherRecord {
  id: string;
  name: string;
  staffId: string;
  subjectSpecialization: string;
  assignedSubjects?: string[];
  assignedClass: string;
  assignedClasses?: string[];
  email: string;
  phone: string;
  status: "Active" | "On Leave" | "Suspended" | "Invited";
  avatar: string;
  fullName?: string;
  schoolName?: string;
  schoolId?: string;
  role?: string;
  invitedAt?: string;
  inviteToken?: string;
  inviteLink?: string;
}

export interface LessonNote {
  topic: string;
  subject: string;
  className: string;
  week: string;
  curriculumRef: string;
  durationMinutes: number;
  behavioralObjectives: string[];
  instructionalMaterials: string[];
  previousKnowledge: string;
  introduction: string;
  coreContent: {
    subheading: string;
    explanation: string;
    keyTerms: string[];
  }[];
  teacherDemonstration: string;
  studentActivities: string[];
  evaluationQuestions: string[];
  summaryWrapUp: string;
  assignment: string;
}

export interface ObjectiveQuestion {
  id: string;
  questionNumber: number;
  question: string;
  options: string[];
  correctAnswer: string;
  correctOptionIndex: number;
  explanation?: string;
  bloomTaxonomy?: string;
}

export interface TheoryQuestion {
  id: string;
  questionNumber: number;
  question: string;
  marks: number;
  markingScheme: string;
  bloomTaxonomy?: string;
}

export interface ExamPaper {
  title: string;
  subject: string;
  className: string;
  term: string;
  timeAllowed: string;
  instructions: string;
  objectives: ObjectiveQuestion[];
  theoryQuestions: TheoryQuestion[];
}

export interface ReportCardSubject {
  name: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

export interface ReportCard {
  reportId: string;
  studentName: string;
  studentId: string;
  class: string;
  term: string;
  subjects: ReportCardSubject[];
  overallTotal: number;
  average: number;
  positionInClass: string;
  attendance: string;
  psychomotor: Record<string, number>;
  affectiveDomain: Record<string, number>;
  teacherComment: string;
  principalComment: string;
  promotionStatus: string;
  qrVerificationToken: string;
}

export interface FinanceInvoice {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  term: string;
  totalAmount: number;
  paidAmount: number;
  status: "Paid" | "Partial" | "Unpaid";
  dueDate: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  status: "Available" | "Borrowed";
  copies: number;
  shelf: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: string;
  sender: string;
  date: string;
  content: string;
  targetRoles: string[];
}
