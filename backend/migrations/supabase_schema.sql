-- ============================================================
-- PM COCKPIT PRO — SUPABASE PRODUCTION SCHEMA
-- Run this FIRST in Supabase SQL Editor
-- Safe to run on a fresh database
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.projects (
    project_id   SERIAL PRIMARY KEY,
    project_code VARCHAR(100) NOT NULL UNIQUE,
    project_name VARCHAR(255) NOT NULL,
    client_name  VARCHAR(255),
    project_manager VARCHAR(255),
    industry     VARCHAR(255),
    priority_level VARCHAR(50),
    planned_start  DATE,
    status       VARCHAR(50) DEFAULT 'Active',
    end_date     DATE,
    budget_total NUMERIC(12,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.deliverables (
    deliverable_id   SERIAL PRIMARY KEY,
    project_id       INT REFERENCES public.projects(project_id) ON DELETE CASCADE,
    deliverable_name VARCHAR(255) NOT NULL,
    complexity       VARCHAR(50),
    resource_group   VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS public.activities (
    activity_id    SERIAL PRIMARY KEY,
    deliverable_id INT REFERENCES public.deliverables(deliverable_id) ON DELETE CASCADE,
    activity_name  VARCHAR(255) NOT NULL,
    type           VARCHAR(100),
    sprint         VARCHAR(100),
    assignee       VARCHAR(255),
    due_date       DATE,
    priority       VARCHAR(50),
    status         VARCHAR(50) DEFAULT 'Not Started',
    blocker        TEXT,
    blocker_owner  VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS public.documents (
    document_id  SERIAL PRIMARY KEY,
    project_id   INT REFERENCES public.projects(project_id) ON DELETE CASCADE,
    file_name    VARCHAR(255) NOT NULL,
    file_type    VARCHAR(100),
    file_size    BIGINT,
    uploaded_by  VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS public.call_recordings (
    recording_id   SERIAL PRIMARY KEY,
    project_id     INT REFERENCES public.projects(project_id) ON DELETE CASCADE,
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    attendees      TEXT,
    duration       VARCHAR(50),
    recording_date DATE
);

CREATE TABLE IF NOT EXISTS public.project_scope_items (
    scope_id   SERIAL PRIMARY KEY,
    project_id INT REFERENCES public.projects(project_id) ON DELETE CASCADE,
    item       VARCHAR(255) NOT NULL,
    complexity VARCHAR(50),
    owner      VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_milestones (
    milestone_id SERIAL PRIMARY KEY,
    project_id   INT REFERENCES public.projects(project_id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    target_date  DATE,
    status       VARCHAR(50) DEFAULT 'Planned',
    owner        VARCHAR(150),
    notes        TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_risks (
    risk_id          SERIAL PRIMARY KEY,
    project_id       INT REFERENCES public.projects(project_id) ON DELETE CASCADE,
    title            VARCHAR(255) NOT NULL,
    impact           VARCHAR(50),
    probability      VARCHAR(50),
    mitigation       TEXT,
    owner            VARCHAR(150),
    status           VARCHAR(50) DEFAULT 'Open',
    risk_score       NUMERIC(4,1) DEFAULT NULL,
    ai_assessed      BOOLEAN DEFAULT FALSE,
    ai_recommendation TEXT DEFAULT NULL,
    risk_level       VARCHAR(20) DEFAULT NULL,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_stakeholders (
    stakeholder_id SERIAL PRIMARY KEY,
    project_id     INT REFERENCES public.projects(project_id) ON DELETE CASCADE,
    name           VARCHAR(150) NOT NULL,
    role           VARCHAR(120),
    influence      VARCHAR(50),
    contact_email  VARCHAR(150),
    organization   VARCHAR(150),
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_bom_items (
    bom_id     SERIAL PRIMARY KEY,
    project_id INT REFERENCES public.projects(project_id) ON DELETE CASCADE,
    item_name  VARCHAR(150) NOT NULL,
    category   VARCHAR(120),
    quantity   NUMERIC DEFAULT 1,
    unit_cost  NUMERIC DEFAULT 0,
    notes      TEXT
);

CREATE TABLE IF NOT EXISTS public.project_health_scores (
    score_id        SERIAL PRIMARY KEY,
    project_id      INT REFERENCES public.projects(project_id) ON DELETE CASCADE,
    score           NUMERIC(5,2) NOT NULL DEFAULT 0,
    rag_status      VARCHAR(20)  NOT NULL DEFAULT 'Unknown',
    milestone_score NUMERIC(5,2) DEFAULT 0,
    risk_score      NUMERIC(5,2) DEFAULT 0,
    task_score      NUMERIC(5,2) DEFAULT 0,
    blocker_score   NUMERIC(5,2) DEFAULT 0,
    ai_summary      TEXT,
    ai_recommendations TEXT,
    computed_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_notes (
    note_id    SERIAL PRIMARY KEY,
    project_id INT REFERENCES public.projects(project_id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    content    TEXT,
    created_by VARCHAR(150) DEFAULT 'Alex Johnson',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UNIQUE CONSTRAINTS
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_health_score_project
    ON public.project_health_scores (project_id);

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_deliverables_project    ON public.deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_deliverable  ON public.activities(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_activities_status       ON public.activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_due_date     ON public.activities(due_date);
CREATE INDEX IF NOT EXISTS idx_risks_project           ON public.project_risks(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project      ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_stakeholders_project    ON public.project_stakeholders(project_id);
CREATE INDEX IF NOT EXISTS idx_bom_project             ON public.project_bom_items(project_id);
CREATE INDEX IF NOT EXISTS idx_scope_project           ON public.project_scope_items(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_project           ON public.project_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_call_recordings_project ON public.call_recordings(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_project       ON public.documents(project_id);

-- ============================================================
-- SCHEMA COMPLETE
-- ============================================================
