// ===== FIXED FILE: ./src/services/socket.js =====
import io from 'socket.io-client';

let socket = null;
let currentToken = null; // ✅ FIX: Track token separately for reliable comparison
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const initializeSocket = (token) => {
  if (!token) return socket;

  // ✅ FIX: Compare against our tracked token, not socket internal state
  if (socket?.connected && currentToken === token) return socket;

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  currentToken = token;

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connect_error:', err?.message || err);

    // ✅ FIX: If token expired, notify app to re-init with fresh token
    if (err?.message === 'Token expired' || err?.message === 'Invalid token') {
      window.dispatchEvent(
        new CustomEvent('socket:auth_error', {
          detail: { message: err.message },
        })
      );
    }

    window.dispatchEvent(
      new CustomEvent('socket:connect_error', {
        detail: { message: err?.message || 'Socket connection error' },
      })
    );
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentToken = null; // ✅ FIX: Clear tracked token
  }
};

const on = (event, handler) => {
  if (!socket || !handler) return () => {};
  socket.on(event, handler);
  return () => socket?.off(event, handler);
};

export const socketEvents = {
  joinConversation: (conversationId) => {
    if (socket?.connected && conversationId) socket.emit('join_conversation', conversationId);
  },

  leaveConversation: (conversationId) => {
    if (socket?.connected && conversationId) socket.emit('leave_conversation', conversationId);
  },

  sendMessage: (conversationId, receiverId, content, messageType = 'text', clientId = undefined) => {
    if (socket?.connected && conversationId && receiverId && content) {
      socket.emit('send_message', { conversationId, receiverId, content, messageType, clientId });
    }
  },

  sendTyping: (conversationId) => {
    if (socket?.connected && conversationId) socket.emit('typing', { conversationId });
  },

  sendStopTyping: (conversationId) => {
    if (socket?.connected && conversationId) socket.emit('stop_typing', { conversationId });
  },

  markRead: (conversationId) => {
    if (socket?.connected && conversationId) socket.emit('mark_read', { conversationId });
  },

  onNewMessage: (cb) => on('new_message', cb),
  onMessageError: (cb) => on('message_error', cb),
  onMessageNotification: (cb) => on('message_notification', cb),
  onUserTyping: (cb) => on('user_typing', cb),
  onUserStopTyping: (cb) => on('user_stop_typing', cb),
  onMessagesRead: (cb) => on('messages_read', cb),
  onUserStatusChange: (cb) => on('user_status_change', cb),

  offNewMessage: (cb) => cb && socket?.off('new_message', cb),
  offMessageError: (cb) => cb && socket?.off('message_error', cb),
  offMessageNotification: (cb) => cb && socket?.off('message_notification', cb),
  offUserTyping: (cb) => cb && socket?.off('user_typing', cb),
  offUserStopTyping: (cb) => cb && socket?.off('user_stop_typing', cb),

  removeAllListeners: () => {
    if (!socket) return;
    socket.off('new_message');
    socket.off('message_error');
    socket.off('message_notification');
    socket.off('user_typing');
    socket.off('user_stop_typing');
    socket.off('messages_read');
    socket.off('user_status_change');
    socket.off('connect_error');
  },
};