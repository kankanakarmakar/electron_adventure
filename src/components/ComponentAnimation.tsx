/**
 * Component Animation Preview - Shows each component responding to voltage/frequency changes
 * Used in Control Panel for live feedback
 */

import React from 'react';

interface ComponentPreviewProps {
    componentType: 'resistor' | 'capacitor' | 'inductor' | 'diode';
    voltage: number;
    frequency: number;
    current: number;
    isActive: boolean;
}

const ComponentAnimation: React.FC<ComponentPreviewProps> = ({
    componentType,
    voltage,
    frequency,
    current,
    isActive,
}) => {
    if (!isActive) return null;

    // Resistor Animation
    if (componentType === 'resistor') {
        const brightness = Math.min(current / 2, 1);
        return (
            <div className="w-full h-64 bg-gradient-to-b from-blue-100 to-blue-50 rounded-xl p-6 border-2 border-blue-300 flex flex-col items-center justify-center gap-4">
                <svg width="200" height="120" viewBox="0 0 200 120">
                    {/* Wire from left */}
                    <line x1="10" y1="60" x2="50" y2="60" stroke="#1e40af" strokeWidth="3" />
                    
                    {/* Resistor symbol */}
                    <rect x="50" y="45" width="100" height="30" fill="none" stroke="#ea580c" strokeWidth="3" />
                    <line x1="55" y1="55" x2="65" y2="55" stroke="#ea580c" strokeWidth="2" />
                    <line x1="65" y1="55" x2="75" y2="65" stroke="#ea580c" strokeWidth="2" />
                    <line x1="75" y1="65" x2="85" y2="55" stroke="#ea580c" strokeWidth="2" />
                    <line x1="85" y1="55" x2="95" y2="65" stroke="#ea580c" strokeWidth="2" />
                    <line x1="95" y1="65" x2="105" y2="55" stroke="#ea580c" strokeWidth="2" />
                    <line x1="105" y1="55" x2="140" y2="55" stroke="#ea580c" strokeWidth="2" />
                    
                    {/* Wire to right */}
                    <line x1="150" y1="60" x2="190" y2="60" stroke="#1e40af" strokeWidth="3" />
                    
                    {/* Electron flow */}
                    {current > 0.1 && (
                        <>
                            <circle cx="80" cy="60" r="4" fill="#fbbf24" opacity={0.8 + brightness * 0.2} />
                            <circle cx="120" cy="60" r="4" fill="#fbbf24" opacity={0.6 + brightness * 0.2} />
                        </>
                    )}
                </svg>

                <div className="text-center">
                    <div className="text-sm text-orange-700 font-bold">RESISTOR</div>
                    <div className="text-2xl font-bold text-orange-600">{voltage}V → {current.toFixed(2)}A</div>
                    <div className="text-xs text-gray-600">Heat: {(current * 100).toFixed(0)}%</div>
                </div>
            </div>
        );
    }

    // Capacitor Animation
    if (componentType === 'capacitor') {
        const charge = Math.min(voltage / 12, 1);
        return (
            <div className="w-full h-64 bg-gradient-to-b from-purple-100 to-purple-50 rounded-xl p-6 border-2 border-purple-300 flex flex-col items-center justify-center gap-4">
                <svg width="200" height="120" viewBox="0 0 200 120">
                    {/* Wire from left */}
                    <line x1="10" y1="60" x2="60" y2="60" stroke="#1e40af" strokeWidth="3" />
                    
                    {/* Capacitor plates */}
                    <line x1="80" y1="30" x2="80" y2="90" stroke="#7c3aed" strokeWidth="4" />
                    <line x1="120" y1="30" x2="120" y2="90" stroke="#7c3aed" strokeWidth="4" />
                    
                    {/* Charge indicator */}
                    {charge > 0.2 && (
                        <>
                            <circle cx="70" cy="60" r="3" fill="#fbbf24" opacity={0.5 + charge * 0.5} />
                            <circle cx="130" cy="60" r="3" fill="#fbbf24" opacity={0.5 + charge * 0.5} />
                        </>
                    )}
                    
                    {/* Wire to right */}
                    <line x1="140" y1="60" x2="190" y2="60" stroke="#1e40af" strokeWidth="3" />
                </svg>

                <div className="text-center">
                    <div className="text-sm text-purple-700 font-bold">CAPACITOR</div>
                    <div className="text-2xl font-bold text-purple-600">{voltage}V @ {frequency}Hz</div>
                    <div className="text-xs text-gray-600">Charge: {(charge * 100).toFixed(0)}%</div>
                </div>
            </div>
        );
    }

    // Inductor Animation
    if (componentType === 'inductor') {
        return (
            <div className="w-full h-64 bg-gradient-to-b from-indigo-100 to-indigo-50 rounded-xl p-6 border-2 border-indigo-300 flex flex-col items-center justify-center gap-4">
                <svg width="200" height="120" viewBox="0 0 200 120">
                    {/* Wire from left */}
                    <line x1="10" y1="60" x2="50" y2="60" stroke="#1e40af" strokeWidth="3" />
                    
                    {/* Coil representation */}
                    <path d="M 60 60 Q 70 40 80 60 Q 90 80 100 60 Q 110 40 120 60 Q 130 80 140 60" 
                          fill="none" stroke="#4f46e5" strokeWidth="3" />
                    
                    {/* Magnetic field */}
                    <circle cx="100" cy="60" r="50" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.3" />
                    {frequency > 30 && (
                        <circle cx="100" cy="60" r="40" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.5" 
                                style={{animation: 'pulse 1s infinite'}} />
                    )}
                    
                    {/* Wire to right */}
                    <line x1="150" y1="60" x2="190" y2="60" stroke="#1e40af" strokeWidth="3" />
                </svg>

                <div className="text-center">
                    <div className="text-sm text-indigo-700 font-bold">INDUCTOR</div>
                    <div className="text-2xl font-bold text-indigo-600">{voltage}V @ {frequency}Hz</div>
                    <div className="text-xs text-gray-600">Reactance Active</div>
                </div>
            </div>
        );
    }

    // Diode Animation
    if (componentType === 'diode') {
        const isConducting = voltage > 0.7;
        return (
            <div className="w-full h-64 bg-gradient-to-b from-orange-100 to-orange-50 rounded-xl p-6 border-2 border-orange-300 flex flex-col items-center justify-center gap-4">
                <svg width="200" height="120" viewBox="0 0 200 120">
                    {/* Wire from left */}
                    <line x1="10" y1="60" x2="60" y2="60" stroke="#1e40af" strokeWidth="3" />
                    
                    {/* Diode symbol */}
                    <polygon points="80,40 80,80 120,60" fill={isConducting ? '#ff6b35' : '#ccc'} 
                             stroke="#000" strokeWidth="2" />
                    <line x1="120" y1="40" x2="120" y2="80" stroke="#000" strokeWidth="3" />
                    
                    {/* Current flow when conducting */}
                    {isConducting && (
                        <circle cx="100" cy="60" r="5" fill="#fbbf24" opacity="0.8" />
                    )}
                    
                    {/* Wire to right */}
                    <line x1="140" y1="60" x2="190" y2="60" stroke="#1e40af" strokeWidth="3" />
                </svg>

                <div className="text-center">
                    <div className="text-sm text-orange-700 font-bold">DIODE</div>
                    <div className="text-2xl font-bold text-orange-600">
                        {isConducting ? 'ON' : 'OFF'}
                    </div>
                    <div className="text-xs text-gray-600">{voltage}V {isConducting ? '(Conducting)' : '(Blocked)'}</div>
                </div>
            </div>
        );
    }

    return null;
};

export default ComponentAnimation;
