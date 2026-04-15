/**
 * Display Screen - Shows circuit visualizations
 * Receives navigation commands from Control Panel via WebSocket
 */

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import ResistorCircuit from '@/pages/ResistorCircuit';
import CapacitorCircuit from '@/pages/CapacitorCircuit';
import InductorCircuit from '@/pages/InductorCircuit';
import DiodeCircuit from '@/pages/DiodeCircuit';
import ElectronicsLogo from '@/components/ElectronicsLogo';
import '@/index.css';

type ComponentType = 'home' | 'resistor' | 'capacitor' | 'inductor' | 'diode';

const DisplayScreenNew: React.FC = () => {
  const [currentComponent, setCurrentComponent] = useState<ComponentType>('home');
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server for navigation sync
    const newSocket = io('http://localhost:3002/navigation');

    newSocket.on('connect', () => {
      console.log('[Display] Connected to navigation server');
      setIsConnected(true);
      // Request current state on connect
      newSocket.emit('requestState');
    });

    newSocket.on('disconnect', () => {
      console.log('[Display] Disconnected from navigation server');
      setIsConnected(false);
    });

    newSocket.on('navigate', (component: ComponentType) => {
      console.log('[Display] Navigation received:', component);
      setCurrentComponent(component);
    });

    newSocket.on('currentState', (state: { component: ComponentType }) => {
      console.log('[Display] Current state received:', state);
      setCurrentComponent(state.component);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Render the current component
  const renderComponent = () => {
    switch (currentComponent) {
      case 'resistor':
        return <ResistorCircuit />;
      case 'capacitor':
        return <CapacitorCircuit />;
      case 'inductor':
        return <InductorCircuit />;
      case 'diode':
        return <DiodeCircuit />;
      case 'home':
      default:
        return <HomeDisplay />;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-slate-50">
      {/* Connection status indicator */}
      <div className="absolute top-4 right-4 z-50">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${isConnected
          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
          : 'bg-red-500/20 text-red-400 border border-red-500/50'
          }`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          {isConnected ? 'Live' : 'Offline'}
        </div>
      </div>

      {/* Main content */}
      <div className="w-full h-full">
        {renderComponent()}
      </div>

      {/* Waiting overlay when disconnected */}
      {!isConnected && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-40">
          <div className="bg-slate-800 rounded-3xl p-12 text-center max-w-lg border-2 border-red-500/50 shadow-2xl">
            <div className="text-6xl mb-4">📡</div>
            <h2 className="text-3xl font-bold text-red-400 mb-3">Control Panel Offline</h2>
            <p className="text-slate-300 text-lg mb-6">
              Waiting for the control panel to connect...
            </p>
            <p className="text-sm text-slate-500">
              Ensure the server is running on http://localhost:3002
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Home Display - Shows waiting state with logo
const HomeDisplay: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)' }}>

      {/* Animated background dots - Blue bubbles for light mode */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Left Side: Text Content */}
        <div className="flex flex-col items-start text-left space-y-8">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            <span className="text-slate-900">Electronics</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Universe
            </span>
          </h1>

          <p className="text-slate-600 text-2xl font-medium max-w-lg leading-relaxed">
            Interactively explore the fundamental components of modern electronics.
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            {['Resistor', 'Capacitor', 'Inductor', 'Diode'].map((name, i) => (
              <div
                key={name}
                className="px-6 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 text-slate-700 font-bold shadow-sm"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {name}
              </div>
            ))}
          </div>

          <p className="text-slate-500 text-lg mt-8 animate-pulse flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Select a component from the Control Panel to begin
          </p>
        </div>

        {/* Right Side: Logo */}
        <div className="flex justify-center items-center relative">
          {/* Subtle glow behind logo */}
          <div className="absolute inset-0 bg-purple-500/10 blur-[100px] rounded-full scale-110" />
          <div className="transform hover:scale-105 transition-transform duration-700 ease-in-out">
            <ElectronicsLogo size={500} animated={true} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DisplayScreenNew;
