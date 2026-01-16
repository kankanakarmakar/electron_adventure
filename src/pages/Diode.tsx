import React, { useEffect, useMemo, useState } from 'react';
import { EducationalPanel } from '@/components/electronics/EducationalPanel';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Zap } from 'lucide-react';

// ------------------------------------------------------------------
// Full updated file: PN junction animation corrected so the P and N
// substrates join (touch) and the depletion region forms centered
// at the interface, extending into both sides equally.
// Dialogs are responsive and scrollable; SVGs preserve aspect ratio.
// ------------------------------------------------------------------

function PNJunctionIntro() {
  const [t, setT] = useState(0);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setT(v => v + 1), 30);
    return () => clearInterval(id);
  }, []);

  // SVG coordinate system
  const svgW = 900;
  const svgH = 460;

  // Layout: center-based so P and N always meet at a well-defined boundary
  const centerX = svgW / 2;
  const rectY = 80;
  const rectH = 220;
  const blockW = 300;
  const halfGapWhenSeparated = 24; // each side half-gap -> total 48
  const gap = joined ? 0 : halfGapWhenSeparated * 2;
  const pX = centerX - gap / 2 - blockW;
  const nX = centerX + gap / 2;

  // Boundary X (center)
  const boundaryX = centerX;

  // Depletion region
  const depletionMaxHalf = 90; // px into each side
  // Slower depletion formation: ~3-4 seconds (t * 0.004 means 250 frames = ~4 seconds at 60fps)
  const depletionProgress = joined ? Math.min(1, t * 0.004) : 0;
  const depletionHalfWidth = depletionMaxHalf * depletionProgress;

  // grid for particles
  const cols = 8;
  const rows = 5;
  const paddingX = 28;
  const paddingY = 28;
  const spacingX = Math.floor((blockW - paddingX * 2) / (cols - 1));
  const spacingY = Math.floor((rectH - paddingY * 2) / (rows - 1));

  const holes = useMemo(() => Array.from({ length: cols * rows }).map((_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      id: i,
      baseX: pX + paddingX + col * spacingX,
      y: rectY + paddingY + row * spacingY
    };
  }), [pX, spacingX, spacingY]);

  const electrons = useMemo(() => Array.from({ length: cols * rows }).map((_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      id: i,
      baseX: nX + paddingX + col * spacingX,
      y: rectY + paddingY + row * spacingY
    };
  }), [nX, spacingX, spacingY]);

  const isInsideDepletion = (cx) => {
    const left = boundaryX - depletionHalfWidth;
    const right = boundaryX + depletionHalfWidth;
    return depletionProgress > 0 && cx >= left && cx <= right;
  };

  return (
    <div className="glass-card p-3 md:p-4 relative">
      <div className="absolute right-4 top-4 z-10">
        <Button onClick={() => setJoined(v => !v)} variant={joined ? 'destructive' : 'default'} className="px-4 py-2">
          {joined ? 'Disconnect Junction' : 'Form Junction'}
        </Button>
      </div>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto max-h-[75vh] rounded-2xl border-2 border-sky-300 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 shadow-lg overflow-hidden">
        <defs>
          <filter id="softGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>

          <linearGradient id="pTypeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(244,114,182,0.4)" />
            <stop offset="100%" stopColor="rgba(236,72,153,0.25)" />
          </linearGradient>
          <linearGradient id="nTypeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(96,165,250,0.4)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.25)" />
          </linearGradient>

          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
          </pattern>

          <marker id="arrowHead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255,255,255,0.85)" />
          </marker>
        </defs>

        <rect width={svgW} height={svgH} fill="url(#grid)" />

        {/* P block - Majority: HOLES (⊕), Minority: electrons (⊖) */}
        <g>
          <rect x={pX} y={rectY} width={blockW} height={rectH} rx="18" fill="url(#pTypeGrad)" stroke="rgba(255,120,180,0.45)" strokeWidth="2" filter="url(#softGlow)" />
          <text x={pX + blockW / 2} y={rectY - 16} textAnchor="middle" className="fill-pink-300 text-sm font-semibold">P-Type Semiconductor</text>

          {/* P-type carriers - majority HOLES (⊕) and minority electrons (⊖) */}
          {holes.map(h => {
            const drift = joined ? Math.max(0, (boundaryX - h.baseX) * 0.02 * depletionProgress) : Math.sin((t + h.id * 10) * 0.02) * 0.9;
            const cx = h.baseX + drift;
            const inside = isInsideDepletion(cx);
            // Minority electrons (⊖) are about 1 in 6 (rare)
            const isMinority = (h.id % 6 === 3);
            return (
              <g key={`pcarrier-${h.id}`} style={{ opacity: inside ? 0.16 : 1, transition: 'opacity .2s' }}>
                <circle cx={cx} cy={h.y} r="11" fill={isMinority ? 'rgba(150,200,255,0.15)' : 'rgba(255,160,200,0.15)'} stroke={isMinority ? 'rgba(150,200,255,0.9)' : 'rgba(255,160,200,0.9)'} strokeWidth="2" />
                <text x={cx} y={h.y + 4} textAnchor="middle" className={`text-xs font-bold ${isMinority ? 'fill-blue-200' : 'fill-pink-200'}`}>{isMinority ? '−' : '+'}</text>
              </g>
            );
          })}
        </g>

        {/* N block - Majority: ELECTRONS (⊖), Minority: holes (⊕) */}
        <g>
          <rect x={nX} y={rectY} width={blockW} height={rectH} rx="18" fill="url(#nTypeGrad)" stroke="rgba(120,180,255,0.45)" strokeWidth="2" filter="url(#softGlow)" />
          <text x={nX + blockW / 2} y={rectY - 16} textAnchor="middle" className="fill-blue-300 text-sm font-semibold">N-Type Semiconductor</text>

          {/* N-type carriers - majority ELECTRONS (⊖) and minority holes (⊕) */}
          {electrons.map(e => {
            const drift = joined ? -Math.max(0, (e.baseX - boundaryX) * 0.02 * depletionProgress) : Math.sin((t + e.id * 9) * 0.02) * 0.9;
            const cx = e.baseX + drift;
            const inside = isInsideDepletion(cx);
            // Minority holes (⊕) are about 1 in 6 (rare)
            const isMinority = (e.id % 6 === 3);
            return (
              <g key={`ncarrier-${e.id}`} style={{ opacity: inside ? 0.16 : 1, transition: 'opacity .2s' }}>
                <circle cx={cx} cy={e.y} r="11" fill={isMinority ? 'rgba(255,160,200,0.15)' : 'rgba(150,200,255,0.15)'} stroke={isMinority ? 'rgba(255,160,200,0.9)' : 'rgba(150,200,255,0.9)'} strokeWidth="2" />
                <text x={cx} y={e.y + 4} textAnchor="middle" className={`text-xs font-bold ${isMinority ? 'fill-pink-200' : 'fill-blue-200'}`}>{isMinority ? '+' : '−'}</text>
              </g>
            );
          })}
        </g>




        {/* Depletion region centered at boundary */}
        {depletionProgress > 0 ? (
          <g>
            <rect x={boundaryX - depletionHalfWidth} y={rectY + 8} width={depletionHalfWidth * 2} height={rectH - 16} rx="8"
              fill="rgba(220,220,255,0.08)" stroke="rgba(200,200,220,0.46)" strokeWidth="1.8" strokeDasharray="6 4" />

            {/* Immobile ions inside depletion region - equal on both sides */}
            {Array.from({ length: rows }).map((_, rowIdx) => {
              const y = rectY + paddingY + rowIdx * spacingY;
              // Calculate equal number of ion columns for both sides
              const ionCols = Math.max(1, Math.min(3, Math.floor(depletionHalfWidth / 25)));
              const ionSpacing = depletionHalfWidth / (ionCols + 1);

              return Array.from({ length: ionCols }).map((_, colIdx) => {
                // Negative ions on P-side (left half) - equally spaced
                const leftIonX = boundaryX - ionSpacing * (colIdx + 1);
                // Positive ions on N-side (right half) - equally spaced (mirror position)
                const rightIonX = boundaryX + ionSpacing * (colIdx + 1);

                return (
                  <g key={`ion-${rowIdx}-${colIdx}`} style={{ opacity: 0.5 + depletionProgress * 0.5 }}>
                    {/* Negative ion on P-side (acceptor ion) */}
                    <g>
                      <circle cx={leftIonX} cy={y} r="9" fill="rgba(255,150,200,0.15)" stroke="rgba(255,150,200,0.95)" strokeWidth="1.8" />
                      <text x={leftIonX} y={y + 4} textAnchor="middle" className="fill-pink-300 text-xs font-bold">−</text>
                    </g>
                    {/* Positive ion on N-side (donor ion) */}
                    <g>
                      <circle cx={rightIonX} cy={y} r="9" fill="rgba(150,200,255,0.15)" stroke="rgba(150,200,255,0.95)" strokeWidth="1.8" />
                      <text x={rightIonX} y={y + 4} textAnchor="middle" className="fill-blue-300 text-xs font-bold">+</text>
                    </g>
                  </g>
                );
              });
            })}

            <line x1={boundaryX + depletionHalfWidth - 8} y1={rectY + rectH + 10}
              x2={boundaryX - depletionHalfWidth + 8} y2={rectY + rectH + 10}
              stroke="rgba(255,245,150,0.95)" strokeWidth="3" markerEnd="url(#arrowHead)" />
            <text x={boundaryX} y={rectY + rectH + 28} textAnchor="middle" className="fill-yellow-200/90 text-[12px] font-semibold">Depletion Region</text>
            <text x={boundaryX} y={rectY + rectH + 44} textAnchor="middle" className="fill-yellow-100/90 text-[11px]">Direction of electric field (N → P)</text>
          </g>
        ) : (
          <g>
            <rect x={boundaryX - 2} y={rectY + 4} width={4} height={rectH - 8} rx="4" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />
          </g>
        )}

        {/* status caption */}
        <g>
          <rect x="20" y="360" width="620" height="56" rx="10" fill="rgba(0,0,0,0.36)" />
          <text x="34" y="378" className="fill-white/90 text-sm">
            {depletionProgress > 0 ? 'Junction formed: Depletion region present between P and N' : joined ? 'Joining...' : 'Separated: P and N regions not joined'}
          </text>
          <text x="34" y="396" className="fill-white/60 text-xs">Use the top-right button to {joined ? 'disconnect' : 'form'} the junction</text>
        </g>
      </svg>
    </div>
  );
}

