'use client';
import { Bell, Search, Wifi, CloudRain, Shield, Sparkles, UserCheck, Sprout, Building2 } from 'lucide-react';
import styles from './Navbar.module.css';
import { useAuth } from '@/context/AuthContext';
import { useFloodData } from '@/context/FloodDataContext';

export default function Navbar() {
  const { user, switchRole } = useAuth();
  const { weatherMode, setWeatherMode, weatherData } = useFloodData();

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        {/* Role Switcher Pill */}
        <div className={styles.statusPill} style={{ background: 'rgba(0, 214, 255, 0.08)', borderColor: 'rgba(0, 214, 255, 0.25)' }}>
          <Shield size={13} color="#00d4ff" />
          <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#00d4ff' }}>Panel View:</span>
          <select 
            className={styles.simulationSelect}
            value={user?.role || 'citizen'}
            onChange={e => switchRole(e.target.value as any)}
            style={{ fontWeight: 600 }}
          >
            <option value="citizen">👤 Citizen Dashboard</option>
            <option value="farmer">🌾 Farmer (FieldShield)</option>
            <option value="authority">🏛️ Authority Command Center</option>
          </select>
        </div>

        {/* Weather Scenario Switcher */}
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
      </div>

      <div className={styles.center}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Search Visakhapatnam zone, route, alert..." />
        </div>
      </div>

      <div className={styles.right}>
        {/* AI Advisory Button */}
        <button 
          type="button" 
          className="btn btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.4rem', border: '1px solid rgba(0, 214, 255, 0.3)', background: 'rgba(0, 214, 255, 0.1)', color: '#00d4ff' }}
        >
          <Sparkles size={14} />
          <span>AI Advisory</span>
        </button>

        <button className={styles.iconBtn} title="Notifications">
          <Bell size={18} />
          <span className={styles.notifBadge}>3</span>
        </button>

        {user && (
          <div className={styles.userChip}>
            <div className={styles.userDot} style={{ background: user.role === 'authority' ? '#ff4444' : user.role === 'farmer' ? '#00ff88' : '#00d4ff' }} />
            <span>{user.name}</span>
            <span style={{
              fontSize: '0.7rem',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              background: user.role === 'authority' ? 'rgba(255,68,68,0.2)' : user.role === 'farmer' ? 'rgba(0,255,136,0.2)' : 'rgba(0,214,255,0.2)',
              color: user.role === 'authority' ? '#ff4444' : user.role === 'farmer' ? '#00ff88' : '#00d4ff',
              marginLeft: '0.2rem',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}>
              {user.role}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
