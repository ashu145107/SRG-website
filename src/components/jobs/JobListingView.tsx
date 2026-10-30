/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSearchJobsQuery, useApplyJobMutation } from '../../hooks/useJobQueries';
import {
  Search,
  RefreshCw,
  Eye,
  Edit,
  Check,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  IndianRupee,
  Building2,
  CalendarDays,
  Loader2,
  Send,
  List as ListIcon,
  Table2,
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
  const { t, i18n } = useTranslation();

  const user = useSelector((state: any) => state.auth?.user);
  const userRole = String(user?.role || '').toUpperCase();

  const isEmployerOrStaff = [
    'ADMIN',
    'SUPER_ADMIN',
    'HANDLER',
    'COMPANY',
    'EMPLOYER',
    'STAFF',
  ].includes(userRole);

  // Search & Filter state
  const [searchPhrase, setSearchPhrase] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterWorkPlace, setFilterWorkPlace] = useState('');

  // Layout toggle: Naukri-style list vs compact table
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');

  // Sort state (recent is default — matches Naukri.com "most recent first")
  const [sortKey, setSortKey] = useState('recent');

  // Pagination state
  const [pageSize, setPageSize] = useState(15);
  const [pageNumber, setPageNumber] = useState(1);

  // Quick Apply state
  const applyJobMutation = useApplyJobMutation();
  const [applyingIds, setApplyingIds] = useState<Set<number>>(new Set());

  const handleQuickApply = async (id: number) => {
    setApplyingIds((prev) => new Set(prev).add(id));
    try {
      await applyJobMutation.mutateAsync([String(id)]);
    } catch (_) {
      // toast handled globally; nothing else to do
    } finally {
      setApplyingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

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

    // 4. Sort (Naukri-style: recent by default, or by a chosen field)
    if (sortKey === 'designation') {
      result.sort((a: any, b: any) =>
        String(a.profileHeader || a.jobDesignation || '').localeCompare(String(b.profileHeader || b.jobDesignation || ''))
      );
    } else if (sortKey === 'company') {
      result.sort((a: any, b: any) => String(a.companyName || '').localeCompare(String(b.companyName || '')));
    } else if (sortKey === 'workplace') {
      result.sort((a: any, b: any) => String(a.workPlace || a.jobLocation || '').localeCompare(String(b.workPlace || b.jobLocation || '')));
    } else if (sortKey === 'salary') {
      result.sort((a: any, b: any) => (Number(b.salaryTo) || 0) - (Number(a.salaryTo) || 0));
    } else {
      // recent — newest posted first
      result.sort((a: any, b: any) => Number(b.id) - Number(a.id));
    }

    return result;
  }, [jobs, searchPhrase, filterSkill, filterWorkPlace, sortKey]);

  // Derived display rows shared by the list and table layouts
  const mappedJobs = React.useMemo(() => {
    const fmt = (v: any) => {
      const n = Number(v);
      if (!n) return '';
      return n >= 100000 ? `${n / 100000} L` : `${n}`;
    };
    return filteredAndSortedJobs.map((job: any, index: number) => {
      const jobIdNum = Number(job.id || index);
      const salaryFrom = fmt(job.salary);
      const salaryTo = fmt(job.salaryTo);
      const salaryText = salaryFrom && salaryTo
        ? `₹${salaryFrom} - ₹${salaryTo}`
        : salaryFrom
          ? `₹${salaryFrom}`
          : 'Salary Negotiable';
      const expiry = job.expiryDate
        ? (() => {
            const d = new Date(job.expiryDate);
            return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN');
          })()
        : '';
      return {
        job,
        jobIdNum,
        isApplied: appliedJobIds.includes(jobIdNum),
        isApplying: applyingIds.has(jobIdNum),
        designation: job.profileHeader || job.jobDesignation || 'N/A',
        workPlace: job.workPlace || job.jobLocation || 'N/A',
        experience: `${job.experiance ?? 0} - ${job.experianceTo ?? 2} yrs`,
        salaryText,
        expiry,
      };
    });
  }, [filteredAndSortedJobs, appliedJobIds, applyingIds]);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {isEmployerOrStaff
              ? t('jobs.list.managedTitle')
              : t('jobs.list.availableTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEmployerOrStaff
              ? t('jobs.list.managedSubtitle')
              : t('jobs.list.availableSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-white">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-2 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="List view"
            >
              <ListIcon className="w-4 h-4" />
              <span className="hidden md:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-2 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer border-l border-slate-200 ${
                viewMode === 'table' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="Table view"
            >
              <Table2 className="w-4 h-4" />
              <span className="hidden md:inline">Table</span>
            </button>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-xs font-bold bg-white"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{t('jobs.list.refresh')}</span>
          </button>
          {isEmployerOrStaff && onAddNewJob && (
            <button
              onClick={onAddNewJob}
              className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('jobs.list.postJob')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-150 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder={t('jobs.list.searchPlaceholder')}
              value={searchPhrase}
              onChange={(e) => setSearchPhrase(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:border-orange-500 text-slate-800"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="flex-1 sm:flex-none min-w-0 max-w-full sm:w-36 text-xs px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-orange-500 text-slate-800 font-semibold cursor-pointer"
            >
              <option value="">All Skills</option>
              {uniqueSkills.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={filterWorkPlace}
              onChange={(e) => setFilterWorkPlace(e.target.value)}
              className="flex-1 sm:flex-none min-w-0 max-w-full sm:w-44 text-xs px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-orange-500 text-slate-800 font-semibold cursor-pointer"
            >
              <option value="">All Work Places</option>
              {uniqueWorkPlaces.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="flex-1 sm:flex-none min-w-0 max-w-full sm:w-36 text-xs px-3 py-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-orange-500 text-slate-800 font-semibold cursor-pointer"
              title="Sort by"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="designation">Sort: Designation</option>
              <option value="company">Sort: Company</option>
              <option value="workplace">Sort: Location</option>
              <option value="salary">Sort: Salary (High → Low)</option>
            </select>
            {(searchPhrase || filterSkill || filterWorkPlace) && (
              <button
                onClick={() => { setSearchPhrase(''); setFilterSkill(''); setFilterWorkPlace(''); }}
                className="text-[10px] text-orange-600 font-bold hover:underline cursor-pointer whitespace-nowrap shrink-0"
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
        <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs divide-y divide-slate-100">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-5 animate-pulse flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2 flex-1 w-full">
                <div className="h-5 bg-slate-200 rounded-md w-2/5"></div>
                <div className="h-3.5 bg-slate-150 rounded-md w-1/4"></div>
                <div className="h-3.5 bg-slate-150 rounded-md w-3/5"></div>
                <div className="h-3 bg-slate-100 rounded-md w-2/3"></div>
              </div>
              <div className="h-9 bg-slate-200 rounded-xl w-32 shrink-0"></div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedJobs.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="text-slate-350 text-4xl mb-3">📁</div>
          <h3 className="text-sm font-bold text-slate-700">{t('jobs.list.noJobsFound')}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('jobs.list.noJobsSubtitle')}</p>
          <button
            onClick={() => { setSearchPhrase(''); setFilterSkill(''); setFilterWorkPlace(''); }}
            className="mt-4 px-4 py-2 text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
          >
            {t('jobs.list.clearFilters')}
          </button>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="text-[10px] text-slate-400 font-bold">
            Showing {filteredAndSortedJobs.length} of {totalCount} vacancies
          </div>

          {/* JOB ROWS — table or Naukri-style list */}
          {viewMode === 'table' ? (
            <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">Job Code</th>
                      <th className="px-4 py-3">Designation</th>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3 whitespace-nowrap">Experience</th>
                      <th className="px-4 py-3 whitespace-nowrap">Salary</th>
                      <th className="px-4 py-3 whitespace-nowrap">Last Date</th>
                      <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mappedJobs.map((row) => (
                      <tr key={row.jobIdNum} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-400 font-bold whitespace-nowrap">
                          {row.job.jobCode || `JOB-${row.jobIdNum}`}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          <button
                            onClick={() => onViewDetails(row.jobIdNum, row.job.jobCode)}
                            className="hover:text-orange-600 transition-colors text-left cursor-pointer"
                            title="View job details"
                          >
                            {row.designation}
                          </button>
                          {row.job.skill && (
                            <span className="block text-[10px] font-medium italic text-slate-400 line-clamp-1">{row.job.skill}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{row.job.companyName || 'N/A'}</td>
                        <td className="px-4 py-3 text-slate-600">{row.workPlace}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.experience}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.salaryText}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.expiry || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {isEmployerOrStaff && onEditJob ? (
                              <>
                                <button
                                  onClick={() => onViewDetails(row.jobIdNum, row.job.jobCode)}
                                  className="py-1.5 px-3 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer text-slate-700 whitespace-nowrap"
                                >
                                  <Eye className="w-3.5 h-3.5" /><span>View</span>
                                </button>
                                <button
                                  onClick={() => onEditJob(Number(row.job.id))}
                                  className="py-1.5 px-3 bg-orange-50 border border-orange-100 text-orange-900 hover:bg-orange-100 hover:text-orange-950 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                >
                                  <Edit className="w-3.5 h-3.5" /><span>Edit</span>
                                </button>
                              </>
                            ) : (
                              <>
                                {row.isApplied ? (
                                  <span className="inline-flex items-center justify-center gap-1 py-1.5 px-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold whitespace-nowrap">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" /><span>Applied</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleQuickApply(row.jobIdNum)}
                                    disabled={row.isApplying}
                                    className="py-1.5 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-all inline-flex items-center gap-1 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                                  >
                                    {row.isApplying
                                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      : <Send className="w-3.5 h-3.5" />}
                                    <span>{row.isApplying ? 'Applying...' : 'Apply'}</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => onViewDetails(row.jobIdNum, row.job.jobCode)}
                                  className="py-1.5 px-3 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer text-slate-700 whitespace-nowrap"
                                >
                                  <Eye className="w-3.5 h-3.5" /><span>View</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
          <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs divide-y divide-slate-100">
            {mappedJobs.map(({ job, jobIdNum, isApplied, isApplying, designation, workPlace, experience, salaryText, expiry }) => {
              return (
                <div
                  key={jobIdNum}
                  className="group p-4 lg:p-5 flex flex-col lg:flex-row lg:items-center gap-4 transition-colors hover:bg-slate-50/70"
                >
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onViewDetails(jobIdNum, job.jobCode)}
                    title="View job details"
                  >
                    <span className="font-mono text-[9px] text-slate-400 font-bold">
                      {job.jobCode || `JOB-${jobIdNum}`}
                    </span>
                    <h3 className="mt-0.5 text-[15px] lg:text-base font-bold text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
                      {designation}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700">{job.companyName || 'N/A'}</span>
                    </div>
                    {job.skill && (
                      <p className="mt-1.5 text-xs italic text-slate-500 line-clamp-1">{job.skill}</p>
                    )}
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-semibold text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {workPlace}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                        {experience}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 text-slate-400 shrink-0" />
                        {salaryText}
                      </span>
                      {expiry && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="w-3 h-3 text-slate-400 shrink-0" />
                          Last date: {expiry}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:flex-col lg:items-stretch shrink-0">
                    {isEmployerOrStaff && onEditJob ? (
                      <>
                        <button
                          onClick={() => onViewDetails(jobIdNum, job.jobCode)}
                          className="py-2 px-4 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-slate-700 flex-1 lg:w-40"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => onEditJob(Number(job.id))}
                          className="py-2 px-4 bg-orange-50 border border-orange-100 text-orange-900 hover:bg-orange-100 hover:text-orange-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 lg:w-40"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {isApplied ? (
                          <span className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold shadow-2xs flex-1 lg:w-40">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Applied</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleQuickApply(jobIdNum)}
                            disabled={isApplying}
                            className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex-1 lg:w-40"
                          >
                            {isApplying
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Send className="w-3.5 h-3.5" />}
                            <span>{isApplying ? 'Applying...' : 'Apply'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => onViewDetails(jobIdNum, job.jobCode)}
                          className="py-2 px-4 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-slate-700 flex-1 lg:w-40"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
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
