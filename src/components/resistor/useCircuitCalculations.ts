import { useMemo } from 'react';
import { CircuitMode, CircuitValues, ComputedValues } from './types';

export function useCircuitCalculations(mode: CircuitMode, values: CircuitValues): ComputedValues {
  return useMemo(() => {
    let totalResistance: number;

    switch (mode) {
      case 'series':
        totalResistance = values.r1 + values.r2;
        break;
      case 'parallel':
        totalResistance = 1 / (1 / values.r1 + 1 / values.r2);
        break;
      case 'combination':
      default:
        // Simple circuit: just R1
        totalResistance = values.r1;
        break;
    }

    const current = values.voltage / totalResistance;
    const power = values.voltage * current;

    return {
      totalResistance: Number(totalResistance.toFixed(2)),
      current: Number(current.toFixed(2)),
      power: Number(power.toFixed(2)),
    };
  }, [mode, values]);
}
