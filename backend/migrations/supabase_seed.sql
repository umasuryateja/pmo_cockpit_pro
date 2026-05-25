-- ============================================================
-- PM COCKPIT PRO — SUPABASE SEED DATA
-- Run this SECOND (after supabase_schema.sql)
-- Imports your 4 existing projects and all related data
-- ============================================================

-- Projects
INSERT INTO public.projects (project_id, project_code, project_name, client_name, project_manager, industry, priority_level, planned_start, status, end_date, budget_total)
VALUES
  (1, 'PRJ-001', 'Cloud Infrastructure Migration', 'Acme Corp', 'Alex Johnson', 'Enterprise Tech', 'High', '2026-06-01', 'Active', NULL, 0.00),
  (2, 'PRJ-002', 'Health-App Frontend Redesign', 'MedLife', 'Alex Johnson', 'Healthcare', 'Standard', '2026-06-15', 'Active', NULL, 0.00),
  (3, 'PRJ-003', 'Fintech Payment Gateway', 'Apex Bank', 'Jane Smith', 'Finance', 'High', '2026-07-01', 'Active', NULL, 0.00),
  (7, 'PRJ-1779450089750', 'Cloud Security Management', 'Client Corporation', 'Alex Johnson', 'Healthcare', 'High', '2026-05-22', 'Active', NULL, 0.00)
ON CONFLICT (project_code) DO NOTHING;

-- Reset sequences to avoid ID conflicts
SELECT setval('public.projects_project_id_seq', 10, true);

-- Deliverables
INSERT INTO public.deliverables (deliverable_id, project_id, deliverable_name, complexity, resource_group)
VALUES
  (1, 1, 'AWS VPC Setup', 'Medium', 'Cloud DevOps'),
  (2, 1, 'Database Replication', 'High', 'Database Architects'),
  (3, 2, 'React UI Overhaul', 'High', 'Frontend Team')
ON CONFLICT DO NOTHING;
SELECT setval('public.deliverables_deliverable_id_seq', 10, true);

-- Activities
INSERT INTO public.activities (activity_id, deliverable_id, activity_name, type, sprint, assignee, due_date, priority, status, blocker, blocker_owner)
VALUES
  (1, 1, 'Design VPC Architecture', 'Engineering', 'Sprint 1', 'Alex Johnson', '2026-06-05', 'High', 'In Progress', NULL, NULL),
  (2, 1, 'Configure Route Tables & Subnets', 'Configuration', 'Sprint 1', 'John Doe', '2026-06-10', 'Medium', 'Not Started', NULL, NULL),
  (3, 2, 'Setup PostgreSQL replication slots', 'Database', 'Sprint 2', 'Jane Smith', '2026-06-20', 'High', 'Not Started', NULL, NULL)
ON CONFLICT DO NOTHING;
SELECT setval('public.activities_activity_id_seq', 10, true);

-- Milestones
INSERT INTO public.project_milestones (milestone_id, project_id, title, target_date, status, owner, notes)
VALUES
  (1, 1, 'Architecture Blueprints Approved', '2026-06-10', 'Completed', 'Alex Johnson', 'Signed off by enterprise architect.'),
  (2, 1, 'VPC Infrastructure Setup Complete', '2026-06-25', 'Planned', 'John Doe', 'Pending hardware allocations.'),
  (3, 2, 'UI Mockups Confirmed', '2026-06-20', 'Planned', 'Alex Johnson', 'Client review scheduled.')
ON CONFLICT DO NOTHING;
SELECT setval('public.project_milestones_milestone_id_seq', 10, true);

-- Risks
INSERT INTO public.project_risks (risk_id, project_id, title, impact, probability, mitigation, owner, status, risk_score, ai_assessed, ai_recommendation, risk_level)
VALUES
  (1, 1, 'AWS Regional Downtime or Outage', 'High', 'Low', 'Deploy across multiple availability zones.', 'Alex Johnson', 'Open', 3.0, true, 'Risk "AWS Regional Downtime or Outage" scored MEDIUM (RS-3). Validate mitigation effectiveness and assign a tracking owner.', 'MEDIUM'),
  (2, 1, 'Resource bandwidth constraint', 'Medium', 'Medium', 'Contract external consulting agency.', 'Jane Smith', 'Open', 4.0, true, 'Risk "Resource bandwidth constraint" scored MEDIUM (RS-4). Validate mitigation effectiveness and assign a tracking owner.', 'MEDIUM'),
  (3, 2, 'API compatibility lag', 'High', 'Low', 'Continuous integration and staging mock checks.', 'Alex Johnson', 'Open', 3.0, true, 'Risk "API compatibility lag" scored MEDIUM (RS-3). Validate mitigation effectiveness and assign a tracking owner.', 'MEDIUM')
