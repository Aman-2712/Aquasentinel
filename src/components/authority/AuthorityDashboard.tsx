'use client';
import { useState, useEffect } from 'react';
import {
  Shield, Search, Radio, Send, CloudRain, Droplet,
  AlertTriangle, MessageSquare, LifeBuoy, CheckCircle,
  MapPin, TrendingUp, Clock, Activity, Droplets,
  LayoutDashboard, Radar, Zap
} from 'lucide-react';
import AuthorityAlertDispatcher from './AuthorityAlertDispatcher';
import WindyRadar from '@/components/radar/WindyRadar';
import { useFloodData } from '@/context/FloodDataContext';
import { VISAKHAPATNAM_ZONES } from '@/data/visakhapatnam_zones';
import { fetchComplaints, updateComplaintStatus as updateComplaintDB } from '@/lib/supabaseData';
import styles from './authority.module.css';

type Tab = 'overview' | 'radar' | 'dispatcher';

interface PublicComplaint {
  id: string;
  author: string;
  role: 'citizen' | 'farmer';
  location: string;
  category: string;
  description: string;
  timestamp: string;
  status: 'Pending' | 'Dispatched' | 'Resolved';
}

const INITIAL_COMPLAINTS: PublicComplaint[] = [
  {
    id: 'cmp-101',
    author: 'K. Satyanarayana',
    role: 'farmer',
    location: 'Anandapuram Paddy Sector 4',
    category: 'Crop Field Inundation',
    description: 'Irrigation canal overflowed. Water level rising rapidly near sluice gate 2.',
    timestamp: '10 mins ago',
    status: 'Pending',
  },
  {
    id: 'cmp-102',
    author: 'Priya Sharma',
    role: 'citizen',
    location: 'Poorna Market Underpass',
    category: 'Severe Drainage Clogging',
    description: 'Underpass flooded with 120cm water. 3 vehicles stranded, emergency clearance needed.',
    timestamp: '25 mins ago',
    status: 'Pending',
  },
];

