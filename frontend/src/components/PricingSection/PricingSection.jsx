import React from 'react';
import { Link } from 'react-router-dom';
import './PricingSection.css';

const TIERS = [
  {
    id: 'free',
    name: 'Free Starter',
    price: '₹0',
    period: 'forever free',
    badge: 'Try It Out',
    isPopular: false,
    desc: 'Perfect for small family gatherings and testing our design studio.',
    features: [
      'Access to standard template library',
      'Canvas drag-and-drop text editor',
      'Web-based RSVP link for 25 guests',
      'Standard resolution image download',
      'DigiInvite footer watermark',
    ],
    ctaText: 'Start for Free',
    ctaTo: '/register',
    btnStyle: 'btn-outline',
  },
  {
    id: 'premium',
    name: 'Premium Event',
    price: '₹499',
    period: 'one-time per event',
    badge: 'Most Popular',
    isPopular: true,
    desc: 'Ideal for Weddings, Engagements, Birthdays & Sangeet celebrations.',
    features: [
      'All 1,000+ Premium & Heritage templates',
      'AI Prompt Generator with unlimited revisions',
      'Watermark-free Ultra-HD 300 DPI PDF & JPG',
      'Unlimited WhatsApp & Web RSVP tracking',
      'Custom QR Code for physical wedding cards',
      'Event itinerary & schedule builder',
    ],
    ctaText: 'Create Premium Invite',
    ctaTo: '/create-invitation',
    btnStyle: 'btn-primary',
  },
  {
    id: 'royal',
    name: 'Royal Bespoke',
    price: '₹999',
    period: 'one-time per event',
    badge: 'Luxury Suite',
    isPopular: false,
    desc: 'The ultimate royal digital celebration suite with 3D envelope & music.',
    features: [
      'Everything in Premium Event',
      '3D Interactive Envelope with Golden Wax Seal',
      'Custom background music / Shehnai playback',
      'Bilingual dual-script invitation layout',
      'Real-time RSVP headcount analytics dashboard',
      'Priority VIP designer support',
    ],
    ctaText: 'Get Royal Suite',
    ctaTo: '/create-invitation',
    btnStyle: 'btn-outline-gold',
  },
];

export default function PricingSection() {
  return (
    <section className="pricing-section" id="pricing">
      <div className="section-inner">
        <div className="text-center pricing-header">
          <span className="section-tag">Simple &amp; Transparent</span>
          <h2 className="section-title">
            Simple Pricing for Unforgettable Celebrations
          </h2>
          <p className="section-sub">
            No subscriptions or hidden fees. Pay once per celebration and own your high-resolution invitation forever.
          </p>
        </div>

        <div className="pricing-cards-grid">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`pricing-card ${tier.isPopular ? 'popular' : ''}`}
            >
              {tier.badge && (
                <span className={`pricing-badge ${tier.isPopular ? 'popular-badge' : ''}`}>
                  {tier.badge}
                </span>
              )}

              <div className="pricing-card-header">
                <h3 className="tier-name">{tier.name}</h3>
                <p className="tier-desc">{tier.desc}</p>
                <div className="tier-price-row">
                  <span className="tier-price">{tier.price}</span>
                  <span className="tier-period">/ {tier.period}</span>
                </div>
              </div>

              <div className="pricing-divider" />

              <ul className="tier-features-list">
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <span className="feature-check">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="tier-cta-wrap">
                <Link to={tier.ctaTo} className={`btn-tier ${tier.btnStyle}`}>
                  {tier.ctaText} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="pricing-guarantee-strip">
          <div className="guarantee-item">
            <span className="g-icon">🔒</span>
            <span>Secure Razorpay / UPI Payments</span>
          </div>
          <div className="guarantee-item">
            <span className="g-icon">⚡</span>
            <span>Instant High-Res Download</span>
          </div>
          <div className="guarantee-item">
            <span className="g-icon">💬</span>
            <span>24/7 Host &amp; Guest Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
