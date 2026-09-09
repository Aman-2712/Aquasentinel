'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFloodData } from '@/context/FloodDataContext';
import { useAuth } from '@/context/AuthContext';
import styles from './authorityModern.module.css';
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
  Maximize2,
  MapPin,
  Wind,
  CloudRain,
  CloudLightning,
  Sun,
  Cloud,
  LogOut,
  TrendingUp,
  Zap,
  Shield,
  SlidersHorizontal,
  ArrowUpRight,
  Phone,
  Navigation,
  Clock,
  CheckCircle2,
  AlertOctagon,
  X,
  Volume2,
  Users
} from 'lucide-react';
import AuthorityAlertDispatcher from '@/components/authority/AuthorityAlertDispatcher';
import HackathonSimulatorModal from '@/components/demo/HackathonSimulatorModal';
import dynamic from 'next/dynamic';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false });
const PredictionCharts = dynamic(() => import('@/components/charts/PredictionCharts'), { ssr: false });

type AuthorityTab = 'overview' | 'livemap' | 'broadcasts' | 'dams' | 'sos_dispatch' | 'predictions';
type ForecastPeriod = '4days' | '14days' | '30days';

interface SOSItem {
  id: string;
  name: string;
  phone: string;
  location: string;
  coords: string;
  time: string;
  status: 'pending' | 'dispatched' | 'resolved';
  assignedTeam?: string;
  priority: 'high' | 'critical' | 'medium';
}

const INITIAL_SOS: SOSItem[] = [
  { id: 'sos-1', name: 'Ravi Teja', phone: '+91 98480 12345', location: 'Poorna Market Main Street', coords: '17.7041° N, 83.2977° E', time: '4 mins ago', status: 'pending', priority: 'critical' },
  { id: 'sos-2', name: 'Srinivas Rao', phone: '+91 97001 98765', location: 'Gajuwaka Industrial Underpass', coords: '17.6868° N, 83.2185° E', time: '12 mins ago', status: 'dispatched', assignedTeam: 'NDRF Team Alpha (Boat 4)', priority: 'high' },
  { id: 'sos-3', name: 'Lakshmi Devi', phone: '+91 91234 56789', location: 'Gopalapatnam Railway Colony', coords: '17.7400° N, 83.2300° E', time: '25 mins ago', status: 'resolved', assignedTeam: 'SDRF Unit 2', priority: 'medium' },
  { id: 'sos-4', name: 'K. Venkatesh', phone: '+91 94401 55667', location: 'Beach Road Coastal Promenade', coords: '17.7160° N, 83.3280° E', time: '38 mins ago', status: 'pending', priority: 'high' },
];

