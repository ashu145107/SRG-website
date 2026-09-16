/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { SiteFooter } from '../components/SiteFooter';
import { JobRequirementDetailView } from '../components/jobs/JobRequirementDetailView';
import { ArrowLeft } from 'lucide-react';

export function JobRequirementDetail() {
  const { requirementId } = useParams<{ requirementId: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isMr = i18n.language === 'mr';
  const L = (en: string, mr: string) => (isMr ? mr : en);

  const id = Number(requirementId || 0);

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

        <JobRequirementDetailView requirementId={id} />
      </main>

      <SiteFooter />
    </div>
  );
}