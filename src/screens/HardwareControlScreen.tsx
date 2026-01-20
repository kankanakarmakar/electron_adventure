/**
 * Hardware Control Screen Component
 * Pure control panel interface with keyboard support and real-time value display
 * NO circuits, NO animations - ONLY hardware controls
 * Keyboard shortcuts:
 * - Arrow Up/Down: Voltage +/-
 * - Page Up/Page Down: Frequency +/-
 * - 1-4: Circuit selection (Resistor, Capacitor, Inductor, Diode)
 * - R: Reset all values
 */

import React, { useState, useEffect, useCallback } from 'react';
import useWebSocketSync from '@/hooks/useWebSocketSync';
import { ControlAction, CircuitType } from '@/types/sync';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Keyboard } from 'lucide-react';

interface HardwareButton {
  id: string;
  label: string;
  icon?: string;
  action: 'increment' | 'decrement' | 'select' | 'reset';
  parameter?: string;
  increment?: number;
  circuitType?: CircuitType;
  color?: string;
}

const HardwareControlScreen: React.FC = () => {
  const [currentCircuit, setCurrentCircuit] = useState<CircuitType>('resistor');
  const [displayValues, setDisplayValues] = useState({
    voltage: 5,
    frequency: 50,
    current: 0,
  });
  const [lastKeyPress, setLastKeyPress] = useState<string>('');

  const {
    isConnected,
    screenId,
    sendControlAction,
    broadcastCircuitState,
  } = useWebSocketSync({
    screenType: 'control',
    onCircuitStateUpdate: (state) => {
      setDisplayValues({
        voltage: state.voltage,
        frequency: state.frequency || 50,
        current: state.current,
      });
    },
  });

  // Hardware button configurations
  const hardwareButtons: HardwareButton[] = [
    // Voltage control
    {
      id: 'voltage-inc',
      label: 'Voltage +',
      action: 'increment',
      parameter: 'voltage',
      increment: 1,
      color: 'bg-blue-500',
    },
    {
      id: 'voltage-dec',
      label: 'Voltage -',
      action: 'decrement',
      parameter: 'voltage',
      increment: 1,
      color: 'bg-blue-400',
    },
    // Frequency control
    {
      id: 'frequency-inc',
      label: 'Frequency +',
      action: 'increment',
      parameter: 'frequency',
      increment: 10,
      color: 'bg-green-500',
    },
    {
      id: 'frequency-dec',
      label: 'Frequency -',
      action: 'decrement',
      parameter: 'frequency',
      increment: 10,
      color: 'bg-green-400',
    },
    // Circuit selection
    {
      id: 'select-resistor',
      label: 'Resistor',
      action: 'select',
      circuitType: 'resistor',
      color: 'bg-purple-500',
    },
    {
      id: 'select-capacitor',
      label: 'Capacitor',
      action: 'select',
      circuitType: 'capacitor',
      color: 'bg-purple-500',
    },
    {
      id: 'select-inductor',
      label: 'Inductor',
      action: 'select',
      circuitType: 'inductor',
      color: 'bg-purple-500',
    },
    {
      id: 'select-diode',
      label: 'Diode',
      action: 'select',
      circuitType: 'diode',
      color: 'bg-purple-500',
    },
    // Reset
    {
      id: 'reset',
      label: 'Reset All',
      action: 'reset',
      color: 'bg-red-500',
    },
  ];

  const handleButtonPress = (button: HardwareButton) => {
    const action: ControlAction = {
      timestamp: Date.now(),
      action: button.action.toUpperCase() as any,
      value: button.increment,
    };

    if (button.parameter) {
      action.action = `${button.parameter.toUpperCase()}_CHANGE` as any;
    }

    if (button.circuitType) {
      action.circuitType = button.circuitType;
      setCurrentCircuit(button.circuitType);
    }

    sendControlAction(action);
  };

  // Keyboard event handler
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isConnected) return;

    const key = event.key.toUpperCase();
    let handled = false;

    // Voltage control: Arrow Up/Down
    if (key === 'ARROWUP') {
      handleButtonPress(hardwareButtons.find(b => b.id === 'voltage-inc')!);
      setLastKeyPress('Voltage ↑');
      handled = true;
    } else if (key === 'ARROWDOWN') {
      handleButtonPress(hardwareButtons.find(b => b.id === 'voltage-dec')!);
      setLastKeyPress('Voltage ↓');
      handled = true;
    }
    // Frequency control: Page Up/Down
    else if (key === 'PAGEUP') {
      handleButtonPress(hardwareButtons.find(b => b.id === 'frequency-inc')!);
      setLastKeyPress('Frequency ↑');
      handled = true;
    } else if (key === 'PAGEDOWN') {
      handleButtonPress(hardwareButtons.find(b => b.id === 'frequency-dec')!);
      setLastKeyPress('Frequency ↓');
      handled = true;
    }
    // Circuit selection: 1-4
    else if (key === '1') {
      handleButtonPress(hardwareButtons.find(b => b.id === 'select-resistor')!);
      setLastKeyPress('Circuit: Resistor');
      handled = true;
    } else if (key === '2') {
      handleButtonPress(hardwareButtons.find(b => b.id === 'select-capacitor')!);
      setLastKeyPress('Circuit: Capacitor');
      handled = true;
    } else if (key === '3') {
      handleButtonPress(hardwareButtons.find(b => b.id === 'select-inductor')!);
      setLastKeyPress('Circuit: Inductor');
      handled = true;
    } else if (key === '4') {
      handleButtonPress(hardwareButtons.find(b => b.id === 'select-diode')!);
      setLastKeyPress('Circuit: Diode');
      handled = true;
    }
    // Reset: R key
    else if (key === 'R') {
      handleButtonPress(hardwareButtons.find(b => b.id === 'reset')!);
      setLastKeyPress('Reset All');
      handled = true;
    }

    if (handled) {
      event.preventDefault();
    }
  }, [isConnected]);

  // Setup keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Professional Header */}
        <div className="mb-8 border-b border-slate-700 pb-6">
          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
            <div>
              <h1 className="text-5xl font-bold mb-2">Hardware Control Panel</h1>
              <p className="text-gray-400">Real-time circuit control and synchronization</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg">
                {isConnected ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-500" />
                    <span className="text-green-400 font-semibold">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-500" />
                    <span className="text-red-400 font-semibold">Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Current Values */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6 text-center">Live Values</h2>
              
              {/* Voltage Value */}
              <div className="mb-6 text-center pb-6 border-b border-slate-700">
                <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider">Voltage</p>
                <p className="text-5xl font-bold text-blue-400">{displayValues.voltage.toFixed(1)}</p>
                <p className="text-slate-400 text-sm mt-2">Volts</p>
              </div>

              {/* Current Value */}
              <div className="mb-6 text-center pb-6 border-b border-slate-700">
                <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider">Current</p>
                <p className="text-5xl font-bold text-yellow-400">{displayValues.current.toFixed(2)}</p>
                <p className="text-slate-400 text-sm mt-2">Amps</p>
              </div>

              {/* Frequency Value */}
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider">Frequency</p>
                <p className="text-5xl font-bold text-green-400">{displayValues.frequency.toFixed(0)}</p>
                <p className="text-slate-400 text-sm mt-2">Hz</p>
              </div>
            </Card>
          </div>

          {/* Right Content - Controls */}
          <div className="lg:col-span-3">
            {/* Current Circuit Badge */}
            <Card className="bg-slate-800 border-slate-700 p-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Active Circuit</h3>
                <Badge className="text-lg px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-500">
                  {currentCircuit.toUpperCase()}
                </Badge>
              </div>
            </Card>

            {/* Voltage Controls Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded"></div>
                Voltage Control
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {hardwareButtons
                  .filter(b => ['voltage-inc', 'voltage-dec'].includes(b.id))
                  .map(button => (
                    <button
                      key={button.id}
                      onClick={() => handleButtonPress(button)}
                      disabled={!isConnected}
                      className={`
                        ${button.color} hover:shadow-lg disabled:opacity-40 
                        text-white font-bold py-6 px-8 rounded-xl text-2xl
                        transition-all duration-200 active:scale-95 transform
                        focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-900
                        disabled:cursor-not-allowed
                      `}
                    >
                      {button.label}
                    </button>
                  ))}
              </div>
            </div>

            {/* Frequency Controls Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-green-500 rounded"></div>
                Frequency Control
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {hardwareButtons
                  .filter(b => ['frequency-inc', 'frequency-dec'].includes(b.id))
                  .map(button => (
                    <button
                      key={button.id}
                      onClick={() => handleButtonPress(button)}
                      disabled={!isConnected}
                      className={`
                        ${button.color} hover:shadow-lg disabled:opacity-40 
                        text-white font-bold py-6 px-8 rounded-xl text-2xl
                        transition-all duration-200 active:scale-95 transform
                        focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-900
                        disabled:cursor-not-allowed
                      `}
                    >
                      {button.label}
                    </button>
                  ))}
              </div>
            </div>

            {/* Circuit Selection Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-500 rounded"></div>
                Select Circuit
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {hardwareButtons
                  .filter(b => b.action === 'select')
                  .map(button => (
                    <button
                      key={button.id}
                      onClick={() => handleButtonPress(button)}
                      disabled={!isConnected}
                      className={`
                        ${
                          button.circuitType === currentCircuit
                            ? 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-500/50 scale-105 ' + button.color
                            : button.color + ' hover:shadow-md'
                        }
                        disabled:opacity-40 
                        text-white font-bold py-5 px-6 rounded-lg text-lg
                        transition-all duration-200 active:scale-95 transform
                        focus:outline-none
                        disabled:cursor-not-allowed
                      `}
                    >
                      {button.label}
                    </button>
                  ))}
              </div>
            </div>

            {/* Reset Button - Full Width */}
            <div className="pt-6 border-t border-slate-700">
              {hardwareButtons
                .filter(b => b.action === 'reset')
                .map(button => (
                  <button
                    key={button.id}
                    onClick={() => handleButtonPress(button)}
                    disabled={!isConnected}
                    className={`
                      w-full ${button.color} hover:shadow-xl disabled:opacity-40 
                      text-white font-bold py-6 px-8 rounded-xl text-2xl
                      transition-all duration-200 active:scale-95 transform
                      focus:outline-none focus:ring-4 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-slate-900
                      disabled:cursor-not-allowed
                    `}
                  >
                    🔄 {button.label}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div className="mt-12 pt-6 border-t border-slate-700 text-center">
          <p className="text-slate-400 text-sm">
            {isConnected ? '✅ Control Panel connected to Display Screen' : '⚠️ Display Screen disconnected'}
          </p>
          <p className="text-slate-500 text-xs mt-2">All changes sync in real-time (latency &lt; 200ms)</p>
          
          {/* Keyboard Shortcuts Help */}
          <Card className="bg-slate-800 border-slate-700 mt-6 p-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-3 justify-center">
              <Keyboard className="w-4 h-4 text-slate-400" />
              <p className="text-slate-300 font-semibold">Keyboard Shortcuts</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-400">
              <div>↑↓ = Voltage ±</div>
              <div>PgUp/Dn = Freq ±</div>
              <div>1-4 = Select</div>
              <div>R = Reset</div>
            </div>
            {lastKeyPress && (
              <p className="text-yellow-400 text-sm mt-3 font-mono">Last: {lastKeyPress}</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HardwareControlScreen;
