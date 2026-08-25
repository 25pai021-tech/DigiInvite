import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AICreationExperience.css';

const AI_PRESETS = [
  {
    id: 'jaipur',
    tag: 'Royal Wedding',
    title: 'Udaipur Palace & Crimson Gold',
    prompt: 'Regal Rajasthani royal palace wedding invitation, deep maroon and antique gold foil borders, hand-painted peacock and lotus motifs, ornate mandap center, high resolution editorial portrait.',
    colorPalette: ['#540B0E', '#9E2A2B', '#D4AF37', '#FFF3B0'],
    names: 'Ranveer & Shanaya',
    event: 'The Royal Vivah Ceremony',
    date: 'Dec 12, 2026 · Jagmandir Island, Udaipur',
    mood: 'Majestic & Heritage',
  },
  {
    id: 'goa',
    tag: 'Sunset Sangeet',
    title: 'Goan Coastal & Terracotta Flora',
    prompt: 'Warm coastal sunset sangeet celebration, terracotta, sage green and dusty rose watercolor botanical leaves, warm golden hour ambient lighting, elegant clean typography.',
    colorPalette: ['#E07A5F', '#3D405B', '#81B29A', '#F4F1DE'],
    names: 'Dev & Meher',
    event: 'Sunset Cocktails & Sangeet',
    date: 'Jan 22, 2027 · Cabo Serai, South Goa',
    mood: 'Festive & Romantic',
  },
  {
    id: 'safari',
    tag: 'Kids Birthday',
    title: 'Pastel Safari 1st Birthday',
    prompt: 'Gentle pastel safari animal birthday invitation, watercolor baby lion and giraffe with gold stars and celebratory balloons, soft cream background, modern serif text.',
    colorPalette: ['#CCD5AE', '#E9EDC9', '#FEFAE0', '#FAEDCD'],
    names: 'Aarav\'s 1st Birthday',
    event: 'Wild One Safari Adventure',
    date: 'Oct 05, 2026 · The Club, Mumbai',
    mood: 'Playful & Sweet',
  },
  {
    id: 'gala',
    tag: 'Corporate Gala',
    title: 'Onyx & Champagne Annual Gala',
    prompt: 'High-end black-tie corporate anniversary gala, midnight onyx textures with sharp champagne gold geometric Art Deco lines, sophisticated luxury aesthetic.',
    colorPalette: ['#121212', '#2B2D42', '#D4AF37', '#EDF2F4'],
    names: 'Apex Global 25th Gala',
    event: 'Silver Jubilee Celebration',
    date: 'Nov 19, 2026 · Grand Hyatt, Bengaluru',
    mood: 'Prestigious & Modern',
  },
];

export default function AICreationExperience() {
  const [selectedPreset, setSelectedPreset] = useState(AI_PRESETS[0]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSelectPreset = (preset) => {
    if (preset.id === selectedPreset.id) return;
    setIsSimulating(true);
    setSelectedPreset(preset);
    setTimeout(() => {
      setIsSimulating(false);
    }, 350);
  };

  return (
    <section className="ai-experience" id="ai-generator">
      <div className="section-inner">
        <div className="text-center ai-header">
          <span className="section-tag">AI Design Studio</span>
          <h2 className="section-title">
            Describe Your Dream Celebration. <br />
            Our AI Crafts the Perfect Invitation.
          </h2>
          <p className="section-sub">
            No design software required. Simply express your vision, theme, or cultural tradition, and watch our generative model compose a tailored, print-ready card.
          </p>
        </div>

        {/* Interactive Preset Chips */}
        <div className="ai-preset-chips-row">
          {AI_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className={`ai-preset-chip ${preset.id === selectedPreset.id ? 'active' : ''}`}
              onClick={() => handleSelectPreset(preset)}
              type="button"
            >
              <span className="preset-tag-badge">{preset.tag}</span>
              <span className="preset-title">{preset.title}</span>
            </button>
          ))}
        </div>

        {/* Live Simulation Playground */}
        <div className="ai-playground-box">
          <div className="playground-terminal">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="terminal-badge">✦ AI Prompt Synthesizer</span>
              <span className="terminal-state">{isSimulating ? 'Generating…' : 'Ready'}</span>
            </div>

            <div className="terminal-body">
              <span className="terminal-label">Active Prompt:</span>
              <p className="terminal-prompt-text">
                &ldquo;{selectedPreset.prompt}&rdquo;
              </p>

              <div className="terminal-meta-row">
                <div className="meta-col">
                  <span className="meta-label">Color Palette:</span>
                  <div className="meta-swatches">
                    {selectedPreset.colorPalette.map((color) => (
                      <span
                        key={color}
                        className="color-swatch"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="meta-col">
                  <span className="meta-label">Aesthetic Mood:</span>
                  <span className="meta-value">{selectedPreset.mood}</span>
                </div>
              </div>

              <div className="terminal-cta-wrap">
                <Link to="/create-invitation" className="btn-primary">
                  ✦ Generate with AI Now →
                </Link>
              </div>
            </div>
          </div>

          {/* Rendered Live Card Preview */}
          <div className={`playground-preview-card ${isSimulating ? 'rendering' : ''}`}>
            <div
              className="card-ambient-glow"
              style={{ background: `radial-gradient(circle, ${selectedPreset.colorPalette[0]}44, transparent 70%)` }}
            />

            <div
              className="rendered-card-inner"
              style={{
                borderColor: selectedPreset.colorPalette[2] || '#D4AF37',
              }}
            >
              <div className="rc-badge-top">✦ {selectedPreset.tag} ✦</div>
              <h3 className="rc-names">{selectedPreset.names}</h3>
              <div className="rc-divider" style={{ background: selectedPreset.colorPalette[2] }} />
              <p className="rc-event">{selectedPreset.event}</p>
              <p className="rc-date">{selectedPreset.date}</p>

              <div className="rc-footer-tags">
                <span>AI Prompt Generated</span>
                <span>Watermark-Free HD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
