'use client';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFloodData } from '@/context/FloodDataContext';
import { useAuth } from '@/context/AuthContext';
import styles from './citizenModern.module.css';
import SpatialGlobe3D, { GlobePin } from './SpatialGlobe3D';
import dynamic from 'next/dynamic';
import {
  LayoutGrid,
  SlidersHorizontal,
  Globe,
  CreditCard,
  Navigation,
  Send,
  Settings,
  Bell,
  LogOut,
  Droplets,
  CloudRain,
  Wind,
  Shield,
  MapPin,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Radio,
  FileText,
  LifeBuoy,
  Waves,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  User,
  Volume2
} from 'lucide-react';
import { playEmergencySirenAudio } from '@/utils/sirenAudio';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false });
const PredictionCharts = dynamic(() => import('@/components/charts/PredictionCharts'), { ssr: false });
const EvacuationRoutes = dynamic(() => import('@/components/citizen/EvacuationRoutes'), { ssr: false });
const WeatherForecast = dynamic(() => import('@/components/citizen/WeatherForecast'), { ssr: false });

export type CitizenTab = 'overview' | 'analytics' | 'livemap' | 'routes' | 'services' | 'sos' | 'settings';

export default function ModernCitizenSector() {
  const { user, logout } = useAuth();
  const {
    weatherData,
    zones,
    safeRoutes,
    broadcastAlerts,
    xgboostPrediction,
    weatherMode,
    isSimulationActive,
    sendAuthorityBroadcast,
  } = useFloodData();

  const [activeTab, setActiveTab] = useState<CitizenTab>('overview');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('r1');
  const [selectedPin, setSelectedPin] = useState<GlobePin | null>(null);
  const [autoDefenseActive, setAutoDefenseActive] = useState(true);

  // SOS Form State
  const [sosArea, setSosArea] = useState('Poorna Market Main Road');
  const [sosType, setSosType] = useState('Submerged Roadway & Trapped Citizens');
  const [sosSubmitted, setSosSubmitted] = useState(false);

  // Complaint Form State
  const [complaintCategory, setComplaintCategory] = useState('Clogged Stormwater Drain');
  const [complaintArea, setComplaintArea] = useState('Gajuwaka Industrial Canal');
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  const userDisplayName = user?.name || 'Nadeem Ahmed Shaik';
  const userInitials = userDisplayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const currentRain = weatherData.current.rainfall;
  const overallRisk = xgboostPrediction.riskLevel;

  // 24-hr Heatmap Matrix Bar Colors for bottom left card
  const matrixHours = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const isPeak = i >= 4 && i <= 8;
      const height1 = isPeak ? 18 : Math.floor(Math.random() * 12 + 6);
      const height2 = isPeak ? 14 : Math.floor(Math.random() * 8 + 4);
      return {
        color1: isPeak ? '#f43f5e' : i % 2 === 0 ? '#6366f1' : '#06b6d4',
        color2: isPeak ? '#f59e0b' : i % 3 === 0 ? '#818cf8' : '#e0e7ff',
        height1,
        height2,
      };
    });
  }, []);

  const handleDispatchSOS = (e: React.FormEvent) => {
    e.preventDefault();
    setSosSubmitted(true);
    sendAuthorityBroadcast({
      area: sosArea,
      risk: 'high',
      message: `CITIZEN SOS DISPATCH: ${sosType} reported at ${sosArea}. Emergency response teams notified.`,
    });
    setTimeout(() => setSosSubmitted(false), 5000);
  };

  const handleFileComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    setComplaintSubmitted(true);
    setTimeout(() => setComplaintSubmitted(false), 4000);
  };

  return (
    <div className={styles.spatialViewportWrapper}>
      {/* =========================================================================
          1. FLOATING LEFT CAPSULE NAVIGATION DOCK (Matching Reference Image)
          ========================================================================= */}
      <aside className={styles.floatingCapsuleDock}>
        {/* Top Gradient Ring Logo */}
        <div className={styles.dockLogoCircle} onClick={() => setActiveTab('overview')} title="AquaSentinel Citizen Spatial Command">
          <div className={styles.dockLogoInner}>
            <div className={styles.dockLogoCore} />
          </div>
        </div>

        {/* Icon 1: Grid Overview */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'overview' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('overview')}
          title="Citizen 3D Globe Spatial Overview"
        >
          {activeTab === 'overview' && (
            <motion.div
              layoutId="activeCitizenDockIndicator"
              className={styles.dockActiveIndicator}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <LayoutGrid size={21} />
        </button>

        {/* Icon 2: Sliders / AI Telemetry */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'analytics' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('analytics')}
          title="XGBoost AI Hydrology Telemetry"
        >
          {activeTab === 'analytics' && (
            <motion.div
              layoutId="activeCitizenDockIndicator"
              className={styles.dockActiveIndicator}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <SlidersHorizontal size={20} />
        </button>

        {/* Icon 3: Globe 3D GIS Map */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'livemap' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('livemap')}
          title="Live Doppler Radar GIS Map"
        >
          {activeTab === 'livemap' && (
            <motion.div
              layoutId="activeCitizenDockIndicator"
              className={styles.dockActiveIndicator}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <Globe size={21} />
        </button>

        {/* Icon 4: Citizen Pass / Relief Services */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'services' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('services')}
          title="Citizen Flood Passes & Relief Claims"
        >
          {activeTab === 'services' && (
            <motion.div
              layoutId="activeCitizenDockIndicator"
              className={styles.dockActiveIndicator}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <CreditCard size={20} />
        </button>

        {/* Icon 5: Evacuation Routes */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'routes' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('routes')}
          title="Safe Evacuation Corridors & GPS Routing"
        >
          {activeTab === 'routes' && (
            <motion.div
              layoutId="activeCitizenDockIndicator"
              className={styles.dockActiveIndicator}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <Navigation size={20} />
        </button>

        {/* Icon 6: Emergency SOS */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'sos' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('sos')}
          title="Emergency SOS & Incident Dispatch"
          style={{ color: '#ef4444' }}
        >
          {activeTab === 'sos' && (
            <motion.div
              layoutId="activeCitizenDockIndicator"
              className={styles.dockActiveIndicator}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <Send size={19} />
        </button>

        {/* Separator */}
        <div style={{ width: '26px', height: '1px', background: 'rgba(226, 232, 240, 0.8)', margin: '4px 0' }} />

        {/* Settings */}
        <button
          type="button"
          className={`${styles.dockIconButton} ${activeTab === 'settings' ? styles.dockIconButtonActive : ''}`}
          onClick={() => setActiveTab('settings')}
          title="Citizen Alert Settings"
        >
          {activeTab === 'settings' && (
            <motion.div
              layoutId="activeCitizenDockIndicator"
              className={styles.dockActiveIndicator}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <Settings size={19} />
        </button>

        {/* Bottom User Avatar & Notification Badge */}
        <div
          className={styles.dockAvatarBtn}
          onClick={() => setActiveTab('overview')}
          title={`Logged in as ${userDisplayName}`}
        >
          <span>{userInitials}</span>
          <div className={styles.dockAvatarDot} />
        </div>

        {/* Logout */}
        <button
          type="button"
          className={styles.dockIconButton}
          onClick={logout}
          title="Sign Out"
          style={{ color: '#94a3b8' }}
        >
          <LogOut size={18} />
        </button>
      </aside>

      {/* =========================================================================
          2. MAIN CURVED SPATIAL GLASS PANEL
          ========================================================================= */}
      <main className={styles.curvedSpatialPanel}>
        <div className={styles.panelContentCanvas}>
          <AnimatePresence mode="wait">
            {/* VIEW 1: SPATIAL 3D GLOBE & REFERENCE OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.99 }}
                transition={{ duration: 0.25 }}
                className={styles.spatialOverviewGrid}
              >
                {/* ─── LEFT COLUMN: GENERAL STATISTICS & HYDROLOGY CARDS ─── */}
                <div className={styles.leftTelemetryColumn}>
                  {/* Hero Statistics Section */}
                  <div className={styles.generalStatsCard}>
                    <h2 className={styles.statsSectionTitle}>General statistics</h2>
                    <div className={styles.allUsersLabelRow}>
                      <span>All Citizens Protected</span>
                      <ChevronRight size={12} />
                    </div>
                    <div className={styles.heroStatNumber}>7,541,390</div>

                    {/* Stat Pills */}
                    <div className={styles.statPillRow}>
                      <div className={styles.statPillIconBoxPurple}>
                        <Shield size={18} />
                      </div>
                      <div>
                        <div className={styles.statPillTextTitle}>Dynamics (24h)</div>
                        <div className={styles.statPillTextVal}>+540,549</div>
                      </div>
                    </div>

                    <div className={styles.statPillRow}>
                      <div className={styles.statPillIconBoxCyan}>
                        <Zap size={18} />
                      </div>
                      <div>
                        <div className={styles.statPillTextTitle}>Active Shields</div>
                        <div className={styles.statPillTextVal}>1,205,677</div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Hydrology Defense Card */}
                  <div className={styles.glassStatCard}>
                    <div className={styles.cardHeaderRow}>
                      <span className={styles.cardHeaderTitle}>Municipal Inundation Control</span>
                      <div className={styles.cardHeaderBadgeGreen}>
                        <TrendingUp size={11} />
                        <span>1.0%</span>
                      </div>
                    </div>
                    <div className={styles.cardHeroVal}>$34,000</div>
                    <div className={styles.cardSubCaption}>Compared to $21,490 last monsoon</div>

                    {/* Progress Bars */}
                    <div>
                      <div className={styles.progressLabelRow}>
                        <span>Poorna Market Basin</span>
                        <span>613 mm</span>
                      </div>
                      <div className={styles.progressBarTrack}>
                        <div className={styles.progressBarFillPurple} style={{ width: '74%' }} />
                      </div>

                      <div className={styles.progressLabelRow}>
                        <span>Gajuwaka Industrial Drainage</span>
                        <span>428 mm</span>
                      </div>
                      <div className={styles.progressBarTrack}>
                        <div className={styles.progressBarFillRed} style={{ width: '56%' }} />
                      </div>

                      <div className={styles.progressLabelRow}>
                        <span>Meghadrigedda Reservoir Runoff</span>
                        <span>512 mm</span>
                      </div>
                      <div className={styles.progressBarTrack}>
                        <div className={styles.progressBarFillOrange} style={{ width: '82%' }} />
                      </div>
                    </div>
                  </div>

                  {/* 24-Hour Activity & Precipitation Matrix Card */}
                  <div className={styles.glassStatCard}>
                    <div className={styles.cardHeaderRow}>
                      <span className={styles.cardHeaderTitle}>24-Hr Precipitation Matrix</span>
                      <div className={styles.cardHeaderBadgeGreen}>
                        <TrendingUp size={11} />
                        <span>12%</span>
                      </div>
                    </div>
                    <div className={styles.cardHeroVal}>3,412,875</div>
                    <div className={styles.cardSubCaption}>Telemetry samples captured across 47 IoT mesh nodes</div>

                    {/* Heatmap Matrix Grid */}
                    <div className={styles.matrixGridWrap}>
                      {matrixHours.map((bar, idx) => (
                        <div key={idx} className={styles.matrixBar}>
                          <div className={styles.matrixSegment} style={{ background: bar.color1, height: `${bar.height1}px` }} />
                          <div className={styles.matrixSegment} style={{ background: bar.color2, height: `${bar.height2}px` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ─── CENTER COLUMN: 3D TOPOGRAPHIC GLOBE ─── */}
                <div className={styles.centerGlobeColumn}>
                  <SpatialGlobe3D
                    onSelectPin={(pin) => setSelectedPin(pin)}
                    onSwitchToGisMap={() => setActiveTab('livemap')}
                  />
                </div>

                {/* ─── RIGHT COLUMN: ANALYTICS SPLINE & GAUGES ─── */}
                <div className={styles.rightAnalyticsColumn}>
                  {/* Top Quantity of Data & Hydrology Trend */}
                  <div>
                    <div className={styles.quantityDataHeroTitle}>Quantity of data</div>
                    <div className={styles.salesTrendSubRow}>
                      <span className={styles.salesTrendLabel}>Hydrology trend</span>
                    </div>
                    <div className={styles.salesTrendValHero}>64,3%</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      Compared to 21,504 last year
                    </div>

                    {/* Dual Wave Spline Curve SVG Matching Reference Image */}
                    <div className={styles.splineWaveContainer}>
                      <svg width="100%" height="100%" viewBox="0 0 240 64" fill="none" preserveAspectRatio="none">
                        <path
                          d="M0,45 C40,10 70,55 110,25 C150,-5 180,48 240,18"
                          stroke="#8b5cf6"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d="M0,52 C35,28 65,48 115,18 C165,-8 195,38 240,28"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray="4, 4"
                          fill="none"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Realtime Sector Breakdown Table */}
                  <div className={styles.sectorTableWrap}>
                    <div className={styles.sectorTableRow}>
                      <span className={styles.sectorTableName}>Beach Road Coastal Route</span>
                      <div className={styles.sectorTableNums}>
                        <span>760</span>
                        <span>2,540</span>
                        <span className={styles.trendIconGreen}>▲</span>
                      </div>
                    </div>
                    <div className={styles.sectorTableRow}>
                      <span className={styles.sectorTableName}>Inner Ring Road Bypass</span>
                      <div className={styles.sectorTableNums}>
                        <span>650</span>
                        <span>2,304</span>
                        <span className={styles.trendIconGreen}>▲</span>
                      </div>
                    </div>
                    <div className={styles.sectorTableRow}>
                      <span className={styles.sectorTableName}>Poorna Market Corridor</span>
                      <div className={styles.sectorTableNums}>
                        <span>612</span>
                        <span>2,140</span>
                        <span className={styles.trendIconGreen}>▲</span>
                      </div>
                    </div>
                    <div className={styles.sectorTableRow}>
                      <span className={styles.sectorTableName}>Gajuwaka Industrial Drainage</span>
                      <div className={styles.sectorTableNums}>
                        <span>598</span>
                        <span>1,976</span>
                        <span className={styles.trendIconRed}>▼</span>
                      </div>
                    </div>
                    <div className={styles.sectorTableRow}>
                      <span className={styles.sectorTableName}>Madhurawada Safe Zone</span>
                      <div className={styles.sectorTableNums}>
                        <span>513</span>
                        <span>1,903</span>
                        <span className={styles.trendIconRed}>▼</span>
                      </div>
                    </div>
                    <div className={styles.sectorTableRow}>
                      <span className={styles.sectorTableName}>Meghadrigedda Sluice 1-4</span>
                      <div className={styles.sectorTableNums}>
                        <span>498</span>
                        <span>1,320</span>
                        <span className={styles.trendIconGreen}>▲</span>
                      </div>
                    </div>
                    <div className={styles.sectorTableRow}>
                      <span className={styles.sectorTableName}>ESP32-CAM Mesh Nodes</span>
                      <div className={styles.sectorTableNums}>
                        <span>476</span>
                        <span>1,103</span>
                        <span className={styles.trendIconGreen}>▲</span>
                      </div>
                    </div>
                    <div className={styles.sectorTableRow}>
                      <span className={styles.sectorTableName}>Emergency Rescue Units</span>
                      <div className={styles.sectorTableNums}>
                        <span>412</span>
                        <span>1,043</span>
                        <span className={styles.trendIconGreen}>▲</span>
                      </div>
                    </div>
                  </div>

                  {/* Circular Progress Gauges (27% and 67%) */}
                  <div className={styles.gaugesContainer}>
                    {/* Gauge 1: 27% */}
                    <div className={styles.circularGaugeBox}>
                      <div className={styles.gaugeSvgWrap}>
                        <svg width="44" height="44" viewBox="0 0 44 44">
                          <circle cx="22" cy="22" r="18" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                          <circle
                            cx="22"
                            cy="22"
                            r="18"
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="4"
                            strokeDasharray="113"
                            strokeDashoffset="82"
                            strokeLinecap="round"
                            transform="rotate(-90 22 22)"
                          />
                        </svg>
                        <span className={styles.gaugePercentText}>27%</span>
                      </div>
                      <div>
                        <div className={styles.gaugeLabelTitle}>92,980</div>
                        <div className={styles.gaugeLabelSub}>Soil Saturation</div>
                      </div>
                    </div>

                    {/* Gauge 2: 67% */}
                    <div className={styles.circularGaugeBox}>
                      <div className={styles.gaugeSvgWrap}>
                        <svg width="44" height="44" viewBox="0 0 44 44">
                          <circle cx="22" cy="22" r="18" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                          <circle
                            cx="22"
                            cy="22"
                            r="18"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="4"
                            strokeDasharray="113"
                            strokeDashoffset="37"
                            strokeLinecap="round"
                            transform="rotate(-90 22 22)"
                          />
                        </svg>
                        <span className={styles.gaugePercentText}>67%</span>
                      </div>
                      <div>
                        <div className={styles.gaugeLabelTitle}>22,652</div>
                        <div className={styles.gaugeLabelSub}>Drainage Capacity</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 2: XGBOOST AI HYDROLOGY PREDICTIONS */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                      XGBoost ML Flood Prediction &amp; Basin Telemetry
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Gradient-Boosted Decision Trees • 150 Estimators calibrated for Visakhapatnam Metropolitan Catchment
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('overview')}
                    style={{ background: '#f1f5f9', border: 'none', padding: '6px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                  >
                    Back to Globe
                  </button>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(99, 102, 241, 0.06)' }}>
                  <PredictionCharts
                    forecast={weatherData.forecast}
                    zones={zones}
                  />
                </div>
              </motion.div>
            )}

            {/* VIEW 3: LIVE GIS DOPPLER RADAR MAP */}
            {activeTab === 'livemap' && (
              <motion.div
                key="livemap"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'calc(100vh - 6rem)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                      Live GIS Doppler Radar &amp; Inundation Overlays
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Real-time OpenStreetMap with Doppler precipitation density, waterlogging zones, and GPS tracking
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('overview')}
                    style={{ background: '#f1f5f9', border: 'none', padding: '6px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                  >
                    Back to 3D Globe
                  </button>
                </div>

                <div style={{ flex: 1, borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(99, 102, 241, 0.08)' }}>
                  <FloodMap
                    zones={zones}
                    routes={safeRoutes}
                    selectedRouteId={selectedRouteId}
                    onSelectRoute={(id) => setSelectedRouteId(id)}
                  />
                </div>
              </motion.div>
            )}

            {/* VIEW 4: SAFE EVACUATION ROUTES */}
            {activeTab === 'routes' && (
              <motion.div
                key="routes"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                      Safe Evacuation Corridors &amp; Routing
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      GPS-calibrated passable roadways bypassing flash-flood basins in Visakhapatnam
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('overview')}
                    style={{ background: '#f1f5f9', border: 'none', padding: '6px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                  >
                    Back to Globe
                  </button>
                </div>

                <EvacuationRoutes
                  zones={zones}
                  safeRoutes={safeRoutes}
                  selectedRouteId={selectedRouteId}
                  setSelectedRouteId={setSelectedRouteId}
                />
              </motion.div>
            )}

            {/* VIEW 5: CITIZEN PASS & RELIEF SERVICES */}
            {activeTab === 'services' && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                      Citizen Disaster Pass &amp; Government Relief Claims
                    </h2>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Emergency shelter passes, municipal complaint filing, and subsidized flood relief allocations
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('overview')}
                    style={{ background: '#f1f5f9', border: 'none', padding: '6px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                  >
                    Back to Globe
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Digital Citizen Flood Defense Pass */}
                  <div style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: '24px', padding: '1.8rem', color: '#ffffff', boxShadow: '0 16px 40px rgba(99, 102, 241, 0.35)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>Government of Andhra Pradesh</span>
                        <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem' }}>AQUASENTINEL CITIZEN PASS</h3>
                      </div>
                      <Shield size={32} color="#ffffff" />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>Pass Holder</span>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{userDisplayName}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>ID: AQ-CITIZEN-8842-VIZAG</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem', fontSize: '0.78rem' }}>
                      <div>
                        <span style={{ opacity: 0.75, display: 'block', fontSize: '0.65rem' }}>Emergency Shelter Access</span>
                        <strong>Sector 4 High School Shelter</strong>
                      </div>
                      <div>
                        <span style={{ opacity: 0.75, display: 'block', fontSize: '0.65rem' }}>Status</span>
                        <span style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>ACTIVE</span>
                      </div>
                    </div>
                  </div>

                  {/* Municipal Complaint & Sluice Gate Request Form */}
                  <div style={{ background: '#ffffff', borderRadius: '24px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(99, 102, 241, 0.06)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e1b4b', margin: '0 0 0.4rem 0' }}>
                      Report Drainage Issue / Request Sluice Gate Action
                    </h3>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: '#64748b' }}>
                      Your report is routed directly to the GVMC Municipal Command Center.
                    </p>

                    <form onSubmit={handleFileComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                          Incident Category
                        </label>
                        <select
                          value={complaintCategory}
                          onChange={(e) => setComplaintCategory(e.target.value)}
                          style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#1e1b4b' }}
                        >
                          <option value="Clogged Stormwater Drain">Clogged Stormwater Drain / Sewer Overflow</option>
                          <option value="Road Submersion">Roadway Submerged (&gt;30cm water depth)</option>
                          <option value="Sluice Gate Action">Request Sluice Gate Elevation at Canal</option>
                          <option value="Electricity / Transformer Risk">Waterlogged Electrical Transformer Hazard</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                          Location / Catchment Area
                        </label>
                        <input
                          type="text"
                          value={complaintArea}
                          onChange={(e) => setComplaintArea(e.target.value)}
                          style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#1e1b4b', boxSizing: 'border-box' }}
                        />
                      </div>

                      <button
                        type="submit"
                        style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        <FileText size={16} />
                        <span>Submit Municipal Report</span>
                      </button>

                      {complaintSubmitted && (
                        <div style={{ background: '#ecfdf5', color: '#10b981', padding: '0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>
                          ✅ Report Dispatched to GVMC Engineering Division (Tracking #GVMC-9942)
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 6: EMERGENCY SOS DISPATCH */}
            {activeTab === 'sos' && (
              <motion.div
                key="sos"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '700px', margin: '0 auto' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 0.85rem auto' }}>
                    <Send size={28} />
                  </div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e1b4b', margin: '0 0 0.4rem 0' }}>
                    Emergency SOS &amp; Rescue Dispatch
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Triggers immediate high-priority coordinates to the Visakhapatnam Disaster Management Command Center.
                  </p>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '24px', padding: '2rem', border: '1.5px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 12px 40px rgba(239, 68, 68, 0.1)' }}>
                  <form onSubmit={handleDispatchSOS} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                        Your Precise Incident Location
                      </label>
                      <input
                        type="text"
                        value={sosArea}
                        onChange={(e) => setSosArea(e.target.value)}
                        placeholder="e.g. Near Poorna Market Jagadamba Junction"
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', color: '#1e1b4b', boxSizing: 'border-box' }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                        Emergency Nature &amp; People Trapped
                      </label>
                      <textarea
                        value={sosType}
                        onChange={(e) => setSosType(e.target.value)}
                        rows={3}
                        placeholder="Describe situation: water level, number of individuals, vehicles stranded..."
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', color: '#1e1b4b', boxSizing: 'border-box' }}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#ffffff', border: 'none', padding: '1rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)' }}
                    >
                      <LifeBuoy size={20} />
                      <span>DISPATCH LIVE RESCUE SOS</span>
                    </button>

                    {sosSubmitted && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}>
                        🚨 EMERGENCY SOS BROADCASTED TO DISASTER COMMAND. RESCUE TEAM ASSIGNED.
                      </div>
                    )}
                  </form>
                </div>
              </motion.div>
            )}

            {/* VIEW 7: CITIZEN SETTINGS & SIREN TEST */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '680px', margin: '0 auto' }}
              >
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e1b4b', margin: '0 0 0.3rem 0' }}>
                    Citizen Alert &amp; Siren Settings
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Customize emergency audio warning thresholds and email subscriptions
                  </span>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '24px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(99, 102, 241, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.2rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#1e1b4b', display: 'block' }}>
                        Emergency Siren Audio Alarm
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Plays a 2-second piercing warning tone on high-risk cloudburst alerts
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => playEmergencySirenAudio(2000)}
                      style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid #6366f1', color: '#6366f1', padding: '6px 14px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Volume2 size={14} />
                      <span>Test Siren (2s)</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#1e1b4b', display: 'block' }}>
                        Registered Citizen Account
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {userDisplayName} ({user?.email || 'aquasentinelfis@gmail.com'})
                      </span>
                    </div>
                    <span style={{ background: '#ecfdf5', color: '#10b981', padding: '3px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800 }}>
                      VERIFIED
                    </span>
                  </div>

                  <div style={{ paddingTop: '1.2rem' }}>
                    <button
                      type="button"
                      onClick={logout}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.75rem 1.5rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', width: '100%' }}
                    >
                      Sign Out of Citizen Session
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
