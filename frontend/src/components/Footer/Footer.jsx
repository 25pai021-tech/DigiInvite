import { Link } from 'react-router-dom';
import './Footer.css';

const LINKS = {
  Product: [
    { label: 'Features',         to: '/#features'   },
    { label: 'Template Gallery', to: '/templates'    },
    { label: 'Pricing',          to: '/pricing'      },
    { label: 'RSVP System',      to: '/#features'   },
    { label: 'QR Code Generator',to: '/#features'   },
  ],
  Events: [
    { label: 'Wedding Invitations', to: '/templates?cat=Wedding'    },
    { label: 'Birthday Cards',      to: '/templates?cat=Birthday'   },
    { label: 'Engagement',          to: '/templates?cat=Engagement' },
    { label: 'Baby Shower',         to: '/templates'                },
    { label: 'Corporate Events',    to: '/templates?cat=Corporate'  },
  ],
  Company: [
    { label: 'About Us',        to: '/about'   },
    { label: 'Contact',         to: '/contact' },
    { label: 'Privacy Policy',  to: '/privacy' },
    { label: 'Terms of Service',to: '/terms'   },
    { label: 'Refund Policy',   to: '/refund'  },
  ],
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              Digi<span>Invite</span>
            </Link>
            <p>
              AI-powered digital invitation platform for Indian and international
              events. Create, customise, and share beautiful invitations in minutes.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div className="footer-col" key={title}>
              <h5>{title}</h5>
              <ul>
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p>© 2026 DigiInvite. Made with ♥ in India.</p>
          <div className="footer-socials">
            <a className="social-link" href="#" aria-label="WhatsApp">💬</a>
            <a className="social-link" href="#" aria-label="Instagram">📸</a>
            <a className="social-link" href="#" aria-label="Facebook">👤</a>
            <a className="social-link" href="#" aria-label="YouTube">▶</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
