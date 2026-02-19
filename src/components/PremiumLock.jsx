// src/components/PremiumLock.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from './Icons';

export default function PremiumLock({ 
  title = 'Premium Feature',
  description = 'Upgrade to premium to unlock this feature',
  compact = false 
}) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <Icons.Lock size={16} className="text-amber-500" />
        <span className="text-xs font-medium text-amber-500">Premium Only</span>
        <button 
          onClick={() => navigate('/pricing')}
          className="ml-auto text-xs font-medium text-amber-500 hover:underline"
        >
          Upgrade
        </button>
      </div>
    );
  }

  return (
    <div className="premium-lock">
      <div className="premium-lock-icon">
        <Icons.Lock size={28} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/70 mb-6 max-w-xs">{description}</p>
      <button 
        onClick={() => navigate('/pricing')}
        className="btn-primary"
      >
        <Icons.Crown size={16} />
        <span>Upgrade to Premium</span>
      </button>
    </div>
  );
}