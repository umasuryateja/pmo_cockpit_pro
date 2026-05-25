
import React, { useState } from 'react';
import { ModuleTabs } from './ModuleTabs';
import { DataTable } from './DataTable';
import { Calendar, Plus } from 'lucide-react';

const PLAN_TABS = [
  { id: 'wbs', label: 'WBS' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'resource_plan', label: 'Resource Plan' }
];

export const PlanModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('wbs');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Strategic Planning</h1>
          <p className="text-sm text-slate-500">Breakdown structures and timeline mapping.</p>
        </div>
        <button className="bg-[#1F3A8A] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-900 transition-all shadow-md shadow-indigo-100 flex items-center gap-2">
          <Calendar size={16} /> Gantt View
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <ModuleTabs tabs={PLAN_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="p-8 flex-1">
          <DataTable 
            title={`Active ${PLAN_TABS.find(t => t.id === activeTab)?.label}`}
            columns={[
              { header: 'Task/Activity', accessor: (item: any) => <span className="font-semibold text-slate-800">{item.activity}</span> },
              { header: 'Allocated Resource', accessor: 'resource' },
              { header: 'Expected Duration', accessor: 'duration' }
            ]}
            data={[
              { id: 1, activity: 'Phase 1: Discovery & Requirements', resource: 'Business Analyst Lead', duration: '15 business days' },
              { id: 2, activity: 'Phase 2: Technical Design Blueprint', resource: 'Chief Architect', duration: '20 business days' },
              { id: 3, activity: 'Prototype Validation (Internal)', resource: 'Product Team', duration: '5 business days' }
            ]}
          />
        </div>
      </div>
    </div>
  );
};
