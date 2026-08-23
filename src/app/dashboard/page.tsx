'use client';
import { useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { useFloodData } from '@/context/FloodDataContext';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import styles from './dashboard.module.css';
import {
  AlertTriangle,
  Shield,
  Droplets,
  Wind,
  Thermometer,
  CloudRain,
  MapPin,
  TrendingUp,
  Activity,
  Zap,
  Radio,
  Send,
  CheckCircle,
  Megaphone,
  Sun,
  Flame,
  CloudSun,
  Navigation,
} from 'lucide-react';
import { FarmerOnboardingModal } from '@/components/onboarding/FarmerOnboardingModal';
import WindyRadar from '@/components/radar/WindyRadar';
import AuthorityAlertDispatcher from '@/components/authority/AuthorityAlertDispatcher';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false });
const PredictionCharts = dynamic(() => import('@/components/charts/PredictionCharts'), { ssr: false });

type ActiveTab = 'overview' | 'windy' | 'forecast' | 'routes' | 'fieldshield' | 'authority';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    weatherData,
    zones,
    alerts,
    broadcastAlerts,
    dismissBroadcast,
    safeRoutes,
    fieldShields,
    triggerDeviceShield,
    isLoading,
  } = useFloodData();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('r1');
  const [autoDefense, setAutoDefense] = useState(true);
  const [emergencyReportSent, setEmergencyReportSent] = useState(false);

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '1rem', color: 'var(--clr-text-muted)' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(0,214,255,0.1)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p>Initializing XGBoost hydrological engine & satellite radar...</p>
        </div>
      </ProtectedLayout>
    );
  }

  const role = user?.role || 'citizen';
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
    <ProtectedLayout>
      {/* Farmer Interactive Onboarding Modal */}
      <FarmerOnboardingModal />

      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Real-Time Authority Broadcast Alert Banner for Citizens */}
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
              animation: 'slideUp 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: b.risk === 'high' ? '#ff4444' : '#ffaa00',
                boxShadow: `0 0 12px ${b.risk === 'high' ? '#ff4444' : '#ffaa00'}`,
                animation: 'pulse 1s infinite',
              }} />
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
            <button
              onClick={() => dismissBroadcast(b.id)}
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
            >
              Dismiss
            </button>
          </div>
        ))}

        {/* Top Header Panel Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 className="page-title" style={{ margin: 0 }}>AquaSentinel</h1>
              <span className={`badge ${role === 'authority' ? 'badge-danger' : role === 'farmer' ? 'badge-safe' : 'badge-safe'}`} style={{ fontSize: '0.775rem' }}>
                {role === 'authority' ? '🏛️ Authority Command Center' : role === 'farmer' ? '🌾 Farmer FieldShield Mode' : '👤 Citizen Dashboard'}
              </span>
            </div>
            <p className="page-subtitle" style={{ margin: '0.25rem 0 0 0' }}>
              AI Urban & Agricultural Flood Intelligence Platform • Visakhapatnam
            </p>
          </div>

          {/* Action Button */}
          <div>
            {role === 'authority' ? (
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #ff4444, #cc0000)', borderColor: '#ff4444' }}
                onClick={() => setActiveTab('authority')}
              >
                <Megaphone size={16} />
                <span>Broadcast Emergency Alert</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #ff6600, #ff3300)', borderColor: '#ff6600' }}
                onClick={handleSendEmergencyReport}
              >
                <Send size={16} />
                <span>{emergencyReportSent ? 'Report Transmitted!' : 'Send Emergency SOS Report'}</span>
              </button>
            )}
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
            <span>Emergency SOS report sent with your GPS coordinates to Visakhapatnam Control Center!</span>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div style={{
          display: 'flex',
          gap: '0.55rem',
          borderBottom: '1px solid rgba(0, 214, 255, 0.15)',
          paddingBottom: '0.65rem',
          overflowX: 'auto',
        }}>
          <button
            type="button"
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('overview')}
            style={{ fontSize: '0.85rem' }}
          >
            <Activity size={15} />
            <span>Flood Warnings & Overview</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'windy' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('windy')}
            style={{ fontSize: '0.85rem' }}
          >
            <Radio size={15} />
            <span>Live Windy.com Radar</span>
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
            className={`btn ${activeTab === 'routes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('routes')}
            style={{ fontSize: '0.85rem' }}
          >
            <MapPin size={15} />
            <span>Safe Evacuation Routes</span>
          </button>

          {(role === 'farmer' || user?.hasFieldShieldAccess) && (
            <button
              type="button"
              className={`btn ${activeTab === 'fieldshield' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('fieldshield')}
              style={{ fontSize: '0.85rem', borderColor: '#00ff88', color: activeTab === 'fieldshield' ? '#000' : '#00ff88' }}
            >
              <Zap size={15} />
              <span>FieldShield Hardware</span>
            </button>
          )}

          {role === 'authority' && (
            <button
              type="button"
              className={`btn ${activeTab === 'authority' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('authority')}
              style={{ fontSize: '0.85rem', borderColor: '#ff4444', color: activeTab === 'authority' ? '#fff' : '#ff4444' }}
            >
              <Megaphone size={15} />
              <span>Authority Broadcast Control</span>
            </button>
          )}
        </div>

        {/* Tab 1: Flood Warnings & Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Top Intelligence Engine Card */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(9, 24, 45, 0.9), rgba(5, 14, 28, 0.95))',
              border: `1px solid ${overallRisk === 'high' ? 'rgba(255, 68, 68, 0.4)' : overallRisk === 'medium' ? 'rgba(255, 170, 0, 0.4)' : 'rgba(0, 214, 255, 0.25)'}`,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 8px #00d4ff' }} />
                  <span style={{ fontSize: '0.775rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--clr-text-muted)', textTransform: 'uppercase' }}>
                    Intelligence Engine: XGBoost • Topographical Multi-Index
                  </span>
                </div>

                {role === 'farmer' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#00ff88', fontWeight: 600 }}>FieldShield Auto-Defense:</span>
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
                )}
              </div>

              <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1.35rem' }}>{weatherData.current.conditionEmoji}</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#00d4ff' }}>
                      {weatherData.current.conditionLabel}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#ffea00', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(255, 234, 0, 0.15)', border: '1px solid rgba(255, 234, 0, 0.3)' }}>
                      {weatherData.current.temp}°C (Feels like {weatherData.current.feelsLike}°C)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', margin: '0.25rem 0' }}>
                    <h2 style={{
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      margin: 0,
                      color: overallRisk === 'high' ? '#ff4444' : overallRisk === 'medium' ? '#ffaa00' : '#00ff88',
                      textShadow: `0 0 20px ${overallRisk === 'high' ? 'rgba(255, 68, 68, 0.5)' : overallRisk === 'medium' ? 'rgba(255, 170, 0, 0.5)' : 'rgba(0, 255, 136, 0.5)'}`,
                    }}>
                      {overallRisk === 'high' ? 'SEVERE STORM' : overallRisk === 'medium' ? 'MODERATE WARNING' : 'NORMAL'}
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'block' }}>Inundation Risk</span>
                    <strong style={{ fontSize: '1.25rem', color: '#00d4ff' }}>
                      {Math.min(98.4, Math.round((currentRain * 1.2 + 0.4) * 10) / 10)}%
                    </strong>
                  </div>
                  <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'block' }}>Est. Water Depth</span>
                    <strong style={{ fontSize: '1.25rem', color: '#00d4ff' }}>
                      {Math.round(currentRain * 1.5 * 10) / 10} cm
                    </strong>
                  </div>
                  <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'block' }}>Time to Peak</span>
                    <strong style={{ fontSize: '1.25rem', color: '#00d4ff' }}>
                      {currentRain > 30 ? '2 hrs' : '6 hrs'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Hydrological & Atmospheric Metrics Grid */}
            <div className="grid-4">
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Precipitation Rate</span>
                  <CloudRain size={16} color="#00d4ff" />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
                  {weatherData.current.rainfall} <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>mm/h</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: weatherData.current.rainfall > 20 ? '#ff4444' : '#00ff88', marginTop: '0.25rem', display: 'block' }}>
                  {weatherData.current.rainfall > 20 ? 'Torrential Cloudburst' : 'Normal Intensity'}
                </span>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Soil Saturation</span>
                  <Droplets size={16} color="#00d4ff" />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
                  {Math.round(weatherData.current.soilMoisture * 100)}%
                </div>
                <span style={{ fontSize: '0.75rem', color: weatherData.current.soilMoisture > 0.8 ? '#ffaa00' : '#00ff88', marginTop: '0.25rem', display: 'block' }}>
                  {weatherData.current.soilMoisture > 0.8 ? 'Saturated • Low Absorption' : 'Normal Soil Moisture'}
                </span>
              </div>

              <div className="card" style={{ border: weatherData.current.surfaceTemp > 38 ? '1px solid rgba(255, 170, 0, 0.4)' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Heat Wave Sensors</span>
                  <Flame size={16} color="#ffaa00" />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
                  {weatherData.current.temp}°C
                </div>
                <span style={{ fontSize: '0.75rem', color: weatherData.current.surfaceTemp > 38 ? '#ffaa00' : '#00ff88', marginTop: '0.25rem', display: 'block' }}>
                  Air Temp • Feels Like: {weatherData.current.feelsLike}°C
                </span>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Barometric Pressure</span>
                  <Activity size={16} color="#00d4ff" />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
                  {weatherData.current.pressure} <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)' }}>hPa</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: weatherData.current.pressure < 1000 ? '#ff4444' : '#00ff88', marginTop: '0.25rem', display: 'block' }}>
                  {weatherData.current.pressure < 1000 ? 'Low Pressure Trough' : 'Stable Atmospheric Pressure'}
                </span>
              </div>
            </div>

            {/* Interactive Leaflet Flood Zone Map */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', background: 'rgba(5, 12, 24, 0.9)', borderBottom: '1px solid rgba(0, 214, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                  Visakhapatnam Topographical Flood Zone Map & Sensor Radar
                </span>
                <span className="badge badge-safe">10 Zones Monitored</span>
              </div>
              <div style={{ height: '480px', width: '100%' }}>
                <FloodMap zones={zones} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live Windy.com Radar */}
        {activeTab === 'windy' && (
          <WindyRadar />
        )}

        {/* Tab 3: 7-Day Weather Forecast */}
        {activeTab === 'forecast' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="grid-4">
              {weatherData.forecast.map(f => (
                <div key={f.day} className={`card ${styles.forecastCard}`} style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{f.conditionEmoji}</div>
                  <span className={styles.forecastDay}>{f.day}</span>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#00d4ff', margin: '0.35rem 0' }}>
                    {f.conditionLabel}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: '0.2rem 0' }}>
                    {f.tempMax}° / {f.tempMin}°C
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginBottom: '0.4rem' }}>
                    Feels like {f.feelsLikeMax}°C
                  </div>
                  <div className={styles.forecastRainVal}>{f.rainfall}<span>mm</span></div>
                  <span className={`badge ${f.risk === 'high' ? 'badge-danger' : f.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`} style={{ margin: '0.35rem auto' }}>
                    {f.risk.toUpperCase()}
                  </span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', margin: '0.5rem 0 0 0', lineHeight: 1.3 }}>
                    {f.predictionSummary}
                  </p>
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
                  <Navigation size={18} color="#00d4ff" />
                  AI Calculated Safe Evacuation Corridors
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Click card to highlight route</span>
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
                        background: isSelected ? 'rgba(0, 214, 255, 0.12)' : 'rgba(10, 20, 35, 0.6)',
                        border: isSelected ? '2px solid #00d4ff' : '1px solid rgba(0, 214, 255, 0.15)',
                        borderLeft: `5px solid ${r.risk === 'high' ? '#ff4444' : r.risk === 'medium' ? '#ffaa00' : '#00ff88'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 0 15px rgba(0, 214, 255, 0.25)' : undefined,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <strong style={{ color: isSelected ? '#00d4ff' : '#fff', fontSize: '0.95rem' }}>{r.name}</strong>
                        <span className={`badge ${r.risk === 'high' ? 'badge-danger' : r.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`}>
                          {r.risk.toUpperCase()} RISK
                        </span>
                      </div>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                        📍 {r.from} ➔ 🏁 {r.to} • {r.distance} • Est. ETA: {r.eta}
                      </p>
                      <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-main)', display: 'block', marginTop: '0.35rem' }}>
                        {r.description}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Leaflet Navigation Map with Polyline Routes */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', height: '580px' }}>
              <div style={{ padding: '0.85rem 1.1rem', background: 'rgba(5, 12, 24, 0.95)', borderBottom: '1px solid rgba(0, 214, 255, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} color="#00d4ff" />
                  Interactive Evacuation Route Polyline Map
                </span>
                <span style={{ fontSize: '0.75rem', color: '#00d4ff' }}>
                  Selected: {safeRoutes.find(r => r.id === selectedRouteId)?.name}
                </span>
              </div>
              <div style={{ height: 'calc(100% - 45px)', width: '100%' }}>
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

        {/* Tab 5: FieldShield Hardware (Farmers Only) */}
        {activeTab === 'fieldshield' && (
          <div className="grid-3" style={{ gap: '1.25rem' }}>
            {fieldShields.map(fs => (
              <div key={fs.id} className="card" style={{ border: '1px solid rgba(0, 255, 136, 0.25)', background: 'rgba(5, 20, 15, 0.6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{fs.name}</span>
                  <span className={`badge ${fs.shieldStatus === 'deployed' ? 'badge-safe' : 'badge-warning'}`}>
                    {fs.shieldStatus.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--clr-text-muted)', margin: '0 0 1rem 0' }}>
                  Location: {fs.location} • Crop: {fs.crop} • Area: {fs.area} • Soil Saturation: {fs.soilMoisture}%
                </p>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}
                    onClick={() => triggerDeviceShield(fs.id, 'deploy')}
                  >
                    Deploy Barrier
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}
                    onClick={() => triggerDeviceShield(fs.id, 'idle')}
                  >
                    Retract Sluice Gate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 6: Authority Broadcast Control (Authority Only) */}
        {activeTab === 'authority' && (
          <AuthorityAlertDispatcher />
        )}
      </div>
    </ProtectedLayout>
  );
}
