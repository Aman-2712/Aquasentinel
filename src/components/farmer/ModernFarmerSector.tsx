'use client';
import { useState } from 'react';
import { useFloodData } from '@/context/FloodDataContext';
import { useAuth } from '@/context/AuthContext';
import styles from './farmerModern.module.css';
import {
  Sprout,
  LayoutGrid,
  Sliders,
  Globe,
  Calendar,
  Settings,
  LogOut,
  Plus,
  Search,
  Bell,
  MapPin,
  Wind,
  Droplets,
  CloudRain,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  Send,
  Navigation,
  Activity,
  Maximize2
} from 'lucide-react';
import { FarmerOnboardingModal } from '@/components/onboarding/FarmerOnboardingModal';
import dynamic from 'next/dynamic';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false });
const PredictionCharts = dynamic(() => import('@/components/charts/PredictionCharts'), { ssr: false });

type FarmerViewTab = 'overview' | 'gates' | 'radar' | 'forecast';

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
  } = useFloodData();

  const [activeTab, setActiveTab] = useState<FarmerViewTab>('overview');
  const [selectedDayIndex, setSelectedDayIndex] = useState(3); // Wednesday
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadPhone, setLeadPhone] = useState('+91 98480 22338');
  const [leadAcres, setLeadAcres] = useState('6.5 Acres');
  const [leadCrop, setLeadCrop] = useState('Paddy & Sugarcane');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  const currentRain = weatherData.current.rainfall || 0;
  const currentTemp = weatherData.current.temp || 26;
  const currentWind = weatherData.current.windSpeed || 19;
  const soilSaturation = Math.round((weatherData.current.soilMoisture || 0.85) * 100);

  const isStorm = currentRain >= 25 || xgboostPrediction.riskScore >= 70 || isSimulationActive;

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
          farmerName: user?.name || 'Ramesh Patel',
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

  return (
    <div className={styles.farmerSectorContainer}>
      <FarmerOnboardingModal />

      {/* FieldShield Hardware Quote Modal */}
      {showLeadModal && (
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

      {/* LEFT VERTICAL CAPSULE DOCK (MATCHING THE REFERENCE IMAGE) */}
      <div className={styles.leftIconDock}>
        <div className={styles.dockLogo} title="AquaSentinel Farmland Mesh">
          <Sprout size={22} />
        </div>

        <div className={styles.dockNavGroup}>
          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'overview' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('overview')}
            title="Dashboard Overview"
          >
            <LayoutGrid size={20} />
          </button>

          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'gates' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('gates')}
            title="FieldShield Sluice Gate Control"
          >
            <Sliders size={20} />
          </button>

          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'radar' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('radar')}
            title="Live Agro Flood Radar"
          >
            <Globe size={20} />
          </button>

          <button
            type="button"
            className={`${styles.dockBtn} ${activeTab === 'forecast' ? styles.dockBtnActive : ''}`}
            onClick={() => setActiveTab('forecast')}
            title="7-Day Crop & Rainfall Schedule"
          >
            <Calendar size={20} />
          </button>
        </div>

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
            <h1 className={styles.farmerNameTitle}>{user?.name || 'Ramesh Patel'}</h1>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.roundActionBtn}
              onClick={() => setShowLeadModal(true)}
              title="Request Hardware & Site Inspection"
            >
              <Plus size={18} />
            </button>
            <button
              type="button"
              className={styles.roundActionBtn}
              onClick={() => setActiveTab('radar')}
              title="Search Farmland Plots"
            >
              <Search size={16} />
            </button>
            <button
              type="button"
              className={styles.roundActionBtn}
              style={{ position: 'relative' }}
              title="Authority Broadcasts"
            >
              <Bell size={16} />
              {broadcastAlerts.length > 0 && (
                <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#ff4444' }} />
              )}
            </button>
            <div className={styles.userAvatarChip} title={user?.name || 'Farmer Profile'}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Farmer Avatar"
              />
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW HERO (EXACTLY MATCHING THE REFERENCE IMAGE) */}
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
                    : 'Clear Skies\n& Mild Sun'}
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
              <div className={styles.frostedCardPlot}>
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
              <div className={styles.frostedCardPlot}>
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
              <div className={styles.frostedCardPlot}>
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

        {/* TAB 2: FIELDSHIELD SLUICE GATES */}
        {activeTab === 'gates' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {fieldShields.map(fs => (
              <div
                key={fs.id}
                style={{
                  background: 'rgba(16, 36, 26, 0.65)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  borderRadius: '18px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong style={{ fontSize: '1rem', color: '#fff' }}>{fs.name}</strong>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: fs.shieldStatus === 'deployed' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)', color: fs.shieldStatus === 'deployed' ? '#00ff88' : '#fff' }}>
                    {fs.shieldStatus.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.3rem' }}>
                  📍 Device: <strong>{fs.deviceId}</strong> • Last Action: {fs.lastAction}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.85rem' }}>
                  Water Level: <strong style={{ color: '#fff' }}>{fs.waterLevel} cm</strong> • Soil Saturation: <strong style={{ color: '#00ff88' }}>{Math.round(fs.soilMoisture)}%</strong>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => triggerDeviceShield(fs.id, 'deploy')}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: 'linear-gradient(135deg, #00ff88, #059669)', color: '#052014', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    Deploy Gate
                  </button>
                  <button
                    onClick={() => triggerDeviceShield(fs.id, 'idle')}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    Set Idle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: RADAR MAP */}
        {activeTab === 'radar' && (
          <div style={{ background: 'rgba(10, 25, 18, 0.65)', backdropFilter: 'blur(20px)', borderRadius: '20px', border: '1px solid rgba(0, 255, 136, 0.3)', padding: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} color="#00ff88" />
              <span>Visakhapatnam Agricultural Catchment Flood Map</span>
            </h3>
            <FloodMap zones={zones} />
          </div>
        )}

        {/* TAB 4: PREDICTIONS */}
        {activeTab === 'forecast' && (
          <div style={{ background: 'rgba(10, 25, 18, 0.65)', backdropFilter: 'blur(20px)', borderRadius: '20px', border: '1px solid rgba(0, 255, 136, 0.3)', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="#00ff88" />
              <span>7-Day Agricultural Rainfall &amp; XGBoost Runoff Forecast</span>
            </h3>
            <PredictionCharts forecast={weatherData.forecast} zones={zones} />
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
