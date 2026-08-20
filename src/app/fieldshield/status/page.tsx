'use client';
import { useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { FIELD_SHIELDS } from '@/data/visakhapatnam_zones';
import { Wifi, WifiOff, CheckCircle, XCircle, Activity, RefreshCw } from 'lucide-react';
import styles from './status.module.css';

export default function ShieldStatusPage() {
  const [lastRefresh, setLastRefresh] = useState('just now');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setLastRefresh('just now');
    setRefreshing(false);
  };

  const STATUS_CONFIG = {
    deployed: { icon: CheckCircle, label: 'Shield Deployed', color: 'var(--clr-safe)', bg: 'var(--clr-safe-dim)', border: 'rgba(48,209,88,0.3)' },
    idle: { icon: Activity, label: 'Shield Idle', color: 'var(--clr-primary)', bg: 'var(--clr-primary-dim)', border: 'rgba(0,212,255,0.3)' },
    error: { icon: XCircle, label: 'Device Error', color: 'var(--clr-danger)', bg: 'var(--clr-danger-dim)', border: 'rgba(255,59,48,0.3)' },
  };

  const TIMELINE = [
    { time: '20:42', device: 'ESP-001', event: 'Shield UP – Bheemunipatnam Field', status: 'deployed' },
    { time: '20:38', device: 'ESP-001', event: 'Command Received via MQTT', status: 'idle' },
    { time: '20:35', device: 'ESP-001', event: 'High Risk Alert triggered', status: 'idle' },
    { time: '19:55', device: 'ESP-004', event: 'Device ERROR – Connection Lost', status: 'error' },
    { time: '19:20', device: 'ESP-002', event: 'Soil moisture threshold reached (72%)', status: 'idle' },
    { time: '18:10', device: 'ESP-003', event: 'Routine check – All OK', status: 'idle' },
  ];

  return (
    <ProtectedLayout>
        <div className="page-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 className="page-title">Shield Device Status</h1>
              <p className="page-subtitle">Real-time IoT device health and MQTT communication status</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? styles.spin : ''} />
              Refresh (Last: {lastRefresh})
            </button>
          </div>

          {/* Device Cards */}
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            {FIELD_SHIELDS.map(field => {
              const cfg = STATUS_CONFIG[field.shieldStatus];
              const StatusIcon = cfg.icon;
              return (
                <div key={field.id} className={`card ${styles.deviceCard}`} style={{ borderColor: cfg.border, background: `linear-gradient(145deg, ${cfg.bg}, rgba(7,18,40,0.98))` }}>
                  <div className={styles.deviceHeader}>
                    <div className={styles.deviceId}>
                      <div className={styles.deviceIcon} style={{ background: cfg.bg, color: cfg.color }}>
                        {field.shieldStatus !== 'error' ? <Wifi size={16} /> : <WifiOff size={16} />}
                      </div>
                      <div>
                        <span className={styles.deviceIdText}>{field.deviceId}</span>
                        <span className={styles.deviceName}>{field.name}</span>
                      </div>
                    </div>
                    <div className={styles.deviceStatus} style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
                      <StatusIcon size={14} />
                      <span>{cfg.label}</span>
                    </div>
                  </div>
                  <div className={styles.deviceGrid}>
                    <div className={styles.deviceMetric}>
                      <span className={styles.dml}>Location</span>
                      <span className={styles.dmv}>{field.location}</span>
                    </div>
                    <div className={styles.deviceMetric}>
                      <span className={styles.dml}>Farmer</span>
                      <span className={styles.dmv}>{field.farmer.split(' ')[0]}</span>
                    </div>
                    <div className={styles.deviceMetric}>
                      <span className={styles.dml}>Water Level</span>
                      <span className={styles.dmv} style={{ color: field.waterLevel > 70 ? 'var(--clr-danger)' : 'var(--clr-text)' }}>{field.waterLevel}%</span>
                    </div>
                    <div className={styles.deviceMetric}>
                      <span className={styles.dml}>Last Action</span>
                      <span className={styles.dmv}>{field.lastAction}</span>
                    </div>
                  </div>
                  {/* Signal strength */}
                  <div className={styles.signalRow}>
                    <span className={styles.signalLabel}>MQTT Signal</span>
                    <div className={styles.signalBars}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={styles.signalBar} style={{
                          height: `${i * 4 + 4}px`,
                          background: field.shieldStatus === 'error' ? (i <= 1 ? 'var(--clr-danger)' : 'rgba(255,255,255,0.1)') : (i <= (field.shieldStatus === 'deployed' ? 5 : 4) ? cfg.color : 'rgba(255,255,255,0.1)')
                        }} />
                      ))}
                    </div>
                    <span className={styles.signalText}>{field.shieldStatus === 'error' ? 'Poor' : field.shieldStatus === 'deployed' ? 'Excellent' : 'Good'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Event Timeline */}
          <div className="card">
            <h2 className={styles.timelineTitle}>📋 Event Timeline</h2>
            <div className={styles.timeline}>
              {TIMELINE.map((evt, i) => (
                <div key={i} className={styles.timelineItem}>
                  <div className={styles.timelineDot} style={{ background: STATUS_CONFIG[evt.status as keyof typeof STATUS_CONFIG].color }} />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <span className={styles.timelineDevice}>{evt.device}</span>
                      <span className={styles.timelineTime}>{evt.time}</span>
                    </div>
                    <p className={styles.timelineEvent}>{evt.event}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
