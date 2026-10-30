/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Reusable job requirement detail body.
 * Used by the public /job/:requirementId page and inside the admin
 * dashboard (so the admin shell stays visible when viewing a requirement).
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGetRequirementDetailQuery } from '../../services/adminApi';
import { Briefcase, ClipboardList, Eye, Loader2, Users } from 'lucide-react';
import { Loader } from '../ui/FeedbackComponents';

interface JobRequirementDetailViewProps {
  requirementId: number;
}

export function JobRequirementDetailView({ requirementId }: JobRequirementDetailViewProps) {
  const { t } = useTranslation();

  const id = Number(requirementId || 0);

  const { data, isLoading, isFetching, error, refetch } = useGetRequirementDetailQuery(id, {
    skip: !id || Number.isNaN(id),
  });

  const job: any = data?.job;
  const items: any[] = data?.items || [];
  const hasError = Boolean(error) || (!isLoading && !job && items.length === 0);

  const str = (v: any): string => (v === undefined || v === null ? '' : String(v));
  const money = (v: any): string => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n.toLocaleString('en-IN') : '';
  };

  const jobCode = str(job?.jobCode);
  const profile = str(job?.profileHeader || job?.jobDesignation || '');
  const company = str(job?.companyName);
  const workPlace = str(job?.workPlace || job?.jobLocation || job?.interviewLocation);
  const skills = str(job?.skill);
  const vacancies = job?.noOfVacancy !== undefined && job?.noOfVacancy !== null ? Number(job.noOfVacancy) : undefined;
  const expFrom = job?.experiance !== undefined && job?.experiance !== null ? Number(job.experiance) : undefined;
  const expTo = job?.experianceTo !== undefined && job?.experianceTo !== null ? Number(job.experianceTo) : undefined;
  const salaryFrom = money(job?.salary);
  const salaryTo = money(job?.salaryTo);
  const description = str(job?.jobDiscription || job?.postingNotes);
  const expiry = str(job?.expiryDate);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-darkViolet flex items-center gap-3">
          <Briefcase className="w-7 h-7 text-theme-lavender" />
          {t('jobs.req.title')}
        </h1>
        <p className="text-sm text-theme-darkViolet/60 mt-1">
          {t('jobs.req.requirementId')} {requirementId || 'N/A'}
          {isFetching && !isLoading && (
            <span className="inline-flex items-center gap-1 ml-3 text-[10px] text-theme-lavender font-bold">
              <Loader2 className="w-3 h-3 animate-spin" /> {t('jobs.req.updating')}
            </span>
          )}
        </p>
      </div>

      {isLoading ? (
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
          <button
            onClick={() => refetch()}
            className="mt-6 px-5 py-2.5 bg-theme-lavender text-white rounded-xl text-sm font-bold hover:bg-theme-darkViolet transition-all cursor-pointer shadow-md"
          >
            {t('jobs.req.tryAgain')}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Requirement details */}
          {(jobCode || profile || company || workPlace || skills) && (
            <section className="bg-white rounded-2xl border border-theme-lightViolet p-6 sm:p-8">
              <h2 className="text-base font-extrabold text-theme-darkViolet uppercase tracking-wide mb-6 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-theme-lavender" /> {t('jobs.req.summary')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {jobCode && (
                  <div>
                    <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{t('jobs.req.jobCode')}</span>
                    <span className="font-extrabold text-theme-lavender">{jobCode}</span>
                  </div>
                )}
                {profile && (
                  <div>
                    <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{t('jobs.req.profile')}</span>
                    <span className="font-bold text-theme-darkViolet">{profile}</span>
                  </div>
                )}
                {company && (
                  <div>
                    <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{t('jobs.req.company')}</span>
                    <span className="font-semibold text-theme-darkViolet/80">{company}</span>
                  </div>
                )}
                {workPlace && (
                  <div>
                    <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{t('jobs.req.workPlace')}</span>
                    <span className="font-medium text-theme-darkViolet/80">{workPlace}</span>
                  </div>
                )}
                {skills && (
                  <div className="sm:col-span-2">
                    <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{t('jobs.req.requiredSkills')}</span>
                    <span className="font-medium text-theme-darkViolet/80 leading-relaxed">{skills}</span>
                  </div>
                )}
                {vacancies !== undefined && (
                  <div>
                    <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{t('jobs.req.vacancies')}</span>
                    <span className="font-extrabold text-theme-deepTeal">{vacancies}</span>
                  </div>
                )}
                {(expFrom !== undefined || expTo !== undefined) && (
                  <div>
                    <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{t('jobs.req.experienceNeeded')}</span>
                    <span className="font-medium text-theme-darkViolet/80">{expFrom ?? 0} - {expTo ?? 'N/A'} {t('jobs.req.years')}</span>
                  </div>
                )}
                {(salaryFrom || salaryTo) && (
                  <div>
                    <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{t('jobs.req.salaryRange')}</span>
                    <span className="font-extrabold text-theme-deepTeal">₹{salaryFrom || '0'} - ₹{salaryTo || '0'} {t('jobs.req.monthly')}</span>
                  </div>
                )}
                {expiry && (
                  <div>
                    <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{t('jobs.req.expiryDate')}</span>
                    <span className="font-medium text-theme-darkViolet/80">{expiry}</span>
                  </div>
                )}
                {description && (
                  <div className="sm:col-span-2">
                    <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{t('jobs.req.description')}</span>
                    <span className="font-medium text-theme-darkViolet/70 leading-relaxed whitespace-pre-wrap">{description}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Applications for this requirement */}
          <section className="bg-white rounded-2xl border border-theme-lightViolet overflow-hidden">
            <div className="p-6 sm:p-8 pb-0">
              <h2 className="text-base font-extrabold text-theme-darkViolet uppercase tracking-wide flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-theme-lavender" />
                {t('jobs.req.applications')}
                <span className="text-xs font-bold bg-theme-lightViolet/60 text-theme-darkViolet px-2.5 py-1 rounded-full">{items.length}</span>
              </h2>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 text-sm text-theme-darkViolet/50 font-medium">
                <Users className="w-8 h-8 mx-auto mb-3 text-theme-darkViolet/30" />
                {t('jobs.req.noApplications')}
              </div>
            ) : (
              <div className="srg-scroll overflow-x-auto overflow-y-auto max-h-[70vh]">
                <table className="w-full min-w-[720px] divide-y divide-theme-lightViolet text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-theme-lightViolet/50 text-[10px] font-black text-theme-darkViolet/60 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">#</th>
                      <th className="px-6 py-3.5 font-bold">{t('jobs.req.candidate')}</th>
                      <th className="px-6 py-3.5 font-bold">{t('jobs.req.phone')}</th>
                      <th className="px-6 py-3.5 font-bold">{t('jobs.req.status')}</th>
                      <th className="px-6 py-3.5 font-bold">{t('jobs.req.appliedOn')}</th>
                      <th className="px-6 py-3.5 font-bold">{t('jobs.req.action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-lightViolet/60 bg-white">
                    {items.map((app: any, index: number) => {
                      const candidateId = app?.candidateId || app?.userId || app?.applicantId || app?.id || index + 1;
                      return (
                        <tr key={app?.id || index} className="hover:bg-theme-lightViolet/20 transition-colors">
                          <td className="px-6 py-3.5 text-theme-darkViolet/40 font-bold">{index + 1}</td>
                          <td className="px-6 py-3.5 font-bold text-theme-darkViolet">
                            {app?.candidateName || app?.fullName || app?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-3.5 text-theme-darkViolet/70 whitespace-nowrap">
                            {app?.candidatePhone || app?.phone || app?.mobile || app?.mobileNo || app?.mobile_number || app?.phoneNumber || app?.contactNumber || 'N/A'}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-theme-lightViolet/60 text-theme-darkViolet">
                              {app?.status || app?.applicationStatus || 'Applied'}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-theme-darkViolet/60 whitespace-nowrap">
                            {app?.appliedAt || app?.createdDate || app?.applicationDate || 'N/A'}
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <a
                              href={`#/dashboard?view=candidate&id=${candidateId}&from=jobRequirement&fromId=${id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                              title={t('jobs.req.viewCandidate')}
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