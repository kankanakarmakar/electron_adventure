import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Battery, Lightbulb, RotateCcw, Play, Unplug, Info } from 'lucide-react';

type CircuitMode = 'simple' | 'series' | 'parallel';
type Stage = 'initial' | 'connecting' | 'charging' | 'charged' | 'disconnecting' | 'discharge' | 'discharged';

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

const CapacitorPage = () => {
  const [mode, setMode] = useState<CircuitMode>('simple');
  const [voltage, setVoltage] = useState(9);
  const [capacitance, setCapacitance] = useState(100);
  const [capacitance2, setCapacitance2] = useState(200);
  const [capacitance3, setCapacitance3] = useState(150);
  const [stage, setStage] = useState<Stage>('initial');
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

  // Calculate total capacitance
  const getTotalCapacitance = () => {
    switch (mode) {
      case 'simple':
        return capacitance;
      case 'series':
        return 1 / (1 / capacitance + 1 / capacitance2 + 1 / capacitance3);
      case 'parallel':
        return capacitance + capacitance2 + capacitance3;
    }
  };

  const totalCapacitance = getTotalCapacitance();
  const maxCharge = (totalCapacitance * voltage) / 1000;
  const storedEnergy = 0.5 * totalCapacitance * voltage * voltage / 1000;

  // Stage descriptions
  const getStageInfo = () => {
    const stages = {
      initial: {
        title: "Ready to Start",
        description: "Click 'Connect Circuit' to begin. The battery will charge the capacitor by building up opposite charges on its plates."
      },
      connecting: {
        title: "Connecting Circuit",
        description: "Closing the loop — electrons are about to flow!"
      },
      charging: {
        title: "Charging Phase",
        description: "Watch electrons flow from the battery. The capacitor plates accumulate opposite charges, storing electrical energy."
      },
      charged: {
        title: "Fully Charged!",
        description: "Energy stored! The capacitor is ready to power something amazing. Click 'Light the Bulb' to discharge."
      },
      disconnecting: {
        title: "Disconnecting Battery",
        description: "Removing the battery — energy is stored in the capacitor!"
      },
      discharge: {
        title: "Discharging!",
        description: "The capacitor powers the bulb — watch it glow as stored energy is released!"
      },
      discharged: {
        title: "Complete!",
        description: "All energy released! Click 'Try Again' to start over."
      }
    };
    return stages[stage];
  };

  const info = getStageInfo();

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimation(prev => {
        const newState = { ...prev };

        // Charging animation
        if (stage === 'charging') {
          newState.chargeLevel = Math.min(1, prev.chargeLevel + 0.008);
          newState.fieldStrength = newState.chargeLevel;
          newState.chargingTime += 0.045;
          newState.electronPhase = (prev.electronPhase + 0.1) % (Math.PI * 2);

          if (newState.chargeLevel >= 1) {
            setTimeout(() => setStage('charged'), 500);
          }
        }

        // Discharging animation
        if (stage === 'discharge') {
          newState.chargeLevel = Math.max(0, prev.chargeLevel - 0.01);
          newState.fieldStrength = newState.chargeLevel;
          newState.bulbGlow = newState.chargeLevel;
          newState.dischargingTime += 0.045;
          newState.electronPhase = (prev.electronPhase - 0.12) % (Math.PI * 2);

          if (newState.chargeLevel <= 0) {
            setTimeout(() => setStage('discharged'), 500);
          }
        }

        return newState;
      });

      // Generate electron particles
      if (stage === 'charging' || stage === 'discharge') {
        if (Math.random() < 0.2) {
          setElectrons(prev => {
            const nextId = prev.length > 0 ? Math.max(...prev.map(e => e.id)) + 1 : 0;
            return [
              ...prev.slice(-20),
              {
                id: nextId,
                x: 0,
                y: 0,
                progress: 0,
              }
            ];
          });
        }
      }

      // Update electron positions
      setElectrons(prev =>
        prev
          .map(e => ({ ...e, progress: e.progress + 0.02 }))
          .filter(e => e.progress < 1)
      );
    }, 45);

    return () => clearInterval(interval);
  }, [stage]);

  // Control handlers
  const handleConnect = () => {
    setStage('connecting');
    setTimeout(() => setStage('charging'), 500);
  };

  const handleDisconnect = () => {
    setStage('disconnecting');
    setTimeout(() => setStage('discharge'), 800);
  };

  const handleReset = () => {
    setStage('initial');
    setAnimation({
      chargeLevel: 0,
      electronPhase: 0,
      fieldStrength: 0,
      bulbGlow: 0,
      wireOpacity: 0,
      chargingTime: 0,
      dischargingTime: 0,
    });
    setElectrons([]);
  };

  const handleModeChange = (newMode: CircuitMode) => {
    setMode(newMode);
    handleReset();
  };

  const makeKeyHandler = (value: number, min: number, max: number, step: number, apply: (v: number) => void, disabled = false) => (e: React.KeyboardEvent) => {
    if (disabled) return;
    const key = e.key || '';
    const code = (e as any).code || '';
    const keyCode = (e as any).keyCode || 0;

    const increase = key === 'PageUp' || code === 'PageUp' || key === 'ArrowUp' || keyCode === 33 || keyCode === 38;
    const decrease = key === 'PageDown' || code === 'PageDown' || key === 'ArrowDown' || keyCode === 34 || keyCode === 40;
    const toMin = key === 'Home' || code === 'Home';
    const toMax = key === 'End' || code === 'End';

    if (increase || decrease || toMin || toMax) {
      e.preventDefault();
      if (toMin) return apply(min);
      if (toMax) return apply(max);
      if (increase) return apply(Math.min(max, value + step));
      if (decrease) return apply(Math.max(min, value - step));
    }
  };

  return (
    <div className="relative h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #7dd3fc 70%, #38bdf8 100%)' }}>
      {/* Light blue background without stars */}

      {/* Main content */}
      <div className="relative z-10 h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-[95vw] h-[92vh] flex flex-col">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2">
              <span className="text-slate-800 drop-shadow-sm">What are </span>
              <span className="bg-gradient-to-r from-[#06b6d4] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(139,92,246,0.6)]">Capacitors</span>
              <span className="text-slate-800 drop-shadow-sm">?</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 font-bold tracking-wide">Explore How Capacitors Store Energy in Electric Fields</p>
          </div>

          {/* Mode tabs */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex rounded-xl border-2 border-slate-300 bg-white/80 backdrop-blur-xl p-1 shadow-lg">
              {(['simple', 'series', 'parallel'] as CircuitMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${mode === m
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/50'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Main display */}
          <div className="relative flex-1 rounded-3xl border-2 border-slate-300 p-4 overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.98) 100%)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.1), 0 0 60px rgba(56, 189, 248, 0.1)'
          }}>
            <div className="flex gap-2 h-full">
              {/* Circuit (60%) */}
              <div className="flex-[60] relative rounded-2xl border-2 border-sky-300 bg-gradient-to-br from-sky-50/80 to-blue-50/90 backdrop-blur-md overflow-hidden shadow-lg">
                {/* Info box */}
                <div className="absolute top-2 left-2 z-20 max-w-xs">
                  <div className="bg-white/95 backdrop-blur-md border-2 border-sky-300 rounded-lg p-2 shadow-lg">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <span className="text-xl">💡</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-bold text-cyan-600 mb-0.5">{info.title}</h3>
                        <p className="text-[10px] text-slate-600 leading-snug">{info.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SVG Circuit - Larger viewBox for bigger circuit */}
                <div className="w-full h-full flex items-center justify-center p-2">
                  <svg viewBox="0 -40 800 540" className="w-full h-full max-h-[520px]" preserveAspectRatio="xMidYMid meet">
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

                    {/* Grid pattern */}
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(100, 116, 139, 0.1)" strokeWidth="1" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Simple Circuit */}
                    {mode === 'simple' && (
                      <>
                        {/* Wires */}
                        <line x1="100" y1="190" x2="350" y2="190" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="410" y1="190" x2="660" y2="190" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="660" y1="190" x2="660" y2="410" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />

                        {stage !== 'discharge' && stage !== 'discharged' ? (
                          <>
                            <line x1="660" y1="410" x2="430" y2="410" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                            <line x1="330" y1="410" x2="100" y2="410" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          </>
                        ) : (
                          <line x1="660" y1="410" x2="100" y2="410" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        )}

                        <line x1="100" y1="410" x2="100" y2="190" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="350" y1="190" x2="350" y2="170" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="410" y1="190" x2="410" y2="170" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />

                        {/* Capacitor plates positioned at wire terminals */}
                        <g transform="translate(380, 140)">
                          {/* Left plate at x=350 (wire terminal) - relative: 350-380 = -30 */}
                          <rect x="-37" y="20" width="14" height="80" rx="3" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#000000" strokeWidth="2" filter="url(#glow)" />
                          {/* Right plate at x=410 (wire terminal) - relative: 410-380 = 30 */}
                          <rect x="23" y="20" width="14" height="80" rx="3" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#000000" strokeWidth="2" filter="url(#glow)" />
                          {/* Electric field in the gap between plates */}
                          <rect x="-23" y="20" width="46" height="80" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.9} rx="2" />
                          {animation.fieldStrength > 0.1 && (
                            <g opacity={animation.fieldStrength * 0.6}>
                              {[0, 1, 2, 3, 4, 5].map(i => (
                                <line key={i} x1="-20" y1={32 + i * 12} x2="20" y2={32 + i * 12} stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" strokeDasharray="4,4" />
                              ))}
                            </g>
                          )}
                          <text x="-52" y="65" fontSize="18" fontWeight="bold" fill="#1e40af">−</text>
                          <text x="45" y="65" fontSize="18" fontWeight="bold" fill="#be185d">+</text>
                          <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000000">⚡ Capacitor</text>
                          <text x="0" y="120" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000000">{capacitance}µF</text>
                        </g>

                        {/* Battery - Larger with better labels */}
                        {stage !== 'discharge' && stage !== 'discharged' && (
                          <g transform="translate(400, 420)">
                            <rect x="-60" y="-50" width="120" height="90" rx="12" fill="#374151" stroke="#1f2937" strokeWidth="3" />
                            {/* Left terminal */}
                            <rect x="-68" y="-20" width="14" height="40" rx="4" fill="#ef4444" />
                            {/* Right terminal */}
                            <rect x="54" y="-20" width="14" height="40" rx="4" fill="#22c55e" />
                            <circle cx="-25" cy="0" r="22" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="3" />
                            <text x="-25" y="10" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#ef4444">+</text>
                            <circle cx="25" cy="0" r="22" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="3" />
                            <text x="25" y="10" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#22c55e">−</text>
                            <text x="0" y="-60" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#000000">🔋 Battery</text>
                            <text x="0" y="60" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#000000">{voltage}V</text>
                          </g>
                        )}

                        {/* Bulb - Shows during discharge/discharged */}
                        {(stage === 'discharge' || stage === 'discharged') && (
                          <g transform="translate(380, 350)">
                            <circle cx="0" cy="0" r={45 + animation.bulbGlow * 25} fill="url(#bulbRadiant)" opacity={animation.bulbGlow * 0.5} filter="url(#bulbGlow)" />
                            <circle cx="0" cy="0" r="35" fill={`rgba(255, 240, 200, ${0.1 + animation.bulbGlow * 0.4})`} stroke="rgba(251, 191, 36, 0.8)" strokeWidth="3" filter="url(#glow)" />
                            <path d="M -12 0 Q -8 -12 -4 0 Q 0 12 4 0 Q 8 -12 12 0" fill="none" stroke={`rgba(255, 200, 50, ${0.4 + animation.bulbGlow * 0.6})`} strokeWidth="3" strokeLinecap="round" />
                            <rect x="-15" y="38" width="30" height="18" rx="4" fill="rgba(113, 113, 122, 0.9)" />
                            <line x1="-10" y1="55" x2="-10" y2="60" stroke="rgba(113, 113, 122, 0.9)" strokeWidth="3" />
                            <line x1="10" y1="55" x2="10" y2="60" stroke="rgba(113, 113, 122, 0.9)" strokeWidth="3" />
                            <text x="0" y="-50" textAnchor="middle" className="text-sm font-bold" fill="#000000">💡 Bulb</text>
                            <text x="0" y="95" textAnchor="middle" className="text-sm font-bold" fill="rgba(251, 191, 36, 0.9)">{(animation.bulbGlow * 100).toFixed(0)}%</text>
                          </g>
                        )}
                      </>
                    )}

                    {/* Series Circuit */}
                    {mode === 'series' && (
                      <>
                        {/* Top wire - connects through capacitors */}
                        <line x1="100" y1="190" x2="200" y2="190" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="200" y1="190" x2="200" y2="170" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="240" y1="170" x2="240" y2="190" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="240" y1="190" x2="350" y2="190" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="350" y1="190" x2="350" y2="170" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="390" y1="170" x2="390" y2="190" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="390" y1="190" x2="500" y2="190" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="500" y1="190" x2="500" y2="170" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="540" y1="170" x2="540" y2="190" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="540" y1="190" x2="640" y2="190" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />

                        {/* Right vertical */}
                        <line x1="640" y1="190" x2="640" y2="410" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />

                        {/* Bottom wire */}
                        {stage !== 'discharge' && stage !== 'discharged' ? (
                          <>
                            <line x1="640" y1="410" x2="430" y2="410" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                            <line x1="330" y1="410" x2="100" y2="410" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          </>
                        ) : (
                          <line x1="640" y1="410" x2="100" y2="410" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        )}

                        {/* Left vertical */}
                        <line x1="100" y1="410" x2="100" y2="190" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />

                        {/* Battery connection lines - only show when battery is present */}
                        {stage !== 'discharge' && stage !== 'discharged' && (
                          <>
                            <line x1="330" y1="410" x2="330" y2="370" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                            <line x1="430" y1="410" x2="430" y2="370" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          </>
                        )}

                        {/* Capacitor 1 (left) */}
                        <g transform="translate(220, 150)">
                          <rect x="-20" y="20" width="10" height="60" rx="3" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#000000" strokeWidth="1.5" filter="url(#glow)" />
                          <rect x="10" y="20" width="10" height="60" rx="3" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#000000" strokeWidth="1.5" filter="url(#glow)" />
                          <rect x="-10" y="20" width="20" height="60" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.7} rx="2" />
                          {animation.fieldStrength > 0.1 && (
                            <g opacity={animation.fieldStrength * 0.5}>
                              {[0, 1, 2, 3].map(i => (
                                <line key={i} x1="-8" y1={30 + i * 12} x2="8" y2={30 + i * 12} stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
                              ))}
                            </g>
                          )}
                          <text x="-40" y="35" textAnchor="end" fontSize="13" fontWeight="bold" fill="#000000">C₁</text>
                          <text x="-40" y="55" textAnchor="end" fontSize="11" fontWeight="bold" fill="#000000">{capacitance}µF</text>
                        </g>

                        {/* Capacitor 2 (middle) */}
                        <g transform="translate(370, 150)">
                          <rect x="-20" y="20" width="10" height="60" rx="3" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#000000" strokeWidth="1.5" filter="url(#glow)" />
                          <rect x="10" y="20" width="10" height="60" rx="3" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#000000" strokeWidth="1.5" filter="url(#glow)" />
                          <rect x="-10" y="20" width="20" height="60" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.7} rx="2" />
                          {animation.fieldStrength > 0.1 && (
                            <g opacity={animation.fieldStrength * 0.5}>
                              {[0, 1, 2, 3].map(i => (
                                <line key={i} x1="-8" y1={30 + i * 12} x2="8" y2={30 + i * 12} stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
                              ))}
                            </g>
                          )}
                          <text x="-40" y="35" textAnchor="end" fontSize="13" fontWeight="bold" fill="#000000">C₂</text>
                          <text x="-40" y="55" textAnchor="end" fontSize="11" fontWeight="bold" fill="#000000">{capacitance2}µF</text>
                        </g>

                        {/* Capacitor 3 (right) */}
                        <g transform="translate(520, 150)">
                          <rect x="-20" y="20" width="10" height="60" rx="3" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#000000" strokeWidth="1.5" filter="url(#glow)" />
                          <rect x="10" y="20" width="10" height="60" rx="3" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#000000" strokeWidth="1.5" filter="url(#glow)" />
                          <rect x="-10" y="20" width="20" height="60" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.7} rx="2" />
                          {animation.fieldStrength > 0.1 && (
                            <g opacity={animation.fieldStrength * 0.5}>
                              {[0, 1, 2, 3].map(i => (
                                <line key={i} x1="-8" y1={30 + i * 12} x2="8" y2={30 + i * 12} stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
                              ))}
                            </g>
                          )}
                          <text x="-40" y="35" textAnchor="end" fontSize="13" fontWeight="bold" fill="#000000">C₃</text>
                          <text x="-40" y="55" textAnchor="end" fontSize="11" fontWeight="bold" fill="#000000">{capacitance3}µF</text>
                        </g>

                        {/* Battery - Only show during charging phases */}
                        {stage !== 'discharge' && stage !== 'discharged' && (
                          <g transform="translate(380, 410)">
                            <rect x="-55" y="-35" width="110" height="80" rx="12" fill="#374151" stroke="#1f2937" strokeWidth="3" />
                            <rect x="-60" y="-12" width="12" height="34" rx="4" fill="#ef4444" />
                            <rect x="48" y="-12" width="12" height="34" rx="4" fill="#22c55e" />
                            <circle cx="-25" cy="5" r="18" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="3" />
                            <text x="-25" y="12" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#ef4444">+</text>
                            <circle cx="25" cy="5" r="18" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="3" />
                            <text x="25" y="12" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#22c55e">−</text>
                            <text x="0" y="-45" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000000">🔋 Battery</text>
                            <text x="0" y="60" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000000">{voltage}V</text>
                          </g>
                        )}

                        {/* Bulb - Shows during discharge/discharged */}
                        {(stage === 'discharge' || stage === 'discharged') && (
                          <g transform="translate(380, 350)">
                            <circle cx="0" cy="0" r={45 + animation.bulbGlow * 25} fill="url(#bulbRadiant)" opacity={animation.bulbGlow * 0.5} filter="url(#bulbGlow)" />
                            <circle cx="0" cy="0" r="35" fill={`rgba(255, 240, 200, ${0.1 + animation.bulbGlow * 0.4})`} stroke="rgba(251, 191, 36, 0.8)" strokeWidth="3" filter="url(#glow)" />
                            <path d="M -12 0 Q -8 -12 -4 0 Q 0 12 4 0 Q 8 -12 12 0" fill="none" stroke={`rgba(255, 200, 50, ${0.4 + animation.bulbGlow * 0.6})`} strokeWidth="3" strokeLinecap="round" />
                            <rect x="-15" y="38" width="30" height="18" rx="4" fill="rgba(113, 113, 122, 0.9)" />
                            <line x1="-10" y1="55" x2="-10" y2="60" stroke="rgba(113, 113, 122, 0.9)" strokeWidth="3" />
                            <line x1="10" y1="55" x2="10" y2="60" stroke="rgba(113, 113, 122, 0.9)" strokeWidth="3" />
                            <text x="0" y="-50" textAnchor="middle" className="text-sm font-bold" fill="#000000">💡 Bulb</text>
                            <text x="0" y="95" textAnchor="middle" className="text-sm font-bold" fill="rgba(251, 191, 36, 0.9)">{(animation.bulbGlow * 100).toFixed(0)}%</text>
                          </g>
                        )}
                      </>
                    )}

                    {/* Parallel Circuit */}
                    {mode === 'parallel' && (
                      <>
                        {/* Top rail - extends to bulb during discharge */}
                        <line x1="150" y1="200" x2={(stage === 'discharge' || stage === 'discharged') ? "700" : "650"} y2="200" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        {/* Bottom rail - extends to bulb during discharge */}
                        <line x1="150" y1="400" x2={(stage === 'discharge' || stage === 'discharged') ? "700" : "650"} y2="400" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />

                        {/* Capacitor 1 (left) - Horizontal plates */}
                        <g transform="translate(280, 300)">
                          <line x1="0" y1="-100" x2="0" y2="-30" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          <line x1="0" y1="30" x2="0" y2="100" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          <rect x="-45" y="-25" width="90" height="10" rx="3" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#000000" strokeWidth="1.5" filter="url(#glow)" />
                          <rect x="-45" y="17" width="90" height="10" rx="3" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#000000" strokeWidth="1.5" filter="url(#glow)" />
                          <rect x="-45" y="-15" width="90" height="32" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.9} rx="2" />
                          {animation.fieldStrength > 0.1 && (
                            <g opacity={animation.fieldStrength * 0.6}>
                              {[0, 1, 2, 3, 4].map(i => (
                                <line key={i} x1={-35 + i * 18} y1="-10" x2={-35 + i * 18} y2="10" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="4,4" />
                              ))}
                            </g>
                          )}
                          <rect x="-16" y="-48" width="32" height="24" rx="5" fill="rgba(15, 23, 42, 0.85)" />
                          <text x="0" y="-32" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#3b82f6">−</text>
                          <rect x="-16" y="32" width="32" height="24" rx="5" fill="rgba(15, 23, 42, 0.85)" />
                          <text x="0" y="48" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#ec4899">+</text>
                          <text x="-55" y="-5" textAnchor="end" fontSize="14" fontWeight="bold" fill="#000000">C₁</text>
                          <text x="-55" y="12" textAnchor="end" fontSize="12" fontWeight="bold" fill="#000000">{capacitance}µF</text>
                        </g>

                        {/* Capacitor 2 (middle) - Horizontal plates */}
                        <g transform="translate(430, 300)">
                          <line x1="0" y1="-100" x2="0" y2="-30" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          <line x1="0" y1="30" x2="0" y2="100" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          <rect x="-45" y="-25" width="90" height="10" rx="3" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#000000" strokeWidth="1.5" filter="url(#glow)" />
                          <rect x="-45" y="17" width="90" height="10" rx="3" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#000000" strokeWidth="1.5" filter="url(#glow)" />
                          <rect x="-45" y="-15" width="90" height="32" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.9} rx="2" />
                          {animation.fieldStrength > 0.1 && (
                            <g opacity={animation.fieldStrength * 0.6}>
                              {[0, 1, 2, 3, 4].map(i => (
                                <line key={i} x1={-35 + i * 18} y1="-10" x2={-35 + i * 18} y2="10" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="4,4" />
                              ))}
                            </g>
                          )}
                          <rect x="-16" y="-48" width="32" height="24" rx="5" fill="rgba(15, 23, 42, 0.85)" />
                          <text x="0" y="-32" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#3b82f6">−</text>
                          <rect x="-16" y="32" width="32" height="24" rx="5" fill="rgba(15, 23, 42, 0.85)" />
                          <text x="0" y="48" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#ec4899">+</text>
                          <text x="-55" y="-5" textAnchor="end" fontSize="14" fontWeight="bold" fill="#000000">C₂</text>
                          <text x="-55" y="12" textAnchor="end" fontSize="12" fontWeight="bold" fill="#000000">{capacitance2}µF</text>
                        </g>

                        {/* Capacitor 3 (right) - Horizontal plates */}
                        <g transform="translate(580, 300)">
                          <line x1="0" y1="-100" x2="0" y2="-30" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          <line x1="0" y1="30" x2="0" y2="100" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          <rect x="-45" y="-25" width="90" height="10" rx="3" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#000000" strokeWidth="1.5" filter="url(#glow)" />
                          <rect x="-45" y="17" width="90" height="10" rx="3" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} stroke="#000000" strokeWidth="1.5" filter="url(#glow)" />
                          <rect x="-45" y="-15" width="90" height="32" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.9} rx="2" />
                          {animation.fieldStrength > 0.1 && (
                            <g opacity={animation.fieldStrength * 0.6}>
                              {[0, 1, 2, 3, 4].map(i => (
                                <line key={i} x1={-35 + i * 18} y1="-10" x2={-35 + i * 18} y2="10" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="4,4" />
                              ))}
                            </g>
                          )}
                          <rect x="-16" y="-48" width="32" height="24" rx="5" fill="rgba(15, 23, 42, 0.85)" />
                          <text x="0" y="-32" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#3b82f6">−</text>
                          <rect x="-16" y="32" width="32" height="24" rx="5" fill="rgba(15, 23, 42, 0.85)" />
                          <text x="0" y="48" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#ec4899">+</text>
                          <text x="-55" y="-5" textAnchor="end" fontSize="14" fontWeight="bold" fill="#000000">C₃</text>
                          <text x="-55" y="12" textAnchor="end" fontSize="12" fontWeight="bold" fill="#000000">{capacitance3}µF</text>
                        </g>

                        {/* Battery - Clearly Visible with Battery text */}
                        {stage !== 'discharge' && stage !== 'discharged' && (
                          <g transform="translate(150, 300)">
                            <line x1="0" y1="-100" x2="0" y2="-65" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                            <line x1="0" y1="65" x2="0" y2="100" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                            <rect x="-40" y="-65" width="80" height="130" rx="14" fill="#374151" stroke="#1f2937" strokeWidth="3" />
                            <rect x="-14" y="-72" width="28" height="14" rx="5" fill="#ef4444" />
                            <rect x="-14" y="58" width="28" height="14" rx="5" fill="#22c55e" />
                            <circle cx="0" cy="-25" r="20" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="3" />
                            <text x="0" y="-16" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#ef4444">+</text>
                            <circle cx="0" cy="25" r="20" fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth="3" />
                            <text x="0" y="34" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#22c55e">−</text>
                            <text x="-55" y="-10" textAnchor="end" fontSize="14" fontWeight="bold" fill="#000000">🔋 Battery</text>
                            <text x="-55" y="10" textAnchor="end" fontSize="16" fontWeight="bold" fill="#000000">{voltage}V</text>
                          </g>
                        )}

                        {/* Wires on left side when no battery during discharge */}
                        {(stage === 'discharge' || stage === 'discharged') && (
                          <g transform="translate(150, 300)">
                            <line x1="0" y1="-100" x2="0" y2="100" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          </g>
                        )}

                        {/* Bulb - On right side during discharge */}
                        {(stage === 'discharge' || stage === 'discharged') && (
                          <g transform="translate(700, 300)">
                            <line x1="0" y1="-100" x2="0" y2="-50" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                            <line x1="0" y1="50" x2="0" y2="100" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                            <circle cx="0" cy="0" r={45 + animation.bulbGlow * 20} fill="url(#bulbRadiant)" opacity={animation.bulbGlow * 0.5} filter="url(#bulbGlow)" />
                            <circle cx="0" cy="0" r="40" fill={`rgba(255, 240, 200, ${0.1 + animation.bulbGlow * 0.4})`} stroke="rgba(251, 191, 36, 0.8)" strokeWidth="3" filter="url(#glow)" />
                            <path d="M -12 0 Q -8 -12 -4 0 Q 0 12 4 0 Q 8 -12 12 0" fill="none" stroke={`rgba(255, 200, 50, ${0.4 + animation.bulbGlow * 0.6})`} strokeWidth="3" strokeLinecap="round" />
                            <rect x="-15" y="40" width="30" height="18" rx="4" fill="rgba(113, 113, 122, 0.9)" />
                            <text x="50" y="5" textAnchor="start" className="text-sm font-bold" fill="rgba(251, 191, 36, 0.9)">💡 {(animation.bulbGlow * 100).toFixed(0)}%</text>
                          </g>
                        )}
                      </>
                    )}

                    {/* Electrons - universal for all modes */}
                    {electrons.map(e => {
                      let x = 100;
                      let y = 190;

                      // Simple path calculation
                      const totalProgress = e.progress % 1;

                      if (mode === 'simple') {
                        const pathLength = 1420; // approximate total
                        const dist = totalProgress * pathLength;

                        if (dist < 560) { // top horizontal
                          x = 100 + dist;
                          y = 190;
                        } else if (dist < 780) { // right vertical
                          x = 660;
                          y = 190 + (dist - 560);
                        } else if (dist < 1340) { // bottom horizontal
                          x = 660 - (dist - 780);
                          y = 410;
                        } else { // left vertical
                          x = 100;
                          y = 410 - (dist - 1340);
                        }
                      } else if (mode === 'series') {
                        const pathLength = 1460;
                        const dist = totalProgress * pathLength;

                        if (dist < 540) { // top horizontal
                          x = 100 + dist;
                          y = 190;
                        } else if (dist < 760) { // right vertical
                          x = 640;
                          y = 190 + (dist - 540);
                        } else if (dist < 1300) { // bottom horizontal
                          x = 640 - (dist - 760);
                          y = 410;
                        } else { // left vertical
                          x = 100;
                          y = 410 - (dist - 1300);
                        }
                      } else { // parallel
                        // Determine which branch this electron takes - evenly distributed
                        const branchIndex = Math.floor(e.id) % 3; // 0, 1, or 2 for three capacitor branches
                        // Updated capacitor positions: 280, 430, 580
                        const capacitorX = branchIndex === 0 ? 280 : branchIndex === 1 ? 430 : 580;

                        if (stage === 'discharge' || stage === 'discharged') {
                          // During discharge: one-way flow from capacitors through bulb
                          const pathLength = 950;
                          const dist = totalProgress * pathLength;

                          if (dist < 200) { // down through capacitor (from stored charge)
                            x = capacitorX;
                            y = 200 + (400 - 200) * (dist / 200);
                          } else if (dist < 400) { // bottom rail from capacitor to bulb
                            const progress = (dist - 200) / 200;
                            x = capacitorX + (700 - capacitorX) * progress;
                            y = 400;
                          } else if (dist < 600) { // up through bulb
                            x = 700;
                            y = 400 - (400 - 200) * ((dist - 400) / 200);
                          } else if (dist < 800) { // top rail from bulb to capacitor
                            const progress = (dist - 600) / 200;
                            x = 700 - (700 - capacitorX) * progress;
                            y = 200;
                          } else { // back to top of capacitor (completing the loop through capacitor only)
                            x = capacitorX;
                            y = 200;
                          }
                        } else {
                          // During charging: flow from battery (x=150) through top rail to capacitors, down through capacitors, back via bottom rail
                          const pathLength = 1200;
                          const dist = totalProgress * pathLength;

                          if (dist < 200) { // up through battery (from bottom to top)
                            x = 150;
                            y = 400 - (400 - 200) * (dist / 200);
                          } else if (dist < 450) { // top rail from battery to capacitor
                            const progress = (dist - 200) / 250;
                            x = 150 + (capacitorX - 150) * progress;
                            y = 200;
                          } else if (dist < 700) { // down through capacitor
                            x = capacitorX;
                            y = 200 + (400 - 200) * ((dist - 450) / 250);
                          } else if (dist < 950) { // bottom rail from capacitor back to battery
                            const progress = (dist - 700) / 250;
                            x = capacitorX - (capacitorX - 150) * progress;
                            y = 400;
                          } else { // down through battery completing circuit
                            x = 150;
                            y = 400;
                          }
                        }
                      }

                      return (
                        <circle key={e.id} cx={x} cy={y} r="5" fill="rgba(56, 189, 248, 0.95)" filter="url(#glow)" />
                      );
                    })}

                    {/* Charge level indicator - position varies by mode */}
                    <g transform={`translate(${mode === 'simple' ? 280 : 320}, ${mode === 'simple' ? 70 : 130})`}>
                      <rect x="-80" y="-20" width="160" height="40" rx="20" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="2" />
                      <rect x="-72" y="-12" width={144 * animation.chargeLevel} height="24" rx="12" fill="url(#fieldGradient)" filter="url(#glow)" />
                      <text x="0" y="7" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">{(animation.chargeLevel * 100).toFixed(0)}%</text>
                    </g>

                    {/* Stored Energy Display - position varies by mode */}
                    <g transform={`translate(${mode === 'simple' ? 480 : 520}, ${mode === 'simple' ? 70 : 130})`}>
                      <rect x="-85" y="-30" width="170" height="60" rx="14" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="2" />
                      <text x="0" y="-5" textAnchor="middle" fontSize="13" fontWeight="600" fill="rgba(167, 139, 250, 1)">Stored Energy</text>
                      <text x="0" y="22" textAnchor="middle" fontSize="18" fontWeight="bold" fill="rgba(226, 232, 240, 1)">{(storedEnergy * animation.chargeLevel).toFixed(2)} mJ</text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Controls (40%) */}
              <div className="flex-[40] flex flex-col gap-0.5 h-full overflow-hidden">
                {/* Controls Panel */}
                <div className="bg-white/90 backdrop-blur-xl rounded-xl border-2 border-slate-300 p-1.5 shadow-lg flex-shrink-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="text-xs font-black text-slate-700 tracking-[0.1em] uppercase">CONTROLS</h3>
                  </div>

                  <div className="space-y-1.5">
                    {stage === 'initial' && (
                      <button onClick={handleConnect} className="w-full px-2 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[10px] font-bold flex items-center justify-center gap-1">
                        <Play className="w-3 h-3" /> Connect Circuit
                      </button>
                    )}
                    {stage === 'charged' && (
                      <button onClick={handleDisconnect} className="w-full px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold flex items-center justify-center gap-1">
                        <Lightbulb className="w-3 h-3" /> Light the Bulb
                      </button>
                    )}
                    {(stage === 'discharged' || stage === 'charged') && (
                      <button onClick={handleReset} className="w-full px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold flex items-center justify-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Try Again
                      </button>
                    )}
                  </div>

                  {/* Settings */}
                  <div className="mt-1.5 pt-1.5 border-t border-purple-500/20 space-y-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-800 mb-0.5 block">Voltage</label>
                      <div
                        role="spinbutton"
                        tabIndex={0}
                        aria-valuemin={3}
                        aria-valuemax={24}
                        aria-valuenow={voltage}
                        aria-label="Voltage"
                        onKeyDown={makeKeyHandler(voltage, 3, 24, 1, (v) => setVoltage(v), stage !== 'initial')}
                        className="flex items-center justify-between gap-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1"
                      >
                        <button onClick={() => setVoltage(v => Math.max(3, v - 1))} disabled={stage !== 'initial'} className="w-6 h-6 rounded flex items-center justify-center bg-cyan-50 text-cyan-600 hover:bg-cyan-100 disabled:opacity-50" type="button">
                          <span className="text-sm">−</span>
                        </button>
                        <span className="text-sm font-bold text-cyan-400 min-w-[40px] text-center">{voltage}V</span>
                        <button onClick={() => setVoltage(v => Math.min(24, v + 1))} disabled={stage !== 'initial'} className="w-6 h-6 rounded flex items-center justify-center bg-cyan-50 text-cyan-600 hover:bg-cyan-100 disabled:opacity-50" type="button">
                          <span className="text-sm">+</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-800 mb-0.5 block">Capacitance</label>
                      <div
                        role="spinbutton"
                        tabIndex={0}
                        aria-valuemin={10}
                        aria-valuemax={500}
                        aria-valuenow={capacitance}
                        aria-label="Capacitance"
                        onKeyDown={makeKeyHandler(capacitance, 10, 500, 10, (v) => setCapacitance(v), stage !== 'initial')}
                        className="flex items-center justify-between gap-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1"
                      >
                        <button onClick={() => setCapacitance(c => Math.max(10, c - 10))} disabled={stage !== 'initial'} className="w-6 h-6 rounded flex items-center justify-center bg-purple-50 text-purple-600 hover:bg-purple-100 disabled:opacity-50" type="button">
                          <span className="text-sm">−</span>
                        </button>
                        <span className="text-sm font-bold text-purple-400 min-w-[40px] text-center">{capacitance}µF</span>
                        <button onClick={() => setCapacitance(c => Math.min(500, c + 10))} disabled={stage !== 'initial'} className="w-6 h-6 rounded flex items-center justify-center bg-purple-50 text-purple-600 hover:bg-purple-100 disabled:opacity-50" type="button">
                          <span className="text-sm">+</span>
                        </button>
                      </div>
                    </div>

                    {/* C2 Control - only for series/parallel modes */}
                    {mode !== 'simple' && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-800 mb-0.5 block">C₂</label>
                        <div
                          role="spinbutton"
                          tabIndex={0}
                          aria-valuemin={10}
                          aria-valuemax={500}
                          aria-valuenow={capacitance2}
                          aria-label="C2"
                          onKeyDown={makeKeyHandler(capacitance2, 10, 500, 10, (v) => setCapacitance2(v), stage !== 'initial')}
                          className="flex items-center justify-between gap-1.5 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-1"
                        >
                          <button onClick={() => setCapacitance2(c => Math.max(10, c - 10))} disabled={stage !== 'initial'} className="w-6 h-6 rounded flex items-center justify-center bg-pink-50 text-pink-600 hover:bg-pink-100 disabled:opacity-50" type="button">
                            <span className="text-sm">−</span>
                          </button>
                          <span className="text-sm font-bold text-pink-400 min-w-[40px] text-center">{capacitance2}µF</span>
                          <button onClick={() => setCapacitance2(c => Math.min(500, c + 10))} disabled={stage !== 'initial'} className="w-6 h-6 rounded flex items-center justify-center bg-pink-50 text-pink-600 hover:bg-pink-100 disabled:opacity-50" type="button">
                            <span className="text-sm">+</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* C3 Control - only for series/parallel modes */}
                    {mode !== 'simple' && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-800 mb-0.5 block">C₃</label>
                        <div
                          role="spinbutton"
                          tabIndex={0}
                          aria-valuemin={10}
                          aria-valuemax={500}
                          aria-valuenow={capacitance3}
                          aria-label="C3"
                          onKeyDown={makeKeyHandler(capacitance3, 10, 500, 10, (v) => setCapacitance3(v), stage !== 'initial')}
                          className="flex items-center justify-between gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
                        >
                          <button onClick={() => setCapacitance3(c => Math.max(10, c - 10))} disabled={stage !== 'initial'} className="w-6 h-6 rounded flex items-center justify-center bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:opacity-50" type="button">
                            <span className="text-sm">−</span>
                          </button>
                          <span className="text-sm font-bold text-amber-400 min-w-[40px] text-center">{capacitance3}µF</span>
                          <button onClick={() => setCapacitance3(c => Math.min(500, c + 10))} disabled={stage !== 'initial'} className="w-6 h-6 rounded flex items-center justify-center bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:opacity-50" type="button">
                            <span className="text-sm">+</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-1 border-t border-purple-500/20 space-y-0.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-700 font-bold">Charge (Q):</span>
                        <span className="font-bold text-cyan-300 text-sm">{maxCharge.toFixed(2)}mC</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-700 font-bold">Energy:</span>
                        <span className="font-bold text-pink-300 text-sm">{storedEnergy.toFixed(2)}mJ</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-700 font-bold">Charging Time:</span>
                        <span className="font-bold text-cyan-300 text-sm">{animation.chargingTime.toFixed(2)}s</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-700 font-bold">Discharging Time:</span>
                        <span className="font-bold text-amber-400 text-sm">{animation.dischargingTime.toFixed(2)}s</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Circuit Basics */}
                <div className="bg-white/90 backdrop-blur-xl rounded-xl border-2 border-slate-300 p-1.5 shadow-lg flex-shrink-0">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-cyan-500 to-pink-600 flex items-center justify-center">
                      <Info className="w-2.5 h-2.5 text-white" />
                    </div>
                    <h3 className="text-xs font-black text-slate-700 tracking-[0.1em] uppercase">CIRCUIT BASICS</h3>
                  </div>
                  <div className="space-y-1">
                    <div>
                      <h4 className="text-[9px] font-black text-transparent bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text mb-0.5 tracking-[0.1em] uppercase">Description</h4>
                      {mode === 'simple' && <p className="text-[10px] text-slate-700 leading-tight font-bold">A basic circuit with one capacitor that stores energy in an electric field.</p>}
                      {mode === 'series' && <p className="text-[10px] text-slate-700 leading-tight font-bold">Capacitors in series: Total capacitance decreases. Same charge on each.</p>}
                      {mode === 'parallel' && <p className="text-[10px] text-slate-700 leading-tight font-bold">Capacitors in parallel: Total capacitance increases. Same voltage across each.</p>}
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-1 border-2 border-purple-300">
                      <h4 className="text-[9px] font-black text-transparent bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text mb-0.5 tracking-[0.1em] uppercase">Formula</h4>
                      {mode === 'simple' && <div className="text-sm font-serif text-slate-800 font-bold">Q = C × V</div>}
                      {mode === 'series' && <div className="text-[11px] font-serif text-slate-800 font-bold">1/C<sub>total</sub> = 1/C₁ + 1/C₂ + 1/C₃</div>}
                      {mode === 'parallel' && <div className="text-[11px] font-serif text-slate-800 font-bold">C<sub>total</sub> = C₁ + C₂ + C₃</div>}
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

export default CapacitorPage;
