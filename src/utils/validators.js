// src/utils/validators.js
export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateRequired = (value) => {
  return value !== undefined && value !== null && String(value).trim() !== '';
};

export const validateNumber = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

export const validateResponse = (response, question) => {
  const errors = [];
  
  if (question.isScored && (response.score === undefined || response.score === null)) {
    errors.push('Score requis');
  }
  
  if (response.score <= 2 && !response.comment) {
    errors.push('Commentaire obligatoire pour les scores faibles');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};
