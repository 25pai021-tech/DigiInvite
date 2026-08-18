import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'sending' | 'sent' | 'error'

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      // TODO: replace with your actual backend endpoint
      // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(form) });
      await new Promise((res) => setTimeout(res, 800)); // temp fake delay
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <div className="contact-star">✦</div>
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Reach out anytime.</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-card">
            <h3>Email</h3>
            <a href="mailto:support@digiinvite.com">support@digiinvite.com</a>
          </div>
          <div className="info-card">
            <h3>Phone</h3>
            <a href="tel:+911234567890">+91 12345 67890</a>
          </div>
          <div className="info-card">
            <h3>Location</h3>
            <p>Ahmedabad, Gujarat, India</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Message
            <textarea
              name="message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>

          {status === 'sent' && <p className="form-success">Message sent! We'll get back to you soon.</p>}
          {status === 'error' && <p className="form-error">Something went wrong. Please try again.</p>}
        </form>
      </div>
    </div>
  );
}