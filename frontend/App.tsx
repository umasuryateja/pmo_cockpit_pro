import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Menu as MenuIcon,
  X,
  Gauge,
  Settings,
  Maximize,
  Minimize
} from 'lucide-react';
import { MainMenu } from './types';
import { MENU_ICONS } from './constants';
import { ErrorBoundary } from './components/ErrorBoundary';

import { ControlModule } from './components/ControlModule';
import DefineModule from "./components/DefineModule";
import { PlanModule } from './components/PlanModule';
import { ExecuteModule } from './components/ExecuteModule';
import { ConfigModule } from './components/ConfigModule';
import { AIPolicies } from './components/AIPolicies';

const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MainMenu>('Control');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const renderModule = () => {
    switch (activeMenu) {
      case 'Control':
        return <ErrorBoundary moduleName="Control"><ControlModule /></ErrorBoundary>;
      case 'Define':
        return <ErrorBoundary moduleName="Define"><DefineModule /></ErrorBoundary>;
      case 'Plan':
        return <ErrorBoundary moduleName="Plan"><PlanModule /></ErrorBoundary>;
      case 'Execute':
        return <ErrorBoundary moduleName="Execute"><ExecuteModule /></ErrorBoundary>;
      case 'Configuration':
        return <ErrorBoundary moduleName="Configuration"><ConfigModule /></ErrorBoundary>;
      case 'AI Policies':
        return <ErrorBoundary moduleName="AI Policies"><AIPolicies /></ErrorBoundary>;
      default:
        return <ErrorBoundary moduleName="Control"><ControlModule /></ErrorBoundary>;
    }
  };

  return (
    <div className="min-h-screen flex text-slate-900 selection:bg-indigo-100">
      <aside className={`bg-[#1F3A8A] text-white/70 w-72 fixed lg:static inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 z-30 flex flex-col shadow-2xl`}>
        <div className="p-8 flex items-start gap-4 mb-4">
          <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-inner group transition-all hover:bg-white/20">
            <Gauge className="text-white" size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white tracking-tighter leading-none">PM COCKPIT</span>
            <div className="mt-2 flex flex-col">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.1em] leading-tight">Project Management System</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-2">
          <div className="px-4 mb-2">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Operations Console</span>
          </div>
          {(Object.keys(MENU_ICONS) as MainMenu[]).map((menuKey) => {
            const isActive = activeMenu === menuKey;
            return (
              <button
                key={menuKey}
                onClick={() => setActiveMenu(menuKey)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all group relative ${
                  isActive
                    ? 'bg-white/10 text-white shadow-lg border border-white/10'
                    : 'hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                  {MENU_ICONS[menuKey]}
                </span>
                <span className="flex-1 text-left">{menuKey}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/10">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-indigo-900 border border-white/10 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              AJ
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Alex Johnson</p>
              <p className="text-[10px] text-white/40 truncate font-semibold uppercase tracking-wider">Flight Commander</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden bg-[#F8FAFC]">
        <header className="bg-white/80 backdrop-blur-md h-20 border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors">
              {isSidebarOpen ? <X size={22} /> : <MenuIcon size={22} />}
            </button>
            <div className="relative group hidden xl:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Search Cockpit Resources..."
                className="pl-12 pr-6 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm w-96 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder:text-slate-300 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end border-r border-slate-200 pr-6">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">System Status</span>
               <span className="text-sm font-bold text-[#1F3A8A] flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 ALL SYSTEMS GO
               </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleFullScreen}
                title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
                className="p-2.5 text-slate-400 hover:text-[#1F3A8A] hover:bg-slate-50 rounded-xl transition-all"
              >
                {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
              </button>
              <button className="relative p-2.5 text-slate-400 hover:text-[#1F3A8A] hover:bg-slate-50 rounded-xl transition-all">
                <Bell size={22} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2.5 text-slate-400 hover:text-[#1F3A8A] hover:bg-slate-50 rounded-xl transition-all">
                <Settings size={22} />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {renderModule()}
        </div>
      </main>
    </div>
  );
};

export default App;
