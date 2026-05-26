const express = require("express");
const cors    = require("cors");
const fs      = require("fs");
const path    = require("path");

console.log("Backend server file loaded");

// Render ephemeral disk: ensure upload directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
const normalizeOrigin = (url) => (url ? String(url).trim().replace(/\/$/, "") : null);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  normalizeOrigin(process.env.FRONTEND_URL),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      // Allow Vercel production + preview deployments
      if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return callback(null, true);
      if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }
      console.warn("[CORS] Blocked origin:", origin);
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

const { verifyDatabaseConnection } = require("./db");
app.get("/health/ready", async (req, res) => {
  try {
    const dbOk = await verifyDatabaseConnection();
    res.json({
      status: dbOk ? "ok" : "degraded",
      database: dbOk ? "connected" : "unreachable",
      environment: process.env.NODE_ENV || "development",
    });
  } catch (err) {
    console.error("[Health] DB check failed:", err.message);
    res.status(503).json({
      status: "error",
      database: "unreachable",
      error: err.message,
    });
  }
});

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
const PORT = parseInt(process.env.PORT || "5001", 10);
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`CORS FRONTEND_URL: ${process.env.FRONTEND_URL || "(not set — *.vercel.app still allowed)"}`);
  console.log("AI feature routes: /notes, /health, /kickoff, /reports");
  console.log("Risk AI scoring: POST /risks/ai-score/:riskId");
  try {
    const dbOk = await verifyDatabaseConnection();
    console.log(dbOk ? "[DB] Connected to PostgreSQL" : "[DB] Connection check returned unexpected result");
  } catch (err) {
    console.error("[DB] Startup connection failed:", err.message);
    if (process.env.NODE_ENV === "production") {
      console.error("[DB] Fix DATABASE_URL on Render (Supabase URI, SSL enabled).");
    }
  }
});
