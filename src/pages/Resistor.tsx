import React, { useState, useEffect } from 'react';
import { Zap, Info } from 'lucide-react';

type CircuitMode = 'simple' | 'series' | 'parallel';

interface ResistorValues {
    voltage: number;
    r1: number; // Ohms
    r2: number; // Ohms
}

const ResistorPage = () => {
    const [mode, setMode] = useState<CircuitMode>('simple');
    const [values, setValues] = useState<ResistorValues>({
        voltage: 12,
        r1: 10,
        r2: 20,
    });

    // Calculate total resistance based on mode
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

    // Check if bulb should be on (current threshold of 0.3A)
    const isBulbOn = () => {
        return getCurrent() >= 0.3;
    };

    // Get bulb brightness based on current (0-1), only if bulb is on
    const getBulbBrightness = () => {
        if (!isBulbOn()) return 0;
        const current = getCurrent();
        return Math.min(1, current / 2); // Max brightness at 2A
    };

    // Get electron animation duration based on voltage (higher voltage = faster = shorter duration)
    const getElectronSpeed = () => {
        // Base duration is 5s, decreases with higher voltage (min 1.5s at max voltage)
        const baseDuration = 6;
        const minDuration = 1.5;
        const voltageFactor = values.voltage / 24; // Normalize voltage (max 24V)
        return baseDuration - (baseDuration - minDuration) * voltageFactor;
    };

    const getModeInfo = () => {
        switch (mode) {
            case 'simple':
                return {
                    title: 'Simple Circuit',
                    description: 'A basic circuit with one resistor limiting current flow to the bulb.',
                    formula: 'I = V / R',
                    tip: 'Resistors oppose the flow of electric current.',
                };
            case 'series':
                return {
                    title: 'Series Circuit',
                    description: 'Resistors connected end-to-end. Total resistance adds up.',
                    formula: 'R = R₁ + R₂',
                    tip: 'In series, current is the same through all resistors.',
                };
            case 'parallel':
                return {
                    title: 'Parallel Circuit',
                    description: 'Resistors connected side-by-side with multiple current paths.',
                    formula: '1/R = 1/R₁ + 1/R₂',
                    tip: 'In parallel, voltage is the same across all resistors.',
                };
        }
    };

    const info = getModeInfo();
    const currentValue = getCurrent();
    const bulbOn = isBulbOn();

    return (
        <div className="relative h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #7dd3fc 70%, #38bdf8 100%)' }}>
            {/* Light blue gradient background */}

            {/* Main content */}
            <div className="relative z-10 h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-[95vw] h-[92vh] flex flex-col">
                    {/* Header with title */}
                    <div className="text-center mb-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2">
                            <span className="text-slate-800 drop-shadow-sm">What are </span>
                            <span className="bg-gradient-to-r from-[#ef4444] via-[#f97316] to-[#eab308] bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(239,68,68,0.6)]">Resistors</span>
                            <span className="text-slate-800 drop-shadow-sm">?</span>
                        </h1>
                        <p className="text-base md:text-lg text-slate-700 font-bold tracking-wide">Explore How Resistors Control Electric Current Flow</p>
                    </div>

                    {/* Mode selector tabs */}
                    <div className="flex justify-center mb-3">
                        <div className="inline-flex rounded-xl bg-slate-400/60 backdrop-blur-xl p-1 shadow-lg">
                            <button
                                onClick={() => setMode('simple')}
                                className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${mode === 'simple'
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                                    : 'text-white/80 hover:text-white'
                                    }`}
                            >
                                SIMPLE
                            </button>
                            <button
                                onClick={() => setMode('series')}
                                className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${mode === 'series'
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                                    : 'text-white/80 hover:text-white'
                                    }`}
                            >
                                SERIES
                            </button>
                            <button
                                onClick={() => setMode('parallel')}
                                className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${mode === 'parallel'
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                                    : 'text-white/80 hover:text-white'
                                    }`}
                            >
                                PARALLEL
                            </button>
                        </div>
                    </div>

                    {/* Main circuit display card */}
                    <div className="relative flex-1 rounded-3xl border-2 border-slate-300 p-4 overflow-hidden" style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.98) 100%)',
                        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.1)'
                    }}>
                        {/* Layout: Circuit (60%), Controls (40%) */}
                        <div className="flex gap-4 h-full">
                            {/* Left: Circuit Display (60%) */}
                            <div className="flex-[60] relative rounded-2xl border-2 border-sky-300 bg-gradient-to-br from-sky-100/80 to-blue-100/90 backdrop-blur-md overflow-hidden shadow-lg">
                                {/* Info box in top-left corner */}
                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-md border border-slate-200 max-w-[280px] z-10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                                            <Zap className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-sm font-bold text-red-500">{info.title}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">{info.description}</p>
                                </div>

                                {/* Resistor Circuit Canvas */}
                                <ResistorCircuitCanvas
                                    mode={mode}
                                    values={values}
                                    bulbOn={bulbOn}
                                    bulbBrightness={getBulbBrightness()}
                                    electronSpeed={getElectronSpeed()}
                                />
                            </div>

                            {/* Right: Controls & Info (40%) */}
                            <div className="flex-[40] flex flex-col gap-2 h-full overflow-hidden">
                                {/* Controls Panel */}
                                <div className="bg-white/95 backdrop-blur-xl rounded-xl border-2 border-slate-200 p-4 shadow-lg flex-shrink-0">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-white" />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-700 tracking-[0.15em] uppercase">CONTROLS</h3>
                                    </div>

                                    {/* Value Controls */}
                                    <ResistorValuesPanel
                                        mode={mode}
                                        values={values}
                                        onValuesChange={setValues}
                                        totalResistance={getTotalResistance()}
                                        current={currentValue}
                                        power={getPower()}
                                    />
                                </div>

                                {/* Info Panel */}
                                <div className="bg-white/95 backdrop-blur-xl rounded-xl border-2 border-slate-200 p-4 shadow-lg flex-shrink-0">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                            <Info className="w-3 h-3 text-white" />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-700 tracking-[0.15em] uppercase">CIRCUIT BASICS</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
                                            <h4 className="text-xs font-bold text-slate-500 mb-1 tracking-wide uppercase">Formula</h4>
                                            <div className="text-2xl font-serif text-slate-800 font-bold italic tracking-wide">
                                                I = V / R
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Resistor Values Panel Component
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
        <div className="space-y-2">
            {/* Voltage Control */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Voltage</span>
                <div className="flex items-center gap-1 rounded-lg border-2 px-2 py-1 bg-purple-50 border-purple-200">
                    <button
                        onClick={() => onValuesChange({ ...values, voltage: Math.max(1, values.voltage - 1) })}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-purple-100 text-purple-600 transition-colors font-bold"
                        type="button"
                    >−</button>
                    <span className="text-sm font-bold w-12 text-center text-purple-600">{values.voltage}V</span>
                    <button
                        onClick={() => onValuesChange({ ...values, voltage: Math.min(24, values.voltage + 1) })}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-purple-100 text-purple-600 transition-colors font-bold"
                        type="button"
                    >+</button>
                </div>
            </div>

            {/* R1 Control */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">R1</span>
                <div className="flex items-center gap-1 rounded-lg border-2 px-2 py-1 bg-red-50 border-red-200">
                    <button
                        onClick={() => onValuesChange({ ...values, r1: Math.max(1, values.r1 - 1) })}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-100 text-red-600 transition-colors font-bold"
                        type="button"
                    >−</button>
                    <span className="text-sm font-bold w-12 text-center text-red-600">{values.r1}Ω</span>
                    <button
                        onClick={() => onValuesChange({ ...values, r1: Math.min(100, values.r1 + 1) })}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-100 text-red-600 transition-colors font-bold"
                        type="button"
                    >+</button>
                </div>
            </div>

            {/* R2 Control */}
            <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${mode === 'simple' ? 'text-slate-300' : 'text-slate-600'}`}>R2</span>
                <div className={`flex items-center gap-1 rounded-lg border-2 px-2 py-1 ${mode === 'simple' ? 'bg-slate-50 border-slate-200 opacity-50' : 'bg-orange-50 border-orange-200'}`}>
                    <button
                        onClick={() => onValuesChange({ ...values, r2: Math.max(1, values.r2 - 1) })}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors font-bold ${mode === 'simple' ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-orange-100 text-orange-600'}`}
                        type="button"
                        disabled={mode === 'simple'}
                    >−</button>
                    <span className={`text-sm font-bold w-12 text-center ${mode === 'simple' ? 'text-slate-300' : 'text-orange-600'}`}>{values.r2}Ω</span>
                    <button
                        onClick={() => onValuesChange({ ...values, r2: Math.min(100, values.r2 + 1) })}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors font-bold ${mode === 'simple' ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-orange-100 text-orange-600'}`}
                        type="button"
                        disabled={mode === 'simple'}
                    >+</button>
                </div>
            </div>

            {/* Computed Values */}
            <div className="pt-2 mt-2 border-t border-slate-200 space-y-2">
                {/* Total R */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border-l-4 border-green-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-sm font-bold text-slate-700">Total R:</span>
                            <p className="text-[10px] text-slate-400 font-medium">
                                {mode === 'simple' ? 'R = R₁' : mode === 'series' ? 'R = R₁ + R₂' : '1/R = 1/R₁ + 1/R₂'}
                            </p>
                        </div>
                        <span className="font-black text-xl text-green-600">{totalResistance.toFixed(1)}Ω</span>
                    </div>
                </div>

                {/* Current */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border-l-4 border-blue-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-sm font-bold text-slate-700">Current:</span>
                            <p className="text-[10px] text-slate-400 font-medium">I = V/R</p>
                        </div>
                        <span className="font-black text-xl text-blue-600">{current.toFixed(1)}A</span>
                    </div>
                </div>

                {/* Power */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-3 border-l-4 border-yellow-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-sm font-bold text-slate-700">Power:</span>
                            <p className="text-[10px] text-slate-400 font-medium">P = V × I</p>
                        </div>
                        <span className="font-black text-xl text-yellow-600">{power.toFixed(1)}W</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Resistor Circuit Canvas Component
interface ResistorCircuitCanvasProps {
    mode: CircuitMode;
    values: ResistorValues;
    bulbOn: boolean;
    bulbBrightness: number;
    electronSpeed: number;
}

function ResistorCircuitCanvas({ mode, values, bulbOn, bulbBrightness, electronSpeed }: ResistorCircuitCanvasProps) {
    const wireColor = '#3b82f6'; // Blue wire color

    // Draw zigzag resistor symbol with colored bands
    const renderResistor = (x: number, y: number, label: string, ohmValue: number) => (
        <g transform={`translate(${x}, ${y})`}>
            {/* Resistor body background - cream/beige color */}
            <rect x="8" y="-15" width="48" height="30" rx="4" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />

            {/* Color bands on resistor */}
            <rect x="14" y="-15" width="6" height="30" fill="#ef4444" />
            <rect x="24" y="-15" width="6" height="30" fill="#f97316" />
            <rect x="34" y="-15" width="6" height="30" fill="#eab308" />
            <rect x="44" y="-15" width="6" height="30" fill="#84cc16" />

            {/* Wire leads */}
            <line x1="0" y1="0" x2="8" y2="0" stroke="#374151" strokeWidth="3" />
            <line x1="56" y1="0" x2="64" y2="0" stroke="#374151" strokeWidth="3" />

            {/* Label above */}
            <text x="32" y="-28" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">{label}</text>
            {/* Value below */}
            <text x="32" y="35" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="bold">{ohmValue}Ω</text>
        </g>
    );

    // Render glowing bulb
    const renderBulb = (cx: number, cy: number, brightness: number, isOn: boolean) => (
        <g transform={`translate(${cx}, ${cy})`}>
            {/* Glow effect - only when on */}
            {isOn && brightness > 0 && (
                <>
                    <circle cx="0" cy="0" r="40" fill={`rgba(253, 224, 71, ${brightness * 0.2})`} />
                    <circle cx="0" cy="0" r="32" fill={`rgba(253, 224, 71, ${brightness * 0.4})`} />
                    <circle cx="0" cy="0" r="25" fill={`rgba(253, 224, 71, ${brightness * 0.6})`} />
                </>
            )}
            {/* Bulb glass */}
            <circle
                cx="0"
                cy="0"
                r="20"
                fill={isOn ? `rgba(253, 224, 71, ${0.6 + brightness * 0.4})` : '#e5e7eb'}
                stroke="#94a3b8"
                strokeWidth="2"
            />
            {/* Filament */}
            <path
                d="M-6 5 Q-3 -5 0 5 Q3 -5 6 5"
                fill="none"
                stroke={isOn ? '#f59e0b' : '#9ca3af'}
                strokeWidth="2"
            />
            {/* Base */}
            <rect x="-10" y="18" width="20" height="12" rx="2" fill="#6b7280" stroke="#4b5563" strokeWidth="1" />
            {/* Label */}
            <text x="0" y="50" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="bold">Bulb</text>
        </g>
    );

    // Render electrons with dynamic speed based on voltage
    const renderElectrons = (pathPoints: string[], numElectrons: number, duration: number) => {
        if (!bulbOn) return null; // No electrons flow when bulb is off (very low current)

        return (
            <>
                {Array.from({ length: numElectrons }).map((_, i) => (
                    <g key={i} filter="url(#electronGlow)">
                        <circle r="5" fill="#60a5fa">
                            <animate
                                attributeName="cx"
                                values={pathPoints[0]}
                                dur={`${duration}s`}
                                begin={`${i * duration / numElectrons}s`}
                                repeatCount="indefinite"
                            />
                            <animate
                                attributeName="cy"
                                values={pathPoints[1]}
                                dur={`${duration}s`}
                                begin={`${i * duration / numElectrons}s`}
                                repeatCount="indefinite"
                            />
                        </circle>
                        <circle r="2" fill="#dbeafe">
                            <animate
                                attributeName="cx"
                                values={pathPoints[0]}
                                dur={`${duration}s`}
                                begin={`${i * duration / numElectrons}s`}
                                repeatCount="indefinite"
                            />
                            <animate
                                attributeName="cy"
                                values={pathPoints[1]}
                                dur={`${duration}s`}
                                begin={`${i * duration / numElectrons}s`}
                                repeatCount="indefinite"
                            />
                        </circle>
                    </g>
                ))}
            </>
        );
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <svg viewBox="0 0 520 350" className="w-full h-full max-h-[400px]" preserveAspectRatio="xMidYMid meet">
                <defs>
                    {/* Glow filter for electrons */}
                    <filter id="electronGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Battery - Left side vertical */}
                <g transform="translate(60, 110)">
                    {/* Battery body */}
                    <rect x="0" y="0" width="40" height="80" rx="6" fill="#1f2937" stroke="#111827" strokeWidth="2" />
                    {/* Battery cap (top terminal) */}
                    <rect x="12" y="-6" width="16" height="8" rx="2" fill="#374151" stroke="#1f2937" strokeWidth="1" />
                    {/* Red positive indicator */}
                    <rect x="5" y="5" width="30" height="25" rx="3" fill="#dc2626" />
                    {/* Positive terminal symbol */}
                    <text x="20" y="23" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">+</text>
                    {/* Blue negative indicator */}
                    <rect x="5" y="50" width="30" height="25" rx="3" fill="#2563eb" />
                    {/* Negative terminal symbol */}
                    <text x="20" y="68" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">−</text>
                    {/* Voltage display */}
                    <rect x="-5" y="32" width="50" height="16" rx="2" fill="#0d9488" />
                    <text x="20" y="44" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{values.voltage}V</text>
                    {/* Label */}
                    <text x="20" y="105" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="bold">Battery</text>
                </g>

                {/* SIMPLE MODE */}
                {mode === 'simple' && (
                    <>
                        {/* Top wire: Battery + to resistor */}
                        <line x1="80" y1="104" x2="80" y2="70" stroke={wireColor} strokeWidth="4" />
                        <line x1="80" y1="70" x2="200" y2="70" stroke={wireColor} strokeWidth="4" />

                        {/* Resistor R1 */}
                        {renderResistor(200, 70, 'R1', values.r1)}

                        {/* Wire from resistor to bulb */}
                        <line x1="264" y1="70" x2="380" y2="70" stroke={wireColor} strokeWidth="4" />

                        {/* Bulb */}
                        {renderBulb(420, 70, bulbBrightness, bulbOn)}

                        {/* Wire from bulb down and back */}
                        <line x1="440" y1="70" x2="460" y2="70" stroke={wireColor} strokeWidth="4" />
                        <line x1="460" y1="70" x2="460" y2="250" stroke={wireColor} strokeWidth="4" />
                        <line x1="460" y1="250" x2="80" y2="250" stroke={wireColor} strokeWidth="4" />
                        <line x1="80" y1="250" x2="80" y2="190" stroke={wireColor} strokeWidth="4" />

                        {/* Animated electrons - flowing around the circuit */}
                        {renderElectrons(
                            [
                                "80;80;200;264;380;440;460;460;80;80",
                                "190;70;70;70;70;70;70;250;250;190"
                            ],
                            6,
                            electronSpeed
                        )}
                    </>
                )}

                {/* SERIES MODE */}
                {mode === 'series' && (
                    <>
                        {/* Top wire: Battery + going up and right */}
                        <line x1="80" y1="104" x2="80" y2="70" stroke={wireColor} strokeWidth="4" />
                        <line x1="80" y1="70" x2="140" y2="70" stroke={wireColor} strokeWidth="4" />

                        {/* R1 */}
                        {renderResistor(140, 70, 'R1', values.r1)}

                        {/* Wire between R1 and R2 */}
                        <line x1="204" y1="70" x2="250" y2="70" stroke={wireColor} strokeWidth="4" />

                        {/* R2 */}
                        {renderResistor(250, 70, 'R2', values.r2)}

                        {/* Wire to bulb */}
                        <line x1="314" y1="70" x2="380" y2="70" stroke={wireColor} strokeWidth="4" />

                        {/* Bulb */}
                        {renderBulb(420, 70, bulbBrightness, bulbOn)}

                        {/* Wire back to battery */}
                        <line x1="440" y1="70" x2="460" y2="70" stroke={wireColor} strokeWidth="4" />
                        <line x1="460" y1="70" x2="460" y2="250" stroke={wireColor} strokeWidth="4" />
                        <line x1="460" y1="250" x2="80" y2="250" stroke={wireColor} strokeWidth="4" />
                        <line x1="80" y1="250" x2="80" y2="190" stroke={wireColor} strokeWidth="4" />

                        {/* Animated electrons */}
                        {renderElectrons(
                            [
                                "80;80;140;204;250;314;380;440;460;460;80;80",
                                "190;70;70;70;70;70;70;70;70;250;250;190"
                            ],
                            5,
                            electronSpeed * 1.2 // Slightly slower for series (more resistance)
                        )}
                    </>
                )}

                {/* PARALLEL MODE */}
                {mode === 'parallel' && (
                    <>
                        {/* Wire from battery + going up */}
                        <line x1="80" y1="104" x2="80" y2="70" stroke={wireColor} strokeWidth="4" />
                        <line x1="80" y1="70" x2="160" y2="70" stroke={wireColor} strokeWidth="4" />

                        {/* Split point */}
                        <circle cx="160" cy="70" r="4" fill={wireColor} />

                        {/* Upper branch - R1 */}
                        <line x1="160" y1="70" x2="160" y2="40" stroke={wireColor} strokeWidth="4" />
                        <line x1="160" y1="40" x2="180" y2="40" stroke={wireColor} strokeWidth="4" />
                        {renderResistor(180, 40, 'R1', values.r1)}
                        <line x1="244" y1="40" x2="280" y2="40" stroke={wireColor} strokeWidth="4" />
                        <line x1="280" y1="40" x2="280" y2="70" stroke={wireColor} strokeWidth="4" />

                        {/* Lower branch - R2 */}
                        <line x1="160" y1="70" x2="160" y2="120" stroke={wireColor} strokeWidth="4" />
                        <line x1="160" y1="120" x2="180" y2="120" stroke={wireColor} strokeWidth="4" />
                        {renderResistor(180, 120, 'R2', values.r2)}
                        <line x1="244" y1="120" x2="280" y2="120" stroke={wireColor} strokeWidth="4" />
                        <line x1="280" y1="120" x2="280" y2="70" stroke={wireColor} strokeWidth="4" />

                        {/* Merge point */}
                        <circle cx="280" cy="70" r="4" fill={wireColor} />

                        {/* Wire to bulb */}
                        <line x1="280" y1="70" x2="360" y2="70" stroke={wireColor} strokeWidth="4" />

                        {/* Bulb */}
                        {renderBulb(400, 70, bulbBrightness, bulbOn)}

                        {/* Wire back to battery */}
                        <line x1="420" y1="70" x2="460" y2="70" stroke={wireColor} strokeWidth="4" />
                        <line x1="460" y1="70" x2="460" y2="250" stroke={wireColor} strokeWidth="4" />
                        <line x1="460" y1="250" x2="80" y2="250" stroke={wireColor} strokeWidth="4" />
                        <line x1="80" y1="250" x2="80" y2="190" stroke={wireColor} strokeWidth="4" />

                        {/* Animated electrons - upper branch */}
                        {bulbOn && (
                            <>
                                {[0, 1].map((i) => (
                                    <g key={`upper-${i}`} filter="url(#electronGlow)">
                                        <circle r="5" fill="#60a5fa">
                                            <animate
                                                attributeName="cx"
                                                values="160;160;180;244;280;280"
                                                dur={`${electronSpeed * 0.8}s`}
                                                begin={`${i * electronSpeed * 0.4}s`}
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="cy"
                                                values="70;40;40;40;40;70"
                                                dur={`${electronSpeed * 0.8}s`}
                                                begin={`${i * electronSpeed * 0.4}s`}
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                        <circle r="2" fill="#dbeafe">
                                            <animate
                                                attributeName="cx"
                                                values="160;160;180;244;280;280"
                                                dur={`${electronSpeed * 0.8}s`}
                                                begin={`${i * electronSpeed * 0.4}s`}
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="cy"
                                                values="70;40;40;40;40;70"
                                                dur={`${electronSpeed * 0.8}s`}
                                                begin={`${i * electronSpeed * 0.4}s`}
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                    </g>
                                ))}
                                {/* Lower branch electrons */}
                                {[0, 1].map((i) => (
                                    <g key={`lower-${i}`} filter="url(#electronGlow)">
                                        <circle r="5" fill="#60a5fa">
                                            <animate
                                                attributeName="cx"
                                                values="160;160;180;244;280;280"
                                                dur={`${electronSpeed * 0.8}s`}
                                                begin={`${i * electronSpeed * 0.4 + 0.3}s`}
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="cy"
                                                values="70;120;120;120;120;70"
                                                dur={`${electronSpeed * 0.8}s`}
                                                begin={`${i * electronSpeed * 0.4 + 0.3}s`}
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                        <circle r="2" fill="#dbeafe">
                                            <animate
                                                attributeName="cx"
                                                values="160;160;180;244;280;280"
                                                dur={`${electronSpeed * 0.8}s`}
                                                begin={`${i * electronSpeed * 0.4 + 0.3}s`}
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="cy"
                                                values="70;120;120;120;120;70"
                                                dur={`${electronSpeed * 0.8}s`}
                                                begin={`${i * electronSpeed * 0.4 + 0.3}s`}
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                    </g>
                                ))}
                                {/* Main circuit electrons */}
                                {[0, 1, 2].map((i) => (
                                    <g key={`main-${i}`} filter="url(#electronGlow)">
                                        <circle r="5" fill="#60a5fa">
                                            <animate
                                                attributeName="cx"
                                                values="80;80;160;280;360;420;460;460;80;80"
                                                dur={`${electronSpeed}s`}
                                                begin={`${i * electronSpeed / 3}s`}
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="cy"
                                                values="190;70;70;70;70;70;70;250;250;190"
                                                dur={`${electronSpeed}s`}
                                                begin={`${i * electronSpeed / 3}s`}
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                        <circle r="2" fill="#dbeafe">
                                            <animate
                                                attributeName="cx"
                                                values="80;80;160;280;360;420;460;460;80;80"
                                                dur={`${electronSpeed}s`}
                                                begin={`${i * electronSpeed / 3}s`}
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="cy"
                                                values="190;70;70;70;70;70;70;250;250;190"
                                                dur={`${electronSpeed}s`}
                                                begin={`${i * electronSpeed / 3}s`}
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                    </g>
                                ))}
                            </>
                        )}
                    </>
                )}
            </svg>
        </div>
    );
}

export default ResistorPage;
