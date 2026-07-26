import React from 'react';

export default function Card({ children, className = '', ...rest }) {
  return (
    <div className={`di-card ${className}`} {...rest}>
      {children}
    </div>
  );
}
