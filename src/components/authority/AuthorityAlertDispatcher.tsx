'use client';
import { useState } from 'react';
import { Megaphone, Send, ShieldAlert, CheckCircle, Bell, History } from 'lucide-react';
import { useFloodData } from '@/context/FloodDataContext';
import type { RiskLevel } from '@/data/visakhapatnam_zones';

export default function AuthorityAlertDispatcher() {
  const { sendAuthorityBroadcast, broadcastAlerts } = useFloodData();
  const [area, setArea] = useState('Visakhapatnam District (All Basins)');
  const [risk, setRisk] = useState<RiskLevel>('high');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendAuthorityBroadcast({
      area,
      risk,
      message: message.trim(),
    });

    setSentSuccess(true);
    setMessage('');
    setTimeout(() => setSentSuccess(false), 3000);
  };

  const applyTemplate = (text: string, level: RiskLevel) => {
    setMessage(text);
    setRisk(level);
  };

  return (
    <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Dispatch Form */}
      <div className="card" style={{ border: '1px solid rgba(255, 68, 68, 0.3)', background: 'rgba(20, 10, 15, 0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #ff4444, #cc0000)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Megaphone size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>Emergency Broadcast Dispatcher</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
              Client-Server Alert Control • Transmits directly to Citizen & Farmer dashboards
            </p>
          </div>
        </div>

        {sentSuccess && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(0, 255, 136, 0.15)',
            border: '1px solid #00ff88',
            color: '#00ff88',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}>
            <CheckCircle size={18} />
            <span>Alert transmitted to all connected citizen terminals & push alert nodes!</span>
          </div>
        )}

        <form onSubmit={handleBroadcast}>
          <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Target Zone / Basin</label>
              <select className="form-input" value={area} onChange={e => setArea(e.target.value)}>
                <option value="Visakhapatnam District (All Basins)">Visakhapatnam District (All Basins)</option>
                <option value="Poorna Market Basin">Poorna Market Basin (Old Town)</option>
                <option value="Gajuwaka Industrial Zone">Gajuwaka Industrial Zone</option>
                <option value="MVP & Coastal Belt">MVP & Coastal Belt</option>
                <option value="Rushikonda Beach Corridor">Rushikonda Beach Corridor</option>
                <option value="Madhurawada IT Corridor">Madhurawada IT Corridor</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Severity Level</label>
              <select className="form-input" value={risk} onChange={e => setRisk(e.target.value as RiskLevel)}>
                <option value="high">HIGH (Red Alert - Evacuate)</option>
                <option value="medium">MEDIUM (Orange Warning)</option>
                <option value="low">LOW (Yellow Advisory)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Broadcast Message</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Enter official disaster advisory message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Preset Quick Templates */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'block', marginBottom: '0.5rem' }}>
              Quick Templates:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => applyTemplate('EMERGENCY: Heavy cloudburst predicted. Move vehicles to elevated ground immediately.', 'high')}
              >
                🚨 Cloudburst Warning
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => applyTemplate('ADVISORY: Municipal sluice gates opening at Gajuwaka basin. Drive with caution.', 'medium')}
              >
                🌊 Sluice Gate Release
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => applyTemplate('HEATWAVE: Extreme surface temperature peak expected today. Hydration advisory active.', 'medium')}
              >
                ☀️ Heatwave Alert
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', background: 'linear-gradient(135deg, #ff4444, #cc0000)', borderColor: '#ff4444', justifyContent: 'center' }}
          >
            <Send size={16} />
            <span>Transmit District Broadcast</span>
          </button>
        </form>
      </div>

      {/* Broadcast Transmission Log */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <History size={18} color="#00d4ff" />
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>Live Transmission Log</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '330px', overflowY: 'auto' }}>
          {broadcastAlerts.length === 0 ? (
            <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>No active broadcasts transmitted.</p>
          ) : (
            broadcastAlerts.map(b => (
              <div
                key={b.id}
                style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  background: 'rgba(10, 20, 35, 0.6)',
                  borderLeft: `4px solid ${b.risk === 'high' ? '#ff4444' : b.risk === 'medium' ? '#ffaa00' : '#00ff88'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>{b.area}</span>
                  <span className={`badge ${b.risk === 'high' ? 'badge-danger' : b.risk === 'medium' ? 'badge-warning' : 'badge-safe'}`}>
                    {b.risk.toUpperCase()}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--clr-text-main)', lineHeight: 1.4 }}>
                  {b.message}
                </p>
                <span style={{ fontSize: '0.725rem', color: 'var(--clr-text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  {b.timestamp} • Sent by {b.sender}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
