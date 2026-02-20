import React from 'react';
import { Icons } from './Icons';

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function MessageBubble({ message, isOwn, isOptimistic }) {
  return (
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
      <div className={`max-w-[75%] md:max-w-[65%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        
        <div
          className={`
            relative px-4 py-2.5 rounded-2xl shadow-sm break-words text-sm md:text-base
            ${isOwn 
              ? 'bg-[var(--accent-500)] text-white rounded-tr-none' 
              : 'bg-[var(--surface-glass)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-none'
            }
            ${isOptimistic ? 'opacity-70' : 'opacity-100'}
          `}
        >
          {message.content}
          
          {/* Status Checkmarks for own messages */}
          {isOwn && (
             <div className="absolute -bottom-1 -left-2 text-[var(--accent-500)] bg-[var(--bg-primary)] rounded-full p-0.5 border border-[var(--border-subtle)] shadow-sm">
                {isOptimistic ? (
                   <Icons.Clock size={10} className="animate-spin" />
                ) : (
                   <Icons.Check size={10} />
                )}
             </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 mt-1 px-1">
           <span className="text-[10px] text-[var(--text-muted)]">
              {formatTime(message.createdAt)}
           </span>
        </div>

      </div>
    </div>
  );
}