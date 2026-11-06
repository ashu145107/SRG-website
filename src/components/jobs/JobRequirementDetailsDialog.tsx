import React, { useEffect, useRef } from 'react';
import { Briefcase, Building2, GraduationCap, MapPin, X } from 'lucide-react';
import { useDateOnly } from '../../hooks/useDateOnly';
import { Loader } from '../ui/FeedbackComponents';

interface JobRequirementDetailsDialogProps {
  requirement: Record<string, unknown> | null | undefined;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onClose: () => void;
  closeLabel?: string;
}

export function JobRequirementDetailsDialog({
  requirement,
  isLoading = false,
  error,
  onRetry,
  onClose,
  closeLabel = 'Close',
}: JobRequirementDetailsDialogProps) {
  const formatDateOnly = useDateOnly();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const display = (value: unknown) =>
    value === undefined || value === null || String(value).trim() === '' ? '-' : String(value);
  const money = (value: unknown) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount.toLocaleString('en-IN') : '0';
  };
  const experience = requirement?.experiance == null && requirement?.experianceTo == null
    ? '-'
    : `${display(requirement?.experiance)} - ${display(requirement?.experianceTo)} years`;
  const salary = requirement?.salary == null && requirement?.salaryTo == null
    ? '-'
    : `₹${money(requirement?.salary)} - ₹${money(requirement?.salaryTo)}`;
  const activeStatus = requirement?.isActive === true ? 'Active' : requirement?.isActive === false ? 'Inactive' : '-';
  const detailSections = requirement
    ? [
        {
          title: 'Role overview',
          icon: Briefcase,
          fields: [
            { label: 'Job designation', value: display(requirement.jobDesignation) },
            { label: 'Required skills', value: display(requirement.skill), wide: true },
            { label: 'Experience', value: experience },
            { label: 'Number of vacancies', value: display(requirement.noOfVacancy) },
            { label: 'Job description', value: display(requirement.jobDiscription), wide: true, prose: true },
          ],
        },
        {
          title: 'Work and compensation',
          icon: MapPin,
          fields: [
            { label: 'Workplace', value: display(requirement.workPlace) },
            { label: 'Job location', value: display(requirement.jobLocation) },
            { label: 'Work mode', value: display(requirement.workMode) },
            { label: 'Shift type', value: display(requirement.shiftType) },
            { label: 'Salary range', value: salary },
            { label: 'Salary period', value: display(requirement.salaryPeriod) },
            { label: 'Weekly off', value: display(requirement.weeklyOff) },
            { label: 'Benefits', value: display(requirement.benefits), wide: true },
          ],
        },
        {
          title: 'Qualifications and interview',
          icon: GraduationCap,
          fields: [
            { label: 'Education', value: display(requirement.education) },
            { label: 'Specialization', value: display(requirement.specialization) },
            { label: 'Certifications required', value: display(requirement.certificationsRequired) },
            { label: 'Gender preference', value: display(requirement.genderPreference) },
            { label: 'Age range', value: display(requirement.ageRange) },
            { label: 'Role type', value: display(requirement.roleType) },
            { label: 'Interview mode', value: display(requirement.interviewMode) },
            { label: 'Interview location', value: display(requirement.interviewLocation), wide: true },
          ],
        },
        {
          title: 'Employer and posting',
          icon: Building2,
          fields: [
            { label: 'Company', value: display(requirement.companyName) },
            { label: 'Contact email', value: display(requirement.email) },
            { label: 'Expiry date', value: formatDateOnly(requirement.expiryDate) || '-' },
            { label: 'Posting notes', value: display(requirement.postingNotes), wide: true, prose: true },
          ],
        },
      ]
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-requirement-details-title"
        className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white text-left shadow-2xl sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-blue-950 px-4 py-4 text-white sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Briefcase className="h-5 w-5 shrink-0 text-orange-400" />
            <div className="min-w-0">
              <h2 id="job-requirement-details-title" className="truncate text-base font-extrabold sm:text-lg">
                Job Requirement Details
              </h2>
              {requirement?.jobCode && (
                <p className="mt-0.5 truncate text-xs text-white/70">{display(requirement.jobCode)}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close requirement details"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center p-6">
            <Loader />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-sm font-semibold text-red-700">Unable to load job requirement details.</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-4 rounded-lg bg-theme-lavender px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-theme-darkViolet"
              >
                Try again
              </button>
            )}
          </div>
        ) : requirement ? (
          <div className="overflow-y-auto bg-slate-50/70 p-3 sm:p-5">
            <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Position</p>
                  <h3 className="mt-1 break-words text-lg font-bold text-slate-900 sm:text-xl">
                    {display(requirement.profileHeader)}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{display(requirement.companyName)}</p>
                </div>
                <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-bold ${
                  requirement.isActive === true
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : requirement.isActive === false
                      ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                      : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                }`}>
                  {activeStatus}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <span><span className="font-semibold text-slate-800">Job code:</span> {display(requirement.jobCode)}</span>
                <span><span className="font-semibold text-slate-800">Salary:</span> {salary}</span>
                <span><span className="font-semibold text-slate-800">Experience:</span> {experience}</span>
                <span><span className="font-semibold text-slate-800">Expiry:</span> {formatDateOnly(requirement.expiryDate) || '-'}</span>
              </div>
            </section>

            <div className="space-y-4">
              {detailSections.map(({ title, icon: SectionIcon, fields: sectionFields }) => (
                <section key={title} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <header className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                    <SectionIcon className="h-4 w-4 text-theme-darkViolet" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{title}</h3>
                  </header>
                  <dl className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 sm:px-4 sm:py-1">
                    {sectionFields.map(({ label, value, wide, prose }) => (
                      <div
                        key={label}
                        className={`min-w-0 px-4 py-3 sm:px-2 ${wide ? 'sm:col-span-2' : ''} ${
                          wide ? '' : 'sm:border-b sm:border-slate-100'
                        }`}
                      >
                        <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</dt>
                        <dd className={`mt-1 break-words text-sm text-slate-800 ${prose ? 'whitespace-pre-wrap leading-relaxed' : 'font-medium'}`}>
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </div>
        ) : (
          <p className="p-6 text-center text-sm text-slate-600">Job requirement details are unavailable.</p>
        )}

        <footer className="flex shrink-0 justify-end border-t border-slate-100 bg-slate-50 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-300"
          >
            {closeLabel}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default JobRequirementDetailsDialog;
