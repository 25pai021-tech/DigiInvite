import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Editor from './pages/Editor';
import Navbar    from './components/Navbar/Navbar';
import Footer    from './components/Footer/Footer';
import Home      from './pages/Home';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateInvitation from './pages/CreateInvitation/CreateInvitation';
import MyRequests from './pages/MyRequests';
import TemplatesPage from './pages/TemplatesPage/TemplatesPage';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedAdminRoute from './routes/ProtectedAdminRoute';
import Contact from './pages/Contact';
import { Navigate } from 'react-router-dom';  
import Pricing from './pages/Pricing';

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
      <AdminAuthProvider>

        <BrowserRouter>
          <Navbar />
          <main>
            <Routes>
              <Route path="/"          element={<Home />} />
              <Route path="/login"     element={<Login />} />
              <Route path="/register"  element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-requests" element={<MyRequests />} />
              <Route path="/create-invitation" element={<CreateInvitation />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/generator" element={<ComingSoon title="AI Generator" />} />
              <Route path="/editor" element={<Navigate to="/my-requests" replace />} />
              <Route path="/editor/:requestId" element={<Editor />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about"     element={<ComingSoon title="About Us" />} />
              <Route path="/contact"   element={<ComingSoon title="Contact" />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedAdminRoute> <AdminDashboard /> </ProtectedAdminRoute>}/>
              <Route path="*"          element={<ComingSoon title="Page Not Found" />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>

      </AdminAuthProvider>
    </ThemeProvider>
  );
}
