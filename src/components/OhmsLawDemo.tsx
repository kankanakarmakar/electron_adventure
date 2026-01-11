import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ElectricSlider } from "./ElectricSlider";
import { BookOpen, TrendingUp } from "lucide-react";

export const OhmsLawDemo = () => {
  const [voltage, setVoltage] = useState(10);
  const [resistance, setResistance] = useState(10);

  const current = useMemo(() => {
    return resistance > 0 ? voltage / resistance : 0;
  }, [voltage, resistance]);

  const graphPoints = useMemo(() => {
    const points = [] as { v: number; i: number }[];
    for (let i = 0; i <= 24; i += 2) {
      points.push({ v: i, i: i / resistance });
    }
    return points;
  }, [resistance]);

  const maxI = 24 / resistance;
  const currentPoint = { v: voltage, i: current };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-6 md:p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-voltage/20 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-voltage" />
        </div>
        <div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">Ohm&apos;s Law Visualized</h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Ohm&apos;s Law states that <span className="font-semibold text-voltage">V = I × R</span> — voltage equals current times resistance.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-muted/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">V-I Characteristic</span>
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Slope = 1/R = {(1 / resistance).toFixed(3)}</span>
            </div>
          </div>

          <div className="relative aspect-square max-w-sm mx-auto">
            <svg viewBox="0 0 300 300" className="w-full h-full">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path
                    d="M 30 0 L 0 0 0 30"
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect x="50" y="20" width="240" height="240" fill="url(#grid)" />

              <line x1="50" y1="260" x2="290" y2="260" stroke="hsl(var(--foreground))" strokeWidth="2" />
              <line x1="50" y1="260" x2="50" y2="20" stroke="hsl(var(--foreground))" strokeWidth="2" />

              <text
                x="170"
                y="290"
                fill="white"
                fontSize="14"
                textAnchor="middle"
                fontWeight="bold"
              >
                Voltage (V)
              </text>
              <text
                x="15"
                y="140"
                fill="white"
                fontSize="14"
                textAnchor="middle"
                fontWeight="bold"
                transform="rotate(-90, 15, 140)"
              >
                Current (A)
              </text>

              {[0, 6, 12, 18, 24].map((v, i) => (
                <g key={`v-${i}`}>
                  <line
                    x1={50 + (v / 24) * 240}
                    y1="260"
                    x2={50 + (v / 24) * 240}
                    y2="265"
                    stroke="hsl(var(--foreground))"
                  />
                  <text
                    x={50 + (v / 24) * 240}
                    y="278"
                    fill="hsl(var(--muted-foreground))"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {v}
                  </text>
                </g>
              ))}

              {[0, 0.5, 1, 1.5, 2].map((i, idx) => {
                const scaledI = Math.min(i, maxI);
                const y = 260 - (scaledI / Math.max(2, maxI)) * 240;
                if (y < 20) return null;
                return (
                  <g key={`i-${idx}`}>
                    <line x1="45" y1={y} x2="50" y2={y} stroke="hsl(var(--foreground))" />
                    <text
                      x="40"
                      y={y + 3}
                      fill="hsl(var(--muted-foreground))"
                      fontSize="10"
                      textAnchor="end"
                    >
                      {i}
                    </text>
                  </g>
                );
              })}

              <motion.line
                x1="50"
                y1="260"
                x2={50 + 240}
                y2={260 - (maxI / Math.max(2, maxI)) * 240}
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />

              <motion.g
                animate={{
                  cx: 50 + (currentPoint.v / 24) * 240,
                  cy: 260 - (currentPoint.i / Math.max(2, maxI)) * 240,
                }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <motion.circle
                  cx={50 + (currentPoint.v / 24) * 240}
                  cy={Math.max(20, 260 - (currentPoint.i / Math.max(2, maxI)) * 240)}
                  r="15"
                  fill="hsl(var(--primary) / 0.3)"
                  animate={{ r: [15, 20, 15] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <circle
                  cx={50 + (currentPoint.v / 24) * 240}
                  cy={Math.max(20, 260 - (currentPoint.i / Math.max(2, maxI)) * 240)}
                  r="8"
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                />
              </motion.g>

              <motion.line
                x1={50 + (currentPoint.v / 24) * 240}
                y1={Math.max(20, 260 - (currentPoint.i / Math.max(2, maxI)) * 240)}
                x2={50 + (currentPoint.v / 24) * 240}
                y2="260"
                stroke="hsl(var(--voltage))"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <motion.line
                x1="50"
                y1={Math.max(20, 260 - (currentPoint.i / Math.max(2, maxI)) * 240)}
                x2={50 + (currentPoint.v / 24) * 240}
                y2={Math.max(20, 260 - (currentPoint.i / Math.max(2, maxI)) * 240)}
                stroke="hsl(var(--current))"
                strokeWidth="1"
                strokeDasharray="4"
              />
            </svg>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            The slope of the line shows how easily current flows. Lower resistance = steeper slope!
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-muted/30 rounded-xl p-5 space-y-6">
            <ElectricSlider
              value={voltage}
              min={0}
              max={24}
              step={1}
              label="Voltage"
              unit="V"
              color="voltage"
              onChange={setVoltage}
            />

            <ElectricSlider
              value={resistance}
              min={5}
              max={50}
              label="Resistance"
              unit="Ω"
              color="resistance"
              onChange={setResistance}
            />

            <div className="pt-4 border-t border-border/50">
              <div className="text-sm text-muted-foreground mb-2">Calculated Current:</div>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-4xl text-current">{current.toFixed(2)}</span>
                <span className="text-xl text-muted-foreground">Amperes</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <motion.div
              className="bg-voltage/10 border border-voltage/30 rounded-xl p-4"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <p className="font-semibold text-voltage mb-1">⚡ Voltage pushes electrons</p>
              <p className="text-sm text-foreground/70">
                Think of voltage like water pressure. Higher pressure pushes more water through a pipe!
              </p>
            </motion.div>

            <motion.div
              className="bg-resistance/10 border border-resistance/30 rounded-xl p-4"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="font-semibold text-resistance mb-1">🚧 Resistance slows them down</p>
              <p className="text-sm text-foreground/70">
                Resistance is like a narrow section in a pipe—it makes it harder for electrons to flow through.
              </p>
            </motion.div>

            <motion.div
              className="bg-current/10 border border-current/30 rounded-xl p-4"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="font-semibold text-current mb-1">🌊 Current is the flow rate</p>
              <p className="text-sm text-foreground/70">
                Current measures how many electrons pass by each second. More flow = more current!
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
