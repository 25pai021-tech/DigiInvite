import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HowItWorks.css';

const STEPS = [
  {
    id: 1,
    title: '1. Choose Event & Style',
    subtitle: 'Select from 20+ occasions or create custom',
    desc: 'Pick your celebration type—Weddings, Sangeet, Birthdays, Housewarmings, or Corporate Galas. Choose your aesthetic: Royal Heritage, Minimal Modern, Botanical, or Traditional.',
    previewTitle: 'Occasion & Aesthetic Picker',
    tag: 'Step 1 of 5',
  },
  {
    id: 2,
    title: '2. Enter Event Details',
    subtitle: 'Provide names, venue, date & schedule',
    desc: 'Fill in host names, date, venue location, map links, and special instructions. Our smart formatter automatically aligns dates and times for optimal editorial layout.',
    previewTitle: 'Smart Details Formatter',
    tag: 'Step 2 of 5',
  },
  {
    id: 3,
    title: '3. AI Generates Your Card',
    subtitle: 'Bespoke design generated in < 30 seconds',
    desc: 'Our AI engine analyzes your theme, cultural symbols, and color palette to craft an exquisite, high-resolution invitation card background with perfect framing.',
    previewTitle: 'AI Prompt & Texture Engine',
    tag: 'Step 3 of 5',
  },
  {
    id: 4,
    title: '4. Customize on Live Canvas',
    subtitle: 'Drag, drop, recolor & fine-tune',
    desc: 'Edit text, swap typography from our curated Indian & international font library, upload photos, and adjust colors directly on our Fabric.js canvas editor.',
    previewTitle: 'Canvas Editor Studio',
    tag: 'Step 4 of 5',
  },
  {
    id: 5,
    title: '5. Instant RSVP & Share',
    subtitle: '1-click WhatsApp, QR code & tracking',
    desc: 'Every invitation includes an auto-generated guest RSVP link and QR code. Share instantly on WhatsApp or download ultra-high-resolution print-ready PDFs.',
    previewTitle: 'Guest RSVP & WhatsApp Delivery',
    tag: 'Step 5 of 5',
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Gentle auto-advance every 5 seconds unless user manually interacts
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % STEPS.length) + 1);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleStepClick = (stepId) => {
    setActiveStep(stepId);
    setIsAutoPlaying(false); // pause auto-cycle on manual click
  };

  return (
    <section className="how-it-works" id="how">
      <div className="section-inner">
        <div className="text-center hiw-header">
          <span className="section-tag">How DigiInvite Works</span>
          <h2 className="section-title">
            From Thought to Breathtaking Invitation <br />
            in 5 Simple Stages
          </h2>
          <p className="section-sub">
            A seamless journey combining generative AI with fine precision editing and effortless guest RSVP tracking.
          </p>
        </div>

        <div className="hiw-interactive-grid">
          {/* Left Column: Interactive Step Selector */}
          <div className="hiw-steps-nav">
            {STEPS.map((step) => {
              const isActive = activeStep === step.id;
              return (
                <div
                  key={step.id}
                  className={`hiw-step-card ${isActive ? 'active' : ''}`}
                  onClick={() => handleStepClick(step.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleStepClick(step.id)}
                >
                  <div className="step-card-indicator">
                    <span className="indicator-num">{step.id}</span>
                    {isActive && <span className="indicator-active-bar" />}
                  </div>

                  <div className="step-card-body">
                    <div className="step-card-header">
                      <h3 className="step-card-title">{step.title}</h3>
                      <span className="step-tag">{step.tag}</span>
                    </div>
                    <p className="step-card-sub">{step.subtitle}</p>
                    {isActive && <p className="step-card-desc">{step.desc}</p>}
                  </div>
                </div>
              );
            })}

            <div className="hiw-action-row">
              <Link to="/create-invitation" className="btn-primary">
                ✦ Start Your Invitation Journey →
              </Link>
            </div>
          </div>

          {/* Right Column: Dynamic Visual Stage Preview */}
          <div className="hiw-preview-column">
            <div className="hiw-stage-screen">
              <div className="stage-screen-topbar">
                <div className="screen-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div className="screen-title">
                  {STEPS[activeStep - 1].previewTitle}
                </div>
                <span className="screen-status-badge">Live Interactive Stage</span>
              </div>

              <div className="stage-content-body">
                {/* Stage 1: Choose Event */}
                {activeStep === 1 && (
                  <div className="stage-scene scene-event fade-in-scale">
                    <div className="scene-chip-grid">
                      <div className="event-chip selected">
                        <span className="chip-icon">💍</span>
                        <strong>Royal Wedding</strong>
                        <small>Heritage &amp; Mandap</small>
                      </div>
                      <div className="event-chip">
                        <span className="chip-icon">🎂</span>
                        <strong>Birthday Gala</strong>
                        <small>Modern &amp; Fun</small>
                      </div>
                      <div className="event-chip">
                        <span className="chip-icon">🌿</span>
                        <strong>Sangeet &amp; Mehndi</strong>
                        <small>Festive Floral</small>
                      </div>
                      <div className="event-chip">
                        <span className="chip-icon">🏠</span>
                        <strong>Housewarming</strong>
                        <small>Griha Pravesh</small>
                      </div>
                    </div>
                    <div className="scene-helper-note">
                      <span>✓ 20+ event presets loaded with authentic cultural motifs</span>
                    </div>
                  </div>
                )}

                {/* Stage 2: Enter Details */}
                {activeStep === 2 && (
                  <div className="stage-scene scene-details fade-in-scale">
                    <div className="mock-form">
                      <div className="mock-field">
                        <span className="field-label">Couples / Host Names</span>
                        <div className="field-input-box">
                          <span>Aditya Sharma &amp; Riya Sen</span>
                          <span className="field-check">✓</span>
                        </div>
                      </div>
                      <div className="mock-field-row">
                        <div className="mock-field">
                          <span className="field-label">Event Date</span>
                          <div className="field-input-box">Dec 18, 2026</div>
                        </div>
                        <div className="mock-field">
                          <span className="field-label">Venue</span>
                          <div className="field-input-box">Taj Lake Palace, Udaipur</div>
                        </div>
                      </div>
                      <div className="mock-field">
                        <span className="field-label">Special RSVP Note</span>
                        <div className="field-input-box">Cocktail attire requested. Valet available.</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 3: AI Creates */}
                {activeStep === 3 && (
                  <div className="stage-scene scene-ai fade-in-scale">
                    <div className="ai-generation-box">
                      <div className="ai-prompt-pill">
                        <span className="ai-sparkle">✦</span>
                        <span>AI Prompt: &quot;Ornate Gold Mandala &amp; Midnight Blue Silk Border&quot;</span>
                      </div>
                      <div className="ai-rendered-card-mock">
                        <div className="ai-card-glow" />
                        <span className="card-mini-ornament">⚜ ॐ ⚜</span>
                        <div className="card-mini-title">Aditya &amp; Riya</div>
                        <div className="card-mini-date">18 · December · 2026</div>
                        <div className="ai-render-badge">AI Render Complete (1024×1024)</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 4: Canvas Editor */}
                {activeStep === 4 && (
                  <div className="stage-scene scene-editor fade-in-scale">
                    <div className="editor-studio-mock">
                      <div className="editor-mini-toolbar">
                        <span className="tool-btn active">T Fonts</span>
                        <span className="tool-btn">🎨 Colors</span>
                        <span className="tool-btn">🖼 Images</span>
                        <span className="tool-btn">✨ Stickers</span>
                      </div>
                      <div className="editor-canvas-preview">
                        <div className="canvas-selected-box">
                          <span className="box-handle top-left" />
                          <span className="box-handle top-right" />
                          <span className="box-handle bottom-left" />
                          <span className="box-handle bottom-right" />
                          <span className="canvas-text">Aditya &amp; Riya</span>
                        </div>
                        <div className="canvas-props-pill">
                          <span>Font: Playfair Display (Bold)</span>
                          <span>Color: Gold Foil #D4AF37</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 5: Share & RSVP */}
                {activeStep === 5 && (
                  <div className="stage-scene scene-share fade-in-scale">
                    <div className="share-suite-mock">
                      <div className="share-channel-row">
                        <div className="share-action-card wa-card">
                          <span className="action-icon">💬</span>
                          <strong>WhatsApp Delivery</strong>
                          <small>1-Tap Direct Invite Link</small>
                        </div>
                        <div className="share-action-card qr-card">
                          <span className="action-icon">📱</span>
                          <strong>Dynamic QR Code</strong>
                          <small>Instant RSVP on Tables</small>
                        </div>
                      </div>
                      <div className="live-headcount-widget">
                        <div className="hc-header">
                          <span>Live RSVP Headcount</span>
                          <span className="hc-badge">Real-Time</span>
                        </div>
                        <div className="hc-bar-track">
                          <div className="hc-bar-fill" style={{ width: '88%' }} />
                        </div>
                        <div className="hc-stats">
                          <span><strong>186</strong> Attending</span>
                          <span><strong>12</strong> Regrets</span>
                          <span><strong>94%</strong> Response Rate</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
