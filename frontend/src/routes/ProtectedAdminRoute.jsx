import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function ProtectedAdminRoute({ children }) {
  const { isAdmin } = useAdminAuth();

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
