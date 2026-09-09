'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFloodData } from '@/context/FloodDataContext';
import { useAuth } from '@/context/AuthContext';
import styles from './authorityModern.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Bell,
  Crosshair,
  BarChart3,
  MapPin,
  Wind,
  CloudRain,
  CloudLightning,
  Sun,
  Cloud,
  LogOut,
  Zap,
  LifeBuoy,
  Volume2,
  Droplets,
  CheckCircle2,
  Phone,
  ChevronRight,
  Shield,
  Activity,
  CheckCircle,
  Mail,
  AlertTriangle,
  Bot,
  Radio,
  Server,
  Sparkles
} from 'lucide-react';
import AuthorityAlertDispatcher from '@/components/authority/AuthorityAlertDispatcher';
import HackathonSimulatorModal from '@/components/demo/HackathonSimulatorModal';
import dynamic from 'next/dynamic';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false });
const PredictionCharts = dynamic(() => import('@/components/charts/PredictionCharts'), { ssr: false });

type AuthorityTab = 'overview' | 'broadcasts' | 'livemap' | 'predictions' | 'sos_dispatch';
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
}

const INITIAL_SOS: SOSItem[] = [
  { id: 'sos-1', name: 'Ravi Teja', phone: '+91 98480 12345', location: 'Poorna Market Main Street', coords: '17.7041° N, 83.2977° E', time: '4 mins ago', status: 'pending' },
  { id: 'sos-2', name: 'Srinivas Rao', phone: '+91 97001 98765', location: 'Gajuwaka Industrial Underpass', coords: '17.6868° N, 83.2185° E', time: '12 mins ago', status: 'dispatched', assignedTeam: 'NDRF Team Alpha (Boat 4)' },
  { id: 'sos-3', name: 'Lakshmi Devi', phone: '+91 91234 56789', location: 'Gopalapatnam Railway Colony', coords: '17.7400° N, 83.2300° E', time: '25 mins ago', status: 'resolved', assignedTeam: 'SDRF Unit 2' },
];

