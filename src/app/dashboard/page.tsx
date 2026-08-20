'use client';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import styles from './dashboard.module.css';
import { AlertTriangle, Droplets, Users, CloudRain, TrendingUp, MapPin, Bell, ArrowRight, Activity } from 'lucide-react';
import { useFloodData } from '@/context/FloodDataContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { zones, alerts, weatherData, isLoading } = useFloodData();

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '1rem', color: 'var(--clr-text-muted)' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(0,212,255,0.1)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p>Processing Visakhapatnam telemetry and flood models...</p>
        </div>
      </ProtectedLayout>
    );
  }

  const highZones = zones.filter(z => z.risk === 'high');
  const activeAlerts = alerts.filter(a => a.active);
  const highCount = highZones.length;

  const avgLevel = zones.length ? Math.round(zones.reduce((acc, z) => acc + z.waterDepth, 0) / zones.length) : 0;
  const totalAffected = zones.reduce((acc, z) => acc + z.populationAffected, 0);
  const affectedStr = totalAffected >= 1000 ? `${(totalAffected / 1000).toFixed(1)}K` : `${totalAffected}`;

  const stats = [
    { label: 'High Risk Zones', value: `${highCount}`, change: highCount > 2 ? 'Critically High' : 'Monitored', icon: AlertTriangle, color: highCount > 0 ? 'danger' : 'safe' },
    { label: 'Avg Water Level', value: `${avgLevel}cm`, change: avgLevel > 40 ? 'Rising Depth' : 'Stable Level', icon: Droplets, color: avgLevel > 60 ? 'danger' : avgLevel > 15 ? 'warning' : 'safe' },
    { label: 'People Affected', value: affectedStr, change: totalAffected > 10000 ? 'Shelter Active' : 'Normal Flow', icon: Users, color: totalAffected > 20000 ? 'danger' : totalAffected > 5000 ? 'warning' : 'safe' },
    { label: 'Rainfall Now', value: `${weatherData.current.rainfall}mm/h`, change: weatherData.current.rainfall > 40 ? 'Heavy Rain' : weatherData.current.rainfall > 0 ? 'Showers' : 'Clear', icon: CloudRain, color: weatherData.current.rainfall > 45 ? 'danger' : weatherData.current.rainfall > 0 ? 'primary' : 'safe' },
  ];

  return (
    <ProtectedLayout>
      <div className={`page-content ${styles.content}`}>
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Flood Intelligence Dashboard</h1>
          <p className="page-subtitle">Visakhapatnam • Real-time flood risk monitoring • Updated now</p>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`card ${styles.statCard}`}>
                <div className={`${styles.statIcon} ${styles[`statIcon_${s.color}`]}`}>
                  <Icon size={20} />
                </div>
                <div className={styles.statBody}>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                  <span className={`${styles.statChange} ${s.color === 'danger' ? styles.changeDanger : s.color === 'safe' ? styles.changeSafe : styles.changeWarn}`}>
                    <TrendingUp size={11} /> {s.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className={styles.mainGrid}>
          {/* Left Column */}
          <div className={styles.leftCol}>
            {/* High Risk Alert Banner */}
            {highCount > 0 && (
              <div className={styles.alertBanner}>
                <div className={styles.alertBannerIcon}><AlertTriangle size={20} /></div>
                <div className={styles.alertBannerText}>
                  <strong>CRITICAL ALERT</strong>
                  <span>{highCount} area{highCount > 1 ? 's' : ''} in Visakhapatnam at HIGH flood risk. Immediate precaution recommended.</span>
                </div>
                <Link href="/alerts" className="btn btn-danger btn-sm">View All</Link>
              </div>
            )}

            {/* Risk Zones Table */}
            <div className="card">
              <div className={styles.cardHeader}>
                <div className="flex items-center gap-sm">
                  <MapPin size={16} style={{ color: 'var(--clr-primary)' }} />
                  <h2 className={styles.cardTitle}>Risk Zone Status</h2>
                </div>
                <Link href="/map" className="btn btn-outline btn-sm">Open Map</Link>
              </div>
              <div className={styles.zoneList}>
                {zones.slice(0, 7).map(zone => (
                  <div key={zone.id} className={styles.zoneRow}>
                    <div className={`risk-dot ${zone.risk === 'low' ? 'low' : zone.risk}`} />
                    <div className={styles.zoneInfo}>
                      <span className={styles.zoneName}>{zone.name}</span>
                      <span className={styles.zoneArea}>{zone.area}</span>
                    </div>
                    <div className={styles.zoneStats}>
                      <span className={styles.zoneDepth}>{zone.waterDepth}cm</span>
                      <span className={styles.zoneRain}>{zone.rainfall}mm/h</span>
                    </div>
                    <span className={`badge ${zone.risk === 'high' ? 'badge-danger' : zone.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`}>
                      {zone.risk.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Widget */}
            <div className={`card ${styles.weatherCard}`}>
              <div className={styles.cardHeader}>
                <div className="flex items-center gap-sm">
                  <CloudRain size={16} style={{ color: 'var(--clr-primary)' }} />
                  <h2 className={styles.cardTitle}>Current Weather</h2>
                </div>
                <span className={`badge ${weatherData.current.rainfall > 40 ? 'badge-danger' : weatherData.current.rainfall > 10 ? 'badge-warning' : 'badge-safe'}`}>
                  {weatherData.current.condition.toUpperCase()}
                </span>
              </div>
              <div className={styles.weatherMain}>
                <div className={styles.weatherTemp}>
                  <span className={styles.weatherTempVal}>{weatherData.current.temp}°C</span>
                  <span className={styles.weatherCondition}>{weatherData.current.condition}</span>
                </div>
                <div className={styles.weatherGrid}>
                  {[
                    { label: 'Rainfall', value: `${weatherData.current.rainfall} mm/h` },
                    { label: 'Humidity', value: `${weatherData.current.humidity}%` },
                    { label: 'Wind', value: `${weatherData.current.windSpeed} km/h` },
                    { label: 'Visibility', value: `${weatherData.current.visibility} km` },
                  ].map(m => (
                    <div key={m.label} className={styles.weatherMetric}>
                      <span className={styles.weatherMetricVal}>{m.value}</span>
                      <span className={styles.weatherMetricLabel}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.forecastRow}>
                {weatherData.forecast.slice(0, 5).map(f => (
                  <div key={f.day} className={styles.forecastDay}>
                    <span className={styles.forecastLabel}>{f.day}</span>
                    <div className={`risk-dot ${f.risk === 'low' ? 'low' : f.risk}`} style={{ margin: '0.3rem auto' }} />
                    <span className={styles.forecastRain}>{f.rainfall}mm</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightCol}>
            {/* Live Alerts */}
            <div className="card">
              <div className={styles.cardHeader}>
                <div className="flex items-center gap-sm">
                  <Bell size={16} style={{ color: 'var(--clr-warning)' }} />
                  <h2 className={styles.cardTitle}>Live Alerts</h2>
                  <span className={`badge ${activeAlerts.length > 0 ? 'badge-danger' : 'badge-safe'}`}>{activeAlerts.length} Active</span>
                </div>
                <Link href="/alerts" className="btn btn-outline btn-sm">View All</Link>
              </div>
              <div className={styles.alertList}>
                {activeAlerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className={`${styles.alertItem} ${styles[`alertItem_${alert.risk}`]}`}>
                    <div className={`risk-dot ${alert.risk === 'low' ? 'low' : alert.risk}`} />
                    <div className={styles.alertContent}>
                      <div className={styles.alertTop}>
                        <span className={styles.alertArea}>{alert.area}</span>
                        <span className={styles.alertTime}>{alert.time}</span>
                      </div>
                      <p className={styles.alertMsg}>{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className={styles.cardHeader}>
                <div className="flex items-center gap-sm">
                  <Activity size={16} style={{ color: 'var(--clr-primary)' }} />
                  <h2 className={styles.cardTitle}>Quick Actions</h2>
                </div>
              </div>
              <div className={styles.quickActions}>
                {[
                  { label: 'View Flood Map', href: '/map', desc: 'See all risk zones', color: 'primary' },
                  { label: 'Find Safe Route', href: '/safe-routes', desc: 'Navigate safely', color: 'safe' },
                  { label: '7-Day Forecast', href: '/predictions', desc: 'AI flood predictions', color: 'warning' },
                  { label: 'Report Incident', href: '/incident', desc: 'Submit flood report', color: 'danger' },
                  { label: 'FieldShield', href: '/fieldshield', desc: 'IoT field protection', color: 'accent' },
                ].map(action => (
                  <Link key={action.href} href={action.href} className={styles.quickAction}>
                    <div>
                      <span className={styles.quickActionLabel}>{action.label}</span>
                      <span className={styles.quickActionDesc}>{action.desc}</span>
                    </div>
                    <ArrowRight size={14} className={styles.quickActionArrow} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Priority Areas */}
            <div className="card">
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Priority Response</h2>
              </div>
              <div className={styles.priorityList}>
                {highZones.length > 0 ? (
                  highZones.map((zone, i) => (
                    <div key={zone.id} className={styles.priorityItem}>
                      <span className={styles.priorityRank}>#{i + 1}</span>
                      <div className={styles.priorityInfo}>
                        <span className={styles.priorityName}>{zone.name}</span>
                        <span className={styles.priorityDetail}>{zone.waterDepth}cm water • {zone.populationAffected.toLocaleString()} affected</span>
                      </div>
                      <span className="badge badge-danger">CRITICAL</span>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
                    🟢 No critical zones currently require emergency evacuation response.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
