DROP TABLE IF EXISTS project_bom_items CASCADE;
DROP TABLE IF EXISTS project_stakeholders CASCADE;
DROP TABLE IF EXISTS project_risks CASCADE;
DROP TABLE IF EXISTS project_milestones CASCADE;
DROP TABLE IF EXISTS project_scope_items CASCADE;
DROP TABLE IF EXISTS call_recordings CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS deliverables CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

CREATE TABLE projects (
  project_id SERIAL PRIMARY KEY,
  project_code VARCHAR(100) UNIQUE NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  client_name VARCHAR(255),
  project_manager VARCHAR(255),
  industry VARCHAR(255),
  priority_level VARCHAR(50),
  planned_start DATE
);

CREATE TABLE deliverables (
  deliverable_id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(project_id) ON DELETE CASCADE,
  deliverable_name VARCHAR(255) NOT NULL,
  complexity VARCHAR(50),
  resource_group VARCHAR(100)
);

CREATE TABLE activities (
  activity_id SERIAL PRIMARY KEY,
  deliverable_id INT REFERENCES deliverables(deliverable_id) ON DELETE CASCADE,
  activity_name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  sprint VARCHAR(100),
  assignee VARCHAR(255),
  due_date DATE,
  priority VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Not Started',
  blocker TEXT,
  blocker_owner VARCHAR(255)
);

CREATE TABLE documents (
  document_id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(project_id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT,
  uploaded_by VARCHAR(255)
);

CREATE TABLE call_recordings (
  recording_id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(project_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  attendees TEXT,
  duration VARCHAR(50),
  recording_date DATE
);

CREATE TABLE project_scope_items (
  scope_id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(project_id) ON DELETE CASCADE,
  item VARCHAR(255) NOT NULL,
  complexity VARCHAR(50),
  owner VARCHAR(150)
);

CREATE TABLE project_milestones (
  milestone_id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(project_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  target_date DATE,
  status VARCHAR(50) DEFAULT 'Planned',
  owner VARCHAR(150),
  notes TEXT
);

CREATE TABLE project_risks (
  risk_id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(project_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  impact VARCHAR(50),
  probability VARCHAR(50),
  mitigation TEXT,
  owner VARCHAR(150),
  status VARCHAR(50) DEFAULT 'Open'
);

CREATE TABLE project_stakeholders (
  stakeholder_id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(project_id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(120),
  influence VARCHAR(50),
  contact_email VARCHAR(150),
  organization VARCHAR(150)
);

CREATE TABLE project_bom_items (
  bom_id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(project_id) ON DELETE CASCADE,
  item_name VARCHAR(150) NOT NULL,
  category VARCHAR(120),
  quantity NUMERIC DEFAULT 1,
  unit_cost NUMERIC DEFAULT 0,
  notes TEXT
);

-- Seed some mock data so the app has data out of the box!
INSERT INTO projects (project_code, project_name, client_name, project_manager, industry, priority_level, planned_start)
VALUES
('PRJ-001', 'Cloud Infrastructure Migration', 'Acme Corp', 'Alex Johnson', 'Enterprise Tech', 'High', '2026-06-01'),
('PRJ-002', 'Health-App Frontend Redesign', 'MedLife', 'Alex Johnson', 'Healthcare', 'Standard', '2026-06-15'),
('PRJ-003', 'Fintech Payment Gateway', 'Apex Bank', 'Jane Smith', 'Finance', 'High', '2026-07-01');

INSERT INTO deliverables (project_id, deliverable_name, complexity, resource_group)
VALUES
(1, 'AWS VPC Setup', 'Medium', 'Cloud DevOps'),
(1, 'Database Replication', 'High', 'Database Architects'),
(2, 'React UI Overhaul', 'High', 'Frontend Team');

INSERT INTO activities (deliverable_id, activity_name, type, sprint, assignee, due_date, priority, status)
VALUES
(1, 'Design VPC Architecture', 'Engineering', 'Sprint 1', 'Alex Johnson', '2026-06-05', 'High', 'In Progress'),
(1, 'Configure Route Tables & Subnets', 'Configuration', 'Sprint 1', 'John Doe', '2026-06-10', 'Medium', 'Not Started'),
(2, 'Setup PostgreSQL replication slots', 'Database', 'Sprint 2', 'Jane Smith', '2026-06-20', 'High', 'Not Started');

INSERT INTO documents (project_id, file_name, file_type, file_size, uploaded_by)
VALUES
(1, 'architecture_specs.pdf', 'application/pdf', 1048576, 'Alex Johnson');

INSERT INTO call_recordings (project_id, title, description, attendees, duration, recording_date)
VALUES
(1, 'Kickoff Meeting', 'Initial alignment on cloud migration path and requirements.', 'Alex, Jane, Acme Team', '45 mins', '2026-05-22');

-- Seed scope items
INSERT INTO project_scope_items (project_id, item, complexity, owner)
VALUES
(1, 'AWS Cloud Migration Architecture Design', 'High', 'Design Engineering'),
(1, 'Secure Multi-Region VPC deployment', 'Medium', 'Dev Ops'),
(2, 'Vibrant Theme and Responsive Layout Redesign', 'High', 'Design Engineering'),
(2, 'RESTful Backend API Integration', 'Medium', 'Backend Team');

-- Seed milestones
INSERT INTO project_milestones (project_id, title, target_date, status, owner, notes)
VALUES
(1, 'Architecture Blueprints Approved', '2026-06-10', 'Completed', 'Alex Johnson', 'Signed off by enterprise architect.'),
(1, 'VPC Infrastructure Setup Complete', '2026-06-25', 'Planned', 'John Doe', 'Pending hardware allocations.'),
(2, 'UI Mockups Confirmed', '2026-06-20', 'Planned', 'Alex Johnson', 'Client review scheduled.');

-- Seed risks
INSERT INTO project_risks (project_id, title, impact, probability, mitigation, owner, status)
VALUES
(1, 'AWS Regional Downtime or Outage', 'High', 'Low', 'Deploy across multiple availability zones.', 'Alex Johnson', 'Open'),
(1, 'Resource bandwidth constraint', 'Medium', 'Medium', 'Contract external consulting agency.', 'Jane Smith', 'Open'),
(2, 'API compatibility lag', 'High', 'Low', 'Continuous integration and staging mock checks.', 'Alex Johnson', 'Open');

-- Seed stakeholders
INSERT INTO project_stakeholders (project_id, name, role, influence, contact_email, organization)
VALUES
(1, 'Alex Johnson', 'Project Manager', 'High', 'alex.j@company.com', 'Internal PMO'),
(1, 'Sarah Jenkins', 'Acme Sponsor', 'High', 'sarah.j@acme.com', 'Acme Corp'),
(2, 'Dr. Robert Carter', 'Medical Advisor', 'Medium', 'robert.c@medlife.com', 'MedLife');

-- Seed BOM items
INSERT INTO project_bom_items (project_id, item_name, category, quantity, unit_cost, notes)
VALUES
(1, 'AWS EC2 Instances (m6g.xlarge)', 'Infrastructure', 10, 150.00, 'Estimated monthly cost.'),
(1, 'AWS RDS Aurora cluster', 'Infrastructure', 2, 400.00, 'Production cluster.'),
(2, 'Vite Pro Premium License', 'Software', 5, 29.00, 'Front-end development toolkit.');
