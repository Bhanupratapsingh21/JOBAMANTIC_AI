// src/types/feedback.ts

export type Feedback = {
  overallScore: number;
  ATS: {
    score: number;
    tips: { type: "good" | "improve"; tip: string }[];
  };
  toneAndStyle: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
  };
  content: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
  };
  structure: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
  };
  skills: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
  };
};

// Parsed inputs coming from your parser/scorer pipeline
export type ParsedResumeForFeedback = {
  rawText: string;
  sections: Partial<Record<"summary" | "experience" | "education" | "skills", string>>;
  skills: string[];
  matchedJD: string[]; // exact/synonym keyword matches to JD
  missingJD: string[]; // JD keywords not found
  atsScore: number;    // 0..100 from your ATS scorer
};

type TipItem = { type: "good" | "improve"; tip: string; explanation: string };

const good = (tip: string, explanation: string) =>
  ({ type: "good" as const, tip, explanation });
const improve = (tip: string, explanation: string) =>
  ({ type: "improve" as const, tip, explanation });

export function buildFeedback(parsed: ParsedResumeForFeedback, jdText: string): Feedback {
  const text = parsed.rawText.toLowerCase();
  const hasHeadings = ["summary", "experience", "education", "skills"].every(h => text.includes(h));
  const hasDates = /\b(20\d{2}|19\d{2})\b/.test(text);
  const hasContact = /@|linkedin\.com|github\.com|\b\d{10}\b/.test(text);

  const bulletCount = (parsed.sections.experience?.match(/\n[-•]/g) || []).length;
  const passiveHits = (text.match(/\b(responsible for|involved in|participated in)\b/g) || []).length;
  const metricHits = (text.match(/\b(\d+%|\d{1,3}k|\d{1,3}\+)\b/g) || []).length;

  const matched = parsed.matchedJD.length;
  const missing = parsed.missingJD.length;

  const pct = (n: number, d: number) => (d > 0 ? n / d : 0);

  const structureScore = Math.round(
    100 * (0.45 * (hasHeadings ? 1 : 0) + 0.25 * (hasDates ? 1 : 0) + 0.30 * (hasContact ? 1 : 0))
  );
  const skillsCoverage = parsed.skills.length ? matched / ((matched + missing) || 1) : 0;
  const skillsScore = Math.round(100 * (0.7 * skillsCoverage + 0.3 * Math.min(1, parsed.skills.length / 20)));
  const toneScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 *
          (0.45 * Math.min(1, bulletCount / 8) +
            0.35 * Math.min(1, metricHits / 5) +
            0.20 * (1 - Math.min(1, passiveHits / 5)))
      )
    )
  );
  const contentScore = Math.round(
    100 *
      (0.6 * skillsCoverage +
        0.4 * Math.min(1, (parsed.sections.experience ? 1 : 0) + (parsed.sections.summary ? 0.5 : 0)))
  );
  const atsScore = parsed.atsScore;

  const overallScore = Math.round(
    0.35 * atsScore + 0.2 * structureScore + 0.2 * skillsScore + 0.15 * toneScore + 0.1 * contentScore
  );

  // ATS tips (no explanation field in your interface for ATS)
  const ATS_tips =
    atsScore >= 70
      ? [{ type: "good" as const, tip: "Good keyword alignment with the job description" }]
      : [{ type: "improve" as const, tip: "Increase overlap with exact JD keywords (include acronyms and full terms)" }];

  const content_tips = [
    parsed.sections.summary
      ? good("Summary provided", "A short headline/summary helps align intent")
      : improve("Add a concise summary", "2–3 lines with role, years, core stack, and top achievements"),
    matched >= 8
      ? good("Relevant role keywords covered", "Good coverage of job title/stack terms")
      : improve("Cover more role keywords", "Mirror exact JD phrasing for key tools, frameworks, and responsibilities"),
  ] satisfies TipItem[];

  const structure_tips = [
    hasHeadings
      ? good("Readable structure", "Standard section labels improve parsing")
      : improve("Use standard labels", "Stick to headings like 'Experience', not custom names"),
    hasDates
      ? good("Employment dates provided", "Dates help justify seniority and tenure")
      : improve("Add dates to roles", "Use mm/yyyy format for each position"),
    hasContact
      ? good("Contact and links present", "Include email, phone, LinkedIn/GitHub")
      : improve("Add contact details", "Include email, phone, LinkedIn; add portfolio link if applicable"),
  ] satisfies TipItem[];

  const tone_tips = [
    bulletCount >= 6
      ? good("Strong use of concise bullet points", "Bullets improve scannability for both ATS and recruiters")
      : improve("Use bullet points for achievements", "Replace paragraphs with 3–5 bullets per role focused on outcomes"),
    metricHits >= 3
      ? good("Good quantification with metrics", "Numbers (%, time, revenue) convey impact quickly")
      : improve("Add metrics to achievements", "Include % improvements, time saved, cost reduced, or scale handled"),
    passiveHits <= 1
      ? good("Active voice maintained", "Action verbs signal ownership and drive")
      : improve("Reduce passive phrases", "Replace 'responsible for' with verbs like 'built', 'shipped', 'optimized'"),
  ] satisfies TipItem[];

  const skills_tips = [
    skillsCoverage >= 0.6
      ? good("JD-aligned skills present", "Your skills match most JD requirements")
      : improve("Align skills with JD", "Add missing core stack skills or synonyms if truly applicable"),
    parsed.skills.length >= 10
      ? good("Sufficient skills breadth", "Good mix of core and supporting tools")
      : improve("Expand skills section", "Include frameworks, cloud, DBs, testing, CI/CD where relevant"),
  ] satisfies TipItem[];

  return {
    overallScore,
    ATS: { score: atsScore, tips: ATS_tips },
    toneAndStyle: { score: toneScore, tips: tone_tips },
    content: { score: contentScore, tips: content_tips },
    structure: { score: structureScore, tips: structure_tips },
    skills: { score: skillsScore, tips: skills_tips },
  };
}
