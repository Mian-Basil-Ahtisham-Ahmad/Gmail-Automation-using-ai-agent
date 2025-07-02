import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status: 'pending' | 'sending' | 'sent' | 'error' | 'received';
  requestId?: string;
  error?: string;
}

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => Message;
  updateMessageStatus: (messageId: string, status: Message['status'], error?: string) => void;
  addResponseMessage: (content: string, requestId?: string) => Message;
  clearMessages: () => void;
  getMessageByRequestId: (requestId: string) => Message | undefined;
  getPendingMessages: () => Message[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Generate unique message ID
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add message with proper tracking
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp' | 'status'>): Message => {
    const newMessage: Message = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date(),
      status: message.role === 'user' ? 'pending' : 'received'
    };

    console.log('📝 ChatContext: Adding message:', {
      id: newMessage.id,
      role: newMessage.role,
      content: newMessage.content.substring(0, 50) + '...',
      status: newMessage.status,
      requestId: newMessage.requestId
    });

    setMessages(prev => {
      const updatedMessages = [...prev, newMessage];
      console.log('📊 ChatContext: Total messages:', updatedMessages.length);
      return updatedMessages;
    });

    return newMessage;
  }, [generateMessageId]);

  // Update message status dynamically
  const updateMessageStatus = useCallback((messageId: string, status: Message['status'], error?: string) => {
    console.log('🔄 ChatContext: Updating message status:', { messageId, status, error });
    
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const updatedMessage = { ...msg, status, error };
        console.log('✅ ChatContext: Message status updated:', updatedMessage);
        return updatedMessage;
      }
      return msg;
    }));
  }, []);

  // Add response message with correlation
  const addResponseMessage = useCallback((content: string, requestId?: string): Message => {
    const responseMessage: Message = {
      id: generateMessageId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      status: 'received',
      requestId
    };

    console.log('🤖 ChatContext: Adding response message:', {
      id: responseMessage.id,
      content: content.substring(0, 50) + '...',
      requestId,
      correlatedWith: requestId ? 'User message' : 'None'
    });

    setMessages(prev => {
      const updatedMessages = [...prev, responseMessage];
      console.log('📊 ChatContext: Response added, total messages:', updatedMessages.length);
      return updatedMessages;
    });

    return responseMessage;
  }, [generateMessageId]);

  // Get message by request ID for correlation
  const getMessageByRequestId = useCallback((requestId: string): Message | undefined => {
    const message = messages.find(msg => msg.requestId === requestId);
    console.log('🔍 ChatContext: Finding message by requestId:', { requestId, found: !!message });
    return message;
  }, [messages]);

  // Get pending messages
  const getPendingMessages = useCallback((): Message[] => {
    const pending = messages.filter(msg => msg.status === 'pending' || msg.status === 'sending');
    console.log('⏳ ChatContext: Pending messages:', pending.length);
    return pending;
  }, [messages]);

  // Clear all messages
  const clearMessages = useCallback(() => {
    console.log('🗑️ ChatContext: Clearing all messages');
    setMessages([]);
  }, []);

  return (
    <ChatContext.Provider value={{ 
      messages, 
      addMessage, 
      updateMessageStatus, 
      addResponseMessage,
      clearMessages,
      getMessageByRequestId,
      getPendingMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
}; 