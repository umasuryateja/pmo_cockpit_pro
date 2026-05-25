const router = require("express").Router();
const pool = require("../db");

/* GET recordings for project */

router.get("/:projectId", async (req,res)=>{

  try{

    const { projectId } = req.params;

    const recordings = await pool.query(
      `SELECT * FROM call_recordings
       WHERE project_id=$1
       ORDER BY recording_date DESC`,
      [projectId]
    );

    res.json(recordings.rows);

  }catch(err){
    console.error(err.message);
  }

});


/* CREATE recording */

router.post("/create", async (req,res)=>{

  try{

    const {
      project_id,
      title,
      description,
      attendees,
      duration,
      recording_date
    } = req.body;

    const newRecording = await pool.query(

      `INSERT INTO call_recordings
       (project_id,title,description,attendees,duration,recording_date)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,

      [project_id,title,description,attendees,duration,recording_date]

    );

    res.json(newRecording.rows[0]);

  }catch(err){
    console.error(err.message);
  }

});

module.exports = router;