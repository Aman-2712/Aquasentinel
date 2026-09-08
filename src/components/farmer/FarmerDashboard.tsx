'use client';
import FieldShieldControls from './FieldShieldControls';
import { Sprout, CheckCircle, Mail, AlertTriangle, Shield, Droplets } from 'lucide-react';
import type { WeatherData } from '@/context/FloodDataContext';
import { FIELD_SHIELDS } from '@/data/visakhapatnam_zones';

interface FarmerDashboardProps {
  weatherData: WeatherData;
  triggerDeviceShield: (id: string, action: 'deploy' | 'idle') => Promise<void>;
  fieldShieldRequested?: boolean;
}

export default function FarmerDashboard({
  weatherData,
  triggerDeviceShield,
  fieldShieldRequested,
}: FarmerDashboardProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Agro Banner */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, rgba(5, 30, 20, 0.9), rgba(3, 15, 10, 0.95))',
        border: '1px solid rgba(0, 255, 136, 0.35)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #00ff88, #009955)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            boxShadow: '0 0 15px rgba(0,255,136,0.4)'
          }}>
            <Sprout size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#fff', fontWeight: 800 }}>
                Farmer FieldShield Intelligence Sector
              </h2>
              <span className="badge badge-safe" style={{ fontSize: '0.7rem' }}>AGRICULTURE</span>
            </div>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.825rem', color: 'var(--clr-text-muted)' }}>
              IoT Soil Moisture Telemetry & Automated Flood Barriers
            </p>
          </div>
        </div>

        {fieldShieldRequested && (
          <div style={{
            padding: '0.65rem 1rem',
            borderRadius: '12px',
            background: 'rgba(0, 255, 136, 0.12)',
            border: '1px solid #00ff88',
            color: '#00ff88',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={16} />
            <span>FieldShield Lead Logged • aquasentinelfis@gmail.com</span>
          </div>
        )}
      </div>

      {/* Weather Agriculture Alert */}
      <div className="card" style={{ background: 'rgba(10, 25, 20, 0.6)', borderColor: 'rgba(0, 255, 136, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplets size={18} color="#00ff88" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>Soil Moisture & Crop Risk Status</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#00ff88' }}>
            Precipitation: {weatherData.current.rainfall} mm/h
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
          {weatherData.current.predictionSummary}
        </p>
      </div>

      {/* EXCLUSIVE FieldShield Hardware Controls */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={18} color="#00ff88" />
          FieldShield Automated Hardware Barriers
        </h3>
        <FieldShieldControls 
          fieldShields={FIELD_SHIELDS}
          triggerDeviceShield={triggerDeviceShield}
        />
      </div>

    </div>
  );
}
