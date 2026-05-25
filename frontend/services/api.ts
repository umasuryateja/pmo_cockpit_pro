// In production: set VITE_API_BASE to your Render backend URL (e.g. https://pm-cockpit-backend.onrender.com)
// In development: falls back to http://localhost:5001
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";


export const getProjects = async () => {
  const res = await fetch(`${API_BASE}/projects/all`);

  if (!res.ok) throw new Error("Failed to fetch projects");

  return res.json();
};

export const createProject = async (project: any) => {
  const res = await fetch(`${API_BASE}/projects/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });

  if (!res.ok) throw new Error("Failed to create project");

  return res.json();
};

export const updateProject = async (id: number, data: any) => {
  const res = await fetch(`${API_BASE}/projects/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update project");

  return res.json();
};


/* ---------------------- DELIVERABLES ---------------------- */

export const getDeliverables = async (projectId: number) => {
  const res = await fetch(`${API_BASE}/deliverables/${projectId}`);

  if (!res.ok) throw new Error("Failed to fetch deliverables");

  return res.json();
};

export const createDeliverable = async (data: any) => {
  const res = await fetch(`${API_BASE}/deliverables/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create deliverable");

  return res.json();
};


/* ---------------------- ACTIVITIES ---------------------- */

export const getActivities = async (deliverableId: number) => {
  const res = await fetch(`${API_BASE}/activities/${deliverableId}`);

  if (!res.ok) throw new Error("Failed to fetch activities");

  return res.json();
};


/* ---------------------- BULK SAVE ACTIVITIES ---------------------- */

export const bulkSaveActivities = async (deliverableId: number, tasks: any[]) => {
  const res = await fetch(`${API_BASE}/activities/bulk-save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deliverableId,
      tasks
    }),
  });

  if (!res.ok) throw new Error("Failed to save activities");

  return res.json();
};

/* ---------------------- DOCUMENTS ---------------------- */

/* ---------------------- DOCUMENTS ---------------------- */

