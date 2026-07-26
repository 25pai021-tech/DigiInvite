import React from 'react';

const EVENT_TYPES = [
  { key: 'wedding', label: 'Wedding', icon: '💍' },
  { key: 'birthday', label: 'Birthday', icon: '🎂' },
  { key: 'engagement', label: 'Engagement', icon: '💐' },
  { key: 'housewarming', label: 'Housewarming', icon: '🏡' },
  { key: 'baby-shower', label: 'Baby Shower', icon: '🍼' },
  { key: 'corporate', label: 'Corporate', icon: '🏢' },
  { key: 'graduation', label: 'Graduation', icon: '🎓' },
  { key: 'anniversary', label: 'Anniversary', icon: '💞' },
  { key: 'custom', label: 'Custom', icon: '✨' },
];

export default function EventType({ value, onChange }) {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, margin: '0 0 4px' }}>
        What are we celebrating?
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '0 0 24px' }}>
        Choose the occasion this invitation is for.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 14,
        }}
      >
        {EVENT_TYPES.map((type) => {
          const selected = value === type.key;
          return (
            <button
              type="button"
              key={type.key}
              onClick={() => onChange(type.key)}
              aria-pressed={selected}
              style={{
                background: selected ? 'var(--gradient-purple)' : 'var(--color-bg-elevated)',
                border: `1px solid ${selected ? 'transparent' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '20px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                color: selected ? '#fff' : 'var(--color-text)',
                boxShadow: selected ? 'var(--shadow-glow)' : 'none',
                transition: 'all 200ms ease',
              }}
            >
              <span style={{ fontSize: 26 }}>{type.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{type.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
