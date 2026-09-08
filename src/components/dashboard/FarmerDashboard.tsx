'use client';
import { useState } from 'react';
import { useFloodData } from '@/context/FloodDataContext';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import styles from '@/app/dashboard/dashboard.module.css';
import {
  Sprout,
  Shield,
  Zap,
  Droplets,
  CloudRain,
  Activity,
  CheckCircle,
  Megaphone,
  Navigation,
  Send,
  AlertTriangle,
  Cpu,
} from 'lucide-react';
import { FarmerOnboardingModal } from '@/components/onboarding/FarmerOnboardingModal';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false });
const PredictionCharts = dynamic(() => import('@/components/charts/PredictionCharts'), { ssr: false });

type ActiveTab = 'overview' | 'fieldshield' | 'forecast' | 'routes';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const {
    weatherData,
    zones,
    broadcastAlerts,
    dismissBroadcast,
    fieldShields,
    triggerDeviceShield,
    safeRoutes,
  } = useFloodData();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [autoDefense, setAutoDefense] = useState(true);
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
      <FarmerOnboardingModal />

      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Farmer FieldShield Home</h1>
            <span className="badge badge-safe" style={{ fontSize: '0.775rem', background: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid #00ff88' }}>
              🌾 Farmer Dashboard
            </span>
          </div>
          <p className="page-subtitle" style={{ margin: '0.25rem 0 0 0' }}>
            Welcome, {user?.name || 'Farmer'} • Agricultural Flood Protection &amp; Remote Barrier Controls
          </p>
        </div>

        <div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #ff6600, #ff3300)', borderColor: '#ff6600' }}
            onClick={handleSendEmergencyReport}
          >
            <Send size={16} />
            <span>{emergencyReportSent ? 'Report Transmitted!' : 'Send Field SOS Emergency'}</span>
          </button>
        </div>
      </div>

      {emergencyReportSent && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          background: 'rgba(0, 255, 136, 0.15)',
          border: '1px solid #00ff88',
          color: '#00ff88',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <CheckCircle size={18} />
          <span>Emergency SOS report sent with your farmland GPS coordinates to Visakhapatnam Control Room!</span>
        </div>
      )}

      {/* FIELD STATUS OVERVIEW CARDS (Dedicated Farmer Feature) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(5, 30, 20, 0.9), rgba(3, 15, 10, 0.95))',
        border: '1px solid rgba(0, 255, 136, 0.35)',
        borderRadius: '20px',
        padding: '1.25rem',
        boxShadow: '0 8px 30px rgba(0, 255, 136, 0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(0, 255, 136, 0.2)', paddingBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sprout size={22} color="#00ff88" />
            <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>
              Live Field Status &amp; Crop Flood Risk
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.825rem', color: '#00ff88', fontWeight: 600 }}>FieldShield Auto-Defense:</span>
            <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoDefense}
                onChange={e => setAutoDefense(e.target.checked)}
                style={{ display: 'none' }}
              />
              <span style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: autoDefense ? '#00ff88' : 'rgba(255, 255, 255, 0.2)',
                display: 'inline-block',
                position: 'relative',
                transition: 'background 0.3s ease',
              }}>
                <span style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#000',
                  position: 'absolute',
                  top: 3,
                  left: autoDefense ? 23 : 3,
                  transition: 'left 0.3s ease',
                }} />
              </span>
            </label>
          </div>
        </div>

        {/* 4 Dedicated Field Status Indicators */}
        <div className="grid-4" style={{ gap: '0.85rem' }}>
          <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.775rem', color: 'var(--clr-text-muted)' }}>Soil Saturation</span>
              <Droplets size={16} color="#00ff88" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#00ff88' }}>
              {Math.round(weatherData.current.soilMoisture * 100)}%
            </div>
            <span style={{ fontSize: '0.725rem', color: weatherData.current.soilMoisture > 0.8 ? '#ffaa00' : '#00ff88', marginTop: '0.2rem', display: 'block' }}>
              {weatherData.current.soilMoisture > 0.8 ? '⚠️ High Saturation - Sluice Armed' : 'Optimal Moisture Level'}
            </span>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.775rem', color: 'var(--clr-text-muted)' }}>Field Water Height</span>
              <Activity size={16} color="#00d4ff" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#00d4ff' }}>
              {Math.round(currentRain * 0.8)} <span style={{ fontSize: '0.9rem' }}>cm</span>
            </div>
            <span style={{ fontSize: '0.725rem', color: 'var(--clr-text-muted)', marginTop: '0.2rem', display: 'block' }}>
              Anandapuram Paddy Field Plot #4
            </span>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.775rem', color: 'var(--clr-text-muted)' }}>Barrier State</span>
              <Shield size={16} color="#00ff88" />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              {fieldShields[0]?.shieldStatus === 'deployed' ? '🛡️ DEPLOYED' : '⚙️ READY'}
            </div>
            <span style={{ fontSize: '0.725rem', color: '#00ff88', marginTop: '0.2rem', display: 'block' }}>
              Hydraulic Flood Barriers Active
            </span>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.775rem', color: 'var(--clr-text-muted)' }}>Crop Protection</span>
              <Zap size={16} color="#ffea00" />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffea00' }}>
              96.8% Safe
            </div>
            <span style={{ fontSize: '0.725rem', color: 'var(--clr-text-muted)', marginTop: '0.2rem', display: 'block' }}>
              Sub-surface Drainage Open
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div style={{
        display: 'flex',
        gap: '0.55rem',
        borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
        paddingBottom: '0.65rem',
        overflowX: 'auto',
      }}>
        <button
          type="button"
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('overview')}
          style={{ fontSize: '0.85rem' }}
        >
          <AlertTriangle size={15} />
          <span>Farm Risk Overview</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'forecast' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('forecast')}
          style={{ fontSize: '0.85rem' }}
        >
          <CloudRain size={15} />
          <span>7-Day Weather Forecast</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'fieldshield' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('fieldshield')}
          style={{ fontSize: '0.85rem', borderColor: '#00ff88', color: activeTab === 'fieldshield' ? '#000' : '#00ff88' }}
        >
          <Zap size={15} />
          <span>FieldShield Hardware Controls</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'routes' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('routes')}
          style={{ fontSize: '0.85rem' }}
        >
          <Navigation size={15} />
          <span>Safe Evacuation Routes</span>
        </button>
      </div>

      {/* Tab 1: Farm Risk Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Risk Card */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(5, 25, 15, 0.9), rgba(3, 15, 10, 0.95))',
            border: `1px solid ${overallRisk === 'high' ? 'rgba(255, 68, 68, 0.4)' : overallRisk === 'medium' ? 'rgba(255, 170, 0, 0.4)' : 'rgba(0, 255, 136, 0.3)'}`,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}>
            <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '1.35rem' }}>{weatherData.current.conditionEmoji}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#00ff88' }}>
                    {weatherData.current.conditionLabel}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#ffea00', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(255, 234, 0, 0.15)', border: '1px solid rgba(255, 234, 0, 0.3)' }}>
                    {weatherData.current.temp}°C
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', margin: '0.25rem 0' }}>
                  <h2 style={{
                    fontSize: '2.2rem',
                    fontWeight: 800,
                    margin: 0,
                    color: overallRisk === 'high' ? '#ff4444' : overallRisk === 'medium' ? '#ffaa00' : '#00ff88',
                  }}>
                    {overallRisk === 'high' ? 'CRITICAL CROP RISK' : overallRisk === 'medium' ? 'MODERATE INUNDATION RISK' : 'FARMLAND SAFE'}
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
                <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'block' }}>Soil Moisture</span>
                  <strong style={{ fontSize: '1.25rem', color: '#00ff88' }}>
                    {Math.round(weatherData.current.soilMoisture * 100)}%
                  </strong>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'block' }}>Rainfall Rate</span>
                  <strong style={{ fontSize: '1.25rem', color: '#00d4ff' }}>
                    {weatherData.current.rainfall} mm/h
                  </strong>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'block' }}>Barrier Status</span>
                  <strong style={{ fontSize: '1.25rem', color: '#00ff88' }}>
                    {fieldShields[0]?.shieldStatus === 'deployed' ? 'Active' : 'Standby'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid-4">
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Precipitation</span>
                <CloudRain size={16} color="#00d4ff" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
                {weatherData.current.rainfall} <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>mm/h</span>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Soil Absorption</span>
                <Droplets size={16} color="#00ff88" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#00ff88' }}>
                {Math.round((1 - weatherData.current.soilMoisture) * 100)}% Left
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>High-Risk Zones</span>
                <AlertTriangle size={16} color="#ff4444" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ff4444' }}>
                {highRiskZones.length} Zones
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Clear Routes</span>
                <Navigation size={16} color="#00ff88" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#00ff88' }}>
                {safeRoutes.filter(r => r.risk === 'low').length} Routes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: FieldShield Controls */}
      {activeTab === 'fieldshield' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="grid-2" style={{ gap: '1.25rem' }}>
            {fieldShields.map(fs => (
              <div key={fs.id} className="card" style={{ border: '1px solid rgba(0, 255, 136, 0.3)', background: 'rgba(5, 20, 15, 0.7)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Cpu size={20} color="#00ff88" />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>{fs.name}</h3>
                    </div>
                  </div>
                  <span className={`badge ${fs.shieldStatus === 'deployed' ? 'badge-safe' : 'badge-warning'}`}>
                    {fs.shieldStatus.toUpperCase()}
                  </span>
                </div>

                <div className="grid-3" style={{ gap: '0.5rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', display: 'block' }}>Water Level</span>
                    <strong style={{ fontSize: '1rem', color: '#00d4ff' }}>{fs.waterLevel} cm</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', display: 'block' }}>Soil Moisture</span>
                    <strong style={{ fontSize: '1rem', color: '#00ff88' }}>{Math.round(fs.soilMoisture * 100)}%</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', display: 'block' }}>IoT Device ID</span>
                    <strong style={{ fontSize: '0.85rem', color: '#ffea00' }}>{fs.deviceId}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1, background: 'linear-gradient(135deg, #00ff88, #00b894)', color: '#000', justifyContent: 'center' }}
                    onClick={() => triggerDeviceShield(fs.id, 'deploy')}
                  >
                    <Shield size={16} /> Deploy Barrier
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => triggerDeviceShield(fs.id, 'idle')}
                  >
                    Retract Barrier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: 7-Day Forecast */}
      {activeTab === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="grid-4">
            {weatherData.forecast.map(f => (
              <div key={f.day} className={`card ${styles.forecastCard}`} style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{f.conditionEmoji}</div>
                <span className={styles.forecastDay}>{f.day}</span>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#00ff88', margin: '0.35rem 0' }}>
                  {f.conditionLabel}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: '0.2rem 0' }}>
                  {f.tempMax}° / {f.tempMin}°C
                </div>
                <div className={styles.forecastRainVal}>{f.rainfall}<span>mm</span></div>
                <span className={`badge ${f.risk === 'high' ? 'badge-danger' : f.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`} style={{ margin: '0.35rem auto' }}>
                  {f.risk.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          <PredictionCharts forecast={weatherData.forecast} zones={zones} />
        </div>
      )}

      {/* Tab 4: Safe Evacuation Routes */}
      {activeTab === 'routes' && (
        <div className="grid-2" style={{ gap: '1.25rem', alignItems: 'stretch' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Navigation size={18} color="#00ff88" />
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
                      background: isSelected ? 'rgba(0, 255, 136, 0.12)' : 'rgba(10, 20, 35, 0.6)',
                      border: isSelected ? '2px solid #00ff88' : '1px solid rgba(0, 255, 136, 0.15)',
                      borderLeft: `5px solid ${r.risk === 'high' ? '#ff4444' : r.risk === 'medium' ? '#ffaa00' : '#00ff88'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <strong style={{ color: isSelected ? '#00ff88' : '#fff', fontSize: '0.95rem' }}>{r.name}</strong>
                      <span className={`badge ${r.risk === 'high' ? 'badge-danger' : r.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`}>
                        {r.risk.toUpperCase()} RISK
                      </span>
                    </div>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                      📍 {r.from} ➔ 🏁 {r.to} • {r.distance} • ETA: {r.eta}
                    </p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-main)', display: 'block', marginTop: '0.35rem' }}>
                      {r.description}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', height: '580px' }}>
            <div style={{ height: '100%', width: '100%' }}>
              <FloodMap
                zones={zones}
                routes={safeRoutes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={(id) => setSelectedRouteId(id)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Official Municipal Broadcast Alert Banner - Bottom */}
      {broadcastAlerts.filter(b => b.active).map(b => (
        <div
          key={b.id}
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '14px',
            background: b.risk === 'high' ? 'rgba(255, 68, 68, 0.15)' : 'rgba(255, 170, 0, 0.15)',
            border: `1px solid ${b.risk === 'high' ? '#ff4444' : '#ffaa00'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            marginTop: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Megaphone size={20} color={b.risk === 'high' ? '#ff4444' : '#ffaa00'} />
            <div>
              <strong style={{ fontSize: '0.9rem', color: '#fff', display: 'block' }}>
                OFFICIAL MUNICIPAL BROADCAST • {b.area}
              </strong>
              <span style={{ fontSize: '0.825rem', color: 'var(--clr-text-main)' }}>
                {b.message}
              </span>
            </div>
          </div>
          <button onClick={() => dismissBroadcast(b.id)} className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
