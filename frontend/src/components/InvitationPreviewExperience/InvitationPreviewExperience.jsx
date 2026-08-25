import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './InvitationPreviewExperience.css';

export default function InvitationPreviewExperience() {
  const [isOpen, setIsOpen] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState('accepted'); // 'accepted' | 'declined' | null
  const [guestCount, setGuestCount] = useState(2);
  const [diet, setDiet] = useState('Vegetarian');
  const [submitted, setSubmitted] = useState(false);

  const handleToggleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setSubmitted(false);
    }
  };

  const handleRSVPSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="envelope-experience" id="experience">
      <div className="section-inner">
        <div className="text-center ee-header">
          <span className="section-tag">Interactive Recipient Experience</span>
          <h2 className="section-title">
            The Digital Unboxing Your Guests Will Love
          </h2>
          <p className="section-sub">
            Every DigiInvite arrives in a ceremonial 3D digital envelope. Experience the realistic wax seal opening and interactive RSVP below.
          </p>
        </div>

        <div className="ee-interactive-container">
          {/* 3D Envelope & Card Mechanism */}
          <div className="ee-envelope-column">
            <div className={`envelope-3d-wrapper ${isOpen ? 'open' : ''}`}>
              {/* Back Flap */}
              <div className="envelope-back" />

              {/* Card that slides up */}
              <div className="envelope-inner-card">
                <div className="inner-card-content">
                  <span className="inner-card-crest">⚜ ✦ ⚜</span>
                  <p className="inner-card-eyebrow">cordially invite you</p>
                  <h3 className="inner-card-title">Rohan &amp; Radhika</h3>
                  <div className="inner-card-gold-rule" />
                  <p className="inner-card-event">Grand Wedding &amp; Reception</p>
                  <p className="inner-card-date">Sunday, 14 February 2027</p>
                  <p className="inner-card-venue">Umaid Bhawan Palace, Jodhpur</p>

                  <div className="inner-card-actions">
                    <span className="inner-tag">✦ Sealed with DigiInvite</span>
                  </div>
                </div>
              </div>

              {/* Front Pocket */}
              <div className="envelope-front" />

              {/* Foldable Top Flap */}
              <div className="envelope-top-flap" onClick={handleToggleOpen}>
                <div className="wax-seal">
                  <span className="seal-sparkle">✦</span>
                  <span className="seal-text">DI</span>
                </div>
              </div>
            </div>

            <div className="envelope-controls">
              <button
                className="btn-toggle-envelope"
                onClick={handleToggleOpen}
                type="button"
              >
                {isOpen ? '↺ Close Envelope' : '✦ Click Wax Seal to Open Invitation'}
              </button>
            </div>
          </div>

          {/* Interactive Guest RSVP Flow */}
          <div className="ee-rsvp-column">
            <div className="guest-rsvp-mock-card">
              <div className="rsvp-mock-top">
                <span className="rsvp-live-indicator">● Guest RSVP Portal</span>
                <span className="rsvp-lock-badge">Encrypted &amp; Instant</span>
              </div>

              {!submitted ? (
                <form className="rsvp-mock-form" onSubmit={handleRSVPSubmit}>
                  <h4 className="rsvp-form-title">Will you be attending?</h4>
                  <p className="rsvp-form-sub">Kindly respond before January 20, 2027</p>

                  {/* Attendance Toggle */}
                  <div className="rsvp-choice-grid">
                    <button
                      type="button"
                      className={`rsvp-choice-btn ${rsvpStatus === 'accepted' ? 'active' : ''}`}
                      onClick={() => setRsvpStatus('accepted')}
                    >
                      <span className="choice-icon">✓</span>
                      <span>Joyfully Accept</span>
                    </button>
                    <button
                      type="button"
                      className={`rsvp-choice-btn ${rsvpStatus === 'declined' ? 'active' : ''}`}
                      onClick={() => setRsvpStatus('declined')}
                    >
                      <span className="choice-icon">✗</span>
                      <span>Regretfully Decline</span>
                    </button>
                  </div>

                  {rsvpStatus === 'accepted' && (
                    <div className="rsvp-extra-fields fade-in-scale">
                      {/* Guest Counter */}
                      <div className="rsvp-field">
                        <label className="rsvp-label">Number of Attending Guests</label>
                        <div className="counter-row">
                          <button
                            type="button"
                            className="counter-btn"
                            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                          >
                            –
                          </button>
                          <span className="counter-val">{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</span>
                          <button
                            type="button"
                            className="counter-btn"
                            onClick={() => setGuestCount(guestCount + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Meal Preference */}
                      <div className="rsvp-field">
                        <label className="rsvp-label">Dietary Preferences</label>
                        <div className="diet-chips">
                          {['Vegetarian', 'Jain', 'Non-Vegetarian'].map((d) => (
                            <button
                              key={d}
                              type="button"
                              className={`diet-chip ${diet === d ? 'active' : ''}`}
                              onClick={() => setDiet(d)}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn-submit-rsvp">
                    Confirm RSVP Response →
                  </button>
                </form>
              ) : (
                <div className="rsvp-success-view fade-in-scale">
                  <div className="success-icon">✓</div>
                  <h4>RSVP Confirmed!</h4>
                  <p>
                    Thank you! The host has been notified directly. You will receive directions &amp; event updates via WhatsApp.
                  </p>
                  <button
                    type="button"
                    className="btn-reset-demo"
                    onClick={() => setSubmitted(false)}
                  >
                    ↺ Reset Interactive Demo
                  </button>
                </div>
              )}

              <div className="rsvp-footer-cta">
                <Link to="/create-invitation" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  ✦ Create Your Custom Event &amp; RSVP →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
