'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthGuard from '@/components/layout/AuthGuard';
import { Droplets, Loader, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './otp.module.css';

function OTPContent() {
  const { verifyOTP, sendOTP } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get('phone') || '';
  const email = params.get('email') || '';
  const type = phone ? 'phone' : 'email';
  const identifier = phone || email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(data)) {
      const arr = data.split('');
      setOtp([...arr, ...Array(6 - arr.length).fill('')]);
      inputRefs.current[Math.min(arr.length - 1, 5)]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits'); return; }
    setLoading(true); setError('');
    try {
      await verifyOTP(code, identifier, type);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch { setError('Invalid OTP. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try { await sendOTP(identifier, type); setTimer(30); setOtp(['','','','','','']); }
    finally { setResending(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Droplets size={22} /></div>
          <span className={styles.logoText}>AquaSentinel</span>
        </div>

        {success ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}><CheckCircle2 size={48} /></div>
            <h2>Verified!</h2>
            <p>Redirecting to your dashboard...</p>
          </div>
        ) : (
          <>
            <div className={styles.phoneDisplay}>
              <span className={styles.phoneBadge}>
                {type === 'phone' ? `📱 ${identifier || '+91 XXXXX XXXXX'}` : `✉️ ${identifier || 'your email'}`}
              </span>
            </div>
            <h1 className={styles.title}>Enter OTP</h1>
            <p className={styles.subtitle}>
              We&apos;ve sent a 6-digit code to your {type === 'phone' ? 'phone number' : 'email address'}. Enter it below to verify.
            </p>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleVerify}>
              <div className={styles.otpGrid} onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    className={`${styles.otpInput} ${digit ? styles.otpFilled : ''}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <button type="submit" className={`btn btn-primary ${styles.verifyBtn}`} disabled={loading || otp.join('').length < 6}>
                {loading ? <Loader size={16} className={styles.spin} /> : 'Verify OTP'}
              </button>
            </form>

            <div className={styles.resendRow}>
              {timer > 0 ? (
                <span className={styles.timerText}>Resend OTP in <strong>{timer}s</strong></span>
              ) : (
                <button className={styles.resendBtn} onClick={handleResend} disabled={resending}>
                  {resending ? <Loader size={14} className={styles.spin} /> : <RefreshCw size={14} />}
                  <span>Resend OTP</span>
                </button>
              )}
            </div>

            <p className={styles.demoNote}>
              💡 Demo: Enter any 6 digits to verify (e.g. <strong>123456</strong>)
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OTPVerifyPage() {
  return (
    <AuthGuard>
      <Suspense>
        <OTPContent />
      </Suspense>
    </AuthGuard>
  );
}
