import React, { useEffect, useState } from 'react';
import { fetchPremiumStatus, upgradeToPremium } from '../lib/premium';

const FREE_FEATURES = [
  'All free templates',
  'Up to 5 AI card generations',
  'Full canvas editor',
  'Download as PNG, JPG & PDF',
  'Premium templates show a watermark (remove on any card for ₹99)',
];

const PREMIUM_FEATURES = [
  'Everything in Free',
  'All premium templates — watermark-free (no ₹99 fee)',
  'Unlimited AI card generations',
  'Publish invitations as a shareable web page',
  'One-time payment · lifetime access',
];

export default function Pricing() {
  const [status, setStatus] = useState(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    let active = true;
    fetchPremiumStatus().then((s) => { if (active) setStatus(s); });
    return () => { active = false; };
  }, []);

  const isPremium = Boolean(status?.is_premium);

  const handleUpgrade = async () => {
    if (upgrading) return;
    setUpgrading(true);
    try {
      await upgradeToPremium();
      alert('You are now Premium! Enjoy watermark-free premium templates, unlimited AI generations and publishing.');
      setStatus((s) => ({ ...(s || {}), is_premium: true }));
    } catch (e) {
      if (e?.message && e.message !== 'Upgrade cancelled.') alert(e.message);
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
        <h1 style={title}>Simple, one-time pricing</h1>
        <p style={sub}>
          Start free. Upgrade once to unlock premium designs, unlimited AI generations and publishing —
          no subscription, no recurring charges.
        </p>
      </div>

      <div style={grid}>
        {/* Free */}
        <div style={card}>
          <div style={planName}>Free</div>
          <div style={priceRow}><span style={price}>₹0</span><span style={period}>/ forever</span></div>
          <ul style={list}>
            {FREE_FEATURES.map((f) => (
              <li key={f} style={li}><span style={tick}>✓</span>{f}</li>
            ))}
          </ul>
          <button style={{ ...btn, ...btnGhost }} disabled>
            {isPremium ? 'Included' : 'Your current plan'}
          </button>
        </div>

        {/* Premium */}
        <div style={{ ...card, ...cardFeatured }}>
          <div style={badge}>Most popular</div>
          <div style={planName}>Premium</div>
          <div style={priceRow}><span style={price}>₹499</span><span style={period}>one-time</span></div>
          <ul style={list}>
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} style={li}><span style={tick}>✓</span>{f}</li>
            ))}
          </ul>
          {isPremium ? (
            <button style={{ ...btn, ...btnDone }} disabled>✓ You're Premium</button>
          ) : (
            <button style={{ ...btn, ...btnPrimary }} onClick={handleUpgrade} disabled={upgrading}>
              {upgrading ? 'Opening…' : '✦ Upgrade to Premium'}
            </button>
          )}
        </div>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--muted, #888)', fontSize: 13, marginTop: 28 }}>
        Payments are processed securely by Razorpay. See our{' '}
        <a href="/refund" style={{ color: 'var(--purple, #7a1030)' }}>Refund Policy</a>.
      </p>
    </div>
  );
}

const wrap = { maxWidth: 960, margin: '0 auto', padding: 'calc(var(--nav-h) + 48px) 24px 80px' };
const title = { fontFamily: 'Playfair Display, serif', fontSize: 34, margin: '0 0 10px', color: 'var(--text)' };
const sub = { color: 'var(--muted, #888)', fontSize: 15, lineHeight: 1.6 };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'stretch' };
const card = {
  background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 18,
  padding: '28px 24px', display: 'flex', flexDirection: 'column', position: 'relative',
};
const cardFeatured = { borderColor: 'var(--purple, #7a1030)', boxShadow: '0 12px 32px rgba(122,16,48,0.14)' };
const badge = {
  position: 'absolute', top: -12, left: 24, background: 'var(--purple, #7a1030)', color: '#fff',
  fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999,
};
const planName = { fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted, #888)' };
const priceRow = { display: 'flex', alignItems: 'baseline', gap: 8, margin: '10px 0 18px' };
const price = { fontSize: 40, fontWeight: 800, color: 'var(--text)' };
const period = { color: 'var(--muted, #888)', fontSize: 14 };
const list = { listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1, display: 'grid', gap: 10 };
const li = { display: 'flex', alignItems: 'flex-start', gap: 10, color: 'var(--text2, #444)', fontSize: 14, lineHeight: 1.4 };
const tick = { color: '#16a34a', fontWeight: 800 };
const btn = { border: 'none', borderRadius: 12, padding: '12px 18px', fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%' };
const btnPrimary = { background: 'var(--purple, #7a1030)', color: '#fff' };
const btnGhost = { background: 'var(--bg3, #f1f1f1)', color: 'var(--muted, #888)', cursor: 'default' };
const btnDone = { background: '#16a34a', color: '#fff', cursor: 'default' };