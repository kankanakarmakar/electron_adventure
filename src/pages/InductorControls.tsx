import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Zap, Info } from 'lucide-react';

// Socket connection
const socket = io('http://localhost:3002/inductor');

type CircuitMode = 'simple' | 'series' | 'parallel';

interface InductorValues {
    voltage: number;
    l1: number; // mH
    l2: number; // mH
    currentRate: number; // A/s
}

const InductorControls: React.FC = () => {
    const [mode, setMode] = useState<CircuitMode>('simple');
    const [values, setValues] = useState<InductorValues>({
        voltage: 12,
        l1: 10,
        l2: 20,
        currentRate: 5,
    });
    const [currentDirection, setCurrentDirection] = useState<'forward' | 'reverse'>('forward');
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        socket.on('initialState', (state: any) => {
            if (state) {
                setMode(state.mode);
                setValues(state.values);
                setCurrentDirection(state.currentDirection);
            }
        });

        socket.on('stateUpdated', (state: any) => {
            if (state) {
                setMode(state.mode);
                setValues(state.values);
                setCurrentDirection(state.currentDirection);
            }
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('initialState');
            socket.off('stateUpdated');
        };
    }, []);

    const updateState = (updates: any) => {
        socket.emit('updateState', updates);
        // Optimistic update
        if (updates.mode) setMode(updates.mode);
        if (updates.values) setValues({ ...values, ...updates.values });
        if (updates.currentDirection) setCurrentDirection(updates.currentDirection);
    };

    // Derived values
    const getTotalInductance = () => {
        switch (mode) {
            case 'simple': return values.l1;
            case 'series': return values.l1 + values.l2;
            case 'parallel': return (values.l1 * values.l2) / (values.l1 + values.l2);
        }
    };

    const getInducedVoltage = () => {
        const L = getTotalInductance() / 1000; // Convert mH to H
        return (L * values.currentRate).toFixed(2);
    };

    const getCurrent = () => {
        return (values.voltage / 10).toFixed(2);
    };

    const totalInductance = getTotalInductance();
    const inducedVoltage = getInducedVoltage();
    const current = getCurrent();

    const updateValue = (key: keyof InductorValues, value: number) => {
        const newValues = { ...values, [key]: value };
        updateState({ values: newValues });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-2xl font-black tracking-tight">Inductor Controls</h2>
                        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-400'}`}></div>
                    </div>
                    <p className="text-blue-100 font-medium">Remote Control Panel</p>
                </div>

                <div className="p-6 space-y-8">
                    {/* Mode Selection */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl">
                        {(['simple', 'series', 'parallel'] as CircuitMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => updateState({ mode: m })}
                                className={`py-2 rounded-lg text-sm font-bold transition-all ${mode === m ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Direction */}
                    <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <span className="font-bold text-slate-700">Current Direction</span>
                        <button
                            onClick={() => updateState({ currentDirection: currentDirection === 'forward' ? 'reverse' : 'forward' })}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
                        >
                            {currentDirection === 'forward' ? 'Forward ➡️' : 'Reverse ⬅️'}
                        </button>
                    </div>

                    {/* Sliders / Controls */}
                    <div className="space-y-6">
                        {/* Voltage */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-bold text-slate-700">Voltage</span>
                                <span className="font-bold text-blue-600">{values.voltage}V</span>
                            </div>
                            <input
                                type="range" min="1" max="24" value={values.voltage}
                                onChange={(e) => updateValue('voltage', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* dI/dt */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-bold text-slate-700">Current Rate (dI/dt)</span>
                                <span className="font-bold text-purple-600">{values.currentRate} A/s</span>
                            </div>
                            <input
                                type="range" min="1" max="20" value={values.currentRate}
                                onChange={(e) => updateValue('currentRate', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                        </div>

                        {/* L1 */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-bold text-slate-700">Inductance L1</span>
                                <span className="font-bold text-indigo-600">{values.l1}mH</span>
                            </div>
                            <input
                                type="range" min="1" max="100" step="5" value={values.l1}
                                onChange={(e) => updateValue('l1', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        {/* L2 */}
                        {mode !== 'simple' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-700">Inductance L2</span>
                                    <span className="font-bold text-indigo-600">{values.l2}mH</span>
                                </div>
                                <input
                                    type="range" min="1" max="100" step="5" value={values.l2}
                                    onChange={(e) => updateValue('l2', parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-2 shadow-xl">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-medium">Total Inductance</span>
                            <span className="font-bold text-emerald-400">{totalInductance.toFixed(1)} mH</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-medium">Induced Voltage</span>
                            <span className="font-bold text-amber-400">{inducedVoltage} V</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-medium">Current</span>
                            <span className="font-bold text-cyan-400">{current} A</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InductorControls;
