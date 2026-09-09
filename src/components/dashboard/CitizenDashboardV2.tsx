'use client';
import { useState } from 'react';
import { useFloodData } from '@/context/FloodDataContext';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import {
  AlertTriangle, Droplets, CloudRain, Wind, Send,
  Navigation, MapPin, Bell, TrendingUp, TrendingDown,
  Shield, Eye, Thermometer, Activity, CheckCircle,
  ChevronRight, Megaphone,
} from 'lucide-react';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false });

/* ─────────────────────────────────────────
   Palette — light glassmorphism, purple accent
   ───────────────────────────────────────── */
const C = {
  bg:          '#f0f2f8',
  surface:     'rgba(255,255,255,0.75)',
  surfaceSolid:'#ffffff',
  border:      'rgba(139,92,246,0.12)',
  borderStrong:'rgba(139,92,246,0.28)',
  primary:     '#7c3aed',
  primarySoft: 'rgba(124,58,237,0.10)',
  cyan:        '#06b6d4',
  cyanSoft:    'rgba(6,182,212,0.12)',
  green:       '#10b981',
  greenSoft:   'rgba(16,185,129,0.12)',
  orange:      '#f59e0b',
  orangeSoft:  'rgba(245,158,11,0.12)',
  red:         '#ef4444',
  redSoft:     'rgba(239,68,68,0.12)',
  text:        '#1e1b4b',
  textMid:     '#6366f1',
  textMuted:   '#94a3b8',
  shadow:      '0 8px 32px rgba(124,58,237,0.10), 0 2px 8px rgba(0,0,0,0.06)',
  shadowHover: '0 16px 48px rgba(124,58,237,0.18), 0 4px 16px rgba(0,0,0,0.08)',
};

/* ── Reusable glass card ── */
function GlassCard({ children, style = {}, onClick }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.surface,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: '1.25rem',
        boxShadow: C.shadow,
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onMouseEnter={e => {
        if (onClick) (e.currentTarget as HTMLDivElement).style.boxShadow = C.shadowHover;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = C.shadow;
      }}
    >
      {children}
    </div>
  );
}

/* ── Coloured icon bubble ── */
function IconBubble({ icon, color, bg }: { icon: React.ReactNode; color: string; bg: string }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      color, flexShrink: 0,
    }}>
      {icon}
    </div>
  );
}

/* ── Small stat row ── */
function StatRow({ label, value, trend, color }: {
  label: string; value: string; trend?: 'up' | 'down'; color: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: '0.78rem', color: C.textMuted }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <strong style={{ fontSize: '0.82rem', color }}>{value}</strong>
        {trend === 'up' && <TrendingUp size={12} color={C.green} />}
        {trend === 'down' && <TrendingDown size={12} color={C.red} />}
      </div>
    </div>
  );
}

