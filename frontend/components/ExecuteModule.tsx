import React, { useState, useEffect } from 'react';
import { ModuleTabs } from './ModuleTabs';
import { DataTable } from './DataTable';

import {
getProjects,
getDeliverables,
getActivities,
bulkSaveActivities,
getDocuments,
downloadDocument,
uploadDocument,
getCallRecordings,
createCallRecording,
getNotes,
createNote,
updateNote,
deleteNote
} from "../services/api";

import {
  FileText,
  Plus,
  CheckCircle2,
  History,
  ArrowLeft,
  ChevronRight,
  Trash2,
  GripVertical,
  Save,
  LayoutGrid,
  ShieldAlert,
  Mic,
  Play,
  NotebookPen,
  StickyNote,
  Clock,
  Users,
  Search
} from 'lucide-react';

import { MOCK_PROJECTS, COLORS } from '../constants';
import { Project, ExecutionTask } from '../types';

const EXECUTE_TABS = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'documents', label: 'Documents' },
  { id: 'updates', label: 'Updates' },
  { id: 'recordings', label: 'Call Recordings' },
  { id: 'notebook', label: 'Note book' }
];

const TASK_TYPES = ['Documentation', 'Build', 'Infra', 'Testing', 'UAT', 'Live'];

const SPRINTS = [
  'Sprint 22',
  'Sprint 23',
  'Sprint 24',
  'Sprint 25',
  'Sprint 26'
];

const TEAM_MEMBERS = [
  'Sarah Chen',
  'Alex Rivera',
  'Michael Scott',
  'Jim Halpert',
  'Pam Beesly',
  'Dwight Schrute'
];

