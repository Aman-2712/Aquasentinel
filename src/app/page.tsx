'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Droplets, Shield, Map, Bell, Navigation, BarChart3, ChevronRight, Zap, Activity, CloudRain } from 'lucide-react';
import styles from './landing.module.css';

const STATS = [
  { value: '10K+', label: 'Citizens Protected' },
  { value: '47', label: 'Risk Zones Monitored' },
  { value: '< 2min', label: 'Alert Response Time' },
  { value: '98.4%', label: 'Prediction Accuracy' },
];

const FEATURES = [
  {
    icon: Map,
    title: 'Real-Time Flood Map',
    desc: 'Live color-coded risk zones (Red/Yellow/Green) for every area in Visakhapatnam with water depth and population data.',
    color: 'primary',
  },
  {
    icon: Bell,
    title: 'Early Warning Alerts',
    desc: 'AI-powered alerts sent before floods arrive. Get SMS, email, and in-app notifications with evacuation guidance.',
    color: 'warning',
  },
  {
    icon: Navigation,
    title: 'Safe Route Guidance',
    desc: 'Know which roads are flooded. Our system recommends the safest routes in real-time based on water levels.',
    color: 'safe',
  },
  {
    icon: Shield,
    title: 'FieldShield (Module 2)',
    desc: 'IoT-powered field protection for agriculture. Activate physical shields remotely to protect crops from floods.',
    color: 'accent',
  },
  {
    icon: BarChart3,
    title: 'Flood Predictions',
    desc: 'XGBoost AI models analyze weather data, satellite feeds, and sensor inputs to forecast flood risk 72hrs ahead.',
    color: 'secondary',
  },
  {
    icon: Activity,
    title: 'Priority Response',
    desc: 'Smart prioritization of rescue resources based on risk level, population density, and area vulnerability.',
    color: 'danger',
  },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--clr-bg)',
        gap: '1rem',
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          animation: 'float 2s ease-in-out infinite',
        }}>
          <Droplets size={28} />
        </div>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>Loading AquaSentinel...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Background elements */}
      <div className={styles.bgGrid} />
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />

      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <div className={styles.navLogoIcon}><Droplets size={20} /></div>
          <span>AquaSentinel</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#modules">Modules</a>
        </div>
        <div className={styles.navActions}>
          <Link href="/login" className="btn btn-outline btn-sm">Sign In</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Zap size={12} />
          <span>AI + IoT Powered Flood Intelligence System</span>
        </div>
        <h1 className={styles.heroTitle}>
          Protect Lives From<br />
          <span className={styles.heroGradText}>Urban Floods &amp; Waterlogging</span>
        </h1>
        <p className={styles.heroDesc}>
          AquaSentinel delivers real-time flood risk maps, early warnings, safe route guidance,
          and IoT-based agricultural field protection — powered by AI for Visakhapatnam and beyond.
        </p>
        <div className={styles.heroActions}>
          <Link href="/signup" className="btn btn-primary btn-lg">
            Get Early Warning Access
            <ChevronRight size={18} />
          </Link>
          <Link href="/map" className="btn btn-outline btn-lg">
            View Live Flood Map
            <Map size={16} />
          </Link>
        </div>

        {/* Live indicator */}
        <div className={styles.heroLive}>
          <span className={styles.liveDot} />
          <CloudRain size={14} />
          <span>Heavy Rain Alert Active – Poorna Market, Gajuwaka, Gopalapatnam</span>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {STATS.map(s => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Risk Zone Preview */}
      <section className={styles.riskPreview}>
        <div className={styles.riskTitle}>
          <h2>Current Risk Status – Visakhapatnam</h2>
          <span>Live as of now</span>
        </div>
        <div className={styles.riskGrid}>
          {[
            { name: 'Poorna Market', risk: 'HIGH', depth: '142cm', color: 'danger' },
            { name: 'Gajuwaka', risk: 'HIGH', depth: '118cm', color: 'danger' },
            { name: 'Gopalapatnam', risk: 'HIGH', depth: '105cm', color: 'danger' },
            { name: 'MVP Colony', risk: 'MEDIUM', depth: '62cm', color: 'warning' },
            { name: 'Dwaraka Nagar', risk: 'MEDIUM', depth: '48cm', color: 'warning' },
            { name: 'PM Palem', risk: 'SAFE', depth: '15cm', color: 'safe' },
          ].map(zone => (
            <div key={zone.name} className={`${styles.riskZoneCard} ${styles[zone.color]}`}>
              <div className={`risk-dot ${zone.risk.toLowerCase() === 'safe' ? 'low' : zone.risk.toLowerCase()}`} />
              <div>
                <span className={styles.riskZoneName}>{zone.name}</span>
                <span className={styles.riskZoneDepth}>Water: {zone.depth}</span>
              </div>
              <span className={`badge badge-${zone.color === 'danger' ? 'danger' : zone.color === 'warning' ? 'warning' : 'safe'}`}>
                {zone.risk}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.riskCta}>
          <Link href="/login" className="btn btn-primary">
            View Full Map &amp; Details <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} id="features">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Complete Flood Intelligence Platform</h2>
          <p className={styles.sectionDesc}>Everything you need to stay safe, informed, and protected during floods and heavy rains.</p>
        </div>
        <div className={styles.featuresGrid}>
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={`${styles.featureCard} card`}>
                <div className={`${styles.featureIcon} ${styles[`featureIcon_${f.color}`]}`}>
                  <Icon size={22} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks} id="how-it-works">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How AquaSentinel Works</h2>
        </div>
        <div className={styles.steps}>
          {[
            { n: '01', title: 'Data Collection', desc: 'Weather APIs, Satellite imagery, IoT sensors, and GIS/Map data feed real-time information.' },
            { n: '02', title: 'AI Risk Analysis', desc: 'XGBoost + LightGBM models calculate flood risk score per area every 2 minutes.' },
            { n: '03', title: 'Smart Alerts', desc: 'Automatic alerts sent to citizens, farmers, and authorities before floods arrive.' },
            { n: '04', title: 'Action & Response', desc: 'Users get evacuation routes, FieldShield activates, authorities coordinate rescue.' },
          ].map((step, i) => (
            <div key={step.n} className={styles.step}>
              <div className={styles.stepNum}>{step.n}</div>
              {i < 3 && <div className={styles.stepLine} />}
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaGlow} />
        <h2 className={styles.ctaTitle}>Ready to Stay Safe During Floods?</h2>
        <p className={styles.ctaDesc}>Join thousands of citizens and farmers in Visakhapatnam protected by AquaSentinel.</p>
        <div className={styles.ctaActions}>
          <Link href="/signup" className="btn btn-primary btn-lg">Create Free Account</Link>
          <Link href="/login" className="btn btn-ghost btn-lg">Sign In</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <Droplets size={18} />
          <span>AquaSentinel</span>
        </div>
        <p className={styles.footerText}>AI + IoT Powered Flood Intelligence & Field Protection System</p>
        <p className={styles.footerCopy}>© 2025 AquaSentinel. Built for Visakhapatnam &amp; beyond.</p>
      </footer>
    </div>
  );
}
