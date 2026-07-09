/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSearchJobsQuery } from '../../hooks/useJobQueries';
import { JobRequirement } from '../../services/jobTypes';
import {
  getLabel,
  educations,
  roleTypes,
  workModes,
  salaryPeriods,
  specializations,
} from './jobMappings';
import {
  Search,
  MapPin,
  Briefcase,
  Layers,
  RefreshCw,
  Eye,
  Edit,
  Check,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Alert } from '../ui/FeedbackComponents';

interface JobListingViewProps {
  onViewDetails: (id: number) => void;
  onEditJob?: (id: number) => void;
  onAddNewJob?: () => void;
  appliedJobIds?: number[];
}

export const JobListingView: React.FC<JobListingViewProps> = ({
  onViewDetails,
  onEditJob,
  onAddNewJob,
  appliedJobIds = [],
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'mr' ? 'mr' : 'en';

  const user = useSelector((state: any) => state.auth?.user);
  const userRole = user?.role; // 'ADMIN' | 'HANDLER' | 'EMPLOYER' | 'CANDIDATE'

  const isEmployerOrStaff =
    userRole === 'ADMIN' || userRole === 'HANDLER' || userRole === 'EMPLOYER';

  // Filters state
  const [searchPhrase, setSearchPhrase] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch Jobs via TanStack Query
  const {
    data: jobs = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useSearchJobsQuery({
    searchPhrase: searchPhrase || undefined,
  });

  const handleRefresh = () => {
    refetch();
  };

  // Perform Client-Side Filtering on top of API Search (to provide seamless, instant UX)
  const filteredJobs = jobs.filter((job) => {
    // 1. Location Filter
    if (
      selectedLocation &&
      !job.jobLocation.toLowerCase().includes(selectedLocation.toLowerCase())
    ) {
      return false;
    }
    // 2. Work Mode Filter
    if (selectedWorkMode && job.workModeId !== Number(selectedWorkMode)) {
      return false;
    }
    // 3. Category/Specialization Filter
    if (selectedCategory && job.specialization !== Number(selectedCategory)) {
      return false;
    }
    return true;
  });

  // Extract unique locations from listed jobs to populate filter dynamically
  const uniqueLocations = Array.from(
    new Set(jobs.map((j) => j.jobLocation).filter(Boolean))
  );

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header and Add Action for Employers */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {isEmployerOrStaff
              ? 'तुमच्या नोकरी जाहिराती / Managed Job Requirements'
              : 'उपलब्ध नोकरीच्या संधी / Available Job Vacancies'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEmployerOrStaff
              ? 'थेट प्रणालीद्वारे जोडलेल्या रिक्त जागांचे व्यवस्थापन करा.'
              : 'तुमच्या शैक्षणिक पात्रतेनुसार विविध नोकरीच्या संधी शोधा.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-xs font-bold bg-white"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">रीफ्रेश / Refresh</span>
          </button>

          {/* Add Job Requirement Button for Employers/Admins */}
          {isEmployerOrStaff && onAddNewJob && (
            <button
              onClick={onAddNewJob}
              className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>नवीन जागा जोडा / Post Job</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white rounded-2xl border border-slate-150 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Term Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="नोकरी शोधा (उदा. Accountant, Manager...)"
              value={searchPhrase}
              onChange={(e) => setSearchPhrase(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition-all bg-slate-50/50"
            />
          </div>

          {/* Location Dropdown */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition-all bg-white appearance-none"
            >
              <option value="">सर्व ठिकाणे / All Locations</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Work Mode Dropdown */}
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition-all bg-white appearance-none"
            >
              <option value="">सर्व कामाच्या पद्धती / All Work Modes</option>
              {workModes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.labelMr} / {mode.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Specialization Dropdown */}
          <div className="relative">
            <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition-all bg-white appearance-none"
            >
              <option value="">सर्व नोकरी क्षेत्रे / All Categories</option>
              {specializations.map((spec) => (
                <option key={spec.value} value={spec.value}>
                  {spec.labelMr} / {spec.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Query Error State */}
      {error && (
        <div className="my-4">
          <Alert
            type="error"
            title="API Error"
            message="थेट नोकरी माहिती लोड करताना एरर आली. कृपया इंटरनेट तपासा. / Failed to load live job details. Please retry."
          />
        </div>
      )}

      {/* Loading Skeleton Loader */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-5 rounded-2xl border border-slate-100 animate-pulse flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-200 rounded-md w-1/3"></div>
                <div className="h-3.5 bg-slate-150 rounded-md w-1/4"></div>
                <div className="h-3.5 bg-slate-150 rounded-md w-1/2"></div>
              </div>
              <div className="h-8 bg-slate-200 rounded-xl w-24"></div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="text-slate-350 text-4xl mb-3">📁</div>
          <h3 className="text-sm font-bold text-slate-700">जाहिराती आढळल्या नाहीत / No Jobs Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            तुमच्या शोध निकषांशी जुळणारी एकही नोकरी सध्या उपलब्ध नाही.
          </p>
          <button
            onClick={() => {
              setSearchPhrase('');
              setSelectedLocation('');
              setSelectedWorkMode('');
              setSelectedCategory('');
            }}
            className="mt-4 px-4 py-2 text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
          >
            फिल्टर्स साफ करा / Clear Filters
          </button>
        </div>
      ) : (
        /* Responsive Views: Table for Desktop, Cards for Mobile */
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-150 text-slate-700 font-extrabold uppercase tracking-wider">
                    <th className="px-5 py-4 font-extrabold text-[10px] text-slate-500">नोकरी कोड / Code</th>
                    <th className="px-5 py-4 font-extrabold text-[10px] text-slate-500">पद / Designation</th>
                    <th className="px-5 py-4 font-extrabold text-[10px] text-slate-500">क्षेत्र / Category</th>
                    <th className="px-5 py-4 font-extrabold text-[10px] text-slate-500">काम पद्धत / Mode</th>
                    <th className="px-5 py-4 font-extrabold text-[10px] text-slate-500">ठिकाण / Location</th>
                    <th className="px-5 py-4 font-extrabold text-[10px] text-slate-500">मासिक वेतनश्रेणी / Salary</th>
                    <th className="px-5 py-4 font-extrabold text-[10px] text-slate-500 text-right">कृती / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredJobs.map((job) => {
                    const isApplied = appliedJobIds.includes(Number(job.id));

                    return (
                      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-slate-500">
                          {job.jobCode || `JOB-${job.id}`}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-extrabold text-slate-900 block">
                            {job.jobDesignation}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1 max-w-[200px]">
                            {job.profileHeader}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-950 font-bold border border-blue-100 rounded-md text-[10px]">
                            {getLabel(specializations, job.specialization, lang)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-850 font-bold border border-slate-200 rounded-md text-[10px]">
                            {getLabel(workModes, job.workModeId, lang)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-800">{job.jobLocation}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-extrabold text-slate-900 block">
                            ₹{job.salary.toLocaleString()} - ₹{job.salaryTo.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            {getLabel(salaryPeriods, job.salaryPeriodId, lang)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="inline-flex gap-2">
                            {/* View details */}
                            <button
                              onClick={() => onViewDetails(Number(job.id))}
                              className="py-1.5 px-3 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer text-slate-700"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>तपशील / View</span>
                            </button>

                            {/* Edit vacancy if authorized */}
                            {isEmployerOrStaff && onEditJob && (
                              <button
                                onClick={() => onEditJob(Number(job.id))}
                                className="py-1.5 px-3 bg-orange-50 border border-orange-100 hover:bg-orange-100 hover:text-orange-950 text-orange-900 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>संपादित करा / Edit</span>
                              </button>
                            )}

                            {/* Seeker Quick Apply indicator */}
                            {!isEmployerOrStaff && isApplied && (
                              <span className="inline-flex items-center gap-1 py-1.5 px-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-xs font-bold shadow-2xs">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>सादर / Applied</span>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS VIEW */}
          <div className="lg:hidden space-y-4">
            {filteredJobs.map((job) => {
              const isApplied = appliedJobIds.includes(Number(job.id));

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-150 p-5 space-y-4 shadow-2xs relative"
                >
                  {/* Top Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-950 text-[9px] font-extrabold border border-orange-100 rounded-md">
                          {getLabel(roleTypes, job.roleTypeId, lang)}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400 font-bold">
                          {job.jobCode || `JOB-${job.id}`}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 leading-tight block">
                        {job.jobDesignation}
                      </h3>
                      <p className="text-xs font-bold text-slate-500 leading-tight block">{job.profileHeader}</p>
                    </div>
                  </div>

                  {/* Core specs list */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block font-bold text-[9px] mb-0.5">LOCATION</span>
                      <span className="font-extrabold text-slate-800 block">{job.jobLocation}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold text-[9px] mb-0.5">WORK MODE</span>
                      <span className="font-extrabold text-slate-800 block">
                        {getLabel(workModes, job.workModeId, lang)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold text-[9px] mb-0.5">SALARY</span>
                      <span className="font-extrabold text-slate-800 block">
                        ₹{job.salary.toLocaleString()} - ₹{job.salaryTo.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold text-[9px] mb-0.5">VACANCIES</span>
                      <span className="font-extrabold text-slate-800 block">{job.noOfVacancy} Positions</span>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onViewDetails(Number(job.id))}
                      className="py-2 px-4 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer text-slate-700 flex-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>तपशील / View</span>
                    </button>

                    {isEmployerOrStaff && onEditJob && (
                      <button
                        onClick={() => onEditJob(Number(job.id))}
                        className="py-2 px-4 bg-orange-50 border border-orange-100 text-orange-900 hover:bg-orange-100 hover:text-orange-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer flex-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>सुधारा / Edit</span>
                      </button>
                    )}

                    {!isEmployerOrStaff && isApplied && (
                      <span className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex-1 text-center">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>सादर / Applied</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default JobListingView;
