import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Diode = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#312e81_0%,_#020617_100%)]"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

      <div className="relative z-10 text-center space-y-12 max-w-4xl px-6">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-2">
            Diode
            <span className="text-blue-500">.io</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Dual-screen interactive simulation. Launch the <span className="text-blue-400">Circuit View</span> on your main display and control it remotely via the <span className="text-indigo-400">Control Panel</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
          {/* Circuit View Card */}
          <div
            onClick={() => navigate('/diode/circuit')}
            className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-slate-800/80 transition-all cursor-pointer hover:border-blue-500/50 hover:scale-105 active:scale-95 duration-300 shadow-2xl"
          >
            <div className="absolute inset-0 bg-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:rotate-12 transition-transform">
                <Monitor className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Circuit View</h2>
                <p className="text-slate-400 text-sm">Launch the full-screen circuit visualization with real-time electron flow.</p>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-6">
                Launch Display
              </Button>
            </div>
          </div>

          {/* Controls Card */}
          <div
            onClick={() => navigate('/diode/controls')}
            className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-slate-800/80 transition-all cursor-pointer hover:border-indigo-500/50 hover:scale-105 active:scale-95 duration-300 shadow-2xl"
          >
            <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:-rotate-12 transition-transform">
                <SlidersHorizontal className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Controls</h2>
                <p className="text-slate-400 text-sm">Open the control panel to adjust bias voltage and switch modes.</p>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl py-6">
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

export default Diode;
