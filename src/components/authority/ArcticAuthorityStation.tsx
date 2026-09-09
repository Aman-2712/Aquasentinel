'use client';
import { useState, useEffect } from 'react';
import { useFloodData } from '@/context/FloodDataContext';
import { useAuth } from '@/context/AuthContext';
import styles from './arcticAuthority.module.css';
import {
  ShieldAlert,
  Radio,
  Wifi,
  Satellite,
  Bot,
  Activity,
  Droplets,
  Thermometer,
  Sliders,
  Send,
  AlertTriangle,
  Play,
  Pause,
  LifeBuoy,
  Server,
  Layers,
  Sparkles,
  Megaphone,
  CheckCircle,
  Eye,
  RefreshCw,
  Bell,
  Menu,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import AuthorityAlertDispatcher from '@/components/authority/AuthorityAlertDispatcher';
import dynamic from 'next/dynamic';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false });

type StationTab = 'station_hub' | 'broadcasts' | 'dams' | 'sos_dispatch' | 'sensors';

interface SOSItem {
  id: string;
  name: string;
  phone: string;
  location: string;
  coords: string;
  time: string;
  status: 'pending' | 'dispatched' | 'resolved';
  assignedTeam?: string;
}

const MOCK_SOS: SOSItem[] = [
  { id: 'sos-1', name: 'Ravi Teja', phone: '+91 98480 12345', location: 'Poorna Market Main Street', coords: '17.7041° N, 83.2977° E', time: '4 mins ago', status: 'pending' },
  { id: 'sos-2', name: 'Srinivas Rao', phone: '+91 97001 98765', location: 'Gajuwaka Industrial Underpass', coords: '17.6868° N, 83.2185° E', time: '12 mins ago', status: 'dispatched', assignedTeam: 'NDRF Team Alpha (Boat 4)' },
  { id: 'sos-3', name: 'Lakshmi Devi', phone: '+91 91234 56789', location: 'Gopalapatnam Railway Colony', coords: '17.7400° N, 83.2300° E', time: '25 mins ago', status: 'resolved', assignedTeam: 'SDRF Unit 2' },
];

