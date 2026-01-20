import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import useWebSocketSync from '@/hooks/useWebSocketSync';

interface DiodeValues {
    voltage: number;
    current: number;
}

const DiodeDisplay = () => {
    const [values, setValues] = useState<DiodeValues>({
        voltage: 5,
        current: 0,
    });

    useWebSocketSync({
        screenType: 'display',
        onCircuitStateUpdate: (state) => {
            setValues({
                voltage: state.voltage || 5,
                current: state.current || 0,
            });
        },
    });

    const isDiodeConducting = values.voltage > 0.7;

    return (
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-white p-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
                    What are <span className="text-orange-500">Diodes</span>?
                </h1>
                <p className="text-base md:text-lg text-slate-700 font-bold tracking-wide">
                    Explore How Diodes Control Current Direction
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-200">
                    <div className="border-4 border-blue-300 rounded-xl p-8 bg-blue-50 h-96 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block mb-6">
                                <svg width="250" height="200" viewBox="0 0 250 200">
                                    {/* Diode symbol */}
                                    <line x1="50" y1="100" x2="130" y2="100" stroke="#000" strokeWidth="3" />
                                    <polygon
                                        points="130,70 130,130 180,100"
                                        fill={isDiodeConducting ? '#ff6b35' : '#ccc'}
                                        stroke="#000"
                                        strokeWidth="2"
                                    />
                                    <line x1="180" y1="70" x2="180" y2="130" stroke="#000" strokeWidth="3" />
                                    <line x1="180" y1="100" x2="200" y2="100" stroke="#000" strokeWidth="3" />

                                    {/* Direction indicator */}
                                    {isDiodeConducting && (
                                        <g>
                                            <circle cx="100" cy="100" r="6" fill="#fbbf24" opacity="0.7" />
                                            <circle cx="155" cy="100" r="6" fill="#fbbf24" opacity="0.7" />
                                        </g>
                                    )}
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-orange-600">
                                {isDiodeConducting ? 'ON (Conducting)' : 'OFF (Blocking)'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-orange-300">
                    <div className="text-sm font-bold text-orange-700 mb-2 uppercase tracking-wider">Forward Voltage</div>
                    <div className="text-4xl font-black text-orange-600">{values.voltage}V</div>
                    <div className="text-sm text-orange-600 mt-2">Threshold: 0.7V (Si)</div>
                </div>

                <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-2xl shadow-lg p-6 border-2 border-red-300">
                    <div className="text-sm font-bold text-red-700 mb-2 uppercase tracking-wider">Current</div>
                    <div className="text-4xl font-black text-red-600">{values.current.toFixed(2)}A</div>
                </div>
            </div>

            <div className="mt-8 bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6">
                <div className="flex gap-4">
                    <Zap className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-slate-900 mb-2">How It Works</h3>
                        <p className="text-slate-700 text-sm leading-relaxed">
                            Diodes allow current to flow in one direction only. When the forward voltage exceeds the threshold (~0.7V for silicon),
                            the diode conducts and current flows. When voltage is reversed or below threshold, the diode blocks current.
                            Current is {isDiodeConducting ? 'FLOWING' : 'BLOCKED'}.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiodeDisplay;
