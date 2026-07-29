import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';


import './Navbar.css';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <div className="nav-logo-icon">✦</div>
        <span className="nav-logo-text">
          Digi<span>Invite</span>
        </span>
      </Link>

      <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <li><NavLink to="/generator" onClick={() => setMenuOpen(false)}>AI Generator</NavLink></li>
        <li><NavLink to="/templates" onClick={() => setMenuOpen(false)}>Templates</NavLink></li>
        <li><NavLink to="/editor" onClick={() => setMenuOpen(false)}>Editor</NavLink></li>
        <li><NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink></li>
        {user && (
          <li><NavLink to="/my-requests" onClick={() => setMenuOpen(false)}>My Requests</NavLink></li>
        )}
        <li><NavLink to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</NavLink></li>
      </ul>

      <div className="nav-actions">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle light/dark mode"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <div className="theme-knob">
            {theme === 'dark' ? '☀️' : '🌙'}
          </div>
        </button>

        {user ? (
          <button className="btn-nav-primary" onClick={handleLogout}>Log out</button>
        ) : (
          <>
            <Link to="/login" className="btn-ghost hide-mobile">Sign in</Link>
            <Link to="/register" className="btn-nav-primary">Get started</Link>
          </>
        )}
      </div>

      <button
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(p => !p)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>
    </nav>
  );
}
