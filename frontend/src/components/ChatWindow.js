import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';

const ChatWindow = ({ onClose }) => {
  const { 
    activeConversation, 
    messages, 
    setMessages,
    sendMessage, 
    fetchMessages,
    conversations,
    fetchConversations,
    startConversation
  } = useChat();
  
  const [messageText, setMessageText] = useState('');
  const [showConversations, setShowConversations] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Get the other participant's info
  useEffect(() => {
    if (activeConversation) {
      const other = activeConversation.participants?.find(
        p => p._id !== localStorage.getItem('userId')
      );
      setOtherUser(other);
      
      // Fetch messages if conversation exists
      if (activeConversation._id) {
        fetchMessages(activeConversation._id);
      }
    }
  }, [activeConversation, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    const content = messageText.trim();
    const currentUserId = localStorage.getItem('userId');
    
    // Get receiver ID from active conversation
    let receiverId;
    
    if (activeConversation && activeConversation.participants) {
      // Find the other participant in existing conversation
      const otherParticipant = activeConversation.participants.find(p => {
        const participantId = p._id || p; // Handle both object and string IDs
        return participantId !== currentUserId;
      });
      receiverId = otherParticipant?._id || otherParticipant;
    }
    
    // For new conversation (opened from marketplace/profile), get receiver from first participant
    if (!receiverId && activeConversation?.participants?.[0]) {
      receiverId = activeConversation.participants[0]._id || activeConversation.participants[0];
    }
    
    if (!receiverId) {
      console.error('Could not determine receiver. Active conversation:', activeConversation);
      alert('Could not determine receiver. Please try opening the chat again.');
      return;
    }
    
    console.log('Sending message to receiver:', receiverId, 'conversationId:', activeConversation?._id);
    
    // Add optimistic message to state immediately
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      text: content,
      senderId: { _id: currentUserId, name: 'You' },
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };
    
    // Add to messages state
    setMessages(prev => [...prev, optimisticMessage]);
    
    setMessageText('');
    setLoading(true);
    
    // Send the message using context
    try {
      const result = await sendMessage(receiverId, content, activeConversation?._id);
      console.log('Message sent successfully:', result);
      
      // Refresh messages to get the actual message from server
      if (activeConversation._id) {
        await fetchMessages(activeConversation._id);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (showConversations) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <h4>💬 Conversations</h4>
          <button className="btn-close" onClick={() => setShowConversations(false)}>✕</button>
        </div>
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <div className="empty-state">
              <p>No conversations yet</p>
              <p className="text-muted">Start chatting with users!</p>
            </div>
          ) : (
            conversations.map(conv => {
              const other = conv.participants?.find(
                p => p._id !== localStorage.getItem('userId')
              );
              return (
                <div 
                  key={conv._id} 
                  className="conversation-item"
                  onClick={() => {
                    startConversation(other._id);
                    setShowConversations(false);
                  }}
                >
                  <div className="conversation-avatar">
                    {other?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="conversation-info">
                    <span className="conversation-name">{other?.name || 'Unknown'}</span>
                    <span className="conversation-preview">
                      {conv.lastMessage || 'Click to start chatting'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <button 
            className="btn-back" 
            onClick={() => setShowConversations(true)}
            title="Back to conversations"
          >
            ←
          </button>
          <div className="chat-user-info">
            <span className="chat-avatar">
              {otherUser?.name?.charAt(0).toUpperCase() || '?'}
            </span>
            <span className="chat-username">{otherUser?.name || 'Chat'}</span>
          </div>
        </div>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>👋 Start the conversation!</p>
            <p className="text-muted">Send your first message below</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId?._id === localStorage.getItem('userId') || 
                         msg.senderId === localStorage.getItem('userId');
            const senderName = isMe ? 'You' : (msg.senderId?.name || otherUser?.name || 'User');
            return (
              <div 
                key={msg._id || idx} 
                className={`message ${isMe ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  {!isMe && <span className="message-sender">{senderName}</span>}
                  <span className="message-text">{msg.text}</span>
                  <span className="message-time">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          disabled={loading}
        />
        <button 
          type="submit" 
          className="btn-send"
          disabled={!messageText.trim() || loading}
        >
          {loading ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
