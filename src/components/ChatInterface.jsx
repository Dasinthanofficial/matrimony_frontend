// ===== FIXED FILE: ./src/components/ChatInterface.jsx =====
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
}) {
  const [messageContent, setMessageContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherUserTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [conversationId]);

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

    // ✅ FIX: Prevent double submit
    setSending(true);
    setMessageContent('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setIsTyping(false);
    onTyping?.(false);

    try {
      await onSendMessage(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      // ✅ FIX: Enforce max length in handler as well
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-[var(--border-primary)] bg-[var(--surface-glass)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg overflow-hidden">
                {otherUser?.photoUrl ? (
                  <img
                    src={otherUser.photoUrl}
                    alt={otherUserName}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  otherUserInitial
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-[var(--bg-primary)]" />
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-[var(--text-primary)] text-base sm:text-lg tracking-tight truncate">
                {otherUserName}
              </h3>
              <p className="text-[10px] sm:text-xs font-semibold text-[var(--accent-500)] uppercase tracking-wider">
                {otherUserTyping ? (
                  <span className="flex items-center gap-1">
                    <span className="animate-pulse">Typing</span>
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-[var(--accent-500)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-[var(--accent-500)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-[var(--accent-500)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </span>
                ) : (
                  'Online'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-glass-hover)] hover:text-[var(--text-primary)] transition-all">
              <Icons.Phone size={16} />
            </button>
            <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-glass-hover)] hover:text-[var(--text-primary)] transition-all">
              <Icons.MoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="spinner-lg mx-auto" />
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 p-6">
              <div className="icon-box-lg mx-auto opacity-40">
                <Icons.MessageCircle size={28} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-muted)] mb-1">No Messages Yet</h4>
                <p className="text-xs text-[var(--text-muted)]">Start the conversation!</p>
              </div>
            </div>
          </div>
        ) : (
          <>
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
              <div className="flex items-center gap-3 px-2 sm:px-4">
                <div className="w-8 h-8 rounded-full bg-[var(--surface-glass)] border border-[var(--border-primary)] flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">
                  {otherUserInitial}
                </div>
                <div className="bg-[var(--surface-glass)] rounded-2xl px-4 py-3 border border-[var(--border-primary)]">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ✅ FIX: Input area — fixed JSX syntax error, added double-submit guard */}
      <div className="p-2 sm:p-4 border-t border-[var(--border-primary)] bg-[var(--surface-glass)]">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[var(--surface-glass)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-glass-hover)] hover:text-[var(--text-primary)] transition-all flex-shrink-0"
          >
            <Icons.Plus size={18} />
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={messageContent}
              onChange={handleInputChange}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder="Type your message..."
              className="w-full px-4 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl bg-[var(--surface-glass)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-500)]/50 focus:ring-2 focus:ring-[var(--accent-500)]/20 transition-all text-sm"
              disabled={sending}
            />
            {/* ✅ FIX: Character count near limit */}
            {messageContent.length > 1800 && (
              <span
                className={`absolute right-3 bottom-1 text-[10px] font-medium ${messageContent.length > 1950 ? 'text-red-400' : 'text-[var(--text-muted)]'
                  }`}
              >
                {messageContent.length}/{MAX_MESSAGE_LENGTH}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!messageContent.trim() || sending}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center text-white shadow-lg hover:shadow-[var(--accent-500)]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 active:scale-95"
          >
            {sending ? (
              <span className="spinner-sm border-white/30 border-t-white" />
            ) : (
              <Icons.Send size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}