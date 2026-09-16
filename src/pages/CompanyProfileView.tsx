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
import { useGetAdminCompanyDetailQuery } from '../services/adminApi';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  User,
  Globe,
  MapPin,
  BadgeCheck,
  Loader,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Field = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-theme-lavender">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-xs font-semibold text-blue-950 break-words">{value || <span className="text-gray-300 italic">Not provided</span>}</p>
    </div>
  </div>
);

export default function CompanyProfileView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { companyId } = useParams<{ companyId: string }>();

  const { data: company, isLoading, isFetching, refetch } = useGetAdminCompanyDetailQuery(companyId || '', {
    skip: !companyId,
  });

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

  const field = (v: string | undefined | null): string => (v === undefined || v === null ? '' : String(v).trim());

  return (
    <div className="min-h-screen bg-theme-cream flex flex-col antialiased font-sans">
      {/* Navbar */}
      <nav className="bg-theme-darkViolet text-white border-b border-theme-lightViolet/20 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/dashboard');
                }
              }}
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
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-blue-950 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-theme-lavender" /> Company Profile
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Viewing company profile for ID: <span className="font-bold text-blue-900">{companyId}</span>
            {isFetching && (
              <span className="inline-flex items-center gap-1 ml-3 text-[10px] text-theme-lavender font-bold">
                <Loader className="w-3 h-3 animate-spin" /> Updating...
              </span>
            )}
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader className="w-8 h-8 text-theme-lavender animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading company profile...</p>
          </div>
        )}

        {/* Not found / error */}
        {!isLoading && !company && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-sm font-bold text-rose-600">Company profile not found.</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Either this company does not exist or the API is temporarily unavailable.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                className="px-5 py-2 bg-theme-lavender text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={() => { if (window.history.length > 1) { navigate(-1); } else { navigate('/dashboard'); } }}
                className="px-5 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && company && (
          <div className="space-y-6">
            {/* Company header card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-theme-lightViolet border-2 border-dashed border-theme-sage/60 shadow-sm flex items-center justify-center shrink-0">
                <Building2 className="w-14 h-14 text-theme-lavender/50" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl font-black text-blue-950 leading-tight">
                  {field(company.companyName) || 'Unnamed Company'}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">ID: {companyId}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  {field(company.phone || company.mobile) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                      <Phone className="w-3 h-3" /> {field(company.phone || company.mobile)}
                    </span>
                  )}
                  {field(company.email) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                      <Mail className="w-3 h-3" /> {field(company.email)}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    company.isApproved
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <BadgeCheck className="w-3 h-3" /> {company.isApproved ? 'Approved' : 'Pending Approval'}
                  </span>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
              <h3 className="text-xs font-black text-blue-950 uppercase tracking-wider mb-5">Company Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field icon={<Building2 className="w-4 h-4" />} label="Company Name" value={field(company.companyName)} />
                <Field icon={<User className="w-4 h-4" />} label="Contact Person" value={field(company.contactPerson)} />
                <Field icon={<Phone className="w-4 h-4" />} label="Mobile" value={field(company.phone || company.mobile)} />
                <Field icon={<Mail className="w-4 h-4" />} label="Email" value={field(company.email)} />
                {field(company.website) && (
                  <Field icon={<Globe className="w-4 h-4" />} label="Website" value={field(company.website)} />
                )}
                {field(company.industry) && (
                  <Field icon={<Building2 className="w-4 h-4" />} label="Industry" value={field(company.industry)} />
                )}
                {field(company.address) && (
                  <Field icon={<MapPin className="w-4 h-4" />} label="Address" value={field(company.address)} />
                )}
                <Field icon={<BadgeCheck className="w-4 h-4" />} label="Status" value={company.isApproved ? 'Approved' : 'Pending Approval'} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}