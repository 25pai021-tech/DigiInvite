import { useState } from 'react';
import './FAQ.css';

const FAQS = [
  {
    q: 'Do I need any design experience to use DigiInvite?',
    a: 'Not at all. DigiInvite is designed for everyone. Simply choose a template, fill in your event details, and the AI does the heavy lifting. You can also customise everything using our drag-and-drop editor — no design background required.',
  },
  {
    q: 'What file formats can I download my invitation in?',
    a: 'Depending on your plan, you can download as PNG, JPEG, PDF, Instagram Story (1080×1920), and WhatsApp optimised image. Animated plans also include MP4 video exports.',
  },
  {
    q: 'How does the RSVP system work?',
    a: 'Every invitation automatically gets a unique RSVP page hosted by DigiInvite. Guests can open it via a QR code or direct link, confirm attendance, add their name, phone number, and how many people are joining. Track all responses in real time from your dashboard.',
  },
  {
    q: 'Can I share my invitation on WhatsApp?',
    a: 'Yes! After creating your invitation, share it directly via WhatsApp with a single tap. You can also share via Email, Instagram, Facebook, or copy a direct link — all from within DigiInvite.',
  },
  {
    q: 'Are payments secure? What methods are accepted?',
    a: 'All payments are processed securely through Razorpay, one of India\'s most trusted payment gateways. You can pay with UPI, credit cards, debit cards, net banking, and wallets. We never store your payment information.',
  },
  {
    q: 'Can I create invitations in regional Indian languages?',
    a: 'Yes! DigiInvite supports multiple languages including Hindi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali, and more. Simply select your preferred language when filling in invitation details.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = i => setOpenIdx(prev => (prev === i ? null : i));

  return (
    <section className="faq" id="faq">
      <div className="section-inner">
        <div className="text-center">
          <span className="section-tag">FAQ</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>

        <div className="faq-list">
          {FAQS.map(({ q, a }, i) => (
            <div
              key={i}
              className={`faq-item ${openIdx === i ? 'open' : ''}`}
            >
              <button className="faq-q" onClick={() => toggle(i)}>
                <span>{q}</span>
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-a">
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