export default function ArcticAuthorityStation() {
  const { user } = useAuth();
  const { weatherData, xgboostPrediction, zones, isSimulationActive } = useFloodData();
  const [activeTab, setActiveTab] = useState<StationTab>('station_hub');
  const [sosList, setSosList] = useState<SOSItem[]>(MOCK_SOS);
  const [radarPlaying, setRadarPlaying] = useState(true);
  const [aiMessageIndex, setAiMessageIndex] = useState(0);
  const [damLevels, setDamLevels] = useState([
    { id: 'd1', name: 'Meghadrigeddha Reservoir', capacity: 88, dischargeRate: 450, status: 'Warning', sluiceGate: 65 },
    { id: 'd2', name: 'Thatipudi Reservoir', capacity: 74, dischargeRate: 220, status: 'Normal', sluiceGate: 35 },
    { id: 'd3', name: 'Raiwada Reservoir', capacity: 94, dischargeRate: 720, status: 'Critical', sluiceGate: 85 },
  ]);

  const aiMessages = [
    `Autonomous AI sentinel active. Cyclone depression front analyzed via 150 XGBoost decision trees (${xgboostPrediction.riskScore}% risk).`,
    `Doppler radar stream indicates heavy rain band converging over Poorna Market (${weatherData.current.rainfall} mm/h).`,
    `Dam discharge telemetry synced. Automated sluice gates opened at 65% on Meghadrigeddha Reservoir.`,
    `Evacuation corridors along Beach Road and IT Freeway marked clear for civil transit.`,
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAiMessageIndex(prev => (prev + 1) % aiMessages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [aiMessages.length]);

  const handleDispatchSOS = (id: string, team: string) => {
    setSosList(prev => prev.map(s => s.id === id ? { ...s, status: 'dispatched', assignedTeam: team } : s));
  };

  const handleUpdateGate = (id: string, newVal: number) => {
    setDamLevels(prev => prev.map(d => d.id === id ? { ...d, sluiceGate: newVal } : d));
  };

  const currentTemp = weatherData.current.temp || 26;
  const currentRain = weatherData.current.rainfall || 0;
  const currentPressure = weatherData.current.pressure || 1008;
  const currentHumidity = weatherData.current.humidity || 82;

  return (
    <div className={styles.commandStationWrapper}>
      {/* Top Holographic Navigation Bar */}
      <div className={styles.topNavHolo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #00f0ff, #0077ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 16px rgba(0, 240, 255, 0.4)',
            }}
          >
            <Satellite size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>
              AQUASENTINEL ARCTIC COMMAND
            </span>
            <span style={{ fontSize: '0.68rem', color: '#84abc9', display: 'block' }}>
              OFFICIAL DISASTER SURVEILLANCE • VISAKHAPATNAM METROPOLITAN
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'station_hub', label: 'Command Station HUD', icon: Activity },
            { id: 'broadcasts', label: 'Emergency Broadcasts', icon: Megaphone },
            { id: 'dams', label: 'Reservoir & Sluice Gates', icon: Droplets },
            { id: 'sos_dispatch', label: `Citizen SOS (${sosList.filter(s => s.status === 'pending').length})`, icon: LifeBuoy },
            { id: 'sensors', label: '47 IoT Sensor Grid', icon: Server },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`${styles.holoTabBtn} ${isActive ? styles.holoTabBtnActive : ''}`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: ARCTIC COMMAND STATION HUD (MATCHING THE REFERENCE IMAGE) */}
      {activeTab === 'station_hub' && (
        <div className={styles.stationStage}>
          {/* ================= LEFT FLANK: Satellite Dish + AI Avatar ================= */}
          <div className={styles.flankColumn}>
            {/* Top Left: Satellite Communication Panel */}
            <div className={styles.flankCard}>
              <div className={styles.flankCardHeader}>
                <span>SATELLITE RADAR PANEL</span>
                <div className={styles.signalBarGroup}>
                  <div className={`${styles.signalBar} ${styles.signalBarActive}`} style={{ height: '4px' }} />
                  <div className={`${styles.signalBar} ${styles.signalBarActive}`} style={{ height: '7px' }} />
                  <div className={`${styles.signalBar} ${styles.signalBarActive}`} style={{ height: '10px' }} />
                  <div className={`${styles.signalBar} ${styles.signalBarActive}`} style={{ height: '14px' }} />
                </div>
              </div>

              <div className={styles.satelliteDishWrap}>
                <div className={styles.radarRipples} />
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, rgba(0, 100, 200, 0.1) 70%)',
                    border: '1.5px solid rgba(0, 240, 255, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00f0ff',
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                  }}
                >
                  <Satellite size={28} />
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '10px', fontSize: '0.72rem', lineHeight: 1.5, marginTop: '0.5rem' }}>
                <div style={{ color: '#84abc9' }}>Satellite Link: <strong style={{ color: '#00f0ff' }}>INSAT-3DR</strong></div>
                <div style={{ color: '#84abc9' }}>Doppler Uplink: <strong style={{ color: '#fff' }}>14.24 GHz Ku</strong></div>
                <div style={{ color: '#00ff88', fontWeight: 700, marginTop: '2px' }}>● 100% SIGNAL SYNCHRONIZED</div>
              </div>
            </div>

            {/* Bottom Left: AI Environmental Assistant */}
            <div className={styles.flankCard}>
              <div className={styles.flankCardHeader}>
                <span>AI DISASTER ASSISTANT</span>
                <Sparkles size={14} color="#00f0ff" />
              </div>

              <div className={styles.aiAvatarWrap}>
                <div className={styles.aiHoloGlow}>
                  <Bot size={34} color="#00f0ff" />
                </div>
                <div className={styles.aiChatBubble}>
                  {aiMessages[aiMessageIndex]}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
                <button
                  onClick={() => setAiMessageIndex(prev => (prev + 1) % aiMessages.length)}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    borderRadius: '8px',
                    background: 'rgba(0, 214, 255, 0.15)',
                    border: '1px solid rgba(0, 214, 255, 0.4)',
                    color: '#00f0ff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Refresh Insights
                </button>
              </div>
            </div>
          </div>

          {/* ================= CENTRAL COMMAND HUB ================= */}
          <div className={styles.centralHubCard}>
            {/* Header */}
            <div className={styles.stationHeader}>
              <div>
                <h1 className={styles.stationTitle}>ARCTIC DISASTER SURVEILLANCE &amp; COMMAND STATION</h1>
                <p className={styles.stationSubtitle}>
                  VISAKHAPATNAM HYDROLOGICAL RADAR MESH • SECTOR 01 TO 10 MONITORING
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(0, 214, 255, 0.15)', border: '1px solid rgba(0, 240, 255, 0.4)', borderRadius: '10px', padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, color: '#00f0ff' }}>
                  DASHBOARD LIVE
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px', color: '#fff', cursor: 'pointer' }}>
                    <Bell size={15} />
                  </button>
                  <button style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px', color: '#fff', cursor: 'pointer' }}>
                    <Menu size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Top Grid: Climate Observation Wave + Thermometer & Barometer Sensor */}
            <div className={styles.consoleGrid}>
              {/* Module 1: Climate & Hydrological Observation */}
              <div className={styles.moduleBox}>
                <div className={styles.moduleHeader}>
                  <span>CLIMATE &amp; HYDROLOGICAL OBSERVATION</span>
                  <span style={{ color: '#00f0ff' }}>{currentRain} mm/hr</span>
                </div>

                {/* Glowing Sine / Wave Graphic */}
                <div className={styles.waveContainer}>
                  <svg viewBox="0 0 400 120" className={styles.waveSvg} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#0077ff" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="glow" />
                        <feMerge>
                          <feMergeNode in="glow" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Smooth sine wave curve matching reference image */}
                    <path
                      d="M 0 75 Q 50 15, 100 65 T 200 45 T 300 80 T 400 35 L 400 120 L 0 120 Z"
                      fill="url(#waveGradient)"
                    />
                    <path
                      d="M 0 75 Q 50 15, 100 65 T 200 45 T 300 80 T 400 35"
                      fill="none"
                      stroke="#00f0ff"
                      strokeWidth="3"
                      filter="url(#glowEffect)"
                    />

                    {/* Peak Dot */}
                    <circle cx="200" cy="45" r="4.5" fill="#ffffff" filter="url(#glowEffect)" />
                    <circle cx="300" cy="80" r="4" fill="#00f0ff" />
                  </svg>
                </div>

                {/* Day Labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#84abc9', marginTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.3rem' }}>
                  <span>Sun (12mm)</span>
                  <span>Mon (48mm)</span>
                  <span style={{ color: '#00f0ff', fontWeight: 700 }}>Tue (Today: {currentRain}mm)</span>
                  <span>Wed (18mm)</span>
                  <span>Thu (5mm)</span>
                </div>
              </div>

              {/* Module 2: Temperature & Barometric Sensor */}
              <div className={styles.moduleBox}>
                <div className={styles.moduleHeader}>
                  <span>TEMPERATURE &amp; SENSORS</span>
                  <span style={{ color: '#fff' }}>{currentTemp}°C</span>
                </div>

                <div className={styles.thermometerWrap}>
                  <div className={styles.thermoScale}>
                    <span>+45°C</span>
                    <span>+30°C</span>
                    <span>+15°C</span>
                    <span>-02°C</span>
                  </div>

                  <div className={styles.thermoBarContainer}>
                    <div className={styles.thermoLiquid} style={{ height: `${Math.min(100, Math.max(15, ((currentTemp + 5) / 50) * 100))}%` }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.72rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '4px 8px', borderRadius: '6px' }}>
                      <span style={{ color: '#84abc9' }}>Pressure:</span> <strong style={{ color: '#00f0ff' }}>{currentPressure} hPa</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '4px 8px', borderRadius: '6px' }}>
                      <span style={{ color: '#84abc9' }}>Humidity:</span> <strong style={{ color: '#fff' }}>{currentHumidity}%</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '4px 8px', borderRadius: '6px' }}>
                      <span style={{ color: '#84abc9' }}>Soil Saturation:</span> <strong style={{ color: '#00ff88' }}>96%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Grid: Scientific Interface Logs + Inundation Monitoring Analytics & Satellite Imagery */}
            <div className={styles.consoleGrid}>
              {/* Module 3: Scientific Research & Incident Interface */}
              <div className={styles.moduleBox}>
                <div className={styles.moduleHeader}>
                  <span>SCIENTIFIC INCIDENT INTERFACE</span>
                  <span style={{ color: '#00ff88' }}>● 14 LIVE TELEMETRY LOGS</span>
                </div>

                <div className={styles.logStreamList}>
                  <div className={`${styles.logStreamItem} ${styles.logStreamItemCritical}`}>
                    <span>[07:15 AM]</span>
                    <strong>POORNA MARKET:</strong> Water level 84cm. Automated barrier triggered.
                  </div>
                  <div className={styles.logStreamItem}>
                    <span>[08:00 AM]</span>
                    <strong>MEGHADRIGEDDHA:</strong> Sluice gate opened to 65% (450 cusecs discharge).
                  </div>
                  <div className={styles.logStreamItem}>
                    <span>[08:45 AM]</span>
                    <strong>GAJUWAKA:</strong> NDRF Rapid Response Boat 4 stationed at Underpass.
                  </div>
                  <div className={styles.logStreamItem}>
                    <span>[09:20 AM]</span>
                    <strong>BEACH ROAD:</strong> Coastal corridor marked 100% passable.
                  </div>
                  <div className={styles.logStreamItem}>
                    <span>[10:10 AM]</span>
                    <strong>SENSOR 32:</strong> Madhurawada runoff velocity nominal (12cm/s).
                  </div>
                </div>
              </div>

              {/* Module 4: Flood & Inundation Monitoring Analytics */}
              <div className={styles.moduleBox}>
                <div className={styles.moduleHeader}>
                  <span>INUNDATION ANALYTICS</span>
                  <span style={{ color: '#00f0ff' }}>XGBoost: {xgboostPrediction.riskScore}%</span>
                </div>

                {/* Satellite Imagery / Wave Preview */}
                <div className={styles.satelliteTileWrap}>
                  <div className={styles.satelliteImgBox}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80" alt="Satellite Coast" />
                    <span className={styles.satelliteImgBadge}>DOPPLER RADAR</span>
                  </div>
                  <div className={styles.satelliteImgBox}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80" alt="Storm Clouds" />
                    <span className={styles.satelliteImgBadge}>SATELLITE INFRARED</span>
                  </div>
                </div>

                {/* Zone Inundation Depth Spectrum */}
                <div style={{ marginTop: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#84abc9', marginBottom: '0.2rem' }}>
                    <span>Poorna Market (84cm)</span>
                    <span>Gajuwaka (72cm)</span>
                    <span>MVP Colony (22cm)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', display: 'flex', gap: '2px' }}>
                    <div style={{ width: '40%', height: '100%', background: '#ff4444' }} />
                    <div style={{ width: '35%', height: '100%', background: '#ffaa00' }} />
                    <div style={{ width: '25%', height: '100%', background: '#00ff88' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT FLANK: Satellite Communication + Uplink ================= */}
          <div className={styles.flankColumn}>
            {/* Top Right: Satellite Communication Panel */}
            <div className={styles.flankCard}>
              <div className={styles.flankCardHeader}>
                <span>SATELLITE TELEMETRY</span>
                <div className={styles.signalBarGroup}>
                  <div className={`${styles.signalBar} ${styles.signalBarActive}`} style={{ height: '4px' }} />
                  <div className={`${styles.signalBar} ${styles.signalBarActive}`} style={{ height: '7px' }} />
                  <div className={`${styles.signalBar} ${styles.signalBarActive}`} style={{ height: '10px' }} />
                  <div className={`${styles.signalBar} ${styles.signalBarActive}`} style={{ height: '14px' }} />
                </div>
              </div>

              <div className={styles.satelliteDishWrap}>
                <div className={styles.radarRipples} />
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, rgba(0, 100, 200, 0.1) 70%)',
                    border: '1.5px solid rgba(0, 240, 255, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00f0ff',
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                  }}
                >
                  <Radio size={28} />
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '10px', fontSize: '0.72rem', lineHeight: 1.5, marginTop: '0.5rem' }}>
                <div style={{ color: '#84abc9' }}>Frequency Lock: <strong style={{ color: '#00f0ff' }}>156.800 MHz</strong></div>
                <div style={{ color: '#84abc9' }}>Bandwidth: <strong style={{ color: '#fff' }}>1.8 Gbps Telemetry</strong></div>
                <div style={{ color: '#00ff88', fontWeight: 700, marginTop: '2px' }}>● SDRF / NDRF ACTIVE CHANNEL</div>
              </div>
            </div>

            {/* Bottom Right: Emergency Command Actions */}
            <div className={styles.flankCard}>
              <div className={styles.flankCardHeader}>
                <span>COMMAND DIRECTIVES</span>
                <ShieldAlert size={14} color="#ff4444" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  onClick={() => setActiveTab('broadcasts')}
                  style={{
                    padding: '0.65rem 0.8rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(255, 68, 68, 0.25), rgba(217, 119, 6, 0.25))',
                    border: '1.5px solid #ff4444',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 0 16px rgba(255, 68, 68, 0.25)',
                  }}
                >
                  <Megaphone size={14} />
                  <span>Send Municipal Broadcast</span>
                </button>

                <button
                  onClick={() => setActiveTab('dams')}
                  style={{
                    padding: '0.65rem 0.8rem',
                    borderRadius: '10px',
                    background: 'rgba(0, 214, 255, 0.12)',
                    border: '1.5px solid rgba(0, 214, 255, 0.4)',
                    color: '#00f0ff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Droplets size={14} />
                  <span>Dam Sluice Gate Control</span>
                </button>

                <button
                  onClick={() => setActiveTab('sos_dispatch')}
                  style={{
                    padding: '0.65rem 0.8rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <LifeBuoy size={14} />
                  <span>Citizen SOS ({sosList.filter(s => s.status === 'pending').length} Pending)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: EMERGENCY BROADCAST DISPATCHER */}
      {activeTab === 'broadcasts' && (
        <div style={{ background: 'rgba(10, 25, 48, 0.75)', backdropFilter: 'blur(24px)', border: '1.5px solid rgba(180, 235, 255, 0.35)', borderRadius: '24px', padding: '1.5rem' }}>
          <AuthorityAlertDispatcher />
        </div>
      )}

      {/* VIEW 3: RESERVOIR & SLUICE GATE CONTROL */}
      {activeTab === 'dams' && (
        <div style={{ background: 'rgba(10, 25, 48, 0.75)', backdropFilter: 'blur(24px)', border: '1.5px solid rgba(180, 235, 255, 0.35)', borderRadius: '24px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplets size={20} color="#00f0ff" />
            <span>Reservoir Inundation &amp; Hydraulic Sluice Gate Mesh</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {damLevels.map(dam => (
              <div
                key={dam.id}
                style={{
                  background: 'rgba(16, 36, 66, 0.65)',
                  border: `1.5px solid ${dam.status === 'Critical' ? '#ff4444' : dam.status === 'Warning' ? '#ffaa00' : 'rgba(0, 240, 255, 0.35)'}`,
                  borderRadius: '16px',
                  padding: '1.2rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{dam.name}</strong>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: dam.status === 'Critical' ? '#ff4444' : dam.status === 'Warning' ? '#ffaa00' : '#00ff88', color: '#000' }}>
                    {dam.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#84abc9', marginBottom: '0.3rem' }}>
                    <span>Capacity Filled:</span>
                    <strong style={{ color: dam.capacity > 85 ? '#ff4444' : '#fff' }}>{dam.capacity}%</strong>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${dam.capacity}%`, background: dam.capacity > 85 ? '#ff4444' : '#00f0ff' }} />
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#84abc9', marginBottom: '1rem' }}>
                  Discharge Rate: <strong style={{ color: '#fff' }}>{dam.dischargeRate} cusecs</strong>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fff', marginBottom: '0.4rem' }}>
                    <span>Sluice Gate Opening:</span>
                    <strong style={{ color: '#00f0ff' }}>{dam.sluiceGate}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={dam.sluiceGate}
                    onChange={e => handleUpdateGate(dam.id, parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#00f0ff' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: CITIZEN SOS & RESCUE DISPATCH */}
      {activeTab === 'sos_dispatch' && (
        <div style={{ background: 'rgba(10, 25, 48, 0.75)', backdropFilter: 'blur(24px)', border: '1.5px solid rgba(180, 235, 255, 0.35)', borderRadius: '24px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LifeBuoy size={20} color="#ff4444" />
            <span>Emergency Citizen SOS &amp; NDRF Rapid Deployment</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {sosList.map(sos => (
              <div
                key={sos.id}
                style={{
                  background: 'rgba(16, 36, 66, 0.65)',
                  border: `1px solid ${sos.status === 'pending' ? 'rgba(255, 68, 68, 0.4)' : 'rgba(0, 255, 136, 0.3)'}`,
                  borderRadius: '14px',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{sos.name}</strong>
                    <span style={{ fontSize: '0.7rem', color: '#84abc9' }}>({sos.phone})</span>
                    <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: sos.status === 'pending' ? '#ff4444' : '#00ff88', color: '#000', fontWeight: 700, textTransform: 'uppercase' }}>
                      {sos.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>📍 {sos.location} • <span style={{ fontFamily: 'monospace', color: '#84abc9' }}>{sos.coords}</span></div>
                  {sos.assignedTeam && (
                    <div style={{ fontSize: '0.75rem', color: '#00ff88', marginTop: '0.2rem' }}>
                      🚒 Dispatched: <strong>{sos.assignedTeam}</strong>
                    </div>
                  )}
                </div>

                {sos.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleDispatchSOS(sos.id, 'NDRF Unit 1 (Zodiac Boat)')}
                      style={{ padding: '0.5rem 0.85rem', borderRadius: '8px', background: 'linear-gradient(135deg, #ff4444, #d97706)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                    >
                      Deploy NDRF Unit
                    </button>
                    <button
                      onClick={() => handleDispatchSOS(sos.id, 'Municipal Fire & Rescue')}
                      style={{ padding: '0.5rem 0.85rem', borderRadius: '8px', background: 'rgba(0, 214, 255, 0.2)', border: '1px solid #00f0ff', color: '#00f0ff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Deploy SDRF
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: REGIONAL SENSOR GRID MATRIX */}
      {activeTab === 'sensors' && (
        <div style={{ background: 'rgba(10, 25, 48, 0.75)', backdropFilter: 'blur(24px)', border: '1.5px solid rgba(180, 235, 255, 0.35)', borderRadius: '24px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={20} color="#00f0ff" />
            <span>Regional 47 IoT Telemetry Stations Matrix</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            {zones.map(z => (
              <div
                key={z.id}
                style={{
                  background: 'rgba(16, 36, 66, 0.65)',
                  border: `1px solid ${z.risk === 'high' ? '#ff4444' : z.risk === 'medium' ? '#ffaa00' : 'rgba(0, 240, 255, 0.3)'}`,
                  borderRadius: '12px',
                  padding: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{z.name}</strong>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: z.risk === 'high' ? '#ff4444' : '#00ff88' }}>
                    {z.risk.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#84abc9' }}>Water Depth: <strong style={{ color: '#fff' }}>{z.waterDepth} cm</strong></div>
                <div style={{ fontSize: '0.75rem', color: '#84abc9' }}>Rainfall: <strong style={{ color: '#00f0ff' }}>{z.rainfall} mm/h</strong></div>
                <div style={{ fontSize: '0.68rem', color: '#00ff88', marginTop: '0.3rem' }}>● SENSOR ONLINE (0.2s ping)</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
