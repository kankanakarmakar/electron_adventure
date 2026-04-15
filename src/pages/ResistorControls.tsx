import React, { useState, useEffect, useCallback } from 'react';
import { Zap } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3002/resistor');
type CircuitMode = 'simple' | 'series' | 'parallel';
interface ResistorValues { voltage: number; r1: number; r2: number; }
type FC = 'voltage' | 'r1' | 'r2';

const CTRL = [
    { key: 'voltage' as FC, label: 'Voltage',     kbd: 'A', unit: 'V', color: 'text-purple-600', accent: 'accent-purple-600', min: 1,  max: 24,  step: 1, lo: '1V',  hi: '24V'  },
    { key: 'r1'     as FC, label: 'Resistor R₁',  kbd: 'B', unit: 'Ω', color: 'text-red-600',    accent: 'accent-red-600',    min: 1,  max: 100, step: 5, lo: '1Ω',  hi: '100Ω' },
    { key: 'r2'     as FC, label: 'Resistor R₂',  kbd: 'C', unit: 'Ω', color: 'text-orange-600', accent: 'accent-orange-600', min: 1,  max: 100, step: 5, lo: '1Ω',  hi: '100Ω' },
];

export default function ResistorControls() {
    const [mode, setMode]     = useState<CircuitMode>('simple');
    const [val, setVal]       = useState<ResistorValues>({ voltage: 12, r1: 10, r2: 20 });
    const [connected, setCon] = useState(false);
    const [focus, setFocus]   = useState<FC>('voltage');

    useEffect(() => {
        socket.on('connect', () => setCon(true));
        socket.on('disconnect', () => setCon(false));
        socket.on('initialState', (s: any) => { if (s.mode) setMode(s.mode); if (s.values) setVal(s.values); });
        socket.on('stateUpdated', (s: any) => { if (s.mode) setMode(s.mode); if (s.values) setVal(s.values); });
        return () => { socket.off('connect'); socket.off('disconnect'); socket.off('initialState'); socket.off('stateUpdated'); };
    }, []);

    const emit = useCallback((m?: CircuitMode, v?: ResistorValues) => {
        const p: any = {};
        if (m) { setMode(m); p.mode = m; }
        if (v) { setVal(v); p.values = v; }
        socket.emit('updateState', p);
    }, []);

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === '1') emit('simple');
            else if (e.key === '2') emit('series');
            else if (e.key === '3') emit('parallel');

            const k = e.key.toLowerCase();
            if (k === 'a') { setFocus('voltage'); return; }
            if (k === 'b') { setFocus('r1');      return; }
            if (k === 'c') { if (mode !== 'simple') setFocus('r2'); return; }

            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const d = e.key === 'ArrowUp' ? 1 : -1;
                const c = CTRL.find(x => x.key === focus)!;
                const cur = focus === 'voltage' ? val.voltage : focus === 'r1' ? val.r1 : val.r2;
                const next = Math.max(c.min, Math.min(c.max, cur + d * c.step));
                if (focus === 'voltage') emit(undefined, { ...val, voltage: next });
                else if (focus === 'r1') emit(undefined, { ...val, r1: next });
                else if (focus === 'r2' && mode !== 'simple') emit(undefined, { ...val, r2: next });
            }
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [emit, val, mode, focus]);

    const totalR = mode === 'simple' ? val.r1 : mode === 'series' ? val.r1 + val.r2 : (val.r1 * val.r2) / (val.r1 + val.r2);
    const I = totalR > 0 ? val.voltage / totalR : 0;
    const P = totalR > 0 ? (val.voltage * val.voltage) / totalR : 0;
    const getV = (k: FC) => k === 'voltage' ? val.voltage : k === 'r1' ? val.r1 : val.r2;
    const onChange = (k: FC, v: number) => {
        if (k === 'voltage') emit(undefined, { ...val, voltage: v });
        else if (k === 'r1') emit(undefined, { ...val, r1: v });
        else emit(undefined, { ...val, r2: v });
    };

    return (
        <div className="h-screen w-full bg-slate-100 flex flex-col overflow-hidden">
            {/* ── Header ── */}
            <header className="bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 text-white flex items-center justify-between shadow flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Zap className="w-4 h-4" fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-base font-black leading-none">Resistor Controls</p>
                        <p className="text-orange-100 text-[10px]">Remote Control Panel</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-lg">
                    {(['simple','series','parallel'] as const).map((m, i) => (
                        <button key={m} onClick={() => emit(m)}
                            className={`relative px-3 py-1 rounded-md text-xs font-bold transition-all ${mode === m ? 'bg-white text-orange-600 shadow scale-105' : 'text-white/80 hover:bg-white/10'}`}>
                            {m[0].toUpperCase()+m.slice(1)}
                            <span className="absolute -top-1 -right-1 text-[8px] bg-orange-800 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center">{i+1}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-300">
                    {['A','B','C'].map(k => <kbd key={k} className="px-1 bg-white/20 rounded font-mono">{k}</kbd>)}
                    <span>select •</span>
                    {['↑','↓'].map(k => <kbd key={k} className="px-1 bg-white/20 rounded font-mono">{k}</kbd>)}
                    <span>adjust</span>
                </div>

                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${connected ? 'bg-emerald-500/20 text-emerald-100' : 'bg-red-500/20 text-red-100'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}/>
                    {connected ? 'Connected' : 'Disconnected'}
                </div>
            </header>

            {/* ── Body ── */}
            <div className="flex-1 p-3 flex gap-3 min-h-0 overflow-hidden">
                {/* Controls column */}
                <div className="flex-1 flex flex-col gap-2 min-h-0">
                    {CTRL.map(c => {
                        const disabled = c.key === 'r2' && mode === 'simple';
                        const focused  = focus === c.key;
                        const v = getV(c.key);
                        return (
                            <div key={c.key} onClick={() => { if (!disabled) setFocus(c.key); }}
                                className={`flex items-center gap-4 bg-white rounded-xl px-4 py-3 border-2 cursor-pointer transition-all flex-1
                                    ${disabled ? 'opacity-40 pointer-events-none' : ''}
                                    ${focused  ? 'border-orange-400 ring-2 ring-orange-100 shadow-md' : 'border-transparent hover:border-slate-200'}`}>
                                {/* Label + value */}
                                <div className="w-40 shrink-0 border-r border-slate-100 pr-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500">{c.label}</span>
                                        <kbd className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${focused ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{c.kbd}</kbd>
                                    </div>
                                    <div className="flex items-baseline gap-1 mt-0.5">
                                        <span className={`font-black text-3xl ${c.color}`}>{v}</span>
                                        <span className={`font-bold text-sm ${c.color} opacity-60`}>{c.unit}</span>
                                    </div>
                                </div>
                                {/* Slider */}
                                <div className="flex-1">
                                    <input type="range" min={c.min} max={c.max} step={c.step} value={v}
                                        onChange={e => onChange(c.key, +e.target.value)}
                                        className={`w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer ${c.accent}`}/>
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                        <span>{c.lo}</span><span>{c.hi}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Stats panel */}
                <div className="w-64 bg-white rounded-xl p-4 border border-slate-200 shadow flex flex-col gap-3">
                    <div className="text-center py-2 bg-orange-50 rounded-lg border border-orange-100 font-mono font-bold text-orange-700 text-sm">
                        {mode === 'simple' && 'R = R₁'}
                        {mode === 'series' && 'R = R₁ + R₂'}
                        {mode === 'parallel' && '1/R = 1/R₁ + 1/R₂'}
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        {[
                            { label: 'Total Resistance', sub: '',        val: `${totalR.toFixed(1)} Ω`, bg: 'bg-emerald-50 border-emerald-100', cl: 'text-emerald-700', vc: 'text-emerald-600' },
                            { label: 'Current',          sub: 'I = V/R', val: `${I.toFixed(2)} A`,      bg: 'bg-cyan-50 border-cyan-100',     cl: 'text-cyan-700',   vc: 'text-cyan-600' },
                            { label: 'Power',            sub: 'P = V×I', val: `${P.toFixed(2)} W`,      bg: 'bg-amber-50 border-amber-100',   cl: 'text-amber-700',  vc: 'text-amber-600' },
                        ].map(s => (
                            <div key={s.label} className={`flex justify-between items-center p-3 rounded-lg border flex-1 ${s.bg}`}>
                                <div>
                                    <p className={`text-xs font-semibold ${s.cl}`}>{s.label}</p>
                                    {s.sub && <p className="text-[9px] font-mono text-slate-400 mt-0.5">{s.sub}</p>}
                                </div>
                                <span className={`font-black text-xl ${s.vc}`}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
