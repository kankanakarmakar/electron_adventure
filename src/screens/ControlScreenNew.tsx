/**
 * Professional Hardware Control Screen - Museum Installation
 * Staff Control Panel with Component Animation Tabs
 * Shows each component responding to control changes + organized controls below
 */

import React, { useState, useEffect, useCallback } from 'react';
import useWebSocketSync from '@/hooks/useWebSocketSync';
import { ControlAction, CircuitType } from '@/types/sync';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Keyboard, Volume2, Zap } from 'lucide-react';
import ComponentAnimation from '@/components/ComponentAnimation';

interface ControlButton {
    id: string;
    label: string;
    action: 'increment' | 'decrement' | 'select' | 'reset';
    parameter?: string;
    increment?: number;
    circuitType?: CircuitType;
    color: string;
    icon?: React.ReactNode;
}

const ControlScreenNew: React.FC = () => {
    const [currentCircuit, setCurrentCircuit] = useState<CircuitType>('resistor');
    const [liveValues, setLiveValues] = useState({
        voltage: 5,
        current: 0,
        frequency: 50,
    });
    const [lastAction, setLastAction] = useState<string>('System Ready');
    const [isConnected, setIsConnected] = useState(false);

    const { isConnected: wsConnected, sendControlAction } = useWebSocketSync({
        screenType: 'control',
        onCircuitStateUpdate: (state) => {
            setLiveValues({
                voltage: state.voltage,
                current: state.current,
                frequency: state.frequency || 50,
            });
            if (state.circuitType) {
                setCurrentCircuit(state.circuitType);
            }
        },
    });

    useEffect(() => {
        setIsConnected(wsConnected);
    }, [wsConnected]);

    const controlButtons: ControlButton[] = [
        {
            id: 'voltage-inc',
            label: 'Voltage +',
            action: 'increment',
            parameter: 'voltage',
            increment: 1,
            color: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700',
        },
        {
            id: 'voltage-dec',
            label: 'Voltage -',
            action: 'decrement',
            parameter: 'voltage',
            increment: 1,
            color: 'bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600',
        },
        {
            id: 'frequency-inc',
            label: 'Frequency +',
            action: 'increment',
            parameter: 'frequency',
            increment: 10,
            color: 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700',
        },
        {
            id: 'frequency-dec',
            label: 'Frequency -',
            action: 'decrement',
            parameter: 'frequency',
            increment: 10,
            color: 'bg-purple-400 hover:bg-purple-500 active:bg-purple-600',
        },
        {
            id: 'resistor',
            label: 'Resistor',
            action: 'select',
            circuitType: 'resistor',
            color: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
        },
        {
            id: 'capacitor',
            label: 'Capacitor',
            action: 'select',
            circuitType: 'capacitor',
            color: 'bg-green-600 hover:bg-green-700 active:bg-green-800',
        },
        {
            id: 'inductor',
            label: 'Inductor',
            action: 'select',
            circuitType: 'inductor',
            color: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800',
        },
        {
            id: 'diode',
            label: 'Diode',
            action: 'select',
            circuitType: 'diode',
            color: 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800',
        },
        {
            id: 'reset',
            label: 'Reset All',
            action: 'reset',
            color: 'bg-red-600 hover:bg-red-700 active:bg-red-800',
        },
    ];

    const handleButtonPress = (button: ControlButton) => {
        if (!isConnected) return;

        const action: ControlAction = {
            timestamp: Date.now(),
            action: button.action.toUpperCase() as any,
            value: button.increment,
        };

        if (button.parameter) {
            action.action = `${button.parameter.toUpperCase()}_CHANGE` as any;
        }

        if (button.circuitType) {
            action.circuitType = button.circuitType;
            setCurrentCircuit(button.circuitType);
            setLastAction(`Selected: ${button.label}`);
        } else if (button.id === 'reset') {
            setLastAction('Reset All Values');
        } else if (button.label.includes('Voltage')) {
            setLastAction(button.label);
        } else if (button.label.includes('Frequency')) {
            setLastAction(button.label);
        }

        sendControlAction(action);
    };

    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            if (!isConnected) return;

            const key = event.key.toUpperCase();

            if (key === 'ARROWUP') {
                const btn = controlButtons.find((b) => b.id === 'voltage-inc');
                if (btn) handleButtonPress(btn);
                event.preventDefault();
            } else if (key === 'ARROWDOWN') {
                const btn = controlButtons.find((b) => b.id === 'voltage-dec');
                if (btn) handleButtonPress(btn);
                event.preventDefault();
            } else if (key === 'PAGEUP') {
                const btn = controlButtons.find((b) => b.id === 'frequency-inc');
                if (btn) handleButtonPress(btn);
                event.preventDefault();
            } else if (key === 'PAGEDOWN') {
                const btn = controlButtons.find((b) => b.id === 'frequency-dec');
                if (btn) handleButtonPress(btn);
                event.preventDefault();
            } else if (key === '1') {
                const btn = controlButtons.find((b) => b.id === 'resistor');
                if (btn) handleButtonPress(btn);
                event.preventDefault();
            } else if (key === '2') {
                const btn = controlButtons.find((b) => b.id === 'capacitor');
                if (btn) handleButtonPress(btn);
                event.preventDefault();
            } else if (key === '3') {
                const btn = controlButtons.find((b) => b.id === 'inductor');
                if (btn) handleButtonPress(btn);
                event.preventDefault();
            } else if (key === '4') {
                const btn = controlButtons.find((b) => b.id === 'diode');
                if (btn) handleButtonPress(btn);
                event.preventDefault();
            } else if (key === 'R') {
                const btn = controlButtons.find((b) => b.id === 'reset');
                if (btn) handleButtonPress(btn);
                event.preventDefault();
            }
        },
        [isConnected, controlButtons]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    return (
        <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white overflow-auto">
            {/* Professional Header */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 border-b-2 border-slate-700 shadow-lg">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold mb-1">Staff Control Panel</h1>
                            <p className="text-slate-400 text-sm">Circuit Learning System Control Interface</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                                    isConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                }`}
                            >
                                {isConnected ? (
                                    <>
                                        <Wifi className="w-5 h-5" />
                                        Connected
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="w-5 h-5" />
                                        Offline
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Component Animation Tabs */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Component Preview</h2>
                    
                    {/* Tab Buttons */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                        {(['resistor', 'capacitor', 'inductor', 'diode'] as const).map((component) => (
                            <button
                                key={component}
                                onClick={() => {
                                    setCurrentCircuit(component);
                                    const btn = controlButtons.find((b) => b.circuitType === component);
                                    if (btn) handleButtonPress(btn);
                                }}
                                className={`px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all ${
                                    currentCircuit === component
                                        ? component === 'resistor'
                                            ? 'bg-blue-600 shadow-lg shadow-blue-500/50 scale-105'
                                            : component === 'capacitor'
                                            ? 'bg-green-600 shadow-lg shadow-green-500/50 scale-105'
                                            : component === 'inductor'
                                            ? 'bg-indigo-600 shadow-lg shadow-indigo-500/50 scale-105'
                                            : 'bg-orange-600 shadow-lg shadow-orange-500/50 scale-105'
                                        : 'bg-slate-700 hover:bg-slate-600'
                                }`}
                            >
                                {component}
                            </button>
                        ))}
                    </div>

                    {/* Component Animation Display */}
                    <Card className="bg-slate-800 border-slate-700 p-4">
                        <div className="grid grid-cols-1 gap-4">
                            <ComponentAnimation
                                componentType="resistor"
                                voltage={liveValues.voltage}
                                frequency={liveValues.frequency}
                                current={liveValues.current}
                                isActive={currentCircuit === 'resistor'}
                            />
                            <ComponentAnimation
                                componentType="capacitor"
                                voltage={liveValues.voltage}
                                frequency={liveValues.frequency}
                                current={liveValues.current}
                                isActive={currentCircuit === 'capacitor'}
                            />
                            <ComponentAnimation
                                componentType="inductor"
                                voltage={liveValues.voltage}
                                frequency={liveValues.frequency}
                                current={liveValues.current}
                                isActive={currentCircuit === 'inductor'}
                            />
                            <ComponentAnimation
                                componentType="diode"
                                voltage={liveValues.voltage}
                                frequency={liveValues.frequency}
                                current={liveValues.current}
                                isActive={currentCircuit === 'diode'}
                            />
                        </div>
                    </Card>
                </div>

                {/* Live Values Display */}
                <Card className="bg-slate-800 border-slate-700 p-6 mb-8 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Live Values</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-900/10 rounded-lg p-4 border-2 border-yellow-600/50">
                            <div className="text-yellow-200 text-sm font-bold uppercase mb-2">Voltage</div>
                            <div className="text-4xl font-bold text-yellow-400">{liveValues.voltage.toFixed(1)}V</div>
                        </div>
                        <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-900/10 rounded-lg p-4 border-2 border-cyan-600/50">
                            <div className="text-cyan-200 text-sm font-bold uppercase mb-2">Current</div>
                            <div className="text-4xl font-bold text-cyan-400">{liveValues.current.toFixed(2)}A</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 rounded-lg p-4 border-2 border-purple-600/50">
                            <div className="text-purple-200 text-sm font-bold uppercase mb-2">Frequency</div>
                            <div className="text-4xl font-bold text-purple-400">{liveValues.frequency.toFixed(0)}Hz</div>
                        </div>
                    </div>
                </Card>

                {/* Control Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Voltage Controls */}
                    <div>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Zap className="w-8 h-8 text-yellow-400" />
                            <span>Voltage Control</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {controlButtons
                                .filter((b) => b.parameter === 'voltage')
                                .map((btn) => (
                                    <button
                                        key={btn.id}
                                        onClick={() => handleButtonPress(btn)}
                                        disabled={!isConnected}
                                        className={`${btn.color} disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-8 px-6 rounded-xl text-3xl transition-all duration-150 active:scale-95 shadow-lg transform hover:shadow-xl`}
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Frequency Controls */}
                    <div>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Volume2 className="w-8 h-8 text-purple-400" />
                            <span>Frequency Control</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {controlButtons
                                .filter((b) => b.parameter === 'frequency')
                                .map((btn) => (
                                    <button
                                        key={btn.id}
                                        onClick={() => handleButtonPress(btn)}
                                        disabled={!isConnected}
                                        className={`${btn.color} disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-8 px-6 rounded-xl text-3xl transition-all duration-150 active:scale-95 shadow-lg transform hover:shadow-xl`}
                                    >
                                        {btn.label}
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Reset Button - Full Width */}
                <div className="mt-8">
                    {controlButtons
                        .filter((b) => b.action === 'reset')
                        .map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => handleButtonPress(btn)}
                                disabled={!isConnected}
                                className={`w-full ${btn.color} disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-10 px-8 rounded-xl text-3xl transition-all duration-150 active:scale-95 shadow-lg transform hover:shadow-xl`}
                            >
                                🔄 {btn.label}
                            </button>
                        ))}
                </div>
            </div>

            {/* Footer with Keyboard Shortcuts */}
            <div className="sticky bottom-0 z-40 bg-gradient-to-t from-slate-950 to-slate-900/80 border-t-2 border-slate-700 backdrop-blur">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <p className="text-slate-400 text-sm">
                                {isConnected ? '✅ Connected to Display' : '❌ Display Offline'}
                            </p>
                            <p className="text-slate-500 text-xs mt-1">Real-time sync &lt; 200ms</p>
                        </div>

                        <div className="text-center">
                            <p className="text-slate-400 text-sm">Last Action</p>
                            <p className="text-yellow-300 font-mono text-sm mt-1">{lastAction}</p>
                        </div>

                        <div className="flex items-center justify-center gap-2">
                            <Keyboard className="w-5 h-5 text-slate-400" />
                            <div className="text-sm text-slate-400">
                                <span className="text-slate-300 font-semibold">↑↓</span> Volt |
                                <span className="text-slate-300 font-semibold"> PgUp/Dn</span> Freq |
                                <span className="text-slate-300 font-semibold"> 1-4</span> Comp |
                                <span className="text-slate-300 font-semibold"> R</span> Reset
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disconnection Overlay */}
            {!isConnected && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
                    <Card className="bg-slate-900 border-red-600 border-2 p-12 rounded-3xl max-w-md text-center shadow-2xl">
                        <div className="text-6xl mb-4">📡</div>
                        <h2 className="text-3xl font-bold text-red-500 mb-4">Connection Lost</h2>
                        <p className="text-slate-300 mb-6">
                            The display panel is not connected. Please ensure it is running on
                            http://localhost:3001
                        </p>
                        <div className="text-slate-400 text-sm">
                            Attempting to reconnect automatically...
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ControlScreenNew;
