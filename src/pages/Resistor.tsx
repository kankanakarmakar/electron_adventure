import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Monitor, Sliders } from 'lucide-react';

const ResistorPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/20 via-slate-50 to-slate-100">
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">
                    Resistor Lab
                </h1>
                <p className="text-lg text-slate-600 max-w-md mx-auto">
                    Select a view to launch the interactive simulation. Open them in separate windows to see real-time sync in action.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
                {/* Circuit View Card */}
                <button
                    onClick={() => navigate('/resistor/circuit')}
                    className="group relative bg-white rounded-3xl p-8 text-left border-2 border-slate-100 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Monitor className="w-32 h-32 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                            <Monitor className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                            Circuit View
                        </h2>
                        <p className="text-slate-500 font-medium">
                            Visualize the electron flow, components, and real-time updates on a large canvas.
                        </p>
                    </div>
                </button>

                {/* Controls View Card */}
                <button
                    onClick={() => navigate('/resistor/controls')}
                    className="group relative bg-white rounded-3xl p-8 text-left border-2 border-slate-100 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Sliders className="w-32 h-32 text-orange-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                            <Sliders className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">
                            Controls Panel
                        </h2>
                        <p className="text-slate-500 font-medium">
                            Adjust voltage and resistance values, switch modes, and control the simulation parameters.
                        </p>
                    </div>
                </button>
            </div>

            <div className="mt-12 flex items-center gap-2 text-sm font-medium text-slate-400">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Socket Server Required (Port 3001)
            </div>
        </div>
    );
};

export default ResistorPage;
