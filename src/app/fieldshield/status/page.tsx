'use client';
import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import {
  Droplets, AlertTriangle, CheckCircle,
  RefreshCw, WifiOff, Wifi, ChevronLeft,
  RotateCcw, ShieldCheck, ShieldOff, Zap
} from 'lucide-react';
import styles from './status.module.css';
import Link from 'next/link';

type GateState = 'open' | 'closed' | 'partial' | 'fault';

interface Gate {
  id: string;
  fieldName: string;
  location: string;
  crop: string;
  deviceId: string;
  risk: 'high' | 'medium' | 'low';
  state: GateState;
  openPercent: number;
  pendingPercent: number;   // slider value before applying
  waterDepth: number;       // cm — how much water is at the gate
  autoMode: boolean;
  lastAction: string;
  online: boolean;
  batteryLevel: number;
}

const INITIAL_GATES: Gate[] = [
  {
    id: 'g1', fieldName: 'North Field – Paddy', location: 'Bheemunipatnam', crop: 'Paddy',
    deviceId: 'ESP-001', risk: 'high', state: 'open', openPercent: 75, pendingPercent: 75,
    waterDepth: 148, autoMode: true, lastAction: '12 min ago', online: true, batteryLevel: 87,
  },
  {
    id: 'g2', fieldName: 'South Field – Groundnut', location: 'Atchutapuram', crop: 'Groundnut',
    deviceId: 'ESP-002', risk: 'medium', state: 'partial', openPercent: 40, pendingPercent: 40,
    waterDepth: 74, autoMode: false, lastAction: '1 hr ago', online: true, batteryLevel: 72,
  },
  {
    id: 'g3', fieldName: 'East Field – Maize', location: 'Pendurthi', crop: 'Maize',
    deviceId: 'ESP-003', risk: 'low', state: 'closed', openPercent: 0, pendingPercent: 0,
    waterDepth: 32, autoMode: true, lastAction: '6 hrs ago', online: true, batteryLevel: 91,
  },
  {
    id: 'g4', fieldName: 'West Field – Banana', location: 'Nakkapalle', crop: 'Banana',
    deviceId: 'ESP-004', risk: 'high', state: 'fault', openPercent: 0, pendingPercent: 0,
    waterDepth: 112, autoMode: false, lastAction: '45 min ago', online: false, batteryLevel: 14,
  },
];

function waterStatus(depth: number): { label: string; color: string; emoji: string } {
  if (depth > 100) return { label: 'Very High – Open gate now!', color: '#ff4444', emoji: '🚨' };
  if (depth > 60)  return { label: 'High – Water rising fast',   color: '#ffaa00', emoji: '⚠️' };
  if (depth > 30)  return { label: 'Moderate – Keep watch',      color: '#ffea00', emoji: '🌊' };
  return               { label: 'Normal – All good',             color: '#00ff88', emoji: '✅' };
}

function gateLabel(state: GateState, openPercent: number): string {
  if (state === 'fault')   return 'Device Error';
  if (state === 'open')    return 'Gate Fully Open';
  if (state === 'closed')  return 'Gate Closed';
  return `Gate ${openPercent}% Open`;
}

function batteryColor(pct: number): string {
  if (pct < 20) return '#ff4444';
  if (pct < 40) return '#ffaa00';
  return '#00ff88';
}

