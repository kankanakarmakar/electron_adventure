/**
 * WebSocket Server for Multi-Screen Circuit Display Synchronization
 * Handles real-time message routing between Display and Control Screens
 * 
 * Usage: node server.js
 */

import { WebSocketServer } from 'ws';
import http from 'http';
import url from 'url';

const PORT = process.env.WS_PORT || 8081;
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

interface ClientConnection {
  id: string;
  ws: any;
  screenType: 'display' | 'control';
  lastHeartbeat: number;
}

class CircuitSyncServer {
  private server: http.Server;
  private wss: WebSocketServer;
  private clients: Map<string, ClientConnection> = new Map();
  private circuitState: any = {
    type: 'resistor',
    voltage: 5,
    current: 0,
    resistance: 100,
    timestamp: Date.now(),
  };

  constructor(port: number) {
    this.server = http.createServer((req, res) => {
      const pathname = url.parse(req.url || '', true).pathname;
      
      // Health check endpoint
      if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          clients: this.clients.size,
          displayScreens: Array.from(this.clients.values()).filter(c => c.screenType === 'display').length,
          controlScreens: Array.from(this.clients.values()).filter(c => c.screenType === 'control').length,
        }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    this.wss = new WebSocketServer({ server: this.server });
    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers(): void {
    this.wss.on('connection', (ws: any, req: http.IncomingMessage) => {
      const clientId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`[${new Date().toISOString()}] New WebSocket connection: ${clientId}`);

      let clientInfo: ClientConnection = {
        id: clientId,
        ws,
        screenType: 'display',
        lastHeartbeat: Date.now(),
      };

      // Handle incoming messages
      ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, clientInfo, message);
        } catch (error) {
          console.error(`Failed to parse message from ${clientId}:`, error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`[${new Date().toISOString()}] Client disconnected: ${clientId}`);
        this.logClientStatus();
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for ${clientId}:`, error);
      });

      // Respond to pings
      ws.on('ping', () => {
        ws.pong();
        clientInfo.lastHeartbeat = Date.now();
      });

      // Store client
      this.clients.set(clientId, clientInfo);
      this.logClientStatus();
    });
  }

  private handleMessage(clientId: string, clientInfo: ClientConnection, message: any): void {
    const messageType = message.type;
    const sourceScreen = message.sourceScreen;

    console.log(`[${new Date().toISOString()}] Message from ${clientId} (${sourceScreen}): ${messageType}`);

    switch (messageType) {
      case 'SCREEN_REGISTER':
        this.handleScreenRegistration(clientId, clientInfo, message);
        break;

      case 'CIRCUIT_UPDATE':
        this.handleCircuitUpdate(clientId, clientInfo, message);
        break;

      case 'CONTROL_ACTION':
        this.handleControlAction(clientId, clientInfo, message);
        break;

      case 'SYNC_REQUEST':
        this.handleSyncRequest(clientId, clientInfo, message);
        break;

      default:
        console.warn(`Unknown message type: ${messageType}`);
    }
  }

  private handleScreenRegistration(clientId: string, clientInfo: ClientConnection, message: any): void {
    const screenId = message.payload?.screenId;
    const screenType = message.payload?.screenType;

    if (screenType === 'display' || screenType === 'control') {
      clientInfo.screenType = screenType;
      clientInfo.id = screenId || clientInfo.id;

      console.log(`[${new Date().toISOString()}] Screen registered: ${clientInfo.id} (${screenType})`);
      this.logClientStatus();

      // Send current state to newly registered display
      if (screenType === 'display') {
        this.sendMessage(clientInfo.ws, {
          type: 'SYNC_RESPONSE',
          payload: this.circuitState,
          timestamp: Date.now(),
          sourceScreen: 'server',
        });
      }
    }
  }

  private handleCircuitUpdate(clientId: string, clientInfo: ClientConnection, message: any): void {
    // Update server's circuit state
    this.circuitState = {
      ...message.payload,
      timestamp: Date.now(),
    };

    console.log(`[${new Date().toISOString()}] Circuit state updated: ${JSON.stringify(this.circuitState)}`);

    // Broadcast to all control screens
    this.broadcastToScreenType('control', {
      type: 'CIRCUIT_UPDATE',
      payload: this.circuitState,
      timestamp: Date.now(),
      sourceScreen: 'display',
    });
  }

  private handleControlAction(clientId: string, clientInfo: ClientConnection, message: any): void {
    console.log(`[${new Date().toISOString()}] Control action received: ${JSON.stringify(message.payload)}`);

    // Broadcast to all display screens
    this.broadcastToScreenType('display', {
      type: 'CONTROL_ACTION',
      payload: message.payload,
      timestamp: Date.now(),
      sourceScreen: 'control',
    });
  }

  private handleSyncRequest(clientId: string, clientInfo: ClientConnection, message: any): void {
    console.log(`[${new Date().toISOString()}] Sync request from ${clientId}`);

    this.sendMessage(clientInfo.ws, {
      type: 'SYNC_RESPONSE',
      payload: this.circuitState,
      timestamp: Date.now(),
      sourceScreen: 'server',
    });
  }

  private broadcastToScreenType(screenType: 'display' | 'control', message: any): void {
    let count = 0;
    this.clients.forEach((client) => {
      if (client.screenType === screenType && client.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(client.ws, message);
        count++;
      }
    });
    console.log(`[${new Date().toISOString()}] Broadcast to ${count} ${screenType} screens`);
  }

  private sendMessage(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private logClientStatus(): void {
    const displayScreens = Array.from(this.clients.values()).filter(c => c.screenType === 'display');
    const controlScreens = Array.from(this.clients.values()).filter(c => c.screenType === 'control');

    console.log(`[${new Date().toISOString()}] === Client Status ===`);
    console.log(`Total connections: ${this.clients.size}`);
    console.log(`Display Screens: ${displayScreens.length}`);
    console.log(`Control Screens: ${controlScreens.length}`);
    console.log(`=====================`);
  }

  public start(): void {
    this.server.listen(PORT, () => {
      console.log(`[${new Date().toISOString()}] === Circuit Sync WebSocket Server Started ===`);
      console.log(`WebSocket Server listening on ws://localhost:${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });

    // Periodic heartbeat check
    setInterval(() => {
      const now = Date.now();
      this.clients.forEach((client, clientId) => {
        if (now - client.lastHeartbeat > 60000) {
          console.warn(`[${new Date().toISOString()}] Timeout detected for client: ${clientId}`);
          client.ws.close();
        }
      });
    }, 30000);
  }

  public stop(): void {
    this.wss.clients.forEach((client) => {
      client.close();
    });
    this.server.close();
    console.log(`[${new Date().toISOString()}] Server stopped`);
  }
}

// Start the server
const server = new CircuitSyncServer(parseInt(PORT as string));
server.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Info] Shutting down server...');
  server.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Info] Shutting down server...');
  server.stop();
  process.exit(0);
});
