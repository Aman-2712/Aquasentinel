'use client';
import { useEffect, useRef } from 'react';
import type { FloodZone } from '@/data/visakhapatnam_zones';
import 'leaflet/dist/leaflet.css';

interface Props {
  zones: FloodZone[];
  onSelect: (zone: FloodZone) => void;
  selected: FloodZone | null;
}

const RISK_COLORS = {
  high: { fill: '#ff2a00', stroke: '#ff5500', opacity: 0.65 },
  medium: { fill: '#ff8800', stroke: '#ffaa00', opacity: 0.50 },
  low: { fill: '#00e676', stroke: '#00b0ff', opacity: 0.20 },
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

export default function FloodMap({ zones, onSelect, selected }: Props) {
  const mapRef = useRef<ReturnType<typeof import('leaflet').map> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const polygonsRef = useRef<ReturnType<typeof import('leaflet').polygon>[]>([]);
  const markersRef = useRef<ReturnType<typeof import('leaflet').marker>[]>([]);

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
        center: [17.7231, 83.3012],
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

    // Load leaflet.heat plugin dynamically
    require('leaflet.heat');

    // Generate smooth continuous weather radar heatmap points
    const heatPoints: [number, number, number][] = [];
    zones.forEach(zone => {
      const [centerLat, centerLng] = zone.center;
      const intensity = zone.risk === 'high' ? 1.0 : zone.risk === 'medium' ? 0.6 : 0.25;

      // Add central high-intensity point
      heatPoints.push([centerLat, centerLng, intensity]);

      // Generate surrounding radar heat points to create smooth blended weather gradient
      for (let i = 0; i < 25; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.025;
        const offsetLng = (Math.random() - 0.5) * 0.025;
        const subIntensity = intensity * (0.4 + Math.random() * 0.5);
        heatPoints.push([centerLat + offsetLat, centerLng + offsetLng, subIntensity]);
      }
    });

    // Remove previous heat layer if exists
    if ((map as any)._heatLayer) {
      map.removeLayer((map as any)._heatLayer);
    }

    // Add realistic weather station gradient heatmap layer (Red -> Orange -> Yellow -> Cyan)
    const heatLayer = (L as any).heatLayer(heatPoints, {
      radius: 40,
      blur: 25,
      maxZoom: 15,
      max: 1.0,
      gradient: {
        0.2: '#00d4ff', // Safe cyan
        0.4: '#ffe600', // Yellow watch
        0.65: '#ff8800', // Orange elevated
        0.85: '#ff2a00', // Red critical
        1.0: '#990000'  // Dark red extreme
      }
    }).addTo(map);

    (map as any)._heatLayer = heatLayer;

    // Clear old polygons
    polygonsRef.current.forEach(p => p.remove());
    polygonsRef.current = [];

    // Clear old markers (pulse and resource markers)
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Draw resources (sensors, shelters, rescues)
    RESOURCES.forEach(res => {
      let iconHtml = '';
      if (res.type === 'sensor') {
        iconHtml = `<div style="width:24px;height:24px;border-radius:50%;background:rgba(0,212,255,0.15);border:2.5px solid #00d4ff;display:flex;align-items:center;justify-content:center;color:#00d4ff;font-size:10px;box-shadow:0 0 10px rgba(0,212,255,0.5)">📡</div>`;
      } else if (res.type === 'shelter') {
        iconHtml = `<div style="width:24px;height:24px;border-radius:50%;background:rgba(48,209,88,0.15);border:2.5px solid #30d158;display:flex;align-items:center;justify-content:center;color:#30d158;font-size:10px;box-shadow:0 0 10px rgba(48,209,88,0.5)">🏠</div>`;
      } else if (res.type === 'rescue') {
        iconHtml = `<div style="width:24px;height:24px;border-radius:50%;background:rgba(255,149,0,0.15);border:2.5px solid #ff9500;display:flex;align-items:center;justify-content:center;color:#ff9500;font-size:10px;box-shadow:0 0 10px rgba(255,149,0,0.5)">🚒</div>`;
      }

      const customIcon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const m = L.marker(res.coords, { icon: customIcon })
        .bindPopup(`
          <div style="padding:6px;min-width:180px;background:rgba(10,25,47,0.9);color:#fff;border-radius:8px;">
            <strong style="color:#00d4ff;font-size:12px;display:block;margin-bottom:4px">${res.name}</strong>
            <span style="color:#6b8cae;font-size:10px;display:block;">Type: ${res.type.charAt(0).toUpperCase() + res.type.slice(1)}</span>
            <span style="color:#30d158;font-weight:700;font-size:10px;display:block;margin-top:2px">Status: ${res.status}</span>
          </div>
        `)
        .addTo(map);

      markersRef.current.push(m);
    });

    // 📡 LIVE LOCATION TRACKING VIA BROWSER GEOLOCATION
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const userCoords: [number, number] = [userLat, userLng];

          const userIcon = L.divIcon({
            html: `
              <div style="position:relative;width:28px;height:28px;">
                <div style="position:absolute;inset:0;border-radius:50%;background:rgba(0,212,255,0.3);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
                <div style="position:relative;width:24px;height:24px;border-radius:50%;background:#00d4ff;border:3px solid #ffffff;box-shadow:0 0 15px #00d4ff;display:flex;align-items:center;justify-content:center;color:#000;font-weight:bold;font-size:10px;">📍</div>
              </div>
            `,
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const userMarker = L.marker(userCoords, { icon: userIcon })
            .bindPopup(`
              <div style="padding:8px;background:rgba(10,25,47,0.95);color:#fff;border-radius:8px;text-align:center">
                <strong style="color:#00d4ff;font-size:13px;display:block">Your Live Location</strong>
                <span style="font-size:10px;color:#6b8cae">Lat: ${userLat.toFixed(4)}, Lon: ${userLng.toFixed(4)}</span>
              </div>
            `)
            .addTo(map);

          markersRef.current.push(userMarker);
        },
        (err) => {
          console.warn('Geolocation permission denied or unavailable:', err.message);
        },
        { enableHighAccuracy: true }
      );
    }

    // Draw zones
    zones.forEach(zone => {
      const colors = RISK_COLORS[zone.risk];
      const isSelected = selected?.id === zone.id;

      const poly = L.polygon(zone.coordinates, {
        color: 'transparent',
        fillColor: 'transparent',
        fillOpacity: 0,
        weight: 0,
      });

      // Popup
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
          <div style="font-size:10px;color:#3d5a7a;margin-top:4px">Updated ${zone.lastUpdated}</div>
        </div>
      `, { maxWidth: 280 });

      poly.on('click', () => onSelect(zone));
      poly.addTo(map);
      polygonsRef.current.push(poly);

      // Map risk to mock percentage
      let riskPct = 40;
      if (zone.risk === 'high') {
        riskPct = Math.min(99, Math.round(75 + (zone.waterDepth % 25)));
      } else if (zone.risk === 'medium') {
        riskPct = Math.round(50 + (zone.waterDepth % 15));
      } else {
        riskPct = Math.round(20 + (zone.waterDepth % 20));
      }

      // Permanent status badge replaced with clean smooth polygon hover popups
      poly.bindTooltip(
        `<div style="font-size:11px;font-weight:700;color:#fff;display:flex;align-items:center;gap:4px">
          <span>${zone.risk === 'high' ? '🚨' : zone.risk === 'medium' ? '⚠️' : '✅'}</span>
          <span>${zone.name}: ${riskPct}% Risk</span>
        </div>`,
        {
          permanent: false,
          sticky: true,
          direction: 'top',
          className: `custom-zone-tooltip tooltip-${zone.risk}`,
        }
      );

      // Pulse marker for high risk
      if (zone.risk === 'high') {
        const pulseIcon = L.divIcon({
          html: `<div style="width:20px;height:20px;border-radius:50%;background:rgba(255,59,48,0.8);border:2px solid #ff3b30;box-shadow:0 0 0 6px rgba(255,59,48,0.3);animation:pulse-danger 2s infinite"></div>`,
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        const mPulse = L.marker(zone.center, { icon: pulseIcon }).addTo(map);
        markersRef.current.push(mPulse);
      }
    });

    // Fly to selected
    if (selected && map) {
      map.flyTo(selected.center, 14, { duration: 0.8 });
    }

    return () => {};
  }, [zones, selected, onSelect]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }} />;
}
