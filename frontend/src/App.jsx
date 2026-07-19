import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';

import Navbar    from './components/Navbar/Navbar';
import Footer    from './components/Footer/Footer';
import Home      from './pages/Home';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';

// Placeholder pages — create these later
function ComingSoon({ title }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      paddingTop: 'var(--nav-h)',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: 'Playfair Display, serif',
    }}>
      <div style={{ fontSize: '3rem', color: 'var(--purple)' }}>✦</div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{title}</h2>
      <p style={{ color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
        Coming soon — this page is under construction.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/templates" element={<ComingSoon title="Template Gallery" />} />
            <Route path="/generator" element={<ComingSoon title="AI Generator" />} />
            <Route path="/editor"    element={<ComingSoon title="Invitation Editor" />} />
            <Route path="/pricing"   element={<ComingSoon title="Pricing" />} />
            <Route path="/about"     element={<ComingSoon title="About Us" />} />
            <Route path="/contact"   element={<ComingSoon title="Contact" />} />
            <Route path="*"          element={<ComingSoon title="Page Not Found" />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </ThemeProvider>
  );
}
