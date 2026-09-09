'use client';
import { useState } from 'react';
import { Sprout, ShieldCheck, PhoneCall, CheckCircle, ArrowRight, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './onboarding.module.css';

export function FarmerOnboardingModal() {
  const { user, completeFarmerOnboarding } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [hasLand, setHasLand] = useState<boolean | null>(null);
  const [wantShield, setWantShield] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Check localStorage if already completed
  const isPermanentlyOnboarded = typeof window !== 'undefined' && localStorage.getItem('aquasentinel_farmer_onboarded') === 'true';

  if (dismissed || isPermanentlyOnboarded || !user || user.role !== 'farmer' || user.onboardingCompleted) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aquasentinel_farmer_onboarded', 'true');
    }
    completeFarmerOnboarding(true, true);
  };

  const handleStep1 = (hasAgriLand: boolean) => {
    setHasLand(hasAgriLand);
    if (hasAgriLand) {
      setStep(2);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('aquasentinel_farmer_onboarded', 'true');
      }
      completeFarmerOnboarding(false, false);
    }
  };

  const handleStep2 = (shieldReq: boolean) => {
    setWantShield(shieldReq);
    if (shieldReq) {
      setStep(3);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('aquasentinel_farmer_onboarded', 'true');
      }
      completeFarmerOnboarding(true, false);
    }
  };

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aquasentinel_farmer_onboarded', 'true');
    }
    completeFarmerOnboarding(true, true);
    setDismissed(true);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ position: 'relative' }}>
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            zIndex: 10,
          }}
          title="Dismiss and do not show again"
        >
          <X size={18} />
        </button>
        <div className={styles.header}>
          <div className={styles.badgeIcon}>
            <Sprout size={24} />
          </div>
          <div>
            <h2 className={styles.modalTitle}>Farmer Onboarding</h2>
            <p className={styles.modalSub}>Configure your agricultural protection profile</p>
          </div>
        </div>

        {/* Progress Dots */}
        <div className={styles.progressRow}>
          <div className={`${styles.dot} ${step >= 1 ? styles.dotActive : ''}`}>1</div>
          <div className={styles.line} />
          <div className={`${styles.dot} ${step >= 2 ? styles.dotActive : ''}`}>2</div>
          <div className={styles.line} />
          <div className={`${styles.dot} ${step >= 3 ? styles.dotActive : ''}`}>3</div>
        </div>

        {step === 1 && (
          <div className={styles.stepBody}>
            <h3 className={styles.question}>Do you have agricultural land?</h3>
            <p className={styles.desc}>
              AquaSentinel provides automated IoT barrier controls and soil saturation intelligence specifically designed for crop fields.
            </p>

            <div className={styles.optionsGrid}>
              <button
                type="button"
                className={styles.optionBtn}
                onClick={() => handleStep1(true)}
              >
                <div className={styles.optionIcon}><Sprout size={24} /></div>
                <div>
                  <strong>Yes, I own or lease agricultural land</strong>
                  <span>Enable precision crop flood risk analytics and FieldShield hardware integration</span>
                </div>
                <ArrowRight size={18} className={styles.arrow} />
              </button>

              <button
                type="button"
                className={`${styles.optionBtn} ${styles.optionSecondary}`}
                onClick={() => handleStep1(false)}
              >
                <div>
                  <strong>No, I am a regular resident</strong>
                  <span>Proceed to general citizen flood warnings and safe route evacuation map</span>
                </div>
                <ArrowRight size={18} className={styles.arrow} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepBody}>
            <h3 className={styles.question}>Do you want FieldShield flood protection for your land?</h3>
            <p className={styles.desc}>
              FieldShield automatically deploys hydraulic flood gates and activates field drainage pumps whenever cloudburst rain is predicted by XGBoost.
            </p>

            <div className={styles.optionsGrid}>
              <button
                type="button"
                className={`${styles.optionBtn} ${styles.optionHighlight}`}
                onClick={() => handleStep2(true)}
              >
                <div className={styles.optionIcon}><ShieldCheck size={24} /></div>
                <div>
                  <strong>Yes! Request FieldShield Hardware Deployment</strong>
                  <span>Get automated sluice gate controls, barrier actuation, and priority ground support</span>
                </div>
                <ArrowRight size={18} className={styles.arrow} />
              </button>

              <button
                type="button"
                className={`${styles.optionBtn} ${styles.optionSecondary}`}
                onClick={() => handleStep2(false)}
              >
                <div>
                  <strong>No, weather forecast & alerts only</strong>
                  <span>View weather models without hardware auto-defense integration</span>
                </div>
                <ArrowRight size={18} className={styles.arrow} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.stepBody} style={{ textAlign: 'center' }}>
            <div className={styles.successIconWrap}>
              <CheckCircle size={48} color="#00ff88" />
            </div>

            <h3 className={styles.question} style={{ color: '#00ff88' }}>FieldShield Request Confirmed!</h3>
            <p className={styles.desc} style={{ fontSize: '1rem', color: 'var(--clr-text-main)' }}>
              Our disaster prevention team will contact you soon for field site inspection, sensor placement, and barrier calibration.
            </p>

            <div className={styles.contactCard}>
              <PhoneCall size={20} className={styles.phoneIcon} />
              <div>
                <strong>AquaSentinel Field Protection Dispatch</strong>
                <span>Support Line: 1800-425-SHIELD • Priority Response Active</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', justifyContent: 'center', marginTop: '1rem' }}
              onClick={handleFinish}
            >
              <span>Go to Farmer Dashboard</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
