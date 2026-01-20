/**
 * Custom React hook for WebSocket synchronization between screens
 * Provides easy integration of real-time sync in components
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import WebSocketSync from '@/services/websocket-sync';
import { getScreenConfig } from '@/config/screen-config';
import { 
  SyncMessage, 
  ScreenType, 
  CircuitState, 
  ControlAction,
  MessageType 
} from '@/types/sync';

interface UseWebSocketSyncOptions {
  screenType: ScreenType;
  wsUrl?: string;
  autoConnect?: boolean;
  onCircuitStateUpdate?: (state: CircuitState) => void;
  onControlAction?: (action: ControlAction) => void;
}

export const useWebSocketSync = ({
  screenType,
  wsUrl,
  autoConnect = true,
  onCircuitStateUpdate,
  onControlAction,
}: UseWebSocketSyncOptions) => {
  const wsRef = useRef<WebSocketSync | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [screenId, setScreenId] = useState<string>('');
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);

  // Get configuration
  const screenConfig = getScreenConfig();
  const finalWsUrl = wsUrl || screenConfig.getWebSocketUrl();

  // Initialize WebSocket
  useEffect(() => {
    if (!autoConnect) return;

    const initializeWebSocket = async () => {
      try {
        wsRef.current = new WebSocketSync(finalWsUrl, screenType);

        // Setup message handlers
        wsRef.current.on('CIRCUIT_UPDATE', (message: SyncMessage) => {
          setLastUpdateTime(message.timestamp);
          if (onCircuitStateUpdate && message.sourceScreen !== screenType) {
            onCircuitStateUpdate(message.payload);
          }
        });

        wsRef.current.on('CONTROL_ACTION', (message: SyncMessage) => {
          setLastUpdateTime(message.timestamp);
          if (onControlAction && message.sourceScreen !== screenType) {
            onControlAction(message.payload);
          }
        });

        // Handle connection state
        const checkConnectionInterval = setInterval(() => {
          setIsConnected(wsRef.current?.isConnected() ?? false);
        }, 1000);

        await wsRef.current.connect();
        setIsConnected(true);
        setScreenId(wsRef.current.getScreenId());

        // Print config summary on first connection
        if (screenConfig.isDebugEnabled()) {
          screenConfig.printSummary();
        }

        return () => {
          clearInterval(checkConnectionInterval);
        };
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        setIsConnected(false);
      }
    };

    const cleanup = initializeWebSocket();

    return () => {
      cleanup?.then(fn => fn?.());
      wsRef.current?.disconnect();
    };
  }, [screenType, finalWsUrl, autoConnect, onCircuitStateUpdate, onControlAction, screenConfig]);

  // Send circuit state update
  const broadcastCircuitState = useCallback((state: CircuitState) => {
    if (wsRef.current?.isConnected()) {
      wsRef.current.broadcastCircuitState(state);
    }
  }, []);

  // Send control action
  const sendControlAction = useCallback((action: ControlAction) => {
    if (wsRef.current?.isConnected()) {
      wsRef.current.sendControlAction(action);
    }
  }, []);

  // Request state sync
  const requestStateSync = useCallback(() => {
    if (wsRef.current?.isConnected()) {
      wsRef.current.requestStateSync();
    }
  }, []);

  // Subscribe to custom message type
  const subscribe = useCallback((messageType: MessageType, handler: (message: SyncMessage) => void) => {
    if (wsRef.current) {
      wsRef.current.on(messageType, handler);
    }
  }, []);

  // Unsubscribe from message type
  const unsubscribe = useCallback((messageType: MessageType) => {
    if (wsRef.current) {
      wsRef.current.off(messageType);
    }
  }, []);

  return {
    isConnected,
    screenId,
    lastUpdateTime,
    broadcastCircuitState,
    sendControlAction,
    requestStateSync,
    subscribe,
    unsubscribe,
  };
};

export default useWebSocketSync;
