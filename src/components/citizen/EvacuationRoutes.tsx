'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Navigation, MapPin } from 'lucide-react';
import type { RouteOption, FloodZone } from '@/data/visakhapatnam_zones';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false });

interface EvacuationRoutesProps {
  zones: FloodZone[];
  safeRoutes: RouteOption[];
  selectedRouteId: string;
  setSelectedRouteId: (id: string) => void;
}

export default function EvacuationRoutes({
  zones,
  safeRoutes,
  selectedRouteId,
  setSelectedRouteId,
}: EvacuationRoutesProps) {
  return (
    <div className="grid-2" style={{ gap: '1.25rem', alignItems: 'stretch' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Navigation size={18} color="#00d4ff" />
            AI Calculated Safe Evacuation Corridors
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Click card to highlight route</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
          {safeRoutes.map(r => {
            const isSelected = selectedRouteId === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRouteId(r.id)}
                style={{
                  padding: '1rem',
                  borderRadius: '14px',
                  background: isSelected ? 'rgba(0, 214, 255, 0.12)' : 'rgba(10, 20, 35, 0.6)',
                  border: isSelected ? '2px solid #00d4ff' : '1px solid rgba(0, 214, 255, 0.15)',
                  borderLeft: `5px solid ${r.risk === 'high' ? '#ff4444' : r.risk === 'medium' ? '#ffaa00' : '#00ff88'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 15px rgba(0, 214, 255, 0.25)' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <strong style={{ color: isSelected ? '#00d4ff' : '#fff', fontSize: '0.95rem' }}>{r.name}</strong>
                  <span className={`badge ${r.risk === 'high' ? 'badge-danger' : r.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`}>
                    {r.risk.toUpperCase()} RISK
                  </span>
                </div>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                  📍 {r.from} ➔ 🏁 {r.to} • {r.distance} • Est. ETA: {r.eta}
                </p>
                <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-main)', display: 'block', marginTop: '0.35rem' }}>
                  {r.description}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Leaflet Navigation Map with Polyline Routes */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', height: '580px' }}>
        <div style={{ padding: '0.85rem 1.1rem', background: 'rgba(5, 12, 24, 0.95)', borderBottom: '1px solid rgba(0, 214, 255, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={16} color="#00d4ff" />
            Interactive Evacuation Route Polyline Map
          </span>
          <span style={{ fontSize: '0.75rem', color: '#00d4ff' }}>
            Selected: {safeRoutes.find(r => r.id === selectedRouteId)?.name}
          </span>
        </div>
        <div style={{ height: 'calc(100% - 45px)', width: '100%' }}>
          <FloodMap
            zones={zones}
            routes={safeRoutes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
          />
        </div>
      </div>
    </div>
  );
}
