import React, { useEffect, useRef } from 'react';

export default function ContextMenu({ x, y, onClose, items }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', (e) => e.key === 'Escape' && onClose());
    return () => window.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div ref={ref} className="editor-context-menu" style={{ left: x, top: y }}>
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="editor-context-menu-divider" />
        ) : (
          <button
            key={i}
            disabled={item.disabled}
            onClick={() => { item.onClick(); onClose(); }}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
