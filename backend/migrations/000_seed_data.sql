--
-- PostgreSQL database dump
--

\restrict XIXS7d3XFlDSUsayaQmkif18WNaqPEOuO0u6XpA3w7BxqGJjckwf2Uqiso2SLVa

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

--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.projects VALUES (2, 'PRJ-002', 'Health-App Frontend Redesign', 'MedLife', 'Alex Johnson', 'Healthcare', 'Standard', '2026-06-15', 'Active', NULL, 0.00);
INSERT INTO public.projects VALUES (3, 'PRJ-003', 'Fintech Payment Gateway', 'Apex Bank', 'Jane Smith', 'Finance', 'High', '2026-07-01', 'Active', NULL, 0.00);
INSERT INTO public.projects VALUES (1, 'PRJ-001', 'Cloud Infrastructure Migration', 'Acme Corp', 'Alex Johnson', 'Enterprise Tech', 'High', '2026-06-01', 'Active', NULL, 0.00);
INSERT INTO public.projects VALUES (7, 'PRJ-1779450089750', 'Cloud Security Management ', 'Client Corporation', 'Alex Johnson', 'Healthcare', 'High', '2026-05-22', 'Active', NULL, 0.00);


--
-- Data for Name: deliverables; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.deliverables VALUES (1, 1, 'AWS VPC Setup', 'Medium', 'Cloud DevOps');
INSERT INTO public.deliverables VALUES (2, 1, 'Database Replication', 'High', 'Database Architects');
INSERT INTO public.deliverables VALUES (3, 2, 'React UI Overhaul', 'High', 'Frontend Team');


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.activities VALUES (1, 1, 'Design VPC Architecture', 'Engineering', 'Sprint 1', 'Alex Johnson', '2026-06-05', 'High', 'In Progress', NULL, NULL);
INSERT INTO public.activities VALUES (2, 1, 'Configure Route Tables & Subnets', 'Configuration', 'Sprint 1', 'John Doe', '2026-06-10', 'Medium', 'Not Started', NULL, NULL);
INSERT INTO public.activities VALUES (3, 2, 'Setup PostgreSQL replication slots', 'Database', 'Sprint 2', 'Jane Smith', '2026-06-20', 'High', 'Not Started', NULL, NULL);


--
-- Data for Name: call_recordings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.call_recordings VALUES (1, 1, 'Kickoff Meeting', 'Initial alignment on cloud migration path and requirements.', 'Alex, Jane, Acme Team', '45 mins', '2026-05-22');


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.documents VALUES (1, 1, 'architecture_specs.pdf', 'application/pdf', 1048576, 'Alex Johnson');


--
-- Data for Name: project_bom_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.project_bom_items VALUES (1, 1, 'AWS EC2 Instances (m6g.xlarge)', 'Infrastructure', 10, 150.00, 'Estimated monthly cost.');
INSERT INTO public.project_bom_items VALUES (2, 1, 'AWS RDS Aurora cluster', 'Infrastructure', 2, 400.00, 'Production cluster.');
INSERT INTO public.project_bom_items VALUES (3, 2, 'Vite Pro Premium License', 'Software', 5, 29.00, 'Front-end development toolkit.');


--
-- Data for Name: project_health_scores; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.project_health_scores VALUES (2, 1, 57.00, 'At Risk', 15.00, 22.00, 0.00, 20.00, 'Cloud Infrastructure Migration is currently scored at 57/100 (At Risk). 1 high-severity risk requires escalation per governance policy. Task completion is at 0% (0/3 tasks).', 'Escalate 1 high-severity risk to the steering committee within 24 hours per risk governance policy.', '2026-05-25 13:37:30.262059+05:30');
INSERT INTO public.project_health_scores VALUES (9, 2, 67.00, 'At Risk', 0.00, 22.00, 25.00, 20.00, 'Health-App Frontend Redesign is currently scored at 67/100 (At Risk). 1 high-severity risk requires escalation per governance policy. Task completion is at 0% (0/0 tasks).', 'Escalate 1 high-severity risk to the steering committee within 24 hours per risk governance policy.', '2026-05-25 13:37:42.662527+05:30');
INSERT INTO public.project_health_scores VALUES (1, 7, 100.00, 'On Track', 30.00, 25.00, 25.00, 20.00, 'Cloud Security Management  is currently scored at 100/100 (On Track). Task completion stands at 0% with 0% milestone progress — broadly on track. Task completion is at 0% (0/0 tasks).', 'Maintain current velocity — project health is acceptable at 100/100. | Continue weekly milestone reviews to sustain 0% completion rate.', '2026-05-25 13:37:47.371882+05:30');
INSERT INTO public.project_health_scores VALUES (5, 3, 100.00, 'On Track', 30.00, 25.00, 25.00, 20.00, 'Fintech Payment Gateway is currently scored at 100/100 (On Track). Task completion stands at 0% with 0% milestone progress — broadly on track. Task completion is at 0% (0/0 tasks).', 'Maintain current velocity — project health is acceptable at 100/100. | Continue weekly milestone reviews to sustain 0% completion rate.', '2026-05-25 09:40:18.388264+05:30');


