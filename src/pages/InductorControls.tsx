import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Zap } from 'lucide-react';

const socket = io('http://localhost:3002/inductor');
type CircuitMode = 'simple' | 'series' | 'parallel';
interface InductorValues { voltage: number; l1: number; l2: number; currentRate: number; }
type FC = 'voltage' | 'currentRate' | 'l1' | 'l2';

const CTRL = [
    { key: 'voltage'     as FC, label: 'Voltage',      kbd: 'A', unit: 'V',   color: 'text-blue-600',   accent: 'accent-blue-600',   min: 1, max: 24,  step: 1, lo: '1V',   hi: '24V'    },
    { key: 'currentRate' as FC, label: 'dI/dt',         kbd: 'B', unit: 'A/s', color: 'text-purple-600', accent: 'accent-purple-600', min: 1, max: 20,  step: 1, lo: '1A/s', hi: '20A/s'  },
    { key: 'l1'          as FC, label: 'Inductance L₁', kbd: 'C', unit: 'mH',  color: 'text-indigo-600', accent: 'accent-indigo-600', min: 1, max: 100, step: 5, lo: '1mH',  hi: '100mH'  },
    { key: 'l2'          as FC, label: 'Inductance L₂', kbd: 'D', unit: 'mH',  color: 'text-indigo-600', accent: 'accent-indigo-600', min: 1, max: 100, step: 5, lo: '1mH',  hi: '100mH'  },
];

