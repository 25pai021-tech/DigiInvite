import { useEffect } from 'react';

// Light "content protection" deterrents. These stop casual copying
// (right-click "Save image", drag-to-desktop, Ctrl+S / Ctrl+P / view-source).
// NOTE: this is NOT real security — screenshots and DevTools can never be
// fully blocked in a browser.
export function useContentProtection() {
  useEffect(() => {
    const isMedia = (el) =>
      el && (el.tagName === 'IMG' || el.tagName === 'CANVAS' || el.closest?.('.protect-media'));

    const onContextMenu = (e) => { if (isMedia(e.target)) e.preventDefault(); };
    const onDragStart = (e) => { if (e.target && e.target.tagName === 'IMG') e.preventDefault(); };
    const onKeyDown = (e) => {
      const k = (e.key || '').toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      if (
        k === 'f12' ||
        (ctrl && k === 's') ||
        (ctrl && k === 'p') ||
        (ctrl && k === 'u') ||
        (ctrl && e.shiftKey && (k === 'i' || k === 'j' || k === 'c'))
      ) { e.preventDefault(); e.stopPropagation(); }
    };

    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);
}