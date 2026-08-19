/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSearchJobsQuery } from '../../hooks/useJobQueries';
import {
  Search,
  RefreshCw,
  Eye,
  Edit,
  Check,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';
import { Alert } from '../ui/FeedbackComponents';
import { Job } from '../../types';

interface JobListingViewProps {
  onViewDetails: (id: number, jobCode?: string) => void;
  onEditJob?: (id: number) => void;
  onAddNewJob?: () => void;
  appliedJobIds?: number[];
  /** When provided, component uses this data instead of fetching internally */
  externalJobs?: Job[];
  externalTotalCount?: number;
  externalIsLoading?: boolean;
  externalIsFetching?: boolean;
  externalRefetch?: () => void;
}

export const JobListingView: React.FC<JobListingViewProps> = ({
  onViewDetails,
  onEditJob,
  onAddNewJob,
  appliedJobIds = [],
  externalJobs,
  externalTotalCount,
  externalIsLoading,
  externalIsFetching,
  externalRefetch,
}) => {
  const { i18n } = useTranslation();

  const user = useSelector((state: any) => state.auth?.user);
  const userRole = user?.role;

  const isEmployerOrStaff =
    userRole === 'ADMIN' || userRole === 'HANDLER' || userRole === 'EMPLOYER';

  // Search & Filter state
  const [searchPhrase, setSearchPhrase] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterWorkPlace, setFilterWorkPlace] = useState('');

  // Sort state (jobCode descending is default — recent first)
  const [sortColumn, setSortColumn] = useState<string>('jobCode');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [pageSize, setPageSize] = useState(15);
  const [pageNumber, setPageNumber] = useState(1);

  // When external data is provided (employer view), skip internal API call
  const useExternal = !!externalJobs;

  const {
    data: searchData,
    isLoading: internalLoading,
    isFetching: internalFetching,
    error,
    refetch: internalRefetch,
  } = useSearchJobsQuery(
    useExternal
      ? undefined
      : { searchPhrase: searchPhrase || undefined, page: pageNumber, limit: pageSize }
  );

  const jobs = useExternal ? externalJobs! : (searchData?.jobs || []);
  const totalCount = useExternal ? (externalTotalCount ?? externalJobs!.length) : (searchData?.totalCount || 0);
  const isLoading = useExternal ? !!externalIsLoading : internalLoading;
  const isFetching = useExternal ? !!externalIsFetching : internalFetching;

  const handleRefresh = () => {
    if (useExternal && externalRefetch) externalRefetch();
    else internalRefetch();
  };

  // Reset page on filter change
  React.useEffect(() => {
    setPageNumber(1);
  }, [searchPhrase, filterSkill, filterWorkPlace]);

  // Unique values for filter dropdowns
  const uniqueSkills = React.useMemo(() => {
    const vals = jobs.map((j: any) => j.skill || j.skill || '').filter(Boolean);
    return [...new Set(vals)].sort();
  }, [jobs]);

  const uniqueWorkPlaces = React.useMemo(() => {
    const vals = jobs.map((j: any) => j.workPlace || j.jobLocation || '').filter(Boolean);
    return [...new Set(vals)].sort();
  }, [jobs]);

  // Search + Filter + Sort
  const filteredAndSortedJobs = React.useMemo(() => {
    let result = [...jobs];

    // 1. Search filter
    if (searchPhrase.trim()) {
      const phrase = searchPhrase.toLowerCase();
      result = result.filter((j: any) =>
        (j.jobCode || '').toLowerCase().includes(phrase) ||
        (j.profileHeader || j.jobDesignation || '').toLowerCase().includes(phrase) ||
        (j.companyName || '').toLowerCase().includes(phrase) ||
        (j.workPlace || j.jobLocation || '').toLowerCase().includes(phrase) ||
        (j.skill || '').toLowerCase().includes(phrase) ||
        (j.email || '').toLowerCase().includes(phrase)
      );
    }

    // 2. Skill filter
    if (filterSkill) {
      result = result.filter((j: any) => (j.skill || '') === filterSkill);
    }

    // 3. WorkPlace filter
    if (filterWorkPlace) {
      result = result.filter((j: any) => (j.workPlace || j.jobLocation || '') === filterWorkPlace);
    }

    // 4. Sort
    result.sort((a: any, b: any) => {
      let valA = a[sortColumn] !== undefined ? a[sortColumn] : '';
      let valB = b[sortColumn] !== undefined ? b[sortColumn] : '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [jobs, searchPhrase, filterSkill, filterWorkPlace, sortColumn, sortOrder]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
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
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-xs font-bold bg-white"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">रीफ्रेश / Refresh</span>
          </button>
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

      {/* Search & Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-150 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="नोकरी शोधा (code, designation, company, skill...)"
              value={searchPhrase}
              onChange={(e) => setSearchPhrase(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:border-orange-500 text-slate-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="text-xs px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-orange-500 text-slate-800 font-semibold cursor-pointer"
            >
              <option value="">All Skills</option>
              {uniqueSkills.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={filterWorkPlace}
              onChange={(e) => setFilterWorkPlace(e.target.value)}
              className="text-xs px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-orange-500 text-slate-800 font-semibold cursor-pointer"
            >
              <option value="">All Work Places</option>
              {uniqueWorkPlaces.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            {(searchPhrase || filterSkill || filterWorkPlace) && (
              <button
                onClick={() => { setSearchPhrase(''); setFilterSkill(''); setFilterWorkPlace(''); }}
                className="text-[10px] text-orange-600 font-bold hover:underline cursor-pointer whitespace-nowrap"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="my-4">
          <Alert
            type="error"
            title="API Error"
            message="Failed to load job details. Please check your connection and retry."
          />
        </div>
      )}

      {/* Loading */}
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
      ) : filteredAndSortedJobs.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="text-slate-350 text-4xl mb-3">📁</div>
          <h3 className="text-sm font-bold text-slate-700">जाहिराती आढळल्या नाहीत / No Jobs Found</h3>
          <p className="text-xs text-slate-500 mt-1">तुमच्या शोध निकषांशी जुळणारी एकही नोकरी सध्या उपलब्ध नाही.</p>
          <button
            onClick={() => { setSearchPhrase(''); setFilterSkill(''); setFilterWorkPlace(''); }}
            className="mt-4 px-4 py-2 text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
          >
            फिल्टर्स साफ करा / Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="text-[10px] text-slate-400 font-bold">
            Showing {filteredAndSortedJobs.length} of {totalCount} vacancies
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-150 text-slate-700 font-extrabold uppercase tracking-wider">
                    <th onClick={() => handleSort('jobCode')} className="px-5 py-4 font-extrabold text-[10px] text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap">
                      <div className="flex items-center gap-1">Job Code <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                    </th>
                    <th onClick={() => handleSort('profileHeader')} className="px-5 py-4 font-extrabold text-[10px] text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-1">Designation <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                    </th>
                    <th onClick={() => handleSort('companyName')} className="px-5 py-4 font-extrabold text-[10px] text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-1">Company Name <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                    </th>
                    <th onClick={() => handleSort('workPlace')} className="px-5 py-4 font-extrabold text-[10px] text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-1">Work Place <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                    </th>
                    <th onClick={() => handleSort('skill')} className="px-5 py-4 font-extrabold text-[10px] text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-1">Skill <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                    </th>
                    <th className="px-5 py-4 font-extrabold text-[10px] text-slate-500 text-right">कृती / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredAndSortedJobs.map((job: any, index: number) => {
                    const jobIdNum = Number(job.id || index);
                    const isApplied = appliedJobIds.includes(jobIdNum);

                    return (
                      <tr key={jobIdNum} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-slate-500 whitespace-nowrap">
                          {job.jobCode || `JOB-${jobIdNum}`}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-extrabold text-slate-900 block">
                            {job.profileHeader || job.jobDesignation || 'N/A'}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-700 max-w-[150px] break-words">
                          {job.companyName || 'N/A'}
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800 whitespace-nowrap">
                          {job.workPlace || job.jobLocation || 'N/A'}
                        </td>
                        <td className="px-5 py-4 text-slate-500 break-words max-w-[200px]">
                          {job.skill || 'N/A'}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => onViewDetails(jobIdNum, job.jobCode)}
                              className="py-1.5 px-3 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer text-slate-700"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            {isEmployerOrStaff && onEditJob && (
                              <button
                                onClick={() => onEditJob(Number(job.id))}
                                className="py-1.5 px-3 bg-orange-50 border border-orange-100 hover:bg-orange-100 hover:text-orange-950 text-orange-900 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                            )}
                            {!isEmployerOrStaff && isApplied && (
                              <span className="inline-flex items-center gap-1 py-1.5 px-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-xs font-bold shadow-2xs">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Applied</span>
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

          {/* MOBILE CARDS */}
          <div className="lg:hidden space-y-4">
            {filteredAndSortedJobs.map((job: any, index: number) => {
              const jobIdNum = Number(job.id || index);
              const isApplied = appliedJobIds.includes(jobIdNum);

              return (
                <div
                  key={jobIdNum}
                  className="bg-white rounded-2xl border border-slate-150 p-5 space-y-3 shadow-2xs relative"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <span className="font-mono text-[9px] text-slate-400 font-bold">
                        {job.jobCode || `JOB-${jobIdNum}`}
                      </span>
                      <h3 className="text-base font-black text-slate-900 leading-tight block">
                        {job.profileHeader || job.jobDesignation || 'N/A'}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block font-bold text-[9px] mb-0.5">COMPANY</span>
                      <span className="font-extrabold text-slate-800 block">{job.companyName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold text-[9px] mb-0.5">WORK PLACE</span>
                      <span className="font-extrabold text-slate-800 block">{job.workPlace || job.jobLocation || 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block font-bold text-[9px] mb-0.5">SKILL</span>
                      <span className="font-extrabold text-slate-800 block">{job.skill || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onViewDetails(jobIdNum, job.jobCode)}
                      className="py-2 px-4 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer text-slate-700 flex-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    {isEmployerOrStaff && onEditJob && (
                      <button
                        onClick={() => onEditJob(Number(job.id))}
                        className="py-2 px-4 bg-orange-50 border border-orange-100 text-orange-900 hover:bg-orange-100 hover:text-orange-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer flex-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                    {!isEmployerOrStaff && isApplied && (
                      <span className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex-1 text-center">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Applied</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Pagination */}
      {!isLoading && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <div className="text-xs text-slate-500">
            Showing {totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1} to{' '}
            {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} vacancies
          </div>
          <div className="flex items-center gap-1 text-xs flex-wrap">
            <button
              onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
              disabled={pageNumber === 1 || isFetching}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
              const totalPages = Math.ceil(totalCount / pageSize);
              const startPage = Math.max(1, pageNumber - 2);
              return startPage + i <= totalPages ? startPage + i : null;
            }).filter(Boolean).map((page) => (
              <button
                key={page}
                onClick={() => setPageNumber(page!)}
                disabled={isFetching}
                className={`min-w-[32px] h-8 rounded-lg font-bold border transition-all cursor-pointer ${
                  pageNumber === page
                    ? 'bg-blue-950 border-blue-950 text-white shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
            {Math.ceil(totalCount / pageSize) > 5 && pageNumber < Math.ceil(totalCount / pageSize) - 2 && (
              <span className="text-slate-400 px-1">...</span>
            )}
            {Math.ceil(totalCount / pageSize) > 5 && pageNumber < Math.ceil(totalCount / pageSize) - 2 && (
              <button
                onClick={() => setPageNumber(Math.ceil(totalCount / pageSize))}
                disabled={isFetching}
                className="min-w-[32px] h-8 rounded-lg font-bold border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                {Math.ceil(totalCount / pageSize)}
              </button>
            )}
            <button
              onClick={() => setPageNumber(prev => Math.min(prev + 1, Math.ceil(totalCount / pageSize)))}
              disabled={pageNumber === Math.ceil(totalCount / pageSize) || isFetching}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListingView;
