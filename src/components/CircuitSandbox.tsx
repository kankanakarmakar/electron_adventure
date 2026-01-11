import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ElectronFlow } from "./ElectronFlow";
import { LightBulb } from "./LightBulb";
import { ElectricSlider } from "./ElectricSlider";
import { CurrentMeter } from "./CurrentMeter";
import { FormulaDisplay } from "./FormulaDisplay";
import { CircuitBoard, Lightbulb as LightbulbIcon } from "lucide-react";

export const CircuitSandbox = () => {
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(20);

  const current = useMemo(() => {
    return resistance > 0 ? voltage / resistance : 0;
  }, [voltage, resistance]);

  const brightness = useMemo(() => {
    return Math.min(1, current / 2);
  }, [current]);

  const electronSpeed = useMemo(() => {
    return Math.max(0.2, Math.min(2, current / 2));
  }, [current]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-6 md:p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
          <CircuitBoard className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">Circuit Sandbox</h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Experiment with voltage and resistance to see real-time changes
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-xl p-5 space-y-6">
            <ElectricSlider
              value={voltage}
              min={1}
              max={24}
              step={0.5}
              label="Voltage"
              unit="V"
              color="voltage"
              onChange={setVoltage}
            />

            <ElectricSlider
              value={resistance}
              min={1}
              max={100}
              label="Resistance"
              unit="Ω"
              color="resistance"
              onChange={setResistance}
            />
          </div>

          <FormulaDisplay voltage={voltage} resistance={resistance} current={current} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-muted/30 rounded-xl p-6 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px)," +
                  "linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-voltage/20 border-2 border-voltage flex items-center justify-center font-display font-bold text-voltage">
                    +
                  </div>
                  <span className="text-xs text-voltage font-medium">{voltage}V</span>
                </div>
              </div>

              <ElectronFlow
                speed={electronSpeed}
                pipeWidth={100 - (resistance / 100) * 60}
                particleCount={12}
                className="my-4"
              />

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-muted border-2 border-muted-foreground/30 flex items-center justify-center font-display font-bold text-muted-foreground">
                    −
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-resistance/20 px-3 py-1 rounded-full">
                  <span className="text-xs text-resistance font-medium">Resistor: {resistance}Ω</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-xl p-6 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4">
                <LightbulbIcon className="w-4 h-4 text-voltage" />
                <span className="text-sm font-medium text-muted-foreground">Light Output</span>
              </div>
              <LightBulb brightness={brightness} size="md" />
            </div>

            <div className="flex flex-col items-center justify-center">
              <CurrentMeter current={current} maxCurrent={5} />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
