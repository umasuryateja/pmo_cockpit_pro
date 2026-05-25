
import React, { useState } from 'react';
import { ModuleTabs } from './ModuleTabs';
import { DataTable } from './DataTable';
import { Database, Copy, Check, Sparkles, Terminal, Shield } from 'lucide-react';
import { generateSqlOptimization } from '../services/geminiService';

const CONFIG_TABS = [
  { id: 'roles', label: 'Roles' },
  { id: 'employees', label: 'Employees' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'clients', label: 'Clients' },
  { id: 'item_master', label: 'Item Master' },
  { id: 'service_master', label: 'Service Master' },
  { id: 'schema_export', label: 'Schema Export' }
];

const EXECUTION_TASK_SQL = `-- Project Execution Tasks Table
CREATE TABLE execution_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    activity TEXT NOT NULL,
    assignee VARCHAR(255),
    due_date DATE,
    status VARCHAR(50) DEFAULT 'Pending' 
        CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Blocked')),
    priority VARCHAR(50) DEFAULT 'Medium' 
        CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    blocker TEXT,
    blocker_owner VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_project_id ON execution_tasks(project_id);
CREATE INDEX idx_tasks_status ON execution_tasks(status);
CREATE INDEX idx_tasks_due_date ON execution_tasks(due_date);`;

export const ConfigModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [copied, setCopied] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EXECUTION_TASK_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAiOptimize = async () => {
    setIsAnalyzing(true);
    const result = await generateSqlOptimization(EXECUTION_TASK_SQL);
    setAiAnalysis(result || "Analysis complete.");
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Configuration</h1>
          <p className="text-sm text-slate-500">Global master data and infrastructure management.</p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <ModuleTabs tabs={CONFIG_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="p-8 flex-1">
          {activeTab === 'schema_export' ? (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <Terminal size={16} className="text-indigo-600" /> PostgreSQL Script
                    </h3>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-all"
                    >
                      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      {copied ? 'COPIED!' : 'COPY SQL'}
                    </button>
                  </div>
                  <div className="relative group">
                    <pre className="bg-[#0F172A] text-slate-300 p-6 rounded-2xl font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800 shadow-2xl">
                      <code>{EXECUTION_TASK_SQL}</code>
                    </pre>
                    <div className="absolute top-4 right-4 text-slate-600 opacity-20 group-hover:opacity-40 transition-opacity">
                      <Database size={40} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Sparkles size={14} /> AI Schema Assistant
                    </h4>
                    <p className="text-xs text-indigo-700 leading-relaxed mb-4">
                      Let Gemini analyze your schema for performance bottlenecks, partitioning strategies, and type optimizations.
                    </p>
                    <button 
                      onClick={handleAiOptimize}
                      disabled={isAnalyzing}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                      {isAnalyzing ? 'Analyzing DB architecture...' : 'Optimize Schema'}
                    </button>
                  </div>

                  {aiAnalysis && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in zoom-in-95 duration-300">
                       <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <Shield size={14} className="text-teal-600" /> DB Recommendations
                       </h4>
                       <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
                         {aiAnalysis.split('\n').map((line, i) => (
                           <p key={i}>{line}</p>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <DataTable 
              title={`${CONFIG_TABS.find(t => t.id === activeTab)?.label} Master Records`}
              columns={[
                { header: 'Internal Code', accessor: (item: any) => <span className="font-mono text-xs font-bold text-indigo-600">{item.code}</span> },
                { header: 'Display Name', accessor: (item: any) => <span className="font-semibold text-slate-800">{item.name}</span> },
                { header: 'Category / Type', accessor: 'category' }
              ]}
              data={[
                { id: 1, code: 'MST-001', name: 'Executive Sponsor', category: 'Management' },
                { id: 2, code: 'MST-002', name: 'Cloud Service Provider', category: 'External Vendor' },
                { id: 3, code: 'MST-003', name: 'Contractor Group A', category: 'Resource Pool' }
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
};
