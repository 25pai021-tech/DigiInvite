import React, { useEffect, useState } from 'react';
import { fetchLandingStats } from '../../lib/fetchLandingStats';
import './Stats.css';

export default function Stats() {
  const [stats, setStats] = useState({
    curated_designs: 0,
    cultural_traditions: 0,
    rsvp_response_rate: 0,
    ai_generation_speed: 0,
  });

  useEffect(() => {
    let active = true;
    fetchLandingStats().then((data) => {
      if (active && data) {
        setStats(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const items = [
    { num: stats.curated_designs, label: 'Curated Designs', desc: 'Bespoke event themes & styles' },
    { num: stats.cultural_traditions, label: 'Cultural Traditions', desc: 'Pan-Indian & international events' },
    { num: stats.rsvp_response_rate === 0 ? '0' : `${stats.rsvp_response_rate}%`, label: 'RSVP Response Rate', desc: 'Via seamless 1-tap WhatsApp link' },
    { num: stats.ai_generation_speed === 0 ? '0' : `< ${stats.ai_generation_speed}s`, label: 'AI Generation Speed', desc: 'Prompt to tailored card draft' },
  ];

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
