import { useState } from 'react';

const VALID_EMAIL = 'umerhiam223@gmail.com';
const VALID_PASSWORD = 'Hello@1122';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      setError('');
      onLogin();
    } else {
      setError('Invalid email or password.');
    }
  }

  return (
    <div className="login-page" style={{
      minHeight: '100vh',
      background: '#050810',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top pattern */}
      <img
        src="/login-pattern.png"
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      {/* Bottom pattern (rotated) */}
      <img
        src="/login-pattern.png"
        alt=""
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          transform: 'rotate(180deg)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />

      {/* Card */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '380px',
        background: 'conic-gradient(from 269.88deg at 50% 50%, #FFFFFF 0deg, rgba(255, 255, 255, 0.1) 36deg, rgba(255, 255, 255, 0.4) 144deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.6) 216deg, rgba(255, 255, 255, 0.1) 324deg, rgba(255, 255, 255, 0.94) 360deg)',
        padding: '1px',
        borderRadius: '16px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      }}>
        <div className='lp-card'
          style={{
            width: '100%',
            height: '100%',
            padding: '40px 36px 44px',
            borderRadius: '16px',
            background: '#050810',
          }}
        >
          <h1 style={{
            margin: '0 0 6px',
            fontSize: '24px',
            fontWeight: '700',
            color: '#ffffff',
            fontFamily: 'inherit',
          }}>Sign In</h1>
          <p style={{
            margin: '0 0 28px',
            fontSize: '13px',
            color: '#8a9bb8',
            fontFamily: 'inherit',
          }}>Log-in your account to get started</p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#e2e8f0',
              marginBottom: '6px',
            }}>Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                display: 'block',
                width: '100%',
                boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '14px',
                color: '#e2e8f0',
                outline: 'none',
                marginBottom: '20px',
                fontFamily: 'inherit',
              }}
            />

            {/* Password */}
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#e2e8f0',
              marginBottom: '6px',
            }}>Password</label>
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  display: 'block',
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '12px 42px 12px 14px',
                  fontSize: '14px',
                  color: '#e2e8f0',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  color: '#8a9bb8',
                  display: 'flex',
                  alignItems: 'center',
                }}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p style={{
                margin: '8px 0 0',
                fontSize: '12px',
                color: '#f87171',
                fontFamily: 'inherit',
              }}>{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              style={{
                display: 'block',
                width: '100%',
                marginTop: '32px',
                padding: '14px',
                background: '#1aafbf',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '700',
                color: '#ffffff',
                cursor: 'pointer',
                letterSpacing: '0.02em',
                fontFamily: 'inherit',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#17a0ae'}
              onMouseLeave={e => e.currentTarget.style.background = '#1aafbf'}
            >
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
