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
- Satisfaction Expert: ${expertSatisfaction}%
- Garanties: ${nomsGarantiesCochees}
- Sites analysés: ${multiSiteData.length}

Réponds UNIQUEMENT en JSON valide avec cette structure:
{
  "score_global": number (0-100),
  "synthese_executive": "string (2-3 phrases)",
  "analyse_par_site": [
    {
      "siteName": "string",
      "score": number,
      "points_forts": ["string"],
      "points_faibles": ["string"],
      "recommandations": ["string"]
    }
  ],
  "analyse_par_garantie": {
    "Incendie": { "score": number, "risques": ["string"], "recommandations": ["string"] }
  },
  "points_vigilance_critiques": [
    { "site": "string", "risque": "string", "niveau": "critique|majeur|mineur" }
  ],
  "synthese_technique": "string"
}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${apiKey}` 
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: JSON.stringify(multiSiteData) }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 4000
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Erreur HTTP ${response.status}`);
      }

      const rawData = await response.json();
      const content = rawData.choices?.[0]?.message?.content;
      
      if (!content) throw new Error('Réponse API invalide');
      
      let parsedResults;
      try {
        parsedResults = JSON.parse(content);
      } catch (parseError) {
        console.error('JSON Parse Error:', content);
        throw new Error('Format de réponse invalide');
      }
      
      // Validate required fields
      if (typeof parsedResults.score_global !== 'number') {
        throw new Error('Structure de données incomplète');
      }
      
      setAiResults(parsedResults);
      
    } catch (error) {
      console.error('Analysis Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Trigger export via store or utility
    const exportData = {
      auditorInfo,
      site: allSites[activeSiteId],
      aiResults,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RAPPORT_AI_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500 rounded-xl shadow-lg">
              <BrainCircuit size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">RiskPro <span className="text-primary-400">Intelligence</span></h2>
              <div className="flex bg-slate-800 p-1 rounded-lg mt-2 border border-slate-700">
                <button 
                  onClick={() => setActiveTab('corporate')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                    activeTab === 'corporate' ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutDashboard size={12} /> Analyse Corporate
                </button>
                <button 
                  onClick={() => setActiveTab('smp_chat')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                    activeTab === 'smp_chat' ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquareText size={12} /> Co-rédaction SMP
                </button>
              </div>
            </div>
          </div>

          {aiResults && (
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all shadow-lg"
            >
              <FileDown size={16} /> Exporter
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="card border-l-4 border-l-red-500 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {activeTab === 'corporate' ? (
        <div className="animate-in fade-in duration-500">
          {!aiResults ? (
            <div className="card space-y-6">
              <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
                <Layers className="text-primary-600" size={24} />
                <div>
                  <p className="text-sm font-bold text-primary-900 uppercase">
                    Analyse Multi-sites
                  </p>
                  <p className="text-xs text-primary-700">
                    {Object.keys(allSites).length} site(s) • {Object.keys(responses).length} réponses
                  </p>
                </div>
              </div>

              {/* Configuration */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">
                    Garanties à analyser
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {garantiesLib.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGaranties(prev => 
                          prev.includes(g.id) 
                            ? prev.filter(id => id !== g.id)
                            : [...prev, g.id]
                        )}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedGaranties.includes(g.id)
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">
                      Sévérité
                    </label>
                    <select 
                      value={severity} 
                      onChange={(e) => setSeverity(e.target.value)}
                      className="input-field"
                    >
                      <option value="Faible">Faible</option>
                      <option value="Moyenne">Moyenne</option>
                      <option value="Élevée">Élevée</option>
                      <option value="Critique">Critique</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">
                      Satisfaction Expert (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={expertSatisfaction}
                      onChange={(e) => setExpertSatisfaction(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-xs font-bold text-primary-600 mt-1">
                      {expertSatisfaction}%
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={runDetailedAnalysis} 
                disabled={loading || selectedGaranties.length === 0}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
                {loading ? 'Analyse en cours...' : 'Générer l\'expertise Corporate'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results Display */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-6 rounded-2xl text-white flex flex-col justify-center items-center shadow-xl border-b-4 border-primary-500">
                  <span className="text-5xl font-black">{aiResults?.score_global}%</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-400 mt-2">Score Global</span>
                </div>
                <div className="md:col-span-3 card flex items-center">
                  <p className="text-slate-700 leading-relaxed">
                    <Building2 className="inline mr-2 text-primary-500" size={20} />
                    {aiResults?.synthese_executive}
                  </p>
                </div>
              </div>

              {/* Site Analysis */}
              {aiResults?.analyse_par_site?.map((site, idx) => (
                <div key={idx} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900">{site.siteName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      site.score >= 80 ? 'bg-green-100 text-green-700' :
                      site.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {site.score}/100
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-green-700 mb-2">Points forts</p>
                      <ul className="space-y-1">
                        {site.points_forts?.map((p, i) => (
                          <li key={i} className="text-slate-600 text-xs">• {p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-red-700 mb-2">Points faibles</p>
                      <ul className="space-y-1">
                        {site.points_faibles?.map((p, i) => (
                          <li key={i} className="text-slate-600 text-xs">• {p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-primary-700 mb-2">Recommandations</p>
                      <ul className="space-y-1">
                        {site.recommandations?.map((r, i) => (
                          <li key={i} className="text-slate-600 text-xs">• {r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}

              {/* Critical Alerts */}
              {aiResults?.points_vigilance_critiques?.length > 0 && (
                <div className="card border-l-4 border-l-red-500">
                  <h3 className="font-bold text-red-700 mb-4 flex items-center gap-2">
                    <AlertCircle size={20} /> Points de vigilance critiques
                  </h3>
                  <div className="space-y-2">
                    {aiResults.points_vigilance_critiques.map((alert, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-sm text-red-900">{alert.risque}</p>
                          <p className="text-xs text-red-600">{alert.site}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          alert.niveau === 'critique' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'
                        }`}>
                          {alert.niveau}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-right duration-500">
          <div className="lg:col-span-7">
            <AIChatRoom />
          </div>
          <div className="lg:col-span-5">
            <SMPPreview />
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
