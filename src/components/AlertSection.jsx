// src/components/AlertSection.jsx
import React from 'react';
import { AlertTriangle, CheckCircle, Camera, ChevronRight } from 'lucide-react';

const severityConfig = {
  high: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-800',
    badge: 'Critique',
    badgeColor: 'bg-red-100 text-red-700'
  },
  medium: {
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-800',
    badge: 'Moyen',
    badgeColor: 'bg-amber-100 text-amber-700'
  },
  low: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-800',
    badge: 'Faible',
    badgeColor: 'bg-blue-100 text-blue-700'
  }
};

const AlertSection = ({ alerts, compact = false, onAlertClick }) => {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Aucun point de vigilance
        </h3>
        <p className="text-sm text-slate-500">
          Tous les éléments inspectés sont conformes aux normes.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${compact ? 'max-h-64 overflow-y-auto' : ''}`}>
      {alerts.map((alert, index) => {
        const config = severityConfig[alert.severity] || severityConfig.high;
        
        return (
          <div 
            key={alert.id}
            onClick={() => onAlertClick?.(alert)}
            className={`${config.bgColor} border-l-4 ${config.borderColor} p-4 rounded-r-xl ${
              onAlertClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${config.badgeColor}`}>
                  {config.badge}
                </span>
                {alert.photos?.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Camera size={12} />
                    {alert.photos.length}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">
                {new Date(alert.timestamp).toLocaleDateString('fr-FR')}
              </span>
            </div>
            
            <p className={`font-semibold ${config.textColor} text-sm mb-1`}>
              {alert.category}
            </p>
            <p className={`text-sm ${config.textColor} opacity-90 mb-2`}>
              {alert.question}
            </p>
            
            {alert.comment && !compact && (
              <p className="text-xs text-slate-600 bg-white/50 p-2 rounded-lg mt-2">
                {alert.comment}
              </p>
            )}
            
            {onAlertClick && (
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                Voir détails <ChevronRight size={12} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AlertSection;
