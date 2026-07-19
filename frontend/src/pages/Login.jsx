import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin() {
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    navigate('/dashboard');
  }

  async function handleGoogleLogin() {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">✦ DigiInvite</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your account</p>

        <div className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <p style={{ color: '#e5484d', fontSize: '0.9rem', margin: '4px 0' }}>{error}</p>}

          <button className="btn-auth-primary" onClick={handleEmailLogin} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <button className="btn-auth-google" onClick={handleGoogleLogin}>
            <span>G</span> Continue with Google
          </button>
        </div>

        <p className="auth-switch">
          Don&apos;t have an account?{' '}
          <Link to="/register">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}