// ===== FILE: ./src/components/MessageBubble.jsx =====
import React from 'react';

export default function MessageBubble({ message, isOwn, isOptimistic }) {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      {/* ✅ FIX: wider max-width on mobile, responsive padding */}
      <div
        className={`max-w-[85%] sm:max-w-[70%] px-4 sm:px-5 py-2.5 sm:py-3 relative group ${isOwn
            ? 'bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] rounded-[20px] rounded-br-md text-white shadow-lg'
            : 'bg-[var(--surface-glass)] backdrop-blur-sm border border-[var(--border-primary)] rounded-[20px] rounded-bl-md text-[var(--text-primary)]'
          } ${isOptimistic ? 'opacity-70' : ''}`}
      >
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message.content}
        </p>

        <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${isOwn ? 'text-white/70' : 'text-[var(--text-muted)]'
          }`}>
          <span className="text-[10px] font-medium">
            {formatTime(message.createdAt)}
          </span>

          {isOwn && (
            <span className="text-[10px]">
              {isOptimistic ? (
                <span className="opacity-50">⏳</span>
              ) : message.isRead ? (
                <span className="text-blue-300">✓✓</span>
              ) : (
                <span>✓</span>
              )}
            </span>
          )}
        </div>

        <div className={`hidden sm:block absolute ${isOwn ? 'left-0 -translate-x-full pl-2' : 'right-0 translate-x-full pr-2'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
          <span className="text-[9px] text-[var(--text-muted)] whitespace-nowrap">
            {new Date(message.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}