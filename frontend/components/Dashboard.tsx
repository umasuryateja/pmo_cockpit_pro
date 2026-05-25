
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const data = [
  { name: 'Week 1', completed: 12, pending: 40 },
  { name: 'Week 2', completed: 25, pending: 35 },
  { name: 'Week 3', completed: 35, pending: 25 },
  { name: 'Week 4', completed: 48, pending: 15 },
];

const pieData = [
  { name: 'Critical', value: 4 },
  { name: 'Major', value: 8 },
  { name: 'Minor', value: 15 },
];

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Overall Progress" value="68%" icon={<TrendingUp className="text-blue-500" />} change="+5% from last week" />
        <StatCard title="Open Risks" value="12" icon={<AlertCircle className="text-red-500" />} change="2 added today" />
        <StatCard title="Tasks Completed" value="124" icon={<CheckCircle2 className="text-green-500" />} change="8 today" />
        <StatCard title="Next Milestone" value="14 Days" icon={<Clock className="text-orange-500" />} change="Release 1.2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Task Burn-down</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#6366f1" name="Completed Tasks" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#e2e8f0" name="Pending Tasks" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, change }: { title: string; value: string; icon: React.ReactNode; change: string }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
    <div className="flex justify-between items-start mb-2">
      <span className="text-slate-500 text-sm font-medium">{title}</span>
      {icon}
    </div>
    <div className="text-2xl font-bold text-slate-900">{value}</div>
    <div className="text-xs text-slate-400 mt-1">{change}</div>
  </div>
);
