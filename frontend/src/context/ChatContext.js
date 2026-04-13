import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../config/api';
import socket from '../config/socket';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [users, setUsers] = useState([]);

  // Fetch all conversations - defined before useEffect to avoid hoisting issues
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/pet-social/conversations');
      setConversations(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  }, []);

  // Listen for new messages via socket and join rooms
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) {
      console.log('User not authenticated, skipping socket room joining');
      return;
    }

    // Join user room to receive messages
    console.log('Joining user room:', userId);
    socket.emit('join-user-room', userId);

    const handleNewMessage = (msg) => {
      console.log('New message received via socket:', msg);
      // If this message belongs to the active conversation, add it to messages
      if (activeConversation && msg.conversationId === activeConversation._id) {
        setMessages(prev => [...prev, msg]);
      }
      // Update conversations to show new last message
      fetchConversations();
    };

    const handleConversationUpdate = (data) => {
      console.log('Conversation updated via socket:', data);
      fetchConversations();
    };

    socket.on('chat:new-message', handleNewMessage);
    socket.on('conversation:updated', handleConversationUpdate);

    // Join conversation room when conversation changes
    if (activeConversation?._id) {
      console.log('Joining conversation room:', activeConversation._id);
      socket.emit('join-conversation', activeConversation._id);
    }

    return () => {
      socket.off('chat:new-message', handleNewMessage);
      socket.off('conversation:updated', handleConversationUpdate);
    };
  }, [activeConversation, fetchConversations]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const res = await api.get(`/pet-social/messages/${conversationId}`);
      setMessages(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (receiverId, content, conversationId = null) => {
    try {
      const res = await api.post('/pet-social/messages', {
        recipientId: receiverId,
        text: content,
        conversationId
      });
      
      if (!conversationId) {
        // New conversation created
        await fetchConversations();
      }
      
      return res.data.data;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  }, [fetchConversations]);

  // Start conversation with user
  const startConversation = useCallback(async (userId) => {
    try {
      // Check if conversation already exists
      const existing = conversations.find(c => 
        c.participants.some(p => p._id === userId || p === userId)
      );
      
      if (existing) {
        setActiveConversation(existing);
        await fetchMessages(existing._id);
      } else {
        // Create new conversation by sending first message
        setActiveConversation({ participants: [{ _id: userId }], _id: null });
        setMessages([]);
      }
      
      setIsChatOpen(true);
    } catch (err) {
      console.error('Failed to start conversation:', err);
    }
  }, [conversations, fetchMessages]);

  // Fetch all users for discovery
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users'); // Assuming this endpoint exists
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  // Open chat with specific user
  const openChat = useCallback(async (user) => {
    await startConversation(user._id);
  }, [startConversation]);

  // Close chat
  const closeChat = useCallback(() => {
    setIsChatOpen(false);
    setActiveConversation(null);
    setMessages([]);
  }, []);

  const value = {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    setMessages,
    isChatOpen,
    users,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startConversation,
    fetchUsers,
    openChat,
    closeChat,
    setIsChatOpen
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
