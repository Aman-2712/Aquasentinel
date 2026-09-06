'use client';
import { useState } from 'react';
import { useFloodData } from '@/context/FloodDataContext';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/dashboard/dashboard.module.css';
import {
  ShieldAlert,
  Megaphone,
  Radio,
  Sliders,
  Send,
  CheckCircle,
  AlertTriangle,
  Users,
  Activity,
  Droplets,
  LifeBuoy,
  PhoneCall,
  Server,
  Lock,
  Building2,
  Check,
} from 'lucide-react';
import AuthorityAlertDispatcher from '@/components/authority/AuthorityAlertDispatcher';
import dynamic from 'next/dynamic';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { ssr: false });

type AuthorityTab = 'broadcast' | 'dams' | 'sensors' | 'sos_dispatch' | 'resources';

interface SOSItem {
  id: string;
  name: string;
  phone: string;
  location: string;
  coords: string;
  time: string;
  status: 'pending' | 'dispatched' | 'resolved';
  assignedTeam?: string;
}

const MOCK_SOS_REPORTS: SOSItem[] = [
  { id: 'sos-101', name: 'Ravi Teja', phone: '+91 98480 12345', location: 'Poorna Market Main Street', coords: '17.7041° N, 83.2977° E', time: '4 mins ago', status: 'pending' },
  { id: 'sos-102', name: 'Srinivas Rao', phone: '+91 97001 98765', location: 'Gajuwaka Industrial Underpass', coords: '17.6868° N, 83.2185° E', time: '12 mins ago', status: 'dispatched', assignedTeam: 'NDRF Team Alpha (Boat 4)' },
  { id: 'sos-103', name: 'Lakshmi Devi', phone: '+91 91234 56789', location: 'Gopalapatnam Railway Colony', coords: '17.7400° N, 83.2300° E', time: '25 mins ago', status: 'resolved', assignedTeam: 'SDRF Unit 2' },
];

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const { zones } = useFloodData();
  const [activeTab, setActiveTab] = useState<AuthorityTab>('broadcast');
  const [sosList, setSosList] = useState<SOSItem[]>(MOCK_SOS_REPORTS);
  const [damLevels, setDamLevels] = useState([
    { id: 'd1', name: 'Meghadrigeddha Reservoir', capacity: 88, dischargeRate: 450, status: 'Warning', sluiceGate: 60 },
    { id: 'd2', name: 'Thatipudi Reservoir', capacity: 74, dischargeRate: 220, status: 'Normal', sluiceGate: 35 },
    { id: 'd3', name: 'Raiwada Reservoir', capacity: 92, dischargeRate: 680, status: 'Critical', sluiceGate: 85 },
  ]);

  if (user?.role !== 'authority') {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <div style={{
          width: 70,
          height: 70,
          borderRadius: 20,
          background: 'rgba(255,68,68,0.15)',
          border: '2px solid #ff4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ff4444',
          marginBottom: '1.25rem',
        }}>
          <Lock size={32} />
        </div>
        <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
          Restricted Government Portal
        </h2>
        <p style={{ color: 'var(--clr-text-muted)', maxWidth: 460, fontSize: '0.9rem', lineHeight: 1.5 }}>
          Access to the Authority Command Center is strictly limited to authorized disaster response officials and municipal administration.
        </p>
      </div>
    );
  }

  const handleDispatchSOS = (id: string, team: string) => {
    setSosList(prev => prev.map(s => s.id === id ? { ...s, status: 'dispatched', assignedTeam: team } : s));
  };

  const handleUpdateGate = (id: string, newVal: number) => {
    setDamLevels(prev => prev.map(d => d.id === id ? { ...d, sluiceGate: newVal } : d));
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Authority Command Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(35, 10, 15, 0.95), rgba(15, 5, 8, 0.98))',
        border: '1px solid rgba(255, 68, 68, 0.4)',
        borderRadius: '20px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 8px 30px rgba(255, 68, 68, 0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #ff4444, #cc0000)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(255,68,68,0.4)',
            }}>
              <ShieldAlert size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff', fontWeight: 800 }}>
                  Visakhapatnam Municipal Command Center
                </h1>
                <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>
                  🏛️ OFFICIAL DISASTER AUTHORITY
                </span>
              </div>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                Officer: <strong style={{ color: '#fff' }}>{user.name}</strong> • Unified Flood Control, Dam Sluice Gates &amp; Rescue Dispatch
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'block' }}>System Status</span>
              <strong style={{ fontSize: '0.9rem', color: '#00ff88' }}>● ALL 47 SENSORS ONLINE</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Authority Control Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.55rem',
        borderBottom: '1px solid rgba(255, 68, 68, 0.25)',
        paddingBottom: '0.65rem',
        overflowX: 'auto',
      }}>
        <button
          type="button"
          className={`btn ${activeTab === 'broadcast' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('broadcast')}
          style={{ fontSize: '0.85rem', borderColor: activeTab === 'broadcast' ? '#ff4444' : undefined, background: activeTab === 'broadcast' ? 'linear-gradient(135deg, #ff4444, #cc0000)' : undefined }}
        >
          <Megaphone size={15} />
          <span>Emergency Broadcasts</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'dams' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('dams')}
          style={{ fontSize: '0.85rem' }}
        >
          <Droplets size={15} />
          <span>Reservoir &amp; Sluice Control</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'sos_dispatch' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('sos_dispatch')}
          style={{ fontSize: '0.85rem' }}
        >
          <LifeBuoy size={15} />
          <span>Citizen SOS Dispatch ({sosList.filter(s => s.status === 'pending').length} Pending)</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'sensors' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('sensors')}
          style={{ fontSize: '0.85rem' }}
        >
          <Server size={15} />
          <span>Regional Sensor Grid</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'resources' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('resources')}
          style={{ fontSize: '0.85rem' }}
        >
          <Building2 size={15} />
          <span>Disaster Resources</span>
        </button>
      </div>

      {/* Tab 1: Broadcast Dispatcher */}
      {activeTab === 'broadcast' && (
        <AuthorityAlertDispatcher />
      )}

      {/* Tab 2: Reservoir & Sluice Gate Water Control */}
      {activeTab === 'dams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="grid-3" style={{ gap: '1.25rem' }}>
            {damLevels.map(dam => (
              <div key={dam.id} className="card" style={{ border: `1px solid ${dam.status === 'Critical' ? '#ff4444' : dam.status === 'Warning' ? '#ffaa00' : 'rgba(0, 214, 255, 0.3)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#fff', fontSize: '1rem' }}>{dam.name}</strong>
                  <span className={`badge ${dam.status === 'Critical' ? 'badge-danger' : dam.status === 'Warning' ? 'badge-warning' : 'badge-safe'}`}>
                    {dam.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--clr-text-muted)', marginBottom: '0.35rem' }}>
                    <span>Capacity Filled:</span>
                    <strong style={{ color: dam.capacity > 85 ? '#ff4444' : '#fff' }}>{dam.capacity}%</strong>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${dam.capacity}%`, background: dam.capacity > 85 ? '#ff4444' : '#00d4ff', transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                <div style={{ fontSize: '0.825rem', color: 'var(--clr-text-muted)', marginBottom: '1rem' }}>
                  Discharge Rate: <strong style={{ color: '#fff' }}>{dam.dischargeRate} cusecs</strong>
                </div>

                {/* Sluice Gate Control Slider */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fff', marginBottom: '0.5rem' }}>
                    <span>Sluice Gate Opening:</span>
                    <strong style={{ color: '#00d4ff' }}>{dam.sluiceGate}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={dam.sluiceGate}
                    onChange={e => handleUpdateGate(dam.id, parseInt(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginTop: '0.25rem' }}>
                    <span>0% (Closed)</span>
                    <span>100% (Full Spillway)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Citizen SOS Rescue Operations */}
      {activeTab === 'sos_dispatch' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LifeBuoy size={20} color="#ff4444" />
              Incoming Emergency SOS Distress Feeds
            </h3>
            <span className="badge badge-danger">{sosList.filter(s => s.status === 'pending').length} Action Required</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sosList.map(sos => (
              <div
                key={sos.id}
                style={{
                  padding: '1.1rem',
                  borderRadius: '14px',
                  background: 'rgba(15, 25, 40, 0.7)',
                  border: `1px solid ${sos.status === 'pending' ? '#ff4444' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{sos.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#00d4ff' }}>{sos.phone}</span>
                    <span className={`badge ${sos.status === 'pending' ? 'badge-danger' : sos.status === 'dispatched' ? 'badge-warning' : 'badge-safe'}`}>
                      {sos.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                    📍 Location: {sos.location} • GPS Coords: <code style={{ color: '#ffea00' }}>{sos.coords}</code>
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                    Time Received: {sos.time} {sos.assignedTeam && `• Assigned: ${sos.assignedTeam}`}
                  </span>
                </div>

                {sos.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ background: 'linear-gradient(135deg, #ff4444, #cc0000)', fontSize: '0.8rem' }}
                      onClick={() => handleDispatchSOS(sos.id, 'NDRF Rescue Unit 1')}
                    >
                      Dispatch NDRF Boat Team
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem' }}
                      onClick={() => handleDispatchSOS(sos.id, 'SDRF Rapid Unit')}
                    >
                      Dispatch SDRF
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Regional Sensor Grid */}
      {activeTab === 'sensors' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', background: 'rgba(5, 12, 24, 0.9)', borderBottom: '1px solid rgba(255,68,68,0.2)' }}>
            <strong style={{ color: '#fff' }}>47 Visakhapatnam Real-Time Telemetry Sensor Grid</strong>
          </div>
          <div style={{ height: '480px', width: '100%' }}>
            <FloodMap zones={zones} />
          </div>
        </div>
      )}

      {/* Tab 5: Disaster Resources */}
      {activeTab === 'resources' && (
        <div className="grid-3" style={{ gap: '1.25rem' }}>
          <div className="card">
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>Evacuation Relief Shelters</h4>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#00ff88' }}>14 Active</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', margin: '0.5rem 0 0 0' }}>
              Capacity: 12,500 citizens • Current Occupancy: 1,840
            </p>
          </div>

          <div className="card">
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>Motorized Lifeboats</h4>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#00d4ff' }}>32 Deployed</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', margin: '0.5rem 0 0 0' }}>
              NDRF + SDRF Combined Fleet
            </p>
          </div>

          <div className="card">
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>High-Capacity De-watering Pumps</h4>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffea00' }}>48 Units</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', margin: '0.5rem 0 0 0' }}>
              Active at Poorna Market &amp; Gajuwaka Basins
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
