import React, { useState, useEffect } from 'react';
import { StarField } from '@/components/electronics/StarField';
import { Zap, Info } from 'lucide-react';

type CircuitMode = 'simple' | 'series' | 'parallel';

interface InductorValues {
  voltage: number;
  l1: number; // mH
  l2: number; // mH
  currentRate: number; // A/s (dI/dt)
}

const InductorPage = () => {
  const [mode, setMode] = useState<CircuitMode>('simple');
  const [values, setValues] = useState<InductorValues>({
    voltage: 12,
    l1: 10,
    l2: 20,
    currentRate: 5,
  });
  const currentOn = true; // Always on
  const [currentDirection, setCurrentDirection] = useState<'forward' | 'reverse'>('forward');

  // Calculate total inductance based on mode
  const getTotalInductance = () => {
    switch (mode) {
      case 'simple':
        return values.l1;
      case 'series':
        return values.l1 + values.l2;
      case 'parallel':
        return (values.l1 * values.l2) / (values.l1 + values.l2);
    }
  };

  // Calculate induced voltage: V = L × dI/dt
  const getInducedVoltage = () => {
    const L = getTotalInductance() / 1000; // Convert mH to H
    return (L * values.currentRate).toFixed(2);
  };

  // Calculate current (simplified)
  const getCurrent = () => {
    return currentOn ? (values.voltage / 10).toFixed(2) : '0.00';
  };

  const getModeInfo = () => {
    switch (mode) {
      case 'simple':
        return {
          title: 'Simple Circuit',
          description: 'A basic circuit with one inductor that stores energy in a magnetic field.',
          formula: '<span style="font-style: italic;">V</span><sub>L</sub> = <span style="font-style: italic;">L</span> × <sup>d<span style="font-style: italic;">I</span></sup>/<sub>d<span style="font-style: italic;">t</span></sub>',
          tip: 'Inductors oppose changes in current flow by generating a back EMF voltage.',
        };
      case 'series':
        return {
          title: 'Series Circuit',
          description: 'Inductors connected end-to-end. Total inductance adds up.',
          formula: '<span style="font-style: italic;">L</span><sub>total</sub> = <span style="font-style: italic;">L</span><sub>1</sub> + <span style="font-style: italic;">L</span><sub>2</sub>',
          tip: 'More inductance means stronger opposition to current changes.',
        };
      case 'parallel':
        return {
          title: 'Parallel Circuit',
          description: 'Inductors connected side-by-side. Magnetic fields combine differently.',
          formula: '<sup>1</sup>/<sub><span style="font-style: italic;">L</span><sub>total</sub></sub> = <sup>1</sup>/<sub><span style="font-style: italic;">L</span><sub>1</sub></sub> + <sup>1</sup>/<sub><span style="font-style: italic;">L</span><sub>2</sub></sub>',
          tip: 'Parallel inductors result in lower total inductance.',
        };
    }
  };

  const info = getModeInfo();

  return (
    <div className="relative h-screen bg-background overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-cosmic-purple/10 to-cosmic-blue/10" />
      <StarField />

      {/* Main content */}
      <div className="relative z-10 h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-[95vw] h-[92vh] flex flex-col">
          {/* Header with title */}
          <div className="text-center mb-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2">
              <span className="text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)]">What are </span>
              <span className="bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(59,130,246,0.6)] animate-gradient">Inductors</span>
              <span className="text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)]">?</span>
            </h1>
            <p className="text-base md:text-lg text-white/70 font-bold tracking-wide drop-shadow-lg">Explore How Inductors Store Energy in Magnetic Fields</p>
          </div>

          {/* Mode selector tabs */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex rounded-xl border-2 border-blue-500/30 bg-card/60 backdrop-blur-xl p-1 shadow-2xl">
              <button
                onClick={() => setMode('simple')}
                className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${mode === 'simple'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'text-white/60 hover:text-white/90'
                  }`}
              >
                Simple
              </button>
              <button
                onClick={() => setMode('series')}
                className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${mode === 'series'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'text-white/60 hover:text-white/90'
                  }`}
              >
                Series
              </button>
              <button
                onClick={() => setMode('parallel')}
                className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${mode === 'parallel'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'text-white/60 hover:text-white/90'
                  }`}
              >
                Parallel
              </button>
            </div>
          </div>

          {/* Main circuit display card */}
          <div className="relative flex-1 rounded-3xl border-2 border-blue-500/30 p-4 overflow-hidden" style={{
            background: 'linear-gradient(135deg, hsl(var(--card)/0.95) 0%, hsl(var(--background)/0.98) 100%)',
            boxShadow: '0 24px 60px rgba(59, 130, 246, 0.2), 0 0 120px rgba(59, 130, 246, 0.1)'
          }}>
            {/* Layout: Circuit (60%), Controls (40%) */}
            <div className="flex gap-2 h-full">
              {/* Left: Circuit Display (60%) - Larger circuit */}
              <div className="flex-[60] relative rounded-2xl border-2 border-blue-500/30 bg-gradient-to-br from-background/50 to-background/70 backdrop-blur-md overflow-hidden shadow-2xl" style={{
                boxShadow: 'inset 0 2px 16px rgba(0,0,0,0.3), 0 8px 32px rgba(59,130,246,0.15)'
              }}>
                {/* Hint box - interactive based on mode */}
                <div className="absolute top-2 left-2 z-20 max-w-xs">
                  <div className="bg-card/95 backdrop-blur-md border-2 border-blue-500/30 rounded-lg p-2 shadow-xl">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span className="text-xl">💡</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-bold text-blue-400 mb-0.5">{info.title}</h3>
                        <p className="text-[10px] text-muted-foreground leading-snug">{info.description}</p>
                        <p className="text-[9px] text-blue-300/70 mt-1 italic">{info.tip}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Inductor Circuit Canvas */}
                <InductorCircuitCanvas
                  mode={mode}
                  values={values}
                  currentOn={currentOn}
                  currentDirection={currentDirection}
                />
              </div>

              {/* Right: Controls & Info (40%) */}
              <div className="flex-[40] flex flex-col gap-0.5 h-full overflow-hidden">
                {/* Controls Panel - Enhanced */}
                <div className="bg-gradient-to-br from-card/70 to-card/50 backdrop-blur-xl rounded-xl border-2 border-blue-500/40 p-1.5 shadow-2xl shadow-blue-500/20 flex-shrink-0 hover:shadow-blue-500/30 transition-shadow duration-300">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-blue-400/70 shadow-xl shadow-blue-500/60 animate-pulse">
                      <Zap className="w-3 h-3 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
                    </div>
                    <h3 className="text-xs font-black text-white tracking-[0.1em] uppercase drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)] bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">CONTROLS</h3>
                  </div>

                  {/* Flip Direction Control */}
                  <div className="mb-1.5 pb-1.5 border-b border-blue-500/20">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">Direction</span>
                      <button
                        onClick={() => setCurrentDirection(prev => prev === 'forward' ? 'reverse' : 'forward')}
                        className="px-3 py-1 rounded-lg font-bold text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50 hover:scale-105 hover:shadow-blue-500/70 transition-all"
                      >
                        🔄 Flip
                      </button>
                    </div>
                  </div>

                  {/* Value Controls */}
                  <InductorValuesPanel
                    mode={mode}
                    values={values}
                    onValuesChange={setValues}
                    totalInductance={getTotalInductance()}
                    inducedVoltage={getInducedVoltage()}
                    current={getCurrent()}
                  />
                </div>

                {/* Info Panel - Enhanced Readability */}
                <div className="bg-gradient-to-br from-card/70 to-card/50 backdrop-blur-xl rounded-xl border-2 border-blue-500/40 p-1.5 shadow-2xl shadow-blue-500/20 flex-shrink-0 hover:shadow-blue-500/30 transition-shadow duration-300">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center border-2 border-blue-400/70 shadow-xl shadow-blue-500/60 animate-pulse flex-shrink-0">
                      <Info className="w-2.5 h-2.5 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
                    </div>
                    <h3 className="text-xs font-black text-white tracking-[0.1em] uppercase drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)] bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">CIRCUIT BASICS</h3>
                  </div>
                  <div className="space-y-1">
                    <div className="animate-fade-in">
                      <h4 className="text-[9px] font-black text-transparent bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 bg-clip-text mb-0.5 tracking-[0.1em] uppercase drop-shadow-lg">Description</h4>
                      <p className="text-[10px] text-white/95 leading-tight font-bold drop-shadow-md hover:text-white transition-colors duration-200">{info.description}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/40 to-indigo-500/30 rounded-lg p-1 border-2 border-blue-400/70 shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all duration-300 hover:scale-[1.02] animate-pulse-slow">
                      <h4 className="text-[9px] font-black text-transparent bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200 bg-clip-text mb-0.5 tracking-[0.1em] uppercase drop-shadow-lg animate-gradient">Formula</h4>
                      <div className="text-sm font-serif text-white font-bold tracking-wide drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)] hover:scale-105 transition-transform duration-200" dangerouslySetInnerHTML={{ __html: info.formula }} />
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

// Inductor Values Panel Component
interface InductorValuesPanelProps {
  mode: CircuitMode;
  values: InductorValues;
  onValuesChange: (values: InductorValues) => void;
  totalInductance: number;
  inducedVoltage: string;
  current: string;
}

function InductorValuesPanel({ mode, values, onValuesChange, totalInductance, inducedVoltage, current }: InductorValuesPanelProps) {
  const makeKeyHandler = (value: number, min: number, max: number, step: number, apply: (v: number) => void) => (e: React.KeyboardEvent<HTMLDivElement>) => {
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
    <div className="space-y-1">
      {/* Voltage Control */}
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-xs font-bold text-muted-foreground w-16">Voltage</span>
        <div
          role="spinbutton"
          tabIndex={0}
          aria-valuemin={1}
          aria-valuemax={24}
          aria-valuenow={values.voltage}
          aria-label="Voltage"
          onKeyDown={makeKeyHandler(values.voltage, 1, 24, 1, (v) => onValuesChange({ ...values, voltage: v }))}
          className="flex items-center gap-0.5 rounded-lg border px-0.5 py-0.5 bg-blue-50 text-blue-600 border-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
        >
          <button
            onClick={() => onValuesChange({ ...values, voltage: Math.max(1, values.voltage - 1) })}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-blue-100 active:bg-blue-200 text-blue-600 transition-colors"
            type="button"
          >
            <span className="text-sm">−</span>
          </button>
          <span className="text-sm font-bold w-14 text-center tabular-nums">
            {values.voltage}V
          </span>
          <button
            onClick={() => onValuesChange({ ...values, voltage: Math.min(24, values.voltage + 1) })}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-blue-100 active:bg-blue-200 text-blue-600 transition-colors"
            type="button"
          >
            <span className="text-sm">+</span>
          </button>
        </div>
      </div>

      {/* L1 Control */}
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-xs font-bold text-muted-foreground w-16">L1</span>
        <div
          role="spinbutton"
          tabIndex={0}
          aria-valuemin={1}
          aria-valuemax={100}
          aria-valuenow={values.l1}
          aria-label="L1"
          onKeyDown={makeKeyHandler(values.l1, 1, 100, 5, (v) => onValuesChange({ ...values, l1: v }))}
          className="flex items-center gap-0.5 rounded-lg border px-0.5 py-0.5 bg-indigo-50 text-indigo-600 border-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
        >
          <button
            onClick={() => onValuesChange({ ...values, l1: Math.max(1, values.l1 - 5) })}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-indigo-100 active:bg-indigo-200 text-indigo-600 transition-colors"
            type="button"
          >
            <span className="text-sm">−</span>
          </button>
          <span className="text-sm font-bold w-14 text-center tabular-nums">
            {values.l1}mH
          </span>
          <button
            onClick={() => onValuesChange({ ...values, l1: Math.min(100, values.l1 + 5) })}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-indigo-100 active:bg-indigo-200 text-indigo-600 transition-colors"
            type="button"
          >
            <span className="text-sm">+</span>
          </button>
        </div>
      </div>

      {/* L2 Control */}
      {mode !== 'simple' && (
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-xs font-bold text-muted-foreground w-16">L2</span>
          <div
            role="spinbutton"
            tabIndex={0}
            aria-valuemin={1}
            aria-valuemax={100}
            aria-valuenow={values.l2}
            aria-label="L2"
            onKeyDown={makeKeyHandler(values.l2, 1, 100, 5, (v) => onValuesChange({ ...values, l2: v }))}
            className="flex items-center gap-0.5 rounded-lg border px-0.5 py-0.5 bg-indigo-50 text-indigo-600 border-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
          >
            <button
              onClick={() => onValuesChange({ ...values, l2: Math.max(1, values.l2 - 5) })}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-indigo-100 active:bg-indigo-200 text-indigo-600 transition-colors"
              type="button"
            >
              <span className="text-sm">−</span>
            </button>
            <span className="text-sm font-bold w-14 text-center tabular-nums">
              {values.l2}mH
            </span>
            <button
              onClick={() => onValuesChange({ ...values, l2: Math.min(100, values.l2 + 5) })}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-indigo-100 active:bg-indigo-200 text-indigo-600 transition-colors"
              type="button"
            >
              <span className="text-sm">+</span>
            </button>
          </div>
        </div>
      )}

      {/* Current Rate Control */}
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-xs font-bold text-muted-foreground w-16">dI/dt</span>
        <div
          role="spinbutton"
          tabIndex={0}
          aria-valuemin={1}
          aria-valuemax={20}
          aria-valuenow={values.currentRate}
          aria-label="dI/dt"
          onKeyDown={makeKeyHandler(values.currentRate, 1, 20, 1, (v) => onValuesChange({ ...values, currentRate: v }))}
          className="flex items-center gap-0.5 rounded-lg border px-0.5 py-0.5 bg-purple-50 text-purple-600 border-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
        >
          <button
            onClick={() => onValuesChange({ ...values, currentRate: Math.max(1, values.currentRate - 1) })}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-purple-100 active:bg-purple-200 text-purple-600 transition-colors"
            type="button"
          >
            <span className="text-sm">−</span>
          </button>
          <span className="text-sm font-bold w-14 text-center tabular-nums">
            {values.currentRate}A/s
          </span>
          <button
            onClick={() => onValuesChange({ ...values, currentRate: Math.min(20, values.currentRate + 1) })}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-purple-100 active:bg-purple-200 text-purple-600 transition-colors"
            type="button"
          >
            <span className="text-sm">+</span>
          </button>
        </div>
      </div>

      {/* Computed Values - Highlighted Box */}
      <div className="pt-1.5 mt-1.5 border-t border-blue-500/20">
        <div className="bg-gradient-to-br from-blue-500/40 to-indigo-500/30 rounded-lg p-1.5 border-2 border-blue-400/70 shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all duration-300 hover:scale-[1.02] space-y-0.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/90 font-semibold">Total L:</span>
            <span className="font-bold text-indigo-200 text-sm drop-shadow-md">{totalInductance.toFixed(2)}mH</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/90 font-semibold">Voltage:</span>
            <span className="font-bold text-blue-200 text-sm drop-shadow-md">{inducedVoltage}V</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/90 font-semibold">Current:</span>
            <span className="font-bold text-cyan-200 text-sm drop-shadow-md">{current}A</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inductor Circuit Canvas Component - WITH FULL ANIMATION
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

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
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

      <svg viewBox="0 0 600 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
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
        {currentOn && (
          <>
            {[1, 2, 3, 4].map((ring) => (
              <ellipse
                key={ring}
                cx="300"
                cy="200"
                rx={60 + ring * 30 * (fieldStrength / 100)}
                ry={40 + ring * 20 * (fieldStrength / 100)}
                fill="none"
                stroke="url(#inductorGradient)"
                strokeWidth="2"
                opacity={fieldStrength / 150}
                style={{
                  transformOrigin: '300px 200px',
                  animation: currentDirection === 'reverse'
                    ? `spin-reverse ${3 + ring}s linear infinite`
                    : `spin-forward ${3 + ring}s linear infinite`
                }}
              />
            ))}
          </>
        )}

        {/* Battery */}
        <g transform="translate(50, 150)">
          <rect x="0" y="0" width="40" height="100" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <rect x="15" y="-8" width="10" height="8" rx="2" fill="rgba(255,255,255,0.2)" />
          <text x="20" y="40" textAnchor="middle" fill="#3b82f6" fontSize="24" fontWeight="bold" className="transition-all duration-500">
            {currentDirection === 'forward' ? '+' : '−'}
          </text>
          <text x="20" y="75" textAnchor="middle" fill="#ef4444" fontSize="24" fontWeight="bold" className="transition-all duration-500">
            {currentDirection === 'forward' ? '−' : '+'}
          </text>
          <text x="55" y="55" textAnchor="start" fill="rgba(255,255,255,0.6)" fontSize="11">{values.voltage}V</text>
        </g>

        {/* Wire from battery + to inductor */}
        <line x1="90" y1="170" x2="280" y2="170" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
        {currentOn && (
          <>
            <circle cx="120" cy="170" r="3" fill="#60a5fa">
              <animate attributeName="cx" from="90" to="280" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="180" cy="170" r="3" fill="#60a5fa">
              <animate attributeName="cx" from="90" to="280" dur="1.2s" begin="0.6s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {mode === 'simple' && (
          <>
            {/* Single Inductor Coil - centered */}
            <g transform="translate(280, 150)">
              {[0, 1, 2, 3, 4].map((i) => (
                <ellipse
                  key={i}
                  cx={i * 20}
                  cy="20"
                  rx="10"
                  ry="15"
                  fill="none"
                  stroke={currentOn ? 'url(#inductorGradient)' : 'rgba(255,255,255,0.2)'}
                  strokeWidth="3"
                  filter={currentOn ? 'url(#glow)' : undefined}
                />
              ))}
              <rect x="0" y="10" width="80" height="20" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <text x="40" y="-5" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="bold">L1</text>
              <text x="40" y="65" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12">{values.l1}mH</text>
            </g>

            {/* Wire from inductor back to battery negative terminal */}
            <line x1="360" y1="170" x2="480" y2="170" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            <line x1="480" y1="170" x2="480" y2="230" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            <line x1="480" y1="230" x2="70" y2="230" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            {/* Connection to battery bottom terminal */}
            <line x1="70" y1="230" x2="70" y2="235" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            {currentOn && (
              <>
                <circle cx="420" cy="170" r="3" fill="#60a5fa">
                  <animate attributeName="cx" from="360" to="480" dur="0.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="480" cy="200" r="3" fill="#60a5fa">
                  <animate attributeName="cy" from="170" to="230" dur="0.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="275" cy="230" r="3" fill="#60a5fa">
                  <animate attributeName="cx" from="480" to="70" dur="1.4s" repeatCount="indefinite" />
                </circle>
              </>
            )}
          </>
        )}

        {mode === 'series' && (
          <>
            {/* L1 Inductor */}
            <g transform="translate(220, 150)">
              {[0, 1, 2, 3, 4].map((i) => (
                <ellipse
                  key={i}
                  cx={i * 16}
                  cy="20"
                  rx="8"
                  ry="12"
                  fill="none"
                  stroke={currentOn ? 'url(#inductorGradient)' : 'rgba(255,255,255,0.2)'}
                  strokeWidth="3"
                  filter={currentOn ? 'url(#glow)' : undefined}
                />
              ))}
              <rect x="0" y="10" width="64" height="20" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <text x="32" y="-5" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="bold">L1</text>
              <text x="32" y="60" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11">{values.l1}mH</text>
            </g>

            {/* Wire between inductors */}
            <line x1="284" y1="170" x2="320" y2="170" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            {currentOn && (
              <circle cx="302" cy="170" r="3" fill="#60a5fa">
                <animate attributeName="cx" from="284" to="320" dur="0.3s" repeatCount="indefinite" />
              </circle>
            )}

            {/* L2 Inductor */}
            <g transform="translate(320, 150)">
              {[0, 1, 2, 3, 4].map((i) => (
                <ellipse
                  key={i}
                  cx={i * 16}
                  cy="20"
                  rx="8"
                  ry="12"
                  fill="none"
                  stroke={currentOn ? 'url(#inductorGradient)' : 'rgba(255,255,255,0.2)'}
                  strokeWidth="3"
                  filter={currentOn ? 'url(#glow)' : undefined}
                />
              ))}
              <rect x="0" y="10" width="64" height="20" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <text x="32" y="-5" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="bold">L2</text>
              <text x="32" y="60" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11">{values.l2}mH</text>
            </g>

            {/* Wire from L2 back to battery negative terminal */}
            <line x1="384" y1="170" x2="480" y2="170" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            <line x1="480" y1="170" x2="480" y2="230" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            <line x1="480" y1="230" x2="70" y2="230" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            {/* Connection to battery bottom terminal */}
            <line x1="70" y1="230" x2="70" y2="235" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            {currentOn && (
              <>
                <circle cx="432" cy="170" r="3" fill="#60a5fa">
                  <animate attributeName="cx" from="384" to="480" dur="0.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="480" cy="200" r="3" fill="#60a5fa">
                  <animate attributeName="cy" from="170" to="230" dur="0.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="275" cy="230" r="3" fill="#60a5fa">
                  <animate attributeName="cx" from="480" to="70" dur="1.4s" repeatCount="indefinite" />
                </circle>
              </>
            )}
          </>
        )}

        {mode === 'parallel' && (
          <>
            {/* Wire from battery comes in and splits at x=230 */}
            <line x1="280" y1="170" x2="230" y2="170" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />

            {/* Split point - vertical lines going to each branch level */}
            <line x1="230" y1="170" x2="230" y2="115" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            <line x1="230" y1="170" x2="230" y2="225" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />

            {/* Horizontal wires from split to L1 (top) */}
            <line x1="230" y1="115" x2="260" y2="115" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            {/* Horizontal wires from split to L2 (bottom) */}
            <line x1="230" y1="225" x2="260" y2="225" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />

            {/* L1 Top Branch - CENTERED around x=300 */}
            {/* translate(268, 95): left edge = 268-8=260, right edge = 268+64+8=340 */}
            <g transform="translate(268, 95)">
              {[0, 1, 2, 3, 4].map((i) => (
                <ellipse
                  key={i}
                  cx={i * 16}
                  cy="20"
                  rx="8"
                  ry="12"
                  fill="none"
                  stroke={currentOn ? 'url(#inductorGradient)' : 'rgba(255,255,255,0.2)'}
                  strokeWidth="3"
                  filter={currentOn ? 'url(#glow)' : undefined}
                />
              ))}
              <rect x="-8" y="10" width="80" height="20" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <text x="32" y="-5" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="bold">L1</text>
              <text x="32" y="53" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11">{values.l1}mH</text>
            </g>

            {/* L2 Bottom Branch - CENTERED around x=300 */}
            <g transform="translate(268, 205)">
              {[0, 1, 2, 3, 4].map((i) => (
                <ellipse
                  key={i}
                  cx={i * 16}
                  cy="20"
                  rx="8"
                  ry="12"
                  fill="none"
                  stroke={currentOn ? 'url(#inductorGradient)' : 'rgba(255,255,255,0.2)'}
                  strokeWidth="3"
                  filter={currentOn ? 'url(#glow)' : undefined}
                />
              ))}
              <rect x="-8" y="10" width="80" height="20" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <text x="32" y="-5" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="bold">L2</text>
              <text x="32" y="53" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11">{values.l2}mH</text>
            </g>

            {/* Right side - horizontal wires from coil right edges to join point */}
            <line x1="340" y1="115" x2="370" y2="115" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            <line x1="340" y1="225" x2="370" y2="225" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />

            {/* Right side - vertical wires joining the two branches */}
            <line x1="370" y1="115" x2="370" y2="170" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            <line x1="370" y1="170" x2="370" y2="225" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />

            {/* Wire back to battery negative terminal */}
            <line x1="370" y1="170" x2="480" y2="170" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            <line x1="480" y1="170" x2="480" y2="280" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            <line x1="480" y1="280" x2="70" y2="280" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />
            {/* Connection to battery bottom terminal */}
            <line x1="70" y1="280" x2="70" y2="250" stroke={currentOn ? '#3b82f6' : 'rgba(255,255,255,0.2)'} strokeWidth="3" />

            {currentOn && (
              <>
                {/* Electron flow from main wire to split point */}
                <circle cx="255" cy="170" r="3" fill="#60a5fa">
                  <animate attributeName="cx" from="280" to="230" dur="0.3s" repeatCount="indefinite" />
                </circle>
                {/* Electron flow up to L1 branch */}
                <circle cx="230" cy="142" r="3" fill="#60a5fa">
                  <animate attributeName="cy" from="170" to="115" dur="0.3s" repeatCount="indefinite" />
                </circle>
                {/* Electron flow down to L2 branch */}
                <circle cx="230" cy="197" r="3" fill="#60a5fa">
                  <animate attributeName="cy" from="170" to="225" dur="0.3s" repeatCount="indefinite" />
                </circle>
                {/* Electron flow on L1 horizontal to coil */}
                <circle cx="245" cy="115" r="3" fill="#60a5fa">
                  <animate attributeName="cx" from="230" to="260" dur="0.2s" repeatCount="indefinite" />
                </circle>
                {/* Electron flow on L2 horizontal to coil */}
                <circle cx="245" cy="225" r="3" fill="#60a5fa">
                  <animate attributeName="cx" from="230" to="260" dur="0.2s" repeatCount="indefinite" />
                </circle>
                {/* Electron flow from join point to main return wire */}
                <circle cx="425" cy="170" r="3" fill="#60a5fa">
                  <animate attributeName="cx" from="370" to="480" dur="1s" repeatCount="indefinite" />
                </circle>
                <circle cx="480" cy="225" r="3" fill="#60a5fa">
                  <animate attributeName="cy" from="170" to="280" dur="0.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="275" cy="280" r="3" fill="#60a5fa">
                  <animate attributeName="cx" from="480" to="70" dur="1.4s" repeatCount="indefinite" />
                </circle>
              </>
            )}
          </>
        )}

        {/* Current direction indicator */}
        {currentOn && (
          <text x="300" y="320" textAnchor="middle" fill="url(#inductorGradient)" fontSize="16" fontWeight="bold" className="animate-pulse">
            ⚡ {currentDirection === 'forward' ? '→' : '←'} Magnetic Field Active ⚡
          </text>
        )}
      </svg>
    </div>
  );
}

export default InductorPage;
