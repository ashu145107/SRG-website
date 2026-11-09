/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Job requirement detail body shown from the company profile requirements
 * table. Mirrors the admin job requirement tab (job summary + applied
 * applicants) and adds a back action to the company profile.
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { JobRequirementDetailView } from './JobRequirementDetailView';

interface CompanyProfileJobDetailsProps {
  requirementId: number;
  jobCode?: string;
  onBack?: () => void;
}

export function CompanyProfileJobDetails({
  requirementId,
  jobCode,
  onBack,
}: CompanyProfileJobDetailsProps) {
  return (
    <div>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-theme-darkViolet/70 hover:text-theme-lavender transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to company profile
        </button>
      )}
      <JobRequirementDetailView requirementId={requirementId} jobCode={jobCode} />
    </div>
  );
}

export default CompanyProfileJobDetails;
