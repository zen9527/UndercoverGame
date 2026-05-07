import { WSEvent } from '@shared/types';

class WebSocketClient {
  private ws: WebSocket | null = null;
  private eventListeners = new Map<WSEvent, Set<(data: unknown) => void>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(playerId?: string): void {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const port = 3000;
    
    this.ws = new WebSocket(`${protocol}//${host}:${port}`);
    
    this.ws.onopen = () => {
      console.log('Connected to server');
      this.reconnectAttempts = 0;
      
      if (playerId) {
        // Send join message
        this.send('joinRoom', { playerId });
      }
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const listeners = this.eventListeners.get(message.event);
        listeners?.forEach(fn => fn(message.data));
      } catch (error) {
        console.error('Invalid message:', error);
      }
    };
    
    this.ws.onclose = () => {
      console.log('Disconnected from server');
      this.attemptReconnect(playerId);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  send(event: string, data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  on(event: WSEvent, callback: (data: unknown) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  private attemptReconnect(playerId?: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect(playerId);
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsClient = new WebSocketClient();
