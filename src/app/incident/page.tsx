'use client';
import { useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { VISAKHAPATNAM_ZONES } from '@/data/visakhapatnam_zones';
import { FileText, CheckCircle, Loader, MapPin, Camera, AlertTriangle } from 'lucide-react';
import styles from './incident.module.css';

const INCIDENT_TYPES = ['Road Flooding', 'Waterlogging', 'Drainage Overflow', 'Building Damage', 'People Trapped', 'Animal Rescue', 'Other'];
const SEVERITY = ['Low – Minor inconvenience', 'Medium – Needs attention', 'High – Immediate help needed', 'Critical – Life threatening'];

interface Incident { id: string; area: string; type: string; severity: string; desc: string; time: string; status: 'pending' | 'in-progress' | 'resolved'; }

const MOCK_INCIDENTS: Incident[] = [
  { id: 'i1', area: 'Poorna Market', type: 'Road Flooding', severity: 'Critical', desc: 'Main road submerged. 20+ vehicles stuck. Immediate rescue needed.', time: '8 min ago', status: 'in-progress' },
  { id: 'i2', area: 'Gajuwaka', type: 'People Trapped', severity: 'High', desc: 'Family of 4 trapped on second floor. Water level rising.', time: '15 min ago', status: 'in-progress' },
  { id: 'i3', area: 'MVP Colony', type: 'Drainage Overflow', severity: 'Medium', desc: 'Storm drain overflowing near sector 5. Road partially blocked.', time: '30 min ago', status: 'pending' },
  { id: 'i4', area: 'PM Palem', type: 'Waterlogging', severity: 'Low', desc: 'Minor waterlogging near bus stand. Passable on foot.', time: '1 hr ago', status: 'resolved' },
];

export default function IncidentPage() {
  const [area, setArea] = useState('');
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('');
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!area || !type || !severity || !desc) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    const newIncident: Incident = { id: `i${Date.now()}`, area, type, severity: severity.split(' – ')[0], desc, time: 'just now', status: 'pending' };
    setIncidents(prev => [newIncident, ...prev]);
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => { setSubmitted(false); setArea(''); setType(''); setSeverity(''); setDesc(''); }, 3000);
  };

  return (
    <ProtectedLayout>
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Incident Reporting</h1>
            <p className="page-subtitle">Report flood incidents to help emergency teams respond faster.</p>
          </div>

          <div className={styles.layout}>
            {/* Form */}
            <div className="card">
              <h2 className={styles.formTitle}><FileText size={16} /> Report a Flood Incident</h2>
              {submitted ? (
                <div className={styles.successMsg}>
                  <CheckCircle size={32} />
                  <p>Incident reported! Emergency teams have been notified.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className="form-group">
                    <label className="form-label">Affected Area</label>
                    <select className="form-input" value={area} onChange={e => setArea(e.target.value)} required>
                      <option value="">Select area</option>
                      {VISAKHAPATNAM_ZONES.map(z => <option key={z.id}>{z.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Incident Type</label>
                    <select className="form-input" value={type} onChange={e => setType(e.target.value)} required>
                      <option value="">Select type</option>
                      {INCIDENT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Severity Level</label>
                    <div className={styles.severityGrid}>
                      {SEVERITY.map(s => (
                        <button key={s} type="button" className={`${styles.severityBtn} ${severity === s ? styles.severityActive : ''} ${s.startsWith('Critical') ? styles.sevCrit : s.startsWith('High') ? styles.sevHigh : s.startsWith('Medium') ? styles.sevMed : styles.sevLow}`} onClick={() => setSeverity(s)}>
                          {s.split(' – ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows={4} placeholder="Describe the situation: water level, people affected, urgent needs..." value={desc} onChange={e => setDesc(e.target.value)} required style={{ resize: 'vertical' }} />
                  </div>
                  <div className={styles.photoNote}>
                    <Camera size={14} />
                    <span>Photo upload coming soon. Please describe visually in the text.</span>
                  </div>
                  <button type="submit" className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                    {submitting ? <><Loader size={16} className={styles.spin} /> Submitting...</> : <><AlertTriangle size={16} /> Submit Emergency Report</>}
                  </button>
                </form>
              )}
            </div>

            {/* Incidents List */}
            <div>
              <h2 className={styles.listTitle}>Recent Incidents</h2>
              <div className={styles.incidentList}>
                {incidents.map(inc => (
                  <div key={inc.id} className={`card ${styles.incidentCard}`}>
                    <div className={styles.incidentHeader}>
                      <div>
                        <span className={styles.incidentArea}><MapPin size={12} />{inc.area}</span>
                        <span className={styles.incidentType}>{inc.type}</span>
                      </div>
                      <div className={styles.incidentRight}>
                        <span className={`badge ${inc.severity === 'Critical' || inc.severity === 'High' ? 'badge-danger' : inc.severity === 'Medium' ? 'badge-warning' : 'badge-safe'}`}>{inc.severity}</span>
                        <span className={`${styles.statusBadge} ${styles[`status_${inc.status.replace('-', '')}`]}`}>{inc.status}</span>
                      </div>
                    </div>
                    <p className={styles.incidentDesc}>{inc.desc}</p>
                    <span className={styles.incidentTime}>{inc.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    </ProtectedLayout>
  );
}
