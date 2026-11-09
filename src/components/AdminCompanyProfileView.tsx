/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Reusable read-only company profile body.
 * Used by the /company/:companyId page and inside the admin dashboard
 * (so the admin shell stays visible when viewing a company).
 * Fetches data from GET /api/v1/viewcompanyprofile/{companyId}
 * (with a company-list fallback when the dedicated endpoint is unavailable).
 */

import React, { useEffect, useState } from 'react';
import { useGetAdminCompanyDetailQuery, useGetCompanyRequirementsQuery } from '../services/adminApi';
import {
  Building2,
  Phone,
  Mail,
  User,
  Globe,
  MapPin,
  Loader2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { Loader } from './ui/FeedbackComponents';
import { CompanyProfileJobDetails } from './jobs/CompanyProfileJobDetails';

const Field = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-theme-lavender">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-xs font-semibold text-blue-950 break-words">{value || <span className="text-gray-300 italic">Not provided</span>}</p>
    </div>
  </div>
);

interface AdminCompanyProfileViewProps {
  companyId: string;
  /** Called when the user cancels an error state (Go Back). */
  onBack?: () => void;
  /** Notifies the parent when a job requirement detail view is opened/closed. */
  onJobDetailsOpenChange?: (open: boolean) => void;
}

export function AdminCompanyProfileView({ companyId, onBack, onJobDetailsOpenChange }: AdminCompanyProfileViewProps) {
  const [selectedJob, setSelectedJob] = useState<{ requirementId: number; jobCode?: string } | null>(null);

  useEffect(() => {
    onJobDetailsOpenChange?.(Boolean(selectedJob));
    return () => onJobDetailsOpenChange?.(false);
  }, [selectedJob, onJobDetailsOpenChange]);

  const { data: company, isLoading, isFetching, refetch } = useGetAdminCompanyDetailQuery(companyId || '', {
    skip: !companyId,
  });

  const {
    data: requirements = [],
    isLoading: requirementsLoading,
    isFetching: requirementsFetching,
    isError: requirementsError,
  } = useGetCompanyRequirementsQuery(companyId || '', {
    skip: !companyId,
  });

  const field = (v: string | undefined | null): string => (v === undefined || v === null ? '' : String(v).trim());

  if (selectedJob) {
    return (
      <CompanyProfileJobDetails
        requirementId={selectedJob.requirementId}
        jobCode={selectedJob.jobCode}
        onBack={() => setSelectedJob(null)}
      />
    );
  }

  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-blue-950 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-theme-lavender" /> Company Profile
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Company profile details
          {isFetching && (
            <span className="inline-flex items-center gap-1 ml-3 text-[10px] text-theme-lavender font-bold">
              <Loader2 className="w-3 h-3 animate-spin" /> Updating...
            </span>
          )}
        </p>
      </div>

      {/* Loading */}
      {isLoading && <Loader />}

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
            {onBack && (
              <button
                onClick={onBack}
                className="px-5 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm cursor-pointer"
              >
                Go Back
              </button>
            )}
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
            </div>
          </div>

          {/* Job requirements posted by this company */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-xs font-black text-blue-950 uppercase tracking-wider">
                <Briefcase className="w-4 h-4 text-theme-lavender" /> Job Requirements
              </h3>
              {requirementsFetching && !requirementsLoading && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-theme-lavender">
                  <Loader2 className="w-3 h-3 animate-spin" /> Updating...
                </span>
              )}
            </div>

            {requirementsLoading ? (
              <Loader />
            ) : requirementsError ? (
              <p className="py-6 text-center text-xs font-medium text-rose-600">
                Unable to load job requirements for this company.
              </p>
            ) : requirements.length === 0 ? (
              <p className="py-6 text-center text-xs font-medium text-gray-400">
                No job requirements posted by this company.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="whitespace-nowrap px-3 py-2.5">Job Code</th>
                      <th className="px-3 py-2.5">Job Title</th>
                      <th className="px-3 py-2.5">Company</th>
                      <th className="px-3 py-2.5">Email</th>
                      <th className="px-3 py-2.5">Work Place</th>
                      <th className="px-3 py-2.5">Skill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requirements.map((requirement, index) => {
                      const requirementId = Number(requirement.requirementId || 0);
                      const requirementJobCode = field(requirement.jobCode);
                      const canOpen = Number.isSafeInteger(requirementId) && requirementId > 0;
                      return (
                        <tr
                          key={requirement.requirementId ?? requirement.jobCode ?? index}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="whitespace-nowrap px-3 py-2.5">
                            {canOpen ? (
                              <button
                                type="button"
                                onClick={() => setSelectedJob({ requirementId, jobCode: requirementJobCode })}
                                title="Open job details with applied applicants"
                                className="font-mono text-[10px] font-bold text-blue-700 underline decoration-blue-300 underline-offset-2 transition-colors hover:text-blue-600 hover:decoration-blue-600 cursor-pointer"
                              >
                                {requirementJobCode || requirementId}
                              </button>
                            ) : (
                              <span className="font-mono text-[10px] font-bold text-slate-500">
                                {requirementJobCode || '—'}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-slate-800">{field(requirement.profileHeader) || '—'}</td>
                          <td className="px-3 py-2.5 text-slate-700">{field(requirement.companyName) || '—'}</td>
                          <td className="break-all px-3 py-2.5 text-slate-600">{field(requirement.email) || '—'}</td>
                          <td className="px-3 py-2.5 text-slate-700">{field(requirement.workPlace) || '—'}</td>
                          <td className="px-3 py-2.5 text-slate-600">{field(requirement.skill) || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AdminCompanyProfileView;