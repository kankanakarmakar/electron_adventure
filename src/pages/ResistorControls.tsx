import React, { useState, useEffect } from 'react';
import { Zap, Info } from 'lucide-react';
import { io } from 'socket.io-client';

// Socket connection
// Socket connection
const socket = io('http://localhost:3002/resistor');

type CircuitMode = 'simple' | 'series' | 'parallel';

interface ResistorValues {
    voltage: number;
    r1: number; // Ohms
    r2: number; // Ohms
}

const ResistorControls = () => {
    const [mode, setMode] = useState<CircuitMode>('simple');
    const [values, setValues] = useState<ResistorValues>({
        voltage: 12,
        r1: 10,
        r2: 20,
    });
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to socket server');
            setConnected(true);
        });

        socket.on('initialState', (state: any) => {
            if (state.mode) setMode(state.mode);
            if (state.values) setValues(state.values);
        });

        socket.on('stateUpdated', (state: any) => {
            // We update local state to match others, but avoid loops if dragging?
            // Actually for controls, we usually want to reflect external changes too.
            if (state.mode) setMode(state.mode);
            if (state.values) setValues(state.values);
        });

        return () => {
            socket.off('connect');
            socket.off('initialState');
            socket.off('stateUpdated');
        };
    }, []);

    const updateState = (newMode?: CircuitMode, newValues?: ResistorValues) => {
        const payload: any = {};
        if (newMode) {
            setMode(newMode);
            payload.mode = newMode;
        }
        if (newValues) {
            setValues(newValues);
            payload.values = newValues;
        }
        socket.emit('updateState', payload);
    };

    // Calculate total resistance based on mode - needed for display
    const getTotalResistance = () => {
        switch (mode) {
            case 'simple':
                return values.r1;
            case 'series':
                return values.r1 + values.r2;
            case 'parallel':
                return (values.r1 * values.r2) / (values.r1 + values.r2);
        }
    };

    // Calculate current using Ohm's Law: I = V / R
    const getCurrent = () => {
        const R = getTotalResistance();
        return R > 0 ? values.voltage / R : 0;
    };

    // Calculate power: P = V × I = V² / R
    const getPower = () => {
        const R = getTotalResistance();
        return R > 0 ? (values.voltage * values.voltage) / R : 0;
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-100 p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <div className="flex items-center justify-center mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mr-3">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">CIRCUIT CONTROLS</h1>
                </div>

                {/* Connection Status */}
                <div className="flex justify-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {connected ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
                    {(['simple', 'series', 'parallel'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => updateState(m, undefined)}
                            className={`py-2 rounded-lg font-bold text-xs uppercase transition-all duration-200 ${mode === m
                                ? 'bg-white text-slate-800 shadow-md'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                <ResistorValuesPanel
                    mode={mode}
                    values={values}
                    onValuesChange={(v) => updateState(undefined, v)}
                    totalResistance={getTotalResistance()}
                    current={getCurrent()}
                    power={getPower()}
                />

                <div className="mt-6 text-center text-xs text-slate-400 font-medium">
                    Changes here reflect on the Circuit Display screen.
                </div>
            </div>
        </div>
    );
};

// Inline ResistorValuesPanel (copy from original)
interface ResistorValuesPanelProps {
    mode: CircuitMode;
    values: ResistorValues;
    onValuesChange: (values: ResistorValues) => void;
    totalResistance: number;
    current: number;
    power: number;
}

function ResistorValuesPanel({ mode, values, onValuesChange, totalResistance, current, power }: ResistorValuesPanelProps) {
    return (
        <div className="space-y-4">
            {/* Voltage Control */}
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-sm font-bold text-slate-700">Voltage Source</span>
                    <span className="text-sm font-black text-purple-600">{values.voltage}V</span>
                </div>
                <div className="flex items-center gap-3 bg-purple-50 p-2 rounded-lg border border-purple-100">
                    <button
                        onClick={() => onValuesChange({ ...values, voltage: Math.max(1, values.voltage - 1) })}
                        className="w-8 h-8 rounded-md bg-white border border-purple-200 text-purple-600 font-bold hover:bg-purple-100 active:scale-95 transition-all text-lg flex items-center justify-center p-0 pb-1 leading-none shadow-sm"
                    >−</button>
                    <input
                        type="range"
                        min="1"
                        max="24"
                        value={values.voltage}
                        onChange={(e) => onValuesChange({ ...values, voltage: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <button
                        onClick={() => onValuesChange({ ...values, voltage: Math.min(24, values.voltage + 1) })}
                        className="w-8 h-8 rounded-md bg-white border border-purple-200 text-purple-600 font-bold hover:bg-purple-100 active:scale-95 transition-all text-lg flex items-center justify-center p-0 pb-1 leading-none shadow-sm"
                    >+</button>
                </div>
            </div>

            {/* R1 Control */}
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-sm font-bold text-slate-700">Resistor R1</span>
                    <span className="text-sm font-black text-red-600">{values.r1}Ω</span>
                </div>
                <div className="flex items-center gap-3 bg-red-50 p-2 rounded-lg border border-red-100">
                    <button
                        onClick={() => onValuesChange({ ...values, r1: Math.max(1, values.r1 - 1) })}
                        className="w-8 h-8 rounded-md bg-white border border-red-200 text-red-600 font-bold hover:bg-red-100 active:scale-95 transition-all text-lg flex items-center justify-center p-0 pb-1 leading-none shadow-sm"
                    >−</button>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={values.r1}
                        onChange={(e) => onValuesChange({ ...values, r1: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <button
                        onClick={() => onValuesChange({ ...values, r1: Math.min(100, values.r1 + 1) })}
                        className="w-8 h-8 rounded-md bg-white border border-red-200 text-red-600 font-bold hover:bg-red-100 active:scale-95 transition-all text-lg flex items-center justify-center p-0 pb-1 leading-none shadow-sm"
                    >+</button>
                </div>
            </div>

            {/* R2 Control */}
            <div className={`space-y-2 transition-opacity duration-300 ${mode === 'simple' ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                <div className="flex justify-between">
                    <span className="text-sm font-bold text-slate-700">Resistor R2</span>
                    <span className="text-sm font-black text-orange-600">{values.r2}Ω</span>
                </div>
                <div className="flex items-center gap-3 bg-orange-50 p-2 rounded-lg border border-orange-100">
                    <button
                        onClick={() => onValuesChange({ ...values, r2: Math.max(1, values.r2 - 1) })}
                        className="w-8 h-8 rounded-md bg-white border border-orange-200 text-orange-600 font-bold hover:bg-orange-100 active:scale-95 transition-all text-lg flex items-center justify-center p-0 pb-1 leading-none shadow-sm"
                    >−</button>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={values.r2}
                        onChange={(e) => onValuesChange({ ...values, r2: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <button
                        onClick={() => onValuesChange({ ...values, r2: Math.min(100, values.r2 + 1) })}
                        className="w-8 h-8 rounded-md bg-white border border-orange-200 text-orange-600 font-bold hover:bg-orange-100 active:scale-95 transition-all text-lg flex items-center justify-center p-0 pb-1 leading-none shadow-sm"
                    >+</button>
                </div>
            </div>

            {/* Computed Values */}
            <div className="pt-2 mt-2 space-y-2">
                {/* Total R */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-sm font-bold text-green-800">Total Resistance</span>
                            <p className="text-[10px] text-green-600 font-medium opacity-80">
                                {mode === 'simple' ? 'R = R₁' : mode === 'series' ? 'R = R₁ + R₂' : '1/R = 1/R₁ + 1/R₂'}
                            </p>
                        </div>
                        <span className="font-black text-xl text-green-600">{totalResistance.toFixed(1)}Ω</span>
                    </div>
                </div>

                {/* Current */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-sm font-bold text-blue-800">Current</span>
                            <p className="text-[10px] text-blue-600 font-medium opacity-80">I = V / R</p>
                        </div>
                        <span className="font-black text-xl text-blue-600">{current.toFixed(1)}A</span>
                    </div>
                </div>

                {/* Power */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 border border-amber-200 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-sm font-bold text-amber-800">Power Dissipated</span>
                            <p className="text-[10px] text-amber-600 font-medium opacity-80">P = V × I</p>
                        </div>
                        <span className="font-black text-xl text-amber-600">{power.toFixed(1)}W</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResistorControls;
