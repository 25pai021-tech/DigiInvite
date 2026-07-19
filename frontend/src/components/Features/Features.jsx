import { useEffect, useRef } from 'react';
import './Features.css';

const FEATURES = [
  {
    icon: '✨',
    title: 'AI Invitation Generator',
    desc: 'Fill in your event details and let AI craft a stunning invitation tailored to your theme, language, and style — in under 30 seconds.',
  },
  {
    icon: '🎨',
    title: 'Canvas-Style Editor',
    desc: 'Drag, drop, resize, and personalise with our powerful Fabric.js editor. Change fonts, colors, photos, and backgrounds with ease.',
  },
  {
    icon: '📱',
    title: 'Multi-Format Preview',
    desc: 'Preview your invitation as a desktop card, Instagram story, or WhatsApp image — perfectly sized for every platform.',
  },
  {
    icon: '✉️',
    title: 'Smart RSVP System',
    desc: 'Each invitation gets a unique RSVP page. Track confirmations, headcounts, and messages — all from your dashboard in real time.',
  },
  {
    icon: '🔗',
    title: 'QR Code & Easy Sharing',
    desc: 'Auto-generated QR codes link directly to your RSVP page. Share instantly via WhatsApp, Instagram, Email, or a direct link.',
  },
  {
    icon: '📥',
    title: 'Download in Any Format',
    desc: 'Export as PNG, JPEG, PDF, Instagram Story, or WhatsApp image — all in high resolution, watermark-free after payment.',
  },
];

export default function Features() {
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.12 }
    );
    cardRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="features" id="features">
      <div className="section-inner">
        <div className="text-center">
          <span className="section-tag">Why DigiInvite</span>
          <h2 className="section-title">
            Everything You Need to<br />Create Perfect Invitations
          </h2>
          <p className="section-sub">
            From AI generation to RSVP tracking — every tool you need,
            in one elegant platform.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className="feature-card fade-in"
              ref={el => (cardRefs.current[i] = el)}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="feature-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
