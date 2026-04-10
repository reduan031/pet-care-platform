import React, { useState, useRef, useEffect } from 'react';
import './AIChatWidget.css';
import api from '../config/api';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! 🐾 I am your PawVerse AI Assistant. How can I help you and your pet today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const toggleWidget = () => setIsOpen(!isOpen);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to format message content with proper line breaks and bullet points
  const formatMessageContent = (content) => {
    if (!content) return '';
    
    const paragraphs = content.split(/\n\n/);
    
    return paragraphs.map((para, idx) => {
      if (para.includes('•') || para.includes('-') || para.match(/^\d+\./m)) {
        const lines = para.split(/\n/);
        return (
          <div key={idx} className="ai-paragraph">
            {lines.map((line, lineIdx) => {
              if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                return <div key={lineIdx} className="ai-bullet-point">• {line.trim().substring(1)}</div>;
              } else if (line.match(/^\d+\./)) {
                return <div key={lineIdx} className="ai-numbered-point">{line.trim()}</div>;
              } else if (line.trim() && line.includes('**')) {
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                  <div key={lineIdx} className="ai-text-line">
                    {parts.map((part, pIdx) => 
                      pIdx % 2 === 1 ? <strong key={pIdx}>{part}</strong> : part
                    )}
                  </div>
                );
              } else if (line.trim()) {
                return <div key={lineIdx} className="ai-text-line">{line}</div>;
              }
              return null;
            })}
          </div>
        );
      }
      
      const parts = para.split(/\*\*(.*?)\*\*/g);
      return (
        <div key={idx} className="ai-paragraph">
          {parts.map((part, pIdx) => 
            pIdx % 2 === 1 ? <strong key={pIdx}>{part}</strong> : part
          )}
        </div>
      );
    });
  };

  // Helper function to handle streaming chunks
  const processStreamChunk = (chunk, currentContent, updateMessageCallback) => {
    try {
      const parsed = JSON.parse(chunk);
      if (parsed.content) {
        const newContent = currentContent + parsed.content;
        updateMessageCallback(newContent);
        return newContent;
      }
    } catch (e) {
      console.warn('Failed to parse chunk:', e);
    }
    return currentContent;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const chatHistory = messages.slice(-20).map(m => ({ role: m.role, content: m.content }));
    chatHistory.push(userMessage);

    try {
      // Base URL check from process.env for production
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const streamResponse = await fetch(`${apiBase}/ai/chat?stream=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ messages: chatHistory }),
        signal: abortControllerRef.current.signal,
      });

      if (streamResponse.ok && streamResponse.headers.get('content-type')?.includes('text/event-stream')) {
        setIsStreaming(true);
        setMessages((prev) => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
        
        const reader = streamResponse.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          // eslint-disable-next-line no-await-in-loop
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              // eslint-disable-next-line no-loop-func
              fullContent = processStreamChunk(data, fullContent, (newContent) => {
                setMessages(prev => 
                  prev.map((msg, idx) => 
                    idx === prev.length - 1 && msg.isStreaming 
                      ? { ...msg, content: newContent }
                      : msg
                  )
                );
              });
            }
          }
        }
        
        setMessages(prev => 
          prev.map(msg => 
            msg.isStreaming ? { ...msg, isStreaming: false } : msg
          )
        );
        setIsStreaming(false);
        
      } else {
        const res = await api.post('/ai/chat', { messages: chatHistory });
        const aiResponse = { role: 'assistant', content: res.data.data };
        setMessages((prev) => [...prev, aiResponse]);
      }
      
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('AI Error:', err);
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const quickReplies = [
    "My dog is not eating",
    "How often to vaccinate my cat?",
    "Best food for a puppy?",
    "My cat temperature is hot"
  ];

  return (
    <div className={`ai-chat-container ${isOpen ? 'open' : ''}`}>
      {!isOpen && (
        <button className="ai-chat-toggle btn-primary" onClick={toggleWidget}>
          <span className="chat-icon">🤖</span> AI Vet
        </button>
      )}

      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="header-info">
              <span className="ai-avatar">🤖</span>
              <div>
                <h4>PawVerse AI</h4>
                <p>Always here for your pets</p>
              </div>
            </div>
            <button className="ai-close-btn" onClick={toggleWidget}>✕</button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
                {msg.role === 'assistant' ? (
                  <div className="ai-formatted-response">
                    {formatMessageContent(msg.content)}
                    {msg.isStreaming && <span className="streaming-cursor">▋</span>}
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            ))}
            {isTyping && !isStreaming && (
              <div className="ai-message ai loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-quick-replies">
            {quickReplies.map((reply, i) => (
              <button key={i} className="quick-reply-btn" onClick={() => setInput(reply)}>
                {reply}
              </button>
            ))}
          </div>

          <form className="ai-chat-input-form" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="form-input"
              disabled={isStreaming}
            />
            <button type="submit" className="ai-send-btn" disabled={!input.trim() || isStreaming}>
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatWidget;