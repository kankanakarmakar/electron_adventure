import { useState } from "react";
import { motion } from "framer-motion";
import { ElectronFlow } from "./ElectronFlow";
import { LightBulb } from "./LightBulb";
import { ElectricSlider } from "./ElectricSlider";
import { Zap, Info } from "lucide-react";

export const ResistanceGame = () => {
  const [resistance, setResistance] = useState(50);
  const [voltage, setVoltage] = useState(9);

  // Calculate current using Ohm's Law: I = V / R
  const current = voltage / resistance;
  const maxCurrent = 12 / 5; // Max voltage / Min resistance
  const currentRatio = current / maxCurrent;

  const brightness = Math.min(currentRatio, 1);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-6 md:p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-resistance/20 flex items-center justify-center">
          <Zap className="w-7 h-7 text-resistance" />
        </div>
        <div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">What is Resistance?</h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Move the slider to see how resistance affects electron flow
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="mt-6 flex justify-center">
          {/* Increased canvas width slightly so bulb has room */}
          <svg viewBox="0 0 380 320" className="w-full max-w-md h-auto" preserveAspectRatio="xMidYMid meet">
            {/* Battery */}
            <g>
              <rect x="40" y="150" width="50" height="50" rx="6" fill="rgba(50,50,50,0.9)" stroke="rgba(100,100,100,0.7)" strokeWidth="2" />
              <rect x="48" y="142" width="34" height="6" rx="2" fill="rgba(100,100,100,0.8)" />
              {/* Top = + , Bottom = - (correct polarity) */}
              <text x="65" y="165" textAnchor="middle" className="fill-green-400 text-base font-bold">+</text>
              <text x="65" y="188" textAnchor="middle" className="fill-red-400 text-base font-bold">−</text>
              <text x="65" y="215" textAnchor="middle" className="fill-white/70 text-xs">{voltage}V</text>
            </g>

            {/* Top wire from battery + to bulb */}
            {/* Extended path a little to match larger bulb area */}
            <path d="M 90 158 L 200 158 L 200 98 L 250 98" stroke="rgba(100,200,255,0.7)" strokeWidth="3" fill="none" />

            {/* Bottom wire from bulb back to battery - */}
            <path d="M 250 202 L 200 202 L 200 240 L 90 240 L 90 182" stroke="rgba(255,150,100,0.7)" strokeWidth="3" fill="none" />

            {/* Bulb - positioned with more space and larger foreignObject so it won't be cut */}
            <g transform="translate(250, 150)">
              {/* larger box so LightBulb component can fully render */}
              <foreignObject x="-90" y="-100" width="180" height="220">
                <div className="flex items-center justify-center w-full h-full">
                  <LightBulb brightness={brightness} size="md" />
                </div>
              </foreignObject>
            </g>

            {/* Current flow arrows - placed near the wires to visually indicate direction */}
            {brightness > 0.1 && (
              <>
                {/* top (toward bulb) */}
                <polygon points="195,155 200,158 195,161" fill="rgba(100,200,255,0.9)" />
                {/* bottom (return) */}
                <polygon points="205,205 200,208 205,211" fill="rgba(255,150,100,0.9)" />
              </>
            )}
          </svg>
        </div>

        <div className="space-y-6">
          <div className="bg-muted/30 rounded-xl p-6">
            <ElectricSlider
              value={resistance}
              min={5}
              max={100}
              label="Resistance"
              unit="Ω"
              color="resistance"
              onChange={setResistance}
            />
          </div>

          <div className="bg-muted/30 rounded-xl p-6">
            <ElectricSlider
              value={voltage}
              min={1}
              max={12}
              label="Voltage"
              unit="V"
              color="voltage"
              onChange={setVoltage}
            />
          </div>

          <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
            <p className="text-xs text-muted-foreground mb-2">Current (I = V / R):</p>
            <p className="text-2xl font-bold text-primary">{current.toFixed(2)} A</p>
          </div>

          <motion.div
            className="bg-muted/30 rounded-xl p-6"
            key={`${resistance > 50 ? "high" : "low"}-${voltage}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div>
                {current > 1.5 ? (
                  <>
                    <p className="font-semibold text-accent">High Current!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      High voltage and low resistance means lots of electrons flow! The bulb glows <strong>brightly</strong>!
                    </p>
                  </>
                ) : current > 0.5 ? (
                  <>
                    <p className="font-semibold text-voltage">Medium Current</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      A balanced amount of electrons flow through the circuit. The bulb glows at
                      <strong> moderate brightness</strong>.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-resistance">Low Current!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Low voltage or high resistance limits electron flow. Less current means the bulb glows
                      <strong> dimly</strong>.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          <div className="neon-border rounded-xl p-4 bg-primary/5">
            <p className="text-center font-display font-semibold text-primary">🔑 Key Insight</p>
            <p className="text-center text-base md:text-lg text-foreground/80 mt-2">
              Higher voltage OR lower resistance = more current = brighter bulb
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
