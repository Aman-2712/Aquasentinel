'use client';
import { useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { useFloodData } from '@/context/FloodDataContext';
import { Bell, AlertTriangle, CloudRain, Navigation, Droplets, Filter, Volume2 } from 'lucide-react';
import styles from './alerts.module.css';
import type { AlertData, RiskLevel } from '@/data/visakhapatnam_zones';

const ICONS = { flood: Droplets, rainfall: CloudRain, drainage: Droplets, road: Navigation };
const TYPE_LABELS = { flood: 'Flood', rainfall: 'Rainfall', drainage: 'Drainage', road: 'Road Block' };

export default function AlertsPage() {
  const { alerts, isLoading } = useFloodData();
  const [filter, setFilter] = useState<'all' | RiskLevel>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | AlertData['type']>('all');

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '1rem', color: 'var(--clr-text-muted)' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(0,212,255,0.1)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p>Processing active early warning sirens...</p>
        </div>
      </ProtectedLayout>
    );
  }

  const filtered = alerts.filter(a => {
    if (filter !== 'all' && a.risk !== filter) return false;
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    return true;
  });

  const highCount = alerts.filter(a => a.risk === 'high' && a.active).length;
  const medCount = alerts.filter(a => a.risk === 'medium' && a.active).length;
  const totalActive = alerts.filter(a => a.active).length;

  return (
    <ProtectedLayout>
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Alert Center</h1>
            <p className="page-subtitle">Real-time flood and rainfall alerts for Visakhapatnam</p>
          </div>

          {/* Summary cards */}
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className={`card ${styles.summaryCard} ${styles.dangerSummary}`}>
              <AlertTriangle size={22} style={{ color: 'var(--clr-danger)' }} />
              <div>
                <span className={styles.summaryVal}>{highCount}</span>
                <span className={styles.summaryLabel}>Critical Alerts</span>
              </div>
            </div>
            <div className={`card ${styles.summaryCard} ${styles.warnSummary}`}>
              <Bell size={22} style={{ color: 'var(--clr-warning)' }} />
              <div>
                <span className={styles.summaryVal}>{medCount}</span>
                <span className={styles.summaryLabel}>Warning Alerts</span>
              </div>
            </div>
            <div className={`card ${styles.summaryCard} ${styles.safeSummary}`}>
              <Volume2 size={22} style={{ color: 'var(--clr-safe)' }} />
              <div>
                <span className={styles.summaryVal}>{totalActive}</span>
                <span className={styles.summaryLabel}>Total Active</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
              <Filter size={14} style={{ color: 'var(--clr-text-muted)' }} />
              {(['all', 'high', 'medium', 'low'] as const).map(f => (
                <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`} onClick={() => setFilter(f)}>
                  {f === 'all' ? 'All Levels' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className={styles.filterGroup}>
              {(['all', 'flood', 'rainfall', 'drainage', 'road'] as const).map(t => (
                <button key={t} className={`${styles.filterBtn} ${typeFilter === t ? styles.filterActive : ''}`} onClick={() => setTypeFilter(t)}>
                  {t === 'all' ? 'All Types' : TYPE_LABELS[t] || t}
                </button>
              ))}
            </div>
          </div>

          {/* Alert list */}
          <div className={styles.alertGrid}>
            {filtered.map(alert => {
              const Icon = ICONS[alert.type] || Droplets;
              return (
                <div key={alert.id} className={`${styles.alertCard} ${styles[`alert_${alert.risk}`]} ${!alert.active ? styles.alertInactive : ''}`}>
                  <div className={styles.alertCardHeader}>
                    <div className={styles.alertMeta}>
                      <div className={`${styles.alertIconWrap} ${styles[`alertIcon_${alert.risk}`]}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <span className={styles.alertArea}>{alert.area}</span>
                        <div className={styles.alertTags}>
                          <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>{TYPE_LABELS[alert.type]}</span>
                          {alert.active && <span className={styles.liveBadge}><span className={styles.liveDot} />LIVE</span>}
                        </div>
                      </div>
                    </div>
                    <div className={styles.alertRight}>
                      <span className={`badge ${alert.risk === 'high' ? 'badge-danger' : alert.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`}>
                        {alert.risk.toUpperCase()}
                      </span>
                      <span className={styles.alertTime}>{alert.time}</span>
                    </div>
                  </div>
                  <p className={styles.alertMessage}>{alert.message}</p>
                  {alert.active && (
                    <div className={styles.alertActions}>
                      <button className="btn btn-ghost btn-sm">View on Map</button>
                      <button className="btn btn-outline btn-sm">Share Alert</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className={styles.empty}>
              <Bell size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <p>No alerts match your filters.</p>
            </div>
          )}
        </div>
    </ProtectedLayout>
  );
}
