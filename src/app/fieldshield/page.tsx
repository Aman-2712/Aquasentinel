'use client';
import { useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { FIELD_SHIELDS } from '@/data/visakhapatnam_zones';
import { Shield, Activity, Wifi, Droplets, AlertTriangle, CheckCircle, XCircle, Loader, Zap } from 'lucide-react';
import styles from './fieldshield.module.css';
import Link from 'next/link';

type ShieldStatus = 'deployed' | 'idle' | 'error';

export default function FieldShieldPage() {
  const [fields, setFields] = useState(FIELD_SHIELDS);
  const [activating, setActivating] = useState<string | null>(null);

  const handleToggle = async (id: string, current: ShieldStatus) => {
    setActivating(id);
    await new Promise(r => setTimeout(r, 2000));
    setFields(prev => prev.map(f => f.id === id ? { ...f, shieldStatus: current === 'deployed' ? 'idle' : 'deployed' as ShieldStatus, lastAction: 'just now' } : f));
    setActivating(null);
  };

  const deployed = fields.filter(f => f.shieldStatus === 'deployed').length;
  const highRisk = fields.filter(f => f.risk === 'high').length;

  const STATUS_ICON = { deployed: CheckCircle, idle: Activity, error: XCircle };
  const STATUS_COLOR = { deployed: 'var(--clr-safe)', idle: 'var(--clr-primary)', error: 'var(--clr-danger)' };

  return (
    <ProtectedLayout>
        <div className="page-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 className="page-title">FieldShield – Agriculture Protection</h1>
              <p className="page-subtitle">IoT-powered field barrier system. Activate shields remotely to protect crops.</p>
            </div>
            <Link href="/fieldshield/status" className="btn btn-outline btn-sm">
              <Activity size={14} /> Live Status
            </Link>
          </div>

          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Fields', value: fields.length, icon: Shield, color: 'primary' },
              { label: 'Shields Deployed', value: deployed, icon: CheckCircle, color: 'safe' },
              { label: 'High Risk Fields', value: highRisk, icon: AlertTriangle, color: 'danger' },
              { label: 'Devices Online', value: fields.filter(f => f.shieldStatus !== 'error').length, icon: Wifi, color: 'primary' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`card ${styles.statCard}`}>
                  <div className={`${styles.statIcon} ${styles[`si_${s.color}`]}`}><Icon size={18} /></div>
                  <div>
                    <span className={styles.statVal}>{s.value}</span>
                    <span className={styles.statLabel}>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Module 2 Banner */}
          <div className={styles.module2Banner}>
            <div className={styles.module2Icon}><Zap size={24} /></div>
            <div className={styles.module2Text}>
              <strong>Module 2 – FieldShield IoT System</strong>
              <span>ESP32-CAM devices monitor fields and control L298N Motor Drivers via MQTT protocol to deploy physical barriers.</span>
            </div>
            <div className={styles.module2Steps}>
              {['Command Sent', 'ESP32 Receives', 'Motor Activates', 'Shield Deployed'].map((step, i) => (
                <div key={step} className={styles.module2Step}>
                  <span className={styles.module2StepNum}>{i + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Field Cards */}
          <div className="grid-2">
            {fields.map(field => {
              const StatusIcon = STATUS_ICON[field.shieldStatus];
              const isActivating = activating === field.id;
              return (
                <div key={field.id} className={`card ${styles.fieldCard} ${styles[`field_${field.risk}`]}`}>
                  <div className={styles.fieldHeader}>
                    <div>
                      <h3 className={styles.fieldName}>{field.name}</h3>
                      <span className={styles.fieldFarmer}>{field.farmer} • {field.location}</span>
                    </div>
                    <div className={styles.fieldBadges}>
                      <span className={`badge ${field.risk === 'high' ? 'badge-danger' : field.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`}>
                        {field.risk.toUpperCase()} RISK
                      </span>
                    </div>
                  </div>

                  <div className={styles.fieldMeta}>
                    <span>{field.area} • {field.crop}</span>
                    <span className={styles.deviceId}>Device: {field.deviceId}</span>
                  </div>

                  {/* Meters */}
                  <div className={styles.meters}>
                    <div className={styles.meter}>
                      <div className={styles.meterHeader}>
                        <Droplets size={13} />
                        <span>Water Level</span>
                        <span className={styles.meterVal}>{field.waterLevel}%</span>
                      </div>
                      <div className={styles.meterTrack}>
                        <div className={styles.meterFill} style={{
                          width: `${field.waterLevel}%`,
                          background: field.waterLevel > 70 ? 'var(--clr-danger)' : field.waterLevel > 45 ? 'var(--clr-warning)' : 'var(--clr-safe)'
                        }} />
                      </div>
                    </div>
                    <div className={styles.meter}>
                      <div className={styles.meterHeader}>
                        <Activity size={13} />
                        <span>Soil Moisture</span>
                        <span className={styles.meterVal}>{field.soilMoisture}%</span>
                      </div>
                      <div className={styles.meterTrack}>
                        <div className={styles.meterFill} style={{
                          width: `${field.soilMoisture}%`,
                          background: 'var(--clr-primary)'
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Shield Status + Control */}
                  <div className={styles.fieldControl}>
                    <div className={styles.shieldStatus} style={{ color: STATUS_COLOR[field.shieldStatus] }}>
                      <StatusIcon size={16} />
                      <span>Shield: <strong>{field.shieldStatus.toUpperCase()}</strong></span>
                      <span className={styles.lastAction}>({field.lastAction})</span>
                    </div>
                    <div className={styles.controlBtns}>
                      {field.shieldStatus === 'error' ? (
                        <button className="btn btn-outline btn-sm" onClick={() => handleToggle(field.id, field.shieldStatus)} disabled={isActivating}>
                          {isActivating ? <Loader size={14} className={styles.spin} /> : '🔄 Reset Device'}
                        </button>
                      ) : (
                        <button className={`btn btn-sm ${field.shieldStatus === 'deployed' ? 'btn-ghost' : 'btn-safe'}`} onClick={() => handleToggle(field.id, field.shieldStatus)} disabled={isActivating}>
                          {isActivating ? (
                            <><Loader size={14} className={styles.spin} /> {field.shieldStatus === 'deployed' ? 'Lowering...' : 'Deploying...'}</>
                          ) : field.shieldStatus === 'deployed' ? (
                            '⬇️ Disable Shield'
                          ) : (
                            <><Shield size={14} /> Activate Shield</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    </ProtectedLayout>
  );
}
