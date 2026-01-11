import React, { useState, useEffect, useCallback } from 'react';
import { StarField } from '@/components/electronics/StarField';
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
        return 1 / (1/capacitance + 1/capacitance2 + 1/capacitance3);
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
    <div className="relative h-screen bg-background overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-cosmic-purple/10 to-cosmic-blue/10" />
      <StarField />

      {/* Main content */}
      <div className="relative z-10 h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-[95vw] h-[92vh] flex flex-col">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2">
              <span className="text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)]">What are </span>
              <span className="bg-gradient-to-r from-[#06b6d4] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(139,92,246,0.6)]">Capacitors</span>
              <span className="text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)]">?</span>
            </h1>
            <p className="text-base md:text-lg text-white/70 font-bold tracking-wide drop-shadow-lg">Explore How Capacitors Store Energy in Electric Fields</p>
          </div>

          {/* Mode tabs */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex rounded-xl border-2 border-blue-500/30 bg-card/60 backdrop-blur-xl p-1 shadow-2xl">
              {(['simple', 'series', 'parallel'] as CircuitMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
                    mode === m
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/50'
                      : 'text-white/60 hover:text-white/90'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Main display */}
          <div className="relative flex-1 rounded-3xl border-2 border-blue-500/30 p-4 overflow-hidden" style={{
            background: 'linear-gradient(135deg, hsl(var(--card)/0.95) 0%, hsl(var(--background)/0.98) 100%)',
            boxShadow: '0 24px 60px rgba(139, 92, 246, 0.2), 0 0 120px rgba(139, 92, 246, 0.1)'
          }}>
            <div className="flex gap-2 h-full">
              {/* Circuit (60%) */}
              <div className="flex-[60] relative rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-background/50 to-background/70 backdrop-blur-md overflow-hidden shadow-2xl">
                {/* Info box */}
                <div className="absolute top-2 left-2 z-20 max-w-xs">
                  <div className="bg-card/95 backdrop-blur-md border-2 border-primary/30 rounded-lg p-2 shadow-xl">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xl">💡</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-bold text-primary mb-0.5">{info.title}</h3>
                        <p className="text-[10px] text-muted-foreground leading-snug">{info.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SVG Circuit */}
                <div className="w-full h-full flex items-center justify-center p-4">
                  <svg viewBox="0 0 760 480" className="w-full h-full max-h-[450px]" preserveAspectRatio="xMidYMid meet">
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
                        
                        <line x1="330" y1="410" x2="330" y2="400" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="430" y1="410" x2="430" y2="400" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />

                        {/* Capacitor */}
                        <g transform="translate(380, 150)">
                          <rect x="-30" y="20" width="10" height="60" rx="3" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} filter="url(#glow)" />
                          <rect x="20" y="20" width="10" height="60" rx="3" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} filter="url(#glow)" />
                          <rect x="-20" y="20" width="40" height="60" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.9} rx="2" />
                          {animation.fieldStrength > 0.1 && (
                            <g opacity={animation.fieldStrength * 0.6}>
                              {[0, 1, 2, 3, 4].map(i => (
                                <line key={i} x1="-15" y1={30 + i * 10} x2="15" y2={30 + i * 10} stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="4,4" />
                              ))}
                            </g>
                          )}
                          <text x="-35" y="55" className="text-base font-bold" fill="rgba(59, 130, 246, 1)">−</text>
                          <text x="35" y="55" className="text-base font-bold" fill="rgba(236, 72, 153, 1)">+</text>
                          <text x="0" y="8" textAnchor="middle" className="text-sm font-bold" fill="rgba(226, 232, 240, 0.9)">⚡ Capacitor</text>
                          <text x="0" y="100" textAnchor="middle" className="text-sm font-semibold" fill="rgba(167, 139, 250, 0.9)">{capacitance}µF</text>
                        </g>

                        {/* Battery - Always visible */}
                        <g transform="translate(380, 370)">
                          <rect x="-50" y="-30" width="100" height="70" rx="10" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="2" filter="url(#glow)" />
                          <rect x="-55" y="-10" width="10" height="30" rx="3" fill="rgba(239, 68, 68, 0.6)" />
                          <rect x="45" y="-10" width="10" height="30" rx="3" fill="rgba(34, 197, 94, 0.6)" />
                          <circle cx="-25" cy="10" r="16" fill="rgba(239, 68, 68, 0.2)" stroke="rgba(239, 68, 68, 0.8)" strokeWidth="2" />
                          <text x="-25" y="16" textAnchor="middle" className="text-lg font-bold" fill="rgba(239, 68, 68, 1)">+</text>
                          <circle cx="25" cy="10" r="16" fill="rgba(34, 197, 94, 0.2)" stroke="rgba(34, 197, 94, 0.8)" strokeWidth="2" />
                          <text x="25" y="16" textAnchor="middle" className="text-lg font-bold" fill="rgba(34, 197, 94, 1)">−</text>
                          <text x="0" y="-40" textAnchor="middle" className="text-sm font-bold" fill="rgba(226, 232, 240, 0.9)">🔋 Battery</text>
                          <text x="0" y="55" textAnchor="middle" className="text-sm font-semibold" fill="rgba(147, 197, 253, 0.9)">{voltage}V</text>
                        </g>

                        {/* Bulb */}
                        {(stage === 'discharge' || stage === 'discharged') && (
                          <g transform="translate(100, 300)">
                            <circle cx="0" cy="0" r={45 + animation.bulbGlow * 25} fill="url(#bulbRadiant)" opacity={animation.bulbGlow * 0.5} filter="url(#bulbGlow)" />
                            <circle cx="0" cy="0" r="35" fill={`rgba(255, 240, 200, ${0.1 + animation.bulbGlow * 0.4})`} stroke="rgba(251, 191, 36, 0.8)" strokeWidth="3" filter="url(#glow)" />
                            <path d="M -12 0 Q -8 -12 -4 0 Q 0 12 4 0 Q 8 -12 12 0" fill="none" stroke={`rgba(255, 200, 50, ${0.4 + animation.bulbGlow * 0.6})`} strokeWidth="3" strokeLinecap="round" />
                            <rect x="-15" y="38" width="30" height="18" rx="4" fill="rgba(113, 113, 122, 0.9)" />
                            <line x1="-10" y1="55" x2="-10" y2="65" stroke="rgba(113, 113, 122, 0.9)" strokeWidth="3" />
                            <line x1="10" y1="55" x2="10" y2="65" stroke="rgba(113, 113, 122, 0.9)" strokeWidth="3" />
                            <text x="0" y="85" textAnchor="middle" className="text-sm font-bold" fill="rgba(251, 191, 36, 0.9)">💡 {(animation.bulbGlow * 100).toFixed(0)}%</text>
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
                        
                        {/* Battery connection lines */}
                        <line x1="330" y1="410" x2="330" y2="400" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                        <line x1="430" y1="410" x2="430" y2="400" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />

                        {/* Capacitor 1 (left) */}
                        <g transform="translate(220, 150)">
                          <rect x="-20" y="20" width="8" height="50" rx="2" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} filter="url(#glow)" />
                          <rect x="12" y="20" width="8" height="50" rx="2" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} filter="url(#glow)" />
                          <rect x="-12" y="20" width="24" height="50" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.7} rx="2" />
                          {animation.fieldStrength > 0.1 && (
                            <g opacity={animation.fieldStrength * 0.5}>
                              {[0, 1, 2, 3].map(i => (
                                <line key={i} x1="-10" y1={30 + i * 10} x2="10" y2={30 + i * 10} stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
                              ))}
                            </g>
                          )}
                          <text x="0" y="10" textAnchor="middle" className="text-xs font-bold" fill="white">C₁</text>
                          <text x="0" y="85" textAnchor="middle" className="text-[10px] font-semibold" fill="rgba(147, 197, 253, 0.9)">{capacitance}µF</text>
                        </g>

                        {/* Capacitor 2 (middle) */}
                        <g transform="translate(370, 150)">
                          <rect x="-20" y="20" width="8" height="50" rx="2" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} filter="url(#glow)" />
                          <rect x="12" y="20" width="8" height="50" rx="2" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} filter="url(#glow)" />
                          <rect x="-12" y="20" width="24" height="50" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.7} rx="2" />
                          {animation.fieldStrength > 0.1 && (
                            <g opacity={animation.fieldStrength * 0.5}>
                              {[0, 1, 2, 3].map(i => (
                                <line key={i} x1="-10" y1={30 + i * 10} x2="10" y2={30 + i * 10} stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
                              ))}
                            </g>
                          )}
                          <text x="0" y="10" textAnchor="middle" className="text-xs font-bold" fill="white">C₂</text>
                          <text x="0" y="85" textAnchor="middle" className="text-[10px] font-semibold" fill="rgba(147, 197, 253, 0.9)">{capacitance2}µF</text>
                        </g>

                        {/* Capacitor 3 (right) */}
                        <g transform="translate(520, 150)">
                          <rect x="-20" y="20" width="8" height="50" rx="2" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} filter="url(#glow)" />
                          <rect x="12" y="20" width="8" height="50" rx="2" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} filter="url(#glow)" />
                          <rect x="-12" y="20" width="24" height="50" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.7} rx="2" />
                          {animation.fieldStrength > 0.1 && (
                            <g opacity={animation.fieldStrength * 0.5}>
                              {[0, 1, 2, 3].map(i => (
                                <line key={i} x1="-10" y1={30 + i * 10} x2="10" y2={30 + i * 10} stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
                              ))}
                            </g>
                          )}
                          <text x="0" y="10" textAnchor="middle" className="text-xs font-bold" fill="white">C₃</text>
                          <text x="0" y="85" textAnchor="middle" className="text-[10px] font-semibold" fill="rgba(147, 197, 253, 0.9)">{capacitance3}µF</text>
                        </g>

                        {/* Battery - Always visible */}
                        <g transform="translate(380, 370)">
                          <rect x="-50" y="-30" width="100" height="70" rx="10" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="2" filter="url(#glow)" />
                          <rect x="-55" y="-10" width="10" height="30" rx="3" fill="rgba(239, 68, 68, 0.6)" />
                          <rect x="45" y="-10" width="10" height="30" rx="3" fill="rgba(34, 197, 94, 0.6)" />
                          <circle cx="-25" cy="10" r="16" fill="rgba(239, 68, 68, 0.2)" stroke="rgba(239, 68, 68, 0.8)" strokeWidth="2" />
                          <text x="-25" y="16" textAnchor="middle" className="text-lg font-bold" fill="rgba(239, 68, 68, 1)">+</text>
                          <circle cx="25" cy="10" r="16" fill="rgba(34, 197, 94, 0.2)" stroke="rgba(34, 197, 94, 0.8)" strokeWidth="2" />
                          <text x="25" y="16" textAnchor="middle" className="text-lg font-bold" fill="rgba(34, 197, 94, 1)">−</text>
                          <text x="0" y="-40" textAnchor="middle" className="text-sm font-bold" fill="rgba(226, 232, 240, 0.9)">🔋 Battery</text>
                          <text x="0" y="55" textAnchor="middle" className="text-sm font-semibold" fill="rgba(147, 197, 253, 0.9)">{voltage}V</text>
                        </g>

                        {/* Bulb */}
                        {(stage === 'discharge' || stage === 'discharged') && (
                          <g transform="translate(100, 300)">
                            <circle cx="0" cy="0" r={45 + animation.bulbGlow * 25} fill="url(#bulbRadiant)" opacity={animation.bulbGlow * 0.5} filter="url(#bulbGlow)" />
                            <circle cx="0" cy="0" r="35" fill={`rgba(255, 240, 200, ${0.1 + animation.bulbGlow * 0.4})`} stroke="rgba(251, 191, 36, 0.8)" strokeWidth="3" filter="url(#glow)" />
                            <path d="M -12 0 Q -8 -12 -4 0 Q 0 12 4 0 Q 8 -12 12 0" fill="none" stroke={`rgba(255, 200, 50, ${0.4 + animation.bulbGlow * 0.6})`} strokeWidth="3" strokeLinecap="round" />
                            <rect x="-15" y="38" width="30" height="18" rx="4" fill="rgba(113, 113, 122, 0.9)" />
                            <line x1="-10" y1="55" x2="-10" y2="65" stroke="rgba(113, 113, 122, 0.9)" strokeWidth="3" />
                            <line x1="10" y1="55" x2="10" y2="65" stroke="rgba(113, 113, 122, 0.9)" strokeWidth="3" />
                            <text x="0" y="85" textAnchor="middle" className="text-sm font-bold" fill="rgba(251, 191, 36, 0.9)">💡 {(animation.bulbGlow * 100).toFixed(0)}%</text>
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
                        <g transform="translate(320, 300)">
                          <line x1="0" y1="-100" x2="0" y2="-30" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          <line x1="0" y1="30" x2="0" y2="100" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          <rect x="-40" y="-25" width="80" height="8" rx="3" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} filter="url(#glow)" />
                          <rect x="-40" y="17" width="80" height="8" rx="3" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} filter="url(#glow)" />
                          <rect x="-40" y="-17" width="80" height="34" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.9} rx="2" />
                          {animation.fieldStrength > 0.1 && (
                            <g opacity={animation.fieldStrength * 0.6}>
                              {[0, 1, 2, 3, 4].map(i => (
                                <line key={i} x1={-30 + i * 15} y1="-12" x2={-30 + i * 15} y2="12" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="4,4" />
                              ))}
                            </g>
                          )}
                          <rect x="-12" y="-43" width="24" height="20" rx="4" fill="rgba(15, 23, 42, 0.8)" />
                          <text x="0" y="-32" textAnchor="middle" className="text-lg font-bold" fill="rgba(59, 130, 246, 1)">−</text>
                          <rect x="-12" y="31" width="24" height="20" rx="4" fill="rgba(15, 23, 42, 0.8)" />
                          <text x="0" y="43" textAnchor="middle" className="text-lg font-bold" fill="rgba(236, 72, 153, 1)">+</text>
                          <text x="0" y="-52" textAnchor="middle" className="text-xs font-bold" fill="white">C₁</text>
                          <text x="0" y="65" textAnchor="middle" className="text-xs font-bold" fill="rgba(147, 197, 253, 1)">{capacitance}µF</text>
                        </g>

                        {/* Capacitor 2 (middle) - Horizontal plates */}
                        <g transform="translate(450, 300)">
                          <line x1="0" y1="-100" x2="0" y2="-30" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          <line x1="0" y1="30" x2="0" y2="100" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          <rect x="-40" y="-25" width="80" height="8" rx="3" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} filter="url(#glow)" />
                          <rect x="-40" y="17" width="80" height="8" rx="3" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} filter="url(#glow)" />
                          <rect x="-40" y="-17" width="80" height="34" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.9} rx="2" />
                          {animation.fieldStrength > 0.1 && (
                            <g opacity={animation.fieldStrength * 0.6}>
                              {[0, 1, 2, 3, 4].map(i => (
                                <line key={i} x1={-30 + i * 15} y1="-12" x2={-30 + i * 15} y2="12" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="4,4" />
                              ))}
                            </g>
                          )}
                          <rect x="-12" y="-43" width="24" height="20" rx="4" fill="rgba(15, 23, 42, 0.8)" />
                          <text x="0" y="-32" textAnchor="middle" className="text-lg font-bold" fill="rgba(59, 130, 246, 1)">−</text>
                          <rect x="-12" y="31" width="24" height="20" rx="4" fill="rgba(15, 23, 42, 0.8)" />
                          <text x="0" y="43" textAnchor="middle" className="text-lg font-bold" fill="rgba(236, 72, 153, 1)">+</text>
                          <text x="0" y="-52" textAnchor="middle" className="text-xs font-bold" fill="white">C₂</text>
                          <text x="0" y="65" textAnchor="middle" className="text-xs font-bold" fill="rgba(147, 197, 253, 1)">{capacitance2}µF</text>
                        </g>

                        {/* Capacitor 3 (right) - Horizontal plates */}
                        <g transform="translate(580, 300)">
                          <line x1="0" y1="-100" x2="0" y2="-30" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          <line x1="0" y1="30" x2="0" y2="100" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                          <rect x="-40" y="-25" width="80" height="8" rx="3" fill={`rgba(59, 130, 246, ${0.4 + animation.chargeLevel * 0.6})`} filter="url(#glow)" />
                          <rect x="-40" y="17" width="80" height="8" rx="3" fill={`rgba(236, 72, 153, ${0.4 + animation.chargeLevel * 0.6})`} filter="url(#glow)" />
                          <rect x="-40" y="-17" width="80" height="34" fill="url(#fieldGradient)" opacity={animation.fieldStrength * 0.9} rx="2" />
                          {animation.fieldStrength > 0.1 && (
                            <g opacity={animation.fieldStrength * 0.6}>
                              {[0, 1, 2, 3, 4].map(i => (
                                <line key={i} x1={-30 + i * 15} y1="-12" x2={-30 + i * 15} y2="12" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeDasharray="4,4" />
                              ))}
                            </g>
                          )}
                          <rect x="-12" y="-43" width="24" height="20" rx="4" fill="rgba(15, 23, 42, 0.8)" />
                          <text x="0" y="-32" textAnchor="middle" className="text-lg font-bold" fill="rgba(59, 130, 246, 1)">−</text>
                          <rect x="-12" y="31" width="24" height="20" rx="4" fill="rgba(15, 23, 42, 0.8)" />
                          <text x="0" y="43" textAnchor="middle" className="text-lg font-bold" fill="rgba(236, 72, 153, 1)">+</text>
                          <text x="0" y="-52" textAnchor="middle" className="text-xs font-bold" fill="white">C₃</text>
                          <text x="0" y="65" textAnchor="middle" className="text-xs font-bold" fill="rgba(147, 197, 253, 1)">{capacitance3}µF</text>
                        </g>

                        {/* Battery - Visible during charging stages */}
                        {stage !== 'discharge' && stage !== 'discharged' && (
                          <g transform="translate(150, 300)">
                            <line x1="0" y1="-100" x2="0" y2="-50" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                            <line x1="0" y1="50" x2="0" y2="100" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
                            <rect x="-30" y="-50" width="60" height="100" rx="10" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="2" filter="url(#glow)" />
                            <rect x="-10" y="-55" width="20" height="10" rx="3" fill="rgba(239, 68, 68, 0.6)" />
                            <rect x="-10" y="45" width="20" height="10" rx="3" fill="rgba(34, 197, 94, 0.6)" />
                            <circle cx="0" cy="-20" r="14" fill="rgba(239, 68, 68, 0.2)" stroke="rgba(239, 68, 68, 0.8)" strokeWidth="2" />
                            <text x="0" y="-14" textAnchor="middle" className="text-base font-bold" fill="rgba(239, 68, 68, 1)">+</text>
                            <circle cx="0" cy="20" r="14" fill="rgba(34, 197, 94, 0.2)" stroke="rgba(34, 197, 94, 0.8)" strokeWidth="2" />
                            <text x="0" y="26" textAnchor="middle" className="text-base font-bold" fill="rgba(34, 197, 94, 1)">−</text>
                            <text x="-45" y="5" textAnchor="end" className="text-sm font-bold" fill="rgba(226, 232, 240, 0.9)">🔋</text>
                            <text x="45" y="5" textAnchor="start" className="text-xs font-semibold" fill="rgba(147, 197, 253, 0.9)">{voltage}V</text>
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
                        const capacitorX = branchIndex === 0 ? 320 : branchIndex === 1 ? 450 : 580;
                        
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
                          // During charging: flow through battery on left side
                          const pathLength = 1000;
                          const dist = totalProgress * pathLength;
                          
                          if (dist < 200) { // left vertical up from bottom to top rail
                            x = 150;
                            y = 400 - (400 - 200) * (dist / 200);
                          } else if (dist < 350) { // top rail from left to capacitor
                            const progress = (dist - 200) / 150;
                            x = 150 + (capacitorX - 150) * progress;
                            y = 200;
                          } else if (dist < 550) { // down through capacitor
                            x = capacitorX;
                            y = 200 + (400 - 200) * ((dist - 350) / 200);
                          } else if (dist < 700) { // bottom rail from capacitor back to left
                            const progress = (dist - 550) / 150;
                            x = capacitorX - (capacitorX - 150) * progress;
                            y = 400;
                          } else { // left vertical completing circuit through battery
                            x = 150;
                            y = 400;
                          }
                        }
                      }
                      
                      return (
                        <circle key={e.id} cx={x} cy={y} r="5" fill="rgba(56, 189, 248, 0.95)" filter="url(#glow)" />
                      );
                    })}

                    {/* Charge level indicator */}
                    <g transform="translate(380, 110)">
                      <rect x="-70" y="-15" width="140" height="30" rx="15" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="2" />
                      <rect x="-65" y="-10" width={130 * animation.chargeLevel} height="20" rx="10" fill="url(#fieldGradient)" filter="url(#glow)" />
                      <text x="0" y="5" textAnchor="middle" className="text-sm font-bold" fill="white">{(animation.chargeLevel * 100).toFixed(0)}%</text>
                    </g>

                    {/* Stored Energy Display */}
                    <g transform="translate(660, 110)">
                      <rect x="-70" y="-25" width="140" height="50" rx="12" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" />
                      <text x="0" y="-5" textAnchor="middle" className="text-xs font-semibold" fill="rgba(167, 139, 250, 0.9)">Stored Energy</text>
                      <text x="0" y="18" textAnchor="middle" className="text-base font-bold" fill="rgba(226, 232, 240, 0.95)">{(storedEnergy * animation.chargeLevel).toFixed(2)} mJ</text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Controls (40%) */}
              <div className="flex-[40] flex flex-col gap-0.5 h-full overflow-hidden">
                {/* Controls Panel */}
                <div className="bg-gradient-to-br from-card/70 to-card/50 backdrop-blur-xl rounded-xl border-2 border-purple-500/40 p-1.5 shadow-2xl flex-shrink-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="text-xs font-black text-white tracking-[0.1em] uppercase">CONTROLS</h3>
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
                      <label className="text-[10px] font-semibold text-muted-foreground mb-0.5 block">Voltage</label>
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
                      <label className="text-[10px] font-semibold text-muted-foreground mb-0.5 block">Capacitance</label>
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

                    <div className="pt-1 border-t border-purple-500/20 space-y-0.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-semibold">Charge (Q):</span>
                        <span className="font-bold text-cyan-300 text-sm">{maxCharge.toFixed(2)}mC</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-semibold">Energy:</span>
                        <span className="font-bold text-pink-300 text-sm">{storedEnergy.toFixed(2)}mJ</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-semibold">Charging Time:</span>
                        <span className="font-bold text-cyan-300 text-sm">{animation.chargingTime.toFixed(2)}s</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-semibold">Discharging Time:</span>
                        <span className="font-bold text-amber-400 text-sm">{animation.dischargingTime.toFixed(2)}s</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Circuit Basics */}
                <div className="bg-gradient-to-br from-card/70 to-card/50 backdrop-blur-xl rounded-xl border-2 border-purple-500/40 p-1.5 shadow-2xl flex-shrink-0">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-cyan-500 to-pink-600 flex items-center justify-center">
                      <Info className="w-2.5 h-2.5 text-white" />
                    </div>
                    <h3 className="text-xs font-black text-white tracking-[0.1em] uppercase">CIRCUIT BASICS</h3>
                  </div>
                  <div className="space-y-1">
                    <div>
                      <h4 className="text-[9px] font-black text-transparent bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text mb-0.5 tracking-[0.1em] uppercase">Description</h4>
                      {mode === 'simple' && <p className="text-[10px] text-white/95 leading-tight font-bold">A basic circuit with one capacitor that stores energy in an electric field.</p>}
                      {mode === 'series' && <p className="text-[10px] text-white/95 leading-tight font-bold">Capacitors in series: Total capacitance decreases. Same charge on each.</p>}
                      {mode === 'parallel' && <p className="text-[10px] text-white/95 leading-tight font-bold">Capacitors in parallel: Total capacitance increases. Same voltage across each.</p>}
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/40 to-pink-500/30 rounded-lg p-1 border-2 border-purple-400/70">
                      <h4 className="text-[9px] font-black text-transparent bg-gradient-to-r from-cyan-200 via-purple-200 to-pink-200 bg-clip-text mb-0.5 tracking-[0.1em] uppercase">Formula</h4>
                      {mode === 'simple' && <div className="text-sm font-serif text-white font-bold">Q = C × V</div>}
                      {mode === 'series' && <div className="text-[11px] font-serif text-white font-bold">1/C<sub>total</sub> = 1/C₁ + 1/C₂ + 1/C₃</div>}
                      {mode === 'parallel' && <div className="text-[11px] font-serif text-white font-bold">C<sub>total</sub> = C₁ + C₂ + C₃</div>}
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
