/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Provider } from 'react-redux';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './store';
import './i18n/config';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DashboardHub from './pages/DashboardHub';
import ActivateAccount from './pages/ActivateAccount';
import { ProtectedRoute } from './components/ui/UtilityComponents';

// Redirect non-hash URL path `/ActivateAccount` or `/activateaccount` to hash-based `#/ActivateAccount`
if (window.location.pathname.toLowerCase().includes('/activateaccount')) {
  const search = window.location.search;
  window.location.replace(`${window.location.origin}/#/ActivateAccount${search}`);
}

export default function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
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
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </Provider>
  );
}
