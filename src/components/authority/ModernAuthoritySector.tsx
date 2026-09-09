'use client';

import React, { useState, useMemo } from 'react';
import { useFloodData } from '@/context/FloodDataContext';
import { useAuth } from '@/context/AuthContext';
import styles from './authorityModern.module.css';
import {
  LayoutGrid,
  Bell,
  Crosshair,
  BarChart3,
  SlidersHorizontal,
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
  CheckCircle
} from 'lucide-react';
import AuthorityAlertDispatcher from '@/components/authority/AuthorityAlertDispatcher';
import HackathonSimulatorModal from '@/components/demo/HackathonSimulatorModal';
import dynamic from 'next/dynamic';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false });
const PredictionCharts = dynamic(() => import('@/components/charts/PredictionCharts'), { ssr: false });

type AuthorityTab = 'overview' | 'broadcasts' | 'livemap' | 'predictions' | 'dams' | 'sos_dispatch';
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
    zones,
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

  // Reservoir Sluice Gate Control state
  const [damLevels, setDamLevels] = useState([
    { id: 'd1', name: 'Meghadrigeddha Reservoir', capacity: 88, dischargeRate: 450, status: 'Warning', sluiceGate: 65, safeMax: 90 },
    { id: 'd2', name: 'Thatipudi Reservoir', capacity: 74, dischargeRate: 220, status: 'Normal', sluiceGate: 35, safeMax: 85 },
    { id: 'd3', name: 'Raiwada Reservoir', capacity: 94, dischargeRate: 720, status: 'Critical', sluiceGate: 85, safeMax: 95 },
    { id: 'd4', name: 'Mudasarlova Catchment', capacity: 62, dischargeRate: 140, status: 'Normal', sluiceGate: 20, safeMax: 80 },
  ]);

  // Hourly nodes exactly matching the reference image values
  const horizonNodes = [
    { temp: '27°', time: '09:00 AM', condition: 'Partly Cloudy' },
    { temp: '26°', time: '10:00 AM', condition: 'Sunny cloudy' },
    { temp: '27°', time: '11:00 AM', condition: 'Partly Cloudy' },
    { temp: '23°', time: '12:00 PM', condition: 'Moderate rain' },
    { temp: '20°', time: '01:00 PM', condition: 'Overcast Cloudy' },
    { temp: '22°', time: '02:00 PM', condition: 'Moderate Cloudy' },
  ];

  // Multi-day forecast list matching reference image
  const forecastItems = useMemo(() => {
    if (forecastPeriod === '4days') {
      return [
        { day: 'Wednesday', date: 'June 21', condition: 'Partly Cloudy', temp: '28°', icon: Cloud },
        { day: 'Thursday', date: 'June 22', condition: 'Sunny cloudy', temp: '26°', icon: Sun },
        { day: 'Friday', date: 'June 22', condition: 'Moderate rain', temp: '21°', icon: CloudRain },
        { day: 'Saturday', date: 'June 23', condition: 'Partly Cloudy', temp: '25°', icon: Cloud },
      ];
    } else if (forecastPeriod === '14days') {
      return [
        { day: 'Wednesday', date: 'June 21', condition: 'Partly Cloudy', temp: '28°', icon: Cloud },
        { day: 'Thursday', date: 'June 22', condition: 'Sunny cloudy', temp: '26°', icon: Sun },
        { day: 'Friday', date: 'June 22', condition: 'Heavy Storm', temp: '20°', icon: CloudLightning },
        { day: 'Saturday', date: 'June 23', condition: 'Moderate rain', temp: '22°', icon: CloudRain },
        { day: 'Sunday', date: 'June 24', condition: 'Overcast', temp: '24°', icon: Cloud },
        { day: 'Monday', date: 'June 25', condition: 'Clear Sky', temp: '29°', icon: Sun },
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
    <div className={styles.spatialViewportWrapper}>
      {/* =========================================================================
          FLOATING LEFT CAPSULE DOCK (Exact Match with Reference Image media_1788963090452.jpg)
          ========================================================================= */}
      <aside className={styles.floatingCapsuleDock}>
        {/* Button 1: Grid / Apps Icon */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'overview' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('overview')}
          title="Weather & Command HUD Overview"
        >
          <LayoutGrid size={20} />
        </button>

        {/* Button 2: Bell / Broadcast Alert Icon */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'broadcasts' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('broadcasts')}
          title="Emergency Municipal Broadcast Dispatcher"
        >
          <Bell size={20} />
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
          <Crosshair size={20} />
        </button>

        {/* Button 4: Equalizer / Bar Analytics Icon */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'predictions' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('predictions')}
          title="XGBoost AI Hydrology Telemetry & Predictions"
        >
          <BarChart3 size={20} />
        </button>

        {/* Button 5: Sliders / Control Icon */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'dams' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('dams')}
          title="Reservoir & Hydraulic Sluice Gate Control Mesh"
        >
          <SlidersHorizontal size={20} />
        </button>

        {/* Separator */}
        <div style={{ width: '24px', height: '1px', background: 'rgba(255, 255, 255, 0.2)', margin: '4px 0' }} />

        {/* Citizen SOS Button */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'sos_dispatch' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('sos_dispatch')}
          title="Citizen SOS Rescue Dispatch"
        >
          <LifeBuoy size={19} />
          {pendingSOSCount > 0 && (
            <span className={styles.dockBadgeCount}>{pendingSOSCount}</span>
          )}
        </button>

        {/* Emergency Simulator */}
        <button
          type="button"
          className={styles.dockIconButton}
          onClick={() => setShowSimulatorModal(true)}
          title="Emergency Simulator"
          style={{ color: '#00f0ff' }}
        >
          <Zap size={19} />
        </button>

        {/* Logout */}
        <button
          type="button"
          className={styles.dockIconButton}
          onClick={logout}
          title="Exit Command"
          style={{ color: 'rgba(255, 120, 120, 0.8)' }}
        >
          <LogOut size={18} />
        </button>
      </aside>

      {/* =========================================================================
          MAIN SPATIAL CURVED GLASS PANEL (Exact Match with Reference Image)
          ========================================================================= */}
      <div className={styles.curvedSpatialPanel}>
        {/* Ambient Top Strip */}
        <div className={styles.panelTopHeader}>
          <div className={styles.commandBadgeTag}>
            <Shield size={14} color="#00f0ff" />
            <span>AQUASENTINEL SPATIAL COMMAND • {user?.name || 'MUNICIPAL ADMINISTRATOR'}</span>
          </div>

          <div className={styles.headerControlsGroup}>
            <button
              type="button"
              className={styles.headerCompactBtn}
              onClick={handleToggleSiren}
              style={{
                borderColor: masterSirenActive ? '#ff4444' : 'rgba(255, 255, 255, 0.2)',
                color: masterSirenActive ? '#ff4444' : '#ffffff',
                background: masterSirenActive ? 'rgba(255, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)'
              }}
            >
              <Volume2 size={13} />
              <span>{masterSirenActive ? 'SIREN ACTIVE' : 'DISTRICT SIREN'}</span>
            </button>

            <button
              type="button"
              className={styles.headerCompactBtn}
              onClick={() => setShowSimulatorModal(true)}
            >
              <Zap size={13} color="#00f0ff" />
              <span>SIMULATION</span>
            </button>
          </div>
        </div>

        {/* Interior Canvas */}
        <div className={styles.panelContentCanvas}>
          {/* =========================================================================
              VIEW 1: SPATIAL HUD OVERVIEW (EXACT 1-TO-1 MATCH WITH REFERENCE IMAGE)
              ========================================================================= */}
          {activeTab === 'overview' && (
            <div className={styles.spatialHUDGrid}>
              {/* Left Column: 2 Cards (Hero Weather Card + Golden Sine Wave Card) */}
              <div className={styles.spatialLeftCardsCol}>
                {/* CARD 1: TOP LEFT HERO WEATHER CARD */}
                <div className={styles.heroWeatherSpatialCard}>
                  <div>
                    <div className={styles.heroLocationPill}>
                      <MapPin size={15} color="#ffffff" />
                      <span>Purwokerto, Banyumas</span>
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
                            <div className={styles.forecastRowCond}>{item.condition}</div>
                          </div>
                        </div>
                        <div className={styles.forecastRowTemp}>{item.temp}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: EMERGENCY BROADCAST DISPATCHER (BELL ICON)
              ========================================================================= */}
          {activeTab === 'broadcasts' && (
            <div className={styles.fullViewCard}>
              <div className={styles.subCardHeader}>
                <h3 className={styles.subCardTitle}>
                  <Bell size={22} color="#00f0ff" />
                  <span>Municipal Emergency Broadcast Dispatcher</span>
                </h3>
              </div>
              <AuthorityAlertDispatcher />
            </div>
          )}

          {/* =========================================================================
              VIEW 3: LIVE GIS INUNDATION MAP (CROSSHAIR ICON)
              ========================================================================= */}
          {activeTab === 'livemap' && (
            <div className={styles.fullViewCard} style={{ height: 'calc(100vh - 160px)', padding: '1.25rem' }}>
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
            </div>
          )}

          {/* =========================================================================
              VIEW 4: XGBOOST AI PREDICTIONS (BAR CHART ICON)
              ========================================================================= */}
          {activeTab === 'predictions' && (
            <div className={styles.fullViewCard}>
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
            </div>
          )}

          {/* =========================================================================
              VIEW 5: RESERVOIR & SLUICE GATE MESH (SLIDERS ICON)
              ========================================================================= */}
          {activeTab === 'dams' && (
            <div className={styles.fullViewCard}>
              <div className={styles.subCardHeader}>
                <h3 className={styles.subCardTitle}>
                  <SlidersHorizontal size={22} color="#00f0ff" />
                  <span>Reservoir Inundation &amp; Automated Hydraulic Sluice Gate Mesh</span>
                </h3>
                <button
                  type="button"
                  className={styles.slideHoverBtn}
                  onClick={() => setAutoBalancingActive(!autoBalancingActive)}
                  style={{ borderColor: autoBalancingActive ? '#00ff88' : '#00f0ff', color: autoBalancingActive ? '#00ff88' : '#00f0ff' }}
                >
                  <CheckCircle2 size={15} />
                  <span>{autoBalancingActive ? 'AI AUTO-BALANCING: ACTIVE' : 'MANUAL OVERRIDE'}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
                {damLevels.map(dam => (
                  <div
                    key={dam.id}
                    style={{
                      background: 'rgba(16, 28, 45, 0.7)',
                      border: `1.5px solid ${dam.status === 'Critical' ? '#ff4444' : dam.status === 'Warning' ? '#ffaa00' : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '18px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{dam.name}</strong>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: dam.status === 'Critical' ? '#ff4444' : dam.status === 'Warning' ? '#ffaa00' : '#00ff88', color: '#000' }}>
                        {dam.status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.35rem' }}>
                        <span>Capacity Filled:</span>
                        <strong style={{ color: dam.capacity > 85 ? '#ff4444' : '#fff' }}>{dam.capacity}%</strong>
                      </div>
                      <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${dam.capacity}%`, background: dam.capacity > 85 ? '#ff4444' : '#00f0ff' }} />
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      Discharge Flow Rate: <strong style={{ color: '#fff' }}>{dam.dischargeRate} cusecs</strong>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#fff', marginBottom: '0.4rem' }}>
                        <span>Hydraulic Sluice Elevation:</span>
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
              VIEW 6: CITIZEN SOS & RESCUE DISPATCH
              ========================================================================= */}
          {activeTab === 'sos_dispatch' && (
            <div className={styles.fullViewCard}>
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
            </div>
          )}
        </div>

        {/* Apple Vision Pro Horizontal Home Indicator Bar */}
        <div className={styles.bottomHomeBar} />
      </div>

      {/* Emergency Simulation Modal */}
      <HackathonSimulatorModal isOpen={showSimulatorModal} onClose={() => setShowSimulatorModal(false)} />
    </div>
  );
}
