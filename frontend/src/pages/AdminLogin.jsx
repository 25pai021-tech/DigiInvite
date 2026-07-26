import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import './Auth.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const ok = login(username, password);
    if (ok) {
      navigate('/admin');
    } else {
      setError('Incorrect admin username or password.');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">✦ DigiInvite</div>
        <h1 className="auth-title">Admin Login</h1>
        <p className="auth-sub">Restricted access — DigiInvite staff only.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p style={{ color: '#e0555a', fontSize: '0.85rem', margin: 0 }}>
              {error}
            </p>
          )}

          <button className="btn-auth-primary" type="submit">
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
