import { useState } from 'react';
import { StarField } from '@/components/electronics/StarField';
import { Zap, Info } from 'lucide-react';

type CircuitMode = 'simple' | 'series' | 'parallel';

interface CapacitorValues {
  voltage: number;
  c1: number; // µF
  c2: number; // µF
}

const CapacitorPage = () => {
  const [mode, setMode] = useState<CircuitMode>('simple');
  const [values, setValues] = useState<CapacitorValues>({
    voltage: 12,
    c1: 100,
    c2: 200,
  });

  // Calculate total capacitance based on mode
  const getTotalCapacitance = () => {
    switch (mode) {
      case 'simple':
        return values.c1;
      case 'series':
        return (values.c1 * values.c2) / (values.c1 + values.c2);
      case 'parallel':
        return values.c1 + values.c2;
    }
  };

  // Calculate stored charge: Q = C × V
  const getCharge = () => {
    const C = getTotalCapacitance() / 1000000; // Convert µF to F
    return (C * values.voltage * 1000).toFixed(2); // Return in mC
  };

  // Calculate energy: E = 0.5 × C × V²
  const getEnergy = () => {
    const C = getTotalCapacitance(); // in µF
    return (0.5 * C * values.voltage * values.voltage / 1000).toFixed(2); // Return in mJ
  };

  const getModeInfo = () => {
    switch (mode) {
      case 'simple':
        return {
          title: 'Simple Circuit',
          description: 'A basic circuit with one capacitor that stores electrical energy.',
          formula: '<span style="font-style: italic;">Q</span> = <span style="font-style: italic;">C</span> × <span style="font-style: italic;">V</span>',
          tip: 'Capacitors store energy in an electric field between plates.',
        };
      case 'series':
        return {
          title: 'Series Circuit',
          description: 'Capacitors connected end-to-end. Total capacitance decreases.',
          formula: '<sup>1</sup>/<sub><span style="font-style: italic;">C</span><sub>total</sub></sub> = <sup>1</sup>/<sub><span style="font-style: italic;">C</span><sub>1</sub></sub> + <sup>1</sup>/<sub><span style="font-style: italic;">C</span><sub>2</sub></sub>',
          tip: 'Series capacitors result in lower total capacitance.',
        };
      case 'parallel':
        return {
          title: 'Parallel Circuit',
          description: 'Capacitors connected side-by-side. Total capacitance adds up.',
          formula: '<span style="font-style: italic;">C</span><sub>total</sub> = <span style="font-style: italic;">C</span><sub>1</sub> + <span style="font-style: italic;">C</span><sub>2</sub>',
          tip: 'Parallel capacitors increase total capacitance.',
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
              <span className="bg-gradient-to-r from-[#06b6d4] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(139,92,246,0.6)] animate-gradient">Capacitors</span>
              <span className="text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)]">?</span>
            </h1>
            <p className="text-base md:text-lg text-white/70 font-bold tracking-wide drop-shadow-lg">Explore How Capacitors Store Electrical Energy</p>
          </div>

          {/* Mode selector tabs */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex rounded-xl border-2 border-cyan-500/30 bg-card/60 backdrop-blur-xl p-1 shadow-2xl">
              <button
                onClick={() => setMode('simple')}
                className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
                  mode === 'simple'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'text-white/60 hover:text-white/90'
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setMode('series')}
                className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
                  mode === 'series'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'text-white/60 hover:text-white/90'
                }`}
              >
                Series
              </button>
              <button
                onClick={() => setMode('parallel')}
                className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${
                  mode === 'parallel'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'text-white/60 hover:text-white/90'
                }`}
              >
                Parallel
              </button>
            </div>
          </div>

          {/* Main circuit display card */}
          <div className="relative flex-1 rounded-3xl border-2 border-cyan-500/30 p-4 overflow-hidden" style={{
            background: 'linear-gradient(135deg, hsl(var(--card)/0.95) 0%, hsl(var(--background)/0.98) 100%)',
            boxShadow: '0 24px 60px rgba(6, 182, 212, 0.2), 0 0 120px rgba(6, 182, 212, 0.1)'
          }}>
            {/* Layout: Circuit (60%), Controls (40%) */}
            <div className="flex gap-3 h-full">
              {/* Left: Circuit Display (60%) */}
              <div className="flex-[60] relative rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-br from-background/50 to-background/70 backdrop-blur-md overflow-hidden shadow-2xl" style={{
                boxShadow: 'inset 0 2px 16px rgba(0,0,0,0.3), 0 8px 32px rgba(6,182,212,0.15)'
              }}>
                {/* Capacitor Circuit Canvas - Simple placeholder for now */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white/50 text-2xl">Circuit: {mode}</div>
                </div>
              </div>

              {/* Right: Controls & Info (40%) */}
              <div className="flex-[40] flex flex-col gap-2 h-full overflow-hidden">
                {/* Controls Panel */}
                <div className="bg-gradient-to-br from-card/70 to-card/50 backdrop-blur-xl rounded-xl border-2 border-cyan-500/40 p-1.5 shadow-2xl shadow-cyan-500/20 flex-shrink-0 hover:shadow-cyan-500/30 transition-shadow duration-300">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center border-2 border-cyan-400/70 shadow-xl shadow-cyan-500/60 animate-pulse">
                      <Zap className="w-3 h-3 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
                    </div>
                    <h3 className="text-xs font-black text-white tracking-[0.1em] uppercase drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)] bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">CONTROLS</h3>
                  </div>
                  
                  {/* Value Controls */}
                  <div className="space-y-1.5">
                    {/* Voltage Control */}
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-muted-foreground w-16">Voltage</span>
                      <div className="flex items-center gap-0.5 rounded-lg border px-0.5 py-0.5 bg-cyan-50 text-cyan-600 border-cyan-200">
                        <button
                          onClick={() => setValues({ ...values, voltage: Math.max(1, values.voltage - 1) })}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-cyan-100 active:bg-cyan-200 text-cyan-600 transition-colors"
                        >
                          <span className="text-sm">−</span>
                        </button>
                        <span className="text-sm font-bold w-14 text-center tabular-nums">
                          {values.voltage}V
                        </span>
                        <button
                          onClick={() => setValues({ ...values, voltage: Math.min(24, values.voltage + 1) })}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-cyan-100 active:bg-cyan-200 text-cyan-600 transition-colors"
                        >
                          <span className="text-sm">+</span>
                        </button>
                      </div>
                    </div>

                    {/* C1 Control */}
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-muted-foreground w-16">C1</span>
                      <div className="flex items-center gap-0.5 rounded-lg border px-0.5 py-0.5 bg-purple-50 text-purple-600 border-purple-200">
                        <button
                          onClick={() => setValues({ ...values, c1: Math.max(10, values.c1 - 10) })}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-purple-100 active:bg-purple-200 text-purple-600 transition-colors"
                        >
                          <span className="text-sm">−</span>
                        </button>
                        <span className="text-sm font-bold w-14 text-center tabular-nums">
                          {values.c1}µF
                        </span>
                        <button
                          onClick={() => setValues({ ...values, c1: Math.min(500, values.c1 + 10) })}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-purple-100 active:bg-purple-200 text-purple-600 transition-colors"
                        >
                          <span className="text-sm">+</span>
                        </button>
                      </div>
                    </div>

                    {/* C2 Control (only in series/parallel) */}
                    {mode !== 'simple' && (
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-bold text-muted-foreground w-16">C2</span>
                        <div className="flex items-center gap-0.5 rounded-lg border px-0.5 py-0.5 bg-purple-50 text-purple-600 border-purple-200">
                          <button
                            onClick={() => setValues({ ...values, c2: Math.max(10, values.c2 - 10) })}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-purple-100 active:bg-purple-200 text-purple-600 transition-colors"
                          >
                            <span className="text-sm">−</span>
                          </button>
                          <span className="text-sm font-bold w-14 text-center tabular-nums">
                            {values.c2}µF
                          </span>
                          <button
                            onClick={() => setValues({ ...values, c2: Math.min(500, values.c2 + 10) })}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-purple-100 active:bg-purple-200 text-purple-600 transition-colors"
                          >
                            <span className="text-sm">+</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Computed Values */}
                    <div className="pt-1.5 mt-1.5 border-t border-cyan-500/20 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-semibold">Total C:</span>
                        <span className="font-bold text-purple-300 text-sm">{getTotalCapacitance().toFixed(2)}µF</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-semibold">Charge:</span>
                        <span className="font-bold text-cyan-300 text-sm">{getCharge()}mC</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-semibold">Energy:</span>
                        <span className="font-bold text-emerald-300 text-sm">{getEnergy()}mJ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Panel */}
                <div className="bg-gradient-to-br from-card/70 to-card/50 backdrop-blur-xl rounded-xl border-2 border-cyan-500/40 p-1.5 shadow-2xl shadow-cyan-500/20 flex-shrink-0 hover:shadow-cyan-500/30 transition-shadow duration-300">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center border-2 border-cyan-400/70 shadow-xl shadow-cyan-500/60 animate-pulse flex-shrink-0">
                      <Info className="w-2.5 h-2.5 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
                    </div>
                    <h3 className="text-xs font-black text-white tracking-[0.1em] uppercase drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)] bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">CIRCUIT BASICS</h3>
                  </div>
                  <div className="space-y-1">
                    <div className="animate-fade-in">
                      <h4 className="text-[9px] font-black text-transparent bg-gradient-to-r from-cyan-300 via-purple-300 to-cyan-300 bg-clip-text mb-0.5 tracking-[0.1em] uppercase drop-shadow-lg">Description</h4>
                      <p className="text-[10px] text-white/95 leading-tight font-bold drop-shadow-md hover:text-white transition-colors duration-200">{info.description}</p>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-500/40 to-purple-500/30 rounded-lg p-1 border-2 border-cyan-400/70 shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all duration-300 hover:scale-[1.02] animate-pulse-slow">
                      <h4 className="text-[9px] font-black text-transparent bg-gradient-to-r from-cyan-200 via-purple-200 to-cyan-200 bg-clip-text mb-0.5 tracking-[0.1em] uppercase drop-shadow-lg animate-gradient">Formula</h4>
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

export default CapacitorPage;
