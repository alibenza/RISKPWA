// src/hooks/usePhotoCapture.js
import { useState, useCallback } from 'react';
import { useInspectionStore } from './useInspectionStore';

export const usePhotoCapture = (questionId) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const addPhoto = useInspectionStore(state => state.addPhoto);
  const removePhoto = useInspectionStore(state => state.removePhoto);
  const getPhoto = useInspectionStore(state => state.getPhoto);
  const responses = useInspectionStore(state => state.responses);

  const photos = responses[questionId]?.photos || [];

  const capturePhoto = useCallback(async (file, description = '') => {
    if (!file) return null;
    
    setIsCapturing(true);
    try {
      // Compress image if needed
      const compressed = await compressImage(file, 1200, 0.8);
      const photoId = await addPhoto(questionId, compressed, description);
      return photoId;
    } catch (error) {
      console.error('Photo capture failed:', error);
      throw error;
    } finally {
      setIsCapturing(false);
    }
  }, [addPhoto, questionId]);

  const deletePhoto = useCallback(async (index) => {
    await removePhoto(questionId, index);
  }, [removePhoto, questionId]);

  const loadPhotoUrl = useCallback(async (photoMeta) => {
    const blob = await getPhoto(photoMeta.photoId);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  }, [getPhoto]);

  return {
    photos,
    isCapturing,
    capturePhoto,
    deletePhoto,
    loadPhotoUrl
  };
};

// Image compression utility
const compressImage = (file, maxWidth, quality) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            reject(new Error('Compression failed'));
          }
        }, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
