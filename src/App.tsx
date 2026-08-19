/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store, RootState } from './store';
import './i18n/config';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DashboardHub from './pages/DashboardHub';
import ProfilePage from './pages/ProfilePage';
import CandidateProfileView from './pages/CandidateProfileView';
import ActivateAccount from './pages/ActivateAccount';
import { ProtectedRoute } from './components/ui/UtilityComponents';

// Redirect non-hash URL path `/ActivateAccount` or `/activateaccount` to hash-based `#/ActivateAccount`
if (window.location.pathname.toLowerCase().includes('/activateaccount')) {
  const search = window.location.search;
  window.location.replace(`${window.location.origin}/#/ActivateAccount${search}`);
}

const queryClient = new QueryClient();

/** If user is already logged in, redirect to /dashboard. Otherwise show children. */
function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<GuestOnly><Home /></GuestOnly>} />
            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
            <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
            <Route path="/ActivateAccount" element={<ActivateAccount />} />
            <Route path="/activateaccount" element={<ActivateAccount />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardHub />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/candidate/:candidateId"
              element={
                <ProtectedRoute>
                  <CandidateProfileView />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </QueryClientProvider>
    </Provider>
  );
}
