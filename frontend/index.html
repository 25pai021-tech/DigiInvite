<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>DigiInvite – AI Powered Digital Invitations</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ─── THEME TOKENS ─── */
:root[data-theme="light"] {
  --bg: #F5F0FF;
  --bg2: #FFFFFF;
  --bg3: #EDE8FA;
  --nav-bg: rgba(255,255,255,0.85);
  --nav-border: rgba(0,0,0,0.07);
  --text: #111018;
  --text2: #3d3856;
  --muted: #6b6585;
  --card-bg: #FFFFFF;
  --card-border: rgba(0,0,0,0.07);
  --card-shadow: 0 4px 24px rgba(108,59,255,0.08);
  --feature-icon-bg: #EDE8FA;
  --section-alt: #F8F5FF;
  --divider: rgba(0,0,0,0.08);
  --footer-bg: #1a1035;
  --footer-text: rgba(255,255,255,0.7);
  --toggle-bg: #e2ddf5;
  --toggle-knob: #6C3BFF;
  --badge-bg: rgba(108,59,255,0.07);
  --badge-border: rgba(108,59,255,0.15);
  --badge-text: #4a2fd4;
  --hero-card-shadow: 0 32px 80px rgba(108,59,255,0.25);
  --faq-bg: #FFFFFF;
  --filter-inactive: #f0ecff;
  --filter-inactive-text: #6b6585;
  --stat-num-color: #111018;
}
:root[data-theme="dark"] {
  --bg: #0D0A1A;
  --bg2: #130F24;
  --bg3: #1C1535;
  --nav-bg: rgba(13,10,26,0.85);
  --nav-border: rgba(255,255,255,0.08);
  --text: #F8F6FF;
  --text2: #c8c0e8;
  --muted: rgba(255,255,255,0.55);
  --card-bg: rgba(255,255,255,0.05);
  --card-border: rgba(255,255,255,0.1);
  --card-shadow: 0 4px 32px rgba(0,0,0,0.3);
  --feature-icon-bg: rgba(108,59,255,0.18);
  --section-alt: #130F24;
  --divider: rgba(255,255,255,0.08);
  --footer-bg: #080510;
  --footer-text: rgba(255,255,255,0.55);
  --toggle-bg: rgba(255,255,255,0.1);
  --toggle-knob: #D4AF37;
  --badge-bg: rgba(108,59,255,0.15);
  --badge-border: rgba(108,59,255,0.3);
  --badge-text: #b49dff;
  --hero-card-shadow: 0 32px 80px rgba(0,0,0,0.6);
  --faq-bg: rgba(255,255,255,0.04);
  --filter-inactive: rgba(255,255,255,0.06);
  --filter-inactive-text: rgba(255,255,255,0.5);
  --stat-num-color: #F8F6FF;
}

/* ─── CONSTANTS ─── */
:root {
  --purple: #6C3BFF;
  --purple-light: #8B5CFF;
  --purple-dark: #4A1FE8;
  --purple-glow: rgba(108,59,255,0.3);
  --gold: #D4AF37;
  --gold-light: #F0CE5E;
  --radius: 20px;
  --radius-sm: 14px;
}

html { scroll-behavior: smooth; }
body {
  font-family: 'Inter', sans-serif;
  background: var(--bg);
  color: var(--text);
  overflow-x: hidden;
  line-height: 1.6;
  transition: background 0.3s, color 0.3s;
}
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--purple); border-radius: 3px; }

/* ─── NAV ─── */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 40px;
  background: var(--nav-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--nav-border);
  transition: background 0.3s, border-color 0.3s;
}
.nav-logo {
  display: flex; align-items: center; gap: 10px;
  text-decoration: none;
}
.nav-logo-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, var(--purple), var(--purple-dark));
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}
.nav-logo-text {
  font-family: 'Inter', sans-serif; font-size: 1.1rem; font-weight: 700;
  color: var(--text);
}
.nav-logo-text span { color: var(--purple); }
.nav-links { display: flex; gap: 32px; list-style: none; }
.nav-links a {
  text-decoration: none; color: var(--muted);
  font-size: 0.9rem; font-weight: 500;
  transition: color 0.2s;
}
.nav-links a:hover { color: var(--text); }
.nav-actions { display: flex; gap: 10px; align-items: center; }

/* THEME TOGGLE */
.theme-toggle {
  width: 52px; height: 28px; border-radius: 50px;
  background: var(--toggle-bg); border: none; cursor: pointer;
  position: relative; transition: background 0.3s; flex-shrink: 0;
  display: flex; align-items: center; padding: 3px;
}
.theme-knob {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--toggle-knob);
  transition: transform 0.3s, background 0.3s;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem;
}
[data-theme="dark"] .theme-knob { transform: translateX(24px); }
.btn-ghost {
  background: none; border: none; color: var(--muted);
  font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 500;
  cursor: pointer; padding: 8px 16px; border-radius: 50px;
  transition: color 0.2s;
}
.btn-ghost:hover { color: var(--text); }
.btn-primary {
  background: linear-gradient(135deg, var(--purple), var(--purple-dark));
  border: none; color: #fff;
  font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 600;
  cursor: pointer; padding: 10px 22px; border-radius: 50px;
  box-shadow: 0 4px 20px var(--purple-glow);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px var(--purple-glow); }
.hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; }
.hamburger span { width: 22px; height: 2px; background: var(--text); border-radius: 2px; }

/* ─── HERO ─── */
.hero {
  min-height: 100vh;
  padding: 130px 48px 80px;
  display: flex; align-items: center;
  position: relative; overflow: hidden;
  background: var(--bg);
}
/* light-mode hero gradient */
[data-theme="light"] .hero {
  background: linear-gradient(140deg, #f0ebff 0%, #faf8ff 40%, #ffe8f5 80%, #fff5e0 100%);
}
[data-theme="dark"] .hero {
  background: radial-gradient(ellipse 70% 60% at 60% 40%, rgba(108,59,255,0.15) 0%, transparent 70%), var(--bg);
}
.hero-content { max-width: 600px; z-index: 2; position: relative; }

.hero-badge {
  display: inline-flex; align-items: center; gap: 7px;
  background: var(--badge-bg); border: 1px solid var(--badge-border);
  padding: 6px 16px; border-radius: 50px; margin-bottom: 30px;
  font-size: 0.82rem; font-weight: 600; color: var(--badge-text);
  letter-spacing: 0.02em;
}
.hero-badge-icon { font-size: 0.9rem; }

.hero h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.8rem, 5.5vw, 4.6rem);
  font-weight: 800; line-height: 1.12; letter-spacing: -2px;
  margin-bottom: 26px; color: var(--text);
}
.hero h1 .word-purple { color: var(--purple); font-style: italic; }
.hero h1 .word-gold { color: var(--gold); }

.hero-sub {
  font-size: 1.05rem; color: var(--muted); line-height: 1.75;
  margin-bottom: 40px; max-width: 500px;
}

/* CTA BUTTONS */
.hero-cta { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 32px; }
.btn-cta-main {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, var(--purple-light), var(--purple-dark));
  color: #fff; border: none; border-radius: 50px;
  font-family: 'Inter', sans-serif; font-size: 0.95rem; font-weight: 600;
  padding: 14px 28px; cursor: pointer;
  box-shadow: 0 6px 28px var(--purple-glow);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-cta-main:hover { transform: translateY(-3px); box-shadow: 0 10px 36px var(--purple-glow); }
.btn-cta-outline {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--card-bg); color: var(--text);
  border: 1.5px solid var(--card-border); border-radius: 50px;
  font-family: 'Inter', sans-serif; font-size: 0.95rem; font-weight: 500;
  padding: 14px 24px; cursor: pointer;
  box-shadow: var(--card-shadow);
  transition: transform 0.2s, border-color 0.2s;
}
.btn-cta-outline:hover { transform: translateY(-3px); border-color: var(--purple); }

/* TRUST BADGES */
.hero-trust { display: flex; gap: 24px; flex-wrap: wrap; }
.trust-item {
  display: flex; align-items: center; gap: 7px;
  font-size: 0.85rem; color: var(--muted); font-weight: 500;
}
.trust-icon { font-size: 0.9rem; }

