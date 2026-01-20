/**
 * WebSocket communication service for real-time multi-screen sync
 * Handles connection, message routing, and state synchronization
 */

import { 
  SyncMessage, 
  ScreenType, 
  CircuitState, 
  ControlAction, 
  ScreenRegistry 
} from '@/types/sync';

class WebSocketSync {
  private ws: WebSocket | null = null;
  private url: string;
  private screenType: ScreenType;
  private screenId: string;
  private messageHandlers: Map<string, (data: SyncMessage) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isConnecting = false;

  constructor(url: string, screenType: ScreenType) {
    this.url = url;
    this.screenType = screenType;
    this.screenId = `${screenType}-${Date.now()}-${Math.random()}`;
  }

  /**
   * Initialize WebSocket connection
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) return;
      
      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log(`[${this.screenType}] Connected to sync server`);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Register this screen
          this.registerScreen();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: SyncMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error(`[${this.screenType}] WebSocket error:`, error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log(`[${this.screenType}] Disconnected from sync server`);
          this.isConnecting = false;
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`[${this.screenType}] Max reconnect attempts reached`);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    
    console.log(`[${this.screenType}] Attempting reconnect in ${delay}ms...`);
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnect failed:', error);
      });
    }, delay);
  }

  /**
   * Register screen with the sync server
   */
  private registerScreen(): void {
    this.send({
      type: 'SCREEN_REGISTER',
      payload: {
        screenId: this.screenId,
        screenType: this.screenType,
      },
      timestamp: Date.now(),
      sourceScreen: this.screenType,
    });
  }

  /**
   * Send a message through WebSocket
   */
  send(message: SyncMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn(`[${this.screenType}] WebSocket not connected, message queued`);
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: SyncMessage): void {
    const handlerKey = `${message.type}:${message.sourceScreen}`;
    const handler = this.messageHandlers.get(message.type);

    if (handler) {
      handler(message);
    }
  }

  /**
   * Subscribe to message type
   */
  on(messageType: string, handler: (message: SyncMessage) => void): void {
    this.messageHandlers.set(messageType, handler);
  }

  /**
   * Unsubscribe from message type
   */
  off(messageType: string): void {
    this.messageHandlers.delete(messageType);
  }

  /**
   * Broadcast circuit state update from display to all controls
   */
  broadcastCircuitState(state: CircuitState): void {
    this.send({
      type: 'CIRCUIT_UPDATE',
      payload: state,
      timestamp: Date.now(),
      sourceScreen: this.screenType,
    });
  }

  /**
   * Send control action from control screen to display
   */
  sendControlAction(action: ControlAction): void {
    this.send({
      type: 'CONTROL_ACTION',
      payload: action,
      timestamp: Date.now(),
      sourceScreen: this.screenType,
    });
  }

  /**
   * Request current state from display
   */
  requestStateSync(): void {
    this.send({
      type: 'SYNC_REQUEST',
      payload: { requestedBy: this.screenId },
      timestamp: Date.now(),
      sourceScreen: this.screenType,
    });
  }

  /**
   * Get screen ID
   */
  getScreenId(): string {
    return this.screenId;
  }

  /**
   * Get screen type
   */
  getScreenType(): ScreenType {
    return this.screenType;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Disconnect gracefully
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }
}

export default WebSocketSync;
