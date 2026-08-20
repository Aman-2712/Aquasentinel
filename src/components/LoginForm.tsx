'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Droplets, Phone, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/login/auth.module.css';

type Tab = 'email-pass' | 'email-otp' | 'phone-otp';

export function LoginForm() {
  const { login, loginWithGoogle, sendOTP } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('email-pass');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true); setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) { 
      setError(err?.message || 'Invalid credentials. Try again.'); 
    }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true); setError('');
    try {
      await loginWithGoogle();
      router.replace('/dashboard');
    } catch { setError('Google sign-in failed.'); }
    finally { setGoogleLoading(false); }
  };

  const handleEmailOTPSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Enter a valid email address'); return; }
    setLoading(true); setError('');
    try {
      await sendOTP(email, 'email');
      router.push(`/otp-verify?email=${email}`);
    } catch { setError('Failed to send OTP.'); }
    finally { setLoading(false); }
  };

  const handlePhoneOTPSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) { setError('Enter a valid phone number'); return; }
    setLoading(true); setError('');
    try {
      await sendOTP(phone, 'phone');
      router.push(`/otp-verify?phone=${phone}`);
    } catch { setError('Failed to send OTP.'); }
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

        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to access flood alerts and your dashboard</p>

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

        <div className={styles.divider}><span>or sign in with</span></div>

        <div className={styles.tabs}>
          <button type="button" className={`${styles.tab} ${tab === 'email-pass' ? styles.tabActive : ''}`} onClick={() => setTab('email-pass')}>
            <Lock size={15} /> Password
          </button>
          <button type="button" className={`${styles.tab} ${tab === 'email-otp' ? styles.tabActive : ''}`} onClick={() => setTab('email-otp')}>
            <Mail size={15} /> Gmail OTP
          </button>
          <button type="button" className={`${styles.tab} ${tab === 'phone-otp' ? styles.tabActive : ''}`} onClick={() => setTab('phone-otp')}>
            <Phone size={15} /> Phone OTP
          </button>
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}

        {tab === 'email-pass' && (
          <form onSubmit={handleEmailLogin} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-icon">
                <Mail size={16} className="icon" />
                <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className={styles.passwordWrap}>
                <div className="form-input-icon" style={{ flex: 1 }}>
                  <Lock size={16} className="icon" />
                  <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: '2.5rem' }} />
                </div>
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? <Loader size={16} className={styles.spin} /> : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {tab === 'email-otp' && (
          <form onSubmit={handleEmailOTPSend} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-icon">
                <Mail size={16} className="icon" />
                <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <p className={styles.otpNote}>A 6-digit OTP will be sent to your Gmail address.</p>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? <Loader size={16} className={styles.spin} /> : <><span>Send OTP</span><ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {tab === 'phone-otp' && (
          <form onSubmit={handlePhoneOTPSend} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="form-input-icon">
                <Phone size={16} className="icon" />
                <input className="form-input" type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
            </div>
            <p className={styles.otpNote}>A 6-digit OTP will be sent to your phone number via SMS.</p>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? <Loader size={16} className={styles.spin} /> : <><span>Send OTP</span><ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        <p className={styles.switchText}>
          Don&apos;t have an account? <Link href="/signup">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
