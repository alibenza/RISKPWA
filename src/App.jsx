import React, { useState, useEffect } from 'react';
import { useInspectionStore } from './hooks/useInspectionStore';
import MainNavigation from './components/MainNavigation';
import Dashboard from './components/Dashboard';
import InspectionForm from './components/InspectionForm';
import AIAnalysis from './components/AIAnalysis';
import History from './components/History';
import SiteManager from './components/SiteManager';
import AuditorSettings from './components/AuditorSettings';

// Maximum time to wait for store rehydration (ms)
const MAX_LOADING_TIME = 3000;

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [forceReady, setForceReady] = useState(false);
  
  const isLoaded = useInspectionStore((state) => state.isLoaded);
  const forceSave = useInspectionStore((state) => state.forceSave);
  
  // Force ready after timeout to prevent infinite loading
  const actuallyLoaded = isLoaded || forceReady;

  useEffect(() => {
    // Safety timeout: force app ready after MAX_LOADING_TIME
    const timer = setTimeout(() => {
      if (!isLoaded) {
        console.warn('[App] Store rehydration timeout, forcing ready state');
        setForceReady(true);
      }
    }, MAX_LOADING_TIME);

    return () => clearTimeout(timer);
  }, [isLoaded]);

  useEffect(() => {
    const handleForceSave = () => forceSave();
    window.addEventListener('force-save-store', handleForceSave);
    return () => window.removeEventListener('force-save-store', handleForceSave);
  }, [forceSave]);

  // Loading screen
  if (!actuallyLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center
