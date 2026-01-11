import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ElectronFlowProps {
  speed: number;
  pipeWidth: number;
  particleCount?: number;
  className?: string;
}

export const ElectronFlow = ({
  speed,
  pipeWidth,
  particleCount = 12,
  className = "",
}: ElectronFlowProps) => {
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    setParticles(Array.from({ length: particleCount }, (_, i) => i));
  }, [particleCount]);

  const duration = 3 / Math.max(speed, 0.1);
  const actualWidth = Math.max(20, Math.min(100, pipeWidth));

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="relative h-16 mx-auto rounded-full transition-all duration-500 overflow-hidden"
        style={{
          width: `${actualWidth}%`,
          background: `linear-gradient(180deg,
            hsl(var(--muted)) 0%,
            hsl(220 20% 12%) 30%,
            hsl(220 20% 8%) 70%,
            hsl(var(--muted)) 100%)`,
          boxShadow: `inset 0 2px 10px rgba(0,0,0,0.5),
                      inset 0 -2px 10px rgba(0,0,0,0.3),
                      0 0 ${20 * speed}px hsl(var(--electron) / ${0.2 * speed})`,
        }}
      >
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: `linear-gradient(180deg,
              transparent 0%,
              hsl(var(--electron) / ${0.05 * speed}) 50%,
              transparent 100%)`,
          }}
        />

        {particles.map((i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 -translate-y-1/2"
            initial={{ x: "-20px", opacity: 0 }}
            animate={{ x: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{
              duration,
              repeat: Infinity,
              delay: (i / particleCount) * duration,
              ease: "linear",
            }}
            style={{ left: 0 }}
          >
            <div
              className="w-3 h-3 rounded-full relative"
              style={{
                background: `radial-gradient(circle,
                  hsl(var(--electron)) 0%,
                  hsl(var(--primary)) 50%,
                  transparent 100%)`,
                boxShadow: `0 0 ${8 + speed * 4}px hsl(var(--electron)),
                            0 0 ${16 + speed * 8}px hsl(var(--electron) / 0.5)`,
              }}
            >
              <div className="absolute inset-1 rounded-full bg-white/80" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-12 bg-gradient-to-r from-muted to-transparent rounded-r-lg" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-12 bg-gradient-to-l from-muted to-transparent rounded-l-lg" />
    </div>
  );
};
