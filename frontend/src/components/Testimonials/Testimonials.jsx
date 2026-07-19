import { useEffect, useRef } from 'react';
import './Testimonials.css';

const TESTIMONIALS = [
  {
    initials: 'PA',
    name: 'Priya & Arjun Mehta',
    role: 'Wedding · Mumbai',
    stars: 5,
    text: '"We used DigiInvite for our wedding and the card looked absolutely stunning. Our guests couldn\'t believe it wasn\'t designed by a professional studio. The RSVP tracking saved us so much time!"',
  },
  {
    initials: 'RK',
    name: 'Rahul Krishnamurthy',
    role: 'Birthday Party · Bangalore',
    stars: 5,
    text: '"The AI generated our entire invitation in 30 seconds! I just had to change the photo and tweak the font. Sent it on WhatsApp to 200 guests instantly. Incredible value."',
  },
  {
    initials: 'SP',
    name: 'Sneha Patel',
    role: 'Corporate Event · Ahmedabad',
    stars: 5,
    text: '"Perfect for our corporate annual day. The editor is so smooth — felt like using Canva. The PDF export quality was excellent. Will definitely use again for future events."',
  },
];

export default function Testimonials() {
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
    <section className="testimonials" id="testimonials">
      <div className="section-inner">
        <div className="text-center">
          <span className="section-tag">Testimonials</span>
          <h2 className="section-title">
            Loved by Thousands<br />Across India
          </h2>
        </div>

        <div className="testi-grid">
          {TESTIMONIALS.map(({ initials, name, role, stars, text }, i) => (
            <div
              key={name}
              className="testi-card fade-in"
              ref={el => (cardRefs.current[i] = el)}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="testi-stars">{'★'.repeat(stars)}</div>
              <p className="testi-text">{text}</p>
              <div className="testi-author">
                <div className="testi-avatar">{initials}</div>
                <div>
                  <div className="testi-name">{name}</div>
                  <div className="testi-role">{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
