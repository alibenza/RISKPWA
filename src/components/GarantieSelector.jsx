// src/components/GarantieSelector.jsx
import React from 'react';
import { Shield, Check } from 'lucide-react';

const garantiesList = [
  { id: 'Incendie_explosion', label: 'Incendie & Explosion', icon: '🔥' },
  { id: 'Degat_Des_Eaux', label: 'Dégâts des Eaux', icon: '💧' },
  { id: 'Tremblement_de_Terre', label: 'Tremblement de terre', icon: '🌍' },
  { id: 'inondation', label: 'Inondations', icon: '🌊' },
  { id: 'Tempetes', label: 'Tempêtes', icon: '🌪️' },
  { id: 'Vol', label: 'Vol & Vandalisme', icon: '🚨' },
  { id: 'Bris_De_Machine', label: 'Bris de Machines', icon: '⚙️' },
  { id: 'Perte_Exploitation', label: 'Pertes d\'Exploitation', icon: '📉' },
  { id: 'RC', label: 'Responsabilité Civile', icon: '⚖️' },
];

const GarantieSelector = ({ selected, onChange }) => {
  const toggleGarantie = (id) => {
    onChange(prev => 
      prev.includes(id) 
        ? prev.filter(g => g !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {garantiesList.map((garantie) => {
        const isSelected = selected.includes(garantie.id);
        
        return (
          <button
            key={garantie.id}
            onClick={() => toggleGarantie(garantie.id)}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
              isSelected
                ? 'border-primary-500 bg-primary-50 text-primary-900'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="text-2xl">{garantie.icon}</span>
            <div className="flex-1">
              <p className="text-xs font-bold leading-tight">{garantie.label}</p>
            </div>
            {isSelected && <Check size={16} className="text-primary-600 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
};

export default GarantieSelector;
