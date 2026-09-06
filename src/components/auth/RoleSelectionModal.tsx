'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, UserCheck, Sprout, ShieldCheck, ArrowRight, X, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './RoleSelectionModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  actionType?: 'login' | 'signup';
}

export default function RoleSelectionModal({ isOpen, onClose, actionType = 'login' }: Props) {
  const router = useRouter();
  const { switchRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Pre-fetch all target login routes as soon as modal opens for instant navigation
  useEffect(() => {
    if (isOpen) {
      setSelectedRole(null);
      router.prefetch('/citizen/login');
      router.prefetch('/farmer/login');
      router.prefetch('/authority/login');
      router.prefetch('/citizen/dashboard');
      router.prefetch('/farmer/dashboard');
      router.prefetch('/authority/dashboard');
    }
  }, [isOpen, router]);

  if (!isOpen) return null;

  const handleSelectRole = (role: 'citizen' | 'farmer' | 'authority') => {
    setSelectedRole(role);
    const destination = `/${role}/login`;
    onClose();
    router.push(destination);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className={styles.header}>
          <div className={styles.logoBadge}>
            <Droplets size={24} />
          </div>
          <h2 className={styles.title}>Select Your Access Profile</h2>
          <p className={styles.subtitle}>
            Choose your account type to proceed smoothly to {actionType === 'signup' ? 'registration' : 'sign in'}.
          </p>
        </div>

        <div className={styles.roleGrid}>
          {/* Citizen Option */}
          <div 
            className={`${styles.roleCard} ${selectedRole === 'citizen' ? styles.cardSelected : ''}`}
            onClick={() => handleSelectRole('citizen')}
          >
            <div className={`${styles.iconWrap} ${styles.citizenIcon}`}>
              {selectedRole === 'citizen' ? <Loader size={24} className={styles.spin} /> : <UserCheck size={26} />}
            </div>
            <div className={styles.roleContent}>
              <div className={styles.roleHeader}>
                <h3>Citizen</h3>
                <span className={styles.badgeCitizen}>Urban Safety</span>
              </div>
              <p>
                Get instant flood warnings, live inundation maps, safe route guidance, and emergency SOS dispatch.
              </p>
            </div>
            <div className={styles.cardArrow}>
              <ArrowRight size={18} />
            </div>
          </div>

          {/* Farmer Option */}
          <div 
            className={`${styles.roleCard} ${selectedRole === 'farmer' ? styles.cardSelected : ''}`}
            onClick={() => handleSelectRole('farmer')}
          >
            <div className={`${styles.iconWrap} ${styles.farmerIcon}`}>
              {selectedRole === 'farmer' ? <Loader size={24} className={styles.spin} /> : <Sprout size={26} />}
            </div>
            <div className={styles.roleContent}>
              <div className={styles.roleHeader}>
                <h3>Farmer</h3>
                <span className={styles.badgeFarmer}>FieldShield IoT</span>
              </div>
              <p>
                Agricultural field status telemetry, automated flood defense, and remote barrier actuator controls.
              </p>
            </div>
            <div className={styles.cardArrow}>
              <ArrowRight size={18} />
            </div>
          </div>

          {/* Authority Option */}
          <div 
            className={`${styles.roleCard} ${selectedRole === 'authority' ? styles.cardSelected : ''}`}
            onClick={() => handleSelectRole('authority')}
            style={{ borderColor: 'rgba(255, 68, 68, 0.35)', background: selectedRole === 'authority' ? 'rgba(255, 68, 68, 0.2)' : 'rgba(255, 68, 68, 0.05)' }}
          >
            <div className={`${styles.iconWrap}`} style={{ background: 'rgba(255, 68, 68, 0.15)', color: '#ff4444', border: '1px solid rgba(255, 68, 68, 0.3)' }}>
              {selectedRole === 'authority' ? <Loader size={24} className={styles.spin} /> : <ShieldCheck size={26} />}
            </div>
            <div className={styles.roleContent}>
              <div className={styles.roleHeader}>
                <h3>Authority</h3>
                <span className={styles.badgeCitizen} style={{ background: 'rgba(255, 68, 68, 0.2)', color: '#ff6666' }}>Restricted Portal</span>
              </div>
              <p>
                Municipal disaster command center, reservoir sluice gate release, SOS rescue dispatch &amp; emergency broadcasts.
              </p>
            </div>
            <div className={styles.cardArrow} style={{ color: '#ff6666' }}>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
