import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";

interface ElectricSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit: string;
  color: "voltage" | "resistance" | "current";
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export const ElectricSlider = ({
  value,
  min,
  max,
  step = 1,
  label,
  unit,
  color,
  onChange,
  disabled = false,
  className = "",
}: ElectricSliderProps) => {
  const colorMap = {
    voltage: {
      bg: "bg-voltage/20",
      border: "border-voltage",
      glow: "0 0 20px hsl(var(--voltage) / 0.5)",
      text: "text-voltage",
      track: "bg-voltage",
    },
    resistance: {
      bg: "bg-resistance/20",
      border: "border-resistance",
      glow: "0 0 20px hsl(var(--resistance) / 0.5)",
      text: "text-resistance",
      track: "bg-resistance",
    },
    current: {
      bg: "bg-current/20",
      border: "border-current",
      glow: "0 0 20px hsl(var(--current) / 0.5)",
      text: "text-current",
      track: "bg-current",
    },
  } as const;

  const colors = colorMap[color];
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className={`font-display font-semibold ${colors.text}`}>{label}</span>
        <motion.span
          className={`font-display font-bold text-2xl ${colors.text}`}
          key={value}
          initial={{ scale: 1.2, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {value.toFixed(step < 1 ? 1 : 0)} {unit}
        </motion.span>
      </div>

      <div className="relative">
        <div
          className={`absolute inset-0 rounded-full ${colors.bg} border ${colors.border}`}
          style={{ boxShadow: colors.glow }}
        />
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onValueChange={([v]) => onChange(v)}
          className="relative z-10"
        />
        <motion.div
          className={`absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full ${colors.track} pointer-events-none`}
          style={{ width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
};