export default function AuthorityDashboard() {
  const { weatherData } = useFloodData();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedZone, setSelectedZone] = useState('Poorna Market & Sub-Basins');
  const [targetAudience, setTargetAudience] = useState<'both' | 'citizens' | 'farmers'>('both');
  const [protectionAlertSent, setProtectionAlertSent] = useState(false);
  const [complaints, setComplaints] = useState<PublicComplaint[]>(INITIAL_COMPLAINTS);
  const [sosSent, setSosSent] = useState(false);

  // Load complaints from Supabase on mount
  useEffect(() => {
    (async () => {
      const db = await fetchComplaints();
      if (db && db.length > 0) setComplaints(db);
    })();
  }, []);

  const handleSendProtectionAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setProtectionAlertSent(true);
    setTimeout(() => setProtectionAlertSent(false), 4000);
  };

  const updateComplaintStatus = (id: string, newStatus: 'Pending' | 'Dispatched' | 'Resolved') => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    updateComplaintDB(id, newStatus);
  };

  const handleSOS = () => {
    setSosSent(true);
    setTimeout(() => setSosSent(false), 4000);
  };

  const pendingComplaints = complaints.filter(c => c.status === 'Pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: '#e4eaf4' }}>

      {/* Tab Bar */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard size={15} />
          <span>Overview</span>
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'radar' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('radar')}
        >
          <Radar size={15} />
          <span>Live Windy Radar</span>
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'dispatcher' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('dispatcher')}
        >
          <Zap size={15} />
          <span>Alert Dispatcher</span>
        </button>
        <div style={{ flex: 1 }} />
        <button className={styles.sosBtn} onClick={handleSOS} type="button">
          <AlertTriangle size={15} />
          <span>{sosSent ? 'SOS SENT!' : 'SOS Button'}</span>
        </button>
      </div>

      {/* ===================== TAB: OVERVIEW ===================== */}
      {activeTab === 'overview' && (
        <>
          {/* Top 3 Gauge Cards */}
          <div className="grid-3" style={{ gap: '1rem' }}>
            <div className={styles.gaugeCard}>
              <div className={styles.gaugeHeader}>
                <span className={styles.gaugeLabel}>Precipitation Level</span>
                <CloudRain size={18} color="#8ba8cc" />
              </div>
              <div className={styles.gaugeValue} style={{ color: '#e4eaf4' }}>
                {weatherData.current.rainfall} <span style={{ fontSize: '0.9rem', color: 'rgba(184,196,214,0.55)' }}>mm/h</span>
              </div>
              <span className={styles.gaugeStatus} style={{ color: weatherData.current.rainfall > 20 ? '#ff6450' : '#3cbe78' }}>
                {weatherData.current.rainfall > 20 ? 'Torrential Cloudburst' : 'Moderate Inflow'}
              </span>
            </div>

            <div className={styles.gaugeCard}>
              <div className={styles.gaugeHeader}>
                <span className={styles.gaugeLabel}>Soil Saturation Moisture</span>
                <Droplets size={18} color="#8ba8cc" />
              </div>
              <div className={styles.gaugeValue} style={{ color: '#e4eaf4' }}>
                {Math.round(weatherData.current.soilMoisture * 100)}%
              </div>
              <span className={styles.gaugeStatus} style={{ color: '#d4c39c' }}>
                Ground Moisture Index: High
              </span>
            </div>

            <div className={styles.gaugeCard}>
              <div className={styles.gaugeHeader}>
                <span className={styles.gaugeLabel}>Active Public Complaints</span>
                <MessageSquare size={18} color="#ff6450" />
              </div>
              <div className={styles.gaugeValue} style={{ color: '#ff6450' }}>
                {pendingComplaints} <span style={{ fontSize: '0.9rem', color: '#ff6450' }}>Pending</span>
              </div>
              <span className={styles.gaugeStatus} style={{ color: 'rgba(184,196,214,0.55)' }}>
                From Farmers & Citizens
              </span>
            </div>
          </div>

          {/* Main Grid: Risk Level + Water Detection */}
          <div className="grid-2" style={{ gap: '1.25rem' }}>

            {/* Panel 1: Risk Level Displayer */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h3 className={styles.panelTitle}>Risk Level Displayer & Sub-Zone Heatmap</h3>
                  <span className={styles.panelSubtitle}>Sub-zone risk levels and zone details</span>
                </div>
                <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>ACTIVE</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {VISAKHAPATNAM_ZONES.slice(0, 3).map((z, idx) => (
                  <div key={z.id} className={`${styles.zoneRow} ${styles[`zoneRow${z.risk.charAt(0).toUpperCase() + z.risk.slice(1)}`]}`}>
                    <div className={styles.zoneLeft}>
                      <MapPin size={18} color={z.risk === 'high' ? '#ff6450' : z.risk === 'medium' ? '#d4c39c' : '#3cbe78'} />
                      <div>
                        <span className={styles.zoneIndex}>Sub-Zone {idx + 1}</span>
                        <span className={styles.zoneName}>{z.name}</span>
                        <span className={styles.zoneStats}>
                          Est. Water Depth: {z.waterDepth}cm &bull; Pop. Affected: {z.populationAffected.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span className={`badge ${z.risk === 'high' ? 'badge-danger' : z.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`}>
                      {z.risk.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 2: Water Level Detection */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h3 className={styles.panelTitle}>Water Level Detection & Notifier</h3>
                  <span className={styles.panelSubtitle}>Flood rise rate and time-to-threshold estimate</span>
                </div>
                <Clock size={16} className={styles.panelIcon} />
              </div>

              <div className={styles.waterStats}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className={styles.waterStatLabel}>Peak Inundation Rate</span>
                  <TrendingUp size={16} color="#ff6450" />
                </div>
                <div className={styles.waterStatValue} style={{ color: '#ff6450' }}>
                  +14.2 cm/hr <span style={{ fontSize: '0.8rem', color: 'rgba(184,196,214,0.55)' }}>(Critical Rise)</span>
                </div>
                <span className={styles.waterStatSub} style={{ color: '#d4c39c' }}>
                  Time to critical overflow threshold: <strong>1 hr 45 mins</strong>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#e4eaf4', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Basin Drain Rate:</span>
                  <strong style={{ color: '#3cbe78' }}>4,200 Liters/sec</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#e4eaf4', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Current Basin Capacity:</span>
                  <strong style={{ color: '#ff6450' }}>88.4% Full</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Grid 2: Forecast + Alert Issuer */}
          <div className="grid-2" style={{ gap: '1.25rem' }}>

            {/* 7-Day Weather Forecast */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3 className={styles.panelTitle}>7-Day Weather Forecasting Trend</h3>
                <CloudRain size={16} className={styles.panelIcon} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                {weatherData.forecast.slice(0, 5).map((d, i) => (
                  <div key={d.day} className={`${styles.dayCard} ${i === 0 ? styles.dayCardToday : styles.dayCardOther}`}>
                    <span className={styles.dayLabel}>{d.day}</span>
                    <div className={styles.dayEmoji}>{d.conditionEmoji}</div>
                    <strong className={styles.dayTemp}>{d.tempMax}°C</strong>
                    <span className={styles.dayRain}>{d.rainfall}mm rain</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone Protection Alert Issuer */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h3 className={styles.panelTitle}>Zone Protection Alert Issuer</h3>
                  <span className={styles.panelSubtitle}>Send flood protection alerts to selected zones</span>
                </div>
                <Send size={16} className={styles.panelIcon} />
              </div>

              {protectionAlertSent && (
                <div className={styles.dispatchSuccess}>
                  Protection Notice Circulated to {selectedZone}!
                </div>
              )}

              <form onSubmit={handleSendProtectionAlert} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div>
                  <label style={{ fontSize: '0.73rem', color: 'rgba(184,196,214,0.55)', display: 'block', marginBottom: '0.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Target Zone:
                  </label>
                  <select
                    value={selectedZone}
                    onChange={e => setSelectedZone(e.target.value)}
                    className={styles.alertFormInput}
                  >
                    <option value="Poorna Market & Sub-Basins">Poorna Market & Sub-Basins</option>
                    <option value="Gajuwaka Industrial Belt">Gajuwaka Industrial Belt</option>
                    <option value="All Agricultural Sectors">All Agricultural Sectors</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.73rem', color: 'rgba(184,196,214,0.55)', display: 'block', marginBottom: '0.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Target Audience:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                    {(['both', 'citizens', 'farmers'] as const).map(aud => (
                      <button
                        key={aud}
                        type="button"
                        onClick={() => setTargetAudience(aud)}
                        className={`${styles.audienceBtn} ${targetAudience === aud ? styles.audienceBtnActive : ''}`}
                      >
                        {aud}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className={styles.dispatchBtn} style={{ padding: '0.6rem', fontSize: '0.82rem' }}>
                  <Send size={14} />
                  <span>Circulate Protection Alert</span>
                </button>
              </form>
            </div>
          </div>

          {/* Public Complaints Feed */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Public Complaints Feed (Citizens & Farmers)</h3>
                <span className={styles.panelSubtitle}>Submitted from Citizen & Farmer sectors</span>
              </div>
              <MessageSquare size={16} className={styles.panelIcon} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {complaints.map(cmp => (
                <div key={cmp.id} className={styles.complaintCard}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <strong style={{ fontSize: '0.875rem', color: '#e4eaf4' }}>{cmp.category}</strong>
                      <span className={`badge ${cmp.role === 'farmer' ? 'badge-warning' : 'badge-safe'}`} style={{ fontSize: '0.65rem' }}>
                        {cmp.role.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: 'rgba(184,196,214,0.55)' }}>&bull; {cmp.author} ({cmp.timestamp})</span>
                    </div>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: '#b8c4d6' }}>
                      {cmp.description}
                    </p>
                    <span style={{ fontSize: '0.725rem', color: '#8ba8cc' }}>Location: {cmp.location}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${cmp.status === 'Pending' ? 'badge-danger' : cmp.status === 'Dispatched' ? 'badge-warning' : 'badge-safe'}`}>
                      {cmp.status}
                    </span>
                    {cmp.status === 'Pending' && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.725rem' }}
                        onClick={() => updateComplaintStatus(cmp.id, 'Dispatched')}
                      >
                        Dispatch Team
                      </button>
                    )}
                    {cmp.status === 'Dispatched' && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.725rem', background: '#3cbe78', color: '#000' }}
                        onClick={() => updateComplaintStatus(cmp.id, 'Resolved')}
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ===================== TAB: RADAR ===================== */}
      {activeTab === 'radar' && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3 className={styles.panelTitle}>Live Windy.com Doppler Radar</h3>
              <span className={styles.panelSubtitle}>Real-time precipitation & wind pattern monitoring for Visakhapatnam</span>
            </div>
            <Radio size={16} className={styles.panelIcon} />
          </div>
          <WindyRadar />
        </div>
      )}

      {/* ===================== TAB: DISPATCHER ===================== */}
      {activeTab === 'dispatcher' && (
        <AuthorityAlertDispatcher />
      )}
    </div>
  );
}
