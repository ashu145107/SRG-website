/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useJobDetailsQuery, useApplyJobMutation } from '../../hooks/useJobQueries';
import {
  getLabel,
  educations,
  roleTypes,
  interviewModes,
  shiftTypes,
  workModes,
  salaryPeriods,
  weeklyOffs,
} from './jobMappings';
import { Alert, Toast, ConfirmDialog } from '../ui/FeedbackComponents';
import {
  Briefcase,
  MapPin,
  Calendar,
  Users,
  Clock,
  BookOpen,
  DollarSign,
  Award,
  ChevronLeft,
  CheckCircle,
  HelpCircle,
  Phone,
} from 'lucide-react';

interface JobDetailsViewProps {
  jobId: number;
  onBack?: () => void;
  onApplySuccess?: (appliedJobCode?: string) => void;
  alreadyApplied?: boolean;
  jobCode?: string;
}

export const JobDetailsView: React.FC<JobDetailsViewProps> = ({
  jobId,
  onBack,
  onApplySuccess,
  alreadyApplied: initialApplied = false,
  jobCode,
}) => {
  const { t, i18n } = useTranslation();
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
  const { data: job, isLoading, error: loadError, refetch } = useJobDetailsQuery(jobId, jobCode);
  const applyJobMutation = useApplyJobMutation();
  const applyJob = applyJobMutation.mutateAsync;
  const isApplying = applyJobMutation.isPending;

  // Dialog and feedback states
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasApplied, setHasApplied] = useState(initialApplied);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      setToastType('error');
      setToastMsg('अर्ज करण्यासाठी कृपया प्रथम लॉगिन करा! / Please log in first to apply!');
      setShowToast(true);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmApply = async () => {
    setShowConfirm(false);
    try {
      const jobIdentifier = job?.jobCode || String(jobId);
      const response: any = await applyJob([jobIdentifier]);

      if (response && response.isSuccess === false) {
        throw { response: { data: response } };
      }

      setHasApplied(true);
      setToastType('success');
      setToastMsg(response?.message || 'अर्ज यशस्वीरीत्या सादर केला! / Application submitted successfully!');
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
        'अर्ज सबमिट करताना त्रुटी आली. / Failed to submit application.';
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
        <h3 className="text-base font-bold text-slate-800">माहिती लोड करण्यात अयशस्वी / Failed to Load Job Details</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          There was an issue fetching the details for Job ID #{jobId}. Please try again or go back.
        </p>
        <div className="flex gap-2 justify-center mt-6">
          <button
            onClick={() => refetch()}
            className="py-2.5 px-5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            पुन्हा प्रयत्न करा / Retry
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="py-2.5 px-5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              मागे जा / Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto text-left space-y-6 pb-20 lg:pb-6 animate-fade-in">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>मागे जा / Back to Listings</span>
        </button>
      )}

      {/* Main Responsive Grid: 2 columns for large, stack for mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column (Main Details) - lg:col-span-2 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-150 shadow-xs p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-600" />
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-orange-50 border border-orange-100 text-orange-950 text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {getLabel(roleTypes, job.roleTypeId, lang)}
                  </span>
                  <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-950 text-[10px] font-bold rounded-md">
                    CODE: {job.jobCode || `JOB-${job.id}`}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {job.jobDesignation || job.profileHeader || 'Job Vacancy'}
                </h1>
                <p className="text-sm font-bold text-slate-600 block">{job.profileHeader || job.jobDesignation || 'Job Requirement'}</p>
              </div>

              {/* Desktop Apply Button */}
              {!isEmployerOrStaff && (
              <div className="hidden sm:block shrink-0">
                {hasApplied ? (
                  <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 shadow-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>अर्ज सादर / Applied</span>
                  </span>
                ) : (
                  <button
                    onClick={handleApplyClick}
                    disabled={isApplying}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    अर्ज करा / Apply Now
                  </button>
                )}
              </div>
              )}

            </div>

            {/* Core Specs Quick Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-slate-600">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-orange-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold leading-none mb-0.5">LOCATION</span>
                  <span className="text-xs font-bold text-slate-800 block">{job.jobLocation || job.workPlace || 'Nashik'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-orange-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold leading-none mb-0.5">SALARY RANGE</span>
                  <span className="text-xs font-bold text-slate-800 block">
                    ₹{job.salary ? job.salary.toLocaleString() : '0'} - ₹{job.salaryTo ? job.salaryTo.toLocaleString() : (job.salary ? job.salary.toLocaleString() : '0')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-orange-600">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold leading-none mb-0.5">EXPERIENCE</span>
                  <span className="text-xs font-bold text-slate-800 block">
                    {job.experiance !== undefined ? job.experiance : 0} - {job.experianceTo !== undefined ? job.experianceTo : 2} Years
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-orange-600">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold leading-none mb-0.5">VACANCIES</span>
                  <span className="text-xs font-bold text-slate-800 block">{job.noOfVacancy || 1} Positions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description Card */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Briefcase className="w-4.5 h-4.5 text-orange-600" />
              <span>नोकरीचे सविस्तर वर्णन / Job Description</span>
            </h3>
            <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-line block">
              {job.jobDiscription || job.profileHeader || 'Detailed job requirement specifications.'}
            </p>
          </div>

          {/* Required Skills & Certifications */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 space-y-5">
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Award className="w-4 h-4 text-orange-600" />
                <span>आवश्यक कौशल्ये / Required Skills</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {(job.skill || 'Relevant Skills').split(',').map((s, idx) => (
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
                  <span>आवश्यक प्रमाणपत्रे / Required Certifications</span>
                </h4>
                <p className="text-xs text-slate-600 font-semibold block">{job.certificationsRequired}</p>
              </div>
            )}
          </div>

          {/* Benefits */}
          {job.benefits && (
            <div className="bg-white rounded-2xl border border-slate-150 p-6 space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                इतर फायदे / Key Perks & Benefits
              </h3>
              <p className="text-xs text-slate-650 leading-relaxed block">{job.benefits}</p>
            </div>
          )}
        </div>

        {/* Right column (Sidebar specs) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 space-y-5 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-900" />
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              कामाची रूपरेषा / Job Specifications
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">कामाचे ठिकाण / Workplace:</span>
                <span className="font-extrabold text-slate-800">{job.workPlace || 'Office Office'}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">शिक्षण / Qualification:</span>
                <span className="font-extrabold text-slate-800">
                  {getLabel(educations, job.educationId, lang)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">क्षेत्र / Specialization:</span>
                <span className="font-extrabold text-slate-800">
                  {job.industryTypeId || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">वेतन कालावधी / Salary Period:</span>
                <span className="font-extrabold text-slate-800">
                  {getLabel(salaryPeriods, job.salaryPeriodId, lang)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">लिंग निवड / Gender Preference:</span>
                <span className="font-extrabold text-slate-800">
                  {job.genderPreference === 'Any' ? 'दोन्ही / Any Gender' : job.genderPreference}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">वय मर्यादा / Age Range:</span>
                <span className="font-extrabold text-slate-800">{job.ageRange || '18-45'}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">साप्ताहिक सुट्टी / Weekly Off:</span>
                <span className="font-extrabold text-slate-800">
                  {getLabel(weeklyOffs, job.weeklyOffId, lang)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">कामाची पाळी / Shift:</span>
                <span className="font-extrabold text-slate-800">
                  {getLabel(shiftTypes, job.shiftTypeId, lang)}
                </span>
              </div>
            </div>
          </div>

          {/* Interview Details Sidebar Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-150 p-6 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>मुलाखत तपशील / Interview Process</span>
            </h4>
            <div className="space-y-3.5 text-xs text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold leading-none mb-1">INTERVIEW MODE</span>
                <span className="font-bold text-slate-800">
                  {getLabel(interviewModes, job.interviewModeId, lang)}
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
          <div className="bg-white rounded-2xl border border-slate-150 p-6 space-y-4 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4.5 h-4.5 text-slate-400" />
              <div>
                <span className="text-slate-400 block text-[10px] font-bold leading-none mb-0.5">EXPIRE DATE</span>
                <span className="font-bold text-slate-800">
                  {new Date(job.expiryDate).toLocaleDateString()}
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
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-150 px-4 py-3 z-40 flex justify-between items-center shadow-lg">
        <div>
          <span className="text-[10px] text-slate-400 block font-bold">MONTHLY RANGE</span>
          <span className="text-sm font-black text-slate-800">
            ₹{job.salary.toLocaleString()} - ₹{job.salaryTo.toLocaleString()}
          </span>
        </div>

        {hasApplied ? (
          <span className="px-4 py-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
            ✓ अर्ज सादर / Applied
          </span>
        ) : (
          <button
            onClick={handleApplyClick}
            disabled={isApplying}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            अर्ज करा / Apply
          </button>
        )}
      </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmApply}
        title="नोकरीसाठी अर्ज निश्चित करा / Confirm Job Application"
        message={`तुम्ही या नोकरीसाठी (${job.jobDesignation}) अर्ज करू इच्छिता? / Are you sure you want to apply for this vacancy?`}
        confirmText="होय, अर्ज करा / Yes, Apply"
        cancelText="रद्द करा / Cancel"
      />

      {showToast && <Toast message={toastMsg} type={toastType} onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default JobDetailsView;
