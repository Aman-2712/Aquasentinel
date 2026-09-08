'use client';
import type { RiskLevel } from '@/data/visakhapatnam_zones';
import styles from './FieldShieldControls.module.css';

interface FieldShieldDevice {
  id: string;
  name: string;
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
    <div className={styles.fieldShieldGrid}>
      {fieldShields.map(fs => (
        <div key={fs.id} className={styles.fieldShieldCard}>
          <div className={styles.fieldShieldHeader}>
            <span className={styles.fieldShieldName}>{fs.name}</span>
            <span className={`badge ${fs.shieldStatus === 'deployed' ? 'badge-safe' : fs.shieldStatus === 'error' ? 'badge-danger' : 'badge-warning'}`}>
              {fs.shieldStatus.toUpperCase()}
            </span>
          </div>
          <p className={styles.fieldShieldMeta}>
            Soil Saturation: {fs.soilMoisture}%
          </p>

          <div className={styles.fieldShieldActions}>
            <button
              type="button"
              className={`${styles.fieldShieldBtn} ${styles.fieldShieldBtnPrimary}`}
              onClick={() => triggerDeviceShield(fs.id, 'deploy')}
            >
              Deploy Barrier
            </button>
            <button
              type="button"
              className={`${styles.fieldShieldBtn} ${styles.fieldShieldBtnSecondary}`}
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
