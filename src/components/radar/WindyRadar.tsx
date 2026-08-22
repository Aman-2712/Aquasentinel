'use client';
import { useState } from 'react';
import { CloudRain, ExternalLink, RefreshCw, Radio } from 'lucide-react';

export default function WindyRadar() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{
      background: 'rgba(11, 22, 40, 0.7)',
      border: '1px solid rgba(0, 214, 255, 0.2)',
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'relative',
      minHeight: '520px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Radar Header */}
      <div style={{
        padding: '0.85rem 1.25rem',
        background: 'rgba(5, 12, 24, 0.9)',
        borderBottom: '1px solid rgba(0, 214, 255, 0.15)',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CloudRain size={14} color="#00d4ff" /> Satellite Rain Accumulation & Wind Vector Overlay
          </span>
          <a
            href="https://www.windy.com/17.6868/83.2185?rain,17.6868,83.2185,9"
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

      {/* Embed Iframe */}
      <div style={{ position: 'relative', width: '100%', height: '500px', flex: 1, background: '#091322' }}>
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
          title="Windy.com Live Rain Radar - Visakhapatnam"
          src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km%2Fh&zoom=9&overlay=rain&product=ecmwf&level=surface&lat=17.6868&lon=83.2185&detailLat=17.6868&detailLon=83.2185&marker=true"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}
