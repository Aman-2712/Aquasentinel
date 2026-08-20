'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Map, Navigation, Bell, BarChart3,
  FileText, Shield, Activity, LogOut, ChevronRight,
  Droplets, Menu, X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import styles from './Sidebar.module.css';

const MODULE1_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Flood Map', href: '/map', icon: Map },
  { label: 'Safe Routes', href: '/safe-routes', icon: Navigation },
  { label: 'Alerts', href: '/alerts', icon: Bell, badge: 5 },
  { label: 'Predictions', href: '/predictions', icon: BarChart3 },
  { label: 'Incident Report', href: '/incident', icon: FileText },
];

const MODULE2_NAV = [
  { label: 'FieldShield', href: '/fieldshield', icon: Shield },
  { label: 'Shield Status', href: '/fieldshield/status', icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavItem = ({ item }: { item: typeof MODULE1_NAV[0] }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link href={item.href} className={`${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => setMobileOpen(false)}>
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
          {/* Module 1 */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Module 1 – Intelligence</span>
            {MODULE1_NAV.map(item => <NavItem key={item.href} item={item} />)}
          </div>

          <div className={styles.divider} />

          {/* Module 2 */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Module 2 – FieldShield</span>
            {MODULE2_NAV.map(item => <NavItem key={item.href} item={item} />)}
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
    </>
  );
}
