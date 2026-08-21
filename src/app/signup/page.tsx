'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Droplets, User, Phone, ArrowRight, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/layout/AuthGuard';
import styles from './signup.module.css';

const ROLES = [
  { id: 'citizen', label: 'Citizen', desc: 'Receive flood alerts and safe routes' },
  { id: 'farmer', label: 'Farmer', desc: 'Agriculture field protection + FieldShield' },
  { id: 'authority', label: 'Authority', desc: 'Emergency management dashboard' },
];

function SignupForm() {
  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Please fill all required fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await signup(name, email, password, role);
      if (res?.confirmationRequired) {
        setRegisteredEmail(email);
        setSuccess(true);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Signup failed. Please try again.');
    }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGLoading(true); setError('');
    try {
      await loginWithGoogle();
      // Don't redirect — Google OAuth redirects the browser automatically
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed. Make sure Google provider is enabled in Supabase.');
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
            <Link href="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
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

        <div className={styles.headerText}>
          <h1 className={styles.title}>Join AquaSentinel</h1>
          <p className={styles.subtitle}>Get early flood warnings, safe route guidance and protection for free.</p>
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

        <div className={styles.roleSection}>
          <span className={styles.roleLabel}>I am a</span>
          <div className={styles.roleGrid}>
            {ROLES.map(r => (
              <button key={r.id} type="button" className={`${styles.roleCard} ${role === r.id ? styles.roleActive : ''}`} onClick={() => setRole(r.id)}>
                {role === r.id && <CheckCircle size={14} className={styles.roleCheck} />}
                <span className={styles.roleName}>{r.label}</span>
                <span className={styles.roleDesc}>{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSignup} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div className="form-input-icon">
              <User size={16} className="icon" />
              <input className="form-input" type="text" placeholder="Ravi Kumar" value={name} onChange={e => setName(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div className="form-input-icon">
              <Mail size={16} className="icon" />
              <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone (optional, for OTP alerts)</label>
            <div className="form-input-icon">
              <Phone size={16} className="icon" />
              <input className="form-input" type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <div className={styles.passwordWrap}>
              <div className="form-input-icon" style={{ flex: 1 }}>
                <Lock size={16} className="icon" />
                <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: '2.5rem' }} />
              </div>
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? <Loader size={16} className={styles.spin} /> : <><span>Create Account</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <AuthGuard>
      <SignupForm />
    </AuthGuard>
  );
}
