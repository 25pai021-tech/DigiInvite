import React, { useState } from 'react';
import './FAQ.css';

const FAQS = [
    {
    q: 'How does the AI Invitation Generator work?',
    a: 'Choose your celebration type and enter your event details — theme, colour palette, names, and date. When you click "Generate My Card", our AI composes a unique, high-resolution invitation background made just for your event. It adapts to the occasion and even free-form custom themes like "vintage" or "space", keeping the centre open for your text and photo. The generated card then opens in our studio editor, where you can fine-tune fonts, colours, and details before downloading.',
  },
  {
    q: 'Can I edit the generated design and text afterwards?',
    a: 'Absolutely! Every generated invitation opens in our canvas studio editor. You can freely change fonts, reposition text, adjust color palettes, upload couple photos, and customize every fine detail.',
  },
  {
    q: 'How does guest RSVP tracking and WhatsApp delivery work?',
    a: 'Every invitation includes a personalized RSVP web link and dynamic QR code. Guests can confirm attendance with +1 headcount and dietary preferences in 1 tap without installing any apps. All responses update your live dashboard instantly.',
  },
  {
    q: 'What formats can I download my invitation in?',
    a: 'Once your payment is complete, you can download your card as a high-quality PNG, a transparent PNG, a JPG, or a print-ready PDF — as many times as you like. PNG and JPG are great for sharing on WhatsApp and social media, while the PDF is ideal for printing.',
  },
  {
    q: 'Are Indian regional languages supported?',
    a: 'Yes! DigiInvite supports Hindi, Gujarati, Tamil, Telugu, Marathi, Malayalam, Bengali, Kannada, Punjabi, and English. We also support bilingual dual-language layouts with authentic cultural Shlokas and symbols.',
  },
  {
    q: 'How do payments work? Is it secure?',
    a: 'Payments are handled securely via Razorpay with support for UPI, Google Pay, PhonePe, Paytm, credit/debit cards, and Net Banking. You pay once per celebration with no recurring subscriptions.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (i) => setOpenIdx((prev) => (prev === i ? null : i));

  return (
    <section className="faq-section" id="faq">
      <div className="section-inner">
        <div className="text-center faq-header">
          <span className="section-tag">Frequently Asked Questions</span>
          <h2 className="section-title">Everything You Need to Know</h2>
          <p className="section-sub">
            Got questions about creating your invitation, custom designs, or guest RSVPs? We have answers.
          </p>
        </div>

        <div className="faq-list">
          {FAQS.map(({ q, a }, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={q}
                className={`faq-item ${isOpen ? 'open' : ''}`}
              >
                <button
                  className="faq-q"
                  onClick={() => toggle(i)}
                  type="button"
                  aria-expanded={isOpen}
                >
                  <span className="faq-question-text">{q}</span>
                  <span className="faq-icon-wrap">
                    <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                  </span>
                </button>
                <div className="faq-a">
                  <p>{a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
