import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

const API_URL = 'http://localhost:3001/api';

/* ── Eye Icon ─────────────────────────────────────────────────── */
function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/* ── Forgot Password Modal (2-step: verify email → set new password) ── */
function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [step, setStep]           = useState<'email' | 'reset' | 'done'>('email');
  const [email, setEmail]         = useState('');
  const [userName, setUserName]   = useState('');
  const [newPwd, setNewPwd]       = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showNew, setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  /* Step 1 — verify email exists */
  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Email not found.'); setLoading(false); return; }
      setUserName(data.name || '');
      setStep('reset');
    } catch {
      setError('Cannot connect to server. Please try again.');
    }
    setLoading(false);
  }

  /* Step 2 — set new password */
  async function handleResetSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!newPwd)              { setError('Please enter a new password.'); return; }
    if (newPwd.length < 8)   { setError('Password must be at least 8 characters.'); return; }
    if (newPwd !== confirmPwd){ setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Reset failed. Please try again.'); setLoading(false); return; }
      setStep('done');
    } catch {
      setError('Cannot connect to server. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* ── DONE ── */}
        {step === 'done' && (
          <div className="modal-success">
            <div className="modal-success-icon">✅</div>
            <div className="modal-success-text">Password Reset!</div>
            <p className="modal-success-sub">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <button className="auth-submit" style={{ marginTop: '20px', borderRadius: '12px' }} onClick={onClose}>
              Go to Sign In
            </button>
          </div>
        )}

        {/* ── STEP 1: Enter Email ── */}
        {step === 'email' && (
          <>
            <h2 className="modal-title">Forgot Password?</h2>
            <p className="modal-description">
              Enter the email address linked to your ZENTRO account and we'll let you set a new password.
            </p>
            <form onSubmit={handleEmailSubmit} className="auth-form" autoComplete="off">
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email Address</label>
                <input
                  id="forgot-email"
                  type="text"
                  className={`form-input-clean${error ? ' has-error' : ''}`}
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoComplete="off"
                  autoFocus
                />
                {error && <div className="form-error">⚠ {error}</div>}
              </div>
              <button type="submit" className="auth-submit" disabled={loading} style={{ borderRadius: '12px' }}>
                {loading ? <span className="spinner" /> : null}
                {loading ? 'Checking…' : 'Find My Account'}
              </button>
            </form>
          </>
        )}

        {/* ── STEP 2: Set New Password ── */}
        {step === 'reset' && (
          <>
            <h2 className="modal-title">Set New Password</h2>
            <p className="modal-description">
              Hi <strong style={{ color: '#60a5fa' }}>{userName || email}</strong>! Enter your new password below.
            </p>
            <form onSubmit={handleResetSubmit} className="auth-form" autoComplete="off">
              <div className="form-group">
                <label className="form-label" htmlFor="new-pwd">New Password</label>
                <div className="form-input-wrapper">
                  <input
                    id="new-pwd"
                    type={showNew ? 'text' : 'password'}
                    className={`form-input-clean${error ? ' has-error' : ''}`}
                    placeholder="Enter new password (min 8 chars)"
                    value={newPwd}
                    onChange={e => { setNewPwd(e.target.value); setError(''); }}
                    autoComplete="new-password"
                    style={{ paddingRight: '44px' }}
                    autoFocus
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowNew(v => !v)}>
                    <EyeIcon visible={showNew} />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirm-pwd">Confirm New Password</label>
                <div className="form-input-wrapper">
                  <input
                    id="confirm-pwd"
                    type={showConfirm ? 'text' : 'password'}
                    className={`form-input-clean${error ? ' has-error' : ''}`}
                    placeholder="Re-enter new password"
                    value={confirmPwd}
                    onChange={e => { setConfirmPwd(e.target.value); setError(''); }}
                    autoComplete="new-password"
                    style={{ paddingRight: '44px' }}
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirm(v => !v)}>
                    <EyeIcon visible={showConfirm} />
                  </button>
                </div>
                {error && <div className="form-error">⚠ {error}</div>}
              </div>
              <button type="submit" className="auth-submit" disabled={loading} style={{ borderRadius: '12px' }}>
                {loading ? <span className="spinner" /> : null}
                {loading ? 'Resetting…' : 'Reset My Password'}
              </button>
              <button type="button" onClick={() => { setStep('email'); setNewPwd(''); setConfirmPwd(''); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.83rem', marginTop: '4px' }}>
                ← Use a different email
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main Auth Page ───────────────────────────────────────────── */
export default function AuthPage() {
  const { login, signup, isLoading } = useAuth();

  const [tab, setTab]                 = useState<'login' | 'signup'>('login');
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showForgot, setShowForgot]   = useState(false);

  const [name, setName]                       = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors]                   = useState<Record<string, string>>({});
  const [serverError, setServerError]         = useState('');
  const [successMsg, setSuccessMsg]           = useState('');

  /* ── Validation ── */
  function validate() {
    const e: Record<string, string> = {};
    if (tab === 'signup' && (!name.trim() || name.trim().length < 2))
      e.name = 'Full name must be at least 2 characters.';
    if (!email.trim())
      e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = 'Please enter a valid email address.';
    if (!password)
      e.password = 'Password is required.';
    else if (password.length < 4)
      e.password = 'Password must be at least 4 characters.';
    if (tab === 'signup' && password !== confirmPassword)
      e.confirmPassword = 'Passwords do not match.';
    return e;
  }

  /* ── Switch tab ── */
  function switchTab(t: 'login' | 'signup') {
    setTab(t); setErrors({}); setServerError(''); setSuccessMsg('');
    setName(''); setPassword(''); setConfirmPassword('');
    setShowPwd(false); setShowConfirm(false);
  }

  /* ── Submit ── */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(''); setSuccessMsg('');
    const errs = validate(); setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (tab === 'login') {
      const result = await login(email, password);
      if (result.error) setServerError(result.error);
    } else {
      const result = await signup(email, password, name.trim());
      if (result.error) {
        setServerError(result.error);
      } else {
        const registeredEmail = email;
        setName('');
        setPassword('');
        setConfirmPassword('');
        setErrors({});
        setTab('login');
        setEmail(registeredEmail);
        setSuccessMsg(`Account created successfully! Please enter your password to sign in with ${registeredEmail}`);
      }
    }
  }

  /* ── Render ── */
  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-grid" />
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="auth-bg-orb auth-bg-orb-3" />
      </div>

      <div className="auth-container">

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <div className="auth-brand-icon" style={{
              width: '44px', height: '44px', display: 'grid', placeItems: 'center',
              borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
              color: '#ffffff', fontSize: '27px', fontWeight: 900,
              boxShadow: '0 4px 18px rgba(37,99,235,0.3)'
            }}>Z</div>
            <div className="auth-brand-name">ZENTRO</div>
          </div>
          <div className="auth-brand-tagline">The Future of Shopping</div>
        </div>

        {/* Card */}
        <div className="auth-card">

          {/* Back to home */}
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            style={{
              background: 'none', border: 'none', color: '#60a5fa',
              cursor: 'pointer', marginBottom: '15px', fontSize: '14px',
              padding: 0, display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            ← Back to home
          </button>

          {/* Tabs */}
          <div className="auth-tabs" role="tablist">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')} role="tab" aria-selected={tab === 'login'}>
              Sign In
            </button>
            <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
              onClick={() => switchTab('signup')} role="tab" aria-selected={tab === 'signup'}>
              Create Account
            </button>
          </div>

          <h1 className="auth-title">
            {tab === 'login' ? 'Welcome back!' : 'Join ZENTRO today'}
          </h1>
          <p className="auth-subtitle">
            {tab === 'login'
              ? 'Sign in with your registered email and password.'
              : 'Create your account to start shopping.'}
          </p>

          {/* Success banner */}
          {successMsg && (
            <div style={{
              padding: '12px 16px', background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.35)', borderRadius: '12px',
              fontSize: '0.85rem', color: '#10b981', fontWeight: 600, marginBottom: '12px',
            }}>
              {successMsg}
            </div>
          )}

          {/* Error banner */}
          {serverError && (
            <div className="auth-server-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {serverError}
              {serverError.toLowerCase().includes('no account') && (
                <button type="button" onClick={() => { setSuccessMsg(''); switchTab('signup'); }}
                  style={{ display:'block', marginTop:'6px', color:'#60a5fa', fontWeight:700, fontSize:'0.8rem', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                  → Create a new account
                </button>
              )}
              {serverError.toLowerCase().includes('already exists') && (
                <button type="button" onClick={() => { setSuccessMsg(''); switchTab('login'); }}
                  style={{ display:'block', marginTop:'6px', color:'#60a5fa', fontWeight:700, fontSize:'0.8rem', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                  → Sign in instead
                </button>
              )}
            </div>
          )}

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate autoComplete="off">

            {/* Hidden dummy fields to block browser autofill */}
            <input type="text" style={{ display: 'none' }} aria-hidden="true" readOnly />
            <input type="password" style={{ display: 'none' }} aria-hidden="true" readOnly />

            {/* Full Name – signup only */}
            {tab === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="signup-name">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  className={`form-input-clean${errors.name ? ' has-error' : ''}`}
                  placeholder="Enter your full name"
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                  autoComplete="off"
                  autoFocus
                />
                {errors.name && <div className="form-error" role="alert">⚠ {errors.name}</div>}
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Email Address</label>
              <input
                id="auth-email"
                type="text"
                className={`form-input-clean${errors.email ? ' has-error' : ''}`}
                placeholder="Enter your email address"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); setServerError(''); }}
                autoComplete="off"
              />
              {errors.email && <div className="form-error" role="alert">⚠ {errors.email}</div>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">Password</label>
              <div className="form-input-wrapper">
                <input
                  id="auth-password"
                  type={showPwd ? 'text' : 'password'}
                  className={`form-input-clean${errors.password ? ' has-error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                  autoComplete="new-password"
                  style={{ paddingRight: '44px' }}
                />
                <button type="button" className="password-toggle"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}>
                  <EyeIcon visible={showPwd} />
                </button>
              </div>
              {errors.password && <div className="form-error" role="alert">⚠ {errors.password}</div>}
            </div>

            {/* Confirm Password – signup only */}
            {tab === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-confirm">Confirm Password</label>
                <div className="form-input-wrapper">
                  <input
                    id="auth-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    className={`form-input-clean${errors.confirmPassword ? ' has-error' : ''}`}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })); }}
                    autoComplete="new-password"
                    style={{ paddingRight: '44px' }}
                  />
                  <button type="button" className="password-toggle"
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                    <EyeIcon visible={showConfirm} />
                  </button>
                </div>
                {errors.confirmPassword && <div className="form-error" role="alert">⚠ {errors.confirmPassword}</div>}
              </div>
            )}

            {/* Forgot Password link */}
            {tab === 'login' && (
              <div className="auth-forgot">
                <button type="button" className="auth-forgot-btn" onClick={() => setShowForgot(true)}>
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? <span className="spinner" /> : null}
              {isLoading
                ? (tab === 'login' ? 'Signing in…' : 'Creating account…')
                : (tab === 'login' ? 'Sign In to ZENTRO' : 'Create My Account')}
            </button>
          </form>

          {/* Switch Login / Signup */}
          <p style={{ textAlign:'center', fontSize:'0.83rem', color:'var(--text-muted)', marginTop:'16px' }}>
            {tab === 'login' ? (
              <>Don't have an account?{' '}
                <button type="button" onClick={() => switchTab('signup')}
                  style={{ color:'#60a5fa', fontWeight:700, background:'none', border:'none', cursor:'pointer', fontSize:'0.83rem' }}>
                  Create one free
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" onClick={() => switchTab('login')}
                  style={{ color:'#60a5fa', fontWeight:700, background:'none', border:'none', cursor:'pointer', fontSize:'0.83rem' }}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}