// Helper to compute centered positions for bias tabs
function useCenteredBoxes() {
  // standard layout inside bias SVGs
  const pX = 150;
  const boxW = 120;
  const nX = 330;
  const boundary = (pX + boxW + nX) / 2;
  return { pX, boxW, nX, boundary };
}

// --- Forward Bias Tab ---
function ForwardBiasTab() {
  const [voltage, setVoltage] = useState(0);
  const [t, setT] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setT(v => v + 1), 30);
    return () => clearInterval(id);
  }, []);

  const { pX, boxW, nX, boundary } = useCenteredBoxes();

  const isAboveThreshold = voltage >= 0.7;
  const currentFlow = isAboveThreshold ? (voltage - 0.7) * 100 : 0;
  const barrierWidthPx = Math.max(10, 60 - voltage * 40);
  const barrierX = boundary - barrierWidthPx / 2;

  const cols = 5;
  const rows = 4;
  const paddingX = 15;
  const paddingY = 15;
  const spacingX = (boxW - 2 * paddingX) / (cols - 1);
  const spacingY = (120 - 2 * paddingY) / (rows - 1);

  return (
    <div className="space-y-3">
      <div className="bg-white/90 backdrop-blur rounded-xl border-2 border-green-400 p-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-800">Applied Voltage</h3>
          <div
            className="flex items-center gap-3"
            role="spinbutton"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={1.5}
            aria-valuenow={voltage}
            aria-label="Applied Voltage"
            onKeyDown={(e) => {
              const key = e.key;
              if (key === 'ArrowUp' || key === 'PageUp') {
                e.preventDefault();
                setVoltage(v => Math.min(1.5, v + 0.1));
              } else if (key === 'ArrowDown' || key === 'PageDown') {
                e.preventDefault();
                setVoltage(v => Math.max(0, v - 0.1));
              } else if (key === 'Home') {
                e.preventDefault();
                setVoltage(0);
              } else if (key === 'End') {
                e.preventDefault();
                setVoltage(1.5);
              }
            }}
          >
            <Button size="sm" variant="outline" onClick={() => setVoltage(v => Math.max(0, v - 0.1))} className="h-10 w-10 p-0 text-lg font-bold">−</Button>
            <span className="text-2xl font-mono font-bold text-green-600 min-w-[100px] text-center">{voltage.toFixed(2)}V</span>
            <Button size="sm" variant="outline" onClick={() => setVoltage(v => Math.min(1.5, v + 0.1))} className="h-10 w-10 p-0 text-lg font-bold">+</Button>
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>Min: 0V</span>
          <span className="text-amber-600 font-medium">Threshold: 0.7V</span>
          <span>Max: 1.5V</span>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur rounded-xl border-2 border-slate-300 p-3 shadow-lg relative">
        {/* Hint box overlay */}
        <div className="absolute top-4 left-4 z-20 max-w-[200px]">
          <div className="bg-white/95 backdrop-blur-md border-2 border-green-400 rounded-lg p-2 shadow-lg">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-sm">💡</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[10px] font-bold text-green-600 mb-0.5">
                  {isAboveThreshold ? 'Conducting!' : 'Below Threshold'}
                </h3>
                <p className="text-[9px] text-slate-600 leading-snug">
                  {isAboveThreshold
                    ? 'Barrier overcome! Current flows freely through the diode.'
                    : 'Increase voltage to 0.7V to overcome the barrier potential.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <svg viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet" className="w-full h-auto max-h-[60vh] rounded-lg bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-2 border-sky-300">
          <defs>
            <filter id="glowForward"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <radialGradient id="electronGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(59,130,246,1)" /><stop offset="100%" stopColor="rgba(59,130,246,0)" /></radialGradient>
          </defs>

          {/* Battery / connectors - darker for visibility */}
          <g>
            <rect x="20" y="100" width="60" height="80" rx="8" fill="#374151" stroke="#1f2937" strokeWidth="3" />
            <rect x="35" y="90" width="30" height="10" rx="2" fill="#4b5563" />
            <text x="50" y="135" textAnchor="middle" fill="#22c55e" fontSize="18" fontWeight="bold">+</text>
            <text x="50" y="165" textAnchor="middle" fill="#ef4444" fontSize="18" fontWeight="bold">−</text>
            <text x="50" y="195" textAnchor="middle" fill="#1e40af" fontSize="12" fontWeight="bold">{voltage.toFixed(1)}V</text>
          </g>

          {/* wires (visual) - darker colors for visibility */}
          <path d="M 80 120 L 140 120" stroke="#ef4444" strokeWidth="4" />
          <path d="M 80 160 L 140 160 L 140 220 L 480 220 L 480 160" stroke="#3b82f6" strokeWidth="4" />

          {/* P block - Majority: HOLES (⊕), Minority: electrons (⊖) */}
          <rect x={pX} y={80} width={boxW} height={120} rx="12" fill="rgba(244,114,182,0.25)" stroke="#ec4899" strokeWidth="2" />
          <text x={pX + boxW / 2} y={70} textAnchor="middle" fill="#be185d" fontSize="14" fontWeight="bold">P-type</text>

          {/* P-type carriers - majority HOLES (⊕) and minority electrons (⊖) - neat grid */}
          {Array.from({ length: cols * rows }).map((_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const baseX = pX + paddingX + col * spacingX;
            const baseY = 80 + paddingY + row * spacingY;
            const moveX = isAboveThreshold ? Math.sin((t + i * 20) * 0.05) * 3 + (currentFlow * 0.03) : Math.sin((t + i * 20) * 0.03) * 2;
            // Minority electrons (⊖) are about 1 in 6 (rare)
            const isMinority = (i % 6 === 3);
            return (
              <g key={`pcarrier-f-${i}`}>
                <circle cx={baseX + moveX} cy={baseY} r="8" fill={isMinority ? 'rgba(59,130,246,0.3)' : 'rgba(236,72,153,0.3)'} stroke={isMinority ? '#3b82f6' : '#ec4899'} strokeWidth="2" />
                <text x={baseX + moveX} y={baseY + 4} textAnchor="middle" fill={isMinority ? '#1e40af' : '#be185d'} fontSize="12" fontWeight="bold">{isMinority ? '−' : '+'}</text>
              </g>
            );
          })}

          {/* barrier (centered at boundary) with fixed ions */}
          <rect x={barrierX} y={85} width={barrierWidthPx} height={110} rx="6" fill="rgba(148,163,184,0.2)" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
          {/* Depletion region: Equal columns of ⊖ on P-side and ⊕ on N-side - ions fit within box */}
          {barrierWidthPx > 15 && (
            <>
              {/* P-side column(s) of negative ions (⊖) - exactly within depletion box */}
              {Array.from({ length: Math.max(1, Math.min(2, Math.floor(barrierWidthPx / 30))) }).map((_, colIdx) => (
                Array.from({ length: 4 }).map((_, rowIdx) => {
                  // Box is at y=85, height=110, so y ranges from 85 to 195
                  // Ions at y=95 to y=180 (with r=6, that's 89-186 which fits in 85-195)
                  const ionX = Math.max(barrierX + 8, boundary - 10 - colIdx * 16);
                  const ionY = 95 + rowIdx * 25;
                  return (
                    <g key={`p-ion-${colIdx}-${rowIdx}`} style={{ opacity: Math.min(1, barrierWidthPx / 40) }}>
                      <circle cx={ionX} cy={ionY} r="6" fill="rgba(255,150,200,0.2)" stroke="rgba(255,150,200,0.9)" strokeWidth="1.5" />
                      <text x={ionX} y={ionY + 3} textAnchor="middle" className="text-[9px] font-bold fill-pink-300">−</text>
                    </g>
                  );
                })
              ))}
              {/* N-side column(s) of positive ions (⊕) - exactly within depletion box */}
              {Array.from({ length: Math.max(1, Math.min(2, Math.floor(barrierWidthPx / 30))) }).map((_, colIdx) => (
                Array.from({ length: 4 }).map((_, rowIdx) => {
                  const ionX = Math.min(barrierX + barrierWidthPx - 8, boundary + 10 + colIdx * 16);
                  const ionY = 95 + rowIdx * 25;
                  return (
                    <g key={`n-ion-${colIdx}-${rowIdx}`} style={{ opacity: Math.min(1, barrierWidthPx / 40) }}>
                      <circle cx={ionX} cy={ionY} r="6" fill="rgba(150,200,255,0.2)" stroke="rgba(150,200,255,0.9)" strokeWidth="1.5" />
                      <text x={ionX} y={ionY + 3} textAnchor="middle" className="text-[9px] font-bold fill-blue-300">+</text>
                    </g>
                  );
                })
              ))}
            </>
          )}
          <text x={boundary} y={210} textAnchor="middle" fill="#475569" fontSize="11" fontWeight="bold">{barrierWidthPx > 30 ? 'Depletion Region' : 'Barrier shrinking!'}</text>

          {/* N block - Majority: ELECTRONS (⊖), Minority: holes (⊕) */}
          <rect x={nX} y={80} width={boxW} height={120} rx="12" fill="rgba(96,165,250,0.25)" stroke="#3b82f6" strokeWidth="2" />
          <text x={nX + boxW / 2} y={70} textAnchor="middle" fill="#1e40af" fontSize="14" fontWeight="bold">N-type</text>

          {/* N-type carriers - majority ELECTRONS (⊖) and minority holes (⊕) - neat grid */}
          {Array.from({ length: cols * rows }).map((_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const baseX = nX + paddingX + col * spacingX;
            const baseY = 80 + paddingY + row * spacingY;
            const moveX = isAboveThreshold ? -Math.sin((t + i * 15) * 0.05) * 3 - (currentFlow * 0.03) : Math.sin((t + i * 15) * 0.03) * 2;
            // Minority holes (⊕) are about 1 in 6 (rare)
            const isMinority = (i % 6 === 3);
            return (
              <g key={`ncarrier-f-${i}`}>
                <circle cx={baseX + moveX} cy={baseY} r="8" fill={isMinority ? 'rgba(236,72,153,0.3)' : 'rgba(59,130,246,0.3)'} stroke={isMinority ? '#ec4899' : '#3b82f6'} strokeWidth="2" />
                <text x={baseX + moveX} y={baseY + 4} textAnchor="middle" fill={isMinority ? '#be185d' : '#1e40af'} fontSize="12" fontWeight="bold">{isMinority ? '+' : '−'}</text>
              </g>
            );
          })}

          {/* current flow dots */}
          {isAboveThreshold && (
            <g>
              {Array.from({ length: 6 }).map((_, i) => {
                const x = boundary + ((t * 2 + i * 50) % 200) - 100;
                const opacity = Math.abs(Math.sin(((t * 2 + i * 50) % 200) / 200 * Math.PI));
                return <circle key={`flow-${i}`} cx={x} cy={140} r="4" fill="#22c55e" style={{ opacity: opacity * (currentFlow / 30) }} filter="url(#glowForward)" />;
              })}
              {/* Prominent status box */}
              <g>
                <rect x={boundary - 130} y={222} width="260" height="28" rx="6" fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="2" />
                <text x={boundary} y={240} textAnchor="middle" fill="#15803d" fontSize="13" fontWeight="bold">⚡ Current flowing – Short Circuit ⚡</text>
              </g>
            </g>
          )}

          {/* LED */}
          <g>
            {isAboveThreshold && (
              <circle
                cx="520"
                cy="140"
                r="40"
                fill="rgba(250,204,21,0.3)"
                filter="url(#glowForward)"
              />
            )}
            <circle cx="520" cy="140" r="30" fill={isAboveThreshold ? `rgba(250,204,21,${Math.min(1, currentFlow / 80)})` : '#94a3b8'} stroke={isAboveThreshold ? '#eab308' : '#64748b'} strokeWidth="3" />
            <text x="520" y="147" textAnchor="middle" fill={isAboveThreshold ? '#854d0e' : '#475569'} fontSize="14" fontWeight="bold">{isAboveThreshold ? 'ON' : 'OFF'}</text>
            <text x="520" y="185" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="bold">LED</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

// --- Reverse Bias Tab ---
function ReverseBiasTab() {
  const [voltage, setVoltage] = useState(0);
  const [t, setT] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setT(v => v + 1), 30);
    return () => clearInterval(id);
  }, []);

  const { pX, boxW, nX, boundary } = useCenteredBoxes();

  const barrierHalfPx = 25 + voltage * 4;
  const barrierWidthPx = barrierHalfPx * 2;
  const barrierX = boundary - barrierHalfPx;
  const leakageCurrent = voltage > 0 ? 0.001 * voltage : 0;

  return (
    <div className="space-y-3">
      <div className="bg-white/90 backdrop-blur rounded-xl border-2 border-red-400 p-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-800">Reverse Voltage</h3>
          <div
            className="flex items-center gap-3"
            role="spinbutton"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={voltage}
            aria-label="Reverse Voltage"
            onKeyDown={(e) => {
              const key = e.key;
              if (key === 'ArrowUp' || key === 'PageUp') {
                e.preventDefault();
                setVoltage(v => Math.min(10, v + 0.5));
              } else if (key === 'ArrowDown' || key === 'PageDown') {
                e.preventDefault();
                setVoltage(v => Math.max(0, v - 0.5));
              } else if (key === 'Home') {
                e.preventDefault();
                setVoltage(0);
              } else if (key === 'End') {
                e.preventDefault();
                setVoltage(10);
              }
            }}
          >
            <Button size="sm" variant="outline" onClick={() => setVoltage(v => Math.max(0, v - 0.5))} className="h-10 w-10 p-0 text-lg font-bold">−</Button>
            <span className="text-2xl font-mono font-bold text-red-600 min-w-[100px] text-center">-{voltage.toFixed(1)}V</span>
            <Button size="sm" variant="outline" onClick={() => setVoltage(v => Math.min(10, v + 0.5))} className="h-10 w-10 p-0 text-lg font-bold">+</Button>
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2"><span>0V</span><span>-5V</span><span>Max: -10V</span></div>
      </div>

      <div className="bg-white/90 backdrop-blur rounded-xl border-2 border-slate-300 p-3 shadow-lg relative">
        {/* Hint box overlay */}
        <div className="absolute top-4 left-4 z-20 max-w-[200px]">
          <div className="bg-white/95 backdrop-blur-md border-2 border-red-400 rounded-lg p-2 shadow-lg">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-sm">🚫</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[10px] font-bold text-red-600 mb-0.5">Reverse Bias</h3>
                <p className="text-[9px] text-slate-600 leading-snug">
                  {voltage > 5
                    ? 'High reverse voltage! Depletion zone very wide.'
                    : 'Depletion zone widens. No current flows (open circuit).'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <svg viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet" className="w-full h-auto max-h-[60vh] rounded-lg bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-2 border-sky-300">
          <defs><filter id="glowReverse"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>

          {/* battery - dark for visibility */}
          <g>
            <rect x="20" y="100" width="60" height="80" rx="8" fill="#374151" stroke="#1f2937" strokeWidth="3" />
            <rect x="35" y="90" width="30" height="10" rx="2" fill="#4b5563" />
            <text x="50" y="135" textAnchor="middle" fill="#ef4444" fontSize="18" fontWeight="bold">−</text>
            <text x="50" y="165" textAnchor="middle" fill="#22c55e" fontSize="18" fontWeight="bold">+</text>
            <text x="50" y="195" textAnchor="middle" fill="#1e40af" fontSize="12" fontWeight="bold">-{voltage.toFixed(1)}V</text>
          </g>

          {/* wires - solid colors for visibility */}
          <path d="M 80 120 L 140 120" stroke="#3b82f6" strokeWidth="4" />
          <path d="M 80 160 L 140 160 L 140 220 L 480 220 L 480 160" stroke="#ef4444" strokeWidth="4" />

          {/* P box - Majority: HOLES (⊕), Minority: electrons (⊖) */}
          <rect x={pX} y={80} width={boxW} height={120} rx="12" fill="rgba(244,114,182,0.25)" stroke="#ec4899" strokeWidth="2" />
          <text x={pX + boxW / 2} y={70} textAnchor="middle" fill="#be185d" fontSize="14" fontWeight="bold">P-type</text>

          {/* P-type carriers - 5 cols × 4 rows = 20 carriers matching forward bias */}
          {Array.from({ length: 20 }).map((_, i) => {
            const cols = 5;
            const rows = 4;
            const paddingX = 15;
            const paddingY = 15;
            const spacingX = (boxW - 2 * paddingX) / (cols - 1);
            const spacingY = (120 - 2 * paddingY) / (rows - 1);
            const col = i % cols;
            const row = Math.floor(i / cols);
            const baseX = pX + paddingX + col * spacingX;
            const baseY = 80 + paddingY + row * spacingY;
            // Clamp movement: carriers move LEFT (away from junction) but stay within P-box (not past pX + 12)
            // Also cannot enter depletion region (baseX + moveLeft must be < barrierX - 10)
            const maxMoveToLeft = Math.min(voltage * 2, baseX - pX - 12);
            const moveLeft = -maxMoveToLeft + Math.sin((t + i * 20) * 0.02) * 1;
            // Final X position clamped to stay within P-box boundaries
            const finalX = Math.max(pX + 12, Math.min(baseX + moveLeft, pX + boxW - 12));
            // Minority electrons (⊖) are about 1 in 6 (rare)
            const isMinority = (i % 6 === 3);
            return (
              <g key={`pcarrier-r-${i}`}>
                <circle cx={finalX} cy={baseY} r="8" fill={isMinority ? 'rgba(59,130,246,0.3)' : 'rgba(236,72,153,0.3)'} stroke={isMinority ? '#3b82f6' : '#ec4899'} strokeWidth="2" />
                <text x={finalX} y={baseY + 4} textAnchor="middle" fill={isMinority ? '#1e40af' : '#be185d'} fontSize="12" fontWeight="bold">{isMinority ? '−' : '+'}</text>
              </g>
            );
          })}

          {/* N box - Majority: ELECTRONS (⊖), Minority: holes (⊕) */}
          <rect x={nX} y={80} width={boxW} height={120} rx="12" fill="rgba(96,165,250,0.25)" stroke="#3b82f6" strokeWidth="2" />
          <text x={nX + boxW / 2} y={70} textAnchor="middle" fill="#1e40af" fontSize="14" fontWeight="bold">N-type</text>

          {/* N-type carriers - 5 cols × 4 rows = 20 carriers matching forward bias */}
          {Array.from({ length: 20 }).map((_, i) => {
            const cols = 5;
            const rows = 4;
            const paddingX = 15;
            const paddingY = 15;
            const spacingX = (boxW - 2 * paddingX) / (cols - 1);
            const spacingY = (120 - 2 * paddingY) / (rows - 1);
            const col = i % cols;
            const row = Math.floor(i / cols);
            const baseX = nX + paddingX + col * spacingX;
            const baseY = 80 + paddingY + row * spacingY;
            // Clamp movement: carriers move RIGHT (away from junction) but stay within N-box (not past nX + boxW - 12)
            const maxMoveToRight = Math.min(voltage * 2, (nX + boxW - 12) - baseX);
            const moveRight = maxMoveToRight + Math.sin((t + i * 15) * 0.02) * 1;
            // Final X position clamped to stay within N-box boundaries
            const finalX = Math.max(nX + 12, Math.min(baseX + moveRight, nX + boxW - 12));
            // Minority holes (⊕) are about 1 in 6 (rare)
            const isMinority = (i % 6 === 3);
            return (
              <g key={`ncarrier-r-${i}`}>
                <circle cx={finalX} cy={baseY} r="8" fill={isMinority ? 'rgba(236,72,153,0.3)' : 'rgba(59,130,246,0.3)'} stroke={isMinority ? '#ec4899' : '#3b82f6'} strokeWidth="2" />
                <text x={finalX} y={baseY + 4} textAnchor="middle" fill={isMinority ? '#be185d' : '#1e40af'} fontSize="12" fontWeight="bold">{isMinority ? '+' : '−'}</text>
              </g>
            );
          })}

          {/* depletion region (centered) - widens in reverse bias */}
          <rect x={barrierX} y={85} width={barrierWidthPx} height={110} rx="8" fill="rgba(255,100,100,0.1)" stroke="rgba(255,100,100,0.4)" strokeWidth="2" strokeDasharray="6 3" />
          <text x={boundary} y={215} textAnchor="middle" className="fill-red-300/80 text-xs font-semibold">WIDENED DEPLETION ZONE</text>

          {/* Equal columns of ions: P-side ⊖, N-side ⊕ - ions fit exactly within box */}
          <>
            {/* P-side columns of negative ions (⊖) - clamped within depletion box */}
            {Array.from({ length: Math.max(1, Math.min(3, Math.floor(barrierHalfPx / 18))) }).map((_, colIdx) => (
              Array.from({ length: 4 }).map((_, rowIdx) => {
                // Clamp ionX to stay within depletion box (barrierX to barrierX + barrierWidthPx)
                const ionX = Math.max(barrierX + 8, boundary - 10 - colIdx * 16);
                const ionY = 95 + rowIdx * 25;
                return (
                  <g key={`p-ion-r-${colIdx}-${rowIdx}`}>
                    <circle cx={ionX} cy={ionY} r="6" fill="rgba(255,150,200,0.2)" stroke="rgba(255,150,200,0.9)" strokeWidth="1.5" />
                    <text x={ionX} y={ionY + 3} textAnchor="middle" className="fill-pink-300 text-[10px] font-bold">−</text>
                  </g>
                );
              })
            ))}
            {/* N-side columns of positive ions (⊕) - clamped within depletion box */}
            {Array.from({ length: Math.max(1, Math.min(3, Math.floor(barrierHalfPx / 18))) }).map((_, colIdx) => (
              Array.from({ length: 4 }).map((_, rowIdx) => {
                // Clamp ionX to stay within depletion box
                const ionX = Math.min(barrierX + barrierWidthPx - 8, boundary + 10 + colIdx * 16);
                const ionY = 95 + rowIdx * 25;
                return (
                  <g key={`n-ion-r-${colIdx}-${rowIdx}`}>
                    <circle cx={ionX} cy={ionY} r="6" fill="rgba(150,200,255,0.2)" stroke="rgba(150,200,255,0.9)" strokeWidth="1.5" />
                    <text x={ionX} y={ionY + 3} textAnchor="middle" className="fill-blue-300 text-[10px] font-bold">+</text>
                  </g>
                );
              })
            ))}
          </>

          {/* small leakage */}
          {voltage > 2 && <g style={{ opacity: 0.4 }}>
            <circle cx={boundary + ((t * 0.5) % 60) - 30} cy={140} r="2" fill="rgba(255,200,100,0.8)" />
            <text x={boundary} y={220} textAnchor="middle" className="fill-yellow-400/60 text-[10px]">Tiny leakage current (minority carriers)</text>
          </g>}

          {/* no-current indicator */}
          <g>
            <circle cx="520" cy="140" r="30" fill="rgba(50,50,50,0.5)" stroke="rgba(100,100,100,0.5)" strokeWidth="3" />
            <line x1="505" y1="125" x2="535" y2="155" stroke="rgba(255,100,100,0.6)" strokeWidth="3" />
            <line x1="535" y1="125" x2="505" y2="155" stroke="rgba(255,100,100,0.6)" strokeWidth="3" />
            <text x="520" y="185" textAnchor="middle" className="fill-red-400/60 text-xs">NO CURRENT</text>
          </g>
          <text x={boundary} y="235" textAnchor="middle" className="fill-orange-300/80 text-[10px]">Diode behaves as open circuit (no current)</text>
        </svg>
      </div>
    </div>
  );
}

