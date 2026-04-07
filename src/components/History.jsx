// src/components/History.jsx
import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { Clock, Building2, TrendingUp, Trash2, RotateCcw, Calendar } from 'lucide-react';

const History = () => {
  const history = useInspectionStore(state => state.history);
  const loadFromHistory = useInspectionStore(state => state.loadFromHistory);
  const deleteFromHistory = useInspectionStore(state => state.deleteFromHistory);
  const clearHistory = useInspectionStore(state => state.clearHistory);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Historique</h1>
        {history.length > 0 && (
          <button 
            onClick={() => {
              if (confirm('Vider tout l\'historique ?')) clearHistory();
            }}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Tout supprimer
          </button>
        )}
      </div>

      <div className="space-y-3">
        {history.map((entry) => (
          <div key={entry.id} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-slate-900">{entry.client}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getScoreColor(entry.score)}`}>
                    {entry.score}%
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Building2 size={12} />
                    {entry.siteName || 'Site unique'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {entry.date}
                  </span>
                  <span>{entry.activite}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadFromHistory(entry)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Restaurer cette version"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={() => deleteFromHistory(entry.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {history.length === 0 && (
          <div className="text-center py-12">
            <Clock size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun historique</h3>
            <p className="text-slate-500 text-sm">Les analyses générées apparaîtront ici</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
