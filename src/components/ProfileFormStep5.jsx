// ===== FIXED FILE: ./src/components/ProfileFormStep5.jsx =====
import React, { useRef, useEffect, useState } from 'react';
import { Icons } from './Icons';

const MAX_PHOTOS = 6;

export default function ProfileFormStep5({ data, onChange }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef();
  const createdUrlsRef = useRef(new Set());

  useEffect(() => {
    return () => {
      for (const url of createdUrlsRef.current) {
        try { URL.revokeObjectURL(url); } catch {}
      }
      createdUrlsRef.current.clear();
    };
  }, []);

  const processFiles = (files) => {
    if (!files?.length) return;

    const existing = data.photos || [];
    const remainingSlots = Math.max(0, MAX_PHOTOS - existing.length);
    if (remainingSlots <= 0) {
      alert(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    const validFiles = files
      .filter((file) => {
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large (max 5MB)`);
          return false;
        }
        return true;
      })
      .slice(0, remainingSlots);

    try {
      const isFirstOverall = existing.length === 0;
      const newPhotos = validFiles.map((file, idx) => {
        const url = URL.createObjectURL(file);
        createdUrlsRef.current.add(url);
        return {
          url,
          file,
          isProfile: isFirstOverall && idx === 0,
          isVerified: false,
        };
      });
      onChange('photos', [...existing, ...newPhotos]);
    } catch (error) {
      console.error('Photo upload error:', error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => processFiles(Array.from(e.target.files || []));

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) processFiles(Array.from(e.dataTransfer.files));
  };

  const removePhoto = (index) => {
    const current = data.photos || [];
    const removed = current[index];

    if (removed?.file instanceof File && removed?.url && createdUrlsRef.current.has(removed.url)) {
      try { URL.revokeObjectURL(removed.url); } catch {}
      createdUrlsRef.current.delete(removed.url);
    }

    const updated = current.filter((_, i) => i !== index);
    const fixed =
      removed?.isProfile && updated.length > 0
        ? updated.map((p, i) => ({ ...p, isProfile: i === 0 }))
        : updated;

    onChange('photos', fixed);
  };

  const setProfilePhoto = (index) => {
    const updated = (data.photos || []).map((photo, i) => ({ ...photo, isProfile: i === index }));
    onChange('photos', updated);
  };

  const photoCount = data.photos?.length || 0;

  return (
    <div className="space-y-8">
      {/* ✅ FIX: Complete header section */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center">
          <Icons.Camera size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Photos</h2>
          <p className="text-sm text-[var(--text-muted)]">Add up to {MAX_PHOTOS} photos to your profile</p>
        </div>
      </div>

      {/* ✅ FIX: Complete upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300
          ${dragActive
            ? 'border-[var(--accent-500)] bg-[var(--accent-500)]/10'
            : 'border-[var(--border-secondary)] hover:border-[var(--accent-500)]/50 hover:bg-[var(--surface-glass)]'}
        `}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            dragActive ? 'bg-[var(--accent-500)]/20' : 'bg-[var(--surface-glass)]'
          }`}>
            <Icons.Upload size={24} className={dragActive ? 'text-[var(--accent-500)]' : 'text-[var(--text-muted)]'} />
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">
              {dragActive ? 'Drop photos here' : 'Click or drag photos here'}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              PNG, JPG, WebP up to 5MB each • Max {MAX_PHOTOS} photos
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* ✅ FIX: Complete count indicator */}
      {photoCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">{photoCount}</span> of {MAX_PHOTOS} photos
          </p>
          <div className="flex gap-1">
            {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < photoCount ? 'bg-[var(--accent-500)]' : 'bg-[var(--border-primary)]'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {photoCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(data.photos || []).map((photo, index) => (
            <div
              key={index}
              className={`
                relative group rounded-2xl overflow-hidden aspect-square
                ${photo.isProfile
                  ? 'ring-2 ring-[var(--accent-500)] ring-offset-2 ring-offset-[var(--bg-primary)]'
                  : 'border border-[var(--border-primary)]'}
              `}
            >
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {photo.isProfile && (
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-[var(--accent-500)] text-white text-[10px] font-semibold flex items-center gap-1 shadow-lg">
                  <Icons.Star size={10} />
                  Profile
                </div>
              )}

              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 p-3">
                {!photo.isProfile && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setProfilePhoto(index); }}
                    className="w-full py-2.5 rounded-lg bg-[var(--accent-500)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[var(--accent-600)] transition-colors"
                  >
                    <Icons.Star size={14} />
                    Set as Profile
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                  className="w-full py-2.5 rounded-lg bg-red-500/90 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-red-500 transition-colors"
                >
                  <Icons.Trash2 size={14} />
                  Remove
                </button>
              </div>

              <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs font-semibold flex items-center justify-center">
                {index + 1}
              </div>
            </div>
          ))}

          {photoCount < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-[var(--border-secondary)] hover:border-[var(--accent-500)]/50 flex flex-col items-center justify-center gap-2 transition-colors bg-[var(--surface-glass)] hover:bg-[var(--surface-glass-hover)]"
            >
              <Icons.Plus size={24} className="text-[var(--text-muted)]" />
              <span className="text-xs text-[var(--text-muted)] font-medium">Add More</span>
            </button>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <div className="flex gap-3">
          <Icons.Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[var(--text-secondary)] space-y-1">
            <p className="font-semibold text-blue-500">Photo Tips</p>
            <p>• Use clear, recent photos with good lighting</p>
            <p>• Your first photo will be your profile picture</p>
            <p>• Photos help you get 10x more responses</p>
          </div>
        </div>
      </div>
    </div>
  );
}