/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { useEditJobRequirementMutation, useJobDetailsQuery } from '../../hooks/useJobQueries';
import { useGetJobRequirementByCodeQuery } from '../../services/adminApi';
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

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <p className="mt-1 text-[11px] font-semibold text-red-600" role="alert">{message}</p> : null;

interface EditJobFormProps {
  jobId: number;
  jobCode?: string;
  onSuccess?: (updatedJob: JobRequirement) => void;
  onCancel?: () => void;
}

type EditJobFormData = Omit<JobRequirement, 'id'>;

const getNumber = (value: unknown, fallback = 0): number => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatDateForInput = (dateValue: unknown): string => {
  if (!dateValue) {
    return '';
  }

  const dateText = String(dateValue);
  const dateOnly = dateText.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnly) return dateOnly[1];

  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().split('T')[0];
};

const resolveMasterId = (
  id: unknown,
  label: unknown,
  options: Array<{ id: number; label: string }>,
  fallback: number
): number => {
  const parsedId = getNumber(id, 0);
  if (parsedId) return parsedId;

  const normalizedLabel = String(label ?? '').trim().toLocaleLowerCase();
  return options.find((option) => option.label.trim().toLocaleLowerCase() === normalizedLabel)?.id ?? fallback;
};

const getErrorMessage = (error: any): string => {
  const message =
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.data?.error?.message ||
    error?.data?.message ||
    error?.error?.message ||
    error?.message ||
    error?.data;

  if (typeof message === 'string') {
    return message;
  }

  return 'Failed to update Job Requirement. Please check the entered values.';
};

const initialForm: EditJobFormData = {
  userId: 0,
  profileHeader: '',
  skill: '',
  specialization: 0,
  experiance: 0,
  experianceTo: 1,
  noOfVacancy: 1,
  workPlace: '',
  salary: 1,
  salaryTo: 1,
  expiryDate: '',
  educationId: 0,
  createdBy: 0,
  roleTypeId: 1,
  interviewModeId: 1,
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
  jobCode: '',
  companyTypeId: 0,
  industryTypeId: 0,
  jobTypeId: 0,
  subEducationId: 0,
};

