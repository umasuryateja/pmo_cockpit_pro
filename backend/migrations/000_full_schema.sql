--
-- PostgreSQL database dump
--

\restrict KKRa7TAFuucMfWoOPw8E2XxPw39qSYVNxKapkccTnKYcJfdUq0XOpAHkoPW7hDH

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activities (
    activity_id integer NOT NULL,
    deliverable_id integer,
    activity_name character varying(255) NOT NULL,
    type character varying(100),
    sprint character varying(100),
    assignee character varying(255),
    due_date date,
    priority character varying(50),
    status character varying(50) DEFAULT 'Not Started'::character varying,
    blocker text,
    blocker_owner character varying(255)
);


--
-- Name: activities_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activities_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activities_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activities_activity_id_seq OWNED BY public.activities.activity_id;


--
-- Name: call_recordings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.call_recordings (
    recording_id integer NOT NULL,
    project_id integer,
    title character varying(255) NOT NULL,
    description text,
    attendees text,
    duration character varying(50),
    recording_date date
);


--
-- Name: call_recordings_recording_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.call_recordings_recording_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: call_recordings_recording_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.call_recordings_recording_id_seq OWNED BY public.call_recordings.recording_id;


--
-- Name: deliverables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deliverables (
    deliverable_id integer NOT NULL,
    project_id integer,
    deliverable_name character varying(255) NOT NULL,
    complexity character varying(50),
    resource_group character varying(100)
);


--
-- Name: deliverables_deliverable_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.deliverables_deliverable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: deliverables_deliverable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.deliverables_deliverable_id_seq OWNED BY public.deliverables.deliverable_id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    document_id integer NOT NULL,
    project_id integer,
    file_name character varying(255) NOT NULL,
    file_type character varying(100),
    file_size bigint,
    uploaded_by character varying(255)
);


--
-- Name: documents_document_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documents_document_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documents_document_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documents_document_id_seq OWNED BY public.documents.document_id;


--
-- Name: project_bom_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_bom_items (
    bom_id integer NOT NULL,
    project_id integer,
    item_name character varying(150) NOT NULL,
    category character varying(120),
    quantity numeric DEFAULT 1,
    unit_cost numeric DEFAULT 0,
    notes text
);


--
-- Name: project_bom_items_bom_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_bom_items_bom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_bom_items_bom_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_bom_items_bom_id_seq OWNED BY public.project_bom_items.bom_id;


--
-- Name: project_health_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_health_scores (
    score_id integer NOT NULL,
    project_id integer,
    score numeric(5,2) DEFAULT 0 NOT NULL,
    rag_status character varying(20) DEFAULT 'Unknown'::character varying NOT NULL,
    milestone_score numeric(5,2) DEFAULT 0,
    risk_score numeric(5,2) DEFAULT 0,
    task_score numeric(5,2) DEFAULT 0,
    blocker_score numeric(5,2) DEFAULT 0,
    ai_summary text,
    ai_recommendations text,
    computed_at timestamp with time zone DEFAULT now()
);


--
-- Name: project_health_scores_score_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_health_scores_score_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_health_scores_score_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_health_scores_score_id_seq OWNED BY public.project_health_scores.score_id;


