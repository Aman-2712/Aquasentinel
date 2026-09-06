'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Droplets, ArrowRight, Loader, UserCheck, Sprout, ShieldCheck, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROLE_DASHBOARD, ROLE_LOGIN, UserRole } from '@/context/AuthContext';
import styles from '@/app/login/auth.module.css';

type Tab = 'email-pass' | 'email-otp';

interface LoginFormProps {
  /** When provided, the role selector is hidden and this role is used. */
  lockedRole?: UserRole;
}

function LoginFormContent({ lockedRole }: LoginFormProps) {
  const { login, loginWithGoogle, sendOTP } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole: UserRole = lockedRole || (searchParams.get('role') as UserRole) || 'citizen';

  const [role, setRole] = useState<UserRole>(initialRole);
  const [tab, setTab] = useState<Tab>('email-pass');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [govPasskey, setGovPasskey] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If locked, always use lockedRole; otherwise read URL param
    if (!lockedRole) {
      const urlRole = searchParams.get('role') as UserRole;
      if (urlRole) setRole(urlRole);
    }
  }, [searchParams, lockedRole]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill all required fields'); return; }

    if (role === 'authority') {
      const validKeys = ['GVMC-2025', 'GOVT-AUTH-88', 'DISASTER-ADMIN', '0000'];
      if (!validKeys.includes(govPasskey.trim().toUpperCase())) {
        setError('Invalid Government Authorization Passkey. Access restricted to verified officials.');
        return;
      }
    }

    setLoading(true); setError('');
    try {
      await login(email, password, role);
      router.push(ROLE_DASHBOARD[role]);
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again or create an account.');
    }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true); setError('');
    try {
      await loginWithGoogle(role);
      // For Supabase OAuth, the redirect is handled by /auth/role-callback.
      // For local fallback (no Supabase), redirect now.
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === '') {
        router.push(ROLE_DASHBOARD[role]);
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
    }
    finally { setGoogleLoading(false); }
  };

  const handleEmailOTPSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Enter a valid email address'); return; }
    setLoading(true); setError('');
    try {
      await sendOTP(email, 'email');
      router.push(`/otp-verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP. Try again.');
    }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />
      <div className={styles.bgGrid} />

      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Droplets size={24} /></div>
          <div>
            <span className={styles.logoText}>AquaSentinel</span>
            <span className={styles.logoSub}>Flood Intelligence System</span>
          </div>
        </div>

        {/* Dedicated Role Badge Header */}
        <div style={{
          margin: '1.25rem 0 0.5rem 0',
          padding: '0.85rem 1rem',
          borderRadius: '14px',
          background: role === 'authority' ? 'rgba(255, 68, 68, 0.12)' : role === 'farmer' ? 'rgba(0, 255, 136, 0.12)' : 'rgba(0, 214, 255, 0.12)',
          border: `1px solid ${role === 'authority' ? 'rgba(255, 68, 68, 0.35)' : role === 'farmer' ? 'rgba(0, 255, 136, 0.35)' : 'rgba(0, 214, 255, 0.35)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {role === 'authority' ? <ShieldCheck size={22} color="#ff4444" /> : role === 'farmer' ? <Sprout size={22} color="#00ff88" /> : <UserCheck size={22} color="#00d4ff" />}
            <div>
              <strong style={{
                color: role === 'authority' ? '#ff6666' : role === 'farmer' ? '#00ff88' : '#00d4ff',
                fontSize: '1rem',
                display: 'block',
              }}>
                {role === 'authority' ? 'Authority Command Login' : role === 'farmer' ? 'Farmer FieldShield Login' : 'Citizen Safety Login'}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                {role === 'authority' ? 'Restricted Official Command Portal' : role === 'farmer' ? 'Agriculture Barrier & Field Telemetry Portal' : 'Urban Alerts & Evacuation Portal'}
              </span>
            </div>
          </div>

          <Link href="/" style={{ color: 'var(--clr-text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }} title="Change Role">
            <RefreshCw size={12} />
            <span>Change</span>
          </Link>
        </div>

        <button type="button" className={styles.googleBtn} onClick={handleGoogle} disabled={googleLoading}>
          {googleLoading ? (
            <Loader size={18} className={styles.spin} />
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
        </button>

        <div className={styles.divider}><span>or sign in with email</span></div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'email-pass' ? styles.tabActive : ''}`}
            onClick={() => { setTab('email-pass'); setError(''); }}
          >
            <Lock size={15} /> Password
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'email-otp' ? styles.tabActive : ''}`}
            onClick={() => { setTab('email-otp'); setError(''); }}
          >
            <Mail size={15} /> Email OTP
          </button>
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}

        {tab === 'email-pass' && (
          <form onSubmit={handleEmailLogin} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-icon">
                <Mail size={16} className="icon" />
                <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            {role === 'authority' && (
              <div className="form-group" style={{ background: 'rgba(255,68,68,0.1)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255,68,68,0.3)' }}>
                <label className="form-label" style={{ color: '#ff8888' }}>
                  Government Passkey / Officer Security ID *
                </label>
                <div className="form-input-icon">
                  <Key size={16} className="icon" style={{ color: '#ff4444' }} />
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Enter Official Security Passkey"
                    value={govPasskey}
                    onChange={e => setGovPasskey(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className={styles.passwordWrap}>
                <div className="form-input-icon" style={{ flex: 1 }}>
                  <Lock size={16} className="icon" />
                  <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '2.5rem' }} />
                </div>
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? <Loader size={16} className={styles.spin} /> : <><span>Sign In as {role === 'authority' ? 'Authority' : role === 'farmer' ? 'Farmer' : 'Citizen'}</span><ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {tab === 'email-otp' && (
          <form onSubmit={handleEmailOTPSend} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-icon">
                <Mail size={16} className="icon" />
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <p className={styles.otpNote}>
              A 6-digit OTP code will be sent to your email address.
            </p>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? <Loader size={16} className={styles.spin} /> : <><span>Send OTP</span><ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        <p className={styles.switchText}>
          Don&apos;t have an account?{' '}
          <Link href={`/signup?role=${role}`}>
            Create {role === 'farmer' ? 'Farmer' : role === 'authority' ? 'Authority' : 'Citizen'} account
          </Link>
        </p>
      </div>
    </div>
  );
}

export function LoginForm({ lockedRole }: LoginFormProps) {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <LoginFormContent lockedRole={lockedRole} />
    </Suspense>
  );
}
