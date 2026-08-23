'use client';
import { useEffect, useRef } from 'react';
import type { FloodZone, RouteOption } from '@/data/visakhapatnam_zones';
import 'leaflet/dist/leaflet.css';

interface Props {
  zones: FloodZone[];
  routes?: RouteOption[];
  selectedRouteId?: string | null;
  onSelectRoute?: (routeId: string) => void;
  onSelect?: (zone: FloodZone) => void;
  selected?: FloodZone | null;
}

const RISK_COLORS = {
  high: { fill: '#ff2a00', stroke: '#ff5500', opacity: 0.65 },
  medium: { fill: '#ff8800', stroke: '#ffaa00', opacity: 0.50 },
  low: { fill: '#00e676', stroke: '#00b0ff', opacity: 0.20 },
};

const ROUTE_COLORS = {
  high: '#ff4444',
  medium: '#ffaa00',
  low: '#00ff88',
};

const RESOURCES = [
  { type: 'sensor', name: 'IoT Drainage Sensor DS-02', coords: [17.705, 83.292] as [number, number], status: 'Active' },
  { type: 'sensor', name: 'IoT Water Sensor WS-05', coords: [17.728, 83.325] as [number, number], status: 'Active' },
  { type: 'sensor', name: 'IoT Stream Sensor SS-11', coords: [17.755, 83.250] as [number, number], status: 'Active' },
  { type: 'shelter', name: 'Evacuation Shelter - Old Town School', coords: [17.695, 83.297] as [number, number], status: 'Open' },
  { type: 'shelter', name: 'Gajuwaka Relief Camp', coords: [17.682, 83.211] as [number, number], status: 'Open' },
  { type: 'shelter', name: 'Gopalapatnam Shelter Center', coords: [17.760, 83.253] as [number, number], status: 'Open' },
  { type: 'rescue', name: 'Rescue Unit 01 (Boat Squad)', coords: [17.699, 83.288] as [number, number], status: 'Deployed' },
  { type: 'rescue', name: 'Rescue Unit 03 (Emergency Ambulance)', coords: [17.732, 83.315] as [number, number], status: 'Deployed' },
];

