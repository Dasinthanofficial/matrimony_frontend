// src/components/ProfileFormStep5.jsx
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
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[var(--accent-500)]/20">
          <Icons.Camera size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Gallery</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">Upload up to {MAX_PHOTOS} photos</p>
        </div>
      </div>

      {/* Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all duration-300
          ${dragActive
            ? 'border-[var(--accent-500)] bg-[var(--accent-500)]/5 scale-[1.01]'
            : 'border-[var(--border-secondary)] hover:border-[var(--accent-500)]/50 hover:bg-[var(--surface-glass)]'}
        `}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-sm
            ${dragActive ? 'bg-[var(--accent-500)]/20' : 'bg-[var(--surface-glass)] border border-[var(--border-primary)]'}
          `}>
            <Icons.Upload size={24} className={dragActive ? 'text-[var(--accent-500)]' : 'text-[var(--text-muted)]'} />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)] mb-1">
              {dragActive ? 'Drop photos here' : 'Click or Drag photos here'}
            </p>
            <p className="text-xs text-[var(--text-muted)] max-w-[200px] mx-auto leading-relaxed">
              Supports JPG, PNG, WebP • Max 5MB each
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

      {/* Photo Grid */}
      {photoCount > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Uploaded Photos</span>
            <span className="text-xs font-medium text-[var(--text-muted)]">{photoCount} / {MAX_PHOTOS}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {(data.photos || []).map((photo, index) => (
              <div
                key={index}
                className={`
                  relative group rounded-2xl overflow-hidden aspect-square shadow-sm
                  ${photo.isProfile
                    ? 'ring-2 ring-[var(--accent-500)] ring-offset-2 ring-offset-[var(--bg-primary)]'
                    : 'border border-[var(--border-primary)]'}
                `}
              >
                <img
                  src={photo.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Profile Badge */}
                {photo.isProfile && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-[var(--accent-500)] text-white text-[10px] font-bold uppercase tracking-wide shadow-md flex items-center gap-1">
                    <Icons.Star size={10} fill="currentColor" />
                    Main
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2 p-4 backdrop-blur-[2px]">
                  {!photo.isProfile && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setProfilePhoto(index); }}
                      className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 backdrop-blur-md transition-colors"
                    >
                      Make Profile
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                    className="w-full py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Icons.Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Add More Button (Mini) */}
            {photoCount < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border border-dashed border-[var(--border-secondary)] bg-[var(--surface-glass)] hover:bg-[var(--surface-glass-hover)] hover:border-[var(--accent-500)]/50 transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icons.Plus size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent-500)]" />
                </div>
                <span className="text-[10px] font-medium text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">Add Photo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Help Box */}
      <div className="flex gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <Icons.Lightbulb size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Photo Advice</h4>
          <ul className="text-xs text-[var(--text-secondary)] list-disc list-inside space-y-0.5 ml-1">
            <li>Profiles with photos get <b>10x more responses</b>.</li>
            <li>Use a clear, bright photo as your main profile picture.</li>
            <li>Avoid group photos or blurry images for best results.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}