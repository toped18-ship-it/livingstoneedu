import { GoogleGenAI } from "@google/genai";
import { getComprehensiveLessonNote } from "../src/data/comprehensiveNotes";
import { cleanLessonNoteText, cleanStructuredLessonNote } from "../src/lib/cleanNote";

export interface LessonNoteRequest {
  class: string;
  className?: string;
  subject: string;
  term: string;
  week: string;
  topic: string;
  subtopic?: string;
  subTopic?: string;
  duration?: string;
  lessonDuration?: string;
  schoolName?: string;
  country?: string;
  state?: string;
  isBulk?: boolean;
}

let geminiQuotaCooldownUntil = 0;

export interface LessonDevelopmentStep {
  step: string;
  teacherActivity: string;
  studentActivity: string;
}

export interface DefinitionItem {
  term: string;
  definition: string;
  keyPoints?: string[];
}

export interface IllustrativeExample {
  title: string;
  problem: string;
  stepByStepSolution: string[];
  finalAnswer: string;
  explanation?: string;
}

export interface StepByStepGuidance {
  stepNumber: number;
  title: string;
  instruction: string;
  keyRuleOrTip?: string;
}

export interface StructuredLessonNote {
  class: string;
  subject: string;
  term: string;
  week: string;
  topic: string;
  subtopic: string;
  duration: string;
  objectives: string[];
  previousKnowledge: string;
  introduction: string;
  materials: string[];
  // Comprehensive academic components
  definitions: DefinitionItem[];
  illustrativeExamples: IllustrativeExample[];
  stepByStepGuidance: StepByStepGuidance[];
  lessonContent: string;
  classActivities: string[];
  evaluation: string[];
  assignment: string[];
  summary: string;
  keywords: Array<{ term: string; meaning: string } | string>;
  markdownContent?: string;
  lessonDevelopment?: LessonDevelopmentStep[];
}

export function validateLessonNoteParams(params: Partial<LessonNoteRequest>): { valid: boolean; missingFields: string[] } {
  const missing: string[] = [];
  const targetClass = params.class || params.className;
  if (!targetClass || !targetClass.trim()) missing.push("Class");
  if (!params.subject || !params.subject.trim()) missing.push("Subject");
  if (!params.term || !params.term.trim()) missing.push("Term");
  if (!params.week || !params.week.trim()) missing.push("Week");
  if (!params.topic || !params.topic.trim()) missing.push("Topic");

  return {
    valid: missing.length === 0,
    missingFields: missing,
  };
}

export function formatLessonNoteToMarkdown(note: StructuredLessonNote): string {
  const objectivesList = (note.objectives || [])
    .slice(0, 3)
    .map((obj, i) => `${i + 1}. ${obj.replace(/^\d+\.\s*/, "")}`)
    .join("\n");
  const reviewQuestions = (note.evaluation || []).slice(0, 4).map((q, i) => `${i + 1}. ${q}`).join("\n");
  const assignmentsList = (note.assignment || []).slice(0, 3).map((a, i) => `${i + 1}. ${a}`).join("\n");

  // Filter definitions strictly to authentic academic terms (no worked examples or steps)
  const validDefinitions = (note.definitions || []).filter((d) => {
    if (!d || !d.term || !d.definition) return false;
    const lower = d.term.toLowerCase();
    return (
      !lower.includes("example") &&
      !lower.includes("step") &&
      !lower.includes("root") &&
      !lower.includes("method") &&
      !lower.includes("question") &&
      !lower.includes("problem") &&
      !lower.includes("answer")
    );
  });

  const definitionsBlock = validDefinitions.length > 0
    ? validDefinitions.slice(0, 4).map((d, i) => {
        const kp = d.keyPoints && d.keyPoints.length > 0 ? `\n   - Key Principles: ${d.keyPoints.join("; ")}` : "";
        return `${i + 1}. ${d.term}: ${d.definition}${kp}`;
      }).join("\n\n")
    : "";

  const contentAlreadyHasExamples =
    note.lessonContent.includes("WORKED EXAMPLES") ||
    note.lessonContent.includes("Worked Example") ||
    note.lessonContent.includes("Example 1");

  const examplesBlock = (!contentAlreadyHasExamples && note.illustrativeExamples && note.illustrativeExamples.length > 0)
    ? note.illustrativeExamples.map((ex, i) => {
        const steps = (ex.stepByStepSolution || []).map((s, si) => `   • Step ${si + 1}: ${s}`).join("\n");
        const exp = ex.explanation ? `\n- Method & Analysis: ${ex.explanation}` : "";
        return `${ex.title || `Worked Example ${i + 1}`}
- Problem Statement: ${ex.problem}
- Step-by-Step Solution:
${steps}
- Verified Final Answer: ${ex.finalAnswer}${exp}`;
      }).join("\n\n---\n\n")
    : "";

  let markdown = `${note.subject} LESSON NOTE: ${note.topic}
Class: ${note.class} | Subject: ${note.subject} | Duration: ${note.duration || "40 Minutes"} | Term & Week: ${note.term} (${note.week})

1. BEHAVIORAL OBJECTIVES
By the end of this lesson, students should be able to:
${objectivesList}

2. TOPIC OVERVIEW & BACKGROUND
${note.introduction}
`;

  if (definitionsBlock) {
    markdown += `\n3. KEY CONCEPTS & DEFINITIONS\n${definitionsBlock}\n`;
  }

  markdown += `\n${definitionsBlock ? "4" : "3"}. COMPREHENSIVE ACADEMIC LESSON NOTES\n${note.lessonContent}\n`;

  if (examplesBlock) {
    markdown += `\n${definitionsBlock ? "5" : "4"}. WORKED ILLUSTRATIVE EXAMPLES\n${examplesBlock}\n`;
  }

  const nextNum = (definitionsBlock ? 4 : 3) + (examplesBlock ? 1 : 0);

  markdown += `\n${nextNum + 1}. CLASSROOM EVALUATION QUESTIONS
${reviewQuestions}

${nextNum + 2}. HOMEWORK & INDEPENDENT PRACTICE ASSIGNMENT
${assignmentsList}

${nextNum + 3}. KEY LESSON TAKEAWAYS & SUMMARY
${note.summary}
`;

  return cleanLessonNoteText(markdown);
}

