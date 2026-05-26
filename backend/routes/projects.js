const router = require("express").Router();
const pool = require("../db");

// GET all projects
router.get("/all", async (req, res) => {
  try {
    const projects = await pool.query("SELECT * FROM projects ORDER BY project_id");
    res.json(projects.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// CREATE project (always INSERT — never updates an existing row)
router.post("/create", async (req, res) => {
  try {
    const {
      project_code,
      project_name,
      client_name,
      project_manager,
      industry,
      priority_level,
      planned_start
    } = req.body;

    if (!project_name || !String(project_name).trim()) {
      return res.status(400).json({ error: "project_name is required" });
    }
    if (!project_code || !String(project_code).trim()) {
      return res.status(400).json({ error: "project_code is required" });
    }

    const project = await pool.query(
      `INSERT INTO projects
      (project_code, project_name, client_name, project_manager, industry, priority_level, planned_start)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        String(project_code).trim(),
        String(project_name).trim(),
        client_name || null,
        project_manager || null,
        industry || null,
        priority_level || "Standard",
        planned_start || null
      ]
    );

    res.status(201).json(project.rows[0]);
  } catch (err) {
    console.error("[Projects] Create error:", err.message);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Project code already exists. Use a unique code." });
    }
    res.status(500).json({ error: "Create project error" });
  }
});

// UPDATE project
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { project_manager, industry, priority_level } = req.body;

    const updatedProject = await pool.query(
      `UPDATE projects
       SET project_manager = $1, industry = $2, priority_level = $3
       WHERE project_id = $4
       RETURNING *`,
      [project_manager, industry, priority_level, id]
    );

    if (updatedProject.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(updatedProject.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Update project error");
  }
});

// DELETE project
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = await pool.query(
      "DELETE FROM projects WHERE project_id = $1 RETURNING *",
      [id]
    );

    if (deletedProject.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project deleted successfully", project: deletedProject.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete project error");
  }
});

/* ---------------------- SCOPE ITEMS ---------------------- */

router.get("/scope/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const scope = await pool.query(
      "SELECT * FROM project_scope_items WHERE project_id = $1",
      [projectId]
    );
    res.json(scope.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Fetch scope items error");
  }
});

router.post("/scope/create", async (req, res) => {
  try {
    const { project_id, item, complexity, owner } = req.body;
    const newItem = await pool.query(
      `INSERT INTO project_scope_items (project_id, item, complexity, owner)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [project_id, item, complexity, owner]
    );
    res.json(newItem.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Create scope item error");
  }
});

/* ---------------------- MILESTONES ---------------------- */

router.get("/milestones/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const milestones = await pool.query(
      "SELECT * FROM project_milestones WHERE project_id = $1 ORDER BY target_date",
      [projectId]
    );
    res.json(milestones.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Fetch milestones error");
  }
});

router.post("/milestones/create", async (req, res) => {
  try {
    const { project_id, title, target_date, status, owner, notes } = req.body;
    const newMilestone = await pool.query(
      `INSERT INTO project_milestones (project_id, title, target_date, status, owner, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [project_id, title, target_date, status || 'Planned', owner, notes]
    );
    res.json(newMilestone.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Create milestone error");
  }
});

/* ---------------------- RISKS ---------------------- */

router.get("/risks/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const risks = await pool.query(
      "SELECT * FROM project_risks WHERE project_id = $1",
      [projectId]
    );
    res.json(risks.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Fetch risks error");
  }
});

router.post("/risks/create", async (req, res) => {
  try {
    const { project_id, title, impact, probability, mitigation, owner, status } = req.body;
    const newRisk = await pool.query(
      `INSERT INTO project_risks (project_id, title, impact, probability, mitigation, owner, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [project_id, title, impact, probability, mitigation, owner, status || 'Open']
    );
    res.json(newRisk.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Create risk error");
  }
});

/* ---------------------- STAKEHOLDERS ---------------------- */

router.get("/stakeholders/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const stakeholders = await pool.query(
      "SELECT * FROM project_stakeholders WHERE project_id = $1",
      [projectId]
    );
    res.json(stakeholders.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Fetch stakeholders error");
  }
});

router.post("/stakeholders/create", async (req, res) => {
  try {
    const { project_id, name, role, influence, contact_email, organization } = req.body;
    const newStakeholder = await pool.query(
      `INSERT INTO project_stakeholders (project_id, name, role, influence, contact_email, organization)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [project_id, name, role, influence, contact_email, organization]
    );
    res.json(newStakeholder.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Create stakeholder error");
  }
});

/* ---------------------- BILL OF MATERIALS (BOM) ---------------------- */

router.get("/bom/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const bom = await pool.query(
      "SELECT * FROM project_bom_items WHERE project_id = $1",
      [projectId]
    );
    res.json(bom.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Fetch BOM items error");
  }
});

router.post("/bom/create", async (req, res) => {
  try {
    const { project_id, item_name, category, quantity, unit_cost, notes } = req.body;
    const newBom = await pool.query(
      `INSERT INTO project_bom_items (project_id, item_name, category, quantity, unit_cost, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [project_id, item_name, category, quantity, unit_cost, notes]
    );
    res.json(newBom.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Create BOM item error");
  }
});

/* ---------------------- DELETE ENDPOINTS FOR DEFINE TABLES ---------------------- */

// DELETE scope item
router.delete("/scope/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await pool.query(
      "DELETE FROM project_scope_items WHERE scope_id = $1 RETURNING *",
      [id]
    );
    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: "Scope item not found" });
    }
    res.json({ message: "Scope item deleted successfully", item: deleted.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete scope item error");
  }
});

// DELETE milestone
router.delete("/milestones/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await pool.query(
      "DELETE FROM project_milestones WHERE milestone_id = $1 RETURNING *",
      [id]
    );
    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: "Milestone not found" });
    }
    res.json({ message: "Milestone deleted successfully", milestone: deleted.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete milestone error");
  }
});

// DELETE risk
router.delete("/risks/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await pool.query(
      "DELETE FROM project_risks WHERE risk_id = $1 RETURNING *",
      [id]
    );
    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: "Risk not found" });
    }
    res.json({ message: "Risk deleted successfully", risk: deleted.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete risk error");
  }
});

// DELETE stakeholder
router.delete("/stakeholders/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await pool.query(
      "DELETE FROM project_stakeholders WHERE stakeholder_id = $1 RETURNING *",
      [id]
    );
    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: "Stakeholder not found" });
    }
    res.json({ message: "Stakeholder deleted successfully", stakeholder: deleted.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete stakeholder error");
  }
});

// DELETE BOM item
router.delete("/bom/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await pool.query(
      "DELETE FROM project_bom_items WHERE bom_id = $1 RETURNING *",
      [id]
    );
    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: "BOM item not found" });
    }
    res.json({ message: "BOM item deleted successfully", bom: deleted.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete BOM item error");
  }
});

module.exports = router;


