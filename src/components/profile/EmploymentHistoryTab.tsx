/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Employment History tab for job seeker profiles:
 *  - List of saved employment history entries.
 *  - Add a new entry (POST /api/v1/addemploymenthistory).
 *  - Edit an existing entry (POST /api/v1/updateemploymenthistory).
 *  - Delete an entry (POST /api/v1/deleteemploymenthistory).
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Briefcase,
  Building2,
  Pencil,
  Plus,
  Trash2,
  MapPin,
  CalendarDays,
  BadgeCheck,
  X,
  Layers,
} from 'lucide-react';
import {
  addEmploymentHistory,
  updateEmploymentHistory,
  deleteEmploymentHistory,
} from '../../services/profileApi';
import {
  useGetIndustryTypesQuery,
  useGetJobTypesQuery,
} from '../../services/jobMasterApi';
import { EmploymentHistory, MyProfile } from '../../types';
import { ConfirmDialog, Modal, Toast, Loader } from '../ui/FeedbackComponents';

interface EmploymentHistoryTabProps {
  profile?: MyProfile;
  loading?: boolean;
  onRefresh: () => void;
}

interface EmploymentFormState {
  companyName: string;
  companyIndustryId: number | 0;
  designation: string;
  department: string;
  jobTypeId: number | 0;
  jobLocation: string;
  startDate: string;
  endDate: string;
  isCurrentJob: boolean;
}

const emptyForm: EmploymentFormState = {
  companyName: '',
  companyIndustryId: 0,
  designation: '',
  department: '',
  jobTypeId: 0,
  jobLocation: '',
  startDate: '',
  endDate: '',
  isCurrentJob: false,
};

