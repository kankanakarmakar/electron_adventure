/**
 * Display Screen Component
 * Large TV display showing circuit visualizations with animations
 * Receives real-time updates from Hardware Control Screen
 * Optimized for fullscreen presentation and educational content
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import useWebSocketSync from '@/hooks/useWebSocketSync';
import { CircuitState, ControlAction, CircuitType } from '@/types/sync';
import Index from '@/pages/Index';
import ResistorPage from '@/pages/Resistor';
import CapacitorPage from '@/pages/Capacitor';
import InductorPage from '@/pages/Inductor';
import DiodePage from '@/pages/Diode';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Info } from 'lucide-react';

interface DisplayScreenProps {
  onControlActionReceived?: (action: ControlAction) => void;
}

const DisplayScreen: React.FC<DisplayScreenProps> = ({ onControlActionReceived }) => {
  const [currentCircuit, setCurrentCircuit] = useState<CircuitType>('resistor');
  const [circuitState, setCircuitState] = useState<CircuitState>({
    type: 'resistor',
    voltage: 5,
    current: 0,
    resistance: 100,
    timestamp: Date.now(),
  });
  const [navigationTo, setNavigationTo] = useState<string>('/');

  const {
    isConnected,
    screenId,
    broadcastCircuitState,
  } = useWebSocketSync({
    screenType: 'display',
    onCircuitStateUpdate: (state) => {
      console.log('Display received circuit state update:', state);
      setCircuitState(state);
    },
    onControlAction: (action) => {
      console.log('Display received control action:', action);
      handleRemoteControlAction(action);
      onControlActionReceived?.(action);
    },
  });

  // Handle incoming control actions from hardware screen
  const handleRemoteControlAction = (action: ControlAction) => {
    if (action.circuitType) {
      setCurrentCircuit(action.circuitType);
      navigateToCircuit(action.circuitType);
    }

    // Update circuit state based on action
    setCircuitState(prev => {
      const updated = { ...prev, timestamp: Date.now() };

      switch (action.action) {
        case 'VOLTAGE_CHANGE':
          updated.voltage = Math.max(0, action.value ?? prev.voltage);
          break;
        case 'FREQUENCY_CHANGE':
          updated.frequency = Math.max(0, action.value ?? prev.frequency ?? 50);
          break;
        case 'RESET':
          updated.voltage = 5;
          updated.frequency = 50;
          break;
      }

      return updated;
    });
  };

  const navigateToCircuit = (circuit: CircuitType) => {
    const paths: Record<CircuitType, string> = {
      resistor: '/display/resistor',
      capacitor: '/display/capacitor',
      inductor: '/display/inductor',
      diode: '/display/diode',
    };
    setNavigationTo(paths[circuit]);
  };

  // Broadcast state updates at regular intervals
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        broadcastCircuitState(circuitState);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isConnected, broadcastCircuitState, circuitState]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Minimal Header - Connection Status Only */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur border-b border-slate-700 px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
                <span className="text-green-400 font-semibold text-xs">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-red-400 font-semibold text-xs">Disconnected</span>
              </>
            )}
          </div>
          <Badge className="bg-purple-600 text-xs px-2 py-1">{currentCircuit.toUpperCase()}</Badge>
        </div>
      </div>

      {/* Main Content Area - ONLY Circuit Display, NO Controls */}
      <div className="w-full h-full pt-16 bg-black">
        <BrowserRouter basename="/display">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/resistor" element={<ResistorPage />} />
            <Route path="/capacitor" element={<CapacitorPage />} />
            <Route path="/inductor" element={<InductorPage />} />
            <Route path="/diode" element={<DiodePage />} />
          </Routes>
        </BrowserRouter>
      </div>

      {/* Disconnection Warning - Only if disconnected */}
      {!isConnected && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-red-900/90 border-2 border-red-700 p-8 rounded-xl text-center max-w-md">
            <p className="text-2xl mb-2">⚠️</p>
            <p className="font-bold text-white">Control Screen Disconnected</p>
            <p className="text-red-200 text-sm mt-2">Waiting for connection from control panel...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayScreen;
