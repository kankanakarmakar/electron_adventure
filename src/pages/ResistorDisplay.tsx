import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import useWebSocketSync from '@/hooks/useWebSocketSync';

type CircuitMode = 'simple' | 'series' | 'parallel';

interface ResistorValues {
    voltage: number;
    r1: number;
    r2: number;
}

const ResistorDisplay = () => {
    const [mode, setMode] = useState<CircuitMode>('simple');
    const [values, setValues] = useState<ResistorValues>({
        voltage: 12,
        r1: 10,
        r2: 20,
    });

    // Get updates from control panel via WebSocket
    useWebSocketSync({
        screenType: 'display',
        onCircuitStateUpdate: (state) => {
            setValues({
                voltage: state.voltage || 12,
                r1: state.resistance || 10,
                r2: 20,
            });
        },
    });

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

    const getCurrent = () => {
        const R = getTotalResistance();
        return R > 0 ? values.voltage / R : 0;
    };

    const getPower = () => {
        const R = getTotalResistance();
        return R > 0 ? (values.voltage * values.voltage) / R : 0;
    };

    const isBulbOn = () => {
        return getCurrent() >= 0.3;
    };

    const getBulbBrightness = () => {
        if (!isBulbOn()) return 0;
        const maxBrightness = 1;
        const maxCurrent = 2;
        return Math.min(getCurrent() / maxCurrent, maxBrightness);
    };

    // SVG circuit drawing - Display ONLY (no interactive elements)
    const renderCircuit = () => {
        return (
            <svg width="100%" height="500" viewBox="0 0 800 500" className="mx-auto">
                {/* Main circuit path */}
                <path
                    d="M 100 400 L 100 150 L 250 150 L 250 200 L 450 200 L 450 150 L 600 150 L 600 400 L 100 400"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Battery */}
                <g>
                    <rect x="60" y="350" width="40" height="60" fill="#222" stroke="#333" strokeWidth="2" rx="4" />
                    <text x="80" y="375" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">+</text>
                    <text x="80" y="400" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">-</text>
                    <text x="80" y="435" textAnchor="middle" fontSize="14" fill="#333" fontWeight="bold">{values.voltage}V</text>
                </g>

                {/* Resistor R1 */}
                <g>
                    <rect x="230" y="135" width="40" height="30" fill="none" stroke="#ea580c" strokeWidth="3" />
                    <line x1="235" y1="145" x2="245" y2="145" stroke="#ea580c" strokeWidth="2" />
                    <line x1="245" y1="145" x2="255" y2="155" stroke="#ea580c" strokeWidth="2" />
                    <line x1="255" y1="155" x2="265" y2="145" stroke="#ea580c" strokeWidth="2" />
                    <text x="250" y="185" textAnchor="middle" fontSize="14" fill="#333" fontWeight="bold">R1</text>
                    <text x="250" y="205" textAnchor="middle" fontSize="12" fill="#666">{values.r1}Ω</text>
                </g>

                {/* Light Bulb */}
                <g>
                    <circle
                        cx="600"
                        cy="130"
                        r="20"
                        fill={isBulbOn() ? `rgba(255, 200, 0, ${0.3 + getBulbBrightness() * 0.7})` : 'rgba(200, 200, 200, 0.3)'}
                        stroke={isBulbOn() ? '#ffc800' : '#999'}
                        strokeWidth="2"
                    />
                    <line x1="600" y1="150" x2="600" y2="165" stroke="#666" strokeWidth="2" />
                    <line x1="595" y1="165" x2="605" y2="165" stroke="#666" strokeWidth="2" />
                    <text x="600" y="185" textAnchor="middle" fontSize="12" fill="#333" fontWeight="bold">Bulb</text>
                </g>

                {/* Electron flow animation */}
                {getCurrent() > 0 && (
                    <>
                        <circle
                            cx="150"
                            cy="150"
                            r="5"
                            fill="#fbbf24"
                            opacity="0.8"
                            style={{
                                animation: `flow 3s linear infinite`,
                                animationDelay: '0s',
                            }}
                        />
                        <circle
                            cx="400"
                            cy="200"
                            r="5"
                            fill="#fbbf24"
                            opacity="0.8"
                            style={{
                                animation: `flow 3s linear infinite`,
                                animationDelay: '1s',
                            }}
                        />
                    </>
                )}

                {/* Animation keyframes */}
                <defs>
                    <style>{`
                        @keyframes flow {
                            0% { cx: 100; cy: 150; }
                            25% { cx: 250; cy: 150; }
                            50% { cx: 450; cy: 200; }
                            75% { cx: 600; cy: 150; }
                            100% { cx: 100; cy: 150; }
                        }
                    `}</style>
                </defs>
            </svg>
        );
    };

    return (
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-white p-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
                    What are <span className="text-orange-500">Resistors</span>?
                </h1>
                <p className="text-base md:text-lg text-slate-700 font-bold tracking-wide">
                    Explore How Resistors Control Electric Current Flow
                </p>
            </div>

            {/* Mode Selector - Display ONLY (informational, not interactive for display) */}
            <div className="flex justify-center gap-2 mb-8">
                {(['simple', 'series', 'parallel'] as const).map(m => (
                    <button
                        key={m}
                        disabled
                        className={`px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider transition-all ${
                            mode === m
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'bg-slate-300 text-slate-600 opacity-50'
                        }`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* Main Content - DISPLAY ONLY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Circuit Visualization (100% width on display) */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-200">
                    <div className="border-4 border-blue-300 rounded-xl p-4 bg-blue-50">
                        {renderCircuit()}
                    </div>
                </div>

                {/* Display Values in Cards */}
                <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl shadow-lg p-6 border-2 border-green-300">
                    <div className="text-sm font-bold text-green-700 mb-2 uppercase tracking-wider">Total Resistance</div>
                    <div className="text-4xl font-black text-green-600">{getTotalResistance().toFixed(2)}Ω</div>
                    <div className="text-sm text-green-600 mt-2">R = R₁</div>
                </div>

                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow-lg p-6 border-2 border-blue-300">
                    <div className="text-sm font-bold text-blue-700 mb-2 uppercase tracking-wider">Current</div>
                    <div className="text-4xl font-black text-blue-600">{getCurrent().toFixed(2)}A</div>
                    <div className="text-sm text-blue-600 mt-2">I = V/R</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl shadow-lg p-6 border-2 border-yellow-300">
                    <div className="text-sm font-bold text-yellow-700 mb-2 uppercase tracking-wider">Power</div>
                    <div className="text-4xl font-black text-yellow-600">{getPower().toFixed(2)}W</div>
                    <div className="text-sm text-yellow-600 mt-2">P = V × I</div>
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                <div className="flex gap-4">
                    <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-slate-900 mb-2">How It Works</h3>
                        <p className="text-slate-700 text-sm leading-relaxed">
                            Resistors limit the flow of electric current. In this circuit, the {values.r1}Ω resistor limits current flow from
                            the {values.voltage}V battery. The flowing electrons are shown as animated dots. When enough current flows, the bulb lights up!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResistorDisplay;