const toInputDate = (value?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const formatDisplayDate = (value?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const EmploymentHistoryTab: React.FC<EmploymentHistoryTabProps> = ({
  profile,
  loading = false,
  onRefresh,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: industryTypes = [] } = useGetIndustryTypesQuery();
  const { data: jobTypes = [] } = useGetJobTypesQuery();

  const history: EmploymentHistory[] = profile?.employmentHistory || [];

  // Popup / toast state
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [successPopup, setSuccessPopup] = useState<{ title: string; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmploymentHistory | null>(null);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<EmploymentFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const userIdNum =
    parseInt(String(profile?.userId || user?.id || '').replace(/\D/g, ''), 10) || 0;

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMsg(message && message.trim() ? message : type === 'success' ? 'Operation successful.' : 'Something went wrong.');
    setToastType(type);
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setValidationError('');
    setFormOpen(true);
  };

  const openEditForm = (entry: EmploymentHistory) => {
    setEditingId(entry.employmentHistoryId ?? 0);
    setForm({
      companyName: entry.companyName || '',
      companyIndustryId: entry.companyIndustryId || 0,
      designation: entry.designation || '',
      department: entry.department || '',
      jobTypeId: entry.jobTypeId || 0,
      jobLocation: entry.jobLocation || '',
      startDate: toInputDate(entry.startDate),
      endDate: toInputDate(entry.endDate),
      isCurrentJob: !!entry.isCurrentJob,
    });
    setValidationError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setValidationError('');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'companyIndustryId' || name === 'jobTypeId' ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    setValidationError('');
    if (!form.companyName.trim()) {
      setValidationError('Please enter the company name.');
      return;
    }
    if (!form.designation.trim()) {
      setValidationError('Please enter the designation.');
      return;
    }
    if (!form.startDate) {
      setValidationError('Please select the start date.');
      return;
    }
    if (!form.isCurrentJob && form.endDate && form.endDate < form.startDate) {
      setValidationError('End date cannot be before the start date.');
      return;
    }

    const payload: EmploymentHistory = {
      employmentHistoryId: editingId ?? 0,
      userId: userIdNum,
      companyName: form.companyName.trim(),
      companyIndustryId: form.companyIndustryId || 0,
      industryTypeName: industryTypes.find((t) => t.id === form.companyIndustryId)?.label || '',
      designation: form.designation.trim(),
      department: form.department.trim(),
      jobTypeId: form.jobTypeId || 0,
      jobLocation: form.jobLocation.trim(),
      startDate: form.startDate ? new Date(`${form.startDate}T00:00:00.000Z`).toISOString() : null as unknown as string,
      endDate: form.isCurrentJob || !form.endDate
        ? null as unknown as string
        : new Date(`${form.endDate}T00:00:00.000Z`).toISOString(),
      isCurrentJob: form.isCurrentJob,
    };

    setSubmitting(true);
    try {
      const result = editingId
        ? await updateEmploymentHistory(payload)
        : await addEmploymentHistory(payload);

      if (result.success) {
        closeForm();
        setSuccessPopup({
          title: editingId ? 'Employment Updated' : 'Employment Added',
          message: result.message,
        });
        onRefresh();
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Unexpected error while saving employment history.', 'error');
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.employmentHistoryId ?? 0;
    setDeleteTarget(null);
    if (!id) return;

    setSubmitting(true);
    try {
      const result = await deleteEmploymentHistory({ employmentHistoryId: id, userId: userIdNum });
      if (result.success) {
        setSuccessPopup({
          title: 'Employment Deleted',
          message: result.message,
        });
        onRefresh();
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Unexpected error while deleting employment history.', 'error');
    }
    setSubmitting(false);
  };

  const inputClass =
    'w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white';
  const labelClass = 'block text-xs font-bold text-slate-700 mb-1.5';

  const formTitle = editingId ? 'Edit Employment History' : 'Add Previous Employment';

  return (
    <div className="space-y-5 text-left">
      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-5">
          {/* Header row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-800">Previous Employment</p>
                <p className="text-[10px] text-slate-400 font-semibold">
                  {history.length > 0 ? `${history.length} record${history.length > 1 ? 's' : ''} added` : 'No entries yet'}
                </p>
              </div>
            </div>
            {!formOpen && (
              <button
                onClick={openAddForm}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Previous Employment
              </button>
            )}
          </div>

          {/* ---- Add / Edit form ---- */}
          {formOpen && (
            <div className="border border-orange-200 bg-orange-50/40 rounded-2xl p-4 sm:p-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-extrabold text-slate-800">{formTitle}</h3>
                <button
                  onClick={closeForm}
                  aria-label="Close form"
                  className="p-1.5 hover:bg-orange-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>कंपनीचे नाव / Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="e.g. Infosys, TCS, Local Store"
                    value={form.companyName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>पदनाम / Designation *</label>
                  <input
                    type="text"
                    name="designation"
                    placeholder="e.g. Sales Executive"
                    value={form.designation}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>विभाग / Department</label>
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. Marketing, Accounts"
                    value={form.department}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>उद्योगाचे क्षेत्र / Industry Type</label>
                  <select
                    name="companyIndustryId"
                    value={form.companyIndustryId}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value={0}>-- Select --</option>
                    {industryTypes.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>नोकरीचा प्रकार / Job Type</label>
                  <select
                    name="jobTypeId"
                    value={form.jobTypeId}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value={0}>-- Select --</option>
                    {jobTypes.map((jt) => (
                      <option key={jt.id} value={jt.id}>
                        {jt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>कामाचे ठिकाण / Job Location</label>
                  <input
                    type="text"
                    name="jobLocation"
                    placeholder="e.g. Nashik, Mumbai, Pune"
                    value={form.jobLocation}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>प्रारंभ तारीख / Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className={`${inputClass} cursor-pointer`}
                  />
                </div>

                <div>
                  <label className={labelClass}>शेवटची तारीख / End Date {form.isCurrentJob ? '' : '(optional)'}</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    disabled={form.isCurrentJob}
                    className={`${inputClass} cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`}
                  />
                  {form.isCurrentJob && (
                    <span className="block text-[10px] text-orange-600 font-semibold mt-1">Currently working here</span>
                  )}
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="isCurrentJob"
                      checked={form.isCurrentJob}
                      onChange={handleChange}
                      className="w-4 h-4 accent-orange-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">सध्या कार्यरत / This is my current job</span>
                  </label>
                </div>
              </div>

              {validationError && (
                <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {validationError}
                </div>
              )}

              <div className="flex items-center gap-3 justify-end flex-wrap">
                <button
                  onClick={closeForm}
                  disabled={submitting}
                  className="px-4 py-2.5 text-xs font-semibold hover:bg-gray-100 rounded-xl text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></span>
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          )}

          {/* ---- Empty state ---- */}
          {!formOpen && history.length === 0 && (
            <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
                <Briefcase className="w-7 h-7 text-orange-500" />
              </div>
              <p className="text-sm font-bold text-slate-700">No employment history added yet</p>
              <p className="text-xs text-slate-400 font-medium mt-1 max-w-xs mx-auto">
                Add your previous work experience to make your profile stronger.
              </p>
              <button
                onClick={openAddForm}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Previous Employment
              </button>
            </div>
          )}

          {/* ---- Employment history list ---- */}
          {history.length > 0 && (
            <div className="space-y-3">
              {history.map((entry, idx) => (
                <div
                  key={entry.employmentHistoryId ?? `tmp-${idx}`}
                  className="border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 hover:border-orange-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-800 truncate">
                          {entry.companyName || 'Unknown Company'}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold truncate">
                          {entry.designation || 'Designation not set'}
                          {entry.department ? ` · ${entry.department}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {entry.isCurrentJob && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                          <BadgeCheck className="w-3 h-3" /> Current
                        </span>
                      )}
                      <button
                        onClick={() => openEditForm(entry)}
                        aria-label="Edit employment history"
                        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(entry)}
                        aria-label="Delete employment history"
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {entry.industryTypeName && (
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px] text-slate-600 font-medium truncate">{entry.industryTypeName}</span>
                      </div>
                    )}
                    {entry.jobTypeName && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px] text-slate-600 font-medium truncate">{entry.jobTypeName}</span>
                      </div>
                    )}
                    {entry.jobLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px] text-slate-600 font-medium truncate">{entry.jobLocation}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] text-slate-600 font-medium truncate">
                        {formatDisplayDate(entry.startDate)}
                        {entry.isCurrentJob ? ' — Present' : entry.endDate ? ` — ${formatDisplayDate(entry.endDate)}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Success popup with server response message */}
      {successPopup && (
        <Modal isOpen={!!successPopup} onClose={() => setSuccessPopup(null)} title={successPopup.title} maxWidthClass="max-w-sm">
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <BadgeCheck className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{successPopup.message}</p>
            <button
              onClick={() => setSuccessPopup(null)}
              className="mt-2 px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
            >
              OK
            </button>
          </div>
        </Modal>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Employment History"
        message={`Are you sure you want to delete the employment record for "${deleteTarget?.companyName || 'this company'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Error toast */}
      {toastMsg && (
        <Toast
          message={toastMsg}
          type={toastType}
          onClose={() => setToastMsg('')}
        />
      )}
    </div>
  );
};