/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetRequirementDetailQuery } from '../services/adminApi';
import { Navbar } from '../components/Navbar';
import { SiteFooter } from '../components/SiteFooter';
import { Briefcase, ClipboardList, Loader2, ArrowLeft, Users } from 'lucide-react';

export function JobRequirementDetail() {
  const { requirementId } = useParams<{ requirementId: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isMr = i18n.language === 'mr';
  const L = (en: string, mr: string) => (isMr ? mr : en);

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
    <div className="min-h-screen flex flex-col bg-theme-cream font-sans">
      <Navbar activePage="jobs" />

      {/* Page body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/');
            }
          }}
          className="inline-flex items-center gap-2 text-sm font-bold text-theme-darkViolet/70 hover:text-theme-lavender transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {L('Back to Home', 'मुख्यपृष्ठावर परत जा')}
        </button>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-darkViolet flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-theme-lavender" />
            {L('Job Requirement Details', 'नोकरी आवश्यकता तपशील')}
          </h1>
          <p className="text-sm text-theme-darkViolet/60 mt-1">
            {L('Requirement ID:', 'आवश्यकता ID:')} {requirementId || 'N/A'}
            {isFetching && !isLoading && (
              <span className="inline-flex items-center gap-1 ml-3 text-[10px] text-theme-lavender font-bold">
                <Loader2 className="w-3 h-3 animate-spin" /> {L('Updating...', 'अद्ययावत...')}
              </span>
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-theme-lightViolet p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-theme-lavender" />
            <p className="text-sm text-theme-darkViolet/60">{L('Loading requirement details...', 'तपशील लोड होत आहेत...')}</p>
          </div>
        ) : hasError ? (
          <div className="bg-white rounded-2xl border border-theme-lightViolet p-16 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="font-bold text-theme-darkViolet">{L('Failed to load requirement details', 'आवश्यकता तपशील लोड करता आला नाही')}</p>
            <p className="text-sm text-theme-darkViolet/60 mt-2 max-w-md mx-auto">
              {L('Either the requirement does not exist or the API is temporarily unavailable.', 'एकतर ही आवश्यकता अस्तित्वात नाही किंवा API सध्या उपलब्ध नाही.')}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-6 px-5 py-2.5 bg-theme-lavender text-white rounded-xl text-sm font-bold hover:bg-theme-darkViolet transition-all cursor-pointer shadow-md"
            >
              {L('Try Again', 'पुन्हा प्रयत्न करा')}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Requirement details */}
            {(jobCode || profile || company || workPlace || skills) && (
              <section className="bg-white rounded-2xl border border-theme-lightViolet p-6 sm:p-8">
                <h2 className="text-base font-extrabold text-theme-darkViolet uppercase tracking-wide mb-6 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-theme-lavender" /> {L('Requirement Summary', 'आवश्यकतेचा सारांश')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  {jobCode && (
                    <div>
                      <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{L('Job Code', 'नोकरी कोड')}</span>
                      <span className="font-extrabold text-theme-lavender">{jobCode}</span>
                    </div>
                  )}
                  {profile && (
                    <div>
                      <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{L('Profile', 'प्रोफाइल')}</span>
                      <span className="font-bold text-theme-darkViolet">{profile}</span>
                    </div>
                  )}
                  {company && (
                    <div>
                      <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{L('Company', 'कंपनी')}</span>
                      <span className="font-semibold text-theme-darkViolet/80">{company}</span>
                    </div>
                  )}
                  {workPlace && (
                    <div>
                      <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{L('Work Place', 'कामाची जागा')}</span>
                      <span className="font-medium text-theme-darkViolet/80">{workPlace}</span>
                    </div>
                  )}
                  {skills && (
                    <div className="sm:col-span-2">
                      <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{L('Required Skills', 'आवश्यक कौशल्ये')}</span>
                      <span className="font-medium text-theme-darkViolet/80 leading-relaxed">{skills}</span>
                    </div>
                  )}
                  {vacancies !== undefined && (
                    <div>
                      <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{L('Vacancies', 'जागा')}</span>
                      <span className="font-extrabold text-theme-deepTeal">{vacancies}</span>
                    </div>
                  )}
                  {(expFrom !== undefined || expTo !== undefined) && (
                    <div>
                      <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{L('Experience Needed', 'आवश्यक अनुभव')}</span>
                      <span className="font-medium text-theme-darkViolet/80">{expFrom ?? 0} - {expTo ?? 'N/A'} {L('Years', 'वर्षे')}</span>
                    </div>
                  )}
                  {(salaryFrom || salaryTo) && (
                    <div>
                      <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{L('Salary Range', 'पगार श्रेणी')}</span>
                      <span className="font-extrabold text-theme-deepTeal">₹{salaryFrom || '0'} - ₹{salaryTo || '0'} {L('Monthly', 'मासिक')}</span>
                    </div>
                  )}
                  {expiry && (
                    <div>
                      <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{L('Expiry Date', 'अंतिम तारीख')}</span>
                      <span className="font-medium text-theme-darkViolet/80">{expiry}</span>
                    </div>
                  )}
                  {description && (
                    <div className="sm:col-span-2">
                      <span className="block text-[11px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mb-1">{L('Description', 'वर्णन')}</span>
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
                  {L('Applications for this Requirement', 'या आवश्यकतेसाठीचे अर्ज')}
                  <span className="text-xs font-bold bg-theme-lightViolet/60 text-theme-darkViolet px-2.5 py-1 rounded-full">{items.length}</span>
                </h2>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12 text-sm text-theme-darkViolet/50 font-medium">
                  <Users className="w-8 h-8 mx-auto mb-3 text-theme-darkViolet/30" />
                  {L('No applications found for this requirement yet.', 'या आवश्यकतेसाठी अजून कोणतेही अर्ज मिळाले नाहीत.')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-theme-lightViolet text-left text-sm">
                    <thead className="bg-theme-lightViolet/50 text-[10px] font-black text-theme-darkViolet/60 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5 font-bold">#</th>
                        <th className="px-6 py-3.5 font-bold">{L('Candidate', 'उमेदवार')}</th>
                        <th className="px-6 py-3.5 font-bold">{L('Phone', 'मोबाईल')}</th>
                        <th className="px-6 py-3.5 font-bold">{L('Status', 'स्थिती')}</th>
                        <th className="px-6 py-3.5 font-bold">{L('Applied On', 'अर्ज दिनांक')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-lightViolet/60 bg-white">
                      {items.map((app: any, index: number) => (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}