// src/components/MainNavigation.jsx
import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  BrainCircuit, 
  History, 
  Building2, 
  Settings,
  AlertCircle
} from 'lucide-react';
import { useInspectionStore, useAlerts } from '../hooks/useInspectionStore';

const MainNavigation = ({ currentView, onNavigate }) => {
  const alerts = useAlerts();
  const alertCount = alerts.length;
  
  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'inspection', label: 'Inspection', icon: ClipboardList },
    { id: 'analysis', label: 'Analyse IA', icon: BrainCircuit },
    { id: 'sites', label: 'Sites', icon: Building2 },
    { id: 'history', label: 'Historique', icon: History },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-inset-bottom z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const showBadge = item.id === 'inspection' && alertCount > 0;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {showBadge && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {alertCount > 9 ? '9+' : alertCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;
