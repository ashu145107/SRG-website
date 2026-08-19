
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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

interface AddJobFormProps {
  onSuccess?: (newJob: JobRequirement) => void;
  onCancel?: () => void;
}

export const AddJobForm: React.FC<AddJobFormProps> = ({ onSuccess, onCancel }) => {
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

  // Parse logged in user ID as a number for the API payload
  const numericUserId = user ? parseInt(user.id.replace(/\D/g, '')) || 123 : 123;

  // Form State
  const [form, setForm] = useState({
    profileHeader: '',
    skill: '',
    specialization: 0,
    experiance: 0,
    experianceTo: 1,
    noOfVacancy: 1,
    workPlace: '',
    salary: 0,
    salaryTo: 0,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    educationId: 0,
    subEducationId: 0,
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
    jobCode: `JOB-${Math.floor(1000 + Math.random() * 9000)}`,
    companyTypeId: 0,
    industryTypeId: 0,
    jobTypeId: 0,
  });

  const { data: subEducations = [] } = useGetSubEducationsQuery(form.educationId, {
    skip: !form.educationId,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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

    setForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Form Validation
    if (!form.jobDesignation.trim()) {
      setValidationError('कृपया नोकरीचे पद / Designation प्रविष्ट करा.');
      return;
    }

    if (!form.jobDiscription.trim() || form.jobDiscription.length < 10) {
      setValidationError('कृपया कमीत कमी १० अक्षरांचे नोकरीचे वर्णन / Description प्रविष्ट करा.');
      return;
    }

    if (!form.skill.trim()) {
      setValidationError('कृपया आवश्यक कौशल्ये / Skills प्रविष्ट करा.');
      return;
    }

    // Salary validation fix
    if (!Number.isFinite(form.salary) || form.salary <= 0) {
      setValidationError('कृपया किमान वेतन / Minimum Salary 0 पेक्षा जास्त प्रविष्ट करा.');
      return;
    }

    if (!Number.isFinite(form.salaryTo) || form.salaryTo <= 0) {
      setValidationError('कृपया कमाल वेतन / Maximum Salary 0 पेक्षा जास्त प्रविष्ट करा.');
      return;
    }

    if (form.salaryTo < form.salary) {
      setValidationError('कमाल वेतन हे किमान वेतनापेक्षा जास्त किंवा समान असावे.');
      return;
    }

    if (form.experianceTo < form.experiance) {
      setValidationError('कमाल अनुभव हा किमान अनुभवापेक्षा जास्त असावा.');
      return;
    }

    if (!form.jobLocation.trim()) {
      setValidationError('कृपया नोकरीचे ठिकाण / Location प्रविष्ट करा.');
      return;
    }

    try {
      const payload = {
        ...form,
        specialization: Number(form.industryTypeId) || 1,
        userId: numericUserId,
        createdBy: numericUserId,
        salary: Number(form.salary),
        salaryTo: Number(form.salaryTo),
        expiryDate: new Date(form.expiryDate).toISOString(),
      };

      const result = await addJob(payload);

      setToastType('success');
      setToastMsg('नोकरी रिक्त जागा यशस्वीरित्या जोडली! / Job Requirement Added Successfully!');
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
          <h2 className="text-xl font-bold text-slate-800">नवीन नोकरी रिक्त जागा जोडा / Add Job Requirement</h2>
          <p className="text-xs text-slate-500 mt-0.5">नियोक्ते व कंपन्यांसाठी थेट नोकरी नोंदणी पोर्टल</p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            type="button"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            मागे जा / Cancel
          </button>
        )}
      </div>

      {validationError && (
        <div className="mb-5">
          <Alert type="error" title="Validation Error" message={validationError} />
        </div>
      )}

      {apiError && (
        <div className="mb-5">
          <Alert
            type="error"
            title="Backend Error"
            message={
              (apiError as any)?.data?.message ||
              (apiError as any)?.data ||
              'A network error occurred while submitting. Please verify your data.'
            }
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info Row */}
        <div className="bg-slate-50/55 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">नोकरीचे कोड / Job Code</label>
            <input
              type="text"
              name="jobCode"
              value={form.jobCode}
              onChange={handleChange}
              className="w-full text-xs font-mono font-bold bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-slate-600 focus:outline-none"
              readOnly
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">नोकरीचे शीर्षक (हेडर) / Profile Header *</label>
            <input
              type="text"
              name="profileHeader"
              placeholder="e.g. Hiring experienced web programmers / Urgent Need of Drivers"
              value={form.profileHeader}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Designation, Vacancies & Role Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">नोकरीचे पद / Designation *</label>
            <input
              type="text"
              name="jobDesignation"
              placeholder="e.g. Sales Executive, Senior Accountant"
              value={form.jobDesignation}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">एकूण जागा / No. of Vacancies *</label>
            <input
              type="number"
              name="noOfVacancy"
              min="1"
              value={form.noOfVacancy}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">नोकरीचा प्रकार / Job Type *</label>
            <select
              name="jobTypeId"
              value={form.jobTypeId}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white"
            >
              <option value={0}>-- Select --</option>
              {jobTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Experience & Salary Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-orange-50/20 rounded-xl border border-orange-100/30">
          {/* Experience Group */}
          <div>
            <span className="block text-xs font-extrabold text-orange-950 mb-2">अनुभव आवश्यकता / Experience Range (Years)</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">किमान अनुभव / Min Experience</label>
                <input
                  type="number"
                  name="experiance"
                  min="0"
                  value={form.experiance}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">कमाल अनुभव / Max Experience</label>
                <input
                  type="number"
                  name="experianceTo"
                  min="0"
                  value={form.experianceTo}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Salary Group */}
          <div>
            <span className="block text-xs font-extrabold text-orange-950 mb-2">मासिक वेतनश्रेणी / Monthly Salary Range (INR)</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">किमान वेतन / Min Salary</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="salary"
                  min="1"
                  step="1"
                  value={form.salary}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">कमाल वेतन / Max Salary</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="salaryTo"
                  min="1"
                  step="1"
                  value={form.salaryTo}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Specialized Fields: Work Mode, Workplace type, location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">कामाची पद्धत / Work Mode *</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">कार्यालय किंवा क्षेत्र / Workplace Type</label>
            <input
              type="text"
              name="workPlace"
              placeholder="e.g. Office Building, On-field, Workshop"
              value={form.workPlace}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">नोकरीचे ठिकाण / Job Location *</label>
            <input
              type="text"
              name="jobLocation"
              placeholder="e.g. Nashik, Mumbai, Pune"
              value={form.jobLocation}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Education, Sub-Education, Expiry Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">शिक्षण पात्रता / Required Education *</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">विशेषीकरण / Sub-Education</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">अंतिम मुदत / Expiry Date *</label>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all cursor-pointer"
              required
            />
          </div>
        </div>

        {/* Company Type, Industry Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">कंपनीचा प्रकार / Company Type</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">उद्योगाचे क्षेत्र / Industry Type</label>
            <select
              name="industryTypeId"
              value={form.industryTypeId}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white"
            >
              <option value={0}>-- Select --</option>
              {industryTypes.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interview Details */}
        <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-4">
          <span className="block text-xs font-extrabold text-slate-800 border-b border-slate-100 pb-1.5">मुलाखत तपशील / Interview Details</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">मुलाखतीची पद्धत / Interview Mode</label>
              <select
                name="interviewModeId"
                value={form.interviewModeId}
                onChange={handleChange}
                className="w-full text-xs p-2.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-orange-500"
              >
                <option value={0}>-- Select --</option>
                {interviewModes.map((im) => (
                  <option key={im.id} value={im.id}>
                    {im.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">मुलाखतीचे ठिकाण / Interview Location</label>
              <input
                type="text"
                name="interviewLocation"
                placeholder="e.g. Corporate Office, Zoom Link, Telephonic"
                value={form.interviewLocation}
                onChange={handleChange}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Skills, Certifications, Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">आवश्यक कौशल्ये (स्वल्पविराम द्या) / Skills *</label>
            <input
              type="text"
              name="skill"
              placeholder="e.g. Tally, Ms-Office, Driving, Speaking Marathi"
              value={form.skill}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">आवश्यक प्रमाणपत्रे / Certifications Required</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">लिंग प्राधान्य / Gender Preference</label>
            <select
              name="genderPreference"
              value={form.genderPreference}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white"
            >
              <option value="Any">दोन्ही / Any Gender</option>
              <option value="Male">पुरुष / Male</option>
              <option value="Female">महिला / Female</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">वयोमर्यादा / Age Range</label>
            <input
              type="text"
              name="ageRange"
              value={form.ageRange}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">वेतन कालावधी / Salary Period</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">साप्ताहिक सुट्टी / Weekly Off</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">कामाची पाळी / Shift Type</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">इतर फायदे / Key Perks & Benefits</label>
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
          <label className="block text-xs font-bold text-slate-700 mb-1.5">नोकरीचे सविस्तर वर्णन / Job Description *</label>
          <textarea
            name="jobDiscription"
            rows={5}
            placeholder="नोकरीचे मुख्य काम, कामाच्या वेळा आणि जबाबदाऱ्या सविस्तर लिहा..."
            value={form.jobDiscription}
            onChange={handleChange}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">नियोक्ता टिप्पणी / Internal Posting Notes</label>
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
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <button
              onClick={onCancel}
              type="button"
              className="py-3 px-5 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              मागे जा / Cancel
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
                जतन होत आहे... / Saving...
              </>
            ) : (
              'रिक्त जागा जतन करा / Save & Post Requirement'
            )}
          </button>
        </div>
      </form>

      {showToast && <Toast message={toastMsg} type={toastType} onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default AddJobForm;