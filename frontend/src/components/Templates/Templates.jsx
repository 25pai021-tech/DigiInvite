import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Templates.css';

const FILTERS = ['All', 'Wedding', 'Birthday', 'Engagement', 'Corporate', 'Floral', 'Royal', 'South Indian', 'Gujarati', 'Kids'];

const TEMPLATES = [
  { id: 1, name: 'Royal Garden',   category: 'Wedding',    emoji: '🌸', style: 'tpl-purple', premium: false },
  { id: 2, name: 'Floral Bliss',   category: 'Birthday',   emoji: '🍃', style: 'tpl-green',  premium: false },
  { id: 3, name: 'Golden Sunrise', category: 'Engagement', emoji: '🪷', style: 'tpl-amber',  premium: true  },
  { id: 4, name: 'Sapphire Gala',  category: 'Corporate',  emoji: '💎', style: 'tpl-blue',   premium: false },
  { id: 5, name: 'Amber Luxe',     category: 'Wedding',    emoji: '✨', style: 'tpl-gold',   premium: true  },
  { id: 6, name: 'Rose Velvet',    category: 'Birthday',   emoji: '🌺', style: 'tpl-rose',   premium: false },
];

export default function Templates() {
  const [active, setActive] = useState('All');

  const visible = active === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === active);

  return (
    <section className="templates" id="templates">
      <div className="section-inner">
        <div className="templates-header">
          <div>
            <span className="section-tag">Template Gallery</span>
            <h2 className="section-title">
              Over 1,000 Premium<br />Invitation Designs
            </h2>
          </div>
          <p className="section-sub">
            Every style, every occasion, every culture.
            Traditional, modern, minimal, royal, and more.
          </p>
        </div>

        {/* Filters */}
        <div className="template-filters">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-btn ${active === f ? 'active' : ''}`}
              onClick={() => setActive(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="templates-grid">
          {visible.map(tpl => (
            <div key={tpl.id} className="tpl-card">
              <div className={`tpl-bg ${tpl.style}`}>
                <div className="tpl-ornament">{tpl.emoji}</div>
                <div className="tpl-name">{tpl.name}</div>
                <div className="tpl-sub">{tpl.category}</div>
              </div>
              <div className="tpl-hover-overlay">Use Template →</div>
              {tpl.premium
                ? <span className="tpl-lock">🔒 Premium</span>
                : <span className="tpl-badge">Free</span>
              }
            </div>
          ))}
        </div>

        <div className="view-all-wrap">
          <Link to="/templates" className="btn-view-all">
            View All Templates →
          </Link>
        </div>
      </div>
    </section>
  );
}
