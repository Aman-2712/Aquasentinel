'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Droplets, User, Phone, ArrowRight, Loader, CheckCircle, ShieldCheck, Key, UserCheck, Sprout, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROLE_DASHBOARD, UserRole } from '@/context/AuthContext';
import AuthGuard from '@/components/layout/AuthGuard';
import styles from './signup.module.css';

function SignupContent() {
  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'citizen';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [govPasskey, setGovPasskey] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  useEffect(() => {
    if (searchParams.get('role')) {
      setRole(searchParams.get('role') as string);
    }
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Please fill all required fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    if (role === 'authority') {
      const validKeys = ['GVMC-2025', 'GOVT-AUTH-88', 'DISASTER-ADMIN', '0000'];
      if (!validKeys.includes(govPasskey.trim().toUpperCase())) {
        setError('Invalid Government Authorization Passkey. Only authorized personnel may register as Authority.');
        return;
      }
    }

    setLoading(true); setError('');
    try {
      const res = await signup(name, email, password, role);
      if (res?.confirmationRequired) {
        setRegisteredEmail(email);
        setSuccess(true);
      } else {
        router.push(ROLE_DASHBOARD[role as UserRole] || '/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Signup failed. Please try again.');
    }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGLoading(true); setError('');
    try {
      await loginWithGoogle(role as any);
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
    }
    finally { setGLoading(false); }
  };

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.bgGlow1} /><div className={styles.bgGlow2} /><div className={styles.bgGrid} />
        <div className={styles.card} style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div className={styles.logo} style={{ justifyContent: 'center' }}>
            <div className={styles.logoIcon}><Droplets size={24} /></div>
            <span className={styles.logoText}>AquaSentinel</span>
          </div>
          <div style={{ margin: '2rem 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(48,209,88,0.1)',
              border: '2px solid #30d158',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#30d158',
              boxShadow: '0 0 15px rgba(48,209,88,0.3)',
            }}>
              <CheckCircle size={32} />
            </div>
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Confirm Your Email</h2>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
            We&apos;ve sent a verification link to <strong style={{ color: '#00d4ff' }}>{registeredEmail}</strong>.<br />
            Please click the link in your email to activate your account.
          </p>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
            <Link href={`/login?role=${role}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Proceed to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow1} /><div className={styles.bgGlow2} /><div className={styles.bgGrid} />

      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Droplets size={22} /></div>
          <div>
            <span className={styles.logoText}>AquaSentinel</span>
            <span className={styles.logoSub}>Early Warning System</span>
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
                {role === 'authority' ? 'Authority Registration' : role === 'farmer' ? 'Farmer FieldShield Registration' : 'Citizen Safety Registration'}
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                {role === 'authority' ? 'Restricted Official Registration Portal' : role === 'farmer' ? 'Agricultural Protection & Field Telemetry Portal' : 'Urban Alerts & Evacuation Portal'}
              </span>
            </div>
          </div>

          <Link href="/" style={{ color: 'var(--clr-text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }} title="Change Role">
            <RefreshCw size={12} />
            <span>Change</span>
          </Link>
        </div>

        <div className={styles.headerText}>
          <h1 className={styles.title}>Join AquaSentinel</h1>
          <p className={styles.subtitle}>
            {role === 'farmer' ? 'Register your farmland & activate IoT FieldShield protection.' : role === 'authority' ? 'Official Authority Registration Portal.' : 'Get early flood warnings, safe route guidance and protection for free.'}
          </p>
        </div>

        <button type="button" className={styles.googleBtn} onClick={handleGoogle} disabled={gLoading}>
          {gLoading ? <Loader size={18} className={styles.spin} /> : (
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>{gLoading ? 'Creating account...' : 'Sign up with Google'}</span>
        </button>

        <div className={styles.divider}><span>or create with email</span></div>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSignup} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div className="form-input-icon">
              <User size={16} className="icon" />
              <input className="form-input" type="text" placeholder="e.g. Ramesh Patel" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div className="form-input-icon">
              <Mail size={16} className="icon" />
              <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone (for instant SMS flood alerts)</label>
            <div className="form-input-icon">
              <Phone size={16} className="icon" />
              <input className="form-input" type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} />
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
                  placeholder="e.g. GVMC-2025"
                  value={govPasskey}
                  onChange={e => setGovPasskey(e.target.value)}
                  required
                />
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--clr-text-muted)', marginTop: '0.35rem', display: 'block' }}>
                Restricted: Enter official department authorization passkey to create authority account
              </span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password *</label>
            <div className={styles.passwordWrap}>
              <div className="form-input-icon" style={{ flex: 1 }}>
                <Lock size={16} className="icon" />
                <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '2.5rem' }} />
              </div>
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? <Loader size={16} className={styles.spin} /> : <><span>Create {role === 'authority' ? 'Authority' : role === 'farmer' ? 'Farmer' : 'Citizen'} Account</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account? <Link href={`/login?role=${role}`}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div>Loading signup...</div>}>
        <SignupContent />
      </Suspense>
    </AuthGuard>
  );
}
