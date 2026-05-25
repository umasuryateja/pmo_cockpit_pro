const router = require("express").Router();
const pool = require("../db");


/* ---------------- GET DELIVERABLES BY PROJECT ---------------- */

router.get("/:projectId", async (req, res) => {
  try {

    const { projectId } = req.params;

    const result = await pool.query(
      `SELECT * FROM deliverables
       WHERE project_id=$1`,
      [projectId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Deliverables fetch error");
  }
});


/* ---------------- CREATE DELIVERABLE ---------------- */

router.post("/create", async (req, res) => {
  try {

    const {
      project_id,
      deliverable_name,
      complexity,
      resource_group
    } = req.body;

    const newDeliverable = await pool.query(
      `INSERT INTO deliverables
      (project_id, deliverable_name, complexity, resource_group)
      VALUES ($1,$2,$3,$4)
      RETURNING *`,
      [project_id, deliverable_name, complexity, resource_group]
    );

    res.json(newDeliverable.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Create deliverable error");
  }
});


module.exports = router;