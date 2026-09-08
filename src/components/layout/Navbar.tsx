'use client';
import { useState } from 'react';
import { Bell, Search, Wifi, Megaphone, X, CheckCircle, AlertTriangle } from 'lucide-react';
import styles from './Navbar.module.css';
import { useAuth } from '@/context/AuthContext';
import { useFloodData } from '@/context/FloodDataContext';
import HackathonSimulatorModal from '@/components/demo/HackathonSimulatorModal';

export default function Navbar() {
  const { user } = useAuth();
  const { weatherMode, setWeatherMode, broadcastAlerts, dismissBroadcast, isSimulationActive } = useFloodData();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  const activeBroadcasts = broadcastAlerts.filter(b => b.active);

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        {/* Weather Scenario Simulation Switcher */}
        <div className={styles.statusPill}>
          <Wifi size={12} />
          <span style={{ marginRight: '0.2rem', fontSize: '0.775rem' }}>Scenario:</span>
          <select
            className={styles.simulationSelect}
            value={weatherMode}
            onChange={e => setWeatherMode(e.target.value as any)}
          >
            <option value="live">🌍 Live Open-Meteo</option>
            <option value="clear">☀️ Normal (Clear)</option>
            <option value="monsoon">🌧️ Moderate Rain</option>
            <option value="flash_flood">⛈️ Heavy Storm / Cyclone</option>
          </select>
        </div>

        {/* Hackathon Simulation Suite Quick Button */}
        <button
          onClick={() => setShowSimulator(true)}
          style={{
            background: isSimulationActive
              ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
              : 'linear-gradient(135deg, #ff4444 0%, #d97706 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.775rem',
            padding: '0.35rem 0.8rem',
            borderRadius: '999px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: isSimulationActive
              ? '0 0 16px rgba(239, 68, 68, 0.6)'
              : '0 2px 10px rgba(255, 68, 68, 0.35)',
            animation: isSimulationActive ? 'pulse 2s infinite' : 'none',
            whiteSpace: 'nowrap',
          }}
          title="Open Hackathon Demonstration Emergency Suite"
        >
          <AlertTriangle size={13} />
          <span>{isSimulationActive ? '🚨 SIMULATION ACTIVE' : '🚨 Simulate Emergency'}</span>
        </button>
      </div>

      <div className={styles.center}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Search Visakhapatnam zone, route, alert..." />
        </div>
      </div>

      <div className={styles.right} style={{ position: 'relative' }}>
        <button
          className={styles.iconBtn}
          title="Notifications & Authority Broadcasts"
          onClick={() => setShowNotifs(prev => !prev)}
          style={{ position: 'relative' }}
        >
          <Bell size={18} color={activeBroadcasts.length > 0 ? '#ffea00' : 'inherit'} />
          {activeBroadcasts.length > 0 && (
            <span className={styles.notifBadge}>{activeBroadcasts.length}</span>
          )}
        </button>

        {/* Notifications Popover Dropdown */}
        {showNotifs && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: '360px',
            maxHeight: '420px',
            overflowY: 'auto',
            background: 'rgba(10, 18, 30, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 214, 255, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
            padding: '1rem',
            zIndex: 9999,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Megaphone size={16} color="#ffaa00" />
                <strong style={{ fontSize: '0.9rem', color: '#fff' }}>Official Authority Broadcasts</strong>
              </div>
              <button
                onClick={() => setShowNotifs(false)}
                style={{ background: 'none', border: 'none', color: 'var(--clr-text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {activeBroadcasts.length === 0 ? (
              <div style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
                <CheckCircle size={24} color="#00ff88" style={{ marginBottom: '0.4rem' }} />
                <p style={{ margin: 0 }}>No active emergency broadcasts from authority.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {activeBroadcasts.map(b => (
                  <div
                    key={b.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '10px',
                      background: b.risk === 'high' ? 'rgba(255, 68, 68, 0.12)' : 'rgba(255, 170, 0, 0.12)',
                      borderLeft: `3px solid ${b.risk === 'high' ? '#ff4444' : '#ffaa00'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: b.risk === 'high' ? '#ff4444' : '#ffaa00' }}>
                        {b.area}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)' }}>{b.timestamp}</span>
                    </div>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: '#fff', lineHeight: 1.35 }}>
                      {b.message}
                    </p>
                    <button
                      onClick={() => dismissBroadcast(b.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--clr-text-muted)',
                        fontSize: '0.7rem',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        marginTop: '0.25rem',
                        padding: 0,
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {user && (
          <div className={styles.userChip}>
            <div className={styles.userDot} style={{ background: user.role === 'authority' ? '#ff4444' : user.role === 'farmer' ? '#00ff88' : '#2563eb' }} />
            <span>{user.name}</span>
            <span style={{
              fontSize: '0.7rem',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              background: user.role === 'authority' ? 'rgba(255,68,68,0.2)' : user.role === 'farmer' ? 'rgba(0,255,136,0.2)' : 'rgba(37,99,235,0.12)',
              color: user.role === 'authority' ? '#ff4444' : user.role === 'farmer' ? '#00ff88' : '#2563eb',
              marginLeft: '0.2rem',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}>
              {user.role}
            </span>
          </div>
        )}
      </div>

      <HackathonSimulatorModal isOpen={showSimulator} onClose={() => setShowSimulator(false)} />
    </header>
  );
}

