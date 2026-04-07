// src/utils/smpCalculations.js
export const calculateSMP = (valeurs, tauxSinistre = 0.3) => {
  const totalExposed = (valeurs.batiment || 0) + 
                      (valeurs.materiel || 0) + 
                      (valeurs.stocks || 0);
  
  const peValue = valeurs.pe || 0;
  
  // SMP = Valeurs exposées × taux sinistre + Perte d'exploitation
  const smpTechnique = totalExposed * tauxSinistre;
  const smpFinal = smpTechnique + peValue;
  
  return {
    smpTechnique: Math.round(smpTechnique),
    smpFinal: Math.round(smpFinal),
    totalExposed,
    peValue,
    tauxSinistre
  };
};

export const formatCurrency = (amount, currency = 'DZD') => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const SCENARIO_TEMPLATES = {
  incendie: {
    name: 'Incendie majeur',
    description: 'Sinistre affectant la totalité du site avec propagation possible',
    defaultTaux: 0.4
  },
  inondation: {
    name: 'Inondation',
    description: 'Dégâts des eaux au niveau du stockage et production',
    defaultTaux: 0.25
  },
  bris_machine: {
    name: 'Bris de machine critique',
    description: 'Arrêt de production due à panne équipement principal',
    defaultTaux: 0.2
  }
};
