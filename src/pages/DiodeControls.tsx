import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3002/diode');

const DiodeControls = () => {
    const [state, setState] = useState({
        tab: 'intro',
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
        socket.emit('updateState', updates);
        setState(prev => ({ ...prev, ...updates }));
    };

    const updateSubState = (key, subUpdates) => {
        const newState = {
            [key]: { ...state[key], ...subUpdates }
        };
        socket.emit('updateState', newState);
        setState(prev => ({ ...prev, ...newState }));
    };

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!state.intro) return;
            const { key } = e;
            const { tab } = state;

            // Tab switching: 1=intro, 2=forward, 3=reverse, 4=breakdown
            if (key === '1') { updateState({ tab: 'intro' });     return; }
            if (key === '2') { updateState({ tab: 'forward' });   return; }
            if (key === '3') { updateState({ tab: 'reverse' });   return; }
            if (key === '4') { updateState({ tab: 'breakdown' }); return; }

            // Breakdown type: Z=zener, A=avalanche
            if (tab === 'breakdown') {
                if (key.toLowerCase() === 'z') { updateSubState('breakdown', { type: 'zener',     voltage: 0 }); return; }
                if (key.toLowerCase() === 'a') { updateSubState('breakdown', { type: 'avalanche', voltage: 0 }); return; }
            }

            // Enter to toggle intro junction
            if (tab === 'intro' && key === 'Enter') {
                updateSubState('intro', { joined: !state.intro.joined });
                return;
            }

            // Arrow keys to adjust voltage
            if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'PageUp' || key === 'PageDown') {
                e.preventDefault();
                const up = key === 'ArrowUp' || key === 'PageUp';

                if (tab === 'forward') {
                    updateSubState('forward', { voltage: Math.max(0, Math.min(1.5, +(state.forward.voltage + (up ? 0.1 : -0.1)).toFixed(2))) });
                } else if (tab === 'reverse') {
                    updateSubState('reverse', { voltage: Math.max(0, Math.min(10, +(state.reverse.voltage + (up ? 0.5 : -0.5)).toFixed(1))) });
                } else if (tab === 'breakdown') {
                    const step = state.breakdown.type === 'zener' ? 0.5 : 2;
                    const max  = state.breakdown.type === 'zener' ? 10  : 80;
                    updateSubState('breakdown', { voltage: Math.max(0, Math.min(max, +(state.breakdown.voltage + (up ? step : -step)).toFixed(1))) });
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state]);

    return (
        <div className="h-screen w-full bg-slate-50 p-4 flex flex-col overflow-hidden">
            <div className="flex-1 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black tracking-tight">Diode Controls</h2>
                    </div>
                    {/* Keyboard hint removed */}
                </div>

                {/* Card Body */}
                <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden">
                    {/* Tab Selection - 2x2 grid */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl flex-shrink-0">
                        {['intro', 'forward', 'reverse', 'breakdown'].map((t, i) => (
                            <button
                                key={t}
                                onClick={() => updateState({ tab: t })}
                                className={`py-3 px-1 rounded-lg text-sm font-bold uppercase tracking-wider transition-all relative
                                    ${state.tab === t ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {t}
                                <span className={`absolute top-1 right-1 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold
                                    ${state.tab === t ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    {i + 1}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* Tab Content - fills remaining space */}
                    <div className="flex-1 overflow-hidden flex flex-col">

                        {/* INTRO */}
                        {state.tab === 'intro' && (
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="flex-1 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center justify-center p-6 gap-4">
                                    <h3 className="font-bold text-blue-800 text-lg">PN Junction Formation</h3>
                                    <p className="text-sm text-blue-600">State: <strong>{state.intro.joined ? 'Joined' : 'Separated'}</strong></p>
                                    <button
                                        onClick={() => updateSubState('intro', { joined: !state.intro.joined })}
                                        className={`w-full max-w-xs py-5 rounded-xl font-bold text-white text-lg shadow-lg transition-all
                                            ${state.intro.joined ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                    >
                                        {state.intro.joined ? 'Disconnect Junction' : 'Form Junction'}
                                    </button>

                                </div>
                            </div>
                        )}

                        {/* FORWARD */}
                        {state.tab === 'forward' && (
                            <div className="flex-1 flex flex-col gap-5 justify-center">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700 text-lg">Forward Voltage</h3>
                                    <span className="text-4xl font-mono font-black text-green-600">{state.forward.voltage.toFixed(2)}V</span>
                                </div>
                                <input
                                    type="range" min="0" max="1.5" step="0.1"
                                    value={state.forward.voltage}
                                    onChange={(e) => updateSubState('forward', { voltage: parseFloat(e.target.value) })}
                                    className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                                <div className="flex justify-between text-sm text-slate-500 font-bold">
                                    <span>0V</span>
                                    <span className="text-amber-600">Threshold: 0.7V</span>
                                    <span>1.5V</span>
                                </div>
                                <div className={`mt-2 p-4 rounded-xl text-center text-sm font-bold transition-all
                                    ${state.forward.voltage >= 0.7 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
                                    {state.forward.voltage >= 0.7 ? '✓ Diode conducting — current flowing' : '○ Below threshold — diode OFF'}
                                </div>

                            </div>
                        )}

                        {/* REVERSE */}
                        {state.tab === 'reverse' && (
                            <div className="flex-1 flex flex-col gap-5 justify-center">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700 text-lg">Reverse Voltage</h3>
                                    <span className="text-4xl font-mono font-black text-red-600">-{state.reverse.voltage.toFixed(1)}V</span>
                                </div>
                                <input
                                    type="range" min="0" max="10" step="0.5"
                                    value={state.reverse.voltage}
                                    onChange={(e) => updateSubState('reverse', { voltage: parseFloat(e.target.value) })}
                                    className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                />
                                <div className="flex justify-between text-sm text-slate-500 font-bold">
                                    <span>0V</span>
                                    <span>Max: -10V</span>
                                </div>
                                <div className="mt-2 p-4 rounded-xl text-center text-sm font-bold bg-red-50 text-red-600 border border-red-200">
                                    Diode is blocking — only tiny leakage current (~µA)
                                </div>

                            </div>
                        )}

                        {/* BREAKDOWN */}
                        {state.tab === 'breakdown' && (
                            <div className="flex-1 flex flex-col gap-4 justify-center">
                                {/* Zener / Avalanche selector */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => updateSubState('breakdown', { type: 'zener', voltage: 0 })}
                                        className={`p-4 rounded-xl border-2 font-bold transition-all relative
                                            ${state.breakdown.type === 'zener' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                    >
                                        Zener (~5V)

                                    </button>
                                    <button
                                        onClick={() => updateSubState('breakdown', { type: 'avalanche', voltage: 0 })}
                                        className={`p-4 rounded-xl border-2 font-bold transition-all relative
                                            ${state.breakdown.type === 'avalanche' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                    >
                                        Avalanche (&gt;50V)

                                    </button>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-slate-700 text-lg">Voltage</h3>
                                        <span className="text-4xl font-mono font-black text-purple-600">-{state.breakdown.voltage.toFixed(1)}V</span>
                                    </div>
                                    <input
                                        type="range" min="0"
                                        max={state.breakdown.type === 'zener' ? 10 : 80}
                                        step={state.breakdown.type === 'zener' ? 0.5 : 2}
                                        value={state.breakdown.voltage}
                                        onChange={(e) => updateSubState('breakdown', { voltage: parseFloat(e.target.value) })}
                                        className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                    <div className="flex justify-between text-sm text-slate-500 font-bold">
                                        <span>0V</span>
                                        <span className="text-red-500">Breakdown: {state.breakdown.type === 'zener' ? '5.1V' : '50V'}</span>
                                        <span>Max</span>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiodeControls;
