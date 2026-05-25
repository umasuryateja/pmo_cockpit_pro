-- ============================================================
-- PM Cockpit AI Features Migration
-- Migration: 001_add_ai_features.sql
-- Safe to re-run (uses IF NOT EXISTS / IF EXISTS guards)
-- ============================================================

/* ─────────────────────────────────────────────────────────────
   1. ALTER projects — add missing columns (safe)
───────────────────────────────────────────────────────────── */
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget_total NUMERIC(12,2) DEFAULT 0;

/* ─────────────────────────────────────────────────────────────
   2. ALTER project_risks — AI scoring columns (safe)
───────────────────────────────────────────────────────────── */
ALTER TABLE project_risks ADD COLUMN IF NOT EXISTS risk_score    NUMERIC(4,1) DEFAULT NULL;
ALTER TABLE project_risks ADD COLUMN IF NOT EXISTS ai_assessed   BOOLEAN      DEFAULT FALSE;
ALTER TABLE project_risks ADD COLUMN IF NOT EXISTS ai_recommendation TEXT      DEFAULT NULL;
ALTER TABLE project_risks ADD COLUMN IF NOT EXISTS risk_level    VARCHAR(20)  DEFAULT NULL;

/* ─────────────────────────────────────────────────────────────
   3. CREATE project_health_scores (Feature 1)
───────────────────────────────────────────────────────────── */
CREATE TABLE IF NOT EXISTS project_health_scores (
  score_id           SERIAL PRIMARY KEY,
  project_id         INT REFERENCES projects(project_id) ON DELETE CASCADE,
  score              NUMERIC(5,2)  NOT NULL DEFAULT 0,
  rag_status         VARCHAR(20)   NOT NULL DEFAULT 'Unknown',
  milestone_score    NUMERIC(5,2)  DEFAULT 0,
  risk_score         NUMERIC(5,2)  DEFAULT 0,
  task_score         NUMERIC(5,2)  DEFAULT 0,
  blocker_score      NUMERIC(5,2)  DEFAULT 0,
  ai_summary         TEXT,
  ai_recommendations TEXT,
  computed_at        TIMESTAMPTZ   DEFAULT NOW()
);

-- Only one score row per project (latest always replaces)
CREATE UNIQUE INDEX IF NOT EXISTS idx_health_score_project
  ON project_health_scores (project_id);

/* ─────────────────────────────────────────────────────────────
   4. CREATE project_notes (Feature 2)
───────────────────────────────────────────────────────────── */
CREATE TABLE IF NOT EXISTS project_notes (
  note_id     SERIAL PRIMARY KEY,
  project_id  INT REFERENCES projects(project_id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  content     TEXT,
  created_by  VARCHAR(150) DEFAULT 'Alex Johnson',
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_notes_project
  ON project_notes (project_id);

/* ─────────────────────────────────────────────────────────────
   5. ADD created_at timestamps to existing tables (analytics)
───────────────────────────────────────────────────────────── */
ALTER TABLE project_risks       ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE project_milestones  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE project_stakeholders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE project_scope_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

/* ─────────────────────────────────────────────────────────────
   6. ADD performance indexes on foreign keys
───────────────────────────────────────────────────────────── */
CREATE INDEX IF NOT EXISTS idx_deliverables_project   ON deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_deliverable ON activities(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_activities_status      ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_due_date    ON activities(due_date);
CREATE INDEX IF NOT EXISTS idx_risks_project          ON project_risks(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project     ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_stakeholders_project   ON project_stakeholders(project_id);
CREATE INDEX IF NOT EXISTS idx_bom_project            ON project_bom_items(project_id);
CREATE INDEX IF NOT EXISTS idx_scope_project          ON project_scope_items(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_project          ON project_notes(project_id);

-- ============================================================
-- Migration complete
-- ============================================================
