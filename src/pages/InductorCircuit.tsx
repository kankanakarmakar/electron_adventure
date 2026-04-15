import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Zap } from 'lucide-react';

// Socket connection
const socket = io('http://localhost:3002/inductor');

type CircuitMode = 'simple' | 'series' | 'parallel';

interface InductorValues {
    voltage: number;
    l1: number; // mH
    l2: number; // mH
    currentRate: number; // A/s
}

const InductorCircuit: React.FC = () => {
    const [mode, setMode] = useState<CircuitMode>('simple');
    const [values, setValues] = useState<InductorValues>({
        voltage: 12,
        l1: 10,
        l2: 20,
        currentRate: 5,
    });
    const [currentDirection, setCurrentDirection] = useState<'forward' | 'reverse'>('forward');
    const [currentOn, setCurrentOn] = useState(true);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        socket.on('initialState', (state: any) => {
            if (state) {
                setMode(state.mode);
                setValues(state.values);
                setCurrentDirection(state.currentDirection);
                setCurrentOn(state.currentOn ?? true);
            }
        });

        socket.on('stateUpdated', (state: any) => {
            if (state) {
                setMode(state.mode);
                setValues(state.values);
                setCurrentDirection(state.currentDirection);
                setCurrentOn(state.currentOn ?? true);
            }
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('initialState');
            socket.off('stateUpdated');
        };
    }, []);

    const getModeInfo = () => {
        switch (mode) {
            case 'simple':
                return {
                    title: 'Simple Circuit',
                    description: 'A basic circuit with one inductor that stores energy in a magnetic field.',
                };
            case 'series':
                return {
                    title: 'Series Circuit',
                    description: 'Inductors connected end-to-end. Total inductance adds up.',
                };
            case 'parallel':
                return {
                    title: 'Parallel Circuit',
                    description: 'Inductors connected side-by-side. Magnetic fields combine differently.',
                };
        }
    };

    const info = getModeInfo();

    return (
        <div className="h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-slate-100 relative overflow-hidden flex items-center justify-center p-8">
            {/* Main Card Container */}
            <div className="w-full max-w-5xl h-[90vh] bg-white/70 backdrop-blur-sm rounded-[2.5rem] shadow-2xl border border-white/50 relative overflow-hidden">

                {/* Info overlay - Inside Card */}
                {/* Dynamic Info Overlay - Standardized Style */}
                <div className="absolute top-6 left-6 z-30 bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-cyan-200/50 max-w-md transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors duration-500 flex-shrink-0 ${currentOn ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/30' : 'bg-slate-200'}`}>
                            <Zap className={`w-6 h-6 ${currentOn ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{info.title}</h2>
                            <div className={`text-xs font-bold uppercase tracking-wider ${currentOn ? 'text-indigo-600' : 'text-slate-500'}`}>
                                {currentOn ? `Field Building · ${currentDirection}` : 'Inactive'}
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{info.description}</p>

                    {/* Live Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-100 rounded-lg p-2 text-center flex items-center justify-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${currentOn ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></div>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{currentOn ? 'ACTIVE' : 'OFF'}</span>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-2 text-center">
                            <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Energy</div>
                            <div className="text-sm font-bold text-white">
                                {currentOn ? (0.5 * (mode === 'simple' ? values.l1 : values.l1 + values.l2) * 0.1).toFixed(2) : '0.00'} mJ
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Circuit Canvas - Positioned Lower - No Borders */}
                <div className="absolute inset-0 z-10 flex items-end justify-center pb-8 pt-20">
                    {/* Background Grid - Dark Dots for Light Mode */}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#64748b33_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>

                    <InductorCircuitCanvas
                        mode={mode}
                        values={values}
                        currentOn={currentOn}
                        currentDirection={currentDirection}
                    />
                </div>
            </div>
        </div>
    );
};

// Inductor Circuit Canvas Component
interface InductorCircuitCanvasProps {
    mode: CircuitMode;
    values: InductorValues;
    currentOn: boolean;
    currentDirection: 'forward' | 'reverse';
}

function InductorCircuitCanvas({ mode, values, currentOn, currentDirection }: InductorCircuitCanvasProps) {
    const [fieldStrength, setFieldStrength] = useState(0);

    // Animate field growth when current is on
    useEffect(() => {
        if (currentOn) {
            const interval = setInterval(() => {
                setFieldStrength(prev => Math.min(100, prev + 2));
            }, 50);
            return () => clearInterval(interval);
        } else {
            setFieldStrength(0);
        }
    }, [currentOn]);

    const wireColor = '#60a5fa'; // Blue-400

    return (
        <div className="w-full h-full flex items-center justify-center pt-40 pb-8 z-20 relative">
            <style>{`
                @keyframes spin-forward {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes spin-reverse {
                  from { transform: rotate(360deg); }
                  to { transform: rotate(0deg); }
                }
              `}</style>
            <svg viewBox="0 -50 480 380" className="w-[95%] h-auto max-h-[80vh]" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="inductorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>

                {/* Magnetic field rings - ANIMATED */}
                {currentOn && mode === 'simple' && (
                    <>
                        {Array.from({ length: Math.min(Math.ceil(values.l1 / 15), 5) + 1 }, (_, i) => i + 1).map((ring) => (
                            <ellipse
                                key={ring}
                                cx="260"
                                cy="70"
                                rx={30 + ring * Math.min(16 + values.l1 / 12, 22) * (fieldStrength / 100)}
                                ry={18 + ring * Math.min(10 + values.l1 / 18, 14) * (fieldStrength / 100)}
                                fill="none"
                                stroke="url(#inductorGradient)"
                                strokeWidth={1.5 + values.l1 / 60}
                                opacity={(fieldStrength / 130) * (0.45 + values.l1 / 120)}
                                style={{
                                    transformOrigin: '260px 70px',
                                    animation: currentDirection === 'reverse'
                                        ? `spin-reverse ${3 + ring}s linear infinite`
                                        : `spin-forward ${3 + ring}s linear infinite`
                                }}
                            />
                        ))}
                    </>
                )}

                {/* SERIES FIELD */}
                {currentOn && mode === 'series' && (
                    <>
                        {[1, 2, 3].map((ring) => (
                            <ellipse
                                key={`l1-${ring}`}
                                cx="182"
                                cy="70"
                                rx={35 + ring * 18 * (fieldStrength / 100)}
                                ry={22 + ring * 12 * (fieldStrength / 100)}
                                fill="none"
                                stroke="url(#inductorGradient)"
                                strokeWidth="1.5"
                                opacity={fieldStrength / 160}
                                style={{
                                    transformOrigin: '182px 70px',
                                    animation: currentDirection === 'reverse'
                                        ? `spin-reverse ${3 + ring}s linear infinite`
                                        : `spin-forward ${3 + ring}s linear infinite`
                                }}
                            />
                        ))}
                        {[1, 2, 3].map((ring) => (
                            <ellipse
                                key={`l2-${ring}`}
                                cx="312"
                                cy="70"
                                rx={35 + ring * 18 * (fieldStrength / 100)}
                                ry={22 + ring * 12 * (fieldStrength / 100)}
                                fill="none"
                                stroke="url(#inductorGradient)"
                                strokeWidth="1.5"
                                opacity={fieldStrength / 160}
                                style={{
                                    transformOrigin: '312px 70px',
                                    animation: currentDirection === 'reverse'
                                        ? `spin-reverse ${3 + ring}s linear infinite`
                                        : `spin-forward ${3 + ring}s linear infinite`
                                }}
                            />
                        ))}
                    </>
                )}

                {/* PARALLEL FIELD - positioned around L1 at (282, 40) and L2 at (282, 120) */}
                {currentOn && mode === 'parallel' && (
                    <>
                        {/* L1 Magnetic field (upper branch) */}
                        {[1, 2, 3].map((ring) => (
                            <ellipse
                                key={`l1-${ring}`}
                                cx="282"
                                cy="40"
                                rx={35 + ring * 18 * (fieldStrength / 100)}
                                ry={20 + ring * 10 * (fieldStrength / 100)}
                                fill="none"
                                stroke="url(#inductorGradient)"
                                strokeWidth="1.5"
                                opacity={fieldStrength / 160}
                                style={{
                                    transformOrigin: '282px 40px',
                                    animation: currentDirection === 'reverse'
                                        ? `spin-reverse ${3 + ring}s linear infinite`
                                        : `spin-forward ${3 + ring}s linear infinite`
                                }}
                            />
                        ))}
                        {/* L2 Magnetic field (lower branch) */}
                        {[1, 2, 3].map((ring) => (
                            <ellipse
                                key={`l2-${ring}`}
                                cx="282"
                                cy="120"
                                rx={35 + ring * 18 * (fieldStrength / 100)}
                                ry={20 + ring * 10 * (fieldStrength / 100)}
                                fill="none"
                                stroke="url(#inductorGradient)"
                                strokeWidth="1.5"
                                opacity={fieldStrength / 160}
                                style={{
                                    transformOrigin: '282px 120px',
                                    animation: currentDirection === 'reverse'
                                        ? `spin-reverse ${3 + ring}s linear infinite`
                                        : `spin-forward ${3 + ring}s linear infinite`
                                }}
                            />
                        ))}
                    </>
                )}

                {/* Battery - only for simple and series modes (parallel has its own) */}
                {(mode === 'simple' || mode === 'series') && (
                    <g transform="translate(40, 100)">
                        <rect x="0" y="0" width="50" height="100" rx="8" fill="#334155" stroke="#1e293b" strokeWidth="3" />
                        <rect x="17" y="-8" width="16" height="10" rx="3" fill="#475569" stroke="#334155" strokeWidth="2" />
                        <circle cx="25" cy="25" r="14" fill="rgba(34, 197, 94, 0.3)" stroke="#16a34a" strokeWidth="2" />
                        <text x="25" y="32" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="bold">{currentDirection === 'forward' ? '+' : '−'}</text>
                        <circle cx="25" cy="75" r="14" fill="rgba(239, 68, 68, 0.3)" stroke="#dc2626" strokeWidth="2" />
                        <text x="25" y="82" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="bold">{currentDirection === 'forward' ? '−' : '+'}</text>
                        {/* Voltage label - positioned to the left of battery */}
                        <rect x="-70" y="35" width="60" height="28" rx="4" fill="#1e40af" stroke="#1d4ed8" strokeWidth="2" />
                        <text x="-40" y="55" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="bold">{values.voltage}V</text>
                    </g>
                )}

                {/* SIMPLE MODE */}
                {mode === 'simple' && (
                    <>
                        <line x1="65" y1="100" x2="65" y2="70" stroke={wireColor} strokeWidth="4" />
                        <line x1="65" y1="70" x2="220" y2="70" stroke={wireColor} strokeWidth="4" />
                        <g transform="translate(220, 50)">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <ellipse key={i} cx={i * 20} cy="20" rx="10" ry="15" fill="none" stroke="url(#inductorGradient)" strokeWidth="3" filter="url(#glow)" />
                            ))}
                            <rect x="0" y="10" width="80" height="20" rx="4" fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="1" />
                            <text x="40" y="-8" textAnchor="middle" fill="#1e293b" fontSize="18" fontWeight="bold">L1</text>
                            <text x="40" y="58" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">{values.l1}mH</text>
                        </g>
                        <line x1="300" y1="70" x2="480" y2="70" stroke={wireColor} strokeWidth="4" />
                        <line x1="480" y1="70" x2="480" y2="280" stroke={wireColor} strokeWidth="4" />
                        <line x1="480" y1="280" x2="65" y2="280" stroke={wireColor} strokeWidth="4" />
                        <line x1="65" y1="280" x2="65" y2="200" stroke={wireColor} strokeWidth="4" />

                        {/* Electrons */}
                        {currentOn && [0, 1, 2, 3, 4, 5].map(i => (
                            <circle key={i} cx="65" cy="200" r="5" fill="#e0f2fe" filter="url(#glow)">
                                <animate attributeName="cx" values="65;65;220;300;480;480;65;65" dur="3s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
                                <animate attributeName="cy" values="200;70;70;70;70;280;280;200" dur="3s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
                            </circle>
                        ))}
                    </>
                )}

                {/* SERIES MODE */}
                {mode === 'series' && (
                    <>
                        <line x1="65" y1="100" x2="65" y2="70" stroke={wireColor} strokeWidth="4" />
                        <line x1="65" y1="70" x2="150" y2="70" stroke={wireColor} strokeWidth="4" />
                        <g transform="translate(150, 50)">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <ellipse key={i} cx={i * 16} cy="20" rx="8" ry="12" fill="none" stroke="url(#inductorGradient)" strokeWidth="3" filter="url(#glow)" />
                            ))}
                            <text x="32" y="-8" textAnchor="middle" fill="#1e293b" fontSize="18" fontWeight="bold">L1</text>
                            <text x="32" y="52" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="bold">{values.l1}mH</text>
                        </g>
                        <line x1="214" y1="70" x2="280" y2="70" stroke={wireColor} strokeWidth="4" />
                        <g transform="translate(280, 50)">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <ellipse key={i} cx={i * 16} cy="20" rx="8" ry="12" fill="none" stroke="url(#inductorGradient)" strokeWidth="3" filter="url(#glow)" />
                            ))}
                            <text x="32" y="-8" textAnchor="middle" fill="#1e293b" fontSize="18" fontWeight="bold">L2</text>
                            <text x="32" y="52" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="bold">{values.l2}mH</text>
                        </g>
                        <line x1="344" y1="70" x2="480" y2="70" stroke={wireColor} strokeWidth="4" />
                        <line x1="480" y1="70" x2="480" y2="280" stroke={wireColor} strokeWidth="4" />
                        <line x1="480" y1="280" x2="65" y2="280" stroke={wireColor} strokeWidth="4" />
                        <line x1="65" y1="280" x2="65" y2="200" stroke={wireColor} strokeWidth="4" />
                        {/* Electrons */}
                        {currentOn && [0, 1, 2, 3, 4, 5].map(i => (
                            <circle key={i} cx="65" cy="200" r="5" fill="#e0f2fe" filter="url(#glow)">
                                <animate attributeName="cx" values="65;65;150;214;280;344;480;480;65" dur="3s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
                                <animate attributeName="cy" values="200;70;70;70;70;70;70;280;280" dur="3s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
                            </circle>
                        ))}
                    </>
                )}

                {/* PARALLEL MODE - From InductorPage */}
                {mode === 'parallel' && (
                    <>
                        {/* Battery - aligned with left vertical wire at x=80 */}
                        <g transform="translate(55, 100)">
                            {/* Battery body */}
                            <rect x="0" y="0" width="50" height="100" rx="8" fill="#374151" stroke="#1f2937" strokeWidth="3" />
                            {/* Battery cap (top) */}
                            <rect x="17" y="-8" width="16" height="10" rx="3" fill="#4b5563" stroke="#374151" strokeWidth="2" />
                            {/* Positive terminal area (top) */}
                            <circle cx="25" cy="22" r="12" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="2" />
                            <text x="25" y="28" textAnchor="middle" fill="#000000" fontSize="20" fontWeight="bold">
                                {currentDirection === 'forward' ? '+' : '−'}
                            </text>
                            {/* Voltage display - centered inside battery */}
                            <rect x="5" y="38" width="40" height="18" rx="3" fill="#0d9488" />
                            <text x="25" y="52" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">{values.voltage}V</text>
                            {/* Negative terminal area (bottom) */}
                            <circle cx="25" cy="78" r="12" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2" />
                            <text x="25" y="84" textAnchor="middle" fill="#000000" fontSize="20" fontWeight="bold">
                                {currentDirection === 'forward' ? '−' : '+'}
                            </text>
                            {/* Battery label - to the LEFT of battery */}
                            <text x="-35" y="55" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="bold">Battery</text>
                        </g>

                        {/* Wire from battery + (top) going straight up */}
                        <line x1="80" y1="100" x2="80" y2="70" stroke={wireColor} strokeWidth="4" />
                        {/* Top horizontal rail - from left to split point */}
                        <line x1="80" y1="70" x2="180" y2="70" stroke={wireColor} strokeWidth="4" />

                        {/* Vertical split at x=180 - going up to L1 branch and down to L2 branch */}
                        <line x1="180" y1="70" x2="180" y2="40" stroke={wireColor} strokeWidth="4" />
                        <line x1="180" y1="70" x2="180" y2="120" stroke={wireColor} strokeWidth="4" />

                        {/* Horizontal wire to L1 (upper branch) */}
                        <line x1="180" y1="40" x2="250" y2="40" stroke={wireColor} strokeWidth="4" />
                        {/* Horizontal wire to L2 (lower branch) */}
                        <line x1="180" y1="120" x2="250" y2="120" stroke={wireColor} strokeWidth="4" />

                        {/* L1 Inductor - upper branch */}
                        <g transform="translate(250, 20)">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <ellipse
                                    key={i}
                                    cx={i * 16}
                                    cy="20"
                                    rx="8"
                                    ry="12"
                                    fill="none"
                                    stroke="url(#inductorGradient)"
                                    strokeWidth="3"
                                    filter="url(#glow)"
                                />
                            ))}
                            <rect x="0" y="10" width="64" height="20" rx="4" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="1" />
                            <text x="32" y="-8" textAnchor="middle" fill="#000000" fontSize="16" fontWeight="bold">L1 ({values.l1}mH)</text>
                        </g>

                        {/* L2 Inductor - lower branch */}
                        <g transform="translate(250, 100)">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <ellipse
                                    key={i}
                                    cx={i * 16}
                                    cy="20"
                                    rx="8"
                                    ry="12"
                                    fill="none"
                                    stroke="url(#inductorGradient)"
                                    strokeWidth="3"
                                    filter="url(#glow)"
                                />
                            ))}
                            <rect x="0" y="10" width="64" height="20" rx="4" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="1" />
                            <text x="32" y="-8" textAnchor="middle" fill="#000000" fontSize="16" fontWeight="bold">L2 ({values.l2}mH)</text>
                        </g>

                        {/* Horizontal wire from L1 to join point */}
                        <line x1="314" y1="40" x2="370" y2="40" stroke={wireColor} strokeWidth="4" />
                        {/* Horizontal wire from L2 to join point */}
                        <line x1="314" y1="120" x2="370" y2="120" stroke={wireColor} strokeWidth="4" />

                        {/* Vertical join at x=370 */}
                        <line x1="370" y1="40" x2="370" y2="70" stroke={wireColor} strokeWidth="4" />
                        <line x1="370" y1="70" x2="370" y2="120" stroke={wireColor} strokeWidth="4" />

                        {/* Continue on top rail to right corner */}
                        <line x1="370" y1="70" x2="480" y2="70" stroke={wireColor} strokeWidth="4" />

                        {/* Right vertical wire - going down */}
                        <line x1="480" y1="70" x2="480" y2="280" stroke={wireColor} strokeWidth="4" />

                        {/* Bottom horizontal rail - back to left side */}
                        <line x1="480" y1="280" x2="80" y2="280" stroke={wireColor} strokeWidth="4" />

                        {/* Wire from bottom rail straight up to battery - (bottom) */}
                        <line x1="80" y1="280" x2="80" y2="200" stroke={wireColor} strokeWidth="4" />

                        {/* Electron animations - speed increases with voltage */}
                        {currentOn && (() => {
                            // Higher voltage = faster electrons (shorter duration)
                            const baseDuration = Math.max(2, 6 - (values.voltage / 24) * 4);
                            // More electrons at higher voltage
                            const electronCount = Math.min(5, Math.floor(values.voltage / 5) + 2);

                            return (
                                <>
                                    {/* Electrons on L1 branch */}
                                    {Array.from({ length: electronCount }, (_, i) => (
                                        <circle key={`l1-${i}`} r="5" fill="#60a5fa" filter="url(#glow)">
                                            <animate
                                                attributeName="cx"
                                                values="80;80;180;180;250;314;370;370;480;480;80;80"
                                                dur={`${baseDuration}s`}
                                                begin={`${i * (baseDuration / electronCount)}s`}
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="cy"
                                                values="200;70;70;40;40;40;40;70;70;280;280;200"
                                                dur={`${baseDuration}s`}
                                                begin={`${i * (baseDuration / electronCount)}s`}
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                    ))}
                                    {/* Electrons on L2 branch */}
                                    {Array.from({ length: electronCount }, (_, i) => (
                                        <circle key={`l2-${i}`} r="5" fill="#60a5fa" filter="url(#glow)">
                                            <animate
                                                attributeName="cx"
                                                values="80;80;180;180;250;314;370;370;480;480;80;80"
                                                dur={`${baseDuration}s`}
                                                begin={`${i * (baseDuration / electronCount) + baseDuration / (electronCount * 2)}s`}
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="cy"
                                                values="200;70;70;120;120;120;120;70;70;280;280;200"
                                                dur={`${baseDuration}s`}
                                                begin={`${i * (baseDuration / electronCount) + baseDuration / (electronCount * 2)}s`}
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                    ))}
                                </>
                            );
                        })()}
                    </>
                )}

            </svg>
        </div>
    );
}

export default InductorCircuit;
