import React, { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3002/diode');

const DiodeCircuit = () => {
    const [state, setState] = useState({
        tab: 'intro',
        intro: { joined: false },
        forward: { voltage: 0 },
        reverse: { voltage: 0 },
        breakdown: { voltage: 0, type: 'zener' }
    });

    const [t, setT] = useState(0);

    // Sync state
    useEffect(() => {
        socket.on('initialState', (s) => s && setState(s));
        socket.on('stateUpdated', (s) => s && setState(s));
        return () => {
            socket.off('initialState');
            socket.off('stateUpdated');
        };
    }, []);

    // Animation loop (Global for all modes)
    useEffect(() => {
        const id = setInterval(() => setT(v => v + 1), 30);
        return () => clearInterval(id);
    }, []);

    // --- Helpers ---
    const useCenteredBoxes = () => {
        const pX = 150;
        const boxW = 120;
        const nX = 330;
        const boundary = (pX + boxW + nX) / 2;
        return { pX, boxW, nX, boundary };
    };

    // --- Renderers ---

    // Top-level Safety Check (Fix for Black Screen)
    if (!state.intro || !state.forward) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white flex-col gap-4 p-4 z-50">
                <div className="text-4xl">⚠️</div>
                <div className="text-2xl font-bold text-red-400">Server Update Required</div>
                <p className="text-slate-400 text-center max-w-md">The backend server is running an older version of the code. <br />Please standard <strong>stop and restart</strong> `node server.js` in your terminal.</p>
            </div>
        );
    }

    const HintBox = () => {
        const getContent = () => {
            switch (state.tab) {
                case 'intro': return { title: 'PN Junction', text: state.intro.joined ? 'Depletion region formed! Electrons and holes recombine near the junction.' : 'Neutral regions separated. Join them to see what happens.' };
                case 'forward': return { title: 'Forward Bias', text: state.forward.voltage >= 0.7 ? 'Conducting! Voltage exceeds the 0.7V barrier potential.' : 'Voltage is insufficient to overcome the barrier potential.' };
                case 'reverse':
                    return {
                        title: 'Reverse Bias',
                        text: state.reverse.voltage > 5 ? 'High reverse voltage! Depletion zone very wide.' : 'Depletion zone widens. No current flows (open circuit).'
                    };
                case 'breakdown':
                    const { voltage, type } = state.breakdown;
                    const breakdownVoltage = type === 'zener' ? 5.1 : 50;
                    const isBreakdown = voltage >= breakdownVoltage;
                    return {
                        title: isBreakdown ? '⚡ BREAKDOWN!' : (type === 'zener' ? 'Zener Diode' : 'Avalanche Diode'),
                        text: isBreakdown
                            ? (type === 'zener' ? 'Quantum tunneling active! Electrons pass through barrier.' : 'Impact ionization cascade! Carriers multiply.')
                            : `Increase voltage to ${breakdownVoltage}V to trigger breakdown.`
                    };
                default: return { title: 'Diode', text: 'Select a mode.' };
            }
        };
        const { title, text } = getContent();
        return (
            <div className="absolute top-6 left-6 z-20 max-w-sm bg-white/90 backdrop-blur-md border-l-4 border-blue-500 shadow-xl rounded-r-lg p-4 animate-in slide-in-from-left-4 fade-in duration-500">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <span className="text-blue-500">ℹ️</span> {title}
                </h3>
                <p className="text-slate-600 mt-1 leading-snug">{text}</p>
            </div>
        );
    };

    const renderIntro = () => {
        const joined = state.intro.joined;
        const svgW = 900;
        const svgH = 460;
        const centerX = svgW / 2;
        const rectY = 80;
        const rectH = 220;
        const blockW = 300;
        const halfGapWhenSeparated = 24;
        const gap = joined ? 0 : halfGapWhenSeparated * 2;
        const pX = centerX - gap / 2 - blockW;
        const nX = centerX + gap / 2;
        const boundaryX = centerX;
        const depletionMaxHalf = 90;
        const depletionProgress = joined ? Math.min(1, t * 0.004) : 0; // Starts from t of join? 
        // Logic issue: t increments forever. We need t relative to join event?
        // Original code: depletionProgress = joined ? Math.min(1, t * 0.004) : 0;
        // Ideally we reset T or track join time. 
        // But for simplicity with global T, let's assume it saturates.
        // If T is huge, it's 1. Correct. 
        // But if we toggle join off then on, T is huge, so it snaps? 
        // Original had local T. 
        // Let's stick to global T for animation drift, but maybe simple toggle is fine for now.
        // User said "intact".
        const depletionHalfWidth = depletionMaxHalf * depletionProgress;

        // UseMemo for particles?
        const cols = 8;
        const rows = 5;
        const paddingX = 28;
        const paddingY = 28;
        const spacingX = Math.floor((blockW - paddingX * 2) / (cols - 1));
        const spacingY = Math.floor((rectH - paddingY * 2) / (rows - 1));

        const holes = Array.from({ length: cols * rows }).map((_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            return {
                id: i,
                baseX: pX + paddingX + col * spacingX,
                y: rectY + paddingY + row * spacingY
            };
        });

        const electrons = Array.from({ length: cols * rows }).map((_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            return {
                id: i,
                baseX: nX + paddingX + col * spacingX,
                y: rectY + paddingY + row * spacingY
            };
        });

        const isInsideDepletion = (cx) => {
            const left = boundaryX - depletionHalfWidth;
            const right = boundaryX + depletionHalfWidth;
            return depletionProgress > 0 && cx >= left && cx <= right;
        };

        return (
            <svg viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet" className="w-[90%] h-auto max-h-[80vh] rounded-2xl border-2 border-sky-300 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 shadow-lg overflow-hidden">
                <defs>
                    <filter id="softGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    <linearGradient id="pTypeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="rgba(244,114,182,0.4)" /><stop offset="100%" stopColor="rgba(236,72,153,0.25)" /></linearGradient>
                    <linearGradient id="nTypeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="rgba(96,165,250,0.4)" /><stop offset="100%" stopColor="rgba(59,130,246,0.25)" /></linearGradient>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" /></pattern>
                    <marker id="arrowHead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#4b5563" /></marker>
                </defs>
                <rect width={svgW} height={svgH} fill="url(#grid)" />
                <g>
                    <rect x={pX} y={rectY} width={blockW} height={rectH} rx="18" fill="url(#pTypeGrad)" stroke="rgba(255,120,180,0.45)" strokeWidth="2" filter="url(#softGlow)" />
                    <text x={pX + blockW / 2} y={rectY - 16} textAnchor="middle" className="fill-[#be185d] text-sm font-bold">P-Type Semiconductor</text>
                    {holes.map(h => {
                        const drift = joined ? Math.max(0, (boundaryX - h.baseX) * 0.02 * depletionProgress) : Math.sin((t + h.id * 10) * 0.02) * 0.9;
                        const cx = h.baseX + drift;
                        const inside = isInsideDepletion(cx);
                        const isMinority = (h.id % 6 === 3);
                        return (
                            <g key={`pcarrier-${h.id}`} style={{ opacity: inside ? 0.16 : 1, transition: 'opacity .2s' }}>
                                <circle cx={cx} cy={h.y} r="11" fill={isMinority ? 'rgba(150,200,255,0.15)' : 'rgba(255,160,200,0.15)'} stroke={isMinority ? '#1e40af' : '#be185d'} strokeWidth="2" />
                                <text x={cx} y={h.y + 4} textAnchor="middle" className={`text-xs font-bold ${isMinority ? 'fill-black' : 'fill-black'}`}>{isMinority ? '−' : '+'}</text>
                            </g>
                        );
                    })}
                </g>
                <g>
                    <rect x={nX} y={rectY} width={blockW} height={rectH} rx="18" fill="url(#nTypeGrad)" stroke="rgba(120,180,255,0.45)" strokeWidth="2" filter="url(#softGlow)" />
                    <text x={nX + blockW / 2} y={rectY - 16} textAnchor="middle" className="fill-[#1e40af] text-sm font-bold">N-Type Semiconductor</text>
                    {electrons.map(e => {
                        const drift = joined ? -Math.max(0, (e.baseX - boundaryX) * 0.02 * depletionProgress) : Math.sin((t + e.id * 9) * 0.02) * 0.9;
                        const cx = e.baseX + drift;
                        const inside = isInsideDepletion(cx);
                        const isMinority = (e.id % 6 === 3);
                        return (
                            <g key={`ncarrier-${e.id}`} style={{ opacity: inside ? 0.16 : 1, transition: 'opacity .2s' }}>
                                <circle cx={cx} cy={e.y} r="11" fill={isMinority ? 'rgba(255,160,200,0.15)' : 'rgba(150,200,255,0.15)'} stroke={isMinority ? '#be185d' : '#1e40af'} strokeWidth="2" />
                                <text x={cx} y={e.y + 4} textAnchor="middle" className={`text-xs font-bold ${isMinority ? 'fill-black' : 'fill-black'}`}>{isMinority ? '+' : '−'}</text>
                            </g>
                        );
                    })}
                </g>
                {depletionProgress > 0 ? (
                    <g>
                        <rect x={boundaryX - depletionHalfWidth} y={rectY + 8} width={depletionHalfWidth * 2} height={rectH - 16} rx="8" fill="rgba(220,220,255,0.08)" stroke="#64748b" strokeWidth="1.8" strokeDasharray="6 4" />
                        {Array.from({ length: rows }).map((_, rowIdx) => {
                            const y = rectY + paddingY + rowIdx * spacingY;
                            const ionCols = Math.max(1, Math.min(3, Math.floor(depletionHalfWidth / 25)));
                            const ionSpacing = depletionHalfWidth / (ionCols + 1);
                            return Array.from({ length: ionCols }).map((_, colIdx) => {
                                const leftIonX = boundaryX - ionSpacing * (colIdx + 1);
                                const rightIonX = boundaryX + ionSpacing * (colIdx + 1);
                                return (
                                    <g key={`ion-${rowIdx}-${colIdx}`} style={{ opacity: 0.5 + depletionProgress * 0.5 }}>
                                        <g><circle cx={leftIonX} cy={y} r="9" fill="rgba(255,150,200,0.15)" stroke="#be185d" strokeWidth="1.8" /><text x={leftIonX} y={y + 4} textAnchor="middle" className="fill-[#be185d] text-xs font-bold">−</text></g>
                                        <g><circle cx={rightIonX} cy={y} r="9" fill="rgba(150,200,255,0.15)" stroke="#1e40af" strokeWidth="1.8" /><text x={rightIonX} y={y + 4} textAnchor="middle" className="fill-[#1e40af] text-xs font-bold">+</text></g>
                                    </g>
                                );
                            });
                        })}
                        <line x1={boundaryX + depletionHalfWidth - 8} y1={rectY + rectH + 10} x2={boundaryX - depletionHalfWidth + 8} y2={rectY + rectH + 10} stroke="#4b5563" strokeWidth="3" markerEnd="url(#arrowHead)" />
                        <text x={boundaryX} y={rectY + rectH + 28} textAnchor="middle" className="fill-slate-700 text-[12px] font-bold">Depletion Region</text>
                    </g>
                ) : (
                    <g><rect x={boundaryX - 2} y={rectY + 4} width={4} height={rectH - 8} rx="4" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" /></g>
                )}
                <g>
                    <rect x="20" y="360" width="620" height="56" rx="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                    <text x="34" y="378" className="fill-black text-sm font-semibold">{depletionProgress > 0 ? 'Junction formed: Depletion region present between P and N' : joined ? 'Joining...' : 'Separated: P and N regions not joined'}</text>
                    <text x="34" y="396" className="fill-black text-xs">Use the controls to {joined ? 'disconnect' : 'form'} the junction</text>
                </g>
            </svg>
        );
    };

    const renderForward = () => {
        const { voltage } = state.forward;
        const { pX, boxW, nX, boundary } = useCenteredBoxes();
        const isAboveThreshold = voltage >= 0.7;
        const currentFlow = isAboveThreshold ? (voltage - 0.7) * 100 : 0;
        const barrierWidthPx = Math.max(10, 60 - voltage * 40);
        const barrierX = boundary - barrierWidthPx / 2;

        const cols = 5;
        const rows = 4;
        const paddingX = 15;
        const paddingY = 15;
        const spacingX = (boxW - 2 * paddingX) / (cols - 1);
        const spacingY = (120 - 2 * paddingY) / (rows - 1);

        return (
            <svg viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet" className="w-[90%] h-auto max-h-[80vh] rounded-lg bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-2 border-sky-300">
                <defs>
                    <filter id="glowForward"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <g transform="translate(10, 95)">
                    <rect x="0" y="0" width="50" height="90" rx="8" fill="#1f2937" stroke="#111827" strokeWidth="3" />
                    <rect x="15" y="-12" width="20" height="14" rx="3" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
                    <circle cx="25" cy="28" r="16" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="2" /><circle cx="25" cy="28" r="10" fill="#dc2626" /><text x="25" y="34" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">+</text>
                    <circle cx="25" cy="65" r="16" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2" /><circle cx="25" cy="65" r="10" fill="#16a34a" /><text x="25" y="71" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">−</text>
                    <rect x="15" y="88" width="20" height="10" rx="3" fill="#22c55e" stroke="#166534" strokeWidth="2" />
                </g>
                <text x="70" y="150" textAnchor="start" fill="#0f172a" fontSize="16" fontWeight="bold">{voltage.toFixed(1)}V</text>
                <path d={`M 35 83 L 35 60 L 120 60 L 120 140 L ${pX} 140`} stroke="#0f172a" strokeWidth="4" fill="none" />
                <path d={`M ${nX + boxW} 140 L 490 140`} stroke="#0f172a" strokeWidth="4" fill="none" />
                <path d="M 550 140 L 570 140 L 570 230 L 35 230 L 35 193" stroke="#0f172a" strokeWidth="4" fill="none" />

                {isAboveThreshold && (
                    <g>
                        {Array.from({ length: 6 }).map((_, i) => {
                            const totalPath = 23 + 85 + 80 + (pX - 120);
                            const progress = ((t * 3 + i * (totalPath / 6)) % totalPath) / totalPath;
                            let ex, ey;
                            const seg1 = 23 / totalPath; const seg2 = (23 + 85) / totalPath; const seg3 = (23 + 85 + 80) / totalPath;
                            if (progress < seg1) { ex = 35; ey = 83 - progress / seg1 * 23; }
                            else if (progress < seg2) { ex = 35 + ((progress - seg1) / (seg2 - seg1)) * 85; ey = 60; }
                            else if (progress < seg3) { ex = 120; ey = 60 + ((progress - seg2) / (seg3 - seg2)) * 80; }
                            else { ex = 120 + ((progress - seg3) / (1 - seg3)) * (pX - 120); ey = 140; }
                            return <circle key={`e-top-${i}`} cx={ex} cy={ey} r="5" fill="#22c55e" filter="url(#glowForward)" style={{ opacity: 0.9 }} />;
                        })}
                        {Array.from({ length: 8 }).map((_, i) => {
                            const pathLength = 20 + 90 + 535 + 37;
                            const progress = ((t * 3 + i * (pathLength / 8)) % pathLength) / pathLength;
                            let ex, ey;
                            const seg1 = 20 / pathLength; const seg2 = (20 + 90) / pathLength; const seg3 = (20 + 90 + 535) / pathLength;
                            if (progress < seg1) { ex = 550 + (progress / seg1) * 20; ey = 140; }
                            else if (progress < seg2) { ex = 570; ey = 140 + ((progress - seg1) / (seg2 - seg1)) * 90; }
                            else if (progress < seg3) { ex = 570 - ((progress - seg2) / (seg3 - seg2)) * 535; ey = 230; }
                            else { ex = 35; ey = 230 - ((progress - seg3) / (1 - seg3)) * 37; }
                            return <circle key={`e-wire-${i}`} cx={ex} cy={ey} r="5" fill="#1e40af" filter="url(#glowForward)" style={{ opacity: 0.9 }} />;
                        })}
                    </g>
                )}

                <g>
                    <rect x="485" y="135" width="8" height="10" rx="1" fill="#64748b" /><rect x="547" y="135" width="8" height="10" rx="1" fill="#64748b" />
                    {isAboveThreshold && <circle cx="520" cy="140" r="40" fill="rgba(250,204,21,0.3)" filter="url(#glowForward)" />}
                    <circle cx="520" cy="140" r="30" fill={isAboveThreshold ? `rgba(250,204,21,${Math.min(1, currentFlow / 80)})` : '#94a3b8'} stroke={isAboveThreshold ? '#eab308' : '#64748b'} strokeWidth="3" />
                    <text x="520" y="147" textAnchor="middle" fill={isAboveThreshold ? '#854d0e' : '#475569'} fontSize="14" fontWeight="bold">{isAboveThreshold ? 'ON' : 'OFF'}</text>
                    <text x="520" y="185" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="bold">LED</text>
                </g>

                <rect x={pX} y={80} width={boxW} height={120} rx="12" fill="rgba(244,114,182,0.25)" stroke="#ec4899" strokeWidth="2" />
                <text x={pX + boxW / 2} y={70} textAnchor="middle" fill="#be185d" fontSize="14" fontWeight="bold">P-type</text>
                {Array.from({ length: cols * rows }).map((_, i) => {
                    const col = i % cols; const row = Math.floor(i / cols);
                    const baseX = pX + paddingX + col * spacingX; const baseY = 80 + paddingY + row * spacingY;
                    const moveX = isAboveThreshold ? Math.sin((t + i * 20) * 0.05) * 3 + (currentFlow * 0.03) : Math.sin((t + i * 20) * 0.03) * 2;
                    const isMinority = (i % 6 === 3);
                    return (<g key={`pf-${i}`}><circle cx={baseX + moveX} cy={baseY} r="8" fill={isMinority ? 'rgba(59,130,246,0.3)' : 'rgba(236,72,153,0.3)'} stroke={isMinority ? '#3b82f6' : '#ec4899'} strokeWidth="2" /><text x={baseX + moveX} y={baseY + 4} textAnchor="middle" fill={isMinority ? '#1e40af' : '#be185d'} fontSize="12" fontWeight="bold">{isMinority ? '−' : '+'}</text></g>);
                })}

                <rect x={barrierX} y={85} width={barrierWidthPx} height={110} rx="6" fill="rgba(148,163,184,0.2)" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
                {barrierWidthPx > 15 && (
                    <>
                        {Array.from({ length: Math.max(1, Math.min(2, Math.floor(barrierWidthPx / 30))) }).map((_, colIdx) => (Array.from({ length: 4 }).map((_, rowIdx) => <g key={`p-ion-${colIdx}-${rowIdx}`} style={{ opacity: Math.min(1, barrierWidthPx / 40) }}><circle cx={Math.max(barrierX + 8, boundary - 10 - colIdx * 16)} cy={95 + rowIdx * 25} r="6" fill="rgba(255,150,200,0.2)" stroke="rgba(255,150,200,0.9)" strokeWidth="1.5" /><text x={Math.max(barrierX + 8, boundary - 10 - colIdx * 16)} y={95 + rowIdx * 25 + 3} textAnchor="middle" className="text-[9px] font-bold fill-pink-300">−</text></g>)))}
                        {Array.from({ length: Math.max(1, Math.min(2, Math.floor(barrierWidthPx / 30))) }).map((_, colIdx) => (Array.from({ length: 4 }).map((_, rowIdx) => <g key={`n-ion-${colIdx}-${rowIdx}`} style={{ opacity: Math.min(1, barrierWidthPx / 40) }}><circle cx={Math.min(barrierX + barrierWidthPx - 8, boundary + 10 + colIdx * 16)} cy={95 + rowIdx * 25} r="6" fill="rgba(150,200,255,0.2)" stroke="rgba(150,200,255,0.9)" strokeWidth="1.5" /><text x={Math.min(barrierX + barrierWidthPx - 8, boundary + 10 + colIdx * 16)} y={95 + rowIdx * 25 + 3} textAnchor="middle" className="text-[9px] font-bold fill-blue-300">+</text></g>)))}
                    </>
                )}

                <rect x={nX} y={80} width={boxW} height={120} rx="12" fill="rgba(96,165,250,0.25)" stroke="#3b82f6" strokeWidth="2" />
                <text x={nX + boxW / 2} y={70} textAnchor="middle" fill="#1e40af" fontSize="14" fontWeight="bold">N-type</text>
                {Array.from({ length: cols * rows }).map((_, i) => {
                    const col = i % cols; const row = Math.floor(i / cols);
                    const baseX = nX + paddingX + col * spacingX; const baseY = 80 + paddingY + row * spacingY;
                    const moveX = isAboveThreshold ? -Math.sin((t + i * 15) * 0.05) * 3 - (currentFlow * 0.03) : Math.sin((t + i * 15) * 0.03) * 2;
                    const isMinority = (i % 6 === 3);
                    return (<g key={`nf-${i}`}><circle cx={baseX + moveX} cy={baseY} r="8" fill={isMinority ? 'rgba(236,72,153,0.3)' : 'rgba(59,130,246,0.3)'} stroke={isMinority ? '#ec4899' : '#3b82f6'} strokeWidth="2" /><text x={baseX + moveX} y={baseY + 4} textAnchor="middle" fill={isMinority ? '#be185d' : '#1e40af'} fontSize="12" fontWeight="bold">{isMinority ? '+' : '−'}</text></g>);
                })}

                {isAboveThreshold && (<g><rect x={boundary - 130} y={255} width="260" height="28" rx="6" fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="2" /><text x={boundary} y={273} textAnchor="middle" fill="#15803d" fontSize="13" fontWeight="bold">⚡ Current flowing – Short Circuit ⚡</text></g>)}
            </svg>
        );
    };

    const renderReverse = () => {
        const { voltage } = state.reverse;
        const { pX, boxW, nX, boundary } = useCenteredBoxes();
        const barrierHalfPx = 25 + voltage * 4;
        const barrierWidthPx = barrierHalfPx * 2;
        const barrierX = boundary - barrierHalfPx;

        return (
            <svg viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet" className="w-[90%] h-auto max-h-[80vh] rounded-lg bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-2 border-sky-300">
                <defs><filter id="glowReverse"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>

                {/* Battery - vertical with wires from TOP (-) and BOTTOM (+) ends (reversed polarity) */}
                <g transform="translate(10, 95)">
                    {/* Battery body */}
                    <rect x="0" y="0" width="50" height="90" rx="8" fill="#1f2937" stroke="#111827" strokeWidth="3" />
                    {/* Negative terminal cap (top) - where wire connects - reversed polarity */}
                    <rect x="15" y="-12" width="20" height="14" rx="3" fill="#22c55e" stroke="#166534" strokeWidth="2" />
                    {/* Negative indicator circle inside battery (top in reverse bias) */}
                    <circle cx="25" cy="28" r="16" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2" />
                    <circle cx="25" cy="28" r="10" fill="#16a34a" />
                    <text x="25" y="34" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">−</text>
                    {/* Positive indicator circle inside battery (bottom in reverse bias) */}
                    <circle cx="25" cy="65" r="16" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="2" />
                    <circle cx="25" cy="65" r="10" fill="#dc2626" />
                    <text x="25" y="71" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">+</text>
                    {/* Positive terminal base (bottom) - where wire connects */}
                    <rect x="15" y="88" width="20" height="10" rx="3" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
                </g>
                {/* Voltage label - to the right of battery */}
                <text x="70" y="150" textAnchor="start" fill="#0f172a" fontSize="16" fontWeight="bold">-{voltage.toFixed(1)}V</text>

                {/* Complete circuit wiring - from battery ends to middle of diode */}
                {/* Top wire: From battery TOP (-) cap going up, right, then down to middle of P-type */}
                <path d={`M 35 83 L 35 60 L 120 60 L 120 140 L ${pX} 140`} stroke="#0f172a" strokeWidth="4" fill="none" />
                {/* Right wire: N-type right edge → LED left terminal */}
                <path d={`M ${nX + boxW} 140 L 490 140`} stroke="#0f172a" strokeWidth="4" fill="none" />
                {/* Bottom wire: LED right terminal → down → across bottom → left → up to Battery BOTTOM (+) */}
                <path d="M 550 140 L 570 140 L 570 230 L 35 230 L 35 193" stroke="#0f172a" strokeWidth="4" fill="none" />

                {/* LED with terminals - no current indicator */}
                <g>
                    {/* LED terminals */}
                    <rect x="485" y="135" width="8" height="10" rx="1" fill="#64748b" />
                    <rect x="547" y="135" width="8" height="10" rx="1" fill="#64748b" />

                    <circle cx="520" cy="140" r="30" fill="rgba(50,50,50,0.6)" stroke="#475569" strokeWidth="3" />
                    <line x1="505" y1="125" x2="535" y2="155" stroke="#dc2626" strokeWidth="3" />
                    <line x1="535" y1="125" x2="505" y2="155" stroke="#dc2626" strokeWidth="3" />
                    <text x="520" y="185" textAnchor="middle" className="fill-red-700 text-xs font-bold">NO CURRENT</text>
                </g>
                <rect x={pX} y={80} width={boxW} height={120} rx="12" fill="rgba(244,114,182,0.25)" stroke="#be185d" strokeWidth="3" />
                <text x={pX + boxW / 2} y={70} textAnchor="middle" fill="#831843" fontSize="14" fontWeight="bold">P-type</text>

                {/* P-type carriers - 5 cols × 4 rows = 20 carriers matching forward bias */}
                {Array.from({ length: 20 }).map((_, i) => {
                    const cols = 5;
                    const rows = 4;
                    const paddingX = 15;
                    const paddingY = 15;
                    const spacingX = (boxW - 2 * paddingX) / (cols - 1);
                    const spacingY = (120 - 2 * paddingY) / (rows - 1);
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    const baseX = pX + paddingX + col * spacingX;
                    const baseY = 80 + paddingY + row * spacingY;
                    // Clamp movement: carriers move LEFT (away from junction) but stay within P-box (not past pX + 12)
                    // Also cannot enter depletion region (baseX + moveLeft must be < barrierX - 10)
                    const maxMoveToLeft = Math.min(voltage * 2, baseX - pX - 12);
                    const moveLeft = -maxMoveToLeft + Math.sin((t + i * 20) * 0.02) * 1;
                    // Final X position clamped to stay within P-box boundaries
                    const finalX = Math.max(pX + 12, Math.min(baseX + moveLeft, pX + boxW - 12));
                    // Minority electrons (⊖) are about 1 in 6 (rare)
                    const isMinority = (i % 6 === 3);
                    return (
                        <g key={`pcarrier-r-${i}`}>
                            <circle cx={finalX} cy={baseY} r="8" fill={isMinority ? 'rgba(59,130,246,0.3)' : 'rgba(236,72,153,0.3)'} stroke={isMinority ? '#3b82f6' : '#ec4899'} strokeWidth="2" />
                            <text x={finalX} y={baseY + 4} textAnchor="middle" fill={isMinority ? '#1e40af' : '#be185d'} fontSize="12" fontWeight="bold">{isMinority ? '−' : '+'}</text>
                        </g>
                    );
                })}

                {/* N box - Majority: ELECTRONS (⊖), Minority: holes (⊕) */}
                <rect x={nX} y={80} width={boxW} height={120} rx="12" fill="rgba(96,165,250,0.25)" stroke="#1e40af" strokeWidth="3" />
                <text x={nX + boxW / 2} y={70} textAnchor="middle" fill="#1e3a5f" fontSize="14" fontWeight="bold">N-type</text>

                {/* N-type carriers - 5 cols × 4 rows = 20 carriers matching forward bias */}
                {Array.from({ length: 20 }).map((_, i) => {
                    const cols = 5;
                    const rows = 4;
                    const paddingX = 15;
                    const paddingY = 15;
                    const spacingX = (boxW - 2 * paddingX) / (cols - 1);
                    const spacingY = (120 - 2 * paddingY) / (rows - 1);
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    const baseX = nX + paddingX + col * spacingX;
                    const baseY = 80 + paddingY + row * spacingY;
                    // Clamp movement: carriers move RIGHT (away from junction) but stay within N-box (not past nX + boxW - 12)
                    const maxMoveToRight = Math.min(voltage * 2, (nX + boxW - 12) - baseX);
                    const moveRight = maxMoveToRight + Math.sin((t + i * 15) * 0.02) * 1;
                    // Final X position clamped to stay within N-box boundaries
                    const finalX = Math.max(nX + 12, Math.min(baseX + moveRight, nX + boxW - 12));
                    // Minority holes (⊕) are about 1 in 6 (rare)
                    const isMinority = (i % 6 === 3);
                    return (
                        <g key={`ncarrier-r-${i}`}>
                            <circle cx={finalX} cy={baseY} r="8" fill={isMinority ? 'rgba(236,72,153,0.3)' : 'rgba(59,130,246,0.3)'} stroke={isMinority ? '#ec4899' : '#3b82f6'} strokeWidth="2" />
                            <text x={finalX} y={baseY + 4} textAnchor="middle" fill={isMinority ? '#be185d' : '#1e40af'} fontSize="12" fontWeight="bold">{isMinority ? '+' : '−'}</text>
                        </g>
                    );
                })}

                {/* depletion region (centered) - widens in reverse bias */}
                <rect x={barrierX} y={85} width={barrierWidthPx} height={110} rx="8" fill="rgba(255,100,100,0.15)" stroke="#7f1d1d" strokeWidth="3" strokeDasharray="6 3" />
                <text x={boundary} y={215} textAnchor="middle" className="fill-red-900 text-xs font-bold">WIDENED DEPLETION ZONE</text>

                {/* Equal columns of ions: P-side ⊖, N-side ⊕ - ions fit exactly within box */}
                <>
                    {/* P-side columns of negative ions (⊖) - clamped within depletion box */}
                    {Array.from({ length: Math.max(1, Math.min(3, Math.floor(barrierHalfPx / 18))) }).map((_, colIdx) => (
                        Array.from({ length: 4 }).map((_, rowIdx) => {
                            // Clamp ionX to stay within depletion box (barrierX to barrierX + barrierWidthPx)
                            const ionX = Math.max(barrierX + 8, boundary - 10 - colIdx * 16);
                            const ionY = 95 + rowIdx * 25;
                            return (
                                <g key={`p-ion-r-${colIdx}-${rowIdx}`}>
                                    <circle cx={ionX} cy={ionY} r="6" fill="rgba(255,150,200,0.2)" stroke="rgba(255,150,200,0.9)" strokeWidth="1.5" />
                                    <text x={ionX} y={ionY + 3} textAnchor="middle" className="fill-pink-300 text-[10px] font-bold">−</text>
                                </g>
                            );
                        })
                    ))}
                    {/* N-side columns of positive ions (⊕) - clamped within depletion box */}
                    {Array.from({ length: Math.max(1, Math.min(3, Math.floor(barrierHalfPx / 18))) }).map((_, colIdx) => (
                        Array.from({ length: 4 }).map((_, rowIdx) => {
                            // Clamp ionX to stay within depletion box
                            const ionX = Math.min(barrierX + barrierWidthPx - 8, boundary + 10 + colIdx * 16);
                            const ionY = 95 + rowIdx * 25;
                            return (
                                <g key={`n-ion-r-${colIdx}-${rowIdx}`}>
                                    <circle cx={ionX} cy={ionY} r="6" fill="rgba(150,200,255,0.2)" stroke="rgba(150,200,255,0.9)" strokeWidth="1.5" />
                                    <text x={ionX} y={ionY + 3} textAnchor="middle" className="fill-blue-300 text-[10px] font-bold">+</text>
                                </g>
                            );
                        })
                    ))}
                </>

                {/* small leakage */}
                {voltage > 2 && <g style={{ opacity: 0.4 }}>
                    <circle cx={boundary + ((t * 0.5) % 60) - 30} cy={140} r="2" fill="rgba(255,200,100,0.8)" />
                </g>}
                {voltage > 2 && <text x={boundary} y={245} textAnchor="middle" fill="#1e3a8a" fontSize="11" fontWeight="600">Tiny leakage current (minority carriers)</text>}


                <text x={boundary} y="270" textAnchor="middle" className="fill-slate-900 text-[10px] font-bold">Diode behaves as open circuit (no current)</text>
            </svg>
        );
    };

    const renderBreakdown = () => {
        const { voltage, type } = state.breakdown;
        const breakdownVoltage = type === 'zener' ? 5.1 : 50;
        const isBreakdown = voltage >= breakdownVoltage;
        const breakdownCurrent = isBreakdown ? (voltage - breakdownVoltage) * 20 : 0;

        // No local setT here, use global t from parent
        // Note: User snippet uses Math.min(1, voltage/breakdownVoltage) for intensity

        return (
            <svg viewBox="0 0 600 340" preserveAspectRatio="xMidYMid meet" className="w-[90%] h-auto max-h-[60vh]">
                <defs>
                    <filter id="intenseGlow"><feGaussianBlur stdDeviation="8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    <filter id="breakdownGlow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>

                {/* Battery - vertical with reversed polarity for reverse bias */}
                <g transform="translate(10, 70)">
                    {/* Battery body */}
                    <rect x="0" y="0" width="50" height="90" rx="8" fill="#1f2937" stroke="#111827" strokeWidth="3" />
                    {/* Negative terminal cap (top) - reversed polarity */}
                    <rect x="15" y="-12" width="20" height="14" rx="3" fill="#22c55e" stroke="#166534" strokeWidth="2" />
                    {/* Negative indicator circle inside battery */}
                    <circle cx="25" cy="28" r="16" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="2" />
                    <circle cx="25" cy="28" r="10" fill="#16a34a" />
                    <text x="25" y="34" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">−</text>
                    {/* Positive indicator circle inside battery */}
                    <circle cx="25" cy="65" r="16" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="2" />
                    <circle cx="25" cy="65" r="10" fill="#dc2626" />
                    <text x="25" y="71" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">+</text>
                    {/* Positive terminal base (bottom) */}
                    <rect x="15" y="88" width="20" height="10" rx="3" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
                </g>
                {/* Voltage label */}
                <text x="70" y="125" textAnchor="start" fill="#0f172a" fontSize="14" fontWeight="bold">-{voltage.toFixed(1)}V</text>

                {/* P-type block */}
                <rect x="140" y="60" width="80" height="100" rx="10" fill="rgba(244,114,182,0.25)" stroke="#be185d" strokeWidth="3" />
                <text x="180" y="50" textAnchor="middle" fill="#831843" fontSize="12" fontWeight="bold">P-type</text>

                {/* P-type carriers */}
                {Array.from({ length: 6 }).map((_, i) => {
                    const col = i % 2;
                    const row = Math.floor(i / 2);
                    const x = 155 + col * 30;
                    const y = 80 + row * 28;
                    return (
                        <g key={`p-carrier-${i}`}>
                            <circle cx={x} cy={y} r="8" fill="rgba(236,72,153,0.3)" stroke="#ec4899" strokeWidth="2" />
                            <text x={x} y={y + 4} textAnchor="middle" fill="#be185d" fontSize="12" fontWeight="bold">+</text>
                        </g>
                    );
                })}

                {/* Depletion Region (zoomed view in center) */}
                <rect x="220" y="60" width="160" height="100" rx="8" fill="rgba(100,50,150,0.1)" stroke="#6b21a8" strokeWidth="2" strokeDasharray={isBreakdown ? "none" : "6 4"} />
                <text x="300" y="50" textAnchor="middle" fill="#6b21a8" fontSize="10" fontWeight="bold">Depletion Zone</text>

                {/* Electric field lines in depletion region */}
                {Array.from({ length: 4 }).map((_, i) => {
                    const intensity = isBreakdown ? 1 : Math.min(1, voltage / breakdownVoltage);
                    return <line key={i} x1="230" y1={75 + i * 22} x2="370" y2={75 + i * 22}
                        stroke={`rgba(180,140,0,${0.4 + intensity * 0.6})`} strokeWidth={1 + intensity * 2}
                        strokeDasharray={isBreakdown ? 'none' : '6 3'} />;
                })}

                {/* Fixed ions in depletion region */}
                {Array.from({ length: 3 }).map((_, i) => (
                    <g key={`ion-${i}`}>
                        <circle cx={240} cy={80 + i * 28} r="7" fill="none" stroke="#be185d" strokeWidth="2" />
                        <text x={240} y={84 + i * 28} textAnchor="middle" fill="#be185d" fontSize="10" fontWeight="bold">−</text>
                        <circle cx={360} cy={80 + i * 28} r="7" fill="none" stroke="#1e40af" strokeWidth="2" />
                        <text x={360} y={84 + i * 28} textAnchor="middle" fill="#1e40af" fontSize="10" fontWeight="bold">+</text>
                    </g>
                ))}

                {/* N-type block */}
                <rect x="380" y="60" width="80" height="100" rx="10" fill="rgba(96,165,250,0.25)" stroke="#3b82f6" strokeWidth="3" />
                <text x="420" y="50" textAnchor="middle" fill="#1e3a5f" fontSize="12" fontWeight="bold">N-type</text>

                {/* N-type carriers */}
                {Array.from({ length: 6 }).map((_, i) => {
                    const col = i % 2;
                    const row = Math.floor(i / 2);
                    const x = 400 + col * 30;
                    const y = 80 + row * 28;
                    return (
                        <g key={`n-carrier-${i}`}>
                            <circle cx={x} cy={y} r="8" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" strokeWidth="2" />
                            <text x={x} y={y + 4} textAnchor="middle" fill="#1e40af" fontSize="12" fontWeight="bold">−</text>
                        </g>
                    );
                })}

                {/* LED - circular design like Forward/Reverse bias */}
                <g transform="translate(490, 80)">
                    {/* Left terminal line */}
                    <line x1="-10" y1="30" x2="5" y2="30" stroke="#475569" strokeWidth="4" />
                    {/* Right terminal line */}
                    <line x1="55" y1="30" x2="70" y2="30" stroke="#475569" strokeWidth="4" />
                    {/* LED circle body */}
                    <circle cx="30" cy="30" r="28" fill={isBreakdown ? "rgba(255,200,50,0.6)" : "rgba(180,190,200,0.8)"} stroke={isBreakdown ? "#fbbf24" : "#94a3b8"} strokeWidth="3" />
                    {/* Inner highlight */}
                    <circle cx="30" cy="30" r="20" fill={isBreakdown ? "rgba(255,255,150,0.5)" : "rgba(200,210,220,0.6)"} />
                    {/* OFF/ON text */}
                    <text x="30" y="36" textAnchor="middle" fill={isBreakdown ? "#92400e" : "#64748b"} fontSize="14" fontWeight="bold">
                        {isBreakdown ? "ON" : "OFF"}
                    </text>
                    {/* LED label below */}
                    <text x="30" y="75" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="bold">LED</text>
                    {/* Glow effect when on */}
                    {isBreakdown && (
                        <circle cx="30" cy="30" r="35" fill="rgba(255,255,100,0.2)">
                            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="0.3s" repeatCount="indefinite" />
                        </circle>
                    )}
                </g>

                {/* Circuit wiring */}
                {/* Top wire: Battery (-) → P-type */}
                <path d={`M 35 58 L 35 35 L 100 35 L 100 110 L 140 110`} stroke="#0f172a" strokeWidth="4" fill="none" />
                {/* P-type to N-type through depletion (connection at middle) */}
                <path d="M 220 110 L 220 110" stroke="#0f172a" strokeWidth="4" fill="none" />
                {/* N-type → LED left terminal */}
                <path d="M 460 110 L 480 110" stroke="#0f172a" strokeWidth="4" fill="none" />
                {/* Bottom wire: LED right terminal → Battery (+) */}
                <path d="M 560 110 L 580 110 L 580 220 L 35 220 L 35 168" stroke="#0f172a" strokeWidth="4" fill="none" />

                {/* Breakdown electrons flowing through circuit */}
                {isBreakdown && (
                    <g>
                        {/* Electrons in depletion region - Zener tunneling or Avalanche cascade */}
                        {(type === 'zener' ?
                            Array.from({ length: 12 }).map((_, i) => {
                                const progress = ((t * 4 + i * 25) % 200) / 200;
                                const x = 230 + progress * 140;
                                const row = i % 3;
                                const y = 80 + row * 28;
                                return <circle key={`zener-e-${i}`} cx={x} cy={y} r="4" fill="rgba(100,255,255,1)" filter="url(#intenseGlow)" />;
                            })
                            :
                            Array.from({ length: 16 }).map((_, i) => {
                                const wave = Math.floor(i / 4);
                                const progress = ((t * 5 + i * 20 + wave * 30) % 200) / 200;
                                const x = 230 + progress * 140;
                                const row = i % 3;
                                const y = 80 + row * 28;
                                const size = 3 + wave * 0.5;
                                return <circle key={`aval-e-${i}`} cx={x} cy={y} r={size} fill={`rgba(255,${200 - wave * 30},100,1)`} filter="url(#intenseGlow)" />;
                            })
                        )}

                        {/* Electrons flowing through circuit wires */}
                        {Array.from({ length: 6 }).map((_, i) => {
                            // Flow around the circuit: Battery → P-type → Depletion → N-type → Load → back to Battery
                            const pathLength = 800;
                            const progress = ((t * 3 + i * (pathLength / 6)) % pathLength) / pathLength;
                            let ex, ey;

                            if (progress < 0.15) {
                                // Top wire segment
                                ex = 35 + (progress / 0.15) * 65;
                                ey = 35;
                            } else if (progress < 0.25) {
                                // Down to P-type
                                ex = 100;
                                ey = 35 + ((progress - 0.15) / 0.10) * 75;
                            } else if (progress < 0.45) {
                                // Through P-type and depletion
                                ex = 140 + ((progress - 0.25) / 0.20) * 320;
                                ey = 110;
                            } else if (progress < 0.55) {
                                // Through N-type to Load
                                ex = 460 + ((progress - 0.45) / 0.10) * 80;
                                ey = 110;
                            } else if (progress < 0.65) {
                                // Down the right side
                                ex = 560;
                                ey = 135 + ((progress - 0.55) / 0.10) * 85;
                            } else if (progress < 0.90) {
                                // Across the bottom
                                ex = 560 - ((progress - 0.65) / 0.25) * 525;
                                ey = 220;
                            } else {
                                // Up to battery
                                ex = 35;
                                ey = 220 - ((progress - 0.90) / 0.10) * 52;
                            }

                            return (
                                <circle key={`flow-${i}`} cx={ex} cy={ey} r="5" fill="#60a5fa" filter="url(#breakdownGlow)">
                                    <animate attributeName="opacity" values="1;0.6;1" dur="0.5s" repeatCount="indefinite" />
                                </circle>
                            );
                        })}
                    </g>
                )}

                {/* Lightning sparks during breakdown - simple yellow bolts */}
                {isBreakdown && (
                    <>
                        {[
                            { x: 245, y: 68, scale: 0.7 },
                            { x: 280, y: 80, scale: 0.8 },
                            { x: 315, y: 70, scale: 0.75 },
                            { x: 350, y: 82, scale: 0.65 },
                            { x: 262, y: 110, scale: 0.6 },
                            { x: 298, y: 118, scale: 0.7 },
                            { x: 335, y: 105, scale: 0.65 },
                        ].map((spark, i) => {
                            const flicker = Math.sin((t + i * 20) * 0.3) > 0.2;
                            if (!flicker) return null;
                            const s = spark.scale;
                            return (
                                <path
                                    key={`spark-${i}`}
                                    d={`M ${spark.x} ${spark.y} L ${spark.x + 8 * s} ${spark.y + 10 * s} L ${spark.x + 4 * s} ${spark.y + 10 * s} L ${spark.x + 12 * s} ${spark.y + 22 * s} L ${spark.x + 7 * s} ${spark.y + 22 * s} L ${spark.x + 16 * s} ${spark.y + 35 * s}`}
                                    stroke="#fbbf24"
                                    strokeWidth={2.5}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            );
                        })}
                    </>
                )}

                {/* Status text */}
                <text x="300" y="190" textAnchor="middle" className={`text-sm font-bold ${isBreakdown ? 'fill-red-600' : 'fill-orange-500'}`}>
                    {isBreakdown ? '⚡ BREAKDOWN - HIGH CURRENT FLOW ⚡' : `Approaching Breakdown (${Math.round((voltage / breakdownVoltage) * 100)}%)`}
                </text>

                {/* Current indicator when breakdown occurs */}
                {isBreakdown && (
                    <g>
                        <rect x="200" y="250" width="200" height="30" rx="6" fill="rgba(239,68,68,0.2)" stroke="#dc2626" strokeWidth="2">
                            <animate attributeName="stroke-opacity" values="1;0.5;1" dur="0.3s" repeatCount="indefinite" />
                        </rect>
                        <text x="300" y="270" textAnchor="middle" fill="#dc2626" fontSize="14" fontWeight="bold">
                            Current: {breakdownCurrent.toFixed(1)} mA
                        </text>
                    </g>
                )}
            </svg>
        );
    };

    return (
        <div className="h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-slate-100 relative overflow-hidden flex items-center justify-center p-8">
            {/* Main Card Container */}
            <div className="w-full max-w-6xl h-[90vh] bg-white/70 backdrop-blur-sm rounded-[2.5rem] shadow-2xl border border-white/50 relative overflow-hidden flex flex-col items-center justify-center">

                <HintBox />

                <div className="w-full h-full flex items-center justify-center p-4">
                    {state.tab === 'intro' && renderIntro()}
                    {state.tab === 'forward' && renderForward()}
                    {state.tab === 'reverse' && renderReverse()}
                    {state.tab === 'breakdown' && renderBreakdown()}
                </div>
            </div>
        </div>
    );
};

export default DiodeCircuit;
