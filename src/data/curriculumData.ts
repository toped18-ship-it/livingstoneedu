// NERDC & WAEC Curriculum Database for LIVINGSTONEEDU

export interface CurriculumTopic {
  className: string;
  subject: string;
  term: string;
  week: string;
  topic: string;
  subTopic: string;
  objectives: string[];
  nerdcReference: string;
  previousKnowledge: string;
  instructionalMaterials: string[];
  keyVocabulary: string[];
  moralLesson: string;
  inclusiveStrategy: string;
}

export const CURRICULUM_DATABASE: CurriculumTopic[] = [
  // --- MATHEMATICS: SS 2 ---
  {
    className: "SS 2",
    subject: "Mathematics",
    term: "First Term",
    week: "Week 1",
    topic: "Logarithms of Numbers",
    subTopic: "Logarithms of numbers greater than 1, multiplication and division using log tables",
    objectives: [
      "Express numbers in standard form (A × 10^n)",
      "Determine characteristics and mantissa of logarithms",
      "Perform multiplication and division of numbers using standard logarithm tables"
    ],
    nerdcReference: "NERDC Senior Secondary Math Curriculum SS2, Sec 1.1",
    previousKnowledge: "Students are familiar with powers of ten and standard forms from SS 1.",
    instructionalMaterials: ["Four-figure logarithm tables", "Scientific calculators", "Chalkboard/Whiteboard charts"],
    keyVocabulary: ["Logarithm", "Characteristic", "Mantissa", "Standard Form", "Antilogarithm"],
    moralLesson: "Accuracy and meticulous detail in calculations reflect honesty and precision in life.",
    inclusiveStrategy: "Provide large-print four-figure tables and step-by-step visual templates for visually impaired learners."
  },
  {
    className: "SS 2",
    subject: "Mathematics",
    term: "First Term",
    week: "Week 2",
    topic: "Logarithms of Numbers Less Than 1",
    subTopic: "Negative characteristics (Bar notation), roots and powers of numbers less than 1",
    objectives: [
      "Read logarithms of decimal numbers less than 1",
      "Apply negative characteristics (bar notation e.g., bar 1, bar 2)",
      "Evaluate powers and roots using log tables"
    ],
    nerdcReference: "NERDC Senior Secondary Math Curriculum SS2, Sec 1.2",
    previousKnowledge: "Students understand standard log operations from Week 1.",
    instructionalMaterials: ["Logarithm worksheets", "Interactive smartboard diagrams"],
    keyVocabulary: ["Bar Notation", "Decimal Fraction", "Reciprocal", "Index Law"],
    moralLesson: "Small fractions of effort, when multiplied consistently, yield significant positive results.",
    inclusiveStrategy: "Pair students for peer-assisted calculation checks."
  },
  {
    className: "SS 2",
    subject: "Mathematics",
    term: "First Term",
    week: "Week 3",
    topic: "Sequence and Series (Arithmetic Progression - AP)",
    subTopic: "Definition of AP, first term (a), common difference (d), nth term formula",
    objectives: [
      "Identify an Arithmetic Progression",
      "Calculate the nth term of an AP using Un = a + (n-1)d",
      "Solve practical word problems involving AP"
    ],
    nerdcReference: "NERDC Senior Secondary Math Curriculum SS2, Sec 2.1",
    previousKnowledge: "Basic algebraic substitution and linear equations.",
    instructionalMaterials: ["Number pattern charts", "Counters/blocks for sequence demonstration"],
    keyVocabulary: ["Sequence", "Arithmetic Progression", "Common Difference", "Nth Term"],
    moralLesson: "Consistency in growth step-by-step builds solid character over time.",
    inclusiveStrategy: "Use tactile blocks for hands-on sequence building."
  },
  {
    className: "SS 2",
    subject: "Mathematics",
    term: "First Term",
    week: "Week 4",
    topic: "Quadratic Equations & Roots Analysis",
    subTopic: "Factorization, Completing the Square, & Graphical Solution",
    objectives: [
      "Identify standard quadratic form ax² + bx + c = 0",
      "Solve quadratic equations using completing the square method",
      "Construct tables of values and plot quadratic curves to determine roots"
    ],
    nerdcReference: "NERDC Senior Secondary Math Curriculum SS2, Sec 3.1",
    previousKnowledge: "Factorization of simple quadratic expressions.",
    instructionalMaterials: ["Graph books", "Grid board", "Rulers", "Quadratic formula charts"],
    keyVocabulary: ["Quadratic", "Parabola", "Roots", "Discriminant", "Completing the Square"],
    moralLesson: "Every complex problem has multiple analytical pathways to a solution.",
    inclusiveStrategy: "Use tactile graph paper for kinesthetic learners."
  },
  {
    className: "SS 2",
    subject: "Mathematics",
    term: "First Term",
    week: "Week 5",
    topic: "Simultaneous Linear & Quadratic Equations",
    subTopic: "Analytical and graphical methods for solving simultaneous linear and quadratic equations",
    objectives: [
      "Solve simultaneous equations with one linear and one quadratic equation",
      "Apply elimination and substitution methods correctly",
      "Find intersection points on a coordinate graph"
    ],
    nerdcReference: "NERDC Senior Secondary Math Curriculum SS2, Sec 3.3",
    previousKnowledge: "Solving quadratic equations and linear simultaneous equations.",
    instructionalMaterials: ["Graph sheets", "Desmos / Geogebra digital graph tools"],
    keyVocabulary: ["Simultaneous", "Intersection", "Substitution", "Coordinates"],
    moralLesson: "Collaboration between different ideas leads to common points of agreement.",
    inclusiveStrategy: "Step-by-step color-coded algebraic substitution guides."
  },
  {
    className: "SS 2",
    subject: "Mathematics",
    term: "First Term",
    week: "Week 6 (Mid-Term)",
    topic: "Mid-Term Assessment & Revision",
    subTopic: "Review of Weeks 1-5 topics and Mid-Term examination",
    objectives: [
      "Evaluate student mastery of Logarithms, AP, and Quadratic equations",
      "Identify learning gaps and provide remedial guidance"
    ],
    nerdcReference: "NERDC Senior Secondary Math Curriculum SS2, Sec 3.4",
    previousKnowledge: "Topics covered in Weeks 1 to 5.",
    instructionalMaterials: ["CBT portal", "Printed test papers"],
    keyVocabulary: ["Assessment", "Evaluation", "Revision"],
    moralLesson: "Self-reflection and periodic evaluation are vital for continuous growth.",
    inclusiveStrategy: "Provide extra time for students requiring accommodations."
  },
  {
    className: "SS 2",
    subject: "Mathematics",
    term: "First Term",
    week: "Week 7",
    topic: "Geometric Progression (GP)",
    subTopic: "Definition of GP, first term (a), common ratio (r), nth term and sum of GP",
    objectives: [
      "Identify Geometric Progressions",
      "Calculate the nth term using Un = a·r^(n-1)",
      "Find the sum of the first n terms of a GP"
    ],
    nerdcReference: "NERDC Senior Secondary Math Curriculum SS2, Sec 2.2",
    previousKnowledge: "Knowledge of Arithmetic Progression from Week 3.",
    instructionalMaterials: ["Exponential growth charts", "Calculators"],
    keyVocabulary: ["Geometric Progression", "Common Ratio", "Exponential Growth", "Sum to Infinity"],
    moralLesson: "Compounding positive habits leads to exponential personal progress.",
    inclusiveStrategy: "Visual tree diagrams illustrating exponential growth."
  },
  {
    className: "SS 2",
    subject: "Mathematics",
    term: "First Term",
    week: "Week 8",
    topic: "Trigonomety: Sine and Cosine Rules",
    subTopic: "Derivation and application of Sine Rule (a/sinA = b/sinB = c/sinC) and Cosine Rule",
    objectives: [
      "State and derive the Sine and Cosine rules",
      "Apply Sine rule to non-right-angled triangles",
      "Apply Cosine rule to calculate unknown sides and angles"
    ],
    nerdcReference: "NERDC Senior Secondary Math Curriculum SS2, Sec 4.1",
    previousKnowledge: "Pythagoras theorem and trigonometric ratios in right-angled triangles.",
    instructionalMaterials: ["Protractors", "3D triangle cutouts", "Calculators"],
    keyVocabulary: ["Sine Rule", "Cosine Rule", "Non-right Triangle", "Subtended Angle"],
    moralLesson: "Understanding different perspectives allows us to solve complex non-standard challenges.",
    inclusiveStrategy: "Use 3D physical models of triangles to assist spatial reasoning."
  },
  {
    className: "SS 2",
    subject: "Mathematics",
    term: "First Term",
    week: "Week 9",
    topic: "Angles of Elevation and Depression",
    subTopic: "Practical applications in surveying, heights, and distances",
    objectives: [
      "Distinguish between angle of elevation and angle of depression",
      "Draw accurate scale diagrams representing real-life scenario word problems",
      "Calculate heights of objects and distances between points"
    ],
    nerdcReference: "NERDC Senior Secondary Math Curriculum SS2, Sec 4.2",
    previousKnowledge: "Trigonometric ratios (SOH CAH TOA).",
    instructionalMaterials: ["Clinometer (homemade or school-made)", "Measuring tape", "Rulers"],
    keyVocabulary: ["Elevation", "Depression", "Horizontal Line of Sight", "Clinometer"],
    moralLesson: "Maintaining an elevated moral outlook helps navigate life's temporary depressions.",
    inclusiveStrategy: "Outdoor practical demonstration using clinometers."
  },

  // --- PHYSICS: SS 2 ---
  {
    className: "SS 2",
    subject: "Physics",
    term: "First Term",
    week: "Week 4",
    topic: "Wave Motion & Sound Wave Properties",
    subTopic: "Production, propagation, speed of sound, echo, and reflection of waves",
    objectives: [
      "Define wave motion and classify mechanical vs electromagnetic waves",
      "State the wave equation V = fλ and solve numerical problems",
      "Explain the phenomenon of echo and its applications in SONAR and acoustics"
    ],
    nerdcReference: "NERDC Senior Secondary Physics Curriculum SS2, Sec 2.1",
    previousKnowledge: "Simple harmonic motion and basic kinetic theory.",
    instructionalMaterials: ["Ripple tank", "Tuning forks", "Slinky spring", "Oscilloscope app"],
    keyVocabulary: ["Transverse Wave", "Longitudinal Wave", "Frequency", "Wavelength", "Echo", "SONAR"],
    moralLesson: "Our words and actions create ripples that reverberate in our community.",
    inclusiveStrategy: "Tactile vibration demonstration with tuning forks in water for hearing-impaired students."
  },

  // --- ENGLISH LANGUAGE: SS 2 ---
  {
    className: "SS 2",
    subject: "English Language",
    term: "First Term",
    week: "Week 4",
    topic: "Argumentative Essay Writing & Grammatical Concord",
    subTopic: "Structuring persuasive arguments, thesis statements, and subject-verb agreement rules",
    objectives: [
      "Outline a standard 5-paragraph argumentative essay",
      "Formulate logical points supporting or opposing a given motion",
      "Apply strict rules of grammatical concord in complex sentences"
    ],
    nerdcReference: "NERDC Senior Secondary English Syllabus SS2, Sec 1.4",
    previousKnowledge: "Expository essay writing and simple concord rules.",
    instructionalMaterials: ["Sample WAEC high-scoring essays", "Concord rule flashcards"],
    keyVocabulary: ["Thesis Statement", "Refutation", "Concord", "Plurality", "Proponent", "Opponent"],
    moralLesson: "Respectful debate fosters intellectual maturity and harmony.",
    inclusiveStrategy: "Sentence frames and guided graphic organizers for essay structuring."
  },

  // --- CHEMISTRY: SS 2 ---
  {
    className: "SS 2",
    subject: "Chemistry",
    term: "First Term",
    week: "Week 4",
    topic: "Periodic Table & Periodic Trends",
    subTopic: "Groups, periods, electronic configuration, atomic radius, ionization energy, electronegativity",
    objectives: [
      "State the Periodic Law and arrange elements by atomic number",
      "Identify groups (alkali, halogens, noble gases) and period trends",
      "Explain variations in atomic radius, ionization energy, and electronegativity across periods"
    ],
    nerdcReference: "NERDC Senior Secondary Chemistry Syllabus SS2, Sec 2.3",
    previousKnowledge: "Atomic structure, subatomic particles (protons, neutrons, electrons).",
    instructionalMaterials: ["Large periodic table wall chart", "3D atom building kits"],
    keyVocabulary: ["Periodic Table", "Electronegativity", "Ionization Energy", "Atomic Radius", "Valence"],
    moralLesson: "Order and periodicity in nature showcase the divine harmony of creation.",
    inclusiveStrategy: "Color-coded tactile periodic tables."
  },

  // --- BIOLOGY: SS 2 ---
  {
    className: "SS 2",
    subject: "Biology",
    term: "First Term",
    week: "Week 4",
    topic: "Digestive System & Enzyme Action",
    subTopic: "Alimentary canal structure, mechanical digestion, chemical breakdown by enzymes",
    objectives: [
      "Label organs of the human alimentary canal",
      "Explain the lock-and-key hypothesis of enzymatic activity",
      "Investigate the effect of pH and temperature on salivary amylase activity"
    ],
    nerdcReference: "NERDC Senior Secondary Biology Syllabus SS2, Sec 3.1",
    previousKnowledge: "Classes of food and basic nutrition.",
    instructionalMaterials: ["Human torso anatomical model", "Test tubes, starch, iodine solution, amylase"],
    keyVocabulary: ["Alimentary Canal", "Enzyme", "Substrate", "Peristalsis", "Salivary Amylase"],
    moralLesson: "Proper nutrition and self-care sustain bodily health and mental sharpness.",
    inclusiveStrategy: "Hands-on digestion experiment observation."
  },

  // --- COMPUTER STUDIES / ICT: SS 2 ---
  {
    className: "SS 2",
    subject: "Computer Studies / ICT",
    term: "First Term",
    week: "Week 4",
    topic: "Database Management Systems (DBMS) & SQL",
    subTopic: "Introduction to relational databases, primary keys, tables, and basic SQL SELECT queries",
    objectives: [
      "Define DBMS, Database, Table, Record, and Field",
      "Distinguish primary key and foreign key relationships",
      "Write basic SQL queries to retrieve filtered records from a database"
    ],
    nerdcReference: "NERDC Senior Secondary Computer Studies Syllabus SS2, Sec 4.2",
    previousKnowledge: "Spreadsheet fundamentals and file management.",
    instructionalMaterials: ["Computer lab PCs with SQLite / MS Access", "Projector display"],
    keyVocabulary: ["Database", "Relational Model", "Primary Key", "SQL", "Table", "Query"],
    moralLesson: "Organized data management ensures truthfulness and prevents loss of critical information.",
    inclusiveStrategy: "Provide step-by-step digital cheat sheets for keyboard shortcuts and query syntax."
  },

  // --- BASIC SCIENCE: JSS 2 ---
  {
    className: "JSS 2",
    subject: "Basic Science",
    term: "First Term",
    week: "Week 4",
    topic: "Kinetic Theory of Matter & Thermal Energy",
    subTopic: "States of matter, arrangement of particles, expansion and contraction in solids, liquids, gases",
    objectives: [
      "State the basic postulates of the Kinetic Theory of Matter",
      "Demonstrate particle movement in solids, liquids, and gases",
      "Explain thermal expansion and its applications in bimetallic strips and thermometers"
    ],
    nerdcReference: "NERDC Junior Secondary Basic Science Syllabus JSS2, Sec 1.3",
    previousKnowledge: "States of matter from JSS 1.",
    instructionalMaterials: ["Ball and ring apparatus", "Bimetallic strip", "Burner"],
    keyVocabulary: ["Kinetic Theory", "Molecules", "Thermal Expansion", "Bimetallic Strip"],
    moralLesson: "Energy, when disciplined and focused, leads to constructive transformation.",
    inclusiveStrategy: "Role-play activity where students act as tightly packed solid particles vs moving gas particles."
  },

  // --- AGRICULTURAL SCIENCE: SS 1 ---
  {
    className: "SS 1",
    subject: "Agricultural Science",
    term: "First Term",
    week: "Week 4",
    topic: "Soil Formation & Soil Composition",
    subTopic: "Weathering of rocks (physical, chemical, biological), soil profile, components of fertile soil",
    objectives: [
      "Define soil and explain physical, chemical, and biological weathering process",
      "Draw and label a typical soil profile horizon",
      "Identify components of soil (mineral matter, organic matter, soil air, soil water, microorganisms)"
    ],
    nerdcReference: "NERDC Senior Secondary Agric Syllabus SS1, Sec 2.1",
    previousKnowledge: "Basic geography of rocks and environment.",
    instructionalMaterials: ["Soil samples (sandy, clay, loamy)", "Glass jars for soil settling experiment"],
    keyVocabulary: ["Weathering", "Horizon", "Humus", "Soil Profile", "Leaching"],
    moralLesson: "Nurturing the soil ensures food security and environmental sustainability for future generations.",
    inclusiveStrategy: "Tactile feel test of wet sand, clay, and loam soil samples."
  }
];

