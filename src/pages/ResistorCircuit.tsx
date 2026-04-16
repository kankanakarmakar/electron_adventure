import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { io } from 'socket.io-client';

// Socket connection
const socket = io('http://localhost:3002/resistor');

type CircuitMode = 'simple' | 'series' | 'parallel';

interface ResistorValues {
    voltage: number;
    r1: number; // Ohms
    r2: number; // Ohms
}

const ResistorCircuit = () => {
    const [mode, setMode] = useState<CircuitMode>('simple');
    const [values, setValues] = useState<ResistorValues>({
        voltage: 12,
        r1: 10,
        r2: 20,
    });
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Circuit connected to socket server');
            setConnected(true);
        });

        socket.on('initialState', (state: any) => {
            if (state.mode) setMode(state.mode);
            if (state.values) setValues(state.values);
        });

        socket.on('stateUpdated', (state: any) => {
            if (state.mode) setMode(state.mode);
            if (state.values) setValues(state.values);
        });

        return () => {
            socket.off('connect');
            socket.off('initialState');
            socket.off('stateUpdated');
        };
    }, []);

    // Derived values for visualization
    const getTotalResistance = () => {
        switch (mode) {
            case 'simple': return values.r1;
            case 'series': return values.r1 + values.r2;
            case 'parallel': return (values.r1 * values.r2) / (values.r1 + values.r2);
        }
    };

    const getCurrent = () => {
        const R = getTotalResistance();
        return R > 0 ? values.voltage / R : 0;
    };

    const isBulbOn = () => getCurrent() >= 0.3;

    const getBulbBrightness = () => {
        if (!isBulbOn()) return 0;
        const current = getCurrent();
        return Math.min(1, current / 2);
    };

    const getElectronSpeed = () => {
        const baseDuration = 6;
        const minDuration = 1.5;
        const voltageFactor = values.voltage / 24;
        return baseDuration - (baseDuration - minDuration) * voltageFactor;
    };

    const getModeInfo = () => {
        switch (mode) {
            case 'simple':
                return {
                    title: 'Simple Circuit',
                    description: 'A basic circuit with one resistor limiting current flow to the bulb.',
                };
            case 'series':
                return {
                    title: 'Series Circuit',
                    description: 'Resistors connected end-to-end. Total resistance adds up.',
                };
            case 'parallel':
                return {
                    title: 'Parallel Circuit',
                    description: 'Resistors connected side-by-side with multiple current paths.',
                };
        }
    };

    const info = getModeInfo();
    const bulbOn = isBulbOn();

    return (
        <div className="h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-slate-100 relative overflow-hidden flex items-center justify-center p-8">
            {/* Main Card Container */}
            <div className="w-full max-w-5xl h-[90vh] bg-white/70 backdrop-blur-sm rounded-[2.5rem] shadow-2xl border border-white/50 relative overflow-hidden">

                {/* Info overlay - Inside Card */}
                {/* Info overlay - Inside Card - Dynamic Standardized */}
                <div className="absolute top-6 left-6 z-30 bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-cyan-200/50 max-w-md transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-400/30">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{info.title}</h2>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {bulbOn ? 'Circuit Active' : 'Low Current / Inactive'}
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{info.description}</p>

                    {/* Live Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-100 rounded-lg p-2 text-center">
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Res.</div>
                            <div className="text-sm font-bold text-slate-800">{getTotalResistance().toFixed(1)}Ω</div>
                        </div>
                        <div className="bg-slate-100 rounded-lg p-2 text-center">
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Current</div>
                            <div className={`text-sm font-bold ${getCurrent() > 0.5 ? 'text-blue-600' : 'text-slate-600'}`}>
                                {getCurrent().toFixed(2)}A
                            </div>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-2 text-center">
                            <div className="text-[10px] text-cyan-400 font-bold uppercase">Power</div>
                            <div className="text-sm font-bold text-white">{(values.voltage * getCurrent()).toFixed(1)}W</div>
                        </div>
                    </div>
                </div>

                {/* Main Circuit Canvas - Positioned Lower */}
                <div className="absolute inset-0 z-10 flex items-end justify-center pb-8 pt-20">
                    {/* Background Grid - Dark Dots for Light Mode */}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#64748b33_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>

                    <ResistorCircuitCanvas
                        mode={mode}
                        values={values}
                        bulbOn={bulbOn}
                        bulbBrightness={getBulbBrightness()}
                        electronSpeed={getElectronSpeed()}
                    />
                </div>
            </div>
        </div>
    );
};

// Resistor Circuit Canvas Component (Inlined from previous file)
interface ResistorCircuitCanvasProps {
    mode: CircuitMode;
    values: ResistorValues;
    bulbOn: boolean;
    bulbBrightness: number;
    electronSpeed: number;
}

