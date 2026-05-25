const router = require("express").Router();
const pool = require("../db");
const path = require("path");
const multer = require("multer");

/* STORAGE CONFIG */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

/* GET DOCUMENTS */

router.get("/:projectId", async (req, res) => {

  try {

    const docs = await pool.query(
      "SELECT * FROM documents WHERE project_id=$1",
      [req.params.projectId]
    );

    res.json(docs.rows);

  } catch (err) {

    console.error(err);
    res.status(500).send("Fetch documents error");

  }

});


/* DOWNLOAD DOCUMENT */

router.get("/download/:file", (req, res) => {

  const file = req.params.file;

  const filePath = path.join(__dirname, "../uploads", file);

  res.download(filePath);

});


/* UPLOAD DOCUMENT */

router.post("/upload", upload.single("file"), async (req, res) => {

  try {

    const { project_id } = req.body;

    const file = req.file;

    const doc = await pool.query(
      `INSERT INTO documents
      (project_id,file_name,file_type,file_size,uploaded_by)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
      [
        project_id,
        file.originalname,
        file.mimetype,
        file.size,
        "Alex Johnson"
      ]
    );

    res.json(doc.rows[0]);

  } catch (err) {

    console.error(err);
    res.status(500).send("Upload error");

  }

});

module.exports = router;