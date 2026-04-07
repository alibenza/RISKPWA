import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

// Simple in-memory fallback storage
const memoryStorage = {
  data: new Map(),
  getItem: async (name) => memoryStorage.data.get(name) || null,
  setItem: async (name, value) => memoryStorage.data.set(name, value),
  removeItem: async (name) => memoryStorage.data.delete(name),
};

// Attempt IndexedDB, fallback to memory
const createSafeStorage = () => {
  let useMemory = false;
  
  return {
    getItem: async (name) => {
      try {
        if (useMemory) return memoryStorage.getItem(name);
        const value = await get(name);
        return value ?? null;
      } catch (e) {
        console.warn('[Storage] Falling back to memory (get)', e);
        useMemory = true;
        return memoryStorage.getItem(name);
      }
    },
    setItem: async (name, value) => {
      try {
        if (useMemory) return memoryStorage.setItem(name, value);
        return await set(name, value);
      } catch (e) {
        console.warn('[Storage] Falling back to memory (set)', e);
        useMemory = true;
        return memoryStorage.setItem(name, value);
      }
    },
    removeItem: async (name) => {
      try {
        if (useMemory) return memoryStorage.removeItem(name);
        return await del(name);
      } catch (e) {
        console.warn('[Storage] Falling back to memory (remove)', e);
        useMemory = true;
        return memoryStorage.removeItem(name);
      }
    },
  };
};

const safeStorage = createSafeStorage();

const deepClone = (obj) => {
  try {
    if (typeof structuredClone === 'function') return structuredClone(obj);
  } catch (e) {}
  return JSON.parse(JSON.stringify(obj));
};

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const DEFAULT_QUESTIONS_CONFIG = [
  {
    title: "Informations Générales",
    questions: [
      { id: 'nomination', label: "Nomination (Raison Sociale)", isScored: false },
      { id: 'adress', label: "Adresse ", isScored: false },
      { id: 'activite_nature', label: "Nature de l'activité", isScored: false },
      { id: 'date_creation', label: "Date Création et mise en service", isScored: false }
    ]
  },
  {
    title: "Informations sur le Site",
    questions: [
      { id: 'superficie_totale', label: "Superficie totale du site", isScored: false },
      { id: 'superficie_batie', label: "Superficie bâtie", isScored: false },
      { id: 'compartimentage', label: "Compartimentage (Production, Stockage, Admin...)", isScored: true }
    ]
  },
  {
    title: "Utilités",
    questions: [
      { id: 'elec_principale', label: "Électricité (Transfos, maintenance, fournisseur)", isScored: false },
      { id: 'gaz_nat', label: "Gaz naturel ", isScored: false },
      { id: 'elec_secours', label: "Électricité de secours (Groupes électrogènes)", isScored: false },
      { id: 'eau_source', label: "Eau (Fournisseur, capacité, usage)", isScored: false },
      { id: 'gaz_pression', label: "Gasoil et gaz sous pression (Réservoirs)", isScored: false }
    ]
  },
  {
    title: "Management des Risques & HSE",
    questions: [
      { id: 'hse_structure', label: "Structure HSE (Effectif, formations)", isScored: true },
      { id: 'hse_doc', label: "Documentation (EDD, EIE, PII)", isScored: true },
      { id: 'dechets_gestion', label: "Gestion et traitement des déchets", isScored: true }
    ]
  },
  {
    title: "Maintenance",
    questions: [
      { id: 'maint_struct', label: "Structure (Moyens humain, Qualifications)", isScored: true },
      { id: 'maint_prog', label: "Programmes de maintenance (Préventive/Curative)", isScored: true },
      { id: 'maint_control', label: "Contrôle Technique (APG, APV, Electricité, Levage)", isScored: true },
      { id: 'maint_pdr', label: "Magasin de PDR (Existence, Disponibilité)", isScored: true }
    ]
  },
  {
    title: "Lutte contre l'Incendie",
    questions: [
      { id: 'inc_detection', label: "Détection (Type, zones, centralisation)", isScored: true },
      { id: 'inc_mobile', label: "Moyens mobiles (Type, Répartition, mise à jour)", isScored: true },
      { id: 'inc_hydraulique', label: "Réseau hydraulique (Capacité, RIA, Poteaux)", isScored: true },
      { id: 'inc_ext_auto', label: "Systèmes automatiques (Sprinkler, Gaz inertes)", isScored: true },
      { id: 'signalisation', label: "Systèmes signalisation (Dangers, Risques, Urgences)", isScored: true },
      { id: 'protec_civil', label: "Protection Civile (Proximité, Exercices)", isScored: false }
    ]
  },
  {
    title: "Sûreté du Site",
    questions: [
      { id: 'surete_gardiennage', label: "Gardiennage (Effectifs, brigades)", isScored: true },
      { id: 'surete_cctv', label: "Vidéosurveillance et Contrôle d'accès", isScored: true },
      { id: 'surete_cloture', label: "Clôture et accès au site", isScored: true }
    ]
  }
];

