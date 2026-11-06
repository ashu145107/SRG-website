/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Reusable job requirement detail body.
 * Used by the public /job/:requirementId page and inside the admin
 * dashboard (so the admin shell stays visible when viewing a requirement).
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useTranslation } from 'react-i18next';
import {
  useGetJobRequirementByCodeQuery,
  useGetRequirementDetailQuery,
} from '../../services/adminApi';
import { useDateOnly } from '../../hooks/useDateOnly';
import { Briefcase, ClipboardList, Eye, Loader2, Users } from 'lucide-react';
import { Loader } from '../ui/FeedbackComponents';
import { SearchMultiSelectFilter } from '../ui/SearchMultiSelectFilter';
import { JobRequirementDetailsDialog } from './JobRequirementDetailsDialog';
import { openEncryptedRouteInNewTab } from '../../utils/secureDetailRoute';

interface JobRequirementDetailViewProps {
  requirementId: number;
  jobCode?: string;
}

const APPLICATION_STATUS_OPTIONS = [
  'Applied',
  'Shortlisted',
  'Interview',
  'Round 2',
  'Round 3',
  'HR Discussion',
  'Selected',
  'Rejected',
  'Withdrawn',
  'On Hold',
].map((status) => ({ label: status, value: status }));

export function JobRequirementDetailView({ requirementId, jobCode: requestedJobCode = '' }: JobRequirementDetailViewProps) {
  const { t } = useTranslation();
  const { token } = useSelector((state: RootState) => state.auth);
  const formatDateOnly = useDateOnly();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [applicationSearch, setApplicationSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const id = Number(requirementId || 0);

  const { data, isLoading, isFetching, error, refetch } = useGetRequirementDetailQuery(id, {
    skip: !id || Number.isNaN(id),
  });
  const {
    data: requirementByCode,
    isLoading: isRequirementLoading,
    isFetching: isRequirementFetching,
    error: requirementError,
    refetch: refetchRequirement,
  } = useGetJobRequirementByCodeQuery(requestedJobCode, {
    skip: !requestedJobCode,
    refetchOnMountOrArgChange: true,
  });

  const job: any = requestedJobCode ? requirementByCode : data?.job;
  const items: any[] = data?.items || [];
  const statusOf = (application: any): string =>
    String(application?.status || application?.applicationStatus || 'Applied').trim() || 'Applied';
  const searchTerm = applicationSearch.trim().toLowerCase();
  const filteredItems = items.filter((application) => {
    const candidateName = String(application?.candidateName || application?.fullName || application?.name || '').toLowerCase();
    const candidatePhone = String(
      application?.candidatePhone || application?.phone || application?.mobile ||
      application?.mobileNo || application?.mobile_number || application?.phoneNumber ||
      application?.contactNumber || ''
    ).toLowerCase();
    const matchesSearch = !searchTerm || candidateName.includes(searchTerm) || candidatePhone.includes(searchTerm);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(statusOf(application));
    return matchesSearch && matchesStatus;
  });
  const isPageLoading = isLoading || (!!requestedJobCode && (isRequirementLoading || isRequirementFetching));
  const isPageFetching = isFetching || isRequirementFetching;
  const hasError = Boolean(error || requirementError) || (!isPageLoading && !data && !requirementByCode);
  const activeError = requirementError || error;
  const errorResponse = activeError && typeof activeError === 'object' && 'data' in activeError
    ? activeError.data
    : activeError;
  const errorResponseText = errorResponse === undefined
    ? ''
    : typeof errorResponse === 'string'
      ? errorResponse
      : JSON.stringify(errorResponse, null, 2);

  const str = (v: any): string => (v === undefined || v === null ? '' : String(v));
  const display = (value: unknown): string => {
    const text = str(value).trim();
    return text || '-';
  };
  const jobCode = display(job?.jobCode || requestedJobCode);

  return (
    <>
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-theme-darkViolet sm:text-2xl">
          <Briefcase className="h-6 w-6 text-theme-lavender" />
          {t('jobs.req.title')}
        </h1>
        {isPageFetching && !isPageLoading && (
          <p className="text-sm text-theme-darkViolet/60 mt-1">
            <span className="inline-flex items-center gap-1 ml-3 text-[10px] text-theme-lavender font-bold">
              <Loader2 className="w-3 h-3 animate-spin" /> {t('jobs.req.updating')}
            </span>
          </p>
        )}
      </div>

      {isPageLoading ? (
        <div className="bg-white rounded-2xl border border-theme-lightViolet">
          <Loader />
        </div>
      ) : hasError ? (
        <div className="bg-white rounded-2xl border border-theme-lightViolet p-16 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="font-bold text-theme-darkViolet">{t('jobs.req.loadFailed')}</p>
          <p className="text-sm text-theme-darkViolet/60 mt-2 max-w-md mx-auto">
            {t('jobs.req.loadFailedHint')}
          </p>
          {errorResponseText && (
            <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-slate-50 p-4 text-left text-xs text-slate-700 whitespace-pre-wrap break-words">
              {errorResponseText}
            </pre>
          )}
          <button
            onClick={() => {
              void refetch();
              if (requestedJobCode) void refetchRequirement();
            }}
            className="mt-6 px-5 py-2.5 bg-theme-lavender text-white rounded-xl text-sm font-bold hover:bg-theme-darkViolet transition-all cursor-pointer shadow-md"
          >
            {t('jobs.req.tryAgain')}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Requirement details */}
          {job && (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <header className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-theme-lightViolet/70 text-theme-darkViolet">
                    <Briefcase className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{t('jobs.req.summary')}</p>
                    <h2 className="mt-1 break-words text-lg font-bold text-slate-900 sm:text-xl">
                      {display(job?.profileHeader)}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(true)}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:w-auto"
                >
                  <Eye className="h-3.5 w-3.5" /> View more
                </button>
              </header>

              <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {[
                  {
                    label: 'Experience',
                    value: job?.experiance == null && job?.experianceTo == null
                      ? '-'
                      : `${display(job?.experiance)} - ${display(job?.experianceTo)} years`,
                  },
                  { label: 'Work place', value: display(job?.workPlace) },
                  { label: 'Skills', value: display(job?.skill) },
                ].map(({ label, value }) => (
                  <div key={label} className="min-w-0 px-4 py-3.5 sm:px-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                    <p className="mt-1 break-words text-sm font-medium text-slate-800">{value}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3.5 sm:px-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
                  {display(job?.jobDiscription || job?.postingNotes)}
                </p>
              </div>
            </section>
          )}

          {isDetailsOpen && (
            <JobRequirementDetailsDialog
              requirement={job}
              onClose={() => setIsDetailsOpen(false)}
            />
          )}

          {/* Applications for this requirement */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-theme-lightViolet bg-white">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <h2 className="flex items-center gap-2 text-base font-extrabold uppercase tracking-wide text-theme-darkViolet">
                <ClipboardList className="h-4 w-4 shrink-0 text-theme-lavender" />
                <span>{t('jobs.req.applications')}</span>
                <span className="rounded-full bg-theme-lightViolet/60 px-2.5 py-1 text-xs font-bold text-theme-darkViolet">
                  {filteredItems.length}{filteredItems.length !== items.length ? ` / ${items.length}` : ''}
                </span>
              </h2>
              <SearchMultiSelectFilter
                searchValue={applicationSearch}
                onSearchChange={setApplicationSearch}
                searchPlaceholder="Search candidates"
                filterLabel="Application status"
                options={APPLICATION_STATUS_OPTIONS}
                selectedValues={selectedStatuses}
                onSelectedValuesChange={setSelectedStatuses}
              />
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 text-sm text-theme-darkViolet/50 font-medium">
                <Users className="w-8 h-8 mx-auto mb-3 text-theme-darkViolet/30" />
                {t('jobs.req.noApplications')}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm font-medium text-theme-darkViolet/50">
                No applications match your search or selected statuses.
              </div>
            ) : (
              <div className="srg-scroll max-h-[70vh] overflow-x-auto overflow-y-auto rounded-xl border border-slate-150">
                <table className="w-full min-w-[960px] table-fixed divide-y divide-slate-150 text-left text-xs">
                  <colgroup>
                    <col className="w-[6%]" />
                    <col className="w-[26%]" />
                    <col className="w-[18%]" />
                    <col className="w-[17%]" />
                    <col className="w-[21%]" />
                    <col className="w-[12%]" />
                  </colgroup>
                  <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3.5 font-bold">#</th>
                      <th className="px-4 py-3.5 font-bold">{t('jobs.req.candidate')}</th>
                      <th className="px-4 py-3.5 font-bold">{t('jobs.req.phone')}</th>
                      <th className="px-4 py-3.5 font-bold">{t('jobs.req.status')}</th>
                      <th className="px-4 py-3.5 font-bold">{t('jobs.req.appliedOn')}</th>
                      <th className="whitespace-nowrap px-4 py-3.5 text-center font-bold">{t('jobs.req.action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-lightViolet/60 bg-white">
                    {filteredItems.map((app: any, index: number) => {
                      const candidateId = app?.candidateId || app?.userId || app?.applicantId || app?.id || index + 1;
                      return (
                        <tr key={app?.id || index} className="transition-colors hover:bg-slate-50">
                          <td className="px-4 py-3.5 font-bold text-slate-400">{index + 1}</td>
                          <td className="break-words px-4 py-3.5 font-bold text-slate-800">
                            {app?.candidateName || app?.fullName || app?.name || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                            {app?.candidatePhone || app?.phone || app?.mobile || app?.mobileNo || app?.mobile_number || app?.phoneNumber || app?.contactNumber || 'N/A'}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex rounded-full bg-theme-lightViolet/60 px-2.5 py-1 text-[11px] font-bold text-theme-darkViolet">
                              {app?.status || app?.applicationStatus || 'Applied'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                            {formatDateOnly(app?.appliedAt || app?.createdDate || app?.applicationDate) || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-center">
                            <a
                              href="#/dashboard"
                              onClick={(event) => {
                                event.preventDefault();
                                void openEncryptedRouteInNewTab('/dashboard', {
                                  view: 'candidate',
                                  id: String(candidateId),
                                  from: 'jobRequirement',
                                  fromId: String(id),
                                  fromCode: jobCode === '-' ? '' : jobCode,
                                }, token || '').catch((error: unknown) => {
                                  window.alert(error instanceof Error ? error.message : 'Unable to open applicant details.');
                                });
                              }}
                              className="mx-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700"
                              title={t('jobs.req.viewCandidate')}
                              aria-label={t('jobs.req.viewCandidate')}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

export default JobRequirementDetailView;