// Helper to look up or dynamically derive standard curriculum topic
export function lookupCurriculumTopic(
  className: string,
  subject: string,
  term: string,
  week: string
): CurriculumTopic {
  // 1. Check exact match
  const exact = CURRICULUM_DATABASE.find(
    (item) =>
      item.className.toLowerCase().trim() === className.toLowerCase().trim() &&
      item.subject.toLowerCase().trim() === subject.toLowerCase().trim() &&
      item.term.toLowerCase().trim() === term.toLowerCase().trim() &&
      item.week.toLowerCase().trim() === week.toLowerCase().trim()
  );

  if (exact) {
    return exact;
  }

  // 2. Check subject + class match to inherit topic structure for the week
  const subjectMatch = CURRICULUM_DATABASE.find(
    (item) =>
      item.subject.toLowerCase().trim() === subject.toLowerCase().trim() &&
      item.week.toLowerCase().trim() === week.toLowerCase().trim()
  );

  if (subjectMatch) {
    return {
      ...subjectMatch,
      className,
      term,
    };
  }

  // 3. Fallback NERDC Curriculum Derivation Generator based on NERDC standards
  const weekNumMatch = week.match(/\d+/);
  const weekNum = weekNumMatch ? parseInt(weekNumMatch[0], 10) : 4;

  const isPrimary = className.toLowerCase().includes("primary") || className.toLowerCase().includes("grade") || className.toLowerCase().includes("pri") || className.toLowerCase().includes("basic 1") || className.toLowerCase().includes("basic 2") || className.toLowerCase().includes("basic 3") || className.toLowerCase().includes("basic 4") || className.toLowerCase().includes("basic 5") || className.toLowerCase().includes("basic 6");
  const isJSS = className.toLowerCase().includes("jss") || className.toLowerCase().includes("junior") || className.toLowerCase().includes("basic 7") || className.toLowerCase().includes("basic 8") || className.toLowerCase().includes("basic 9");
  
  const generatedTopics: Record<string, { topic: string; subTopic: string; objectives: string[] }> = {
    // Primary & Basic Subjects
    "Mathematics": isPrimary ? {
      topic: weekNum <= 3 ? `Whole Numbers, Place Value, & Counting in Hundreds/Thousands` : weekNum <= 6 ? `Basic Operations: Addition, Subtraction, & Multiplication Tables` : weekNum <= 9 ? `Fractions, Decimals, & Nigerian Currency (Naira/Kobo)` : `Shapes, Measurement (Length/Mass/Capacity), & Everyday Statistics`,
      subTopic: `NERDC ${className} Primary Mathematics Unit ${weekNum}: Hands-on computational exercises, mental math drills, and real-life word problems.`,
      objectives: [
        `Identify and write numbers correctly up to curriculum grade target`,
        `Apply four basic operations accurately in mental arithmetic and written sums`,
        `Solve daily life word problems involving measurements and money`
      ]
    } : isJSS ? {
      topic: weekNum <= 3 ? "Whole Numbers, LCM, HCF & Binary Numbers" : weekNum <= 6 ? "Algebraic Simplification, Linear Equations & Fractions" : weekNum <= 9 ? "Angles, Plane Geometry & Construction of Triangles" : "Statistics, Bar Charts, Mean, Median & Mode",
      subTopic: `NERDC ${className} Junior Secondary Mathematics Module ${weekNum}: Step-by-step problem solving and theorem application.`,
      objectives: [
        `Express numbers in standard indices and factorize numbers into prime factors`,
        `Solve linear equations with one or two variables`,
        `Calculate perimeter, area, and volume of regular geometric shapes`
      ]
    } : {
      topic: weekNum <= 3 ? "Logarithms, Indices, Number Bases & Surds" : weekNum <= 6 ? "Quadratic Equations, Simultaneous Equations & Inequalities" : weekNum <= 9 ? "Trigonometry, Circle Theorems, & Coordinate Geometry" : "Probability, Statistics (Mean/Variance), & Vectors",
      subTopic: `NERDC ${className} Senior Secondary WAEC/NECO Standard Mathematics Unit ${weekNum}`,
      objectives: [
        `Master foundational algebraic and analytical principles for ${className}`,
        `Solve WAEC/NECO standard examination past questions accurately`,
        `Apply mathematical models to practical engineering and financial scenarios`
      ]
    },

    "English Studies / English Language": {
      topic: weekNum <= 3 ? "Phonics, Reading Comprehension & Vocabulary Development" : weekNum <= 6 ? "Grammar: Parts of Speech, Tenses & Subject-Verb Agreement" : weekNum <= 9 ? "Continuous Writing: Narrative & Descriptive Essays / Letter Writing" : "Spoken English, Stress Patterns & Listening Comprehension",
      subTopic: `NERDC ${className} English Curriculum Unit ${weekNum}: Reading comprehension, grammar mastery, and oral communication.`,
      objectives: [
        "Read age-appropriate texts fluently with accurate pronunciation and understanding",
        "Apply correct grammatical rules and punctuation in oral and written sentences",
        "Compose well-structured essays or friendly/formal letters with appropriate vocabulary"
      ]
    },

    "English Language": {
      topic: weekNum <= 3 ? "Reading Comprehension & Summary Writing Techniques" : weekNum <= 6 ? "Grammatical Concord, Clauses & Lexis and Structure" : weekNum <= 9 ? "Essay Writing (Expository, Argumentative, & Formal Letters)" : "Oral English: Vowels, Consonants, Rhymes, & Syllable Stress",
      subTopic: `NERDC & WAEC ${className} English Language Syllabus Module ${weekNum}`,
      objectives: [
        "Extract main ideas, tonal nuances, and summary points from complex passages",
        "Demonstrate mastery of lexis, structure, idioms, and grammatical concord",
        "Produce standard WAEC/NECO essay compositions scoring high in mechanical accuracy"
      ]
    },

    "Basic Science & Technology": {
      topic: weekNum <= 3 ? "Living & Non-Living Things, Plants and Animals in the Environment" : weekNum <= 6 ? "The Human Body Systems: Sense Organs, Nutrition & Personal Cleanliness" : weekNum <= 9 ? "Energy, Simple Machines, Forces & Light/Sound Transmission" : "Basic Technology Tools, Materials, ICT & Road Safety Awareness",
      subTopic: `NERDC Primary Basic Science & Technology Integrated Module ${weekNum}`,
      objectives: [
        "Classify objects and living organisms based on observable characteristics",
        "Explain healthy hygiene habits and balanced diet requirements",
        "Identify simple machines, tools, and basic computer components safely"
      ]
    },

    "Basic Science": {
      topic: weekNum <= 3 ? "Living Things, Skeletal & Respiratory Systems" : weekNum <= 6 ? "Matter, Chemical Elements, Mixtures & Compounds" : weekNum <= 9 ? "Energy Transformation, Electricity, Magnetism & Solar Energy" : "Ecology, Habitat Conservation, Drug Abuse Prevention & Disease Control",
      subTopic: `NERDC JSS Integrated Basic Science Curriculum Unit ${weekNum}`,
      objectives: [
        "Describe biological and physical systems with clear diagrams",
        "Conduct basic laboratory tests and observations safely",
        "Explain environmental protection measures and healthy living practices"
      ]
    },

    "Basic Technology": {
      topic: weekNum <= 3 ? "Workshop Safety, Safety Devices & Hand Tools Classification" : weekNum <= 6 ? "Materials Processing: Wood, Metals, Plastics & Ceramics" : weekNum <= 9 ? "Technical Drawing: Lines, Angles, Triangles, Circles & Orthographic Views" : "Building Construction, Friction, Belt/Chain Drives & Maintenance",
      subTopic: `NERDC JSS Basic Technology Practical Curriculum Unit ${weekNum}`,
      objectives: [
        "Identify and utilize basic workshop tools adhering to safety regulations",
        "Construct geometric figures and basic isometric/orthographic technical projections",
        "Explain the properties, seasoning, and industrial uses of wood and metals"
      ]
    },

    "Social Studies": {
      topic: weekNum <= 3 ? "Family, Social Groups, Community Leadership & Cultural Heritage" : weekNum <= 6 ? "Civic Rights, Responsibilities, National Identity & Symbols" : weekNum <= 9 ? "Social Problems: Drug Abuse, Cultism, Corruption & Prevention" : "Peace, Conflict Resolution, National Unity & Global Cooperation",
      subTopic: `NERDC Social Studies Curriculum Unit ${weekNum}`,
      objectives: [
        "Explain cultural values, roles of family members, and community norms",
        "Identify Nigerian national symbols and respect for constituted authorities",
        "Propose practical steps for peaceful conflict resolution and national harmony"
      ]
    },

    "Civic Education": {
      topic: weekNum <= 3 ? "National Values, Integrity, Honesty & Courage" : weekNum <= 6 ? "Human Rights, Fundamental Freedoms & Constitutional Democracy" : weekNum <= 9 ? "Rule of Law, Separation of Powers & Electoral System in Nigeria" : "Active Citizen Participation, Civil Society & Anti-Corruption Agencies",
      subTopic: `NERDC Civic Education Standard Curriculum Unit ${weekNum}`,
      objectives: [
        "Analyze the role of integrity and responsible citizenship in national building",
        "Explain fundamental human rights and procedures for redressing violations",
        "Describe the constitutional functions of the Executive, Legislature, and Judiciary"
      ]
    },

    "Agricultural Science": {
      topic: weekNum <= 3 ? "Importance of Agriculture, Land Use & Soil Science" : weekNum <= 6 ? "Crop Production: Classification, Planting, Husbandry & Pest Control" : weekNum <= 9 ? "Animal Husbandry: Livestock Management, Breeding & Nutrition" : "Agricultural Economics, Marketing of Produce & Farm Farm Records",
      subTopic: `NERDC Agricultural Science Theory & Field Practical Syllabus Unit ${weekNum}`,
      objectives: [
        "Identify soil types and explain methods of soil conservation",
        "Demonstrate practical husbandry for local cereal, tuber, and cash crops",
        "Maintain farm records and explain post-harvest storage techniques"
      ]
    },

    "Computer Studies / ICT & Coding": {
      topic: weekNum <= 3 ? "Introduction to Computers, Hardware Components & Operating Systems" : weekNum <= 6 ? "Word Processing, Spreadsheet Calculations & Presentation Software" : weekNum <= 9 ? "Internet, World Wide Web, Email Communication & Cyber Safety" : "Basic Computer Programming / Coding Concepts, Algorithms & Robotics",
      subTopic: `NERDC Computer Studies Practical & Digital Skills Syllabus Unit ${weekNum}`,
      objectives: [
        "Identify input, output, system unit, and storage devices",
        "Create, format, and save documents and spreadsheets",
        "Demonstrate safe internet browsing and construct basic algorithmic flowcharts"
      ]
    },

    "Computer Studies / ICT": {
      topic: weekNum <= 3 ? "Computer Architecture, System Units & Logic Gates" : weekNum <= 6 ? "Data Processing, Database Management & Information Systems" : weekNum <= 9 ? "Networking, Cyber Security, Artificial Intelligence & Cloud Computing" : "High-Level Programming Languages (Python/Basic) & Web Design",
      subTopic: `NERDC & WAEC Computer Studies / ICT Syllabus Unit ${weekNum}`,
      objectives: [
        "Explain computer architecture, motherboard buses, and logic gate truth tables",
        "Design relational database schemas and execute SQL queries",
        "Write structured code algorithms in high-level programming languages"
      ]
    },

    "Business Studies": {
      topic: weekNum <= 3 ? "Introduction to Business, Office Practice & Departments" : weekNum <= 6 ? "Commerce: Trade, Aids to Trade & Market Structures" : weekNum <= 9 ? "Bookkeeping: Cash Book, Journals & Ledger Posting" : "Office Equipment, Keyboarding Skills & Business Ethics",
      subTopic: `NERDC JSS Business Studies Comprehensive Curriculum Unit ${weekNum}`,
      objectives: [
        "Explain the channels of distribution and functions of commercial institutions",
        "Record transactions in double-entry ledgers and two-column cash books",
        "Demonstrate correct keyboard fingering techniques and business communication"
      ]
    },

    "Cultural & Creative Arts (CCA)": {
      topic: weekNum <= 3 ? "Introduction to Art, Elements and Principles of Design" : weekNum <= 6 ? "Drawing, Painting, Paper Craft & Textile Printing (Batik/Tie-Dye)" : weekNum <= 9 ? "Music Theory: Solfa Notation, Musical Instruments & African Rhythms" : "Drama, Dance, Traditional Festivals & Cultural Costume Design",
      subTopic: `NERDC Cultural & Creative Arts Practical Curriculum Unit ${weekNum}`,
      objectives: [
        "Identify lines, shapes, tones, colors, and textures in visual compositions",
        "Produce creative drawings, still-life paintings, or craft items using local materials",
        "Read basic solfa notations and describe traditional cultural dances and ceremonies"
      ]
    },

    "Physical & Health Education (PHE)": {
      topic: weekNum <= 3 ? "Physical Fitness, Athletics: Track & Field Events" : weekNum <= 6 ? "Ball Games: Football, Basketball, Volleyball Rules & Skills" : weekNum <= 9 ? "Health Education: First Aid, Communicable Diseases & Personal Safety" : "Posture, Gymnastics, Recreation, Rest & Sleep",
      subTopic: `NERDC PHE Practical & Physical Development Syllabus Unit ${weekNum}`,
      objectives: [
        "Execute fundamental athletic movement skills (sprinting, baton exchange, jumping)",
        "Demonstrate ball-handling and positioning techniques according to official rules",
        "Administer basic first aid treatments for sports injuries and sprains"
      ]
    },

    "Home Economics": {
      topic: weekNum <= 3 ? "Home Management, Family Living & Hygiene in the Home" : weekNum <= 6 ? "Food & Nutrition: Food Groups, Cooking Methods & Kitchen Safety" : weekNum <= 9 ? "Clothing & Textiles: Sewing Tools, Stitches & Garment Repair" : "Consumer Education, Budgeting & Meal Planning for Special Needs",
      subTopic: `NERDC Home Economics Practical Syllabus Unit ${weekNum}`,
      objectives: [
        "Explain kitchen sanitation and balanced meal preparation",
        "Demonstrate basic sewing stitches, seams, and fabric care",
        "Formulate a balanced family budget and maintain household resources"
      ]
    },

    "Christian Religious Studies (CRS)": {
      topic: weekNum <= 3 ? "God's Creation, The Sovereignty of God & Biblical Patriarchs" : weekNum <= 6 ? "The Life, Ministry, Parables, & Miracles of Jesus Christ" : weekNum <= 9 ? "The Passion, Death, Resurrection & Ascension of Christ" : "The Early Church, Fellowship, Christian Living & Civic Responsibility",
      subTopic: `NERDC CRS Curriculum Module ${weekNum}`,
      objectives: [
        "Narrate key biblical stories and highlight their theological significance",
        "Explain moral lessons from the life and teachings of Jesus Christ",
        "Apply Christian virtues of love, forgiveness, honesty, and service to society"
      ]
    },

    "Islamic Religious Studies (IRS)": {
      topic: weekNum <= 3 ? "Tawheed (Oneness of Allah) & Articles of Faith (Iman)" : weekNum <= 6 ? "Surahs from the Holy Quran: Recitation, Tajweed & Translation" : weekNum <= 9 ? "Hadith Studies: Sayings of the Prophet (SAW) on Character & Piety" : "Fiqh: Pillars of Islam (Salat, Zakat, Sawm, Hajj) & Taharah (Cleanliness)",
      subTopic: `NERDC IRS Curriculum Module ${weekNum}`,
      objectives: [
        "Recite and explain the meaning of prescribed Surahs with correct Tajweed",
        "Explain the essential pillars of Islam and conditions for acceptable worship",
        "Demonstrate Islamic moral values in interpersonal relations and community life"
      ]
    },

    "Physics": {
      topic: weekNum <= 3 ? "Units, Measurements, Kinematics & Rectilinear Motion" : weekNum <= 6 ? "Dynamics, Newton's Laws, Work, Energy, Power & Machines" : weekNum <= 9 ? "Thermal Physics, Gas Laws, Waves, Sound & Geometric Optics" : "Electrostatics, Electric Current Circuits, Magnetism & Modern Physics",
      subTopic: `NERDC & WAEC ${className} Physics Syllabus Module ${weekNum}`,
      objectives: [
        "State and explain fundamental physical principles, definitions, and SI units",
        "Derive physical equations and solve complex quantitative problems",
        "Conduct physics practical experiments and evaluate experimental uncertainties"
      ]
    },

    "Chemistry": {
      topic: weekNum <= 3 ? "Atomic Structure, Electronic Configuration & Periodic Classification" : weekNum <= 6 ? "Chemical Bonding, Stoichiometry, Mole Concept & Chemical Equations" : weekNum <= 9 ? "Acids, Bases, Salts, Redox Reactions, & Electrolysis" : "Organic Chemistry (Hydrocarbons/Alkanols), Industrial Processes & Metals",
      subTopic: `NERDC & WAEC ${className} Chemistry Experimental & Theoretical Syllabus ${weekNum}`,
      objectives: [
        "Write balanced ionic and molecular equations with correct state symbols",
        "Perform volumetric titration calculations and qualitative salt analysis",
        "Explain industrial preparation methods and chemical reaction mechanisms"
      ]
    },

    "Biology": {
      topic: weekNum <= 3 ? "Living Organisms, Cell Structure, Organization & Classification" : weekNum <= 6 ? "Nutrition in Plants/Animals, Cellular Respiration & Transport Systems" : weekNum <= 9 ? "Excretion, Homeostasis, Nervous Coordination & Sense Organs" : "Reproductive Systems, Genetics, Heredity, Variation & Ecology",
      subTopic: `NERDC & WAEC ${className} Biology Syllabus Unit ${weekNum}`,
      objectives: [
        "Produce detailed, accurate, and labeled biological drawing specimens",
        "Explain physiological mechanisms supporting homeostasis and life processes",
        "Analyze genetic crosses using Punnett squares and describe ecosystem dynamics"
      ]
    },

    "Further Mathematics": {
      topic: weekNum <= 3 ? "Indices, Logarithms, Surds, Polynomials & Partial Fractions" : weekNum <= 6 ? "Matrices, Determinants, Trigonometric Identities & Coordinate Geometry" : weekNum <= 9 ? "Calculus: Differentiation & Integration Principles and Applications" : "Vectors in 2D/3D, Statics, Dynamics & Probability Distributions",
      subTopic: `NERDC & WAEC Further Mathematics Syllabus Unit ${weekNum}`,
      objectives: [
        "Solve higher-order polynomial equations and partial fraction decompositions",
        "Apply differential and integral calculus to kinematic and geometric problems",
        "Analyze vector mechanics, resolution of forces, and probability distributions"
      ]
    },

    "Economics": {
      topic: weekNum <= 3 ? "Meaning of Economics, Scarcity, Choice, Opportunity Cost & Production" : weekNum <= 6 ? "Theory of Demand and Supply, Price Determination & Elasticity" : weekNum <= 9 ? "Market Structures, Money, Banking, Financial Institutions & Inflation" : "National Income Accounting, Public Finance, International Trade & Economic Systems",
      subTopic: `NERDC & WAEC ${className} Economics Comprehensive Curriculum Unit ${weekNum}`,
      objectives: [
        "Construct and interpret demand, supply, and equilibrium schedules and curves",
        "Calculate elasticity coefficients and national income aggregates (GDP/GNP/NNP)",
        "Analyze fiscal and monetary policy interventions in developing economies"
      ]
    },

    "Financial Accounting": {
      topic: weekNum <= 3 ? "Accounting Principles, Source Documents, Books of Prime Entry" : weekNum <= 6 ? "Ledger Posting, Trial Balance & Correction of Errors / Suspense Account" : weekNum <= 9 ? "Final Accounts: Trading, Profit & Loss Account and Balance Sheet" : "Bank Reconciliation Statements, Partnership Accounts & Company Accounts",
      subTopic: `NERDC & WAEC Financial Accounting Syllabus Unit ${weekNum}`,
      objectives: [
        "Record transactions in double-entry journals and three-column cash books",
        "Prepare adjusted trial balances and rectify accounting errors",
        "Draft final accounts for sole traders and partnerships adhering to IFRS standards"
      ]
    },

    "Commerce": {
      topic: weekNum <= 3 ? "Introduction to Commerce, Historical Background & Branches of Commerce" : weekNum <= 6 ? "Home Trade (Wholesale & Retail) and Foreign Trade (Export & Import)" : weekNum <= 9 ? "Aids to Trade: Banking, Insurance, Transport, Warehousing & Advertising" : "Business Ownership: Sole Proprietorship, Partnerships, Companies & Stock Exchange",
      subTopic: `NERDC & WAEC Commerce Syllabus Unit ${weekNum}`,
      objectives: [
        "Explain commercial documents used in domestic and international transactions",
        "Describe the operational functions of commodity and stock exchanges",
        "Evaluate insurance policies, indemnity principles, and transport logistics"
      ]
    },

    "Government": {
      topic: weekNum <= 3 ? "Concepts of State, Sovereignty, Power, Authority & Political Ideologies" : weekNum <= 6 ? "Organs of Government, Constitutions & Constitutionalism" : weekNum <= 9 ? "Political Parties, Pressure Groups, Public Opinion & Electoral Systems" : "Pre-Colonial Administration in Nigeria, Colonialism & Constitutional Development",
      subTopic: `NERDC & WAEC Government Syllabus Unit ${weekNum}`,
      objectives: [
        "Differentiate between political systems (Federalism, Unitary, Presidential, Parliamentary)",
        "Analyze Nigerian constitutional milestones (Clifford, Richards, Macpherson, Lyttleton, 1979/1999)",
        "Explain Nigeria's foreign policy and role in international organizations (ECOWAS, AU, UN)"
      ]
    },

    "Literature in English": {
      topic: weekNum <= 3 ? "Literary Appreciation, Poetic Devices, Figures of Speech & Dramaturgy" : weekNum <= 6 ? "African Prose Text In-Depth Textual Analysis, Themes & Characterization" : weekNum <= 9 ? "Non-African Drama Analysis, Plot Structure & Contextual Excerpts" : "African & Non-African Selected Poetry Analysis, Stanzaic Form & Imagery",
      subTopic: `WAEC / NECO Harmonized Literature-in-English Syllabus Unit ${weekNum}`,
      objectives: [
        "Analyze prescribed WAEC novels, plays, and poems citing textual evidence",
        "Examine themes, character motivations, and dramatic irony in set texts",
        "Write critical literary essays following standard academic conventions"
      ]
    },

    "Geography": {
      topic: weekNum <= 3 ? "The Earth in Space, Solar System, Rotation/Revolution & Geographic Grid" : weekNum <= 6 ? "Rocks, Landforms, Vulcanicity, Earthquakes & Weathering Processes" : weekNum <= 9 ? "Atmosphere, Weather Elements, Climate Classification & Biomes" : "Map Reading: Scale, Contours, Cross-Sections & Regional Geography of Nigeria",
      subTopic: `NERDC & WAEC Geography Syllabus Unit ${weekNum}`,
      objectives: [
        "Interpret topographical survey maps and calculate gradient and scale",
        "Explain physical landform development and climatic zones of the world",
        "Analyze agricultural, mineral, and industrial development across Nigeria's regions"
      ]
    },

    "Verbal Reasoning": {
      topic: `Verbal Aptitude & Logic Patterns Module ${weekNum}`,
      subTopic: `Primary Aptitude Practice: Analogies, Synonyms, Antonyms, Coding-Decoding, and Sentence Completion`,
      objectives: [
        "Identify word associations, anagrams, and contextual synonyms/antonyms",
        "Decipher alphanumeric word codes and logical deductive sequences",
        "Complete linguistic puzzles with high accuracy and speed"
      ]
    },

    "Quantitative Reasoning": {
      topic: `Quantitative Logic & Mathematical Puzzles Module ${weekNum}`,
      subTopic: `Primary Quantitative Aptitude: Number patterns, grid logic, series completion, and arithmetic reasoning`,
      objectives: [
        "Discover hidden operational rules connecting number arrays and patterns",
        "Complete mathematical puzzles using fast mental calculation methods",
        "Develop deductive reasoning skills for National Common Entrance Examinations"
      ]
    }
  };

  const defaultTopicInfo = generatedTopics[subject] || {
    topic: `${subject} Core Curriculum Unit ${weekNum}`,
    subTopic: `NERDC & WAEC Standard Syllabus for ${className} ${subject} - ${term} ${week}`,
    objectives: [
      `Understand key concepts and definitions of ${subject} Topic ${weekNum}`,
      `Analyze practical examples and solve curriculum exercises`,
      `Demonstrate mastery through evaluation questions and assignments`
    ]
  };

  return {
    className,
    subject,
    term,
    week,
    topic: defaultTopicInfo.topic,
    subTopic: defaultTopicInfo.subTopic,
    objectives: defaultTopicInfo.objectives,
    nerdcReference: `NERDC Standard Syllabus (${className} - ${subject} - ${term})`,
    previousKnowledge: `Foundational knowledge from previous lessons in ${subject}.`,
    instructionalMaterials: ["Standard NERDC Approved Textbook", "Whiteboard & Digital Projector", "Instructional Charts & Lab Reagents", "Interactive AI Learning Workspace"],
    keyVocabulary: ["Concept", "Application", "Analysis", "Evaluation", "Formula", "Standard"],
    moralLesson: "Diligence, analytical precision, and continuous curiosity foster academic excellence.",
    inclusiveStrategy: "Differentiated instructional delivery accommodating visual, auditory, and kinesthetic learning styles."
  };
}

export const findCurriculumTopic = lookupCurriculumTopic;
