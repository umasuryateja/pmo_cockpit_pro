const router = require("express").Router();
const pool = require("../db");

/* ---------------- CREATE SINGLE ACTIVITY ---------------- */

router.post("/create", async (req, res) => {
  try {
    const {
      deliverable_id,
      activity_name,
      type,
      sprint,
      assignee,
      due_date,
      priority
    } = req.body;

    const activity = await pool.query(
      `INSERT INTO activities
      (deliverable_id, activity_name, type, sprint, assignee, due_date, priority)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [deliverable_id, activity_name, type, sprint, assignee, due_date, priority]
    );

    res.json(activity.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Create activity error");
  }
});


/* ---------------- GET ACTIVITIES BY DELIVERABLE ---------------- */

router.get("/:deliverable_id", async (req, res) => {
  try {
    const activities = await pool.query(
      "SELECT * FROM activities WHERE deliverable_id=$1",
      [req.params.deliverable_id]
    );

    res.json(activities.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Fetch activities error");
  }
});


/* ---------------- UPDATE STATUS ---------------- */

router.put("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const update = await pool.query(
      "UPDATE activities SET status=$1 WHERE activity_id=$2 RETURNING *",
      [status, req.params.id]
    );

    res.json(update.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Update status error");
  }
});


/* ---------------- BULK SAVE TASKS ---------------- */

router.post("/bulk-save", async (req, res) => {
  try {
    const { deliverableId, tasks } = req.body;

    const results = [];

    for (const task of tasks) {

      if (task.id && !isNaN(task.id)) {

        // UPDATE existing
        const update = await pool.query(
          `UPDATE activities
           SET activity_name=$1,
               type=$2,
               sprint=$3,
               assignee=$4,
               due_date=$5,
               priority=$6,
               status=$7,
               blocker=$8,
               blocker_owner=$9
           WHERE activity_id=$10
           RETURNING *`,
          [
            task.activity,
            task.taskType,
            task.sprint,
            task.assignee,
            task.dueDate,
            task.priority,
            task.status,
            task.blocker,
            task.blockerOwner,
            task.id
          ]
        );

        results.push(update.rows[0]);

      } else {

        // INSERT new
        const insert = await pool.query(
          `INSERT INTO activities
          (deliverable_id,activity_name,type,sprint,assignee,due_date,priority,status,blocker,blocker_owner)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
          RETURNING *`,
          [
            deliverableId,
            task.activity,
            task.taskType,
            task.sprint,
            task.assignee,
            task.dueDate,
            task.priority,
            task.status,
            task.blocker,
            task.blockerOwner
          ]
        );

        results.push(insert.rows[0]);
      }

    }

    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).send("Bulk save error");
  }
});


module.exports = router;