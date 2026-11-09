
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAddJobRequirementMutation } from '../../hooks/useJobQueries';
import { JobRequirement } from '../../services/jobTypes';
import {
  useGetCompanyTypesQuery,
  useGetIndustryTypesQuery,
  useGetInterviewModesQuery,
  useGetJobTypesQuery,
  useGetShiftTypesQuery,
  useGetWorkModesQuery,
  useGetSalaryPeriodsQuery,
  useGetJobBenefitsQuery,
  useGetWeeklyOffsQuery,
  useGetEducationsQuery,
  useGetSubEducationsQuery,
} from '../../services/jobMasterApi';
import { Alert, Toast } from '../ui/FeedbackComponents';
import { DatePicker } from '../ui/DatePicker';

const MAX_JOB_DESCRIPTION_LENGTH = 4000;
const MAX_PROFILE_HEADER_LENGTH = 100;
const MAX_EXPERIENCE_DIGITS = 2;
const MAX_SALARY = 10_000_000;
const MAX_SALARY_DIGITS = 8;

interface AddJobFormProps {
  onSuccess?: (newJob: JobRequirement) => void;
  onCancel?: () => void;
}

export const AddJobForm: React.FC<AddJobFormProps> = ({ onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const user = useSelector((state: any) => state.auth?.user);
  const addJobMutation = useAddJobRequirementMutation();
  const addJob = addJobMutation.mutateAsync;
  const isLoading = addJobMutation.isPending;
  const apiError = addJobMutation.error;

  const { data: companyTypes = [] } = useGetCompanyTypesQuery();
  const { data: industryTypes = [] } = useGetIndustryTypesQuery();
  const { data: jobTypes = [] } = useGetJobTypesQuery();
  const { data: interviewModes = [] } = useGetInterviewModesQuery();
  const { data: shiftTypes = [] } = useGetShiftTypesQuery();
  const { data: workModes = [] } = useGetWorkModesQuery();
  const { data: salaryPeriods = [] } = useGetSalaryPeriodsQuery();
  const { data: jobBenefits = [] } = useGetJobBenefitsQuery();
  const { data: weeklyOffs = [] } = useGetWeeklyOffsQuery();
  const { data: educations = [] } = useGetEducationsQuery();

  // Toast and Error states
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const validationSummaryRef = useRef<HTMLDivElement>(null);
  const fieldLabels: Record<string, string> = {
    profileHeader: 'Profile header',
    jobDesignation: 'Designation',
    industryTypeId: 'Specialization',
    noOfVacancy: 'Number of vacancies',
    experiance: 'Minimum experience',
    experianceTo: 'Maximum experience',
    salary: 'Minimum salary',
    salaryTo: 'Maximum salary',
    workPlace: 'Workplace',
    jobLocation: 'Job location',
    expiryDate: 'Expiry date',
    skill: 'Required skills',
    interviewModeId: 'Interview mode',
    interviewLocation: 'Interview location',
    ageRange: 'Age range',
    genderPreference: 'Gender preference',
    jobDiscription: 'Job description',
  };

  useEffect(() => {
    if (!validationError || Object.keys(fieldErrors).length === 0) return;
    validationSummaryRef.current?.focus({ preventScroll: true });
    validationSummaryRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  }, [validationError, fieldErrors]);

  // Parse logged in user ID as a number for the API payload
  const numericUserId = user ? parseInt(user.id.replace(/\D/g, '')) || 123 : 123;

  // Form State
  const [form, setForm] = useState({
    profileHeader: '',
    skill: '',
    specialization: 0,
    experiance: '0',
    experianceTo: '1',
    noOfVacancy: '1',
    workPlace: '',
    salary: '',
    salaryTo: '',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    educationId: 0,
    subEducationId: 0,
    roleTypeId: 1,
    interviewModeId: 0,
    interviewLocation: '',
    postingNotes: '',
    jobDiscription: '',
    jobDesignation: '',
    certificationsRequired: '',
    genderPreference: 'Any',
    ageRange: '18-45',
    shiftTypeId: 1,
    workModeId: 1,
    jobLocation: '',
    salaryPeriodId: 1,
    benefits: '',
    weeklyOffId: 1,
    companyTypeId: 0,
    industryTypeId: 0,
    jobTypeId: 0,
  });

  const { data: subEducations = [] } = useGetSubEducationsQuery(form.educationId, {
    skip: !form.educationId,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const digitLimits: Record<string, number> = {
      experiance: MAX_EXPERIENCE_DIGITS,
      experianceTo: MAX_EXPERIENCE_DIGITS,
      salary: MAX_SALARY_DIGITS,
      salaryTo: MAX_SALARY_DIGITS,
    };
    const numericSelectFields = [
      'specialization',
      'educationId',
      'subEducationId',
      'roleTypeId',
      'interviewModeId',
      'shiftTypeId',
      'workModeId',
      'salaryPeriodId',
      'weeklyOffId',
      'companyTypeId',
      'industryTypeId',
      'jobTypeId',
    ];

    setForm((prev) => ({
      ...prev,
      [name]: numericSelectFields.includes(name)
        ? Number(value)
        : name in digitLimits
          ? value.replace(/\D/g, '').slice(0, digitLimits[name])
          : value,
    }));
    setFieldErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const errors: Record<string, string> = {};

    if (!form.profileHeader.trim()) errors.profileHeader = 'Please enter the profile header.';
    if (form.profileHeader.length > MAX_PROFILE_HEADER_LENGTH) {
      errors.profileHeader = `Profile header must be ${MAX_PROFILE_HEADER_LENGTH} characters or fewer.`;
    }
    if (!form.jobDesignation.trim()) {
      errors.jobDesignation = t('jobs.add.errDesignation');
    }
    if (!Number(form.industryTypeId)) errors.industryTypeId = 'Please select a specialization.';

    if (!form.jobDiscription.trim() || form.jobDiscription.length < 10) {
      errors.jobDiscription = t('jobs.add.errDescription');
    }

    if (form.jobDiscription.length > MAX_JOB_DESCRIPTION_LENGTH) {
      errors.jobDiscription = t('jobs.add.errDescriptionMax', { max: MAX_JOB_DESCRIPTION_LENGTH });
    }

    if (!form.skill.trim()) {
      errors.skill = t('jobs.add.errSkills');
    }

    const experience = form.experiance.trim() ? Number(form.experiance) : NaN;
    const experienceTo = form.experianceTo.trim() ? Number(form.experianceTo) : NaN;
    const vacancy = form.noOfVacancy.trim() ? Number(form.noOfVacancy) : NaN;
    const salary = form.salary.trim() ? Number(form.salary) : NaN;
    const salaryTo = form.salaryTo.trim() ? Number(form.salaryTo) : NaN;

    if (!Number.isInteger(experience) || experience < 0 || experience > 99) {
      errors.experiance = 'Enter a minimum experience using 1 or 2 digits (0-99).';
    }
    if (!Number.isInteger(experienceTo) || experienceTo < 0 || experienceTo > 99) {
      errors.experianceTo = 'Enter a maximum experience using 1 or 2 digits (0-99).';
    }
    if (Number.isFinite(experience) && Number.isFinite(experienceTo) && experienceTo < experience) {
      errors.experianceTo = t('jobs.add.errMaxExpGtMin');
    }

    if (!Number.isFinite(vacancy) || vacancy < 1) {
      errors.noOfVacancy = 'Number of vacancies must be at least 1.';
    }

    if (!form.workPlace.trim()) errors.workPlace = 'Please enter the workplace.';

    if (!Number.isInteger(salary) || salary < 0 || salary > MAX_SALARY) {
      errors.salary = 'Minimum salary must be between 0 and 1 crore.';
    }

    if (!Number.isInteger(salaryTo) || salaryTo < 0 || salaryTo > MAX_SALARY) {
      errors.salaryTo = 'Maximum salary must be between 0 and 1 crore.';
    }

    if (Number.isFinite(salary) && Number.isFinite(salaryTo) && salaryTo < salary) {
      errors.salaryTo = t('jobs.add.errMaxSalaryGteMin');
    }

    if (!form.jobLocation.trim()) {
      errors.jobLocation = t('jobs.add.errLocation');
    }

    if (!form.expiryDate || Number.isNaN(new Date(form.expiryDate).getTime())) {
      errors.expiryDate = 'Please select an expiry date.';
    }
    if (!Number(form.interviewModeId)) errors.interviewModeId = 'Please select an interview mode.';
    if (!form.interviewLocation.trim()) errors.interviewLocation = 'Please enter the interview location.';
    if (!form.ageRange.trim()) errors.ageRange = 'Please enter the age range.';
    if (!form.genderPreference.trim()) errors.genderPreference = 'Please select a gender preference.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setValidationError('Please fix the highlighted fields before saving.');
      return;
    }

    setFieldErrors({});
    try {
      const payload = {
        ...form,
        specialization: Number(form.industryTypeId) || 1,
        userId: numericUserId,
        createdBy: numericUserId,
        experiance: Number(form.experiance),
        experianceTo: Number(form.experianceTo),
        noOfVacancy: Number(form.noOfVacancy),
        salary: Number(form.salary),
        salaryTo: Number(form.salaryTo),
        expiryDate: new Date(form.expiryDate).toISOString(),
      };

      const result = await addJob(payload);

      setToastType('success');
      setToastMsg(t('jobs.add.successToast'));
      setShowToast(true);

      if (onSuccess) {
        setTimeout(() => onSuccess(result), 1500);
      }
    } catch (err: any) {
      console.error('Add job API error:', err);
      setToastType('error');

      const errorMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.data ||
        err?.message ||
        'Failed to submit Job Requirement. Please try again.';

      setToastMsg(typeof errorMsg === 'string' ? errorMsg : 'API Validation Error');
      setShowToast(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-150 shadow-xs p-6 max-w-4xl mx-auto text-left animate-fade-in">
      <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t('jobs.add.heading')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t('jobs.add.subtitle')}</p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            type="button"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            {t('jobs.add.cancel')}
          </button>
        )}
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info Row */}
        <div className="bg-slate-50/55 p-4 rounded-xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.profileHeader')} *</label>
          <input
            type="text"
            name="profileHeader"
            maxLength={MAX_PROFILE_HEADER_LENGTH}
            placeholder="e.g. Hiring experienced web programmers / Urgent Need of Drivers"
            value={form.profileHeader}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.profileHeader)}
            className={`w-full text-xs p-2.5 rounded-lg border focus:border-orange-500 focus:outline-none transition-all ${fieldErrors.profileHeader ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
            required
          />
          {fieldErrors.profileHeader && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.profileHeader}</p>}
          <p className="mt-1 text-right text-[10px] text-slate-400">{form.profileHeader.length}/{MAX_PROFILE_HEADER_LENGTH}</p>
        </div>

        {/* Designation, Vacancies & Role Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.designation')}</label>
            <input
              type="text"
              name="jobDesignation"
              placeholder="e.g. Sales Executive, Senior Accountant"
              value={form.jobDesignation}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.jobDesignation)}
              className={`w-full text-xs p-2.5 rounded-lg border focus:border-orange-500 focus:outline-none transition-all ${fieldErrors.jobDesignation ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
              required
            />
            {fieldErrors.jobDesignation && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.jobDesignation}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.noOfVacancies')}</label>
            <input
              type="number"
              name="noOfVacancy"
              min="1"
              value={form.noOfVacancy}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.noOfVacancy)}
              className={`w-full text-xs p-2.5 rounded-lg border focus:border-orange-500 focus:outline-none transition-all ${fieldErrors.noOfVacancy ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
              required
            />
            {fieldErrors.noOfVacancy && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.noOfVacancy}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.jobType')}</label>
            <select
              name="jobTypeId"
              value={form.jobTypeId}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white"
            >
              <option value={0}>-- Select --</option>
              {jobTypes.map((jt) => (
                <option key={jt.id} value={jt.id}>
                  {jt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Experience & Salary Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-orange-50/20 rounded-xl border border-orange-100/30">
          {/* Experience Group */}
          <div>
            <span className="block text-xs font-extrabold text-orange-950 mb-2">{t('jobs.add.experienceRange')}</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">{t('jobs.add.minExperience')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{1,2}"
                  name="experiance"
                  maxLength={MAX_EXPERIENCE_DIGITS}
                  value={form.experiance}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.experiance)}
                  className={`w-full text-xs p-2.5 rounded-lg border bg-white focus:outline-none focus:border-orange-500 ${fieldErrors.experiance ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
                />
                {fieldErrors.experiance && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.experiance}</p>}
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">{t('jobs.add.maxExperience')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{1,2}"
                  name="experianceTo"
                  maxLength={MAX_EXPERIENCE_DIGITS}
                  value={form.experianceTo}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.experianceTo)}
                  className={`w-full text-xs p-2.5 rounded-lg border bg-white focus:outline-none focus:border-orange-500 ${fieldErrors.experianceTo ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
                />
                {fieldErrors.experianceTo && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.experianceTo}</p>}
              </div>
            </div>
          </div>

          {/* Salary Group */}
          <div>
            <span className="block text-xs font-extrabold text-orange-950 mb-2">{t('jobs.add.salaryRange')}</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">{t('jobs.add.minSalary')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{1,8}"
                  name="salary"
                  maxLength={MAX_SALARY_DIGITS}
                  value={form.salary}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.salary)}
                  className={`w-full text-xs p-2.5 rounded-lg border bg-white focus:outline-none focus:border-orange-500 ${fieldErrors.salary ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
                />
                {fieldErrors.salary && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.salary}</p>}
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">{t('jobs.add.maxSalary')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{1,8}"
                  name="salaryTo"
                  maxLength={MAX_SALARY_DIGITS}
                  value={form.salaryTo}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.salaryTo)}
                  className={`w-full text-xs p-2.5 rounded-lg border bg-white focus:outline-none focus:border-orange-500 ${fieldErrors.salaryTo ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
                />
                {fieldErrors.salaryTo && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.salaryTo}</p>}
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-500">Salary values can range from 0 to ₹1,00,00,000.</p>
          </div>
        </div>

        {/* Specialized Fields: Work Mode, Workplace type, location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.workMode')}</label>
            <select
              name="workModeId"
              value={form.workModeId}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white"
            >
              <option value={0}>-- Select --</option>
              {workModes.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.workplaceType')} *</label>
            <input
              type="text"
              name="workPlace"
              placeholder="e.g. Office Building, On-field, Workshop"
              value={form.workPlace}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.workPlace)}
              className={`w-full text-xs p-2.5 rounded-lg border focus:border-orange-500 focus:outline-none transition-all ${fieldErrors.workPlace ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
              required
            />
            {fieldErrors.workPlace && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.workPlace}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.jobLocation')}</label>
            <input
              type="text"
              name="jobLocation"
              placeholder="e.g. Nashik, Mumbai, Pune"
              value={form.jobLocation}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.jobLocation)}
              className={`w-full text-xs p-2.5 rounded-lg border focus:border-orange-500 focus:outline-none transition-all ${fieldErrors.jobLocation ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
              required
            />
            {fieldErrors.jobLocation && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.jobLocation}</p>}
          </div>
        </div>

        {/* Education, Sub-Education, Expiry Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.requiredEducation')}</label>
            <select
              name="educationId"
              value={form.educationId}
              onChange={(e) => {
                handleChange(e);
                setForm((prev) => ({ ...prev, subEducationId: 0 }));
              }}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white"
            >
              <option value={0}>-- Select --</option>
              {educations.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.subEducation')}</label>
            <select
              name="subEducationId"
              value={form.subEducationId}
              onChange={handleChange}
              disabled={!form.educationId}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value={0}>-- Select --</option>
              {subEducations.map((se) => (
                <option key={se.id} value={se.id}>
                  {se.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.expiryDate')}</label>
            <DatePicker
              name="expiryDate"
              value={form.expiryDate}
              onChange={(value) => {
                setForm((previous) => ({ ...previous, expiryDate: value }));
                setFieldErrors((previous) => {
                  if (!previous.expiryDate) return previous;
                  const next = { ...previous };
                  delete next.expiryDate;
                  return next;
                });
              }}
              aria-invalid={Boolean(fieldErrors.expiryDate)}
              className={`w-full text-xs p-2.5 rounded-lg border bg-white focus:border-orange-500 focus:outline-none transition-all ${fieldErrors.expiryDate ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
              required
            />
            {fieldErrors.expiryDate && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.expiryDate}</p>}
          </div>
        </div>

        {/* Company Type, Industry Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.companyType')}</label>
            <select
              name="companyTypeId"
              value={form.companyTypeId}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white"
            >
              <option value={0}>-- Select --</option>
              {companyTypes.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Specialization / {t('jobs.add.industryType')} *</label>
            <select
              name="industryTypeId"
              value={form.industryTypeId}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.industryTypeId)}
              className={`w-full text-xs p-2.5 rounded-lg border focus:border-orange-500 focus:outline-none transition-all bg-white ${fieldErrors.industryTypeId ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
              required
            >
              <option value={0}>-- Select --</option>
              {industryTypes.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.label}
                </option>
              ))}
            </select>
            {fieldErrors.industryTypeId && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.industryTypeId}</p>}
          </div>
        </div>

        {/* Interview Details */}
        <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-4">
          <span className="block text-xs font-extrabold text-slate-800 border-b border-slate-100 pb-1.5">{t('jobs.add.interviewDetails')}</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.interviewMode')} *</label>
              <select
                name="interviewModeId"
                value={form.interviewModeId}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.interviewModeId)}
                className={`w-full text-xs p-2.5 bg-white rounded-lg border focus:outline-none focus:border-orange-500 ${fieldErrors.interviewModeId ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
                required
              >
                <option value={0}>-- Select --</option>
                {interviewModes.map((im) => (
                  <option key={im.id} value={im.id}>
                    {im.label}
                  </option>
                ))}
              </select>
              {fieldErrors.interviewModeId && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.interviewModeId}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.interviewLocation')} *</label>
              <input
                type="text"
                name="interviewLocation"
                placeholder="e.g. Corporate Office, Zoom Link, Telephonic"
                value={form.interviewLocation}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.interviewLocation)}
                className={`w-full text-xs p-2.5 rounded-lg border focus:border-orange-500 focus:outline-none ${fieldErrors.interviewLocation ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
                required
              />
              {fieldErrors.interviewLocation && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.interviewLocation}</p>}
            </div>
          </div>
        </div>

        {/* Skills, Certifications, Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.skills')}</label>
            <input
              type="text"
              name="skill"
              placeholder="e.g. Tally, Ms-Office, Driving, Speaking Marathi"
              value={form.skill}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.skill)}
              className={`w-full text-xs p-2.5 rounded-lg border focus:border-orange-500 focus:outline-none transition-all ${fieldErrors.skill ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
              required
            />
            {fieldErrors.skill && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.skill}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.certifications')}</label>
            <input
              type="text"
              name="certificationsRequired"
              placeholder="e.g. MS-CIT, Tally Certificate, Commercial License"
              value={form.certificationsRequired}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.genderPreference')} *</label>
            <select
              name="genderPreference"
              value={form.genderPreference}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.genderPreference)}
              className={`w-full text-xs p-2.5 rounded-lg border focus:border-orange-500 focus:outline-none transition-all bg-white ${fieldErrors.genderPreference ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
              required
            >
              <option value="Any">{t('jobs.add.anyGender')}</option>
              <option value="Male">{t('jobs.add.male')}</option>
              <option value="Female">{t('jobs.add.female')}</option>
            </select>
            {fieldErrors.genderPreference && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.genderPreference}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.ageRange')} *</label>
            <input
              type="text"
              name="ageRange"
              value={form.ageRange}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.ageRange)}
              className={`w-full text-xs p-2.5 rounded-lg border focus:border-orange-500 focus:outline-none transition-all ${fieldErrors.ageRange ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
              required
            />
            {fieldErrors.ageRange && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.ageRange}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.salaryPeriod')}</label>
            <select
              name="salaryPeriodId"
              value={form.salaryPeriodId}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white"
            >
              <option value={0}>-- Select --</option>
              {salaryPeriods.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.weeklyOff')}</label>
            <select
              name="weeklyOffId"
              value={form.weeklyOffId}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white"
            >
              <option value={0}>-- Select --</option>
              {weeklyOffs.map((wo) => (
                <option key={wo.id} value={wo.id}>
                  {wo.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.shiftType')}</label>
            <select
              name="shiftTypeId"
              value={form.shiftTypeId}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white"
            >
              <option value={0}>-- Select --</option>
              {shiftTypes.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.benefits')}</label>
            <select
              name="benefits"
              value={form.benefits}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white"
            >
              <option value="">-- Select --</option>
              {jobBenefits.map((b) => (
                <option key={b.id} value={b.label}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Job Description & Posting Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.jobDescription')}</label>
          <textarea
            name="jobDiscription"
            rows={5}
            maxLength={MAX_JOB_DESCRIPTION_LENGTH}
            placeholder={t('jobs.add.jobDescriptionPlaceholder')}
            value={form.jobDiscription}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.jobDiscription)}
            className={`w-full text-xs p-2.5 rounded-lg border focus:border-orange-500 focus:outline-none transition-all resize-none ${fieldErrors.jobDiscription ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200'}`}
            required
          />
          {fieldErrors.jobDiscription && <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{fieldErrors.jobDiscription}</p>}
          <div className={`mt-1 text-[10px] font-semibold text-right ${form.jobDiscription.length >= MAX_JOB_DESCRIPTION_LENGTH ? 'text-rose-600' : 'text-slate-400'}`}>
            {MAX_JOB_DESCRIPTION_LENGTH - form.jobDiscription.length} {t('jobs.add.charactersLeft')} ({form.jobDiscription.length}/{MAX_JOB_DESCRIPTION_LENGTH})
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('jobs.add.postingNotes')}</label>
          <input
            type="text"
            name="postingNotes"
            placeholder="e.g. Urgent hiring, candidate must join within 10 days"
            value={form.postingNotes}
            onChange={handleChange}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all"
          />
        </div>

        {/* Buttons */}
        {(validationError || apiError) && (
          <div
            ref={validationSummaryRef}
            tabIndex={-1}
            className="space-y-2 rounded-lg outline-none focus:ring-2 focus:ring-red-200"
            role="alert"
            aria-live="polite"
          >
            {validationError && <Alert type="danger" title="Please review these fields" message={validationError} />}
            {apiError && (
              <Alert
                type="danger"
                title="Backend Error"
                message={(apiError as any)?.data?.message || (apiError as any)?.data || 'A network error occurred while submitting. Please verify your data.'}
              />
            )}
            {Object.entries(fieldErrors).length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-xs font-semibold text-red-700">
                {Object.entries(fieldErrors).map(([field, message]) => (
                  <li key={field}><span className="font-bold">{fieldLabels[field] || field}:</span> {message}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <button
              onClick={onCancel}
              type="button"
              className="py-3 px-5 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              {t('jobs.add.cancel')}
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`py-3 px-6 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isLoading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t('jobs.add.saving')}
              </>
            ) : (
              t('jobs.add.savePost')
            )}
          </button>
        </div>
      </form>

      {showToast && <Toast message={toastMsg} type={toastType} onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default AddJobForm;