// --- Breakdown Tab ---
function BreakdownTab() {
  const [voltage, setVoltage] = useState(0);
  const [breakdownType, setBreakdownType] = useState('zener');
  const [t, setT] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setT(v => v + 1), 20);
    return () => clearInterval(id);
  }, []);

  const breakdownVoltage = breakdownType === 'zener' ? 5.1 : 50;
  const isBreakdown = voltage >= breakdownVoltage;
  const breakdownCurrent = isBreakdown ? (voltage - breakdownVoltage) * 20 : 0;
  const centerBoundary = 300;
  const maxHalf = 150;
  const halfWidth = Math.min(maxHalf, (voltage / (breakdownType === 'zener' ? 10 : 80)) * maxHalf);

  const maxVoltage = breakdownType === 'zener' ? 10 : 80;
  const step = breakdownType === 'zener' ? 0.5 : 2;

  return (
    <div className="space-y-2">
      <div className="bg-white/90 backdrop-blur rounded-xl border-2 border-purple-400 p-2 shadow-lg">
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant={breakdownType === 'zener' ? 'default' : 'outline'} onClick={() => { setBreakdownType('zener'); setVoltage(0); }} className="h-auto py-2 flex-col text-sm">
            <Zap className="w-5 h-5 mb-1" />
            <span className="font-bold text-sm">Zener (~5V)</span>
          </Button>
          <Button size="sm" variant={breakdownType === 'avalanche' ? 'default' : 'outline'} onClick={() => { setBreakdownType('avalanche'); setVoltage(0); }} className="h-auto py-2 flex-col text-sm">
            <Zap className="w-5 h-5 mb-1" />
            <span className="font-bold text-sm">Avalanche (&gt;50V)</span>
          </Button>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur rounded-xl border-2 border-purple-400 p-2 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-slate-800">Reverse Voltage</h3>
          <div
            className="flex items-center gap-2"
            role="spinbutton"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={maxVoltage}
            aria-valuenow={voltage}
            aria-label="Reverse Voltage"
            onKeyDown={(e) => {
              const key = e.key;
              if (key === 'ArrowUp' || key === 'PageUp') {
                e.preventDefault();
                setVoltage(v => Math.min(maxVoltage, v + step));
              } else if (key === 'ArrowDown' || key === 'PageDown') {
                e.preventDefault();
                setVoltage(v => Math.max(0, v - step));
              } else if (key === 'Home') {
                e.preventDefault();
                setVoltage(0);
              } else if (key === 'End') {
                e.preventDefault();
                setVoltage(maxVoltage);
              }
            }}
          >
            <Button size="sm" variant="outline" onClick={() => setVoltage(v => Math.max(0, v - step))} className="h-8 w-8 p-0 text-base font-bold">−</Button>
            <span className={`text-xl font-mono font-bold min-w-[90px] text-center ${isBreakdown ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>-{voltage.toFixed(1)}V</span>
            <Button size="sm" variant="outline" onClick={() => setVoltage(v => Math.min(maxVoltage, v + step))} className="h-8 w-8 p-0 text-base font-bold">+</Button>
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0V</span>
          <span className="text-red-600 font-medium">Breakdown: {breakdownVoltage}V</span>
          <span>Max: {maxVoltage}V</span>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur rounded-xl border-2 border-slate-300 p-2 shadow-lg relative">
        {/* Hint box overlay */}
        <div className="absolute top-3 left-3 z-20 max-w-[180px]">
          <div className="bg-white/95 backdrop-blur-md border-2 border-purple-400 rounded-lg p-2 shadow-lg">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-sm">⚡</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[10px] font-bold text-purple-600 mb-0.5">
                  {isBreakdown ? '⚡ BREAKDOWN!' : breakdownType === 'zener' ? 'Zener Diode' : 'Avalanche'}
                </h3>
                <p className="text-[9px] text-slate-600 leading-snug">
                  {isBreakdown
                    ? (breakdownType === 'zener' ? 'Quantum tunneling active! Electrons pass through barrier.' : 'Impact ionization cascade! Carriers multiply.')
                    : `Increase voltage to ${breakdownVoltage}V to trigger breakdown.`}
                </p>
              </div>
            </div>
          </div>
        </div>
        <svg viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet" className="w-full h-auto max-h-[48vh] rounded-lg bg-gradient-to-br from-slate-800 via-purple-900/30 to-slate-900">
          <defs>
            <filter id="intenseGlow"><feGaussianBlur stdDeviation="8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>

          <rect x="100" y="30" width="400" height="180" rx="16" fill="rgba(100,50,150,0.2)" stroke="rgba(200,150,255,0.4)" strokeWidth="2" />
          <text x="300" y="20" textAnchor="middle" className="fill-purple-300 text-sm font-semibold">Depletion Region (Zoomed View)</text>

          {/* field lines */}
          {Array.from({ length: 7 }).map((_, i) => {
            const intensity = isBreakdown ? 1 : Math.min(1, voltage / breakdownVoltage);
            return <line key={i} x1="120" y1={45 + i * 24} x2="480" y2={45 + i * 24}
              stroke={`rgba(255,255,100,${0.1 + intensity * 0.3})`} strokeWidth={1 + intensity * 2}
              strokeDasharray={isBreakdown ? 'none' : '8 4'} />;
          })}

          {/* fixed ions */}
          {Array.from({ length: 4 }).map((_, i) => (
            <g key={i}>
              <circle cx={150} cy={55 + i * 40} r="9" fill="none" stroke="rgba(255,150,200,0.8)" strokeWidth="2" />
              <text x={150} y={60 + i * 40} textAnchor="middle" className="fill-pink-300 text-sm font-bold">−</text>
              <circle cx={450} cy={55 + i * 40} r="9" fill="none" stroke="rgba(150,200,255,0.8)" strokeWidth="2" />
              <text x={450} y={60 + i * 40} textAnchor="middle" className="fill-blue-300 text-sm font-bold">+</text>
            </g>
          ))}

          {/* depletion rect centered */}
          <rect x={centerBoundary - halfWidth} y={45} width={halfWidth * 2} height={140} rx="8"
            fill="rgba(220,220,255,0.04)" stroke="rgba(200,200,220,0.36)" strokeDasharray="6 4" />

          {/* breakdown electrons - covering all 4 rows from top to bottom (y: 50 to 175) */}
          {isBreakdown && (breakdownType === 'zener' ? (
            Array.from({ length: 16 }).map((_, i) => {
              const progress = ((t * 3 + i * 20) % 300) / 300;
              const x = 120 + progress * 360; // Full width from edge to edge
              const row = i % 4; // 4 rows to cover full height
              const y = 55 + row * 40; // From row 0 at y=55 to row 3 at y=175
              return <circle key={`zener-e-${i}`} cx={x} cy={y} r="4" fill="rgba(100,255,255,1)" filter="url(#intenseGlow)" />;
            })
          ) : (
            Array.from({ length: 20 }).map((_, i) => {
              const wave = Math.floor(i / 5);
              const progress = ((t * 4 + i * 20 + wave * 40) % 400) / 400;
              const x = 120 + progress * 360; // Full width from edge to edge
              const row = i % 4; // 4 rows to cover full height
              const y = 55 + row * 40; // From row 0 at y=55 to row 3 at y=175
              const size = 3 + wave * 0.5;
              return <circle key={`aval-e-${i}`} cx={x} cy={y} r={size} fill={`rgba(255,${200 - wave * 30},100,1)`} filter="url(#intenseGlow)" />;
            })
          ))}

          {/* Multiple small lightning-style sparks across the breakdown region */}
          {isBreakdown && (
            <>
              {[
                { x: 160, y: 50, scale: 0.6, delay: 0 },
                { x: 220, y: 70, scale: 0.7, delay: 50 },
                { x: 280, y: 55, scale: 0.5, delay: 100 },
                { x: 340, y: 65, scale: 0.65, delay: 75 },
                { x: 400, y: 50, scale: 0.55, delay: 25 },
                { x: 180, y: 120, scale: 0.6, delay: 60 },
                { x: 250, y: 130, scale: 0.7, delay: 90 },
                { x: 320, y: 115, scale: 0.5, delay: 40 },
                { x: 380, y: 125, scale: 0.65, delay: 110 },
                { x: 440, y: 110, scale: 0.55, delay: 80 },
              ].map((spark, i) => {
                const flicker = Math.sin((t + spark.delay) * 0.2) > 0.5;
                if (!flicker) return null;
                const wobble = Math.sin(t * 0.15 + i) * 3;
                const s = spark.scale;
                return (
                  <path
                    key={`spark-${i}`}
                    d={`M ${spark.x + wobble} ${spark.y} L ${spark.x + 15 * s + wobble} ${spark.y + 20 * s} L ${spark.x + 8 * s + wobble} ${spark.y + 20 * s} L ${spark.x + 25 * s + wobble} ${spark.y + 45 * s} L ${spark.x + 15 * s + wobble} ${spark.y + 45 * s} L ${spark.x + 30 * s + wobble} ${spark.y + 70 * s}`}
                    stroke="rgba(255,255,200,0.9)"
                    strokeWidth={1.5}
                    fill="none"
                    filter="url(#intenseGlow)"
                  />
                );
              })}
            </>
          )}


          <text x="300" y="240" textAnchor="middle" className={`text-lg font-bold ${isBreakdown ? 'fill-red-400' : 'fill-orange-300'}`}>
            {isBreakdown ? '⚡ BREAKDOWN ⚡' : `Approaching (${Math.round((voltage / breakdownVoltage) * 100)}%)`}
          </text>
          <text x="300" y="265" textAnchor="middle" className="fill-white/60 text-xs">
            {breakdownType === 'zener' ? 'Zener: electron tunneling in heavily doped junction' : 'Avalanche: impact ionization in lightly doped junction'}
          </text>
        </svg>
      </div>
    </div>
  );
}

// --- Tabs wrapper ---
function InteractiveBiasDemo() {
  const [biasMode, setBiasMode] = useState('forward');

  return (
    <div className="space-y-2 h-full flex flex-col">
      <Tabs value={biasMode} onValueChange={(v) => setBiasMode(v)} className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-white/80 border-2 border-slate-300 rounded-xl">
          <TabsTrigger value="forward" className="flex items-center gap-2 py-3 text-slate-600 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-lg">
            <ArrowRight className="w-5 h-5" />
            <span>Forward Bias</span>
          </TabsTrigger>
          <TabsTrigger value="reverse" className="flex items-center gap-2 py-3 text-slate-600 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-lg">
            <ArrowLeft className="w-5 h-5" />
            <span>Reverse Bias</span>
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2 py-3 text-slate-600 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all rounded-lg">
            <Zap className="w-5 h-5" />
            <span>Breakdown</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {biasMode === 'forward' && <ForwardBiasTab />}
      {biasMode === 'reverse' && <ReverseBiasTab />}
      {biasMode === 'breakdown' && <BreakdownTab />}
    </div>
  );
}

// --- Page ---
export default function Diode() {
  const [showEducation, setShowEducation] = useState(false);
  const [openJunction, setOpenJunction] = useState(true);
  const [openBias, setOpenBias] = useState(false);

  return (
    <div className="relative h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #7dd3fc 70%, #38bdf8 100%)' }}>
      {/* Light blue background - no stars or floating elements */}

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
        <EducationalPanel
          isVisible={showEducation}
          onClose={() => setShowEducation(false)}
          title="Explore the PN Junction Diode! 🟣"
          explanation="A diode allows current to flow in one direction. It’s formed by joining P-type and N-type semiconductors, creating a depletion region and a built-in potential barrier."
          formula="I–V Characteristics"
          formulaExplanation="Forward conduction above threshold; reverse leakage until breakdown"
          didYouKnow="Zener diodes are used for voltage regulation by operating in the breakdown region."
          stageColor="capacitor"
        />

        {!showEducation && (
          <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-4 h-full">
            {openJunction && (
              <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-slate-300 p-4 shadow-lg flex flex-col h-full">
                <div className="mb-3 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800">Formation of a PN Junction Diode</h2>
                    <p className="text-sm md:text-base text-slate-600 mt-1">Join P-type and N-type regions to create a depletion zone and internal electric field.</p>
                  </div>
                  <Button size="sm" onClick={() => { setOpenJunction(false); setOpenBias(true); }}>Next</Button>
                </div>
                <PNJunctionIntro />
              </div>
            )}

            {openBias && (
              <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-slate-300 p-4 shadow-lg flex flex-col h-full overflow-auto">
                <InteractiveBiasDemo />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
