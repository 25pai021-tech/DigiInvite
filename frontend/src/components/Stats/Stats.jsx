import React from 'react';
import './Stats.css';

const STATS = [
  { num: '1,000+', label: 'Curated Designs', desc: 'Bespoke event themes & styles' },
  { num: '20+',    label: 'Cultural Traditions', desc: 'Pan-Indian & international events' },
  { num: '98%',    label: 'RSVP Response Rate', desc: 'Via seamless 1-tap WhatsApp link' },
  { num: '< 30s',  label: 'AI Generation Speed', desc: 'Prompt to tailored card draft' },
];

export default function Stats() {
  return (
    <section className="stats-bar" aria-label="Platform Highlights">
      <div className="stats-inner section-inner">
        {STATS.map(({ num, label, desc }) => (
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
