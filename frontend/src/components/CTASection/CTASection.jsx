import { Link } from 'react-router-dom';
import './CTASection.css';

export default function CTASection() {
  return (
    <div className="cta-section">
      <div className="cta-inner">
        <h2>Your Invitation is<br />Just Minutes Away</h2>
        <p>
          Join thousands of families across India who&apos;ve already sent
          stunning digital invitations with DigiInvite.
          No design skills. No hassle.
        </p>
        <div className="cta-btns">
          <Link to="/generator" className="btn-cta-main">
            ✦ Create Your Invitation
          </Link>
          <Link to="/templates" className="btn-cta-outline">
            Browse Templates
          </Link>
        </div>
      </div>
    </div>
  );
}
