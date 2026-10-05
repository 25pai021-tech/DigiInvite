// Keeps track of whether an ADMIN is logged in.
// The real password check now happens in the backend / database.
import { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function AdminAuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem('digiinvite_admin') === 'true'
  );

  async function login(username, password) {
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) return false;
      sessionStorage.setItem('digiinvite_admin', 'true');
      setIsAdmin(true);
      return true;
    } catch {
      return false;
    }
  }

  function logout() {
    sessionStorage.removeItem('digiinvite_admin');
    setIsAdmin(false);
  }

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}