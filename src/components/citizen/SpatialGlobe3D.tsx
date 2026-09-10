'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Droplets, CloudRain, AlertTriangle, ShieldCheck, Waves, Info, X, Zap } from 'lucide-react';
import styles from './citizenModern.module.css';

export interface GlobePin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  risk: 'high' | 'medium' | 'low';
  category: 'reservoir' | 'market' | 'industrial' | 'coast' | 'corridor' | 'user';
  depthCm: number;
  rainfall: string;
  condition: string;
  status: string;
  iconBg: string;
}

const DEFAULT_PINS: GlobePin[] = [
  {
    id: 'pin-1',
    name: 'Poorna Market Drainage Basin',
    lat: 17.6983,
    lng: 83.2984,
    risk: 'high',
    category: 'market',
    depthCm: 52,
    rainfall: '46.2 mm/h',
    condition: 'Torrential Cloudburst Inflow',
    status: 'Sluice Gates Raised (100%)',
    iconBg: '#ef4444',
  },
  {
    id: 'pin-2',
    name: 'Gajuwaka Industrial Corridor',
    lat: 17.6867,
    lng: 83.2095,
    risk: 'medium',
    category: 'industrial',
    depthCm: 28,
    rainfall: '24.8 mm/h',
    condition: 'Moderate Waterlogging',
    status: 'Storm Drainage Energized',
    iconBg: '#f59e0b',
  },
  {
    id: 'pin-3',
    name: 'Meghadrigedda Reservoir & Spillway',
    lat: 17.7642,
    lng: 83.2201,
    risk: 'high',
    category: 'reservoir',
    depthCm: 84,
    rainfall: '52.0 mm/h',
    condition: 'High Water Influx',
    status: 'Automated Spillway Open',
    iconBg: '#7c3aed',
  },
  {
    id: 'pin-4',
    name: 'Rushikonda Coastal Promenade',
    lat: 17.7889,
    lng: 83.3765,
    risk: 'low',
    category: 'coast',
    depthCm: 6,
    rainfall: '8.4 mm/h',
    condition: 'Light Coastal Surge',
    status: 'Passable Safe Zone',
    iconBg: '#10b981',
  },
  {
    id: 'pin-5',
    name: 'Madhurawada Elevated IT Corridor',
    lat: 17.7898,
    lng: 83.3551,
    risk: 'low',
    category: 'corridor',
    depthCm: 0,
    rainfall: '4.1 mm/h',
    condition: 'Optimal Drainage',
    status: 'Designated Safe Evacuation Route',
    iconBg: '#06b6d4',
  },
];

interface SpatialGlobe3DProps {
  onSelectPin?: (pin: GlobePin) => void;
  onSwitchToGisMap?: () => void;
}