export const getDocuments = async (projectId: number) => {
  const res = await fetch(`${API_BASE}/documents/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
};

export const downloadDocument = (fileName: string) => {
  window.open(`${API_BASE}/documents/download/${fileName}`);
};

export const uploadDocument = async (file: File, projectId: number) => {

  const formData = new FormData();

  formData.append("file", file);
  formData.append("project_id", projectId.toString());

  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) throw new Error("Upload failed");

  return res.json();

};

export const getCallRecordings = async (projectId: number) => {
  const res = await fetch(`${API_BASE}/calls/${projectId}`);
  return await res.json();
};

export const createCallRecording = async (data: any) => {
  const res = await fetch(`${API_BASE}/calls/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return await res.json();
};

/* ---------------------- DEFINE MODULE API HELPERS ---------------------- */

export const getScopeItems = async (projectId: number) => {
  const res = await fetch(`${API_BASE}/projects/scope/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch scope items");
  return res.json();
};

export const createScopeItem = async (data: any) => {
  const res = await fetch(`${API_BASE}/projects/scope/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create scope item");
  return res.json();
};

export const getMilestones = async (projectId: number) => {
  const res = await fetch(`${API_BASE}/projects/milestones/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch milestones");
  return res.json();
};

export const createMilestone = async (data: any) => {
  const res = await fetch(`${API_BASE}/projects/milestones/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create milestone");
  return res.json();
};

export const getRisks = async (projectId: number) => {
  const res = await fetch(`${API_BASE}/projects/risks/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch risks");
  return res.json();
};

export const createRisk = async (data: any) => {
  const res = await fetch(`${API_BASE}/projects/risks/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create risk");
  return res.json();
};

export const getStakeholders = async (projectId: number) => {
  const res = await fetch(`${API_BASE}/projects/stakeholders/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch stakeholders");
  return res.json();
};

export const createStakeholder = async (data: any) => {
  const res = await fetch(`${API_BASE}/projects/stakeholders/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create stakeholder");
  return res.json();
};

export const getBomItems = async (projectId: number) => {
  const res = await fetch(`${API_BASE}/projects/bom/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch BOM items");
  return res.json();
};

export const createBomItem = async (data: any) => {
  const res = await fetch(`${API_BASE}/projects/bom/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create BOM item");
  return res.json();
};

export const deleteProject = async (id: number) => {
  const res = await fetch(`${API_BASE}/projects/delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete project");
  return res.json();
};

export const deleteScopeItem = async (id: number) => {
  const res = await fetch(`${API_BASE}/projects/scope/delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete scope item");
  return res.json();
};

export const deleteMilestone = async (id: number) => {
  const res = await fetch(`${API_BASE}/projects/milestones/delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete milestone");
  return res.json();
};

export const deleteRisk = async (id: number) => {
  const res = await fetch(`${API_BASE}/projects/risks/delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete risk");
  return res.json();
};

export const deleteStakeholder = async (id: number) => {
  const res = await fetch(`${API_BASE}/projects/stakeholders/delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete stakeholder");
  return res.json();
};

export const deleteBomItem = async (id: number) => {
  const res = await fetch(`${API_BASE}/projects/bom/delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete BOM item");
  return res.json();
};

/* ─────────────────────────────── FEATURE 1: HEALTH SCORING ─────────────────────────────── */

export const getProjectHealthScore = async (projectId: number) => {
  const res = await fetch(`${API_BASE}/health/score/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch health score");
  return res.json();
};

export const computeProjectHealth = async (projectId: number) => {
  const res = await fetch(`${API_BASE}/health/analyze/${projectId}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to compute health score");
  return res.json();
};

export const saveHealthAISummary = async (
  projectId: number,
  ai_summary: string,
  ai_recommendations: string
) => {
  const res = await fetch(`${API_BASE}/health/ai-summary/${projectId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ai_summary, ai_recommendations }),
  });
  if (!res.ok) throw new Error("Failed to save AI summary");
  return res.json();
};

/* ─────────────────────────────── FEATURE 2: PROJECT NOTES ──────────────────────────────── */

export const getNotes = async (projectId: number) => {
  const res = await fetch(`${API_BASE}/notes/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
};

export const createNote = async (data: {
  project_id: number;
  title: string;
  content: string;
  created_by?: string;
}) => {
  const res = await fetch(`${API_BASE}/notes/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
};

export const updateNote = async (noteId: number, title: string, content: string) => {
  const res = await fetch(`${API_BASE}/notes/update/${noteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
};

export const deleteNote = async (noteId: number) => {
  const res = await fetch(`${API_BASE}/notes/delete/${noteId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete note");
  return res.json();
};

/* ─────────────────────────────── FEATURE 3: AI KICKOFF BULK INSERT ─────────────────────── */

export const bulkInsertKickoffData = async (payload: {
  projectId: number;
  scopeItems: any[];
  milestones: any[];
  risks: any[];
  stakeholders: any[];
}) => {
  const res = await fetch(`${API_BASE}/kickoff/bulk-insert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Kickoff bulk insert failed");
  return res.json();
};

/* ─────────────────────────────── FEATURE 4: RISK AI SCORING ────────────────────────────── */

export const saveRiskAIScore = async (
  riskId: number,
  risk_score: number,
  risk_level: string,
  ai_recommendation: string
) => {
  const res = await fetch(`${API_BASE}/risks/ai-score/${riskId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ risk_score, risk_level, ai_recommendation }),
  });
  if (!res.ok) throw new Error("Failed to save risk AI score");
  return res.json();
};

/* ─────────────────────────────── FEATURE 5: REPORT AGGREGATION ─────────────────────────── */

export const getReportAggregate = async (projectId: number) => {
  const res = await fetch(`${API_BASE}/reports/aggregate/${projectId}`);
  if (!res.ok) throw new Error("Failed to aggregate report data");
  return res.json();
};