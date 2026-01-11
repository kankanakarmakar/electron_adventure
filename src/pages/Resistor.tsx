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
    <div className="relative h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)' }}>
      {/* Light blue background - no star field for light theme */}
      <div className="fixed inset-0 bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-100" />

      {/* Main content */}
      <div className="relative z-10 h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-[95vw] h-[92vh] flex flex-col">
          {/* Header with title */}
          <div className="text-center mb-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2">
              <span className="text-slate-800 drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)]">What are </span>
              <span className="bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(168,85,247,0.4)] animate-gradient">Resistors</span>
              <span className="text-slate-800 drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)]">?</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 font-bold tracking-wide">Explore How Resistors Control Electric Current Flow</p>
          </div>

          {/* Mode selector tabs */}
          <div className="flex justify-center mb-3">
            <CircuitModeSelector mode={mode} onModeChange={setMode} />
          </div>

          {/* Main circuit display card */}
          <div className="relative flex-1 rounded-3xl border-2 border-blue-300/50 p-4 overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,249,255,0.98) 100%)',
            boxShadow: '0 24px 60px rgba(59, 130, 246, 0.15), 0 0 120px rgba(59, 130, 246, 0.08)'
          }}>
            {/* Layout: Reduced circuit (60%), expanded controls (40%) */}
            <div className="flex gap-3 h-full">
              {/* Left: Circuit Display (60%) - REDUCED SIZE */}
              <div className="flex-[60] relative rounded-2xl border-2 border-blue-300/40 bg-gradient-to-br from-sky-50/80 to-blue-50/90 backdrop-blur-md overflow-hidden shadow-xl" style={{
                boxShadow: 'inset 0 2px 16px rgba(59,130,246,0.1), 0 8px 32px rgba(59,130,246,0.12)'
              }}>
                <CircuitCanvas mode={mode} values={values} />
              </div>

              {/* Right: Controls & Info (40%) - EXPANDED FOR FULL CONTENT */}
              <div className="flex-[40] flex flex-col gap-2 h-full overflow-hidden">
                {/* Controls Panel */}
                <div className="bg-gradient-to-br from-white/90 to-sky-50/80 backdrop-blur-xl rounded-xl border-2 border-blue-300/50 p-1.5 shadow-lg shadow-blue-200/30 flex-shrink-0 hover:shadow-blue-300/40 transition-shadow duration-300">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-blue-400/70 shadow-lg shadow-blue-500/40">
                      <Zap className="w-3 h-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
                    </div>
                    <h3 className="text-xs font-black text-slate-700 tracking-[0.15em] uppercase">CONTROLS</h3>
                  </div>
                  <ValuesPanel
                    values={values}
                    computed={computed}
                    onValuesChange={setValues}
                  />
                </div>

                {/* Info Panel */}
                <div className="bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-xl rounded-xl border-2 border-indigo-300/50 p-2 shadow-lg shadow-indigo-200/30 flex-shrink-0 hover:shadow-indigo-300/40 transition-shadow duration-300">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-indigo-400/70 shadow-lg shadow-indigo-500/40 flex-shrink-0">
                      <Info className="w-3 h-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
                    </div>
                    <h3 className="text-[10px] font-black text-slate-700 tracking-[0.1em] uppercase">CIRCUIT BASICS</h3>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg p-2 border-2 border-indigo-300/60 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    <h4 className="text-[10px] font-black text-indigo-700 mb-1 tracking-[0.1em] uppercase">Formula</h4>
                    <div className="text-lg font-serif text-slate-800 font-bold tracking-wide hover:scale-105 transition-transform duration-200" dangerouslySetInnerHTML={{ __html: info.formula }} />
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
