// src/components/Dashboard.jsx
import React from 'react';
import { 
  Building2, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { 
  useInspectionStore, 
  useSiteCount, 
  useCurrentSiteName,
  useGlobalScore,
  useAlerts,
  useSectionScores
} from '../hooks/useInspectionStore';
import { calculateRiskLevel } from '../utils/scoring';
import RiskChart from './RiskChart';
import AlertSection from './AlertSection';

const Dashboard = ({ onNavigate }) => {
  const siteCount = useSiteCount();
  const currentSiteName = useCurrentSiteName();
  const globalScore = useGlobalScore();
  const alerts = useAlerts();
  const sectionScores = useSectionScores();
  const auditorInfo = useInspectionStore(state => state.auditorInfo);
  
  const riskLevel = calculateRiskLevel(globalScore);
  const criticalAlerts = alerts.filter(a => a.severity === 'high').length;

  const quickStats = [
    {
      label: 'Sites inspectés',
      value: siteCount,
      icon: Building2,
      color: 'blue'
    },
    {
      label: 'Score global',
      value: `${globalScore}%`,
      icon: TrendingUp,
      color: riskLevel.color,
      trend: riskLevel.label
    },
    {
      label: 'Points de vigilance',
      value: alerts.length,
      icon: AlertTriangle,
      color: alerts.length > 0 ? 'red' : 'green',
      subtext: criticalAlerts > 0 ? `${criticalAlerts} critiques` : null
    },
    {
      label: 'Date de visite',
      value: auditorInfo.inspectionDate 
        ? new Date(auditorInfo.inspectionDate).toLocaleDateString('fr-FR')
        : 'Non définie',
      icon: Calendar,
      color: 'slate'
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 text-sm mt-1">
            Site actuel : <span className="font-semibold text-slate-700">{currentSiteName}</span>
          </p>
        </div>
        <button 
          onClick={() => onNavigate('inspection')}
          className="btn-primary flex items-center gap-2"
        >
          Continuer l'inspection
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            yellow: 'bg-yellow-50 text-yellow-600',
            orange: 'bg-orange-50 text-orange-600',
            red: 'bg-red-50 text-red-600',
            slate: 'bg-slate-50 text-slate-600'
          }[stat.color];

          return (
            <div key={idx} className="card p-4">
              <div className={`w-10 h-10 rounded-xl ${colorClasses} flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              {stat.trend && (
                <p className={`text-xs font-semibold mt-1 ${
                  stat.color === 'green' ? 'text-green-600' : 
                  stat.color === 'red' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  Risque {stat.trend}
                </p>
              )}
              {stat.subtext && (
                <p className="text-xs text-red-600 font-semibold mt-1">
                  {stat.subtext}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="section-title">Répartition des risques</h3>
          <RiskChart data={sectionScores} />
        </div>
        
        <div className="card">
          <h3 className="section-title flex items-center gap-2">
            Points de vigilance
            {alerts.length === 0 && <CheckCircle size={16} className="text-green-500" />}
          </h3>
          <AlertSection alerts={alerts.slice(0, 5)} compact />
          {alerts.length > 5 && (
            <button 
              onClick={() => onNavigate('inspection')}
              className="w-full mt-4 text-sm text-primary-600 font-medium hover:text-primary-700"
            >
              Voir les {alerts.length - 5} alertes restantes →
            </button>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="section-title">Activité récente</h3>
        <div className="space-y-3">
          {sectionScores.filter(s => s.answeredCount > 0).slice(0, 3).map((section, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="font-medium text-slate-900 text-sm">{section.title}</p>
                <p className="text-xs text-slate-500">
                  {section.answeredCount}/{section.questionCount} questions répondues
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      section.percentage >= 80 ? 'bg-green-500' :
                      section.percentage >= 60 ? 'bg-yellow-500' :
                      section.percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${section.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-semibold w-8 text-right">
                  {Math.round(section.percentage)}%
                </span>
              </div>
            </div>
          ))}
          {sectionScores.filter(s => s.answeredCount > 0).length === 0 && (
            <p className="text-center text-slate-400 py-8 text-sm">
              Aucune activité récente. Commencez votre inspection !
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
