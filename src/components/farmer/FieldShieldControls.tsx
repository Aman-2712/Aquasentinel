'use client';
import type { RiskLevel } from '@/data/visakhapatnam_zones';

interface FieldShieldDevice {
  id: string;
  name: string;
  farmer: string;
  location: string;
  area: string;
  crop: string;
  risk: RiskLevel;
  shieldStatus: 'deployed' | 'idle' | 'error';
  waterLevel: number;
  soilMoisture: number;
  lastAction: string;
  deviceId: string;
}

interface FieldShieldControlsProps {
  fieldShields: FieldShieldDevice[];
  triggerDeviceShield: (id: string, action: 'deploy' | 'idle') => Promise<void>;
}

export default function FieldShieldControls({
  fieldShields,
  triggerDeviceShield,
}: FieldShieldControlsProps) {
  return (
    <div className="grid-3" style={{ gap: '1.25rem' }}>
      {fieldShields.map(fs => (
        <div key={fs.id} className="card" style={{ border: '1px solid rgba(0, 255, 136, 0.25)', background: 'rgba(5, 20, 15, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{fs.name}</span>
            <span className={`badge ${fs.shieldStatus === 'deployed' ? 'badge-safe' : fs.shieldStatus === 'error' ? 'badge-danger' : 'badge-warning'}`}>
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
  );
}
