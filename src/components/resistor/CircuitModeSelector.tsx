import { CircuitMode } from './types';
import { cn } from '@/lib/utils';

interface CircuitModeSelectorProps {
  mode: CircuitMode;
  onModeChange: (mode: CircuitMode) => void;
}

const modes: { value: CircuitMode; label: string }[] = [
  { value: 'combination', label: 'Simple' },
  { value: 'series', label: 'Series' },
  { value: 'parallel', label: 'Parallel' },
];

export function CircuitModeSelector({ mode, onModeChange }: CircuitModeSelectorProps) {
  return (
    <div className="inline-flex gap-2 bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-xl rounded-full p-1.5 border-2 border-orange-500/30 shadow-2xl shadow-orange-500/20">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onModeChange(m.value)}
          className={cn(
            'relative px-6 py-2.5 rounded-full text-sm font-black transition-all duration-300 tracking-wider uppercase',
            mode === m.value
              ? 'bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white shadow-2xl shadow-orange-500/50 scale-105'
              : 'text-white/60 hover:text-white hover:bg-gradient-to-r hover:from-orange-500/30 hover:to-red-500/30 hover:scale-110 hover:shadow-xl hover:shadow-orange-500/30'
          )}
        >
          <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{m.label}</span>
          {mode !== m.value && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
        </button>
      ))}
    </div>
  );
}
