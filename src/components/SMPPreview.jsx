// src/components/SMPPreview.jsx
import React from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { Calculator, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../utils/smpCalculations';

const SMPPreview = () => {
  const smpData = useInspectionStore(state => state.smpData);
  
  const totalValeurs = (smpData.valeurs?.batiment || 0) + 
                      (smpData.valeurs?.materiel || 0) + 
                      (smpData.valeurs?.stocks || 0);

  const hasData = smpData.smpFinal > 0 || smpData.scenario;

  if (!hasData) {
    return (
      <div className="h-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center p-8">
        <div className="text-center">
          <Calculator className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 font-medium">Aucun SMP calculé</p>
          <p className="text-slate-400 text-sm mt-1">Validez la discussion pour générer le rapport</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="bg-primary-600 p-4 text-white">
        <div className="flex items-center gap-2">
          <FileText size={20} />
          <h3 className="font-bold">Rapport de Scénario SMP</h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* SMP Final */}
        <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
          <p className="text-xs font-bold text-primary-600 uppercase mb-1">SMP Final</p>
          <p className="text-3xl font-black text-primary-900">
            {formatCurrency(smpData.smpFinal)}
          </p>
        </div>

        {/* Valeurs détaillées */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase">Valeurs exposées</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Bâtiments</p>
              <p className="font-bold text-slate-900">{formatCurrency(smpData.valeurs?.batiment || 0)}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Matériel</p>
              <p className="font-bold text-slate-900">{formatCurrency(smpData.valeurs?.materiel || 0)}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Stocks</p>
              <p className="font-bold text-slate-900">{formatCurrency(smpData.valeurs?.stocks || 0)}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">Perte d'Exploitation</p>
              <p className="font-bold text-slate-900">{formatCurrency(smpData.valeurs?.pe || 0)}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-100 rounded-lg flex justify-between items-center">
            <span className="text-sm text-slate-600">Total valeurs assurables</span>
            <span className="font-bold text-slate-900">{formatCurrency(totalValeurs)}</span>
          </div>
        </div>

        {/* Scénario */}
        {smpData.scenario && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase">Scénario retenu</h4>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900 leading-relaxed">{smpData.scenario}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hypothèses */}
        {smpData.hypotheses?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase">Hypothèses techniques</h4>
            <ul className="space-y-1">
              {smpData.hypotheses.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SMPPreview;
