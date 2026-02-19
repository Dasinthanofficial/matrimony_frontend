// ===== FIXED FILE: ./src/pages/ChatPage.jsx =====
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';
import ConversationList from '../components/ConversationList';
import { chatAPI } from '../services/api';
import { socketEvents } from '../services/socket';
import { Icons } from '../components/Icons';

const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

const photoUrlFromProfile = (profile) =>
  profile?.photoUrl ||
  profile?.photos?.find((p) => p.isProfile)?.url ||
  profile?.photos?.[0]?.url ||
  null;

// ✅ FIX: Always use string keys for unreadCount (backend uses string userId keys)
const setUnreadForUser = (unreadCount, userId, value) => {
  if (!userId) return unreadCount;

  const key = userId?.toString?.() || String(userId);

  if (unreadCount && typeof unreadCount.get === 'function' && typeof unreadCount.set === 'function') {
    const next = new Map(unreadCount);
    next.set(key, value);
    return next;
  }
  if (unreadCount && typeof unreadCount === 'object') {
    return { ...unreadCount, [key]: value };
  }
  return { [key]: value };
};

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [mobileView, setMobileView] = useState('list');

  const { getUserId } = useAuth();
  const { conversationId, participantId } = useParams();
  const navigate = useNavigate();
  const currentUserId = getUserId();

  const pendingClientIds = useRef(new Set());
  // ✅ FIX: Track selected conversation ID in a ref to prevent double loading
  const selectedConvIdRef = useRef(null);

  const getReceiverId = (conv) => {
    const parts = conv?.participants || [];
    const other = parts.find((p) => idOf(p)?.toString() !== currentUserId?.toString());
    return idOf(other);
  };

  const refreshConversationList = useCallback(async () => {
    try {
      const res = await chatAPI.getConversations();
      const convs = res.conversations || [];
      setConversations(convs);

      if (selectedConvIdRef.current) {
        const updated = convs.find((c) => c._id === selectedConvIdRef.current);
        if (updated) setSelectedConv(updated);
      }
    } catch {
      // ignore
    }
  }, []);

  // ✅ FIX: Extracted conversation selection logic with guard
  const selectConversation = useCallback(
    async (conv) => {
      if (!conv?._id) return;

      // ✅ FIX: Skip if already selected — prevents double loading on navigate
      if (selectedConvIdRef.current === conv._id) return;

      // Leave previous
      if (selectedConvIdRef.current) {
        socketEvents.leaveConversation?.(selectedConvIdRef.current);
      }

      selectedConvIdRef.current = conv._id;
      setSelectedConv(conv);
      setMsgLoading(true);
      setMobileView('chat');

      try {
        socketEvents.joinConversation?.(conv._id);

        const res = await chatAPI.getMessages(conv._id);
        setMessages(res.messages || []);

        await chatAPI.markAsRead(conv._id);

        setConversations((prev) =>
          prev.map((c) =>
            c._id === conv._id
              ? { ...c, unreadCount: setUnreadForUser(c.unreadCount, currentUserId, 0), unreadForMe: 0 }
              : c
          )
        );
        window.dispatchEvent(new Event('chat:changed'));
      } catch (e) {
        console.error('Load messages error:', e);
      } finally {
        setMsgLoading(false);
      }
    },
    [currentUserId]
  );

  const handleSelect = useCallback(
    async (conv) => {
      await selectConversation(conv);

      // Update URL if different
      if (conv._id !== window.location.pathname.split('/chat/')[1]) {
        navigate(`/chat/${conv._id}`, { replace: true });
      }
    },
    [selectConversation, navigate]
  );

  const handleBackToList = () => {
    setMobileView('list');
  };

  // ✅ FIX: Initial load — separated from handleSelect to avoid stale closures
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        // Handle /chat/with/:participantId route
        if (participantId) {
          const created = await chatAPI.getOrCreateConversation(participantId);
          const conv = created?.conversation;
          if (conv?._id && !cancelled) {
            navigate(`/chat/${conv._id}`, { replace: true });
            return; // Will re-trigger this effect with new conversationId
          }
        }

        const res = await chatAPI.getConversations();
        if (cancelled) return;

        const convs = res.conversations || [];
        setConversations(convs);

        if (convs.length > 0) {
          const target = conversationId ? convs.find((c) => c._id === conversationId) : convs[0];
          if (target) {
            await selectConversation(target);
          }
        }
      } catch (e) {
        console.error('Load conversations error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [conversationId, participantId, navigate, selectConversation]);

  useEffect(() => {
    const onChatChanged = () => refreshConversationList();
    window.addEventListener('chat:changed', onChatChanged);
    return () => window.removeEventListener('chat:changed', onChatChanged);
  }, [refreshConversationList]);

  const handleSend = async (content) => {
    if (!selectedConv || !content.trim()) return;

    const receiverId = getReceiverId(selectedConv);
    if (!receiverId) return;

    const clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    pendingClientIds.current.add(clientId);

    const tempMessage = {
      _id: `temp-${clientId}`,
      clientId,
      conversationId: selectedConv._id,
      senderId: currentUserId,
      receiverId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      _isOptimistic: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    socketEvents.sendMessage?.(selectedConv._id, receiverId, content.trim(), 'text', clientId);
  };

  const handleTyping = (isTyping) => {
    if (!selectedConv) return;
    if (isTyping) socketEvents.sendTyping?.(selectedConv._id);
    else socketEvents.sendStopTyping?.(selectedConv._id);
  };

  useEffect(() => {
    if (!selectedConv?._id) return;

    const handleNewMessage = (data) => {
      if (data.conversationId !== selectedConv._id) return;

      if (data.clientId && pendingClientIds.current.has(data.clientId)) {
        pendingClientIds.current.delete(data.clientId);
        setMessages((prev) => prev.map((m) => (m.clientId === data.clientId ? { ...data, _isOptimistic: false } : m)));
      } else {
        setMessages((prev) => (prev.some((m) => m._id === data._id) ? prev : [...prev, data]));
      }

      socketEvents.markRead?.(selectedConv._id);
    };

    const handleMessageError = ({ error, clientId }) => {
      if (clientId) pendingClientIds.current.delete(clientId);
      if (clientId) setMessages((prev) => prev.filter((m) => m.clientId !== clientId));
      if (error) alert(error);
    };

    const offNew = socketEvents.onNewMessage?.(handleNewMessage) || (() => {});
    const offErr = socketEvents.onMessageError?.(handleMessageError) || (() => {});

    return () => {
      offNew();
      offErr();
    };
  }, [selectedConv?._id]);

  const otherUserProfile = selectedConv?.otherUser
    ? { ...selectedConv.otherUser, photoUrl: photoUrlFromProfile(selectedConv.otherUser) }
    : null;

  return (
    <div className="p-2 sm:p-4 lg:p-6 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
      <div className={`flex items-center justify-between mb-3 sm:mb-4 ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex items-center gap-3">
          <div className="icon-box-md icon-box-accent hidden sm:flex">
            <Icons.MessageCircle size={20} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold">Messages</h1>
            <p className="text-xs text-[var(--text-muted)]">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Link to="/dashboard" className="btn-secondary py-2 px-3 sm:px-4 text-xs">
          <Icons.Home size={14} />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
      </div>

      <div className="h-[calc(100%-3rem)] sm:h-[calc(100%-4rem)] card overflow-hidden flex">
        <div
          className={`w-full md:w-72 lg:w-80 border-r border-[var(--border-primary)] flex-shrink-0 flex flex-col ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3 sm:p-4 border-b border-[var(--border-primary)]">
            <h3 className="font-semibold text-sm">Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <ConversationList
              conversations={conversations}
              selectedId={selectedConv?._id}
              onSelect={handleSelect}
              loading={loading}
              currentUserId={currentUserId}
            />
          </div>
        </div>

        <div className={`flex-1 flex flex-col min-w-0 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
          {selectedConv ? (
            <>
              <button
                onClick={handleBackToList}
                className="md:hidden flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border-primary)] text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-glass)] transition-colors flex-shrink-0"
              >
                <Icons.ChevronLeft size={16} />
                <span>Back to conversations</span>
              </button>
              <ChatInterface
                conversationId={selectedConv._id}
                otherUser={otherUserProfile}
                messages={messages}
                onSendMessage={handleSend}
                onTyping={handleTyping}
                loading={msgLoading}
                currentUserId={currentUserId}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="icon-box-xl mx-auto mb-4 opacity-30">
                  <Icons.MessageCircle size={32} />
                </div>
                <h3 className="font-semibold mb-2">No Conversation Selected</h3>
                <p className="text-[var(--text-muted)] text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}