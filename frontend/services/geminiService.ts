import { GoogleGenAI, Type } from "@google/genai";

// ─────────────────────────────────────────────────────────────────────────────
// API KEY VALIDATION
// Vite maps GEMINI_API_KEY → process.env.API_KEY via vite.config.ts define block
// ─────────────────────────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.API_KEY || "";

const isKeyConfigured = (): boolean => {
  return (
    GEMINI_API_KEY.length > 0 &&
    GEMINI_API_KEY !== "PLACEHOLDER_API_KEY" &&
    !GEMINI_API_KEY.startsWith("PLACEHOLDER")
  );
};

// Lazy-initialize so bad keys don't crash app at import time
let _ai: GoogleGenAI | null = null;
const getAI = (): GoogleGenAI => {
  if (!_ai) {
    if (!isKeyConfigured()) {
      throw new GeminiConfigError(
        "Gemini API key is not configured. Please set GEMINI_API_KEY in frontend/.env.local"
      );
    }
    _ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return _ai;
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM ERROR CLASSES
// ─────────────────────────────────────────────────────────────────────────────
class GeminiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiConfigError";
  }
}

class GeminiParseError extends Error {
  constructor(message: string, public raw: string) {
    super(message);
    this.name = "GeminiParseError";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/** Wrap a promise with a timeout */
function withTimeout<T>(promise: Promise<T>, ms = 30000, label = "AI call"): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms / 1000}s`)),
      ms
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** Retry a failing async function up to maxAttempts times with exponential backoff */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  label = "AI call"
): Promise<T> {
  let lastError: Error | unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isLastAttempt = attempt === maxAttempts;
      const isConfigError = err instanceof GeminiConfigError;

      console.warn(
        `[Gemini][${label}] Attempt ${attempt}/${maxAttempts} failed:`,
        err instanceof Error ? err.message : err
      );

      // Don't retry config errors — they won't get better
      if (isConfigError || isLastAttempt) break;

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

/**
 * Safe JSON parse — tries to extract JSON from a Gemini response string.
 * Handles: clean JSON, JSON wrapped in markdown code fences, partial JSON.
 */
function safeParseJSON<T>(raw: string | undefined | null, label: string): T | null {
  if (!raw || raw.trim() === "") {
    console.warn(`[Gemini][${label}] Empty response text`);
    return null;
  }

  // Strip markdown code fences if present
  let cleaned = raw.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) cleaned = fenceMatch[1].trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed !== "object" || parsed === null || Object.keys(parsed).length === 0) {
      console.warn(`[Gemini][${label}] Parsed to empty object`);
      return null;
    }
    return parsed as T;
  } catch (e) {
    console.error(`[Gemini][${label}] JSON parse failed. Raw:\n`, cleaned.substring(0, 400));
    throw new GeminiParseError(`JSON parse failed for ${label}`, cleaned);
  }
}

/** Validate that required fields exist in parsed result */
function validateFields<T extends object>(
  obj: T,
  required: (keyof T)[],
  label: string
): boolean {
  const missing = required.filter(
    (k) =>
      obj[k] === undefined ||
      obj[k] === null ||
      (typeof obj[k] === "string" && (obj[k] as string).trim() === "")
  );
  if (missing.length > 0) {
    console.warn(`[Gemini][${label}] Missing fields: ${missing.join(", ")}`);
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING: AI Business Rules Engine (AI Policies Module)
// ─────────────────────────────────────────────────────────────────────────────
export const generateBusinessRule = async (prompt: string): Promise<string> => {
  if (!isKeyConfigured()) {
    return "⚠️ Gemini API key not configured. Please set GEMINI_API_KEY in .env.local";
  }
  try {
    const result = await withRetry(
      () =>
        withTimeout(
          getAI().models.generateContent({
            model: "gemini-2.0-flash",
            contents: `Draft a project management business rule based on the following context: ${prompt}. Return a concise, actionable policy statement.`,
            config: {
              systemInstruction:
                "You are an expert PMO director. You create clear, enforceable business rules for project management governance.",
              temperature: 0.7,
            },
          }),
          25000,
          "generateBusinessRule"
        ),
      2,
      "generateBusinessRule"
    );
    return result.text || "No policy text returned by AI.";
  } catch (error) {
    console.error("[Gemini] generateBusinessRule failed:", error);
    return "AI service is currently unavailable. Please retry in a few moments.";
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING: Risk Policy Analysis
// ─────────────────────────────────────────────────────────────────────────────
export const analyzeRiskPolicy = async (
  risks: any[]
): Promise<{ summary: string; suggestedPolicy: string; priorityLevel: string } | null> => {
  if (!isKeyConfigured()) return null;
  try {
    const riskSummary = risks
      .slice(0, 10)
      .map((r) => `- ${r.title} [Impact: ${r.impact}, Prob: ${r.probability}]`)
      .join("\n");

    const result = await withRetry(
      () =>
        withTimeout(
          getAI().models.generateContent({
            model: "gemini-2.0-flash",
            contents: `Analyze these ${risks.length} project risks and suggest a mitigation policy:\n${riskSummary}`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  suggestedPolicy: { type: Type.STRING },
                  priorityLevel: { type: Type.STRING },
                },
                required: ["summary", "suggestedPolicy", "priorityLevel"],
              },
              temperature: 0.5,
            },
          }),
          25000,
          "analyzeRiskPolicy"
        ),
      2,
      "analyzeRiskPolicy"
    );

    return safeParseJSON(result.text, "analyzeRiskPolicy");
  } catch (error) {
    console.error("[Gemini] analyzeRiskPolicy failed:", error);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING: SQL Optimization
// ─────────────────────────────────────────────────────────────────────────────
export const generateSqlOptimization = async (tableSchema: string): Promise<string> => {
  if (!isKeyConfigured()) return "API key not configured.";
  try {
    const result = await withRetry(
      () =>
        withTimeout(
          getAI().models.generateContent({
            model: "gemini-2.0-flash",
            contents: `Provide 3 expert optimization tips for this SQL schema: ${tableSchema}`,
            config: {
              systemInstruction:
                "You are a world-class Database Architect. Provide technical, high-impact advice on indexing, partitioning, or data types.",
            },
          }),
          20000,
          "generateSqlOptimization"
        ),
      2,
      "generateSqlOptimization"
    );
    return result.text || "No optimization advice returned.";
  } catch (error) {
    console.error("[Gemini] generateSqlOptimization failed:", error);
    return "AI service is currently unavailable. Please retry in a few moments.";
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 1: AI Project Health Summary
// Produces contextual, data-driven insights — no generic fallbacks
// ─────────────────────────────────────────────────────────────────────────────
export interface HealthSummaryResult {
  executive_summary: string;
  status_explanation: string;
  recommendations: string[];
  risk_level: string;
}

export const generateHealthSummary = async (
  projectName: string,
  score: number,
  ragStatus: string,
  metrics: {
    totalMilestones: number;
    completedMilestones: number;
    overdueMilestones: number;
    totalRisks: number;
    highRisks: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    totalBlockers: number;
  }
): Promise<HealthSummaryResult> => {
  // Always produce a data-driven local fallback first (never generic)
  const localFallback = buildContextualHealthFallback(
    projectName,
    score,
    ragStatus,
    metrics
  );

  if (!isKeyConfigured()) {
    console.warn("[Gemini] API key not configured — using local contextual analysis");
    return localFallback;
  }

  // Build a rich, data-dense prompt for contextual AI output
  const overdueMs =
    metrics.overdueMilestones > 0
      ? `${metrics.overdueMilestones} milestone${metrics.overdueMilestones > 1 ? "s are" : " is"} overdue`
      : "no overdue milestones";
  const overdueTasks =
    metrics.overdueTasks > 0
      ? `${metrics.overdueTasks} task${metrics.overdueTasks > 1 ? "s are" : " is"} past due date`
      : "no overdue tasks";
  const blockers =
    metrics.totalBlockers > 0
      ? `${metrics.totalBlockers} active blocker${metrics.totalBlockers > 1 ? "s" : ""} identified`
      : "no active blockers";
  const highRisks =
    metrics.highRisks > 0
      ? `${metrics.highRisks} high-severity open risk${metrics.highRisks > 1 ? "s" : ""}`
      : "no high-severity risks";

  const prompt = `You are writing a PMO executive health brief for project "${projectName}".

CURRENT PROJECT METRICS:
• Health Score: ${score}/100 — Status: ${ragStatus}
• Milestone Completion: ${metrics.completedMilestones} of ${metrics.totalMilestones} completed (${overdueMs})
• Task Progress: ${metrics.completedTasks} of ${metrics.totalTasks} tasks completed (${overdueTasks})
• Risk Exposure: ${metrics.totalRisks} open risks total (${highRisks})
• Blockers: ${blockers}

CRITICAL RULE: You MUST reference the EXACT numbers above. Do NOT use generic phrases like "review overdue items" or "address open blockers". 
Instead, write contextual sentences like:
- "With ${metrics.overdueMilestones} overdue milestone(s), the project's schedule baseline is at risk."
- "${metrics.totalBlockers} active blocker(s) require immediate resolution to prevent further delays."

Write 3-5 specific, professional recommendations based on these exact metrics.`;

  try {
    const result = await withRetry(
      () =>
        withTimeout(
          getAI().models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
              systemInstruction:
                "You are a certified PMO director (PMP). Write precise, data-referenced executive health summaries. Always cite the exact numbers provided. Never write generic advice.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  executive_summary: { type: Type.STRING },
                  status_explanation: { type: Type.STRING },
                  recommendations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  risk_level: { type: Type.STRING },
                },
                required: [
                  "executive_summary",
                  "status_explanation",
                  "recommendations",
                  "risk_level",
                ],
              },
              temperature: 0.3,
            },
          }),
          30000,
          "generateHealthSummary"
        ),
      3,
      "generateHealthSummary"
    );

    const parsed = safeParseJSON<HealthSummaryResult>(result.text, "generateHealthSummary");
    if (!parsed) return localFallback;

    // Validate required fields
    const valid = validateFields(parsed, ["executive_summary", "recommendations", "risk_level"], "generateHealthSummary");
    if (!valid) return localFallback;

    // Guard: ensure recommendations is always an array
    if (!Array.isArray(parsed.recommendations)) {
      parsed.recommendations = localFallback.recommendations;
    }

    return parsed;
  } catch (error) {
    console.error("[Gemini] generateHealthSummary failed after retries:", error);
    // Return contextual fallback — never generic
    return localFallback;
  }
};

/**
 * Build a contextual, data-driven health analysis WITHOUT calling Gemini.
 * Used as fallback when API is unavailable — never returns generic text.
 */
function buildContextualHealthFallback(
  projectName: string,
  score: number,
  ragStatus: string,
  metrics: {
    totalMilestones: number;
    completedMilestones: number;
    overdueMilestones: number;
    totalRisks: number;
    highRisks: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    totalBlockers: number;
  }
): HealthSummaryResult {
  const pct = metrics.totalTasks > 0
    ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100)
    : 0;

  const msPct = metrics.totalMilestones > 0
    ? Math.round((metrics.completedMilestones / metrics.totalMilestones) * 100)
    : 0;

  // Build contextual summary
  const parts: string[] = [];
  if (metrics.overdueMilestones > 0) {
    parts.push(
      `${metrics.overdueMilestones} milestone${metrics.overdueMilestones > 1 ? "s are" : " is"} overdue, putting the schedule baseline under pressure.`
    );
  }
  if (metrics.highRisks > 0) {
    parts.push(
      `${metrics.highRisks} high-severity risk${metrics.highRisks > 1 ? "s require" : " requires"} escalation per governance policy.`
    );
  }
  if (metrics.totalBlockers > 0) {
    parts.push(
      `${metrics.totalBlockers} active blocker${metrics.totalBlockers > 1 ? "s are" : " is"} impeding task completion.`
    );
  }
  if (parts.length === 0) {
    parts.push(`Task completion stands at ${pct}% with ${msPct}% milestone progress — broadly on track.`);
  }

  const executive_summary = `${projectName} is currently scored at ${score}/100 (${ragStatus}). ${parts.join(" ")} Task completion is at ${pct}% (${metrics.completedTasks}/${metrics.totalTasks} tasks).`;

  // Build contextual recommendations
  const recommendations: string[] = [];
  if (metrics.overdueMilestones > 0) {
    recommendations.push(
      `Immediately review the ${metrics.overdueMilestones} overdue milestone${metrics.overdueMilestones > 1 ? "s" : ""} — assess if recovery plan or timeline revision is needed.`
    );
  }
  if (metrics.highRisks > 0) {
    recommendations.push(
      `Escalate ${metrics.highRisks} high-severity risk${metrics.highRisks > 1 ? "s" : ""} to the steering committee within 24 hours per risk governance policy.`
    );
  }
  if (metrics.totalBlockers > 0) {
    recommendations.push(
      `Resolve ${metrics.totalBlockers} active blocker${metrics.totalBlockers > 1 ? "s" : ""} immediately — assign blocker owners and set resolution deadlines.`
    );
  }
  if (metrics.overdueTasks > 0) {
    recommendations.push(
      `Reallocate resources to address ${metrics.overdueTasks} overdue task${metrics.overdueTasks > 1 ? "s" : ""} before they impact milestone completion.`
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(`Maintain current velocity — project health is acceptable at ${score}/100.`);
    recommendations.push(`Continue weekly milestone reviews to sustain ${msPct}% completion rate.`);
  }

  return {
    executive_summary,
    status_explanation: `Score of ${score}/100 reflects: ${metrics.completedMilestones}/${metrics.totalMilestones} milestones completed, ${metrics.totalRisks} open risks, ${metrics.completedTasks}/${metrics.totalTasks} tasks done.`,
    recommendations,
    risk_level: ragStatus,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 3: AI Kickoff Generator
// ─────────────────────────────────────────────────────────────────────────────
export interface KickoffData {
  timeline_summary: string;
  scope_items: { item: string; complexity: string; owner: string }[];
  milestones: { title: string; target_date: string; status: string; owner: string; notes: string }[];
  risks: { title: string; impact: string; probability: string; mitigation: string; owner: string }[];
  stakeholders: { name: string; role: string; influence: string; contact_email: string; organization: string }[];
}

export const generateKickoffData = async (
  projectName: string,
  industry: string,
  priority: string,
  startDate: string
): Promise<KickoffData | null> => {
  if (!isKeyConfigured()) {
    console.warn("[Gemini] API key not configured — cannot generate kickoff data");
    return null;
  }

  const today = new Date(startDate || new Date().toISOString().split("T")[0]);
  const addDays = (d: Date, n: number) =>
    new Date(d.getTime() + n * 86400000).toISOString().split("T")[0];

  const prompt = `Generate a complete, realistic project kickoff plan.

PROJECT DETAILS:
• Name: ${projectName}
• Industry: ${industry || "Enterprise Technology"}
• Priority Level: ${priority || "Standard"}
• Start Date: ${startDate || today.toISOString().split("T")[0]}

REQUIREMENTS:
- Scope items should be specific to the "${industry}" industry
- Milestones must have realistic dates starting from ${startDate}
- Risks should reflect common "${industry}" project challenges
- Stakeholders should have realistic roles for a ${priority}-priority project
- Make all content specific to "${projectName}" — not generic

Generate exactly:
• 5 scope items relevant to ${industry}
• 3 milestones (roughly at +30, +60, +90 days from start)
• 4 risks specific to this type of project
• 3 stakeholders with realistic names and roles`;

  try {
    const result = await withRetry(
      () =>
        withTimeout(
          getAI().models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
              systemInstruction:
                "You are a senior PMO consultant with 20 years of experience across multiple industries. Generate highly specific, realistic project planning data tailored to the exact project and industry provided. Never use placeholder names.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  timeline_summary: { type: Type.STRING },
                  scope_items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        item: { type: Type.STRING },
                        complexity: { type: Type.STRING },
                        owner: { type: Type.STRING },
                      },
                      required: ["item", "complexity", "owner"],
                    },
                  },
                  milestones: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        target_date: { type: Type.STRING },
                        status: { type: Type.STRING },
                        owner: { type: Type.STRING },
                        notes: { type: Type.STRING },
                      },
                      required: ["title", "target_date", "status", "owner", "notes"],
                    },
                  },
                  risks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        impact: { type: Type.STRING },
                        probability: { type: Type.STRING },
                        mitigation: { type: Type.STRING },
                        owner: { type: Type.STRING },
                      },
                      required: ["title", "impact", "probability", "mitigation", "owner"],
                    },
                  },
                  stakeholders: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        role: { type: Type.STRING },
                        influence: { type: Type.STRING },
                        contact_email: { type: Type.STRING },
                        organization: { type: Type.STRING },
                      },
                      required: ["name", "role", "influence", "contact_email", "organization"],
                    },
                  },
                },
                required: ["timeline_summary", "scope_items", "milestones", "risks", "stakeholders"],
              },
              temperature: 0.55,
            },
          }),
          45000,
          "generateKickoffData"
        ),
      3,
      "generateKickoffData"
    );

    const parsed = safeParseJSON<KickoffData>(result.text, "generateKickoffData");
    if (!parsed) return null;

    // Enforce count limits and sanitize
    return {
      timeline_summary: parsed.timeline_summary || `${projectName} — estimated 90-day delivery`,
      scope_items: (parsed.scope_items || []).slice(0, 5).filter((s) => s.item),
      milestones: (parsed.milestones || []).slice(0, 3).filter((m) => m.title),
      risks: (parsed.risks || []).slice(0, 4).filter((r) => r.title),
      stakeholders: (parsed.stakeholders || []).slice(0, 4).filter((s) => s.name),
    };
  } catch (error) {
    console.error("[Gemini] generateKickoffData failed after retries:", error);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 4: AI Risk Auto-Scorer
// ─────────────────────────────────────────────────────────────────────────────
export interface RiskScoreResult {
  risk_score: number;
  risk_level: string;
  ai_recommendation: string;
}

export const scoreRiskWithAI = async (risk: {
  title: string;
  impact: string;
  probability: string;
  mitigation?: string;
}): Promise<RiskScoreResult> => {
  // Always have a deterministic local fallback ready
  const localScore = buildLocalRiskScore(risk);

  if (!isKeyConfigured()) {
    return localScore;
  }

  const prompt = `Assess this project risk using PMI/RMP risk matrix standards:

Risk: "${risk.title}"
Documented Impact: ${risk.impact}
Documented Probability: ${risk.probability}  
Current Mitigation: ${risk.mitigation || "No mitigation plan defined"}

Provide:
1. risk_score: numeric 1-12 (impact × probability matrix)
2. risk_level: one of LOW / MEDIUM / HIGH / CRITICAL
3. ai_recommendation: 1-2 specific, actionable sentences for this exact risk

The recommendation MUST reference the specific risk title. Do not give generic advice.`;

  try {
    const result = await withRetry(
      () =>
        withTimeout(
          getAI().models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
              systemInstruction:
                "You are a certified Risk Management Professional (RMP/PMP). Score risks using standard impact × probability matrices. Give specific, actionable mitigations — not generic advice.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  risk_score: { type: Type.NUMBER },
                  risk_level: { type: Type.STRING },
                  ai_recommendation: { type: Type.STRING },
                },
                required: ["risk_score", "risk_level", "ai_recommendation"],
              },
              temperature: 0.2,
            },
          }),
          20000,
          "scoreRiskWithAI"
        ),
      2,
      "scoreRiskWithAI"
    );

    const parsed = safeParseJSON<RiskScoreResult>(result.text, "scoreRiskWithAI");
    if (!parsed) return localScore;

    // Validate score is numeric and level is valid
    const validLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    const scoreNum = Number(parsed.risk_score);
    const levelUp = (parsed.risk_level || "").toUpperCase();

    return {
      risk_score: isNaN(scoreNum) ? localScore.risk_score : Math.max(1, Math.min(12, scoreNum)),
      risk_level: validLevels.includes(levelUp) ? levelUp : localScore.risk_level,
      ai_recommendation: parsed.ai_recommendation?.trim() || localScore.ai_recommendation,
    };
  } catch (error) {
    console.error("[Gemini] scoreRiskWithAI failed:", error);
    return localScore;
  }
};

/** Deterministic local risk scoring — always specific to the risk */
function buildLocalRiskScore(risk: {
  title: string;
  impact: string;
  probability: string;
  mitigation?: string;
}): RiskScoreResult {
  const impactMap: Record<string, number> = { Low: 1, Medium: 2, High: 3, Critical: 4 };
  const probMap: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
  const impactVal = impactMap[risk.impact] || 2;
  const probVal = probMap[risk.probability] || 2;
  const score = impactVal * probVal;
  const level = score >= 9 ? "CRITICAL" : score >= 6 ? "HIGH" : score >= 3 ? "MEDIUM" : "LOW";

  const hasMitigation = risk.mitigation && risk.mitigation.trim().length > 3;
  const recommendation = hasMitigation
    ? `Risk "${risk.title}" scored ${level} (RS-${score}). Existing mitigation plan is in place — validate its effectiveness and assign a tracking owner.`
    : `Risk "${risk.title}" scored ${level} (RS-${score}). No mitigation plan is defined — immediately assign a risk owner and document containment actions.`;

  return { risk_score: score, risk_level: level, ai_recommendation: recommendation };
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 5: AI Status Report Generator
// ─────────────────────────────────────────────────────────────────────────────
export interface StatusReportResult {
  report_title: string;
  executive_summary: string;
  project_highlights: string[];
  delays_and_risks: string;
  team_performance: string;
  recommendations: string[];
  next_actions: string[];
  overall_status: string;
}

export const generateStatusReport = async (
  aggregateData: any
): Promise<StatusReportResult | null> => {
  if (!isKeyConfigured()) {
    console.warn("[Gemini] API key not configured — cannot generate status report");
    return buildContextualReportFallback(aggregateData);
  }

  const proj = aggregateData.project || {};
  const ms = aggregateData.milestones || {};
  const risks = aggregateData.risks || {};
  const tasks = aggregateData.tasks || {};
  const budget = aggregateData.budget || {};
  const health = aggregateData.healthScore;

  // Build a rich, specific milestone list
  const milestoneList = (ms.list || [])
    .filter((m: any) => m.status !== "Completed")
    .slice(0, 5)
    .map((m: any) => `  • ${m.title} [${m.status}] — due ${m.date || "TBD"}`)
    .join("\n");

  // Build specific risk list
  const riskList = (risks.list || [])
    .slice(0, 5)
    .map((r: any) => `  • [${r.impact?.toUpperCase()}] ${r.title}: ${r.mitigation || "No mitigation"}`)
    .join("\n");

  const prompt = `Write a formal executive project status report for the PMO Board.

PROJECT: ${proj.name || "Unknown"} (${proj.code || "N/A"})
CLIENT: ${proj.client || "N/A"}  
INDUSTRY: ${proj.industry || "N/A"}
PRIORITY: ${proj.priority || "Standard"}
START DATE: ${proj.start || "N/A"}
HEALTH SCORE: ${health ? `${health.score}/100 (${health.ragStatus})` : "Not computed"}

═══ QUANTITATIVE METRICS ═══
Milestones: ${ms.completed || 0}/${ms.total || 0} completed, ${ms.overdue || 0} overdue
Tasks: ${tasks.completed || 0}/${tasks.total || 0} complete, ${tasks.overdue || 0} overdue, ${tasks.blocked || 0} blocked
Open Risks: ${risks.open || 0} total, ${risks.high || 0} high-severity
Active Blockers: ${tasks.blockers || 0}
BOM Budget Committed: $${budget.totalBOM || 0}

═══ PENDING MILESTONES ═══
${milestoneList || "  • No pending milestones"}

═══ OPEN RISKS (TOP ${(risks.list || []).length}) ═══
${riskList || "  • No open risks"}

REQUIREMENT: All content must reference the EXACT numbers and project name above.
Do not write generic text. Write like a real PMO director speaking to a board.`;

  try {
    const result = await withRetry(
      () =>
        withTimeout(
          getAI().models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
              systemInstruction:
                "You are a senior PMO director writing a formal executive project status report for C-suite stakeholders. Reference all specific metrics provided. Never use placeholders. Be professional, concise, and data-driven.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  report_title: { type: Type.STRING },
                  executive_summary: { type: Type.STRING },
                  project_highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                  delays_and_risks: { type: Type.STRING },
                  team_performance: { type: Type.STRING },
                  recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                  next_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  overall_status: { type: Type.STRING },
                },
                required: [
                  "report_title",
                  "executive_summary",
                  "project_highlights",
                  "delays_and_risks",
                  "team_performance",
                  "recommendations",
                  "next_actions",
                  "overall_status",
                ],
              },
              temperature: 0.35,
            },
          }),
          45000,
          "generateStatusReport"
        ),
      3,
      "generateStatusReport"
    );

    const parsed = safeParseJSON<StatusReportResult>(result.text, "generateStatusReport");
    if (!parsed) return buildContextualReportFallback(aggregateData);

    // Sanitize arrays
    return {
      report_title: parsed.report_title || `${proj.name} — Executive Status Report`,
      executive_summary: parsed.executive_summary || "",
      project_highlights: Array.isArray(parsed.project_highlights) ? parsed.project_highlights : [],
      delays_and_risks: parsed.delays_and_risks || "",
      team_performance: parsed.team_performance || "",
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      next_actions: Array.isArray(parsed.next_actions) ? parsed.next_actions : [],
      overall_status: parsed.overall_status || "Under Review",
    };
  } catch (error) {
    console.error("[Gemini] generateStatusReport failed after retries:", error);
    return buildContextualReportFallback(aggregateData);
  }
};

/** Contextual fallback report — data-driven, not generic */
function buildContextualReportFallback(aggregateData: any): StatusReportResult {
  const proj = aggregateData.project || {};
  const ms = aggregateData.milestones || {};
  const risks = aggregateData.risks || {};
  const tasks = aggregateData.tasks || {};
  const health = aggregateData.healthScore;

  const pct = tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0;
  const msPct = ms.total > 0 ? Math.round((ms.completed / ms.total) * 100) : 0;
  const status = health?.ragStatus || (pct >= 70 ? "On Track" : pct >= 45 ? "At Risk" : "Off Track");

  return {
    report_title: `${proj.name || "Project"} — Executive Status Report`,
    executive_summary: `${proj.name || "This project"} (${proj.code || "N/A"}) for ${proj.client || "the client"} is currently ${status}. Task completion stands at ${pct}% (${tasks.completed || 0}/${tasks.total || 0}) and milestone progress at ${msPct}% (${ms.completed || 0}/${ms.total || 0}). ${ms.overdue > 0 ? `${ms.overdue} milestone${ms.overdue > 1 ? "s are" : " is"} overdue and requires immediate attention.` : "No milestones are currently overdue."} ${risks.open > 0 ? `${risks.open} risks remain open, including ${risks.high || 0} high-severity items.` : "No open risks at this time."}`,
    project_highlights: [
      `${tasks.completed || 0} of ${tasks.total || 0} tasks completed (${pct}% completion rate)`,
      `${ms.completed || 0} of ${ms.total || 0} milestones achieved (${msPct}% milestone completion)`,
      `Budget committed: $${aggregateData.budget?.totalBOM || 0}`,
    ],
    delays_and_risks: `${ms.overdue > 0 ? `${ms.overdue} milestone(s) are overdue, directly affecting schedule baseline. ` : "Schedule is on track. "}${risks.high > 0 ? `${risks.high} high-severity risk(s) require escalation per governance policy. ` : "No high-severity risks active. "}${tasks.blockers > 0 ? `${tasks.blockers} blocker(s) are actively impeding task completion.` : "No active blockers."}`,
    team_performance: `Team has completed ${tasks.completed || 0} tasks from a total workload of ${tasks.total || 0}. ${tasks.overdue > 0 ? `${tasks.overdue} tasks are past their due date and need resource reallocation.` : "All tasks are within schedule."}`,
    recommendations: buildContextualRecommendations(ms, risks, tasks),
    next_actions: buildContextualNextActions(ms, risks, tasks),
    overall_status: status,
  };
}

function buildContextualRecommendations(ms: any, risks: any, tasks: any): string[] {
  const recs: string[] = [];
  if (ms.overdue > 0) recs.push(`Review and re-baseline ${ms.overdue} overdue milestone${ms.overdue > 1 ? "s" : ""} — determine if fast-track recovery or timeline adjustment is required.`);
  if (risks.high > 0) recs.push(`Escalate ${risks.high} high-severity risk${risks.high > 1 ? "s" : ""} to the steering committee — update risk register with mitigation timelines.`);
  if (tasks.blocked > 0) recs.push(`Assign dedicated resolution owners to ${tasks.blocked} blocked task${tasks.blocked > 1 ? "s" : ""} — target unblocking within 48 hours.`);
  if (tasks.overdue > 0) recs.push(`Reallocate capacity to recover ${tasks.overdue} overdue task${tasks.overdue > 1 ? "s" : ""} before they cascade to milestone delays.`);
  if (recs.length === 0) recs.push("Maintain current execution velocity — all key metrics are within acceptable thresholds.");
  return recs;
}

function buildContextualNextActions(ms: any, risks: any, tasks: any): string[] {
  const actions: string[] = [];
  if (ms.overdue > 0) actions.push(`Conduct overdue milestone review — update recovery plan within 24 hours`);
  if (risks.open > 0) actions.push(`Schedule risk review meeting — ${risks.open} open risks need status updates`);
  if (tasks.blockers > 0) actions.push(`Resolve ${tasks.blockers} active blocker(s) — assign owners and set resolution deadlines`);
  actions.push("Distribute this status report to all stakeholders");
  actions.push("Update project health score post-remediation actions");
  return actions;
}
