// src/components/AuditorSettings.jsx
import React, { useRef } from 'react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import { User, Building2, Image as ImageIcon, Calendar, Download, Upload, Trash2, Database } from 'lucide-react';

const AuditorSettings = () => {
  const { 
    auditorInfo, 
    setAuditorInfo, 
    exportAudit, 
    importAudit, 
    resetAudit,
    getStorageStats
  } = useInspectionStore();
  
  const fileInputRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo trop volumineux (max 2MB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAuditorInfo({ logo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const result = await importAudit(file);
    if (result.success) {
      alert(result.migrated 
        ? 'Données importées et migrées vers le format multi-sites' 
        : `Import réussi : ${result.siteCount} site(s)`
      );
    } else {
      alert('Erreur d\'import : ' + result.error);
    }
  };

  const handleExport = async () => {
    await exportAudit();
  };

  const handleReset = () => {
    if (confirm('ATTENTION : Cette action supprimera TOUTES les données. Êtes-vous sûr ?')) {
      resetAudit();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>

      {/* Profile Card */}
      <div className="card space-y-4">
        <h3 className="section-title">Profil de l'expert</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Nom de l'expert"
              className="input-field pl-10"
              value={auditorInfo?.name || ''}
              onChange={(e) => setAuditorInfo({ name: e.target.value })}
            />
          </div>
          
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cabinet / Entreprise"
              className="input-field pl-10"
              value={auditorInfo?.company || ''}
              onChange={(e) => setAuditorInfo({ company: e.target.value })}
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="date" 
              className="input-field pl-10"
              value={auditorInfo?.inspectionDate || ''}
              onChange={(e) => setAuditorInfo({ inspectionDate: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase cursor-pointer hover:bg-primary-600 transition-colors">
            <ImageIcon size={14} />
            {auditorInfo?.logo ? 'Changer le logo' : 'Ajouter un logo'}
            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
          </label>
          
          {auditorInfo?.logo && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200">
                <img src={auditorInfo.logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={() => setAuditorInfo({ logo: null })}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="card space-y-4">
        <h3 className="section-title">Gestion des données</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 p-4 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-xl transition-colors"
          >
            <Download size={20} className="text-primary-600" />
            <div className="text-left">
              <p className="text-sm font-bold text-primary-900">Exporter</p>
              <p className="text-xs text-primary-600">Sauvegarder toutes les données</p>
            </div>
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            <Upload size={20} className="text-slate-600" />
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">Importer</p>
              <p className="text-xs text-slate-500">Restaurer une sauvegarde</p>
            </div>
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept=".json,application/json" 
            onChange={handleImport}
          />
        </div>

        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <div className="flex items-start gap-3">
            <Trash2 size={20} className="text-red-600 shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 text-sm">Zone de danger</h4>
              <p className="text-xs text-red-700 mt-1 mb-3">
                La suppression des données est irréversible. Toutes les inspections seront perdues.
              </p>
              <button 
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-lg transition-colors"
              >
                Tout réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <div className="card">
        <h3 className="section-title flex items-center gap-2">
          <Database size={14} /> Stockage local
        </h3>
        <p className="text-sm text-slate-600">
          Les données sont stockées localement sur cet appareil via IndexedDB.
          Utilisez l'export pour créer des sauvegardes.
        </p>
      </div>
    </div>
  );
};

export default AuditorSettings;
