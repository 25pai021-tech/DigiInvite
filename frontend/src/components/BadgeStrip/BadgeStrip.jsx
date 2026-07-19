import './BadgeStrip.css';

const BADGES = [
  { icon: '🔒', label: 'Secure Razorpay Payments' },
  { icon: '⚡', label: 'Ready in Under 2 Minutes' },
  { icon: '📱', label: 'Works on All Devices' },
  { icon: '🌐', label: '20+ Indian Languages' },
];

export default function BadgeStrip() {
  return (
    <div className="badge-strip">
      {BADGES.map(({ icon, label }) => (
        <div className="badge-item" key={label}>
          <span className="badge-icon">{icon}</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