export const EditJobForm: React.FC<EditJobFormProps> = ({
  jobId,
  jobCode,
  onSuccess,
  onCancel,
}) => {
  const {
    data: legacyJobData,
    isLoading: isLegacyLoading,
    error: legacyLoadError,
    refetch: refetchLegacy,
  } = useJobDetailsQuery(jobId, undefined, !jobCode);
  const {
    data: jobCodeData,
    isLoading: isJobCodeLoading,
    isFetching: isJobCodeFetching,
    error: jobCodeError,
    refetch: refetchJobCode,
  } = useGetJobRequirementByCodeQuery(jobCode || '', {
    skip: !jobCode,
    refetchOnMountOrArgChange: true,
  });
  const jobData = jobCode ? jobCodeData : legacyJobData;
  const isLoadingDetails = jobCode ? isJobCodeLoading || isJobCodeFetching : isLegacyLoading;
  const loadError = jobCode ? jobCodeError : legacyLoadError;
  const refetch = jobCode ? refetchJobCode : refetchLegacy;

  const editJobMutation = useEditJobRequirementMutation();

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

  const [form, setForm] = useState<EditJobFormData>(initialForm);
  const { data: subEducations = [] } = useGetSubEducationsQuery(form.educationId, {
    skip: !form.educationId,
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const validationSummaryRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const fieldLabels: Record<string, string> = {
    profileHeader: 'Profile header',
    jobDesignation: 'Designation',
    noOfVacancy: 'Number of vacancies',
    experiance: 'Minimum experience',
    experianceTo: 'Maximum experience',
    salary: 'Minimum salary',
    salaryTo: 'Maximum salary',
    jobLocation: 'Job location',
    expiryDate: 'Expiry date',
    skill: 'Required skills',
    jobDiscription: 'Job description',
  };

  useEffect(() => {
    if (!validationError || Object.keys(fieldErrors).length === 0) return;
    validationSummaryRef.current?.focus({ preventScroll: true });
    validationSummaryRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  }, [validationError, fieldErrors]);

  useEffect(() => {
    if (!jobData) {
      return;
    }

    const loadedForm: EditJobFormData = {
      userId: getNumber(jobData.userId),
      profileHeader: jobData.profileHeader ?? '',
      skill: jobData.skill ?? '',
      specialization: getNumber(jobData.specializationId ?? jobData.specialization, 0),
      experiance: getNumber(jobData.experiance, 0),
      experianceTo: getNumber(jobData.experianceTo, 1),
      noOfVacancy: getNumber(jobData.noOfVacancy, 1),
      workPlace: jobData.workPlace ?? '',

      // Do not use `|| 0` here because it silently changes values.
      // Salary is initialized to 1 if the API has no value because the
      // backend rejects zero salary values.
      salary: getNumber(jobData.salary, 1),
      salaryTo: getNumber(jobData.salaryTo, 1),

      expiryDate: formatDateForInput(jobData.expiryDate),
      educationId: resolveMasterId(jobData.educationId, jobData.education, educations, 0),
      createdBy: getNumber(jobData.createdBy),
      roleTypeId: getNumber(jobData.roleTypeId, 1),
      interviewModeId: resolveMasterId(jobData.interviewModeId, jobData.interviewMode, interviewModes, 0),
      interviewLocation: jobData.interviewLocation ?? '',
      postingNotes: jobData.postingNotes ?? '',
      jobDiscription: jobData.jobDiscription ?? '',
      jobDesignation: jobData.jobDesignation ?? '',
      certificationsRequired: jobData.certificationsRequired ?? '',
      genderPreference: jobData.genderPreference ?? 'Any',
      ageRange: jobData.ageRange ?? '18-45',
      shiftTypeId: resolveMasterId(jobData.shiftTypeId, jobData.shiftType, shiftTypes, 0),
      workModeId: resolveMasterId(jobData.workModeId, jobData.workMode, workModes, 0),
      jobLocation: jobData.jobLocation ?? '',
      salaryPeriodId: resolveMasterId(jobData.salaryPeriodId, jobData.salaryPeriod, salaryPeriods, 0),
      benefits: jobData.benefits ?? '',
      weeklyOffId: resolveMasterId(jobData.weeklyOffId, jobData.weeklyOff, weeklyOffs, 0),
      jobCode: jobData.jobCode ?? '',
      companyTypeId: resolveMasterId(jobData.companyTypeId, jobData.companyType, companyTypes, 0),
      industryTypeId: resolveMasterId(
        jobData.industryTypeId ?? jobData.specializationId,
        jobData.specialization,
        industryTypes,
        getNumber(jobData.specialization, 0)
      ),
      jobTypeId: resolveMasterId(jobData.jobTypeId ?? jobData.roleTypeId, jobData.jobType ?? jobData.roleType, jobTypes, 0),
      subEducationId: getNumber(jobData.subEducationId, 0),
    };

    setForm(loadedForm);
  }, [
    jobData,
    companyTypes,
    industryTypes,
    jobTypes,
    interviewModes,
    shiftTypes,
    workModes,
    salaryPeriods,
    weeklyOffs,
    educations,
  ]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    const numericFields = [
      'specialization',
      'experiance',
      'experianceTo',
      'noOfVacancy',
      'salary',
      'salaryTo',
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

    setForm((previous) => ({
      ...previous,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
    setFieldErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
    setValidationError(null);
  };

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!form.profileHeader.trim()) errors.profileHeader = 'Please enter the profile header.';
    if (!form.jobDesignation.trim()) errors.jobDesignation = 'Please enter the job designation.';
    if (!form.skill.trim()) errors.skill = 'Please enter the required skills.';
    if (!form.jobDiscription.trim()) {
      errors.jobDiscription = 'Please enter the job description.';
    } else if (form.jobDiscription.trim().length < 10) {
      errors.jobDiscription = 'Job description must contain at least 10 characters.';
    }
    if (!form.noOfVacancy || form.noOfVacancy < 1) errors.noOfVacancy = 'Number of vacancies must be at least 1.';
    if (form.experiance < 0) errors.experiance = 'Experience cannot be negative.';
    if (form.experianceTo < 0) errors.experianceTo = 'Experience cannot be negative.';
    if (form.experianceTo < form.experiance) {
      errors.experianceTo = 'Maximum experience must be greater than or equal to minimum experience.';
    }
    if (!Number.isFinite(form.salary) || form.salary <= 0) errors.salary = 'Minimum salary must be greater than 0.';
    if (!Number.isFinite(form.salaryTo) || form.salaryTo <= 0) errors.salaryTo = 'Maximum salary must be greater than 0.';
    if (form.salaryTo < form.salary) errors.salaryTo = 'Maximum salary must be greater than or equal to minimum salary.';
    if (!form.jobLocation.trim()) errors.jobLocation = 'Please enter the job location.';
    if (!form.expiryDate || Number.isNaN(new Date(form.expiryDate).getTime())) {
      errors.expiryDate = 'Please select a valid expiry date.';
    }
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setValidationError('Please fix the highlighted fields before saving.');
      return;
    }
    setFieldErrors({});

    try {
      const payload = {
        ...form,
        specialization: Number(form.industryTypeId) || Number(form.specialization) || 1,
        id: jobId,
        userId: Number(form.userId),
        createdBy: Number(form.createdBy),
        experiance: Number(form.experiance),
        experianceTo: Number(form.experianceTo),
        noOfVacancy: Number(form.noOfVacancy),
        salary: Number(form.salary),
        salaryTo: Number(form.salaryTo),
        educationId: Number(form.educationId),
        roleTypeId: Number(form.roleTypeId),
        interviewModeId: Number(form.interviewModeId),
        shiftTypeId: Number(form.shiftTypeId),
        workModeId: Number(form.workModeId),
        salaryPeriodId: Number(form.salaryPeriodId),
        weeklyOffId: Number(form.weeklyOffId),
        expiryDate: new Date(form.expiryDate).toISOString(),
      };

      const result: any = await editJobMutation.mutateAsync(payload);

      // Handle APIs that return HTTP 200 but isSuccess=false
      if (result?.isSuccess === false) {
        throw new Error(
          result?.error?.message || 'Job update failed on the server.'
        );
      }

      setToastType('success');
      setToastMsg('Job Requirement updated successfully.');
      setShowToast(true);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(result?.value ?? result);
        }, 800);
      }
    } catch (error: any) {
      console.error('Edit job API error:', error);

      const message = getErrorMessage(error);

      setToastType('error');
      setToastMsg(message);
      setShowToast(true);
    }
  };

  if (isLoadingDetails) {
    return (
      <div className="bg-white rounded-2xl border border-slate-150 p-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-slate-100 rounded" />
          <div className="h-10 bg-slate-100 rounded" />
          <div className="h-32 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (loadError || !jobData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-150 p-8 max-w-xl mx-auto text-center">
        <div className="text-red-500 text-3xl mb-3">⚠️</div>

        <h3 className="text-base font-bold text-slate-800">
          Failed to load job details
        </h3>

        <p className="text-xs text-slate-500 mt-2">
          {jobCode ? `Job requirement ${jobCode} could not be loaded.` : 'Job requirement details could not be loaded.'}
        </p>

        <div className="flex justify-center gap-2 mt-5">
          <button
            type="button"
            onClick={() => refetch()}
            className="py-2 px-4 text-xs font-bold bg-slate-800 text-white rounded-xl"
          >
            Retry
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="py-2 px-4 text-xs font-bold border border-slate-200 text-slate-600 rounded-xl"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-150 shadow-xs p-6 max-w-4xl mx-auto text-left">
      <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Edit Job Requirement
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Job Code: {form.jobCode || jobCode || `JOB-${jobId}`}
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold text-slate-500 py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">Profile Header *</label>
            <input
              name="profileHeader"
              value={form.profileHeader}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.profileHeader)}
              className={`form-input ${fieldErrors.profileHeader ? '!border-red-500 !ring-2 !ring-red-100' : ''}`}
              required
            />
            <FieldError message={fieldErrors.profileHeader} />
          </div>

          <div>
            <label className="form-label">Job Code</label>
            <input
              name="jobCode"
              value={form.jobCode}
              className="form-input bg-slate-100"
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Job Designation *</label>
            <input
              name="jobDesignation"
              value={form.jobDesignation}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.jobDesignation)}
              className={`form-input ${fieldErrors.jobDesignation ? '!border-red-500 !ring-2 !ring-red-100' : ''}`}
              required
            />
            <FieldError message={fieldErrors.jobDesignation} />
          </div>

          <div>
            <label className="form-label">Number of Vacancies *</label>
            <input
              type="number"
              name="noOfVacancy"
              min="1"
              value={form.noOfVacancy}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.noOfVacancy)}
              className={`form-input ${fieldErrors.noOfVacancy ? '!border-red-500 !ring-2 !ring-red-100' : ''}`}
              required
            />
            <FieldError message={fieldErrors.noOfVacancy} />
          </div>

          <div>
            <label className="form-label">Job Type</label>
            <select
              name="jobTypeId"
              value={form.jobTypeId}
              onChange={handleChange}
              className="form-input"
            >
              <option value={0}>-- Select --</option>
              {jobTypes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-orange-50/30 rounded-xl border border-orange-100">
          <div>
            <h3 className="text-xs font-bold text-orange-950 mb-3">
              Experience Range
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Minimum Experience</label>
                <input
                  type="number"
                  name="experiance"
                  min="0"
                  value={form.experiance}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.experiance)}
                  className={`form-input ${fieldErrors.experiance ? '!border-red-500 !ring-2 !ring-red-100' : ''}`}
                />
                <FieldError message={fieldErrors.experiance} />
              </div>

              <div>
                <label className="form-label">Maximum Experience</label>
                <input
                  type="number"
                  name="experianceTo"
                  min="0"
                  value={form.experianceTo}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.experianceTo)}
                  className={`form-input ${fieldErrors.experianceTo ? '!border-red-500 !ring-2 !ring-red-100' : ''}`}
                />
                <FieldError message={fieldErrors.experianceTo} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-orange-950 mb-3">
              Salary Range
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Minimum Salary *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="salary"
                  min="1"
                  step="1"
                  value={form.salary}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.salary)}
                  className={`form-input ${fieldErrors.salary ? '!border-red-500 !ring-2 !ring-red-100' : ''}`}
                  required
                />
                <FieldError message={fieldErrors.salary} />
              </div>

              <div>
                <label className="form-label">Maximum Salary *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="salaryTo"
                  min="1"
                  step="1"
                  value={form.salaryTo}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.salaryTo)}
                  className={`form-input ${fieldErrors.salaryTo ? '!border-red-500 !ring-2 !ring-red-100' : ''}`}
                  required
                />
                <FieldError message={fieldErrors.salaryTo} />
              </div>
            </div>

            <p className="text-[10px] text-slate-500 mt-2">
              Salary must be greater than 0 because the API does not accept
              zero salary values.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Work Mode</label>
            <select
              name="workModeId"
              value={form.workModeId}
              onChange={handleChange}
              className="form-input"
            >
              <option value={0}>-- Select --</option>
              {workModes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Workplace</label>
            <input
              name="workPlace"
              value={form.workPlace}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Job Location *</label>
            <input
              name="jobLocation"
              value={form.jobLocation}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.jobLocation)}
              className={`form-input ${fieldErrors.jobLocation ? '!border-red-500 !ring-2 !ring-red-100' : ''}`}
              required
            />
            <FieldError message={fieldErrors.jobLocation} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Education</label>
            <select
              name="educationId"
              value={form.educationId}
              onChange={(e) => {
                handleChange(e);
                setForm((prev) => ({ ...prev, subEducationId: 0 }));
              }}
              className="form-input"
            >
              <option value={0}>-- Select --</option>
              {educations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Sub-Education</label>
            <select
              name="subEducationId"
              value={form.subEducationId}
              onChange={handleChange}
              disabled={!form.educationId}
              className="form-input"
            >
              <option value={0}>-- Select --</option>
              {subEducations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Expiry Date *</label>
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
              className={`form-input ${fieldErrors.expiryDate ? '!border-red-500 !ring-2 !ring-red-100' : ''}`}
              required
            />
            <FieldError message={fieldErrors.expiryDate} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Company Type</label>
            <select
              name="companyTypeId"
              value={form.companyTypeId}
              onChange={handleChange}
              className="form-input"
            >
              <option value={0}>-- Select --</option>
              {companyTypes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Industry Type</label>
            <select
              name="industryTypeId"
              value={form.industryTypeId}
              onChange={handleChange}
              className="form-input"
            >
              <option value={0}>-- Select --</option>
              {industryTypes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Interview Mode</label>
            <select
              name="interviewModeId"
              value={form.interviewModeId}
              onChange={handleChange}
              className="form-input"
            >
              <option value={0}>-- Select --</option>
              {interviewModes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Interview Location</label>
            <input
              name="interviewLocation"
              value={form.interviewLocation}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Required Skills *</label>
            <input
              name="skill"
              value={form.skill}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.skill)}
              className={`form-input ${fieldErrors.skill ? '!border-red-500 !ring-2 !ring-red-100' : ''}`}
              required
            />
            <FieldError message={fieldErrors.skill} />
          </div>

          <div>
            <label className="form-label">Certifications Required</label>
            <input
              name="certificationsRequired"
              value={form.certificationsRequired}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Gender Preference</label>
            <select
              name="genderPreference"
              value={form.genderPreference}
              onChange={handleChange}
              className="form-input"
            >
              <option value="Any">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="form-label">Age Range</label>
            <input
              name="ageRange"
              value={form.ageRange}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Salary Period</label>
            <select
              name="salaryPeriodId"
              value={form.salaryPeriodId}
              onChange={handleChange}
              className="form-input"
            >
              <option value={0}>-- Select --</option>
              {salaryPeriods.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Weekly Off</label>
            <select
              name="weeklyOffId"
              value={form.weeklyOffId}
              onChange={handleChange}
              className="form-input"
            >
              <option value={0}>-- Select --</option>
              {weeklyOffs.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Shift Type</label>
            <select
              name="shiftTypeId"
              value={form.shiftTypeId}
              onChange={handleChange}
              className="form-input"
            >
              <option value={0}>-- Select --</option>
              {shiftTypes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Benefits</label>
            <select
              name="benefits"
              value={form.benefits}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">-- Select --</option>
              {jobBenefits.map((item) => (
                <option key={item.id} value={item.label}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Job Description *</label>
          <textarea
            name="jobDiscription"
            rows={5}
            maxLength={MAX_JOB_DESCRIPTION_LENGTH}
            value={form.jobDiscription}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.jobDiscription)}
            className={`form-input resize-none ${fieldErrors.jobDiscription ? '!border-red-500 !ring-2 !ring-red-100' : ''}`}
            required
          />
          <FieldError message={fieldErrors.jobDiscription} />
          <div className={`mt-1 text-[10px] font-semibold text-right ${form.jobDiscription.length >= MAX_JOB_DESCRIPTION_LENGTH ? 'text-rose-600' : 'text-slate-400'}`}>
            {MAX_JOB_DESCRIPTION_LENGTH - form.jobDiscription.length} characters left ({form.jobDiscription.length}/{MAX_JOB_DESCRIPTION_LENGTH})
          </div>
        </div>

        <div>
          <label className="form-label">Posting Notes</label>
          <input
            name="postingNotes"
            value={form.postingNotes}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        {(validationError || editJobMutation.error) && (
          <div
            ref={validationSummaryRef}
            tabIndex={-1}
            className="space-y-2 rounded-lg outline-none focus:ring-2 focus:ring-red-200"
            role="alert"
            aria-live="polite"
          >
            {validationError && (
              <Alert type="danger" title="Please review these fields" message={validationError} />
            )}
            {editJobMutation.error && (
              <Alert type="danger" title="Backend Error" message={getErrorMessage(editJobMutation.error)} />
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
              type="button"
              onClick={onCancel}
              className="py-3 px-5 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={editJobMutation.isPending}
            className="py-3 px-6 text-xs font-bold text-white rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400"
          >
            {editJobMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {showToast && (
        <Toast
          message={toastMsg}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <style>{`
        .form-label {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #334155;
        }

        .form-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px;
          font-size: 12px;
          outline: none;
          background: white;
        }

        .form-input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 1px #f97316;
        }
      `}</style>
    </div>
  );
};

export default EditJobForm;