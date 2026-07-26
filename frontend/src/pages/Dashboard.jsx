import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/createInvitation.css';
import './Dashboard.css';

const NAV_LINKS = ['AI Generator', 'Templates', 'Editor', 'Dashboard', 'Pricing'];

const STATS = [
  { key: 'invitations', label: 'My Invitations', value: 0, icon: <InvitationIcon />, accent: '#7dd3fc' },
  { key: 'drafts', label: 'Saved Drafts', value: 0, icon: <DraftIcon />, accent: '#fb923c' },
  { key: 'rsvps', label: 'RSVP Responses', value: 0, icon: <RsvpIcon />, accent: '#c084fc' },
  { key: 'downloads', label: 'Downloads', value: 0, icon: <DownloadIcon />, accent: '#f472b6' },
];

/**
 * userName: pass the logged-in user's display name, e.g. from auth context.
 * activeNav: which nav link to highlight (defaults to 'Dashboard').
 */
export default function Dashboard({ userName = 'User', activeNav = 'Dashboard' }) {
  const navigate = useNavigate();

  return (
    <div className="di-root dash">
      <Navbar activeNav={activeNav} />

      <div className="dash-page">
        <div className="dash-hero">
          <div>
            <h1 className="dash-hero__title">My Dashboard</h1>
            <p className="dash-hero__subtitle">Manage your invitations, RSVPs, and downloads.</p>
            <button className="dash-cta" onClick={() => navigate('/create-invitation')}>
              <span className="dash-cta__plus">+</span> Create New Invitation
            </button>
          </div>

          <h2 className="dash-hero__welcome">Welcome, {userName}</h2>
        </div>

        <div className="dash-stats">
          {STATS.map((stat) => (
            <div className="dash-stat-card" key={stat.key}>
              <div className="dash-stat-card__icon" style={{ color: stat.accent }}>{stat.icon}</div>
              <div className="dash-stat-card__value">{stat.value}</div>
              <div className="dash-stat-card__label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Navbar({ activeNav }) {
  return (
    <header className="dash-nav">
      <div className="dash-nav__brand">
        <span className="dash-nav__mark">✦</span>
        Digi<span className="dash-nav__brand-accent">Invite</span>
      </div>

      <nav className="dash-nav__links">
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
            className={`dash-nav__link ${link === activeNav ? 'dash-nav__link--active' : ''}`}
          >
            {link}
          </a>
        ))}
      </nav>

      <div className="dash-nav__actions">
        <ThemeToggle />
        <a href="/admin" className="dash-nav__admin">Admin</a>
        <button className="dash-nav__logout">Log out</button>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const [on, setOn] = React.useState(true);
  return (
    <button
      className={`dash-toggle ${on ? 'dash-toggle--on' : ''}`}
      onClick={() => setOn((v) => !v)}
      aria-label="Toggle theme"
      aria-pressed={on}
    >
      <span className="dash-toggle__knob" />
    </button>
  );
}

/* ---- Stat icons (inline SVG, no external deps) ---- */

function InvitationIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6.5L12 13L20.5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="2.5" width="14" height="19" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 8H15.5M8.5 11.5H15.5M8.5 15H12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function RsvpIcon() {
  return (
    <svg width="26" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="8.5" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="9" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.8 19c0-3.1 2.6-5.5 5.7-5.5s5.7 2.4 5.7 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14.5 14.2c2.6.3 4.7 2.4 4.7 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 3.5H15L19 7.5V20.5H5V3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15 3.5V7.5H19" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 10.5V16.5M12 16.5L9.3 13.8M12 16.5L14.7 13.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