export function getCurriculumTopicForWeek(subject: string, week: string, customTopic?: string): string {
  if (customTopic && customTopic.trim() && !customTopic.includes("ALL_SUBJECTS") && !customTopic.toLowerCase().includes("core concept")) {
    return `${customTopic} (${week})`;
  }
  const cleanSub = (subject || "").toLowerCase();
  const wkNum = parseInt((week || "").replace(/\D/g, "")) || 1;

  if (cleanSub.includes("english")) {
    const topics = [
      "Reading Comprehension & Summary Writing Techniques",
      "Nouns & Grammatical Functions (Types of Nouns)",
      "Pronouns & Agreement Rules in Sentences",
      "Verbs, Tenses & Subject-Verb Concord",
      "Adjectives, Adverbs & Comparison Techniques",
      "Prepositions, Conjunctions & Sentence Construction",
      "Mid-Term Revision & Intensive Comprehension Practice",
      "Essay Writing (Narrative & Descriptive Techniques)",
      "Essay Writing (Argumentative & Expository Techniques)",
      "Letter Writing (Formal & Informal Styles)",
      "Oral English (Vowel Sounds, Consonants & Stress)",
      "Term Revision & WASSCE/NECO Examination Practice"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  if (cleanSub.includes("math")) {
    const topics = [
      "Number Bases & Conversion Operations",
      "Modular Arithmetic & Algebraic Expansions",
      "Linear Equations & Simultaneous Inequalities",
      "Quadratic Equations & Roots Analysis",
      "Simultaneous Equations (Algebraic & Graphical)",
      "Logarithms, Indices & Exponential Equations",
      "Geometry of Triangles & Circle Theorems",
      "Trigonometric Ratios & Angles of Elevation",
      "Statistics (Mean, Median, Mode & Tables)",
      "Probability Theory & Experimental Events",
      "Vectors & Transformation Geometry",
      "General Mathematics Examination Practice"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  if (cleanSub.includes("physics")) {
    const topics = [
      "Units, Measurements & Dimensional Analysis",
      "Motion in One Dimension (Velocity & Acceleration)",
      "Equations of Motion & Free Fall Under Gravity",
      "Newton's Laws of Motion & Momentum",
      "Work, Energy, Power & Efficiency",
      "Simple Machines & Mechanical Advantage",
      "Thermal Energy, Heat Capacity & Thermometry",
      "Wave Motion & Sound Wave Properties",
      "Light Waves, Reflection & Refraction",
      "Electrostatics & Electric Current (Ohm's Law)",
      "Magnetism & Electromagnetic Induction",
      "Physics Examination Practice & Solved Problems"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  if (cleanSub.includes("chem")) {
    const topics = [
      "Nature of Matter, Elements, Compounds & Mixtures",
      "Atomic Structure, Isotopes & Chemical Bonding",
      "Periodic Table Trends & Periodicity",
      "Chemical Equations & Stoichiometry",
      "Acids, Bases, Salts & pH Scale Calculations",
      "Oxidation-Reduction (Redox) Reactions",
      "Rates of Chemical Reactions & Collision Theory",
      "Chemical Equilibrium & Le Chatelier's Principle",
      "Hydrocarbons & Alkanes Structure and Reactions",
      "Alkenes, Alkynes & Organic Functional Groups",
      "Metals & Extraction Procedures",
      "Chemistry Examination Practice & Practical Analysis"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  if (cleanSub.includes("bio")) {
    const topics = [
      "Cell Structure, Organelles & Organization of Life",
      "Classification of Living Things (Kingdom Systems)",
      "Plant & Animal Nutrition (Photosynthesis & Digestion)",
      "Transport System in Plants & Animals",
      "Respiration & Gas Exchange Mechanisms",
      "Excretion & Osmoregulation in Organisms",
      "Ecology, Ecosystem Dynamics & Energy Flow",
      "Nervous System & Sense Organs",
      "Hormonal Coordination in Living Organisms",
      "Genetics, Heredity & DNA Structure",
      "Evolution & Adaptation Strategies",
      "Biology Term Revision & Practical Examinations"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  if (cleanSub.includes("econ")) {
    const topics = [
      "Fundamental Concepts of Economics (Scarcity & Choice)",
      "Basic Tools of Economic Analysis (Graphs & Tables)",
      "Production Theory & Factors of Production",
      "Theory of Demand & Law of Demand",
      "Theory of Supply & Market Equilibrium",
      "Price Elasticity of Demand and Supply",
      "Market Structures (Competition & Monopoly)",
      "Money, Banking & Monetary Policy",
      "Inflation & Deflation Causes and Controls",
      "Public Finance, Fiscal Policy & Taxation",
      "International Trade & Balance of Payments",
      "Economics Term Revision & Examination Drills"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  if (cleanSub.includes("agric") || cleanSub.includes("agri")) {
    const topics = [
      "Meaning, Scope & Importance of Agriculture",
      "Land Tenure Systems & Agricultural Programs",
      "Soil Science, Soil Fertility & Erosion Control",
      "Crop Production & Husbandry Practices",
      "Animal Production, Livestock Management & Feeds",
      "Farm Mechanization & Engineering Tools",
      "Agricultural Economics & Farmers Cooperatives",
      "Farm Records, Accounting & Budgeting",
      "Agricultural Extension & Rural Youth Programs",
      "Fishery & Aquaculture Management",
      "Forestry & Forest Product Conservation",
      "Agricultural Science Examination Practice"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  if (cleanSub.includes("civic")) {
    const topics = [
      "Meaning, Objectives & Values of Civic Education",
      "Citizenship, Rights, Duties & Civic Obligations",
      "Democracy, Rule of Law & Constitutionalism",
      "Fundamental Human Rights & Protection Bodies",
      "National Consciousness, Integrity & Patriotism",
      "Cultism, Drug Abuse & Youth Empowerment",
      "Responsible Parenthood & Family Values",
      "Civil Society Organizations & Accountability",
      "Public Service & Bureaucracy in Nigeria",
      "Electoral Process & Voters Rights",
      "Peace, Conflict Resolution & National Cohesion",
      "Civic Education Examination Practice"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // JSS & Primary: Basic Science
  if (cleanSub.includes("basic science")) {
    const topics = [
      "Living & Non-Living Things (Characteristics & Classification)",
      "Human Body Systems (Skeletal & Muscular Systems)",
      "Digestive & Excretory Systems in Humans",
      "Respiratory & Circulatory Systems",
      "Nutrition, Balanced Diet & Deficiency Diseases",
      "Matter, States of Matter & Kinetic Theory",
      "Measurement of Mass, Weight, Length & Volume",
      "Energy, Forms of Energy & Energy Conversions",
      "Forces, Gravity & Friction in Daily Life",
      "Earth in Space, Solar System & Lunar Phases",
      "Environmental Sanitation & Disease Prevention",
      "Basic Science Examination Practice & Revision"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // JSS: Basic Technology
  if (cleanSub.includes("basic technology") || cleanSub.includes("basic tech")) {
    const topics = [
      "Technology & Society (Meaning, Importance & Safety)",
      "Workshop Safety Rules, First Aid & Hazards Prevention",
      "Properties & Uses of Wood, Metals, Plastics & Ceramics",
      "Hand Tools (Marking, Measuring, Cutting & Driving Tools)",
      "Technical Drawing (Drawing Instruments & Board Practice)",
      "Freehand Sketching & Lettering Techniques",
      "Lines, Angles & Geometric Constructions",
      "Friction, Lubrication & Simple Mechanical Drives",
      "Woodwork & Metalwork Processing Techniques",
      "Electrical Wiring, Circuit Components & Safety",
      "Energy, Power & Simple Transmission Mechanisms",
      "Basic Technology Examination Practice & Project Review"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // JSS & Primary: Social Studies
  if (cleanSub.includes("social studies")) {
    const topics = [
      "Meaning, Scope & Importance of Social Studies",
      "Family Structure, Roles & Responsibilities in Nigeria",
      "Culture, Socialization & Cultural Diversity in Nigeria",
      "Social Issues (Drug Abuse, Cultism & Examination Malpractice)",
      "Environmental Problems (Pollution, Deforestation & Erosion)",
      "National Identity, Symbols & Heritage in Nigeria",
      "Institutions of Government & Leadership in Nigeria",
      "Conflict Resolution, Harmony & Peaceful Coexistence",
      "Gender Equality, Children's Rights & Child Labour",
      "Road Safety, Traffic Regulations & FRSC Mandate",
      "Economy, Money & Financial Management in Families",
      "Social Studies Revision & BECE Examination Drills"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // JSS: Business Studies
  if (cleanSub.includes("business studies")) {
    const topics = [
      "Introduction to Business Studies & Career Opportunities",
      "The Office (Meaning, Departments & Office Equipment)",
      "Clerical Staff (Qualities, Duties & Confidentiality)",
      "Commerce (Trade, Types of Trade & Aids to Trade)",
      "Bookkeeping (Source Documents & Books of Original Entry)",
      "Cash Book (Single, Double & Three-Column Cash Books)",
      "Keyboarding & Ergonomics (Posture & Home Keys Technique)",
      "Consumer Education (Rights, Responsibilities & Protection)",
      "Forms of Business Ownership (Sole Trader, Partnership)",
      "Banking Services (Savings, Current & Electronic Banking)",
      "Advertising, Sales Promotion & Public Relations",
      "Business Studies Examination Practice & Practical Drills"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // Computer Studies / ICT / Coding / Data Processing
  if (cleanSub.includes("computer") || cleanSub.includes("ict") || cleanSub.includes("data processing") || cleanSub.includes("coding")) {
    const topics = [
      "Introduction to Computers (Hardware, Software & Peopleware)",
      "Historical Development of Computers (Generations 1st to 5th)",
      "Computer Hardware (Input, Output, Storage & Processing Units)",
      "System Software vs Application Software",
      "Operating Systems (Windows, Linux, Mobile OS & Functions)",
      "Word Processing (Formatting, Tables, Mail Merge & Shortcuts)",
      "Spreadsheets (Formulas, Functions, Charts & Data Analysis)",
      "Database Management Systems & Information Retrieval",
      "Computer Networks, Internet Protocols & World Wide Web",
      "Cybersecurity, Safe Browsing & Computer Ethics",
      "Algorithms, Flowcharts & Introduction to Coding Logic",
      "ICT & Computer Studies Examination Practice & Practical Analysis"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // Senior: Further Mathematics
  if (cleanSub.includes("further math")) {
    const topics = [
      "Indices, Logarithms & Surdic Operations",
      "Polynomials, Factor & Remainder Theorems",
      "Quadratic Equations, Nature of Roots & Symmetric Functions",
      "Permutations & Combinations Principles",
      "Binomial Theorem & Expansions for Rational Powers",
      "Matrices, Determinants & System of Linear Equations",
      "Coordinate Geometry (Circles, Tangents & Normals)",
      "Trigonometric Functions, Identities & Compound Angles",
      "Differentiation from First Principles & Product/Quotient Rules",
      "Integration (Definite/Indefinite & Area Under Curves)",
      "Vectors in 2D/3D & Static Equilibrium of Coplanar Forces",
      "Further Mathematics Examination Practice & Solved Problems"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // Senior: Literature in English
  if (cleanSub.includes("literature")) {
    const topics = [
      "Introduction to Literary Terms & Genres (Prose, Poetry, Drama)",
      "Elements of Drama (Plot, Characterization, Dialogue, Conflict)",
      "Elements of Poetry (Meter, Rhyme, Stanza, Imagery & Tone)",
      "Elements of Prose (Narrative Perspective, Theme & Setting)",
      "African Prose Study (Thematic Analysis & Character Analysis)",
      "Non-African Prose Study (Context, Plot & Narrative Techniques)",
      "African Drama Text (Dramatic Irony, Stage Directions & Themes)",
      "Non-African Drama Text (Tragic Flaw, Climax & Resolution)",
      "African Poetry Anthology (Analysis of Metaphor, Stanza & Meaning)",
      "Non-African Poetry Anthology (Stylistic Devices & Themes)",
      "Figures of Speech (Metaphor, Simile, Personification, Irony)",
      "Literature in English WASSCE/NECO Examination Practice"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // Senior: Government
  if (cleanSub.includes("government")) {
    const topics = [
      "Meaning, Scope & Essential Attributes of Government",
      "Basic Concepts (State, Nation, Power, Authority & Legitimacy)",
      "Sovereignty, Rule of Law & Separation of Powers",
      "Forms of Government (Unitary, Federal, Confederal, Democratic)",
      "Arms of Government (Executive, Legislature & Judiciary)",
      "Constitutions & Constitutionalism (Written vs Unwritten)",
      "Electoral Systems, Franchise, Ballot & Political Parties",
      "Public Administration, Civil Service & Public Corporations",
      "Pre-Colonial Political Systems in Nigeria (Hausa/Fulani, Yoruba, Igbo)",
      "Colonial Rule & Indirect Rule in Nigeria (Merits & Demerits)",
      "Constitutional Developments in Nigeria (Clifford to 1999 Constitution)",
      "Government Examination Practice & WASSCE Preparation"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // Senior: Financial Accounting / Bookkeeping
  if (cleanSub.includes("accounting") || cleanSub.includes("bookkeeping") || cleanSub.includes("financial")) {
    const topics = [
      "Nature, Purpose & Principles of Accounting",
      "Accounting Concepts, Conventions & Double-Entry Principle",
      "Source Documents & Subsidiary Books (Journals & Daybooks)",
      "Cash Book (Two-Column & Three-Column Formats)",
      "Bank Reconciliation Statements & Adjusted Cash Book",
      "Ledger Accounts, Posting & Balancing Procedures",
      "The Trial Balance & Correction of Errors (Suspense Account)",
      "Trading, Profit & Loss Account (Income Statement)",
      "The Balance Sheet (Statement of Financial Position)",
      "Depreciation of Fixed Assets (Straight Line & Reducing Balance)",
      "Partnership Accounts & Appropriation of Profits",
      "Financial Accounting WASSCE/NECO Examination Practice"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // Senior: Commerce
  if (cleanSub.includes("commerce")) {
    const topics = [
      "Meaning, Scope & Functions of Commerce in Economic Life",
      "Historical Evolution of Commerce & Barter System",
      "Home Trade (Wholesale Trade, Functions & Middlemen)",
      "Retail Trade (Types, Large Scale Retailing & Supermarkets)",
      "Foreign / International Trade (Import, Export & Balance of Trade)",
      "Aids to Trade (Banking, Insurance, Transport & Warehousing)",
      "Advertising & Sales Promotion (Media, Types & Consumer Impact)",
      "Communication & Courier Services in Business",
      "Commercial Documents & Instruments of Payment (Cheques, Bills)",
      "Business Ownership (Sole Proprietorship, Partnership, LLC)",
      "Consumer Protection (Standards Organization of Nigeria & FCCPC)",
      "Commerce WASSCE/NECO Examination Practice & Case Studies"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // Cultural & Creative Arts (CCA) / Fine Arts / Music
  if (cleanSub.includes("cultural") || cleanSub.includes("creative arts") || cleanSub.includes("cca") || cleanSub.includes("fine art") || cleanSub.includes("art") || cleanSub.includes("music")) {
    const topics = [
      "Introduction to Art (Meaning, Branches & Functions of Art)",
      "Elements of Art (Line, Shape, Form, Color, Texture, Value, Space)",
      "Principles of Design (Balance, Rhythm, Proportion, Harmony)",
      "Color Theory (Primary, Secondary, Tertiary Colors & Color Wheel)",
      "Drawing & Shading Techniques (Still Life, Nature & Figure Drawing)",
      "Painting & Color Mixing (Watercolour, Poster Color & Acrylics)",
      "Craftwork, Modeling & Paper Craft (Origami, Papier Mache)",
      "Traditional Nigerian Crafts (Pottery, Weaving, Leatherwork)",
      "Introduction to Music (Pitch, Rhythm, Melody & Clefs)",
      "Musical Instruments (Traditional Nigerian vs Western Instruments)",
      "Performing Arts, Drama & Dance in Nigerian Cultures",
      "Cultural & Creative Arts Examination Practice & Studio Work"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // Physical & Health Education (PHE)
  if (cleanSub.includes("physical") || cleanSub.includes("health education") || cleanSub.includes("phe")) {
    const topics = [
      "Meaning, Objectives & Scope of Physical & Health Education",
      "Physical Fitness & Components (Strength, Endurance, Agility)",
      "Athletics (Track Events: Sprints, Relays, Middle & Long Distance)",
      "Field Events (Jumping: High Jump, Long Jump; Throwing: Shot Put)",
      "Ball Games (Football: Rules, Skills, Pitch Dimensions & Officiating)",
      "Ball Games (Basketball & Volleyball: Skills, Rules & Formations)",
      "Human Body Systems & Exercise Physiology (Circulation, Respiration)",
      "Personal Hygiene, Environmental Health & Sanitation",
      "Nutrition & Athletic Performance (Nutrients, Hydration)",
      "First Aid, Safety in Sports & Injury Management (RICE Protocol)",
      "Communicable Diseases (Prevention, Control & Immunization)",
      "PHE Examination Practice & Practical Drills"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // Home Economics / Food & Nutrition
  if (cleanSub.includes("home economics") || cleanSub.includes("food")) {
    const topics = [
      "Meaning, Scope & Importance of Home Economics / Food & Nutrition",
      "The Home, Family Living & Care of Household Equipment",
      "Nutrients in Foods (Proteins, Carbs, Fats, Vitamins, Minerals, Water)",
      "Meal Planning, Balanced Diet & Nutritional Needs of Family Members",
      "Kitchen Safety, Hygiene & Food Preservation Methods",
      "Cooking Methods (Boiling, Baking, Frying, Steaming & Roasting)",
      "Sewing Tools, Stitches (Temporary & Permanent) & Fabric Care",
      "Clothing Construction, Patterns & Garment Repair",
      "Child Development, Care & Immunization Schedules",
      "Consumer Education, Budgeting & Wise Food Buying",
      "Entertaining, Table Setting & Etiquette",
      "Home Economics Examination Practice & Practical Demonstration"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // Religious Studies: CRS & IRS
  if (cleanSub.includes("christian") || cleanSub.includes("crs")) {
    const topics = [
      "God as Creator (Creation of the Universe & Humankind)",
      "Sovereignty of God & Biblical Patriarchs (Abraham, Isaac, Jacob)",
      "Deliverance & Exodus of Israel from Egypt (Moses & Red Sea)",
      "The Ten Commandments & Moral Guidelines for Society",
      "Leadership of Joshua, Deborah & Samuel",
      "The Early Life & Ministry of Jesus Christ",
      "Parables of Jesus & Lessons on the Kingdom of God",
      "The Passion, Death & Resurrection of Jesus Christ",
      "The Holy Spirit & the Birth of the Early Church (Pentecost)",
      "Missionary Journeys of Apostle Paul & Epistle Teachings",
      "Living as True Christians in Contemporary Nigeria (Peace & Love)",
      "Christian Religious Studies Examination Practice & Reflection"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  if (cleanSub.includes("islamic") || cleanSub.includes("irs")) {
    const topics = [
      "Tawhid (Oneness of Allah & Pillars of Iman)",
      "Pillars of Islam (Shahadah, Salah, Zakat, Sawm, Hajj)",
      "The Holy Qur'an (Revelation, Compilation & Selected Surahs)",
      "Hadith Studies (Meaning, Science of Hadith & Selected Sayings)",
      "The Life of Prophet Muhammad (PBUH) in Makkah & Madinah",
      "The Rightly Guided Caliphs (Abu Bakr, Umar, Uthman, Ali)",
      "Taharah (Ritual Purity, Wudu, Ghusl & Tayammum)",
      "Islamic Moral Values (Truthfulness, Honesty, Respect for Elders)",
      "Family Life, Marriage & Inheritance in Islam",
      "Social Justice, Peace & Harmonious Living in Society",
      "Zakat, Sadaqah & Alleviating Poverty in the Community",
      "Islamic Religious Studies Examination Practice & Revision"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // Security Education
  if (cleanSub.includes("security")) {
    const topics = [
      "Meaning, Importance & Objectives of Security Education",
      "Personal Security Precautions at Home, School & on the Road",
      "Common Security Threats (Kidnapping, Armed Robbery, Burglary)",
      "Emergency Security Management & Emergency Hotlines in Nigeria",
      "Security Agencies in Nigeria (Police, Civil Defence, Military)",
      "Reporting Suspicious Movements & Crime Prevention Strategies",
      "Child Abuse, Human Trafficking & Prevention Measures",
      "Drug Abuse, Trafficking & Consequences on National Security",
      "Cultism, Gang Violence & Resisting Negative Peer Pressure",
      "Cybercrime, Online Scams & Digital Safety Guidelines",
      "Community Policing, Neighborhood Watch & Vigilance",
      "Security Education Revision & Examination Review"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // History & Geography
  if (cleanSub.includes("history")) {
    const topics = [
      "Meaning, Sources & Importance of History",
      "Historical Sites & Heritage in Nigeria (Nok, Ife, Igbo-Ukwu, Benin)",
      "Pre-Colonial Kingdoms & Empires of Nigeria (Kanem-Borno, Oyo, Benin)",
      "Trans-Saharan Trade & European Exploration of the Niger",
      "The Scramble for Africa & British Colonization of Nigeria",
      "Amalgamation of 1914 & Nationalist Movements in Nigeria",
      "Nigeria's Independence in 1960 & First Republic Politics",
      "Military Rule in Nigeria (1966 - 1999) & the Civil War",
      "The Fourth Republic & Return to Democratic Governance",
      "Notable Heroes & Heroines in Nigerian Nation Building",
      "Nigeria's Role in International Organizations (UN, AU, ECOWAS)",
      "History Examination Practice & Document Analysis"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  if (cleanSub.includes("geography")) {
    const topics = [
      "Introduction to Geography (The Earth in the Solar System)",
      "Earth's Structure, Rotation, Revolution & Seasons",
      "Latitude, Longitude, Great Circles & Time Calculations",
      "Map Reading & Scale (Contour Lines, Relief & Topography)",
      "Rocks of the Earth's Crust (Igneous, Sedimentary, Metamorphic)",
      "Weather & Climate (Temperature, Pressure, Wind, Rainfall)",
      "Vegetation Belts of Nigeria & Environmental Adaptation",
      "Drainage Systems (River Basins, Lakes & Water Resources)",
      "Population Geography (Census, Distribution & Migration)",
      "Agricultural Systems & Mineral Resources in Nigeria",
      "Environmental Hazards (Desertification, Flooding & Pollution)",
      "Geography WASSCE/NECO Examination Practice & Mapwork"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // Languages: French, Yoruba, Igbo, Hausa
  if (cleanSub.includes("french")) {
    const topics = [
      "Salutations, Greetings & Polite Expressions (Les Salutations)",
      "French Alphabet, Pronunciation & Accents (L'Alphabet Français)",
      "Numbers 1 to 100 in French (Les Nombres de 1 à 100)",
      "Introducing Oneself & Others (Se Présenter et Présenter Quelqu'un)",
      "Days of the Week, Months & Seasons (Les Jours et Les Mois)",
      "The Classroom & School Objects (Les Objets de la Classe)",
      "Family Members & Relationships (La Famille)",
      "Parts of the Human Body (Le Corps Humain)",
      "Telling the Time in French (L'Heure)",
      "Food, Fruits & Common Drinks (La Nourriture et Les Boissons)",
      "Common Verbs in the Present Tense (Être, Avoir, Parler, Aller)",
      "French Language Examination Practice & Oral Expressions"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  if (cleanSub.includes("yoruba") || cleanSub.includes("igbo") || cleanSub.includes("hausa")) {
    const topics = [
      "Indigenous Alphabet, Vowels, Consonants & Tonal Marks",
      "Greetings, Courtesy & Cultural Etiquette in Daily Life",
      "Numbers, Counting & Monetary Expressions in Indigenous Tongue",
      "Family Structure, Kinship Terms & Household Objects",
      "Parts of the Body & Personal Hygiene Expressions",
      "Traditional Occupations, Farming & Market Transactions",
      "Indigenous Festivals, Beliefs & Moral Values",
      "Proverbs, Folktales & Oral Literary Traditions",
      "Parts of Speech (Nouns, Pronouns, Verbs in Native Grammar)",
      "Simple Sentence Construction & Reading Comprehension",
      "Translation of Short Passages (English to Native Language)",
      "Indigenous Language Examination Practice & Oral Drills"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  // Primary: Verbal & Quantitative Reasoning, Vocational Aptitude, Handwriting
  if (cleanSub.includes("verbal reasoning")) {
    const topics = [
      "Alphabetical Ordering, Word Building & Word Search",
      "Synonyms & Antonyms (Words of Same & Opposite Meanings)",
      "Analogies & Word Relationships (Part to Whole, Cause to Effect)",
      "Word Formation, Prefixes, Suffixes & Root Words",
      "Compound Words, Jumbled Words & Sentence Rearrangement",
      "Rhyming Words, Odd Words Out & Category Grouping",
      "Codes, Decoding & Word-Letter Number Representations",
      "Homophones, Homonyms & Contextual Usage",
      "Logical Deduction & Sentence Completion Drills",
      "Idiomatic Expressions & Common Figurative Meanings",
      "Reading Comprehension & Verbal Inference Practice",
      "National Common Entrance Examination Verbal Drills"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  if (cleanSub.includes("quantitative reasoning")) {
    const topics = [
      "Number Patterns, Number Sequences & Missing Numbers",
      "Basic Operations in Shapes (Addition & Subtraction Patterns)",
      "Multiplication & Division Grids and Cross-Math Boxes",
      "Fractions, Decimal Equivalents & Ratio Patterns",
      "Number Bonds, Magic Squares & Triangle Calculations",
      "Place Values, Greater Than, Less Than & Number Sorting",
      "Clock Face Logic, Time Elapsed & Calendar Math Puzzles",
      "Money Math, Buying, Selling & Change Calculation Puzzles",
      "Geometric Shapes, Perimeter & Area Deduction Puzzles",
      "Bar Charts, Pictograms & Simple Data Interpretation Puzzles",
      "Mathematical Codes & Symbol Substitution Exercises",
      "National Common Entrance Quantitative Examination Drills"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  if (cleanSub.includes("vocational") || cleanSub.includes("handwriting") || cleanSub.includes("phonics")) {
    const topics = [
      "Introduction to Community Occupations (Carpentry, Tailoring)",
      "Tools Used by Craftsmen & Artisans in Our Environment",
      "Safety Rules when Handling Work Tools & Materials",
      "Letter Formation (Lower Case & Upper Case Cursive Script)",
      "Joining Letters, Spacing & Consistent Slant in Writing",
      "Phonics: Short Vowels, Long Vowels & Consonant Blends",
      "Digraphs (sh, ch, th, ph, wh) & Diphthongs in English Words",
      "Silent Letters (k in knee, w in write, b in comb)",
      "Copying Passages with Legible, Neat Penmanship",
      "Simple Woodcraft & Paper Folding Demonstrations",
      "Agricultural & Food Craft Skills in the Local Community",
      "Handwriting, Phonics & Vocational Aptitude Assessment"
    ];
    return topics[(wkNum - 1) % topics.length];
  }

  return `${subject} ${week} Core Module`;
}

export function buildStructuredAcademicComponents(
  subject: string,
  topic: string,
  classLevel: string,
  rawContent: string = ""
): {
  definitions: DefinitionItem[];
  illustrativeExamples: IllustrativeExample[];
  stepByStepGuidance: StepByStepGuidance[];
} {
  const cleanSub = (subject || "").toLowerCase();
  const cleanTop = (topic || "").toLowerCase();

  // 1. DEFINITIONS EXTRACTION / GENERATION
  const definitions: DefinitionItem[] = [];

  // Try extracting from rawContent if available
  const defMatches = rawContent.match(/\*\*(.+?):\*\*\s*([^\n\r]+)/g);
  if (defMatches && defMatches.length >= 2) {
    for (const match of defMatches.slice(0, 4)) {
      const parts = match.split(/:\*\*\s*/);
      if (parts.length === 2) {
        const term = parts[0].replace(/\*\*/g, "").replace(/^\d+\.\s*/, "").trim();
        const definition = parts[1].trim();
        const lowerTerm = term.toLowerCase();
        if (
          lowerTerm.includes("example") ||
          lowerTerm.includes("step") ||
          lowerTerm.includes("method") ||
          lowerTerm.includes("question") ||
          lowerTerm.includes("problem") ||
          lowerTerm.includes("answer") ||
          lowerTerm.includes("solution") ||
          lowerTerm.includes("root") ||
          lowerTerm.includes("note") ||
          lowerTerm.includes("rule")
        ) {
          continue;
        }
        if (term.length > 2 && term.length < 50 && definition.length > 10) {
          definitions.push({
            term,
            definition,
            keyPoints: [
              `Fundamental concept under ${topic}`,
              `Standard NERDC ${classLevel} examination benchmark`
            ]
          });
        }
      }
    }
  }

  // Fallback high-fidelity definitions if none extracted
  if (definitions.length < 2) {
    if (cleanSub.includes("math")) {
      definitions.push(
        {
          term: `${topic} (Core Concept)`,
          definition: `The formal mathematical branch and systematic formulation governing numerical, algebraic, or geometric operations in ${classLevel} Mathematics.`,
          keyPoints: ["Governed by strict axiomatic rules and formulas", "Requires precision in arithmetic sign management and variable substitution"]
        },
        {
          term: "Standard Mathematical Form",
          definition: `The universally accepted canonical representation of the equation or expression allowing systematic factorization, transformation, or computation.`,
          keyPoints: ["Enables direct identification of coefficients, powers, and constants", "Essential prerequisite before applying standard solution algorithms"]
        },
        {
          term: "Root / Solution Set",
          definition: `The specific numerical value or set of values that, when substituted into the mathematical statement, makes the equation true.`,
          keyPoints: ["Verified by back-substitution into the original equation", "Can be real, distinct, repeated, or complex depending on the discriminant"]
        }
      );
    } else if (cleanSub.includes("physic") || cleanSub.includes("chem") || cleanSub.includes("bio") || cleanSub.includes("science")) {
      definitions.push(
        {
          term: `${topic}`,
          definition: `The natural or physical phenomenon, law, or mechanism governing the behavior of matter, energy, organisms, or systems under ${subject}.`,
          keyPoints: ["Empirically verified through experimental observation", "Follows standard SI units and dimensional consistency"]
        },
        {
          term: "Governing Scientific Principle",
          definition: `The fundamental law or relationship that quantitatively or qualitatively describes how variables interact in ${topic}.`,
          keyPoints: ["Expressible as mathematical equations or cause-effect relationships", "Applicable to standard WAEC/NECO practical and theory assessments"]
        },
        {
          term: "Operational Parameter & Unit",
          definition: `The physical quantities, reagents, or anatomical structures directly measured or analyzed in ${topic}.`,
          keyPoints: ["Must always be accompanied by standard metric units", "Subject to conservation laws and environmental influences"]
        }
      );
    } else if (cleanSub.includes("english") || cleanSub.includes("literature")) {
      definitions.push(
        {
          term: `${topic}`,
          definition: `The linguistic, grammatical, or literary rule set and structural convention governing effective communication and textual analysis in English.`,
          keyPoints: ["Governs syntax, semantic coherence, and register", "Tested rigorously in WASSCE/NECO objective and essay papers"]
        },
        {
          term: "Syntactic Structure",
          definition: `The formal arrangement of grammatical elements (subject, predicate, modifiers, clauses) forming coherent, error-free sentences.`,
          keyPoints: ["Requires strict subject-verb and tense concord", "Prevents ambiguity, run-on structures, and dangling modifiers"]
        },
        {
          term: "Contextual Application",
          definition: `The practical usage of stylistic devices, vocabulary, or organizational strategies in formal writing and oral discourse.`,
          keyPoints: ["Tailored to audience, purpose, and formal examination criteria", "Enhances persuasiveness, clarity, and grammatical precision"]
        }
      );
    } else {
      definitions.push(
        {
          term: `${topic}`,
          definition: `The systematic academic study and practical understanding of foundational principles, institutions, and mechanisms under ${subject}.`,
          keyPoints: ["Directly aligned with NERDC curriculum specifications", "Applicable to societal development, commerce, and governance in Nigeria"]
        },
        {
          term: "Core Component / Structure",
          definition: `The primary building blocks, operational procedures, or institutional bodies that constitute ${topic}.`,
          keyPoints: ["Identifiable by specific roles, functions, and legal/economic frameworks", "Critical for continuous assessment and final examination mastery"]
        },
        {
          term: "Practical Function & Value",
          definition: `The economic, social, civic, or technical utility provided to individuals, communities, and modern industry.`,
          keyPoints: ["Promotes self-reliance, civic responsibility, or entrepreneurial productivity", "Solves everyday real-world Nigerian challenges"]
        }
      );
    }
  }

  // 2. ILLUSTRATIVE EXAMPLES
  const illustrativeExamples: IllustrativeExample[] = [];

  if (cleanSub.includes("math")) {
    illustrativeExamples.push(
      {
        title: `Worked Example 1: Standard Numerical Computation on ${topic}`,
        problem: `Given the standard problem in ${topic}, evaluate the expression and find the verified solution set, showing all intermediate calculations.`,
        stepByStepSolution: [
          "Step 1: Write down the given expression and identify all parameters, coefficients, and operations.",
          "Step 2: Transform the problem into standard canonical form by collecting like terms and clearing fractions or brackets.",
          "Step 3: Apply the governing mathematical formula or factorization rule systematically.",
          "Step 4: Compute arithmetic calculations carefully, verifying signs (+ and -) at each line of working."
        ],
        finalAnswer: "x = 2 or x = -3 (Verified by back-substitution)",
        explanation: "Always check your final answers by substituting them into the original statement. A sign error in Step 2 is the most common student pitfall in WAEC examinations."
      },
      {
        title: `Worked Example 2: Applied Word Problem / Real-World Model`,
        problem: `A practical scenario modeled on ${topic} requires finding an unknown dimension or rate given standard initial conditions. Formulate the equation and solve for the unknown.`,
        stepByStepSolution: [
          "Step 1: Define variables clearly (let x represent the unknown quantity).",
          "Step 2: Translate the verbal statement into a formal algebraic or geometric equation.",
          "Step 3: Solve the equation using standard analytical techniques step by step.",
          "Step 4: State the physical interpretation and attach appropriate units."
        ],
        finalAnswer: "Value = 15 units (Positive physical dimension confirmed)",
        explanation: "In word problems, reject non-physical results (such as negative lengths or negative time) with a brief justification."
      }
    );
  } else if (cleanSub.includes("physic") || cleanSub.includes("chem") || cleanSub.includes("bio")) {
    illustrativeExamples.push(
      {
        title: `Worked Example 1: Quantitative / Laboratory Analysis on ${topic}`,
        problem: `A laboratory sample or physical system governed by ${topic} is subjected to standard conditions. Determine the resultant magnitude, product yield, or physiological response.`,
        stepByStepSolution: [
          "Step 1: State the given parameters with their proper SI units and identify the required quantity.",
          "Step 2: State the governing scientific formula or chemical equation, ensuring it is balanced.",
          "Step 3: Substitute the numerical values into the formula and execute the arithmetic calculation.",
          "Step 4: State the final calculated value with the correct SI unit and significant figures."
        ],
        finalAnswer: "Result = 24.5 J / mol (or equivalent standard SI unit)",
        explanation: "Always verify dimensional consistency before calculation. Never omit units in scientific examinations."
      },
      {
        title: `Worked Example 2: Real-World Nigerian Case Application`,
        problem: `Explain how the principles of ${topic} are applied in Nigerian industrial processing, agricultural yield enhancement, or environmental conservation.`,
        stepByStepSolution: [
          "Step 1: Identify the practical challenge in the Nigerian context (e.g. soil acidity, electricity transmission, disease vector control).",
          "Step 2: Correlate the specific mechanism of ${topic} to the observed phenomenon.",
          "Step 3: Outline the preventative or optimizing technical intervention step by step.",
          "Step 4: Evaluate the measurable economic or health benefit."
        ],
        finalAnswer: "Demonstrates 35% higher operational efficiency and safety compliance",
        explanation: "Connecting theoretical science to Nigerian socio-economic reality helps learners retain concepts and pass UTME/SSCE application questions."
      }
    );
  } else {
    illustrativeExamples.push(
      {
        title: `Worked Example 1: Textual / Analytical Model on ${topic}`,
        problem: `Analyze a standard scenario or passage demonstrating the principles, structural rules, or mechanisms of ${topic}.`,
        stepByStepSolution: [
          "Step 1: Read the scenario and highlight key terminology, rules, or structural elements.",
          "Step 2: Identify the governing principle and classify the components systematically.",
          "Step 3: Apply the academic rule or framework to resolve the problem.",
          "Step 4: Formulate a coherent, grammatically sound conclusion."
        ],
        finalAnswer: "Correct analytical classification and verified resolution established.",
        explanation: "Always cite the specific rule or textbook principle that justifies your analytical conclusion."
      },
      {
        title: `Worked Example 2: Practical Problem-Solving Application`,
        problem: `Demonstrate how a student or professional applies ${topic} to avoid errors and achieve superior outcomes.`,
        stepByStepSolution: [
          "Step 1: Pinpoint common misconceptions or errors associated with this topic.",
          "Step 2: Apply the step-by-step verification checklist.",
          "Step 3: Execute the correction systematically.",
          "Step 4: Review against curriculum criteria."
        ],
        finalAnswer: "Flawless execution adhering strictly to NERDC benchmarks.",
        explanation: "Mastering common traps and error prevention is key to achieving distinction grades (A1/B2)."
      }
    );
  }

  // 3. STEP-BY-STEP GUIDANCE
  const stepByStepGuidance: StepByStepGuidance[] = [
    {
      stepNumber: 1,
      title: "Identify & Analyze Given Parameters",
      instruction: `Carefully examine the problem statement or scenario on ${topic}. List all given data, identify unknown quantities, and verify definitions.`,
      keyRuleOrTip: "Never rush into calculations or writing before identifying all given constraints and requirements."
    },
    {
      stepNumber: 2,
      title: "Select Governing Rule, Formula or Framework",
      instruction: `Choose the specific mathematical formula, scientific law, grammatical concord rule, or institutional framework tailored to ${topic}.`,
      keyRuleOrTip: "Verify that all prerequisites and boundary conditions for this rule are fully satisfied."
    },
    {
      stepNumber: 3,
      title: "Execute Step-by-Step Systematic Solution",
      instruction: `Carry out the computation, structural transformation, or analytical breakdown sequentially. Show every step of working clearly on the board/notebook.`,
      keyRuleOrTip: "Do not skip lines of working. WAEC and NECO award distinct method marks (M-marks) for each intermediate step."
    },
    {
      stepNumber: 4,
      title: "Verify, Check Units & State Final Interpretation",
      instruction: `Substitute the computed value back into the original problem statement or review the sentence against grammar rules to confirm validity.`,
      keyRuleOrTip: "Always attach correct units, underline the final answer, and confirm that the result makes physical/logical sense."
    }
  ];

  return { definitions, illustrativeExamples, stepByStepGuidance };
}

export function buildPedagogicalTopicNote(
  subject: string,
  topic: string,
  classLevel: string,
  subtopic: string,
  week: string = "Week 1"
): {
  objectives: string[];
  introduction: string;
  lessonContent: string;
  evaluation: string[];
  assignment: string[];
  summary: string;
  definitions?: DefinitionItem[];
  illustrativeExamples?: IllustrativeExample[];
  stepByStepGuidance?: StepByStepGuidance[];
} {
  const rawBase = getComprehensiveLessonNote(classLevel, subject, topic, week, subtopic);
  const base = cleanStructuredLessonNote(rawBase);
  const structured = cleanStructuredLessonNote(buildStructuredAcademicComponents(subject, topic, classLevel, base.lessonContent));
  const combined = {
    ...base,
    lessonContent: cleanLessonNoteText(base.lessonContent),
    introduction: cleanLessonNoteText(base.introduction),
    summary: cleanLessonNoteText(base.summary),
    objectives: (base.objectives || []).map(cleanLessonNoteText),
    evaluation: (base.evaluation || []).map(cleanLessonNoteText),
    assignment: (base.assignment || []).map(cleanLessonNoteText),
    definitions: structured.definitions,
    illustrativeExamples: structured.illustrativeExamples,
    stepByStepGuidance: structured.stepByStepGuidance
  };
  return cleanStructuredLessonNote(combined);
}

export async function generateCurriculumLessonNote(
  params: LessonNoteRequest,
  geminiClient: GoogleGenAI | null
): Promise<{ success: boolean; data?: StructuredLessonNote; error?: string }> {
  const validation = validateLessonNoteParams(params);
  if (!validation.valid) {
    return {
      success: false,
      error: `Missing required curriculum fields: ${validation.missingFields.join(", ")}. Please provide all 5 fields: Class, Subject, Term, Week, Topic.`,
    };
  }

  const targetClass = (params.class || params.className || "SS 2").trim();
  const targetSubject = params.subject.trim();
  const targetTerm = params.term.trim();
  const targetWeek = params.week.trim();
  const targetTopic = params.topic.trim();
  const targetSubtopic = (params.subtopic || params.subTopic || `Detailed Study of ${targetTopic}`).trim();
  const duration = (params.duration || params.lessonDuration || "40 Minutes").trim();
  const schoolName = params.schoolName || "LivingstoneEDU";

  // Level classification for Nigerian curriculum
  const isPrimary = /primary|grade|basic [1-6]/i.test(targetClass);
  const isJSS = /jss|junior secondary|basic [7-9]/i.test(targetClass);
  const isSSS = /ss|sss|senior secondary/i.test(targetClass);

  let levelInstruction = "Senior Secondary (SS 1 - 3): Advanced, academically precise terminology tailored for WAEC, NECO, and UTME exams with worked calculations, complete proofs, and scientific depth.";
  if (isPrimary) {
    levelInstruction = "Primary 1 - 6: Foundational concepts, simple, relatable everyday Nigerian examples, engaging interactive tone, short sentences, and zero overly complex jargon.";
  } else if (isJSS) {
    levelInstruction = "Junior Secondary (JSS 1 - 3): Intermediate academic depth, developing analytical reasoning, practical technical and business concepts aligned with BECE and junior secondary NERDC syllabus.";
  }

  if (geminiClient && Date.now() > geminiQuotaCooldownUntil) {
    try {
      const prompt = `You are the official AI Lesson Note Engine for LIVINGSTONEEDU, the premier Nigerian school management and learning platform.

You are tasked with generating a COMPLETE, HIGHLY DETAILED, ACCURATE, CURRICULUM-ALIGNED lesson note for:
- Platform: LivingstoneEdu
- School: ${schoolName}
- Class Level: ${targetClass}
- Target Subject: ${targetSubject}
- Term: ${targetTerm}
- Week: ${targetWeek}
- Topic: ${targetTopic}
- Subtopic: ${targetSubtopic}
- Duration: ${duration}

LEVEL GUIDELINES:
${levelInstruction}

CRITICAL MANDATES & PEDAGOGICAL DISCIPLINE:
1. STRICT PROHIBITION ON '#', '*', AND DOLLAR SIGNS ($):
   - UNDER NO CIRCUMSTANCES should you add any '#' or '*' symbols to the lesson notes.
   - Do NOT use markdown heading hashes (like '#', '##', '###').
   - Do NOT use asterisks for bold, italics, or formatting (like '**bold**', '*italic*', '***text***').
   - Do NOT use asterisks for bullet points (like '* item'). Use clean bullet '• ' or numbered lists ('1.', '2.').
   - UNDER NO CIRCUMSTANCES should you add any dollar sign "$" symbols to the lesson notes.
   - All equations, variables, formulas, numbers, and units MUST be written in clean, standard, readable plain text (e.g. write "x^2 - 7x + 12 = 0", "x = 3 or x = 4", "1101 (base 2)", "Base 2", "Base 10", "H2O", "2^4 = 16", "v = f × lambda").
   - NEVER enclose any number, variable, term, formula, or equation in dollar signs ($). Any '#', '*', or '$' symbol in your output is strictly forbidden.

2. PRIMARY DIRECTIVE: FOCUS STRICTLY ON EXPLAINING THE TOPIC. The AI should only explain each topic and subtopic with clear, textbook-standard, notebook-ready explanations. Do NOT provide unnecessary administrative information, greeting fluff, or extraneous padding.
3. STRICTLY FORBIDDEN: DO NOT write classroom management scripts, conversational filler, or meta-teaching instructions like:
   - "Teacher greets class and marks attendance"
   - "Teacher writes topic on the chalkboard"
   - "Teacher asks students to open their notebooks"
   - "Students listen attentively and take down notes"
   - Conversational preambles or administrative fluff
   Instead, explain each concept of "${targetTopic}" directly with concise definitions, clear breakdown of laws/rules, and illustrative worked examples that directly explain the academic matter.

3. "definitions": Provide an array of 3 to 4 distinct key terms and foundational principles with formal, unambiguous definitions and key distinguishing characteristics explaining the topic.
4. "illustrativeExamples": Provide an array of 2 to 3 fully worked illustrative examples that explain the topic practically. Each example MUST contain:
   - "title": Descriptive title (e.g., "Example 1: Solving 3x² + 7x - 6 = 0 by Factorization")
   - "problem": Complete problem statement with all given values
   - "stepByStepSolution": Array of clear, sequential steps showing all arithmetic, algebra, diagram steps, or grammatical rules
   - "finalAnswer": The verified final answer or conclusion
   - "explanation": Direct explanation of why this solution works and common pitfalls to avoid
5. "stepByStepGuidance": Provide an array of 4 to 5 numbered steps showing learners exactly how to approach, analyze, and understand principles of this topic.
6. "lessonContent": Focused academic notes directly explaining the core theory, concepts, classifications, and practical application of ${targetTopic} without unnecessary digressions.

You MUST respond strictly with a valid JSON object conforming exactly to this structure (no markdown wrapper outside the JSON):
{
  "class": "${targetClass}",
  "subject": "${targetSubject}",
  "term": "${targetTerm}",
  "week": "${targetWeek}",
  "topic": "${targetTopic}",
  "subtopic": "${targetSubtopic}",
  "duration": "${duration}",
  "objectives": [
    "State the definitions, rules, and classifications of ${targetTopic}.",
    "Apply concepts of ${targetTopic} to solve standard curriculum questions and real-world exercises."
  ],
  "previousKnowledge": "Students have covered prerequisite foundational concepts related to ${targetSubject}.",
  "introduction": "Engaging real-world introduction connecting ${targetTopic} to everyday Nigerian experiences.",
  "materials": ["Standard NERDC Textbook", "Whiteboard and Markers", "Instructional Wall Charts"],
  "definitions": [
    {
      "term": "${targetTopic}",
      "definition": "Clear, precise academic definition.",
      "keyPoints": ["Key characteristic 1", "Key characteristic 2"]
    }
  ],
  "illustrativeExamples": [
    {
      "title": "Worked Example 1: Standard Problem Solving",
      "problem": "Clear problem statement on ${targetTopic}",
      "stepByStepSolution": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
      "finalAnswer": "Verified final result",
      "explanation": "Why this solution works and common pitfalls to avoid"
    }
  ],
  "stepByStepGuidance": [
    {
      "stepNumber": 1,
      "title": "Identify Given Parameters",
      "instruction": "Detailed instruction on how to begin solving problems on ${targetTopic}",
      "keyRuleOrTip": "Key rule to keep in mind"
    }
  ],
  "lessonContent": "COMPREHENSIVE, NOTEBOOK-READY academic notes explaining ${targetTopic} directly with real definitions, real classifications, and fully worked numerical or analytical examples.",
  "classActivities": [
    "Guided practice exercise solving sample questions on ${targetTopic}",
    "Short paired drill reviewing core classifications"
  ],
  "evaluation": [
    "State the core definition of ${targetTopic} and list its primary types or rules.",
    "Solve a standard exercise problem demonstrating the application of ${targetTopic}."
  ],
  "assignment": [
    "Complete review questions on ${targetTopic} in the approved curriculum textbook.",
    "Solve two practice problems on ${targetTopic} in your homework notebook."
  ],
  "summary": "Direct, 2-to-3 sentence factual summary of the core principles and facts established in this lesson.",
  "keywords": [
    { "term": "Core Term 1", "meaning": "Clear, accurate definition" },
    { "term": "Core Term 2", "meaning": "Clear, accurate definition" }
  ]
}`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI generation timeout after 7 seconds")), 7000)
      );

      const response = await Promise.race([
        geminiClient.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            maxOutputTokens: 6000,
          },
        }),
        timeoutPromise
      ]);

      if (response.text) {
        let parsed = JSON.parse(response.text) as StructuredLessonNote;
        // Ensure structured components are present
        if (!parsed.definitions || parsed.definitions.length === 0 || !parsed.illustrativeExamples || parsed.illustrativeExamples.length === 0) {
          const fallbackComponents = buildStructuredAcademicComponents(targetSubject, targetTopic, targetClass, parsed.lessonContent);
          if (!parsed.definitions || parsed.definitions.length === 0) parsed.definitions = fallbackComponents.definitions;
          if (!parsed.illustrativeExamples || parsed.illustrativeExamples.length === 0) parsed.illustrativeExamples = fallbackComponents.illustrativeExamples;
          if (!parsed.stepByStepGuidance || parsed.stepByStepGuidance.length === 0) parsed.stepByStepGuidance = fallbackComponents.stepByStepGuidance;
        }
        parsed = cleanStructuredLessonNote(parsed);
        parsed.markdownContent = formatLessonNoteToMarkdown(parsed);
        return { success: true, data: parsed };
      }
    } catch (e: any) {
      const errStr = String(e?.message || e || "");
      if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("Quota exceeded")) {
        geminiQuotaCooldownUntil = Date.now() + 30 * 60 * 1000; // 30 min cooldown
        console.info("[LessonNoteEngine] Quota limit active; switching to deterministic NERDC curriculum knowledge base.");
      } else {
        console.info("[LessonNoteEngine] Using deterministic NERDC curriculum knowledge base.");
      }
    }
  }

  // Deterministic, high-quality NERDC lesson note fallback using pedagogical knowledge base
  const topicData = buildPedagogicalTopicNote(targetSubject, targetTopic, targetClass, targetSubtopic, targetWeek);

  let fallbackNote: StructuredLessonNote = {
    class: targetClass,
    subject: targetSubject,
    term: targetTerm,
    week: targetWeek,
    topic: targetTopic,
    subtopic: targetSubtopic,
    duration,
    objectives: topicData.objectives,
    previousKnowledge: `Students have previously covered foundational concepts related to ${targetSubject} in earlier weeks of this academic term.`,
    introduction: topicData.introduction,
    materials: [
      "Standard NERDC Approved Curriculum Textbook",
      "Classroom Whiteboard and Markers",
      "Visual Diagrams and Instructional Charts",
      "LivingstoneEdu Interactive Digital Platform"
    ],
    definitions: topicData.definitions || [],
    illustrativeExamples: topicData.illustrativeExamples || [],
    stepByStepGuidance: topicData.stepByStepGuidance || [],
    lessonContent: topicData.lessonContent,
    classActivities: [
      `Collaborative group analysis on ${targetTopic}`,
      `Individual exercise solving practice drills on ${targetSubtopic}`
    ],
    evaluation: topicData.evaluation,
    assignment: topicData.assignment,
    summary: topicData.summary,
    keywords: [
      { term: targetTopic, meaning: `The central theme and operational subject matter of the lesson.` },
      { term: targetSubtopic, meaning: `The specific syllabus component examined under the broad topic.` }
    ]
  };

  fallbackNote = cleanStructuredLessonNote(fallbackNote);
  fallbackNote.markdownContent = formatLessonNoteToMarkdown(fallbackNote);

  return { success: true, data: fallbackNote };
}
