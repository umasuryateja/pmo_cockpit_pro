import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronRight, 
  Briefcase, 
  Info, 
  Layers, 
  ArrowLeft, 
  FileText, 
  AlertTriangle,
  Users,
  DollarSign,
  Calendar,
  X,
  CheckCircle2,
  ListTodo,
  Trash2,
  Sparkles,
  Activity,
  Bot,
  Loader2
} from 'lucide-react';
import { COLORS } from '../constants';
import { ModuleTabs } from './ModuleTabs';
import { DataTable } from './DataTable';
import { 
  getProjects, 
  createProject, 
  updateProject,
  getScopeItems,
  createScopeItem,
  getMilestones,
  createMilestone,
  getRisks,
  createRisk,
  getStakeholders,
  createStakeholder,
  getBomItems,
  createBomItem,
  deleteProject,
  deleteScopeItem,
  deleteMilestone,
  deleteRisk,
  deleteStakeholder,
  deleteBomItem,
  getProjectHealthScore,
  computeProjectHealth,
  saveHealthAISummary,
  bulkInsertKickoffData,
  saveRiskAIScore
} from "../services/api";
import {
  generateHealthSummary,
  generateKickoffData,
  scoreRiskWithAI
} from "../services/geminiService";

const DEFINE_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'scope', label: 'Scope' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'risks', label: 'Risks' },
  { id: 'stakeholders', label: 'Stakeholders' },
  { id: 'bom', label: 'BOM' }
];

