import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import ChatWindow from './ChatWindow';
import UserList from './UserList';

const ChatButton = () => {
  const { isChatOpen, setIsChatOpen, openChat, unreadCount, fetchConversations } = useChat();
  const [showUserList, setShowUserList] = useState(false);

  // Listen for custom openChat event from marketplace
  useEffect(() => {
    const handleOpenChat = (event) => {
      const user = event.detail;
      if (user) {
        openChat(user);
      }
    };

    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, [openChat]);

  const handleChatClick = () => {
    if (!isChatOpen) {
      fetchConversations();
    }
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button 
        className="chat-floating-btn" 
        onClick={handleChatClick}
        title={isChatOpen ? "Close Chat" : "Open Chat"}
      >
        {isChatOpen ? '✕' : '💬'}
        {!isChatOpen && unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <ChatWindow 
          onClose={() => setIsChatOpen(false)}
          onShowUserList={() => setShowUserList(true)}
        />
      )}

      {/* User List Modal */}
      {showUserList && (
        <div className="modal-overlay" onClick={() => setShowUserList(false)}>
          <UserList 
            onClose={() => setShowUserList(false)}
          />
        </div>
      )}
    </>
  );
};

export default ChatButton;
