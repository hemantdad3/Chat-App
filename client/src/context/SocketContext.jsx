import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  useEffect(() => {
    // Only connect socket when user is logged in
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
        setOnlineUserIds(new Set());
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      withCredentials: true,
      auth: {
        token: user.token,
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    // Initial list of online users from server
    newSocket.on('online_users', (userIds) => {
      setOnlineUserIds(new Set(userIds.map((id) => id.toString())));
    });

    // Real-time presence change event
    newSocket.on('user_status_change', ({ userId, isOnline }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (isOnline) {
          next.add(userId.toString());
        } else {
          next.delete(userId.toString());
        }
        return next;
      });
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Helper function to check if a user is online
  const isUserOnline = useCallback(
    (userId) => {
      if (!userId) return false;
      return onlineUserIds.has(userId.toString());
    },
    [onlineUserIds]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        onlineUserIds,
        isUserOnline,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
