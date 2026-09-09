'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFloodData } from '@/context/FloodDataContext';
import { Bot, Mail, CheckCircle2, AlertOctagon, X, Sparkles, ShieldAlert, Cpu, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { playEmergencySirenAudio, stopEmergencySirenAudio, getIsSirenAudioPlaying, initAudioUnlock } from '@/utils/sirenAudio';

export default function AIConditionMonitor() {
  const { user } = useAuth();
  const { weatherData, xgboostPrediction, weatherMode, isSimulationActive, broadcastAlerts } = useFloodData();
  const [activeNotification, setActiveNotification] = useState<{
    id: string;
    sector: string;
    subject: string;
    recipients: string[];
    timestamp: string;
    riskScore: number;
    rainfall: number;
    actionSummary: string;
    isSirenAlert?: boolean;
  } | null>(null);

  const [isSirenMuted, setIsSirenMuted] = useState(false);
  const lastDispatchedRef = useRef<string>('');
  const lastPlayedSirenIdRef = useRef<string>('');
  const [isDispatching, setIsDispatching] = useState(false);

  // Initialize browser audio unlocking & cleanup on unmount
  useEffect(() => {
    initAudioUnlock();
    return () => {
      stopEmergencySirenAudio();
    };
  }, []);

  // Check for incoming authority broadcast siren alerts on Farmer & Citizen screens
  useEffect(() => {
    // Only play siren on Farmer and Citizen devices, NEVER on the Authority command center
    if (user?.role === 'authority') return;

    const activeSirenAlert = broadcastAlerts.find(
      b => b.active && b.risk === 'high' && (b.message.includes('SIREN') || b.message.includes('EMERGENCY'))
    );

    if (activeSirenAlert && !isSirenMuted) {
      if (lastPlayedSirenIdRef.current !== activeSirenAlert.id) {
        lastPlayedSirenIdRef.current = activeSirenAlert.id;
        // Play real siren on Farmer / Citizen devices for precisely 2 seconds
        playEmergencySirenAudio(2000);

        setActiveNotification({
          id: `siren-${activeSirenAlert.id}`,
          sector: user?.role || 'citizen',
          subject: '🚨 MASTER DISTRICT EMERGENCY SIREN ACTIVATED',
          recipients: [user?.email || 'Registered Citizen / Farmer Device'],
          timestamp: activeSirenAlert.timestamp || 'Just now',
          riskScore: xgboostPrediction.riskScore || 94,
          rainfall: weatherData.current.rainfall || 48.2,
          actionSummary: activeSirenAlert.message,
          isSirenAlert: true,
        });
      }
    }
  }, [broadcastAlerts, user?.role, isSirenMuted, xgboostPrediction.riskScore, weatherData.current.rainfall]);

  // Autonomous AI weather monitoring and email dispatch
  useEffect(() => {
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

            // Play siren for Farmer / Citizen if high risk for 2 seconds
            if (user?.role !== 'authority' && xgboostPrediction.riskScore >= 75 && !isSirenMuted) {
              playEmergencySirenAudio(2000);
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
              isSirenAlert: user?.role !== 'authority' && xgboostPrediction.riskScore >= 75,
            });

            // Auto-hide notification after 15s if not siren
            if (user?.role === 'authority' || xgboostPrediction.riskScore < 75) {
              setTimeout(() => {
                setActiveNotification(prev => (prev?.id ? null : prev));
              }, 12000);
            }
          }
        })
        .catch(err => {
          setIsDispatching(false);
          console.error('Autonomous AI Dispatch Failed:', err);
        });
    }
  }, [
    weatherData.current.rainfall,
    weatherData.current.condition,
    weatherData.current.soilMoisture,
    xgboostPrediction.riskScore,
    weatherMode,
    isSimulationActive,
    user?.role,
    user?.hasAgriLand,
    user?.name,
    user?.email,
    isDispatching,
    isSirenMuted,
  ]);

  const handleDismissNotification = () => {
    stopEmergencySirenAudio();
    setIsSirenMuted(true);
    setActiveNotification(null);
  };

  const handleMuteSiren = () => {
    stopEmergencySirenAudio();
    setIsSirenMuted(true);
  };

  const handleReplaySiren = () => {
    setIsSirenMuted(false);
    playEmergencySirenAudio(2000);
  };

  if (!activeNotification) return null;

  const isHighRisk = activeNotification.riskScore >= 70 || activeNotification.isSirenAlert;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        maxWidth: '460px',
        width: 'calc(100vw - 48px)',
        background: 'rgba(8, 16, 28, 0.96)',
        backdropFilter: 'blur(20px)',
        border: `1.5px solid ${isHighRisk ? '#ff4444' : '#00d6ff'}`,
        borderRadius: '16px',
        boxShadow: `0 16px 48px rgba(0, 0, 0, 0.7), 0 0 24px ${isHighRisk ? 'rgba(255, 68, 68, 0.4)' : 'rgba(0, 214, 255, 0.25)'}`,
        padding: '1.1rem',
        color: '#fff',
        animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: isHighRisk ? 'rgba(255, 68, 68, 0.25)' : 'rgba(0, 214, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isHighRisk ? '#ff4444' : '#00d6ff',
            }}
          >
            {activeNotification.isSirenAlert ? <Volume2 size={20} className="animate-pulse" /> : <Bot size={18} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#fff' }}>
                {activeNotification.isSirenAlert ? '🚨 EMERGENCY SIREN DISPATCH' : 'AI Sentinel Climate Guardian'}
              </strong>
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
                {activeNotification.isSirenAlert ? '2-SEC SIREN PULSE' : 'AUTONOMOUS'}
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)' }}>
              XGBoost Risk: {activeNotification.riskScore}% • {activeNotification.rainfall}mm/h
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {activeNotification.isSirenAlert && (
            <>
              <button
                type="button"
                onClick={handleReplaySiren}
                title="Replay 2s Siren Sound"
                style={{
                  background: 'rgba(0, 212, 255, 0.2)',
                  border: '1px solid #00d4ff',
                  color: '#00d4ff',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RotateCcw size={11} />
                <span>Replay (2s)</span>
              </button>

              <button
                type="button"
                onClick={handleMuteSiren}
                title="Silence Siren Sound"
                style={{
                  background: 'rgba(255, 68, 68, 0.2)',
                  border: '1px solid #ff4444',
                  color: '#ff4444',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <VolumeX size={12} />
                <span>Silence</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleDismissNotification}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>
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
