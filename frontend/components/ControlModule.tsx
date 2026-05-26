
import React, { useState, useEffect } from 'react';
import { Dashboard } from './Dashboard';
import { ModuleTabs } from './ModuleTabs';
import { DataTable } from './DataTable';
import { COLORS } from '../constants';
import { FileText, Sparkles, Loader2, ChevronRight, Bot, Download, RefreshCw } from 'lucide-react';
import { getProjects, getReportAggregate, getRisks } from '../services/api';
import { generateStatusReport } from '../services/geminiService';

const CONTROL_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'risks', label: 'Risks' },
  { id: 'reports', label: 'Reports' }
];

export const ControlModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // ── Risk Registry state (real data from API) ─────────────────
  const [allRisks, setAllRisks] = useState<any[]>([]);
  const [risksLoading, setRisksLoading] = useState(false);
  const [risksLoaded, setRisksLoaded] = useState(false);

  // ── Feature 5: Reports state ─────────────────────────────
  const [projects, setProjects]         = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData]     = useState<any>(null);
  const [reportError, setReportError]   = useState<string | null>(null);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  const loadProjectsIfNeeded = async () => {
    if (projectsLoaded) return;
    try {
      const data = await getProjects();
      setProjects(data);
      setProjectsLoaded(true);
    } catch (e) {
      console.error("Failed to load projects:", e);
    }
  };

  // Load risks from all projects when risks tab is activated
  const loadRisksIfNeeded = async () => {
    if (risksLoaded) return;
    setRisksLoading(true);
    try {
      const projects = await getProjects();
      const riskArrays = await Promise.all(
        projects.map((p: any) =>
          getRisks(p.project_id).catch(() => [])
        )
      );
      const flat = riskArrays.flat().map((r: any, i: number) => ({
        ...r,
        id: r.risk_id || r.id || i + 1,
        title: r.risk_title || r.title || r.description || 'Unnamed Risk',
        status: r.risk_level || r.severity || r.impact || 'Medium',
      }));
      setAllRisks(flat);
      setRisksLoaded(true);
    } catch (e) {
      console.error('Failed to load risks:', e);
    } finally {
      setRisksLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'reports') loadProjectsIfNeeded();
    if (tab === 'risks') loadRisksIfNeeded();
  };

  const handleGenerateReport = async () => {
    if (!selectedProjectId) {
      setReportError('Please select a project to generate a report.');
      return;
    }
    setReportLoading(true);
    setReportData(null);
    setReportError(null);
    try {
      // Step 1: Aggregate data from backend
      const aggregated = await getReportAggregate(Number(selectedProjectId));

      // Step 2: Generate report — always returns a result (contextual fallback if AI fails)
      const report = await generateStatusReport(aggregated);

      if (report) {
        setReportData({ ...report, _meta: aggregated });
      } else {
        // This should never happen with the new geminiService, but guard anyway
        setReportError('Report generation failed. Please retry in a few moments.');
      }
    } catch (e: any) {
      console.error('[Report] Generation error:', e);
      const msg = e?.message || '';
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('5001') || msg.includes('VITE_API_BASE')) {
        setReportError('Cannot reach the backend API. Set VITE_API_BASE on Vercel to your Render URL and redeploy.');
      } else if (msg.includes('API key') || msg.includes('apiKey')) {
        setReportError('Gemini API key is not configured. Set GEMINI_API_KEY in frontend/.env.local');
      } else {
        setReportError('Report generation failed. Please retry in a few moments.');
      }
    } finally {
      setReportLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!reportData) return;
    const text = formatReportAsText(reportData);
    navigator.clipboard.writeText(text).then(() => alert("Report copied to clipboard!"));
  };

  const formatReportAsText = (r: any) => `
${r.report_title || 'Project Status Report'}
${'='.repeat(60)}

EXECUTIVE SUMMARY
${r.executive_summary}

PROJECT HIGHLIGHTS
${(r.project_highlights || []).map((h: string) => `• ${h}`).join('\n')}

DELAYS & RISKS
${r.delays_and_risks}

TEAM PERFORMANCE
${r.team_performance}

RECOMMENDATIONS
${(r.recommendations || []).map((rec: string) => `• ${rec}`).join('\n')}

NEXT ACTIONS
${(r.next_actions || []).map((a: string) => `• ${a}`).join('\n')}

Overall Status: ${r.overall_status}
Generated: ${new Date().toLocaleString()}
`.trim();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Control</h1>
          <p className="text-sm text-slate-500">Real-time oversight and governance metrics.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
        <ModuleTabs tabs={CONTROL_TABS} activeTab={activeTab} onTabChange={handleTabChange} />
        
        <div className="p-8 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard />}

          {activeTab === 'risks' && (
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">Enterprise Risk Registry</h3>
                  <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all">Export Register</button>
               </div>
               {risksLoading && (
                 <div className="flex items-center justify-center py-16">
                   <Loader2 size={24} className="animate-spin text-indigo-400" />
                 </div>
               )}
               {!risksLoading && risksLoaded && allRisks.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                   <p className="text-sm font-semibold">No risks found</p>
                   <p className="text-xs">Add risks inside individual projects via the Define module.</p>
                 </div>
               )}
               {!risksLoading && allRisks.length > 0 && (
                 <DataTable
                   columns={[
                     { header: 'ID', accessor: (item: any) => <span className="font-mono text-xs font-bold text-indigo-600">{item.risk_id ? `RSK-${String(item.risk_id).padStart(2,'0')}` : item.id}</span> },
                     { header: 'Risk Description', accessor: (item: any) => <span className="font-medium text-slate-800">{item.title}</span> },
                     { header: 'Impact', accessor: (item: any) => (
                       <span className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor:
                           item.status?.toLowerCase() === 'high' || item.status?.toLowerCase() === 'critical' ? COLORS.offTrack :
                           item.status?.toLowerCase() === 'low' ? COLORS.onTrack : COLORS.atRisk
                         }} />
                         <span className="font-bold">{item.status}</span>
                       </span>
                     )}
                   ]}
                   data={allRisks}
                 />
               )}
            </div>
          )}

          {/* ── FEATURE 5: AI STATUS REPORT GENERATOR ─────────────────────── */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-300">

              {/* Control Bar */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 flex-1">
                  <Bot size={18} className="text-indigo-600 flex-shrink-0"/>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700 mb-1">Select Project</p>
                    <select
                      value={selectedProjectId}
                      onChange={e => setSelectedProjectId(e.target.value as any)}
                      className="w-full p-2 border border-slate-200 bg-white rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">— Choose a project —</option>
                      {projects.map((p: any) => (
                        <option key={p.project_id} value={p.project_id}>
                          {p.project_code} — {p.project_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleGenerateReport}
                  disabled={reportLoading || !selectedProjectId}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#1F3A8A] hover:bg-indigo-900 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                >
                  {reportLoading
                    ? <><Loader2 size={14} className="animate-spin"/> Generating...</>
                    : <><Sparkles size={14}/> Generate AI Report</>
                  }
                </button>
              </div>

              {/* Error Banner */}
              {reportError && !reportLoading && (
                <div className="flex items-center justify-between gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 font-bold text-xs">⚠</span>
                    <p className="text-xs font-semibold text-red-700">{reportError}</p>
                  </div>
                  <button
                    onClick={handleGenerateReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition-all flex-shrink-0"
                  >
                    <RefreshCw size={11}/> Retry
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!reportData && !reportLoading && !reportError && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-300">
                    <FileText size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-900 font-bold">No Report Generated Yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Select a project above and click Generate AI Report to compile an executive status report using live project data.
                    </p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {reportLoading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 size={32} className="animate-spin text-indigo-500"/>
                  <p className="text-sm font-semibold text-slate-600">Aggregating project data and generating AI report...</p>
                </div>
              )}

              {/* Report Viewer */}
              {reportData && !reportLoading && (
                <div className="space-y-5">
                  {/* Report Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{reportData.report_title}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          reportData.overall_status?.toLowerCase().includes('track')
                            ? 'bg-emerald-100 text-emerald-700'
                            : reportData.overall_status?.toLowerCase().includes('risk')
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {reportData.overall_status}
                        </span>
                        <span className="text-[10px] text-slate-400">Generated {new Date().toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setReportData(null); setSelectedProjectId(''); }}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                      >
                        <RefreshCw size={12}/> New Report
                      </button>
                      <button
                        onClick={handleCopyReport}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all"
                      >
                        <Download size={12}/> Copy Report
                      </button>
                    </div>
                  </div>

                  {/* Metrics Summary Strip */}
                  {reportData._meta && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Milestones', val: `${reportData._meta.milestones?.completed}/${reportData._meta.milestones?.total}`, sub: `${reportData._meta.milestones?.overdue} overdue` },
                        { label: 'Open Risks', val: reportData._meta.risks?.open, sub: `${reportData._meta.risks?.high} high severity` },
                        { label: 'Tasks', val: `${reportData._meta.tasks?.completed}/${reportData._meta.tasks?.total}`, sub: `${reportData._meta.tasks?.overdue} overdue` },
                        { label: 'BOM Budget', val: `$${reportData._meta.budget?.totalBOM}`, sub: 'Planned spend' },
                      ].map((stat, i) => (
                        <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                          <p className="text-xl font-black text-slate-900 mt-0.5">{stat.val}</p>
                          <p className="text-[10px] text-slate-500">{stat.sub}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Executive Summary */}
                  <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <h4 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles size={12}/> Executive Summary
                    </h4>
                    <p className="text-sm text-slate-800 leading-relaxed">{reportData.executive_summary}</p>
                  </div>

                  {/* Highlights */}
                  {reportData.project_highlights?.length > 0 && (
                    <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <h4 className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-3">Project Highlights</h4>
                      <ul className="space-y-1.5">
                        {reportData.project_highlights.map((h: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="text-emerald-500 mt-0.5">✓</span> {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Delays & Risks */}
                  <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl">
                    <h4 className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-2">Delays & Risk Assessment</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{reportData.delays_and_risks}</p>
                  </div>

                  {/* Team Performance */}
                  <div className="p-5 bg-white border border-slate-200 rounded-xl">
                    <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Team Performance</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{reportData.team_performance}</p>
                  </div>

                  {/* Recommendations + Next Actions (2-col) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-white border border-slate-200 rounded-xl">
                      <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-3">Recommendations</h4>
                      <ul className="space-y-2">
                        {(reportData.recommendations || []).map((r: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <span className="text-indigo-500 mt-0.5 font-bold">{i + 1}.</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-5 bg-white border border-slate-200 rounded-xl">
                      <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-3">Next Actions</h4>
                      <ul className="space-y-2">
                        {(reportData.next_actions || []).map((a: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <ChevronRight size={12} className="text-indigo-400 mt-0.5 flex-shrink-0"/>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
