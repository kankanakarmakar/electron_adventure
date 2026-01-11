import { Minus, Plus } from 'lucide-react';
import React from 'react';
import { CircuitValues, ComputedValues } from './types';
import { cn } from '@/lib/utils';

interface ValuesPanelProps {
  values: CircuitValues;
  computed: ComputedValues;
  onValuesChange: (values: CircuitValues) => void;
}

interface ValueControlProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  color: 'blue' | 'orange' | 'green';
}

function ValueControl({ label, value, unit, min, max, step, onChange, color }: ValueControlProps) {
  const colorClasses = {
    blue: 'bg-primary/10 text-primary border-primary/20',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  };

  const buttonClasses = {
    blue: 'hover:bg-primary/20 active:bg-primary/30 text-primary',
    orange: 'hover:bg-orange-100 active:bg-orange-200 text-orange-600',
    green: 'hover:bg-emerald-100 active:bg-emerald-200 text-emerald-600',
  };

  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const key = e.key || '';
    const code = (e as any).code || '';
    const keyCode = (e as any).keyCode || 0;

    const increase = key === 'PageUp' || code === 'PageUp' || key === 'ArrowUp' || keyCode === 33 || keyCode === 38;
    const decrease = key === 'PageDown' || code === 'PageDown' || key === 'ArrowDown' || keyCode === 34 || keyCode === 40;
    const toMin = key === 'Home' || (code === 'Home');
    const toMax = key === 'End' || (code === 'End');

    if (increase || decrease || toMin || toMax) {
      e.preventDefault();
      if (toMin) return onChange(min);
      if (toMax) return onChange(max);
      if (increase) return onChange(Math.min(max, value + step));
      if (decrease) return onChange(Math.max(min, value - step));
    }
  };

  return (
    <div className="flex items-center justify-between gap-1.5">
      <span className="text-xs font-bold text-muted-foreground w-12">{label}</span>
      <div
        role="spinbutton"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        onKeyDown={onKeyDown}
        className={cn('flex items-center gap-0.5 rounded-lg border px-0.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-offset-1', colorClasses[color])}
      >
        <button
          type="button"
          onClick={decrement}
          className={cn('w-6 h-6 rounded flex items-center justify-center transition-colors', buttonClasses[color])}
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-sm font-bold w-14 text-center tabular-nums">
          {value}{unit}
        </span>
        <button
          type="button"
          onClick={increment}
          className={cn('w-6 h-6 rounded flex items-center justify-center transition-colors', buttonClasses[color])}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

interface ComputedDisplayProps {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
}

function ComputedDisplay({ label, value, unit, highlight }: ComputedDisplayProps) {
  return (
    <div className={cn(
      'flex items-center justify-between px-3 py-2 rounded-lg',
      highlight ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/60'
    )}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn(
        'text-sm font-bold tabular-nums',
        highlight ? 'text-primary' : 'text-foreground'
      )}>
        {value} {unit}
      </span>
    </div>
  );
}

export function ValuesPanel({ values, computed, onValuesChange }: ValuesPanelProps) {
  return (
    <div className="space-y-1.5">
      <ValueControl
        label="Voltage"
        value={values.voltage}
        unit="V"
        min={1}
        max={24}
        step={1}
        onChange={(v) => onValuesChange({ ...values, voltage: v })}
        color="blue"
      />

      <ValueControl
        label="R1"
        value={values.r1}
        unit="Ω"
        min={1}
        max={100}
        step={5}
        onChange={(v) => onValuesChange({ ...values, r1: v })}
        color="orange"
      />

      <ValueControl
        label="R2"
        value={values.r2}
        unit="Ω"
        min={1}
        max={100}
        step={5}
        onChange={(v) => onValuesChange({ ...values, r2: v })}
        color="orange"
      />

      {/* Computed Values - Highlighted Display */}
      <div className="pt-2 mt-2 border-t border-slate-300 space-y-1.5">
        {/* Total Resistance - Highlighted Box */}
        <div className="flex justify-between items-center bg-gradient-to-r from-orange-100 to-amber-50 border-2 border-orange-400 rounded-lg px-2 py-1.5 shadow-md">
          <div className="flex flex-col">
            <span className="text-orange-800 font-bold text-xs">Total R:</span>
            <span className="text-[9px] text-orange-600 font-mono">R = R₁ + R₂</span>
          </div>
          <span className="font-black text-orange-700 text-base tracking-wide">{computed.totalResistance}Ω</span>
        </div>
        {/* Current - Highlighted Box */}
        <div className="flex justify-between items-center bg-gradient-to-r from-blue-100 to-cyan-50 border-2 border-blue-400 rounded-lg px-2 py-1.5 shadow-md">
          <div className="flex flex-col">
            <span className="text-blue-800 font-bold text-xs">Current:</span>
            <span className="text-[9px] text-blue-600 font-mono">I = V/R</span>
          </div>
          <span className="font-black text-blue-700 text-base tracking-wide">{computed.current}A</span>
        </div>
        {/* Power - Highlighted Box */}
        <div className="flex justify-between items-center bg-gradient-to-r from-emerald-100 to-green-50 border-2 border-emerald-500 rounded-lg px-2 py-1.5 shadow-md">
          <div className="flex flex-col">
            <span className="text-emerald-800 font-bold text-xs">Power:</span>
            <span className="text-[9px] text-emerald-600 font-mono">P = V × I</span>
          </div>
          <span className="font-black text-emerald-700 text-base tracking-wide">{computed.power}W</span>
        </div>
      </div>
    </div>
  );
}
