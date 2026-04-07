// src/utils/scoring.js
export const calculateRiskLevel = (score, max = 100) => {
  const percentage = (score / max) * 100;
  
  if (percentage >= 80) return { level: 'low', label: 'Faible', color: 'green' };
  if (percentage >= 60) return { level: 'medium', label: 'Moyen', color: 'yellow' };
  if (percentage >= 40) return { level: 'high', label: 'Élevé', color: 'orange' };
  return { level: 'critical', label: 'Critique', color: 'red' };
};

export const calculateWeightedScore = (responses, weights = {}) => {
  let totalWeight = 0;
  let weightedSum = 0;
  
  Object.entries(responses).forEach(([id, response]) => {
    if (!response.isScored) return;
    
    const weight = weights[id] || 1;
    const normalizedScore = (response.score / 5) * 100; // Assuming 5-point scale
    
    weightedSum += normalizedScore * weight;
    totalWeight += weight;
  });
  
  return totalWeight ? Math.round(weightedSum / totalWeight) : 0;
};

export const CRITICALITY_WEIGHTS = {
  'inc_detection': 1.5,
  'inc_hydraulique': 1.5,
  'inc_ext_auto': 1.3,
  'hse_structure': 1.2,
  'maint_control': 1.2,
  'surete_gardiennage': 1.0
};
