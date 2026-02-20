import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import { socketEvents } from '../services/socket';
import { Icons } from './Icons';

const MAX_MESSAGE_LENGTH = 2000;

export default function ChatInterface({
  conversationId,
  otherUser,
  messages,
  onSendMessage,
  onTyping,
  loading,
  currentUserId,
  onBack // Prop for mobile back navigation
}) {
  const [messageContent, setMessageContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherUserTyping]);

  // Focus input on load (Desktop only)
  useEffect(() => {
    if (window.innerWidth > 768) {
        inputRef.current?.focus();
    }
  }, [conversationId]);

  // Socket Typing Listeners
  useEffect(() => {
    const handleUserTyping = (data) => {
      if (!data) return;
      if (data.conversationId && data.conversationId !== conversationId) return;
      if (data.userId !== currentUserId) setOtherUserTyping(true);
    };

    const handleUserStopTyping = (data) => {
      if (!data) return;
      if (data.conversationId && data.conversationId !== conversationId) return;
      if (data.userId !== currentUserId) setOtherUserTyping(false);
    };

    const offTyping = socketEvents.onUserTyping(handleUserTyping);
    const offStopTyping = socketEvents.onUserStopTyping(handleUserStopTyping);

    return () => {
      offTyping?.();
      offStopTyping?.();
    };
  }, [currentUserId, conversationId]);

  // Reset state on conversation change
  useEffect(() => {
    setOtherUserTyping(false);
    setMessageContent('');
    setIsTyping(false);
    setSending(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [conversationId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = messageContent.trim();
    if (!content || sending) return;

    setSending(true);
    setMessageContent('');
    setIsTyping(false);
    onTyping?.(false);

    try {
      await onSendMessage(content);
    } finally {
      setSending(false);
      // Keep focus on desktop
      if (window.innerWidth > 768) {
          inputRef.current?.focus();
      }
    }
  };

  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (value.length > MAX_MESSAGE_LENGTH) return;
      setMessageContent(value);

      if (value && !isTyping) {
        setIsTyping(true);
        onTyping?.(true);
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping?.(false);
      }, 2000);
    },
    [isTyping, onTyping]
  );

  const otherUserName = otherUser?.fullName || otherUser?.email || 'User';
  const otherUserInitial = otherUserName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-full w-full">
      
      {/* ===== CHAT HEADER ===== */}
      <div className="px-4 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/80 backdrop-blur-md sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Back Button */}
          <button 
            onClick={onBack}
            className="md:hidden p-2 -ml-2 rounded-full hover:bg-[var(--surface-glass-active)] text-[var(--text-muted)] transition-colors"
          >
            <Icons.ChevronLeft size={24} />
          </button>

          {/* Avatar */}
          <div className="relative flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center text-white font-bold text-base shadow-md overflow-hidden ring-2 ring-[var(--bg-primary)]">
              {otherUser?.photoUrl ? (
                <img src={otherUser.photoUrl} alt={otherUserName} className="w-full h-full object-cover" />
              ) : (
                otherUserInitial
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--bg-primary)] shadow-sm" />
          </div>

          {/* User Info */}
          <div className="min-w-0 flex flex-col">
            <h3 className="font-bold text-[var(--text-primary)] text-sm md:text-base leading-tight truncate cursor-pointer hover:underline decoration-[var(--accent-500)] underline-offset-2">
              {otherUserName}
            </h3>
            <p className="text-[11px] font-medium leading-tight h-3.5 mt-0.5">
              {otherUserTyping ? (
                <span className="flex items-center gap-1 text-[var(--accent-500)] animate-pulse">
                  Typing...
                </span>
              ) : (
                <span className="text-[var(--text-muted)]">Active Now</span>
              )}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-[var(--surface-glass-active)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <Icons.Phone size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-[var(--surface-glass-active)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <Icons.Video size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-[var(--surface-glass-active)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <Icons.Info size={20} />
          </button>
        </div>
      </div>

      {/* ===== MESSAGES SCROLL AREA ===== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="spinner-lg opacity-50" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full pb-20">
            <div className="text-center space-y-4 p-8 rounded-3xl bg-[var(--surface-glass)]/50 border border-[var(--border-subtle)] backdrop-blur-sm max-w-sm mx-auto animate-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-[var(--accent-500)]/10 flex items-center justify-center mx-auto ring-1 ring-[var(--accent-500)]/20">
                 <Icons.MessageSquare size={32} className="text-[var(--accent-500)]" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-[var(--text-primary)]">Say Hello!</h4>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  You matched with {otherUserName.split(' ')[0]}. Break the ice now!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Date Divider */}
            <div className="flex justify-center sticky top-0 z-10 pointer-events-none">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-primary)]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[var(--border-subtle)] shadow-sm">
                Today
              </span>
            </div>

            {messages.map((message, index) => {
              const senderId = message.senderId?._id || message.senderId;
              const isOwn = senderId?.toString() === currentUserId?.toString();

              return (
                <MessageBubble
                  key={message._id || index}
                  message={message}
                  isOwn={isOwn}
                  isOptimistic={message._isOptimistic}
                />
              );
            })}

            {otherUserTyping && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <div className="w-8 h-8 rounded-full bg-[var(--surface-glass)] border border-[var(--border-primary)] flex items-center justify-center overflow-hidden">
                   {otherUser?.photoUrl ? (
                      <img src={otherUser.photoUrl} className="w-full h-full object-cover" alt="" />
                   ) : (
                      <span className="text-xs font-bold">{otherUserInitial}</span>
                   )}
                </div>
                <div className="bg-[var(--surface-glass)] rounded-2xl rounded-tl-none px-4 py-3 border border-[var(--border-primary)] shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce delay-0" />
                    <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-2" />
          </>
        )}
      </div>

      {/* ===== INPUT AREA ===== */}
      <div className="p-4 bg-[var(--bg-primary)] border-t border-[var(--border-primary)]">
        <div className="max-w-4xl mx-auto w-full">
          <form 
            onSubmit={handleSendMessage} 
            className="flex items-end gap-2 p-2 bg-[var(--surface-glass)] border border-[var(--border-primary)] rounded-[24px] shadow-sm focus-within:ring-2 focus-within:ring-[var(--accent-500)]/30 focus-within:border-[var(--accent-500)] transition-all"
          >
            <button
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-glass-active)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
            >
              <Icons.Plus size={22} />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={messageContent}
              onChange={handleInputChange}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder="Type a message..."
              className="flex-1 py-2.5 bg-transparent border-none text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-0 min-h-[44px] max-h-32 text-sm md:text-base"
              disabled={sending}
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={!messageContent.trim() || sending}
              className="w-10 h-10 rounded-full bg-[var(--accent-500)] flex items-center justify-center text-white shadow-md hover:bg-[var(--accent-600)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all flex-shrink-0 mb-[1px]"
            >
              {sending ? (
                <span className="spinner-sm border-white/40 border-t-white w-4 h-4" />
              ) : (
                <Icons.Send size={18} className="translate-x-0.5" />
              )}
            </button>
          </form>
          
          {messageContent.length > 1500 && (
            <div className="text-right px-4 mt-1">
               <span className={`text-[10px] font-medium ${messageContent.length > 1900 ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>
                  {messageContent.length} / {MAX_MESSAGE_LENGTH}
               </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}