import React from 'react';
import './Stats.css';

// Honest, concrete facts about what DigiInvite actually does — no fabricated
// metrics. Each one maps to a real capability in the product.
const items = [
  {
    num: '10+',
    label: 'Indian Languages',
    desc: 'Create in your mother tongue — Hindi, Gujarati, Tamil & more',
  },
  {
    num: 'AI',
    label: 'Generated Designs',
    desc: 'A unique, high-resolution background for every event',
  },
  {
    num: '100%',
    label: 'Editable on Canvas',
    desc: 'Every text, font, colour and photo is yours to change',
  },
  {
    num: 'UPI',
    label: 'Secure Checkout',
    desc: 'Razorpay payments — UPI, cards & net banking',
  },
];

export default function Stats() {
  return (
    <section className="stats-bar" aria-label="Platform Highlights">
      <div className="stats-inner section-inner">
        {items.map(({ num, label, desc }) => (
          <div className="stat-item" key={label}>
            <div className="stat-num">{num}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-desc">{desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}