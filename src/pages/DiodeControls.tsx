import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ArrowLeft, ArrowRight, Zap, Play, Power, RotateCcw } from 'lucide-react';

const socket = io('http://localhost:3002/diode');

const DiodeControls = () => {
    const [state, setState] = useState({
        tab: 'intro', // 'intro', 'forward', 'reverse', 'breakdown'
        intro: { joined: false },
        forward: { voltage: 0 },
        reverse: { voltage: 0 },
        breakdown: { voltage: 0, type: 'zener' }
    });
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        socket.on('initialState', (s) => s && setState(s));
        socket.on('stateUpdated', (s) => s && setState(s));
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('initialState');
            socket.off('stateUpdated');
        };
    }, []);

    // Safety Check for Stale Server
    if (!state.intro || !state.forward) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-2xl shadow-xl text-center border-l-4 border-red-500 max-w-xs">
                    <h2 className="text-xl font-bold text-red-500 mb-2">⚠️ Connection Issue</h2>
                    <p className="text-sm text-slate-600">Server state is invalid. Please restart the backend.</p>
                </div>
            </div>
        );
    }

    const updateState = (updates) => {
        // optimistically update local state?
        // Actually better to just emit diff. But for Deep Merge logic in server we send full structure or partial.
        // Server creates deep merge for specific keys?
        // Server code: if (newState.values && ...) else shallow.
        // My Diode state has nested keys 'intro', 'forward'. The server logic for Capacitor/Inductor handles 'values'.
        // For Diode, I customized the state. I might need to send FULL state for a sub-object to be safe,
        // or ensure Server creates deep merge.
        // Given I updated 'server.js' to:
        // socket.on('updateState', (newState) => { ... if(newState.values ...)... else shallow ... });
        // The server shallow merges the top level.
        // So if I send { forward: { voltage: 1 } }, it REPLACES `state.diode.forward` object!
        // This is dangerous if `forward` has other props. Currently it only has `voltage`.
        // But `intro` has `joined`.
        // `breakdown` has `voltage` AND `type`.
        // If I update `breakdown: { voltage: 5 }`, I LOSE `type`!
        // FIX: Start by sending the CURRENT helper state merged.
        // Or update Server to deep merge.
        // Since I cannot update server again easily (I could but costly), 
        // I will handle merge on CLIENT side and emit FULL sub-object.

        const merged = { ...state, ...updates };
        // Wait, updates might be deep.
        // Helper to merge deep:
        // Actually, let's just emit the specific sub-object fully constructed.
        socket.emit('updateState', updates);
    };

    const updateSubState = (key, subUpdates) => {
        const newState = {
            [key]: { ...state[key], ...subUpdates }
        };
        socket.emit('updateState', newState);
        setState(prev => ({ ...prev, ...newState }));
    };

    // Hardware Keys
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!state.intro) return; // server check
            const { key } = e;
            const { tab } = state;

            // Global Tab Switching? Maybe PageUp/Down for tabs if not used for voltage?
            // User requested PageUp/Down map to Voltage in Diode.tsx.
            // But usually PageUp is fast scroll.
            // Let's stick to Arrow Keys/Page Keys for Voltage as per previous Diode.tsx logic.


            if (tab === 'intro') {
                if (key === 'Enter') {
                    updateSubState('intro', { joined: !state.intro.joined });
                }
            } else if (tab === 'forward') {
                const step = 0.1;
                const max = 1.5;
                if (key === 'ArrowUp' || key === 'PageUp') {
                    updateSubState('forward', { voltage: Math.min(max, state.forward.voltage + step) });
                } else if (key === 'ArrowDown' || key === 'PageDown') {
                    updateSubState('forward', { voltage: Math.max(0, state.forward.voltage - step) });
                }
            } else if (tab === 'reverse') {
                const step = 0.5;
                const max = 10;
                if (key === 'ArrowUp' || key === 'PageUp') {
                    updateSubState('reverse', { voltage: Math.min(max, state.reverse.voltage + step) });
                } else if (key === 'ArrowDown' || key === 'PageDown') {
                    updateSubState('reverse', { voltage: Math.max(0, state.reverse.voltage - step) });
                }
            } else if (tab === 'breakdown') {
                const step = state.breakdown.type === 'zener' ? 0.5 : 2;
                const max = state.breakdown.type === 'zener' ? 10 : 80;
                if (key === 'ArrowUp' || key === 'PageUp') {
                    updateSubState('breakdown', { voltage: Math.min(max, state.breakdown.voltage + step) });
                } else if (key === 'ArrowDown' || key === 'PageDown') {
                    updateSubState('breakdown', { voltage: Math.max(0, state.breakdown.voltage - step) });
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state]);

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-2xl font-black tracking-tight">Diode Controls</h2>
                        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-400'}`}></div>
                    </div>
                </div>

                {!state.intro ? (
                    <div className="p-8 text-center bg-red-50 text-red-600 font-bold">
                        ⚠️ Restart Server (node server.js) to enable controls.
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        {/* Tab Selection */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl">
                            {['intro', 'forward', 'reverse', 'breakdown'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => updateState({ tab: t })}
                                    className={`py-2 px-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${state.tab === t ? 'bg-white text-blue-600 shadow-md transform scale-105' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div className="border-t border-slate-100 my-4"></div>

                        {/* Controls specific to Tab */}
                        {state.tab === 'intro' && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                    <h3 className="font-bold text-blue-800 mb-2">PN Junction Formation</h3>
                                    <p className="text-xs text-blue-600 mb-4">State: {state.intro.joined ? 'Joined' : 'Separated'}</p>
                                    <button
                                        onClick={() => updateSubState('intro', { joined: !state.intro.joined })}
                                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${state.intro.joined ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                    >
                                        {state.intro.joined ? 'Disconnect Junction' : 'Form Junction'}
                                    </button>
                                    <p className="text-[10px] text-slate-400 mt-2 font-mono">Press ENTER to toggle</p>
                                </div>
                            </div>
                        )}

                        {state.tab === 'forward' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700">Forward Voltage</h3>
                                    <span className="text-2xl font-mono font-bold text-green-600">{state.forward.voltage.toFixed(2)}V</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="1.5" step="0.1"
                                    value={state.forward.voltage}
                                    onChange={(e) => updateSubState('forward', { voltage: parseFloat(e.target.value) })}
                                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                                <div className="flex justify-between text-xs text-slate-500 font-bold">
                                    <span>0V</span>
                                    <span className="text-amber-600">Threshold: 0.7V</span>
                                    <span>1.5V</span>
                                </div>
                            </div>
                        )}

                        {state.tab === 'reverse' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700">Reverse Voltage</h3>
                                    <span className="text-2xl font-mono font-bold text-red-600">-{state.reverse.voltage.toFixed(1)}V</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="10" step="0.5"
                                    value={state.reverse.voltage}
                                    onChange={(e) => updateSubState('reverse', { voltage: parseFloat(e.target.value) })}
                                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                />
                                <div className="flex justify-between text-xs text-slate-500 font-bold">
                                    <span>0V</span>
                                    <span>Max: -10V</span>
                                </div>
                            </div>
                        )}

                        {state.tab === 'breakdown' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => updateSubState('breakdown', { type: 'zener', voltage: 0 })}
                                        className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${state.breakdown.type === 'zener' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-400'}`}
                                    >
                                        Zener (~5V)
                                    </button>
                                    <button
                                        onClick={() => updateSubState('breakdown', { type: 'avalanche', voltage: 0 })}
                                        className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${state.breakdown.type === 'avalanche' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-400'}`}
                                    >
                                        Avalanche ({'>'}50V)
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-slate-700">Voltage</h3>
                                        <span className="text-2xl font-mono font-bold text-purple-600">-{state.breakdown.voltage.toFixed(1)}V</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={state.breakdown.type === 'zener' ? 10 : 80}
                                        step={state.breakdown.type === 'zener' ? 0.5 : 2}
                                        value={state.breakdown.voltage}
                                        onChange={(e) => updateSubState('breakdown', { voltage: parseFloat(e.target.value) })}
                                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 font-bold">
                                        <span>0V</span>
                                        <span className="text-red-500">Breakdown: {state.breakdown.type === 'zener' ? '5.1V' : '50V'}</span>
                                        <span>Max</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiodeControls;
