import './Contact.css';

export default function Contact() {
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
            <a href="mailto:tanvikasodiya@gmail.com">tanvikasodiya@gmail.com</a>
          </div>
          <div className="info-card">
            <h3>Phone</h3>
            <a href="tel:+918849795088">+91 8849795088</a>
          </div>
          <div className="info-card">
            <h3>Location</h3>
            <p>Ahmedabad, Gujarat, India</p>
          </div>
        </div>
      </div>
    </div>
  );
}