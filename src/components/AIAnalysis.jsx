// src/components/AIAnalysis.jsx
import React, { useState } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { 
  BrainCircuit, 
  Loader2, 
  FileDown, 
  Zap, 
  Building2, 
  Layers,
  MessageSquareText,
  LayoutDashboard,
  AlertCircle
} from 'lucide-react';
import AIChatRoom from './AIChatRoom';
import SMPPreview from './SMPPreview';
import AlertSection from './AlertSection';

const AIAnalysis = () => {
  const { 
    allSites, 
    responses, 
    questionsConfig, 
    aiResults, 
    setAiResults, 
    auditorInfo,
    activeSiteId
  } = useInspectionStore();
  
  const [loading, setLoading] = useState(false);
  const [selectedGaranties, setSelectedGaranties] = useState(['Incendie_explosion', 'Bris_De_Machine', 'RC']);
  const [expertSatisfaction, setExpertSatisfaction] = useState(80);
  const [severity, setSeverity] = useState('Moyenne');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('corporate');

  const garantiesLib = [
    { id: 'Incendie_explosion', label: 'Incendie & Explosion' },
    { id: 'Degat_Des_Eaux', label: 'Dégâts des Eaux' },
    { id: 'Tremblement_de_Terre', label: 'Tremblement de terre' },
    { id: 'inondation', label: 'Inondations' },
    { id: 'Tempetes', label: 'Tempêtes' },
    { id: 'Vol', label: 'Vol & Vandalisme' },
    { id: 'Bris_De_Machine', label: 'Bris de Machines' },
    { id: 'Perte_Exploitation', label: 'Pertes d\'Exploitation' },
    { id: 'RC', label: 'Resp. Civile' },
  ];

  const runDetailedAnalysis = async () => {
    if (selectedGaranties.length === 0) {
      setError("Sélectionnez au moins une garantie");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error('Clé API manquante');

      const multiSiteData = Object.entries(allSites).map(([id, site]) => {
        const siteResponses = Object.keys(site.responses || {}).map(qId => {
          const section = questionsConfig.find(s => s.questions.some(q => q.id === qId));
          const q = section?.questions.find(qu => qu.id === qId);
          if (!q) return null;
          
          const resp = site.responses[qId];
          return {
            section: section?.title,
            label: q.label,
            score: resp.score,
            value: resp.value,
            comment: resp.comment || 'RAS',
            isScored: q.isScored
          };
        }).filter(Boolean);

        return { 
          siteId: id,
          siteName: site.name, 
          data: siteResponses,
          alertCount: siteResponses.filter(r => r.score <= 2).length
        };
      });

      const nomsGarantiesCochees = selectedGaranties.map(id => 
        garantiesLib.find(g => g.id === id)?.label
      ).join(", ");

      const systemPrompt = `Tu es un Ingénieur Souscripteur Senior IARD pour le marché algérien. 
Analyse les données d'inspection multi-sites et génère un rapport structuré en JSON.

Règles:
- Sévérité: ${severity}
