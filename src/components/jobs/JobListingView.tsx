/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSearchJobsQuery, useApplyJobMutation } from '../../hooks/useJobQueries';
import { useDateOnly } from '../../hooks/useDateOnly';
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
  Building2,
  CalendarDays,
  Loader2,
  Send,
  List as ListIcon,
  Table2,
} from 'lucide-react';
import { Alert, Toast, Modal } from '../ui/FeedbackComponents';
import { Job } from '../../types';

interface JobListingViewProps {
  onViewDetails: (id: number, jobCode?: string) => void;
  onEditJob?: (id: number, jobCode?: string) => void;
  onAddNewJob?: () => void;
  appliedJobIds?: number[];
  /** When provided, component uses this data instead of fetching internally */
  externalJobs?: Job[];
  externalTotalCount?: number;
  externalIsLoading?: boolean;
  externalIsFetching?: boolean;
  externalRefetch?: () => void;
}

const getJobPostedTimestamp = (job: any): number | undefined => {
  const rawDate = job.createdAt
    || job.createdDate
    || job.createdOn
    || job.postedAt
    || job.postedDate
    || job.postedOn
    || job.postingDate
    || job.dateCreated
    || job.requirementDate;
  if (!rawDate) return undefined;
  const timestamp = new Date(rawDate).getTime();
  return Number.isNaN(timestamp) ? undefined : timestamp;
};

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
  const formatDateOnly = useDateOnly();

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
  const [applyingJobCodes, setApplyingJobCodes] = useState<Set<string>>(new Set());
  const [applyErrorMessage, setApplyErrorMessage] = useState('');

  const handleQuickApply = async (jobCode: string) => {
    setApplyingJobCodes((prev) => new Set(prev).add(jobCode));
    setApplyErrorMessage('');
    try {
      const response = await applyJobMutation.mutateAsync([jobCode]);
      if (response?.isSuccess === false || response?.success === false) {
        throw new Error(response.message || 'Your application could not be submitted.');
      }
    } catch (error: any) {
      const responseData = error?.response?.data ?? error?.data;
      const message = responseData?.error?.message
        || responseData?.message
        || (typeof responseData === 'string' ? responseData : '')
        || error?.message
        || 'Unable to submit your application. Please try again.';
      setApplyErrorMessage(String(message));
    } finally {
      setApplyingJobCodes((prev) => {
        const next = new Set(prev);
        next.delete(jobCode);
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
      : { searchPhrase: searchPhrase || undefined, page: pageNumber, limit: pageSize },
    { enabled: !useExternal }
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
    } else if (!useExternal) {
      result.sort((a: any, b: any) => {
        const dateA = getJobPostedTimestamp(a);
        const dateB = getJobPostedTimestamp(b);
        if (dateA !== undefined && dateB !== undefined && dateA !== dateB) return dateB - dateA;
        if (dateA !== undefined && dateB === undefined) return -1;
        if (dateA === undefined && dateB !== undefined) return 1;
        return Number(b.id) - Number(a.id);
      });
    }

    return result;
  }, [jobs, searchPhrase, filterSkill, filterWorkPlace, sortKey, useExternal]);

  // Derived display rows shared by the list and table layouts
  const mappedJobs = React.useMemo(() => {
    return filteredAndSortedJobs.map((job: any, index: number) => {
      const jobIdNum = Number(job.id);
      const hasValidJobId = Number.isSafeInteger(jobIdNum) && jobIdNum > 0;
      const jobKey = job.jobCode || String(job.id || `job-row-${index}`);
      const expiry = formatDateOnly(job.expiryDate);
      const apiStatus = String(job.userJobStatus || '').trim();
      const isApplied = apiStatus
        ? !/^(apply|not\s*applied)$/i.test(apiStatus)
        : appliedJobIds.includes(jobIdNum);
      return {
        job,
        jobIdNum,
        hasValidJobId,
        jobKey,
        isApplied,
        applicationStatus: apiStatus || 'Applied',
        isApplying: applyingJobCodes.has(job.jobCode),
        designation: job.profileHeader || job.jobDesignation || 'N/A',
        workPlace: job.workPlace || job.jobLocation || '—',
        expiry,
      };
    });
  }, [filteredAndSortedJobs, appliedJobIds, formatDateOnly]);

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
              className={`px-2.5 py-2 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              title="List view"
            >
              <ListIcon className="w-4 h-4" />
              <span className="hidden md:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-2 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer border-l border-slate-200 ${viewMode === 'table' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-50'
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
            className="min-h-10 min-w-10 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-1 text-xs font-bold bg-white"
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
      {applyErrorMessage && (
        <Toast
          message={applyErrorMessage}
          type="error"
          onClose={() => setApplyErrorMessage('')}
        />
      )}
      {error && (
        <div className="my-4">
          <Alert
            type="danger"
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
                      <th className="px-4 py-3">Workplace</th>
                      <th className="px-4 py-3 whitespace-nowrap">Last Date</th>
                      <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mappedJobs.map((row) => (
                      <tr key={row.jobKey} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-400 font-bold whitespace-nowrap">
                          {row.job.jobCode || '—'}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          <button
                            onClick={() => onViewDetails(row.jobIdNum, row.job.jobCode)}
                            disabled={!row.hasValidJobId}
                            className="cursor-pointer rounded-sm text-left transition-colors hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
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
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.expiry || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {isEmployerOrStaff && onEditJob ? (
                              <>
                                <button
                                  onClick={() => onViewDetails(row.jobIdNum, row.job.jobCode)}
                                  disabled={!row.hasValidJobId}
                                  className="py-1.5 px-3 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-slate-700 whitespace-nowrap"
                                >
                                  <Eye className="w-3.5 h-3.5" /><span>View</span>
                                </button>
                                <button
                                  onClick={() => onEditJob(Number(row.job.id), row.job.jobCode)}
                                  disabled={!row.hasValidJobId}
                                  className="py-1.5 px-3 bg-orange-50 border border-orange-100 text-orange-900 hover:bg-orange-100 hover:text-orange-950 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
                                >
                                  <Edit className="w-3.5 h-3.5" /><span>Edit</span>
                                </button>
                              </>
                            ) : (
                              <>
                                {row.isApplied ? (
                                  <span className="inline-flex items-center justify-center gap-1 py-1.5 px-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold whitespace-nowrap">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" /><span>{row.applicationStatus}</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleQuickApply(row.job.jobCode)}
                                    disabled={!row.hasValidJobId || row.isApplying}
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
            <div className="space-y-3">
              {mappedJobs.map(({ job, jobIdNum, jobKey, hasValidJobId, isApplied, applicationStatus, isApplying, designation, workPlace, expiry }) => {
                return (
                  <div
                    key={jobKey}
                    className="group grid min-w-0 grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-orange-200 hover:shadow-md sm:p-5 md:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <div className="min-w-0">
                      <span className="inline-flex max-w-full items-center rounded-md bg-slate-50 px-2 py-1 font-mono text-[10px] font-bold text-slate-500 ring-1 ring-inset ring-slate-200">
                        {job.jobCode || '—'}
                      </span>
                      <h3 className="mt-2 text-base font-extrabold leading-snug text-slate-900 transition-colors group-hover:text-orange-700 sm:text-lg">
                        <button
                          type="button"
                          onClick={() => onViewDetails(jobIdNum, job.jobCode)}
                          disabled={!hasValidJobId}
                          className="cursor-pointer rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 enabled:hover:text-orange-700 disabled:cursor-not-allowed"
                          title="View job details"
                        >
                          {designation}
                        </button>
                      </h3>
                      <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-600">
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                          <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="truncate font-semibold text-slate-700">{job.companyName || 'N/A'}</span>
                        </span>
                        <span className="inline-flex min-w-0 items-center gap-1.5 font-semibold text-slate-700">
                          <MapPin className="h-4 w-4 shrink-0 text-orange-600" />
                          <span className="break-words">{workPlace}</span>
                        </span>
                      </div>
                      {job.skill && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {String(job.skill).split(',').map((skill) => skill.trim()).filter(Boolean).slice(0, 5).map((skill) => (
                            <span key={skill} className="max-w-full truncate rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-800">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-slate-100 pt-3 text-xs sm:grid-cols-3">
                        {expiry && (
                          <span className="flex min-w-0 items-center gap-1.5 font-semibold text-slate-700">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="truncate">Last date: {expiry}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:min-w-36 md:grid-cols-1 md:content-center">
                      {isEmployerOrStaff && onEditJob ? (
                        <>
                          <button
                            onClick={() => onViewDetails(jobIdNum, job.jobCode)}
                            disabled={!hasValidJobId}
                            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={() => onEditJob(Number(job.id), job.jobCode)}
                            disabled={!hasValidJobId}
                            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-900 transition-all hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        </>
                      ) : (
                        <>
                          {isApplied ? (
                            <span className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{applicationStatus}</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleQuickApply(job.jobCode)}
                              disabled={!hasValidJobId || isApplying}
                              className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isApplying
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Send className="w-3.5 h-3.5" />}
                              <span>{isApplying ? 'Applying...' : 'Apply'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => onViewDetails(jobIdNum, job.jobCode)}
                            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
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
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer flex items-center justify-center"
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
                className={`min-w-[32px] h-8 rounded-lg font-bold border transition-all cursor-pointer disabled:cursor-not-allowed ${pageNumber === page
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
                className="min-w-[32px] h-8 rounded-lg font-bold border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {Math.ceil(totalCount / pageSize)}
              </button>
            )}
            <button
              onClick={() => setPageNumber(prev => Math.min(prev + 1, Math.ceil(totalCount / pageSize)))}
              disabled={pageNumber === Math.ceil(totalCount / pageSize) || isFetching}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer flex items-center justify-center"
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
