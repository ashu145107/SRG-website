/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { store, RootState } from './store';
import { logout, getTokenExpiration, isTokenExpired } from './store/authSlice';
import './i18n/config';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DashboardHub from './pages/DashboardHub';
import ProfilePage from './pages/ProfilePage';
import CandidateProfileView from './pages/CandidateProfileView';
import CompanyProfileView from './pages/CompanyProfileView';
import ActivateAccount from './pages/ActivateAccount';
import { JobRequirementDetail } from './pages/JobRequirementDetail';
import ChangePassword from './pages/ChangePassword';
import LegalHub from './pages/legal/LegalHub';
import LegalDocumentPage from './pages/legal/LegalDocumentPage';
import { ProtectedRoute } from './components/ui/UtilityComponents';
import { ScrollToTop } from './components/ScrollToTop';

// Redirect non-hash URL path `/ActivateAccount` or `/activateaccount` to hash-based `#/ActivateAccount`,
// preserving any virtual-directory base path (e.g. site hosted under /srg/).
if (window.location.pathname.toLowerCase().includes('/activateaccount')) {
  const search = window.location.search;
  const basePath = window.location.pathname.replace(/\/activateaccount\/?$/i, '');
  window.location.replace(`${window.location.origin}${basePath}/#/ActivateAccount${search}`);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      retry: 1,
    },
  },
});

/** If user is already logged in, redirect to /dashboard. Otherwise show children. */
function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);
  if (isAuthenticated && user && token && !isTokenExpired(token)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AuthSessionManager() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      queryClient.clear();
      return;
    }

    const expiresAt = getTokenExpiration(token);
    if (expiresAt === null) return;

    let timeout: number;
    const checkExpiration = () => {
      if (isTokenExpired(token)) {
        dispatch(logout());
        return;
      }
      timeout = window.setTimeout(checkExpiration, Math.min(expiresAt - Date.now(), 2_147_000_000));
    };
    timeout = window.setTimeout(checkExpiration, Math.min(expiresAt - Date.now(), 2_147_000_000));
    return () => window.clearTimeout(timeout);
  }, [dispatch, isAuthenticated, queryClient, token]);

  return null;
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <AuthSessionManager />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<GuestOnly><Home /></GuestOnly>} />
            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
            <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
            <Route path="/ActivateAccount" element={<ActivateAccount />} />
            <Route path="/activateaccount" element={<ActivateAccount />} />

            <Route path="/job/:requirementId" element={<JobRequirementDetail />} />

            <Route path="/legal" element={<LegalHub />} />
            <Route path="/legal/:slug" element={<LegalDocumentPage />} />
            <Route path="/privacy-policy" element={<Navigate to="/legal/privacy-policy" replace />} />
            <Route path="/terms" element={<Navigate to="/legal/terms-candidate" replace />} />
            <Route path="/terms-and-conditions" element={<Navigate to="/legal/terms-candidate" replace />} />
            
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
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/candidate"
              element={
                <ProtectedRoute>
                  <CandidateProfileView />
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

            <Route
              path="/company"
              element={
                <ProtectedRoute>
                  <CompanyProfileView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/:companyId"
              element={
                <ProtectedRoute>
                  <CompanyProfileView />
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
