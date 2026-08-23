'use client';
import { useState } from 'react';
import { CloudRain, ExternalLink, RefreshCw, Radio, MapPin } from 'lucide-react';

export default function WindyRadar() {
  const [loading, setLoading] = useState(true);
  const [lat, setLat] = useState(17.6868);
  const [lon, setLon] = useState(83.2185);

  const locateUser = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLon(pos.coords.longitude);
          setLoading(true);
        },
        (err) => console.warn('Geolocation warning:', err.message),
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div style={{
      background: 'rgba(11, 22, 40, 0.85)',
      border: '1px solid rgba(0, 214, 255, 0.25)',
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'relative',
      minHeight: 'calc(100vh - 210px)',
      height: '740px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Radar Header */}
      <div style={{
        padding: '0.85rem 1.25rem',
        background: 'rgba(5, 12, 24, 0.95)',
        borderBottom: '1px solid rgba(0, 214, 255, 0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#00ff88',
            boxShadow: '0 0 10px #00ff88',
            animation: 'pulse 1.5s infinite',
          }} />
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Radio size={16} color="#00d4ff" />
            Live Windy.com Meteorological Radar • Visakhapatnam Coast
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', gap: '0.3rem', borderColor: 'rgba(0, 214, 255, 0.3)' }}
            onClick={locateUser}
          >
            <MapPin size={13} color="#00d4ff" />
            <span>Center On My Location</span>
          </button>

          <a
            href={`https://www.windy.com/${lat}/${lon}?rain,${lat},${lon},9`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', gap: '0.3rem' }}
          >
            <span>Open Full Windy</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Embed Iframe filling 100% of container height */}
      <div style={{ position: 'relative', width: '100%', height: '100%', flex: 1, background: '#091322' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            background: '#091322',
            color: 'var(--clr-text-muted)',
            zIndex: 2,
          }}>
            <RefreshCw size={24} className="spin" color="#00d4ff" />
            <span style={{ fontSize: '0.875rem' }}>Connecting to Windy.com Doppler Radar Satellite Stream...</span>
          </div>
        )}

        <iframe
          key={`${lat}-${lon}`}
          title="Windy.com Live Rain Radar - Visakhapatnam"
          src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km%2Fh&zoom=9&overlay=rain&product=ecmwf&level=surface&lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&marker=true`}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '680px',
            border: 'none',
            display: 'block',
          }}
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}
