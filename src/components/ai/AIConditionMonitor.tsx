'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFloodData } from '@/context/FloodDataContext';
import { Bot, Mail, CheckCircle2, AlertOctagon, X, Sparkles, ShieldAlert, Cpu } from 'lucide-react';

export default function AIConditionMonitor() {
  const { user } = useAuth();
  const { weatherData, xgboostPrediction, weatherMode, isSimulationActive } = useFloodData();
  const [activeNotification, setActiveNotification] = useState<{
    id: string;
    sector: string;
    subject: string;
    recipients: string[];
    timestamp: string;
    riskScore: number;
    rainfall: number;
    actionSummary: string;
  } | null>(null);

  const lastDispatchedRef = useRef<string>('');
  const [isDispatching, setIsDispatching] = useState(false);

  useEffect(() => {
    // Condition check: Cloudburst / Heavy rain / Flash flood / XGBoost High Risk
    const isCritical =
      weatherData.current.rainfall >= 35 ||
      xgboostPrediction.riskScore >= 70 ||
      weatherMode === 'flash_flood' ||
      isSimulationActive;

    const eventKey = `${weatherMode}-${Math.round(weatherData.current.rainfall / 15)}-${user?.role || 'citizen'}-${user?.hasAgriLand ? 'land' : 'noland'}`;

    if (isCritical && lastDispatchedRef.current !== eventKey && !isDispatching) {
      lastDispatchedRef.current = eventKey;
      setIsDispatching(true);

      const sector = user?.role || 'citizen';
      const hasAgriLand = user?.hasAgriLand ?? false;
      const userName = user?.name || 'AquaSentinel Member';
      const userEmail = user?.email || '';

      fetch('/api/send-emergency-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: userEmail,
          userName,
          sector,
          hasAgriLand,
          area: 'Visakhapatnam Metropolitan & Coastal Catchment',
          weatherCondition: weatherData.current.condition || 'Severe Cloudburst & Storm Surge',
          rainfall: weatherData.current.rainfall,
          riskScore: xgboostPrediction.riskScore,
          soilMoisture: Math.round(weatherData.current.soilMoisture * 100),
          isSimulation: isSimulationActive || weatherMode === 'flash_flood',
        }),
      })
        .then(res => res.json())
        .then(data => {
          setIsDispatching(false);
          if (data.success) {
            let actionSummary = 'Citizen flood defense protocol and passable routes broadcast.';
            if (sector === 'farmer') {
              actionSummary = hasAgriLand
                ? 'Agricultural crop preservation directive & FieldShield sluice gate alert dispatched.'
                : 'Rural storm precautions and livestock shelter advisory dispatched.';
            } else if (sector === 'authority') {
              actionSummary = 'District command telemetry & inundation breakdown dispatched.';
            }

            setActiveNotification({
              id: `alert-${Date.now()}`,
              sector,
              subject: data.subject || 'Emergency Weather Warning',
              recipients: data.recipients || ['aquasentinelfis@gmail.com'],
              timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              riskScore: xgboostPrediction.riskScore,
              rainfall: weatherData.current.rainfall,
              actionSummary,
            });

            // Auto-hide notification after 10s
            setTimeout(() => {
              setActiveNotification(prev => (prev?.id ? null : prev));
            }, 10000);
          }
        })
        .catch(err => {
          setIsDispatching(false);
          console.error('Autonomous AI Dispatch Failed:', err);
        });
    }
  }, [
    weatherData.current.rainfall,
    xgboostPrediction.riskScore,
    weatherMode,
    isSimulationActive,
    user?.role,
    user?.hasAgriLand,
    user?.name,
    user?.email,
    isDispatching,
  ]);

  if (!activeNotification) return null;

  const isHighRisk = activeNotification.riskScore >= 70;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        maxWidth: '430px',
        width: 'calc(100vw - 48px)',
        background: 'rgba(8, 16, 28, 0.96)',
        backdropFilter: 'blur(20px)',
        border: `1.5px solid ${isHighRisk ? '#ff4444' : '#00d6ff'}`,
        borderRadius: '16px',
        boxShadow: `0 16px 48px rgba(0, 0, 0, 0.7), 0 0 24px ${isHighRisk ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 214, 255, 0.25)'}`,
        padding: '1.1rem',
        color: '#fff',
        animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: isHighRisk ? 'rgba(255, 68, 68, 0.2)' : 'rgba(0, 214, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isHighRisk ? '#ff4444' : '#00d6ff',
            }}
          >
            <Bot size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#fff' }}>AI Sentinel Climate Guardian</strong>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: isHighRisk ? '#ff4444' : '#00ff88',
                  color: isHighRisk ? '#fff' : '#000',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                AUTONOMOUS DISPATCH
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)' }}>
              XGBoost Risk: {activeNotification.riskScore}% • {activeNotification.rainfall}mm/h
            </span>
          </div>
        </div>
        <button
          onClick={() => setActiveNotification(null)}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
        >
          <X size={16} />
        </button>
      </div>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '10px',
          padding: '0.75rem',
          borderLeft: `3px solid ${isHighRisk ? '#ff4444' : '#00ff88'}`,
          marginBottom: '0.65rem',
        }}
      >
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.25rem' }}>
          {activeNotification.subject}
        </div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
          {activeNotification.actionSummary}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Mail size={13} color="#00ff88" />
          <span>Dispatched to: <strong>{activeNotification.recipients.join(', ')}</strong></span>
        </div>
        <span>{activeNotification.timestamp}</span>
      </div>
    </div>
  );
}