export default function FloodMap({ zones, routes, selectedRouteId, onSelectRoute, onSelect, selected }: Props) {
  const mapRef = useRef<ReturnType<typeof import('leaflet').map> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const polygonsRef = useRef<ReturnType<typeof import('leaflet').polygon>[]>([]);
  const polylinesRef = useRef<ReturnType<typeof import('leaflet').polyline>[]>([]);
  const markersRef = useRef<ReturnType<typeof import('leaflet').marker>[]>([]);
  const userMarkerRef = useRef<ReturnType<typeof import('leaflet').marker> | null>(null);

  const locateUser = () => {
    if (!mapRef.current || typeof window === 'undefined' || !navigator.geolocation) return;
    // eslint-disable-next-line
    const L = require('leaflet');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const userCoords: [number, number] = [userLat, userLng];

        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        const userIcon = L.divIcon({
          html: `
            <div style="position:relative;width:32px;height:32px;">
              <div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(0,212,255,0.3);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
              <div style="position:relative;width:32px;height:32px;border-radius:50%;background:#00d4ff;border:3px solid #ffffff;box-shadow:0 0 20px #00d4ff;display:flex;align-items:center;justify-content:center;color:#000;font-weight:bold;font-size:14px;">📍</div>
            </div>
          `,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const m = L.marker(userCoords, { icon: userIcon })
          .bindPopup(`
            <div style="padding:8px;background:rgba(10,25,47,0.95);color:#fff;border-radius:8px;text-align:center">
              <strong style="color:#00d4ff;font-size:13px;display:block">Your Live Location</strong>
              <span style="font-size:11px;color:#6b8cae">Lat: ${userLat.toFixed(4)}, Lon: ${userLng.toFixed(4)}</span>
            </div>
          `)
          .addTo(mapRef.current);

        if (mapRef.current) {
          mapRef.current.flyTo(userCoords, 14, { duration: 1 });
        }
      },
      (err) => {
        console.warn('Geolocation denied:', err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (!containerRef.current) return;
    // eslint-disable-next-line
    const L = require('leaflet');

    // Fix default marker icons
    // eslint-disable-next-line
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: [17.7350, 83.3100],
        zoom: 12,
        zoomControl: true,
      });

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear existing markers & polylines
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    polygonsRef.current.forEach(p => p.remove());
    polygonsRef.current = [];

    polylinesRef.current.forEach(pl => pl.remove());
    polylinesRef.current = [];

    // Load leaflet.heat plugin dynamically
    require('leaflet.heat');

    // Generate smooth continuous weather radar heatmap points
    const heatPoints: [number, number, number][] = [];
    zones.forEach(zone => {
      let intensity = 0.2;
      if (zone.risk === 'high') intensity = 0.9;
      else if (zone.risk === 'medium') intensity = 0.55;

      const centerLat = zone.center[0];
      const centerLng = zone.center[1];

      heatPoints.push([centerLat, centerLng, intensity]);

      for (let i = 0; i < 6; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.025;
        const offsetLng = (Math.random() - 0.5) * 0.025;
        const subIntensity = intensity * (0.4 + Math.random() * 0.5);
        heatPoints.push([centerLat + offsetLat, centerLng + offsetLng, subIntensity]);
      }
    });

    // Remove previous heat layer if exists
    if (map && (map as any)._heatLayer) {
      (map as any).removeLayer((map as any)._heatLayer);
    }

    // Add weather station gradient heatmap layer
    const heatLayer = (L as any).heatLayer(heatPoints, {
      radius: 40,
      blur: 25,
      maxZoom: 15,
      max: 1.0,
      gradient: {
        0.2: '#30d158',
        0.4: '#ffe600',
        0.7: '#ff9500',
        1.0: '#ff3b30',
      },
    });
    heatLayer.addTo(map);
    (map as any)._heatLayer = heatLayer;

    // Trigger initial geolocation lookup
    locateUser();

    // Draw resource markers (Sensors, Shelters, Rescue Units)
    RESOURCES.forEach(r => {
      let iconEmoji = '📡';
      let iconColor = '#00d4ff';
      if (r.type === 'shelter') { iconEmoji = '⛺'; iconColor = '#00ff88'; }
      else if (r.type === 'rescue') { iconEmoji = '🚤'; iconColor = '#ff4444'; }

      const icon = L.divIcon({
        html: `<div style="width:26px;height:26px;border-radius:50%;background:${iconColor};box-shadow:0 0 10px ${iconColor};display:flex;align-items:center;justify-content:center;font-size:12px;">${iconEmoji}</div>`,
        className: '',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const m = L.marker(r.coords, { icon })
        .bindPopup(`
          <div style="padding:6px;background:#091322;color:#fff;border-radius:6px;min-width:160px">
            <strong style="color:${iconColor};font-size:12px;display:block">${r.name}</strong>
            <span style="font-size:11px;color:#88a0c0">Type: ${r.type.toUpperCase()} • Status: ${r.status}</span>
          </div>
        `)
        .addTo(map);

      markersRef.current.push(m);
    });

    // Draw zones polygons
    zones.forEach(zone => {
      const poly = L.polygon(zone.coordinates, {
        color: 'transparent',
        fillColor: 'transparent',
        fillOpacity: 0,
        weight: 0,
      });

      poly.bindPopup(`
        <div style="min-width:200px;padding:4px 0">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong style="font-size:14px;color:#e8f4f8">${zone.name}</strong>
            <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:${zone.risk === 'high' ? 'rgba(255,59,48,0.2)' : zone.risk === 'medium' ? 'rgba(255,149,0,0.2)' : 'rgba(48,209,88,0.2)'};color:${zone.risk === 'high' ? '#ff3b30' : zone.risk === 'medium' ? '#ff9500' : '#30d158'};text-transform:uppercase">${zone.risk} risk</span>
          </div>
          <div style="font-size:12px;color:#6b8cae;margin-bottom:4px">📍 ${zone.area}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0">
            <div style="background:rgba(255,255,255,0.05);border-radius:6px;padding:6px;text-align:center">
              <div style="font-weight:700;color:#e8f4f8">${zone.waterDepth}cm</div>
              <div style="font-size:10px;color:#6b8cae">Water Depth</div>
            </div>
            <div style="background:rgba(255,255,255,0.05);border-radius:6px;padding:6px;text-align:center">
              <div style="font-weight:700;color:#e8f4f8">${zone.rainfall}mm/h</div>
              <div style="font-size:10px;color:#6b8cae">Rainfall</div>
            </div>
          </div>
          <div style="font-size:11px;color:#6b8cae;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px;margin-top:6px">${zone.action}</div>
        </div>
      `, { maxWidth: 280 });

      poly.on('click', () => onSelect && onSelect(zone));
      poly.addTo(map);
      polygonsRef.current.push(poly);
    });

    // DRAW ROUTE POLYLINES (Safe Evacuation Routes)
    if (routes && routes.length > 0) {
      routes.forEach(r => {
        const isSelected = selectedRouteId === r.id;
        const color = isSelected ? '#00d4ff' : ROUTE_COLORS[r.risk];
        const weight = isSelected ? 8 : 5;
        const opacity = isSelected ? 1.0 : 0.75;

        // Route Polyline
        const polyline = L.polyline(r.waypoints, {
          color,
          weight,
          opacity,
          dashArray: r.risk === 'low' ? '8, 8' : undefined,
        });

        polyline.bindPopup(`
          <div style="padding:8px;background:#091322;color:#fff;border-radius:8px;min-width:210px">
            <strong style="color:${color};font-size:13px;display:block;margin-bottom:4px">${r.name}</strong>
            <span style="font-size:11px;color:#a0b8d0;display:block">${r.from} ➔ ${r.to}</span>
            <span style="font-size:11px;color:#a0b8d0;display:block;margin-top:2px">Distance: ${r.distance} • ETA: ${r.eta}</span>
            <div style="margin-top:6px;font-size:10px;padding:4px 6px;border-radius:4px;background:rgba(0,214,255,0.1);color:#00d4ff">
              ${r.description}
            </div>
          </div>
        `);

        polyline.on('click', () => {
          if (onSelectRoute) onSelectRoute(r.id);
        });

        polyline.addTo(map);
        polylinesRef.current.push(polyline);

        // Start & End Pins for Routes
        const startCoords = r.waypoints[0];
        const endCoords = r.waypoints[r.waypoints.length - 1];

        const startIcon = L.divIcon({
          html: `<div style="padding:2px 6px;border-radius:10px;background:#00ff88;color:#000;font-weight:bold;font-size:10px;box-shadow:0 0 10px #00ff88;white-space:nowrap;">🟢 Start: ${r.from}</div>`,
          className: '',
          iconSize: [80, 20],
          iconAnchor: [40, 20],
        });

        const endIcon = L.divIcon({
          html: `<div style="padding:2px 6px;border-radius:10px;background:${color};color:#000;font-weight:bold;font-size:10px;box-shadow:0 0 10px ${color};white-space:nowrap;">🏁 End: ${r.to}</div>`,
          className: '',
          iconSize: [80, 20],
          iconAnchor: [40, 0],
        });

        const mStart = L.marker(startCoords, { icon: startIcon }).addTo(map);
        const mEnd = L.marker(endCoords, { icon: endIcon }).addTo(map);

        markersRef.current.push(mStart, mEnd);
      });

      // Fly to selected route if selected
      if (selectedRouteId) {
        const targetRoute = routes.find(r => r.id === selectedRouteId);
        if (map && targetRoute && targetRoute.waypoints.length > 0) {
          const bounds = L.latLngBounds(targetRoute.waypoints);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
      }
    }

    // Fly to selected zone if selected
    if (selected && map) {
      map.flyTo(selected.center, 14, { duration: 0.8 });
    }

    return () => {};
  }, [zones, routes, selectedRouteId, onSelectRoute, selected, onSelect]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Locate Me Overlay Button */}
      <button
        type="button"
        onClick={locateUser}
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 1000,
          background: 'rgba(9, 19, 34, 0.9)',
          border: '1px solid rgba(0, 214, 255, 0.4)',
          color: '#00d4ff',
          padding: '0.45rem 0.85rem',
          borderRadius: '10px',
          fontSize: '0.8rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span>📍 Locate My Location</span>
      </button>
    </div>
  );
}
