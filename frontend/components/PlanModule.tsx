import React, { useState, useEffect } from 'react';
import { ModuleTabs } from './ModuleTabs';
import { DataTable } from './DataTable';
import { Calendar, Loader2 } from 'lucide-react';
import { getProjects, getDeliverables, getActivities } from '../services/api';

const PLAN_TABS = [
  { id: 'wbs', label: 'WBS' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'resource_plan', label: 'Resource Plan' }
];

export const PlanModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('wbs');

  // Project selector
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');

  // Deliverables (WBS / Schedule)
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load projects on mount
  useEffect(() => {
    getProjects()
      .then(data => {
        setProjects(data);
        if (data.length > 0) setSelectedProjectId(data[0].project_id);
      })
      .catch(err => console.error('Failed to load projects:', err));
  }, []);

  // Load deliverables + activities when project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    setDataLoaded(false);
    setActivities([]);

    getDeliverables(Number(selectedProjectId))
      .then(async (delivs) => {
        setDeliverables(delivs);
        // Load activities for each deliverable
        const activityArrays = await Promise.all(
          delivs.map((d: any) =>
            getActivities(d.deliverable_id || d.id).catch(() => [])
          )
        );
        const flat = activityArrays.flat().map((a: any) => ({
          ...a,
          id: a.activity_id || a.id,
        }));
        setActivities(flat);
        setDataLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load plan data:', err);
        setDataLoaded(true);
      })
      .finally(() => setLoading(false));
  }, [selectedProjectId]);

  const wbsRows = deliverables.map((d: any, i: number) => ({
    id: d.deliverable_id || d.id || i + 1,
    activity: d.deliverable_name || d.name || 'Unnamed Deliverable',
    resource: d.owner || d.assigned_to || '—',
    duration: d.due_date ? `Due ${new Date(d.due_date).toLocaleDateString()}` : '—',
  }));

  const scheduleRows = activities.map((a: any, i: number) => ({
    id: a.activity_id || a.id || i + 1,
    activity: a.activity_name || a.task_name || a.title || 'Unnamed Activity',
    resource: a.assignee || a.assigned_to || '—',
    duration: a.due_date ? `Due ${new Date(a.due_date).toLocaleDateString()}` : (a.duration || '—'),
  }));

  const resourceRows = activities
    .filter((a: any) => a.assignee || a.assigned_to)
    .reduce((acc: any[], a: any) => {
      const name = a.assignee || a.assigned_to;
      const existing = acc.find(r => r.activity === name);
      if (existing) {
        existing.duration = `${parseInt(existing.duration) + 1} tasks`;
      } else {
        acc.push({
          id: acc.length + 1,
          activity: name,
          resource: a.task_type || a.type || 'General',
          duration: '1 tasks',
        });
      }
      return acc;
    }, []);

  const tableData =
    activeTab === 'wbs' ? wbsRows :
    activeTab === 'schedule' ? scheduleRows :
    resourceRows;

  const isEmpty = !loading && dataLoaded && tableData.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Strategic Planning</h1>
          <p className="text-sm text-slate-500">Breakdown structures and timeline mapping.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Project Selector */}
          {projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(Number(e.target.value))}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {projects.map((p: any) => (
                <option key={p.project_id} value={p.project_id}>
                  {p.project_code} — {p.project_name}
                </option>
              ))}
            </select>
          )}
          <button className="bg-[#1F3A8A] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-900 transition-all shadow-md shadow-indigo-100 flex items-center gap-2">
            <Calendar size={16} /> Gantt View
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <ModuleTabs tabs={PLAN_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="p-8 flex-1">
          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin text-indigo-400" />
            </div>
          )}

          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-2">
              <p className="text-sm font-semibold">No data found</p>
              <p className="text-xs">Add deliverables and activities via the Define and Execute modules.</p>
            </div>
          )}

          {!loading && tableData.length > 0 && (
            <DataTable
              title={`Active ${PLAN_TABS.find(t => t.id === activeTab)?.label}`}
              columns={[
                { header: 'Task/Activity', accessor: (item: any) => <span className="font-semibold text-slate-800">{item.activity}</span> },
                { header: 'Allocated Resource', accessor: 'resource' },
                { header: 'Expected Duration', accessor: 'duration' }
              ]}
              data={tableData}
            />
          )}
        </div>
      </div>
    </div>
  );
};
