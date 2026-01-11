import { motion } from "framer-motion";

interface LightBulbProps {
  brightness: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LightBulb = ({ brightness, size = "md", className = "" }: LightBulbProps) => {
  const sizes = {
    sm: { bulb: "w-16 h-20", base: "w-8 h-6" },
    md: { bulb: "w-24 h-32", base: "w-12 h-8" },
    lg: { bulb: "w-32 h-44", base: "w-16 h-10" },
  } as const;

  const { bulb, base } = sizes[size];
  const glowIntensity = Math.max(0, Math.min(1, brightness));
  const isOn = brightness > 0.05;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.div
        className={`${bulb} relative`}
        animate={{ filter: isOn ? `brightness(${1 + glowIntensity * 0.5})` : "brightness(0.7)" }}
        transition={{ duration: 0.3 }}
      >
        {isOn && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: `0 0 ${30 * glowIntensity}px ${20 * glowIntensity}px hsl(45 100% 70% / ${
                glowIntensity * 0.6
              }),
                          0 0 ${60 * glowIntensity}px ${40 * glowIntensity}px hsl(45 100% 60% / ${
                            glowIntensity * 0.4
                          }),
                          0 0 ${100 * glowIntensity}px ${60 * glowIntensity}px hsl(45 100% 50% / ${
                            glowIntensity * 0.2
                          })`,
            }}
            transition={{ duration: 0.3 }}
          />
        )}

        <svg viewBox="0 0 100 130" className="w-full h-full">
          <defs>
            <radialGradient id="bulbGlow" cx="50%" cy="40%" r="50%">
              <stop
                offset="0%"
                stopColor={
                  isOn ? `hsl(45, 100%, ${50 + glowIntensity * 40}%)` : "hsl(220, 10%, 20%)"
                }
              />
              <stop
                offset="60%"
                stopColor={
                  isOn ? `hsl(45, 100%, ${30 + glowIntensity * 30}%)` : "hsl(220, 10%, 15%)"
                }
              />
              <stop
                offset="100%"
                stopColor={isOn ? "hsl(30, 80%, 20%)" : "hsl(220, 15%, 12%)"}
              />
            </radialGradient>
            <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="50%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path
            d="M50 5 C25 5 10 30 10 55 C10 75 25 90 35 100 L35 110 L65 110 L65 100 C75 90 90 75 90 55 C90 30 75 5 50 5"
            fill="url(#bulbGlow)"
            stroke="hsl(220, 15%, 30%)"
            strokeWidth="2"
          />

          <ellipse cx="35" cy="40" rx="15" ry="20" fill="url(#glassShine)" />

          {isOn && (
            <motion.path
              d="M40 70 Q45 60 50 70 Q55 80 60 70"
              fill="none"
              stroke={`hsl(45, 100%, ${60 + glowIntensity * 30}%)`}
              strokeWidth="3"
              strokeLinecap="round"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </svg>
      </motion.div>

      <div
        className={`${base} bg-gradient-to-b from-zinc-500 to-zinc-700 rounded-b-lg relative overflow-hidden`}
        style={{
          background:
            "linear-gradient(180deg, #888 0%, #666 20%, #555 40%, #666 60%, #555 80%, #444 100%)",
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-zinc-800/50"
            style={{ top: `${(i + 1) * 20}%` }}
          />
        ))}
      </div>

      <div className="mt-4 text-center">
        <div className="text-xs text-muted-foreground mb-1">Brightness</div>
        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, hsl(var(--voltage)), hsl(45 100% 70%))" }}
            animate={{ width: `${glowIntensity * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
};