export default function CitizenDashboardV2() {
  const { user } = useAuth();
  const { weatherData, zones, broadcastAlerts, dismissBroadcast, safeRoutes, alerts } = useFloodData();
  const [selectedRouteId, setSelectedRouteId] = useState('r1');
  const [sosSent, setSosSent] = useState(false);

  const w = weatherData.current;
  const highZones  = zones.filter(z => z.risk === 'high');
  const medZones   = zones.filter(z => z.risk === 'medium');
  const safeZones  = zones.filter(z => z.risk === 'low');
  const totalPop   = zones.reduce((s, z) => s + z.populationAffected, 0);
  const activeAlerts = alerts.filter(a => a.active);
  const clearRoutes  = safeRoutes.filter(r => r.risk === 'low');

  const overallRisk = highZones.length > 0 || w.rainfall > 40 ? 'high'
    : medZones.length > 0 || w.rainfall > 10 ? 'medium' : 'low';

  const riskColor = overallRisk === 'high' ? C.red : overallRisk === 'medium' ? C.orange : C.green;
  const riskBg    = overallRisk === 'high' ? C.redSoft : overallRisk === 'medium' ? C.orangeSoft : C.greenSoft;
  const riskLabel = overallRisk === 'high' ? 'SEVERE RISK' : overallRisk === 'medium' ? 'MODERATE' : 'ALL CLEAR';

  const handleSOS = () => { setSosSent(true); setTimeout(() => setSosSent(false), 4000); };

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at 20% 0%, rgba(124,58,237,0.08) 0%, transparent 50%),
                   radial-gradient(ellipse at 80% 100%, rgba(6,182,212,0.06) 0%, transparent 50%),
                   ${C.bg}`,
      padding: '1.5rem',
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── TOP HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: riskColor, boxShadow: `0 0 8px ${riskColor}` }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: riskColor, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {riskLabel}
            </span>
            <span style={{ fontSize: '0.75rem', color: C.textMuted, background: riskBg, padding: '1px 8px', borderRadius: 20 }}>
              {w.conditionEmoji} {w.conditionLabel}
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: C.text }}>
            Citizen Safety Center
          </h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: C.textMuted }}>
            Welcome back, {user?.name || 'Citizen'} · Visakhapatnam Live Intelligence
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Active alerts pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: activeAlerts.length > 0 ? C.redSoft : C.greenSoft,
            border: `1px solid ${activeAlerts.length > 0 ? C.red : C.green}`,
            borderRadius: 20, padding: '0.4rem 0.9rem',
            fontSize: '0.8rem', fontWeight: 600,
            color: activeAlerts.length > 0 ? C.red : C.green,
          }}>
            <Bell size={14} />
            {activeAlerts.length} Active Alert{activeAlerts.length !== 1 ? 's' : ''}
          </div>

          {/* SOS button */}
          <button
            onClick={handleSOS}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: sosSent
                ? `linear-gradient(135deg, ${C.green}, #059669)`
                : `linear-gradient(135deg, ${C.red}, #dc2626)`,
              color: '#fff', border: 'none', borderRadius: 20,
              padding: '0.55rem 1.2rem', fontWeight: 700,
              fontSize: '0.85rem', cursor: 'pointer',
              boxShadow: sosSent
                ? `0 4px 16px rgba(16,185,129,0.4)`
                : `0 4px 16px rgba(239,68,68,0.4)`,
              transition: 'all 0.2s',
            }}
          >
            {sosSent ? <CheckCircle size={15} /> : <Send size={15} />}
            {sosSent ? 'SOS Sent!' : 'Send SOS'}
          </button>
        </div>
      </div>

      {/* ── MAIN 3-COLUMN LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 260px', gap: '1.25rem', alignItems: 'start' }}>

        {/* ════════════ LEFT PANEL ════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Big hero stat */}
          <GlassCard>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.72rem', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Flood Risk Score
            </p>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: C.text, lineHeight: 1.1 }}>
              {Math.min(99, Math.round(w.rainfall * 1.8 + (1 - 0.35) * 20))}
              <span style={{ fontSize: '1.2rem', color: C.textMuted, fontWeight: 500 }}>/100</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <div style={{ height: 6, flex: 1, borderRadius: 3, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(99, Math.round(w.rainfall * 1.8))}%`,
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${C.green}, ${riskColor})`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: riskColor, fontWeight: 700 }}>{riskLabel}</span>
            </div>
          </GlassCard>

          {/* Weather stats */}
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: C.text }}>Live Weather</span>
              <span style={{ fontSize: '1.4rem' }}>{w.conditionEmoji}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {[
                { icon: <Thermometer size={14} />, label: 'Temp', val: `${w.temp}°C`, color: C.orange, bg: C.orangeSoft },
                { icon: <CloudRain size={14} />, label: 'Rain', val: `${w.rainfall}mm/h`, color: C.cyan, bg: C.cyanSoft },
                { icon: <Droplets size={14} />, label: 'Humidity', val: `${w.humidity}%`, color: C.primary, bg: C.primarySoft },
                { icon: <Wind size={14} />, label: 'Wind', val: `${w.windSpeed}km/h`, color: C.green, bg: C.greenSoft },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '0.6rem 0.7rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ color: s.color }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: C.textMuted }}>{s.label}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: C.text }}>{s.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Zone summary */}
          <GlassCard>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: C.text }}>Zone Status</span>
              <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: C.textMuted }}>Visakhapatnam · {zones.length} zones</p>
            </div>
            {[
              { label: 'High Risk Zones', val: highZones.length, color: C.red, bg: C.redSoft },
              { label: 'Moderate Zones', val: medZones.length, color: C.orange, bg: C.orangeSoft },
              { label: 'Safe Zones', val: safeZones.length, color: C.green, bg: C.greenSoft },
              { label: 'People Affected', val: totalPop.toLocaleString(), color: C.primary, bg: C.primarySoft },
            ].map(z => (
              <div key={z.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 0.65rem', marginBottom: 6, borderRadius: 10,
                background: z.bg,
              }}>
                <span style={{ fontSize: '0.78rem', color: C.text }}>{z.label}</span>
                <strong style={{ fontSize: '0.9rem', color: z.color }}>{z.val}</strong>
              </div>
            ))}
          </GlassCard>

          {/* Safe routes */}
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
              <IconBubble icon={<Navigation size={15} />} color={C.cyan} bg={C.cyanSoft} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: C.text }}>Safe Routes</div>
                <div style={{ fontSize: '0.7rem', color: C.textMuted }}>{clearRoutes.length} routes clear</div>
              </div>
            </div>
            {safeRoutes.slice(0, 3).map(r => (
              <div
                key={r.id}
                onClick={() => setSelectedRouteId(r.id)}
                style={{
                  padding: '0.55rem 0.7rem', borderRadius: 10, marginBottom: 6, cursor: 'pointer',
                  background: selectedRouteId === r.id ? C.primarySoft : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${selectedRouteId === r.id ? C.borderStrong : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: C.text }}>{r.name.replace('Safe Route via ', '').replace('Alternate via ', '').replace('Avoid – ', '⚠ ')}</span>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: 6,
                    background: r.risk === 'high' ? C.redSoft : r.risk === 'medium' ? C.orangeSoft : C.greenSoft,
                    color: r.risk === 'high' ? C.red : r.risk === 'medium' ? C.orange : C.green,
                  }}>{r.risk.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: C.textMuted, marginTop: 2 }}>{r.distance} · {r.eta}</div>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* ════════════ CENTER — MAP ════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Map card */}
          <GlassCard style={{ padding: 0, overflow: 'hidden', height: 480, position: 'relative' }}>
            {/* Map overlay header */}
            <div style={{
              position: 'absolute', top: 16, left: 16, right: 16, zIndex: 999,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
                border: `1px solid ${C.border}`, borderRadius: 12,
                padding: '0.45rem 0.85rem',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: '0.8rem', fontWeight: 600, color: C.text,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              }}>
                <MapPin size={14} color={C.primary} />
                Visakhapatnam Live Flood Map
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
                border: `1px solid ${C.border}`, borderRadius: 12,
                padding: '0.35rem 0.75rem',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              }}>
                {[['high', C.red], ['medium', C.orange], ['low', C.green]].map(([lvl, clr]) => (
                  <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: clr as string }} />
                    <span style={{ fontSize: '0.7rem', color: C.text, textTransform: 'capitalize' }}>{lvl}</span>
                  </div>
                ))}
              </div>
            </div>

            <FloodMap
              zones={zones}
              routes={safeRoutes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
            />
          </GlassCard>

          {/* Bottom row — forecast pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
            {weatherData.forecast.map(f => (
              <GlassCard key={f.day} style={{ padding: '0.7rem 0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: 2 }}>{f.conditionEmoji}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: C.text }}>{f.day === 'Today' ? 'Today' : f.day === 'Tomorrow' ? 'Tmrw' : f.day.slice(0, 3)}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: C.text, margin: '3px 0' }}>{f.tempMax}°</div>
                <div style={{
                  fontSize: '0.6rem', fontWeight: 700,
                  color: f.risk === 'high' ? C.red : f.risk === 'medium' ? C.orange : C.green,
                }}>
                  {f.rainfall}mm
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* ════════════ RIGHT PANEL ════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Key metrics */}
          <GlassCard>
            <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: C.text }}>Key Metrics</span>
              <Activity size={14} color={C.primary} />
            </div>
            <StatRow label="Rainfall Intensity" value={`${w.rainfall} mm/h`} color={w.rainfall > 30 ? C.red : C.text} trend={w.rainfall > 20 ? 'up' : 'down'} />
            <StatRow label="Soil Saturation" value={`${Math.round(w.soilMoisture * 100)}%`} color={w.soilMoisture > 0.7 ? C.orange : C.green} />
            <StatRow label="Visibility" value={`${w.visibility} km`} color={C.text} />
            <StatRow label="Pressure" value={`${w.pressure} hPa`} color={C.text} />
            <StatRow label="Wind Speed" value={`${w.windSpeed} km/h`} color={C.text} />
          </GlassCard>

          {/* Circular progress indicators */}
          <GlassCard>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: C.text, display: 'block', marginBottom: '0.75rem' }}>Response Status</span>
            {[
              { label: 'Drainage Capacity', pct: Math.max(10, 100 - Math.round(w.rainfall * 1.8)), color: C.cyan },
              { label: 'Safe Route Coverage', pct: Math.round((clearRoutes.length / Math.max(1, safeRoutes.length)) * 100), color: C.green },
              { label: 'Alert Coverage', pct: Math.min(98, activeAlerts.length * 18 + 40), color: C.primary },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.75rem', color: C.textMuted }}>{item.label}</span>
                  <strong style={{ fontSize: '0.75rem', color: item.color }}>{item.pct}%</strong>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${item.pct}%`, borderRadius: 3,
                    background: item.color, transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            ))}
          </GlassCard>

          {/* Active alerts feed */}
          <GlassCard style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
              <IconBubble icon={<Bell size={14} />} color={C.red} bg={C.redSoft} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: C.text }}>Live Alerts</div>
                <div style={{ fontSize: '0.68rem', color: C.textMuted }}>{activeAlerts.length} active</div>
              </div>
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activeAlerts.slice(0, 5).map(a => (
                <div key={a.id} style={{
                  padding: '0.55rem 0.7rem', borderRadius: 10,
                  background: a.risk === 'high' ? C.redSoft : a.risk === 'medium' ? C.orangeSoft : C.greenSoft,
                  borderLeft: `3px solid ${a.risk === 'high' ? C.red : a.risk === 'medium' ? C.orange : C.green}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: a.risk === 'high' ? C.red : a.risk === 'medium' ? C.orange : C.green }}>
                      {a.area}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: C.textMuted }}>{a.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: C.text, lineHeight: 1.3 }}>
                    {a.message.slice(0, 70)}{a.message.length > 70 ? '…' : ''}
                  </p>
                </div>
              ))}
              {activeAlerts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1rem', color: C.green, fontSize: '0.8rem' }}>
                  <CheckCircle size={20} style={{ marginBottom: 4 }} />
                  <p style={{ margin: 0 }}>No active alerts</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Authority broadcasts */}
          {broadcastAlerts.filter(b => b.active).slice(0, 2).map(b => (
            <GlassCard key={b.id} style={{ padding: '0.85rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Megaphone size={14} color={b.risk === 'high' ? C.red : C.orange} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: b.risk === 'high' ? C.red : C.orange, marginBottom: 2 }}>
                      OFFICIAL · {b.area}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: C.text, lineHeight: 1.3 }}>
                      {b.message.slice(0, 80)}…
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => dismissBroadcast(b.id)}
                  style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: '0.7rem', flexShrink: 0 }}
                >
                  ✕
                </button>
              </div>
            </GlassCard>
          ))}

          {/* Quick action */}
          <GlassCard style={{ padding: '0.9rem 1rem', background: `linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))`, border: `1px solid ${C.borderStrong}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.6rem' }}>
              <Shield size={15} color={C.primary} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: C.text }}>Quick Actions</span>
            </div>
            {[
              { label: 'Report Incident', icon: <AlertTriangle size={13} />, color: C.red },
              { label: 'View Safe Routes', icon: <Navigation size={13} />, color: C.cyan },
              { label: 'Check Predictions', icon: <Eye size={13} />, color: C.primary },
            ].map(action => (
              <div key={action.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.45rem 0.6rem', borderRadius: 8, marginBottom: 4,
                background: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                transition: 'background 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: action.color, fontSize: '0.78rem', fontWeight: 600 }}>
                  {action.icon} {action.label}
                </div>
                <ChevronRight size={12} color={C.textMuted} />
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
