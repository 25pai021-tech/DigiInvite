import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const THEMES = [
  {
    id: 'royal',
    name: 'Royal Heritage',
    accentColor: '#D4AF37',
    badge: 'Royal Palace Theme',
    eyebrow: 'Together With Their Families',
    names: 'Arjun & Ananya',
    eventTitle: 'Invite you to celebrate their wedding',
    date: 'Saturday, November 28, 2026',
    time: '6:30 PM Onwards',
    venue: 'The Leela Palace, Udaipur',
    styleClass: 'theme-royal',
    ornament: '✦ ॐ ✦',
  },
  {
    id: 'botanical',
    name: 'Blush Botanical',
    accentColor: '#E29578',
    badge: 'Modern Floral Theme',
    eyebrow: 'We Are Getting Married',
    names: 'Rohan & Maya',
    eventTitle: 'Cocktail Evening & Sangeet Ceremony',
    date: 'Sunday, December 14, 2026',
    time: '7:00 PM Onwards',
    venue: 'JW Marriott Resort, Goa',
    styleClass: 'theme-botanical',
    ornament: '🍃 ❀ 🍃',
  },
  {
    id: 'emerald',
    name: 'Emerald Luxe',
    accentColor: '#52B788',
    badge: 'Luxury Evening Theme',
    eyebrow: 'Save The Date',
    names: 'Kabir & Tara',
    eventTitle: 'Grand Engagement Celebration',
    date: 'Friday, January 15, 2027',
    time: '8:00 PM Onwards',
    venue: 'Taj Mahal Palace, Mumbai',
    styleClass: 'theme-emerald',
    ornament: '✨ ⚜ ✨',
  },
];

export default function Hero() {
  const [activeThemeIndex, setActiveThemeIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardAreaRef = useRef(null);

  const currentTheme = THEMES[activeThemeIndex];

  // Subtle 3D mouse parallax
  const handleMouseMove = (e) => {
    if (!cardAreaRef.current) return;
    const rect = cardAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Limit rotation to subtle +/- 7 degrees
    const rotateY = (x / (rect.width / 2)) * 7;
    const rotateX = -(y / (rect.height / 2)) * 7;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section className="hero" id="home">
      <div className="hero-glow-bg" aria-hidden="true" />

      <div className="hero-container section-inner">
        {/* Left Column: Value Proposition & Working CTAs */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-sparkle">✦</span>
            <span>Next-Gen Digital Invitation Platform</span>
          </div>

          <h1 className="hero-title">
            Create Beautiful Digital <br />
            <span className="hero-title-gradient">Invitations in Minutes</span>
          </h1>

          <p className="hero-sub">
            Generate a unique, culturally rich invitation with AI, fine-tune every
            detail on our canvas editor, then share it as a beautiful web page or
            download it in print-ready quality.
          </p>

          <div className="hero-cta-group">
            <Link to="/create-invitation" className="btn-hero-primary">
              <span>Create Your Invitation</span>
              <span className="btn-arrow">→</span>
            </Link>

            <Link to="/templates" className="btn-hero-secondary">
              Browse Templates
            </Link>
          </div>

          <div className="hero-trust-bar">
            <div className="trust-pill">
              <span>Royal &amp; Cultural Motifs</span>
            </div>
            <div className="trust-pill">
              <span>Shareable WhatsApp Invite</span>
            </div>
            <div className="trust-pill">
              <span>PNG, JPG &amp; PDF Downloads</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Interactive Invitation Preview */}
        <div
          className="hero-visual-wrapper perspective-container"
          ref={cardAreaRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Interactive Theme Selector Tabs */}
          <div className="hero-theme-selector">
            <span className="theme-selector-label">Interactive Preview:</span>
            <div className="theme-chips">
              {THEMES.map((t, idx) => (
                <button
                  key={t.id}
                  className={`theme-chip ${idx === activeThemeIndex ? 'active' : ''}`}
                  onClick={() => {
                    setActiveThemeIndex(idx);
                    setIsFlipped(false);
                  }}
                  type="button"
                >
                  <span className="chip-dot" style={{ backgroundColor: t.accentColor }} />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3D Card Stack Container */}
          <div
            className={`hero-invitation-card ${currentTheme.styleClass} ${isFlipped ? 'flipped' : ''}`}
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (isFlipped ? 180 : 0)}deg)`,
            }}
          >
            {/* Front Side of Invitation */}
            <div className="card-face card-front">
              <div className="card-gold-border" />
              
              <div className="card-header">
                <span className="card-ornament">{currentTheme.ornament}</span>
                <span className="card-badge-pill">{currentTheme.badge}</span>
                <p className="card-eyebrow">{currentTheme.eyebrow}</p>
              </div>

              <div className="card-main">
                <h2 className="card-names">{currentTheme.names}</h2>
                <div className="card-gold-divider" />
                <p className="card-event">{currentTheme.eventTitle}</p>
              </div>

              <div className="card-details">
                <div className="detail-row">
                  <span className="detail-icon">📅</span>
                  <span className="detail-text">{currentTheme.date}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">⏰</span>
                  <span className="detail-text">{currentTheme.time}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">📍</span>
                  <span className="detail-text">{currentTheme.venue}</span>
                </div>
              </div>

              <div className="card-footer">
                <div className="card-live-rsvp">
                  <span className="live-dot" />
                  <span>Live Preview</span>
                </div>

                <button
                  className="card-flip-btn"
                  onClick={() => setIsFlipped(true)}
                  type="button"
                  title="View Event Schedule"
                >
                  <span>View Schedule ↺</span>
                </button>
              </div>
            </div>

            {/* Back Side of Invitation (Event Schedule & RSVP Action) */}
            <div className="card-face card-back">
              <div className="card-gold-border" />
              
              <div className="card-header">
                <span className="card-ornament">⚜ ITINERARY ⚜</span>
                <h3 className="card-back-title">Event Schedule</h3>
              </div>

              <div className="card-schedule-list">
                <div className="schedule-item">
                  <span className="sched-time">04:30 PM</span>
                  <div className="sched-info">
                    <strong>Baraat &amp; Welcome Drinks</strong>
                    <small>Royal Grand Courtyard</small>
                  </div>
                </div>
                <div className="schedule-item">
                  <span className="sched-time">06:30 PM</span>
                  <div className="sched-info">
                    <strong>Varmala &amp; Phere</strong>
                    <small>Lakeside Mandap</small>
                  </div>
                </div>
                <div className="schedule-item">
                  <span className="sched-time">08:30 PM</span>
                  <div className="sched-info">
                    <strong>Dinner &amp; Celebrations</strong>
                    <small>The Grand Ballroom</small>
                  </div>
                </div>
              </div>

              <div className="card-back-actions">
                <Link to="/create-invitation" className="card-customize-link">
                  ✦ Personalize This Design
                </Link>
                <button
                  className="card-flip-btn-back"
                  onClick={() => setIsFlipped(false)}
                  type="button"
                >
                  <span>↺ Back to Front</span>
                </button>
              </div>
            </div>
          </div>

          {/* Floating Subtle Interactive Micro-Badge */}
          <div 
          className="hero-floating-pill"
          onClick={() => setIsFlipped(!isFlipped)}
            style={{ cursor: 'pointer' }}
          >
            <span className="pill-dot" />
            <span>Click to flip &amp; preview itinerary</span>
          </div>
        </div>
      </div>
    </section>
  );
}