/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useNavigate, Link } from 'react-router-dom';
import { logout, updateHandlerPermissions } from '../store/authSlice';
import { useTranslation } from 'react-i18next';
import {
  useGetDashboardStatsQuery
} from '../services/dashboardApi';
import {
  useGetJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation
} from '../services/jobApi';
import {
  useGetCompaniesQuery,
  useGetCompanyByIdQuery,
  useUpdateCompanyMutation
} from '../services/companyApi';
import {
  useGetCandidatesQuery,
  useGetCandidateByIdQuery,
  useUpdateCandidateMutation,
  useGetApplicationsQuery,
  useApplyToJobMutation,
  useUpdateApplicationStatusMutation
} from '../services/candidateApi';
import {
  useGetHandlersQuery,
  useUpdateHandlerPermissionsMutation
} from '../services/handlerApi';
import {
  useGetTrainingsQuery,
  useCreateTrainingMutation,
  useGetSHGProfilesQuery,
  useGetSHGByIdQuery,
  useUpdateSHGProfileMutation
} from '../services/trainingApi';
import { useGetLocationsQuery, useGetJobCategoriesQuery } from '../services/masterApi';
import { useGetReportsQuery } from '../services/reportApi';

import {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  IconButton
} from '../components/ui/Buttons';
import { TextBox, TextArea } from '../components/ui/Inputs';
import { Checkbox, ToggleSwitch, Dropdown } from '../components/ui/SelectionControls';
import {
  DataTable,
  StatisticCard,
  Card,
  Badge,
  Timeline,
  EmptyState
} from '../components/ui/DataComponents';
import { Loader, Alert, Toast, Modal } from '../components/ui/FeedbackComponents';
import { PermissionGuard } from '../components/ui/UtilityComponents';
import { User, UserRole, Job, JobApplication, SHGProfile, CompanyProfile, CandidateProfile, Training } from '../types';
import {
  LogOut,
  UserCheck,
  Briefcase,
  Layers,
  CheckCircle,
  FileText,
  UserX,
  FilePlus,
  Compass,
  Settings,
  X,
  Calendar,
  Sparkles,
  ShoppingBag,
  Award
} from 'lucide-react';
import { MockDb } from '../services/mockDb';

