'use client';
import dynamic from 'next/dynamic';
import { CloudRain, Droplets, Flame, Activity } from 'lucide-react';
import type { FloodZone, RiskLevel } from '@/data/visakhapatnam_zones';
import type { WeatherData } from '@/context/FloodDataContext';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false });

interface FloodOverviewProps {
  weatherData: WeatherData;
  zones: FloodZone[];
  overallRisk: 'high' | 'medium' | 'low';
  currentRain: number;
  autoDefense: boolean;
  setAutoDefense: (val: boolean) => void;
  role: string;
}

export default function FloodOverview({
  weatherData,
  zones,
  overallRisk,
  currentRain,
  autoDefense,
  setAutoDefense,
  role,
}: FloodOverviewProps) {
  return (
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
              Risk Assessment • Live & AI-Assisted
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
  );
}
