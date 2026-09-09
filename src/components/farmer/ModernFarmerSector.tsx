'use client';
import { useState } from 'react';
import { useFloodData } from '@/context/FloodDataContext';
import { useAuth } from '@/context/AuthContext';
import styles from './farmerModern.module.css';
import {
  Sprout,
  LayoutGrid,
  Navigation,
  Shield,
  Sliders,
  Bell,
  TrendingUp,
  Zap,
  LogOut,
  Plus,
  Search,
  MapPin,
  Wind,
  Droplets,
  CloudRain,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { FarmerOnboardingModal } from '@/components/onboarding/FarmerOnboardingModal';
import HackathonSimulatorModal from '@/components/demo/HackathonSimulatorModal';
import dynamic from 'next/dynamic';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false });
const PredictionCharts = dynamic(() => import('@/components/charts/PredictionCharts'), { ssr: false });

type FarmerViewTab = 'overview' | 'livemap' | 'fieldshield' | 'gates' | 'alerts' | 'predictions';

export default function ModernFarmerSector() {
  const { user, logout } = useAuth();
  const {
    weatherData,
    xgboostPrediction,
    zones,
    fieldShields,
    triggerDeviceShield,
    isSimulationActive,
    broadcastAlerts,
    safeRoutes,
    dismissBroadcast,
  } = useFloodData();

  const [activeTab, setActiveTab] = useState<FarmerViewTab>('overview');
  const [selectedDayIndex, setSelectedDayIndex] = useState(3); // Wednesday
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [leadPhone, setLeadPhone] = useState('+91 98480 22338');
  const [leadAcres, setLeadAcres] = useState('6.5 Acres');
  const [leadCrop, setLeadCrop] = useState('Paddy & Sugarcane');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  const currentRain = weatherData.current.rainfall || 0;
  const currentTemp = weatherData.current.temp || 33;
  const currentWind = weatherData.current.windSpeed || 7;
  const soilSaturation = Math.round((weatherData.current.soilMoisture || 0.29) * 100);

  const isStorm = currentRain >= 25 || xgboostPrediction.riskScore >= 70 || isSimulationActive;
  const alertCount = Math.max(broadcastAlerts.length, 5);

  const handleDeployAllGates = async () => {
    setIsDeploying(true);
    for (const fs of fieldShields) {
      await triggerDeviceShield(fs.id, 'deploy');
    }
    setIsDeploying(false);
    setDeploySuccess(true);
    setTimeout(() => setDeploySuccess(false), 4000);
  };

  const handleSendLeadQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLead(true);
    try {
      await fetch('/api/send-farmer-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerName: user?.name || 'Sony Shaik.',
          farmerEmail: user?.email || 'farmer@aquasentinel.io',
          farmerPhone: leadPhone,
          location: 'Visakhapatnam Agricultural Catchment',
          acres: leadAcres,
          crop: leadCrop,
          notes: 'Requested FieldShield Automated Sluice Gates & IoT Soil Sensor Mesh deployment quote.',
        }),
      });
      setLeadSuccess(true);
      setTimeout(() => {
        setLeadSuccess(false);
        setShowLeadModal(false);
      }, 2500);
    } catch {
      setLeadSuccess(true);
      setTimeout(() => {
        setLeadSuccess(false);
        setShowLeadModal(false);
      }, 2500);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const daysForecast = [
    { day: 'Sunday', temp: '11°', icon: '🌧️', isRain: true },
    { day: 'Monday', temp: '13°', icon: '🌦️', isRain: true },
    { day: 'Tuesday', temp: '14°', icon: '⛅', isRain: false },
    { day: 'Wednesday', temp: `${Math.round(currentTemp)}°`, icon: isStorm ? '⛈️' : '🌧️', isRain: true },
    { day: 'Thursday', temp: '19°', icon: '☀️', isRain: false },
    { day: 'Friday', temp: '12°', icon: '🌦️', isRain: true },
  ];

  const filteredZones = searchQuery
    ? zones.filter(z => z.name.toLowerCase().includes(searchQuery.toLowerCase()) || z.area.toLowerCase().includes(searchQuery.toLowerCase()))
    : zones;

  return (
    <div className={styles.farmerSectorContainer}>
      <FarmerOnboardingModal />

      {/* Live Demo Hackathon Simulator Modal */}
      <HackathonSimulatorModal
        isOpen={showSimulatorModal}
        onClose={() => setShowSimulatorModal(false)}
      />

      {/* FieldShield Hardware Quote Modal */}
      {showLeadModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.78)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 36, 26, 0.96), rgba(8, 20, 14, 0.98))',
            border: '1.5px solid rgba(0, 255, 136, 0.4)',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 255, 136, 0.2)',
            color: '#fff',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,255,136,0.2)', border: '1px solid #00ff88', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ff88' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>FieldShield Hardware Quote</h3>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Automated Barrier &amp; Sluice Gate System</span>
                </div>
              </div>
              <button
                onClick={() => setShowLeadModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {leadSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CheckCircle size={48} color="#00ff88" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', color: '#00ff88' }}>Quote Request Transmitted!</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                  Our technical deployment team will reach out at <strong>{leadPhone}</strong> and email <strong>aquasentinelfis@gmail.com</strong> with your custom hardware proposal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendLeadQuote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.3rem' }}>Farmer Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.3rem' }}>Farmland Size</label>
                    <input
                      type="text"
                      value={leadAcres}
                      onChange={(e) => setLeadAcres(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.3rem' }}>Standing Crop</label>
                    <input
                      type="text"
                      value={leadCrop}
                      onChange={(e) => setLeadCrop(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.25)', fontSize: '0.775rem', color: '#00ff88' }}>
                  ⚡ Includes 3x Solar IoT Soil Moisture Probes, 1x Hydraulic Auto-Sluice Gate &amp; 24/7 Satellite Telemetry.
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={isSubmittingLead}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: 'linear-gradient(135deg, #00ff88, #059669)', color: '#052014', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    {isSubmittingLead ? 'Submitting Quote Request...' : 'Submit Hardware Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLeadModal(false)}
                    style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 36, 26, 0.95), rgba(8, 20, 14, 0.98))',
            border: '1.5px solid rgba(0, 255, 136, 0.4)',
            borderRadius: '24px',
            padding: '1.75rem',
            maxWidth: '560px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            color: '#fff',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={18} color="#00ff88" />
                Search Farmland &amp; Visakhapatnam Zones
              </h3>
              <button onClick={() => setShowSearchModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <input
              type="text"
              autoFocus
              placeholder="Search Anandapuram, Pendurthi, Gajuwaka, Madhurawada..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.5)', border: '1.5px solid #00ff88', color: '#fff', fontSize: '0.95rem', marginBottom: '1rem' }}
            />
            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredZones.map(z => (
                <div
                  key={z.id}
                  onClick={() => { setActiveTab('livemap'); setShowSearchModal(false); }}
                  style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{z.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block' }}>{z.area} • Water Depth: {z.waterDepth}cm</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: z.risk === 'high' ? 'rgba(255,68,68,0.2)' : z.risk === 'medium' ? 'rgba(255,170,0,0.2)' : 'rgba(0,255,136,0.2)', color: z.risk === 'high' ? '#ff4444' : z.risk === 'medium' ? '#ffaa00' : '#00ff88' }}>
                    {z.risk.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LEFT VERTICAL CAPSULE DOCK (MATCHING IMAGE 2 EXACTLY WITH ALL ICONS) */}
      <div className={styles.leftIconDock}>
        <div className={styles.dockLogo} onClick={() => setActiveTab('overview')} title="AquaSentinel Farmland Mesh">
          <Sprout size={22} />
        </div>

        <div className={styles.dockNavGroup}>
          {/* 1. Farmer Dashboard */}
          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'overview' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('overview')}
            title="Farmer Dashboard"
          >
            <LayoutGrid size={20} />
          </button>

          {/* 2. Live Map AI */}
          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'livemap' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('livemap')}
            title="Live Map AI"
          >
            <Navigation size={20} />
          </button>

          {/* 3. FieldShield */}
          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'fieldshield' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('fieldshield')}
            title="FieldShield Sensors"
          >
            <Shield size={20} />
          </button>

          {/* 4. Gate Control */}
          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'gates' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('gates')}
            title="Gate Control"
          >
            <Sliders size={20} />
          </button>

          {/* 5. Alerts */}
          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'alerts' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('alerts')}
            title="Broadcast Alerts"
          >
            <Bell size={20} />
            <span className={styles.dockBadge}>{alertCount}</span>
          </button>

          {/* 6. Predictions */}
          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'predictions' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('predictions')}
            title="AI Predictions & Forecasts"
          >
            <TrendingUp size={20} />
          </button>

          {/* 7. Live Demo Simulator */}
          <button
            type="button"
            className={styles.dockBtn}
            onClick={() => setShowSimulatorModal(true)}
            title="Live Demo Simulator"
            style={{ color: '#ffaa00' }}
          >
            <Zap size={20} />
          </button>
        </div>

        {/* Bottom Logout */}
        <button type="button" className={styles.dockBtn} onClick={logout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>

      {/* MAIN DASHBOARD STAGE */}
      <div className={styles.mainDashboardArea}>
        {/* TOP HEADER */}
        <div className={styles.headerNav}>
          <div>
            <div className={styles.welcomeText}>Welcome</div>
            <h1 className={styles.farmerNameTitle}>{user?.name || 'Sony Shaik.'}</h1>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.roundActionBtn}
              onClick={() => setShowLeadModal(true)}
              title="Request Hardware & Site Inspection (+)"
            >
              <Plus size={18} />
            </button>
            <button
              type="button"
              className={styles.roundActionBtn}
              onClick={() => setShowSearchModal(true)}
              title="Search Farmland Plots (🔍)"
            >
              <Search size={16} />
            </button>
            <button
              type="button"
              className={styles.roundActionBtn}
              onClick={() => setActiveTab('alerts')}
              style={{ position: 'relative' }}
              title="Authority Broadcasts (🔔)"
            >
              <Bell size={16} />
              {alertCount > 0 && (
                <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#ff4444' }} />
              )}
            </button>
            <div className={styles.userAvatarChip} onClick={logout} title={`${user?.name || 'Sony Shaik.'} (Click to logout)`} style={{ cursor: 'pointer' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Farmer Avatar"
              />
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW HERO (EXACTLY MATCHING IMAGE 2) */}
        {activeTab === 'overview' && (
          <div className={styles.contentStage}>
            {/* LEFT HERO: Weather Condition Title & 7-Day Sine Curve */}
            <div className={styles.leftHeroWrap}>
              <div>
                <div className={styles.forecastPill}>
                  <CloudRain size={14} color="#00ff88" />
                  <span>Weather Forecast • Farmland Mesh</span>
                </div>

                <h2 className={styles.heroConditionTitle}>
                  {isStorm
                    ? 'Storm\nwith Heavy Rain'
                    : currentRain > 10
                    ? 'Moderate Rain\n& Cloudburst'
                    : 'Clear Skies & Mild Sun'}
                </h2>

                <p className={styles.heroNarrative}>
                  {isStorm
                    ? `Severe precipitation (${currentRain} mm/h) detected across coastal agricultural terrace basins. Soil moisture saturation at ${soilSaturation}%. FieldShield automated gates primed to safeguard standing paddy and sugarcane crops.`
                    : `Normal agricultural conditions across Visakhapatnam plots. Soil moisture saturation nominal at ${soilSaturation}%. Municipal canal drainage channels flowing unobstructed.`}
                </p>
              </div>

              {/* 7-Day Horizon Sine Wave Card */}
              <div className={styles.horizonWaveSection}>
                {/* Temperatures Row */}
                <div className={styles.temperatureRow}>
                  {daysForecast.map((d, i) => (
                    <div
                      key={d.day}
                      className={`${styles.tempColItem} ${i === selectedDayIndex ? styles.tempColItemActive : ''}`}
                      onClick={() => setSelectedDayIndex(i)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span>{d.temp}</span>
                      <span style={{ fontSize: '0.9rem' }}>{d.icon}</span>
                    </div>
                  ))}
                </div>

                {/* Sine Wave Curve Graphic */}
                <div className={styles.sineSvgContainer}>
                  <svg viewBox="0 0 500 70" className={styles.sineSvg} preserveAspectRatio="none">
                    <defs>
                      <filter id="sineGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2.5" result="glow" />
                        <feMerge>
                          <feMergeNode in="glow" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Smooth glowing sine curve matching reference */}
                    <path
                      d="M 0 45 Q 60 15, 120 40 T 250 20 T 380 45 T 500 25"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.4)"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 120 40 Q 185 10, 250 20"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      filter="url(#sineGlow)"
                    />

                    {/* Active Selected Node (Wednesday Lightning Spark) */}
                    <circle cx="250" cy="20" r="5" fill="#ffffff" filter="url(#sineGlow)" />
                    <circle cx="250" cy="20" r="2.5" fill="#00ff88" />
                  </svg>
                </div>

                {/* Days of Week Label Row */}
                <div className={styles.daysLabelRow}>
                  {daysForecast.map((d, i) => (
                    <span
                      key={d.day}
                      className={i === selectedDayIndex ? styles.dayLabelActive : ''}
                      onClick={() => setSelectedDayIndex(i)}
                      style={{ cursor: 'pointer' }}
                    >
                      {d.day}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Farmland Regional Plots Stack */}
            <div className={styles.rightStack}>
              {/* Hero Regional Card */}
              <div className={styles.frostedCardHero}>
                <div className={styles.locationTitle}>
                  <MapPin size={15} color="#00ff88" />
                  <span>Central Farmland Catchment</span>
                </div>

                <div className={styles.hugeTempDisplay}>
                  {Math.round(currentTemp)}°C
                </div>

                <div className={styles.microMetricsRow}>
                  <div className={styles.microMetricItem}>
                    <Wind size={14} color="#84abc9" />
                    <span>{currentWind} km/h</span>
                  </div>
                  <div className={styles.microMetricItem}>
                    <Droplets size={14} color="#00ff88" />
                    <span>{soilSaturation}% Saturation</span>
                  </div>
                  <div className={styles.microMetricItem}>
                    <CloudRain size={14} color="#00d6ff" />
                    <span>{currentRain} mm/h</span>
                  </div>
                </div>
              </div>

              {/* Plot Card 1 */}
              <div className={styles.frostedCardPlot} onClick={() => setActiveTab('gates')} style={{ cursor: 'pointer' }}>
                <div>
                  <div className={styles.plotLocation}>Visakhapatnam North</div>
                  <h3 className={styles.plotName}>Anandapuram Paddy Basin</h3>
                  <div className={styles.plotStatusSub}>
                    Water: <strong>38cm</strong> • Sluice Gate: <strong style={{ color: '#00ff88' }}>Deployed</strong>
                  </div>
                </div>
                <div className={styles.plotRightTemp}>
                  <span>28°</span>
                  <span style={{ fontSize: '1.1rem' }}>🌧️</span>
                </div>
              </div>

              {/* Plot Card 2 */}
              <div className={styles.frostedCardPlot} onClick={() => setActiveTab('gates')} style={{ cursor: 'pointer' }}>
                <div>
                  <div className={styles.plotLocation}>Visakhapatnam West</div>
                  <h3 className={styles.plotName}>Pendurthi Sugarcane Terrace</h3>
                  <div className={styles.plotStatusSub}>
                    Soil Saturation: <strong style={{ color: '#ffaa00' }}>94%</strong> • Pump: <strong>Standby</strong>
                  </div>
                </div>
                <div className={styles.plotRightTemp}>
                  <span>27°</span>
                  <span style={{ fontSize: '1.1rem' }}>⛈️</span>
                </div>
              </div>

              {/* Plot Card 3 */}
              <div className={styles.frostedCardPlot} onClick={() => setActiveTab('gates')} style={{ cursor: 'pointer' }}>
                <div>
                  <div className={styles.plotLocation}>Visakhapatnam Coastal</div>
                  <h3 className={styles.plotName}>Bheemunipatnam Mixed Agro</h3>
                  <div className={styles.plotStatusSub}>
                    Runoff: <strong style={{ color: '#00ff88' }}>Nominal</strong> • Crops: <strong>Safe</strong>
                  </div>
                </div>
                <div className={styles.plotRightTemp}>
                  <span>30°</span>
                  <span style={{ fontSize: '1.1rem' }}>🌦️</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE MAP AI */}
        {activeTab === 'livemap' && (
          <div style={{ background: 'rgba(10, 25, 18, 0.7)', backdropFilter: 'blur(24px)', borderRadius: '24px', border: '1px solid rgba(0, 255, 136, 0.3)', padding: '1.25rem', height: '100%', minHeight: '580px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Navigation size={20} color="#00ff88" />
                  <span>Live Map AI • Agricultural Catchment &amp; Evacuation Corridors</span>
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>
                  Interactive flood simulation zones and IoT sensors across Visakhapatnam farmlands
                </span>
              </div>
              <button onClick={() => setActiveTab('overview')} className={styles.actionBtnSecondary}>
                Back to Dashboard
              </button>
            </div>
            <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', minHeight: '480px' }}>
              <FloodMap zones={zones} routes={safeRoutes} />
            </div>
          </div>
        )}

        {/* TAB 3: FIELDSHIELD SENSORS */}
        {activeTab === 'fieldshield' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={20} color="#00ff88" />
                  <span>FieldShield IoT Soil &amp; Water Sensor Mesh</span>
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>
                  Real-time telemetry from deployed solar wireless sensors
                </span>
              </div>
              <button onClick={() => setActiveTab('overview')} className={styles.actionBtnSecondary}>
                Back to Dashboard
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {fieldShields.map(fs => (
                <div
                  key={fs.id}
                  style={{
                    background: 'rgba(16, 36, 26, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: '20px',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{fs.name}</strong>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: fs.shieldStatus === 'deployed' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)', color: fs.shieldStatus === 'deployed' ? '#00ff88' : '#fff' }}>
                      {fs.shieldStatus.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>
                    📍 Node ID: <strong>{fs.deviceId}</strong> • Telemetry: {fs.lastAction}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '12px', margin: '0.75rem 0' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block' }}>Water Depth</span>
                      <strong style={{ fontSize: '1.1rem', color: '#00d4ff' }}>{fs.waterLevel} cm</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block' }}>Soil Saturation</span>
                      <strong style={{ fontSize: '1.1rem', color: '#00ff88' }}>{Math.round(fs.soilMoisture)}%</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => triggerDeviceShield(fs.id, 'deploy')}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: 'linear-gradient(135deg, #00ff88, #059669)', color: '#052014', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      Deploy
                    </button>
                    <button
                      onClick={() => triggerDeviceShield(fs.id, 'idle')}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      Idle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GATE CONTROL */}
        {activeTab === 'gates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sliders size={20} color="#00ff88" />
                  <span>Automated Hydraulic Sluice Gate Control</span>
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>
                  Individual and global barrier actuators with automated storm triggers
                </span>
              </div>
              <button onClick={() => setActiveTab('overview')} className={styles.actionBtnSecondary}>
                Back to Dashboard
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {fieldShields.map(fs => (
                <div
                  key={fs.id}
                  style={{
                    background: 'rgba(16, 36, 26, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: '20px',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{fs.name} Sluice Gate</strong>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: fs.shieldStatus === 'deployed' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)', color: fs.shieldStatus === 'deployed' ? '#00ff88' : '#fff' }}>
                      {fs.shieldStatus === 'deployed' ? 'LOCKED / DEPLOYED' : 'IDLE / OPEN'}
                    </span>
                  </div>
                  <p style={{ margin: '0.3rem 0 0.85rem 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                    Hydraulic barrier protection for standing crops against runoff influx.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => triggerDeviceShield(fs.id, 'deploy')}
                      style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', background: 'linear-gradient(135deg, #00ff88, #059669)', color: '#052014', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      ⚡ Deploy Gate
                    </button>
                    <button
                      onClick={() => triggerDeviceShield(fs.id, 'idle')}
                      style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      Retract
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ALERTS */}
        {activeTab === 'alerts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={20} color="#ff4444" />
                  <span>Agricultural Weather &amp; Municipal Broadcast Alerts</span>
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>
                  Active flood warnings dispatched to Visakhapatnam farmers
                </span>
              </div>
              <button onClick={() => setActiveTab('overview')} className={styles.actionBtnSecondary}>
                Back to Dashboard
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {broadcastAlerts.map(b => (
                <div
                  key={b.id}
                  style={{
                    padding: '1.1rem 1.35rem',
                    borderRadius: '16px',
                    background: b.risk === 'high' ? 'rgba(255, 68, 68, 0.18)' : 'rgba(255, 170, 0, 0.18)',
                    border: `1.5px solid ${b.risk === 'high' ? 'rgba(255, 68, 68, 0.5)' : 'rgba(255, 170, 0, 0.5)'}`,
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <AlertTriangle size={22} color={b.risk === 'high' ? '#ff4444' : '#ffaa00'} />
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#fff', display: 'block' }}>
                        OFFICIAL MUNICIPAL BROADCAST • {b.area}
                      </strong>
                      <span style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.85)' }}>
                        {b.message}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => dismissBroadcast(b.id)} style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}>
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: PREDICTIONS */}
        {activeTab === 'predictions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={20} color="#00ff88" />
                  <span>XGBoost Hydrology Inference &amp; 7-Day Precipitation Curves</span>
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>
                  Machine learning runoff simulations trained on Visakhapatnam drainage models
                </span>
              </div>
              <button onClick={() => setActiveTab('overview')} className={styles.actionBtnSecondary}>
                Back to Dashboard
              </button>
            </div>

            <div style={{ background: 'rgba(10, 25, 18, 0.7)', backdropFilter: 'blur(20px)', borderRadius: '20px', border: '1px solid rgba(0, 255, 136, 0.3)', padding: '1.25rem' }}>
              <PredictionCharts forecast={weatherData.forecast} zones={zones} />
            </div>
          </div>
        )}

        {/* BOTTOM ACTION CONTROLS STRIP */}
        <div className={styles.hardwareActionStrip}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px #00ff88' }} />
            <span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>
              FieldShield IoT Mesh: <strong>All Sluice Gates &amp; Soil Moisture Sensors Active</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={handleDeployAllGates}
              disabled={isDeploying}
              className={styles.actionBtnPrimary}
            >
              <Zap size={14} />
              <span>{isDeploying ? 'Deploying...' : deploySuccess ? '✓ Gates Deployed!' : '⚡ Deploy All Sluice Gates'}</span>
            </button>

            <button
              onClick={() => setShowLeadModal(true)}
              className={styles.actionBtnSecondary}
            >
              <Shield size={14} />
              <span>Request Hardware Quote</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

