const router = require("express").Router();
const pool   = require("../db");

/* ─────────────────────────────────────────────────────────────
   GET /notes/:projectId  — fetch all notes for a project
───────────────────────────────────────────────────────────── */
router.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      "SELECT * FROM project_notes WHERE project_id = $1 ORDER BY updated_at DESC",
      [projectId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("[Notes] Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /notes/create  — create a new note
───────────────────────────────────────────────────────────── */
router.post("/create", async (req, res) => {
  try {
    const { project_id, title, content, created_by } = req.body;

    if (!project_id || !title) {
      return res.status(400).json({ error: "project_id and title are required" });
    }

    const result = await pool.query(
      `INSERT INTO project_notes (project_id, title, content, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [project_id, title, content || "", created_by || "Alex Johnson"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("[Notes] Create error:", err.message);
    res.status(500).json({ error: "Failed to create note" });
  }
});

/* ─────────────────────────────────────────────────────────────
   PUT /notes/update/:id  — update title / content
───────────────────────────────────────────────────────────── */
router.put("/update/:id", async (req, res) => {
  try {
    const { id }               = req.params;
    const { title, content }   = req.body;

    const result = await pool.query(
      `UPDATE project_notes
       SET title = $1, content = $2, updated_at = NOW()
       WHERE note_id = $3
       RETURNING *`,
      [title, content || "", id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("[Notes] Update error:", err.message);
    res.status(500).json({ error: "Failed to update note" });
  }
});

/* ─────────────────────────────────────────────────────────────
   DELETE /notes/delete/:id  — delete a note
───────────────────────────────────────────────────────────── */
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM project_notes WHERE note_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ message: "Note deleted successfully", note: result.rows[0] });
  } catch (err) {
    console.error("[Notes] Delete error:", err.message);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

module.exports = router;
