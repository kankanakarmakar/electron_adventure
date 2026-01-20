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
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Controls</h2>
                <p className="text-slate-400 text-sm">Open the control panel to charging, discharging, and configure components.</p>
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