--
-- Data for Name: project_milestones; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.project_milestones VALUES (1, 1, 'Architecture Blueprints Approved', '2026-06-10', 'Completed', 'Alex Johnson', 'Signed off by enterprise architect.', '2026-05-25 09:18:46.655712+05:30');
INSERT INTO public.project_milestones VALUES (2, 1, 'VPC Infrastructure Setup Complete', '2026-06-25', 'Planned', 'John Doe', 'Pending hardware allocations.', '2026-05-25 09:18:46.655712+05:30');
INSERT INTO public.project_milestones VALUES (3, 2, 'UI Mockups Confirmed', '2026-06-20', 'Planned', 'Alex Johnson', 'Client review scheduled.', '2026-05-25 09:18:46.655712+05:30');


--
-- Data for Name: project_notes; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: project_risks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.project_risks VALUES (1, 1, 'AWS Regional Downtime or Outage', 'High', 'Low', 'Deploy across multiple availability zones.', 'Alex Johnson', 'Open', 3.0, true, 'Risk "AWS Regional Downtime or Outage" scored MEDIUM (RS-3). Existing mitigation plan is in place — validate its effectiveness and assign a tracking owner.', 'MEDIUM', '2026-05-25 09:18:46.654153+05:30');
INSERT INTO public.project_risks VALUES (2, 1, 'Resource bandwidth constraint', 'Medium', 'Medium', 'Contract external consulting agency.', 'Jane Smith', 'Open', 4.0, true, 'Risk "Resource bandwidth constraint" scored MEDIUM (RS-4). Existing mitigation plan is in place — validate its effectiveness and assign a tracking owner.', 'MEDIUM', '2026-05-25 09:18:46.654153+05:30');
INSERT INTO public.project_risks VALUES (3, 2, 'API compatibility lag', 'High', 'Low', 'Continuous integration and staging mock checks.', 'Alex Johnson', 'Open', 3.0, true, 'Risk "API compatibility lag" scored MEDIUM (RS-3). Existing mitigation plan is in place — validate its effectiveness and assign a tracking owner.', 'MEDIUM', '2026-05-25 09:18:46.654153+05:30');


--
-- Data for Name: project_scope_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.project_scope_items VALUES (1, 1, 'AWS Cloud Migration Architecture Design', 'High', 'Design Engineering', '2026-05-25 09:18:46.658561+05:30');
INSERT INTO public.project_scope_items VALUES (2, 1, 'Secure Multi-Region VPC deployment', 'Medium', 'Dev Ops', '2026-05-25 09:18:46.658561+05:30');
INSERT INTO public.project_scope_items VALUES (3, 2, 'Vibrant Theme and Responsive Layout Redesign', 'High', 'Design Engineering', '2026-05-25 09:18:46.658561+05:30');
INSERT INTO public.project_scope_items VALUES (4, 2, 'RESTful Backend API Integration', 'Medium', 'Backend Team', '2026-05-25 09:18:46.658561+05:30');


--
-- Data for Name: project_stakeholders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.project_stakeholders VALUES (1, 1, 'Alex Johnson', 'Project Manager', 'High', 'alex.j@company.com', 'Internal PMO', '2026-05-25 09:18:46.656859+05:30');
INSERT INTO public.project_stakeholders VALUES (2, 1, 'Sarah Jenkins', 'Acme Sponsor', 'High', 'sarah.j@acme.com', 'Acme Corp', '2026-05-25 09:18:46.656859+05:30');
INSERT INTO public.project_stakeholders VALUES (3, 2, 'Dr. Robert Carter', 'Medical Advisor', 'Medium', 'robert.c@medlife.com', 'MedLife', '2026-05-25 09:18:46.656859+05:30');


--
-- Name: activities_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activities_activity_id_seq', 3, true);


--
-- Name: call_recordings_recording_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.call_recordings_recording_id_seq', 1, true);


--
-- Name: deliverables_deliverable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.deliverables_deliverable_id_seq', 3, true);


--
-- Name: documents_document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.documents_document_id_seq', 1, true);


--
-- Name: project_bom_items_bom_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_bom_items_bom_id_seq', 3, true);


--
-- Name: project_health_scores_score_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_health_scores_score_id_seq', 18, true);


--
-- Name: project_milestones_milestone_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_milestones_milestone_id_seq', 3, true);


--
-- Name: project_notes_note_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_notes_note_id_seq', 1, false);


--
-- Name: project_risks_risk_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_risks_risk_id_seq', 3, true);


--
-- Name: project_scope_items_scope_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_scope_items_scope_id_seq', 4, true);


--
-- Name: project_stakeholders_stakeholder_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_stakeholders_stakeholder_id_seq', 3, true);


--
-- Name: projects_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.projects_project_id_seq', 7, true);


--
-- PostgreSQL database dump complete
--

\unrestrict XIXS7d3XFlDSUsayaQmkif18WNaqPEOuO0u6XpA3w7BxqGJjckwf2Uqiso2SLVa

