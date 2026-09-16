/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Admin-facing read-only company profile page.
 * Fetches data from GET /api/v1/viewcompanyprofile/{companyId}
 * (with a company-list fallback when the dedicated endpoint is unavailable).
 */

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { AdminCompanyProfileView } from '../components/AdminCompanyProfileView';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

export default function CompanyProfileView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { companyId } = useParams<{ companyId: string }>();

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
        <AdminCompanyProfileView companyId={companyId || ''} onBack={goBack} />
      </main>
    </div>
  );
}