/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Admin-facing read-only company profile page.
 * Fetches data from GET /api/v1/viewcompanyprofile/{companyId}
 * (with a company-list fallback when the dedicated endpoint is unavailable).
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { AdminCompanyProfileView } from '../components/AdminCompanyProfileView';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { decryptDetailRoute, encryptDetailRoute } from '../utils/secureDetailRoute';

export default function CompanyProfileView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { companyId: pathCompanyId } = useParams<{ companyId: string }>();
  const [searchParams] = useSearchParams();
  const [resolvedCompanyId, setResolvedCompanyId] = useState('');
  const [routeError, setRouteError] = useState('');
  const encryptedRoute = searchParams.get('data') || '';

  useEffect(() => {
    if (!encryptedRoute) {
      if (pathCompanyId && token) {
        setResolvedCompanyId('');
        setRouteError('');
        let active = true;
        encryptDetailRoute({ view: 'company', id: pathCompanyId }, token)
          .then((encrypted) => {
            if (active) navigate(`/company?data=${encodeURIComponent(encrypted)}`, { replace: true });
          })
          .catch(() => {
            if (active) setRouteError('Unable to secure this company profile link. Please reopen it from Registered Companies.');
          });
        return () => { active = false; };
      }
      if (pathCompanyId && !token) {
        setResolvedCompanyId('');
        setRouteError('Please sign in again to open this company profile.');
        return;
      }
      setResolvedCompanyId('');
      setRouteError('');
      return;
    }
    if (!token) {
      setResolvedCompanyId('');
      setRouteError('Please sign in again to open this company profile.');
      return;
    }
    let active = true;
    decryptDetailRoute(encryptedRoute, token)
      .then((route) => {
        if (active && route.view === 'company') {
          setResolvedCompanyId(route.id);
          setRouteError('');
        } else if (active) {
          setResolvedCompanyId('');
          setRouteError('This company profile link is invalid or has expired.');
        }
      })
      .catch(() => {
        if (active) {
          setResolvedCompanyId('');
          setRouteError('This company profile link is invalid or has expired.');
        }
      });
    return () => { active = false; };
  }, [encryptedRoute, pathCompanyId, token, navigate]);

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-theme-cream text-slate-800 antialiased font-sans">
        <h3 className="text-lg font-bold text-rose-600 mb-2">Unauthorized — Please login first</h3>
        <Link to="/login" className="px-5 py-2 bg-theme-lavender text-white rounded-xl text-xs font-bold shadow-sm">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-cream flex flex-col antialiased font-sans">
      {/* Navbar */}
      <nav className="bg-theme-darkViolet text-white border-b border-theme-lightViolet/20 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 text-xs font-bold text-theme-lightViolet hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black">{user.name}</p>
            </div>
            <button
              onClick={() => { dispatch(logout()); navigate('/'); }}
              className="p-1 px-3 border border-theme-lightViolet/40 bg-theme-darkViolet font-bold hover:bg-rose-600 rounded-xl text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto px-3 sm:px-6 py-6 lg:py-10 w-full">
        {routeError ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {routeError}
          </div>
        ) : resolvedCompanyId ? (
          <AdminCompanyProfileView companyId={resolvedCompanyId} onBack={goBack} />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
            Opening company profile…
          </div>
        )}
      </main>
    </div>
  );
}