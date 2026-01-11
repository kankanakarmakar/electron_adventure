import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ElectronFlow } from "@/components/ElectronFlow";
import { LightBulb } from "@/components/LightBulb";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

interface LargeCircuitProps {
  mode: "overview" | "series" | "parallel";
}

export const LargeCircuit = ({ mode }: LargeCircuitProps) => {
  const [voltage, setVoltage] = useState(9);
  const [r1, setR1] = useState(50);
  const [r2, setR2] = useState(50);

  const totalResistance = useMemo(() => {
    if (mode === "series") return r1 + r2;
    if (mode === "parallel") return (r1 * r2) / (r1 + r2);
    // combination: one in series with parallel of the other two (approx): R_total = R1 + (R2 || R1)
    return r1; // overview: single resistor focus
  }, [mode, r1, r2]);

  const current = useMemo(() => voltage / Math.max(1, totalResistance), [voltage, totalResistance]);
  const flowSpeed = Math.min(5, Math.max(0.2, current));
  const pipeWidth = Math.min(100, Math.max(40, 40 + current * 30));
  const brightness = Math.min(1, current / 0.6);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <Card className="lg:col-span-8 p-6">
          {/* Realistic circuit visualization using SVG wiring */}
          <div className="relative flex flex-col items-center gap-6">
            <svg viewBox="0 0 900 360" className="w-full h-[320px]">
              {/* Wires */}
              <defs>
                <linearGradient id="wire" x1="0" x2="1">
                  <stop offset="0%" stopColor="#8aa0b6" />
                  <stop offset="100%" stopColor="#5b6a7a" />
                </linearGradient>
              </defs>

              {/* Battery */}
              <rect x="40" y="130" width="60" height="100" rx="8" fill="#4b5563" stroke="#111827" />
              <rect x="52" y="140" width="36" height="80" rx="6" fill="#6b7280" />
              <text x="70" y="190" textAnchor="middle" fill="#e5e7eb" fontSize="14">9V</text>

              {/* Bulb stand-in (socket); actual bulb rendered outside SVG to avoid clipping issues */}
              <rect x="780" y="200" width="24" height="40" rx="4" fill="#9ca3af" />

              {/* Main wire path */}
              <path d="M100 180 H260" stroke="url(#wire)" strokeWidth="8" fill="none" />

              {/* Resistors block */}
              {mode !== "parallel" && (
                // series configuration
                <>
                  <rect x="270" y="160" width="90" height="40" rx="6" fill="#d97706" stroke="#92400e" />
                  <text x="315" y="185" textAnchor="middle" fill="#111827" fontSize="12">R1 {r1.toFixed(0)}Ω</text>
                  <path d="M360 180 H470" stroke="url(#wire)" strokeWidth="8" fill="none" />
                  {mode === "series" && (
                    <>
                      <rect x="480" y="160" width="90" height="40" rx="6" fill="#d97706" stroke="#92400e" />
                      <text x="525" y="185" textAnchor="middle" fill="#111827" fontSize="12">R2 {r2.toFixed(0)}Ω</text>
                      <path d="M570 180 H740" stroke="url(#wire)" strokeWidth="8" fill="none" />
                    </>
                  )}
                  {mode === "overview" && (
                    <path d="M470 180 H740" stroke="url(#wire)" strokeWidth="8" fill="none" />
                  )}
                </>
              )}

              {mode === "parallel" && (
                <>
                  {/* Split */}
                  <path d="M260 180 H360" stroke="url(#wire)" strokeWidth="8" fill="none" />
                  <path d="M360 180 V120 H740" stroke="url(#wire)" strokeWidth="8" fill="none" />
                  <path d="M360 180 V240 H740" stroke="url(#wire)" strokeWidth="8" fill="none" />
                  {/* R1 upper branch */}
                  <rect x="430" y="100" width="90" height="40" rx="6" fill="#d97706" stroke="#92400e" />
                  <text x="475" y="125" textAnchor="middle" fill="#111827" fontSize="12">R1 {r1.toFixed(0)}Ω</text>
                  {/* R2 lower branch */}
                  <rect x="430" y="220" width="90" height="40" rx="6" fill="#d97706" stroke="#92400e" />
                  <text x="475" y="245" textAnchor="middle" fill="#111827" fontSize="12">R2 {r2.toFixed(0)}Ω</text>
                </>
              )}

              {/* To lamp and return */}
              <path d="M740 180 H780 V140" stroke="url(#wire)" strokeWidth="8" fill="none" />
              <path d="M780 220 V300 H100 V180" stroke="url(#wire)" strokeWidth="8" fill="none" />

              {/* Animated electrons on main path */}
              {[...Array(28)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx={100}
                  cy={180}
                  r={4}
                  fill="#7dd3fc"
                  initial={{ opacity: 0, translateX: 0 }}
                  animate={{ opacity: [0, 1, 1, 0], translateX: 680 }}
                  transition={{ duration: 4.2 / flowSpeed, repeat: Infinity, delay: i * 0.12 }}
                />
              ))}

              {/* Animated electrons on branches in parallel */}
              {mode === "parallel" && (
                <>
                  {[...Array(16)].map((_, i) => (
                    <motion.circle
                      key={`u-${i}`}
                      cx={360}
                      cy={180}
                      r={4}
                      fill="#a5b4fc"
                      initial={{ opacity: 0, translateY: 0, translateX: 0 }}
                      animate={{ opacity: [0, 1, 1, 0], translateY: -60, translateX: 380 }}
                      transition={{ duration: 4.2 / (flowSpeed * 0.9), repeat: Infinity, delay: i * 0.18 }}
                    />
                  ))}
                  {[...Array(16)].map((_, i) => (
                    <motion.circle
                      key={`l-${i}`}
                      cx={360}
                      cy={180}
                      r={4}
                      fill="#a5b4fc"
                      initial={{ opacity: 0, translateY: 0, translateX: 0 }}
                      animate={{ opacity: [0, 1, 1, 0], translateY: 60, translateX: 380 }}
                      transition={{ duration: 4.2 / (flowSpeed * 0.9), repeat: Infinity, delay: i * 0.18 }}
                    />
                  ))}
                </>
              )}
            </svg>

            {/* Place the bulb outside of SVG to avoid any foreignObject clipping issues on deployment */}
            <div className="absolute right-6 top-8">
              <LightBulb brightness={brightness} size="lg" />
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6 space-y-6">
          <div>
            <div className="mb-2 font-medium">Voltage: {voltage.toFixed(0)} V</div>
            <Slider value={[voltage]} min={1} max={12} step={1} onValueChange={(v) => setVoltage(v[0])} />
          </div>

          <div>
            <div className="mb-2 font-medium">R1: {r1.toFixed(0)} Ω</div>
            <Slider value={[r1]} min={5} max={200} step={1} onValueChange={(v) => setR1(v[0])} />
          </div>

          {mode !== "overview" && (
            <div>
              <div className="mb-2 font-medium">R2: {r2.toFixed(0)} Ω</div>
              <Slider value={[r2]} min={5} max={200} step={1} onValueChange={(v) => setR2(v[0])} />
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-border p-3">
              <div className="text-muted-foreground">Total Resistance</div>
              <div className="text-lg font-semibold">{totalResistance.toFixed(0)} Ω</div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-muted-foreground">Current (I = V / R)</div>
              <div className="text-lg font-semibold">{current.toFixed(2)} A</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
