import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
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

const setUnreadForUser = (unreadCount, userId, value) => {
  if (!userId) return unreadCount;
  const key = userId?.toString?.() || String(userId);
  if (unreadCount && typeof unreadCount.get === 'function') {
    const next = new Map(unreadCount);
    next.set(key, value);
    return next;
  }
  if (unreadCount && typeof unreadCount === 'object') return { ...unreadCount, [key]: value };
  return { [key]: value };
};

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  
  // 'list' or 'chat' - controls mobile view visibility
  const [mobileView, setMobileView] = useState('list');

  const { getUserId } = useAuth();
  const { conversationId, participantId } = useParams();
  const navigate = useNavigate();
  const currentUserId = getUserId();

  const pendingClientIds = useRef(new Set());
  const selectedConvIdRef = useRef(null);

  /* ---- Helpers ---- */
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

  const selectConversation = useCallback(
    async (conv) => {
      if (!conv?._id) return;
      
      // If clicking the same convo, just ensure we switch to view it (mobile)
      if (selectedConvIdRef.current === conv._id) {
        setMobileView('chat');
        return;
      }

      if (selectedConvIdRef.current) socketEvents.leaveConversation?.(selectedConvIdRef.current);

      selectedConvIdRef.current = conv._id;
      setSelectedConv(conv);
      setMsgLoading(true);
      setMobileView('chat'); // Switch view on mobile

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
      if (conv._id !== window.location.pathname.split('/chat/')[1]) {
        navigate(`/chat/${conv._id}`, { replace: true });
      }
    },
    [selectConversation, navigate]
  );

  /* ---- Initial Load ---- */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        if (participantId) {
          const created = await chatAPI.getOrCreateConversation(participantId);
          const conv = created?.conversation;
          if (conv?._id && !cancelled) {
            navigate(`/chat/${conv._id}`, { replace: true });
            return;
          }
        }
        const res = await chatAPI.getConversations();
        if (cancelled) return;
        const convs = res.conversations || [];
        setConversations(convs);
        if (convs.length > 0) {
          const target = conversationId ? convs.find((c) => c._id === conversationId) : null;
          if (target) await selectConversation(target);
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

  /* ---- Send & Socket Handlers ---- */
  const handleSend = async (content) => {
    if (!selectedConv || !content.trim()) return;
    const receiverId = getReceiverId(selectedConv);
    if (!receiverId) return;

    const clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    pendingClientIds.current.add(clientId);

    // Optimistic Update
    setMessages((prev) => [
      ...prev,
      {
        _id: `temp-${clientId}`,
        clientId,
        conversationId: selectedConv._id,
        senderId: currentUserId,
        receiverId,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        _isOptimistic: true,
      },
    ]);
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
      
      // Replace optimistic message if match found
      if (data.clientId && pendingClientIds.current.has(data.clientId)) {
        pendingClientIds.current.delete(data.clientId);
        setMessages((prev) =>
          prev.map((m) => (m.clientId === data.clientId ? { ...data, _isOptimistic: false } : m))
        );
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
    // FULL SCREEN CONTAINER
    // calc(100vh - headerHeight) - adjust 64px/80px based on your actual header
    <div className="flex w-full h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-primary)]">
      
      {/* ===== SIDEBAR (Conversation List) ===== */}
      <aside className={`
        flex-col border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] flex-shrink-0
        w-full md:w-[360px] lg:w-[400px] z-20 h-full
        ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-primary)] bg-[var(--surface-glass)]/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
             <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Messages</h1>
             <div className="p-2 rounded-full hover:bg-[var(--surface-glass-active)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-all">
                <Icons.Edit size={20} />
             </div>
          </div>
          
          {/* Search */}
          <div className="relative group">
             <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-500)] transition-colors" size={16} />
             <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] text-sm rounded-xl py-2.5 pl-10 pr-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-500)] focus:ring-1 focus:ring-[var(--accent-500)] transition-all"
             />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <div className="spinner-sm" />
              <p className="text-xs font-medium text-[var(--text-muted)]">Loading...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                <div className="w-14 h-14 rounded-full bg-[var(--surface-glass-active)] flex items-center justify-center mb-4">
                   <Icons.Inbox size={28} className="text-[var(--text-muted)] opacity-50" />
                </div>
                <p className="text-base font-semibold text-[var(--text-primary)]">No messages yet</p>
                <p className="text-sm text-[var(--text-muted)] mt-1 max-w-[200px]">
                  Start connecting with people to see your conversations here.
                </p>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedConv?._id}
              onSelect={handleSelect}
              loading={loading}
              currentUserId={currentUserId}
            />
          )}
        </div>
      </aside>

      {/* ===== MAIN CHAT AREA ===== */}
      <main className={`
        flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)] h-full relative
        ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
      `}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>

        {selectedConv ? (
          <div className="flex flex-col h-full w-full relative z-10">
            <ChatInterface
              conversationId={selectedConv._id}
              otherUser={otherUserProfile}
              messages={messages}
              onSendMessage={handleSend}
              onTyping={handleTyping}
              loading={msgLoading}
              currentUserId={currentUserId}
              onBack={() => setMobileView('list')}
            />
          </div>
        ) : (
          /* Empty State Desktop */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-[var(--surface-glass)] rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-black/5 ring-1 ring-white/5">
              <Icons.MessageSquare size={48} className="text-[var(--accent-500)]" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Your Messages</h2>
            <p className="text-base text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              Select a conversation from the sidebar to start messaging or find new matches to connect with.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}