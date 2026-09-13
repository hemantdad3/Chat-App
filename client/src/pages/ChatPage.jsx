import React from 'react';
import { SocketProvider } from '../context/SocketContext';
import { ChatProvider, useChat } from '../context/ChatContext';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';

/**
 * Inner Chat Layout container that uses ChatContext
 */
const ChatLayout = () => {
  const { activeConversation, selectConversation } = useChat();

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Sidebar: always visible on desktop; on mobile visible only when no active conversation */}
      <div
        className={`h-full w-full md:w-auto ${
          activeConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        <Sidebar />
      </div>

      {/* ChatWindow: always visible on desktop; on mobile visible only when conversation is active */}
      <div
        className={`h-full flex-1 ${
          activeConversation ? 'flex' : 'hidden md:flex'
        }`}
      >
        <ChatWindow onBack={() => selectConversation(null)} />
      </div>
    </div>
  );
};

/**
 * Main ChatPage wrapping layout in SocketProvider and ChatProvider
 */
const ChatPage = () => {
  return (
    <SocketProvider>
      <ChatProvider>
        <ChatLayout />
      </ChatProvider>
    </SocketProvider>
  );
};

export default ChatPage;
