
import React from 'react';
import { 
  ShieldAlert, 
  Target, 
  Calendar, 
  CheckSquare, 
  Settings, 
  Bot
} from 'lucide-react';
import { MainMenu, Project } from './types';

export const COLORS = {
  primary: '#1F3A8A', // Indigo Blue
  accent: '#0D9488',  // Teal
  onTrack: '#16A34A', // Green
  atRisk: '#F59E0B',  // Amber
  offTrack: '#DC2626',// Red
  background: '#F8FAFC'
};

export const MENU_ICONS: Record<MainMenu, React.ReactNode> = {
  'Control': <ShieldAlert size={20} />,
  'Define': <Target size={20} />,
  'Plan': <Calendar size={20} />,
  'Execute': <CheckSquare size={20} />,
  'Configuration': <Settings size={20} />,
  'AI Policies': <Bot size={20} />
};

export const MOCK_PROJECTS: Project[] = [
  { 
    id: 1, 
    name: 'Cloud Infrastructure Upgrade', 
    code: 'CIU-2024', 
    status: 'Active', 
    manager: 'Sarah Chen', 
    description: 'Upgrading core data center assets to hybrid cloud architecture.',
    health: 'On Track',
    client: 'Global Tech Corp',
    startDate: '2024-01-15',
    endDate: '2024-12-20',
    tasksTotal: 145,
    tasksPending: 32
  },
  { 
    id: 2, 
    name: 'Mobile App Redesign', 
    code: 'MAR-002', 
    status: 'Planning', 
    manager: 'Alex Rivera', 
    description: 'Full UX/UI overhaul for the customer-facing mobile application.',
    health: 'At Risk',
    client: 'FinStream Inc',
    startDate: '2024-03-01',
    endDate: '2024-08-15',
    tasksTotal: 88,
    tasksPending: 74
  },
  { 
    id: 3, 
    name: 'Security Compliance Audit', 
    code: 'SCA-99', 
    status: 'On Hold', 
    manager: 'Michael Scott', 
    description: 'Internal review of security protocols for ISO 27001.',
    health: 'Off Track',
    client: 'Dunder Mifflin',
    startDate: '2024-05-10',
    endDate: '2024-11-01',
    tasksTotal: 42,
    tasksPending: 12
  }
];
