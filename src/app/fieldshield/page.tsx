'use client';
import { useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { FIELD_SHIELDS } from '@/data/visakhapatnam_zones';
import {
  Shield, Activity, Droplets, AlertTriangle,
  CheckCircle, XCircle, Loader, Camera,
  RefreshCw, Maximize2, WifiOff, Wifi,
} from 'lucide-react';
import styles from './fieldshield.module.css';
import Link from 'next/link';

type ShieldStatus = 'deployed' | 'idle' | 'error';
type PageTab = 'shields' | 'cameras';

const CAM_FEEDS = [
  {
    id: 'cam-001',
    label: 'North Corner',
    deviceId: 'ESP-001',
    fieldName: 'North Face',
    lastUpdate: '12:32:30 pm',
    status: 'online' as const,
    waterAlert: true,
  },
  {
    id: 'cam-002',
    label: 'South Corner',
    deviceId: 'ESP-002',
    fieldName: 'South Face',
    lastUpdate: '12:32:30 pm',
    status: 'online' as const,
    waterAlert: false,
  },
  {
    id: 'cam-003',
    label: 'East Corner',
    deviceId: 'ESP-003',
    fieldName: 'East Face',
    lastUpdate: '12:32:30 pm',
    status: 'offline' as const,
    waterAlert: false,
  },
  {
    id: 'cam-004',
    label: 'West Corner',
    deviceId: 'ESP-004',
    fieldName: 'West Face',
    lastUpdate: '12:32:30 pm',
    status: 'offline' as const,
    waterAlert: false,
  },
];

// Unique simulated field backgrounds per camera
const CAM_BG: Record<string, string> = {
  'cam-001': 'linear-gradient(180deg, #2d4a1e 0%, #1a3410 40%, #0e2008 100%)',
  'cam-002': 'linear-gradient(180deg, #3a3010 0%, #26200a 50%, #151205 100%)',
  'cam-003': 'linear-gradient(180deg, #0a0a12 0%, #050510 60%, #020208 100%)',
  'cam-004': 'linear-gradient(180deg, #1a1208 0%, #120e05 50%, #0a0803 100%)',
};

export default function FieldShieldPage() {
  const [fields, setFields] = useState(FIELD_SHIELDS);
  const [activating, setActivating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PageTab>('shields');
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState<string | null>(null);

  const handleToggle = async (id: string, current: ShieldStatus) => {
    setActivating(id);
    await new Promise(r => setTimeout(r, 2000));
    setFields(prev =>
      prev.map(f =>
        f.id === id
          ? { ...f, shieldStatus: current === 'deployed' ? 'idle' : ('deployed' as ShieldStatus), lastAction: 'just now' }
          : f
      )
    );
    setActivating(null);
  };

  const handleRefresh = async (id: string) => {
    setRefreshing(id);
    await new Promise(r => setTimeout(r, 1500));
    setRefreshing(null);
  };

  const deployed = fields.filter(f => f.shieldStatus === 'deployed').length;
  const highRisk = fields.filter(f => f.risk === 'high').length;
  const liveCams = CAM_FEEDS.filter(c => c.status === 'online').length;

  const STATUS_ICON = { deployed: CheckCircle, idle: Activity, error: XCircle };
  const STATUS_COLOR = { deployed: 'var(--clr-safe)', idle: 'var(--clr-primary)', error: 'var(--clr-danger)' };

  const expandedCam = fullscreen ? CAM_FEEDS.find(c => c.id === fullscreen) : null;

  return (
    <ProtectedLayout>
      <div className="page-content">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
          <div>
            <h1 className="page-title">FieldShield – Agriculture Protection</h1>
            <p className="page-subtitle">IoT-powered field barrier system &amp; live camera monitoring.</p>
          </div>
          <Link href="/fieldshield/status" className="btn btn-outline btn-sm">
            <Activity size={14} /> Gate Control
          </Link>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
          {[
            { label: 'Total Fields', value: fields.length, icon: Shield, color: 'primary' },
            { label: 'Shields Active', value: deployed, icon: CheckCircle, color: 'safe' },
            { label: 'High Risk Fields', value: highRisk, icon: AlertTriangle, color: 'danger' },
            { label: 'Cameras Online', value: liveCams, icon: Camera, color: 'primary' },
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

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('shields')}
            className={styles.tabBtn}
            data-active={activeTab === 'shields'}
          >
            <Shield size={15} />
            Field Shields
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cameras')}
            className={styles.tabBtnCam}
            data-active={activeTab === 'cameras'}
          >
            <Camera size={15} />
            Cameras
            <span className={styles.livePill}>{liveCams} LIVE</span>
          </button>
        </div>

        {/* ── FIELD SHIELDS TAB ── */}
        {activeTab === 'shields' && (
          <div className="grid-2">
            {fields.map(field => {
              const StatusIcon = STATUS_ICON[field.shieldStatus];
              const isActivating = activating === field.id;
              return (
                <div key={field.id} className={`card ${styles.fieldCard} ${styles[`field_${field.risk}`]}`}>
                  <div className={styles.fieldHeader}>
                    <div>
                      <h3 className={styles.fieldName}>{field.name}</h3>
                    </div>
                    <span className={`badge ${field.risk === 'high' ? 'badge-danger' : field.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`}>
                      {field.risk.toUpperCase()} RISK
                    </span>
                  </div>

                  <div className={styles.fieldMeta}>
                    <span className={styles.deviceId}>Device: {field.deviceId}</span>
                  </div>

                  <div className={styles.meters}>
                    <div className={styles.meter}>
                      <div className={styles.meterHeader}>
                        <Droplets size={13} />
                        <span>Water Level</span>
                        <span className={styles.meterVal}>{field.waterLevel}%</span>
                      </div>
                      <div className={styles.meterTrack}>
                        <div className={styles.meterFill} style={{ width: `${field.waterLevel}%`, background: field.waterLevel > 70 ? 'var(--clr-danger)' : field.waterLevel > 45 ? 'var(--clr-warning)' : 'var(--clr-safe)' }} />
                      </div>
                    </div>
                    <div className={styles.meter}>
                      <div className={styles.meterHeader}>
                        <Activity size={13} />
                        <span>Soil Moisture</span>
                        <span className={styles.meterVal}>{field.soilMoisture}%</span>
                      </div>
                      <div className={styles.meterTrack}>
                        <div className={styles.meterFill} style={{ width: `${field.soilMoisture}%`, background: 'var(--clr-safe)' }} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.fieldControl}>
                    <div className={styles.shieldStatus} style={{ color: STATUS_COLOR[field.shieldStatus] }}>
                      <StatusIcon size={16} />
                      <span>Shield: <strong>{field.shieldStatus.toUpperCase()}</strong></span>
                      <span className={styles.lastAction}>({field.lastAction})</span>
                    </div>
                    <div>
                      {field.shieldStatus === 'error' ? (
                        <button className="btn btn-outline btn-sm" onClick={() => handleToggle(field.id, field.shieldStatus)} disabled={isActivating}>
                          {isActivating ? <Loader size={14} className={styles.spin} /> : '🔄 Reset Device'}
                        </button>
                      ) : (
                        <button
                          className={`btn btn-sm ${field.shieldStatus === 'deployed' ? 'btn-ghost' : 'btn-safe'}`}
                          onClick={() => handleToggle(field.id, field.shieldStatus)}
                          disabled={isActivating}
                        >
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
        )}

        {/* ── CAMERAS TAB ── */}
        {activeTab === 'cameras' && (
          <>
            {/* Fullscreen overlay */}
            {expandedCam && (
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
                onClick={() => setFullscreen(null)}
              >
                <div
                  style={{ width: '100%', maxWidth: '860px', background: '#111', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', overflow: 'hidden' }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ height: '460px', background: CAM_BG[expandedCam.id], position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {expandedCam.status === 'offline' && (
                      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                        <WifiOff size={40} style={{ marginBottom: 8 }} />
                        <div style={{ fontSize: '0.9rem' }}>Camera Offline</div>
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{expandedCam.label}</span>
                      {expandedCam.status === 'online'
                        ? <Wifi size={14} color="#00ff88" />
                        : <WifiOff size={14} color="#ff4444" />
                      }
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: expandedCam.status === 'online' ? 'rgba(0,255,136,0.9)' : 'rgba(255,68,68,0.9)', color: '#000' }}>
                        {expandedCam.status.toUpperCase()}
                      </span>
                    </div>
                    <button onClick={() => setFullscreen(null)} style={{ position: 'absolute', top: 10, right: 12, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem' }}>✕ Close</button>
                  </div>
                  <div style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    Camera: {expandedCam.deviceId} • {expandedCam.fieldName} • Last update: {expandedCam.lastUpdate}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={16} color="#00d4ff" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Live Camera Feeds</span>
            </div>

            <div className={styles.camGrid2}>
              {CAM_FEEDS.map(cam => {
                const isOffline = cam.status === 'offline';
                const isRefreshing = refreshing === cam.id;
                const camIdx = parseInt(cam.id.replace('cam-00', ''));

                return (
                  <div key={cam.id} className={styles.camCard2}>
                    {/* Card header */}
                    <div className={styles.camCardHeader}>
                      <span className={styles.camCardLabel}>{cam.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {isOffline ? <WifiOff size={13} color="#ff4444" /> : <Wifi size={13} color="#00ff88" />}
                        <span className={isOffline ? styles.camBadgeOffline : styles.camBadgeOnline}>
                          {isOffline ? 'OFFLINE' : 'ONLINE'}
                        </span>
                      </div>
                    </div>

                    {/* Feed area */}
                    <div className={styles.camFeedArea} style={{ background: CAM_BG[cam.id] }}>
                      {isRefreshing ? (
                        <div className={styles.camCenterMsg}>
                          <RefreshCw size={24} color="#00d4ff" style={{ animation: 'spin 0.8s linear infinite' }} />
                          <span style={{ color: '#00d4ff', fontSize: '0.8rem', marginTop: 6 }}>Reconnecting...</span>
                        </div>
                      ) : isOffline ? (
                        <div className={styles.camCenterMsg}>
                          <WifiOff size={28} color="rgba(255,255,255,0.25)" />
                          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', marginTop: 6 }}>Camera Offline</span>
                        </div>
                      ) : (
                        <>
                          {/* Subtle field scene texture */}
                          <div className={styles.camSceneOverlay} />
                          {/* Scan line */}
                          <div className={styles.camScanLine} />
                          {/* Water detection box */}
                          {cam.waterAlert && (
                            <div className={styles.camWaterBox}>
                              <span className={styles.camWaterLabel}>⚠ WATER DETECTED</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Refresh + Fullscreen buttons */}
                    <div className={styles.camBtnRow}>
                      <button
                        className={styles.camBtn}
                        onClick={() => handleRefresh(cam.id)}
                        disabled={isRefreshing}
                      >
                        <RefreshCw size={13} className={isRefreshing ? styles.spin : ''} />
                        Refresh
                      </button>
                      <button
                        className={styles.camBtn}
                        onClick={() => setFullscreen(cam.id)}
                      >
                        <Maximize2 size={13} />
                        Fullscreen
                      </button>
                    </div>

                    {/* Footer */}
                    <div className={styles.camFooter}>
                      Camera: {cam.deviceId} • Last update: {cam.lastUpdate}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </ProtectedLayout>
  );
}
