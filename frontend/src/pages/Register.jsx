import { Link } from 'react-router-dom';
import './Auth.css';

export default function Register() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">✦ DigiInvite</div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Start creating stunning invitations today</p>

        <div className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Your name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Create a strong password" />
          </div>
          <button className="btn-auth-primary">Create Account</button>
          <button className="btn-auth-google">
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
