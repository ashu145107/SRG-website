/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useEditJobRequirementMutation, useJobDetailsQuery } from '../../hooks/useJobQueries';
import { JobRequirement } from '../../services/jobTypes';
import {
  educations,
  roleTypes,
  interviewModes,
  shiftTypes,
  workModes,
  salaryPeriods,
  weeklyOffs,
  specializations,
} from './jobMappings';
import { Alert, Toast } from '../ui/FeedbackComponents';

interface EditJobFormProps {
  jobId: number;
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

  const date = new Date(String(dateValue));

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().split('T')[0];
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
  specialization: 1,
  experiance: 0,
  experianceTo: 1,
  noOfVacancy: 1,
  workPlace: '',
  salary: 1,
  salaryTo: 1,
  expiryDate: '',
  educationId: 3,
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
};

export const EditJobForm: React.FC<EditJobFormProps> = ({
  jobId,
  onSuccess,
  onCancel,
}) => {
  const {
    data: jobData,
    isLoading: isLoadingDetails,
    error: loadError,
    refetch,
  } = useJobDetailsQuery(jobId);

  const editJobMutation = useEditJobRequirementMutation();

  const [form, setForm] = useState<EditJobFormData>(initialForm);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!jobData) {
      return;
    }

    const loadedForm: EditJobFormData = {
      userId: getNumber(jobData.userId),
      profileHeader: jobData.profileHeader ?? '',
      skill: jobData.skill ?? '',
      specialization: getNumber(jobData.specialization, 1),
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
      educationId: getNumber(jobData.educationId, 3),
      createdBy: getNumber(jobData.createdBy),
      roleTypeId: getNumber(jobData.roleTypeId, 1),
      interviewModeId: getNumber(jobData.interviewModeId, 1),
      interviewLocation: jobData.interviewLocation ?? '',
      postingNotes: jobData.postingNotes ?? '',
      jobDiscription: jobData.jobDiscription ?? '',
      jobDesignation: jobData.jobDesignation ?? '',
      certificationsRequired: jobData.certificationsRequired ?? '',
      genderPreference: jobData.genderPreference ?? 'Any',
      ageRange: jobData.ageRange ?? '18-45',
      shiftTypeId: getNumber(jobData.shiftTypeId, 1),
      workModeId: getNumber(jobData.workModeId, 1),
      jobLocation: jobData.jobLocation ?? '',
      salaryPeriodId: getNumber(jobData.salaryPeriodId, 1),
      benefits: jobData.benefits ?? '',
      weeklyOffId: getNumber(jobData.weeklyOffId, 1),
      jobCode: jobData.jobCode ?? '',
    };

    setForm(loadedForm);
  }, [jobData]);

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
      'roleTypeId',
      'interviewModeId',
      'shiftTypeId',
      'workModeId',
      'salaryPeriodId',
      'weeklyOffId',
    ];

    setForm((previous) => ({
      ...previous,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const validateForm = (): string | null => {
    if (!form.profileHeader.trim()) {
      return 'Please enter the profile header.';
    }

    if (!form.jobDesignation.trim()) {
      return 'Please enter the job designation.';
    }

    if (!form.skill.trim()) {
      return 'Please enter the required skills.';
    }

    if (!form.jobDiscription.trim()) {
      return 'Please enter the job description.';
    }

    if (form.jobDiscription.trim().length < 10) {
      return 'Job description must contain at least 10 characters.';
    }

    if (!form.noOfVacancy || form.noOfVacancy < 1) {
      return 'Number of vacancies must be at least 1.';
    }

    if (form.experiance < 0 || form.experianceTo < 0) {
      return 'Experience cannot be negative.';
    }

    if (form.experianceTo < form.experiance) {
      return 'Maximum experience must be greater than or equal to minimum experience.';
    }

    // Important backend validation
    if (!Number.isFinite(form.salary) || form.salary <= 0) {
      return 'Minimum salary must be greater than 0.';
    }

    if (!Number.isFinite(form.salaryTo) || form.salaryTo <= 0) {
      return 'Maximum salary must be greater than 0.';
    }

    if (form.salaryTo < form.salary) {
      return 'Maximum salary must be greater than or equal to minimum salary.';
    }

    if (!form.jobLocation.trim()) {
      return 'Please enter the job location.';
    }

    if (!form.expiryDate) {
      return 'Please select an expiry date.';
    }

    const expiryDate = new Date(form.expiryDate);

    if (Number.isNaN(expiryDate.getTime())) {
      return 'Please enter a valid expiry date.';
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    const validationMessage = validateForm();

    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }

    try {
      const payload: JobRequirement = {
        ...form,

        // Keep the existing backend property names.
        // Do not rename these unless your API contract specifically requires it.
        id: jobId,

        userId: Number(form.userId),
        createdBy: Number(form.createdBy),
        specialization: Number(form.specialization),
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
          Job Requirement ID #{jobId} could not be loaded.
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
            Job Code: {form.jobCode || `JOB-${jobId}`} | ID: #{jobId}
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

      {validationError && (
        <div className="mb-5">
          <Alert
            type="error"
            title="Validation Error"
            message={validationError}
          />
        </div>
      )}

      {editJobMutation.error && (
        <div className="mb-5">
          <Alert
            type="error"
            title="Backend Error"
            message={getErrorMessage(editJobMutation.error)}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">Profile Header *</label>
            <input
              name="profileHeader"
              value={form.profileHeader}
              onChange={handleChange}
              className="form-input"
              required
            />
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
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Number of Vacancies *</label>
            <input
              type="number"
              name="noOfVacancy"
              min="1"
              value={form.noOfVacancy}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Role Type</label>
            <select
              name="roleTypeId"
              value={form.roleTypeId}
              onChange={handleChange}
              className="form-input"
            >
              {roleTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.labelEn}
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Minimum Experience</label>
                <input
                  type="number"
                  name="experiance"
                  min="0"
                  value={form.experiance}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Maximum Experience</label>
                <input
                  type="number"
                  name="experianceTo"
                  min="0"
                  value={form.experianceTo}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-orange-950 mb-3">
              Salary Range
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Minimum Salary *</label>
                <input
                  type="number"
                  name="salary"
                  min="1"
                  step="1"
                  value={form.salary}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Maximum Salary *</label>
                <input
                  type="number"
                  name="salaryTo"
                  min="1"
                  step="1"
                  value={form.salaryTo}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
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
              {workModes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.labelEn}
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
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Education</label>
            <select
              name="educationId"
              value={form.educationId}
              onChange={handleChange}
              className="form-input"
            >
              {educations.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Specialization</label>
            <select
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              className="form-input"
            >
              {specializations.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Expiry Date *</label>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              className="form-input"
              required
            />
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
              {interviewModes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.labelEn}
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
              className="form-input"
              required
            />
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
              {salaryPeriods.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.labelEn}
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
              {weeklyOffs.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.labelEn}
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
              {shiftTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Benefits</label>
            <input
              name="benefits"
              value={form.benefits}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Job Description *</label>
          <textarea
            name="jobDiscription"
            rows={5}
            value={form.jobDiscription}
            onChange={handleChange}
            className="form-input resize-none"
            required
          />
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