import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InductorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_#020617_100%)]"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

<<<<<<< HEAD
      {/* Main content */}
      <div className="relative z-10 h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-[95vw] h-[92vh] flex flex-col">
          {/* Header with title */}
          <div className="text-center mb-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2">
              <span className="text-slate-800 drop-shadow-sm">What are </span>
              <span className="bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(59,130,246,0.6)] animate-gradient">Inductors</span>
              <span className="text-slate-800 drop-shadow-sm">?</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 font-bold tracking-wide">Explore How Inductors Store Energy in Magnetic Fields</p>
          </div>

          {/* Mode selector tabs */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex rounded-xl border-2 border-slate-300 bg-white/80 backdrop-blur-xl p-1 shadow-lg">
              <button
                onClick={() => setMode('simple')}
                className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${mode === 'simple'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                Simple
              </button>
              <button
                onClick={() => setMode('series')}
                className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${mode === 'series'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                Series
              </button>
              <button
                onClick={() => setMode('parallel')}
                className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${mode === 'parallel'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                Parallel
              </button>
            </div>
          </div>

          {/* Main circuit display card */}
          <div className="relative flex-1 rounded-3xl border-2 border-slate-300 p-4 overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.98) 100%)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.1), 0 0 60px rgba(56, 189, 248, 0.1)'
          }}>
            {/* Layout: Circuit (60%), Controls (40%) */}
            <div className="flex gap-2 h-full">
              {/* Left: Circuit Display (60%) - Larger circuit */}
              <div className="flex-[60] relative rounded-2xl border-2 border-sky-300 bg-gradient-to-br from-sky-50/80 to-blue-50/90 backdrop-blur-md overflow-hidden shadow-lg">

                {/* Info box - eye-catching */}
                <div className="absolute top-3 left-3 z-20 max-w-[220px]">
                  <div className="bg-white/95 backdrop-blur-md border-2 border-indigo-400 rounded-xl p-3 shadow-lg">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
                        <span className="text-base">💡</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-bold text-indigo-600 mb-0.5">{info.title}</h3>
                        <p className="text-[10px] text-slate-700 leading-snug font-medium">{info.description}</p>
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
                {/* Controls Panel - Light Theme */}
                <div className="bg-white/90 backdrop-blur-xl rounded-xl border-2 border-slate-300 p-1.5 shadow-lg flex-shrink-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="text-xs font-black text-slate-700 tracking-[0.1em] uppercase">CONTROLS</h3>
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

                {/* Info Panel - Light Theme */}
                <div className="bg-white/90 backdrop-blur-xl rounded-xl border-2 border-slate-300 p-1.5 shadow-lg flex-shrink-0">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                      <Info className="w-2.5 h-2.5 text-white" />
                    </div>
                    <h3 className="text-xs font-black text-slate-700 tracking-[0.1em] uppercase">CIRCUIT BASICS</h3>
                  </div>
                  <div className="space-y-1">
                    <div>
                      <h4 className="text-[9px] font-black text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text mb-0.5 tracking-[0.1em] uppercase">Description</h4>
                      <p className="text-[10px] text-slate-700 leading-tight font-bold">{info.description}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-1 border-2 border-blue-300">
                      <h4 className="text-[9px] font-black text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text mb-0.5 tracking-[0.1em] uppercase">Formula</h4>
                      <div className="text-sm font-serif text-slate-800 font-bold tracking-wide" dangerouslySetInnerHTML={{ __html: info.formula }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
=======
      <div className="relative z-10 text-center space-y-12 max-w-4xl px-6">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-2">
            Inductor
            <span className="text-blue-500">.io</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Dual-screen interactive simulation. Launch the <span className="text-blue-400">Circuit View</span> on your main display and control it remotely via the <span className="text-emerald-400">Control Panel</span>.
          </p>
>>>>>>> 6227f02fab69f00512fe8f19d6abfc2c92e2b545
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
          {/* Circuit View Card */}
          <div
            onClick={() => navigate('/inductor/circuit')}
            className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-slate-800/80 transition-all cursor-pointer hover:border-blue-500/50 hover:scale-105 active:scale-95 duration-300 shadow-2xl"
          >
            <div className="absolute inset-0 bg-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:rotate-12 transition-transform">
                <Monitor className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Circuit View</h2>
                <p className="text-slate-400 text-sm">Launch the full-screen circuit visualization with real-time field animations.</p>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-6">
                Launch Display
              </Button>
            </div>
          </div>

          {/* Controls Card */}
          <div
            onClick={() => navigate('/inductor/controls')}
            className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-slate-800/80 transition-all cursor-pointer hover:border-emerald-500/50 hover:scale-105 active:scale-95 duration-300 shadow-2xl"
          >
            <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:-rotate-12 transition-transform">
                <SlidersHorizontal className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Controls</h2>
                <p className="text-slate-400 text-sm">Open the control panel to manipulate voltage, inductance, and more.</p>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-6">
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

<<<<<<< HEAD
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
    <div className="w-full h-full flex items-center justify-center p-2">
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

      <svg viewBox="0 -60 600 420" className="w-full h-full max-h-[480px]" preserveAspectRatio="xMidYMid meet">
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

        {/* Magnetic field rings - ANIMATED - Density based on inductance value */}
        {currentOn && mode === 'simple' && (
          <>
            {/* Number of rings based on inductance - more L = more rings */}
            {Array.from({ length: Math.min(Math.ceil(values.l1 / 15), 6) + 2 }, (_, i) => i + 1).map((ring) => (
              <ellipse
                key={ring}
                cx="260"
                cy="70"
                rx={40 + ring * (20 + values.l1 / 10) * (fieldStrength / 100)}
                ry={25 + ring * (14 + values.l1 / 15) * (fieldStrength / 100)}
                fill="none"
                stroke="url(#inductorGradient)"
                strokeWidth={1.5 + values.l1 / 50}
                opacity={(fieldStrength / 120) * (0.5 + values.l1 / 100)}
                style={{
                  transformOrigin: '260px 70px',
                  animation: currentDirection === 'reverse'
                    ? `spin-reverse ${3 + ring}s linear infinite`
                    : `spin-forward ${3 + ring}s linear infinite`
                }}
              />
            ))}
          </>
        )}

        {/* Magnetic field rings for SERIES mode - L1 at (182, 70) and L2 at (312, 70) */}
        {currentOn && mode === 'series' && (
          <>
            {/* L1 Magnetic field */}
            {[1, 2, 3].map((ring) => (
              <ellipse
                key={`l1-${ring}`}
                cx="182"
                cy="70"
                rx={35 + ring * 18 * (fieldStrength / 100)}
                ry={22 + ring * 12 * (fieldStrength / 100)}
                fill="none"
                stroke="url(#inductorGradient)"
                strokeWidth="1.5"
                opacity={fieldStrength / 160}
                style={{
                  transformOrigin: '182px 70px',
                  animation: currentDirection === 'reverse'
                    ? `spin-reverse ${3 + ring}s linear infinite`
                    : `spin-forward ${3 + ring}s linear infinite`
                }}
              />
            ))}
            {/* L2 Magnetic field */}
            {[1, 2, 3].map((ring) => (
              <ellipse
                key={`l2-${ring}`}
                cx="312"
                cy="70"
                rx={35 + ring * 18 * (fieldStrength / 100)}
                ry={22 + ring * 12 * (fieldStrength / 100)}
                fill="none"
                stroke="url(#inductorGradient)"
                strokeWidth="1.5"
                opacity={fieldStrength / 160}
                style={{
                  transformOrigin: '312px 70px',
                  animation: currentDirection === 'reverse'
                    ? `spin-reverse ${3 + ring}s linear infinite`
                    : `spin-forward ${3 + ring}s linear infinite`
                }}
              />
            ))}
          </>
        )}

        {/* Magnetic field rings for PARALLEL mode - L1 at (252, 40) and L2 at (252, 120) */}
        {currentOn && mode === 'parallel' && (
          <>
            {/* L1 Magnetic field (upper branch) */}
            {[1, 2, 3].map((ring) => (
              <ellipse
                key={`l1-${ring}`}
                cx="252"
                cy="40"
                rx={35 + ring * 18 * (fieldStrength / 100)}
                ry={20 + ring * 10 * (fieldStrength / 100)}
                fill="none"
                stroke="url(#inductorGradient)"
                strokeWidth="1.5"
                opacity={fieldStrength / 160}
                style={{
                  transformOrigin: '252px 40px',
                  animation: currentDirection === 'reverse'
                    ? `spin-reverse ${3 + ring}s linear infinite`
                    : `spin-forward ${3 + ring}s linear infinite`
                }}
              />
            ))}
            {/* L2 Magnetic field (lower branch) */}
            {[1, 2, 3].map((ring) => (
              <ellipse
                key={`l2-${ring}`}
                cx="252"
                cy="120"
                rx={35 + ring * 18 * (fieldStrength / 100)}
                ry={20 + ring * 10 * (fieldStrength / 100)}
                fill="none"
                stroke="url(#inductorGradient)"
                strokeWidth="1.5"
                opacity={fieldStrength / 160}
                style={{
                  transformOrigin: '252px 120px',
                  animation: currentDirection === 'reverse'
                    ? `spin-reverse ${3 + ring}s linear infinite`
                    : `spin-forward ${3 + ring}s linear infinite`
                }}
              />
            ))}
          </>
        )}

        {/* Battery - Left side vertical orientation like Resistor page - shifted right */}
        <g transform="translate(100, 100)">
          {/* Battery body */}
          <rect x="0" y="0" width="50" height="100" rx="8" fill="#374151" stroke="#1f2937" strokeWidth="3" />
          {/* Battery cap (top) */}
          <rect x="17" y="-8" width="16" height="10" rx="3" fill="#4b5563" stroke="#374151" strokeWidth="2" />
          {/* Positive terminal area (top) */}
          <circle cx="25" cy="22" r="12" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="2" />
          <text x="25" y="28" textAnchor="middle" fill="#000000" fontSize="20" fontWeight="bold">
            {currentDirection === 'forward' ? '+' : '−'}
          </text>
          {/* Voltage display - centered inside battery */}
          <rect x="5" y="38" width="40" height="18" rx="3" fill="#0d9488" />
          <text x="25" y="52" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">{values.voltage}V</text>
          {/* Negative terminal area (bottom) */}
          <circle cx="25" cy="78" r="12" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2" />
          <text x="25" y="84" textAnchor="middle" fill="#000000" fontSize="20" fontWeight="bold">
            {currentDirection === 'forward' ? '−' : '+'}
          </text>
          {/* Battery label below */}
          <text x="25" y="120" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="bold">Battery</text>
        </g>

        {/* SIMPLE MODE - Rectangular circuit layout like Resistor */}
        {mode === 'simple' && (
          <>
            {/* Wire from battery + (top) going up to top rail */}
            <line x1="125" y1="100" x2="125" y2="70" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />
            {/* Top horizontal rail - left section */}
            <line x1="125" y1="70" x2="250" y2="70" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Inductor on top rail */}
            <g transform="translate(250, 50)">
              {/* Magnetic field lines - visible when current is on */}
              {currentOn && (
                <>
                  {/* Magnetic field arcs centered around the coil */}
                  <ellipse cx="40" cy="20" rx="55" ry="30" fill="none" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" strokeDasharray="8,4">
                    <animate attributeName="stroke-opacity" values="0.3;0.7;0.3" dur="1.5s" repeatCount="indefinite" />
                  </ellipse>
                  <ellipse cx="40" cy="20" rx="75" ry="45" fill="none" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="2" strokeDasharray="8,4">
                    <animate attributeName="stroke-opacity" values="0.2;0.6;0.2" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
                  </ellipse>
                  <ellipse cx="40" cy="20" rx="95" ry="60" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" strokeDasharray="8,4">
                    <animate attributeName="stroke-opacity" values="0.1;0.5;0.1" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                  </ellipse>

                  {/* Field direction arrows on sides */}
                  <text x="-45" y="25" fill="rgba(139, 92, 246, 0.8)" fontSize="18" fontWeight="bold">
                    <animate attributeName="fill-opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
                    ↑
                  </text>
                  <text x="120" y="25" fill="rgba(139, 92, 246, 0.8)" fontSize="18" fontWeight="bold">
                    <animate attributeName="fill-opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
                    ↓
                  </text>
                </>
              )}

              {/* Inductor coils */}
              {[0, 1, 2, 3, 4].map((i) => (
                <ellipse
                  key={i}
                  cx={i * 20}
                  cy="20"
                  rx="10"
                  ry="15"
                  fill="none"
                  stroke={currentOn ? 'url(#inductorGradient)' : '#6366f1'}
                  strokeWidth="3"
                  filter={currentOn ? 'url(#glow)' : undefined}
                />
              ))}
              <rect x="0" y="10" width="80" height="20" rx="4" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="1" />
              <text x="40" y="-8" textAnchor="middle" fill="#000000" fontSize="18" fontWeight="bold">L1</text>
              <text x="40" y="58" textAnchor="middle" fill="#000000" fontSize="16" fontWeight="bold">{values.l1}mH</text>
            </g>

            {/* Top horizontal rail - right section (after inductor) */}
            <line x1="330" y1="70" x2="480" y2="70" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Right vertical wire - going down */}
            <line x1="480" y1="70" x2="480" y2="280" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Bottom horizontal rail - back to battery */}
            <line x1="480" y1="280" x2="125" y2="280" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Wire from bottom rail up to battery - (bottom) */}
            <line x1="125" y1="280" x2="125" y2="200" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Electron animations - Speed based on voltage */}
            {currentOn && (
              <>
                {/* Multiple electrons flowing around the circuit - speed inversely proportional to voltage */}
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                  // Higher voltage = faster electrons (shorter duration)
                  const baseDuration = 6 - (values.voltage / 24) * 4; // 2s at max voltage, 6s at min
                  const duration = Math.max(1.5, baseDuration);
                  return (
                    <g key={i}>
                      {/* Outer glow */}
                      <circle cx="125" cy="200" r="8" fill="rgba(96, 165, 250, 0.3)">
                        <animate attributeName="cx" values="125;125;250;330;480;480;125;125" dur={`${duration}s`} begin={`${i * duration / 8}s`} repeatCount="indefinite" />
                        <animate attributeName="cy" values="200;70;70;70;70;280;280;200" dur={`${duration}s`} begin={`${i * duration / 8}s`} repeatCount="indefinite" />
                      </circle>
                      {/* Inner glow */}
                      <circle cx="125" cy="200" r="5" fill="rgba(147, 197, 253, 0.6)">
                        <animate attributeName="cx" values="125;125;250;330;480;480;125;125" dur={`${duration}s`} begin={`${i * duration / 8}s`} repeatCount="indefinite" />
                        <animate attributeName="cy" values="200;70;70;70;70;280;280;200" dur={`${duration}s`} begin={`${i * duration / 8}s`} repeatCount="indefinite" />
                      </circle>
                      {/* Core electron */}
                      <circle cx="125" cy="200" r="3" fill="#3b82f6">
                        <animate attributeName="cx" values="125;125;250;330;480;480;125;125" dur={`${duration}s`} begin={`${i * duration / 8}s`} repeatCount="indefinite" />
                        <animate attributeName="cy" values="200;70;70;70;70;280;280;200" dur={`${duration}s`} begin={`${i * duration / 8}s`} repeatCount="indefinite" />
                      </circle>
                      {/* Bright center */}
                      <circle cx="125" cy="200" r="1.5" fill="#e0f2fe">
                        <animate attributeName="cx" values="125;125;250;330;480;480;125;125" dur={`${duration}s`} begin={`${i * duration / 8}s`} repeatCount="indefinite" />
                        <animate attributeName="cy" values="200;70;70;70;70;280;280;200" dur={`${duration}s`} begin={`${i * duration / 8}s`} repeatCount="indefinite" />
                      </circle>
                    </g>
                  );
                })}
              </>
            )}
          </>
        )}

        {/* SERIES MODE - Rectangular circuit layout like Resistor */}
        {mode === 'series' && (
          <>
            {/* Wire from battery + (top) going up to top rail */}
            <line x1="125" y1="100" x2="125" y2="70" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />
            {/* Top horizontal rail - left section */}
            <line x1="125" y1="70" x2="180" y2="70" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* L1 Inductor on top rail */}
            <g transform="translate(180, 50)">
              {[0, 1, 2, 3, 4].map((i) => (
                <ellipse
                  key={i}
                  cx={i * 16}
                  cy="20"
                  rx="8"
                  ry="12"
                  fill="none"
                  stroke={currentOn ? 'url(#inductorGradient)' : '#6366f1'}
                  strokeWidth="3"
                  filter={currentOn ? 'url(#glow)' : undefined}
                />
              ))}
              <rect x="0" y="10" width="64" height="20" rx="4" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="1" />
              <text x="32" y="-8" textAnchor="middle" fill="#000000" fontSize="18" fontWeight="bold">L1</text>
              <text x="32" y="58" textAnchor="middle" fill="#000000" fontSize="15" fontWeight="bold">{values.l1}mH</text>
            </g>

            {/* Wire between L1 and L2 */}
            <line x1="244" y1="70" x2="300" y2="70" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* L2 Inductor on top rail */}
            <g transform="translate(300, 50)">
              {[0, 1, 2, 3, 4].map((i) => (
                <ellipse
                  key={i}
                  cx={i * 16}
                  cy="20"
                  rx="8"
                  ry="12"
                  fill="none"
                  stroke={currentOn ? 'url(#inductorGradient)' : '#6366f1'}
                  strokeWidth="3"
                  filter={currentOn ? 'url(#glow)' : undefined}
                />
              ))}
              <rect x="0" y="10" width="64" height="20" rx="4" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="1" />
              <text x="32" y="-8" textAnchor="middle" fill="#000000" fontSize="18" fontWeight="bold">L2</text>
              <text x="32" y="58" textAnchor="middle" fill="#000000" fontSize="15" fontWeight="bold">{values.l2}mH</text>
            </g>

            {/* Top horizontal rail - right section (after L2) */}
            <line x1="364" y1="70" x2="480" y2="70" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Right vertical wire - going down */}
            <line x1="480" y1="70" x2="480" y2="280" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Bottom horizontal rail - back to battery */}
            <line x1="480" y1="280" x2="125" y2="280" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Wire from bottom rail up to battery - (bottom) */}
            <line x1="125" y1="280" x2="125" y2="200" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Electron animations */}
            {currentOn && (
              <>
                <circle cx="125" cy="100" r="4" fill="#60a5fa">
                  <animate attributeName="cx" values="125;125;180;244;300;364;480;480;125;125" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="100;70;70;70;70;70;70;280;280;100" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="125" cy="100" r="4" fill="#60a5fa">
                  <animate attributeName="cx" values="125;125;180;244;300;364;480;480;125;125" dur="4s" begin="1s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="100;70;70;70;70;70;70;280;280;100" dur="4s" begin="1s" repeatCount="indefinite" />
                </circle>
                <circle cx="125" cy="100" r="4" fill="#60a5fa">
                  <animate attributeName="cx" values="125;125;180;244;300;364;480;480;125;125" dur="4s" begin="2s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="100;70;70;70;70;70;70;280;280;100" dur="4s" begin="2s" repeatCount="indefinite" />
                </circle>
              </>
            )}
          </>
        )}

        {/* PARALLEL MODE - Rectangular circuit layout like Resistor */}
        {mode === 'parallel' && (
          <>
            {/* Wire from battery + (top) going up to top rail */}
            <line x1="125" y1="100" x2="125" y2="70" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />
            {/* Top horizontal rail - to split point */}
            <line x1="125" y1="70" x2="180" y2="70" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Vertical split at x=180 - going up to L1 branch and down to L2 branch */}
            <line x1="180" y1="70" x2="180" y2="40" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />
            <line x1="180" y1="70" x2="180" y2="120" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Horizontal wire to L1 (upper branch) */}
            <line x1="180" y1="40" x2="250" y2="40" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />
            {/* Horizontal wire to L2 (lower branch) */}
            <line x1="180" y1="120" x2="250" y2="120" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* L1 Inductor - upper branch */}
            <g transform="translate(250, 20)">
              {[0, 1, 2, 3, 4].map((i) => (
                <ellipse
                  key={i}
                  cx={i * 16}
                  cy="20"
                  rx="8"
                  ry="12"
                  fill="none"
                  stroke={currentOn ? 'url(#inductorGradient)' : '#6366f1'}
                  strokeWidth="3"
                  filter={currentOn ? 'url(#glow)' : undefined}
                />
              ))}
              <rect x="0" y="10" width="64" height="20" rx="4" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="1" />
              <text x="32" y="-8" textAnchor="middle" fill="#000000" fontSize="18" fontWeight="bold">L1</text>
              <text x="32" y="58" textAnchor="middle" fill="#000000" fontSize="15" fontWeight="bold">{values.l1}mH</text>
            </g>

            {/* L2 Inductor - lower branch */}
            <g transform="translate(250, 100)">
              {[0, 1, 2, 3, 4].map((i) => (
                <ellipse
                  key={i}
                  cx={i * 16}
                  cy="20"
                  rx="8"
                  ry="12"
                  fill="none"
                  stroke={currentOn ? 'url(#inductorGradient)' : '#6366f1'}
                  strokeWidth="3"
                  filter={currentOn ? 'url(#glow)' : undefined}
                />
              ))}
              <rect x="0" y="10" width="64" height="20" rx="4" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="1" />
              <text x="32" y="-8" textAnchor="middle" fill="#000000" fontSize="18" fontWeight="bold">L2</text>
              <text x="32" y="58" textAnchor="middle" fill="#000000" fontSize="15" fontWeight="bold">{values.l2}mH</text>
            </g>

            {/* Horizontal wire from L1 to join point */}
            <line x1="314" y1="40" x2="370" y2="40" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />
            {/* Horizontal wire from L2 to join point */}
            <line x1="314" y1="120" x2="370" y2="120" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Vertical join at x=370 */}
            <line x1="370" y1="40" x2="370" y2="70" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />
            <line x1="370" y1="70" x2="370" y2="120" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Continue on top rail to right corner */}
            <line x1="370" y1="70" x2="480" y2="70" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Right vertical wire - going down */}
            <line x1="480" y1="70" x2="480" y2="280" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Bottom horizontal rail - back to battery */}
            <line x1="480" y1="280" x2="125" y2="280" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Wire from bottom rail up to battery - (bottom) */}
            <line x1="125" y1="280" x2="125" y2="200" stroke={currentOn ? '#3b82f6' : '#94a3b8'} strokeWidth="4" />

            {/* Electron animations */}
            {currentOn && (
              <>
                {/* Electron on L1 branch */}
                <circle cx="125" cy="100" r="4" fill="#60a5fa">
                  <animate attributeName="cx" values="125;125;180;180;250;314;370;370;480;480;125;125" dur="5s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="100;70;70;40;40;40;40;70;70;280;280;100" dur="5s" repeatCount="indefinite" />
                </circle>
                {/* Electron on L2 branch */}
                <circle cx="125" cy="100" r="4" fill="#60a5fa">
                  <animate attributeName="cx" values="125;125;180;180;250;314;370;370;480;480;125;125" dur="5s" begin="1s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="100;70;70;120;120;120;120;70;70;280;280;100" dur="5s" begin="1s" repeatCount="indefinite" />
                </circle>
                {/* Extra electron for visual density */}
                <circle cx="125" cy="100" r="4" fill="#60a5fa">
                  <animate attributeName="cx" values="125;125;180;180;250;314;370;370;480;480;125;125" dur="5s" begin="2.5s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="100;70;70;40;40;40;40;70;70;280;280;100" dur="5s" begin="2.5s" repeatCount="indefinite" />
                </circle>
              </>
            )}
          </>
        )}

        {/* Instruction box at top-left */}
        {/* Instruction box removed */}


        {currentOn && (
          <text x="300" y="350" textAnchor="middle" fill="#1e3a5f" fontSize="16" fontWeight="bold">
            ⚡ {currentDirection === 'forward' ? '→' : '←'} Magnetic Field Active ⚡
          </text>
        )}
      </svg>
    </div>
  );
}

=======
>>>>>>> 6227f02fab69f00512fe8f19d6abfc2c92e2b545
export default InductorPage;
