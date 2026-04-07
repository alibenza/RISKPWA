// src/components/SiteManager.jsx
import React, { useState } from 'react';
import { Plus, Building2, MoreVertical, Edit2, Trash2, Check, X, ArrowRight } from 'lucide-react';
import { useInspectionStore, useSiteCount } from '../hooks/useInspectionStore';

const SiteManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  
  const sites = useInspectionStore(state => state.getSitesList());
  const activeSiteId = useInspectionStore(state => state.activeSiteId);
  const switchSite = useInspectionStore(state => state.switchSite);
  const createSite = useInspectionStore(state => state.createSite);
  const renameSite = useInspectionStore(state => state.renameSite);
  const deleteSite = useInspectionStore(state => state.deleteSite);
  const siteCount = useSiteCount();

  const handleCreate = () => {
    if (!newSiteName.trim()) return;
    createSite(newSiteName.trim());
    setNewSiteName('');
    setIsCreating(false);
  };

  const handleRename = (siteId) => {
    if (!editName.trim()) return;
    renameSite(siteId, editName.trim());
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (siteId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce site ? Cette action est irréversible.')) {
      deleteSite(siteId);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des sites</h1>
          <p className="text-slate-500 text-sm mt-1">{siteCount} site{siteCount > 1 ? 's' : ''} enregistré{siteCount > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Nouveau site
        </button>
      </div>

      {/* Create new site */}
      {isCreating && (
        <div className="card border-2 border-primary-200 bg-primary-50/30">
          <h3 className="font-semibold text-slate-900 mb-3">Créer un nouveau site</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nom du site"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="input-field flex-1"
              autoFocus
            />
            <button onClick={handleCreate} className="btn-primary">
              <Check size={18} />
            </button>
            <button onClick={() => setIsCreating(false)} className="btn-secondary">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Sites list */}
      <div className="space-y-3">
        {sites.map((site) => {
          const isActive = site.id === activeSiteId;
          const isEditing = editingId === site.id;

          return (
            <div 
              key={site.id} 
              className={`card p-4 flex items-center justify-between ${
                isActive ? 'border-2 border-primary-500 bg-primary-50/20' : ''
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isActive ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Building2 size={24} />
                </div>
                
                <div className="flex-1">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename(site.id)}
                        className="input-field py-1 text-sm"
                        autoFocus
                      />
                      <button onClick={() => handleRename(site.id)} className="text-green-600">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-red-600">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-slate-900">{site.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>{site.responseCount} réponses</span>
                        {site.hasAIResults && <span className="text-primary-600 font-medium">✓ Analysé</span>}
                        {site.hasSMP && <span className="text-green-600 font-medium">✓ SMP calculé</span>}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isActive && !isEditing && (
                  <button
                    onClick={() => switchSite(site.id)}
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Basculer vers ce site"
                  >
                    <ArrowRight size={18} />
                  </button>
                )}
                {isActive && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                    Actif
                  </span>
                )}
                {!isEditing && (
                  <div className="relative group">
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                      <MoreVertical size={18} />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[140px]">
                      <button
                        onClick={() => {
                          setEditingId(site.id);
                          setEditName(site.name);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Edit2 size={14} /> Renommer
                      </button>
                      {!isActive && (
                        <button
                          onClick={() => handleDelete(site.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} /> Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sites.length === 0 && (
        <div className="text-center py-12">
          <Building2 size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun site</h3>
          <p className="text-slate-500 mb-4">Créez votre premier site d'inspection</p>
          <button onClick={() => setIsCreating(true)} className="btn-primary">
            Créer un site
          </button>
        </div>
      )}
    </div>
  );
};

export default SiteManager;
