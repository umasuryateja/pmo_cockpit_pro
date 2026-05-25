
import React, { useState } from 'react';
import { Bot, Sparkles, Send, ShieldCheck, ToggleLeft, ToggleRight, Plus, Trash2 } from 'lucide-react';
import { generateBusinessRule } from '../services/geminiService';
import { AIPolicy } from '../types';

export const AIPolicies: React.FC = () => {
  const [policies, setPolicies] = useState<AIPolicy[]>([
    { id: '1', name: 'High Risk Escalation', rule: 'Any risk with High impact must be escalated to Steering Committee within 24 hours.', enabled: true },
    { id: '2', name: 'Budget Variance', rule: 'Budget variances over 10% trigger an automatic internal audit.', enabled: false },
  ]);
  const [newRulePrompt, setNewRulePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!newRulePrompt.trim()) return;
    setIsGenerating(true);
    const ruleText = await generateBusinessRule(newRulePrompt);
    const newPolicy: AIPolicy = {
      id: Date.now().toString(),
      name: 'AI Generated Policy',
      rule: ruleText || 'Policy content missing',
      enabled: true
    };
    setPolicies([newPolicy, ...policies]);
    setNewRulePrompt('');
    setIsGenerating(false);
  };

  const togglePolicy = (id: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const deletePolicy = (id: string) => {
    setPolicies(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <Sparkles className="absolute top-4 right-4 text-indigo-200 opacity-50" size={64} />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <Bot /> AI Business Rules Engine
          </h2>
          <p className="text-indigo-100 max-w-xl">
            Configure automated business rules and policies using generative AI. 
            Describe a scenario or a governance rule, and let Gemini draft the formal policy.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Plus size={18} /> Generate New Policy
        </h3>
        <div className="flex gap-2">
          <textarea
            value={newRulePrompt}
            onChange={(e) => setNewRulePrompt(e.target.value)}
            placeholder="e.g., Define a rule for project delays and resource reallocation..."
            className="flex-1 min-h-[100px] p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !newRulePrompt}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            {isGenerating ? 'Drafting...' : <><Sparkles size={16} /> Draft Policy</>}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <ShieldCheck size={18} className="text-green-600" /> Active Policies
        </h3>
        <div className="grid gap-4">
          {policies.map(policy => (
            <div key={policy.id} className={`p-5 rounded-xl border transition-all ${policy.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-slate-900">{policy.name}</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{policy.rule}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => togglePolicy(policy.id)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                    {policy.enabled ? <ToggleRight size={28} className="text-indigo-600" /> : <ToggleLeft size={28} />}
                  </button>
                  <button onClick={() => deletePolicy(policy.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${policy.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                  {policy.enabled ? 'Active' : 'Inactive'}
                </span>
                <span className="text-[10px] text-slate-400">Created via Gemini Assistant</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
