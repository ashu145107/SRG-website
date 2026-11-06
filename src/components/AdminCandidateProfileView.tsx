/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Reusable read-only candidate profile body.
 * Used by the /candidate/:candidateId page and inside the admin dashboard
 * (so the admin shell stays visible when viewing a candidate).
 * Fetches data from GET /api/v1/viewcandidateprofile/{candidateId}
 *
 * Layout mirrors the user module's ProfilePage (tabbed: Basic Details + Resume)
 * with additional admin-only contact badges.
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getApiBaseUrl } from '../services/baseApi';
import { useGetAdminCandidateDetailQuery } from '../services/adminApi';
import { logProfileDownload } from '../services/profileApi';
import { RootState } from '../store';
import { EmploymentHistory, UserRole } from '../types';
import {
  UserCircle,
  FileText,
  Eye,
  Download,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  AlertCircle,
  Building2,
  Layers,
  CalendarDays,
  BadgeCheck
} from 'lucide-react';
import { Loader } from './ui/FeedbackComponents';

interface CandidateData {
  fullName: string;
  email: string;
  phone: string;
  profilePicUrl: string;
  address: string;
  district: string;
  city: string;
  qualification: string;
  specialization: string;
  courses: string;
  resumeHeadline: string;
  profileSummary: string;
  preferredJobLocations: string;
  jobType: string;
  shiftType: string;
  workStatus: string;
  currentSalary: number | null;
  expectation: number | null;
  noticePeriod: number | null;
  experienceYears: number | string;
  skills: string[];
  resumeUrl: string;
  resumeName: string;
  employmentHistory: EmploymentHistory[];
}

