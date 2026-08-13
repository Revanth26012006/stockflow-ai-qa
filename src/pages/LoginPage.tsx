import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Boxes, Mail, Lock, LogIn, Zap, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn, signUp, signInDemoUser, isDemoMode, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Handle email/password form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFirebaseConfigured && !isDemoMode) {
      setError('Firebase credentials missing (VITE_FIREBASE_API_KEY). Set VITE_ENABLE_DEMO_MODE=true in .env to use Demo Mode.');
      return;
    }

    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }

    setLoading(true);
    try {
      isSignUp ? await signUp(email, password) : await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle quick demo login (only active when VITE_ENABLE_DEMO_MODE=true)
  const handleDemoLogin = async () => {
    if (!isDemoMode) {
      setError('Demo Mode is disabled by default. Set VITE_ENABLE_DEMO_MODE=true in .env to enable.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInDemoUser();
      navigate('/dashboard');
    } catch (err: any) {
      setError('Demo login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: '2.5rem 2rem' }}>

        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: 'var(--color-primary)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Boxes size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>StockFlow</h1>
          <p className="muted" style={{ fontSize: '0.9rem' }}>Inventory Order Fulfillment System</p>
        </div>

        {/* Unconfigured Warning Alert */}
        {!isFirebaseConfigured && !isDemoMode && (
          <div className="alert alert-error" data-testid="config-error-alert" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <div style={{ fontSize: '0.85rem' }}>
              <strong>Firebase Configuration Missing</strong>
              <div>Set Firebase keys in <code>.env</code> or set <code>VITE_ENABLE_DEMO_MODE=true</code> to evaluate offline.</div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="alert alert-error" data-testid="login-error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login / SignUp Form */}
        <form onSubmit={handleSubmit} data-testid="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input id="email-input" type="email" className="form-input" placeholder="admin@company.com" value={email} onChange={e => setEmail(e.target.value)} data-testid="email-input" style={{ paddingLeft: '2.25rem' }} />
              <Mail size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-faint)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="password-input" type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} data-testid="password-input" style={{ paddingLeft: '2.25rem' }} />
              <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-faint)' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} data-testid="submit-login-btn">
            <LogIn size={18} />
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Login (Only rendered if VITE_ENABLE_DEMO_MODE=true) */}
        {isDemoMode && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              <span className="faint" style={{ fontSize: '0.8rem' }}>DEMO MODE</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>

            <button type="button" className="btn btn-secondary btn-lg btn-full" onClick={handleDemoLogin} disabled={loading} data-testid="demo-login-btn" style={{ border: '1px dashed var(--color-primary)' }}>
              <Zap size={18} color="var(--color-primary)" />
              Quick Demo Login
            </button>
          </>
        )}

        {/* Toggle Sign In / Sign Up */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

      </div>
    </div>
  );
};
