import React, { useState } from 'react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:3001/api/admin/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid admin credentials');
        return;
      }

      localStorage.setItem('zentro_admin_token', data.token);

      window.location.href = '/admin/dashboard';

    } catch {
      setError('Cannot connect to server.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080d19',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial',
      padding: '20px'
    }}>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#111c30',
        padding: '40px',
        borderRadius: '18px',
        border: '1px solid #263752'
      }}>

        {/* ZENTRO Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>

          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '23px',
            fontWeight: 800
          }}>
            Z
          </div>

          <h1 style={{
            color: '#60a5fa',
            letterSpacing: '3px',
            margin: 0
          }}>
            ZENTRO
          </h1>

        </div>

        <h2 style={{
          color: 'white',
          textAlign: 'center'
        }}>
          Admin Login
        </h2>

        <p style={{
          color: '#94a3b8',
          textAlign: 'center'
        }}>
          Sign in to manage your store
        </p>

        <form onSubmit={handleLogin} autoComplete="off">

          <label style={{ color: 'white' }}>
            Email Address
          </label>

          <input
            type="text"
            placeholder="Enter admin email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="new-password"
            style={inputStyle}
          />

          <label style={{ color: 'white' }}>
            Password
          </label>

          <div style={{
            position: 'relative',
            marginTop: '10px',
            marginBottom: '22px'
          }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              style={{
                ...inputStyle,
                marginTop: 0,
                marginBottom: 0,
                paddingRight: '48px'
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontSize: '18px'
              }}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          {error && (
            <p style={{ color: '#fb7185' }}>{error}</p>
          )}

          <button type="submit" style={buttonStyle}>
            Sign In to Admin
          </button>

        </form>

        <p style={{
          color: '#64748b',
          textAlign: 'center',
          fontSize: '12px',
          marginTop: '25px'
        }}>
          ZENTRO ADMINISTRATION PORTAL
        </p>

      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px',
  marginTop: '10px',
  marginBottom: '22px',
  background: '#080d19',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: 'white',
  boxSizing: 'border-box',
  outline: 'none'
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer'
};