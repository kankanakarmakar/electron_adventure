/**
 * Professional Display Screen - Museum Installation
 * Pure teaching/learning display - NO controls visible
 * Shows beautiful circuit animations and educational content
 * Designed for large TV/Projector display
 */

import React, { useState, useEffect } from 'react';
import useWebSocketSync from '@/hooks/useWebSocketSync';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Volume2, Waves } from 'lucide-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import DISPLAY-ONLY circuit pages (no controls)
import Index from '@/pages/Index';
import ResistorDisplay from '@/pages/ResistorDisplay';
import CapacitorDisplay from '@/pages/CapacitorDisplay';
import InductorDisplay from '@/pages/InductorDisplay';
import DiodeDisplay from '@/pages/DiodeDisplay';

interface CircuitState {
  voltage: number;
  current: number;
  resistance?: number;
  frequency?: number;
}

const DisplayScreenNew: React.FC = () => {
  const [currentCircuit, setCurrentCircuit] = useState<string>('resistor');
  const [circuitState, setCircuitState] = useState<CircuitState>({
    voltage: 5,
    current: 0,
    resistance: 10,
    frequency: 50,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [showValueBox, setShowValueBox] = useState(true);

  const { isConnected: wsConnected } = useWebSocketSync({
    screenType: 'display',
    onCircuitStateUpdate: (state) => {
      setCircuitState(state);
      setCurrentCircuit(state.circuitType || 'resistor');
      setIsConnected(true);
    },
  });

  useEffect(() => {
    setIsConnected(wsConnected);
  }, [wsConnected]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Professional Header - Minimal and Clean */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b-2 border-blue-200 px-8 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Circuit Learning Display</h1>
            <p className="text-blue-600 text-sm mt-1">Interactive Electronics Education System</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              isConnected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-600' : 'bg-red-600'} animate-pulse`}></div>
              {isConnected ? 'Live' : 'Offline'}
            </div>

            {/* Circuit Badge */}
            <Badge className="text-lg px-6 py-2 bg-blue-600 text-white">
              {currentCircuit.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Display Area - Circuit Visualization */}
      <div className="w-full h-full pt-20 pb-32 px-8 overflow-y-auto">
        <BrowserRouter basename="/display">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/resistor" element={<ResistorDisplay />} />
            <Route path="/capacitor" element={<CapacitorDisplay />} />
            <Route path="/inductor" element={<InductorDisplay />} />
            <Route path="/diode" element={<DiodeDisplay />} />
          </Routes>
        </BrowserRouter>
      </div>

      {/* Live Data Display Panel - Bottom Right Corner */}
      {showValueBox && (
        <div className="absolute bottom-8 right-8 z-40">
          <Card className="bg-white shadow-2xl border-2 border-blue-300 rounded-2xl p-6 max-w-sm backdrop-blur-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-blue-200">
              <h3 className="font-bold text-blue-900 text-lg">Live Values</h3>
              <button
                onClick={() => setShowValueBox(false)}
                className="text-blue-400 hover:text-blue-600 text-xl"
              >
                ×
              </button>
            </div>

            {/* Voltage */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-semibold text-gray-600 uppercase">Voltage</span>
              </div>
              <div className="text-4xl font-bold text-yellow-600">
                {circuitState.voltage.toFixed(1)}
                <span className="text-lg text-gray-500 ml-2">V</span>
              </div>
            </div>

            {/* Current */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Waves className="w-5 h-5 text-cyan-600" />
                <span className="text-sm font-semibold text-gray-600 uppercase">Current</span>
              </div>
              <div className="text-4xl font-bold text-cyan-600">
                {circuitState.current.toFixed(2)}
                <span className="text-lg text-gray-500 ml-2">A</span>
              </div>
            </div>

            {/* Resistance (if applicable) */}
            {circuitState.resistance !== undefined && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-600 uppercase">Resistance</span>
                </div>
                <div className="text-4xl font-bold text-red-600">
                  {circuitState.resistance.toFixed(1)}
                  <span className="text-lg text-gray-500 ml-2">Ω</span>
                </div>
              </div>
            )}

            {/* Frequency (if applicable) */}
            {circuitState.frequency !== undefined && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-600 uppercase">Frequency</span>
                </div>
                <div className="text-4xl font-bold text-purple-600">
                  {circuitState.frequency.toFixed(0)}
                  <span className="text-lg text-gray-500 ml-2">Hz</span>
                </div>
              </div>
            )}

            {/* Info Footer */}
            <div className="mt-6 pt-4 border-t-2 border-blue-200 text-xs text-gray-500 text-center">
              Controlled from staff panel • Real-time sync &lt; 200ms
            </div>
          </Card>
        </div>
      )}

      {/* Restore Button - if panel closed */}
      {!showValueBox && (
        <button
          onClick={() => setShowValueBox(true)}
          className="absolute bottom-8 right-8 z-40 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg font-semibold"
        >
          Show Values
        </button>
      )}

      {/* Disconnection Warning - Full Screen Overlay */}
      {!isConnected && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-12 text-center max-w-lg shadow-2xl border-4 border-red-500">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-red-600 mb-3">Control Panel Offline</h2>
            <p className="text-gray-600 text-lg mb-6">
              Waiting for the staff control panel to connect...
            </p>
            <p className="text-sm text-gray-500">
              Ensure the control panel is running on http://localhost:3002
            </p>
          </div>
        </div>
      )}

      {/* Footer Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/90 to-blue-900/70 backdrop-blur text-white p-4 z-30">
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="font-semibold">Status:</span>{' '}
            <span className={isConnected ? 'text-green-300' : 'text-red-300'}>
              {isConnected ? '✓ Connected to Control Panel' : '✗ Waiting for Control Panel'}
            </span>
          </div>
          <div className="text-blue-200">Circuit Display v1.0 | Real-time Learning System</div>
        </div>
      </div>
    </div>
  );
};

export default DisplayScreenNew;
