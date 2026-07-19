import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero" id="home">
      {/* Left content */}
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-icon">✦</span>
          AI-powered invitations
        </div>

        <h1 className="hero-title">
          Invitations,<br />
          <span className="word-purple">reimagined</span> with<br />
          a touch of <span className="word-gold">gold.</span>
        </h1>

        <p className="hero-sub">
          Design, personalize, and share breathtaking digital
          invitations for every celebration. AI ideas in seconds.
          RSVP built in.
        </p>

        <div className="hero-cta">
          <Link to="/generator" className="btn-cta-main">
            ✦ Generate with AI
          </Link>
          <Link to="/templates" className="btn-cta-outline">
            Browse templates →
          </Link>
          <Link to="/editor" className="btn-cta-outline">
            🎨 Open editor
          </Link>
        </div>

        <div className="hero-trust">
          <span className="trust-item">
            <span className="trust-icon">👑</span>
            Premium templates
          </span>
          <span className="trust-item">
            <span className="trust-icon">👥</span>
            RSVP tracking
          </span>
          <span className="trust-item">
            <span className="trust-icon">⬇️</span>
            PNG · JPG · PDF
          </span>
        </div>
      </div>

      {/* Floating invitation cards */}
      <div className="hero-visual" aria-hidden="true">
        {/* Purple wedding card */}
        <div className="inv-card inv-card-purple">
          <div className="ic-inner">
            <div className="ic-eyebrow">Together Forever</div>
            <div className="ic-names">
              Arjun<br />&amp;<br />Meera
            </div>
            <div className="ic-divider" />
            <div className="ic-date">12 · February · 2026</div>
            <div className="ic-venue">Taj Palace, Udaipur</div>
            <div className="ic-watermark">✦ Made with DigiInvite</div>
          </div>
        </div>

        {/* Pink engagement card */}
        <div className="inv-card inv-card-pink">
          <div className="ic-inner">
            <div className="ic-eyebrow ic-eyebrow-dark">We&apos;re Engaged</div>
            <div className="ic-names ic-names-dark">
              Aanya &amp; Vir
            </div>
            <div className="ic-divider ic-divider-dark" />
            <div className="ic-date ic-date-dark">March 8 · 2026</div>
          </div>
        </div>

        {/* Gold anniversary card */}
        <div className="inv-card inv-card-gold">
          <div className="ic-inner">
            <div className="ic-eyebrow">50 Years Together</div>
            <div className="ic-names ic-names-sm">
              Raj &amp;<br />Sunita
            </div>
            <div className="ic-date">Golden Anniversary</div>
          </div>
        </div>
      </div>
    </section>
  );
}