/* ─── HERO VISUAL ─── */
.hero-visual {
  position: absolute; right: 40px; top: 50%; transform: translateY(-50%);
  width: min(50%, 580px); height: 560px;
  pointer-events: none;
}
.inv-card {
  position: absolute; border-radius: 24px;
  box-shadow: var(--hero-card-shadow);
  overflow: hidden;
  animation: floatCard 5.5s ease-in-out infinite;
}
/* BIG purple wedding card */
.inv-card-1 {
  width: 280px; height: 380px;
  right: 60px; top: 40px;
  background: linear-gradient(155deg, #3b1fa0 0%, #5a2dce 40%, #2d0f7a 100%);
  animation-delay: 0s; --rot: -5deg; --rot2: -2deg;
  z-index: 2;
}
/* Pink engagement card */
.inv-card-2 {
  width: 240px; height: 310px;
  right: 300px; top: 160px;
  background: linear-gradient(155deg, #f8c8d8 0%, #f5b8cc 50%, #f2a0b8 100%);
  animation-delay: -2.5s; --rot: 6deg; --rot2: 9deg;
  z-index: 1;
}
/* Third card — gold/bronze */
.inv-card-3 {
  width: 200px; height: 270px;
  right: 20px; top: 230px;
  background: linear-gradient(155deg, #b8860b 0%, #d4af37 50%, #a07810 100%);
  animation-delay: -4s; --rot: -3deg; --rot2: 0deg;
  z-index: 3;
}
@keyframes floatCard {
  0%, 100% { transform: translateY(0px) rotate(var(--rot, -4deg)); }
  50% { transform: translateY(-16px) rotate(var(--rot2, 0deg)); }
}
.inv-card-inner { padding: 28px; height: 100%; display: flex; flex-direction: column; }
/* Purple card styles */
.inv-card-1 .ic-eyebrow {
  font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(255,255,255,0.55); margin-bottom: 20px;
}
.inv-card-1 .ic-names {
  font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 700;
  color: #fff; line-height: 1.15; margin-bottom: 16px;
  text-align: center;
}
.inv-card-1 .ic-divider { width: 40px; height: 2px; background: rgba(255,255,255,0.3); margin: 0 auto 14px; }
.inv-card-1 .ic-date { font-size: 0.75rem; color: rgba(255,255,255,0.7); text-align: center; letter-spacing: 0.05em; }
.inv-card-1 .ic-venue { font-size: 0.72rem; color: rgba(255,255,255,0.55); text-align: center; margin-top: 6px; }
.inv-card-1 .ic-watermark {
  margin-top: auto; font-size: 0.6rem; letter-spacing: 0.1em;
  color: rgba(255,255,255,0.3); text-align: center; text-transform: uppercase;
  display: flex; align-items: center; justify-content: center; gap: 5px;
}
/* Pink card styles */
.inv-card-2 .ic-eyebrow {
  font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase;
  color: rgba(80,40,60,0.55); margin-bottom: 16px;
}
.inv-card-2 .ic-names {
  font-family: 'Playfair Display', serif; font-style: italic;
  font-size: 1.6rem; font-weight: 600; color: #4a1f38; line-height: 1.3;
}
.inv-card-2 .ic-divider { width: 32px; height: 1.5px; background: rgba(150,60,90,0.3); margin: 12px 0; }
.inv-card-2 .ic-date { font-size: 0.72rem; color: rgba(80,40,60,0.6); letter-spacing: 0.04em; }
/* Gold card styles */
.inv-card-3 .ic-eyebrow {
  font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(255,255,255,0.55); margin-bottom: 14px;
}
.inv-card-3 .ic-names {
  font-family: 'Playfair Display', serif; font-style: italic;
  font-size: 1.4rem; font-weight: 600; color: #fff; line-height: 1.3;
}
.inv-card-3 .ic-date { font-size: 0.7rem; color: rgba(255,255,255,0.65); margin-top: 10px; letter-spacing: 0.04em; }

/* ─── STATS ─── */
.stats-bar {
  background: var(--bg2);
  border-top: 1px solid var(--divider);
  border-bottom: 1px solid var(--divider);
  padding: 48px;
  transition: background 0.3s;
}
.stats-inner { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 36px; }
.stat-item { text-align: center; }
.stat-num {
  font-family: 'Playfair Display', serif; font-size: 2.8rem; font-weight: 700;
  color: var(--stat-num-color); line-height: 1;
  transition: color 0.3s;
}
[data-theme="light"] .stat-num { background: linear-gradient(135deg, var(--purple), var(--purple-dark)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
[data-theme="dark"] .stat-num { background: linear-gradient(135deg, #fff, var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.stat-label { font-size: 0.88rem; color: var(--muted); margin-top: 6px; font-weight: 500; }

/* ─── SECTIONS ─── */
section { padding: 96px 48px; }
.section-inner { max-width: 1160px; margin: 0 auto; }
.section-tag {
  display: inline-block; font-size: 0.75rem; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--purple);
  margin-bottom: 14px;
}
[data-theme="light"] .section-tag { color: var(--purple); }
[data-theme="dark"] .section-tag { color: #a87fff; }
.section-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.9rem, 3.5vw, 2.8rem); font-weight: 700; line-height: 1.2;
  margin-bottom: 18px; letter-spacing: -0.5px; color: var(--text);
}
.section-sub { color: var(--muted); font-size: 1rem; max-width: 520px; line-height: 1.75; }
.text-center { text-align: center; }
.text-center .section-sub { margin: 0 auto; }

/* ─── FEATURES ─── */
.features { background: var(--section-alt); transition: background 0.3s; }
.features-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px; margin-top: 60px;
}
.feature-card {
  background: var(--card-bg); border: 1px solid var(--card-border);
  border-radius: var(--radius); padding: 36px;
  box-shadow: var(--card-shadow);
  transition: transform 0.3s, box-shadow 0.3s, background 0.3s;
}
.feature-card:hover { transform: translateY(-5px); box-shadow: 0 16px 48px rgba(108,59,255,0.12); }
.feature-icon {
  width: 52px; height: 52px; border-radius: 14px;
  background: var(--feature-icon-bg);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; margin-bottom: 22px;
  transition: background 0.3s;
}
[data-theme="light"] .feature-icon { box-shadow: 0 4px 14px rgba(108,59,255,0.12); }
.feature-card h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 600; margin-bottom: 10px; color: var(--text); }
.feature-card p { color: var(--muted); font-size: 0.93rem; line-height: 1.72; }

/* ─── HOW IT WORKS ─── */
.how { background: var(--bg2); transition: background 0.3s; }
.steps-row { display: flex; gap: 0; margin-top: 64px; position: relative; flex-wrap: wrap; }
.steps-row::before {
  content: ''; position: absolute; top: 36px;
  left: calc(12.5% + 12px); right: calc(12.5% + 12px);
  height: 1px;
  background: linear-gradient(90deg, var(--purple), var(--gold), var(--purple));
  opacity: 0.25;
}
.step { flex: 1; min-width: 200px; text-align: center; padding: 0 16px; }
.step-num {
  width: 72px; height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, var(--purple-light), var(--purple-dark));
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: #fff;
  margin: 0 auto 24px;
  box-shadow: 0 8px 28px var(--purple-glow);
}
.step h4 { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 600; margin-bottom: 10px; color: var(--text); }
.step p { color: var(--muted); font-size: 0.88rem; line-height: 1.65; }

/* ─── TEMPLATES ─── */
.templates { background: var(--section-alt); transition: background 0.3s; }
.template-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 36px; margin-bottom: 36px; }
.filter-btn {
  padding: 8px 18px; border-radius: 50px; font-size: 0.85rem; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
  border: 1px solid var(--card-border);
  background: var(--filter-inactive); color: var(--filter-inactive-text);
  font-family: 'Inter', sans-serif;
}
.filter-btn.active, .filter-btn:hover {
  background: var(--purple); border-color: var(--purple); color: #fff;
}
.templates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 18px; }
.tpl-card {
  border-radius: 16px; overflow: hidden; position: relative; cursor: pointer;
  aspect-ratio: 3/4; transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid var(--card-border);
}
.tpl-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
.tpl-bg {
  width: 100%; height: 100%; display: flex; flex-direction: column;
  align-items: center; justify-content: center; padding: 24px; position: relative;
}
.tpl-1 { background: linear-gradient(145deg, #1a0535, #3b0f6e); }
.tpl-2 { background: linear-gradient(145deg, #0a1a10, #0d3320); }
.tpl-3 { background: linear-gradient(145deg, #1a0a05, #3d1505); }
.tpl-4 { background: linear-gradient(145deg, #05101a, #0d2840); }
.tpl-5 { background: linear-gradient(145deg, #1a1505, #3d3310); }
.tpl-6 { background: linear-gradient(145deg, #1a050d, #3d0f1f); }
.tpl-name { font-family: 'Playfair Display', serif; font-style: italic; font-size: 1.05rem; color: #fff; text-align: center; margin-bottom: 6px; }
.tpl-sub { font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold); opacity: 0.85; }
.tpl-ornament { color: var(--gold); font-size: 1.3rem; margin-bottom: 12px; opacity: 0.75; }
.tpl-badge {
  position: absolute; top: 10px; right: 10px;
  background: rgba(212,175,55,0.2); border: 1px solid rgba(212,175,55,0.4);
  color: var(--gold); font-size: 0.62rem; font-weight: 700;
  padding: 3px 9px; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.06em;
}
.tpl-lock {
  position: absolute; top: 10px; right: 10px;
  background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.15);
  color: #fff; font-size: 0.7rem; padding: 3px 9px; border-radius: 50px;
}
.tpl-hover-overlay {
  position: absolute; inset: 0;
  background: rgba(108,59,255,0.88);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.3s;
  font-weight: 600; font-size: 0.88rem; color: #fff;
}
.tpl-card:hover .tpl-hover-overlay { opacity: 1; }
.view-all-wrap { text-align: center; margin-top: 44px; }
.btn-view-all {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; border: 1.5px solid var(--card-border);
  color: var(--text); border-radius: 50px;
  font-family: 'Inter', sans-serif; font-size: 0.95rem; font-weight: 500;
  padding: 14px 28px; cursor: pointer; transition: all 0.2s;
}
.btn-view-all:hover { border-color: var(--purple); color: var(--purple); }

/* ─── TESTIMONIALS ─── */
.testimonials { background: var(--bg2); transition: background 0.3s; }
.testi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 60px; }
.testi-card {
  background: var(--card-bg); border: 1px solid var(--card-border);
  border-radius: var(--radius); padding: 30px;
  box-shadow: var(--card-shadow);
  transition: transform 0.3s, background 0.3s;
}
.testi-card:hover { transform: translateY(-4px); }
.testi-stars { color: var(--gold); font-size: 0.85rem; letter-spacing: 2px; margin-bottom: 14px; }
.testi-text { color: var(--muted); font-size: 0.93rem; line-height: 1.75; margin-bottom: 22px; font-style: italic; }
.testi-author { display: flex; align-items: center; gap: 12px; }
.testi-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  background: linear-gradient(135deg, var(--purple), var(--purple-dark));
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.85rem; color: #fff; flex-shrink: 0;
}
.testi-name { font-weight: 600; font-size: 0.88rem; color: var(--text); }
.testi-role { color: var(--muted); font-size: 0.78rem; }

/* ─── FAQ ─── */
.faq { background: var(--section-alt); transition: background 0.3s; }
.faq-list { max-width: 740px; margin: 60px auto 0; display: flex; flex-direction: column; gap: 10px; }
.faq-item {
  background: var(--faq-bg); border: 1px solid var(--card-border);
  border-radius: var(--radius-sm); overflow: hidden;
  box-shadow: var(--card-shadow); transition: background 0.3s;
}
.faq-q {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 26px; cursor: pointer; transition: background 0.2s;
  font-weight: 500; font-size: 0.96rem; color: var(--text);
}
.faq-q:hover { background: rgba(108,59,255,0.05); }
.faq-icon { color: var(--purple); font-size: 1.1rem; flex-shrink: 0; transition: transform 0.3s; }
.faq-a {
  padding: 0 26px; max-height: 0; overflow: hidden;
  transition: max-height 0.4s ease, padding 0.3s;
  color: var(--muted); font-size: 0.91rem; line-height: 1.75;
}
.faq-item.open .faq-a { max-height: 200px; padding: 0 26px 20px; }
.faq-item.open .faq-icon { transform: rotate(45deg); }

/* ─── CTA ─── */
.cta-section {
  padding: 96px 48px; text-align: center;
  background: linear-gradient(135deg, rgba(108,59,255,0.08) 0%, var(--bg2) 50%, rgba(212,175,55,0.06) 100%);
  border-top: 1px solid var(--divider);
  transition: background 0.3s;
}
[data-theme="light"] .cta-section {
  background: linear-gradient(135deg, #f0ebff 0%, #fff8f0 100%);
}
.cta-inner { max-width: 640px; margin: 0 auto; }
.cta-section h2 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 4vw, 3rem); font-weight: 700;
  margin-bottom: 18px; letter-spacing: -0.5px; color: var(--text);
}
.cta-section p { color: var(--muted); font-size: 1rem; margin-bottom: 36px; line-height: 1.75; }
.cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

/* ─── BADGE STRIP ─── */
.badge-strip {
  padding: 24px 48px; background: var(--bg);
  border-top: 1px solid var(--divider);
  display: flex; align-items: center; justify-content: center; gap: 40px; flex-wrap: wrap;
  transition: background 0.3s;
}
.badge-item { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 0.83rem; }
.badge-icon { font-size: 1rem; }

/* ─── FOOTER ─── */
footer {
  background: var(--footer-bg);
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 64px 48px 36px;
}
.footer-inner { max-width: 1160px; margin: 0 auto; }
.footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 52px; }
.footer-logo {
  font-family: 'Inter', sans-serif; font-size: 1.3rem; font-weight: 700;
  color: #fff; margin-bottom: 14px; display: block;
}
.footer-logo span { color: var(--purple-light); }
.footer-brand p { color: var(--footer-text); font-size: 0.88rem; line-height: 1.75; max-width: 270px; }
.footer-col h5 { font-weight: 700; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 18px; }
.footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.footer-col a { text-decoration: none; color: var(--footer-text); font-size: 0.88rem; transition: color 0.2s; }
.footer-col a:hover { color: #fff; }
.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.08); padding-top: 28px;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;
}
.footer-bottom p { color: var(--footer-text); font-size: 0.83rem; }
.footer-socials { display: flex; gap: 10px; }
.social-link {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  text-decoration: none; color: rgba(255,255,255,0.55); font-size: 0.85rem;
  transition: background 0.2s, color 0.2s;
}
.social-link:hover { background: var(--purple); color: #fff; border-color: var(--purple); }

/* ─── RESPONSIVE ─── */
@media (max-width: 1024px) {
  .footer-top { grid-template-columns: 1fr 1fr; }
  .hero-visual { width: 44%; }
}
@media (max-width: 768px) {
  nav { padding: 14px 20px; }
  .nav-links { display: none; }
  .nav-actions .btn-ghost { display: none; }
  .hamburger { display: flex; }
  .hero { padding: 110px 20px 60px; min-height: auto; }
  .hero-visual { display: none; }
  section { padding: 64px 20px; }
  .stats-bar { padding: 40px 20px; }
  .steps-row::before { display: none; }
  .badge-strip { padding: 18px 20px; gap: 18px; }
  .cta-section { padding: 64px 20px; }
  footer { padding: 48px 20px 28px; }
  .footer-top { grid-template-columns: 1fr; gap: 28px; }
  .footer-bottom { flex-direction: column; text-align: center; }
}

/* fade-in animation helper */
.fade-in { opacity: 0; transform: translateY(24px); transition: opacity 0.55s ease, transform 0.55s ease; }
.fade-in.visible { opacity: 1; transform: translateY(0); }
</style>
</head>
<body>

<!-- ─── NAV ─── -->
<nav>
  <a class="nav-logo" href="#">
    <div class="nav-logo-icon">✦</div>
    <span class="nav-logo-text">Digi<span>Invite</span></span>
  </a>
  <ul class="nav-links">
    <li><a href="#features">AI Generator</a></li>
    <li><a href="#templates">Templates</a></li>
    <li><a href="#">Editor</a></li>
    <li><a href="#">Dashboard</a></li>
    <li><a href="#">Pricing</a></li>
  </ul>
  <div class="nav-actions">
    <button class="theme-toggle" id="themeToggle" title="Toggle theme" aria-label="Toggle light/dark mode">
      <div class="theme-knob" id="themeKnob">🌙</div>
    </button>
    <button class="btn-ghost">Sign in</button>
    <button class="btn-primary">Get started</button>
  </div>
  <div class="hamburger" id="hamburger">
    <span></span><span></span><span></span>
  </div>
</nav>

<!-- ─── HERO ─── -->
<section class="hero" id="home">
  <div class="hero-content">
    <div class="hero-badge">
      <span class="hero-badge-icon">✦</span>
      AI-powered invitations
    </div>
    <h1>Invitations,<br><span class="word-purple">reimagined</span> with<br>a touch of <span class="word-gold">gold.</span></h1>
    <p class="hero-sub">Design, personalize, and share breathtaking digital invitations for every celebration. AI ideas in seconds. RSVP built in.</p>
    <div class="hero-cta">
      <button class="btn-cta-main">✦ Generate with AI</button>
      <button class="btn-cta-outline">Browse templates →</button>
      <button class="btn-cta-outline">🎨 Open editor</button>
    </div>
    <div class="hero-trust">
      <span class="trust-item"><span class="trust-icon">👑</span> Premium templates</span>
      <span class="trust-item"><span class="trust-icon">👥</span> RSVP tracking</span>
      <span class="trust-item"><span class="trust-icon">⬇️</span> PNG · JPG · PDF</span>
    </div>
  </div>

  <!-- Floating invitation cards -->
  <div class="hero-visual">
    <!-- Purple wedding card -->
    <div class="inv-card inv-card-1">
      <div class="inv-card-inner">
        <div class="ic-eyebrow">Together Forever</div>
        <div class="ic-names">Arjun<br>&amp;<br>Meera</div>
        <div class="ic-divider"></div>
        <div class="ic-date">12 · February · 2026</div>
        <div class="ic-venue">Taj Palace, Udaipur</div>
        <div class="ic-watermark">✦ Made with DigiInvite</div>
      </div>
    </div>
    <!-- Pink engagement card -->
    <div class="inv-card inv-card-2">
      <div class="inv-card-inner">
        <div class="ic-eyebrow">We're Engaged</div>
        <div class="ic-names">Aanya &amp; Vir</div>
        <div class="ic-divider"></div>
        <div class="ic-date">March 8 · 2026</div>
      </div>
    </div>
    <!-- Gold anniversary card -->
    <div class="inv-card inv-card-3">
      <div class="inv-card-inner">
        <div class="ic-eyebrow">50 Years Together</div>
        <div class="ic-names">Raj &amp;<br>Sunita</div>
        <div class="ic-date">Golden Anniversary</div>
      </div>
    </div>
  </div>
</section>

<!-- ─── STATS ─── -->
<div class="stats-bar">
  <div class="stats-inner">
    <div class="stat-item"><div class="stat-num">0+</div><div class="stat-label">Ready Templates</div></div>
    <div class="stat-item"><div class="stat-num">0+</div><div class="stat-label">Cards Generated</div></div>
    <div class="stat-item"><div class="stat-num">20+</div><div class="stat-label">Event Types</div></div>
    <div class="stat-item"><div class="stat-num">0★</div><div class="stat-label">Average Rating</div></div>
  </div>
</div>

<!-- ─── FEATURES / WHY DIGIINVITE ─── -->
<section class="features" id="features">
  <div class="section-inner">
    <div class="text-center">
      <span class="section-tag">Why DigiInvite</span>
      <h2 class="section-title">Everything You Need to<br>Create Perfect Invitations</h2>
      <p class="section-sub">From AI generation to RSVP tracking — every tool you need, in one elegant platform.</p>
    </div>
    <div class="features-grid">
      <div class="feature-card fade-in">
        <div class="feature-icon">✨</div>
        <h3>AI Invitation Generator</h3>
        <p>Fill in your event details and let AI craft a stunning invitation tailored to your theme, language, and style — in under 30 seconds.</p>
      </div>
      <div class="feature-card fade-in">
        <div class="feature-icon">🎨</div>
        <h3>Canvas-Style Editor</h3>
        <p>Drag, drop, resize, and personalise with our powerful Fabric.js editor. Change fonts, colors, photos, and backgrounds with ease.</p>
      </div>
      <div class="feature-card fade-in">
        <div class="feature-icon">📱</div>
        <h3>Multi-Format Preview</h3>
        <p>Preview your invitation as a desktop card, Instagram story, or WhatsApp image — perfectly sized for every platform.</p>
      </div>
      <div class="feature-card fade-in">
        <div class="feature-icon">✉️</div>
        <h3>Smart RSVP System</h3>
        <p>Each invitation gets a unique RSVP page. Track confirmations, headcounts, and messages — all from your dashboard in real time.</p>
      </div>
      <div class="feature-card fade-in">
        <div class="feature-icon">🔗</div>
        <h3>QR Code &amp; Easy Sharing</h3>
        <p>Auto-generated QR codes link directly to your RSVP page. Share instantly via WhatsApp, Instagram, Email, or a direct link.</p>
      </div>
      <div class="feature-card fade-in">
        <div class="feature-icon">📥</div>
        <h3>Download in Any Format</h3>
        <p>Export as PNG, JPEG, PDF, Instagram Story, or WhatsApp image. All in high resolution, watermark-free after payment.</p>
      </div>
    </div>
  </div>
</section>

<!-- ─── HOW IT WORKS ─── -->
<section class="how" id="how">
  <div class="section-inner">
    <div class="text-center">
      <span class="section-tag">The Process</span>
      <h2 class="section-title">From Idea to Invitation<br>in Four Steps</h2>
      <p class="section-sub">No design skills, no software downloads. Just beautiful invitations.</p>
    </div>
    <div class="steps-row">
      <div class="step fade-in">
        <div class="step-num">1</div>
        <h4>Choose Your Event</h4>
        <p>Select from weddings, birthdays, engagements, corporate events, and 15+ more event types.</p>
      </div>
      <div class="step fade-in">
        <div class="step-num">2</div>
        <h4>Fill the Details</h4>
        <p>Enter names, date, venue, and any special instructions. AI handles the rest.</p>
      </div>
      <div class="step fade-in">
        <div class="step-num">3</div>
        <h4>Customise &amp; Edit</h4>
        <p>Pick a template and personalise it with our drag-and-drop editor. Upload your own photos.</p>
      </div>
      <div class="step fade-in">
        <div class="step-num">4</div>
        <h4>Share &amp; Track</h4>
        <p>Download, share on WhatsApp or social media, and track RSVPs from your dashboard.</p>
      </div>
    </div>
  </div>
</section>

<!-- ─── TEMPLATE GALLERY ─── -->
<section class="templates" id="templates">
  <div class="section-inner">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:20px;">
      <div>
        <span class="section-tag">Template Gallery</span>
        <h2 class="section-title">Over 1,000 Premium<br>Invitation Designs</h2>
      </div>
      <p class="section-sub" style="max-width:320px;margin-bottom:4px;">Every style, every occasion, every culture. Traditional, modern, minimal, royal, and more.</p>
    </div>
    <div class="template-filters">
      <button class="filter-btn active">All</button>
      <button class="filter-btn">Wedding</button>
      <button class="filter-btn">Birthday</button>
      <button class="filter-btn">Engagement</button>
      <button class="filter-btn">Corporate</button>
      <button class="filter-btn">Floral</button>
      <button class="filter-btn">Royal</button>
      <button class="filter-btn">South Indian</button>
      <button class="filter-btn">Gujarati</button>
      <button class="filter-btn">Kids</button>
    </div>
    <div class="templates-grid">
      <div class="tpl-card fade-in"><div class="tpl-bg tpl-1"><div class="tpl-ornament">🌸</div><div class="tpl-name">Royal Garden</div><div class="tpl-sub">Wedding</div></div><div class="tpl-hover-overlay">Use Template →</div><div class="tpl-badge">Free</div></div>
      <div class="tpl-card fade-in"><div class="tpl-bg tpl-2"><div class="tpl-ornament">🍃</div><div class="tpl-name">Floral Bliss</div><div class="tpl-sub">Birthday</div></div><div class="tpl-hover-overlay">Use Template →</div><div class="tpl-badge">Free</div></div>
      <div class="tpl-card fade-in"><div class="tpl-bg tpl-3"><div class="tpl-ornament">🪷</div><div class="tpl-name">Golden Sunrise</div><div class="tpl-sub">Engagement</div></div><div class="tpl-hover-overlay">Use Template →</div><div class="tpl-lock">🔒 Premium</div></div>
      <div class="tpl-card fade-in"><div class="tpl-bg tpl-4"><div class="tpl-ornament">💎</div><div class="tpl-name">Sapphire Gala</div><div class="tpl-sub">Corporate</div></div><div class="tpl-hover-overlay">Use Template →</div><div class="tpl-badge">Free</div></div>
      <div class="tpl-card fade-in"><div class="tpl-bg tpl-5"><div class="tpl-ornament">✨</div><div class="tpl-name">Amber Luxe</div><div class="tpl-sub">Reception</div></div><div class="tpl-hover-overlay">Use Template →</div><div class="tpl-lock">🔒 Premium</div></div>
      <div class="tpl-card fade-in"><div class="tpl-bg tpl-6"><div class="tpl-ornament">🌺</div><div class="tpl-name">Rose Velvet</div><div class="tpl-sub">Baby Shower</div></div><div class="tpl-hover-overlay">Use Template →</div><div class="tpl-badge">Free</div></div>
    </div>
    <div class="view-all-wrap">
      <button class="btn-view-all">View All Templates →</button>
    </div>
  </div>
</section>

<!-- ─── TESTIMONIALS ─── -->
<section class="testimonials" id="testimonials">
  <div class="section-inner">
    <div class="text-center">
      <span class="section-tag">Testimonials</span>
      <h2 class="section-title">Loved by Thousands<br>Across India</h2>
    </div>
    <div class="testi-grid">
      <div class="testi-card fade-in">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">"We used DigiInvite for our wedding and the card looked absolutely stunning. Our guests couldn't believe it wasn't designed by a professional studio. The RSVP tracking saved us so much time!"</p>
        <div class="testi-author">
          <div class="testi-avatar">PA</div>
          <div><div class="testi-name">Priya &amp; Arjun Mehta</div><div class="testi-role">Wedding · Mumbai</div></div>
        </div>
      </div>
      <div class="testi-card fade-in">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">"The AI generated our entire invitation in 30 seconds! I just had to change the photo and tweak the font. Sent it on WhatsApp to 200 guests instantly. Incredible value."</p>
        <div class="testi-author">
          <div class="testi-avatar">RK</div>
          <div><div class="testi-name">Rahul Krishnamurthy</div><div class="testi-role">Birthday Party · Bangalore</div></div>
        </div>
      </div>
      <div class="testi-card fade-in">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">"Perfect for our corporate annual day. The editor is so smooth — felt like using Canva. The PDF export quality was excellent. Will definitely use again for future events."</p>
        <div class="testi-author">
          <div class="testi-avatar">SP</div>
          <div><div class="testi-name">Sneha Patel</div><div class="testi-role">Corporate Event · Ahmedabad</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ─── FAQ ─── -->
<section class="faq" id="faq">
  <div class="section-inner">
    <div class="text-center">
      <span class="section-tag">FAQ</span>
      <h2 class="section-title">Frequently Asked Questions</h2>
    </div>
    <div class="faq-list">
      <div class="faq-item">
        <div class="faq-q"><span>Do I need any design experience to use DigiInvite?</span><span class="faq-icon">+</span></div>
        <div class="faq-a">Not at all. DigiInvite is designed for everyone. Simply choose a template, fill in your event details, and the AI does the heavy lifting. You can also customise everything using our drag-and-drop editor — no design background required.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q"><span>What file formats can I download my invitation in?</span><span class="faq-icon">+</span></div>
        <div class="faq-a">Depending on your plan, you can download your invitation as PNG, JPEG, PDF, Instagram Story (1080×1920), and WhatsApp optimised image. Animated plans also include MP4 video exports.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q"><span>How does the RSVP system work?</span><span class="faq-icon">+</span></div>
        <div class="faq-a">Every invitation automatically gets a unique RSVP page hosted by DigiInvite. Guests can open it via a QR code or direct link, confirm attendance, add their name, phone number, and how many people are joining. You can track all responses in real time from your dashboard.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q"><span>Can I share my invitation on WhatsApp?</span><span class="faq-icon">+</span></div>
        <div class="faq-a">Yes! After creating your invitation, you can share it directly via WhatsApp with a single tap. You can also share via Email, Instagram, Facebook, or copy a direct link — all from within DigiInvite.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q"><span>Are payments secure? What methods are accepted?</span><span class="faq-icon">+</span></div>
        <div class="faq-a">All payments are processed securely through Razorpay, one of India's most trusted payment gateways. You can pay with UPI, credit cards, debit cards, net banking, and wallets. We never store your payment information.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q"><span>Can I create invitations in regional Indian languages?</span><span class="faq-icon">+</span></div>
        <div class="faq-a">Yes! DigiInvite supports multiple languages including Hindi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali, and more. Simply select your preferred language when filling in invitation details.</div>
      </div>
    </div>
  </div>
</section>

<!-- ─── BADGE STRIP ─── -->
<div class="badge-strip">
  <div class="badge-item"><span class="badge-icon">🔒</span> Secure Razorpay Payments</div>
  <div class="badge-item"><span class="badge-icon">⚡</span> Ready in Under 2 Minutes</div>
  <div class="badge-item"><span class="badge-icon">📱</span> Works on All Devices</div>
  <div class="badge-item"><span class="badge-icon">🌐</span> 20+ Indian Languages</div>
</div>

<!-- ─── FINAL CTA ─── -->
<div class="cta-section">
  <div class="cta-inner">
    <h2>Your Invitation is<br>Just Minutes Away</h2>
    <p>Join thousands of families across India who've already sent stunning digital invitations with DigiInvite. No design skills. No hassle.</p>
    <div class="cta-btns">
      <button class="btn-cta-main">✦ Create Your Invitation</button>
      <button class="btn-cta-outline">Browse Templates</button>
    </div>
  </div>
</div>

<!-- ─── FOOTER ─── -->
<footer>
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand">
        <span class="footer-logo">Digi<span>Invite</span></span>
        <p>AI-powered digital invitation platform for Indian and international events. Create, customise, and share beautiful invitations in minutes.</p>
      </div>
      <div class="footer-col">
        <h5>Product</h5>
        <ul>
          <li><a href="#">Features</a></li>
          <li><a href="#">Template Gallery</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">RSVP System</a></li>
          <li><a href="#">QR Code Generator</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Events</h5>
        <ul>
          <li><a href="#">Wedding Invitations</a></li>
          <li><a href="#">Birthday Cards</a></li>
          <li><a href="#">Engagement</a></li>
          <li><a href="#">Baby Shower</a></li>
          <li><a href="#">Corporate Events</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Company</h5>
        <ul>
          <li><a href="#">About Us</a></li>
          <li><a href="#">Contact</a></li>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of Service</a></li>
          <li><a href="#">Refund Policy</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 DigiInvite. Made with ♥ in India.</p>
      <div class="footer-socials">
        <a class="social-link" href="#" title="WhatsApp">💬</a>
        <a class="social-link" href="#" title="Instagram">📸</a>
        <a class="social-link" href="#" title="Facebook">👤</a>
        <a class="social-link" href="#" title="YouTube">▶</a>
      </div>
    </div>
  </div>
</footer>

<script>
  // ─── THEME TOGGLE ───
  const toggle = document.getElementById('themeToggle');
  const knob = document.getElementById('themeKnob');
  const html = document.documentElement;

  // Load saved preference
  const saved = localStorage.getItem('digiinvite-theme') || 'light';
  html.setAttribute('data-theme', saved);
  knob.textContent = saved === 'dark' ? '☀️' : '🌙';

  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    knob.textContent = next === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('digiinvite-theme', next);
  });

  // ─── FAQ ───
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ─── TEMPLATE FILTERS ───
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ─── SCROLL FADE-IN ───
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
</script>
</body>
</html>