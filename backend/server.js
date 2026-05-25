const express = require("express");
const cors    = require("cors");

console.log("Backend server file loaded");

const projectRoutes     = require("./routes/projects");
const deliverableRoutes = require("./routes/deliverables");
const activityRoutes    = require("./routes/activities");
const callRoutes        = require("./routes/call_recordings");
const documentRoutes    = require("./routes/documents");

// AI Feature Routes
const notesRoutes   = require("./routes/notes");
const healthRoutes  = require("./routes/health");
const kickoffRoutes = require("./routes/kickoff");
const reportsRoutes = require("./routes/reports");

const app = express();

// ─────────────────────────────────────────────────────────────
// CORS — allow specific frontend origins in production
// ─────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  // Add your Vercel frontend URL here after deployment:
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In development allow everything
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK — required by Render to detect app is live
// ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "ok", service: "PM Cockpit API" }));
app.get("/test", (req, res) => res.json({ status: "Server working" }));

// CORE ROUTES
app.use("/projects",     projectRoutes);
app.use("/deliverables", deliverableRoutes);
app.use("/activities",   activityRoutes);
app.use("/documents",    documentRoutes);
app.use("/calls",        callRoutes);

// AI FEATURE ROUTES
app.use("/notes",   notesRoutes);
app.use("/health",  healthRoutes);
app.use("/kickoff", kickoffRoutes);
app.use("/reports", reportsRoutes);

// Risk AI scoring — save AI result back to DB
// POST /risks/ai-score/:riskId  body: { risk_score, risk_level, ai_recommendation }
const pool = require("./db");
app.post("/risks/ai-score/:riskId", async (req, res) => {
  try {
    const { riskId } = req.params;
    const { risk_score, risk_level, ai_recommendation } = req.body;

    const result = await pool.query(
      `UPDATE project_risks
       SET risk_score = $1, risk_level = $2, ai_recommendation = $3, ai_assessed = TRUE
       WHERE risk_id = $4
       RETURNING *`,
      [risk_score, risk_level, ai_recommendation || "", riskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Risk not found" });
    }

    res.json({ message: "Risk AI score saved", risk: result.rows[0] });
  } catch (err) {
    console.error("[Risks] AI score save error:", err.message);
    res.status(500).json({ error: "Failed to save risk AI score" });
  }
});

// ─────────────────────────────────────────────────────────────
// Start server — use PORT env var (required by Render/Railway)
// ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "5001");
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("AI feature routes: /notes, /health, /kickoff, /reports");
  console.log("Risk AI scoring: POST /risks/ai-score/:riskId");
});
