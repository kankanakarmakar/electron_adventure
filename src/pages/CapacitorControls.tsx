import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Zap, Play, Lightbulb, RotateCcw } from 'lucide-react';

const socket = io('http://localhost:3002/capacitor');

type CircuitMode = 'simple' | 'series' | 'parallel';
type Stage = 'initial' | 'connecting' | 'charging' | 'charged' | 'disconnecting' | 'discharge' | 'discharged';

interface CapacitorState {
    mode: CircuitMode;
    voltage: number;
    capacitance: number;
    capacitance2: number;
    capacitance3: number;
    stage: Stage;
}

const CapacitorControls: React.FC = () => {
    const [state, setState] = useState<CapacitorState>({
        mode: 'simple',
        voltage: 9,
        capacitance: 100,
        capacitance2: 200,
        capacitance3: 150,
        stage: 'initial',
    });
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        socket.on('initialState', (s: CapacitorState) => s && setState(s));
        socket.on('stateUpdated', (s: CapacitorState) => s && setState(s));
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('initialState');
            socket.off('stateUpdated');
        };
    }, []);

    const updateState = (updates: Partial<CapacitorState>) => {
        socket.emit('updateState', updates);
        setState(prev => ({ ...prev, ...updates }));
    };

    // Control Handlers
    const handleConnect = () => {
        updateState({ stage: 'connecting' });
        setTimeout(() => updateState({ stage: 'charging' }), 500); // Controller manages transition
        // Controller also needs to know when charging finishes? 
        // In the original, the animation loop triggered 'charged' after chargeLevel >= 1.
        // We can mimic this by setting a timeout based on known charge duration, OR
        // allow the User to decide when it's charged (by removing 'charged' auto-transition),
        // OR rely on the Circuit to emit 'finishedCharging' which we listen to?
        // Since Circuit has the animation loop, Circuit knows best.
        // But for split architecture, we usually avoid circular logic if possible.
        // Let's just set a fixed timeout for 'charged' here to keep logic in Controller.
        // Original loop roughly: chargeLevel += 0.008 per 45ms. 1 / 0.008 = 125 steps * 45ms = ~5.6s.
        setTimeout(() => updateState({ stage: 'charged' }), 6000);
    };

    const handleDisconnect = () => {
        updateState({ stage: 'disconnecting' });
        setTimeout(() => updateState({ stage: 'discharge' }), 800);
        // Discharge lasts until level 0. Level -= 0.0015 per 45ms (slower).
        // 1 / 0.0015 = ~667 steps * 45ms = ~30s
        setTimeout(() => updateState({ stage: 'discharged' }), 30000);
    };

    const handleReset = () => {
        updateState({ stage: 'initial' });
    };

    const getTotalCapacitance = () => {
        switch (state.mode) {
            case 'simple': return state.capacitance;
            case 'series': return 1 / (1 / state.capacitance + 1 / state.capacitance2 + 1 / state.capacitance3);
            case 'parallel': return state.capacitance + state.capacitance2 + state.capacitance3;
        }
    };

    const totalCapacitance = getTotalCapacitance();
    const storedEnergy = 0.5 * totalCapacitance * state.voltage * state.voltage / 1000;

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-2xl font-black tracking-tight">Capacitor Controls</h2>
                        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-400'}`}></div>
                    </div>
                    <p className="text-pink-100 font-medium">Remote Control Panel</p>
                </div>

                <div className="p-6 space-y-8">
                    {/* Mode Selection */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl">
                        {(['simple', 'series', 'parallel'] as CircuitMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => {
                                    updateState({ mode: m });
                                    handleReset();
                                }}
                                className={`py-2 rounded-lg text-sm font-bold transition-all ${state.mode === m ? 'bg-white text-pink-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        {state.stage === 'initial' && (
                            <button onClick={handleConnect} className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                                <Play className="w-5 h-5" /> Connect Battery
                            </button>
                        )}
                        {(state.stage === 'charging' || state.stage === 'connecting') && (
                            <div className="w-full py-4 rounded-xl bg-slate-100 text-slate-500 font-bold text-lg text-center animate-pulse">
                                Charging Capacitor...
                            </div>
                        )}
                        {state.stage === 'charged' && (
                            <button onClick={handleDisconnect} className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                                <Lightbulb className="w-5 h-5" /> Discharge to Bulb
                            </button>
                        )}
                        {(state.stage === 'discharge' || state.stage === 'discharged' || state.stage === 'disconnecting') && (
                            <button onClick={handleReset} disabled={state.stage === 'discharge' || state.stage === 'disconnecting'} className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <RotateCcw className="w-5 h-5" /> Reset Circuit
                            </button>
                        )}
                    </div>

                    {/* Sliders */}
                    <div className="space-y-5 opacity-90">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-bold text-slate-700">Voltage</span>
                                <span className="font-bold text-pink-600">{state.voltage}V</span>
                            </div>
                            <input
                                type="range" min="3" max="24" value={state.voltage}
                                disabled={state.stage !== 'initial'}
                                onChange={(e) => updateState({ voltage: parseInt(e.target.value) })}
                                onKeyDown={(e) => {
                                    if (state.stage !== 'initial') return;
                                    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                                        updateState({ voltage: Math.min(24, state.voltage + 1) });
                                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                                        updateState({ voltage: Math.max(3, state.voltage - 1) });
                                    }
                                }}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600 disabled:opacity-50"
                            />
                        </div>

                        {/* C1 Control */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-bold text-slate-700">C₁ Capacitance</span>
                                <span className="font-bold text-blue-600">{state.capacitance}µF</span>
                            </div>
                            <input
                                type="range" min="10" max="500" step="10" value={state.capacitance}
                                disabled={state.stage !== 'initial'}
                                onChange={(e) => updateState({ capacitance: parseInt(e.target.value) })}
                                onKeyDown={(e) => {
                                    if (state.stage !== 'initial') return;
                                    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                                        updateState({ capacitance: Math.min(500, state.capacitance + 10) });
                                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                                        updateState({ capacitance: Math.max(10, state.capacitance - 10) });
                                    }
                                }}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                            />
                        </div>

                        {/* C2 Control - Only for series/parallel */}
                        {(state.mode === 'series' || state.mode === 'parallel') && (
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-700">C₂ Capacitance</span>
                                    <span className="font-bold text-purple-600">{state.capacitance2}µF</span>
                                </div>
                                <input
                                    type="range" min="10" max="500" step="10" value={state.capacitance2}
                                    disabled={state.stage !== 'initial'}
                                    onChange={(e) => updateState({ capacitance2: parseInt(e.target.value) })}
                                    onKeyDown={(e) => {
                                        if (state.stage !== 'initial') return;
                                        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                                            updateState({ capacitance2: Math.min(500, state.capacitance2 + 10) });
                                        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                                            updateState({ capacitance2: Math.max(10, state.capacitance2 - 10) });
                                        }
                                    }}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 disabled:opacity-50"
                                />
                            </div>
                        )}

                        {/* C3 Control - Only for series/parallel */}
                        {(state.mode === 'series' || state.mode === 'parallel') && (
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-700">C₃ Capacitance</span>
                                    <span className="font-bold text-pink-600">{state.capacitance3}µF</span>
                                </div>
                                <input
                                    type="range" min="10" max="500" step="10" value={state.capacitance3}
                                    disabled={state.stage !== 'initial'}
                                    onChange={(e) => updateState({ capacitance3: parseInt(e.target.value) })}
                                    onKeyDown={(e) => {
                                        if (state.stage !== 'initial') return;
                                        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                                            updateState({ capacitance3: Math.min(500, state.capacitance3 + 10) });
                                        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                                            updateState({ capacitance3: Math.max(10, state.capacitance3 - 10) });
                                        }
                                    }}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600 disabled:opacity-50"
                                />
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-2 shadow-xl">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-medium">Total Capacitance</span>
                            <span className="font-bold text-purple-400">{totalCapacitance.toFixed(1)} µF</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-medium">Potential Energy</span>
                            <span className="font-bold text-pink-400">{storedEnergy.toFixed(2)} mJ</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CapacitorControls;