function ResistorCircuitCanvas({ mode, values, bulbOn, bulbBrightness, electronSpeed }: ResistorCircuitCanvasProps) {
    const wireColor = '#22d3ee'; // Cyan-400 for dark mode pop

    // Draw zigzag resistor symbol with colored bands - LARGER SIZE
    const renderResistor = (x: number, y: number, label: string, ohmValue: number) => (
        <g transform={`translate(${x}, ${y})`}>
            {/* Resistor body background - cream/beige color - THINNER and LONGER */}
            <rect x="10" y="-10" width="100" height="20" rx="5" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />

            {/* Color bands on resistor */}
            <rect x="24" y="-10" width="6" height="20" fill="#ef4444" />
            <rect x="44" y="-10" width="6" height="20" fill="#f97316" />
            <rect x="64" y="-10" width="6" height="20" fill="#eab308" />
            <rect x="84" y="-10" width="6" height="20" fill="#84cc16" />

            {/* Wire leads */}
            <line x1="0" y1="0" x2="10" y2="0" stroke="#374151" strokeWidth="3" />
            <line x1="110" y1="0" x2="120" y2="0" stroke="#374151" strokeWidth="3" />

            {/* Label above */}
            <text x="60" y="-24" textAnchor="middle" fill="#1e293b" fontSize="18" fontWeight="bold">{label}</text>
            {/* Value below */}
            <text x="60" y="32" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">{ohmValue}Ω</text>
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
                        <circle r="7" fill="#60a5fa" opacity="0.9">
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
                        <circle r="3" fill="#ffffff" opacity="0.9">
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
        <div className="w-full h-full flex items-center justify-center p-0 z-20 relative">
            <svg viewBox="20 50 480 380" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <filter id="electronGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Battery - Left side vertical - moved down further */}
                <g transform="translate(60, 260)">
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
                    {/* Label - moved to the LEFT of the battery */}
                    <text x="-10" y="40" textAnchor="end" fill="#1e293b" fontSize="14" fontWeight="bold">Battery</text>
                </g>

                {/* SIMPLE MODE - adjusted positions - moved down further */}
                {mode === 'simple' && (
                    <>
                        <line x1="80" y1="254" x2="80" y2="220" stroke={wireColor} strokeWidth="4" />
                        <line x1="80" y1="220" x2="180" y2="220" stroke={wireColor} strokeWidth="4" />
                        {renderResistor(180, 220, 'R1', values.r1)}
                        <line x1="300" y1="220" x2="410" y2="220" stroke={wireColor} strokeWidth="4" />
                        {renderBulb(420, 190, bulbBrightness, bulbOn)}
                        <line x1="430" y1="220" x2="460" y2="220" stroke={wireColor} strokeWidth="4" />
                        <line x1="460" y1="220" x2="460" y2="400" stroke={wireColor} strokeWidth="4" />
                        <line x1="460" y1="400" x2="80" y2="400" stroke={wireColor} strokeWidth="4" />
                        <line x1="80" y1="400" x2="80" y2="340" stroke={wireColor} strokeWidth="4" />
                        {renderElectrons(
                            [
                                "80;80;180;300;410;410;430;460;460;80;80",
                                "340;220;220;220;220;220;220;220;400;400;340"
                            ],
                            12,
                            electronSpeed
                        )}
                    </>
                )}

                {/* SERIES MODE - adjusted positions - moved down further */}
                {mode === 'series' && (
                    <>
                        <line x1="80" y1="254" x2="80" y2="220" stroke={wireColor} strokeWidth="4" />
                        <line x1="80" y1="220" x2="120" y2="220" stroke={wireColor} strokeWidth="4" />
                        {renderResistor(120, 220, 'R1', values.r1)}
                        <line x1="240" y1="220" x2="260" y2="220" stroke={wireColor} strokeWidth="4" />
                        {renderResistor(260, 220, 'R2', values.r2)}
                        <line x1="380" y1="220" x2="410" y2="220" stroke={wireColor} strokeWidth="4" />
                        {renderBulb(420, 190, bulbBrightness, bulbOn)}
                        <line x1="430" y1="220" x2="460" y2="220" stroke={wireColor} strokeWidth="4" />
                        <line x1="460" y1="220" x2="460" y2="400" stroke={wireColor} strokeWidth="4" />
                        <line x1="460" y1="400" x2="80" y2="400" stroke={wireColor} strokeWidth="4" />
                        <line x1="80" y1="400" x2="80" y2="340" stroke={wireColor} strokeWidth="4" />
                        {renderElectrons(
                            [
                                "80;80;120;240;260;380;410;410;430;460;460;80;80",
                                "340;220;220;220;220;220;220;220;220;220;400;400;340"
                            ],
                            10,
                            electronSpeed * 1.2
                        )}
                    </>
                )}

                {/* PARALLEL MODE - compacted vertical spacing */}
                {mode === 'parallel' && (
                    <>
                        <line x1="80" y1="254" x2="80" y2="220" stroke={wireColor} strokeWidth="4" />
                        <line x1="80" y1="220" x2="160" y2="220" stroke={wireColor} strokeWidth="4" />
                        <circle cx="160" cy="220" r="4" fill={wireColor} />

                        {/* Upper branch - R1 (Moved down from 165 to 170) */}
                        <line x1="160" y1="220" x2="160" y2="170" stroke={wireColor} strokeWidth="4" />
                        <line x1="160" y1="170" x2="170" y2="170" stroke={wireColor} strokeWidth="4" />
                        {renderResistor(170, 170, 'R1', values.r1)}
                        <line x1="290" y1="170" x2="300" y2="170" stroke={wireColor} strokeWidth="4" />
                        <line x1="300" y1="170" x2="300" y2="220" stroke={wireColor} strokeWidth="4" />

                        {/* Lower branch - R2 (Moved up from 275 to 270) */}
                        <line x1="160" y1="220" x2="160" y2="270" stroke={wireColor} strokeWidth="4" />
                        <line x1="160" y1="270" x2="170" y2="270" stroke={wireColor} strokeWidth="4" />
                        {renderResistor(170, 270, 'R2', values.r2)}
                        <line x1="290" y1="270" x2="300" y2="270" stroke={wireColor} strokeWidth="4" />
                        <line x1="300" y1="270" x2="300" y2="220" stroke={wireColor} strokeWidth="4" />
                        <circle cx="300" cy="220" r="4" fill={wireColor} />

                        <line x1="300" y1="220" x2="410" y2="220" stroke={wireColor} strokeWidth="4" />
                        {renderBulb(420, 190, bulbBrightness, bulbOn)}
                        <line x1="430" y1="220" x2="460" y2="220" stroke={wireColor} strokeWidth="4" />
                        <line x1="460" y1="220" x2="460" y2="400" stroke={wireColor} strokeWidth="4" />
                        <line x1="460" y1="400" x2="80" y2="400" stroke={wireColor} strokeWidth="4" />
                        <line x1="80" y1="400" x2="80" y2="340" stroke={wireColor} strokeWidth="4" />

                        {bulbOn && (
                            <>
                                {/* Upper Branch Electrons */}
                                {[0, 1, 2].map((i) => (
                                    <g key={`upper-circuit-${i}`} filter="url(#electronGlow)">
                                        <circle r="7" fill="#60a5fa" opacity="0.9">
                                            <animate
                                                attributeName="cx"
                                                values="80;80;160;160;170;290;300;300;410;410;430;460;460;80;80"
                                                dur={`${electronSpeed * 1.5}s`}
                                                begin={`${i * electronSpeed * 0.5}s`}
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="cy"
                                                values="340;220;220;170;170;170;170;220;220;220;220;220;400;400;340"
                                                dur={`${electronSpeed * 1.5}s`}
                                                begin={`${i * electronSpeed * 0.5}s`}
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                        <circle r="3" fill="#ffffff" opacity="0.9">
                                            <animate
                                                attributeName="cx"
                                                values="80;80;160;160;170;290;300;300;410;410;430;460;460;80;80"
                                                dur={`${electronSpeed * 1.5}s`}
                                                begin={`${i * electronSpeed * 0.5}s`}
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="cy"
                                                values="340;220;220;170;170;170;170;220;220;220;220;220;400;400;340"
                                                dur={`${electronSpeed * 1.5}s`}
                                                begin={`${i * electronSpeed * 0.5}s`}
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                    </g>
                                ))}
                                {/* Lower Branch Electrons */}
                                {[0, 1, 2].map((i) => (
                                    <g key={`lower-circuit-${i}`} filter="url(#electronGlow)">
                                        <circle r="7" fill="#60a5fa" opacity="0.9">
                                            <animate
                                                attributeName="cx"
                                                values="80;80;160;160;170;290;300;300;410;410;430;460;460;80;80"
                                                dur={`${electronSpeed * 1.5}s`}
                                                begin={`${i * electronSpeed * 0.5 + 0.25}s`}
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="cy"
                                                values="340;220;220;270;270;270;270;220;220;220;220;220;400;400;340"
                                                dur={`${electronSpeed * 1.5}s`}
                                                begin={`${i * electronSpeed * 0.5 + 0.25}s`}
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                        <circle r="3" fill="#ffffff" opacity="0.9">
                                            <animate
                                                attributeName="cx"
                                                values="80;80;160;160;170;290;300;300;410;410;430;460;460;80;80"
                                                dur={`${electronSpeed * 1.5}s`}
                                                begin={`${i * electronSpeed * 0.5 + 0.25}s`}
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="cy"
                                                values="340;220;220;270;270;270;270;220;220;220;220;220;400;400;340"
                                                dur={`${electronSpeed * 1.5}s`}
                                                begin={`${i * electronSpeed * 0.5 + 0.25}s`}
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

export default ResistorCircuit;