export default function InductorControls() {
    const [mode, setMode]   = useState<CircuitMode>('simple');
    const [val, setVal]     = useState<InductorValues>({ voltage: 12, l1: 10, l2: 20, currentRate: 5 });
    const [dir, setDir]     = useState<'forward'|'reverse'>('forward');
    const [con, setCon]     = useState(false);
    const [focus, setFocus] = useState<FC>('voltage');

    useEffect(() => {
        socket.on('connect', () => setCon(true));
        socket.on('disconnect', () => setCon(false));
        socket.on('initialState', (s: any) => { if (s) { setMode(s.mode); setVal(s.values); setDir(s.currentDirection); } });
        socket.on('stateUpdated', (s: any) => { if (s) { setMode(s.mode); setVal(s.values); setDir(s.currentDirection); } });
        return () => { socket.off('connect'); socket.off('disconnect'); socket.off('initialState'); socket.off('stateUpdated'); };
    }, []);

    const emit = useCallback((u: any) => {
        socket.emit('updateState', u);
        if (u.mode) setMode(u.mode);
        if (u.values) setVal(p => ({ ...p, ...u.values }));
        if (u.currentDirection) setDir(u.currentDirection);
    }, []);

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === '1') emit({ mode: 'simple' });
            else if (e.key === '2') emit({ mode: 'series' });
            else if (e.key === '3') emit({ mode: 'parallel' });
            const k = e.key.toLowerCase();
            if (k === 'a') { setFocus('voltage');     return; }
            if (k === 'b') { setFocus('currentRate'); return; }
            if (k === 'c') { setFocus('l1');          return; }
            if (k === 'd') { if (mode !== 'simple') setFocus('l2'); return; }
            if (k === 'f') { emit({ currentDirection: dir === 'forward' ? 'reverse' : 'forward' }); return; }
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const d = e.key === 'ArrowUp' ? 1 : -1;
                const c = CTRL.find(x => x.key === focus)!;
                const cur = focus === 'voltage' ? val.voltage : focus === 'currentRate' ? val.currentRate : focus === 'l1' ? val.l1 : val.l2;
                const next = Math.max(c.min, Math.min(c.max, cur + d * c.step));
                if (focus === 'voltage')     emit({ values: { ...val, voltage: next } });
                else if (focus === 'currentRate') emit({ values: { ...val, currentRate: next } });
                else if (focus === 'l1')     emit({ values: { ...val, l1: next } });
                else if (focus === 'l2' && mode !== 'simple') emit({ values: { ...val, l2: next } });
            }
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [emit, val, mode, focus, dir]);

    const getV = (k: FC) => k === 'voltage' ? val.voltage : k === 'currentRate' ? val.currentRate : k === 'l1' ? val.l1 : val.l2;
    const onChange = (k: FC, v: number) => {
        if (k === 'voltage')     emit({ values: { ...val, voltage: v } });
        else if (k === 'currentRate') emit({ values: { ...val, currentRate: v } });
        else if (k === 'l1')    emit({ values: { ...val, l1: v } });
        else                     emit({ values: { ...val, l2: v } });
    };

    const totalL = mode === 'simple' ? val.l1 : mode === 'series' ? val.l1 + val.l2 : (val.l1 * val.l2) / (val.l1 + val.l2);
    const vInduced = ((totalL / 1000) * val.currentRate).toFixed(2);
    const I = (val.voltage / 10).toFixed(2);

    return (
        <div className="h-screen w-full bg-slate-100 flex flex-col overflow-hidden">
            {/* ── Header ── */}
            <header className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-2 text-white flex items-center justify-between shadow flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Zap className="w-4 h-4" fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-base font-black leading-none">Inductor Controls</p>
                        <p className="text-blue-100 text-[10px]">Remote Control Panel</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-lg">
                    {(['simple','series','parallel'] as CircuitMode[]).map((m, i) => (
                        <button key={m} onClick={() => emit({ mode: m })}
                            className={`relative px-3 py-1 rounded-md text-xs font-bold transition-all ${mode === m ? 'bg-white text-blue-600 shadow scale-105' : 'text-white/80 hover:bg-white/10'}`}>
                            {m[0].toUpperCase()+m.slice(1)}
                            <span className="absolute -top-1 -right-1 text-[8px] bg-blue-900 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center">{i+1}</span>
                        </button>
                    ))}
                </div>

                <button onClick={() => emit({ currentDirection: dir === 'forward' ? 'reverse' : 'forward' })}
                    className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                    <kbd className="text-[9px] px-1 bg-white/20 rounded">F</kbd>
                    {dir === 'forward' ? 'Forward ➡️' : 'Reverse ⬅️'}
                </button>

                <div className="flex items-center gap-1 text-[10px] text-slate-300">
                    {['A','B','C','D'].map(k => <kbd key={k} className="px-1 bg-white/20 rounded font-mono">{k}</kbd>)}
                    <span>select •</span>
                    {['↑','↓'].map(k => <kbd key={k} className="px-1 bg-white/20 rounded font-mono">{k}</kbd>)}
                    <span>adjust</span>
                </div>

                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${con ? 'bg-emerald-500/20 text-emerald-100' : 'bg-red-500/20 text-red-100'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${con ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}/>
                    {con ? 'Connected' : 'Disconnected'}
                </div>
            </header>

            {/* ── Body ── */}
            <div className="flex-1 p-3 flex gap-3 min-h-0 overflow-hidden">
                {/* Controls column */}
                <div className="flex-1 flex flex-col gap-2 min-h-0">
                    {CTRL.map(c => {
                        const disabled = c.key === 'l2' && mode === 'simple';
                        const focused  = focus === c.key;
                        const v = getV(c.key);
                        return (
                            <div key={c.key} onClick={() => { if (!disabled) setFocus(c.key); }}
                                className={`flex items-center gap-4 bg-white rounded-xl px-4 py-2.5 border-2 cursor-pointer transition-all flex-1
                                    ${disabled ? 'opacity-40 pointer-events-none' : ''}
                                    ${focused  ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' : 'border-transparent hover:border-slate-200'}`}>
                                <div className="w-40 shrink-0 border-r border-slate-100 pr-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500">{c.label}</span>
                                        <kbd className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${focused ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{c.kbd}</kbd>
                                    </div>
                                    <div className="flex items-baseline gap-1 mt-0.5">
                                        <span className={`font-black text-2xl ${c.color}`}>{v}</span>
                                        <span className={`font-bold text-xs ${c.color} opacity-60`}>{c.unit}</span>
                                    </div>
                                </div>
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
                <div className="w-60 bg-white rounded-xl p-3 border border-slate-200 shadow flex flex-col gap-2">
                    <div className="text-center py-1.5 bg-blue-50 rounded-lg border border-blue-100 font-mono font-bold text-blue-700 text-sm">
                        {mode === 'simple' && 'L = L₁'}
                        {mode === 'series' && 'L = L₁ + L₂'}
                        {mode === 'parallel' && '1/L = 1/L₁ + 1/L₂'}
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        {[
                            { label: 'Total Inductance',  sub: '',             val: `${totalL.toFixed(1)} mH`, bg: 'bg-emerald-50 border-emerald-100', cl: 'text-emerald-700', vc: 'text-emerald-600' },
                            { label: 'Induced Voltage',   sub: 'V = L×(dI/dt)', val: `${vInduced} V`,           bg: 'bg-amber-50 border-amber-100',    cl: 'text-amber-700',  vc: 'text-amber-600' },
                            { label: 'Current',           sub: '',             val: `${I} A`,                  bg: 'bg-cyan-50 border-cyan-100',      cl: 'text-cyan-700',   vc: 'text-cyan-600' },
                        ].map(s => (
                            <div key={s.label} className={`flex justify-between items-center p-2.5 rounded-lg border flex-1 ${s.bg}`}>
                                <div>
                                    <p className={`text-xs font-semibold ${s.cl}`}>{s.label}</p>
                                    {s.sub && <p className="text-[9px] font-mono text-slate-400 mt-0.5">{s.sub}</p>}
                                </div>
                                <span className={`font-black text-lg ${s.vc}`}>{s.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
