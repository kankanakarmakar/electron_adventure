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

    // Hardware interaction - Enter key map
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (state.stage === 'initial' || state.stage === 'discharged') {
                    // Connect sequence
                    socket.emit('updateState', { stage: 'connecting' });
                    setTimeout(() => socket.emit('updateState', { stage: 'charging' }), 500);
                    setTimeout(() => socket.emit('updateState', { stage: 'charged' }), 6000);
                } else if (state.stage === 'charged') {
                    // Disconnect sequence
                    socket.emit('updateState', { stage: 'disconnecting' });
                    setTimeout(() => socket.emit('updateState', { stage: 'discharge' }), 800);
                    // Slower discharge: 0.0015 per 45ms = ~30s
                    setTimeout(() => socket.emit('updateState', { stage: 'discharged' }), 30000);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.stage]);

    // Animation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimation(prev => {
                const newState = { ...prev };

                // Charging animation
                if (state.stage === 'charging') {
                    newState.chargeLevel = Math.min(1, prev.chargeLevel + 0.0075);
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

                // Discharging animation - Much slower for realistic discharge
                if (state.stage === 'discharge') {
                    // Very slow discharge (0.0015 decrement) for realistic gradual dimming
                    newState.chargeLevel = Math.max(0, prev.chargeLevel - 0.0015);
                    newState.fieldStrength = newState.chargeLevel;
                    // Bulb brightness tracks charge level with exponential decay feel (Bright -> Dim)
                    newState.bulbGlow = Math.pow(newState.chargeLevel, 0.7);
                    newState.dischargingTime += 0.045;
                    // Much slower electrons during discharge for realistic effect
                    newState.electronPhase = (prev.electronPhase - 0.04) % (Math.PI * 2);
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

    const wireColor = (state.stage === 'charging' || state.stage === 'charged') ? '#3b82f6' :
        (state.stage === 'discharge' || state.stage === 'discharged') ? '#eab308' : '#64748b';

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
    const renderBulb = (cx: number, cy: number, brightness: number, isOn: boolean) => {
        const brightnessPercent = Math.round(brightness * 100);
        return (
            <g transform={`translate(${cx}, ${cy})`}>
                {/* Large outer glow effect - multiple layers */}
                {isOn && brightness > 0 && (
                    <>
                        {/* Outermost glow */}
                        <circle cx="0" cy="0" r="70" fill={`rgba(253, 224, 71, ${brightness * 0.1})`}>
                            <animate attributeName="r" values="70;75;70" dur="2s" repeatCount="indefinite" />
                        </circle>
                        {/* Middle glow */}
                        <circle cx="0" cy="0" r="55" fill={`rgba(253, 224, 71, ${brightness * 0.25})`}>
                            <animate attributeName="r" values="55;58;55" dur="1.8s" repeatCount="indefinite" />
                        </circle>
                        {/* Inner glow */}
                        <circle cx="0" cy="0" r="42" fill={`rgba(253, 224, 71, ${brightness * 0.4})`}>
                            <animate attributeName="r" values="42;45;42" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                    </>
                )}

                {/* Bulb glass - large yellow circle */}
                <circle
                    cx="0"
                    cy="0"
                    r="32"
                    fill={isOn ? `rgba(253, 224, 71, ${0.6 + brightness * 0.4})` : '#f3f4f6'}
                    stroke={isOn ? '#fbbf24' : '#9ca3af'}
                    strokeWidth="3"
                />

                {/* Wavy filament symbol (~) */}
                <text
                    x="0"
                    y="8"
                    textAnchor="middle"
                    fontSize="32"
                    fontWeight="bold"
                    fill={isOn ? `rgba(234, 179, 8, ${0.7 + brightness * 0.3})` : '#9ca3af'}
                >
                    ~
                </text>

                {/* Bottom Terminal (Base) - gray rectangle */}
                <rect x="-14" y="30" width="28" height="18" rx="4" fill="#6b7280" stroke="#4b5563" strokeWidth="2" />

                {/* Wire connection points on terminal */}
                <circle cx="-7" cy="48" r="4" fill="#4b5563" />
                <circle cx="7" cy="48" r="4" fill="#4b5563" />

                {/* Percentage indicator */}
                {isOn && (
                    <text
                        x="55"
                        y="5"
                        textAnchor="start"
                        fontSize="16"
                        fontWeight="bold"
                        fill="#eab308"
                    >
                        ⚡{brightnessPercent}%
                    </text>
                )}
            </g>
        );
    };

    return (
        <div className="h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-slate-100 relative overflow-hidden flex items-center justify-center p-8">
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
                    <svg viewBox="0 0 800 450" className="w-[90%] h-auto max-h-[60vh]" preserveAspectRatio="xMidYMid meet">
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
                                <stop offset="100%" stopColor={`rgba(236, 72, 153, ${animation.fieldStrength * 0.9})`} />
                            </linearGradient>
                            <radialGradient id="bulbRadiant" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                <stop offset="0%" stopColor={`rgba(253, 224, 71, ${animation.bulbGlow})`} />
                                <stop offset="100%" stopColor="rgba(253, 224, 71, 0)" />
                            </radialGradient>
                            <filter id="bulbGlow">
                                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>


                        {/* Simple Circuit - Battery Left, Capacitor Top, Bulb Right */}
                        {state.mode === 'simple' && (
                            <>
                                {/* Top wire - from left to capacitor */}
                                <line x1="60" y1="80" x2="300" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                {/* Top wire - from capacitor to right */}
                                <line x1="400" y1="80" x2="640" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />

                                {/* Right vertical wire - different based on whether bulb is shown */}
                                {(state.stage === 'discharge' || state.stage === 'discharged') ? (
                                    <>
                                        {/* Wire to bulb top (glass edge at y=168) */}
                                        <line x1="640" y1="80" x2="640" y2="168" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                        {/* Bulb - Only visible during discharge */}
                                        {renderBulb(640, 200, animation.bulbGlow, true)}
                                        {/* Wire from bulb bottom terminal (ends at y=248) */}
                                        <line x1="640" y1="248" x2="640" y2="320" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    </>
                                ) : (
                                    /* Full vertical wire when no bulb */
                                    <line x1="640" y1="80" x2="640" y2="320" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                )}

                                {/* Bottom wire */}
                                {state.stage !== 'discharge' && state.stage !== 'discharged' ? (
                                    <>
                                        {/* Bottom wire to Battery */}
                                        <line x1="640" y1="320" x2="410" y2="320" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                        <line x1="290" y1="320" x2="60" y2="320" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    </>
                                ) : (
                                    <>
                                        {/* Complete bottom wire when battery is disconnected */}
                                        <line x1="640" y1="320" x2="60" y2="320" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    </>
                                )}

                                {/* Left vertical wire */}
                                <line x1="60" y1="320" x2="60" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />

                                {/* Wires to capacitor */}
                                <line x1="300" y1="80" x2="320" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                <line x1="380" y1="80" x2="400" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />

                                {/* Capacitor - Top */}
                                <g transform="translate(350, 20)">
                                    {/* Left plate */}
                                    <rect x="-35" y="30" width="14" height="80" rx="3" fill={`rgba(59, 130, 246, ${0.5 + animation.chargeLevel * 0.5})`} stroke="#3b82f6" strokeWidth="2" />
                                    <text x="-50" y="75" textAnchor="end" fontSize="16" fontWeight="900" fill="#1e40af">−</text>
                                    {/* Field */}
                                    <rect x="-21" y="30" width="42" height="80" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.7} rx="2" />
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
                                    {/* Right plate */}
                                    <rect x="21" y="30" width="14" height="80" rx="3" fill={`rgba(236, 72, 153, ${0.5 + animation.chargeLevel * 0.5})`} stroke="#ec4899" strokeWidth="2" />
                                    <text x="50" y="75" textAnchor="start" fontSize="16" fontWeight="900" fill="#be185d">+</text>
                                    {/* Labels - Left side, placed above and below the wire (which enters at relative y=60) */}
                                    <text x="-55" y="45" textAnchor="end" fontSize="16" fontWeight="bold" fill="#1e293b">C₁</text>
                                    <text x="-55" y="85" textAnchor="end" fontSize="13" fontWeight="bold" fill="#475569">{state.capacitance}µF</text>
                                </g>

                                {/* Battery - Bottom (only during charging phases) */}
                                {state.stage !== 'discharge' && state.stage !== 'discharged' && (
                                    <g transform="translate(350, 260)">
                                        <text x="0" y="-5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#475569">Battery</text>
                                        <rect x="-55" y="10" width="110" height="70" rx="12" fill="#475569" stroke="#1e293b" strokeWidth="2" />
                                        {/* Red Terminal (Left) */}
                                        <rect x="-63" y="25" width="12" height="40" rx="3" fill="#dc2626" />
                                        <circle cx="-20" cy="45" r="18" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2" />
                                        <text x="-20" y="52" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">+</text>

                                        {/* Green Terminal (Right) */}
                                        <circle cx="20" cy="45" r="18" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="2" />
                                        <text x="20" y="52" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">−</text>
                                        <rect x="51" y="25" width="12" height="40" rx="3" fill="#16a34a" />

                                        <text x="0" y="100" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1e293b">{state.voltage}V</text>
                                    </g>
                                )}

                                {/* Animated electrons - CCW Loop (charging) */}
                                {state.stage === 'charging' && (
                                    <>
                                        {[0, 1, 2, 3, 4, 5].map(i => (
                                            <circle key={i} r="5" fill="#60a5fa" filter="url(#glow)">
                                                <animate
                                                    attributeName="cx"
                                                    values="350;640;640;60;60;350"
                                                    dur="3s"
                                                    begin={`${i * 0.5}s`}
                                                    repeatCount="indefinite"
                                                />
                                                <animate
                                                    attributeName="cy"
                                                    values="320;320;80;80;320;320"
                                                    dur="3s"
                                                    begin={`${i * 0.5}s`}
                                                    repeatCount="indefinite"
                                                />
                                            </circle>
                                        ))}
                                    </>
                                )}

                                {/* Animated electrons - Discharge through bulb (slower) */}
                                {state.stage === 'discharge' && (
                                    <>
                                        {[0, 1, 2, 3].map(i => (
                                            <circle key={i} r="5" fill="#fbbf24" filter="url(#glow)">
                                                <animate
                                                    attributeName="cx"
                                                    values="350;60;60;640;640;350"
                                                    dur="5s"
                                                    begin={`${i * 1.25}s`}
                                                    repeatCount="indefinite"
                                                />
                                                <animate
                                                    attributeName="cy"
                                                    values="80;80;320;320;80;80"
                                                    dur="5s"
                                                    begin={`${i * 1.25}s`}
                                                    repeatCount="indefinite"
                                                />
                                            </circle>
                                        ))}
                                    </>
                                )}
                            </>
                        )}

                        {/* Series Circuit - Redesigned: Battery Left, Caps Top, Bulb Right */}
                        {state.mode === 'series' && (
                            <>
                                {/* Top horizontal wire segments */}
                                <line x1="100" y1="80" x2="195" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                <line x1="245" y1="80" x2="325" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                <line x1="375" y1="80" x2="455" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                <line x1="505" y1="80" x2="600" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />

                                {/* Return wire (Bottom) */}
                                <line x1="100" y1="320" x2="600" y2="320" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />

                                {/* Capacitor 1 */}
                                <g transform="translate(220, 80)">
                                    {/* Left plate */}
                                    <rect x="-25" y="-35" width="12" height="70" rx="3" fill={`rgba(59, 130, 246, ${0.5 + animation.chargeLevel * 0.5})`} stroke="#3b82f6" strokeWidth="2" />
                                    <text x="-40" y="5" textAnchor="end" fontSize="16" fontWeight="900" fill="#1e40af">−</text>
                                    {/* Field */}
                                    <rect x="-13" y="-35" width="26" height="70" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.7} rx="2" />
                                    {/* Dots */}
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
                                    {/* Right plate */}
                                    <rect x="13" y="-35" width="12" height="70" rx="3" fill={`rgba(236, 72, 153, ${0.5 + animation.chargeLevel * 0.5})`} stroke="#ec4899" strokeWidth="2" />
                                    <text x="40" y="5" textAnchor="start" fontSize="16" fontWeight="900" fill="#be185d">+</text>
                                    {/* Labels - Left side */}
                                    <text x="-40" y="-25" textAnchor="end" fontSize="16" fontWeight="bold" fill="#1e293b">C₁</text>
                                    <text x="-40" y="25" textAnchor="end" fontSize="13" fontWeight="bold" fill="#475569">{state.capacitance}µF</text>
                                </g>

                                {/* Capacitor 2 */}
                                <g transform="translate(350, 80)">
                                    {/* Left plate */}
                                    <rect x="-25" y="-35" width="12" height="70" rx="3" fill={`rgba(59, 130, 246, ${0.5 + animation.chargeLevel * 0.5})`} stroke="#3b82f6" strokeWidth="2" />
                                    <text x="-40" y="5" textAnchor="end" fontSize="16" fontWeight="900" fill="#1e40af">−</text>
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
                                    <text x="40" y="5" textAnchor="start" fontSize="16" fontWeight="900" fill="#be185d">+</text>
                                    {/* Labels - Left side */}
                                    <text x="-40" y="-25" textAnchor="end" fontSize="16" fontWeight="bold" fill="#1e293b">C₂</text>
                                    <text x="-40" y="25" textAnchor="end" fontSize="13" fontWeight="bold" fill="#475569">{state.capacitance2}µF</text>
                                </g>

                                {/* Capacitor 3 */}
                                <g transform="translate(480, 80)">
                                    {/* Left plate */}
                                    <rect x="-25" y="-35" width="12" height="70" rx="3" fill={`rgba(59, 130, 246, ${0.5 + animation.chargeLevel * 0.5})`} stroke="#3b82f6" strokeWidth="2" />
                                    <text x="-40" y="5" textAnchor="end" fontSize="16" fontWeight="900" fill="#1e40af">−</text>
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
                                    <text x="40" y="5" textAnchor="start" fontSize="16" fontWeight="900" fill="#be185d">+</text>
                                    {/* Labels - Left side */}
                                    <text x="-40" y="-25" textAnchor="end" fontSize="16" fontWeight="bold" fill="#1e293b">C₃</text>
                                    <text x="-40" y="25" textAnchor="end" fontSize="13" fontWeight="bold" fill="#475569">{state.capacitance3}µF</text>
                                </g>

                                {/* Battery - Left Side */}
                                {(state.stage !== 'discharge' && state.stage !== 'discharged') && (
                                    <>
                                        {/* Wire from top rail (y=80) to battery top terminal (y=145) */}
                                        <line x1="100" y1="80" x2="100" y2="145" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                        {/* Wire from battery bottom terminal (y=255) to bottom rail (y=320) */}
                                        <line x1="100" y1="255" x2="100" y2="320" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />

                                        {/* Battery body - rendered after wires so it's on top */}
                                        <g transform="translate(100, 200)">
                                            <rect x="-30" y="-50" width="60" height="100" rx="10" fill="#475569" stroke="#1e293b" strokeWidth="2" />
                                            {/* Red Terminal (Top) */}
                                            <rect x="-10" y="-55" width="20" height="10" rx="3" fill="#dc2626" />
                                            {/* Green Terminal (Bottom) */}
                                            <rect x="-10" y="45" width="20" height="10" rx="3" fill="#16a34a" />

                                            <circle cx="0" cy="-20" r="15" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="2" />
                                            <text x="0" y="-14" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">+</text>

                                            <circle cx="0" cy="20" r="15" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2" />
                                            <text x="0" y="26" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">−</text>

                                            <text x="-45" y="-5" textAnchor="end" fontSize="11" fontWeight="bold" fill="#1e293b">Battery</text>
                                            <text x="-45" y="12" textAnchor="end" fontSize="13" fontWeight="bold" fill="#1e293b">{state.voltage}V</text>
                                        </g>
                                    </>
                                )}

                                {/* Right vertical wire - conditional based on discharge stage */}
                                {(state.stage === 'discharge' || state.stage === 'discharged') ? (
                                    <>
                                        {/* Wire to bulb top (glass edge at y=168) */}
                                        <line x1="600" y1="80" x2="600" y2="168" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                        {/* Bulb - Only visible during discharge */}
                                        {renderBulb(600, 200, animation.bulbGlow, true)}
                                        {/* Wire from bulb bottom terminal (ends at y=248) */}
                                        <line x1="600" y1="248" x2="600" y2="320" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    </>
                                ) : (
                                    /* Full vertical wire when no bulb */
                                    <line x1="600" y1="80" x2="600" y2="320" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                )}

                                {/* Left vertical wire - only during discharge when no battery */}
                                {(state.stage === 'discharge' || state.stage === 'discharged') && (
                                    <line x1="100" y1="320" x2="100" y2="80" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                )}


                                {/* Animated electrons - Series path (Realistic Flow: Negative to Positive -> CCW) */}
                                {/* Bottom (-) -> Right -> Top -> Left -> Top (+) */}
                                {state.stage === 'charging' && (
                                    <>
                                        {[0, 1, 2, 3, 4, 5].map(i => (
                                            <circle key={i} r="5" fill="#60a5fa" filter="url(#glow)">
                                                <animate
                                                    attributeName="cx"
                                                    values="100;600;600;480;350;220;100;100;100"
                                                    dur="4s"
                                                    begin={`${i * 0.66}s`}
                                                    repeatCount="indefinite"
                                                />
                                                <animate
                                                    attributeName="cy"
                                                    values="320;320;80;80;80;80;80;200;320"
                                                    dur="4s"
                                                    begin={`${i * 0.66}s`}
                                                    repeatCount="indefinite"
                                                />
                                            </circle>
                                        ))}
                                    </>
                                )}

                                {/* Animated electrons - Discharge through bulb (slower) */}
                                {state.stage === 'discharge' && (
                                    <>
                                        {[0, 1, 2, 3].map(i => (
                                            <circle key={i} r="5" fill="#fbbf24" filter="url(#glow)">
                                                <animate
                                                    attributeName="cx"
                                                    values="480;220;100;100;600;600;480"
                                                    dur="6s"
                                                    begin={`${i * 1.5}s`}
                                                    repeatCount="indefinite"
                                                />
                                                <animate
                                                    attributeName="cy"
                                                    values="80;80;80;320;320;80;80"
                                                    dur="6s"
                                                    begin={`${i * 1.5}s`}
                                                    repeatCount="indefinite"
                                                />
                                            </circle>
                                        ))}
                                    </>
                                )}
                            </>
                        )}

                        {/* Parallel Circuit - Spaced Out & Realistic Flow */}
                        {state.mode === 'parallel' && (
                            <>
                                {/* Top rail */}
                                <line x1="100" y1="60" x2="700" y2="60" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                {/* Bottom rail */}
                                <line x1="100" y1="340" x2="700" y2="340" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />

                                {/* Capacitor 1 (Left) - Shifted to 250 */}
                                <g transform="translate(250, 200)">
                                    <line x1="0" y1="-140" x2="0" y2="-25" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    <line x1="0" y1="25" x2="0" y2="140" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    <rect x="-35" y="-20" width="70" height="8" rx="2" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#3b82f6" strokeWidth="1.5" filter="url(#glow)" />
                                    <rect x="-35" y="12" width="70" height="8" rx="2" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#ec4899" strokeWidth="1.5" filter="url(#glow)" />
                                    <rect x="-35" y="-12" width="70" height="24" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.8} rx="2" />
                                    {/* +/- on the plates */}
                                    <text x="-50" y="-12" textAnchor="middle" fontSize="16" fontWeight="900" fill="#1e40af">−</text>
                                    <text x="-50" y="20" textAnchor="middle" fontSize="16" fontWeight="900" fill="#be185d">+</text>
                                    {/* Capacitor Label - Left side */}
                                    <text x="-55" y="-35" textAnchor="end" fontSize="16" fontWeight="bold" fill="#1e293b">C₁</text>
                                    <text x="-55" y="-18" textAnchor="end" fontSize="13" fontWeight="bold" fill="#475569">{state.capacitance}µF</text>
                                </g>

                                {/* Capacitor 2 (Middle) - Shifted to 400 */}
                                <g transform="translate(400, 200)">
                                    <line x1="0" y1="-140" x2="0" y2="-25" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    <line x1="0" y1="25" x2="0" y2="140" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    <rect x="-35" y="-20" width="70" height="8" rx="2" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#3b82f6" strokeWidth="1.5" filter="url(#glow)" />
                                    <rect x="-35" y="12" width="70" height="8" rx="2" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#ec4899" strokeWidth="1.5" filter="url(#glow)" />
                                    <rect x="-35" y="-12" width="70" height="24" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.8} rx="2" />
                                    {/* +/- on the plates */}
                                    <text x="-50" y="-12" textAnchor="middle" fontSize="16" fontWeight="900" fill="#1e40af">−</text>
                                    <text x="-50" y="20" textAnchor="middle" fontSize="16" fontWeight="900" fill="#be185d">+</text>
                                    {/* Capacitor Label - Left side */}
                                    <text x="-55" y="-35" textAnchor="end" fontSize="16" fontWeight="bold" fill="#1e293b">C₂</text>
                                    <text x="-55" y="-18" textAnchor="end" fontSize="13" fontWeight="bold" fill="#475569">{state.capacitance2}µF</text>
                                </g>

                                {/* Capacitor 3 (Right) - Shifted to 550 */}
                                <g transform="translate(550, 200)">
                                    <line x1="0" y1="-140" x2="0" y2="-25" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    <line x1="0" y1="25" x2="0" y2="140" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    <rect x="-35" y="-20" width="70" height="8" rx="2" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#3b82f6" strokeWidth="1.5" filter="url(#glow)" />
                                    <rect x="-35" y="12" width="70" height="8" rx="2" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#ec4899" strokeWidth="1.5" filter="url(#glow)" />
                                    <rect x="-35" y="-12" width="70" height="24" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.8} rx="2" />
                                    {/* +/- on the plates */}
                                    <text x="-50" y="-12" textAnchor="middle" fontSize="16" fontWeight="900" fill="#1e40af">−</text>
                                    <text x="-50" y="20" textAnchor="middle" fontSize="16" fontWeight="900" fill="#be185d">+</text>
                                    {/* Capacitor Label - Left side */}
                                    <text x="-55" y="-35" textAnchor="end" fontSize="16" fontWeight="bold" fill="#1e293b">C₃</text>
                                    <text x="-55" y="-18" textAnchor="end" fontSize="13" fontWeight="bold" fill="#475569">{state.capacitance3}µF</text>
                                </g>

                                {/* Battery - Left Side - Cleaned up */}
                                {state.stage !== 'discharge' && state.stage !== 'discharged' ? (
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

                                        <text x="-45" y="-5" textAnchor="end" fontSize="11" fontWeight="bold" fill="#1e293b">Battery</text>
                                        <text x="-45" y="12" textAnchor="end" fontSize="13" fontWeight="bold" fill="#1e293b">{state.voltage}V</text>
                                    </g>
                                ) : (
                                    <line x1="100" y1="60" x2="100" y2="340" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                )}

                                {/* Right side vertical wire - conditional based on discharge stage */}
                                {(state.stage === 'discharge' || state.stage === 'discharged') ? (
                                    <>
                                        {/* Wire to bulb top (glass edge at y=168) */}
                                        <line x1="700" y1="60" x2="700" y2="168" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                        {/* Bulb - Only visible during discharge */}
                                        {renderBulb(700, 200, animation.bulbGlow, true)}
                                        {/* Wire from bulb bottom terminal (ends at y=248) */}
                                        <line x1="700" y1="248" x2="700" y2="340" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                    </>
                                ) : (
                                    /* Full vertical wire when no bulb */
                                    <line x1="700" y1="60" x2="700" y2="340" stroke={wireColor} strokeWidth="4" strokeLinecap="round" />
                                )}

                                {/* Animated electrons - Parallel Path CCW */}
                                {state.stage === 'charging' && (
                                    <>
                                        {/* Path through branches: Bottom(Right) -> Up(Branch) -> Top(Left) */}
                                        {[250, 400, 550].map((x, branchIdx) => (
                                            <g key={branchIdx}>
                                                {[0, 1].map(i => (
                                                    <circle key={i} r="5" fill="#60a5fa" filter="url(#glow)">
                                                        <animate
                                                            attributeName="cx"
                                                            values={`100;${x};${x};100;100`}
                                                            dur="4s"
                                                            begin={`${i * 2 + branchIdx * 0.5}s`}
                                                            repeatCount="indefinite"
                                                        />
                                                        <animate
                                                            attributeName="cy"
                                                            values={`340;340;60;60;340`}
                                                            dur="4s"
                                                            begin={`${i * 2 + branchIdx * 0.5}s`}
                                                            repeatCount="indefinite"
                                                        />
                                                    </circle>
                                                ))}
                                            </g>
                                        ))}
                                    </>
                                )}

                                {/* Animated electrons - Discharge through bulb (slower) */}
                                {state.stage === 'discharge' && (
                                    <>
                                        {[250, 400, 550].map((x, branchIdx) => (
                                            <g key={branchIdx}>
                                                {[0, 1].map(i => (
                                                    <circle key={i} r="5" fill="#fbbf24" filter="url(#glow)">
                                                        <animate
                                                            attributeName="cx"
                                                            values={`${x};${x};700;700;100;100;${x}`}
                                                            dur="6s"
                                                            begin={`${i * 3 + branchIdx * 0.7}s`}
                                                            repeatCount="indefinite"
                                                        />
                                                        <animate
                                                            attributeName="cy"
                                                            values={`60;340;340;60;60;340;340`}
                                                            dur="6s"
                                                            begin={`${i * 3 + branchIdx * 0.7}s`}
                                                            repeatCount="indefinite"
                                                        />
                                                    </circle>
                                                ))}
                                            </g>
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
            </div >
        </div >
    );
};

export default CapacitorCircuit;
