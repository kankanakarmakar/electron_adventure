import { motion } from "framer-motion";

interface FormulaDisplayProps {
  voltage: number;
  resistance: number;
  current: number;
  highlightFormula?: "ohms" | "voltage" | "current";
  className?: string;
}

export const FormulaDisplay = ({
  voltage,
  resistance,
  current,
  highlightFormula = "current",
  className = "",
}: FormulaDisplayProps) => {
  return (
    <div className={`glass rounded-xl p-6 ${className}`}>
      <h3 className="font-display font-bold text-lg mb-4 text-center text-foreground/80">Ohm&apos;s Law</h3>

      <div className="space-y-4">
        <motion.div
          className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-all ${
            highlightFormula === "voltage" ? "bg-voltage/20 neon-border" : "bg-muted/30"
          }`}
          animate={{ scale: highlightFormula === "voltage" ? 1.02 : 1 }}
        >
          <span className="text-voltage font-display font-bold text-xl">V</span>
          <span className="text-muted-foreground">=</span>
          <span className="text-current font-display font-bold text-xl">I</span>
          <span className="text-muted-foreground">×</span>
          <span className="text-resistance font-display font-bold text-xl">R</span>
        </motion.div>

        <motion.div
          className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-all ${
            highlightFormula === "current" ? "bg-current/20 neon-border" : "bg-muted/30"
          }`}
          animate={{ scale: highlightFormula === "current" ? 1.02 : 1 }}
        >
          <span className="text-current font-display font-bold text-xl">I</span>
          <span className="text-muted-foreground">=</span>
          <span className="text-voltage font-display font-bold text-xl">V</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-resistance font-display font-bold text-xl">R</span>
        </motion.div>

        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Voltage</div>
              <motion.div
                key={voltage}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-voltage font-display font-bold text-lg"
              >
                {voltage.toFixed(1)}V
              </motion.div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Current</div>
              <motion.div
                key={current.toFixed(2)}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-current font-display font-bold text-lg"
              >
                {current.toFixed(2)}A
              </motion.div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Resistance</div>
              <motion.div
                key={resistance}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-resistance font-display font-bold text-lg"
              >
                {resistance}Ω
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
