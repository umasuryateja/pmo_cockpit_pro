const router = require("express").Router();
const pool   = require("../db");

/* ─────────────────────────────────────────────────────────────
   GET /reports/aggregate/:projectId
   Aggregates all project data needed for the AI report generator.
   The frontend sends this payload to Gemini and gets back a report.
───────────────────────────────────────────────────────────── */
router.get("/aggregate/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const now = new Date().toISOString().split("T")[0];

    // Project core
    const projRes = await pool.query("SELECT * FROM projects WHERE project_id = $1", [projectId]);
    if (projRes.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    const project = projRes.rows[0];

    // Milestones summary
    const msRes = await pool.query(
      "SELECT * FROM project_milestones WHERE project_id = $1 ORDER BY target_date",
      [projectId]
    );
    const milestones        = msRes.rows;
    const completedMs       = milestones.filter(m => m.status === "Completed").length;
    const overdueMs         = milestones.filter(m => m.status !== "Completed" && m.target_date && m.target_date < now).length;
    const upcomingMs        = milestones.filter(m => m.status === "Planned" || m.status === "In Progress").length;

    // Risks summary
    const riskRes = await pool.query(
      "SELECT * FROM project_risks WHERE project_id = $1",
      [projectId]
    );
    const risks      = riskRes.rows;
    const openRisks     = risks.filter(r => r.status === "Open");
    const highRisks     = openRisks.filter(r => r.impact === "High" || r.impact === "Critical").length;

    // Activities summary (joined through deliverables)
    const actRes = await pool.query(
      `SELECT a.*, d.deliverable_name
       FROM activities a
       JOIN deliverables d ON a.deliverable_id = d.deliverable_id
       WHERE d.project_id = $1`,
      [projectId]
    );
    const activities       = actRes.rows;
    const completedTasks   = activities.filter(a => a.status === "Completed").length;
    const overdueTasks     = activities.filter(a => a.status !== "Completed" && a.due_date && a.due_date < now).length;
    const blockedTasks     = activities.filter(a => a.status === "Blocked").length;
    const activeBlockers   = activities.filter(a => a.blocker && a.blocker.trim() !== "").length;

    // Stakeholders
    const stRes = await pool.query(
      "SELECT name, role, influence FROM project_stakeholders WHERE project_id = $1",
      [projectId]
    );

    // BOM Budget
    const bomRes = await pool.query(
      "SELECT SUM(quantity * unit_cost) as total FROM project_bom_items WHERE project_id = $1",
      [projectId]
    );
    const budgetTotal = parseFloat(bomRes.rows[0]?.total || 0).toFixed(2);

    // Health score (if computed)
    const healthRes = await pool.query(
      "SELECT score, rag_status FROM project_health_scores WHERE project_id = $1",
      [projectId]
    );
    const health = healthRes.rows[0] || null;

    res.json({
      project: {
        name:     project.project_name,
        code:     project.project_code,
        client:   project.client_name,
        manager:  project.project_manager,
        industry: project.industry,
        priority: project.priority_level,
        start:    project.planned_start
      },
      milestones: {
        total:      milestones.length,
        completed:  completedMs,
        overdue:    overdueMs,
        upcoming:   upcomingMs,
        list:       milestones.map(m => ({ title: m.title, status: m.status, date: m.target_date }))
      },
      risks: {
        total:    risks.length,
        open:     openRisks.length,
        high:     highRisks,
        list:     openRisks.slice(0, 10).map(r => ({ title: r.title, impact: r.impact, mitigation: r.mitigation }))
      },
      tasks: {
        total:      activities.length,
        completed:  completedTasks,
        overdue:    overdueTasks,
        blocked:    blockedTasks,
        blockers:   activeBlockers
      },
      stakeholders: stRes.rows,
      budget: {
        totalBOM: budgetTotal
      },
      healthScore: health ? { score: health.score, ragStatus: health.rag_status } : null,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("[Reports] Aggregate error:", err.message);
    res.status(500).json({ error: "Failed to aggregate report data" });
  }
});

module.exports = router;
