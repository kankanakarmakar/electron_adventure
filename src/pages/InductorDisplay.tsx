import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import useWebSocketSync from '@/hooks/useWebSocketSync';

interface InductorValues {
    voltage: number;
    frequency: number;
}

const InductorDisplay = () => {
    const [values, setValues] = useState<InductorValues>({
        voltage: 12,
        frequency: 50,
    });

    useWebSocketSync({
        screenType: 'display',
        onCircuitStateUpdate: (state) => {
            setValues({
                voltage: state.voltage || 12,
                frequency: state.frequency || 50,
            });
        },
    });

    return (
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-white p-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
                    What are <span className="text-indigo-500">Inductors</span>?
                </h1>
                <p className="text-base md:text-lg text-slate-700 font-bold tracking-wide">
                    Explore How Inductors Store Energy in Magnetic Fields
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-200">
                    <div className="border-4 border-blue-300 rounded-xl p-8 bg-blue-50 h-96 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block mb-6">
                                <svg width="200" height="200" viewBox="0 0 200 200">
                                    {/* Coil representation */}
                                    <path d="M 60 100 Q 80 80 100 100 Q 120 120 140 100" fill="none" stroke="#4f46e5" strokeWidth="4" />
                                    <path d="M 60 120 Q 80 100 100 120 Q 120 140 140 120" fill="none" stroke="#4f46e5" strokeWidth="4" />
                                    <circle cx="100" cy="100" r="60" fill="none" stroke="#4f46e5" strokeWidth="2" opacity="0.3" />
                                    {/* Magnetic field lines */}
                                    <line x1="30" y1="100" x2="50" y2="100" stroke="#6366f1" strokeWidth="1" opacity="0.5" />
                                    <line x1="150" y1="100" x2="170" y2="100" stroke="#6366f1" strokeWidth="1" opacity="0.5" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-indigo-600">{values.voltage}V @ {values.frequency}Hz</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-indigo-300">
                    <div className="text-sm font-bold text-indigo-700 mb-2 uppercase tracking-wider">Voltage</div>
                    <div className="text-4xl font-black text-indigo-600">{values.voltage}V</div>
                </div>

                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow-lg p-6 border-2 border-blue-300">
                    <div className="text-sm font-bold text-blue-700 mb-2 uppercase tracking-wider">Frequency</div>
                    <div className="text-4xl font-black text-blue-600">{values.frequency}Hz</div>
                </div>
            </div>

            <div className="mt-8 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg p-6">
                <div className="flex gap-4">
                    <Zap className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-slate-900 mb-2">How It Works</h3>
                        <p className="text-slate-700 text-sm leading-relaxed">
                            Inductors store energy in a magnetic field created by current flowing through a coil. They oppose changes in current.
                            The inductor is being driven by {values.voltage}V at {values.frequency}Hz frequency.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InductorDisplay;
