/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useJobDetailsQuery, useApplyJobMutation } from '../../hooks/useJobQueries';
import type { JobRequirement } from '../../services/jobTypes';
import { useDateOnly } from '../../hooks/useDateOnly';
import {
  getLabel,
  educations,
  roleTypes,
  interviewModes,
  shiftTypes,
  workModes,
  salaryPeriods,
  weeklyOffs,
  specializations,
} from './jobMappings';
import { Alert, Toast, ConfirmDialog } from '../ui/FeedbackComponents';
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  BookOpen,
  IndianRupee,
  Award,
  ChevronLeft,
  CheckCircle,
  HelpCircle,
  Phone,
  Loader2,
} from 'lucide-react';

interface JobDetailsViewProps {
  jobId: number;
  onBack?: () => void;
  onApplySuccess?: (appliedJobCode?: string) => void;
  alreadyApplied?: boolean;
  jobCode?: string;
  apiData?: JobRequirement;
}

const SpecRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start gap-x-3 py-3 text-xs sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
    <span className="font-bold leading-relaxed text-slate-500">{label}</span>
    <span className="break-words text-right font-bold leading-relaxed text-slate-800">{children}</span>
  </div>
);

export const JobDetailsView: React.FC<JobDetailsViewProps> = ({
  jobId,
  onBack,
  onApplySuccess,
  alreadyApplied: initialApplied = false,
  jobCode,
  apiData,
}) => {
  const { t, i18n } = useTranslation();
  const formatDateOnly = useDateOnly();
  const lang = i18n.language === 'mr' ? 'mr' : 'en';

  const user = useSelector((state: any) => state.auth?.user);
  const isAuthenticated = useSelector((state: any) => state.auth?.isAuthenticated);

  const isEmployerOrStaff = user && (
    user.role === 3 || user.role === '3' ||
    user.role === 5 || user.role === '5' ||
    String(user.role).toUpperCase() === 'COMPANY' ||
    String(user.role).toUpperCase() === 'EMPLOYER' ||
    String(user.role).toUpperCase() === 'STAFF'
  );

  // Queries and mutations
  const { data: fetchedJob, isLoading: isFetchingJob, error: fetchError, refetch } = useJobDetailsQuery(
    jobId,
    jobCode,
    !apiData
  );
  const job = apiData || fetchedJob;
  const isLoading = !apiData && isFetchingJob;
  const loadError = !apiData ? fetchError : undefined;
  const applyJobMutation = useApplyJobMutation();
  const applyJob = applyJobMutation.mutateAsync;
  const isApplying = applyJobMutation.isPending;

  // Dialog and feedback states
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasApplied, setHasApplied] = useState(initialApplied);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const displayMappedValue = (
    value: string | number | undefined,
    mappings: typeof roleTypes,
    id: number | undefined
  ) => typeof value === 'string' && value.trim()
    ? value
    : getLabel(mappings, Number(value ?? id), lang);
  const formatAmount = (value: unknown) => {
    if (value === undefined || value === null || value === '') return '';
    const amount = Number(value);
    return Number.isFinite(amount) ? amount.toLocaleString() : String(value);
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      setToastType('error');
      setToastMsg(t('jobs.detail.loginRequired'));
      setShowToast(true);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmApply = async () => {
    setShowConfirm(false);
    try {
      const jobIdentifier = job?.jobCode || jobCode;
      if (!jobIdentifier) {
        throw new Error(t('jobs.detail.applyError'));
      }
      const response: any = await applyJob([jobIdentifier]);

      if (response && (response.isSuccess === false || response.success === false)) {
        throw new Error(response.message || t('jobs.detail.applyError'));
      }

      setHasApplied(true);
      setToastType('success');
      setToastMsg(response?.message || t('jobs.detail.applySuccess'));
      setShowToast(true);

      if (onApplySuccess) {
        onApplySuccess(jobIdentifier);
      }
    } catch (err: any) {
      console.error('Job Application error:', err);
      setToastType('error');
      const errorMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.data ||
        err?.message ||
        t('jobs.detail.applyError');
      setToastMsg(typeof errorMsg === 'string' ? errorMsg : 'Duplicate application or server error.');
      setShowToast(true);
    }
  };

  // 1. Loading Skeleton Layout
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 text-left animate-pulse">
        <div className="h-5 bg-slate-200 w-24 rounded-md"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
              <div className="h-8 bg-slate-200 rounded-md w-3/4"></div>
              <div className="h-5 bg-slate-100 rounded-md w-1/2"></div>
              <div className="h-5 bg-slate-100 rounded-md w-1/3"></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 h-48"></div>
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State with Retry Button
  if (loadError || !job) {
    return (
      <div className="bg-white rounded-2xl border border-slate-150 p-8 max-w-xl mx-auto text-center my-8">
        <div className="text-red-500 text-3xl mb-3">⚠️</div>
        <h3 className="text-base font-bold text-slate-800">{t('jobs.detail.loadFailed')}</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          There was an issue fetching the details for Job ID #{jobId}. Please try again or go back.
        </p>
        <div className="flex gap-2 justify-center mt-6">
          <button
            onClick={() => refetch()}
            className="py-2.5 px-5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            {t('jobs.detail.retry')}
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="py-2.5 px-5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {t('jobs.detail.goBack')}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-3 pb-24 text-left animate-fade-in sm:space-y-6 sm:px-4 sm:pb-6 lg:px-0">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t('jobs.detail.backToListings')}</span>
        </button>
      )}

      {/* Main Responsive Grid: 2 columns for large, stack for mobile */}
      <div className="grid grid-cols-1 items-start gap-4 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {/* Left column (Main Details) - lg:col-span-2 */}
        <div className="min-w-0 space-y-4 sm:space-y-5 lg:col-span-2 lg:space-y-6">
          {/* Header Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-600" />
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-orange-50 border border-orange-100 text-orange-950 text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {displayMappedValue(job.roleType, roleTypes, job.roleTypeId)}
                  </span>
                  <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-950 text-[10px] font-bold rounded-md">
                    {job.jobCode ? `CODE: ${job.jobCode}` : 'CODE'}
                  </span>
                </div>
                <h1 className="break-words text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  {job.jobDesignation || job.profileHeader || '—'}
                </h1>
                <p className="text-sm font-bold text-slate-600 block">{job.profileHeader || job.jobDesignation || '—'}</p>
                {job.companyName && <p className="text-sm font-semibold text-slate-600">{job.companyName}</p>}
              </div>

              {/* Desktop Apply Button */}
              {!isEmployerOrStaff && (
              <div className="hidden sm:block shrink-0">
                {hasApplied ? (
                  <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 shadow-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>{t('jobs.detail.applied')}</span>
                  </span>
                ) : (
                  <button
                    onClick={handleApplyClick}
                    disabled={isApplying}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isApplying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isApplying ? t('jobs.detail.submitting') : t('jobs.detail.apply')}</span>
                  </button>
                )}
              </div>
              )}

            </div>

            {/* Core Specs Quick Bar */}
            <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-slate-600 sm:mt-6 sm:grid-cols-2 sm:gap-4 sm:pt-5 xl:grid-cols-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-orange-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold leading-none mb-0.5">LOCATION</span>
                  <span className="text-xs font-bold text-slate-800 block">{job.jobLocation || job.workPlace || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                <div className="rounded-lg border border-emerald-100 bg-white p-2 text-emerald-700">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold leading-none text-emerald-800/70 block mb-1">SALARY RANGE</span>
                  <span className="text-sm font-extrabold text-emerald-950 block">
                    {formatAmount(job.salary) ? `₹${formatAmount(job.salary)}` : '—'}{job.salaryTo != null ? ` - ₹${formatAmount(job.salaryTo)}` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold leading-none mb-0.5">EXPERIENCE</span>
                  <span className="text-xs font-bold text-slate-800 block">
                    {job.experiance != null || job.experianceTo != null
                      ? `${job.experiance ?? ''} - ${job.experianceTo ?? ''} Years`
                      : '—'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-orange-600">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold leading-none mb-0.5">VACANCIES</span>
                  <span className="text-xs font-bold text-slate-800 block">{job.noOfVacancy != null ? `${job.noOfVacancy} Positions` : '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description Card */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              {t('jobs.detail.descriptionTitle')}
            </h3>
            <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line block">
              {job.jobDiscription || job.jobDescription || job.profileHeader || '—'}
            </p>
          </div>

          {/* Required Skills & Certifications */}
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Award className="w-4 h-4 text-orange-600" />
                <span>{t('jobs.detail.requiredSkills')}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {String(job.skill || '').split(',').map((s, idx) => s.trim() && (
                  <span key={idx} className="px-3 py-1 bg-slate-50 border border-slate-150 text-slate-700 text-xs font-bold rounded-lg shadow-2xs">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>

            {job.certificationsRequired && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-extrabold text-slate-900 mb-2 flex items-center gap-2 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-orange-600" />
                  <span>{t('jobs.detail.requiredCertifications')}</span>
                </h4>
                <p className="text-xs text-slate-600 font-semibold block">{job.certificationsRequired}</p>
              </div>
            )}
          </div>

          {/* Benefits */}
          {job.benefits && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                {t('jobs.detail.benefitsTitle')}
              </h3>
              <p className="text-xs text-slate-650 leading-relaxed block">{job.benefits}</p>
            </div>
          )}
        </div>

        {/* Right column (Sidebar specs) */}
        <div className="min-w-0 space-y-4 sm:space-y-5 lg:space-y-6">
          <div className="relative space-y-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-900" />
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              {t('jobs.detail.specificationsTitle')}
            </h3>

            <div className="divide-y divide-slate-100">
              <SpecRow label="Requirement ID">
                {job.requirementId ?? job.id ?? '—'}
              </SpecRow>

              <SpecRow label={t('jobs.detail.workplace')}>
                {job.workPlace || job.jobLocation || '—'}
              </SpecRow>

              <SpecRow label={t('jobs.detail.qualification')}>
                {displayMappedValue(job.education, educations, job.educationId)}
              </SpecRow>

              <SpecRow label={t('jobs.detail.specialization')}>
                {displayMappedValue(job.specialization, specializations, job.specializationId)}
              </SpecRow>

              <SpecRow label={t('jobs.detail.salaryPeriod')}>
                {displayMappedValue(job.salaryPeriod, salaryPeriods, job.salaryPeriodId)}
              </SpecRow>

              <SpecRow label={t('jobs.detail.genderPreference')}>
                {job.genderPreference === 'Any' ? t('jobs.detail.anyGender') : job.genderPreference || '—'}
              </SpecRow>

              <SpecRow label={t('jobs.detail.ageRange')}>
                {job.ageRange || '—'}
              </SpecRow>

              <SpecRow label={t('jobs.detail.weeklyOff')}>
                {displayMappedValue(job.weeklyOff, weeklyOffs, job.weeklyOffId)}
              </SpecRow>

              <SpecRow label={t('jobs.detail.shift')}>
                {displayMappedValue(job.shiftType, shiftTypes, job.shiftTypeId)}
              </SpecRow>

              <SpecRow label="Work mode">
                {displayMappedValue(job.workMode, workModes, job.workModeId)}
              </SpecRow>

              <SpecRow label="Company">
                {job.companyName || '—'}
              </SpecRow>

              <SpecRow label="Company email">
                {job.companyEmail || job.email || '—'}
              </SpecRow>
            </div>
          </div>

          {/* Interview Details Sidebar Card */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 lg:p-6">
            <h4 className="text-xs font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>{t('jobs.detail.interviewProcess')}</span>
            </h4>
            <div className="space-y-3.5 text-xs text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold leading-none mb-1">INTERVIEW MODE</span>
                <span className="font-bold text-slate-800 block break-words">
                  {displayMappedValue(job.interviewMode, interviewModes, job.interviewModeId)}
                </span>
              </div>
              {job.interviewLocation && (
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold leading-none mb-1">INTERVIEW LOCATION / LINK</span>
                  <p className="font-semibold text-slate-700 leading-normal block">{job.interviewLocation}</p>
                </div>
              )}
            </div>
          </div>

          {/* Posting date / Expiry date */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm sm:p-5 lg:p-6">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-slate-400 block text-[10px] font-bold leading-none mb-0.5">EXPIRE DATE</span>
                <span className="font-bold text-slate-800 block break-words">
                  {formatDateOnly(job.expiryDate) || '—'}
                </span>
              </div>
            </div>

            {job.postingNotes && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold leading-none mb-1">POSTING NOTES</span>
                <p className="text-slate-500 text-[11px] leading-normal font-medium block">{job.postingNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer - Sticky Apply Button on mobile */}
      {!isEmployerOrStaff && (
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] sm:hidden">
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 block font-bold">MONTHLY RANGE</span>
          <span className="block truncate text-sm font-black text-slate-800">
            {formatAmount(job.salary) ? `₹${formatAmount(job.salary)}` : '—'}{job.salaryTo != null ? ` - ₹${formatAmount(job.salaryTo)}` : ''}
          </span>
        </div>

        {hasApplied ? (
          <span className="px-4 py-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
            {t('jobs.detail.appliedMobile')}
          </span>
        ) : (
          <button
            onClick={handleApplyClick}
            disabled={isApplying}
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isApplying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isApplying ? t('jobs.detail.submitting') : t('jobs.detail.apply')}</span>
          </button>
        )}
      </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmApply}
        title={t('jobs.detail.confirmTitle')}
        message={t('jobs.detail.confirmMessage', { designation: job.jobDesignation })}
        confirmText={t('jobs.detail.confirmYes')}
        cancelText={t('jobs.detail.confirmCancel')}
      />

      {showToast && <Toast message={toastMsg} type={toastType} onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default JobDetailsView;
