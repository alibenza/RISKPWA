// src/App.jsx
import React, { useEffect, useState } from 'react';
import { useInspectionStore } from './hooks/useInspectionStore';
import MainNavigation from './components/MainNavigation';
import Dashboard from './components/Dashboard';
import InspectionForm from './components/InspectionForm';
import AIAnalysis from './components/AIAnalysis';
import History from './components/History';
import SiteManager from './components/SiteManager';
import AuditorSettings from './components/AuditorSettings';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const isLoaded = useInspectionStore((state) => state.isLoaded);
  const forceSave = useInspectionStore((state) => state.forceSave);

  // Handle force save event
  useEffect(() => {
    const handleForceSave = () => {
      forceSave();
    };
    window.addEventListener('force-save-store', handleForceSave);
    return () => window.removeEventListener('force-save-store', handleForceSave);
  }, [forceSave]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'inspection':
        return <InspectionForm />;
      case 'analysis':
        return <AIAnalysis />;
      case 'history':
        return <History />;
      case 'sites':
        return <SiteManager />;
      case 'settings':
        return <AuditorSettings />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderView()}
      </main>
      <MainNavigation currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
}

export default App;
