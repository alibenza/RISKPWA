import React, { useState, useRef } from 'react';
import { Camera, X, Star, MessageSquare, AlertTriangle } from 'lucide-react';
import { usePhotoCapture } from '../hooks/usePhotoCapture';

const QuestionCard = ({ question, response, onResponse }) => {
  // Show comment box if there's already a comment, if it's forced, or if the question isn't a "star-rating" type
  const [showComment, setShowComment] = useState(!!response?.comment || !question.isScored);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const { photos, isCapturing, capturePhoto, deletePhoto, loadPhotoUrl } = usePhotoCapture(question.id);

  const handleScore = (score) => {
    onResponse({ 
      ...response, // Keep existing photos/comments
      score, 
      isScored: question.isScored,
      value: score >= 4 ? 'conforme' : score >= 2 ? 'a_ameliorer' : 'non_conforme'
    });
    // Automatically show comment box for low scores
    if (score <= 2) setShowComment(true);
  };

  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await capturePhoto(file);
      const lastPhoto = photos[photos.length - 1];
      if (lastPhoto) {
        const url = await loadPhotoUrl(lastPhoto);
        setPhotoPreview(url);
      }
    } catch (error) {
      console.error('Photo capture failed:', error);
    }
  };

  const handleDeletePhoto = async (index) => {
    await deletePhoto(index);
    setPhotoPreview(null);
  };

  const scoreLabels = [
    { value: 1, label: 'Critique', color: 'bg-red-500' },
    { value: 2, label: 'Insuffisant', color: 'bg-orange-500' },
    { value: 3, label: 'Moyen', color: 'bg-yellow-500' },
    { value: 4, label: 'Bon', color: 'bg-blue-500' },
    { value: 5, label: 'Excellent', color: 'bg-green-500' }
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
      {/* Header & Label */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold text-slate-900 text-sm leading-relaxed">
            {question.label}
          </p>
          {question.isScored && !response?.score && (
            <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1 font-bold">Évaluation requise</p>
          )}
        </div>
        
        {/* Star Rating System */}
        {question.isScored && (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleScore(star)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  (response?.score || 0) >= star 
                    ? scoreLabels[star - 1].color + ' text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Star size={14} fill={(response?.score || 0) >= star ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Score Status Indicator */}
      {response?.score && (
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase ${
            scoreLabels[response.score - 1]?.color || 'bg-slate-400'
          }`}>
            {scoreLabels[response.score - 1]?.label}
          </span>
          {response.score <= 2 && (
            <span className="flex items-center gap-1 text-[11px] text-red-600 font-bold italic">
              <AlertTriangle size={12} /> Précisions nécessaires
            </span>
          )}
        </div>
      )}

      {/* Main Content Input (Remarks/Data Collection) */}
      {(showComment || response?.comment || !question.isScored) && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <textarea
            placeholder={question.isScored ? "Observations, anomalies ou points de vigilance..." : "Saisir les informations collectées sur le site..."}
            value={response?.comment || ''}
            onChange={(e) => onResponse({ ...response, comment: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 min-h-[90px] shadow-inner resize-none"
          />
        </div>
      )}

      {/* Action Bar (Camera & Manual Toggle) */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isCapturing}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors disabled:opacity-50 border border-slate-200"
          >
            <Camera size={14} />
            {isCapturing ? 'Chargement...' : `Photo${photos.length > 0 ? ` (${photos.length})` : ''}`}
          </button>

          {/* Manual Toggle for Comment if not already visible */}
          {question.isScored && !showComment && (
            <button
              onClick={() => setShowComment(true)}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-bold"
            >
              <MessageSquare size={14} /> Ajouter une note
            </button>
          )}
        </div>
      </div>

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-2 border-t border-slate-100">
          {photos.map((photo, idx) => (
            <div key={photo.photoId} className="relative group">
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={16} className="text-slate-300" />
                )}
              </div>
              <button
                onClick={() => handleDeletePhoto(idx)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
