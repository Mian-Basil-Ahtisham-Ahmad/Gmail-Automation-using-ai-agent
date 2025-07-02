import React, { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';
import { useChat } from '../context/ChatContext';
import { apiService, ChatMessage } from '../services/api';
import MessageList from './MessageList';
import MicrophoneButton from './MicrophoneButton';
import './ChatInterface.css';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const { 
    addMessage, 
    updateMessageStatus, 
    addResponseMessage, 
    messages, 
    clearMessages, 
    getPendingMessages 
  } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      setConnectionStatus('connecting');
      await apiService.healthCheck();
      setConnectionStatus('connected');
      console.log('✅ Backend connection successful');
    } catch {
      setConnectionStatus('disconnected');
      console.error('❌ Backend connection failed');
    }
  };

  const handleClearChat = async () => {
    try {
      console.log('🗑️ Clearing chat and resetting session...');
      clearMessages();
      apiService.resetSession();
      await apiService.clearSession();
      console.log('✅ Chat cleared and session reset');
    } catch (error) {
      console.error('❌ Error clearing chat:', error);
    }
  };

  // Convert messages to API format for history
  const messagesToHistory = (msgs: any[]): ChatMessage[] => {
    // Only include completed message pairs (sent user messages and received assistant messages)
    const completedMessages = msgs.filter(msg => 
      (msg.role === 'user' && msg.status === 'sent') || 
      (msg.role === 'assistant' && msg.status === 'received')
    );
    
    console.log('📋 Converting messages to history:', {
      total: msgs.length,
      completed: completedMessages.length,
      filtering: 'Only sent/received messages'
    });
    
    return completedMessages.map(msg => ({
      role: msg.role,
      content: msg.content.trim(),
      timestamp: msg.timestamp?.toISOString(),
      id: msg.id
    }));
  };

  // Enhanced message submission with proper correlation
  const submitMessage = async () => {
    const messageContent = input.trim();
    if (!messageContent || connectionStatus !== 'connected') {
      console.log('⚠️ Cannot send message:', { messageContent: !!messageContent, connectionStatus });
      return;
    }

    // Check if there are pending messages to prevent flooding
    const pendingMessages = getPendingMessages();
    if (pendingMessages.length > 0) {
      console.log('⚠️ Request blocked: There are pending messages:', pendingMessages.length);
      return;
    }

    console.log('🚀 Starting message submission:', messageContent);
    
    // Clear input immediately
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      // 1. Add user message with pending status
      const userMessage = addMessage({ 
        role: 'user', 
        content: messageContent 
      });
      
      console.log('👤 User message added:', userMessage.id);

      // 2. Update status to sending
      updateMessageStatus(userMessage.id, 'sending');

      // 3. Get current history (excluding the new pending message)
      const currentHistory = messagesToHistory(messages);
      
      console.log('📤 Sending to API with correlation:', {
        message: messageContent,
        historyCount: currentHistory.length,
        userMessageId: userMessage.id
      });

      // 4. Send to backend with correlation
      const response = await apiService.sendMessage(messageContent, currentHistory);
      
      console.log('📨 Received correlated response:', {
        requestId: response.request_id,
        responseLength: response.response.length,
        timestamp: response.timestamp
      });

      // 5. Update user message status to sent
      updateMessageStatus(userMessage.id, 'sent');

      // 6. Add assistant response with correlation
      addResponseMessage(response.response, response.request_id);
      
      console.log('✅ Message flow completed successfully');

    } catch (error: any) {
      console.error('❌ Message submission failed:', error);
      
      // Update user message status to error
      if (pendingMessages.length > 0) {
        updateMessageStatus(pendingMessages[0].id, 'error', error.message);
      }
      
      // Add error response
      addResponseMessage(
        `❌ **Error**: ${error.message || 'Failed to get response from backend'}`,
        undefined
      );
      
      setConnectionStatus('disconnected');
      setTimeout(checkBackendStatus, 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitMessage();
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      await submitMessage();
    }
  };

  // Handle speech-to-text transcript
  const handleTranscript = (transcript: string) => {
    const cleanedTranscript = transcript.trim();
    if (cleanedTranscript) {
      // Append to existing input with proper spacing
      setInput(prevInput => {
        const currentInput = prevInput.trim();
        if (currentInput) {
          return `${currentInput} ${cleanedTranscript}`;
        }
        return cleanedTranscript;
      });
      
      // Focus the textarea after speech input
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      
      console.log('🎤 Speech transcript added:', cleanedTranscript);
    }
  };

  // Calculate status for UI
  const pendingMessages = getPendingMessages();
  const isProcessing = pendingMessages.length > 0;
  const queueStatus = apiService.getQueueStatus();

  const placeholderText =
    connectionStatus === 'connected'
      ? isProcessing 
        ? "Processing your message..."
        : "Ask about your emails or calendar..."
      : connectionStatus === 'connecting'
      ? 'Connecting to backend...'
      : 'Backend disconnected. Trying to reconnect...';

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h1>Gmail & Calendar Assistant</h1>
        <div className="chat-status">
          <span>💬 {messages.length} msgs</span>
          <span>🧠 {isProcessing ? `Processing (${pendingMessages.length})` : 'Ready'}</span>
          <span>📋 Queue: {queueStatus.queueLength}</span>
          <span>🔗 {apiService.getCurrentSessionId().slice(0, 8)}...</span>
          <span className={`connection-status ${connectionStatus}`}>
            <span className="status-dot" /> {connectionStatus}
          </span>
          <button 
            onClick={handleClearChat}
            style={{ 
              padding: '0.25rem 0.5rem', 
              background: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '0.7rem',
              marginLeft: '0.5rem'
            }}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Enhanced Status Panel */}
      <div style={{ 
        background: '#2a2a2a', 
        padding: '0.5rem 1rem', 
        margin: '0 1rem', 
        borderRadius: '4px',
        fontSize: '0.8rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <strong>🔗 HTTP RESTful API</strong> | 
          Messages: {messages.length} | 
          Pending: {pendingMessages.length} | 
          Queue: {queueStatus.queueLength}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#888' }}>
          Correlation ID tracking enabled ✅
        </div>
      </div>

      <MessageList messages={messages} isThinking={isProcessing} />

      <div className="chat-input-container">
        <form ref={formRef} onSubmit={handleSubmit} className="chat-form" autoComplete="off">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={placeholderText}
              className="chat-input"
              rows={1}
              disabled={connectionStatus !== 'connected' || isProcessing}
              autoComplete="off"
            />
            <MicrophoneButton
              onTranscript={handleTranscript}
              disabled={connectionStatus !== 'connected' || isProcessing}
            />
            <button
              type="submit"
              className="send-button"
              disabled={!input.trim() || connectionStatus !== 'connected' || isProcessing}
            >
              {isProcessing ? '⏳' : (FiSend as any)({ size: 20 })}
            </button>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#888', textAlign: 'center', marginTop: '0.25rem' }}>
            Synchronized HTTP API • Request correlation enabled • 🎤 Voice input supported
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
