// src/components/PhotoCapture.jsx
import React, { useRef, useState } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { usePhotoCapture } from '../hooks/usePhotoCapture';

const PhotoCapture = ({ questionId, onPhotosChange }) => {
  const fileInputRef = useRef(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  const { photos, isCapturing, capturePhoto, deletePhoto, loadPhotoUrl } = usePhotoCapture(questionId);

  const handleCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await capturePhoto(file);
      // Reload previews
      loadPreviews();
      onPhotosChange?.();
    } catch (error) {
      console.error('Capture failed:', error);
    }
  };

  const loadPreviews = async () => {
    const urls = await Promise.all(
      photos.map(async (p) => {
        const blob = await loadPhotoUrl(p);
        return blob;
      })
    );
    setPreviewUrls(urls.filter(Boolean));
  };

  const handleDelete = async (index) => {
    await deletePhoto(index);
    loadPreviews();
    onPhotosChange?.();
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isCapturing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors disabled:opacity-50"
        >
          <Camera size={16} />
          {isCapturing ? 'Traitement...' : 'Prendre une photo'}
        </button>
        
        <span className="text-xs text-slate-500">
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {photos.map((photo, idx) => (
            <div key={photo.photoId} className="relative group">
              <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                {previewUrls[idx] ? (
                  <img 
                    src={previewUrls[idx]} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={24} className="text-slate-400" />
                )}
              </div>
              <button
                onClick={() => handleDelete(idx)}
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

export default PhotoCapture;
