import React from 'react';
import { Link } from 'react-router-dom';
import './CTASection.css';

export default function CTASection() {
  return (
    <section className="cta-final-section" aria-label="Create Your Invitation">
      <div className="cta-glow-backdrop" aria-hidden="true" />
      
      <div className="section-inner">
        <div className="cta-luxury-card">
          <div className="cta-card-gold-border" />
          
          <span className="cta-crest-ornament">⚜ ✦ ⚜</span>
          <h2 className="cta-heading">
            Your Unforgettable Celebration <br />
            Starts with a Single Invitation
          </h2>
          <p className="cta-subheading">
            Join thousands of families and event hosts creating bespoke, culturally authentic digital invitations in minutes.
          </p>

          <div className="cta-actions-group">
            <Link to="/create-invitation" className="btn-cta-gold">
              <span>✦ Create Your Invitation Now</span>
              <span className="btn-arrow">→</span>
            </Link>

            <Link to="/templates" className="btn-cta-ghost">
              Browse Template Gallery
            </Link>
          </div>

          <div className="cta-trust-items">
            <span>✓ No design software required</span>
            <span>✓ Instant WhatsApp RSVP tracking</span>
            <span>✓ Ultra-HD print-ready export</span>
          </div>
        </div>
      </div>
    </section>
  );
}
