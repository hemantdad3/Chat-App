import React from 'react';
import { SocketProvider } from '../context/SocketContext';
import { ChatProvider, useChat } from '../context/ChatContext';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';

/**
 * Inner Chat Layout container with mobile responsiveness
 */
const ChatLayout = () => {
  const { activeConversation, selectConversation } = useChat();

  return (
    <div className="h-screen h-[100dvh] w-screen overflow-hidden bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Sidebar: full width on mobile when no active conversation, fixed width on desktop */}
      <div
        className={`h-full w-full md:w-80 lg:w-96 shrink-0 transition-all duration-200 ${
          activeConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        <Sidebar />
      </div>

      {/* ChatWindow: full width on mobile when conversation is active, fills remainder on desktop */}
      <div
        className={`h-full flex-1 transition-all duration-200 ${
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