export const ExecuteModule: React.FC = () => {

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState<ExecutionTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deliverableId, setDeliverableId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ── Feature 2: Persistent Notes ────────────────────────────
  const [notes, setNotes]               = useState<any[]>([]);
  const [activeNote, setActiveNote]     = useState<any | null>(null);
  const [noteTitle, setNoteTitle]       = useState('');
  const [noteContent, setNoteContent]   = useState('');
  const [notesSaving, setNotesSaving]   = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  useEffect(() => {

    const loadProjects = async () => {
      const data = await getProjects();
      setProjects(data);
    };

    loadProjects();

  }, []);



const addTask = () => {

  const newTask: ExecutionTask = {
    id: Date.now(), // temporary id for frontend
    activity: '',
    assignee: TEAM_MEMBERS[0],
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
    priority: 'Medium',
    blocker: '',
    blockerOwner: '',
    sprint: SPRINTS[0],
    taskType: 'Build'
  };

  setTasks(prev => [...prev, newTask]);

};



  const updateTask = (
  id: number | null,
    field: keyof ExecutionTask,
    value: string
  ) => {

    setTasks(
      tasks.map(t =>
        t.id === id
          ? { ...t, [field]: value }
          : t
      )
    );
  };


  const removeTask = (id: number | null) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // ── Feature 2: Notes Handlers ────────────────────────────────
  const loadNotes = async (projectId: number) => {
    setNotesLoading(true);
    try {
      const data = await getNotes(projectId);
      setNotes(data);
      if (data.length > 0) {
        openNote(data[0]);
      } else {
        setActiveNote(null); setNoteTitle(''); setNoteContent('');
      }
    } catch (e) {
      console.error("Failed to load notes:", e);
    } finally {
      setNotesLoading(false);
    }
  };

  const openNote = (note: any) => {
    setActiveNote(note);
    setNoteTitle(note.title || '');
    setNoteContent(note.content || '');
  };

  const handleNewNote = async () => {
    if (!selectedProject) return;
    const tempNote = { note_id: null, title: 'New Note', content: '', created_at: new Date().toISOString() };
    setActiveNote(tempNote);
    setNoteTitle('New Note');
    setNoteContent('');
  };

  const handleSaveNote = async () => {
    if (!selectedProject || !noteTitle.trim()) return;
    setNotesSaving(true);
    try {
      if (!activeNote?.note_id) {
        // Create new
        const created = await createNote({
          project_id: selectedProject.project_id!,
          title: noteTitle,
          content: noteContent,
          created_by: 'Alex Johnson'
        });
        setNotes(prev => [created, ...prev]);
        setActiveNote(created);
      } else {
        // Update existing
        const updated = await updateNote(activeNote.note_id, noteTitle, noteContent);
        setNotes(prev => prev.map(n => n.note_id === updated.note_id ? updated : n));
        setActiveNote(updated);
      }
    } catch (e) {
      console.error("Save note failed:", e);
    } finally {
      setNotesSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!activeNote?.note_id) { setActiveNote(null); setNoteTitle(''); setNoteContent(''); return; }
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteNote(activeNote.note_id);
      const remaining = notes.filter(n => n.note_id !== activeNote.note_id);
      setNotes(remaining);
      if (remaining.length > 0) openNote(remaining[0]);
      else { setActiveNote(null); setNoteTitle(''); setNoteContent(''); }
    } catch (e) {
      console.error("Delete note failed:", e);
    }
  };


  if (!selectedProject) {

    return (

      <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">

        <div className="flex justify-between items-end">

          <div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Execution Workspace
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Select an active engagement to manage delivery and tasks.
            </p>

          </div>

        </div>


        <DataTable

          title="Active Project Portfolio"

          columns={[

            { header: 'Client', accessor: 'client_name' },

            {
              header: 'Project ID',
              accessor: (item: Project) =>
                <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {item.project_code}
                </span>
            },

            {
              header: 'Project Name',
              accessor: (item: Project) =>
                <span className="font-semibold text-slate-800">
                  {item.project_name}
                </span>
            },

            { header: 'Start Date', accessor: 'start_date' },
            { header: 'End Date', accessor: 'end_date' },

            {
              header: 'Tasks (P/T)',
              accessor: (item: Project) => (

                <div className="flex items-center gap-3">

                  <span className="font-bold text-slate-700 min-w-[40px]">
                    {item.tasksPending} / {item.tasksTotal}
                  </span>

                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">

                    <div
                      className="h-full bg-indigo-500 transition-all duration-700"
                      style={{
                        width: `${((item.tasksTotal - item.tasksPending) / item.tasksTotal) * 100}%`
                      }}
                    />

                  </div>

                </div>
              )
            },

            {
              header: 'RAG',
              accessor: (item: Project) => (

                <div className="flex items-center gap-2">

                  <div
                    className="w-2.5 h-2.5 rounded-full shadow-sm animate-pulse"
                    style={{
                      backgroundColor:
                        item.health === 'On Track'
                          ? COLORS.onTrack
                          : item.health === 'At Risk'
                            ? COLORS.atRisk
                            : COLORS.offTrack
                    }}
                  />

                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {item.health}
                  </span>

                </div>

              )
            },

            {
              header: 'Actions',
              accessor: (item: Project) => (

                <button

                  onClick={async () => {

                    setSelectedProject(item);

                    const docs = await getDocuments(item.project_id);
                    setDocuments(docs);
                    const deliverables = await getDeliverables(item.project_id);

                    if (deliverables.length > 0) {

                      const dId = deliverables[0].deliverable_id;
                      setDeliverableId(dId);

                      const activities = await getActivities(dId);

                      const mapped = activities.map((a: any) => ({
                        id: a.activity_id,
                        activity: a.activity_name,
                        assignee: a.assignee,
                        dueDate: a.due_date,
                        status: a.status,
                        priority: a.priority,
                        blocker: a.blocker || "",
                        blockerOwner: a.blocker_owner || "",
                        sprint: a.sprint,
                        taskType: a.type
                      }));

                      setTasks(mapped);

                    }

                    // Feature 2: load real notes
                    if (item.project_id) loadNotes(item.project_id);

                  }}

                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#1F3A8A] hover:text-white text-[#1F3A8A] rounded-xl text-xs font-bold transition-all border border-indigo-100 shadow-sm hover:shadow-indigo-100"
                >

                  Preview / Edit
                  <ChevronRight size={14} />

                </button>

              )
            }

          ]}

          data={projects}

        />

      </div>

    );

  }
    return (

    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-[1400px] mx-auto">

      <div className="flex items-center gap-4">

        <button
          onClick={() => setSelectedProject(null)}
          className="p-2.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 hover:text-indigo-600 shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex-1">

          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
            <LayoutGrid size={10} />
            <span>Execution Workspace</span>
            <ChevronRight size={10} className="opacity-50" />
            <span className="text-indigo-600">{selectedProject.client}</span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 leading-none">
            {selectedProject.name}
          </h1>

        </div>

        <div className="flex gap-3">

          <button className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <History size={16} /> History
          </button>

          <button
            onClick={addTask}
            className="bg-[#1F3A8A] hover:bg-indigo-900 text-white px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
          >
            <Plus size={18} /> New Activity
          </button>

        </div>

      </div>


      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[700px]">

        <ModuleTabs
          tabs={EXECUTE_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />


        <div className="p-8 flex-1">

          {activeTab === 'tasks' && (

            <div className="space-y-4">

              <div className="flex justify-between items-center px-2">

                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-600" />
                    Task Activity Ledger
                  </h3>

                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Compact View Mode • Inline Editing Active
                  </p>
                </div>

                <button className="px-3 py-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all">
                  Export XLSX
                </button>

              </div>


              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm bg-white">

                <table className="w-full text-left border-collapse table-auto min-w-[1200px]">

                  <thead>

                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">

                      <th className="px-3 py-3 w-10 text-center">#</th>
                      <th className="px-3 py-3 min-w-[180px]">Activity Name</th>
                      <th className="px-3 py-3 w-32">Type</th>
                      <th className="px-3 py-3 w-32">Sprint</th>
                      <th className="px-3 py-3 w-36">Assignee</th>
                      <th className="px-3 py-3 w-28">Due Date</th>
                      <th className="px-3 py-3 w-24">Priority</th>
                      <th className="px-3 py-3 w-32">Status</th>
                      <th className="px-3 py-3 min-w-[150px]">Blocker</th>
                      <th className="px-3 py-3 w-32">Blocker Owner</th>
                      <th className="px-3 py-3 w-10"></th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-slate-200">

                    {tasks.map((task, idx) => (

                      <tr key={task.id ?? idx} className="hover:bg-slate-50 transition-all group">

                        <td className="px-2 py-1.5 text-center border-r border-slate-100">
                          <span className="text-[10px] font-bold text-slate-300">
                            {idx + 1}
                          </span>
                        </td>


                        <td className="px-2 py-1.5 border-r border-slate-100">

                          <input
                            type="text"
                            value={task.activity}
                            onChange={(e) => updateTask(task.id, 'activity', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-200 rounded px-1.5 py-1 text-xs font-semibold"
                          />

                        </td>


                        <td className="px-2 py-1.5 border-r border-slate-100">

                          <select
                            value={task.taskType}
                            onChange={(e) => updateTask(task.id, 'taskType', e.target.value)}
                            className="w-full bg-transparent border-none text-xs"
                          >
                            {TASK_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>

                        </td>


                        <td className="px-2 py-1.5 border-r border-slate-100">

                          <select
                            value={task.sprint}
                            onChange={(e) => updateTask(task.id, 'sprint', e.target.value)}
                            className="w-full bg-transparent border-none text-xs"
                          >
                            {SPRINTS.map(s => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>

                        </td>


                        <td className="px-2 py-1.5 border-r border-slate-100">

                          <select
                            value={task.assignee}
                            onChange={(e) => updateTask(task.id, 'assignee', e.target.value)}
                            className="w-full bg-transparent border-none text-xs"
                          >
                            {TEAM_MEMBERS.map(m => (
                              <option key={m}>{m}</option>
                            ))}
                          </select>

                        </td>


                        <td className="px-2 py-1.5 border-r border-slate-100">

                          <input
                            type="date"
                            value={task.dueDate}
                            onChange={(e) => updateTask(task.id, 'dueDate', e.target.value)}
                            className="w-full bg-transparent border-none text-xs"
                          />

                        </td>


                        <td className="px-2 py-1.5 border-r border-slate-100">

                          <select
                            value={task.priority}
                            onChange={(e) => updateTask(task.id, 'priority', e.target.value)}
                            className="w-full bg-transparent border-none text-xs"
                          >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Critical</option>
                          </select>

                        </td>


                        <td className="px-2 py-1.5 border-r border-slate-100">

                          <select
                            value={task.status}
                            onChange={(e) => updateTask(task.id, 'status', e.target.value)}
                            className="w-full bg-transparent border-none text-xs"
                          >
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                            <option>Blocked</option>
                          </select>

                        </td>


                        <td className="px-2 py-1.5 border-r border-slate-100">

                          <input
                            type="text"
                            value={task.blocker}
                            onChange={(e) => updateTask(task.id, 'blocker', e.target.value)}
                            className="w-full bg-transparent border-none text-xs"
                          />

                        </td>


                        <td className="px-2 py-1.5 border-r border-slate-100">

                          <input
                            type="text"
                            value={task.blockerOwner}
                            onChange={(e) => updateTask(task.id, 'blockerOwner', e.target.value)}
                            className="w-full bg-transparent border-none text-xs"
                          />

                        </td>


                        <td className="px-2 py-1.5 text-center">

                          <button
                            onClick={() => removeTask(task.id)}
                            className="text-slate-300 hover:text-red-500 transition-all p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={12} />
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>


              <div className="flex justify-between items-center mt-6">

                <button
                  onClick={addTask}
                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-indigo-50 transition-all"
                >
                  <Plus size={14} /> Insert New Task Row
                </button>


                <button
                  onClick={async () => {
                    if (!deliverableId) return;
                    await bulkSaveActivities(deliverableId, tasks);
                    alert("Tasks saved successfully");
                  }}
                  className="flex items-center gap-2 px-8 py-2 bg-[#1F3A8A] text-white rounded-xl text-[11px] font-bold hover:bg-indigo-900 transition-all shadow-lg shadow-indigo-100"
                >
                  <Save size={14} /> Commit Changes
                </button>

              </div>

            </div>

          )}
{activeTab === 'documents' && (

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500">

{/* Existing Documents */}

{documents.map((doc, idx) => (

<div
key={idx}
className="bg-white p-6 rounded-[24px] border border-slate-100 flex flex-col items-start gap-6 hover:border-indigo-50 hover:shadow-2xl transition-all cursor-pointer group shadow-sm"
>

<div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-[#1F3A8A] group-hover:text-white transition-all shadow-sm">
<FileText size={28}/>
</div>

<div className="w-full">

<span className="text-sm font-bold text-slate-800 block truncate w-full mb-1">
{doc.file_name}
</span>

<span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
Document
</span>

</div>

<div className="w-full pt-4 border-t border-slate-50 flex justify-between items-center">

<span
onClick={() => downloadDocument(doc.file_name)}
className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest group-hover:text-indigo-600 cursor-pointer"
>
Download
</span>

<ChevronRight
size={14}
className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
/>

</div>

</div>

))}

{/* Upload Card */}

<div className="border-2 border-dashed border-slate-100 rounded-[24px] p-6 flex flex-col items-center justify-center gap-3 hover:border-indigo-200 transition-all group cursor-pointer text-slate-300 hover:text-indigo-400">

<input
type="file"
ref={fileInputRef}
style={{ display: "none" }}
onChange={async (e) => {

if (!e.target.files) return;

const file = e.target.files[0];

try {

const newDoc = await uploadDocument(file, selectedProject.project_id);

setDocuments([...documents, newDoc]);

} catch (err) {

console.error(err);
alert("Upload failed");

}

}}
/>

<div
onClick={() => fileInputRef.current?.click()}
className="cursor-pointer flex flex-col items-center gap-3"
>

<div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-all">
<Plus size={24}/>
</div>

<span className="text-xs font-bold uppercase tracking-widest">
Upload Asset
</span>

</div>

</div>

</div>

)}
            {activeTab === 'notebook' && (
            <div className="flex flex-col h-[600px] animate-in fade-in duration-500">
              <div className="flex gap-8 h-full">

                {/* Sidebar — real notes list */}
                <div className="w-1/3 border-r border-slate-100 pr-6 overflow-y-auto flex flex-col gap-4">
                  <button
                    onClick={handleNewNote}
                    className="w-full flex items-center justify-center gap-2 p-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    <Plus size={16} /> New Project Note
                  </button>

                  <div className="space-y-3 py-1">
                    {notesLoading && (
                      <p className="text-xs text-slate-400 text-center py-4">Loading notes...</p>
                    )}
                    {!notesLoading && notes.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-6">No notes yet. Create your first note.</p>
                    )}
                    {notes.map((note: any) => (
                      <div
                        key={note.note_id}
                        onClick={() => openNote(note)}
                        className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border shadow-sm ${
                          activeNote?.note_id === note.note_id
                            ? 'bg-indigo-50 border-indigo-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <h4 className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 truncate mb-1">
                          {note.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                          {note.content || 'No content'}
                        </p>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                            {new Date(note.updated_at || note.created_at).toLocaleDateString()}
                          </span>
                          <ChevronRight size={10} className="text-slate-300 group-hover:text-indigo-400 transition-all"/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Editor — real title + content */}
                <div className="flex-1 flex flex-col bg-slate-50/30 rounded-[32px] p-8 border border-slate-100 shadow-inner">
                  {!activeNote && !notesLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <NotebookPen size={32} className="text-slate-200 mb-3"/>
                      <p className="text-slate-500 font-semibold text-sm">Select a note or create a new one</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-indigo-600">
                            <NotebookPen size={22} />
                          </div>
                          <div>
                            <input
                              value={noteTitle}
                              onChange={e => setNoteTitle(e.target.value)}
                              className="text-lg font-extrabold text-slate-900 bg-transparent border-none outline-none focus:underline"
                              placeholder="Note title..."
                            />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {activeNote?.created_by || 'Alex Johnson'} • {activeNote?.updated_at ? new Date(activeNote.updated_at).toLocaleString() : 'Unsaved'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleDeleteNote}
                            className="p-2.5 bg-white text-slate-400 hover:text-red-500 border border-slate-100 rounded-xl transition-all shadow-sm"
                            title="Delete note"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={handleSaveNote}
                            disabled={notesSaving}
                            className="flex items-center gap-2 px-5 py-2 bg-[#1F3A8A] text-white rounded-xl text-xs font-bold hover:bg-indigo-900 transition-all shadow-lg shadow-indigo-100 disabled:opacity-60"
                          >
                            <Save size={14}/> {notesSaving ? 'Saving...' : 'Save Note'}
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={noteContent}
                        onChange={e => setNoteContent(e.target.value)}
                        className="w-full flex-1 bg-white rounded-[24px] border border-slate-100 p-8 text-sm text-slate-700 leading-relaxed outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none"
                        placeholder="Start typing your project notes here..."
                      />
                    </>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>

  );

};