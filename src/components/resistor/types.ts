export type CircuitMode = 'combination' | 'series' | 'parallel';

export interface CircuitValues {
  voltage: number;
  r1: number;
  r2: number;
}

export interface ComputedValues {
  totalResistance: number;
  current: number;
  power: number;
}

export interface Electron {
  id: number;
  x: number;
  y: number;
  pathIndex: number;
  progress: number;
  speed: number;
  branch?: 'top' | 'bottom' | 'main';
}