export default function DashboardHub() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 antialiased font-sans">
        <h3 className="text-lg font-bold text-red-600 mb-2">{t('dashboard.unauthorized')}</h3>
        <Link to="/login" className="px-5 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm">
          मराठी/EN लॉगिन
        </Link>
      </div>
    );
  }

  const [toastMsg, setToastMsg] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Multi-state for modals
  const [showJobModal, setShowJobModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [targetApplicationId, setTargetApplicationId] = useState('');
  const [interviewDate, setInterviewDate] = useState('');

  // Dropdown states
  const { data: locations = [] } = useGetLocationsQuery();
  const { data: jobCategories = [] } = useGetJobCategoriesQuery();

  // API hooks for triggers
  const { refetch: refetchStats } = useGetDashboardStatsQuery();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased font-sans">
      {/* Dynamic Dashboard Navbar */}
      <nav className="bg-blue-950 text-white border-b border-blue-900/40 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white text-base">
              श्री
            </Link>
            <div className="text-left">
              <span className="font-extrabold text-xs tracking-tight block">श्री स्वामी समर्थ सेवा मार्ग</span>
              <span className="text-[10px] text-orange-400 block font-bold uppercase tracking-wide">
                डॅशबोर्ड / {user.role === UserRole.CANDIDATE ? 'CANDIDATE' : user.role === UserRole.COMPANY ? 'EMPLOYER' : user.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black">{user.name}</p>
              <p className="text-[9px] text-slate-350">{user.email}</p>
            </div>
            <button
              onClick={() => {
                dispatch(logout());
                navigate('/');
              }}
              className="p-1 px-3 border border-blue-900 bg-blue-1000 font-bold hover:bg-orange-600 rounded-xl text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> {t('nav.logout')}
            </button>
          </div>
        </div>
      </nav>

      {/* Primary Layout and Shell wrapper */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full text-slate-800">
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-150 pb-5">
          <div className="text-left">
            <h2 className="text-xl sm:text-2xl font-black text-blue-950">
              {t('dashboard.welcome')}, {user.name}!
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              प.पू. गुरुमाऊलींच्या प्रेरणेने स्वयंरोजगार आणि स्वावलंबनात आपले स्वागत आहे.
            </p>
          </div>
          <div className="inline-block px-3 py-1 bg-white border border-gray-100 rounded-xl shadow-xs text-xs font-bold text-orange-600">
            {t('auth.fullName')}: {user.name} ({user.role})
          </div>
        </div>

        {/* -------------------- 1. SUPER ADMIN / ADMIN BOARD -------------------- */}
        {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4.5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap text-left shrink-0 w-full transition-all flex items-center gap-2 ${
                  activeTab === 'overview' ? 'bg-orange-600 text-white shadow-xs' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
                }`}
              >
                <Layers className="w-4 h-4" /> {t('dashboard.overview')}
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4.5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap text-left shrink-0 w-full transition-all flex items-center gap-2 ${
                  activeTab === 'users' ? 'bg-orange-600 text-white shadow-xs' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
                }`}
              >
                <UserCheck className="w-4 h-4" /> सदस्य आणि हक्क (RBAC)
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-4.5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap text-left shrink-0 w-full transition-all flex items-center gap-2 ${
                  activeTab === 'jobs' ? 'bg-orange-600 text-white shadow-xs' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
                }`}
              >
                <Briefcase className="w-4 h-4" /> नोकऱ्या मान्यता (Jobs)
              </button>
              <button
                onClick={() => setActiveTab('companies')}
                className={`px-4.5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap text-left shrink-0 w-full transition-all flex items-center gap-2 ${
                  activeTab === 'companies' ? 'bg-orange-600 text-white shadow-xs' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
                }`}
              >
                <Settings className="w-4 h-4" /> नियोक्ते मान्यता (Companies)
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4.5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap text-left shrink-0 w-full transition-all flex items-center gap-2 ${
                  activeTab === 'reports' ? 'bg-orange-600 text-white shadow-xs' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" /> अहवाल आणि विदा (Reports)
              </button>
            </div>

            <div className="lg:col-span-9 space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <AdminOverviewTab />
              )}

              {/* Users & RBAC Tab */}
              {activeTab === 'users' && (
                <AdminUsersTab setToastMsg={setToastMsg} />
              )}

              {/* Jobs Approvals Tab */}
              {activeTab === 'jobs' && (
                <AdminJobsApprovalTab setToastMsg={setToastMsg} />
              )}

              {/* Companies Approval Tab */}
              {activeTab === 'companies' && (
                <AdminCompaniesApprovalTab setToastMsg={setToastMsg} />
              )}

              {/* Reports Dashboard Tab */}
              {activeTab === 'reports' && (
                <AdminReportsTab />
              )}
            </div>
          </div>
        )}

        {/* -------------------- 2. HANDLER STAFF DASHBOARD (Dynamic Privileges) -------------------- */}
        {user.role === UserRole.HANDLER && (
          <div className="space-y-8 text-left">
            <div className="bg-blue-50 border border-blue-100 p-4.5 rounded-2xl">
              <h3 className="text-sm font-bold text-blue-900 mb-1">
                {t('dashboard.handlerTitle')} – dynamic system staff privileges enabled:
              </h3>
              <div className="flex flex-wrap gap-2.5 mt-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${user.handlerPermissions?.canApproveJobs ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 line-through border-red-100'}`}>
                  नोकरी मान्यता
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${user.handlerPermissions?.canManageCompanies ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 line-through border-red-100'}`}>
                  नियोक्ते संपादन
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${user.handlerPermissions?.canManageSHG ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 line-through border-red-100'}`}>
                  बचत गट नियंत्रण
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${user.handlerPermissions?.canViewUsers ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 line-through border-red-100'}`}>
                  वापरकर्ते दर्शक
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${user.handlerPermissions?.canViewReports ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 line-through border-red-100'}`}>
                  अहवाल विदा
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4.5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap text-left shrink-0 w-full transition-all ${
                    activeTab === 'overview' ? 'bg-orange-600 text-white shadow-xs' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
                  }`}
                >
                  आढावा / Overview
                </button>
                {user.handlerPermissions?.canApproveJobs && (
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className={`px-4.5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap text-left shrink-0 w-full transition-all ${
                      activeTab === 'jobs' ? 'bg-orange-600 text-white shadow-xs' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
                    }`}
                  >
                    नोकऱ्या मान्यता / Jobs Validation
                  </button>
                )}
                {user.handlerPermissions?.canManageCompanies && (
                  <button
                    onClick={() => setActiveTab('companies')}
                    className={`px-4.5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap text-left shrink-0 w-full transition-all ${
                      activeTab === 'companies' ? 'bg-orange-600 text-white shadow-xs' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
                    }`}
                  >
                    नियोक्ते फेरबदल / Companies
                  </button>
                )}
                {user.handlerPermissions?.canManageSHG && (
                  <button
                    onClick={() => setActiveTab('shg')}
                    className={`px-4.5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap text-left shrink-0 w-full transition-all ${
                      activeTab === 'shg' ? 'bg-orange-600 text-white shadow-xs' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
                    }`}
                  >
                    बचतगट सक्षमीकरण / SHGs Info
                  </button>
                )}
                {user.handlerPermissions?.canViewReports && (
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-4.5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap text-left shrink-0 w-full transition-all ${
                      activeTab === 'reports' ? 'bg-orange-600 text-white shadow-xs' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
                    }`}
                  >
                    अहवाल अहवाल / Reports Summary
                  </button>
                )}
              </div>

              <div className="lg:col-span-9 space-y-6">
                {activeTab === 'overview' && (
                  <AdminOverviewTab />
                )}

                {activeTab === 'jobs' && (
                  <PermissionGuard permission="canApproveJobs">
                    <AdminJobsApprovalTab setToastMsg={setToastMsg} />
                  </PermissionGuard>
                )}

                {activeTab === 'companies' && (
                  <PermissionGuard permission="canManageCompanies">
                    <AdminCompaniesApprovalTab setToastMsg={setToastMsg} />
                  </PermissionGuard>
                )}

                {activeTab === 'shg' && (
                  <PermissionGuard permission="canManageSHG">
                    <HandlerSHGTab setToastMsg={setToastMsg} />
                  </PermissionGuard>
                )}

                {activeTab === 'reports' && (
                  <PermissionGuard permission="canViewReports">
                    <AdminReportsTab />
                  </PermissionGuard>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -------------------- 3. RECRUITER / COMPANY EMPLOYER DASHBOARD -------------------- */}
        {user.role === UserRole.COMPANY && (
          <CompanyEmployerDashboard companyId={user.companyId || ''} setToastMsg={setToastMsg} />
        )}

        {/* -------------------- 4. CANDIDATE / JOB SEEKER PORTAL -------------------- */}
        {user.role === UserRole.CANDIDATE && (
          <CandidateSeekerDashboard candidateId={user.candidateId || ''} setToastMsg={setToastMsg} />
        )}

        {/* -------------------- 5. SHG SELF EMPLOYMENT BOARD -------------------- */}
        {user.role === UserRole.SHG && (
          <SHGGroupDashboard shgId={user.shgId || ''} setToastMsg={setToastMsg} />
        )}
      </main>

      {/* Floating toast notify systems */}
      {toastMsg && (
        <Toast message={toastMsg} type="success" onClose={() => setToastMsg('')} />
      )}
    </div>
  );
}

// ==========================================
// SUB-TAB VIEWS: 1. ADMINS OVERVIEW METRICS
// ==========================================
function AdminOverviewTab() {
  const { data: stats, isLoading } = useGetDashboardStatsQuery();
  const { t } = useTranslation();

  if (isLoading || !stats) return <Loader />;

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatisticCard title={t('stats.candidates')} value={stats.totalCandidates} trend="+12 This Week" />
        <StatisticCard title={t('stats.jobs')} value={stats.totalJobs} trend="Active posts" />
        <StatisticCard title={t('stats.companies')} value={stats.totalCompanies} trend="Verified recruiter" />
        <StatisticCard title={t('stats.shgs')} value={stats.totalSHGs} trend="Self-employment" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Recent timeline audit stream */}
        <Card title="अद्ययावत हालचाली / Recent System Activity">
          <Timeline items={stats.recentActivities.map(act => ({
            title: act.user,
            desc: act.action,
            time: act.time,
            isLatest: true
          }))} />
        </Card>

        {/* Informative system logs */}
        <div className="bg-linear-to-tr from-orange-400 to-amber-500 rounded-2xl p-6 text-white text-left space-y-4 shadow-sm border border-orange-200">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">🙏</div>
          <h3 className="font-extrabold text-base">दिंडोरी प्रणित स्वयंरोजगार यंत्रणा</h3>
          <p className="text-xs leading-relaxed opacity-95">
            प्रशासक आणि लायसन (लायजन) कर्मचारी म्हणून, आपले लक्ष महिला बचत गट बाजारांना जोडून देण्यावर आणि ग्रामीण उमेदवारांना योग्य काम मिळवून देण्यावर केंद्रित असले पाहिजे. प्रत्येक उमेदवाराच्या बायोडाटाची अचूक पडताळणी करा.
          </p>
          <div className="pt-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-black/10 px-3 py-1.5 rounded-lg border border-white/20">
              Swami Seva Department v1.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ACTION CONTROL PANEL: 2. MANAGING USERS AND DYNAMIC HANDLER PERMISSIONS (RBAC)
// ==========================================
function AdminUsersTab({ setToastMsg }: { setToastMsg: (msg: string) => void }) {
  const dispatch = useDispatch();
  const { data: users = [], refetch } = useGetHandlersQuery(); // using handlers as users demo data
  const [editingHandlerId, setEditingHandlerId] = useState('');
  
  // Handler Permissions temporary state
  const [perms, setPerms] = useState({
    canViewUsers: true,
    canEditUsers: false,
    canApproveJobs: true,
    canManageCompanies: false,
    canManageSHG: true,
    canViewReports: true,
    canManageContent: false
  });

  const [updatePermissions] = useUpdateHandlerPermissionsMutation();

  const handleOpenEdit = (userItem: User) => {
    setEditingHandlerId(userItem.id);
    if (userItem.handlerPermissions) {
      setPerms(userItem.handlerPermissions);
    }
  };

  const handleSavePerms = async () => {
    try {
      await updatePermissions({ id: editingHandlerId, permissions: perms }).unwrap();
      
      // Also update local redux state if currently logged in user is editing themselves
      if (editingHandlerId === 'u-5') {
        dispatch(updateHandlerPermissions(perms));
      }

      setToastMsg('हक्क अद्ययावत केले / Dynamic Handler Permissions updated!');
      setEditingHandlerId('');
      refetch();
    } catch (e) {
      setToastMsg('Failed to update flags');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <Card title="लायजन मदतनीस नियंत्रण व हक्क नियुक्ती / Liaisons Dynamic Privileges RBAC">
        <p className="text-xs text-gray-550 leading-relaxed mb-4 font-semibold">
          मुख्य प्रशासक म्हणून तुम्ही प्रत्येक मदतनीस (Handler) चे हक्क गतिमान पद्धतीने (dynamically) मर्यादित किंवा खुले करू शकता. त्यानुसार त्यांची कार्यकक्षा बदलते.
        </p>

        {users.length === 0 ? (
          <EmptyState title="No Handlers Listed" desc="Register a handler user first." />
        ) : (
          <div className="space-y-4">
            {users.map((handler) => (
              <div key={handler.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-850 flex items-center gap-1.5">
                    👤 {handler.name} <Badge type="secondary">HANDLER STATUS</Badge>
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold">{handler.email} | {handler.phone}</p>
                </div>
                <div>
                  <button
                    onClick={() => handleOpenEdit(handler)}
                    className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    हक्क बदला / Modify RBAC
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Permissions editing subcard */}
      {editingHandlerId && (
        <Card title="मदतनीस हक्क संपादन / Configure Dynamic Privileges">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToggleSwitch
              label="वापरकर्ते पाहू शकतात (Can View Users)"
              checked={perms.canViewUsers}
              onToggle={(v) => setPerms({ ...perms, canViewUsers: v })}
            />
            <ToggleSwitch
              label="वापरकर्ते बदलू शकतात (Can Edit Users)"
              checked={perms.canEditUsers}
              onToggle={(v) => setPerms({ ...perms, canEditUsers: v })}
            />
            <ToggleSwitch
              label="नोकऱ्या मान्य करू शकतात (Can Approve Jobs)"
              checked={perms.canApproveJobs}
              onToggle={(v) => setPerms({ ...perms, canApproveJobs: v })}
            />
            <ToggleSwitch
              label="नियोक्ते संपादन हक्क (Can Manage Companies)"
              checked={perms.canManageCompanies}
              onToggle={(v) => setPerms({ ...perms, canManageCompanies: v })}
            />
            <ToggleSwitch
              label="बचत गट पडताळणी (Can Manage SHG)"
              checked={perms.canManageSHG}
              onToggle={(v) => setPerms({ ...perms, canManageSHG: v })}
            />
            <ToggleSwitch
              label="अहवाल पाहू शकतात (Can View Reports)"
              checked={perms.canViewReports}
              onToggle={(v) => setPerms({ ...perms, canViewReports: v })}
            />
          </div>

          <div className="flex items-center gap-2 justify-end mt-6 border-t border-slate-100 pt-4">
            <SecondaryButton onClick={() => setEditingHandlerId('')}>
              रद्द करा / Close
            </SecondaryButton>
            <PrimaryButton onClick={handleSavePerms}>
              बदल जतन करा / Save RBAC Rules
            </PrimaryButton>
          </div>
        </Card>
      )}
    </div>
  );
}

// ==========================================
// COMPONENT LIST: 3. JOBS APPROVAL GRID
// ==========================================
function AdminJobsApprovalTab({ setToastMsg }: { setToastMsg: (msg: string) => void }) {
  const { data: jobs = [], refetch } = useGetJobsQuery();
  const [updateJob] = useUpdateJobMutation();
  const [deleteJob] = useDeleteJobMutation();

  const handleApprove = async (jobId: string) => {
    try {
      await updateJob({ id: jobId, isApproved: true }).unwrap();
      setToastMsg('नोकरी मंजूर केली / Job listing approved and published!');
      refetch();
    } catch (_) {
      setToastMsg('Failed to approve vacancy.');
    }
  };

  const handleDelete = async (jobId: string) => {
    try {
      await deleteJob(jobId).unwrap();
      setToastMsg('नोकरी काढून टाकली / Listing deleted successfully!');
      refetch();
    } catch (_) {
      setToastMsg('Deletions failed');
    }
  };

  return (
    <Card title="नोकऱ्या मान्यता आणि तपासणी / Recruiter Vacancies Approval Desk">
      <p className="text-xs text-slate-550 mb-6 font-semibold">
        कंपन्यांनी / नियोक्त्यांनी टाकलेल्या जाहिरातींची पडताळणी करा आणि उमेदवारांना दिसण्यासाठी मंजूर करा.
      </p>

      {jobs.length === 0 ? (
        <EmptyState title="No vacancies listed" desc="Vacancies submitted by employers appear here." />
      ) : (
        <div className="space-y-4 text-left">
          {jobs.map((job) => (
            <div key={job.id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-blue-950">{job.title}</h4>
                  {job.isApproved ? (
                    <Badge type="success">PUBLISHED</Badge>
                  ) : (
                    <Badge type="warning">PENDING APPROVAL</Badge>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-600 block">{job.companyName} | {job.location}</p>
                <p className="text-xs text-slate-500 font-semibold block leading-relaxed">{job.description}</p>
                <p className="text-[10px] text-orange-600 font-semibold block uppercase">वर्गवारी: {job.category} | वेतन: {job.salary}</p>
              </div>

              <div className="flex items-center gap-2 mt-2 md:mt-0">
                {!job.isApproved && (
                  <PrimaryButton onClick={() => handleApprove(job.id)} className="px-3.5 py-1.5 text-xs font-bold">
                    मंजूर करा / Approve
                  </PrimaryButton>
                )}
                <DangerButton onClick={() => handleDelete(job.id)} className="px-3.5 py-1.5 text-xs font-bold bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-700">
                  काढून टाका / Delete
                </DangerButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ==========================================
// COMPONENT LIST: 4. COMPANIES APPROVAL GRID
// ==========================================
function AdminCompaniesApprovalTab({ setToastMsg }: { setToastMsg: (msg: string) => void }) {
  const { data: companies = [], refetch } = useGetCompaniesQuery();
  const [updateCompany] = useUpdateCompanyMutation();

  const handleApproveComp = async (compId: string) => {
    try {
      await updateCompany({ id: compId, isApproved: true }).unwrap();
      setToastMsg('कंपनी मंजूर केली / Recruiter company profile approved!');
      refetch();
    } catch (_) {
      setToastMsg('Failed company edit approval.');
    }
  };

  return (
    <Card title="नियोक्ते व उद्योग पडताळणी / Recruiters Verification Suite">
      <p className="text-xs text-slate-550 mb-6 font-semibold">
        उद्योगपती व नियोक्त्यांनी नोंदणी केल्यावर त्यांच्या प्रोफाइलची कसून तपासणी करून अप्रूव्ह करा.
      </p>

      {companies.length === 0 ? (
        <EmptyState title="No Corporate Listings" desc="Awaiting employer signups." />
      ) : (
        <div className="space-y-4 text-left">
          {companies.map((comp) => (
            <div key={comp.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-800">{comp.companyName}</h4>
                  {comp.isApproved ? (
                    <Badge type="success">APPROVED RECRUITER</Badge>
                  ) : (
                    <Badge type="warning">AWAITING REVIEW</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-600 block leading-normal">
                  प्रतिनिधी: {comp.contactPerson} | उद्योग: {comp.industry}
                </p>
                <p className="text-xs text-slate-500 font-semibold block leading-none">
                  संपर्क: {comp.email} | {comp.phone} | पत्ता: {comp.address}
                </p>
              </div>

              <div>
                {!comp.isApproved && (
                  <PrimaryButton onClick={() => handleApproveComp(comp.id)} className="px-3.5 py-1.5 text-xs font-bold font-sans">
                    मान्यता द्या / Verify & Approve
                  </PrimaryButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ==========================================
// SUB-TAB VIEW: 5. ANALYTICAL REPORTS
// ==========================================
function AdminReportsTab() {
  const { data: reports, isLoading } = useGetReportsQuery();

  if (isLoading || !reports) return <Loader />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left font-sans">
      <Card title="अर्जदारांची स्थिती / Applications Workflow Status Distribution">
        <p className="text-[11px] text-gray-500 mb-4 font-semibold">
          एकूण अर्जांची विविध टप्प्यांनुसार झालेली विभागणी खालीलप्रमाणे आहे.
        </p>

        {reports.applicationsByStatus.length === 0 ? (
          <EmptyState title="No Applications Logs" desc="Stats populates when seekers apply to approved openings." />
        ) : (
          <div className="space-y-3">
            {reports.applicationsByStatus.map((rep) => (
              <div key={rep.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-xs font-extrabold text-blue-900">{rep.name}</span>
                <span className="text-xs font-black bg-blue-100 text-blue-950 px-3 py-1 rounded-md">{rep.count}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="बचतगट सक्षमीकरण आढावा / Self Help Groups Direct Members counts">
        <p className="text-[11px] text-gray-500 mb-4 font-semibold">
          स्वयंरोजगार विभागाशी संलग्न महिला बचत गट आणि त्यांचे कार्यरत सभासद संख्या.
        </p>
        <div className="space-y-3">
          {reports.shgStats.map((shg) => (
            <div key={shg.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-800">{shg.name}</span>
                <span className="text-xs font-bold text-orange-700 bg-orange-150 px-2 rounded-lg">
                  {shg.count} सभासद (Members)
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold leading-relaxed block truncate">
                मुख्य उत्पादने / Activities: {shg.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ==========================================
// SUB-TAB VIEW: 6. HANDLER STAFF - SHGs TAB
// ==========================================
function HandlerSHGTab({ setToastMsg }: { setToastMsg: (msg: string) => void }) {
  const { data: list = [], refetch } = useGetSHGProfilesQuery();

  return (
    <Card title="बचतगट गृहउद्योग पडताळणी / Women SHGs Micro-enterprise verification">
      <p className="text-xs text-slate-500 mb-6 font-semibold">
        लायजन / मदतनीस म्हणून तुम्ही महिला बचत गटांच्या हस्तकला आणि गृहउद्योग उत्पादनांना बाजाराशी जोडून देऊ शकता.
      </p>

      <div className="space-y-4 text-left">
        {list.map((shg) => (
          <div key={shg.id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl relative">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5 leading-none">
                🌾 {shg.shgName} ({shg.memberCount} सभासद)
              </h4>
              <p className="text-xs font-semibold text-slate-600 block">
                गटप्रमुख: {shg.leaderName} | जिल्हा: {shg.district} | फोन: {shg.phone}
              </p>
              {shg.activities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {shg.activities.map((act, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-bold rounded-md">
                      {act}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ==========================================
// INTEGRATED SUB-BOARD: COMPANY RECRUITER / EMPLOYER PORTAL
// ==========================================
function CompanyEmployerDashboard({ companyId, setToastMsg }: { companyId: string; setToastMsg: (msg: string) => void }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('pipeline');

  const { data: locations = [] } = useGetLocationsQuery();
  const { data: jobCategories = [] } = useGetJobCategoriesQuery();

  // Load recruiter profile
  const { data: profile, refetch: refetchProfile } = useGetCompanyByIdQuery(companyId);
  const [updateProfile] = useUpdateCompanyMutation();

  // Load applicants pipelines & jobs
  const { data: pipelineApps = [], refetch: refetchApps } = useGetApplicationsQuery({ companyId });
  const { data: jobsList = [], refetch: refetchJobs } = useGetJobsQuery({ companyId });

  // Job creation forms state
  const [vacancyTitle, setVacancyTitle] = useState('');
  const [vacancyLocation, setVacancyLocation] = useState('Nashik');
  const [vacancySalary, setVacancySalary] = useState('');
  const [vacancyCategory, setVacancyCategory] = useState('Information Technology');
  const [vacancyType, setVacancyType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote'>('Full-time');
  const [vacancyDesc, setVacancyDesc] = useState('');
  const [vacancyReqText, setVacancyReqText] = useState('');

  const [createJob, { isLoading: isPublishing }] = useCreateJobMutation();
  const [updateAppStatus] = useUpdateApplicationStatusMutation();

  // Form edit elements for Recruiter Corporate details
  const [compName, setCompName] = useState('');
  const [compContact, setCompContact] = useState('');
  const [compIndustry, setCompIndustry] = useState('');
  const [compAddress, setCompAddress] = useState('');

  // OTP Interview scheduling state
  const [targetAppId, setTargetAppId] = useState('');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');

  // Prefill corporate edit profile when model load
  React.useEffect(() => {
    if (profile) {
      setCompName(profile.companyName);
      setCompContact(profile.contactPerson);
      setCompIndustry(profile.industry);
      setCompAddress(profile.address);
    }
  }, [profile]);

  const handlePostVacancy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vacancyTitle || !vacancySalary || !vacancyDesc) {
      setToastMsg('Required vacancy data missing.');
      return;
    }

    try {
      await createJob({
        title: vacancyTitle,
        companyId,
        companyName: profile?.companyName || 'Tata Consultancy Services',
        location: vacancyLocation,
        salary: vacancySalary,
        description: vacancyDesc,
        requirements: vacancyReqText.split(',').map(r => r.trim()).filter(Boolean),
        type: vacancyType,
        category: vacancyCategory
      }).unwrap();

      setToastMsg('नोकरी रिक्त जागा जोडली (Pending Admin Validation)!');
      // Reset form fields
      setVacancyTitle('');
      setVacancySalary('');
      setVacancyDesc('');
      setVacancyReqText('');
      refetchJobs();
      setActiveTab('listings');
    } catch (_) {
      setToastMsg('Failed vacancy listing addition.');
    }
  };

  const handleUpdateApplicantStatus = async (appId: string, status: JobApplication['status']) => {
    if (status === 'Interview Scheduled') {
      setTargetAppId(appId);
      setShowInterviewModal(true);
      return;
    }

    try {
      await updateAppStatus({ id: appId, status }).unwrap();
      setToastMsg('अर्जदाराची स्थिती बदलली / Application state updated!');
      refetchApps();
    } catch (_) {
      setToastMsg('Failed pipeline update');
    }
  };

  const handleScheduleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewDate) return;

    try {
      await updateAppStatus({
        id: targetAppId,
        status: 'Interview Scheduled',
        interviewDate
      }).unwrap();

      setToastMsg('मुलाखत नियोजित केली / Interview Scheduled!');
      setShowInterviewModal(false);
      setInterviewDate('');
      refetchApps();
    } catch (_) {
      setToastMsg('Interview schedules failed.');
    }
  };

  const handleSaveCorporateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        id: companyId,
        companyName: compName,
        contactPerson: compContact,
        industry: compIndustry,
        address: compAddress
      }).unwrap();
      setToastMsg('प्रोफाइल जतन केले / Profile updated successfully!');
      refetchProfile();
    } catch (e) {
      setToastMsg('Failed profile save.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left font-sans">
      <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl text-left shrink-0 w-full transition-all flex items-center gap-2 ${
            activeTab === 'pipeline' ? 'bg-orange-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
          }`}
        >
          <Compass className="w-4 h-4" /> अर्ज प्रक्रिया / Pipeline ({pipelineApps.length})
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl text-left shrink-0 w-full transition-all flex items-center gap-2 ${
            activeTab === 'listings' ? 'bg-orange-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
          }`}
        >
          <Briefcase className="w-4 h-4" /> रिक्रूट नोकऱ्या / Vacancies ({jobsList.length})
        </button>
        <button
          onClick={() => setActiveTab('post')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl text-left shrink-0 w-full transition-all flex items-center gap-2 ${
            activeTab === 'post' ? 'bg-orange-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
          }`}
        >
          <FilePlus className="w-4 h-4" /> नवीन नोकरी जोडा / Post Job
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl text-left shrink-0 w-full transition-all flex items-center gap-2 ${
            activeTab === 'profile' ? 'bg-orange-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
          }`}
        >
          <Settings className="w-4 h-4" /> कंपनी प्रोफाइल / Profile Settings
        </button>
      </div>

      <div className="lg:col-span-9 space-y-6">
        {/* Verification Alert status banner if unapproved recruiter */}
        {profile && !profile.isApproved && (
          <Alert
            type="warning"
            title="पडताळणी प्रलंबित आहे (Review Pending)"
            message="Your employer recruiter profile verification is actively pending review by Shri Swami Samarth self-employment staff handlers. Once verified, your posted vacancies will instantly receive high-priority visibility!"
          />
        )}

        {/* 1. Job application Pipelines tab */}
        {activeTab === 'pipeline' && (
          <Card title="उमेदवारांचे अर्ज प्रक्रिया / Applicant Pipeline Tracking">
            {pipelineApps.length === 0 ? (
              <EmptyState title="No Applicants Found" desc="Vacancies you post will gather seekers applied pipelines here." />
            ) : (
              <div className="space-y-4">
                {pipelineApps.map((app) => (
                  <div key={app.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/50 pb-2.5">
                      <div className="space-y-1">
                        <span className="text-xs text-orange-600 font-extrabold uppercase tracking-wide">
                          अर्जदार: {app.candidateName}
                        </span>
                        <h4 className="text-sm font-bold text-blue-950">{app.jobTitle}</h4>
                        <p className="text-[10px] text-gray-500 font-semibold block leading-none">
                          मोबाईल: {app.candidatePhone} | अर्ज दिनांक: {app.appliedAt}
                        </p>
                      </div>

                      <div>
                        {app.status === 'Interview Scheduled' ? (
                          <Badge type="secondary">
                            🗓️ INTERVIEW: {app.interviewDate}
                          </Badge>
                        ) : app.status === 'Hired' ? (
                          <Badge type="success">✓ HIRED & ACTIVE</Badge>
                        ) : app.status === 'Rejected' ? (
                          <Badge type="danger">REJECTED</Badge>
                        ) : (
                          <Badge type="warning">{app.status}</Badge>
                        )}
                      </div>
                    </div>

                    {/* Interactive Action controllers */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <button
                        onClick={() => handleUpdateApplicantStatus(app.id, 'Reviewing')}
                        className="px-2.5 py-1 bg-white hover:bg-gray-150 border border-slate-200 text-slate-800 text-[10px] font-bold rounded-lg transition-all"
                      >
                        तपासा / Reviewing
                      </button>
                      <button
                        onClick={() => handleUpdateApplicantStatus(app.id, 'Interview Scheduled')}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-[10px] font-bold rounded-lg transition-all"
                      >
                        मुलाखत / Schedule Interview
                      </button>
                      <button
                        onClick={() => handleUpdateApplicantStatus(app.id, 'Hired')}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg transition-all"
                      >
                        कामावर ठेवा / Hire Selected
                      </button>
                      <button
                        onClick={() => handleUpdateApplicantStatus(app.id, 'Rejected')}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[10px] font-bold rounded-lg transition-all"
                      >
                        नाकारले / Reject Candidate
                      </button>

                      {/* Resume download mock button */}
                      <button
                        onClick={() => setToastMsg('Mock Resume Download complete! (Rahul_Resume.pdf)')}
                        className="ml-auto flex items-center gap-1 px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-850 text-[10px] font-bold rounded-lg cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> CV / Resume
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* 2. Job Listings tab */}
        {activeTab === 'listings' && (
          <Card title="तुमच्या कंपनीने टाकलेल्या जाहिराती / Corporate Listed Vacancies">
            {jobsList.length === 0 ? (
              <EmptyState title="No Vacancies Posted" desc="Use 'Post Job' tab option to announce corporate roles." />
            ) : (
              <div className="space-y-4 animate-fade-in text-left">
                {jobsList.map((job) => (
                  <div key={job.id} className="p-4.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800 leading-none">{job.title}</h4>
                        {job.isApproved ? (
                          <Badge type="success">✓ RUNNING</Badge>
                        ) : (
                          <Badge type="warning">⏳ PENDING APPROVAL</Badge>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-600 block">{job.location} | {job.type} | {job.salary}</p>
                      <p className="text-xs text-slate-500 leading-relaxed block">{job.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* 3. Job creation Post vacancy Form tab */}
        {activeTab === 'post' && (
          <Card title="नवीन जाहिरात जोडा / Invite Talented Candidates">
            <form onSubmit={handlePostVacancy} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextBox
                  label="नोकरीचे नाव / Vacancy Title"
                  placeholder="e.g. Sales Executive / Web Engineer"
                  value={vacancyTitle}
                  onChange={(e) => setVacancyTitle(e.target.value)}
                  required
                />
                <TextBox
                  label="वेतनश्रेणी / Salary Package range"
                  placeholder="E.g. ₹१,६०,००० - ₹२,४०,००० सालाना"
                  value={vacancySalary}
                  onChange={(e) => setVacancySalary(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Dropdown
                  label="नोकरीचे ठिकाण / Location"
                  options={locations.map(l => ({ value: l.value, label: `${l.labelMr} / ${l.labelEn}` }))}
                  value={vacancyLocation}
                  onChange={(e) => setVacancyLocation(e.target.value)}
                />
                <Dropdown
                  label="श्रेणी / Category"
                  options={jobCategories.map(c => ({ value: c.value, label: `${c.labelMr} / ${c.labelEn}` }))}
                  value={vacancyCategory}
                  onChange={(e) => setVacancyCategory(e.target.value)}
                />
                <Dropdown
                  label="प्रकार / Job Type"
                  options={[
                    { value: 'Full-time', label: 'Full-time' },
                    { value: 'Part-time', label: 'Part-time' },
                    { value: 'Contract', label: 'Contract' },
                    { value: 'Remote', label: 'Remote' }
                  ]}
                  value={vacancyType}
                  onChange={(e) => setVacancyType(e.target.value as any)}
                />
              </div>

              <TextBox
                label="आवश्यक कौशल्ये (स्वल्पविराम द्या) / Requirements (separated by, comma)"
                placeholder="E.g. Sales, React coding, Driver License"
                value={vacancyReqText}
                onChange={(e) => setVacancyReqText(e.target.value)}
              />

              <TextArea
                label="नोकरीचे सविस्तर वर्णन / Role Job Description (J.D)"
                placeholder="Announce general duties, shifts, responsibilities..."
                value={vacancyDesc}
                onChange={(e) => setVacancyDesc(e.target.value)}
                required
              />

              <div className="flex justify-end pt-3">
                <PrimaryButton type="submit" loading={isPublishing}>
                  प्रसिद्धीसाठी पाठवा / Save & Submit Vacancy
                </PrimaryButton>
              </div>
            </form>
          </Card>
        )}

        {/* 4. Recruiter Settings Profile card updater */}
        {activeTab === 'profile' && (
          <Card title="नियोक्ता माहिती संपादन / Employer Profile Settings">
            <form onSubmit={handleSaveCorporateProfile} className="space-y-5">
              <TextBox
                label="कंपनीचे नाव / Standard Enterprise Name"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextBox
                  label="संपर्क व्यक्ती / Liaison Name (Contact Person)"
                  value={compContact}
                  onChange={(e) => setCompContact(e.target.value)}
                  required
                />
                <TextBox
                  label="उद्योग उद्योग प्रकार / Business Industry Core Sector"
                  value={compIndustry}
                  onChange={(e) => setCompIndustry(e.target.value)}
                  required
                />
              </div>

              <TextArea
                label="पत्ता / Corporate Head Office Address"
                value={compAddress}
                onChange={(e) => setCompAddress(e.target.value)}
                required
              />

              <div className="flex justify-end">
                <PrimaryButton type="submit">
                  {t('dashboard.save')}
                </PrimaryButton>
              </div>
            </form>
          </Card>
        )}
      </div>

      {/* Dynamic Interview scheduling modal popup dialog */}
      <Modal
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        title="मुलाखत नियोजित करा / Coordinate Interview Scheduled"
      >
        <form onSubmit={handleScheduleInterviewSubmit} className="space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed font-semibold">
            Choose a suitable date and coordinates timing setup. An automated notification will sync to the applicant tracking panel.
          </p>

          <TextBox
            label="मुलाखत दिनांक / Interview date and Clock timings"
            type="datetime-local"
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2.5 pt-4">
            <SecondaryButton onClick={() => setShowInterviewModal(false)}>
              बंद करा / Cancel
            </SecondaryButton>
            <PrimaryButton type="submit">
              नियोजित करा / Set Interview Date
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ==========================================
// INTEGRATED SUB-BOARD: JOB SEEKER / CANDIDATE PORTAL
// ==========================================
function CandidateSeekerDashboard({ candidateId, setToastMsg }: { candidateId: string; setToastMsg: (msg: string) => void }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('search');

  // Load seeker profile
  const { data: profile, refetch: refetchProfile } = useGetCandidateByIdQuery(candidateId);
  const [updateProfile] = useUpdateCandidateMutation();

  // Load jobs lists (Approved only!)
  const { data: availableJobs = [], refetch: refetchJobs } = useGetJobsQuery({ approvedOnly: true });
  // Load applications history tracking
  const { data: myApps = [], refetch: refetchMyApps } = useGetApplicationsQuery({ candidateId });

  // Load options metadata
  const { data: locations = [] } = useGetLocationsQuery();

  // Profile data forms state
  const [fullName, setFullName] = useState('');
  const [seekerCity, setSeekerCity] = useState('Nashik');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState(0);
  const [skillsText, setSkillsText] = useState('');
  const [resumeName, setResumeName] = useState('');

  // Search parameters filter state
  const [searchPhrase, setSearchPhrase] = useState('');

  const [applyToJob, { isLoading: isApplying }] = useApplyToJobMutation();

  // Prefill candidate on data load
  React.useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setSeekerCity(profile.city);
      setQualification(profile.qualification);
      setExperience(profile.experienceYears);
      setSkillsText(profile.skills.join(', '));
      setResumeName(profile.resumeName || '');
    }
  }, [profile]);

  const handleApplyNow = async (job: Job) => {
    try {
      await applyToJob({
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        companyId: job.companyId,
        candidateId,
        candidateName: fullName || 'Rahul Ramesh Patil',
        candidatePhone: profile?.phone || '8887776660'
      }).unwrap();

      setToastMsg('अर्ज यशस्वीरीत्या सादर केला! / Applied to role successfully!');
      refetchMyApps();
    } catch (err: any) {
      setToastMsg(err.data || 'Duplicated applications blocked.');
    }
  };

  const handleSaveSeekerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        id: candidateId,
        fullName,
        city: seekerCity,
        qualification,
        experienceYears: Number(experience),
        skills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
        resumeName
      }).unwrap();

      setToastMsg('माहिती अद्ययावत केली / Candidate profile details saved!');
      refetchProfile();
    } catch (_) {
      setToastMsg('Profile updates failed.');
    }
  };

  // Mock Resume upload system
  const handleMockResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeName(file.name);
      setToastMsg(`CV File: "${file.name}" uploaded to draft profile! Click Save.`);
    }
  };

  const filteredJobs = availableJobs.filter((j) => {
    const query = searchPhrase.toLowerCase();
    return (
      j.title.toLowerCase().includes(query) ||
      j.companyName.toLowerCase().includes(query) ||
      j.location.toLowerCase().includes(query) ||
      j.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left font-sans animate-fade-in animate-duration-150">
      <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl text-left shrink-0 w-full transition-all flex items-center gap-2 ${
            activeTab === 'search' ? 'bg-orange-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
          }`}
        >
          🔍 शोध नोकरी / Find Jobs
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl text-left shrink-0 w-full transition-all flex items-center gap-2 ${
            activeTab === 'history' ? 'bg-orange-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
          }`}
        >
          📂 माझे अर्ज / Applied Pipeline Tracker ({myApps.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl text-left shrink-0 w-full transition-all flex items-center gap-2 ${
            activeTab === 'profile' ? 'bg-orange-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
          }`}
        >
          👤 बायोडाटा संपादन / Complete Profile
        </button>
      </div>

      <div className="lg:col-span-9 space-y-6">
        {/* Profile incomplete warning to push CV uploads */}
        {!resumeName && (
          <Alert
            type="info"
            title="बायोडाटा / Resume अपलोड आवश्यक"
            message="Please upload your digital Resume/CV in PDF format under 'Complete Profile' tab to ensure verified recruiters can download and review your competencies!"
          />
        )}

        {/* 1. Job search list tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="bg-white p-4.5 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
              <TextBox
                placeholder="जाहिरात, पात्रता, कंपनी, किंवा ठिकाण शोधा..."
                value={searchPhrase}
                onChange={(e) => setSearchPhrase(e.target.value)}
              />
            </div>

            {filteredJobs.length === 0 ? (
              <EmptyState title="No Jobs listed" desc="Try checking other keywords or categories" />
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => {
                  const alreadyApplied = myApps.some(a => a.jobId === job.id);
                  return (
                    <div key={job.id} className="p-5 bg-white border border-gray-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md/5 transition-all">
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-800">{job.title}</h4>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-100 text-[10px] font-bold rounded-md leading-none">
                            {job.type}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-650 tracking-tight leading-none block">
                          🏢 {job.companyName} | {job.location} | {job.salary}
                        </p>
                        <p className="text-xs text-slate-500 leading-normal block max-w-2xl">{job.description}</p>
                        
                        {job.requirements.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {job.requirements.map((req, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-md">
                                {req}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        {alreadyApplied ? (
                          <span className="px-4 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-100">
                            ✓ अर्ज सादर / Applied
                          </span>
                        ) : (
                          <PrimaryButton onClick={() => handleApplyNow(job)} className="px-4 py-2 text-xs font-bold cursor-pointer">
                            अर्ज करा / Apply Vacancy
                          </PrimaryButton>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. Job history tab */}
        {activeTab === 'history' && (
          <Card title="तुमच्या अर्जांची स्थिती / Your Active Job Applications">
            {myApps.length === 0 ? (
              <EmptyState title="No Applications tracking logs" desc="Go seek and apply on active vacancys listed under Find Jobs." />
            ) : (
              <div className="space-y-4">
                {myApps.map((app) => (
                  <div key={app.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4 text-left">
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-800">{app.jobTitle}</h4>
                      <p className="text-xs text-slate-600 font-bold block leading-none">कंपनी: {app.companyName}</p>
                      <p className="text-[10px] text-gray-500 font-semibold block leading-none">अर्ज तारीख: {app.appliedAt}</p>
                    </div>

                    <div>
                      {app.status === 'Interview Scheduled' ? (
                        <div className="text-right space-y-1">
                          <Badge type="secondary">🗓️ MULTIPHASES ONLINE INTERVIEW</Badge>
                          <span className="block text-[10px] text-blue-900 font-bold font-mono">
                            Date: {app.interviewDate}
                          </span>
                        </div>
                      ) : app.status === 'Hired' ? (
                        <Badge type="success">✓ HIRED & ACTIVE</Badge>
                      ) : app.status === 'Rejected' ? (
                        <Badge type="danger">REJECTED</Badge>
                      ) : (
                        <Badge type="primary">{app.status}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* 3. Seeker Profile settings updater */}
        {activeTab === 'profile' && (
          <Card title="उमेदवाराची सविस्तर माहिती / Candidate Profile Settings">
            <form onSubmit={handleSaveSeekerProfile} className="space-y-5">
              <TextBox
                label="पूर्ण नाव / Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Dropdown
                  label="राहण्याचे शहर / City Location"
                  options={locations.map(l => ({ value: l.value, label: `${l.labelMr} / ${l.labelEn}` }))}
                  value={seekerCity}
                  onChange={(e) => setSeekerCity(e.target.value)}
                />
                <TextBox
                  label="शिक्षण / Highest Academic Degree"
                  value={qualification}
                  placeholder="E.g. B.A., M.B.A., XII pass"
                  onChange={(e) => setQualification(e.target.value)}
                  required
                />
                <TextBox
                  label="एकूण अनुभव वर्षे / Experience (Years)"
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(Number(e.target.value))}
                />
              </div>

              <TextBox
                label="मुख्य कौशल्ये (स्वल्पविराम द्या) / Key Skills"
                value={skillsText}
                placeholder="E.g. Sales, Drivers license, Computer typing, tailoring"
                onChange={(e) => setSkillsText(e.target.value)}
              />

              {/* Real Resume Drag and Drop / select mock upload */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-gray-700">
                  तुमचा बायोडाटा अपलोड करा (पीडीएफ) / Upload Resume (PDF)
                </label>
                <div className="border border-dashed border-gray-200 bg-gray-50/50 rounded-xl p-6 text-center flex flex-col items-center justify-center relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleMockResumeUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <span className="text-xl mb-1">📁</span>
                  <span className="text-xs font-bold text-slate-700">
                    {resumeName ? `✓ Added: "${resumeName}"` : 'Drag CV File here or Click directory browse'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1 block">Supports PDF, DOCX up to 4MB</span>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <PrimaryButton type="submit">
                  {t('dashboard.save')}
                </PrimaryButton>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

// ==========================================
// INTEGRATED SUB-BOARD: SELF HELP GROUPS (SHG) PORTAL
// ==========================================
function SHGGroupDashboard({ shgId, setToastMsg }: { shgId: string; setToastMsg: (msg: string) => void }) {
  const [activeTab, setActiveTab] = useState('trainings');

  // Load trainings list
  const { data: trainings = [] } = useGetTrainingsQuery();

  // Load dynamic SHG state
  const [shgName, setShgName] = useState('Swami Samarth Mahila Gruhudyog');
  const [shgLeader, setShgLeader] = useState('Sunita Vinay Joshi');
  const [memberCount, setMemberCount] = useState(12);
  const [shgDistrict, setShgDistrict] = useState('Nashik');
  
  // Activities array state
  const [activitiesText, setActivitiesText] = useState('Agarbatti packing, turmeric packing');
  
  // Showcase catalogue physical products list
  const [showcase, setShowcase] = useState<{ id: string; name: string; description: string; price: number }[]>([
    {
      id: 'prod-1',
      name: 'अष्टगंध अगरबत्ती (Premium)',
      description: 'सुगंधी द्रव्यांपासून बनवलेली अगरबत्ती',
      price: 150
    }
  ]);

  // Product submission fields
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDesc, setProdDesc] = useState('');

  const [updateSHG] = useUpdateSHGProfileMutation();

  const handleEnrollTraining = (courseTitle: string) => {
    setToastMsg(`प्रशिक्षण नोंदणी यशस्वी: \"${courseTitle}\"! Admissions desk will verify.`);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) return;

    const freshProd = {
      id: `prod-${Date.now()}`,
      name: prodName,
      price: Number(prodPrice),
      description: prodDesc
    };

    const updatedCatalog = [...showcase, freshProd];
    setShowcase(updatedCatalog);

    setToastMsg('उत्पादन कॅटलॉगमध्ये जोडले/ Handicraft Product added to showcase katalog!');
    setProdName('');
    setProdPrice('');
    setProdDesc('');
  };

  const handleSaveSHGDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSHG({
        id: shgId,
        shgName,
        leaderName: shgLeader,
        district: shgDistrict,
        memberCount: Number(memberCount),
        activities: activitiesText.split(',').map(a => a.trim()).filter(Boolean),
        productShowcase: showcase
      }).unwrap();

      setToastMsg('बचतगट माहिती सुरक्षित केली/ SHG details updated securely!');
    } catch (_) {
      setToastMsg('Failed profiles updaters');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left font-sans">
      <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 font-sans">
        <button
          onClick={() => setActiveTab('trainings')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl text-left shrink-0 w-full transition-all flex items-center gap-2 ${
            activeTab === 'trainings' ? 'bg-orange-600 text-white shadow-sm' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
          }`}
        >
          <Award className="w-4 h-4" /> व्यावसायिक प्रशिक्षण / Courses
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl text-left shrink-0 w-full transition-all flex items-center gap-2 ${
            activeTab === 'products' ? 'bg-orange-600 text-white shadow-sm' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> उत्पादन कॅटलॉग / Sell Products
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl text-left shrink-0 w-full transition-all flex items-center gap-2 ${
            activeTab === 'profile' ? 'bg-orange-600 text-white shadow-sm' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
          }`}
        >
          <Settings className="w-4 h-4" /> बचतगट प्रोफाइल / Group Profiles
        </button>
      </div>

      <div className="lg:col-span-9 space-y-6">
        {/* Trainings listed tab */}
        {activeTab === 'trainings' && (
          <Card title="उपलब्ध व्यावसायिक तंत्र शिक्षण वर्ग / Active Vocations Training classes">
            <p className="text-xs text-slate-500 mb-6 font-semibold">
              महिला गृहउद्योगांचे कौशल्य आणि उत्पादन दर्जा वाढवण्यासाठी खालीलपैकी कोणत्याही मोफत सरकारी व सेवा मार्ग पुरस्कृत कोर्सला नाव नोंदवा.
            </p>

            <div className="space-y-4">
              {trainings.map((c) => (
                <div key={c.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2.5 rounded-md leading-normal uppercase">
                      कालावधी: {c.duration}
                    </span>
                    <h4 className="text-sm font-extrabold text-blue-950 mt-1 leading-tight">{c.titleMr}</h4>
                    <p className="text-xs text-slate-550 leading-relaxed font-semibold block">{c.descriptionMr}</p>
                    <p className="text-[10px] text-gray-400 font-bold block uppercase mt-1 leading-none">
                      मार्गदर्शक: {c.instructor} | वर्ग सुनावणी: {c.startDate}
                    </p>
                  </div>
                  <div>
                    <PrimaryButton onClick={() => handleEnrollTraining(c.titleMr)} className="px-4 py-2 text-xs font-semibold shrink-0 cursor-pointer">
                      प्रवेश घ्या / Enroll Course
                    </PrimaryButton>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Product showcase catalog upload tab */}
        {activeTab === 'products' && (
          <div className="space-y-6 text-left">
            <Card title="नवे गृहउद्योग उत्पादन जोडा / Add Craft Item to Showcase catalogue">
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextBox
                    label="उत्पादनाचे नाव / Handicraft Item Name"
                    placeholder="E.g. शुद्ध हळद पावडर / शेवया"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    required
                  />
                  <TextBox
                    label="किंमत (रुपये) / Retail Price (INR)"
                    type="number"
                    placeholder="E.g. १५०"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                  />
                </div>

                <TextArea
                  label="उत्पादन माहिती / Brief Product Description"
                  placeholder="पारंपारिक मसाला किंवा बनवण्याची पद्धत सांगा..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                />

                <div className="flex justify-end">
                  <PrimaryButton type="submit">
                    कॅटलॉगमध्ये सामील करा / Publish Item
                  </PrimaryButton>
                </div>
              </form>
            </Card>

            <Card title="तुमच्या बचतगटाचे चालू बाजार माहिती / Published Catalogue items">
              {showcase.length === 0 ? (
                <EmptyState title="No Products items listed" desc="Add self-employment products above." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {showcase.map((prod) => (
                    <div key={prod.id} className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-1 relative">
                      <span className="absolute top-4 right-4 bg-emerald-600 text-white font-black text-xs px-2.5 py-0.5 rounded-lg leading-normal">
                        ₹{prod.price}
                      </span>
                      <h4 className="text-sm font-extrabold text-emerald-850 truncate max-w-[70%] leading-relaxed">
                        📦 {prod.name}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        {prod.description || 'नैसर्गिक घटकांपासून तयार केलेले दर्जेदार उत्पादन.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Group Profile Settings */}
        {activeTab === 'profile' && (
          <Card title="बचतगट मूळ माहिती संपादन / Self Help Group Info">
            <form onSubmit={handleSaveSHGDetails} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextBox
                  label="बचतगटाचे नाव / SHG Registered Name"
                  value={shgName}
                  onChange={(e) => setShgName(e.target.value)}
                  required
                />
                <TextBox
                  label="गट प्रमुख नाव / Group Leader Name"
                  value={shgLeader}
                  onChange={(e) => setShgLeader(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextBox
                  label="एकूण सभासद संख्या / Total Members Count"
                  type="number"
                  value={memberCount}
                  onChange={(e) => setMemberCount(Number(e.target.value))}
                  required
                />
                <TextBox
                  label="जिल्हा / Location District"
                  value={shgDistrict}
                  onChange={(e) => setShgDistrict(e.target.value)}
                  required
                />
              </div>

              <TextBox
                label="बचतगटाचे व्यावसायिक उपक्रम / Vocation Core Activities (separated by , comma)"
                value={activitiesText}
                onChange={(e) => setActivitiesText(e.target.value)}
              />

              <div className="flex justify-end pt-3">
                <PrimaryButton type="submit">
                  बदला जतन करा / Save Group Info
                </PrimaryButton>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
