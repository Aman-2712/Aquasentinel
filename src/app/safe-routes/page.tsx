'use client';
import { useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { useFloodData } from '@/context/FloodDataContext';
import { Navigation, CheckCircle, AlertTriangle, XCircle, Clock, Ruler, Droplets } from 'lucide-react';
import styles from './routes.module.css';

export default function SafeRoutesPage() {
  const { safeRoutes, zones, isLoading } = useFloodData();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [searched, setSearched] = useState(false);

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '1rem', color: 'var(--clr-text-muted)' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(0,212,255,0.1)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p>Calculating safest route options using topology models...</p>
        </div>
      </ProtectedLayout>
    );
  }

  const AREAS = Array.from(new Set(zones.map(z => z.name)));

  const filteredRoutes = searched
    ? safeRoutes.filter(r =>
        (!from || r.from.toLowerCase().includes(from.toLowerCase())) &&
        (!to || r.to.toLowerCase().includes(to.toLowerCase()))
      )
    : safeRoutes;

  const RISK_ICON = { low: CheckCircle, medium: AlertTriangle, high: XCircle };
  const RISK_COLOR = { low: 'var(--clr-safe)', medium: 'var(--clr-warning)', high: 'var(--clr-danger)' };
  const RISK_LABEL = { low: '✅ SAFE ROUTE', medium: '⚠️ USE CAUTION', high: '🚫 AVOID' };

  return (
    <ProtectedLayout>
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Safe Route Guidance</h1>
            <p className="page-subtitle">Find the safest roads during floods. Avoid waterlogged areas automatically.</p>
          </div>

          {/* Route Search */}
          <div className={`card ${styles.searchCard}`}>
            <h2 className={styles.searchTitle}><Navigation size={18} /> Plan Your Journey</h2>
            <div className={styles.searchGrid}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">From</label>
                <select className="form-input" value={from} onChange={e => setFrom(e.target.value)}>
                  <option value="">Select starting area</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className={styles.swapIcon}>⇄</div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">To</label>
                <select className="form-input" value={to} onChange={e => setTo(e.target.value)}>
                  <option value="">Select destination</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={() => setSearched(true)}>
                <Navigation size={16} /> Find Routes
              </button>
            </div>
          </div>

          {/* Routes */}
          <div className={styles.routesList}>
            {filteredRoutes.map((route, i) => {
              const Icon = RISK_ICON[route.risk] || CheckCircle;
              return (
                <div key={route.id} className={`card ${styles.routeCard} ${styles[`route_${route.risk}`]}`}>
                  <div className={styles.routeHeader}>
                    <div className={styles.routeRank}>#{i + 1}</div>
                    <div>
                      <h3 className={styles.routeName}>{route.name}</h3>
                      <span className={styles.routePath}>{route.from} → {route.to}</span>
                    </div>
                    <div className={styles.routeStatus} style={{ color: RISK_COLOR[route.risk] }}>
                      <Icon size={18} />
                      <span>{RISK_LABEL[route.risk]}</span>
                    </div>
                  </div>

                  <p className={styles.routeDesc}>{route.description}</p>

                  <div className={styles.routeMeta}>
                    <div className={styles.routeMetaItem}>
                      <Ruler size={14} />
                      <span>{route.distance}</span>
                    </div>
                    <div className={styles.routeMetaItem}>
                      <Clock size={14} />
                      <span>{route.eta}</span>
                    </div>
                    <div className={styles.routeMetaItem}>
                      <Droplets size={14} />
                      <span>{route.waterDepth}cm water</span>
                    </div>
                    <div className={`${styles.riskBar}`}>
                      <span className={styles.riskBarLabel}>Road Risk</span>
                      <div className={styles.riskBarTrack}>
                        <div className={styles.riskBarFill} style={{
                          width: `${Math.min((route.waterDepth / 150) * 100, 100)}%`,
                          background: RISK_COLOR[route.risk]
                        }} />
                      </div>
                    </div>
                  </div>

                  {route.risk !== 'high' && (
                    <button className={`btn ${route.risk === 'low' ? 'btn-safe' : 'btn-outline'} btn-sm`}>
                      Navigate This Route
                    </button>
                  )}
                </div>
              );
            })}
            {filteredRoutes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--clr-text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                🗺️ No routes found matching those coordinates.
              </div>
            )}
          </div>

          {/* Safety Tips */}
          <div className={`card ${styles.tipsCard}`}>
            <h3 className={styles.tipsTitle}>🚨 Flood Road Safety Tips</h3>
            <div className={styles.tipsGrid}>
              {[
                'Never drive through flooded roads — 30cm of fast-moving water can sweep a car.',
                'Turn around, don\'t drown. Find alternate routes using this app.',
                'Keep emergency kit: torch, rope, first aid, water, charged phone.',
                'Listen to local authority broadcasts and AquaSentinel alerts.',
              ].map((tip, i) => (
                <div key={i} className={styles.tipItem}>
                  <span className={styles.tipNum}>{i + 1}</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
    </ProtectedLayout>
  );
}
