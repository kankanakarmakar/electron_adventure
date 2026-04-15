import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Zap, Play, Lightbulb, RotateCcw } from 'lucide-react';

const socket = io('http://localhost:3002/capacitor');
type CircuitMode = 'simple' | 'series' | 'parallel';
type Stage = 'initial' | 'connecting' | 'charging' | 'charged' | 'disconnecting' | 'discharge' | 'discharged';
interface CapState { mode: CircuitMode; voltage: number; capacitance: number; capacitance2: number; capacitance3: number; stage: Stage; }
type FC = 'voltage' | 'c1' | 'c2' | 'c3';

const CTRL = [
    { key: 'voltage' as FC, label: 'Voltage',       kbd: 'A', unit: 'V',  color: 'text-pink-600',   accent: 'accent-pink-600',   min: 3,  max: 24,  step: 1,  lo: '3V',   hi: '24V'   },
    { key: 'c1'      as FC, label: 'Capacitance C₁', kbd: 'B', unit: 'µF', color: 'text-blue-600',   accent: 'accent-blue-600',   min: 10, max: 500, step: 10, lo: '10µF', hi: '500µF' },
    { key: 'c2'      as FC, label: 'Capacitance C₂', kbd: 'C', unit: 'µF', color: 'text-purple-600', accent: 'accent-purple-600', min: 10, max: 500, step: 10, lo: '10µF', hi: '500µF' },
    { key: 'c3'      as FC, label: 'Capacitance C₃', kbd: 'D', unit: 'µF', color: 'text-pink-600',   accent: 'accent-pink-600',   min: 10, max: 500, step: 10, lo: '10µF', hi: '500µF' },
];

