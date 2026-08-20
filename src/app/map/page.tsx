'use client';
import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import dynamic from 'next/dynamic';
import styles from './map.module.css';
import { useFloodData } from '@/context/FloodDataContext';
import type { FloodZone } from '@/data/visakhapatnam_zones';
import { AlertTriangle, Droplets, Users, Filter, Play, Pause } from 'lucide-react';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false, loading: () => (
  <div className={styles.mapLoading}>
    <div className={styles.mapLoadingIcon}><Droplets size={40} /></div>
    <p>Loading Flood Map...</p>
  </div>
) });

type FilterType = 'all' | 'high' | 'medium' | 'low';

export default function MapPage() {
  const { zones, isLoading } = useFloodData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [forecastTime, setForecastTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setForecastTime(prev => {
          if (prev >= 12) return 0;
          return prev + 3;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const getForecastZones = (baseZones: FloodZone[], offset: number): FloodZone[] => {
    return baseZones.map(zone => {
      let depthFactor = 0;
      let rainFactor = 0;
      
      if (offset === 3) {
        depthFactor = 25;
        rainFactor = 15;
      } else if (offset === 6) {
        depthFactor = 50;
        rainFactor = 30;
      } else if (offset === 9) {
        depthFactor = -15;
        rainFactor = -30;
      } else if (offset === 12) {
        depthFactor = -35;
        rainFactor = -50;
      }
      
      const newDepth = Math.max(0, zone.waterDepth + depthFactor);
      const newRainfall = Math.max(0, zone.rainfall + rainFactor);
      
      let newRisk: 'high' | 'medium' | 'low' = 'low';
      if (newDepth > 100) {
        newRisk = 'high';
      } else if (newDepth > 40) {
        newRisk = 'medium';
      } else {
        newRisk = 'low';
      }
      
      let newAction = zone.action;
      if (newRisk === 'high') {
        newAction = 'Critical level. Evacuate low-lying areas. Roads submerged.';
      } else if (newRisk === 'medium') {
        newAction = 'Moderate flooding. Avoid flooded streets and basements.';
      } else {
        newAction = 'Normal flow. Watch for drainage blockages.';
      }
      
      return {
        ...zone,
        waterDepth: newDepth,
        rainfall: newRainfall,
        risk: newRisk,
        action: newAction,
      };
    });
  };

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '1rem', color: 'var(--clr-text-muted)' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(0,212,255,0.1)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p>Rendering geographical flood zones mapping...</p>
        </div>
      </ProtectedLayout>
    );
  }

  const forecastedZones = getForecastZones(zones, forecastTime);
  const filtered = filter === 'all' ? forecastedZones : forecastedZones.filter(z => z.risk === filter);
  const selected = selectedId ? forecastedZones.find(z => z.id === selectedId) || null : null;

  return (
    <ProtectedLayout>
        <div className={styles.mapPage}>
          {/* Top bar */}
          <div className={styles.topBar}>
            <div>
              <h1 className="page-title" style={{ marginBottom: 0 }}>Live Flood Risk Map</h1>
              <p className="page-subtitle">Visakhapatnam District • Color-coded risk zones • Updated now</p>
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

          {/* Legend */}
          <div className={styles.legend}>
            <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: '#ff3b30' }} /><span>High Risk</span></div>
            <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: '#ff9500' }} /><span>Medium Risk</span></div>
            <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: '#30d158' }} /><span>Safe Zone</span></div>
            <div className={styles.legendSep} />
            <span className={styles.legendTotal}>{filtered.length} zones shown</span>
          </div>

          {/* Map + Sidebar */}
          <div className={styles.mapLayout}>
            <div className={styles.mapContainer} style={{ position: 'relative' }}>
              <FloodMap zones={filtered} onSelect={(zone) => setSelectedId(zone.id)} selected={selected} />
              
              {/* Timeline Forecast Overlay */}
              <div className={styles.timelineOverlay}>
                <div className={styles.timelineHeader}>
                  <span className={styles.timelineTitle}>
                    Time: {forecastTime === 0 ? 'Live Status' : `+${forecastTime} Hours Forecast`}
                  </span>
                </div>
                
                <div className={styles.timelineControls}>
                  <button 
                    className={styles.playBtn} 
                    onClick={() => setIsPlaying(!isPlaying)}
                    title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
                  >
                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  </button>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input 
                      type="range" 
                      min="0" 
                      max="12" 
                      step="3" 
                      value={forecastTime} 
                      onChange={(e) => {
                        setForecastTime(Number(e.target.value));
                        setIsPlaying(false);
                      }} 
                      className={styles.timelineSlider}
                    />
                    <div className={styles.timelineTicks}>
                      <span className={forecastTime === 0 ? styles.activeTick : ''}>Live</span>
                      <span className={forecastTime === 3 ? styles.activeTick : ''}>+3h</span>
                      <span className={forecastTime === 6 ? styles.activeTick : ''}>+6h</span>
                      <span className={forecastTime === 9 ? styles.activeTick : ''}>+9h</span>
                      <span className={forecastTime === 12 ? styles.activeTick : ''}>+12h</span>
                    </div>
                  </div>
                </div>
              </div>
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
                {forecastedZones.map(zone => (
                  <button key={zone.id} className={`${styles.zoneListItem} ${selectedId === zone.id ? styles.zoneListItemActive : ''}`} onClick={() => setSelectedId(zone.id)}>
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
        </div>
    </ProtectedLayout>
  );
}
