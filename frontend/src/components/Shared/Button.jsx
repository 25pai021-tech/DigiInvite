import React from 'react';

/**
 * Shared button used across the wizard.
 * variant: 'primary' | 'ghost' | 'text'
 */
export default function Button({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  icon = null,
}) {
  return (
    <button
      type={type}
      className={`di-btn di-btn--${variant}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 14,
        height: 14,
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.4)',
        borderTopColor: '#fff',
        display: 'inline-block',
        animation: 'di-spin 0.7s linear infinite',
      }}
    >
      <style>{`@keyframes di-spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}