export default function GateControlPage() {
  const [gates, setGates] = useState<Gate[]>(INITIAL_GATES);
  const [acting, setActing] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Slowly animate water depth
  useEffect(() => {
    const t = setInterval(() => {
      setGates(prev => prev.map(g => ({
        ...g,
        waterDepth: g.online
          ? Math.max(0, g.waterDepth + (Math.random() > 0.55 ? 1 : -1))
          : g.waterDepth,
      })));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const doAction = async (id: string, action: 'open' | 'close' | 'reset') => {
    setActing(id);
    await new Promise(r => setTimeout(r, 1800));
    setGates(prev => prev.map(g => {
      if (g.id !== id) return g;
      if (action === 'open')  return { ...g, state: 'open',   openPercent: 100, pendingPercent: 100, lastAction: 'just now' };
      if (action === 'close') return { ...g, state: 'closed', openPercent: 0,   pendingPercent: 0,   lastAction: 'just now' };
      if (action === 'reset') return { ...g, state: 'closed', openPercent: 0,   pendingPercent: 0,   lastAction: 'just now', online: true };
      return g;
    }));
    setActing(null);
  };

  const setPending = (id: string, val: number) => {
    setGates(prev => prev.map(g => g.id === id ? { ...g, pendingPercent: val } : g));
  };

  const applySlider = async (id: string) => {
    const gate = gates.find(g => g.id === id);
    if (!gate) return;
    setActing(id);
    await new Promise(r => setTimeout(r, 1600));
    setGates(prev => prev.map(g => {
      if (g.id !== id) return g;
      const pct = g.pendingPercent;
      const newState: GateState = pct === 0 ? 'closed' : pct === 100 ? 'open' : 'partial';
      return { ...g, openPercent: pct, state: newState, lastAction: 'just now' };
    }));
    setActing(null);
  };

  const toggleAuto = (id: string) => {
    setGates(prev => prev.map(g => g.id === id ? { ...g, autoMode: !g.autoMode } : g));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    setRefreshing(false);
  };

  const openCount  = gates.filter(g => g.state === 'open' || g.state === 'partial').length;
  const alertCount = gates.filter(g => g.waterDepth > 100).length;
  const faultCount = gates.filter(g => !g.online || g.state === 'fault').length;

  return (
    <ProtectedLayout>
      <div className="page-content">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <Link href="/fieldshield" className="btn btn-ghost btn-sm" style={{ padding: '3px 8px' }}>
                <ChevronLeft size={14} /> Back
              </Link>
              <h1 className="page-title" style={{ margin: 0 }}>Gate Control</h1>
            </div>
            <p className="page-subtitle" style={{ margin: 0 }}>
              Open or close your field water gates from here. Your crops are protected.
            </p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? styles.spin : ''} />
            {refreshing ? 'Checking...' : 'Refresh'}
          </button>
        </div>

        {/* Quick summary */}
        <div className={styles.summaryRow}>
          <div className={styles.summaryBox} style={{ borderColor: 'rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.06)' }}>
            <CheckCircle size={20} color="#00ff88" />
            <div>
              <span className={styles.summaryNum} style={{ color: '#00ff88' }}>{openCount}</span>
              <span className={styles.summaryLbl}>Gates Open</span>
            </div>
          </div>
          <div className={styles.summaryBox} style={{ borderColor: alertCount > 0 ? 'rgba(255,68,68,0.4)' : 'rgba(0,212,255,0.2)', background: alertCount > 0 ? 'rgba(255,68,68,0.06)' : 'rgba(0,212,255,0.04)' }}>
            <Droplets size={20} color={alertCount > 0 ? '#ff4444' : '#00d4ff'} />
            <div>
              <span className={styles.summaryNum} style={{ color: alertCount > 0 ? '#ff4444' : '#00d4ff' }}>{alertCount}</span>
              <span className={styles.summaryLbl}>Water Alerts</span>
            </div>
          </div>
          <div className={styles.summaryBox} style={{ borderColor: faultCount > 0 ? 'rgba(255,68,68,0.3)' : 'rgba(0,212,255,0.15)', background: 'rgba(0,0,0,0.2)' }}>
            {faultCount > 0
              ? <WifiOff size={20} color="#ff4444" />
              : <Wifi size={20} color="#00ff88" />
            }
            <div>
              <span className={styles.summaryNum} style={{ color: faultCount > 0 ? '#ff4444' : '#00ff88' }}>{gates.length - faultCount}/{gates.length}</span>
              <span className={styles.summaryLbl}>Devices Online</span>
            </div>
          </div>
          <div className={styles.summaryBox} style={{ borderColor: 'rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.05)' }}>
            <Zap size={20} color="#a78bfa" />
            <div>
              <span className={styles.summaryNum} style={{ color: '#a78bfa' }}>{gates.filter(g => g.autoMode).length}</span>
              <span className={styles.summaryLbl}>Auto Gates</span>
            </div>
          </div>
        </div>

        {/* Gate Cards */}
        <div className={styles.gateCardGrid}>
          {gates.map(gate => {
            const ws = waterStatus(gate.waterDepth);
            const isActing = acting === gate.id;
            const stateLabel = gateLabel(gate.state, gate.openPercent);

            return (
              <div
                key={gate.id}
                className={styles.gateCard2}
                style={{ borderLeftColor: gate.risk === 'high' ? '#ff4444' : gate.risk === 'medium' ? '#ffaa00' : '#00ff88' }}
              >
                {/* Gate card top */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      {gate.online
                        ? <Wifi size={14} color="#00ff88" />
                        : <WifiOff size={14} color="#ff4444" />
                      }
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{gate.fieldName}</h3>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                      {gate.location} • {gate.crop} • {gate.deviceId}
                    </span>
                  </div>
                  <span className={`badge ${gate.risk === 'high' ? 'badge-danger' : gate.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`}>
                    {gate.risk.toUpperCase()} RISK
                  </span>
                </div>

                {/* Water depth status — big and clear */}
                <div className={styles.waterStatusBox} style={{ borderColor: `${ws.color}40`, background: `${ws.color}0a` }}>
                  <span style={{ fontSize: '1.5rem' }}>{ws.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: '1px' }}>Water at your gate</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: ws.color, lineHeight: 1 }}>
                      {gate.waterDepth} cm
                    </div>
                    <div style={{ fontSize: '0.75rem', color: ws.color, marginTop: '2px' }}>{ws.label}</div>
                  </div>
                  {/* Water depth bar */}
                  <div style={{ width: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '10px', height: '56px', background: 'rgba(255,255,255,0.07)', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: `${Math.min(100, gate.waterDepth / 2)}%`,
                        background: ws.color,
                        borderRadius: '5px',
                        transition: 'height 0.8s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--clr-text-muted)' }}>level</span>
                  </div>
                </div>

                {/* Gate state + last action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.85rem 0 0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
                      background: gate.state === 'open' ? '#00ff88' : gate.state === 'fault' ? '#ff4444' : gate.state === 'partial' ? '#ffaa00' : '#00d4ff',
                      boxShadow: `0 0 6px ${gate.state === 'open' ? '#00ff88' : gate.state === 'fault' ? '#ff4444' : gate.state === 'partial' ? '#ffaa00' : '#00d4ff'}`,
                    }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{stateLabel}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)' }}>• {gate.lastAction}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: batteryColor(gate.batteryLevel) }}>
                    🔋 {gate.batteryLevel}%
                  </span>
                </div>

                {/* ── GATE OPENING SLIDER ── */}
                {gate.online && gate.state !== 'fault' && (
                  <div style={{
                    padding: '0.9rem 1rem',
                    background: 'rgba(0,212,255,0.05)',
                    border: '1px solid rgba(0,212,255,0.18)',
                    borderRadius: '12px',
                    marginBottom: '0.85rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>
                        🚪 How much to open the gate?
                      </span>
                      <span style={{
                        fontSize: '1rem', fontWeight: 800,
                        color: gate.pendingPercent !== gate.openPercent ? '#ffaa00' : '#00d4ff',
                        minWidth: '44px', textAlign: 'right',
                      }}>
                        {gate.pendingPercent}%
                      </span>
                    </div>

                    {/* Slider */}
                    <input
                      type="range"
                      min={0} max={100} step={5}
                      value={gate.pendingPercent}
                      disabled={gate.autoMode || isActing}
                      onChange={e => setPending(gate.id, Number(e.target.value))}
                      className={styles.gateSlider}
                      style={{
                        '--fill': `${gate.pendingPercent}%`,
                        opacity: gate.autoMode ? 0.4 : 1,
                        cursor: gate.autoMode ? 'not-allowed' : 'pointer',
                      } as React.CSSProperties}
                    />

                    {/* Labels below slider */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--clr-text-muted)', marginTop: '0.3rem' }}>
                      <span>Closed</span>
                      <span>Quarter</span>
                      <span>Half</span>
                      <span>¾ Open</span>
                      <span>Fully Open</span>
                    </div>

                    {/* Apply button — only shown when slider changed */}
                    {gate.pendingPercent !== gate.openPercent && !gate.autoMode && (
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', fontWeight: 700 }}
                        onClick={() => applySlider(gate.id)}
                        disabled={isActing}
                      >
                        {isActing
                          ? <><RefreshCw size={14} className={styles.spin} /> Applying...</>
                          : `✅ Set Gate to ${gate.pendingPercent}%`
                        }
                      </button>
                    )}

                    {gate.autoMode && (
                      <div style={{ fontSize: '0.7rem', color: 'rgba(167,139,250,0.7)', marginTop: '0.4rem', textAlign: 'center' }}>
                        Turn off Auto Mode to adjust manually
                      </div>
                    )}
                  </div>
                )}

                {/* Auto mode toggle */}
                <div style={{
                  background: 'rgba(124,58,237,0.07)',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: '10px',
                  marginBottom: '0.9rem',
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600 }}>
                      {gate.autoMode ? '⚡ Auto Mode ON' : '🔧 Manual Mode'}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginTop: '1px' }}>
                      {gate.autoMode
                        ? 'Gate opens automatically when water is too high'
                        : 'You control this gate manually'
                      }
                    </div>
                  </div>
                  <label style={{ cursor: gate.online ? 'pointer' : 'not-allowed', flexShrink: 0 }}>
                    <input type="checkbox" checked={gate.autoMode} onChange={() => gate.online && toggleAuto(gate.id)} style={{ display: 'none' }} />
                    <span style={{
                      display: 'inline-block', width: 40, height: 22, borderRadius: 11,
                      background: gate.autoMode ? '#a78bfa' : 'rgba(255,255,255,0.15)',
                      position: 'relative', transition: 'background 0.3s',
                      opacity: gate.online ? 1 : 0.4,
                    }}>
                      <span style={{
                        display: 'block', width: 16, height: 16, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3,
                        left: gate.autoMode ? 21 : 3,
                        transition: 'left 0.3s',
                      }} />
                    </span>
                  </label>
                </div>

                {/* Big clear action buttons */}
                {!gate.online ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '10px', fontSize: '0.78rem', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <WifiOff size={14} /> Device offline — cannot control gate
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ justifyContent: 'center', borderColor: '#ffaa00', color: '#ffaa00' }}
                      onClick={() => doAction(gate.id, 'reset')}
                      disabled={isActing}
                    >
                      {isActing ? <><RefreshCw size={14} className={styles.spin} /> Resetting...</> : <><RotateCcw size={14} /> Reset &amp; Reconnect Device</>}
                    </button>
                  </div>
                ) : gate.state === 'fault' ? (
                  <button
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center', borderColor: '#ffaa00', color: '#ffaa00', padding: '0.65rem' }}
                    onClick={() => doAction(gate.id, 'reset')}
                    disabled={isActing}
                  >
                    {isActing ? <><RefreshCw size={15} className={styles.spin} /> Restarting...</> : <><RotateCcw size={15} /> Restart Gate Device</>}
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button
                      className="btn btn-safe"
                      style={{ flex: 1, justifyContent: 'center', padding: '0.65rem', fontSize: '0.88rem', fontWeight: 700, opacity: gate.state === 'open' || gate.autoMode ? 0.5 : 1 }}
                      onClick={() => doAction(gate.id, 'open')}
                      disabled={isActing || gate.state === 'open' || gate.autoMode}
                    >
                      {isActing && gate.state !== 'open'
                        ? <><RefreshCw size={14} className={styles.spin} /> Opening...</>
                        : <><ShieldCheck size={15} /> Open Gate</>
                      }
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ flex: 1, justifyContent: 'center', padding: '0.65rem', fontSize: '0.88rem', fontWeight: 700, opacity: gate.state === 'closed' || gate.autoMode ? 0.5 : 1 }}
                      onClick={() => doAction(gate.id, 'close')}
                      disabled={isActing || gate.state === 'closed' || gate.autoMode}
                    >
                      {isActing && gate.state !== 'closed'
                        ? <><RefreshCw size={14} className={styles.spin} /> Closing...</>
                        : <><ShieldOff size={15} /> Close Gate</>
                      }
                    </button>
                  </div>
                )}

                {/* Auto mode note */}
                {gate.autoMode && gate.online && (
                  <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--clr-text-muted)', textAlign: 'center' }}>
                    Auto mode is ON — manual open/close is disabled
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Simple tip box */}
        <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '14px' }}>
          <div style={{ fontWeight: 600, color: '#00d4ff', fontSize: '0.85rem', marginBottom: '0.5rem' }}>💡 How Gates Work</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: '#fff' }}>Auto Mode ON:</strong> The gate opens by itself when water level gets too high. You don&apos;t need to do anything.<br />
            <strong style={{ color: '#fff' }}>Manual Mode:</strong> You decide when to open or close the gate using the buttons above.<br />
            <strong style={{ color: '#fff' }}>Water level above 100cm?</strong> Open your gate immediately to prevent flooding.
          </div>
        </div>

      </div>
    </ProtectedLayout>
  );
}
