const router = require("express").Router();
const pool   = require("../db");

/* ─────────────────────────────────────────────────────────────
   POST /kickoff/bulk-insert
   Accepts AI-generated kickoff data and bulk inserts into DB
   Body: { projectId, scopeItems[], milestones[], risks[], stakeholders[] }
───────────────────────────────────────────────────────────── */
router.post("/bulk-insert", async (req, res) => {
  const client = await pool.connect();

  try {
    const { projectId, scopeItems, milestones, risks, stakeholders } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    // Verify project exists
    const proj = await client.query("SELECT project_id FROM projects WHERE project_id = $1", [projectId]);
    if (proj.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    await client.query("BEGIN");

    const inserted = {
      scopeItems:   [],
      milestones:   [],
      risks:        [],
      stakeholders: []
    };

    // ── Scope Items ───────────────────────────────────────────
    if (Array.isArray(scopeItems) && scopeItems.length > 0) {
      for (const s of scopeItems) {
        const r = await client.query(
          `INSERT INTO project_scope_items (project_id, item, complexity, owner)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [projectId, s.item || "Scope Item", s.complexity || "Medium", s.owner || "TBD"]
        );
        inserted.scopeItems.push(r.rows[0]);
      }
    }

    // ── Milestones ────────────────────────────────────────────
    if (Array.isArray(milestones) && milestones.length > 0) {
      for (const m of milestones) {
        const r = await client.query(
          `INSERT INTO project_milestones (project_id, title, target_date, status, owner, notes)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [
            projectId,
            m.title || "Milestone",
            m.target_date || null,
            m.status       || "Planned",
            m.owner        || "Project Manager",
            m.notes        || ""
          ]
        );
        inserted.milestones.push(r.rows[0]);
      }
    }

    // ── Risks ─────────────────────────────────────────────────
    if (Array.isArray(risks) && risks.length > 0) {
      for (const r of risks) {
        const res = await client.query(
          `INSERT INTO project_risks (project_id, title, impact, probability, mitigation, owner, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [
            projectId,
            r.title       || "Risk Item",
            r.impact      || "Medium",
            r.probability || "Medium",
            r.mitigation  || "",
            r.owner       || "Risk Owner",
            "Open"
          ]
        );
        inserted.risks.push(res.rows[0]);
      }
    }

    // ── Stakeholders ──────────────────────────────────────────
    if (Array.isArray(stakeholders) && stakeholders.length > 0) {
      for (const s of stakeholders) {
        const r = await client.query(
          `INSERT INTO project_stakeholders (project_id, name, role, influence, contact_email, organization)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [
            projectId,
            s.name         || "Stakeholder",
            s.role         || "Member",
            s.influence    || "Medium",
            s.contact_email || "",
            s.organization || ""
          ]
        );
        inserted.stakeholders.push(r.rows[0]);
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "AI kickoff data inserted successfully",
      inserted
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Kickoff] Bulk insert error:", err.message);
    res.status(500).json({ error: "Bulk insert failed: " + err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
