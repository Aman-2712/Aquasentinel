'use client';
import { Bell, Search, Wifi, CloudRain } from 'lucide-react';
import styles from './Navbar.module.css';
import { useAuth } from '@/context/AuthContext';
import { useFloodData } from '@/context/FloodDataContext';

export default function Navbar() {
  const { user } = useAuth();
  const { weatherMode, setWeatherMode, weatherData } = useFloodData();

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <div className={styles.statusPill}>
          <Wifi size={12} />
          <span style={{ marginRight: '0.2rem' }}>Mode:</span>
          <select 
            className={styles.simulationSelect} 
            value={weatherMode} 
            onChange={e => setWeatherMode(e.target.value as any)}
          >
            <option value="live">🌍 Live Weather</option>
            <option value="monsoon">🌧️ Heavy Monsoon</option>
            <option value="flash_flood">⛈️ Flash Flood</option>
            <option value="clear">☀️ Clear Skies</option>
          </select>
        </div>
        {weatherData.current.rainfall > 0 ? (
          <div className={styles.statusPill} style={{ background: 'rgba(255, 59, 48, 0.1)', borderColor: 'rgba(255, 59, 48, 0.2)', color: '#ff3b30' }}>
            <CloudRain size={12} />
            <span>Heavy Rain Alert – {weatherData.current.rainfall} mm/h</span>
          </div>
        ) : (
          <div className={styles.statusPill} style={{ background: 'rgba(48, 209, 88, 0.1)', borderColor: 'rgba(48, 209, 88, 0.2)', color: '#30d158' }}>
            <CloudRain size={12} style={{ opacity: 0.5 }} />
            <span>Weather Outlook Safe</span>
          </div>
        )}
      </div>

      <div className={styles.center}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Search area, alert, route..." />
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn}>
          <Bell size={18} />
          <span className={styles.notifBadge}>5</span>
        </button>
        {user && (
          <div className={styles.userChip}>
            <div className={styles.userDot} />
            <span>{user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
