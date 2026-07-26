import React from 'react';
import Button from '../Shared/Button';

export default function SuccessPage({ requestId, onGoDashboard, onViewRequests }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div
        style={{
          width: 76,
          height: 76,
          margin: '0 auto 22px',
          borderRadius: '50%',
          background: 'var(--gradient-purple)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 34,
          color: '#fff',
          boxShadow: 'var(--shadow-glow)',
          animation: 'di-pop 480ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <style>{`
          @keyframes di-pop {
            0% { transform: scale(0.4); opacity: 0; }
            60% { transform: scale(1.08); opacity: 1; }
            100% { transform: scale(1); }
          }
        `}</style>
        ✓
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, margin: '0 0 8px' }}>
        Your request has been submitted
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14, maxWidth: 380, margin: '0 auto 26px' }}>
        You'll receive an email once your design is ready.
      </p>

      <div
        style={{
          display: 'inline-flex',
          gap: 26,
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-soft)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 28px',
          marginBottom: 30,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-text-faint)', marginBottom: 4 }}>REQUEST ID</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-gold)' }}>{requestId}</div>
        </div>
        <div style={{ width: 1, background: 'var(--color-border)' }} />
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-text-faint)', marginBottom: 4 }}>ESTIMATED DELIVERY</div>
          <div style={{ fontSize: 14 }}>48 Hours</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Button variant="ghost" onClick={onViewRequests}>My Requests</Button>
        <Button variant="primary" onClick={onGoDashboard}>Dashboard</Button>
      </div>
    </div>
  );
}