ON CONFLICT DO NOTHING;
SELECT setval('public.project_risks_risk_id_seq', 10, true);

-- Stakeholders
INSERT INTO public.project_stakeholders (stakeholder_id, project_id, name, role, influence, contact_email, organization)
VALUES
  (1, 1, 'Alex Johnson', 'Project Manager', 'High', 'alex.j@company.com', 'Internal PMO'),
  (2, 1, 'Sarah Jenkins', 'Acme Sponsor', 'High', 'sarah.j@acme.com', 'Acme Corp'),
  (3, 2, 'Dr. Robert Carter', 'Medical Advisor', 'Medium', 'robert.c@medlife.com', 'MedLife')
ON CONFLICT DO NOTHING;
SELECT setval('public.project_stakeholders_stakeholder_id_seq', 10, true);

-- Scope Items
INSERT INTO public.project_scope_items (scope_id, project_id, item, complexity, owner)
VALUES
  (1, 1, 'AWS Cloud Migration Architecture Design', 'High', 'Design Engineering'),
  (2, 1, 'Secure Multi-Region VPC deployment', 'Medium', 'Dev Ops'),
  (3, 2, 'Vibrant Theme and Responsive Layout Redesign', 'High', 'Design Engineering'),
  (4, 2, 'RESTful Backend API Integration', 'Medium', 'Backend Team')
ON CONFLICT DO NOTHING;
SELECT setval('public.project_scope_items_scope_id_seq', 10, true);

-- BOM Items
INSERT INTO public.project_bom_items (bom_id, project_id, item_name, category, quantity, unit_cost, notes)
VALUES
  (1, 1, 'AWS EC2 Instances (m6g.xlarge)', 'Infrastructure', 10, 150.00, 'Estimated monthly cost.'),
  (2, 1, 'AWS RDS Aurora cluster', 'Infrastructure', 2, 400.00, 'Production cluster.'),
  (3, 2, 'Vite Pro Premium License', 'Software', 5, 29.00, 'Front-end development toolkit.')
ON CONFLICT DO NOTHING;
SELECT setval('public.project_bom_items_bom_id_seq', 10, true);

-- Call Recordings
INSERT INTO public.call_recordings (recording_id, project_id, title, description, attendees, duration, recording_date)
VALUES
  (1, 1, 'Kickoff Meeting', 'Initial alignment on cloud migration path and requirements.', 'Alex, Jane, Acme Team', '45 mins', '2026-05-22')
ON CONFLICT DO NOTHING;
SELECT setval('public.call_recordings_recording_id_seq', 10, true);

-- Health Scores
INSERT INTO public.project_health_scores (project_id, score, rag_status, milestone_score, risk_score, task_score, blocker_score, ai_summary, ai_recommendations)
VALUES
  (1, 57.00, 'At Risk', 15.00, 22.00, 0.00, 20.00, 'Cloud Infrastructure Migration is currently At Risk (57/100). 1 high-severity risk requires escalation.', 'Escalate high-severity risk to steering committee within 24 hours.'),
  (2, 67.00, 'At Risk', 0.00, 22.00, 25.00, 20.00, 'Health-App Frontend Redesign is At Risk (67/100). Monitor open risks closely.', 'Review open risks and update mitigation plans.'),
  (3, 100.00, 'On Track', 30.00, 25.00, 25.00, 20.00, 'Fintech Payment Gateway is On Track (100/100).', 'Maintain current velocity.'),
  (7, 100.00, 'On Track', 30.00, 25.00, 25.00, 20.00, 'Cloud Security Management is On Track (100/100).', 'Maintain current velocity.')
ON CONFLICT (project_id) DO UPDATE SET
  score = EXCLUDED.score,
  rag_status = EXCLUDED.rag_status;

-- ============================================================
-- SEED DATA COMPLETE
-- ============================================================