export default function CapacitorControls() {
    const [st, setSt]       = useState<CapState>({ mode:'simple', voltage:9, capacitance:100, capacitance2:200, capacitance3:150, stage:'initial' });
    const [con, setCon]     = useState(false);
    const [focus, setFocus] = useState<FC>('voltage');

    useEffect(() => {
        socket.on('connect', () => setCon(true));
        socket.on('disconnect', () => setCon(false));
        socket.on('initialState', (s: CapState) => s && setSt(s));
        socket.on('stateUpdated', (s: CapState) => s && setSt(s));
        return () => { socket.off('connect'); socket.off('disconnect'); socket.off('initialState'); socket.off('stateUpdated'); };
    }, []);

    const emit = useCallback((u: Partial<CapState>) => {
        socket.emit('updateState', u);
        setSt(p => ({ ...p, ...u }));
    }, []);

    const connect = () => {
        emit({ stage: 'connecting' });
        setTimeout(() => emit({ stage: 'charging' }), 500);
        setTimeout(() => emit({ stage: 'charged' }), 6000);
    };
    const discharge = () => {
        emit({ stage: 'disconnecting' });
        setTimeout(() => emit({ stage: 'discharge' }), 800);
        setTimeout(() => emit({ stage: 'discharged' }), 30000);
    };
    const reset = () => emit({ stage: 'initial' });

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === '1') { emit({ mode: 'simple' });   reset(); }
            else if (e.key === '2') { emit({ mode: 'series' });   reset(); }
            else if (e.key === '3') { emit({ mode: 'parallel' }); reset(); }
            const k = e.key.toLowerCase();
            if (k === 'a') { setFocus('voltage'); return; }
            if (k === 'b') { setFocus('c1');      return; }
            if (k === 'c') { if (st.mode !== 'simple') setFocus('c2'); return; }
            if (k === 'd') { if (st.mode !== 'simple') setFocus('c3'); return; }
            if (st.stage === 'initial' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                e.preventDefault();
                const d = e.key === 'ArrowUp' ? 1 : -1;
                if (focus === 'voltage') emit({ voltage: Math.max(3, Math.min(24, st.voltage + d)) });
                else if (focus === 'c1') emit({ capacitance:  Math.max(10, Math.min(500, st.capacitance  + d*10)) });
                else if (focus === 'c2' && st.mode !== 'simple') emit({ capacitance2: Math.max(10, Math.min(500, st.capacitance2 + d*10)) });
                else if (focus === 'c3' && st.mode !== 'simple') emit({ capacitance3: Math.max(10, Math.min(500, st.capacitance3 + d*10)) });
            }
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (st.stage === 'initial') connect();
                else if (st.stage === 'charged') discharge();
                else if (st.stage === 'discharged') reset();
            }
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [emit, st, focus]);

    const totalC = st.mode === 'simple' ? st.capacitance
        : st.mode === 'series' ? 1/(1/st.capacitance + 1/st.capacitance2 + 1/st.capacitance3)
        : st.capacitance + st.capacitance2 + st.capacitance3;
    const energy = 0.5 * totalC * st.voltage * st.voltage / 1000;

    const getV = (k: FC) => k === 'voltage' ? st.voltage : k === 'c1' ? st.capacitance : k === 'c2' ? st.capacitance2 : st.capacitance3;
    const onChange = (k: FC, v: number) => {
        if (k === 'voltage') emit({ voltage: v });
        else if (k === 'c1') emit({ capacitance: v });
        else if (k === 'c2') emit({ capacitance2: v });
        else emit({ capacitance3: v });
    };

    const stageInfo = {
        initial:      { text: '⬤ Ready',               cls: 'bg-slate-50 text-slate-600 border-slate-200' },
        connecting:   { text: '⚡ Connecting...',       cls: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' },
        charging:     { text: '⚡ Charging...',         cls: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' },
        charged:      { text: '✓ Fully Charged',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        disconnecting:{ text: '↯ Disconnecting...',     cls: 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse' },
        discharge:    { text: '💡 Discharging...',      cls: 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse' },
        discharged:   { text: '○ Discharged',           cls: 'bg-slate-50 text-slate-500 border-slate-200' },
    }[st.stage];

    return (
        <div className="h-screen w-full bg-slate-100 flex flex-col overflow-hidden">
            {/* ── Header ── */}
            <header className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-white flex items-center justify-between shadow flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Zap className="w-4 h-4" fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-base font-black leading-none">Capacitor Controls</p>
                        <p className="text-pink-100 text-[10px]">Remote Control Panel</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-lg">
                    {(['simple','series','parallel'] as CircuitMode[]).map((m, i) => (
                        <button key={m} onClick={() => { emit({ mode: m }); reset(); }}
                            className={`relative px-3 py-1 rounded-md text-xs font-bold transition-all ${st.mode === m ? 'bg-white text-pink-600 shadow scale-105' : 'text-white/80 hover:bg-white/10'}`}>
                            {m[0].toUpperCase()+m.slice(1)}
                            <span className="absolute -top-1 -right-1 text-[8px] bg-pink-900 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center">{i+1}</span>
                        </button>
                    ))}
                </div>

                {/* Action button */}
                <div>
                    {st.stage === 'initial'   && <button onClick={connect}   className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><Play className="w-3 h-3"/>Connect</button>}
                    {(st.stage === 'charging' || st.stage === 'connecting') && <div className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold animate-pulse">⚡ Charging…</div>}
                    {st.stage === 'charged'   && <button onClick={discharge} className="bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><Lightbulb className="w-3 h-3"/>Discharge</button>}
                    {(st.stage === 'discharge'|| st.stage === 'discharged'|| st.stage === 'disconnecting') && <button onClick={reset} disabled={st.stage !== 'discharged'} className="bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50"><RotateCcw className="w-3 h-3"/>Reset</button>}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-300">
                    {['A','B','C','D'].map(k => <kbd key={k} className="px-1 bg-white/20 rounded font-mono">{k}</kbd>)}
                    <span>sel •</span>
                    <kbd className="px-1 bg-white/20 rounded font-mono">Space</kbd>
                    <span>act</span>
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
                        const locked   = st.stage !== 'initial';
                        const disabled = locked || (c.key !== 'voltage' && c.key !== 'c1' && st.mode === 'simple');
                        const focused  = focus === c.key;
                        const v = getV(c.key);
                        return (
                            <div key={c.key} onClick={() => { if (!disabled) setFocus(c.key); }}
                                className={`flex items-center gap-4 bg-white rounded-xl px-4 py-2.5 border-2 cursor-pointer transition-all flex-1
                                    ${disabled ? 'opacity-40 pointer-events-none' : ''}
                                    ${focused  ? 'border-pink-400 ring-2 ring-pink-100 shadow-md' : 'border-transparent hover:border-slate-200'}`}>
                                <div className="w-40 shrink-0 border-r border-slate-100 pr-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500">{c.label}</span>
                                        <kbd className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${focused ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{c.kbd}</kbd>
                                    </div>
                                    <div className="flex items-baseline gap-1 mt-0.5">
                                        <span className={`font-black text-2xl ${c.color}`}>{v}</span>
                                        <span className={`font-bold text-xs ${c.color} opacity-60`}>{c.unit}</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <input type="range" min={c.min} max={c.max} step={c.step} value={v} disabled={locked}
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
                    <div className="text-center py-1.5 bg-pink-50 rounded-lg border border-pink-100 font-mono font-bold text-pink-700 text-sm">
                        {st.mode === 'simple' && 'C = C₁'}
                        {st.mode === 'series' && '1/C = Σ1/Cₙ'}
                        {st.mode === 'parallel' && 'C = C₁+C₂+C₃'}
                    </div>

                    <div className={`text-center py-1.5 rounded-lg border text-xs font-bold ${stageInfo.cls}`}>
                        {stageInfo.text}
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                        {[
                            { label: 'Total Capacitance', sub: '',         val: `${totalC.toFixed(1)} µF`, bg: 'bg-purple-50 border-purple-100', cl: 'text-purple-700', vc: 'text-purple-600' },
                            { label: 'Stored Energy',     sub: 'E = ½CV²', val: `${energy.toFixed(2)} mJ`, bg: 'bg-rose-50 border-rose-100',     cl: 'text-rose-700',   vc: 'text-rose-500' },
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
