'use client';
import { useState } from 'react';
import { useFloodData } from '@/context/FloodDataContext';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import styles from '@/app/dashboard/dashboard.module.css';
import {
  AlertTriangle,
  Droplets,
  CloudRain,
  Send,
  CheckCircle,
  Megaphone,
  Navigation,
} from 'lucide-react';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false });
const PredictionCharts = dynamic(() => import('@/components/charts/PredictionCharts'), { ssr: false });

type ActiveTab = 'overview' | 'forecast' | 'routes';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const {
    weatherData,
    zones,
    broadcastAlerts,
    dismissBroadcast,
    safeRoutes,
  } = useFloodData();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('r1');
  const [emergencyReportSent, setEmergencyReportSent] = useState(false);

  const currentRain = weatherData.current.rainfall;
  const highRiskZones = zones.filter(z => z.risk === 'high');
  const mediumRiskZones = zones.filter(z => z.risk === 'medium');

  let overallRisk: 'high' | 'medium' | 'low' = 'low';
  if (highRiskZones.length > 0 || currentRain > 40) overallRisk = 'high';
  else if (mediumRiskZones.length > 0 || currentRain > 10) overallRisk = 'medium';

  const handleSendEmergencyReport = () => {
    setEmergencyReportSent(true);
    setTimeout(() => setEmergencyReportSent(false), 4000);
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Citizen Safety Home</h1>
            <span className="badge badge-primary" style={{ fontSize: '0.775rem' }}>
              👤 Citizen Dashboard
            </span>
          </div>
          <p className="page-subtitle" style={{ margin: '0.25rem 0 0 0' }}>
            Welcome, {user?.name || 'Citizen'} • Real-Time Flood Intelligence &amp; Evacuation Center
          </p>
        </div>

        {/* SOS Button */}
        <button
          type="button"
          className="btn btn-danger"
          style={{ fontWeight: 700 }}
          onClick={handleSendEmergencyReport}
        >
          <Send size={16} />
          <span>{emergencyReportSent ? 'Report Transmitted!' : 'Send Emergency SOS Report'}</span>
        </button>
      </div>

      {/* SOS Success Banner */}
      {emergencyReportSent && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          background: 'var(--clr-safe-dim)',
          border: '1px solid var(--clr-safe)',
          color: 'var(--clr-safe)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
        }}>
          <CheckCircle size={18} />
          <span>Emergency SOS report sent with your GPS coordinates to Visakhapatnam Control Center!</span>
        </div>
      )}

      {/* ── Tab Bar ── */}
      <div style={{
        display: 'flex',
        gap: '0.55rem',
        borderBottom: '1px solid var(--clr-border)',
        paddingBottom: '0.65rem',
        overflowX: 'auto',
      }}>
        {([
          { id: 'overview', label: 'Flood Warnings', icon: <AlertTriangle size={15} /> },
          { id: 'forecast', label: '7-Day Weather Forecast', icon: <CloudRain size={15} /> },
          { id: 'routes',   label: 'Safe Evacuation Routes', icon: <Navigation size={15} /> },
        ] as const).map(tab => (
          <button
            key={tab.id}
            type="button"
            className="btn"
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontSize: '0.85rem',
              background: activeTab === tab.id ? 'var(--clr-primary)' : 'var(--clr-card)',
              color: activeTab === tab.id ? '#fff' : 'var(--clr-text-muted)',
              border: `1px solid ${activeTab === tab.id ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
              boxShadow: activeTab === tab.id ? 'var(--shadow-primary)' : 'none',
              fontWeight: 700,
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab 1: Flood Warnings ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Overall risk card */}
          <div className="card" style={{
            border: `1px solid ${overallRisk === 'high' ? 'var(--clr-danger)' : overallRisk === 'medium' ? 'var(--clr-warning)' : 'var(--clr-primary)'}`,
            borderLeft: `5px solid ${overallRisk === 'high' ? 'var(--clr-danger)' : overallRisk === 'medium' ? 'var(--clr-warning)' : 'var(--clr-primary)'}`,
          }}>
            <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '1.35rem' }}>{weatherData.current.conditionEmoji}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--clr-primary)' }}>
                    {weatherData.current.conditionLabel}
                  </span>
                  <span style={{
                    fontSize: '0.8rem',
                    color: 'var(--clr-primary)',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'var(--clr-primary-dim)',
                    border: '1px solid var(--clr-border)',
                  }}>
                    {weatherData.current.temp}°C
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', margin: '0.25rem 0' }}>
                  <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    margin: 0,
                    color: overallRisk === 'high' ? 'var(--clr-danger)' : overallRisk === 'medium' ? 'var(--clr-warning)' : 'var(--clr-primary)',
                  }}>
                    {overallRisk === 'high' ? 'SEVERE FLOOD RISK' : overallRisk === 'medium' ? 'MODERATE FLOOD WARNING' : 'NORMAL CONDITIONS'}
                  </h2>
                  <span className={`badge ${overallRisk === 'high' ? 'badge-danger' : overallRisk === 'medium' ? 'badge-warning' : 'badge-safe'}`}>
                    CODE {overallRisk === 'high' ? '2' : overallRisk === 'medium' ? '1' : '0'}
                  </span>
                </div>

                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.875rem', color: 'var(--clr-text-muted)', lineHeight: 1.4 }}>
                  {weatherData.current.predictionSummary}
                </p>
              </div>

              <div className="grid-3" style={{ gap: '0.75rem' }}>
                {[
                  { label: 'Inundation Risk', value: `${Math.min(98.4, Math.round((currentRain * 1.2 + 0.4) * 10) / 10)}%` },
                  { label: 'Est. Water Depth', value: `${Math.round(currentRain * 1.5 * 10) / 10} cm` },
                  { label: 'Time to Peak', value: currentRain > 30 ? '2 hrs' : '6 hrs' },
                ].map(stat => (
                  <div key={stat.label} style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: 'var(--clr-bg)',
                    border: '1px solid var(--clr-border)',
                  }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'block' }}>{stat.label}</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--clr-primary)' }}>{stat.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid-4">
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Rainfall Intensity</span>
                <CloudRain size={16} color="var(--clr-primary)" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--clr-text)' }}>
                {weatherData.current.rainfall} <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>mm/h</span>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Soil Absorption</span>
                <Droplets size={16} color="var(--clr-primary)" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--clr-text)' }}>
                {Math.round((1 - weatherData.current.soilMoisture) * 100)}% <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>Left</span>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>High-Risk Zones</span>
                <AlertTriangle size={16} color="var(--clr-danger)" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--clr-danger)' }}>
                {highRiskZones.length} <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>Zones</span>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Safe Routes</span>
                <Navigation size={16} color="var(--clr-primary)" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--clr-primary)' }}>
                {safeRoutes.filter(r => r.risk === 'low').length} <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>Clear</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: 7-Day Forecast ── */}
      {activeTab === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="grid-4">
            {weatherData.forecast.map(f => (
              <div key={f.day} className={`card ${styles.forecastCard}`} style={{ padding: '1.1rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{f.conditionEmoji}</div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--clr-text)' }}>{f.day}</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-primary)', margin: '0.3rem 0' }}>
                  {f.conditionLabel}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--clr-text)', margin: '0.15rem 0' }}>
                  {f.tempMax}° / {f.tempMin}°C
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginBottom: '0.35rem' }}>
                  Feels like {f.feelsLikeMax}°C
                </div>
                <div style={{ fontSize: '1rem', margin: '0.2rem 0', color: 'var(--clr-text)' }}>
                  {f.rainfall}<span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}> mm</span>
                </div>
                <span className={`badge ${f.risk === 'high' ? 'badge-danger' : f.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`} style={{ margin: '0.35rem auto' }}>
                  {f.risk.toUpperCase()} RISK
                </span>
                <p style={{ fontSize: '0.725rem', color: 'var(--clr-text-muted)', margin: '0.4rem 0 0 0', lineHeight: 1.35 }}>
                  {f.predictionSummary}
                </p>
              </div>
            ))}
          </div>
          <PredictionCharts forecast={weatherData.forecast} zones={zones} />
        </div>
      )}

      {/* ── Tab 3: Safe Evacuation Routes ── */}
      {activeTab === 'routes' && (
        <div className="grid-2" style={{ gap: '1.25rem', alignItems: 'stretch' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--clr-text)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Navigation size={18} color="var(--clr-primary)" />
                AI Calculated Safe Evacuation Corridors
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
              {safeRoutes.map(r => {
                const isSelected = selectedRouteId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRouteId(r.id)}
                    style={{
                      padding: '1rem',
                      borderRadius: '14px',
                      background: isSelected ? 'var(--clr-primary-dim)' : 'var(--clr-bg)',
                      border: isSelected
                        ? '2px solid var(--clr-primary)'
                        : '1px solid var(--clr-border)',
                      borderLeft: `5px solid ${r.risk === 'high' ? 'var(--clr-danger)' : r.risk === 'medium' ? 'var(--clr-warning)' : 'var(--clr-primary)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <strong style={{ color: isSelected ? 'var(--clr-primary)' : 'var(--clr-text)', fontSize: '0.95rem' }}>
                        {r.name}
                      </strong>
                      <span className={`badge ${r.risk === 'high' ? 'badge-danger' : r.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`}>
                        {r.risk.toUpperCase()} RISK
                      </span>
                    </div>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                      📍 {r.from} ➔ 🏁 {r.to} • {r.distance} • ETA: {r.eta}
                    </p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--clr-text)', display: 'block', marginTop: '0.35rem' }}>
                      {r.description}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', height: '580px' }}>
            <FloodMap
              zones={zones}
              routes={safeRoutes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
            />
          </div>
        </div>
      )}

      {/* ── Authority Broadcast Banners ── */}
      {broadcastAlerts.filter(b => b.active).map(b => (
        <div
          key={b.id}
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '14px',
            background: b.risk === 'high' ? 'var(--clr-danger-dim)' : 'var(--clr-warning-dim)',
            border: `1px solid ${b.risk === 'high' ? 'var(--clr-danger)' : 'var(--clr-warning)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: b.risk === 'high' ? 'var(--shadow-danger)' : '0 4px 20px var(--clr-warning-glow)',
            marginTop: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: b.risk === 'high' ? 'var(--clr-danger)' : 'var(--clr-warning)',
              boxShadow: `0 0 12px ${b.risk === 'high' ? 'var(--clr-danger-glow)' : 'var(--clr-warning-glow)'}`,
              animation: 'pulse-danger 1.5s infinite',
            }} />
            <Megaphone size={20} color={b.risk === 'high' ? 'var(--clr-danger)' : 'var(--clr-warning)'} />
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--clr-text)', display: 'block' }}>
                OFFICIAL MUNICIPAL BROADCAST • {b.area}
              </strong>
              <span style={{ fontSize: '0.825rem', color: 'var(--clr-text-muted)' }}>
                {b.message}
              </span>
            </div>
          </div>
          <button
            onClick={() => dismissBroadcast(b.id)}
            className="btn btn-ghost"
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', flexShrink: 0 }}
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
