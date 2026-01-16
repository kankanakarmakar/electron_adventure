import { useNavigate } from 'react-router-dom';
import ElectronicsLogo from '@/components/ElectronicsLogo';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #7dd3fc 70%, #38bdf8 100%)' }}>
      {/* Light blue background - no stars */}

      <div className="relative z-10 flex flex-col items-center justify-center p-4 max-w-6xl mx-auto">
        {/* Logo */}
        <div className="mb-2">
          <ElectronicsLogo size={280} animated={true} />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-center mb-6">
          <span className="text-slate-800">Electronics</span>
          <span className="block md:inline text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">Universe</span>
        </h1>

        {/* Module cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl">
          {[
            {
              key: 'Resistors', color: 'resistor', label: 'Resistors', tagline: 'Limit + protect', render: () => (
                <svg viewBox="0 0 120 60" className="w-24 h-12">
                  <polyline points="10,30 30,30 40,20 50,40 60,20 70,40 80,30 100,30" fill="none" stroke="currentColor" strokeWidth="4" className="text-resistor" />
                  <circle cx="20" cy="30" r="3" className="fill-electron animate-pulse" />
                  <circle cx="90" cy="30" r="3" className="fill-electron animate-pulse" style={{ animationDelay: '0.4s' }} />
                </svg>
              )
            },
            {
              key: 'Inductors', color: 'inductor', label: 'Inductors', tagline: 'Swirls of magnetism', render: () => (
                <svg viewBox="0 0 120 60" className="w-24 h-12">
                  <path d="M20,30 q15,-20 30,0 q15,20 30,0" fill="none" stroke="currentColor" strokeWidth="4" className="text-inductor" />
                  <circle cx="60" cy="30" r="18" fill="none" stroke="currentColor" className="text-inductor/40" strokeWidth="2" style={{ animation: 'magnetic-swirl 3s linear infinite' }} />
                </svg>
              )
            },
            {
              key: 'Capacitors', color: 'capacitor', label: 'Capacitors', tagline: 'Store + release', render: () => (
                <svg viewBox="0 0 120 60" className="w-24 h-12">
                  <line x1="40" y1="18" x2="40" y2="42" stroke="currentColor" strokeWidth="4" className="text-capacitor" />
                  <line x1="80" y1="18" x2="80" y2="42" stroke="currentColor" strokeWidth="4" className="text-capacitor" />
                  <line x1="10" y1="30" x2="40" y2="30" stroke="currentColor" strokeWidth="3" className="text-capacitor/70" />
                  <line x1="80" y1="30" x2="110" y2="30" stroke="currentColor" strokeWidth="3" className="text-capacitor/70" />
                  <circle cx="25" cy="30" r="3" className="fill-electron animate-pulse" />
                </svg>
              )
            },
            {
              key: 'Diodes', color: 'diode', label: 'Diodes', tagline: 'One-way control', render: () => (
                <svg viewBox="0 0 140 60" className="w-28 h-12">
                  <defs>
                    <linearGradient id="diodeGrad" x1="0" x2="1">
                      <stop offset="0%" stopColor="hsl(var(--diode))" />
                      <stop offset="100%" stopColor="hsl(var(--diode-glow))" />
                    </linearGradient>
                  </defs>
                  {/* Leads */}
                  <line x1="20" y1="30" x2="45" y2="30" stroke="currentColor" strokeWidth="3" className="text-diode/70" />
                  <line x1="95" y1="30" x2="120" y2="30" stroke="currentColor" strokeWidth="3" className="text-diode/70" />
                  {/* Triangle (anode) pointing right */}
                  <polygon points="45,30 75,15 75,45" fill="url(#diodeGrad)" className="" />
                  {/* Bar (cathode) */}
                  <line x1="85" y1="16" x2="85" y2="44" stroke="currentColor" strokeWidth="4" className="text-diode" />
                  {/* Electron dot approaching bar then fading (one-way hint) */}
                  <circle cx="35" cy="30" r="3" className="fill-electron" style={{ animation: 'electron-approach 1.8s ease-in-out infinite' }} />
                </svg>
              )
            },
          ].map((m) => (
            <div
              key={m.key}
              className="group relative rounded-xl bg-white/80 backdrop-blur-md border-2 border-slate-200 p-5 text-center transition-all cursor-pointer overflow-hidden will-change-transform hover:shadow-lg hover:border-slate-300 hover:bg-white/90"
              onClick={() => {
                if (m.key === 'Resistors') navigate('/resistor');
                if (m.key === 'Inductors') navigate('/inductor');
                if (m.key === 'Capacitors') navigate('/capacitor');
                if (m.key === 'Diodes') navigate('/diode');
              }}
              onMouseMove={(e) => {
                const el = e.currentTarget;
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rx = ((x / rect.width) - 0.5) * 4; // reduced tilt for premium
                const ry = ((y / rect.height) - 0.5) * -4;
                el.style.transform = `perspective(600px) rotateY(${rx}deg) rotateX(${ry}deg)`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = '';
              }}
            >
              {/* Neon border sweep */}
              <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="absolute inset-0 rounded-2xl" style={{
                  background: 'conic-gradient(from 180deg at 50% 50%, rgba(59,130,246,0.15), rgba(147,51,234,0.15), rgba(59,130,246,0.15))'
                }} />
              </span>

              {/* Glow overlay */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-400/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className={`mx-auto mb-3 flex items-center justify-center rounded-xl p-4 bg-gradient-to-br from-${m.color}/10 to-${m.color}-glow/10 border border-${m.color}/25 glow-${m.color} relative`}
              >
                {/* Micro shimmer on hover */}
                <span className="pointer-events-none absolute inset-[2px] rounded-2xl opacity-0 group-hover:opacity-100" style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                  maskImage: 'radial-gradient(closest-side, black, transparent)'
                }} />
                <span className={`text-${m.color}`}>{m.render()}</span>
              </div>
              <div className="font-display font-bold text-lg tracking-tight">
                <span className={`text-${m.color}`}>{m.label}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {m.tagline}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;

