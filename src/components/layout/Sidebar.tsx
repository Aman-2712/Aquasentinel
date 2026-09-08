'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Map, Navigation, Bell, BarChart3,
  FileText, Shield, Activity, LogOut, ChevronRight,
  Droplets, Menu, X, Sliders, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROLE_DASHBOARD } from '@/context/AuthContext';
import { useState } from 'react';
import HackathonSimulatorModal from '@/components/demo/HackathonSimulatorModal';
import styles from './Sidebar.module.css';

const CITIZEN_NAV = [
  { label: 'Dashboard', href: '/citizen/dashboard', icon: LayoutDashboard },
  { label: 'Live Map AI', href: '/map', icon: Map },
  { label: 'Safe Routes', href: '/safe-routes', icon: Navigation },
  { label: 'Alerts', href: '/alerts', icon: Bell, badge: 5 },
  { label: 'Predictions', href: '/predictions', icon: BarChart3 },
  { label: 'Incident Report', href: '/incident', icon: FileText },
];

const FARMER_NAV = [
  { label: 'Farmer Dashboard', href: '/farmer/dashboard', icon: LayoutDashboard },
  { label: 'Live Map AI', href: '/map', icon: Map },
  { label: 'FieldShield', href: '/fieldshield', icon: Shield },
  { label: 'Gate Control', href: '/fieldshield/status', icon: Sliders },
  { label: 'Alerts', href: '/alerts', icon: Bell, badge: 5 },
  { label: 'Predictions', href: '/predictions', icon: BarChart3 },
];

const AUTHORITY_NAV = [
  { label: 'Command Center', href: '/authority/dashboard', icon: LayoutDashboard },
  { label: 'Live Map AI', href: '/map', icon: Map },
  { label: 'Alerts', href: '/alerts', icon: Bell, badge: 5 },
  { label: 'Predictions', href: '/predictions', icon: BarChart3 },
  { label: 'Incident Reports', href: '/incident', icon: FileText },
];


export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  // Pick navigation items based on user's role
  const navItems = user?.role === 'farmer' ? FARMER_NAV
    : user?.role === 'authority' ? AUTHORITY_NAV
    : CITIZEN_NAV;

  const roleLabel = user?.role === 'farmer' ? 'FieldShield'
    : user?.role === 'authority' ? 'Command Center'
    : '';

  const NavItem = ({ item }: { item: typeof CITIZEN_NAV[0] }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const Icon = item.icon;
    return (
      <Link href={item.href} prefetch={true} className={`${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => setMobileOpen(false)}>
        <Icon size={18} />
        <span>{item.label}</span>
        {'badge' in item && item.badge ? (
          <span className={styles.badge}>{item.badge}</span>
        ) : isActive ? <ChevronRight size={14} className={styles.chevron} /> : null}
      </Link>
    );
  };

  return (
    <>
      <button className={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.mobileVisible : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Droplets size={22} />
          </div>
          <div>
            <span className={styles.logoText}>AquaSentinel</span>
            <span className={styles.logoTagline}>Flood Intelligence</span>
          </div>
        </div>

        <div className={styles.scrollArea}>
          {/* Role-specific navigation */}
          <div className={styles.section}>
            {roleLabel && <span className={styles.sectionLabel}>{roleLabel}</span>}
            {navItems.map(item => <NavItem key={item.href} item={item} />)}
          </div>

          {/* Hackathon Simulation Quick Trigger */}
          <div style={{ padding: '0 0.75rem', marginTop: '1rem' }}>
            <button
              onClick={() => setShowSimulator(true)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 68, 68, 0.4)',
                background: 'linear-gradient(135deg, rgba(255, 68, 68, 0.15), rgba(217, 119, 6, 0.15))',
                color: '#ff6b6b',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                boxShadow: '0 2px 12px rgba(255, 68, 68, 0.15)',
              }}
            >
              <AlertTriangle size={15} color="#ff4444" />
              <span>🚨 Live Demo Simulator</span>
            </button>
          </div>
        </div>

        {/* User */}
        {user && (
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className={styles.userText}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userRole}>{user.role}</span>
              </div>
            </div>
            <button className={styles.logoutBtn} onClick={logout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      <HackathonSimulatorModal isOpen={showSimulator} onClose={() => setShowSimulator(false)} />
    </>
  );
}