const formatDisplayDate = (value?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const Field = ({ icon, label, value, fullWidth }: { icon: React.ReactNode; label: string; value?: string | number; fullWidth?: boolean }) => (
  <div className={`bg-slate-50 rounded-xl p-4 ${fullWidth ? 'sm:col-span-2' : ''}`}>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
    <div className="flex items-start gap-2">
      <span className="text-blue-400 mt-0.5 shrink-0">{icon}</span>
      <p className="text-xs font-bold text-gray-800 break-words">{value || <span className="text-gray-300 italic">Not provided</span>}</p>
    </div>
  </div>
);

interface AdminCandidateProfileViewProps {
  candidateId: string;
  /** Called when the user cancels an error state (Go Back). */
  onBack?: () => void;
}

export function AdminCandidateProfileView({ candidateId, onBack }: AdminCandidateProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'education' | 'employment' | 'resume'>('details');
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);
  const [resumeActionError, setResumeActionError] = useState('');
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: profile, isLoading, error } = useGetAdminCandidateDetailQuery(candidateId, {
    skip: !candidateId,
  });

  const isCandidate = String(user?.role || '').toUpperCase() === UserRole.CANDIDATE;

  const handleDownload = () => {
    if (isCandidate) return;
    void logProfileDownload({ candidateId, role: user?.role });
  };

  const resolveResumeUrl = (url: string): string => {
    if (!url) return '';
    const apiBaseUrl = getApiBaseUrl() || 'https://srgapp.dindoripranit.org';

    try {
      return new URL(url, `${apiBaseUrl.replace(/\/+$/, '')}/`).toString();
    } catch {
      return url;
    }
  };

  const downloadResume = async (url: string, fileName: string) => {
    setResumeActionError('');
    setIsDownloadingResume(true);
    handleDownload();

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Resume download failed (${response.status}).`);
      }

      const blob = await response.blob();
      if (!blob.size) {
        throw new Error('The resume file is empty.');
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName || 'resume';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      setResumeActionError(err instanceof Error ? err.message : 'Unable to download resume.');
    } finally {
      setIsDownloadingResume(false);
    }
  };

  // Map the normalized CandidateProfile → CandidateData for display
  const candidate: CandidateData | null = profile ? {
    fullName: profile.fullName || '',
    email: profile.email || '',
    phone: profile.phone || profile.mobile || '',
    profilePicUrl: profile.profilePicUrl || '',
    address: profile.address || '',
    district: profile.district || '',
    city: profile.city || '',
    qualification: profile.qualification || profile.education || '',
    specialization: profile.specialization || '',
    courses: profile.courses || '',
    resumeHeadline: profile.resumeHeadline || '',
    profileSummary: profile.profileSummary || '',
    preferredJobLocations: profile.preferredJobLocations || '',
    jobType: profile.jobType || '',
    shiftType: profile.shiftType || '',
    workStatus: profile.workStatus || '',
    currentSalary: profile.currentSalary ?? null,
    expectation: profile.expectation ?? null,
    noticePeriod: profile.noticePeriod ?? null,
    experienceYears: profile.experienceYears || profile.experience || 0,
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    resumeUrl: resolveResumeUrl(profile.resumeUrl || ''),
    resumeName: profile.resumeName || (profile.resumeUrl ? decodeURIComponent(profile.resumeUrl.split('/').pop() || 'Resume') : ''),
    employmentHistory: Array.isArray(profile.employmentHistory) ? profile.employmentHistory : [],
  } : null;

  const errorMsg = error
    ? ('data' in error && error.data ? JSON.stringify(error.data) : (error as any)?.error || (error as any)?.message || 'Failed to load candidate profile.')
    : '';

  const tabs = [
    { key: 'details' as const, label: 'Basic Details', icon: <UserCircle className="w-4 h-4" /> },
    { key: 'education' as const, label: 'Education Details', icon: <GraduationCap className="w-4 h-4" /> },
    { key: 'employment' as const, label: 'Employment History', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'resume' as const, label: 'Resume / CV', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-blue-950">Candidate Profile</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Candidate profile details
        </p>
      </div>

      {/* Loading */}
      {isLoading && <Loader />}

      {/* Error */}
      {!isLoading && errorMsg && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-sm font-bold text-red-600">{errorMsg}</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-5 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
            >
              Go Back
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {!isLoading && !errorMsg && candidate && (
        <div className="space-y-6">
          {/* Profile header card — matches user module */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            {candidate.profilePicUrl ? (
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-theme-lightViolet shadow-sm shrink-0">
                <img
                  src={candidate.profilePicUrl}
                  alt={candidate.fullName}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-theme-lightViolet border-2 border-dashed border-theme-sage/60 shadow-sm flex items-center justify-center shrink-0">
                <UserCircle className="w-14 h-14 text-theme-lavender/50" />
              </div>
            )}

            {/* Name + contact badges */}
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-black text-blue-950 leading-tight">
                {candidate.fullName || 'Unnamed Candidate'}
              </h2>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {candidate.phone && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                    <Phone className="w-3 h-3" /> {candidate.phone}
                  </span>
                )}
                {candidate.email && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                    <Mail className="w-3 h-3" /> {candidate.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tab bar — matches user module's orange-underline style */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.key
                    ? 'border-orange-600 text-orange-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 min-h-[300px]">

            {/* ---- TAB 1: Basic Details ---- */}
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field icon={<UserCircle className="w-4 h-4" />} label="Full Name" value={candidate.fullName} />
                <Field icon={<Phone className="w-4 h-4" />} label="Phone" value={candidate.phone} />
                <Field icon={<Mail className="w-4 h-4" />} label="Email" value={candidate.email} />
                <Field icon={<MapPin className="w-4 h-4" />} label="City" value={candidate.city} />
                <Field icon={<MapPin className="w-4 h-4" />} label="District" value={candidate.district} />
                <Field icon={<MapPin className="w-4 h-4" />} label="Address" value={candidate.address} fullWidth />
              </div>
            )}

            {/* ---- TAB: Education Details (read-only) ---- */}
            {activeTab === 'education' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field icon={<GraduationCap className="w-4 h-4" />} label="Qualification" value={candidate.qualification} />
                <Field icon={<GraduationCap className="w-4 h-4" />} label="Specialization" value={candidate.specialization} />
                <Field icon={<Layers className="w-4 h-4" />} label="Courses" value={candidate.courses} />
                <Field icon={<Briefcase className="w-4 h-4" />} label="Experience (Years)" value={candidate.experienceYears ? String(candidate.experienceYears) : ''} />
                <Field icon={<MapPin className="w-4 h-4" />} label="Preferred Job Locations" value={candidate.preferredJobLocations} fullWidth />
                <Field icon={<Briefcase className="w-4 h-4" />} label="Job Type" value={candidate.jobType} />
                <Field icon={<CalendarDays className="w-4 h-4" />} label="Shift Type" value={candidate.shiftType} />
                <Field icon={<BadgeCheck className="w-4 h-4" />} label="Work Status" value={candidate.workStatus} />
                <Field icon={<FileText className="w-4 h-4" />} label="Current Salary" value={typeof candidate.currentSalary === 'number' ? `₹${candidate.currentSalary}` : (candidate.currentSalary ?? '')} />
                <Field icon={<FileText className="w-4 h-4" />} label="Expected / Salary Expectation" value={typeof candidate.expectation === 'number' ? `₹${candidate.expectation}` : (candidate.expectation ?? '')} />
                <Field icon={<CalendarDays className="w-4 h-4" />} label="Notice Period" value={candidate.noticePeriod != null ? String(candidate.noticePeriod) : ''} />
                <Field icon={<FileText className="w-4 h-4" />} label="Resume Headline" value={candidate.resumeHeadline} fullWidth />
                <Field icon={<FileText className="w-4 h-4" />} label="Profile Summary" value={candidate.profileSummary} fullWidth />

                {candidate.skills.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 sm:col-span-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 text-[11px] font-bold rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---- TAB 3: Employment History (read-only) ---- */}
            {activeTab === 'employment' && (
              <>
                {candidate.employmentHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <Briefcase className="w-7 h-7 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No employment history added yet</p>
                    <p className="text-xs text-slate-400 font-medium mt-1 max-w-xs mx-auto">
                      This candidate has not added any previous work experience.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {candidate.employmentHistory.map((entry, idx) => (
                      <div
                        key={entry.employmentHistoryId ?? `emp-${idx}`}
                        className="border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                              <Building2 className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-extrabold text-slate-800 truncate">
                                {entry.companyName || 'Unknown Company'}
                              </h4>
                              <p className="text-xs text-slate-500 font-semibold truncate">
                                {entry.designation || 'Designation not set'}
                                {entry.department ? ` · ${entry.department}` : ''}
                              </p>
                            </div>
                          </div>
                          {entry.isCurrentJob && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full shrink-0">
                              <BadgeCheck className="w-3 h-3" /> Current
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {entry.industryTypeName && (
                            <div className="flex items-center gap-2">
                              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-[11px] text-slate-600 font-medium truncate">{entry.industryTypeName}</span>
                            </div>
                          )}
                          {entry.jobTypeName && (
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-[11px] text-slate-600 font-medium truncate">{entry.jobTypeName}</span>
                            </div>
                          )}
                          {entry.jobLocation && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-[11px] text-slate-600 font-medium truncate">{entry.jobLocation}</span>
                            </div>
                          )}
                          {(entry.startDate || entry.endDate || entry.isCurrentJob) && (
                            <div className="flex items-center gap-2">
                              <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-[11px] text-slate-600 font-medium truncate">
                                {formatDisplayDate(entry.startDate)}
                                {entry.isCurrentJob ? ' — Present' : entry.endDate ? ` — ${formatDisplayDate(entry.endDate)}` : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ---- TAB 2: Resume / CV ---- */}
            {activeTab === 'resume' && (
              <>
                {candidate.resumeUrl ? (
                  <div className="w-full max-w-2xl space-y-4">
                    {/* Resume card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4">
                      <FileText className="w-10 h-10 text-blue-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-blue-900 truncate">My Resume</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={candidate.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </a>
                        {!isCandidate && (
                          <button
                            type="button"
                            onClick={() => void downloadResume(candidate.resumeUrl, candidate.resumeName)}
                            disabled={isDownloadingResume}
                            className="px-3 py-2 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" /> {isDownloadingResume ? 'Downloading...' : 'Download'}
                          </button>
                        )}
                      </div>
                    </div>
                    {resumeActionError && (
                      <p role="alert" className="text-xs font-medium text-red-600">
                        {resumeActionError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="w-full max-w-md mx-auto bg-slate-50 border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-2">
                    <FileText className="w-12 h-12 text-gray-300" />
                    <p className="text-xs text-gray-400 font-medium">No resume uploaded by this candidate</p>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}

export default AdminCandidateProfileView;