export default function SpatialGlobe3D({ onSelectPin, onSwitchToGisMap }: SpatialGlobe3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState({ lat: 17.7, lng: 83.3 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activePin, setActivePin] = useState<GlobePin | null>(DEFAULT_PINS[0]);
  const [userLiveCoords, setUserLiveCoords] = useState<{ lat: number; lng: number } | null>({ lat: 17.728, lng: 83.315 });
  const [isLocating, setIsLocating] = useState(false);
  const [pins, setPins] = useState<GlobePin[]>(DEFAULT_PINS);

  // Locate User via Geolocation
  const handleLocateUser = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setUserLiveCoords({ lat: uLat, lng: uLng });
        setRotation({ lat: uLat, lng: uLng });

        const userPin: GlobePin = {
          id: 'pin-user-live',
          name: 'Your Live Location (GPS)',
          lat: uLat,
          lng: uLng,
          risk: 'low',
          category: 'user',
          depthCm: 0,
          rainfall: 'Live Telemetry Active',
          condition: 'GPS Geolocation Calibrated',
          status: 'Direct Mesh Connected',
          iconBg: '#00d4ff',
        };

        setPins(prev => [userPin, ...prev.filter(p => p.id !== 'pin-user-live')]);
        setActivePin(userPin);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation denied, using default Visakhapatnam coordinates:', err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // Canvas 3D Globe Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let autoRotateAngle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.42;

      // Outer Atmospheric Rings matching reference image
      const ringGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.35);
      ringGrad.addColorStop(0, 'rgba(238, 242, 255, 0)');
      ringGrad.addColorStop(0.7, 'rgba(224, 231, 255, 0.45)');
      ringGrad.addColorStop(1, 'rgba(238, 242, 255, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = ringGrad;
      ctx.fill();

      // Outer Thin Orbital Ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.18, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(199, 210, 254, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Second Orbital Ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.06, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(224, 231, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sphere Base Gradient (Pure White Relief Shading)
      const sphereGrad = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, radius * 0.1, cx, cy, radius);
      sphereGrad.addColorStop(0, '#ffffff');
      sphereGrad.addColorStop(0.45, '#f8fafc');
      sphereGrad.addColorStop(0.8, '#e2e8f0');
      sphereGrad.addColorStop(1, '#cbd5e1');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.shadowColor = 'rgba(99, 102, 241, 0.12)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 15;
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Draw Topographic Relief Landmasses & Grid (Matching reference relief texture)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // Parallels (Latitude lines)
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
      ctx.lineWidth = 0.75;
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = cy + (lat / 90) * radius * 0.85;
        const w = Math.sqrt(Math.max(0, radius * radius - Math.pow(y - cy, 2)));
        ctx.beginPath();
        ctx.ellipse(cx, y, w, radius * 0.2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Meridians (Longitude lines with smooth rotation)
      const currentLngOffset = (rotation.lng + autoRotateAngle) % 360;
      for (let lng = 0; lng < 360; lng += 30) {
        const rad = ((lng - currentLngOffset) * Math.PI) / 180;
        const xOffset = Math.sin(rad) * radius;
        if (Math.cos(rad) > 0) {
          ctx.beginPath();
          ctx.ellipse(cx + xOffset * 0.5, cy, Math.abs(xOffset) * 0.5, radius, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Stylized Topographic Continents Relief Shader
      const landPoints = [
        // Asian Subcontinent & Coastal Bay of Bengal relief
        { x: 0.1, y: -0.15, r: 0.38, bumps: 8 },
        { x: -0.25, y: -0.3, r: 0.35, bumps: 6 },
        { x: 0.35, y: 0.1, r: 0.28, bumps: 7 },
        { x: -0.15, y: 0.25, r: 0.32, bumps: 5 },
        { x: 0.05, y: 0.35, r: 0.22, bumps: 4 },
      ];

      landPoints.forEach((land, idx) => {
        const lx = cx + land.x * radius + Math.sin((autoRotateAngle + idx * 45) * 0.02) * 10;
        const ly = cy + land.y * radius;
        const lr = land.r * radius;

        const landGrad = ctx.createRadialGradient(lx - lr * 0.2, ly - lr * 0.2, lr * 0.1, lx, ly, lr);
        landGrad.addColorStop(0, '#ffffff');
        landGrad.addColorStop(0.5, '#f1f5f9');
        landGrad.addColorStop(0.85, '#e2e8f0');
        landGrad.addColorStop(1, 'rgba(226, 232, 240, 0)');

        ctx.beginPath();
        ctx.arc(lx, ly, lr, 0, Math.PI * 2);
        ctx.fillStyle = landGrad;
        ctx.fill();

        // Topographic Contour Ridges
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(lx, ly, lr * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      });

      ctx.restore();

      // Soft Specular Highlight Reflection
      const specGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius * 0.5, cy + radius * 0.5);
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      specGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.1)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = specGrad;
      ctx.fill();

      if (!isDragging) {
        autoRotateAngle += 0.08;
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [rotation, isDragging]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotation(prev => ({
      lat: Math.max(-60, Math.min(60, prev.lat - dy * 0.2)),
      lng: (prev.lng - dx * 0.2) % 360,
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Position pins on the Globe Surface based on coordinates
  const pinPositions = [
    { top: '38%', left: '54%', pin: pins[0] }, // Poorna Market
    { top: '56%', left: '36%', pin: pins[1] }, // Gajuwaka
    { top: '24%', left: '46%', pin: pins[2] }, // Meghadrigedda
    { top: '32%', left: '68%', pin: pins[3] }, // Rushikonda
    { top: '64%', left: '62%', pin: pins[4] }, // Madhurawada
  ];

  return (
    <div className={styles.globeViewportContainer}>
      {/* 3D Earth Canvas */}
      <canvas
        ref={canvasRef}
        width={720}
        height={720}
        className={styles.globeCanvas}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Floating Spatial Location Pins Matching Reference Design */}
      <div className={styles.globePinsOverlay}>
        {pinPositions.map(({ top, left, pin }) => {
          if (!pin) return null;
          const isActive = activePin?.id === pin.id;

          return (
            <div
              key={pin.id}
              className={`${styles.spatialPinNode} ${isActive ? styles.spatialPinNodeActive : ''}`}
              style={{ top, left }}
              onClick={() => {
                setActivePin(pin);
                if (onSelectPin) onSelectPin(pin);
              }}
            >
              {/* Ripple Animation Rings */}
              <div className={styles.spatialPinRipple1} style={{ borderColor: pin.iconBg }} />
              <div className={styles.spatialPinRipple2} style={{ borderColor: pin.iconBg }} />

              {/* Pin Bubble Card */}
              <div className={styles.spatialPinBubble} style={{ background: pin.iconBg }}>
                {pin.category === 'user' ? (
                  <MapPin size={15} color="#fff" />
                ) : pin.category === 'reservoir' ? (
                  <Waves size={15} color="#fff" />
                ) : pin.category === 'market' ? (
                  <AlertTriangle size={15} color="#fff" />
                ) : pin.category === 'coast' ? (
                  <Droplets size={15} color="#fff" />
                ) : (
                  <Zap size={15} color="#fff" />
                )}
              </div>

              {/* Pin Hover/Active Tooltip */}
              <div className={styles.spatialPinLabelCard}>
                <div className={styles.spatialPinLabelTitle}>{pin.name}</div>
                <div className={styles.spatialPinLabelSub}>
                  Depth: <strong>{pin.depthCm}cm</strong> • Rain: <strong>{pin.rainfall}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Floating Control Capsule */}
      <div className={styles.globeTopControlsCapsule}>
        <button
          type="button"
          className={styles.globeControlBtn}
          onClick={handleLocateUser}
          title="Track Live GPS Location on 3D Globe"
        >
          <MapPin size={14} color="#6366f1" />
          <span>{isLocating ? 'Locating GPS...' : '📍 Track My Location'}</span>
        </button>

        {onSwitchToGisMap && (
          <button
            type="button"
            className={styles.globeControlBtn}
            onClick={onSwitchToGisMap}
            title="Switch to High-Resolution Doppler Radar Map"
          >
            <Navigation size={14} color="#06b6d4" />
            <span>Live Radar GIS</span>
          </button>
        )}
      </div>

      {/* Active Pin Detailed Glass Modal Card (Bottom Center) */}
      {activePin && (
        <div className={styles.globeActivePinModal}>
          <div className={styles.globeActiveModalHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: activePin.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: `0 4px 12px ${activePin.iconBg}40`,
                }}
              >
                <MapPin size={16} />
              </div>
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#1e1b4b', display: 'block' }}>
                  {activePin.name}
                </strong>
                <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 600 }}>
                  {activePin.status}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActivePin(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          </div>

          <div className={styles.globeModalTelemetryRow}>
            <div className={styles.globeModalMetric}>
              <span className={styles.globeModalMetricLabel}>Water Submersion</span>
              <strong style={{ color: activePin.risk === 'high' ? '#ef4444' : '#10b981' }}>
                {activePin.depthCm} cm
              </strong>
            </div>
            <div className={styles.globeModalMetric}>
              <span className={styles.globeModalMetricLabel}>Rainfall Intensity</span>
              <strong style={{ color: '#06b6d4' }}>{activePin.rainfall}</strong>
            </div>
            <div className={styles.globeModalMetric}>
              <span className={styles.globeModalMetricLabel}>Flood Threat</span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: activePin.risk === 'high' ? '#fef2f2' : '#f0fdf4',
                  color: activePin.risk === 'high' ? '#ef4444' : '#10b981',
                  textTransform: 'uppercase',
                }}
              >
                {activePin.risk} Risk
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
