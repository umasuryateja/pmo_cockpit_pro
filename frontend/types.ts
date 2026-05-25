
export type MainMenu = 'Control' | 'Define' | 'Plan' | 'Execute' | 'Configuration' | 'AI Policies';

export interface TabInfo {
  id: number | null;
  label: string;
}

export interface Project {
  id: number | null;
  project_id?: number;
  name?: string;
  project_name?: string;
  code?: string;
  project_code?: string;
  status?: 'Active' | 'On Hold' | 'Completed' | 'Planning' | string;
  manager?: string;
  project_manager?: string;
  description?: string;
  health?: 'On Track' | 'At Risk' | 'Off Track' | string;
  client?: string;
  client_name?: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  tasksTotal?: number;
  tasksPending?: number;
}

export interface AIPolicy {
  id: string | number | null;
  name: string;
  rule: string;
  enabled: boolean;
}

export type TaskType = 'Documentation' | 'Build' | 'Infra' | 'Testing' | 'UAT' | 'Live';

export interface ExecutionTask {
  id: number | null;
  activity: string;
  assignee: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  blocker: string;
  blockerOwner: string;
  sprint: string;
  taskType: TaskType | string;
}
