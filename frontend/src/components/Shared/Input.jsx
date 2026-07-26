import React from 'react';

/**
 * Text input with label + inline validation message.
 */
export function Input({ label, required, error, ...rest }) {
  return (
    <div className="di-field">
      {label && (
        <label className="di-label">
          {label}
          {required && <span className="di-label__required">*</span>}
        </label>
      )}
      <input className={`di-input ${error ? 'di-input--error' : ''}`} {...rest} />
      {error && <p className="di-error-text">{error}</p>}
    </div>
  );
}

/**
 * Multi-line text field, used for instructions / special messages.
 */
export function Textarea({ label, required, error, ...rest }) {
  return (
    <div className="di-field">
      {label && (
        <label className="di-label">
          {label}
          {required && <span className="di-label__required">*</span>}
        </label>
      )}
      <textarea className={`di-textarea ${error ? 'di-textarea--error' : ''}`} {...rest} />
      {error && <p className="di-error-text">{error}</p>}
    </div>
  );
}

/**
 * Native select, styled to match the rest of the wizard.
 */
export function Select({ label, required, error, children, ...rest }) {
  return (
    <div className="di-field">
      {label && (
        <label className="di-label">
          {label}
          {required && <span className="di-label__required">*</span>}
        </label>
      )}
      <select className="di-select" {...rest}>
        {children}
      </select>
      {error && <p className="di-error-text">{error}</p>}
    </div>
  );
}
