/**
 * Control Screen - Navigation and Controls Panel
 * Sends navigation commands to Display Screen via WebSocket
 */

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import ResistorControls from '@/pages/ResistorControls';
import CapacitorControls from '@/pages/CapacitorControls';
import InductorControls from '@/pages/InductorControls';
import DiodeControls from '@/pages/DiodeControls';
import { Home, Zap, CircleDot, Waves, Lightbulb, ArrowLeft } from 'lucide-react';
import '@/index.css';

type ComponentType = 'home' | 'resistor' | 'capacitor' | 'inductor' | 'diode';

interface ComponentCard {
    id: ComponentType;
    name: string;
    tagline: string;
    icon: React.ReactNode;
    gradient: string;
    borderColor: string;
}

const ControlScreenNew: React.FC = () => {
    const [currentComponent, setCurrentComponent] = useState<ComponentType>('home');
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);

    const components: ComponentCard[] = [
        {
            id: 'resistor',
            name: 'Resistor',
            tagline: 'Limit & Protect Current',
            icon: <Zap className="w-10 h-10" />,
            gradient: 'from-orange-500 to-red-600',
            borderColor: 'border-orange-500'
        },
        {
            id: 'capacitor',
            name: 'Capacitor',
            tagline: 'Store & Release Energy',
            icon: <CircleDot className="w-10 h-10" />,
            gradient: 'from-blue-500 to-cyan-600',
            borderColor: 'border-blue-500'
        },
        {
            id: 'inductor',
            name: 'Inductor',
            tagline: 'Magnetic Field Generation',
            icon: <Waves className="w-10 h-10" />,
            gradient: 'from-purple-500 to-indigo-600',
            borderColor: 'border-purple-500'
        },
        {
            id: 'diode',
            name: 'Diode',
            tagline: 'One-Way Current Control',
            icon: <Lightbulb className="w-10 h-10" />,
            gradient: 'from-green-500 to-emerald-600',
            borderColor: 'border-green-500'
        }
    ];

    useEffect(() => {
        // Connect to Socket.IO server for navigation sync
        const newSocket = io('http://localhost:3002/navigation');

        newSocket.on('connect', () => {
            console.log('[Control] Connected to navigation server');
            setIsConnected(true);
            // Request current state on connect
            newSocket.emit('requestState');
        });

        newSocket.on('disconnect', () => {
            console.log('[Control] Disconnected from navigation server');
            setIsConnected(false);
        });

        newSocket.on('navigate', (component: ComponentType) => {
            console.log('[Control] Navigation received:', component);
            setCurrentComponent(component);
        });

        newSocket.on('currentState', (state: { component: ComponentType }) => {
            console.log('[Control] Current state received:', state);
            setCurrentComponent(state.component);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const navigateTo = (component: ComponentType) => {
        if (socket && isConnected) {
            console.log('[Control] Navigating to:', component);
            socket.emit('navigate', component);
            setCurrentComponent(component);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (currentComponent === 'home') {
                if (e.key === '1') {
                    navigateTo('resistor');
                } else if (e.key === '2') {
                    navigateTo('capacitor');
                } else if (e.key === '3') {
                    navigateTo('inductor');
                } else if (e.key === '4') {
                    navigateTo('diode');
                }
            } else {
                if (e.key === 'ArrowLeft') {
                    navigateTo('home');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentComponent, socket, isConnected]);

    // Render the current view
    const renderContent = () => {
        switch (currentComponent) {
            case 'resistor':
                return <ResistorControls />;
            case 'capacitor':
                return <CapacitorControls />;
            case 'inductor':
                return <InductorControls />;
            case 'diode':
                return <DiodeControls />;
            case 'home':
            default:
                return <HomeControl components={components} onNavigate={navigateTo} isConnected={isConnected} />;
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-4 shadow-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {currentComponent !== 'home' && (
                            <button
                                onClick={() => navigateTo('home')}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold transition-all"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="font-medium">Home</span>
                            </button>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                {currentComponent === 'home' ? 'Control Panel' : `${currentComponent.charAt(0).toUpperCase() + currentComponent.slice(1)} Controls`}
                            </h1>
                            <p className="text-slate-500 text-sm">
                                {currentComponent === 'home' ? 'Select a component to explore' : 'Adjust parameters below'}
                            </p>
                        </div>
                    </div>

                    {/* Connection status */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${isConnected
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                            : 'bg-red-500/20 text-red-400 border border-red-500/50'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        {isConnected ? 'Connected' : 'Offline'}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="p-4">
                {renderContent()}
            </div>

            {/* Connection overlay when disconnected */}
            {!isConnected && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-40">
                    <div className="bg-white rounded-3xl p-12 text-center max-w-lg border-2 border-red-500/30 shadow-2xl">
                        <div className="text-6xl mb-4">📡</div>
                        <h2 className="text-3xl font-bold text-red-500 mb-3">Server Offline</h2>
                        <p className="text-slate-600 text-lg mb-6">
                            Cannot connect to the sync server...
                        </p>
                        <p className="text-sm text-slate-500">
                            Ensure the server is running on http://localhost:3002
                        </p>
                        <div className="mt-6 text-slate-400 text-sm animate-pulse">
                            Attempting to reconnect...
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Home Control - Component selection grid
interface HomeControlProps {
    components: ComponentCard[];
    onNavigate: (component: ComponentType) => void;
    isConnected: boolean;
}

const HomeControl: React.FC<HomeControlProps> = ({ components, onNavigate, isConnected }) => {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-slate-800 mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                        Electronics Universe
                    </span>
                </h2>
                <p className="text-slate-500 text-lg">
                    Choose a component to explore its circuit and controls
                </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {components.map((component, index) => (
                    <button
                        key={component.id}
                        onClick={() => onNavigate(component.id)}
                        disabled={!isConnected}
                        className={`group relative p-8 rounded-2xl bg-white border-2 border-slate-200 hover:${component.borderColor} hover:shadow-xl transition-all duration-300 text-left overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {/* Gradient background on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${component.gradient} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-300`}></div>

                        {/* Icon */}
                        <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${component.gradient} text-white mb-4 shadow-md`}>
                            {component.icon}
                        </div>

                        {/* Text content */}
                        <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-600 flex items-center gap-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded bg-slate-100 text-slate-500 text-sm font-mono border border-slate-200">
                                {index + 1}
                            </span>
                            {component.name}
                        </h3>
                        <p className="text-slate-500 text-sm">
                            {component.tagline}
                        </p>

                        {/* Arrow indicator */}
                        <div className="absolute bottom-8 right-8 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-2 transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </button>
                ))}
            </div>

            {/* Quick tip */}
            <div className="mt-12 text-center text-slate-500 text-sm">
                <p>💡 Tip: Your selections will sync with the Display Screen in real-time</p>
            </div>
        </div>
    );
};

export default ControlScreenNew;