export default function ModernAuthoritySector() {
  const { user, logout } = useAuth();
  const {
    weatherData,
    xgboostPrediction,
    zones,
    isSimulationActive,
    broadcastAlerts,
    safeRoutes,
    sendAuthorityBroadcast,
  } = useFloodData();

  const [activeTab, setActiveTab] = useState<AuthorityTab>('overview');
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>('4days');
  const [sosList, setSosList] = useState<SOSItem[]>(INITIAL_SOS);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [masterSirenActive, setMasterSirenActive] = useState(false);
  const [autoBalancingActive, setAutoBalancingActive] = useState(true);
  const [aiInsightIndex, setAiInsightIndex] = useState(0);

  // Reservoir Sluice Gate Control state
  const [damLevels, setDamLevels] = useState([
    { id: 'd1', name: 'Meghadrigeddha Reservoir', capacity: 88, dischargeRate: 450, status: 'Warning', sluiceGate: 65, safeMax: 90 },
    { id: 'd2', name: 'Thatipudi Reservoir', capacity: 74, dischargeRate: 220, status: 'Normal', sluiceGate: 35, safeMax: 85 },
    { id: 'd3', name: 'Raiwada Reservoir', capacity: 94, dischargeRate: 720, status: 'Critical', sluiceGate: 85, safeMax: 95 },
    { id: 'd4', name: 'Mudasarlova Catchment', capacity: 62, dischargeRate: 140, status: 'Normal', sluiceGate: 20, safeMax: 80 },
  ]);

  const aiInsights = [
    'Autonomous Sentinel Sync: XGBoost Model indicates 14.8% probability rise in coastal storm surge at 19:30 IST.',
    'Doppler Radar Inflow: 48.2mm/h downpour convergence detected over Poorna Market and Gajuwaka corridors.',
    'Reservoir Balancing Mesh: Automated sluice gates on Raiwada & Meghadrigeddha operating within optimal discharge tolerances.',
    'Civil Evacuation Route: Beach Road Coastal Arterial marked 100% passable. Emergency NDRF staging ready at Sector 4.',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAiInsightIndex(prev => (prev + 1) % aiInsights.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [aiInsights.length]);

  // Current telemetry values
  const currentTemp = Math.round(weatherData.current.temp || 20);
  const currentRain = weatherData.current.rainfall || 0;
  const currentPressure = weatherData.current.pressure || 1008;
  const currentHumidity = weatherData.current.humidity || 82;
  const windSpeed = weatherData.current.windSpeed || 40.9;
  const windDir = 'Northwest';

  // Format dynamic dates
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Sine Horizon Data
  const horizonNodes = [
    { temp: '27°', time: '09:00 AM', condition: 'Partly Cloudy', x: 50, y: 55 },
    { temp: '26°', time: '10:00 AM', condition: 'Sunny Cloudy', x: 120, y: 65 },
    { temp: '27°', time: '11:00 AM', condition: 'Partly Cloudy', x: 190, y: 50 },
    { temp: '23°', time: '12:00 PM', condition: 'Moderate Rain', x: 260, y: 75 },
    { temp: '20°', time: '01:00 PM', condition: 'Overcast Cloudy', x: 330, y: 35 },
    { temp: '22°', time: '02:00 PM', condition: 'Moderate Cloudy', x: 400, y: 60 },
  ];

  // Multi-day forecast list matching reference
  const forecastItems = useMemo(() => {
    if (forecastPeriod === '4days') {
      return [
        { day: 'Wednesday', date: 'June 21', condition: 'Partly Cloudy', temp: '28°', icon: Cloud },
        { day: 'Thursday', date: 'June 22', condition: 'Sunny Cloudy', temp: '26°', icon: Sun },
        { day: 'Friday', date: 'June 23', condition: 'Moderate Rain', temp: '21°', icon: CloudRain },
        { day: 'Saturday', date: 'June 24', condition: 'Partly Cloudy', temp: '25°', icon: Cloud },
      ];
    } else if (forecastPeriod === '14days') {
      return [
        { day: 'Wednesday', date: 'June 21', condition: 'Partly Cloudy', temp: '28°', icon: Cloud },
        { day: 'Thursday', date: 'June 22', condition: 'Sunny Cloudy', temp: '26°', icon: Sun },
        { day: 'Friday', date: 'June 23', condition: 'Heavy Storm', temp: '20°', icon: CloudLightning },
        { day: 'Saturday', date: 'June 24', condition: 'Moderate Rain', temp: '22°', icon: CloudRain },
        { day: 'Sunday', date: 'June 25', condition: 'Overcast', temp: '24°', icon: Cloud },
        { day: 'Monday', date: 'June 26', condition: 'Clear Sky', temp: '29°', icon: Sun },
      ];
    } else {
      return [
        { day: 'Week 1 Outlook', date: 'Monsoon Front', condition: 'High Inundation', temp: '23°', icon: CloudLightning },
        { day: 'Week 2 Outlook', date: 'Tidal Swell', condition: 'Moderate Rain', temp: '26°', icon: CloudRain },
        { day: 'Week 3 Outlook', date: 'Clear Post-Depression', condition: 'Sunny Period', temp: '31°', icon: Sun },
        { day: 'Week 4 Outlook', date: 'Seasonal Baseline', condition: 'Partly Cloudy', temp: '29°', icon: Cloud },
      ];
    }
  }, [forecastPeriod]);

  const handleDispatchSOS = (id: string, team: string) => {
    setSosList(prev => prev.map(s => s.id === id ? { ...s, status: 'dispatched', assignedTeam: team } : s));
  };

  const handleResolveSOS = (id: string) => {
    setSosList(prev => prev.map(s => s.id === id ? { ...s, status: 'resolved' } : s));
  };

  const handleUpdateGate = (id: string, newVal: number) => {
    setDamLevels(prev => prev.map(d => d.id === id ? { ...d, sluiceGate: newVal } : d));
  };

  const handleToggleSiren = () => {
    const newState = !masterSirenActive;
    setMasterSirenActive(newState);
    if (newState) {
      sendAuthorityBroadcast({
        area: 'All Municipal Flood Sectors (Citywide)',
        risk: 'high',
        message: '🚨 EMERGENCY SIREN DISPATCHED: High-tide surge & flash flood protocol activated. Seek elevated safe shelters.'
      });
    }
  };

  const pendingSOSCount = sosList.filter(s => s.status === 'pending').length;

  return (
    <div className={styles.authoritySectorContainer}>
      {/* =========================================================================
          LEFT VERTICAL CAPSULE DOCK (Spatial Floating HUD Dock)
          ========================================================================= */}
      <aside className={styles.leftIconDock}>
        <div className={styles.dockLogo} onClick={() => setActiveTab('overview')} title="AquaSentinel Authority Command">
          <Shield size={22} />
        </div>

        <nav className={styles.dockNavGroup}>
          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'overview' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('overview')}
            title="Command Center HUD Overview"
          >
            <Activity size={20} />
          </button>

          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'livemap' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('livemap')}
            title="Live GIS Inundation & Rescue Map"
          >
            <Navigation size={20} />
          </button>

          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'broadcasts' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('broadcasts')}
            title="Emergency Municipal Broadcast Dispatcher"
          >
            <Megaphone size={20} />
            {broadcastAlerts.length > 0 && (
              <span className={styles.dockBadge}>{broadcastAlerts.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'dams' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('dams')}
            title="Reservoir & Hydraulic Sluice Gate Control Mesh"
          >
            <Sliders size={20} />
          </button>

          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'sos_dispatch' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('sos_dispatch')}
            title="Citizen SOS & NDRF Fleet Rescue Dispatch"
          >
            <LifeBuoy size={20} />
            {pendingSOSCount > 0 && (
              <span className={styles.dockBadge}>{pendingSOSCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'predictions' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('predictions')}
            title="XGBoost AI Hydrology Telemetry & Predictions"
          >
            <TrendingUp size={20} />
          </button>
        </nav>

        <div className={styles.dockNavGroup}>
          <button
            type="button"
            className={styles.dockBtn}
            onClick={() => setShowSimulatorModal(true)}
            title="Launch Emergency Scenario Simulator"
            style={{ color: '#00f0ff' }}
          >
            <Zap size={20} />
          </button>

          <button
            type="button"
            className={styles.dockBtn}
            onClick={logout}
            title="Log Out of Authority Command"
            style={{ color: 'rgba(255, 100, 100, 0.7)' }}
          >
            <LogOut size={19} />
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN FRAME: Top Header + Interior Scrollable Dashboard
          ========================================================================= */}
      <main className={styles.mainLayoutFrame}>
        {/* Top Header Bar */}
        <header className={styles.authorityHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.brandBadge}>
              <Satellite size={14} />
              <span>AQUASENTINEL SPATIAL COMMAND</span>
            </div>
            <h1 className={styles.headerTitle}>
              Visakhapatnam Municipal Disaster Operations Center
            </h1>
          </div>

          <div className={styles.headerRight}>
            <button
              type="button"
              className={masterSirenActive ? styles.headerSirenBtn : styles.headerActionBtn}
              onClick={handleToggleSiren}
            >
              <Volume2 size={15} color={masterSirenActive ? '#ff4444' : '#00f0ff'} />
              <span>{masterSirenActive ? 'SIREN ACTIVE (CLICK TO SILENCE)' : 'TRIGGER DISTRICT SIREN'}</span>
            </button>

            <button
              type="button"
              className={styles.headerActionBtn}
              onClick={() => setShowSimulatorModal(true)}
            >
              <Zap size={14} color="#00f0ff" />
              <span>Simulation Engine</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 214, 255, 0.12)', border: '1px solid rgba(0, 240, 255, 0.35)', padding: '5px 12px', borderRadius: '12px', fontSize: '0.75rem', color: '#00f0ff', fontWeight: 700 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
              <span>OFFICIAL: {user?.name || 'ADMINISTRATOR'}</span>
            </div>
          </div>
        </header>

        {/* Interior Scrollable Area */}
        <div className={styles.mainDashboardArea}>
          {/* =========================================================================
              VIEW 1: OVERVIEW HUD (EXACT MATCH WITH REFERENCE IMAGE)
              ========================================================================= */}
          {activeTab === 'overview' && (
            <>
              <div className={styles.overviewGrid}>
                {/* Left Column: Hero Weather Card + 24-Hour Horizon Spline Card */}
                <div className={styles.overviewLeftCol}>
                  {/* HERO WEATHER CARD (Top Left Card in Reference Image) */}
                  <div className={styles.heroWeatherCard}>
                    <div className={styles.heroLocationRow}>
                      <div className={styles.heroLocationTag}>
                        <MapPin size={14} color="#00f0ff" />
                        <span>Purwokerto, Banyumas • Coastal Hydrology Station</span>
                      </div>
                      <div className={styles.hero3DIcon}>
                        <CloudLightning size={32} />
                      </div>
                    </div>

                    <div>
                      <div className={styles.heroSubtitleLabel}>Weather &amp; Inundation Telemetry</div>
                      <h2 className={styles.heroConditionTitle}>Overcast cloudy</h2>
                      <p className={styles.heroDescriptionText}>
                        The low temperature will reach 25° on this gloomy day • Precipitation Probability 88% with monsoon storm surge converging over drainage canals.
                      </p>
                    </div>
                  </div>

                  {/* 24-HOUR SINE WAVE HORIZON CARD (Bottom Left Card in Reference Image) */}
                  <div className={styles.horizonStatsCard}>
                    <div className={styles.horizonHeaderRow}>
                      <h3 className={styles.horizonTitle}>Today&apos;s statistics</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#84abc9' }}>
                        <span style={{ display: 'inline-block', width: 10, height: 2.5, background: '#eab308', borderRadius: 2 }} />
                        <span>Continuous Hydrographic &amp; Temperature Horizon</span>
                      </div>
                    </div>

                    {/* Smooth Golden Sine Wave SVG Graphic */}
                    <div className={styles.horizonSineWrap}>
                      <svg viewBox="0 0 450 90" className={styles.sineSvg} preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="sineGlowGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#eab308" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#eab308" stopOpacity="0.0" />
                          </linearGradient>
                          <filter id="goldenGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {/* Shaded Area Under Spline */}
                        <path
                          d="M 0 55 C 60 75, 100 25, 170 50 C 230 70, 280 20, 340 35 C 390 50, 420 65, 450 55 L 450 90 L 0 90 Z"
                          fill="url(#sineGlowGrad)"
                        />

                        {/* Golden Curve Line */}
                        <path
                          d="M 0 55 C 60 75, 100 25, 170 50 C 230 70, 280 20, 340 35 C 390 50, 420 65, 450 55"
                          fill="none"
                          stroke="#eab308"
                          strokeWidth="3.5"
                          filter="url(#goldenGlow)"
                        />

                        {/* Peak Points on the Sine Curve */}
                        <circle cx="170" cy="50" r="4.5" fill="#ffffff" stroke="#eab308" strokeWidth="2" />
                        <circle cx="340" cy="35" r="5" fill="#ffffff" stroke="#eab308" strokeWidth="2.5" filter="url(#goldenGlow)" />
                      </svg>
                    </div>

                    {/* Hourly Telemetry Row Underneath the Curve */}
                    <div className={styles.hourlyTelemetryRow}>
                      {horizonNodes.map((node, i) => (
                        <div key={i} className={styles.hourlyNodeItem}>
                          <span className={styles.hourlyNodeTemp}>{node.temp}</span>
                          <span className={styles.hourlyNodeTime}>{node.time}</span>
                          <span className={styles.hourlyNodeCondition}>{node.condition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Right Sidebar Panel (Matching Reference Image right side) */}
                <div className={styles.rightSidebarCard}>
                  <div className={styles.rightHeaderRow}>
                    <div className={styles.rightDateText}>Tuesday, June 20</div>
                    <div className={styles.rightTimeText}>01:00 PM</div>
                  </div>

                  {/* Giant Temperature & Wind Telemetry */}
                  <div className={styles.rightGiantTempSection}>
                    <div className={styles.rightGiantTempText}>20°</div>
                    <div className={styles.rightWindTelemetry}>
                      <Wind size={15} color="#00f0ff" />
                      <span>Northwest, 40.9 km/h</span>
                    </div>
                  </div>

                  {/* Forecast Section */}
                  <div className={styles.forecastHeaderRow}>
                    <span className={styles.forecastTitle}>The Next Day Forecast</span>
                  </div>

                  {/* Multi-Day Pill Toggle (4 days / 14 days / 30 days) */}
                  <div className={styles.forecastPillGroup}>
                    <button
                      type="button"
                      className={`${styles.forecastPillBtn} ${forecastPeriod === '4days' ? styles.forecastPillBtnActive : ''}`}
                      onClick={() => setForecastPeriod('4days')}
                    >
                      4 days
                    </button>
                    <button
                      type="button"
                      className={`${styles.forecastPillBtn} ${forecastPeriod === '14days' ? styles.forecastPillBtnActive : ''}`}
                      onClick={() => setForecastPeriod('14days')}
                    >
                      14 days
                    </button>
                    <button
                      type="button"
                      className={`${styles.forecastPillBtn} ${forecastPeriod === '30days' ? styles.forecastPillBtnActive : ''}`}
                      onClick={() => setForecastPeriod('30days')}
                    >
                      30 days
                    </button>
                  </div>

                  {/* Forecast Rows List */}
                  <div className={styles.forecastRowsList}>
                    {forecastItems.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className={styles.forecastRowItem}>
                          <div className={styles.forecastRowLeft}>
                            <div className={styles.forecastRowIcon}>
                              <Icon size={18} />
                            </div>
                            <div>
                              <div className={styles.forecastRowDayName}>{item.day}, {item.date}</div>
                              <div className={styles.forecastRowCondition}>{item.condition}</div>
                            </div>
                          </div>
                          <div className={styles.forecastRowTemp}>{item.temp}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Authority Directives Quick Trigger */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.85rem' }}>
                    <button
                      type="button"
                      className={`${styles.slideActionBtn} ${styles.slideActionBtnDanger}`}
                      onClick={() => setActiveTab('broadcasts')}
                    >
                      <Megaphone size={15} />
                      <span>Send Municipal Broadcast</span>
                    </button>

                    <button
                      type="button"
                      className={styles.slideActionBtn}
                      onClick={() => setActiveTab('dams')}
                    >
                      <SlidersHorizontal size={15} />
                      <span>Sluice Gate Mesh Controller</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Authority Interactive Telemetry Modules Matrix */}
              <div className={styles.moduleGrid} style={{ marginTop: '0.5rem' }}>
                {/* Module 1: AI Environmental Sentinel */}
                <div className={styles.glassModuleCard}>
                  <div className={styles.cardHeader}>
                    <h4 className={styles.cardTitle}>
                      <Bot size={18} color="#00f0ff" />
                      <span>AI DISASTER CO-PILOT</span>
                    </h4>
                    <span className={`${styles.cardBadge} ${styles.cardBadgeCyan}`}>INSAT-3DR SYNC</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                    {aiInsights[aiInsightIndex]}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#84abc9' }}>● 150 XGBoost Trees Active</span>
                    <button
                      type="button"
                      className={styles.slideActionBtn}
                      style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                      onClick={() => setAiInsightIndex(prev => (prev + 1) % aiInsights.length)}
                    >
                      <RefreshCw size={12} />
                      <span>Next Insight</span>
                    </button>
                  </div>
                </div>

                {/* Module 2: Reservoir Status Matrix */}
                <div className={styles.glassModuleCard}>
                  <div className={styles.cardHeader}>
                    <h4 className={styles.cardTitle}>
                      <Droplets size={18} color="#00f0ff" />
                      <span>RESERVOIR HYDRAULICS</span>
                    </h4>
                    <span className={`${styles.cardBadge} ${styles.cardBadgeGreen}`}>4 ACTIVE DAMS</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {damLevels.slice(0, 2).map(d => (
                      <div key={d.id} style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                          <strong style={{ color: '#fff' }}>{d.name}</strong>
                          <span style={{ color: d.capacity > 85 ? '#ff4444' : '#00f0ff', fontWeight: 700 }}>{d.capacity}%</span>
                        </div>
                        <div style={{ height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${d.capacity}%`, height: '100%', background: d.capacity > 85 ? '#ff4444' : '#00f0ff' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={styles.slideActionBtn}
                    onClick={() => setActiveTab('dams')}
                    style={{ marginTop: 'auto', padding: '5px', fontSize: '0.75rem' }}
                  >
                    <span>Manage All 4 Reservoirs</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Module 3: Citizen SOS Incident Queue */}
                <div className={styles.glassModuleCard}>
                  <div className={styles.cardHeader}>
                    <h4 className={styles.cardTitle}>
                      <LifeBuoy size={18} color="#ff4444" />
                      <span>CITIZEN RESCUE QUEUE</span>
                    </h4>
                    <span className={`${styles.cardBadge} ${styles.cardBadgeCritical}`}>{pendingSOSCount} PENDING</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {sosList.slice(0, 2).map(sos => (
                      <div key={sos.id} style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '10px', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <strong style={{ color: '#fff' }}>{sos.name}</strong>
                          <span style={{ color: sos.status === 'pending' ? '#ff4444' : '#00ff88', fontWeight: 700 }}>{sos.status.toUpperCase()}</span>
                        </div>
                        <div style={{ color: '#84abc9', fontSize: '0.7rem' }}>📍 {sos.location}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={styles.slideActionBtn}
                    onClick={() => setActiveTab('sos_dispatch')}
                    style={{ marginTop: 'auto', padding: '5px', fontSize: '0.75rem' }}
                  >
                    <span>Open Rescue Dispatch Console</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* =========================================================================
              VIEW 2: LIVE GIS INUNDATION MAP
              ========================================================================= */}
          {activeTab === 'livemap' && (
            <div className={styles.glassModuleCard} style={{ height: 'calc(100vh - 140px)', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <Navigation size={20} color="#00f0ff" />
                  <span>GIS Spatial Inundation &amp; Emergency Safe Corridors</span>
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className={`${styles.cardBadge} ${styles.cardBadgeGreen}`}>47 SENSORS MESHED</span>
                  <span className={`${styles.cardBadge} ${styles.cardBadgeCyan}`}>LEAFLET HYDROLOGY LAYER</span>
                </div>
              </div>
              <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.12)', marginTop: '0.75rem' }}>
                <FloodMap zones={zones} routes={safeRoutes} />
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: EMERGENCY MUNICIPAL BROADCAST DISPATCHER
              ========================================================================= */}
          {activeTab === 'broadcasts' && (
            <div className={styles.glassModuleCard} style={{ padding: '1.5rem' }}>
              <AuthorityAlertDispatcher />
            </div>
          )}

          {/* =========================================================================
              VIEW 4: RESERVOIRS & HYDRAULIC SLUICE GATE MESH
              ========================================================================= */}
          {activeTab === 'dams' && (
            <div className={styles.glassModuleCard} style={{ padding: '1.5rem' }}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <Droplets size={22} color="#00f0ff" />
                  <span>District Reservoirs &amp; Automated Hydraulic Sluice Gate Mesh</span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    type="button"
                    className={autoBalancingActive ? styles.headerActionBtn : styles.slideActionBtn}
                    onClick={() => setAutoBalancingActive(!autoBalancingActive)}
                    style={{ borderColor: autoBalancingActive ? '#00ff88' : '#00f0ff', color: autoBalancingActive ? '#00ff88' : '#00f0ff' }}
                  >
                    <CheckCircle2 size={15} />
                    <span>{autoBalancingActive ? 'AI AUTO-BALANCING: ACTIVE' : 'MANUAL OVERRIDE'}</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
                {damLevels.map(dam => (
                  <div
                    key={dam.id}
                    style={{
                      background: 'rgba(16, 36, 66, 0.65)',
                      border: `1.5px solid ${dam.status === 'Critical' ? '#ff4444' : dam.status === 'Warning' ? '#ffaa00' : 'rgba(0, 240, 255, 0.35)'}`,
                      borderRadius: '18px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#fff', fontSize: '1rem' }}>{dam.name}</strong>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: dam.status === 'Critical' ? '#ff4444' : dam.status === 'Warning' ? '#ffaa00' : '#00ff88', color: '#000' }}>
                        {dam.status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#84abc9', marginBottom: '0.35rem' }}>
                        <span>Capacity Filled:</span>
                        <strong style={{ color: dam.capacity > 85 ? '#ff4444' : '#fff' }}>{dam.capacity}% (Max Safe: {dam.safeMax}%)</strong>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${dam.capacity}%`, background: dam.capacity > 85 ? '#ff4444' : '#00f0ff' }} />
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#84abc9' }}>
                      Discharge Flow Rate: <strong style={{ color: '#fff' }}>{dam.dischargeRate} cusecs</strong>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#fff', marginBottom: '0.4rem' }}>
                        <span>Hydraulic Sluice Gate Elevation:</span>
                        <strong style={{ color: '#00f0ff' }}>{dam.sluiceGate}%</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dam.sluiceGate}
                        onChange={e => handleUpdateGate(dam.id, parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: '#00f0ff', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 5: CITIZEN SOS & RESCUE FLEET DISPATCH CONSOLE
              ========================================================================= */}
          {activeTab === 'sos_dispatch' && (
            <div className={styles.glassModuleCard} style={{ padding: '1.5rem' }}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <LifeBuoy size={22} color="#ff4444" />
                  <span>Citizen Distress SOS &amp; NDRF / SDRF Rapid Rescue Fleet</span>
                </h3>
                <span className={`${styles.cardBadge} ${styles.cardBadgeCritical}`}>{pendingSOSCount} PENDING RESCUE DISPATCHES</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
                {sosList.map(sos => (
                  <div
                    key={sos.id}
                    style={{
                      background: 'rgba(16, 36, 66, 0.65)',
                      border: `1.5px solid ${sos.status === 'pending' ? 'rgba(255, 68, 68, 0.45)' : 'rgba(0, 255, 136, 0.35)'}`,
                      borderRadius: '16px',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                        <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{sos.name}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#84abc9', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} /> {sos.phone}
                        </span>
                        <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px', background: sos.status === 'pending' ? '#ff4444' : '#00ff88', color: '#000', fontWeight: 800 }}>
                          {sos.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                        📍 {sos.location} • <span style={{ fontFamily: 'monospace', color: '#00f0ff' }}>{sos.coords}</span>
                      </div>
                      {sos.assignedTeam && (
                        <div style={{ fontSize: '0.8rem', color: '#00ff88', marginTop: '0.3rem', fontWeight: 600 }}>
                          🚒 Dispatched: <strong>{sos.assignedTeam}</strong>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      {sos.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            className={`${styles.slideActionBtn} ${styles.slideActionBtnDanger}`}
                            onClick={() => handleDispatchSOS(sos.id, 'NDRF Boat Unit 1')}
                          >
                            <LifeBuoy size={14} />
                            <span>Deploy NDRF Unit</span>
                          </button>
                          <button
                            type="button"
                            className={styles.slideActionBtn}
                            onClick={() => handleDispatchSOS(sos.id, 'SDRF Rapid Fire & Rescue')}
                          >
                            <span>Deploy SDRF</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className={styles.slideActionBtn}
                          onClick={() => handleResolveSOS(sos.id)}
                          style={{ borderColor: '#00ff88', color: '#00ff88' }}
                        >
                          <CheckCircle size={14} />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 6: XGBOOST AI PREDICTIONS & TELEMETRY
              ========================================================================= */}
          {activeTab === 'predictions' && (
            <div className={styles.glassModuleCard} style={{ padding: '1.5rem' }}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <TrendingUp size={22} color="#00f0ff" />
                  <span>XGBoost Multi-Variable AI Hydrology &amp; Inundation Curves</span>
                </h3>
                <span className={`${styles.cardBadge} ${styles.cardBadgeCyan}`}>AUC 0.94 ACCURACY</span>
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <PredictionCharts forecast={weatherData.forecast} zones={zones} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Emergency Simulation Modal */}
      <HackathonSimulatorModal isOpen={showSimulatorModal} onClose={() => setShowSimulatorModal(false)} />
    </div>
  );
}