--
-- Name: project_milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_milestones (
    milestone_id integer NOT NULL,
    project_id integer,
    title character varying(255) NOT NULL,
    target_date date,
    status character varying(50) DEFAULT 'Planned'::character varying,
    owner character varying(150),
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: project_milestones_milestone_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_milestones_milestone_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_milestones_milestone_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_milestones_milestone_id_seq OWNED BY public.project_milestones.milestone_id;


--
-- Name: project_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_notes (
    note_id integer NOT NULL,
    project_id integer,
    title character varying(255) NOT NULL,
    content text,
    created_by character varying(150) DEFAULT 'Alex Johnson'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: project_notes_note_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_notes_note_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_notes_note_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_notes_note_id_seq OWNED BY public.project_notes.note_id;


--
-- Name: project_risks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_risks (
    risk_id integer NOT NULL,
    project_id integer,
    title character varying(255) NOT NULL,
    impact character varying(50),
    probability character varying(50),
    mitigation text,
    owner character varying(150),
    status character varying(50) DEFAULT 'Open'::character varying,
    risk_score numeric(4,1) DEFAULT NULL::numeric,
    ai_assessed boolean DEFAULT false,
    ai_recommendation text,
    risk_level character varying(20) DEFAULT NULL::character varying,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: project_risks_risk_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_risks_risk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_risks_risk_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_risks_risk_id_seq OWNED BY public.project_risks.risk_id;


--
-- Name: project_scope_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_scope_items (
    scope_id integer NOT NULL,
    project_id integer,
    item character varying(255) NOT NULL,
    complexity character varying(50),
    owner character varying(150),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: project_scope_items_scope_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_scope_items_scope_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_scope_items_scope_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_scope_items_scope_id_seq OWNED BY public.project_scope_items.scope_id;


--
-- Name: project_stakeholders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_stakeholders (
    stakeholder_id integer NOT NULL,
    project_id integer,
    name character varying(150) NOT NULL,
    role character varying(120),
    influence character varying(50),
    contact_email character varying(150),
    organization character varying(150),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: project_stakeholders_stakeholder_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_stakeholders_stakeholder_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_stakeholders_stakeholder_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_stakeholders_stakeholder_id_seq OWNED BY public.project_stakeholders.stakeholder_id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    project_id integer NOT NULL,
    project_code character varying(100) NOT NULL,
    project_name character varying(255) NOT NULL,
    client_name character varying(255),
    project_manager character varying(255),
    industry character varying(255),
    priority_level character varying(50),
    planned_start date,
    status character varying(50) DEFAULT 'Active'::character varying,
    end_date date,
    budget_total numeric(12,2) DEFAULT 0
);


--
-- Name: projects_project_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: projects_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.projects_project_id_seq OWNED BY public.projects.project_id;


--
-- Name: activities activity_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities ALTER COLUMN activity_id SET DEFAULT nextval('public.activities_activity_id_seq'::regclass);


--
-- Name: call_recordings recording_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.call_recordings ALTER COLUMN recording_id SET DEFAULT nextval('public.call_recordings_recording_id_seq'::regclass);


--
-- Name: deliverables deliverable_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliverables ALTER COLUMN deliverable_id SET DEFAULT nextval('public.deliverables_deliverable_id_seq'::regclass);


--
-- Name: documents document_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents ALTER COLUMN document_id SET DEFAULT nextval('public.documents_document_id_seq'::regclass);


--
-- Name: project_bom_items bom_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_bom_items ALTER COLUMN bom_id SET DEFAULT nextval('public.project_bom_items_bom_id_seq'::regclass);


--
-- Name: project_health_scores score_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_health_scores ALTER COLUMN score_id SET DEFAULT nextval('public.project_health_scores_score_id_seq'::regclass);


--
-- Name: project_milestones milestone_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_milestones ALTER COLUMN milestone_id SET DEFAULT nextval('public.project_milestones_milestone_id_seq'::regclass);


--
-- Name: project_notes note_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_notes ALTER COLUMN note_id SET DEFAULT nextval('public.project_notes_note_id_seq'::regclass);


--
-- Name: project_risks risk_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_risks ALTER COLUMN risk_id SET DEFAULT nextval('public.project_risks_risk_id_seq'::regclass);


--
-- Name: project_scope_items scope_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_scope_items ALTER COLUMN scope_id SET DEFAULT nextval('public.project_scope_items_scope_id_seq'::regclass);


--
-- Name: project_stakeholders stakeholder_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_stakeholders ALTER COLUMN stakeholder_id SET DEFAULT nextval('public.project_stakeholders_stakeholder_id_seq'::regclass);


--
-- Name: projects project_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects ALTER COLUMN project_id SET DEFAULT nextval('public.projects_project_id_seq'::regclass);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (activity_id);


--
-- Name: call_recordings call_recordings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.call_recordings
    ADD CONSTRAINT call_recordings_pkey PRIMARY KEY (recording_id);


--
-- Name: deliverables deliverables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliverables
    ADD CONSTRAINT deliverables_pkey PRIMARY KEY (deliverable_id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (document_id);


--
-- Name: project_bom_items project_bom_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_bom_items
    ADD CONSTRAINT project_bom_items_pkey PRIMARY KEY (bom_id);


--
-- Name: project_health_scores project_health_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_health_scores
    ADD CONSTRAINT project_health_scores_pkey PRIMARY KEY (score_id);


--
-- Name: project_milestones project_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_milestones
    ADD CONSTRAINT project_milestones_pkey PRIMARY KEY (milestone_id);


--
-- Name: project_notes project_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_notes
    ADD CONSTRAINT project_notes_pkey PRIMARY KEY (note_id);


--
-- Name: project_risks project_risks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_risks
    ADD CONSTRAINT project_risks_pkey PRIMARY KEY (risk_id);


--
-- Name: project_scope_items project_scope_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_scope_items
    ADD CONSTRAINT project_scope_items_pkey PRIMARY KEY (scope_id);


--
-- Name: project_stakeholders project_stakeholders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_stakeholders
    ADD CONSTRAINT project_stakeholders_pkey PRIMARY KEY (stakeholder_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);


--
-- Name: projects projects_project_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_project_code_key UNIQUE (project_code);


--
-- Name: idx_activities_deliverable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activities_deliverable ON public.activities USING btree (deliverable_id);


--
-- Name: idx_activities_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activities_due_date ON public.activities USING btree (due_date);


--
-- Name: idx_activities_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activities_status ON public.activities USING btree (status);


--
-- Name: idx_bom_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bom_project ON public.project_bom_items USING btree (project_id);


--
-- Name: idx_deliverables_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deliverables_project ON public.deliverables USING btree (project_id);


--
-- Name: idx_health_score_project; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_health_score_project ON public.project_health_scores USING btree (project_id);


--
-- Name: idx_milestones_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_milestones_project ON public.project_milestones USING btree (project_id);


--
-- Name: idx_notes_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notes_project ON public.project_notes USING btree (project_id);


--
-- Name: idx_project_notes_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_notes_project ON public.project_notes USING btree (project_id);


--
-- Name: idx_risks_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_risks_project ON public.project_risks USING btree (project_id);


--
-- Name: idx_scope_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scope_project ON public.project_scope_items USING btree (project_id);


--
-- Name: idx_stakeholders_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stakeholders_project ON public.project_stakeholders USING btree (project_id);


--
-- Name: activities activities_deliverable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_deliverable_id_fkey FOREIGN KEY (deliverable_id) REFERENCES public.deliverables(deliverable_id) ON DELETE CASCADE;


--
-- Name: call_recordings call_recordings_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.call_recordings
    ADD CONSTRAINT call_recordings_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: deliverables deliverables_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliverables
    ADD CONSTRAINT deliverables_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: documents documents_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: project_bom_items project_bom_items_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_bom_items
    ADD CONSTRAINT project_bom_items_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: project_health_scores project_health_scores_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_health_scores
    ADD CONSTRAINT project_health_scores_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: project_milestones project_milestones_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_milestones
    ADD CONSTRAINT project_milestones_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: project_notes project_notes_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_notes
    ADD CONSTRAINT project_notes_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: project_risks project_risks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_risks
    ADD CONSTRAINT project_risks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: project_scope_items project_scope_items_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_scope_items
    ADD CONSTRAINT project_scope_items_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: project_stakeholders project_stakeholders_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_stakeholders
    ADD CONSTRAINT project_stakeholders_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict KKRa7TAFuucMfWoOPw8E2XxPw39qSYVNxKapkccTnKYcJfdUq0XOpAHkoPW7hDH

