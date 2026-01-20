import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CapacitorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#312e81_0%,_#020617_100%)]"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

      <div className="relative z-10 text-center space-y-12 max-w-4xl px-6">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-2">
            Capacitor
            <span className="text-pink-500">.io</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Dual-screen interactive simulation. Launch the <span className="text-pink-400">Circuit View</span> on your main display and control it remotely via the <span className="text-purple-400">Control Panel</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
          {/* Circuit View Card */}
          <div
            onClick={() => navigate('/capacitor/circuit')}
            className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-slate-800/80 transition-all cursor-pointer hover:border-pink-500/50 hover:scale-105 active:scale-95 duration-300 shadow-2xl"
          >
            <div className="absolute inset-0 bg-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:rotate-12 transition-transform">
                <Monitor className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Circuit View</h2>
                <p className="text-slate-400 text-sm">Launch the full-screen circuit visualization with real-time field usage.</p>
              </div>
              <Button className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl py-6">
                Launch Display
              </Button>
            </div>
          </div>

          {/* Controls Card */}
          <div
            onClick={() => navigate('/capacitor/controls')}
            className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-slate-800/80 transition-all cursor-pointer hover:border-purple-500/50 hover:scale-105 active:scale-95 duration-300 shadow-2xl"
          >
            <div className="absolute inset-0 bg-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:-rotate-12 transition-transform">
                <SlidersHorizontal className="w-10 h-10 text-white" />
              </div>
<<<<<<< HEAD

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
=======
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Controls</h2>
                <p className="text-slate-400 text-sm">Open the control panel to charging, discharging, and configure components.</p>
>>>>>>> 6227f02fab69f00512fe8f19d6abfc2c92e2b545
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl py-6">
                Launch Controls
              </Button>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-slate-500 hover:text-white flex items-center gap-2 mx-auto font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default CapacitorPage;
