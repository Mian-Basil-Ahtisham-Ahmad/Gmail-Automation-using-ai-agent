// Enhanced API Service for Gmail-Calendar AI Agent
// Implements message correlation, request queuing, and proper synchronization

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  id?: string;
}

interface ChatRequest {
  message: string;
  session_id?: string;
  history?: ChatMessage[];
  request_id: string;
  timestamp: string;
}

interface ChatResponse {
  response: string;
  session_id: string;
  timestamp: string;
  request_id: string;
  agent_used?: string;
}

interface SessionInfo {
  session_id: string;
  created_at: string;
  message_count: number;
}

interface PendingRequest {
  id: string;
  message: string;
  timestamp: number;
  resolve: (response: ChatResponse) => void;
  reject: (error: Error) => void;
}

class ApiService {
  private baseUrl: string;
  private sessionId: string | null;
  private requestQueue: PendingRequest[] = [];
  private isProcessing: boolean = false;
  private requestCounter: number = 0;

  constructor() {
    this.baseUrl = 'http://localhost:8000';
    this.sessionId = localStorage.getItem('sessionId') || null;
  }

  // Generate unique request ID
  private generateRequestId(): string {
    this.requestCounter++;
    return `req_${Date.now()}_${this.requestCounter}`;
  }

  // Initialize or get session ID
  private getSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = this.generateSessionId();
      localStorage.setItem('sessionId', this.sessionId);
    }
    return this.sessionId;
  }

  private generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }

  // Process request queue to ensure ordered processing
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log('📋 Processing request queue, length:', this.requestQueue.length);

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      
      try {
        console.log('🔄 Processing request:', request.id);
        const response = await this.sendHttpRequest(request.message, [], request.id);
        request.resolve(response);
        console.log('✅ Request completed:', request.id);
        
        // Small delay between requests to prevent flooding
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error('❌ Request failed:', request.id, error);
        request.reject(error as Error);
      }
    }

    this.isProcessing = false;
  }

  // Send HTTP request with correlation
  private async sendHttpRequest(message: string, history: ChatMessage[], requestId: string): Promise<ChatResponse> {
    const requestData: ChatRequest = {
      message: message.trim(),
      session_id: this.getSessionId(),
      history: history,
      request_id: requestId,
      timestamp: new Date().toISOString()
    };

    console.log('📤 HTTP Request:', requestData);

    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    console.log('📨 HTTP Response:', data);

    // Verify request correlation
    if (data.request_id !== requestId) {
      console.warn('⚠️ Request ID mismatch:', { expected: requestId, received: data.request_id });
    }

    return data;
  }

  // Enhanced message sending with correlation and queuing
  async sendMessage(message: string, history: ChatMessage[] = []): Promise<ChatResponse> {
    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId();
      
      console.log('🚀 API: Queuing message:', { message, requestId });
      
      const pendingRequest: PendingRequest = {
        id: requestId,
        message: message,
        timestamp: Date.now(),
        resolve,
        reject
      };

      this.requestQueue.push(pendingRequest);
      console.log('📋 Request queued:', requestId, 'Queue length:', this.requestQueue.length);
      
      // Process the queue
      this.processQueue();
    });
  }

  // Get all sessions
  async getSessions(): Promise<SessionInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ API: Error getting sessions:', error);
      throw error;
    }
  }

  // Get specific session details
  async getSession(sessionId?: string): Promise<any> {
    const id = sessionId || this.getSessionId();
    try {
      const response = await fetch(`${this.baseUrl}/session/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ API: Error getting session:', error);
      throw error;
    }
  }

  // Clear session history
  async clearSession(sessionId?: string): Promise<any> {
    const id = sessionId || this.getSessionId();
    try {
      const response = await fetch(`${this.baseUrl}/session/${id}/clear`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Clear local queue as well
      this.requestQueue = [];
      this.isProcessing = false;
      
      return await response.json();
    } catch (error) {
      console.error('❌ API: Error clearing session:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ API: Health check failed:', error);
      throw error;
    }
  }

  // Get current session ID
  getCurrentSessionId(): string {
    return this.getSessionId();
  }

  // Reset session (generate new session ID)
  resetSession(): string {
    this.sessionId = this.generateSessionId();
    localStorage.setItem('sessionId', this.sessionId);
    
    // Clear request queue
    this.requestQueue = [];
    this.isProcessing = false;
    this.requestCounter = 0;
    
    return this.sessionId;
  }

  // Get queue status for debugging
  getQueueStatus() {
    return {
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing,
      requestCounter: this.requestCounter
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export type { ChatMessage, ChatResponse, SessionInfo }; 