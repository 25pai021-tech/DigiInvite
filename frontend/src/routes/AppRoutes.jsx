import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from '../pages/Dashboard/Dashboard';
import CreateInvitation from '../pages/CreateInvitation/CreateInvitation';

/**
 * Mount this inside a <BrowserRouter> in your app's entry point, e.g.:
 *
 *   import { BrowserRouter } from 'react-router-dom';
 *   import AppRoutes from './routes/AppRoutes';
 *
 *   <BrowserRouter>
 *     <AppRoutes />
 *   </BrowserRouter>
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-invitation" element={<CreateInvitation />} />
      {/* Phase 12: <Route path="/admin" element={<AdminDashboard />} /> */}
    </Routes>
  );
}
