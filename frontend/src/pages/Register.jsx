import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
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
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Start creating stunning invitations today</p>

        <div className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Your name"
              value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Create a strong password"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <p style={{ color: '#e5484d', fontSize: '0.9rem', margin: '4px 0' }}>{error}</p>}

          <button className="btn-auth-primary" onClick={handleRegister} disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
          <button className="btn-auth-google" onClick={handleGoogleLogin}>
            <span>G</span> Continue with Google
          </button>
        </div>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}