// src/components/QuestionCard.jsx
import React, { useState, useRef } from 'react';
import { Camera, X, Star, MessageSquare, AlertTriangle } from 'lucide-react';
import { usePhotoCapture } from '../hooks/usePhotoCapture';

const QuestionCard = ({ question, response, onResponse }) => {
  const [showComment, setShowComment] = useState(!!response?.comment);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const { photos, isCapturing, capturePhoto, deletePhoto, loadPhotoUrl } = usePhotoCapture(question.id);

  const handleScore = (score) => {
    onResponse({ 
      score, 
      isScored: question.isScored,
      value: score >= 4 ? 'conforme' : score >= 2 ? 'a_ameliorer' : 'non_conforme'
    });
    if (score <= 2) setShowComment(true);
  };

  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await capturePhoto(file);
      // Load preview
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
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium text-slate-900 text-sm leading-relaxed">
            {question.label}
          </p>
          {question.isScored && (
            <p className="text-xs text-slate-400 mt-1">Évaluation obligatoire</p>
          )}
        </div>
        
        {question.isScored && (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleScore(star)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  (response?.score || 0) >= star 
                    ? scoreLabels[star - 1].color + ' text-white shadow-md' 
                    : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Star size={14} fill={(response?.score || 0) >= star ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Score indicator */}
      {response?.score && (
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${
            scoreLabels[response.score - 1]?.color || 'bg-slate-400'
          }`}>
            {scoreLabels[response.score - 1]?.label}
          </span>
          {response.score <= 2 && (
            <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
              <AlertTriangle size={12} /> Commentaire requis
            </span>
          )}
        </div>
      )}

      {/* Comment section */}
      {(showComment || response?.comment) && (
        <div className="animate-in fade-in">
          <textarea
            placeholder="Observations et commentaires..."
            value={response?.comment || ''}
            onChange={(e) => onResponse({ comment: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 min-h-[80px] resize-y"
          />
        </div>
      )}

      {/* Photo capture */}
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
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors disabled:opacity-50"
        >
          <Camera size={16} />
          {isCapturing ? 'Traitement...' : `Photo${photos.length > 0 ? ` (${photos.length})` : ''}`}
        </button>

        {photos.length > 0 && !showComment && (
          <button
            onClick={() => setShowComment(true)}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            <MessageSquare size={14} /> Ajouter un commentaire
          </button>
        )}
      </div>

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {photos.map((photo, idx) => (
            <div key={photo.photoId} className="relative group">
              <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={20} className="text-slate-400" />
                )}
              </div>
              <button
                onClick={() => handleDeletePhoto(idx)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
