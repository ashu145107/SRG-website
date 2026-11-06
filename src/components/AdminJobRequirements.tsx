/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  useGetAdminJobRequirementsQuery,
  useGetJobRequirementByCodeQuery,
} from '../services/adminApi';
import { JobRequirement } from '../services/jobTypes';
import { Briefcase, Eye, Edit, Search, ArrowUpDown, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { Loader } from './ui/FeedbackComponents';
import { EditJobForm } from './jobs/EditJobForm';
import { JobRequirementDetailsDialog } from './jobs/JobRequirementDetailsDialog';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useDateOnly } from '../hooks/useDateOnly';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { navigateToEncryptedRoute } from '../utils/secureDetailRoute';

export function AdminJobRequirements() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const formatDateOnly = useDateOnly();
  const [pageSize, setPageSize] = useState(15);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchPhrase, setSearchPhrase] = useState('');
  
  // Sort state (recent first is the default)
  const [sortColumn, setSortColumn] = useState<keyof JobRequirement | 'id'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Detail Modal state
  const [selectedJob, setSelectedJob] = useState<JobRequirement | null>(null);

  // Edit Modal state (popup form)
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [editingJobCode, setEditingJobCode] = useState<string | undefined>();

  const {
    data: selectedJobDetails,
    isLoading: isSelectedJobLoading,
    isFetching: isSelectedJobFetching,
    error: selectedJobError,
    refetch: refetchSelectedJob,
  } = useGetJobRequirementByCodeQuery(selectedJob?.jobCode || '', {
    skip: !selectedJob?.jobCode,
    refetchOnMountOrArgChange: true,
  });

  // Fetch paginated data
  const { data, isLoading, isFetching, error, refetch } = useGetAdminJobRequirementsQuery({
    pageSize,
    pageNumber,
  });

  const jobsList = data?.items || [];
  const totalCount = data?.totalCount || 0;
  // Handle Sort
  const handleSort = (column: keyof JobRequirement | 'id') => {
    if (sortColumn === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  // Local client-side search and sorting on the fetched page items
  const filteredAndSortedList = React.useMemo(() => {
    let result = [...jobsList];

    // 1. Client side search phrase filter
    if (searchPhrase.trim()) {
      const phrase = searchPhrase.toLowerCase();
      result = result.filter(
        j =>
          (j.jobCode || '').toLowerCase().includes(phrase) ||
          (j.profileHeader || '').toLowerCase().includes(phrase) ||
          (j.companyName || '').toLowerCase().includes(phrase) ||
          (j.workPlace || '').toLowerCase().includes(phrase) ||
          (j.skill || '').toLowerCase().includes(phrase)
      );
    }

    // 2. Sort by selected column
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
  }, [jobsList, searchPhrase, sortColumn, sortOrder]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6 font-sans text-left" id="admin-jobs-panel">
      {/* Upper Title */}
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-lg font-extrabold text-blue-950 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-orange-600" />
          {t('adm.requirements.title')}
        </h2>
        <p className="text-xs text-slate-500">
          {t('adm.requirements.subtitle')}
        </p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center pb-2">
          <h3 className="font-extrabold text-blue-950 text-sm tracking-wide uppercase">
            {t('adm.requirements.listTitle')}
          </h3>
          {isFetching && (
            <span className="flex items-center gap-1.5 text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" /> {t('adm.common.refreshing')}
            </span>
          )}
        </div>

        {/* Entry size selector and search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageNumber(1);
              }}
              className="border border-slate-250 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold text-slate-800"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search by job code, profile, place..."
              value={searchPhrase}
              onChange={(e) => setSearchPhrase(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
            />
          </div>
        </div>

        {/* Table representation */}
        <div className="srg-scroll overflow-x-auto overflow-y-auto max-h-[70vh] rounded-xl border border-slate-150">
          <table className="w-full min-w-[960px] divide-y divide-slate-150 text-left text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('jobCode')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    Job Code
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('profileHeader')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Profile Header
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('companyName')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Company Name
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('workPlace')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors hidden md:table-cell"
                >
                  <div className="flex items-center gap-1">
                    Work Place
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('skill')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors hidden md:table-cell"
                >
                  <div className="flex items-center gap-1">
                    Skill
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3.5 font-bold text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-2 text-center text-slate-400">
                    <Loader />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <div className="inline-flex flex-col items-center gap-2 text-red-600 font-medium">
                      <span className="text-sm">{t('adm.requirements.loadError')}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAndSortedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                    {t('adm.requirements.empty')}
                  </td>
                </tr>
              ) : (
                filteredAndSortedList.map((job, index) => (
                  <tr key={job.id || job.jobCode || index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-black text-blue-900 whitespace-nowrap">
                      {job.id ? (
                        <Link
                          to="/dashboard"
                          onClick={(event) => {
                            event.preventDefault();
                            void navigateToEncryptedRoute('/dashboard', {
                              view: 'jobRequirement',
                              id: String(job.id),
                              jobCode: job.jobCode || '',
                            }, token || '', navigate).catch((error: unknown) => {
                              window.alert(error instanceof Error ? error.message : 'Unable to open requirement details.');
                            });
                          }}
                          title="Open job details"
                          className="underline decoration-blue-300 underline-offset-2 hover:text-blue-600 hover:decoration-blue-600 transition-colors cursor-pointer"
                        >
                          {job.jobCode || job.id}
                        </Link>
                      ) : (
                        <span title="Requirement ID is missing from the API response">
                          {job.jobCode || 'N/A'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-slate-800 break-words max-w-[200px]">
                      {job.profileHeader || job.jobDesignation}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-semibold max-w-[150px] break-words">
                      {job.companyName || 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium whitespace-nowrap hidden md:table-cell">
                      {job.workPlace || job.jobLocation}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 break-words max-w-[250px] hidden md:table-cell">
                      {job.skill}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingJobId(Number(job.id));
                            setEditingJobCode(job.jobCode || undefined);
                          }}
                          disabled={!job.id}
                          className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="Edit Requirements"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="View Requirements"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <div className="text-xs text-slate-500">
            Showing {totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1} to{' '}
            {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} entries
          </div>

          <div className="flex items-center gap-1 text-xs flex-wrap">
            <button
              onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
              disabled={pageNumber === 1 || isLoading}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const startPage = Math.max(1, pageNumber - 2);
              return startPage + i <= totalPages ? startPage + i : null;
            }).filter((page): page is number => page !== null).map((page) => (
              <button
                key={page}
                onClick={() => setPageNumber(page)}
                disabled={isLoading}
                className={`min-w-[32px] h-8 rounded-lg font-bold border transition-all cursor-pointer ${
                  pageNumber === page
                    ? 'bg-blue-950 border-blue-950 text-white shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}

            {totalPages > 5 && pageNumber < totalPages - 2 && (
              <span className="text-slate-400 px-1">...</span>
            )}
            {totalPages > 5 && pageNumber < totalPages - 2 && (
              <button
                onClick={() => setPageNumber(totalPages)}
                disabled={isLoading}
                className="min-w-[32px] h-8 rounded-lg font-bold border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                {totalPages}
              </button>
            )}

            <button
              onClick={() => setPageNumber(prev => Math.min(prev + 1, totalPages))}
              disabled={pageNumber === totalPages || isLoading}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Dialog Modal */}
      {selectedJob && (
        <JobRequirementDetailsDialog
          requirement={selectedJobDetails}
          isLoading={isSelectedJobLoading || isSelectedJobFetching}
          error={selectedJobError}
          onRetry={() => { void refetchSelectedJob(); }}
          onClose={() => setSelectedJob(null)}
          closeLabel={t('adm.common.close')}
        />
      )}

      {/* Edit Job Requirement Popup Modal */}
      {editingJobId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl overflow-hidden flex flex-col text-left max-h-[92vh]">
            <div className="bg-blue-950 text-white px-5 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  {t('adm.requirements.editTitle')}
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditingJobId(null);
                  setEditingJobCode(undefined);
                }}
                className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <EditJobForm
                jobId={editingJobId}
                jobCode={editingJobCode}
                onCancel={() => {
                  setEditingJobId(null);
                  setEditingJobCode(undefined);
                }}
                onSuccess={() => {
                  setEditingJobId(null);
                  setEditingJobCode(undefined);
                  refetch();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
