import './Legal.css';

// ⚠️ Replace this with your real support email before going live.
export const SUPPORT_EMAIL = '25pai026@sxca.edu.in';
export const LAST_UPDATED = 'October 7, 2026';

/**
 * Shared shell for the legal pages so they all look the same.
 * Pass a `title` and the page body as children.
 */
export default function LegalLayout({ title, children }) {
  return (
    <div className="legal-page">
      <div className="legal-inner">
        <header className="legal-head">
          <h1 className="legal-title">{title}</h1>
          <div className="legal-updated">Last updated: {LAST_UPDATED}</div>
        </header>
        <div className="legal-body">{children}</div>
      </div>
    </div>
  );
}