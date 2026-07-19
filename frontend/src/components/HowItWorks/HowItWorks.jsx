import { useEffect, useRef } from 'react';
import './HowItWorks.css';

const STEPS = [
  {
    num: '1',
    title: 'Choose Your Event',
    desc: 'Select from weddings, birthdays, engagements, corporate events, and 15+ more event types.',
  },
  {
    num: '2',
    title: 'Fill the Details',
    desc: 'Enter names, date, venue, and any special instructions. AI handles the rest.',
  },
  {
    num: '3',
    title: 'Customise & Edit',
    desc: 'Pick a template and personalise it with our drag-and-drop editor. Upload your own photos.',
  },
  {
    num: '4',
    title: 'Share & Track',
    desc: 'Download, share on WhatsApp or social media, and track RSVPs from your dashboard.',
  },
];

export default function HowItWorks() {
  const stepRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.15 }
    );
    stepRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="how-it-works" id="how">
      <div className="section-inner">
        <div className="text-center">
          <span className="section-tag">The Process</span>
          <h2 className="section-title">
            From Idea to Invitation<br />in Four Steps
          </h2>
          <p className="section-sub">
            No design skills, no software downloads. Just beautiful invitations.
          </p>
        </div>

        <div className="steps-row">
          <div className="steps-connector" aria-hidden="true" />
          {STEPS.map(({ num, title, desc }, i) => (
            <div
              key={num}
              className="step fade-in"
              ref={el => (stepRefs.current[i] = el)}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="step-num">{num}</div>
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