const DefineModule: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<any[]>([]);

  // Edit states for Core Project
  const [manager, setManager] = useState("");
  const [industry, setIndustry] = useState("");
  const [priority, setPriority] = useState("");

  // Lists states
  const [scopeItems, setScopeItems] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [bomItems, setBomItems] = useState<any[]>([]);

  // Modal State
  const [modalType, setModalType] = useState<'project' | 'scope' | 'milestone' | 'risk' | 'stakeholder' | 'bom' | 'kickoff' | null>(null);

  // Form States
  const [scopeForm, setScopeForm] = useState({ item: '', complexity: 'Medium', owner: '' });
  const [milestoneForm, setMilestoneForm] = useState({ title: '', target_date: '', status: 'Planned', owner: '', notes: '' });
  const [riskForm, setRiskForm] = useState({ title: '', impact: 'Medium', probability: 'Medium', mitigation: '', owner: '', status: 'Open' });
  const [stakeholderForm, setStakeholderForm] = useState({ name: '', role: '', influence: 'Medium', contact_email: '', organization: '' });
  const [bomForm, setBomForm] = useState({ item_name: '', category: '', quantity: 1, unit_cost: 0, notes: '' });
  const [projectForm, setProjectForm] = useState({ name: '', description: '', priority: 'Standard', industry: '', startDate: '' });

  // ── Feature 1: Health Score ───────────────────────────────
  const [healthScore, setHealthScore] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthAI, setHealthAI] = useState<any>(null);
  const [showHealthDetail, setShowHealthDetail] = useState(false);

  // ── Feature 3: AI Kickoff ─────────────────────────────────
  const [kickoffLoading, setKickoffLoading] = useState(false);
  const [kickoffData, setKickoffData] = useState<any>(null);
  const [kickoffInserting, setKickoffInserting] = useState(false);
  const [lastCreatedProject, setLastCreatedProject] = useState<any>(null);

  // ── Feature 4: Risk Scoring ───────────────────────────────
  const [scoringRiskId, setScoringRiskId] = useState<number | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProjectDetails = async (projectId: number) => {
    try {
      const [s, m, r, st, b] = await Promise.all([
        getScopeItems(projectId),
        getMilestones(projectId),
        getRisks(projectId),
        getStakeholders(projectId),
        getBomItems(projectId)
      ]);
      setScopeItems(s.map((item: any) => ({ ...item, id: item.scope_id })));
      setMilestones(m.map((item: any) => ({ ...item, id: item.milestone_id })));
      setRisks(r.map((item: any) => ({ ...item, id: item.risk_id })));
      setStakeholders(st.map((item: any) => ({ ...item, id: item.stakeholder_id })));
      setBomItems(b.map((item: any) => ({ ...item, id: item.bom_id })));
    } catch (e) {
      console.error("Failed to load project details:", e);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      setManager(selectedProject.project_manager || "");
      setIndustry(selectedProject.industry || "");
      setPriority(selectedProject.priority_level || "");
      loadProjectDetails(selectedProject.project_id);
      loadHealthScore(selectedProject.project_id);
    }
  }, [selectedProject]);

  // ── Feature 1: Load health score from DB ─────────────────
  const loadHealthScore = async (projectId: number) => {
    try {
      const data = await getProjectHealthScore(projectId);
      setHealthScore(data);
      if (data.ai_summary && data.ai_summary.length > 10) {
        setHealthAI({
          executive_summary: data.ai_summary,
          recommendations: (data.ai_recommendations || '').split(' | ').filter(Boolean)
        });
      }
    } catch (e) {
      // No score yet — silently ignore (expected for new projects)
    }
  };

  // ── Feature 1: Run AI health analysis ────────────────────
  const handleRunHealthAnalysis = async () => {
    if (!selectedProject) return;
    setHealthLoading(true);
    try {
      // Step 1: Compute numeric score from DB
      const scored = await computeProjectHealth(selectedProject.project_id);
      setHealthScore(scored);

      // Step 2: Generate AI/contextual summary (never null — fallback is data-driven)
      const aiResult = await generateHealthSummary(
        selectedProject.project_name,
        scored.score,
        scored.ragStatus,
        scored.metrics || {}
      );

      // aiResult is always non-null (has contextual fallback)
      setHealthAI(aiResult);
      setShowHealthDetail(true);

      // Step 3: Persist to DB (best-effort — don’t block UI on failure)
      try {
        await saveHealthAISummary(
          selectedProject.project_id,
          aiResult.executive_summary || '',
          (aiResult.recommendations || []).join(' | ')
        );
      } catch (saveErr) {
        console.warn('[Health] Failed to persist AI summary to DB:', saveErr);
        // Not a user-facing error — summary is already displayed
      }
    } catch (e) {
      console.error('[Health] Analysis failed:', e);
      // Show a contextual message even on total failure
      setHealthAI({
        executive_summary: 'AI service is currently unavailable. Please retry in a few moments.',
        status_explanation: 'Unable to compute analysis at this time.',
        recommendations: ['Retry the analysis using the button above.'],
        risk_level: 'Unknown'
      });
      setShowHealthDetail(true);
    } finally {
      setHealthLoading(false);
    }
  };

  const clearProjectDetailState = () => {
    setScopeItems([]);
    setMilestones([]);
    setRisks([]);
    setStakeholders([]);
    setBomItems([]);
    setHealthScore(null);
    setHealthAI(null);
    setShowHealthDetail(false);
    setManager('');
    setIndustry('');
    setPriority('');
  };

  // ── Feature 3: Generate AI kickoff data (always pass explicit project) ──
  const handleGenerateKickoff = async (project?: any) => {
    const target = project || lastCreatedProject;
    if (!target?.project_id) return;

    setKickoffLoading(true);
    setKickoffData(null);
    try {
      const data = await generateKickoffData(
        target.project_name,
        target.industry || 'Enterprise Tech',
        target.priority_level || 'Standard',
        target.planned_start || new Date().toISOString().split('T')[0]
      );
      if (!data) {
        alert('AI kickoff generation failed. This may be due to an invalid or unconfigured API key.\n\nPlease check that GEMINI_API_KEY is set correctly in frontend/.env.local');
        setKickoffLoading(false);
        return;
      }
      setKickoffData(data);
      setModalType('kickoff');
    } catch (e) {
      console.error('[Kickoff] Generation failed:', e);
      alert('AI service is currently unavailable. Please retry in a few moments.');
    } finally {
      setKickoffLoading(false);
    }
  };

  // ── Feature 3: Accept kickoff and insert into DB ─────────
  const handleAcceptKickoff = async () => {
    const target = lastCreatedProject;
    if (!kickoffData || !target?.project_id) return;
    setKickoffInserting(true);
    try {
      await bulkInsertKickoffData({
        projectId: Number(target.project_id),
        scopeItems:   kickoffData.scope_items   || [],
        milestones:   kickoffData.milestones    || [],
        risks:        kickoffData.risks         || [],
        stakeholders: kickoffData.stakeholders  || [],
      });
      setModalType(null);
      setKickoffData(null);
      alert(`AI kickoff data inserted successfully for ${target.project_name}!`);
      loadProjects();
    } catch (e) {
      console.error("Kickoff insert failed:", e);
      alert("Failed to insert kickoff data.");
    } finally {
      setKickoffInserting(false);
    }
  };

  // ── Feature 4: Score a single risk with AI ───────────────
  const handleScoreRisk = async (risk: any) => {
    if (scoringRiskId === risk.risk_id) return;
    setScoringRiskId(risk.risk_id);
    try {
      // scoreRiskWithAI always returns a result (has local deterministic fallback)
      const result = await scoreRiskWithAI({
        title: risk.title,
        impact: risk.impact,
        probability: risk.probability,
        mitigation: risk.mitigation
      });

      // Update local state immediately so badge shows
      setRisks(prev => prev.map(r =>
        r.risk_id === risk.risk_id
          ? { ...r, risk_score: result.risk_score, risk_level: result.risk_level, ai_assessed: true, ai_recommendation: result.ai_recommendation }
          : r
      ));

      // Persist to DB (best-effort)
      try {
        await saveRiskAIScore(risk.risk_id, result.risk_score, result.risk_level, result.ai_recommendation);
      } catch (saveErr) {
        console.warn('[Risk Score] DB persist failed:', saveErr);
        // Score is already shown in UI — not a blocking error
      }
    } catch (e) {
      console.error('[Risk Score] Scoring failed:', e);
    } finally {
      setScoringRiskId(null);
    }
  };

  const handleAddProject = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedProject(null);
    clearProjectDetailState();
    setLastCreatedProject(null);
    setKickoffData(null);
    setProjectForm({
      name: '',
      description: '',
      priority: 'Standard',
      industry: '',
      startDate: new Date().toISOString().split('T')[0]
    });
    setModalType('project');
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = projectForm.name.trim();
    if (!trimmedName) return;

    const uniqueSuffix =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().slice(0, 8).toUpperCase()
        : String(Date.now());

    const newProject = {
      project_code: `PRJ-${uniqueSuffix}`,
      project_name: trimmedName,
      client_name: projectForm.description?.trim() || "Client Corporation",
      project_manager: "Alex Johnson",
      industry: projectForm.industry || "Enterprise Tech",
      priority_level: projectForm.priority || "Standard",
      planned_start: projectForm.startDate || new Date().toISOString().split('T')[0]
    };

    try {
      const created = await createProject(newProject);
      if (!created?.project_id) {
        throw new Error('Server did not return a new project id');
      }

      setLastCreatedProject(created);
      setModalType(null);
      setSelectedProject(null);
      clearProjectDetailState();
      setProjectForm({
        name: '',
        description: '',
        priority: 'Standard',
        industry: '',
        startDate: new Date().toISOString().split('T')[0]
      });

      setProjects((prev) => {
        const id = Number(created.project_id);
        if (prev.some((p) => Number(p.project_id) === id)) {
          return prev.map((p) =>
            Number(p.project_id) === id ? { ...p, ...created } : p
          );
        }
        return [...prev, created].sort(
          (a, b) => Number(a.project_id) - Number(b.project_id)
        );
      });
      loadProjects();

      const wantAI = window.confirm(
        `Project "${trimmedName}" created (ID: ${created.project_id}).\n\nWould you like AI to generate a kickoff plan?\n(Scope items, milestones, risks, and stakeholders)`
      );
      if (wantAI) {
        await handleGenerateKickoff(created);
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Error creating project.");
    }
  };

  const handleDeleteProject = async (project?: any) => {
    const target = project || selectedProject;
    if (!target?.project_id) return;
    if (!window.confirm(`Delete project "${target.project_name}"? This cannot be undone.`)) {
      return;
    }

    const deletedId = Number(target.project_id);
    try {
      await deleteProject(deletedId);
      setSelectedProject(null);
      clearProjectDetailState();
      if (lastCreatedProject?.project_id === deletedId) {
        setLastCreatedProject(null);
      }
      setProjects((prev) => prev.filter((p) => Number(p.project_id) !== deletedId));
      loadProjects();
    } catch (err) {
      console.error(err);
      alert("Error deleting project.");
    }
  };

  const handleFinalize = async () => {
    try {
      await updateProject(selectedProject.project_id, {
        project_manager: manager,
        industry: industry,
        priority_level: priority
      });
      alert("Project Updated Successfully!");
      loadProjects();
    } catch (e) {
      console.error(e);
      alert("Error updating project.");
    }
  };

  const handleDeleteScopeItem = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this scope item?")) return;
    try {
      await deleteScopeItem(id);
      loadProjectDetails(selectedProject.project_id);
    } catch (err) {
      console.error(err);
      alert("Error deleting scope item.");
    }
  };

  const handleDeleteMilestone = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this milestone?")) return;
    try {
      await deleteMilestone(id);
      loadProjectDetails(selectedProject.project_id);
    } catch (err) {
      console.error(err);
      alert("Error deleting milestone.");
    }
  };

  const handleDeleteRisk = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this risk?")) return;
    try {
      await deleteRisk(id);
      loadProjectDetails(selectedProject.project_id);
    } catch (err) {
      console.error(err);
      alert("Error deleting risk.");
    }
  };

  const handleDeleteStakeholder = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this stakeholder?")) return;
    try {
      await deleteStakeholder(id);
      loadProjectDetails(selectedProject.project_id);
    } catch (err) {
      console.error(err);
      alert("Error deleting stakeholder.");
    }
  };

  const handleDeleteBomItem = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this BOM item?")) return;
    try {
      await deleteBomItem(id);
      loadProjectDetails(selectedProject.project_id);
    } catch (err) {
      console.error(err);
      alert("Error deleting BOM item.");
    }
  };

  // Submit Handlers
  const handleAddScopeItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scopeForm.item) return;
    try {
      await createScopeItem({ project_id: selectedProject.project_id, ...scopeForm });
      setScopeForm({ item: '', complexity: 'Medium', owner: '' });
      setModalType(null);
      loadProjectDetails(selectedProject.project_id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneForm.title) return;
    try {
      await createMilestone({ project_id: selectedProject.project_id, ...milestoneForm });
      setMilestoneForm({ title: '', target_date: '', status: 'Planned', owner: '', notes: '' });
      setModalType(null);
      loadProjectDetails(selectedProject.project_id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskForm.title || !selectedProject?.project_id) return;
    try {
      const created = await createRisk({ project_id: selectedProject.project_id, ...riskForm });
      setRiskForm({ title: '', impact: 'Medium', probability: 'Medium', mitigation: '', owner: '', status: 'Open' });
      setModalType(null);
      await loadProjectDetails(selectedProject.project_id);
      if (created?.risk_id) {
        handleScoreRisk({ ...created, risk_id: created.risk_id });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStakeholder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeholderForm.name) return;
    try {
      await createStakeholder({ project_id: selectedProject.project_id, ...stakeholderForm });
      setStakeholderForm({ name: '', role: '', influence: 'Medium', contact_email: '', organization: '' });
      setModalType(null);
      loadProjectDetails(selectedProject.project_id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBomItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bomForm.item_name) return;
    try {
      await createBomItem({ project_id: selectedProject.project_id, ...bomForm });
      setBomForm({ item_name: '', category: '', quantity: 1, unit_cost: 0, notes: '' });
      setModalType(null);
      loadProjectDetails(selectedProject.project_id);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate Grand Total for BOM
  const grandTotalBOM = bomItems.reduce((acc, curr) => {
    return acc + (Number(curr.quantity) * Number(curr.unit_cost));
  }, 0);

  // PROJECT LIST VIEW
  if (!selectedProject) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Project Definition</h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a project to configure charter, scope, and strategic governance.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddProject}
            className="bg-[#1F3A8A] hover:bg-indigo-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-indigo-100 active:scale-95"
          >
            <Plus size={18}/> Add Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
          {projects.map((project: any) => (
            <div
              key={project.project_id}
              onClick={() => setSelectedProject(project)}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all duration-300 cursor-pointer group flex flex-col h-full transform hover:-translate-y-1 relative"
            >
              <button
                type="button"
                title="Delete project"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project);
                }}
                className="absolute top-4 right-4 p-2 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16}/>
              </button>
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50 p-3 rounded-2xl text-[#1F3A8A] border border-indigo-100 group-hover:bg-[#1F3A8A] group-hover:text-white transition-all duration-300">
                  <Briefcase size={22}/>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Active
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-[#1F3A8A] transition-colors leading-tight">
                {project.project_name}
              </h3>
              <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed flex-grow">
                {project.client_name || 'Client not specified'}
              </p>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                    ID Code
                  </span>
                  <span className="text-xs font-bold text-slate-700 mt-1">
                    {project.project_code}
                  </span>
                </div>
                <span className="text-indigo-600 flex items-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Define Project
                  <ChevronRight size={14} className="ml-0.5"/>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Create Project Modal inside the list view block */}
        {modalType === 'project' && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Modal Head */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  Create New Enterprise Project
                </h3>
                <button 
                  onClick={() => setModalType(null)} 
                  className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X size={16}/>
                </button>
              </div>

              {/* Modal Forms */}
              <div className="p-6">
                <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Project Name *</label>
                    <input 
                      required
                      placeholder="e.g. Cloud Security Integration"
                      value={projectForm.name}
                      onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                      className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Description</label>
                    <textarea 
                      placeholder="Enter project summary or client details..."
                      value={projectForm.description}
                      onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                      className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm min-h-[80px] focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Priority</label>
                      <select 
                        value={projectForm.priority}
                        onChange={e => setProjectForm({ ...projectForm, priority: e.target.value })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="Low">Low Classification</option>
                        <option value="Standard">Standard Priority</option>
                        <option value="High">High Strategic</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Industry</label>
                      <select 
                        value={projectForm.industry}
                        onChange={e => setProjectForm({ ...projectForm, industry: e.target.value })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="">Select Industry</option>
                        <option value="Enterprise Tech">Enterprise Tech</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Start Date</label>
                    <input 
                      type="date"
                      value={projectForm.startDate}
                      onChange={e => setProjectForm({ ...projectForm, startDate: e.target.value })}
                      className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#1F3A8A] hover:bg-indigo-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all mt-6 shadow-md shadow-indigo-50">
                    Create Project
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}
      </div>
    );
  }

  // PROJECT DETAIL VIEW
  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto relative">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSelectedProject(null)}
          className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600 shadow-sm"
        >
          <ArrowLeft size={18}/>
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            <span>Define</span>
            <ChevronRight size={10}/>
            <span>{selectedProject.project_code}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {selectedProject.project_name}
          </h1>
        </div>

        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => handleDeleteProject()}
            className="px-5 py-2.5 text-xs font-bold text-red-600 border border-red-200 rounded-xl bg-white hover:bg-red-50 transition-all flex items-center gap-1.5"
          >
            <Trash2 size={14}/> Delete Project
          </button>
          <button 
            onClick={() => setSelectedProject(null)}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all"
          >
            Close Details
          </button>
          <button
            onClick={handleFinalize}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#1F3A8A] rounded-xl hover:bg-indigo-900 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            Finalize Setup
          </button>
        </div>
      </div>

      {/* Tabs System */}
      
      {/* ── FEATURE 1: AI PROJECT HEALTH SCORE CARD ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-6">
        {/* Score Ring */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black border-4 ${
            !healthScore ? 'border-slate-200 text-slate-300' :
            healthScore.ragStatus === 'On Track'  ? 'border-emerald-400 text-emerald-700 bg-emerald-50' :
            healthScore.ragStatus === 'At Risk'   ? 'border-amber-400 text-amber-700 bg-amber-50' :
                                                    'border-red-400 text-red-700 bg-red-50'
          }`}>
            {healthScore ? Math.round(healthScore.score) : '--'}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Health Score</span>
        </div>

        {/* Status + Summary */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              !healthScore ? 'bg-slate-100 text-slate-500' :
              healthScore.ragStatus === 'On Track'  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              healthScore.ragStatus === 'At Risk'   ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                      'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {healthScore?.ragStatus || 'Not Computed'}
            </span>
            {healthScore && (
              <span className="text-[10px] text-slate-400">
                Last analyzed {healthScore.computed_at ? new Date(healthScore.computed_at).toLocaleDateString() : 'never'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {healthAI?.executive_summary || (healthScore ? `Score based on milestones, risks, tasks and blockers.` : 'Click Run AI Analysis to compute project health.')}
          </p>
          {showHealthDetail && healthAI?.recommendations?.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {healthAI.recommendations.slice(0, 2).map((rec: string, i: number) => (
                <p key={i} className="text-[11px] text-indigo-700 flex items-start gap-1.5">
                  <span className="text-indigo-400 mt-0.5">›</span> {rec}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex flex-col gap-2">
          <button
            onClick={handleRunHealthAnalysis}
            disabled={healthLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            {healthLoading ? <Loader2 size={13} className="animate-spin"/> : <Sparkles size={13}/>}
            {healthLoading ? 'Analyzing...' : 'Run AI Analysis'}
          </button>
          {healthAI?.recommendations?.length > 0 && (
            <button
              onClick={() => setShowHealthDetail(p => !p)}
              className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 text-center transition-colors"
            >
              {showHealthDetail ? 'Hide Details' : 'Show Recommendations'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <ModuleTabs tabs={DEFINE_TABS} activeTab={activeTab} onTabChange={setActiveTab}/>

        <div className="p-8 flex-grow">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="max-w-4xl space-y-8 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Info size={14} className="text-indigo-500"/>
                    Core Governance
                  </h4>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 ml-1">
                      Project Manager
                    </label>
                    <input
                      value={manager}
                      onChange={(e) => setManager(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Layers size={14} className="text-teal-500"/>
                    Project Categorization
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Industry Vertical</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="">Select Industry</option>
                        <option value="Enterprise Tech">Enterprise Tech</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 ml-1">Priority Classification</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="">Select Priority</option>
                        <option value="Low">Low Classification</option>
                        <option value="Standard">Standard Priority</option>
                        <option value="High">High Strategic</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={14} className="text-amber-500"/>
                  Executive Summary / Charter Statement
                </h4>
                <textarea
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm min-h-[150px] focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all leading-relaxed"
                  placeholder="Summarize the core objectives, problem statements, and business outcomes..."
                />
              </div>
            </div>
          )}

          {/* Scope Tab */}
          {activeTab === 'scope' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Project Scope Statement</h3>
                  <p className="text-xs text-slate-500 mt-0.5">High-level deliverables defining the core boundaries of the project.</p>
                </div>
                <button
                  onClick={() => setModalType('scope')}
                  className="bg-[#1F3A8A] hover:bg-indigo-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-100"
                >
                  <Plus size={14}/> Add Scope Item
                </button>
              </div>

              {scopeItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <ListTodo className="text-slate-300 mb-3" size={32} />
                  <p className="text-slate-900 font-bold text-sm">No scope items added yet</p>
                  <p className="text-xs text-slate-400 mt-1">Define the boundaries of your project by adding deliverables.</p>
                </div>
              ) : (
                <DataTable
                  columns={[
                    { header: 'ID', accessor: (item: any) => <span className="font-bold text-slate-400">SCP-{item.scope_id}</span> },
                    { header: 'Deliverable / Boundary Item', accessor: (item: any) => <span className="font-semibold text-slate-800">{item.item}</span> },
                    { header: 'Complexity', accessor: (item: any) => (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.complexity === 'High' ? 'bg-red-50 text-red-700 border border-red-100' :
                        item.complexity === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {item.complexity}
                      </span>
                    )},
                    { header: 'Resource Group / Owner', accessor: (item: any) => <span className="text-slate-600 font-medium">{item.owner}</span> },
                    { header: 'Actions', accessor: (item: any) => (
                      <button 
                        onClick={() => handleDeleteScopeItem(item.scope_id)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors animate-all"
                        title="Delete Scope Item"
                      >
                        <Trash2 size={14}/>
                      </button>
                    )}
                  ]}
                  data={scopeItems}
                />
              )}
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Key Project Milestones</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Critical markers, phase approvals, and stage-gates.</p>
                </div>
                <button
                  onClick={() => setModalType('milestone')}
                  className="bg-[#1F3A8A] hover:bg-indigo-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-100"
                >
                  <Plus size={14}/> Add Milestone
                </button>
              </div>

              {milestones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Calendar className="text-slate-300 mb-3" size={32} />
                  <p className="text-slate-900 font-bold text-sm">No milestones defined</p>
                  <p className="text-xs text-slate-400 mt-1">Setup crucial project deadlines and stage-gate approvals.</p>
                </div>
              ) : (
                <DataTable
                  columns={[
                    { header: 'Milestone Event', accessor: (item: any) => <span className="font-bold text-slate-800">{item.title}</span> },
                    { header: 'Target Date', accessor: (item: any) => {
                      const date = new Date(item.target_date);
                      return <span className="font-semibold text-slate-600 flex items-center gap-1"><Calendar size={13}/>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>;
                    }},
                    { header: 'Status', accessor: (item: any) => (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        item.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {item.status}
                      </span>
                    )},
                    { header: 'Owner', accessor: (item: any) => <span className="text-slate-600 font-medium">{item.owner}</span> },
                    { header: 'Notes', accessor: (item: any) => <span className="text-slate-400 text-xs italic line-clamp-1 max-w-xs">{item.notes || '—'}</span> },
                    { header: 'Actions', accessor: (item: any) => (
                      <button 
                        onClick={() => handleDeleteMilestone(item.milestone_id)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors animate-all"
                        title="Delete Milestone"
                      >
                        <Trash2 size={14}/>
                      </button>
                    )}
                  ]}
                  data={milestones}
                />
              )}
            </div>
          )}

          {/* Risks Tab */}
          {activeTab === 'risks' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Project Risk Registry</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Identified risks, severity matrices, and containment mitigations.</p>
                </div>
                <button
                  onClick={() => setModalType('risk')}
                  className="bg-[#1F3A8A] hover:bg-indigo-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-100"
                >
                  <Plus size={14}/> Log Risk
                </button>
              </div>

              {risks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <AlertTriangle className="text-slate-300 mb-3" size={32} />
                  <p className="text-slate-900 font-bold text-sm">Registry is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Anticipate bottlenecks by logging potential project hazards.</p>
                </div>
              ) : (
                <DataTable
                  columns={[
                    { header: 'Risk Description', accessor: (item: any) => <span className="font-bold text-slate-800 flex items-center gap-1.5"><AlertTriangle size={14} className="text-amber-500"/>{item.title}</span> },
                    { header: 'Impact', accessor: (item: any) => (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.impact === 'High' ? 'bg-red-50 text-red-700 border border-red-100' :
                        item.impact === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {item.impact}
                      </span>
                    )},
                    { header: 'Probability', accessor: (item: any) => (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.probability === 'High' ? 'bg-red-50 text-red-700 border border-red-100' :
                        item.probability === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {item.probability}
                      </span>
                    )},
                    { header: 'AI Score', accessor: (item: any) => (
                      <div className="flex items-center gap-1.5">
                        {item.ai_assessed ? (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            item.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-700 border-red-200' :
                            item.risk_level === 'HIGH'     ? 'bg-orange-100 text-orange-700 border-orange-200' :
                            item.risk_level === 'MEDIUM'   ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                             'bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`} title={item.ai_recommendation || ''}>
                            RS-{item.risk_score} {item.risk_level}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleScoreRisk(item)}
                            disabled={scoringRiskId === item.risk_id}
                            className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50 transition-all disabled:opacity-50"
                          >
                            {scoringRiskId === item.risk_id
                              ? <Loader2 size={10} className="animate-spin"/>
                              : <Sparkles size={10}/>}
                            {scoringRiskId === item.risk_id ? 'Scoring...' : 'AI Score'}
                          </button>
                        )}
                      </div>
                    )},
                    { header: 'Mitigation Plan', accessor: (item: any) => <span className="text-slate-600 text-xs font-medium max-w-xs block truncate" title={item.mitigation}>{item.mitigation || '—'}</span> },
                    { header: 'Status', accessor: (item: any) => <span className={`text-xs font-bold uppercase tracking-wider ${item.status === 'Open' ? 'text-amber-600' : 'text-slate-400'}`}>{item.status}</span> },
                    { header: 'Owner', accessor: (item: any) => <span className="text-slate-600 text-xs font-bold">{item.owner}</span> },
                    { header: 'Actions', accessor: (item: any) => (
                      <button 
                        onClick={() => handleDeleteRisk(item.risk_id)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors animate-all"
                        title="Delete Risk"
                      >
                        <Trash2 size={14}/>
                      </button>
                    )}
                  ]}
                  data={risks}
                />
              )}
            </div>
          )}

          {/* Stakeholders Tab */}
          {activeTab === 'stakeholders' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Project Stakeholders</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Key sponsors, clients, team members, and interface groups.</p>
                </div>
                <button
                  onClick={() => setModalType('stakeholder')}
                  className="bg-[#1F3A8A] hover:bg-indigo-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-100"
                >
                  <Plus size={14}/> Add Stakeholder
                </button>
              </div>

              {stakeholders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Users className="text-slate-300 mb-3" size={32} />
                  <p className="text-slate-900 font-bold text-sm">No stakeholders mapped</p>
                  <p className="text-xs text-slate-400 mt-1">Register executive sponsors, functional leads, and key contacts.</p>
                </div>
              ) : (
                <DataTable
                  columns={[
                    { header: 'Stakeholder Name', accessor: (item: any) => <span className="font-bold text-slate-800">{item.name}</span> },
                    { header: 'Role / Designation', accessor: (item: any) => <span className="text-slate-600 font-medium">{item.role || '—'}</span> },
                    { header: 'Influence Level', accessor: (item: any) => (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.influence === 'High' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        item.influence === 'Medium' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                        'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {item.influence}
                      </span>
                    )},
                    { header: 'Contact Email', accessor: (item: any) => <span className="text-slate-500 text-xs font-semibold">{item.contact_email || '—'}</span> },
                    { header: 'Organization', accessor: (item: any) => <span className="text-slate-600 text-xs font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{item.organization || '—'}</span> },
                    { header: 'Actions', accessor: (item: any) => (
                      <button 
                        onClick={() => handleDeleteStakeholder(item.stakeholder_id)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors animate-all"
                        title="Delete Stakeholder"
                      >
                        <Trash2 size={14}/>
                      </button>
                    )}
                  ]}
                  data={stakeholders}
                />
              )}
            </div>
          )}

          {/* BOM Tab */}
          {activeTab === 'bom' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Bill of Materials (BOM)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Budgeted items, licenses, servers, hardware, and premium assets.</p>
                </div>
                <button
                  onClick={() => setModalType('bom')}
                  className="bg-[#1F3A8A] hover:bg-indigo-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-100"
                >
                  <Plus size={14}/> Add Resource / Item
                </button>
              </div>

              {bomItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <DollarSign className="text-slate-300 mb-3" size={32} />
                  <p className="text-slate-900 font-bold text-sm">Budget lists are empty</p>
                  <p className="text-xs text-slate-400 mt-1">Map initial hardware, software, and physical resource costs here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <DataTable
                    columns={[
                      { header: 'Resource Item Name', accessor: (item: any) => <span className="font-bold text-slate-800">{item.item_name}</span> },
                      { header: 'Category', accessor: (item: any) => <span className="text-slate-500 text-xs font-semibold bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">{item.category || '—'}</span> },
                      { header: 'Quantity', accessor: (item: any) => <span className="text-slate-800 font-bold">{item.quantity}</span> },
                      { header: 'Unit Cost', accessor: (item: any) => <span className="text-indigo-600 font-bold">${Number(item.unit_cost).toFixed(2)}</span> },
                      { header: 'Total Est. Cost', accessor: (item: any) => <span className="text-[#1F3A8A] font-extrabold">${(Number(item.quantity) * Number(item.unit_cost)).toFixed(2)}</span> },
                      { header: 'Notes', accessor: (item: any) => <span className="text-slate-400 text-xs italic block max-w-xs truncate" title={item.notes}>{item.notes || '—'}</span> },
                      { header: 'Actions', accessor: (item: any) => (
                        <button 
                          onClick={() => handleDeleteBomItem(item.bom_id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors animate-all"
                          title="Delete BOM Item"
                        >
                          <Trash2 size={14}/>
                        </button>
                      )}
                    ]}
                    data={bomItems}
                  />

                  {/* Summary Block */}
                  <div className="bg-indigo-50 border border-indigo-100/50 rounded-2xl p-6 flex justify-between items-center max-w-md ml-auto mt-4 shadow-sm">
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Grand Total Project Allocation</span>
                    <span className="text-xl font-black text-[#1F3A8A]">${grandTotalBOM.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* Sleek Overlay Modal System */}
      {/* ========================================================================= */}
      {modalType && modalType !== 'project' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Head */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                {modalType === 'scope' && 'Add Project Scope Item'}
                {modalType === 'milestone' && 'Register Strategic Milestone'}
                {modalType === 'risk' && 'Log Risk Threat / Vulnerability'}
                {modalType === 'stakeholder' && 'Map Project Stakeholder'}
                {modalType === 'bom' && 'Allocate Budget Resource / BOM Item'}
              </h3>
              <button 
                onClick={() => setModalType(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={16}/>
              </button>
            </div>

            {/* Modal Forms */}
            <div className="p-6">

              {modalType === 'scope' && (
                <form onSubmit={handleAddScopeItem} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Scope Deliverable Name *</label>
                    <input 
                      required
                      placeholder="e.g. Multi-Cloud DB Sync Engine"
                      value={scopeForm.item}
                      onChange={e => setScopeForm({ ...scopeForm, item: e.target.value })}
                      className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Complexity</label>
                      <select 
                        value={scopeForm.complexity}
                        onChange={e => setScopeForm({ ...scopeForm, complexity: e.target.value })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="Low">Low Complexity</option>
                        <option value="Medium">Medium Complexity</option>
                        <option value="High">High Complexity</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Resource Group / Team *</label>
                      <input 
                        required
                        placeholder="e.g. Infrastructure Ops"
                        value={scopeForm.owner}
                        onChange={e => setScopeForm({ ...scopeForm, owner: e.target.value })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#1F3A8A] hover:bg-indigo-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all mt-6 shadow-md shadow-indigo-50">
                    Add Scope Deliverable
                  </button>
                </form>
              )}

              {modalType === 'milestone' && (
                <form onSubmit={handleAddMilestone} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Milestone Title / Event *</label>
                    <input 
                      required
                      placeholder="e.g. Beta Build Launch"
                      value={milestoneForm.title}
                      onChange={e => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                      className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Target Date *</label>
                      <input 
                        required
                        type="date"
                        value={milestoneForm.target_date}
                        onChange={e => setMilestoneForm({ ...milestoneForm, target_date: e.target.value })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Milestone Owner *</label>
                      <input 
                        required
                        placeholder="e.g. Alex Johnson"
                        value={milestoneForm.owner}
                        onChange={e => setMilestoneForm({ ...milestoneForm, owner: e.target.value })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Status</label>
                      <select 
                        value={milestoneForm.status}
                        onChange={e => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="Planned">Planned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Target Notes / stage-gate requirements</label>
                    <textarea 
                      placeholder="Requirements to sign-off this milestone..."
                      value={milestoneForm.notes}
                      onChange={e => setMilestoneForm({ ...milestoneForm, notes: e.target.value })}
                      className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm min-h-[80px] focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#1F3A8A] hover:bg-indigo-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all mt-6 shadow-md shadow-indigo-50">
                    Register Milestone
                  </button>
                </form>
              )}

              {modalType === 'risk' && (
                <form onSubmit={handleAddRisk} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Risk Description / Event *</label>
                    <input 
                      required
                      placeholder="e.g. Third-party API dependency latency"
                      value={riskForm.title}
                      onChange={e => setRiskForm({ ...riskForm, title: e.target.value })}
                      className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Impact level</label>
                      <select 
                        value={riskForm.impact}
                        onChange={e => setRiskForm({ ...riskForm, impact: e.target.value })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="Low">Low Impact</option>
                        <option value="Medium">Medium Impact</option>
                        <option value="High">High Impact</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Probability</label>
                      <select 
                        value={riskForm.probability}
                        onChange={e => setRiskForm({ ...riskForm, probability: e.target.value })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="Low">Low Probability</option>
                        <option value="Medium">Medium Probability</option>
                        <option value="High">High Probability</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Risk Owner *</label>
                      <input 
                        required
                        placeholder="e.g. Jane Smith"
                        value={riskForm.owner}
                        onChange={e => setRiskForm({ ...riskForm, owner: e.target.value })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Risk Status</label>
                      <select 
                        value={riskForm.status}
                        onChange={e => setRiskForm({ ...riskForm, status: e.target.value })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Mitigation Strategy / Contingency Action</label>
                    <textarea 
                      placeholder="Describe what safeguards will contain this risk..."
                      value={riskForm.mitigation}
                      onChange={e => setRiskForm({ ...riskForm, mitigation: e.target.value })}
                      className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm min-h-[80px] focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#1F3A8A] hover:bg-indigo-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all mt-6 shadow-md shadow-indigo-50">
                    Log Risk Event
                  </button>
                </form>
              )}

              {modalType === 'stakeholder' && (
                <form onSubmit={handleAddStakeholder} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Stakeholder Full Name *</label>
                    <input 
                      required
                      placeholder="e.g. Dr. Robert Carter"
                      value={stakeholderForm.name}
                      onChange={e => setStakeholderForm({ ...stakeholderForm, name: e.target.value })}
                      className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Designation / Role *</label>
                      <input 
                        required
                        placeholder="e.g. Chief Medical Sponsor"
                        value={stakeholderForm.role}
                        onChange={e => setStakeholderForm({ ...stakeholderForm, role: e.target.value })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Influence level</label>
                      <select 
                        value={stakeholderForm.influence}
                        onChange={e => setStakeholderForm({ ...stakeholderForm, influence: e.target.value })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="Low">Low Influence</option>
                        <option value="Medium">Medium Influence</option>
                        <option value="High">High / Strategic</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Contact Email *</label>
                      <input 
                        required
                        type="email"
                        placeholder="e.g. robert.c@medlife.com"
                        value={stakeholderForm.contact_email}
                        onChange={e => setStakeholderForm({ ...stakeholderForm, contact_email: e.target.value })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Organization / Firm *</label>
                      <input 
                        required
                        placeholder="e.g. MedLife Inc."
                        value={stakeholderForm.organization}
                        onChange={e => setStakeholderForm({ ...stakeholderForm, organization: e.target.value })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#1F3A8A] hover:bg-indigo-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all mt-6 shadow-md shadow-indigo-50">
                    Map Stakeholder
                  </button>
                </form>
              )}

              {modalType === 'bom' && (
                <form onSubmit={handleAddBomItem} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Resource / Item Name *</label>
                    <input 
                      required
                      placeholder="e.g. Premium Kubernetes Cluster License"
                      value={bomForm.item_name}
                      onChange={e => setBomForm({ ...bomForm, item_name: e.target.value })}
                      className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Category *</label>
                    <input 
                      required
                      placeholder="e.g. Infrastructure, Software, Hardware..."
                      value={bomForm.category}
                      onChange={e => setBomForm({ ...bomForm, category: e.target.value })}
                      className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Quantity</label>
                      <input 
                        type="number"
                        min="1"
                        value={bomForm.quantity}
                        onChange={e => setBomForm({ ...bomForm, quantity: Number(e.target.value) })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Unit Cost ($ USD) *</label>
                      <input 
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={bomForm.unit_cost}
                        onChange={e => setBomForm({ ...bomForm, unit_cost: Number(e.target.value) })}
                        className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Additional Notes / Vendor specifications</label>
                    <textarea 
                      placeholder="Specifications, supplier links, or other budget information..."
                      value={bomForm.notes}
                      onChange={e => setBomForm({ ...bomForm, notes: e.target.value })}
                      className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-sm min-h-[80px] focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#1F3A8A] hover:bg-indigo-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all mt-6 shadow-md shadow-indigo-50">
                    Allocate Budget Item
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── FEATURE 3: AI KICKOFF PREVIEW MODAL ───────────────────────── */}
      {modalType === 'kickoff' && kickoffData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <Sparkles size={18}/>
                <h3 className="font-extrabold text-sm uppercase tracking-wider">AI Kickoff Plan Preview</h3>
              </div>
              <button onClick={() => setModalType(null)} className="text-white/70 hover:text-white p-1 rounded-lg">
                <X size={16}/>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6 space-y-5 flex-1">
              {kickoffData.timeline_summary && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Timeline Summary</p>
                  <p className="text-sm text-indigo-900">{kickoffData.timeline_summary}</p>
                </div>
              )}

              {/* Scope Items */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Scope Items ({kickoffData.scope_items?.length || 0})</p>
                <div className="space-y-1">
                  {(kickoffData.scope_items || []).map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                      <span className="text-xs font-semibold text-slate-800">{s.item}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.complexity === 'High' ? 'bg-red-100 text-red-700' : s.complexity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{s.complexity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Milestones ({kickoffData.milestones?.length || 0})</p>
                <div className="space-y-1">
                  {(kickoffData.milestones || []).map((m: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                      <span className="text-xs font-semibold text-slate-800">{m.title}</span>
                      <span className="text-[10px] text-slate-500">{m.target_date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Risks ({kickoffData.risks?.length || 0})</p>
                <div className="space-y-1">
                  {(kickoffData.risks || []).map((r: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                      <span className="text-xs font-semibold text-slate-800">{r.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.impact === 'High' ? 'bg-red-100 text-red-700' : r.impact === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{r.impact}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stakeholders */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Stakeholders ({kickoffData.stakeholders?.length || 0})</p>
                <div className="space-y-1">
                  {(kickoffData.stakeholders || []).map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                      <div>
                        <span className="text-xs font-semibold text-slate-800">{s.name}</span>
                        <span className="text-[10px] text-slate-500 ml-2">{s.role}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{s.influence}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
              <button
                onClick={() => setModalType(null)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
              >
                Decline — I'll enter manually
              </button>
              <button
                onClick={handleAcceptKickoff}
                disabled={kickoffInserting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1F3A8A] hover:bg-indigo-900 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-60"
              >
                {kickoffInserting ? <Loader2 size={13} className="animate-spin"/> : <CheckCircle2 size={13}/>}
                {kickoffInserting ? 'Inserting...' : 'Accept & Insert All'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DefineModule;