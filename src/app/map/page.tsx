'use client';
import { useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import dynamic from 'next/dynamic';
import styles from './map.module.css';
import { useFloodData } from '@/context/FloodDataContext';
import type { FloodZone } from '@/data/visakhapatnam_zones';
import { AlertTriangle, Droplets, Users, Filter, Map as MapIcon, Radio } from 'lucide-react';
import WindyRadar from '@/components/radar/WindyRadar';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false, loading: () => (
  <div className={styles.mapLoading}>
    <div className={styles.mapLoadingIcon}><Droplets size={40} /></div>
    <p>Loading Flood Map...</p>
  </div>
) });

type FilterType = 'all' | 'high' | 'medium' | 'low';
type ViewMode = 'risk' | 'radar';

export default function MapPage() {
  const { zones } = useFloodData();
  const [selected, setSelected] = useState<FloodZone | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('risk');

  const filtered = filter === 'all' ? zones : zones.filter(z => z.risk === filter);

  return (
    <ProtectedLayout>
      <div className={styles.mapPage}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Live Map AI</h1>
            <p className="page-subtitle">Visakhapatnam District • Interactive Risk Zones &amp; Live Radar Intelligence</p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn ${viewMode === 'risk' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('risk')}
              style={{ fontSize: '0.825rem', padding: '0.45rem 1rem' }}
            >
              <MapIcon size={15} />
              <span>Live Flood Risk Map</span>
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'radar' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('radar')}
              style={{ fontSize: '0.825rem', padding: '0.45rem 1rem' }}
            >
              <Radio size={15} />
              <span>Live Radar Map</span>
            </button>
          </div>
        </div>

        {viewMode === 'risk' ? (
          <>
            {/* Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
              <div className={styles.legend}>
                <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: '#ff3b30' }} /><span>High Risk</span></div>
                <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: '#ff9500' }} /><span>Medium Risk</span></div>
                <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: '#30d158' }} /><span>Safe Zone</span></div>
                <div className={styles.legendSep} />
                <span className={styles.legendTotal}>{filtered.length} zones shown</span>
              </div>

              <div className={styles.filterRow}>
                <Filter size={14} style={{ color: 'var(--clr-text-muted)' }} />
                {(['all', 'high', 'medium', 'low'] as FilterType[]).map(f => (
                  <button key={f} className={`${styles.filterBtn} ${filter === f ? styles[`filterActive_${f}`] : ''}`} onClick={() => setFilter(f)}>
                    {f === 'all' ? 'All Zones' : f.charAt(0).toUpperCase() + f.slice(1) + ' Risk'}
                  </button>
                ))}
              </div>
            </div>

            {/* Map + Sidebar */}
            <div className={styles.mapLayout}>
              <div className={styles.mapContainer}>
                <FloodMap zones={filtered} onSelect={setSelected} selected={selected} />
              </div>

              {/* Zone Detail Panel */}
              <div className={styles.detailPanel}>
                {selected ? (
                  <div className={styles.detail}>
                    <div className={styles.detailHeader}>
                      <div>
                        <h2 className={styles.detailName}>{selected.name}</h2>
                        <span className={styles.detailArea}>{selected.area}</span>
                      </div>
                      <span className={`badge ${selected.risk === 'high' ? 'badge-danger' : selected.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`}>
                        {selected.risk.toUpperCase()}
                      </span>
                    </div>

                    <div className={styles.detailStats}>
                      <div className={styles.detailStat}>
                        <Droplets size={18} style={{ color: 'var(--clr-primary)' }} />
                        <div>
                          <span className={styles.detailStatVal}>{selected.waterDepth} cm</span>
                          <span className={styles.detailStatLabel}>Water Depth</span>
                        </div>
                      </div>
                      <div className={styles.detailStat}>
                        <Users size={18} style={{ color: 'var(--clr-warning)' }} />
                        <div>
                          <span className={styles.detailStatVal}>{selected.populationAffected.toLocaleString()}</span>
                          <span className={styles.detailStatLabel}>People Affected</span>
                        </div>
                      </div>
                      <div className={styles.detailStat}>
                        <AlertTriangle size={18} style={{ color: 'var(--clr-danger)' }} />
                        <div>
                          <span className={styles.detailStatVal}>{selected.rainfall} mm/h</span>
                          <span className={styles.detailStatLabel}>Rainfall Rate</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.detailAction}>
                      <div className={styles.detailActionIcon}>⚠️</div>
                      <p className={styles.detailActionText}>{selected.action}</p>
                    </div>

                    <div className={styles.detailRoads}>
                      <span className={styles.detailRoadsLabel}>Affected Roads</span>
                      {selected.roads.map(road => (
                        <div key={road} className={styles.roadTag}>{road}</div>
                      ))}
                    </div>

                    <div className={styles.detailUpdated}>Updated {selected.lastUpdated}</div>
                  </div>
                ) : (
                  <div className={styles.noSelection}>
                    <Droplets size={32} style={{ color: 'var(--clr-primary)', marginBottom: '0.75rem', opacity: 0.5 }} />
                    <p>Click on any zone on the map to view detailed flood information.</p>
                  </div>
                )}

                {/* Zone List */}
                <div className={styles.zoneListPanel}>
                  <h3 className={styles.zoneListTitle}>All Zones</h3>
                  {zones.map(zone => (
                    <button key={zone.id} className={`${styles.zoneListItem} ${selected?.id === zone.id ? styles.zoneListItemActive : ''}`} onClick={() => setSelected(zone)}>
                      <div className={`risk-dot ${zone.risk === 'low' ? 'low' : zone.risk}`} />
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <span className={styles.zoneListName}>{zone.name}</span>
                        <span className={styles.zoneListDepth}>{zone.waterDepth}cm</span>
                      </div>
                      <span className={`badge ${zone.risk === 'high' ? 'badge-danger' : zone.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`} style={{ fontSize: '0.6rem' }}>
                        {zone.risk.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            <WindyRadar />
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
