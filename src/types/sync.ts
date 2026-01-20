/**
 * Shared types for multi-screen communication and real-time sync
 */

export type CircuitType = 'resistor' | 'capacitor' | 'inductor' | 'diode';

export interface CircuitState {
  type: CircuitType;
  voltage: number;
  current: number;
  resistance: number;
  frequency?: number;
  capacitance?: number;
  inductance?: number;
  timestamp: number;
}

export type MessageType = 
  | 'CIRCUIT_UPDATE'
  | 'CONTROL_ACTION'
  | 'HARDWARE_INPUT'
  | 'SYNC_REQUEST'
  | 'SYNC_RESPONSE'
  | 'SCREEN_REGISTER'
  | 'SCREEN_UNREGISTER';

export interface SyncMessage {
  type: MessageType;
  payload: any;
  timestamp: number;
  sourceScreen: ScreenType;
}

export type ScreenType = 'display' | 'control';

export interface ControlAction {
  action: 'VOLTAGE_CHANGE' | 'FREQUENCY_CHANGE' | 'VALUE_ADJUST' | 'RESET' | 'CIRCUIT_SELECT';
  value?: number;
  circuitType?: CircuitType;
  timestamp: number;
}

export interface HardwareButton {
  id: string;
  name: string;
  type: 'increment' | 'decrement' | 'select' | 'reset' | 'toggle';
  associatedValue?: string; // e.g., 'voltage', 'frequency'
  increment?: number;
}

export interface HardwareButtonPress {
  buttonId: string;
  action: ControlAction;
}

export interface ScreenRegistry {
  displayScreens: string[];
  controlScreens: string[];
}
