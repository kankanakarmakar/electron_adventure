import { motion } from "framer-motion";

interface CurrentMeterProps {
  current: number;
  maxCurrent?: number;
  className?: string;
}

export const CurrentMeter = ({ current, maxCurrent = 10, className = "" }: CurrentMeterProps) => {
  const percentage = Math.min(100, (current / maxCurrent) * 100);
  const angle = -90 + (percentage * 180) / 100;

  return (
    <div className={`glass rounded-xl p-4 ${className}`}>
      <h4 className="font-display font-semibold text-sm text-center mb-2 text-muted-foreground">Current Flow</h4>

      <div className="relative w-32 h-20 mx-auto">
        <svg viewBox="0 0 100 60" className="w-full h-full">
          <path
            d="M10 55 A40 40 0 0 1 90 55"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            strokeLinecap="round"
          />

          <motion.path
            d="M10 55 A40 40 0 0 1 90 55"
            fill="none"
            stroke="url(#meterGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="126"
            initial={{ strokeDashoffset: 126 }}
            animate={{ strokeDashoffset: 126 - (percentage * 126) / 100 }}
            transition={{ duration: 0.3 }}
          />

          <defs>
            <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--accent))" />
              <stop offset="50%" stopColor="hsl(var(--current))" />
              <stop offset="100%" stopColor="hsl(var(--voltage))" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((tick, i) => {
            const tickAngle = (-90 + (tick * 180) / 100) * (Math.PI / 180);
            const x1 = 50 + 35 * Math.cos(tickAngle);
            const y1 = 55 + 35 * Math.sin(tickAngle);
            const x2 = 50 + 42 * Math.cos(tickAngle);
            const y2 = 55 + 42 * Math.sin(tickAngle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(var(--foreground) / 0.3)"
                strokeWidth="1"
              />
            );
          })}

          <motion.g
            animate={{ rotate: angle }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            style={{ transformOrigin: "50px 55px" }}
          >
            <line
              x1="50"
              y1="55"
              x2="50"
              y2="20"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="50" cy="55" r="4" fill="hsl(var(--primary))" />
          </motion.g>
        </svg>
      </div>

      <motion.div
        className="text-center mt-2"
        key={current.toFixed(2)}
        initial={{ scale: 1.1, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <span className="font-display font-bold text-2xl text-current">{current.toFixed(2)}</span>
        <span className="text-muted-foreground ml-1">A</span>
      </motion.div>
    </div>
  );
};
