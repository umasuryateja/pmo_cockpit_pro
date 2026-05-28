# 🚀 PMO Cockpit Pro

### AI-Powered Enterprise PMO & Project Management Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI_Engine-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://pmo-cockpit-pro.vercel.app/)
[![Render Deployment](https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

---

### 🌐 Live Links
* **Production Live Demo:** [https://pmo-cockpit-pro.vercel.app/](https://pmo-cockpit-pro.vercel.app/)
* **GitHub Repository:** [https://github.com/umasuryateja/pmo_cockpit_pro](https://github.com/umasuryateja/pmo_cockpit_pro)

---

## 📖 1. Project Overview

**PMO Cockpit Pro** is a modern, enterprise-grade Portfolio Management Office (PMO) platform built to streamline project governance, risk mitigation, and executive reporting. 

In high-velocity enterprise environments, traditional project management tools often create massive information silos. PMO leaders and stakeholders face real-world challenges:
* **Disconnected Project Tracking:** Project details, deliverables, activities, and financials are scattered across documents, spreadsheets, and task managers.
* **Manual Reporting Lag:** PMO administrators spend days gathering status updates and assembling PowerPoint decks for executive steering committees.
* **Blind Spots & Delayed Escalation:** Unmitigated risks and active blockers go unnoticed until they delay critical milestones.
* **Lack of Actionable Insights:** Massive amounts of quantitative project data are rarely translated into contextual, data-driven strategic guidance.

### How PMO Cockpit Pro Solves This
By coupling a **robust relational PostgreSQL database** with the **Google Gemini AI SDK**, PMO Cockpit Pro centralizes structured project data and applies advanced reasoning to automate the most time-consuming aspects of project management. Rather than offering generic AI responses, the platform extracts real-time database metrics—such as overdue milestones, task velocity, risk exposure, and committed budgets—to generate **100% contextual, deterministic health summaries, executive status reports, and quantitative risk analyses**.

---

## 🛠️ 2. Key Features

PMO Cockpit Pro is built around modular enterprise workflows:

- **📋 Define & Governance Module:** Centralize high-level project registries, establish client alignments, track industry domains, set priorities, assign project managers, and manage multi-organizational stakeholders.
- **⚡ Project Lifecycle & Deliverables Tracking:** Drill down from projects to distinct deliverables and map them to fine-grained activities and task sprints.
- **🎯 Milestone Management:** Manage project schedules with dedicated milestone tracking, planned dates, target completions, and ownership mapping.
- **🧠 Deterministic AI Project Health Analysis:** An algorithmic health-scoring engine that computes a 0-100 score based on real-time database parameters, paired with a Gemini-powered qualitative analysis.
- **🛡️ AI Risk Scoring & Recommendation:** Rate open risks (1–12 matrix based on PMI standards) and use Gemini to generate highly specific, non-generic mitigation instructions citing project scope.
- **📈 AI Status & Board Reports:** Aggregate all deliverables, milestones, budgets (BOM), active blockers, and open risks into a formal status document ready for board presentation.
- **🌱 AI Kickoff Plan Generation:** Instantly bootstrap a new project by auto-generating industry-specific scope items, a 90-day milestone roadmap, high-probability risks, and key stakeholders.
- **👥 Stakeholder Registry & Allocation:** Map stakeholders to projects, record organizational details, and analyze influence levels.
- **📓 Note-Taking & Activity Logs:** Create, update, and persist notes directly linked to projects, capturing real-time operational context.
- **💸 Committed Budget Tracking (BOM):** Build a project Bill of Materials (BOM) with quantities, unit costs, and categories to track total committed financial exposure.
- **📊 Interactive Dashboard Insights:** Visualize project portfolios, overall health distributions (On Track, At Risk, Off Track), total active blockers, and financial summaries at a single glance.
- **🔌 RESTful API Architecture:** Secure, cleanly decoupled Express backend exposing organized resources under a relational Postgres data paradigm.
- **🚀 Fully Cloud-Native Production Deployment:** Deployed across a distributed tier utilizing Vercel, Render, and Supabase with isolated production environments.

---

## 🏗️ 3. System Architecture

PMO Cockpit Pro utilizes an isolated full-stack decoupled architecture. The operational flow operates as follows:

```mermaid
graph TD
    User([User / Stakeholder]) -->|Interacts with UI| FE[React Frontend - Vercel]
    FE -->|API Requests - REST| BE[Node.js / Express Backend - Render]
    FE -->|Data-Dense Context| Gemini[Gemini 2.0 Flash SDK]
    BE -->|Read / Write SQL Queries| DB[(PostgreSQL Database - Supabase)]
    Gemini -->|Returns Structural JSON| FE
    FE -->|Persists AI Results| BE
```

### Decoupled Architectural Layers

1. **Presentation Layer (React & Vite):** 
   A fast, highly responsive frontend bundle compiled via Vite and styled with Tailwind CSS. It manages local states, dynamic routes, state persistence, and communicates asynchronously with the backend API.
2. **AI Reasoning Layer (Client-Side Google GenAI SDK):** 
   Integrates directly with the `gemini-2.0-flash` model. It takes rich, quantitative project metrics aggregated from the database and runs them through tightly constrained system instructions to produce structured JSON payloads. This eliminates server overhead and guarantees highly responsive AI operations.
3. **Application & Route Controller Layer (Node.js & Express):** 
   A REST API server running on Node.js and Express. It manages CORS controls, parses JSON payloads, processes file-handling buffers, and acts as the gatekeeper for database transaction sequences.
4. **Data Persistence Layer (PostgreSQL & Supabase):** 
   A managed relational PostgreSQL database hosted on Supabase. It uses strict database schemas with cascading foreign keys to ensure data integrity, and dedicated performance indexes on foreign key relations to accelerate query execution.

---

## 💻 4. Tech Stack Section

| Technology | Category | Why It Was Used |
| :--- | :--- | :--- |
| **React 19** | Frontend | Allows building a modular, reactive UI using components like dynamic tabs, modals, and charts. |
| **Vite 6**| Build Tool | Provides instantaneous hot module replacement (HMR) and highly optimized production builds. |
| **Tailwind CSS** | Styling | Delivers an utility-first design flow, allowing for rapid customization, responsive layouts, and consistent spacing systems. |
| **Recharts** | Data Vis | Used to render responsive, visually striking portfolio overview charts and status distributions. |
| **Node.js & Express** | Backend | Exposes a lightweight, non-blocking asynchronous environment perfect for serving REST APIs. |
| **PostgreSQL** | Database | Provides ACID compliance, relational integrity, and powerful query filtering to handle complex project hierarchies. |
| **Supabase** | Cloud DB | Acts as a highly reliable, scalable Postgres provider offering instantaneous connection pools. |
| **Gemini 2.0 Flash** | AI Engine | Chosen for its high-speed inference, support for structured JSON outputs via schema definition, and superior contextual reasoning. |
| **Vercel** | Hosting (FE) | Delivers robust edge network hosting, continuous deployment via git integration, and fast bundle delivery. |
| **Render** | Hosting (BE) | Excellent hosting platform for long-running Node.js/Express web services with built-in health tracking. |

---

## 🧠 5. Deep-Dive: AI Features & Prompt Guardrails

A core differentiator of PMO Cockpit Pro is its **strictly contextual AI reasoning engine**. To prevent "hallucinations" common to generative AI, the platform does not allow the model to invent data. Instead, it operates on a strict **Contextual Injection Protocol**:

```
[Raw SQL Query] ──> [Structured Aggregation] ──> [Strict System Prompt Injection] ──> [Gemini JSON Schema] ──> [Verified UI Render]
```

### Key AI Core Capabilities

1. **Contextual Health Summaries (`generateHealthSummary`):**
   Converts computed quantitative scores (based on task overdue rates, risk scores, and blocker volumes) into a descriptive, professional PMO brief.
   * *Guardrail:* The system prompt forbids generic filler text. If a project has precisely `3` overdue tasks and `1` blocker, the AI is constrained to cite those exact numbers in its recommendations.
   * *Resilience:* A complete **Contextual Fallback Engine** runs locally if the AI key is missing or fails, ensuring the user gets a data-driven report without breaking.
2. **Quantitative Risk Mitigation (`scoreRiskWithAI`):**
   Evaluates user-submitted risk records against standard PMI Risk Management Professional (RMP) frameworks. It calculates a risk score (1–12 matrix of Impact × Probability) and returns a specific mitigation strategy.
3. **Bootstrapping Industry Kickoffs (`generateKickoffData`):**
   Generates a project kickoff plan matching the specific industry domain (e.g., Healthcare, FinTech, Devops). It outputs 5 scope items, 3 milestones spaced realistically over a 90-day timeline, 4 relevant risks, and 3 key stakeholder roles.
4. **Structured Status Reports (`generateStatusReport`):**
   Compiles comprehensive executive reports detailing deliverables, milestones, blocker owners, budget spent, and timeline projections in a standardized format.

---

## 🖼️ 6. Screen Views

### 📊 Portfolio Dashboard (Executive Control)
*The central command console visualizing portfolio distributions, active tasks, financial commitments, and key RAG indicators.*
![Portfolio Dashboard](assets/screenshots/01_executive_dashboard.png)

### 📋 Project Registry & Definition
*The workspace for creating, defining, and configuring high-level project charters, scope, client alignment, and strategic domains.*
![Project Registry](assets/screenshots/02_project_definition.png)

### 🧠 Project Details & AI Governance
*The comprehensive workspace showing quantitative and qualitative project metrics, live budget trackers, stakeholder mappings, and Gemini-driven health analyses.*
![Project Governance and Health Scoring](assets/screenshots/03_project_details.png)

### ⚡ Execution Workspace & Portfolios
*A real-time project portfolio tracker providing PMO directors with high-fidelity progress indicators, deliverables mapping, and critical path tracking.*
![Execution Workspace](assets/screenshots/04_execution_workspace.png)

### 🛡️ AI Business Rules Engine
*A generative AI playground allowing PMO administrators to write and persist formal project management and risk mitigation policies drafted by Gemini.*
![AI Policies Engine](assets/screenshots/05_ai_policies.png)

---

## ⚙️ 7. Installation & Local Setup

Get a local copy of PMO Cockpit Pro up and running by following these steps:

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* A running **PostgreSQL database** (or free **Supabase** instance)
* A **Google AI Studio API key** (obtainable from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/umasuryateja/pmo_cockpit_pro.git
cd pmo_cockpit_pro
```

### 2. Database Migration (Supabase or Local Postgres)
Initialize your database by running the SQL scripts in order using your SQL client or Supabase SQL Editor:
1. Open the SQL editor and execute the base table definitions:
   [backend/migrations/supabase_schema.sql](file:///c:/Users/jakka/OneDrive/Desktop/pmo_cockpit_pro/backend/migrations/supabase_schema.sql)
2. Execute the AI extension structure update:
   [backend/migrations/001_add_ai_features.sql](file:///c:/Users/jakka/OneDrive/Desktop/pmo_cockpit_pro/backend/migrations/001_add_ai_features.sql)
3. (Optional) Run the seed script to populate realistic project data:
   [backend/migrations/supabase_seed.sql](file:///c:/Users/jakka/OneDrive/Desktop/pmo_cockpit_pro/backend/migrations/supabase_seed.sql)

### 3. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file inside the `backend` directory:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL=postgresql://postgres.yourprojectid:yourpassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
FRONTEND_URL=http://localhost:5173
```
Start the backend server:
```bash
npm run dev # or npm start
```

### 4. Frontend Setup
Open a new terminal window, navigate to the `frontend` folder:
```bash
cd frontend
npm install
```
Create a `.env.local` file inside the `frontend` directory:
```env
VITE_API_BASE=http://localhost:5001
VITE_GEMINI_API_KEY=AIzaSyYourActualGoogleAIStudioAPIKeyHere
```
Start the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🔒 8. Environment Variables Blueprint

### Backend Server (`backend/.env`)
```ini
# Server Configuration
PORT=5001
NODE_ENV=production

# Database Connection (Supabase Session Pooler recommended)
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/postgres?sslmode=require

# CORS Security (Allowed Client Domain)
FRONTEND_URL=https://pmo-cockpit-pro.vercel.app
```

### Frontend Application (`frontend/.env.local`)
```ini
# Backend API base endpoint (no trailing slash)
VITE_API_BASE=https://pmo-cockpit-api.onrender.com

# Google AI Studio Gemini API Key
VITE_GEMINI_API_KEY=AIzaSyD-Your_Secure_Gemini_API_Key_Goes_Here
```

---

## 🚀 9. Production Deployment Guide

Deploying PMO Cockpit Pro to cloud infrastructure requires three main steps:

### 1. Database Deployment (Supabase)
* Register a new project at [supabase.com](https://supabase.com).
* Execute the schema SQL migrations found in `backend/migrations/` using the Supabase SQL editor.
* Navigate to **Project Settings → Database → Connection string** and copy the **URI** connection details. Use the transactional pooler (port `6543`) for Render.

### 2. Backend Web Service (Render)
* Link your GitHub repository to [Render](https://render.com).
* Create a new **Web Service** with the following parameters:
  * **Root Directory:** `backend`
  * **Runtime:** `Node`
  * **Build Command:** `npm install`
  * **Start Command:** `npm start`
  * **Health Check Path:** `/health/ready`
* Inject the required Environment Variables (`DATABASE_URL`, `NODE_ENV=production`, `FRONTEND_URL`).
* Render will assign a public URL (e.g., `https://pmo-cockpit-api.onrender.com`).

### 3. Frontend Static Hosting (Vercel)
* Connect your GitHub repo to [Vercel](https://vercel.com).
* Import the project and configure the project root:
  * **Root Directory:** `frontend`
  * **Framework Preset:** `Vite`
* Add your production environment variables:
  * Set `VITE_API_BASE` to your public Render service URL.
  * Set `VITE_GEMINI_API_KEY` to your production Google Gemini key.
* Click **Deploy**. Vercel will build the frontend assets and host them on an edge network (e.g., `https://pmo-cockpit-pro.vercel.app`).

---

## 💼 10. Real-World Use Cases

* **Project Management Offices (PMO):** Automate the generation of executive status briefs, standardize risk scores across project portfolios, and compile immediate Board-ready progress reviews.
* **Agile Startups:** Quickly define and bootstrap deliverables, activities, and milestones using AI domain kickoffs, and track MVP release timelines without overhead.
* **Enterprises & Operations Teams:** Centralize cross-departmental stakeholders, manage software bill of materials (BOM), and surface blockers before they impact the critical path.
* **Individual Project Managers:** Maintain clear operational logs using persistent project notes, track task complexity levels, and verify that actual deliverables map to core project scopes.

---

## 🧠 11. Engineering Challenges & Key Learnings

Building PMO Cockpit Pro highlighted several key full-stack software engineering principles:

* **Reliable AI Orchestration:** 
  Relying solely on open-ended AI models can lead to unpredictable UI states. Resolving this required enforcing structured JSON responses using the Google GenAI SDK's `responseSchema` options. This guarantees that Gemini returns strict formats containing arrays and numbers that React can safely iterate over.
* **Deterministic Fallback Architectures:** 
  To prevent network latency or API rate limits from blocking critical PMO workflows, a fully operational local analysis algorithm was built. The app evaluates project metrics deterministically first, allowing users to view complete, data-driven analyses even when the Google AI API is unreachable.
* **PostgreSQL Performance Optimization:** 
  With deeply nested structures (Projects → Deliverables → Activities), query latency can degrade performance. To solve this, explicit indexes were designed on all major foreign keys (`idx_activities_deliverable`, `idx_deliverables_project`) and status keys, decreasing average API response time under aggregate query loads.
* **Production Environment Decoupling:** 
  Managing CORS restrictions across dynamic preview deployments on Vercel required implementing a secure origin checker regex on the Express backend. This guarantees secure communication while allowing seamless branch previews during integration testing.

---

## 🔮 12. Future Enhancements

The strategic roadmap for PMO Cockpit Pro includes:

- [ ] **Role-Based Access Control (RBAC):** Integrate enterprise authentication (OpenID Connect / Auth0) with distinct Viewer, Project Manager, and PMO Director roles.
- [ ] **Dynamic Audit Logs:** Maintain full database history tracking who created, updated, or deleted projects, activities, and budget items.
- [ ] **E-mail & Slack Notifications:** Automatically dispatch alerts when a milestone becomes overdue or an activity is blocked.
- [ ] **Predictive AI Forecasting:** Train machine learning models on historical sprint performance to predict the probability of missing future milestones.
- [ ] **Interactive Timeline Gantt Charts:** Allow project managers to drag-and-drop task durations directly onto an interactive timeline.

---

## 👤 13. Author

**Uma Surya Teja**

* **GitHub:** [@umasuryateja](https://github.com/umasuryateja)
* **LinkedIn:** [Uma Surya Teja](https://linkedin.com/in/umasuryateja)
* **Portfolio:** [umasuryateja.com](https://surya-teja-portfolio-dun.vercel.app/)

---

*PMO Cockpit Pro is open-source software licensed under the MIT License.*
