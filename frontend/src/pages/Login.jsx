import { Link } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">✦ DigiInvite</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your account</p>

        <div className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <button className="btn-auth-primary">Sign in</button>
          <button className="btn-auth-google">
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
