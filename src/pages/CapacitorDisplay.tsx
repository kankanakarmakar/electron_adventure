import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import useWebSocketSync from '@/hooks/useWebSocketSync';

interface CapacitorValues {
    voltage: number;
    frequency: number;
}

const CapacitorDisplay = () => {
    const [values, setValues] = useState<CapacitorValues>({
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
                    What are <span className="text-purple-500">Capacitors</span>?
                </h1>
                <p className="text-base md:text-lg text-slate-700 font-bold tracking-wide">
                    Explore How Capacitors Store and Release Energy
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-200">
                    <div className="border-4 border-blue-300 rounded-xl p-8 bg-blue-50 h-96 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block mb-6">
                                <svg width="200" height="200" viewBox="0 0 200 200">
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="#7c3aed" strokeWidth="3" />
                                    <line x1="60" y1="100" x2="140" y2="100" stroke="#7c3aed" strokeWidth="4" />
                                    <line x1="75" y1="75" x2="75" y2="125" stroke="#7c3aed" strokeWidth="3" />
                                    <line x1="125" y1="75" x2="125" y2="125" stroke="#7c3aed" strokeWidth="3" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-purple-600">{values.voltage}V @ {values.frequency}Hz</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl shadow-lg p-6 border-2 border-purple-300">
                    <div className="text-sm font-bold text-purple-700 mb-2 uppercase tracking-wider">Voltage</div>
                    <div className="text-4xl font-black text-purple-600">{values.voltage}V</div>
                </div>

                <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-2xl shadow-lg p-6 border-2 border-pink-300">
                    <div className="text-sm font-bold text-pink-700 mb-2 uppercase tracking-wider">Frequency</div>
                    <div className="text-4xl font-black text-pink-600">{values.frequency}Hz</div>
                </div>
            </div>

            <div className="mt-8 bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6">
                <div className="flex gap-4">
                    <Zap className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-slate-900 mb-2">How It Works</h3>
                        <p className="text-slate-700 text-sm leading-relaxed">
                            Capacitors store electrical energy in an electric field. They allow AC signals to pass while blocking DC. 
                            The capacitor is being driven by {values.voltage}V at {values.frequency}Hz frequency.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CapacitorDisplay;
