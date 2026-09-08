'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, Sprout, User, CheckCircle, ArrowRight, Lock, Mail, Loader, Check } from 'lucide-react';

export function SectorOnboardingModal() {
  const { user, switchRole, completeFarmerOnboarding } = useAuth();
  
  // Steps: 'select-sector' | 'authority-verify' | 'citizen-survey' | 'farmer-survey'
  const [step, setStep] = useState<'select-sector' | 'authority-verify' | 'farmer-survey'>('select-sector');
  
  // Authority Verification
  const [govtId, setGovtId] = useState('');
  const [authError, setAuthError] = useState('');

  // Farmer Survey
  const [hasLand, setHasLand] = useState<boolean | null>(null);
  const [wantProtection, setWantProtection] = useState<boolean | null>(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSuccessMsg, setLeadSuccessMsg] = useState('');

  // If user already completed onboarding, don't display
  if (user && user.onboardingCompleted) {
    return null;
  }

  // Handle Authority Passcode / Govt ID verification
  const handleAuthorityVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const userEmail = (user?.email || '').toLowerCase().trim();
    const isGovEmail = userEmail.endsWith('.gov') || userEmail.endsWith('.gov.in');
    const isWhitelisted = userEmail === 'shaiknadeem271226@gmail.com';
    const isPasscodeValid = govtId.trim() === 'AQ-GOV-2026' || govtId.trim().toUpperCase().startsWith('GOV-');

    if (!isGovEmail && !isWhitelisted && !isPasscodeValid) {
      setAuthError('Access Denied: Please enter a valid Govt ID number or Municipal Clearance Code (AQ-GOV-2026).');
      return;
    }

    switchRole('authority');
  };

  // Handle Citizen choice
  const handleCitizenChoice = () => {
    switchRole('citizen');
  };

  // Handle Farmer Finish
  const handleFarmerSubmit = async () => {
    // Immediately complete onboarding & switch role to proceed to dashboard
    completeFarmerOnboarding(hasLand || false, wantProtection || false);
    switchRole('farmer');

    if (hasLand && wantProtection) {
      try {
        fetch('/api/send-farmer-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmerName: user?.name || 'Farmer Member',
            farmerEmail: user?.email || 'farmer@aquasentinel.io',
            location: 'Visakhapatnam District',
          }),
        }).catch(() => {});
      } catch (e) {}
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 8, 16, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: 'linear-gradient(135deg, rgba(13, 24, 44, 0.95), rgba(7, 15, 30, 0.98))',
        border: '1px solid rgba(0, 214, 255, 0.25)',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        color: '#fff'
      }}>

        {/* Step 1: Select Main Sector */}
        {step === 'select-sector' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                marginBottom: '0.75rem'
              }}>
                <Shield size={26} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Select Your Sector</h2>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                Welcome to AquaSentinel. Choose your operational portal to proceed.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Authority Option */}
              <button
                type="button"
                onClick={() => setStep('authority-verify')}
                style={{
                  padding: '1.25rem 1rem',
                  borderRadius: '16px',
                  background: 'rgba(255, 68, 68, 0.06)',
                  border: '1px solid rgba(255, 68, 68, 0.3)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  color: '#fff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <Shield size={24} color="#ff4444" />
                  <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Govt Verification</span>
                </div>
                <strong style={{ fontSize: '1.05rem', display: 'block' }}>Authority Sector</strong>
                <span style={{ fontSize: '0.775rem', color: 'var(--clr-text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Municipal Disaster Command, Drainage & Dams (No FieldShield)
                </span>
              </button>

              {/* Citizen / Farmer Option */}
              <button
                type="button"
                onClick={() => setStep('farmer-survey')}
                style={{
                  padding: '1.25rem 1rem',
                  borderRadius: '16px',
                  background: 'rgba(0, 214, 255, 0.06)',
                  border: '1px solid rgba(0, 214, 255, 0.3)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  color: '#fff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <User size={24} color="#00d4ff" />
                  <span className="badge badge-safe" style={{ fontSize: '0.65rem' }}>Public & Farmers</span>
                </div>
                <strong style={{ fontSize: '1.05rem', display: 'block' }}>Citizen Sector</strong>
                <span style={{ fontSize: '0.775rem', color: 'var(--clr-text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Public Safety Alerts, Evacuation Routes & Optional FieldShield
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2A: Authority Govt ID Verification */}
        {step === 'authority-verify' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#ff4444', fontWeight: 700, letterSpacing: '0.05em' }}>
                OFFICIAL CLEARANCE VERIFICATION
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.25rem 0' }}>Enter Government Credential</h2>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Please enter your Official Govt ID / Badge Number or Security Passcode to access command telemetry.
              </p>
            </div>

            {authError && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '10px',
                background: 'rgba(255, 68, 68, 0.15)',
                border: '1px solid #ff4444',
                color: '#ff4444',
                fontSize: '0.8rem',
                marginBottom: '1rem'
              }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthorityVerify}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Govt ID / Clearance Passcode *</label>
                <div className="form-input-icon">
                  <Lock size={16} className="icon" color="#ff4444" />
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Enter Govt ID or Passcode (AQ-GOV-2026)"
                    value={govtId}
                    onChange={e => setGovtId(e.target.value)}
                    required
                    style={{ borderColor: 'rgba(255, 68, 68, 0.4)' }}
                  />
                </div>
                <span style={{ fontSize: '0.725rem', color: 'var(--clr-text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  Whitelisted accounts (e.g. shaiknadeem271226@gmail.com) bypass verification.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setStep('select-sector')}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, background: 'linear-gradient(135deg, #ff4444, #cc0000)', borderColor: '#ff4444', justifyContent: 'center' }}
                >
                  <span>Verify & Access Command</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2B: Citizen / Farmer Survey */}
        {step === 'farmer-survey' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#00d4ff', fontWeight: 700, letterSpacing: '0.05em' }}>
                CITIZEN PROFILE SETUP
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.25rem 0' }}>Are you a Farmer or Resident?</h2>
            </div>

            {leadSuccessMsg && (
              <div style={{
                padding: '0.85rem',
                borderRadius: '12px',
                background: 'rgba(0, 255, 136, 0.15)',
                border: '1px solid #00ff88',
                color: '#00ff88',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem'
              }}>
                <CheckCircle size={18} />
                <span>{leadSuccessMsg}</span>
              </div>
            )}

            {/* Sub-choice 1: Citizen vs Farmer */}
            {hasLand === null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setHasLand(true)}
                  style={{
                    padding: '1rem',
                    borderRadius: '14px',
                    background: 'rgba(0, 255, 136, 0.08)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    color: '#fff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Sprout size={22} color="#00ff88" />
                    <div style={{ textAlign: 'left' }}>
                      <strong style={{ fontSize: '0.95rem', display: 'block' }}>I am a Farmer / Agriculture Manager</strong>
                      <span style={{ fontSize: '0.775rem', color: 'var(--clr-text-muted)' }}>I manage agricultural fields & crops</span>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#00ff88" />
                </button>

                <button
                  type="button"
                  onClick={handleCitizenChoice}
                  style={{
                    padding: '1rem',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    color: '#fff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <User size={22} color="#00d4ff" />
                    <div style={{ textAlign: 'left' }}>
                      <strong style={{ fontSize: '0.95rem', display: 'block' }}>I am a General Citizen / Resident</strong>
                      <span style={{ fontSize: '0.775rem', color: 'var(--clr-text-muted)' }}>I need public flood alerts & evacuation routes</span>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#00d4ff" />
                </button>
              </div>
            ) : wantProtection === null ? (
              /* Sub-choice 2: Request FieldShield Protection? */
              <div>
                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Do you need automated FieldShield protection for your crops?
                  </span>
                  <p style={{ fontSize: '0.775rem', color: 'var(--clr-text-muted)', margin: 0 }}>
                    Our team installs hardware sluice barriers & ESP-32 flood telemetry nodes on your farm.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setWantProtection(true)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '12px',
                      background: 'rgba(0, 255, 136, 0.12)',
                      border: '1px solid #00ff88',
                      color: '#00ff88',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    YES, Request Protection
                  </button>

                  <button
                    type="button"
                    onClick={() => setWantProtection(false)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    NO, Just Basic Forecast
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setHasLand(null)}
                  >
                    Back
                  </button>
                </div>
              </div>
            ) : (
              /* Confirmation & Finish */
              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', background: '#00ff88', color: '#000' }}
                  onClick={handleFarmerSubmit}
                  disabled={isSubmittingLead}
                >
                  {isSubmittingLead ? <Loader size={18} className="spin" /> : <><span>Enter Farmer Dashboard</span><ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {hasLand === null && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setStep('select-sector')}
                >
                  Back to Sector Selection
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
