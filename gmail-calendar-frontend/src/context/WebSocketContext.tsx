import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface WebSocketContextType {
  sendMessage: (message: string) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  lastMessage: any;
  sessionId: string;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// Global WebSocket instance to prevent multiple connections
let globalWs: WebSocket | null = null;
let globalSessionId: string | null = null;

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [messageCounter, setMessageCounter] = useState(0);
  
  // Use a stable session ID
  const [sessionId] = useState(() => {
    if (globalSessionId) {
      console.log('🔄 Using global session ID:', globalSessionId);
      return globalSessionId;
    }
    
    const existingSessionId = localStorage.getItem('sessionId');
    if (existingSessionId) {
      console.log('🔄 Using existing session ID:', existingSessionId);
      globalSessionId = existingSessionId;
      return existingSessionId;
    } else {
      const newSessionId = uuidv4();
      console.log('🆕 Created new session ID:', newSessionId);
      localStorage.setItem('sessionId', newSessionId);
      globalSessionId = newSessionId;
      return newSessionId;
    }
  });

  const connect = useCallback(() => {
    console.log('🔌 Starting WebSocket connection process...');
    
    // Close existing global connection if any
    if (globalWs) {
      console.log('🧹 Closing existing global WebSocket');
      globalWs.close();
      globalWs = null;
    }

    try {
        const wsUrl = `ws://localhost:8000/ws/${sessionId}`;
        console.log('🔌 Creating WebSocket:', wsUrl);
      
      setConnectionStatus('connecting');
      globalWs = new WebSocket(wsUrl);

      globalWs.onopen = function(event) {
        console.log('🎉 WebSocket connected successfully!');
        console.log('📡 Event:', event);
        setConnectionStatus('connected');
      };

      globalWs.onmessage = function(event) {
        console.log('🚨��🚨 MESSAGE RECEIVED FROM BACKEND! 🚨🚨🚨');
        console.log('📨 Raw data:', event.data);
        console.log('📨 Event object:', event);
        console.log('📨 WebSocket state:', globalWs?.readyState);
        console.log('📨 Timestamp:', new Date().toISOString());
        
        try {
          const data = JSON.parse(event.data);
          console.log('📋 Parsed message successfully:', data);
          console.log('🏷️ Message type:', data.type);
          console.log('💬 Message content:', data.message);
          
          // Force state update with comprehensive logging
          const newMessage = {
            ...data,
            _timestamp: Date.now(),
            _raw: event.data,
            _received: new Date().toISOString()
          };
          
          console.log('🔄 About to update lastMessage state...');
          console.log('🔄 New message object:', newMessage);
          
          // Update state
          setLastMessage(newMessage);
          setMessageCounter(prev => {
            const newCount = prev + 1;
            console.log('🔢 Message counter updated:', prev, '→', newCount);
            return newCount;
          });
          
          console.log('✅ React state updated successfully!');
          console.log('✅ lastMessage should now be:', newMessage);
          
        } catch (error) {
          console.error('❌ Parse error:', error);
          console.error('❌ Raw data that failed:', event.data);
        }
      };

      globalWs.onerror = function(error) {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('disconnected');
      };

      globalWs.onclose = function(event) {
        console.log('❌ WebSocket closed:', event.code, event.reason);
        setConnectionStatus('disconnected');
        
        // Reconnect after 2 seconds
        setTimeout(() => {
          console.log('🔄 Reconnecting...');
          connect();
        }, 2000);
      };

    } catch (error) {
      console.error('❌ WebSocket creation failed:', error);
      setConnectionStatus('disconnected');
    }
  }, [sessionId]);

  useEffect(() => {
    console.log('🚀 WebSocketProvider mounting...');
    connect();

    return () => {
      console.log('🧹 WebSocketProvider unmounting...');
      if (globalWs) {
        globalWs.close();
        globalWs = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
    console.log('📤 Sending message:', message);
    console.log('🔍 GlobalWs state:', globalWs?.readyState);
    
    if (globalWs && globalWs.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'chat',
        message: message
      };
      
      console.log('📤 Sending:', JSON.stringify(messageData));
      globalWs.send(JSON.stringify(messageData));
      console.log('✅ Message sent!');
      
    } else {
      console.error('❌ WebSocket not ready. State:', globalWs?.readyState);
      // Try to reconnect
      connect();
    }
  }, [connect]);

  // Debug logs
  useEffect(() => {
    console.log('📊 Status:', connectionStatus);
  }, [connectionStatus]);

  useEffect(() => {
    console.log('📨 New message received:', lastMessage);
    console.log('🔢 Message count:', messageCounter);
  }, [lastMessage, messageCounter]);

  return (
    <WebSocketContext.Provider value={{ sendMessage, connectionStatus, lastMessage, sessionId }}>
      {children}
    </WebSocketContext.Provider>
  );
}; 