import { useState, useEffect } from 'react';
import { CircuitMode, CircuitValues } from '@/components/resistor/types';
import { CircuitCanvas } from '@/components/resistor/CircuitCanvas';
import { CircuitModeSelector } from '@/components/resistor/CircuitModeSelector';
import { ValuesPanel } from '@/components/resistor/ValuesPanel';
import { useCircuitCalculations } from '@/components/resistor/useCircuitCalculations';
import { StarField } from '@/components/electronics/StarField';
import { Zap, Info } from 'lucide-react';

const ResistorPage = () => {
  const [mode, setMode] = useState<CircuitMode>('combination');
  const [values, setValues] = useState<CircuitValues>({
    voltage: 12,
    r1: 10,
    r2: 20,
  });

  const computed = useCircuitCalculations(mode, values);

  useEffect(() => {
    const listenerOptions: AddEventListenerOptions = { capture: true, passive: false };
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      const isInput = !!active && (
        active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.isContentEditable
      );
      const key = e.key || '';
      const code = (e as any).code || '';
      const keyCode = (e as any).keyCode || 0;

      const increase = key === 'PageUp' || code === 'PageUp' || keyCode === 33;
      const decrease = key === 'PageDown' || code === 'PageDown' || keyCode === 34;

      console.debug('[Resistor] keydown', { key, code, keyCode, activeTag: active?.tagName, isInput, increase, decrease });

      if (isInput) return; // don't intercept when typing in inputs

      if (increase || decrease) {
        e.preventDefault();
        setValues(prev => ({
          ...prev,
          voltage: Math.max(0, Math.min(10000, (prev.voltage ?? 0) + (increase ? 1 : -1)))
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown, listenerOptions);
    return () => window.removeEventListener('keydown', handleKeyDown, listenerOptions);
  }, []);

  const getModeInfo = () => {
    switch (mode) {
      case 'combination':
        return {
          title: 'Simple Circuit',
          description: 'A basic circuit with one resistor limiting current flow to the bulb.',
          formula: '<span style="font-style: italic;">I</span> = <span style="font-style: italic;">V</span> / <span style="font-style: italic;">R</span>',
          tip: 'Current flows from positive to negative terminal through the resistor.',
        };
      case 'series':
        return {
          title: 'Series Circuit',
          description: 'Resistors connected end-to-end. Total resistance adds up.',
          formula: '<span style="font-style: italic;">R</span><sub>total</sub> = <span style="font-style: italic;">R</span><sub>1</sub> + <span style="font-style: italic;">R</span><sub>2</sub>',
          tip: 'Same current flows through all components in series.',
        };
      case 'parallel':
        return {
          title: 'Parallel Circuit',
          description: 'Resistors connected side-by-side. Current splits between paths.',
          formula: '<sup>1</sup>/<sub><span style="font-style: italic;">R</span><sub>total</sub></sub> = <sup>1</sup>/<sub><span style="font-style: italic;">R</span><sub>1</sub></sub> + <sup>1</sup>/<sub><span style="font-style: italic;">R</span><sub>2</sub></sub>',
          tip: 'Voltage is the same across all parallel branches.',
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
              <span className="bg-gradient-to-r from-[#a855f7] via-[#d946ef] to-[#ec4899] bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(168,85,247,0.6)] animate-gradient">Resistors</span>
              <span className="text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)]">?</span>
            </h1>
            <p className="text-base md:text-lg text-white/70 font-bold tracking-wide drop-shadow-lg">Explore How Resistors Control Electric Current Flow</p>
          </div>

          {/* Mode selector tabs */}
          <div className="flex justify-center mb-3">
            <CircuitModeSelector mode={mode} onModeChange={setMode} />
          </div>

          {/* Main circuit display card */}
          <div className="relative flex-1 rounded-3xl border-2 border-orange-500/30 p-4 overflow-hidden" style={{
            background: 'linear-gradient(135deg, hsl(var(--card)/0.95) 0%, hsl(var(--background)/0.98) 100%)',
            boxShadow: '0 24px 60px rgba(251, 146, 60, 0.2), 0 0 120px rgba(251, 146, 60, 0.1)'
          }}>
            {/* Layout: Reduced circuit (60%), expanded controls (40%) */}
            <div className="flex gap-3 h-full">
              {/* Left: Circuit Display (60%) - REDUCED SIZE */}
              <div className="flex-[60] relative rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-background/50 to-background/70 backdrop-blur-md overflow-hidden shadow-2xl" style={{
                boxShadow: 'inset 0 2px 16px rgba(0,0,0,0.3), 0 8px 32px rgba(251,146,60,0.15)'
              }}>
                {/* Hint box - interactive based on mode */}
                <div className="absolute top-2 left-2 z-20 max-w-xs">
                  <div className="bg-card/95 backdrop-blur-md border-2 border-orange-500/30 rounded-lg p-2 shadow-xl">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <span className="text-xl">💡</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-bold text-orange-400 mb-0.5">{info.title}</h3>
                        <p className="text-[10px] text-muted-foreground leading-snug">{info.description}</p>
                        <p className="text-[9px] text-orange-300/70 mt-1 italic">{info.tip}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <CircuitCanvas mode={mode} values={values} />
              </div>

              {/* Right: Controls & Info (40%) - EXPANDED FOR FULL CONTENT */}
              <div className="flex-[40] flex flex-col gap-2 h-full overflow-hidden">
                {/* Controls Panel */}
                <div className="bg-gradient-to-br from-card/70 to-card/50 backdrop-blur-xl rounded-xl border-2 border-orange-500/40 p-1.5 shadow-2xl shadow-orange-500/20 flex-shrink-0 hover:shadow-orange-500/30 transition-shadow duration-300">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center border-2 border-orange-400/70 shadow-xl shadow-orange-500/60 animate-pulse">
                      <Zap className="w-3 h-3 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
                    </div>
                    <h3 className="text-xs font-black text-white tracking-[0.15em] uppercase drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)] bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">CONTROLS</h3>
                  </div>
                  <ValuesPanel
                    values={values}
                    computed={computed}
                    onValuesChange={setValues}
                  />
                </div>

                {/* Info Panel */}
                <div className="bg-gradient-to-br from-card/70 to-card/50 backdrop-blur-xl rounded-xl border-2 border-blue-500/40 p-2 shadow-2xl shadow-blue-500/20 flex-shrink-0 hover:shadow-blue-500/30 transition-shadow duration-300">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center border-2 border-blue-400/70 shadow-xl shadow-blue-500/60 animate-pulse flex-shrink-0">
                      <Info className="w-3 h-3 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
                    </div>
                    <h3 className="text-[10px] font-black text-white tracking-[0.1em] uppercase drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)] bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">CIRCUIT BASICS</h3>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/40 to-red-500/30 rounded-lg p-2 border-2 border-orange-400/70 shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all duration-300 hover:scale-[1.02] animate-pulse-slow">
                    <h4 className="text-[10px] font-black text-transparent bg-gradient-to-r from-orange-200 via-yellow-200 to-orange-200 bg-clip-text mb-1 tracking-[0.1em] uppercase drop-shadow-lg animate-gradient">Formula</h4>
                    <div className="text-lg font-serif text-white font-bold tracking-wide drop-shadow-[0_3px_8px_rgba(0,0,0,0.9)] hover:scale-105 transition-transform duration-200" dangerouslySetInnerHTML={{ __html: info.formula }} />
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

export default ResistorPage;
