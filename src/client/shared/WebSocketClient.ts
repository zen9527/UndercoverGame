import { ServerWSEvent } from '@shared/types';

type MessageHandler = (data: unknown) => void;
type ConnectionStatusHandler = (status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting') => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private playerId: string | null = null;
  private roomId: string | null = null;
  private nickname: string | null = null;
  private isHost = false;
  private eventListeners = new Map<string, Set<MessageHandler>>();
  private connectionStatusListeners = new Set<ConnectionStatusHandler>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private _isConnected = false;
  private _connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';

  get isConnected(): boolean {
    return this._isConnected;
  }

  get connectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'reconnecting' {
    return this._connectionStatus;
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionStatus(callback: ConnectionStatusHandler): () => void {
    this.connectionStatusListeners.add(callback);
    return () => {
      this.connectionStatusListeners.delete(callback);
    };
  }

  private updateStatus(status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting'): void {
    this._connectionStatus = status;
    this.connectionStatusListeners.forEach(cb => cb(status));
  }

  connect(nickname?: string, isHost?: boolean): void {
    if (nickname) this.nickname = nickname;
    if (isHost !== undefined) this.isHost = isHost;

    this.updateStatus('connecting');
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const port = 3000; // Use default, environment variable not available in client

    this.ws = new WebSocket(`${protocol}//${host}:${port}`);

    this.ws.onopen = () => {
      console.log('Connected to server');
      this.reconnectAttempts = 0;
      this._isConnected = true;
      this.updateStatus('connected');
      
      // Re-send join message if we were in a room before reconnect
      if (this.roomId && this.nickname && !this.isHost && this.reconnectAttempts > 0) {
        console.log('Rejoining room after reconnect:', this.roomId);
        this.send('joinRoom', { roomId: this.roomId, nickname: this.nickname });
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { event: eventName, data: eventData } = message;

        // Handle special system events
        if (eventName === 'connected') {
          // Server assigns us a playerId
          this.playerId = eventData.playerId;
          console.log('Assigned playerId:', this.playerId);

          // Now send the actual join/create message
          if (this.roomId && this.nickname && !this.isHost) {
            this.send('joinRoom', { roomId: this.roomId, nickname: this.nickname });
          }
          return;
        }

        // Dispatch to listeners
        const listeners = this.eventListeners.get(eventName);
        listeners?.forEach(fn => fn(eventData));
      } catch (error) {
        console.error('Invalid message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('Disconnected from server');
      this._isConnected = false;
      this.updateStatus('disconnected');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  /**
   * Create a room (host flow). Call after connect() resolves.
   */
  createRoom(config: any, nickname: string): void {
    this.isHost = true;
    this.nickname = nickname;
    this.send('createRoom', { config, nickname });
  }

  /**
   * Join a room (player flow). Stores roomId so reconnect can rejoin.
   */
  joinRoom(roomId: string, nickname: string): void {
    this.roomId = roomId;
    this.nickname = nickname;
    this.isHost = false;

    if (this.playerId) {
      // Already connected, send join now
      this.send('joinRoom', { roomId, nickname });
    }
    // else: will be sent after 'connected' event in onmessage
  }

  send(event: string, data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    } else {
      console.warn(`Cannot send "${event}": WebSocket not open`);
    }
  }

  on(event: ServerWSEvent | string, callback: MessageHandler): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  getPlayerId(): string | null {
    return this.playerId;
  }

  getRoomId(): string | null {
    return this.roomId;
  }

  setRoomId(roomId: string): void {
    this.roomId = roomId;
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      this.updateStatus('disconnected');
      
      // Notify user that reconnection failed
      const listeners = this.eventListeners.get('reconnectFailed');
      listeners?.forEach(fn => fn({ maxAttempts: this.maxReconnectAttempts }));
      return;
    }

    this.reconnectAttempts++;
    this.updateStatus('reconnecting');
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect(); // nickname/roomId preserved from last call
    }, delay);
  }

  /**
   * Manually trigger reconnection (e.g., after user clicks "Reconnect" button)
   */
  manualReconnect(): void {
    if (this._connectionStatus === 'disconnected' && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts = 0; // Reset attempts for manual reconnect
      this.connect();
    }
  }

  disconnect(): void {
    if (this.ws) {
      // Prevent auto-reconnect when manually disconnecting
      this.reconnectAttempts = this.maxReconnectAttempts;
      this.ws.close();
      this.ws = null;
      this._isConnected = false;
      this.updateStatus('disconnected');
    }
  }
}

export const wsClient = new WebSocketClient();
