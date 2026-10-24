/**
 * Utility to strip all dollar sign symbols ($ and $$) and LaTeX math delimiters
 * from AI-generated lesson notes, replacing them with standard, clean, human-readable
 * plain text formulas and mathematical typography (e.g. x², x³, ±, ×, √, ₂, ₁₀).
 */

export function cleanLessonNoteText(text: string): string {
  if (!text || typeof text !== "string") return text || "";

  let cleaned = text;

  // 1. Replace currency with LaTeX text wrappers: \text{₦} -> ₦
  cleaned = cleaned.replace(/\\*text\{₦\}/g, "₦");
  cleaned = cleaned.replace(/\\*text\{([^{}]+)\}/g, "$1");
  cleaned = cleaned.replace(/\\*mathbf\{([^}]+)\}/g, "$1");
  cleaned = cleaned.replace(/\\*underline\{([^}]+)\}/g, "$1");

  // 2. Replace LaTeX sqrt: \sqrt{expr} -> √(expr)
  cleaned = cleaned.replace(/\\*sqrt\{([^}]+)\}/g, "√($1)");

  // 3. Replace LaTeX frac: \frac{num}{den} -> (num / den)
  cleaned = cleaned.replace(/\\*frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1 / $2)");

  // 4. Replace common LaTeX math commands and operators (must have leading backslash)
  cleaned = cleaned
    .replace(/\\+times\b/g, "×")
    .replace(/\\+div\b/g, "÷")
    .replace(/\\+cdot\b/g, "·")
    .replace(/\\+pm\b/g, "±")
    .replace(/\\+mp\b/g, "∓")
    .replace(/\\+neq\b/g, "≠")
    .replace(/\\+approx\b/g, "≈")
    .replace(/\\+leq?\b/g, "≤")
    .replace(/\\+geq?\b/g, "≥")
    .replace(/\\+degree\b/g, "°")
    .replace(/\^\\*circ\b/g, "°")
    .replace(/\\+(dots|cdots|ldots)\b/g, "...")
    .replace(/\\+implies\b/g, "=>")
    .replace(/\\+rightarrow\b/g, "->")
    .replace(/\\+leftarrow\b/g, "<-")
    .replace(/\\+(left|right)([()[\]{}|])/g, "$2")
    .replace(/\\+lambda\b/g, "λ")
    .replace(/\\+pi\b/g, "π")
    .replace(/\\+theta\b/g, "θ")
    .replace(/\\+alpha\b/g, "α")
    .replace(/\\+beta\b/g, "β")
    .replace(/\\+gamma\b/g, "γ")
    .replace(/\\+Delta\b/g, "Δ")
    .replace(/\\+delta\b/g, "δ")
    .replace(/\\+Omega\b/g, "Ω")
    .replace(/\\+omega\b/g, "ω")
    .replace(/\\+mu\b/g, "μ");

  // 5. Remove LaTeX matrix / array wrappers
  cleaned = cleaned.replace(/\\begin\{[a-zA-Z*]+\}(\{[^}]*\}|\[[^\]]*\])*/g, "");
  cleaned = cleaned.replace(/\\end\{[a-zA-Z*]+\}/g, "");
  cleaned = cleaned.replace(/\\hline/g, "---");
  cleaned = cleaned.replace(/\\quad/g, " ");
  cleaned = cleaned.replace(/\\qquad/g, "  ");
  cleaned = cleaned.replace(/\\\\/g, "\n");

  // 6. Replace standard subscripts (e.g. Base 2, Base 8, Base 10, Base 16)
  cleaned = cleaned
    .replace(/_\{?10\}?/g, "₁₀")
    .replace(/_\{?16\}?/g, "₁₆")
    .replace(/_\{?2\}?/g, "₂")
    .replace(/_\{?3\}?/g, "₃")
    .replace(/_\{?4\}?/g, "₄")
    .replace(/_\{?5\}?/g, "₅")
    .replace(/_\{?6\}?/g, "₆")
    .replace(/_\{?7\}?/g, "₇")
    .replace(/_\{?8\}?/g, "₈")
    .replace(/_\{?9\}?/g, "₉")
    .replace(/_\{?0\}?/g, "₀")
    .replace(/_\{?1\}?/g, "₁")
    .replace(/_\{?n\}?/g, "ₙ")
    .replace(/_\{?x\}?/g, "ₓ");

  // 7. Replace standard powers and superscripts (e.g. x^2 -> x², x^3 -> x³)
  cleaned = cleaned
    .replace(/\^\{?2\}?/g, "²")
    .replace(/\^\{?3\}?/g, "³")
    .replace(/\^\{?4\}?/g, "⁴")
    .replace(/\^\{?5\}?/g, "⁵")
    .replace(/\^\{?6\}?/g, "⁶")
    .replace(/\^\{?7\}?/g, "⁷")
    .replace(/\^\{?8\}?/g, "⁸")
    .replace(/\^\{?9\}?/g, "⁹")
    .replace(/\^\{?0\}?/g, "⁰")
    .replace(/\^\{?1\}?/g, "¹")
    .replace(/\^\{?n\}?/g, "ⁿ");

  // 8. Strip LaTeX inline delimiters \( ... \) and display delimiters \[ ... \]
  cleaned = cleaned.replace(/\\\((.*?)\\\)/g, "$1");
  cleaned = cleaned.replace(/\\\[(.*?)\\\]/g, "$1");

  // 9. STRICTLY REMOVE ALL DOLLAR SIGN SYMBOLS ($ and $$) FROM THE LESSON NOTE
  cleaned = cleaned.replace(/\$+/g, "");

  // 10. STRICTLY REMOVE ALL '#' SYMBOLS (Markdown headers and hash symbols)
  // Strip markdown heading hashes: e.g. "### 1. Topic" -> "1. Topic" or "# Title" -> "Title"
  cleaned = cleaned.replace(/^[ \t]*#{1,6}[ \t]*/gm, "");
  // Strip any remaining '#' symbols anywhere in the text
  cleaned = cleaned.replace(/#+/g, "");

  // 11. STRICTLY REMOVE ALL '*' SYMBOLS (Markdown bold/italics and asterisks)
  // First, convert asterisk bullet points at the beginning of lines to standard clean bullet "• "
  cleaned = cleaned.replace(/^[ \t]*\*[ \t]+/gm, "• ");
  // Strip bold/italic markdown delimiters: ***text***, **text**, *text*
  cleaned = cleaned.replace(/\*{1,3}([^*\n]+?)\*{1,3}/g, "$1");
  cleaned = cleaned.replace(/\*{1,3}([^*\n]+?)\*{1,3}/g, "$1");
  // Convert any multiplication asterisk between numbers (e.g. 5 * 4) to " × "
  cleaned = cleaned.replace(/(\d)\s*\*\s*(\d)/g, "$1 × $2");
  // Strip any remaining standalone '*' symbols
  cleaned = cleaned.replace(/\*+/g, "");

  // 12. Clean up any lingering backslashes preceding math letters or punctuation
  cleaned = cleaned.replace(/\\([a-zA-Z]+)/g, "$1");
  cleaned = cleaned.replace(/\\([×÷·±°≠≈≤≥])/g, "$1");
  cleaned = cleaned.replace(/\\\s+/g, " ");

  return cleaned;
}

/**
 * Clean an entire structured lesson note object recursively to eliminate all "$"
 * symbols and LaTeX math delimiters across every field, array, and nested object.
 */
export function cleanStructuredLessonNote<T extends Record<string, any>>(note: T): T {
  if (!note) return note;

  const result: any = { ...note };

  const stringFields = [
    "topic",
    "subTopic",
    "subtopic",
    "introduction",
    "lessonContent",
    "summary",
    "content",
    "markdownContent",
    "previousKnowledge",
    "conclusion",
    "assignment",
    "teacherActivities",
    "studentActivities",
    "classroomActivities",
    "guidedPractice",
    "independentPractice",
    "assessment"
  ];

  stringFields.forEach((field) => {
    if (typeof result[field] === "string") {
      result[field] = cleanLessonNoteText(result[field]);
    }
  });

  const arrayStringFields = [
    "objectives",
    "evaluation",
    "evaluationQuestions",
    "assignment",
    "classActivities",
    "instructionalMaterials",
    "materials",
    "teachingResources",
    "references"
  ];

  arrayStringFields.forEach((field) => {
    if (Array.isArray(result[field])) {
      result[field] = result[field].map((item: any) =>
        typeof item === "string" ? cleanLessonNoteText(item) : item
      );
    }
  });

  if (Array.isArray(result.definitions)) {
    result.definitions = result.definitions.map((d: any) => ({
      ...d,
      term: cleanLessonNoteText(d.term),
      definition: cleanLessonNoteText(d.definition),
      keyPoints: Array.isArray(d.keyPoints) ? d.keyPoints.map(cleanLessonNoteText) : d.keyPoints
    }));
  }

  if (Array.isArray(result.illustrativeExamples)) {
    result.illustrativeExamples = result.illustrativeExamples.map((ex: any) => ({
      ...ex,
      title: cleanLessonNoteText(ex.title),
      problem: cleanLessonNoteText(ex.problem),
      stepByStepSolution: Array.isArray(ex.stepByStepSolution)
        ? ex.stepByStepSolution.map(cleanLessonNoteText)
        : ex.stepByStepSolution,
      finalAnswer: cleanLessonNoteText(ex.finalAnswer),
      explanation: ex.explanation ? cleanLessonNoteText(ex.explanation) : undefined
    }));
  }

  if (Array.isArray(result.stepByStepGuidance)) {
    result.stepByStepGuidance = result.stepByStepGuidance.map((step: any) => ({
      ...step,
      title: cleanLessonNoteText(step.title),
      instruction: cleanLessonNoteText(step.instruction),
      keyRuleOrTip: step.keyRuleOrTip ? cleanLessonNoteText(step.keyRuleOrTip) : undefined
    }));
  }

  if (Array.isArray(result.keywords)) {
    result.keywords = result.keywords.map((k: any) => ({
      ...k,
      term: cleanLessonNoteText(k.term),
      meaning: cleanLessonNoteText(k.meaning)
    }));
  }

  if (result.structuredData && typeof result.structuredData === "object") {
    result.structuredData = cleanStructuredLessonNote(result.structuredData);
  }

  return result;
}
