const router = require("express").Router();
const pool   = require("../db");

/* ─────────────────────────────────────────────────────────────
   HEALTH SCORING ALGORITHM
   Score breakdown (total = 100 pts):
     - Milestone completion rate   : 30 pts
     - Risk severity               : 25 pts
     - Task completion rate        : 25 pts
     - Blocker resolution          : 20 pts
───────────────────────────────────────────────────────────── */

/**
 * Compute a deterministic health score from raw project metrics.
 * Returns { score, ragStatus, milestoneScore, riskScore, taskScore, blockerScore, metrics }
 */
function computeHealthScore(metrics) {
  const {
    totalMilestones, completedMilestones, overdueMilestones,
    totalRisks, highRisks, criticalRisks,
    totalTasks, completedTasks, overdueTasks,
    totalBlockers, resolvedBlockers
  } = metrics;

  // ── Milestone score (30 pts) ──────────────────────────────
  let milestoneScore = 30;
  if (totalMilestones > 0) {
    const completionRatio = completedMilestones / totalMilestones;
    milestoneScore = Math.round(completionRatio * 30);
    // Penalty: each overdue milestone costs 4 pts
    milestoneScore = Math.max(0, milestoneScore - overdueMilestones * 4);
  }

  // ── Risk score (25 pts) ───────────────────────────────────
  let riskScore = 25;
  if (totalRisks > 0) {
    const highPenalty     = highRisks * 3;
    const criticalPenalty = criticalRisks * 6;
    riskScore = Math.max(0, 25 - highPenalty - criticalPenalty);
  }

  // ── Task score (25 pts) ───────────────────────────────────
  let taskScore = 25;
  if (totalTasks > 0) {
    const completionRatio = completedTasks / totalTasks;
    taskScore = Math.round(completionRatio * 25);
    const overduePenalty = Math.min(overdueTasks * 2, 10);
    taskScore = Math.max(0, taskScore - overduePenalty);
  }

  // ── Blocker score (20 pts) ────────────────────────────────
  let blockerScore = 20;
  if (totalBlockers > 0) {
    const unresolvedBlockers = totalBlockers - resolvedBlockers;
    blockerScore = Math.max(0, 20 - unresolvedBlockers * 4);
  }

  const score = milestoneScore + riskScore + taskScore + blockerScore;

  // RAG classification
  let ragStatus;
  if (score >= 75)      ragStatus = "On Track";
  else if (score >= 50) ragStatus = "At Risk";
  else                  ragStatus = "Off Track";

  return { score, ragStatus, milestoneScore, riskScore, taskScore, blockerScore };
}

