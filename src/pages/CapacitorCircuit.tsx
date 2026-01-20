import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Zap } from 'lucide-react';

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

interface AnimationState {
    chargeLevel: number;
    electronPhase: number;
    fieldStrength: number;
    bulbGlow: number;
    wireOpacity: number;
    chargingTime: number;
    dischargingTime: number;
}

interface Electron {
    id: number;
    x: number;
    y: number;
    progress: number;
}

const CapacitorCircuit: React.FC = () => {
    const [state, setState] = useState<CapacitorState>({
        mode: 'simple',
        voltage: 9,
        capacitance: 100,
        capacitance2: 200,
        capacitance3: 150,
        stage: 'initial',
    });

    const [animation, setAnimation] = useState<AnimationState>({
        chargeLevel: 0,
        electronPhase: 0,
        fieldStrength: 0,
        bulbGlow: 0,
        wireOpacity: 0,
        chargingTime: 0,
        dischargingTime: 0,
    });

    const [electrons, setElectrons] = useState<Electron[]>([]);

    useEffect(() => {
        socket.on('initialState', (s: CapacitorState) => s && setState(s));
        socket.on('stateUpdated', (s: CapacitorState) => s && setState(s));
        return () => {
            socket.off('initialState');
            socket.off('stateUpdated');
        };
    }, []);

    // Animation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimation(prev => {
                const newState = { ...prev };

                // Charging animation
                if (state.stage === 'charging') {
                    newState.chargeLevel = Math.min(1, prev.chargeLevel + 0.008);
                    newState.fieldStrength = newState.chargeLevel;
                    newState.chargingTime += 0.045;
                    newState.electronPhase = (prev.electronPhase + 0.1) % (Math.PI * 2);

                    if (newState.chargeLevel >= 1) {
                        // Auto-transition should ideally be handled by the controller?
                        // But if it's visual state, circuit can maybe hint?
                        // Or just wait. Let's let the Controller handle logic or user interaction.
                        // Actually, in original code, it auto-transitioned 'charged' after delay.
                        // But now we have separate controls.
                        // We can likely just show fully charged state here.
                        // The Controller doesn't know animation state.
                        // We might need to emit 'charged' from here?
                        // Or Controller handles the timing.
                        // Best if Controller manages stage transitions if they are time-based?
                        // But Controller relies on user or timeout.
                        // Let's emit updateState from here if we finish charging?
                        // That's risky (loop).
                        // Let's just clamp visual state.
                    }
                }

                // Discharging animation
                if (state.stage === 'discharge') {
                    newState.chargeLevel = Math.max(0, prev.chargeLevel - 0.01);
                    newState.fieldStrength = newState.chargeLevel;
                    newState.bulbGlow = newState.chargeLevel;
                    newState.dischargingTime += 0.045;
                    newState.electronPhase = (prev.electronPhase - 0.12) % (Math.PI * 2);
                }

                if (state.stage === 'initial') {
                    return { ...prev, chargeLevel: 0, fieldStrength: 0, bulbGlow: 0 };
                }
                if (state.stage === 'charged') {
                    return { ...prev, chargeLevel: 1, fieldStrength: 1, bulbGlow: 0 };
                }
                if (state.stage === 'discharged') {
                    return { ...prev, chargeLevel: 0, fieldStrength: 0, bulbGlow: 0 };
                }

                return newState;
            });

            // Generate electron particles
            if (state.stage === 'charging' || state.stage === 'discharge') {
                if (Math.random() < 0.2) {
                    setElectrons(prev => {
                        const nextId = prev.length > 0 ? Math.max(...prev.map(e => e.id)) + 1 : 0;
                        return [...prev.slice(-20), { id: nextId, x: 0, y: 0, progress: 0 }];
                    });
                }
            }

            // Update electron positions
            setElectrons(prev => prev.map(e => ({ ...e, progress: e.progress + 0.02 })).filter(e => e.progress < 1));

        }, 45);

        return () => clearInterval(interval);
    }, [state.stage]);

    // Derived energy
    const getTotalCapacitance = () => {
        switch (state.mode) {
            case 'simple': return state.capacitance;
            case 'series': return 1 / (1 / state.capacitance + 1 / state.capacitance2 + 1 / state.capacitance3);
            case 'parallel': return state.capacitance + state.capacitance2 + state.capacitance3;
        }
    };
    const totalCapacitance = getTotalCapacitance();
    const storedEnergy = 0.5 * totalCapacitance * state.voltage * state.voltage / 1000;

    const wireColor = '#22d3ee'; // Cyan-400

    // ... SVG rendering logic (adapted from Capacitor.tsx)
    // We need to render the SVG here.

    const getPhaseInfo = () => {
        switch (state.stage) {
            case 'charging':
                return {
                    title: 'Charging Phase',
                    description: 'Watch electrons flow from the battery. The capacitor plates accumulate opposite charges, storing electrical energy.',
                    icon: '💡'
                };
            case 'charged':
                return {
                    title: 'Fully Charged',
                    description: 'The capacitor is fully charged. The electric field between plates is at maximum strength.',
                    icon: '⚡'
                };
            case 'discharge':
                return {
                    title: 'Discharging Phase',
                    description: 'Energy stored in the capacitor is being released, powering the bulb.',
                    icon: '💡'
                };
            case 'discharged':
                return {
                    title: 'Discharged',
                    description: 'The capacitor has released all its stored energy.',
                    icon: '🔋'
                };
            default:
                return {
                    title: 'Ready',
                    description: 'Connect the circuit to start charging the capacitor.',
                    icon: '🔌'
                };
        }
    };

    const phaseInfo = getPhaseInfo();
    const chargePercent = Math.round(animation.chargeLevel * 100);

    return (
        <div className="h-screen w-full bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100 relative overflow-hidden flex items-center justify-center p-8">
            {/* Main Card Container */}
            <div className="w-full max-w-5xl h-[90vh] bg-white/70 backdrop-blur-sm rounded-[2.5rem] shadow-2xl border border-white/50 relative overflow-hidden">

                {/* Info Panel - Top Left */}
                <div className="absolute top-6 left-6 z-30 bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-cyan-200/50 max-w-md">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-yellow-400 flex items-center justify-center shadow-lg text-2xl">
                            {phaseInfo.icon}
                        </div>
                        <h2 className="text-xl font-bold text-purple-600">{phaseInfo.title}</h2>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{phaseInfo.description}</p>

                    {/* Progress Bar and Stats Row */}
                    <div className="mt-4 flex items-center gap-4">
                        {/* Progress Bar */}
                        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-2 flex-1">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                            <span className="text-lg font-bold text-slate-700">{chargePercent}%</span>
                        </div>

                        {/* Stored Energy Badge */}
                        <div className="bg-slate-700 rounded-xl px-4 py-2 text-center">
                            <div className="text-xs text-cyan-400 font-semibold">Stored Energy</div>
                            <div className="text-lg font-bold text-white">{storedEnergy.toFixed(2)} mJ</div>
                        </div>
                    </div>
                </div>

                {/* Circuit Canvas - Positioned Lower */}
                <div className="absolute inset-0 z-10 flex items-end justify-center pb-8 pt-40">
                    <svg viewBox="0 0 700 400" className="w-[85%] h-auto max-h-[55vh]" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                            <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={`rgba(59, 130, 246, ${animation.fieldStrength * 0.9})`} />
                                <stop offset="50%" stopColor={`rgba(139, 92, 246, ${animation.fieldStrength})`} />
                                <stop offset="100%" stopColor={`rgba(236, 72, 153, ${animation.fieldStrength * 0.8})`} />
                            </linearGradient>
                            <filter id="bulbGlow">
                                <feGaussianBlur stdDeviation={`${animation.bulbGlow * 20}`} result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                            <radialGradient id="bulbRadiant" cx="50%" cy="30%" r="70%">
                                <stop offset="0%" stopColor={`rgba(255, 240, 150, ${animation.bulbGlow})`} />
                                <stop offset="40%" stopColor={`rgba(255, 180, 50, ${animation.bulbGlow * 0.7})`} />
                                <stop offset="100%" stopColor={`rgba(255, 100, 0, ${animation.bulbGlow * 0.2})`} />
                            </radialGradient>
                        </defs>


                        {/* Simple Circuit */}
                        {state.mode === 'simple' && (
                            <>
                                {/* Top wire */}
                                <line x1="60" y1="80" x2="300" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                <line x1="400" y1="80" x2="640" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />

                                {/* Right vertical wire */}
                                <line x1="640" y1="80" x2="640" y2="320" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />

                                {/* Bottom wire */}
                                {state.stage !== 'discharge' && state.stage !== 'discharged' ? (
                                    <>
                                        <line x1="640" y1="320" x2="420" y2="320" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                        <line x1="280" y1="320" x2="60" y2="320" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    </>
                                ) : (
                                    <line x1="640" y1="320" x2="60" y2="320" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                )}

                                {/* Left vertical wire */}
                                <line x1="60" y1="320" x2="60" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />

                                {/* Wires to capacitor */}
                                <line x1="300" y1="80" x2="320" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                <line x1="380" y1="80" x2="400" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />

                                {/* Capacitor */}
                                <g transform="translate(350, 20)">
                                    {/* Capacitor label */}
                                    <text x="0" y="-5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#7c3aed">⚡ Capacitor</text>

                                    {/* Left plate (negative - blue) */}
                                    <rect x="-35" y="30" width="14" height="80" rx="3" fill={`rgba(59, 130, 246, ${0.5 + animation.chargeLevel * 0.5})`} stroke="#3b82f6" strokeWidth="2" />
                                    <text x="-28" y="75" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e40af">−</text>

                                    {/* Electric field between plates */}
                                    <rect x="-21" y="30" width="42" height="80" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.7} rx="2" />

                                    {/* Field dots animation */}
                                    {animation.fieldStrength > 0 && (
                                        <>
                                            <circle cx="0" cy="50" r="3" fill="#8b5cf6" opacity={animation.fieldStrength}>
                                                <animate attributeName="cy" values="40;90;40" dur="1.5s" repeatCount="indefinite" />
                                            </circle>
                                            <circle cx="0" cy="70" r="3" fill="#8b5cf6" opacity={animation.fieldStrength}>
                                                <animate attributeName="cy" values="90;40;90" dur="1.5s" repeatCount="indefinite" />
                                            </circle>
                                        </>
                                    )}

                                    {/* Right plate (positive - pink) */}
                                    <rect x="21" y="30" width="14" height="80" rx="3" fill={`rgba(236, 72, 153, ${0.5 + animation.chargeLevel * 0.5})`} stroke="#ec4899" strokeWidth="2" />
                                    <text x="28" y="75" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#be185d">+</text>

                                    {/* Capacitance label */}
                                    <text x="0" y="130" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e293b">{state.capacitance}µF</text>
                                </g>

                                {/* Battery */}
                                {state.stage !== 'discharge' && state.stage !== 'discharged' && (
                                    <g transform="translate(350, 260)">
                                        {/* Battery label */}
                                        <text x="0" y="-5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#475569">🔋 Battery</text>

                                        {/* Battery body */}
                                        <rect x="-55" y="10" width="110" height="70" rx="12" fill="#475569" stroke="#1e293b" strokeWidth="2" />

                                        {/* Red terminal (negative) */}
                                        <rect x="-63" y="25" width="12" height="40" rx="3" fill="#dc2626" />

                                        {/* Positive circle */}
                                        <circle cx="-20" cy="45" r="18" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2" />
                                        <text x="-20" y="52" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">+</text>

                                        {/* Negative circle */}
                                        <circle cx="20" cy="45" r="18" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="2" />
                                        <text x="20" y="52" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">−</text>

                                        {/* Green terminal (positive) */}
                                        <rect x="51" y="25" width="12" height="40" rx="3" fill="#16a34a" />

                                        {/* Voltage label */}
                                        <text x="0" y="100" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e293b">{state.voltage}V</text>
                                    </g>
                                )}

                                {/* Bulb (during discharge) */}
                                {(state.stage === 'discharge' || state.stage === 'discharged') && (
                                    <g transform="translate(350, 280)">
                                        <circle cx="0" cy="0" r={35 + animation.bulbGlow * 20} fill="url(#bulbRadiant)" opacity={animation.bulbGlow * 0.5} filter="url(#bulbGlow)" />
                                        <circle cx="0" cy="0" r="28" fill={`rgba(255, 240, 200, ${0.2 + animation.bulbGlow * 0.4})`} stroke="rgba(251, 191, 36, 0.9)" strokeWidth="3" filter="url(#glow)" />
                                        <path d="M -10 0 Q -6 -10 -2 0 Q 2 10 6 0 Q 10 -10 14 0" fill="none" stroke={`rgba(255, 200, 50, ${0.5 + animation.bulbGlow * 0.5})`} strokeWidth="2.5" strokeLinecap="round" transform="translate(-2, 0)" />
                                        <text x="0" y="50" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e293b">Bulb</text>
                                    </g>
                                )}

                                {/* Animated electrons during charging */}
                                {state.stage === 'charging' && (
                                    <>
                                        {[0, 1, 2, 3, 4, 5].map(i => (
                                            <circle key={i} r="5" fill="#60a5fa" filter="url(#glow)">
                                                <animate
                                                    attributeName="cx"
                                                    values="60;60;300;300;60;60"
                                                    dur="2s"
                                                    begin={`${i * 0.33}s`}
                                                    repeatCount="indefinite"
                                                />
                                                <animate
                                                    attributeName="cy"
                                                    values="320;80;80;80;320;320"
                                                    dur="2s"
                                                    begin={`${i * 0.33}s`}
                                                    repeatCount="indefinite"
                                                />
                                            </circle>
                                        ))}
                                    </>
                                )}
                            </>
                        )}

                        {/* Series Circuit - matching reference layout */}
                        {state.mode === 'series' && (
                            <>
                                {/* Top horizontal wire - with gaps at capacitors */}
                                <line x1="80" y1="80" x2="155" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                <line x1="205" y1="80" x2="325" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                <line x1="375" y1="80" x2="495" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                <line x1="545" y1="80" x2="620" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />

                                {/* Right vertical wire */}
                                <line x1="620" y1="80" x2="620" y2="300" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />

                                {/* Bottom horizontal wire */}
                                {state.stage !== 'discharge' && state.stage !== 'discharged' ? (
                                    <>
                                        <line x1="620" y1="300" x2="395" y2="300" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                        <line x1="285" y1="300" x2="80" y2="300" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    </>
                                ) : (
                                    <line x1="620" y1="300" x2="80" y2="300" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                )}

                                {/* Left vertical wire */}
                                <line x1="80" y1="300" x2="80" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />

                                {/* Capacitor 1 - matching simple circuit style */}
                                <g transform="translate(180, 80)">
                                    {/* Label above */}
                                    <text x="0" y="-50" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#7c3aed">C₁ ({state.capacitance}µF)</text>

                                    {/* Left plate (negative - blue) */}
                                    <rect x="-25" y="-35" width="12" height="70" rx="3" fill={`rgba(59, 130, 246, ${0.5 + animation.chargeLevel * 0.5})`} stroke="#3b82f6" strokeWidth="2" />
                                    <text x="-19" y="5" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e40af">−</text>

                                    {/* Electric field between plates */}
                                    <rect x="-13" y="-35" width="26" height="70" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.7} rx="2" />

                                    {/* Field dots animation */}
                                    {animation.fieldStrength > 0 && (
                                        <>
                                            <circle cx="0" cy="-15" r="3" fill="#8b5cf6" opacity={animation.fieldStrength}>
                                                <animate attributeName="cy" values="-25;25;-25" dur="1.5s" repeatCount="indefinite" />
                                            </circle>
                                            <circle cx="0" cy="15" r="3" fill="#8b5cf6" opacity={animation.fieldStrength}>
                                                <animate attributeName="cy" values="25;-25;25" dur="1.5s" repeatCount="indefinite" />
                                            </circle>
                                        </>
                                    )}

                                    {/* Right plate (positive - pink) */}
                                    <rect x="13" y="-35" width="12" height="70" rx="3" fill={`rgba(236, 72, 153, ${0.5 + animation.chargeLevel * 0.5})`} stroke="#ec4899" strokeWidth="2" />
                                    <text x="19" y="5" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#be185d">+</text>
                                </g>

                                {/* Capacitor 2 - matching simple circuit style */}
                                <g transform="translate(350, 80)">
                                    <text x="0" y="-50" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#7c3aed">C₂ ({state.capacitance2}µF)</text>

                                    <rect x="-25" y="-35" width="12" height="70" rx="3" fill={`rgba(59, 130, 246, ${0.5 + animation.chargeLevel * 0.5})`} stroke="#3b82f6" strokeWidth="2" />
                                    <text x="-19" y="5" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e40af">−</text>

                                    <rect x="-13" y="-35" width="26" height="70" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.7} rx="2" />

                                    {animation.fieldStrength > 0 && (
                                        <>
                                            <circle cx="0" cy="-15" r="3" fill="#8b5cf6" opacity={animation.fieldStrength}>
                                                <animate attributeName="cy" values="-25;25;-25" dur="1.5s" repeatCount="indefinite" begin="0.2s" />
                                            </circle>
                                            <circle cx="0" cy="15" r="3" fill="#8b5cf6" opacity={animation.fieldStrength}>
                                                <animate attributeName="cy" values="25;-25;25" dur="1.5s" repeatCount="indefinite" begin="0.2s" />
                                            </circle>
                                        </>
                                    )}

                                    <rect x="13" y="-35" width="12" height="70" rx="3" fill={`rgba(236, 72, 153, ${0.5 + animation.chargeLevel * 0.5})`} stroke="#ec4899" strokeWidth="2" />
                                    <text x="19" y="5" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#be185d">+</text>
                                </g>

                                {/* Capacitor 3 - matching simple circuit style */}
                                <g transform="translate(520, 80)">
                                    <text x="0" y="-50" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#7c3aed">C₃ ({state.capacitance3}µF)</text>

                                    <rect x="-25" y="-35" width="12" height="70" rx="3" fill={`rgba(59, 130, 246, ${0.5 + animation.chargeLevel * 0.5})`} stroke="#3b82f6" strokeWidth="2" />
                                    <text x="-19" y="5" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e40af">−</text>

                                    <rect x="-13" y="-35" width="26" height="70" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.7} rx="2" />

                                    {animation.fieldStrength > 0 && (
                                        <>
                                            <circle cx="0" cy="-15" r="3" fill="#8b5cf6" opacity={animation.fieldStrength}>
                                                <animate attributeName="cy" values="-25;25;-25" dur="1.5s" repeatCount="indefinite" begin="0.4s" />
                                            </circle>
                                            <circle cx="0" cy="15" r="3" fill="#8b5cf6" opacity={animation.fieldStrength}>
                                                <animate attributeName="cy" values="25;-25;25" dur="1.5s" repeatCount="indefinite" begin="0.4s" />
                                            </circle>
                                        </>
                                    )}

                                    <rect x="13" y="-35" width="12" height="70" rx="3" fill={`rgba(236, 72, 153, ${0.5 + animation.chargeLevel * 0.5})`} stroke="#ec4899" strokeWidth="2" />
                                    <text x="19" y="5" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#be185d">+</text>
                                </g>


                                {/* Battery - on bottom wire */}
                                {state.stage !== 'discharge' && state.stage !== 'discharged' && (
                                    <g transform="translate(340, 300)">
                                        {/* Battery label above */}
                                        <text x="0" y="-55" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1e293b">🔋 Battery</text>
                                        {/* Battery body - centered on wire */}
                                        <rect x="-50" y="-45" width="100" height="45" rx="10" fill="#475569" stroke="#1e293b" strokeWidth="2" />
                                        {/* Left terminal tab */}
                                        <rect x="-55" y="-30" width="8" height="20" rx="2" fill="#dc2626" />
                                        {/* Right terminal tab */}
                                        <rect x="47" y="-30" width="8" height="20" rx="2" fill="#16a34a" />
                                        {/* Plus symbol */}
                                        <circle cx="-22" cy="-22" r="14" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="2" />
                                        <text x="-22" y="-16" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">+</text>
                                        {/* Minus symbol */}
                                        <circle cx="22" cy="-22" r="14" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2" />
                                        <text x="22" y="-16" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">−</text>
                                        {/* Voltage below */}
                                        <text x="0" y="18" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e293b">{state.voltage}V</text>
                                    </g>
                                )}

                                {/* Bulb - Shows during discharge */}
                                {(state.stage === 'discharge' || state.stage === 'discharged') && (
                                    <g transform="translate(340, 300)">
                                        <circle cx="0" cy="-40" r={30 + animation.bulbGlow * 15} fill="url(#bulbRadiant)" opacity={animation.bulbGlow * 0.5} filter="url(#bulbGlow)" />
                                        <circle cx="0" cy="-40" r="25" fill={`rgba(255, 240, 200, ${0.1 + animation.bulbGlow * 0.4})`} stroke="rgba(251, 191, 36, 0.8)" strokeWidth="3" filter="url(#glow)" />
                                        <path d="M -8 -40 Q -5 -50 -2 -40 Q 2 -30 5 -40 Q 8 -50 11 -40" fill="none" stroke={`rgba(255, 200, 50, ${0.4 + animation.bulbGlow * 0.6})`} strokeWidth="2" strokeLinecap="round" transform="translate(-2, 0)" />
                                        <text x="0" y="10" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e293b">💡 Bulb</text>
                                    </g>
                                )}

                                {/* Animated electrons - along rectangular path through capacitors */}
                                {state.stage === 'charging' && (
                                    <>
                                        {[0, 1, 2, 3, 4, 5].map(i => (
                                            <circle key={i} r="5" fill="#60a5fa" filter="url(#glow)">
                                                <animate
                                                    attributeName="cx"
                                                    values="80;180;350;520;620;620;340;340;80;80"
                                                    dur="3.5s"
                                                    begin={`${i * 0.58}s`}
                                                    repeatCount="indefinite"
                                                />
                                                <animate
                                                    attributeName="cy"
                                                    values="80;80;80;80;80;300;300;300;300;80"
                                                    dur="3.5s"
                                                    begin={`${i * 0.58}s`}
                                                    repeatCount="indefinite"
                                                />
                                            </circle>
                                        ))}
                                    </>
                                )}
                            </>
                        )}

                        {/* Parallel Circuit */}
                        {state.mode === 'parallel' && (
                            <>
                                {/* Top rail */}
                                <line x1="100" y1="60" x2="600" y2="60" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                {/* Bottom rail */}
                                <line x1="100" y1="340" x2="600" y2="340" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />

                                {/* Capacitor 1 (left) - Horizontal plates */}
                                <g transform="translate(200, 200)">
                                    <line x1="0" y1="-140" x2="0" y2="-25" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    <line x1="0" y1="25" x2="0" y2="140" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    <rect x="-35" y="-20" width="70" height="8" rx="2" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#3b82f6" strokeWidth="1.5" filter="url(#glow)" />
                                    <rect x="-35" y="12" width="70" height="8" rx="2" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#ec4899" strokeWidth="1.5" filter="url(#glow)" />
                                    <rect x="-35" y="-12" width="70" height="24" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.8} rx="2" />
                                    <text x="-12" y="-35" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#3b82f6">−</text>
                                    <text x="-12" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#ec4899">+</text>
                                    <text x="-50" y="-5" textAnchor="end" fontSize="12" fontWeight="bold" fill="#1e293b">C₁</text>
                                    <text x="-50" y="10" textAnchor="end" fontSize="10" fontWeight="bold" fill="#1e293b">{state.capacitance}µF</text>
                                </g>

                                {/* Capacitor 2 (middle) - Horizontal plates */}
                                <g transform="translate(350, 200)">
                                    <line x1="0" y1="-140" x2="0" y2="-25" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    <line x1="0" y1="25" x2="0" y2="140" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    <rect x="-35" y="-20" width="70" height="8" rx="2" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#3b82f6" strokeWidth="1.5" filter="url(#glow)" />
                                    <rect x="-35" y="12" width="70" height="8" rx="2" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#ec4899" strokeWidth="1.5" filter="url(#glow)" />
                                    <rect x="-35" y="-12" width="70" height="24" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.8} rx="2" />
                                    <text x="-12" y="-35" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#3b82f6">−</text>
                                    <text x="-12" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#ec4899">+</text>
                                    <text x="-50" y="-5" textAnchor="end" fontSize="12" fontWeight="bold" fill="#1e293b">C₂</text>
                                    <text x="-50" y="10" textAnchor="end" fontSize="10" fontWeight="bold" fill="#1e293b">{state.capacitance2}µF</text>
                                </g>

                                {/* Capacitor 3 (right) - Horizontal plates */}
                                <g transform="translate(500, 200)">
                                    <line x1="0" y1="-140" x2="0" y2="-25" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    <line x1="0" y1="25" x2="0" y2="140" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    <rect x="-35" y="-20" width="70" height="8" rx="2" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#3b82f6" strokeWidth="1.5" filter="url(#glow)" />
                                    <rect x="-35" y="12" width="70" height="8" rx="2" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#ec4899" strokeWidth="1.5" filter="url(#glow)" />
                                    <rect x="-35" y="-12" width="70" height="24" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.8} rx="2" />
                                    <text x="-12" y="-35" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#3b82f6">−</text>
                                    <text x="-12" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#ec4899">+</text>
                                    <text x="-50" y="-5" textAnchor="end" fontSize="12" fontWeight="bold" fill="#1e293b">C₃</text>
                                    <text x="-50" y="10" textAnchor="end" fontSize="10" fontWeight="bold" fill="#1e293b">{state.capacitance3}µF</text>
                                </g>

                                {/* Battery - Left side, vertical orientation */}
                                {state.stage !== 'discharge' && state.stage !== 'discharged' && (
                                    <g transform="translate(100, 200)">
                                        <line x1="0" y1="-140" x2="0" y2="-50" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                        <line x1="0" y1="50" x2="0" y2="140" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                        <rect x="-30" y="-50" width="60" height="100" rx="10" fill="#475569" stroke="#1e293b" strokeWidth="2" />
                                        <rect x="-10" y="-55" width="20" height="10" rx="3" fill="#dc2626" />
                                        <rect x="-10" y="45" width="20" height="10" rx="3" fill="#16a34a" />
                                        <circle cx="0" cy="-20" r="15" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="2" />
                                        <text x="0" y="-14" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">+</text>
                                        <circle cx="0" cy="20" r="15" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2" />
                                        <text x="0" y="26" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">−</text>
                                        <text x="-45" y="-5" textAnchor="end" fontSize="11" fontWeight="bold" fill="#1e293b">🔋 Battery</text>
                                        <text x="-45" y="12" textAnchor="end" fontSize="13" fontWeight="bold" fill="#1e293b">{state.voltage}V</text>
                                    </g>
                                )}

                                {/* Left wire when no battery (discharge) */}
                                {(state.stage === 'discharge' || state.stage === 'discharged') && (
                                    <line x1="100" y1="60" x2="100" y2="340" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                )}

                                {/* Right connection & Bulb during discharge */}
                                {(state.stage === 'discharge' || state.stage === 'discharged') && (
                                    <g transform="translate(600, 200)">
                                        <line x1="0" y1="-140" x2="0" y2="-45" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                        <line x1="0" y1="45" x2="0" y2="140" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                        <circle cx="0" cy="0" r={38 + animation.bulbGlow * 18} fill="url(#bulbRadiant)" opacity={animation.bulbGlow * 0.5} filter="url(#bulbGlow)" />
                                        <circle cx="0" cy="0" r="32" fill={`rgba(255, 240, 200, ${0.1 + animation.bulbGlow * 0.4})`} stroke="rgba(251, 191, 36, 0.8)" strokeWidth="3" filter="url(#glow)" />
                                        <path d="M -10 0 Q -6 -10 -2 0 Q 2 10 6 0 Q 10 -10 14 0" fill="none" stroke={`rgba(255, 200, 50, ${0.4 + animation.bulbGlow * 0.6})`} strokeWidth="2.5" strokeLinecap="round" transform="translate(-2, 0)" />
                                        <text x="45" y="5" textAnchor="start" fontSize="11" fontWeight="bold" fill="rgba(251, 191, 36, 0.9)">💡 {(animation.bulbGlow * 100).toFixed(0)}%</text>
                                    </g>
                                )}

                                {/* Right wire when not discharge */}
                                {state.stage !== 'discharge' && state.stage !== 'discharged' && (
                                    <line x1="600" y1="60" x2="600" y2="340" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                )}

                                {/* Animated electrons - follow wire paths precisely */}
                                {state.stage === 'charging' && (
                                    <>
                                        {/* Electrons through C1 - follow horizontal rails then vertical through capacitor */}
                                        {[0, 1].map(i => (
                                            <circle key={`c1-${i}`} r="5" fill="#60a5fa" filter="url(#glow)">
                                                <animate
                                                    attributeName="cx"
                                                    values="100;100;100;200;200;200;200;100"
                                                    dur="3s"
                                                    begin={`${i * 1.5}s`}
                                                    repeatCount="indefinite"
                                                />
                                                <animate
                                                    attributeName="cy"
                                                    values="340;200;60;60;175;200;340;340"
                                                    dur="3s"
                                                    begin={`${i * 1.5}s`}
                                                    repeatCount="indefinite"
                                                />
                                            </circle>
                                        ))}
                                        {/* Electrons through C2 - follow horizontal rails then vertical through capacitor */}
                                        {[0, 1].map(i => (
                                            <circle key={`c2-${i}`} r="5" fill="#60a5fa" filter="url(#glow)">
                                                <animate
                                                    attributeName="cx"
                                                    values="100;100;100;350;350;350;350;100"
                                                    dur="3s"
                                                    begin={`${i * 1.5 + 0.5}s`}
                                                    repeatCount="indefinite"
                                                />
                                                <animate
                                                    attributeName="cy"
                                                    values="340;200;60;60;175;200;340;340"
                                                    dur="3s"
                                                    begin={`${i * 1.5 + 0.5}s`}
                                                    repeatCount="indefinite"
                                                />
                                            </circle>
                                        ))}
                                        {/* Electrons through C3 - follow horizontal rails then vertical through capacitor */}
                                        {[0, 1].map(i => (
                                            <circle key={`c3-${i}`} r="5" fill="#60a5fa" filter="url(#glow)">
                                                <animate
                                                    attributeName="cx"
                                                    values="100;100;100;500;500;500;500;100"
                                                    dur="3s"
                                                    begin={`${i * 1.5 + 1}s`}
                                                    repeatCount="indefinite"
                                                />
                                                <animate
                                                    attributeName="cy"
                                                    values="340;200;60;60;175;200;340;340"
                                                    dur="3s"
                                                    begin={`${i * 1.5 + 1}s`}
                                                    repeatCount="indefinite"
                                                />
                                            </circle>
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </svg>
                </div>

                {/* Navigation Arrow - Left */}
                <button className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default CapacitorCircuit;
