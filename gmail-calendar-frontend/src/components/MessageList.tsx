import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../context/ChatContext';
import { FiUser } from 'react-icons/fi';
import { BiBot } from 'react-icons/bi';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
  isThinking: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isThinking }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('💬 MessageList rendering with:', {
    messageCount: messages.length,
    isThinking,
    messages: messages.map(m => ({ role: m.role, content: (m.content || '').substring(0, 50) + '...' }))
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    console.log('📜 MessageList useEffect - messages updated:', messages.length);
    scrollToBottom();
  }, [messages, isThinking]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="message-list">
      <div className="message-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>Welcome to Gmail & Calendar Assistant</h2>
            <p>I can help you manage your emails and calendar events. Try asking:</p>
            <div className="example-queries">
              <div className="example-query">📧 "Show me my recent emails"</div>
              <div className="example-query">📅 "Create a meeting tomorrow at 3 PM"</div>
              <div className="example-query">✉️ "Reply to the latest email from John"</div>
              <div className="example-query">🔍 "Find all meeting invitations in my inbox"</div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-avatar">
              {message.role === 'user' 
                ? (FiUser as any)({ size: 20 })
                : (BiBot as any)({ size: 20 })
              }
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-role">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </span>
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
              <div className="message-text">
                {message.role === 'assistant' ? (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
              {message.status === 'sending' && (
                <div className="message-status">Sending...</div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="message assistant thinking">
            <div className="message-avatar">
              {(BiBot as any)({ size: 20 })}
            </div>
            <div className="message-content">
              <div className="thinking-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList; 