/* ─────────────────────────────────────────────────────────────
   GET /health/score/:projectId
   - Computes score from live DB data
   - Returns score + last stored AI summary (no Gemini call here)
───────────────────────────────────────────────────────────── */
router.get("/score/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check project exists
    const proj = await pool.query("SELECT * FROM projects WHERE project_id = $1", [projectId]);
    if (proj.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const metrics = await gatherProjectMetrics(projectId);
    const scored  = computeHealthScore(metrics);

    // Fetch latest stored AI summary (if any)
    const stored = await pool.query(
      "SELECT * FROM project_health_scores WHERE project_id = $1",
      [projectId]
    );

    res.json({
      ...scored,
      ai_summary:         stored.rows[0]?.ai_summary         || null,
      ai_recommendations: stored.rows[0]?.ai_recommendations || null,
      computed_at:        stored.rows[0]?.computed_at        || null,
      metrics
    });
  } catch (err) {
    console.error("[Health] Score error:", err.message);
    res.status(500).json({ error: "Failed to compute health score" });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /health/analyze/:projectId
   - Computes score + saves it + triggers Gemini for AI summary
   - Frontend calls this when user clicks "Run AI Analysis"
───────────────────────────────────────────────────────────── */
router.post("/analyze/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const proj = await pool.query("SELECT * FROM projects WHERE project_id = $1", [projectId]);
    if (proj.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const metrics = await gatherProjectMetrics(projectId);
    const scored  = computeHealthScore(metrics);

    // Upsert into project_health_scores
    await pool.query(
      `INSERT INTO project_health_scores
         (project_id, score, rag_status, milestone_score, risk_score, task_score, blocker_score, computed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (project_id)
       DO UPDATE SET
         score          = EXCLUDED.score,
         rag_status     = EXCLUDED.rag_status,
         milestone_score= EXCLUDED.milestone_score,
         risk_score     = EXCLUDED.risk_score,
         task_score     = EXCLUDED.task_score,
         blocker_score  = EXCLUDED.blocker_score,
         computed_at    = NOW()`,
      [
        projectId,
        scored.score,
        scored.ragStatus,
        scored.milestoneScore,
        scored.riskScore,
        scored.taskScore,
        scored.blockerScore
      ]
    );

    res.json({
      ...scored,
      metrics,
      message: "Health score computed and saved. Call /health/ai-summary/:projectId for Gemini analysis."
    });
  } catch (err) {
    console.error("[Health] Analyze error:", err.message);
    res.status(500).json({ error: "Failed to analyze project health" });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /health/ai-summary/:projectId
   - Receives AI summary text from frontend (Gemini called client-side)
   - Saves it to project_health_scores
───────────────────────────────────────────────────────────── */
router.post("/ai-summary/:projectId", async (req, res) => {
  try {
    const { projectId }            = req.params;
    const { ai_summary, ai_recommendations } = req.body;

    await pool.query(
      `UPDATE project_health_scores
       SET ai_summary = $1, ai_recommendations = $2, computed_at = NOW()
       WHERE project_id = $3`,
      [ai_summary || "", ai_recommendations || "", projectId]
    );

    res.json({ message: "AI summary saved successfully" });
  } catch (err) {
    console.error("[Health] AI summary save error:", err.message);
    res.status(500).json({ error: "Failed to save AI summary" });
  }
});

/* ─────────────────────────────────────────────────────────────
   Helper: gather all raw metrics for a project from DB
───────────────────────────────────────────────────────────── */
async function gatherProjectMetrics(projectId) {
  const now = new Date().toISOString().split("T")[0];

  // Milestones
  const milestoneRes = await pool.query(
    "SELECT status, target_date FROM project_milestones WHERE project_id = $1",
    [projectId]
  );
  const milestones       = milestoneRes.rows;
  const totalMilestones     = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === "Completed").length;
  const overdueMilestones   = milestones.filter(
    m => m.status !== "Completed" && m.target_date && m.target_date < now
  ).length;

  // Risks
  const riskRes = await pool.query(
    "SELECT impact, status FROM project_risks WHERE project_id = $1",
    [projectId]
  );
  const risks      = riskRes.rows;
  const totalRisks    = risks.filter(r => r.status === "Open").length;
  const highRisks     = risks.filter(r => r.status === "Open" && r.impact === "High").length;
  const criticalRisks = risks.filter(r => r.status === "Open" && r.impact === "Critical").length;

  // Activities (tasks)
  const actRes = await pool.query(
    `SELECT a.status, a.due_date, a.blocker
     FROM activities a
     JOIN deliverables d ON a.deliverable_id = d.deliverable_id
     WHERE d.project_id = $1`,
    [projectId]
  );
  const activities    = actRes.rows;
  const totalTasks       = activities.length;
  const completedTasks   = activities.filter(a => a.status === "Completed").length;
  const overdueTasks     = activities.filter(
    a => a.status !== "Completed" && a.due_date && a.due_date < now
  ).length;
  const totalBlockers    = activities.filter(a => a.blocker && a.blocker.trim() !== "").length;
  const resolvedBlockers = 0; // No resolved_blocker field yet — default 0

  return {
    totalMilestones, completedMilestones, overdueMilestones,
    totalRisks, highRisks, criticalRisks,
    totalTasks, completedTasks, overdueTasks,
    totalBlockers, resolvedBlockers
  };
}

module.exports = router;