const DEFAULT_SMP_DATA = {
  scenario: "",
  valeurs: { batiment: 0, materiel: 0, stocks: 0, pe: 0 },
  hypotheses: [],
  smpFinal: 0
};

const DEFAULT_SITE = {
  name: 'Site Principal',
  responses: {},
  aiResults: null,
  chatHistory: [],
  smpData: deepClone(DEFAULT_SMP_DATA),
  lastModified: Date.now(),
  photos: {}
};

// Create store without persist first (for immediate availability)
const createBaseStore = (set, get) => ({
  // Initial state with isLoaded = false
  questionsConfig: deepClone(DEFAULT_QUESTIONS_CONFIG),
  activeSiteId: 'Site_Initial',
  allSites: { 'Site_Initial': deepClone(DEFAULT_SITE) },
  responses: {},
  aiResults: null,
  chatHistory: [],
  smpData: deepClone(DEFAULT_SMP_DATA),
  auditorInfo: { name: '', company: '', logo: null, inspectionDate: '' },
  history: [],
  isLoaded: false, // Start as false

  // Actions
  setLoaded: (loaded) => set({ isLoaded: loaded }),
  
  getCurrentSite: () => {
    const state = get();
    return state.allSites[state.activeSiteId] || null;
  },

  getAlerts: () => {
    const state = get();
    const responses = state.responses;
    
    return Object.entries(responses)
      .filter(([_, r]) => r.isScored && (r.score <= 2 || r.value === 'non_conforme'))
      .map(([id, r]) => {
        const section = state.questionsConfig.find(s => 
          s.questions.some(q => q.id === id)
        );
        const question = section?.questions.find(q => q.id === id);
        
        return {
          id,
          category: section?.title || 'Non catégorisé',
          question: question?.label || id,
          questionLabel: question?.label,
          severity: r.score === 1 || r.value === 'critique' ? 'high' : 
                   r.score === 2 ? 'medium' : 'low',
          score: r.score,
          comment: r.comment,
          timestamp: r.timestamp || Date.now(),
          photos: r.photos || []
        };
      })
      .sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
  },

  getSectionScores: () => {
    const state = get();
    
    return state.questionsConfig.map(section => {
      const scoredQuestions = section.questions.filter(q => q.isScored);
      const sectionResponses = scoredQuestions
        .map(q => state.responses[q.id])
        .filter(r => r && typeof r.score === 'number');
      
      const totalScore = sectionResponses.reduce((sum, r) => sum + r.score, 0);
      const maxPossible = scoredQuestions.length * 5;
      
      return {
        title: section.title,
        score: sectionResponses.length ? totalScore : 0,
        max: maxPossible,
        average: sectionResponses.length ? totalScore / sectionResponses.length : 0,
        percentage: maxPossible ? (totalScore / maxPossible) * 100 : 0,
        questionCount: scoredQuestions.length,
        answeredCount: sectionResponses.length
      };
    });
  },

  getGlobalScore: () => {
    const sections = get().getSectionScores();
    const scoredSections = sections.filter(s => s.max > 0);
    
    if (!scoredSections.length) return 0;
    
    const totalScore = scoredSections.reduce((sum, s) => sum + s.score, 0);
    const totalMax = scoredSections.reduce((sum, s) => sum + s.max, 0);
    
    return totalMax ? Math.round((totalScore / totalMax) * 100) : 0;
  },

  getSitesList: () => {
    const state = get();
    return Object.entries(state.allSites).map(([id, site]) => ({
      id,
      name: site.name,
      lastModified: site.lastModified,
      responseCount: Object.keys(site.responses || {}).length,
      hasAIResults: !!site.aiResults,
      hasSMP: site.smpData?.smpFinal > 0
    })).sort((a, b) => b.lastModified - a.lastModified);
  },

  switchSite: (siteId, name = null) => {
    const state = get();
    const updatedAllSites = deepClone(state.allSites);
    
    updatedAllSites[state.activeSiteId] = {
      ...updatedAllSites[state.activeSiteId],
      responses: deepClone(state.responses),
      aiResults: state.aiResults ? deepClone(state.aiResults) : null,
      chatHistory: deepClone(state.chatHistory),
      smpData: deepClone(state.smpData),
      lastModified: Date.now()
    };

    let targetSite = updatedAllSites[siteId];
    if (!targetSite) {
      targetSite = {
        ...deepClone(DEFAULT_SITE),
        name: name || siteId,
        lastModified: Date.now()
      };
      updatedAllSites[siteId] = targetSite;
    }

    set({
      activeSiteId: siteId,
      allSites: updatedAllSites,
      responses: deepClone(targetSite.responses),
      aiResults: targetSite.aiResults ? deepClone(targetSite.aiResults) : null,
      chatHistory: deepClone(targetSite.chatHistory || []),
      smpData: deepClone(targetSite.smpData || DEFAULT_SMP_DATA)
    });
  },

  createSite: (name) => {
    const state = get();
    const newId = `site_${generateId()}`;
    
    const newSite = {
      ...deepClone(DEFAULT_SITE),
      name: name || `Site ${Object.keys(state.allSites).length + 1}`,
      lastModified: Date.now()
    };

    set({
      allSites: {
        ...deepClone(state.allSites),
        [newId]: newSite
      }
    });

    get().switchSite(newId);
    return newId;
  },

  deleteSite: (siteId) => {
    const state = get();
    if (siteId === state.activeSiteId) {
      console.warn('[Store] Cannot delete active site');
      return false;
    }

    const updatedSites = deepClone(state.allSites);
    const sitePhotos = updatedSites[siteId]?.photos || {};
    
    Object.values(sitePhotos).flat().forEach(photoMeta => {
      if (photoMeta?.photoId) del(photoMeta.photoId);
    });
    
    delete updatedSites[siteId];
    set({ allSites: updatedSites });
    return true;
  },

  renameSite: (siteId, newName) => {
    const state = get();
    if (!state.allSites[siteId]) return;

    const updatedSites = deepClone(state.allSites);
    updatedSites[siteId].name = newName;
    updatedSites[siteId].lastModified = Date.now();

    set({ allSites: updatedSites });
  },

  setResponse: (id, data) => set((state) => {
    const newResponses = {
      ...state.responses,
      [id]: {
        ...state.responses[id],
        ...data,
        timestamp: Date.now(),
        questionLabel: data.questionLabel || state.responses[id]?.questionLabel
      }
    };

    setTimeout(() => {
      const currentState = get();
      const updatedSites = deepClone(currentState.allSites);
      updatedSites[currentState.activeSiteId] = {
        ...updatedSites[currentState.activeSiteId],
        responses: deepClone(newResponses),
        lastModified: Date.now()
      };
      set({ allSites: updatedSites });
    }, 0);

    return { responses: newResponses };
  }),

  setResponses: (responses) => {
    const timestamped = Object.entries(responses).reduce((acc, [id, data]) => ({
      ...acc,
      [id]: { ...data, timestamp: Date.now() }
    }), {});

    set({ responses: timestamped });
    
    setTimeout(() => {
      const state = get();
      const updatedSites = deepClone(state.allSites);
      updatedSites[state.activeSiteId] = {
        ...updatedSites[state.activeSiteId],
        responses: deepClone(timestamped),
        lastModified: Date.now()
      };
      set({ allSites: updatedSites });
    }, 0);
  },

  setAiResults: (results) => {
    const state = get();
    
    set({ 
      aiResults: results ? deepClone(results) : null 
    });

    setTimeout(() => {
      const currentState = get();
      const updatedSites = deepClone(currentState.allSites);
      updatedSites[currentState.activeSiteId] = {
        ...updatedSites[currentState.activeSiteId],
        aiResults: results ? deepClone(results) : null,
        lastModified: Date.now()
      };
      set({ allSites: updatedSites });
    }, 0);

    if (results && results.score_global) {
      const historyEntry = {
        id: generateId(),
        date: new Date().toLocaleString('fr-FR'),
        client: state.responses['nomination']?.value || "Sans Nom",
        activite: state.responses['activite_nature']?.value || "Non spécifiée",
        siteId: state.activeSiteId,
        siteName: state.allSites[state.activeSiteId]?.name,
        score: results.score_global,
        data: {
          responses: deepClone(state.responses),
          aiResults: deepClone(results)
        }
      };

      set((s) => ({
        history: [historyEntry, ...s.history.slice(0, 49)]
      }));
    }
  },

  addChatMessage: (message) => set((state) => {
    const newMessage = { 
      ...message, 
      timestamp: Date.now(),
      id: generateId()
    };
    
    const newHistory = [...state.chatHistory, newMessage].slice(-100);

    setTimeout(() => {
      const currentState = get();
      const updatedSites = deepClone(currentState.allSites);
      updatedSites[currentState.activeSiteId] = {
        ...updatedSites[currentState.activeSiteId],
        chatHistory: deepClone(newHistory),
        lastModified: Date.now()
      };
      set({ allSites: updatedSites });
    }, 0);

    return { chatHistory: newHistory };
  }),

  clearChat: () => {
    set({ chatHistory: [] });
    
    setTimeout(() => {
      const state = get();
      const updatedSites = deepClone(state.allSites);
      updatedSites[state.activeSiteId].chatHistory = [];
      updatedSites[state.activeSiteId].lastModified = Date.now();
      set({ allSites: updatedSites });
    }, 0);
  },

  setSmpData: (newData) => set((state) => {
    const merged = { 
      ...state.smpData, 
      ...newData,
      valeurs: { ...state.smpData.valeurs, ...newData.valeurs }
    };

    setTimeout(() => {
      const currentState = get();
      const updatedSites = deepClone(currentState.allSites);
      updatedSites[currentState.activeSiteId] = {
        ...updatedSites[currentState.activeSiteId],
        smpData: deepClone(merged),
        lastModified: Date.now()
      };
      set({ allSites: updatedSites });
    }, 0);

    return { smpData: merged };
  }),

  setAuditorInfo: (info) => set((state) => ({
    auditorInfo: { ...state.auditorInfo, ...info }
  })),

  addPhoto: async (qId, file, description = '') => {
    const photoId = `photo_${generateId()}`;
    
    try {
      await set(photoId, file);
      
      const photoMeta = {
        photoId,
        timestamp: Date.now(),
        description,
        size: file.size,
        type: file.type,
        name: file.name
      };

      set((state) => {
        const currentPhotos = state.allSites[state.activeSiteId]?.photos || {};
        const qPhotos = currentPhotos[qId] || [];
        
        const updatedPhotos = {
          ...currentPhotos,
          [qId]: [...qPhotos, photoMeta]
        };

        setTimeout(() => {
          const s = get();
          const updatedSites = deepClone(s.allSites);
          updatedSites[s.activeSiteId] = {
            ...updatedSites[s.activeSiteId],
            photos: updatedPhotos,
            lastModified: Date.now()
          };
          set({ allSites: updatedSites });
        }, 0);

        const newResponses = {
          ...state.responses,
          [qId]: {
            ...state.responses[qId],
            photos: [...(state.responses[qId]?.photos || []), photoMeta]
          }
        };

        return { responses: newResponses };
      });

      return photoId;
    } catch (error) {
      console.error('[Store] Photo save failed:', error);
      throw error;
    }
  },

  getPhoto: async (photoId) => {
    try {
      const blob = await get(photoId);
      return blob || null;
    } catch (error) {
      console.error(`[Store] Failed to load photo ${photoId}:`, error);
      return null;
    }
  },

  removePhoto: async (qId, photoIndex) => {
    const state = get();
    const photoMeta = state.responses[qId]?.photos?.[photoIndex];
    
    if (photoMeta?.photoId) {
      await del(photoMeta.photoId);
    }

    set((s) => {
      const newPhotos = (s.responses[qId]?.photos || []).filter((_, i) => i !== photoIndex);
      
      return {
        responses: {
          ...s.responses,
          [qId]: { ...s.responses[qId], photos: newPhotos }
        }
      };
    });

    setTimeout(() => {
      const s = get();
      const sitePhotos = s.allSites[s.activeSiteId]?.photos || {};
      const updatedSitePhotos = {
        ...sitePhotos,
        [qId]: (sitePhotos[qId] || []).filter((_, i) => i !== photoIndex)
      };
      
      const updatedSites = deepClone(s.allSites);
      updatedSites[s.activeSiteId].photos = updatedSitePhotos;
      updatedSites[s.activeSiteId].lastModified = Date.now();
      set({ allSites: updatedSites });
    }, 0);
  },

  exportAudit: async () => {
    const state = get();
    const clientName = state.responses['nomination']?.value || 'SANS_NOM';
    const dateStr = new Date().toISOString().split('T')[0];
    
    const photoExports = {};
    for (const [siteId, site] of Object.entries(state.allSites)) {
      photoExports[siteId] = {};
      for (const [qId, photos] of Object.entries(site.photos || {})) {
        photoExports[siteId][qId] = [];
        for (const photo of photos) {
          const blob = await get(photo.photoId);
          if (blob) {
            const base64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
            photoExports[siteId][qId].push({ ...photo, data: base64 });
          }
        }
      }
    }

    const dataToExport = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      auditorInfo: state.auditorInfo,
      allSites: state.allSites,
      activeSiteId: state.activeSiteId,
      history: state.history,
      photos: photoExports
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `AUDIT_MULTI_${clientName.replace(/\s+/g, '_')}_${dateStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve(true);
      }, 100);
    });
  },

  importAudit: async (file) => {
    if (!file) return { success: false, error: 'No file provided' };
    
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      if (!json.allSites) {
        const migrated = {
          allSites: {
            'Imported': {
              name: 'Site Importé',
              responses: json.responses || {},
              aiResults: json.aiResults || null,
              chatHistory: [],
              smpData: json.smpData || deepClone(DEFAULT_SMP_DATA),
              lastModified: Date.now(),
              photos: {}
            }
          },
          activeSiteId: 'Imported'
        };
        
        set({
          ...migrated,
          responses: json.responses || {},
          aiResults: json.aiResults || null,
          smpData: json.smpData || deepClone(DEFAULT_SMP_DATA),
          auditorInfo: json.auditorInfo || get().auditorInfo,
          history: [...(json.history || []), ...get().history].slice(0, 50)
        });
        
        return { success: true, migrated: true };
      }

      if (json.photos) {
        for (const [siteId, sitePhotos] of Object.entries(json.photos)) {
          for (const [qId, photos] of Object.entries(sitePhotos)) {
            for (const photo of photos) {
              if (photo.data) {
                const response = await fetch(photo.data);
                const blob = await response.blob();
                await set(photo.photoId, blob);
              }
            }
          }
        }
      }

      set({
        allSites: json.allSites,
        activeSiteId: json.activeSiteId || Object.keys(json.allSites)[0],
        responses: json.allSites[json.activeSiteId]?.responses || {},
        aiResults: json.allSites[json.activeSiteId]?.aiResults || null,
        chatHistory: json.allSites[json.activeSiteId]?.chatHistory || [],
        smpData: json.allSites[json.activeSiteId]?.smpData || deepClone(DEFAULT_SMP_DATA),
        auditorInfo: json.auditorInfo || get().auditorInfo,
        history: [...(json.history || []), ...get().history].slice(0, 50)
      });

      return { success: true, siteCount: Object.keys(json.allSites).length };
      
    } catch (err) {
      console.error('[Store] Import failed:', err);
      return { success: false, error: err.message };
    }
  },

  loadFromHistory: (entry) => {
    if (!entry?.data) return;
    
    set({
      responses: deepClone(entry.data.responses),
      aiResults: entry.data.aiResults ? deepClone(entry.data.aiResults) : null
    });

    setTimeout(() => {
      const state = get();
      const updatedSites = deepClone(state.allSites);
      updatedSites[state.activeSiteId] = {
        ...updatedSites[state.activeSiteId],
        responses: deepClone(entry.data.responses),
        aiResults: entry.data.aiResults ? deepClone(entry.data.aiResults) : null,
        lastModified: Date.now()
      };
      set({ allSites: updatedSites });
    }, 0);
  },

  deleteFromHistory: (id) => set((state) => ({
    history: state.history.filter(item => item.id !== id)
  })),

  clearHistory: () => set({ history: [] }),

  addSection: (title) => set((state) => ({
    questionsConfig: [...state.questionsConfig, { title, questions: [] }]
  })),

  addQuestion: (sectionIndex, label, isScored = true) => set((state) => {
    const newConfig = deepClone(state.questionsConfig);
    const newId = `custom_${generateId()}`;
    newConfig[sectionIndex].questions.push({ 
      id: newId, 
      label, 
      isScored,
      isCustom: true 
    });
    return { questionsConfig: newConfig };
  }),

  removeQuestion: (sectionIndex, questionIndex) => set((state) => {
    const newConfig = deepClone(state.questionsConfig);
    newConfig[sectionIndex].questions.splice(questionIndex, 1);
    return { questionsConfig: newConfig };
  }),

  resetConfig: () => set({ 
    questionsConfig: deepClone(DEFAULT_QUESTIONS_CONFIG) 
  }),

  resetAudit: () => {
    const newSiteId = 'Site_Initial';
    const newSite = deepClone(DEFAULT_SITE);
    
    set({
      activeSiteId: newSiteId,
      allSites: { [newSiteId]: newSite },
      responses: {},
      aiResults: null,
      chatHistory: [],
      smpData: deepClone(DEFAULT_SMP_DATA)
    });
  },

  forceSave: async () => {
    // No-op for memory storage, flush for IndexedDB
    console.log('[Store] Force save requested');
  },
});

// Create store with persistence
export const useInspectionStore = create(
  persist(createBaseStore, {
    name: 'riskpro-storage',
    storage: createJSONStorage(() => safeStorage),
    
    // Only persist these fields
    partialize: (state) => ({
      questionsConfig: state.questionsConfig,
      activeSiteId: state.activeSiteId,
      allSites: state.allSites,
      auditorInfo: state.auditorInfo,
      history: state.history.slice(0, 20),
    }),
    
    // Handle rehydration with fallback
    onRehydrateStorage: (state) => {
      return (persistedState, error) => {
        if (error) {
          console.error('[Store] Rehydration error:', error);
        }
        
        // Always mark as loaded, even on error
        if (state) {
          // Sync active site data
          const activeSite = state.allSites?.[state.activeSiteId];
          if (activeSite) {
            state.responses = activeSite.responses || {};
            state.aiResults = activeSite.aiResults || null;
            state.chatHistory = activeSite.chatHistory || [];
            state.smpData = activeSite.smpData || deepClone(DEFAULT_SMP_DATA);
          }
          
          // CRITICAL: Always set isLoaded to true
          state.isLoaded = true;
          console.log('[Store] Rehydration complete, isLoaded = true');
        }
      };
    },
    
    // Version for migrations
    version: 1,
    
    // Migrate old data
    migrate: (persistedState, version) => {
      if (version === 0) {
        // Migration from version 0 to 1
        return persistedState;
      }
      return persistedState;
    },
  })
);

// Selector hooks for performance
export const useSiteCount = () => 
  useInspectionStore(state => Object.keys(state.allSites).length);

export const useCurrentSiteName = () => 
  useInspectionStore(state => state.allSites[state.activeSiteId]?.name);

export const useGlobalScore = () => 
  useInspectionStore(state => state.getGlobalScore());

export const useAlerts = () => 
  useInspectionStore(state => state.getAlerts());

export const useSectionScores = () => 
  useInspectionStore(state => state.getSectionScores());