export default function ModernAuthoritySector() {
  const { user, logout } = useAuth();
  const {
    weatherData,
    xgboostPrediction,
    zones,
    broadcastAlerts,
    safeRoutes,
    sendAuthorityBroadcast,
    isSimulationActive,
  } = useFloodData();

  const [activeTab, setActiveTab] = useState<AuthorityTab>('overview');
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>('14days');
  const [sosList, setSosList] = useState<SOSItem[]>(INITIAL_SOS);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [masterSirenActive, setMasterSirenActive] = useState(false);
  const [sirenEmailSent, setSirenEmailSent] = useState(false);
  const [aiNoteIndex, setAiNoteIndex] = useState(0);

  const aiNotes = [
    'Autonomous AI Guardian: Doppler rainfall rate stabilized at 48.2 mm/h. Coastal high-tide alert synchronized.',
    'Disaster AI Engine: Flood risk probability estimated at 88.4% via 150 XGBoost decision trees. Citizen safe corridors active.',
    'Multi-Sector Email Dispatch: Emergency warnings & survival checklists automatically broadcasted to registered citizen & farmer inboxes.',
    'Telemetry Mesh: 47 IoT sensor stations responding nominal with sub-second latency across Visakhapatnam metropolitan sectors.',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAiNoteIndex(prev => (prev + 1) % aiNotes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [aiNotes.length]);

  // Hourly nodes matching reference image values
  const horizonNodes = [
    { temp: '27°', time: '09:00 AM', condition: 'Partly Cloudy' },
    { temp: '26°', time: '10:00 AM', condition: 'Sunny cloudy' },
    { temp: '27°', time: '11:00 AM', condition: 'Partly Cloudy' },
    { temp: '23°', time: '12:00 PM', condition: 'Moderate rain' },
    { temp: '20°', time: '01:00 PM', condition: 'Overcast Cloudy' },
    { temp: '22°', time: '02:00 PM', condition: 'Moderate Cloudy' },
  ];

  // 7-Day / Multi-Day Forecast rows
  const forecastItems = useMemo(() => {
    if (forecastPeriod === '4days') {
      return [
        { day: 'Wednesday', date: 'June 21', condition: 'Partly Cloudy', temp: '28°', icon: Cloud, rain: '12mm' },
        { day: 'Thursday', date: 'June 22', condition: 'Sunny cloudy', temp: '26°', icon: Sun, rain: '4mm' },
        { day: 'Friday', date: 'June 22', condition: 'Moderate rain', temp: '21°', icon: CloudRain, rain: '28mm' },
        { day: 'Saturday', date: 'June 23', condition: 'Partly Cloudy', temp: '25°', icon: Cloud, rain: '14mm' },
      ];
    } else if (forecastPeriod === '14days') {
      return [
        { day: 'Wednesday', date: 'June 21', condition: 'Partly Cloudy', temp: '28°', icon: Cloud, rain: '12mm' },
        { day: 'Thursday', date: 'June 22', condition: 'Sunny cloudy', temp: '26°', icon: Sun, rain: '4mm' },
        { day: 'Friday', date: 'June 22', condition: 'Heavy Storm', temp: '20°', icon: CloudLightning, rain: '58mm' },
        { day: 'Saturday', date: 'June 23', condition: 'Moderate rain', temp: '22°', icon: CloudRain, rain: '32mm' },
        { day: 'Sunday', date: 'June 24', condition: 'Overcast', temp: '24°', icon: Cloud, rain: '18mm' },
        { day: 'Monday', date: 'June 25', condition: 'Clear Sky', temp: '29°', icon: Sun, rain: '0mm' },
        { day: 'Tuesday', date: 'June 26', condition: 'Thunderstorm', temp: '21°', icon: CloudLightning, rain: '64mm' },
      ];
    } else {
      return [
        { day: 'Week 1 Outlook', date: 'Monsoon Surge', condition: 'Heavy Downpour', temp: '23°', icon: CloudLightning, rain: '148mm' },
        { day: 'Week 2 Outlook', date: 'Tidal Swell', condition: 'Moderate Inundation', temp: '25°', icon: CloudRain, rain: '82mm' },
        { day: 'Week 3 Outlook', date: 'Post-Depression', condition: 'Partly Cloudy', temp: '30°', icon: Sun, rain: '15mm' },
        { day: 'Week 4 Outlook', date: 'Seasonal Baseline', condition: 'Clear Skies', temp: '29°', icon: Cloud, rain: '8mm' },
      ];
    }
  }, [forecastPeriod]);

  // Handle emergency siren button (Broadcasts across all sectors + Dispatches emergency email without playing in Authority dashboard)
  const handleToggleSiren = () => {
    setMasterSirenActive(true);

    // 1. Broadcast across all sectors (Farmers & Citizens receive the 2-second siren alert & audio)
    sendAuthorityBroadcast({
      area: 'All Municipal & Agricultural Sectors (Visakhapatnam Metropolitan)',
      risk: 'high',
      message: '🚨 MASTER EMERGENCY SIREN ACTIVATED: Severe Cloudburst & Coastal Inundation warning. Farmers & Citizens must take immediate shelter on elevated safe ground.'
    });

    // 2. Dispatch automated emergency email alert
    fetch('/api/send-emergency-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: user?.email || 'aquasentinelfis@gmail.com',
        userName: user?.name || 'Visakhapatnam District Resident',
        sector: 'authority',
        hasAgriLand: false,
        area: 'Visakhapatnam Metropolitan & Coastal Catchment',
        weatherCondition: '🚨 CRITICAL MASTER SIREN: Cloudburst Precipitation & Tidal Inundation',
        rainfall: 85.4,
        riskScore: 94.2,
        soilMoisture: 92,
        isSimulation: false,
        notes: 'Master Municipal Emergency Siren triggered by Disaster Management Authority.'
      }),
    })
      .then(res => res.json())
      .then(() => {
        setSirenEmailSent(true);
        setTimeout(() => setSirenEmailSent(false), 8000);
      })
      .catch(err => console.error('Emergency email dispatch error:', err));

    // Reset indicator back to normal after 2.5 seconds
    setTimeout(() => {
      setMasterSirenActive(false);
    }, 2500);
  };

  const handleDispatchSOS = (id: string, team: string) => {
    setSosList(prev => prev.map(s => s.id === id ? { ...s, status: 'dispatched', assignedTeam: team } : s));
  };

  const handleResolveSOS = (id: string) => {
    setSosList(prev => prev.map(s => s.id === id ? { ...s, status: 'resolved' } : s));
  };

  const pendingSOSCount = sosList.filter(s => s.status === 'pending').length;
  const userDisplayName = user?.name || 'NADEEM AHMED SHAIK';
  const userInitials = userDisplayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={styles.spatialViewportWrapper}>
      {/* =========================================================================
          FLOATING LEFT CAPSULE DOCK (With Spring Sliding Indicator Pill)
          ========================================================================= */}
      <aside className={styles.floatingCapsuleDock}>
        {/* Button 1: Grid / Apps Icon */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'overview' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('overview')}
          title="Weather & Command HUD Overview"
        >
          {activeTab === 'overview' && (
            <motion.div
              layoutId="activeDockIndicator"
              className={styles.dockActiveIndicator}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <LayoutGrid size={22} />
        </button>

        {/* Button 2: Bell / Broadcast Alert Icon */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'broadcasts' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('broadcasts')}
          title="Emergency Municipal Broadcast Dispatcher"
        >
          {activeTab === 'broadcasts' && (
            <motion.div
              layoutId="activeDockIndicator"
              className={styles.dockActiveIndicator}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <Bell size={22} />
          {broadcastAlerts.length > 0 && (
            <span className={styles.dockBadgeCount}>{broadcastAlerts.length}</span>
          )}
        </button>

        {/* Button 3: Radar / Location Target Icon */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'livemap' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('livemap')}
          title="Live GIS Inundation & Rescue Map"
        >
          {activeTab === 'livemap' && (
            <motion.div
              layoutId="activeDockIndicator"
              className={styles.dockActiveIndicator}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <Crosshair size={22} />
        </button>

        {/* Button 4: Equalizer / Bar Analytics Icon */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'predictions' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('predictions')}
          title="XGBoost AI Hydrology Telemetry & Predictions"
        >
          {activeTab === 'predictions' && (
            <motion.div
              layoutId="activeDockIndicator"
              className={styles.dockActiveIndicator}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <BarChart3 size={22} />
        </button>

        {/* Button 5: Citizen SOS Button */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'sos_dispatch' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('sos_dispatch')}
          title="Citizen SOS Rescue Dispatch"
        >
          {activeTab === 'sos_dispatch' && (
            <motion.div
              layoutId="activeDockIndicator"
              className={styles.dockActiveIndicator}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <LifeBuoy size={21} />
          {pendingSOSCount > 0 && (
            <span className={styles.dockBadgeCount}>{pendingSOSCount}</span>
          )}
        </button>

        {/* Separator */}
        <div style={{ width: '28px', height: '1px', background: 'rgba(255, 255, 255, 0.2)', margin: '4px 0' }} />

        {/* Emergency Simulator */}
        <button
          type="button"
          className={styles.dockIconButton}
          onClick={() => setShowSimulatorModal(true)}
          title="Launch Emergency Scenario Simulator"
          style={{ color: '#00f0ff' }}
        >
          <Zap size={20} />
        </button>

        {/* Logout */}
        <button
          type="button"
          className={styles.dockIconButton}
          onClick={logout}
          title="Exit Authority Command"
          style={{ color: 'rgba(255, 120, 120, 0.8)' }}
        >
          <LogOut size={19} />
        </button>
      </aside>

      {/* =========================================================================
          FULLSCREEN CURVED SPATIAL GLASS PANEL
          ========================================================================= */}
      <div className={styles.curvedSpatialPanel}>
        {/* Top Command Header Bar with Full User Account Details */}
        <header className={styles.panelTopHeader}>
          <div className={styles.headerLeftAccount}>
            <div className={styles.userAvatarCircle}>
              {userInitials}
            </div>
            <div className={styles.accountTextGroup}>
              <div className={styles.userNameLine}>
                <Shield size={13} color="#00f0ff" />
                <span>AQUASENTINEL SPATIAL COMMAND • {userDisplayName}</span>
              </div>
              <span className={styles.userRoleSubtext}>
                MUNICIPAL DISASTER MANAGEMENT AUTHORITY • 📍 VISAKHAPATNAM COMMAND
              </span>
            </div>
          </div>

          <div className={styles.headerControlsGroup}>
            {/* Real Audio Siren Button */}
            <button
              type="button"
              className={masterSirenActive ? `${styles.headerSirenButton} ${styles.headerSirenButtonActive}` : styles.headerSirenButton}
              onClick={handleToggleSiren}
            >
              <Volume2 size={14} color={masterSirenActive ? '#ffffff' : '#00f0ff'} />
              <span>{masterSirenActive ? '🚨 SIREN DISPATCHED (2s PULSE)' : '🔊 DISTRICT SIREN'}</span>
            </button>

            {/* Simulation Button */}
            <button
              type="button"
              className={styles.headerCompactBtn}
              onClick={() => setShowSimulatorModal(true)}
            >
              <Zap size={14} color="#00f0ff" />
              <span>SIMULATION</span>
            </button>
          </div>
        </header>

        {/* Flashing Emergency Siren Banner when Siren is Active */}
        {masterSirenActive && (
          <div style={{ background: 'linear-gradient(90deg, #ff4444, #dc2626)', padding: '6px 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, color: '#fff', boxShadow: '0 4px 20px rgba(255, 68, 68, 0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Volume2 size={16} />
              <span>🚨 DISTRICT EMERGENCY SIREN SOUND ACTIVE: AUDIO WAVE BROADCASTING TO ALL CITIZENS &amp; FARMERS</span>
            </div>
            {sirenEmailSent && (
              <span style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>
                ✉️ Emergency Alert Emails Sent to Inboxes
              </span>
            )}
          </div>
        )}

        {/* Interior Canvas with Animated View Transition */}
        <div className={styles.panelContentCanvas}>
          <AnimatePresence mode="wait">
            {/* VIEW 1: SPATIAL HUD OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 14, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.99 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
              >
                {/* Main 2-Column Grid */}
                <div className={styles.spatialHUDGrid}>
                  {/* Left Column: Hero Weather Card + Golden Sine Wave Card */}
                  <div className={styles.spatialLeftCardsCol}>
                    {/* CARD 1: TOP LEFT HERO WEATHER CARD */}
                    <div className={styles.heroWeatherSpatialCard}>
                      <div>
                        <div className={styles.heroLocationPill}>
                          <MapPin size={15} color="#ffffff" />
                          <span>Purwokerto, Banyumas • Coastal Hydrology Sector</span>
                        </div>
                      </div>

                      <div>
                        <div className={styles.heroWeatherLabel}>Weather Forecast</div>
                        <h1 className={styles.heroMainConditionTitle}>Overcast cloudy</h1>
                        <p className={styles.heroSubtitleLine}>The low temperature will reach 25° on this gloomy day</p>
                      </div>

                      {/* 3D Glowing Cloud Icon on the Right */}
                      <div className={styles.hero3DCloudIcon}>
                        <CloudLightning size={64} color="#ffffff" style={{ opacity: 0.95 }} />
                      </div>
                    </div>

                    {/* CARD 2: BOTTOM LEFT "TODAY'S STATISTICS" GOLDEN SINE WAVE CARD */}
                    <div className={styles.goldenStatsCard}>
                      <h3 className={styles.statsTitleText}>Today&apos;s statistics</h3>

                      {/* Golden Continuous Spline Wave SVG */}
                      <div className={styles.goldenSineContainer}>
                        <svg viewBox="0 0 450 85" className={styles.goldenSineSvg} preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="goldenAreaGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Area Under Golden Curve */}
                          <path
                            d="M 0 55 C 60 75, 100 25, 170 50 C 230 70, 280 18, 340 32 C 390 48, 420 62, 450 50 L 450 85 L 0 85 Z"
                            fill="url(#goldenAreaGlow)"
                          />

                          {/* Continuous Golden Sine Spline */}
                          <path
                            d="M 0 55 C 60 75, 100 25, 170 50 C 230 70, 280 18, 340 32 C 390 48, 420 62, 450 50"
                            fill="none"
                            stroke="#d97706"
                            strokeWidth="3.2"
                          />
                        </svg>
                      </div>

                      {/* Six Hourly Telemetry Columns Under Wave */}
                      <div className={styles.sixHourlyColumnsRow}>
                        {horizonNodes.map((node, idx) => (
                          <div key={idx} className={styles.hourlyColItem}>
                            <span className={styles.hourlyColTemp}>{node.temp}</span>
                            <span className={styles.hourlyColTime}>{node.time}</span>
                            <span className={styles.hourlyColCondition}>{node.condition}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CARD 3: DISTRICT TRANSPORT INUNDATION & EVACUATION CORRIDORS (Fills empty vertical space!) */}
                    <div className={styles.gapFillerCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                          <Crosshair size={16} color="#00f0ff" />
                          <span>MUNICIPAL TRANSPORT ARTERIALS &amp; EVACUATION CORRIDORS</span>
                        </div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(0, 214, 255, 0.15)', color: '#00f0ff', border: '1px solid rgba(0, 214, 255, 0.35)' }}>
                          5 MONITORED ROADS
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.2rem' }}>
                        <div className={styles.corridorRow}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4444' }} />
                            <strong>Poorna Market Arterial</strong>
                          </div>
                          <span style={{ color: '#ff4444', fontWeight: 700 }}>84 cm • Inundated (Avoid)</span>
                        </div>

                        <div className={styles.corridorRow}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffaa00' }} />
                            <strong>Gajuwaka Industrial Underpass</strong>
                          </div>
                          <span style={{ color: '#ffaa00', fontWeight: 700 }}>72 cm • Submerged (NDRF Active)</span>
                        </div>

                        <div className={styles.corridorRow}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88' }} />
                            <strong>Beach Road Marine Corridor</strong>
                          </div>
                          <span style={{ color: '#00ff88', fontWeight: 700 }}>14 cm • 100% Passable (Evacuation)</span>
                        </div>

                        <div className={styles.corridorRow}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88' }} />
                            <strong>NH-16 Elevated Freeway</strong>
                          </div>
                          <span style={{ color: '#00ff88', fontWeight: 700 }}>18 cm • Clear Transit</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: RIGHT SIDEBAR FORECAST & GIANT TEMPERATURE CARD */}
                  <div className={styles.rightSpatialSidebarCard}>
                    {/* Date & Time Row */}
                    <div className={styles.rightDateClockRow}>
                      <span>Tuesday, June 20</span>
                      <span>01:00 PM</span>
                    </div>

                    {/* Giant 20° & Wind Vector */}
                    <div className={styles.rightGiantTempBlock}>
                      <div className={styles.giantTempText}>20°</div>
                      <div className={styles.windVectorLine}>
                        <Wind size={15} color="#ffffff" style={{ opacity: 0.8 }} />
                        <span>Northwest, 40.9 km/h</span>
                      </div>
                    </div>

                    {/* Forecast Section Title */}
                    <div className={styles.forecastHeaderRow}>
                      <span className={styles.forecastTitleLabel}>The Next Day Forecast</span>
                    </div>

                    {/* Pill Switch [ 4 days ] [ 14 days ] [ 30 days ] */}
                    <div className={styles.pillSwitchContainer}>
                      <button
                        type="button"
                        className={`${styles.pillSwitchBtn} ${forecastPeriod === '4days' ? styles.pillSwitchBtnActive : ''}`}
                        onClick={() => setForecastPeriod('4days')}
                      >
                        4 days
                      </button>
                      <button
                        type="button"
                        className={`${styles.pillSwitchBtn} ${forecastPeriod === '14days' ? styles.pillSwitchBtnActive : ''}`}
                        onClick={() => setForecastPeriod('14days')}
                      >
                        14 days
                      </button>
                      <button
                        type="button"
                        className={`${styles.pillSwitchBtn} ${forecastPeriod === '30days' ? styles.pillSwitchBtnActive : ''}`}
                        onClick={() => setForecastPeriod('30days')}
                      >
                        30 days
                      </button>
                    </div>

                    {/* Forecast List Items */}
                    <div className={styles.forecastListWrap}>
                      {forecastItems.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <div key={i} className={styles.forecastRow}>
                            <div className={styles.forecastRowLeft}>
                              <div className={styles.forecastRowIconBox}>
                                <Icon size={20} />
                              </div>
                              <div>
                                <div className={styles.forecastRowDay}>{item.day}, {item.date}</div>
                                <div className={styles.forecastRowCond}>{item.condition} • {item.rain}</div>
                              </div>
                            </div>
                            <div className={styles.forecastRowTemp}>{item.temp}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* =========================================================================
                    EXTRA TELEMETRY CARDS (Rain Level, Live IoT Mesh & AI Co-Pilot)
                    ========================================================================= */}
                <div className={styles.extraTelemetryRow}>
                  {/* Telemetry Card 1: Rain Level & Precipitation Breakdown */}
                  <div className={styles.telemetryGlassCard}>
                    <div className={styles.telemetryCardHeader}>
                      <h4 className={styles.telemetryCardTitle}>
                        <Droplets size={17} color="#00f0ff" />
                        <span>PRECIPITATION &amp; WATER DEPTH</span>
                      </h4>
                      <span className={styles.telemetryBadge}>48.2 mm/h INFLOW</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.78rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: '10px' }}>
                        <span style={{ color: '#84abc9', display: 'block', fontSize: '0.7rem' }}>24h Total Rain</span>
                        <strong style={{ color: '#00f0ff', fontSize: '1rem' }}>142.6 mm</strong>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: '10px' }}>
                        <span style={{ color: '#84abc9', display: 'block', fontSize: '0.7rem' }}>Peak Water Depth</span>
                        <strong style={{ color: '#ff4444', fontSize: '1rem' }}>84 cm (Poorna)</strong>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: '10px' }}>
                        <span style={{ color: '#84abc9', display: 'block', fontSize: '0.7rem' }}>Soil Saturation</span>
                        <strong style={{ color: '#00ff88', fontSize: '1rem' }}>96% (Critical)</strong>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: '10px' }}>
                        <span style={{ color: '#84abc9', display: 'block', fontSize: '0.7rem' }}>Runoff Velocity</span>
                        <strong style={{ color: '#ffffff', fontSize: '1rem' }}>1.4 m/s</strong>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Card 2: Autonomous AI Climate Guardian */}
                  <div className={styles.telemetryGlassCard}>
                    <div className={styles.telemetryCardHeader}>
                      <h4 className={styles.telemetryCardTitle}>
                        <Bot size={17} color="#00ff88" />
                        <span>AI DISASTER CO-PILOT</span>
                      </h4>
                      <span style={{ fontSize: '0.68rem', color: '#00ff88', fontWeight: 700 }}>● BACKGROUND ACTIVE</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0, minHeight: '48px' }}>
                      {aiNotes[aiNoteIndex]}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#84abc9' }}>Emails Auto-Dispatched to Inboxes</span>
                      <button
                        type="button"
                        className={styles.slideHoverBtn}
                        style={{ padding: '3px 10px', fontSize: '0.7rem' }}
                        onClick={() => setAiNoteIndex(prev => (prev + 1) % aiNotes.length)}
                      >
                        <span>Next Update</span>
                      </button>
                    </div>
                  </div>

                  {/* Telemetry Card 3: 47 IoT Telemetry Stations Matrix */}
                  <div className={styles.telemetryGlassCard}>
                    <div className={styles.telemetryCardHeader}>
                      <h4 className={styles.telemetryCardTitle}>
                        <Server size={17} color="#00f0ff" />
                        <span>DISTRICT SENSOR MESH</span>
                      </h4>
                      <span className={styles.telemetryBadge}>47 ONLINE</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '5px 8px', borderRadius: '6px' }}>
                        <span>📍 Poorna Market Node #1</span>
                        <strong style={{ color: '#ff4444' }}>84cm • 0.2s ping</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '5px 8px', borderRadius: '6px' }}>
                        <span>📍 Gajuwaka Underpass Node #4</span>
                        <strong style={{ color: '#ffaa00' }}>72cm • 0.3s ping</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '5px 8px', borderRadius: '6px' }}>
                        <span>📍 Beach Road Marine Node #7</span>
                        <strong style={{ color: '#00ff88' }}>14cm • Passable</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 2: EMERGENCY BROADCAST DISPATCHER (BELL ICON) */}
            {activeTab === 'broadcasts' && (
              <motion.div
                key="broadcasts"
                initial={{ opacity: 0, y: 14, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.99 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className={styles.fullViewCard}
              >
                <div className={styles.subCardHeader}>
                  <h3 className={styles.subCardTitle}>
                    <Bell size={22} color="#00f0ff" />
                    <span>Municipal Emergency Broadcast Dispatcher</span>
                  </h3>
                </div>
                <AuthorityAlertDispatcher />
              </motion.div>
            )}

            {/* VIEW 3: LIVE GIS INUNDATION MAP (CROSSHAIR ICON) */}
            {activeTab === 'livemap' && (
              <motion.div
                key="livemap"
                initial={{ opacity: 0, y: 14, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.99 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className={styles.fullViewCard}
                style={{ height: 'calc(100vh - 160px)', padding: '1.25rem' }}
              >
                <div className={styles.subCardHeader}>
                  <h3 className={styles.subCardTitle}>
                    <Crosshair size={22} color="#00f0ff" />
                    <span>GIS Spatial Inundation &amp; Emergency Safe Corridors</span>
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#00ff88', fontWeight: 700 }}>● 47 IoT SENSORS LIVE</span>
                </div>
                <div style={{ flex: 1, borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)', marginTop: '0.5rem' }}>
                  <FloodMap zones={zones} routes={safeRoutes} />
                </div>
              </motion.div>
            )}

            {/* VIEW 4: XGBOOST AI PREDICTIONS (BAR CHART ICON) */}
            {activeTab === 'predictions' && (
              <motion.div
                key="predictions"
                initial={{ opacity: 0, y: 14, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.99 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className={styles.fullViewCard}
              >
                <div className={styles.subCardHeader}>
                  <h3 className={styles.subCardTitle}>
                    <BarChart3 size={22} color="#00f0ff" />
                    <span>XGBoost Multi-Variable AI Hydrology &amp; Inundation Curves</span>
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#00f0ff', fontWeight: 700 }}>AUC 0.94 ACCURACY</span>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <PredictionCharts forecast={weatherData.forecast} zones={zones} />
                </div>
              </motion.div>
            )}

            {/* VIEW 5: CITIZEN SOS & RESCUE DISPATCH (LIFEBUOY ICON) */}
            {activeTab === 'sos_dispatch' && (
              <motion.div
                key="sos_dispatch"
                initial={{ opacity: 0, y: 14, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.99 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className={styles.fullViewCard}
              >
                <div className={styles.subCardHeader}>
                  <h3 className={styles.subCardTitle}>
                    <LifeBuoy size={22} color="#ff4444" />
                    <span>Citizen Distress SOS &amp; NDRF Rapid Rescue Fleet</span>
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#ff4444', fontWeight: 800 }}>{pendingSOSCount} PENDING RESCUES</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                  {sosList.map(sos => (
                    <div
                      key={sos.id}
                      style={{
                        background: 'rgba(16, 28, 45, 0.7)',
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
                          <strong style={{ fontSize: '1rem', color: '#fff' }}>{sos.name}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)' }}>{sos.phone}</span>
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
                              className={styles.slideHoverBtn}
                              onClick={() => handleDispatchSOS(sos.id, 'NDRF Boat Unit 1')}
                              style={{ background: 'rgba(255, 68, 68, 0.25)', borderColor: '#ff4444' }}
                            >
                              <LifeBuoy size={14} />
                              <span>Deploy NDRF Unit</span>
                            </button>
                            <button
                              type="button"
                              className={styles.slideHoverBtn}
                              onClick={() => handleDispatchSOS(sos.id, 'SDRF Rapid Rescue')}
                            >
                              <span>Deploy SDRF</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className={styles.slideHoverBtn}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Apple Vision Pro Horizontal Home Indicator Bar */}
        <div className={styles.bottomHomeBar} />
      </div>

      {/* Emergency Simulation Modal */}
      <HackathonSimulatorModal isOpen={showSimulatorModal} onClose={() => setShowSimulatorModal(false)} />
    </div>
  );
}
