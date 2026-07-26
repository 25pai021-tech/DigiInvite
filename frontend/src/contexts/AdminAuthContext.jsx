// this file keeps track of whether an ADMIN is logged in.
// it is completely separate from AuthContext.jsx (which handles normal
// user login) so nothing here touches your teammate's login code.

import { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext();

// TODO: replace this hardcoded check with a real backend/DB check later.
// For now this is enough to gate the /admin routes.
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'digiinvite@admin123';

export function AdminAuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem('digiinvite_admin') === 'true'
  );

  function login(username, password) {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('digiinvite_admin', 'true');
      setIsAdmin(true);
      return true;
    }
    return false;
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
