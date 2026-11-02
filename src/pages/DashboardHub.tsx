/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { logout } from '../store/authSlice';
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
import { useSearchJobsQuery } from '../hooks/useJobQueries';
import {
  useGetCompaniesQuery,
  useUpdateCompanyMutation
} from '../services/companyApi';
import {
  useGetCandidatesQuery,
  useUpdateCandidateMutation,
  useGetApplicationsQuery,
  useApplyToJobMutation
} from '../services/candidateApi';
import { useGetMyJobApplicationsQuery, useGetMyRequirementsQuery, useGetApplicationStatusListQuery, updateJobApplicationStatus, UpdateApplicationStatusPayload, updateCompanyProfile } from '../services/employerApi';
import { setApplicationStatusOverride, getApplicationStatusOverride, subscribeApplicationStatusOverrides } from '../services/applicationStatusStore';
import { useGetMyProfileQuery, uploadProfilePic, bustProfileImageCache } from '../services/profileApi';
import {
  useGetTrainingsQuery,
  useCreateTrainingMutation,
  useGetSHGProfilesQuery,
  useGetSHGByIdQuery,
  useUpdateSHGProfileMutation
} from '../services/trainingApi';
import {
  useGetLocationsQuery,
  useGetJobCategoriesQuery,
  useGetCountriesQuery,
  useGetStatesQuery,
  useGetDistrictsQuery,
  useGetTalukasQuery,
  useGetSevaKendrasQuery,
  useGetEducationsListQuery,
  useGetSubEducationsListQuery,
  getLocalizedName
} from '../services/masterApi';
import { useGetReportsQuery } from '../services/reportApi';
import {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  IconButton
} from '../components/ui/Buttons';
import { TextBox, TextArea } from '../components/ui/Inputs';
import { Checkbox, Dropdown } from '../components/ui/SelectionControls';
import {
  DataTable,
  StatisticCard,
  Card,
  Badge,
  EmptyState
} from '../components/ui/DataComponents';
import { Loader, Alert, Toast, Modal } from '../components/ui/FeedbackComponents';
import { PermissionGuard, LanguageSwitcher } from '../components/ui/UtilityComponents';
import { AddJobForm } from '../components/jobs/AddJobForm';
import { EditJobForm } from '../components/jobs/EditJobForm';
import { JobDetailsView } from '../components/jobs/JobDetailsView';
import { NotificationBell } from '../components/NotificationBell';
import { SupportTicketsView } from '../components/SupportTicketsView';
import { JobListingView } from '../components/jobs/JobListingView';
import { JobRequirementDetailView } from '../components/jobs/JobRequirementDetailView';
import { UserRole, Job, JobApplication, JobApplicationStatus, SHGProfile, CompanyProfile, CandidateProfile, Training } from '../types';
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
  Sparkles,
  ShoppingBag,
  Award,
  Download,
  Eye,
  Tag,
  Building2,
  Users,
  Send,
  Power,
  Mail,
  Search,
  SlidersHorizontal,
  History,
  UserCircle,
  LockKeyhole,
  ChevronDown,
  ArrowLeft,
  BarChart3,
  ChartPie,
  Table2,
  Menu,
  Camera,
  LifeBuoy
} from 'lucide-react';
// Import newly created paginated lists for admin role
import { AdminRegisteredCompanies } from '../components/AdminRegisteredCompanies';
import { AdminRegisteredUsers } from '../components/AdminRegisteredUsers';
import { AdminJobRequirements } from '../components/AdminJobRequirements';
import { AdminJobApplications } from '../components/AdminJobApplications';
import { AdminCandidateProfileView } from '../components/AdminCandidateProfileView';
import { AdminCompanyProfileView } from '../components/AdminCompanyProfileView';
export default function DashboardHub() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, lastLogin } = useSelector((state: RootState) => state.auth);
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-theme-cream text-slate-800 antialiased font-sans">
        <h3 className="text-lg font-bold text-red-600 mb-2">{t('dashboard.unauthorized')}</h3>
        <Link to="/login" className="btn-gloss px-5 py-2.5 bg-theme-lavender hover:bg-theme-lavender/90 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98]">
          {t('dash.unauthorized.login')}
        </Link>
      </div>
    );
  }
  const [toastMsg, setToastMsg] = useState('');
  // Job requirement detail mode: open via #/dashboard?view=jobRequirement&id=<id>
  // Candidate detail mode:       open via #/dashboard?view=candidate&id=<id>
  // Company detail mode:         open via #/dashboard?view=company&id=<id>
  const [searchParams] = useSearchParams();
  const isAdminBoard = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN;
  const urlView = searchParams.get('view');
  const urlReqId = Number(searchParams.get('id') || 0);
  const urlCandidateId = searchParams.get('id') || '';
  const urlCompanyId = searchParams.get('id') || '';
  const urlOriginView = searchParams.get('from') || '';
  const urlOriginReqId = Number(searchParams.get('fromId') || 0);
  const isReqDetailMode =
    isAdminBoard && urlView === 'jobRequirement' && !Number.isNaN(urlReqId) && urlReqId > 0;
  const isCandidateDetailMode = isAdminBoard && urlView === 'candidate' && urlCandidateId !== '';
  const isCompanyDetailMode = isAdminBoard && urlView === 'company' && urlCompanyId !== '';
  const defaultTab =
    user.role === UserRole.SHG
      ? 'trainings'
      : isReqDetailMode
        ? 'job_requirements'
        : isCandidateDetailMode
          ? 'registered_users'
          : isCompanyDetailMode
            ? 'registered_companies'
            : 'overview';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [detailReqId, setDetailReqId] = useState<number>(isReqDetailMode ? urlReqId : 0);
  const [detailCandidateId, setDetailCandidateId] = useState<string>(isCandidateDetailMode ? urlCandidateId : '');
  const [detailCompanyId, setDetailCompanyId] = useState<string>(isCompanyDetailMode ? urlCompanyId : '');
  // When a candidate was opened from a job requirement's applications, remember
  // the originating requirement so "back" returns to that applications list.
  const [candidateFromReqId, setCandidateFromReqId] = useState<number>(
    isCandidateDetailMode && urlOriginView === 'jobRequirement' ? urlOriginReqId : 0
  );
  // Keep detail modes in sync with URL changes (e.g. candidate -> job requirement back-navigation).
  useEffect(() => {
    if (isReqDetailMode) {
      setActiveTab('job_requirements');
      setDetailReqId(urlReqId);
      setDetailCandidateId('');
      setDetailCompanyId('');
      setCandidateFromReqId(0);
    } else if (isCandidateDetailMode) {
      setActiveTab('registered_users');
      setDetailReqId(0);
      setDetailCandidateId(urlCandidateId);
      setDetailCompanyId('');
      setCandidateFromReqId(urlOriginView === 'jobRequirement' ? urlOriginReqId : 0);
    } else if (isCompanyDetailMode) {
      setActiveTab('registered_companies');
      setDetailReqId(0);
      setDetailCandidateId('');
      setDetailCompanyId(urlCompanyId);
      setCandidateFromReqId(0);
    } else {
      setDetailReqId(0);
      setDetailCandidateId('');
      setDetailCompanyId('');
      setCandidateFromReqId(0);
    }
  }, [isReqDetailMode, isCandidateDetailMode, isCompanyDetailMode, urlReqId, urlCandidateId, urlCompanyId, urlOriginView, urlOriginReqId]);
  // Leaving a detail-bearing tab closes its detail view.
  useEffect(() => {
    if (activeTab !== 'job_requirements') setDetailReqId(0);
    if (activeTab !== 'registered_users') setDetailCandidateId('');
    if (activeTab !== 'registered_companies') setDetailCompanyId('');
  }, [activeTab]);
  // Multi-state for modals
  const [showJobModal, setShowJobModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [targetApplicationId, setTargetApplicationId] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  // API hooks for triggers (profile used by header avatar)
  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Mobile/tablet collapsible menu (header hamburger) state
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const toggleNavMenu = useCallback(() => setNavMenuOpen((v) => !v), []);
  const closeNavMenu = useCallback(() => setNavMenuOpen(false), []);
  // Fetch profile for pic display in navbar
  const { data: navProfile } = useGetMyProfileQuery(undefined, { skip: !user });
  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    if (showProfileDropdown) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showProfileDropdown]);
  return (
    <DashboardMenuContext.Provider value={{ open: navMenuOpen, toggle: toggleNavMenu, close: closeNavMenu }}>
      <div className="h-dvh bg-theme-cream flex flex-col antialiased font-sans overflow-hidden">
        {/* Dynamic Dashboard Navbar */}
        <nav className="bg-theme-darkViolet text-white border-b border-theme-lightViolet/20 z-40 shadow-sm shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:max-w-app h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile & tablet hamburger */}
              <button
                onClick={toggleNavMenu}
                aria-label="Toggle dashboard menu"
                aria-expanded={navMenuOpen}
                data-menu-toggle="true"
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-theme-lightViolet/30 transition-colors cursor-pointer shrink-0"
              >
                {navMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Link to="/" className="hidden lg:flex w-10 h-10 rounded-full items-center justify-center shrink-0 hover:scale-105 transition-transform">
                <img src="/home/logo.png" alt="SRG Logo" className="w-10 h-10 object-contain drop-shadow" />
              </Link>
              <div className="hidden lg:block text-left min-w-0">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight block text-white truncate">{t('dash.header.brandName')}</span>
                <span className="text-[10px] text-theme-gold block font-bold uppercase tracking-wide truncate">
                  {t('dash.header.dashboard')} / {user.role === UserRole.CANDIDATE ? 'CANDIDATE' : user.role === UserRole.COMPANY ? 'EMPLOYER' : user.role}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Last Login - visible always */}
              {lastLogin && (
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-[9px] text-theme-lightViolet/70 font-bold uppercase tracking-wider">Last Login</span>
                  <span className="text-[10px] text-theme-gold font-semibold">
                    {new Date(lastLogin).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })},{' '}
                    {new Date(lastLogin).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                  </span>
                </div>
              )}
              {/* Language Switcher */}
              <LanguageSwitcher variant="dark" />
              {/* Notification Bell */}
              <NotificationBell variant="dark" />
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 p-1 px-3 border border-theme-lightViolet/30 bg-white/10 font-bold hover:bg-white/20 rounded-xl text-[11px] transition-all cursor-pointer"
                >
                  {navProfile?.profilePicUrl ? (
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 ring-theme-gold ring-offset-1 ring-offset-theme-darkViolet">
                      <img src={navProfile.profilePicUrl} alt="Profile" className="w-full h-full object-cover object-center" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/10 ring-2 ring-theme-gold flex items-center justify-center shrink-0">
                      <UserCircle className="w-4 h-4 text-theme-gold" />
                    </div>
                  )}
                  <span className="hidden sm:inline text-left max-w-[120px] truncate">{user.email}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-theme-lightViolet/80 z-50 py-1 animate-fade-in text-slate-800">
                    <div className="px-4 py-3 border-b border-theme-lightViolet/60 flex items-center gap-3">
                      {navProfile?.profilePicUrl ? (
                        <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-theme-gold shrink-0">
                          <img src={navProfile.profilePicUrl} alt="Profile" className="w-full h-full object-cover object-center" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-theme-lightViolet flex items-center justify-center shrink-0">
                          <UserCircle className="w-5 h-5 text-theme-lavender/70" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-theme-darkViolet truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                        {lastLogin && (
                          <p className="text-[9px] text-theme-lavender font-semibold mt-1 truncate">
                            Last Login: {new Date(lastLogin).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })},{' '}
                            {new Date(lastLogin).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-theme-lightViolet/40 hover:text-theme-darkViolet flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <UserCircle className="w-4 h-4 text-theme-lavender" /> {t('profile.menu.myProfile')}
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/change-password');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-theme-lightViolet/40 hover:text-theme-darkViolet flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LockKeyhole className="w-4 h-4 text-theme-lavender" /> {t('profile.menu.changePassword')}
                    </button>
                    <div className="border-t border-theme-lightViolet/60 my-1"></div>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        dispatch(logout());
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> {t('profile.menu.logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
        {/* Primary Layout and Shell wrapper */}
        <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-4 lg:py-8 2xl:max-w-app w-full text-slate-800 overflow-y-auto overscroll-contain">
          {/* -------------------- 1. SUPER ADMIN / ADMIN BOARD -------------------- */}
          {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
              <DashboardMenu>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'overview' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
                    }`}
                >
                  <Tag className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.sevaOverview')}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('registered_companies'); setDetailCompanyId(''); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'registered_companies' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
                    }`}
                >
                  <Building2 className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.registeredCompany')}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('registered_users'); setDetailCandidateId(''); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'registered_users' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
                    }`}
                >
                  <Users className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.registeredUser')}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('job_requirements'); setDetailReqId(0); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'job_requirements' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
                    }`}
                >
                  <Send className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.jobRequirement')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('job_applications')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'job_applications' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
                    }`}
                >
                  <Mail className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.jobApplication')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('support_tickets')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'support_tickets' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
                    }`}
                >
                  <LifeBuoy className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.viewTicket')}</span>
                </button>
                <hr className="my-1 border-theme-lightViolet/60 hidden lg:block" />
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to log off?')) {
                      dispatch(logout());
                      navigate('/login');
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 mt-2 cursor-pointer"
                >
                  <Power className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.logOff')}</span>
                </button>
              </DashboardMenu>
              <div className="lg:col-span-9 space-y-6">
                {activeTab === 'job_requirements' && detailReqId > 0 ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setDetailReqId(0)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-theme-darkViolet/60 hover:text-theme-lavender transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> {t('dashboard.backToRequirements')}
                    </Link>
                    <JobRequirementDetailView requirementId={detailReqId} />
                  </>
                ) : activeTab === 'registered_users' && detailCandidateId ? (
                  <>
                    <Link
                      to={candidateFromReqId > 0 ? `/dashboard?view=jobRequirement&id=${candidateFromReqId}` : '/dashboard'}
                      onClick={() => setDetailCandidateId('')}
                      className="inline-flex items-center gap-2 text-xs font-bold text-theme-darkViolet/60 hover:text-theme-lavender transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />{' '}
                      {candidateFromReqId > 0
                        ? t('dashboard.backToRequirementApplications')
                        : t('dashboard.backToCandidates')}
                    </Link>
                    <AdminCandidateProfileView
                      candidateId={detailCandidateId}
                      onBack={() => {
                        setDetailCandidateId('');
                        if (candidateFromReqId > 0) navigate(`/dashboard?view=jobRequirement&id=${candidateFromReqId}`);
                      }}
                    />
                  </>
                ) : activeTab === 'registered_companies' && detailCompanyId ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setDetailCompanyId('')}
                      className="inline-flex items-center gap-2 text-xs font-bold text-theme-darkViolet/60 hover:text-theme-lavender transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> {t('dashboard.backToCompanies')}
                    </Link>
                    <AdminCompanyProfileView companyId={detailCompanyId} onBack={() => setDetailCompanyId('')} />
                  </>
                ) : (
                  <>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                      <AdminOverviewTab />
                    )}
                    {/* Registered Companies Paginated List */}
                    {activeTab === 'registered_companies' && (
                      <AdminRegisteredCompanies />
                    )}
                    {/* Registered Users Paginated List */}
                    {activeTab === 'registered_users' && (
                      <AdminRegisteredUsers />
                    )}
                    {/* Job Requirements Paginated List */}
                    {activeTab === 'job_requirements' && (
                      <AdminJobRequirements />
                    )}
                    {/* Job Applications Paginated List */}
                    {activeTab === 'job_applications' && (
                      <AdminJobApplications />
                    )}
                    {/* Support Tickets */}
                    {activeTab === 'support_tickets' && (
                      <SupportTicketsView setToastMsg={setToastMsg} />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          {/* -------------------- 2. HANDLER STAFF DASHBOARD (Dynamic Privileges) -------------------- */}
          {user.role === UserRole.HANDLER && (
            <div className="space-y-8 text-left">
              <div className="bg-theme-lightViolet border border-theme-sage/40 p-4.5 rounded-2xl">
                <h3 className="text-sm font-bold text-theme-darkViolet mb-1">
                  {t('dashboard.handlerTitle')} – dynamic system staff privileges enabled:
                </h3>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${user.handlerPermissions?.canApproveJobs ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 line-through border-red-100'}`}>
                    {t('dash.permissions.jobApproval')}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${user.handlerPermissions?.canManageCompanies ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 line-through border-red-100'}`}>
                    {t('dash.permissions.employerEdit')}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${user.handlerPermissions?.canManageSHG ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 line-through border-red-100'}`}>
                    {t('dash.permissions.shgControl')}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${user.handlerPermissions?.canViewUsers ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 line-through border-red-100'}`}>
                    {t('dash.permissions.userViewer')}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${user.handlerPermissions?.canViewReports ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 line-through border-red-100'}`}>
                    {t('dash.permissions.reportAccess')}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <DashboardMenu>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all ${activeTab === 'overview' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
                      }`}
                  >
                    <span className="truncate min-w-0">{t('dash.menu.overview')}</span>
                  </button>
                  {user.handlerPermissions?.canApproveJobs && (
                    <button
                      onClick={() => setActiveTab('jobs')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all ${activeTab === 'jobs' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
                        }`}
                    >
                      <span className="truncate min-w-0">{t('dash.menu.jobsValidation')}</span>
                    </button>
                  )}
                  {user.handlerPermissions?.canManageCompanies && (
                    <button
                      onClick={() => setActiveTab('companies')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all ${activeTab === 'companies' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
                        }`}
                    >
                      <span className="truncate min-w-0">{t('dash.menu.companies')}</span>
                    </button>
                  )}
                  {user.handlerPermissions?.canManageSHG && (
                    <button
                      onClick={() => setActiveTab('shg')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all ${activeTab === 'shg' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
                        }`}
                    >
                      <span className="truncate min-w-0">{t('dash.menu.shgsInfo')}</span>
                    </button>
                  )}
                  {user.handlerPermissions?.canViewReports && (
                    <button
                      onClick={() => setActiveTab('reports')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all ${activeTab === 'reports' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
                        }`}
                    >
                      <span className="truncate min-w-0">{t('dash.menu.reportsSummary')}</span>
                    </button>
                  )}
                  <hr className="my-1 border-theme-lightViolet/60 hidden lg:block" />
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to log off?')) {
                        dispatch(logout());
                        navigate('/login');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 mt-2 cursor-pointer"
                  >
                    <Power className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.logOff')}</span>
                  </button>
                </DashboardMenu>
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
                      {/* Reports removed - implement as needed */}
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
          <Toast
            message={(toastMsg.startsWith('ERROR:') ? toastMsg.slice(6) : toastMsg) || 'Something went wrong.'}
            type={toastMsg.startsWith('ERROR:') ? 'error' : 'success'}
            onClose={() => setToastMsg('')}
          />
        )}
      </div>
    </DashboardMenuContext.Provider>
  );
}
// ==========================================
// COLLAPSIBLE DASHBOARD NAV: hamburger in header, dropdown on mobile/tablet
// ==========================================
export const DashboardMenuContext = React.createContext<{ open: boolean; toggle: () => void; close: () => void }>({
  open: false,
  toggle: () => { },
  close: () => { },
});
export function DashboardMenu({ children, variant = 'sidebar' }: { children: React.ReactNode; variant?: 'sidebar' | 'drawer' }) {
  const { open, close } = useContext(DashboardMenuContext);
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const menuRef = useRef<HTMLDivElement>(null);
  const roleLabel =
    {
      [UserRole.SUPER_ADMIN]: 'Super Admin',
      [UserRole.ADMIN]: 'Admin',
      [UserRole.HANDLER]: 'Handler',
      [UserRole.COMPANY]: 'Employer',
      [UserRole.CANDIDATE]: 'Candidate',
      [UserRole.SHG]: 'SHG Group',
    }[user?.role || ''] || user?.role || '';
  const nameInitials = (user?.name || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (menuRef.current && menuRef.current.contains(target as Node)) return;
      if (target && typeof target.closest === 'function' && target.closest('[data-menu-toggle]')) return;
      close();
    };
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', escHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', escHandler);
    };
  }, [open, close]);
  return (
    <div className="lg:col-span-3">
      {/* Mobile & tablet: slide-in drawer (trigger is the header hamburger) */}
      {open && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-theme-darkViolet/45 backdrop-blur-sm z-50 animate-drawer-backdrop"
            onClick={close}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard menu"
            className="fixed top-0 left-0 bottom-0 w-[84%] max-w-sm z-[60] flex flex-col bg-white rounded-e-3xl border-r border-theme-lightViolet/70 shadow-2xl overflow-hidden animate-drawer-in"
          >
            {/* Drawer header */}
            <div className="relative shrink-0 px-5 pt-5 pb-4 bg-linear-to-br from-theme-darkViolet via-[#2a1a68] to-theme-lavender text-white overflow-hidden">
              {/* decorative blobs */}
              <div className="absolute -top-10 -right-8 w-32 h-32 rounded-full bg-theme-gold/25 blur-2xl pointer-events-none"></div>
              <div className="absolute -bottom-16 -left-8 w-36 h-36 rounded-full bg-theme-deepTeal/25 blur-2xl pointer-events-none"></div>
              <div className="absolute top-14 right-14 w-12 h-12 rounded-full bg-white/10 blur-md pointer-events-none"></div>
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src="/home/logo.png" alt="SRG Logo" className="w-9 h-9 object-contain drop-shadow-lg shrink-0" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-extrabold leading-tight">{t('dash.menu.drawerTitle')}</span>
                  </span>
                </div>
                <button
                  onClick={close}
                  aria-label="Close dashboard menu"
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/25 text-white border border-white/20 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Current user card */}
              <div className="relative mt-4 flex items-center gap-2.5 rounded-2xl bg-white/10 border border-white/15 px-3 py-2.5 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-theme-gold to-theme-terracotta flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md ring-2 ring-white/25">
                  {nameInitials || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-extrabold leading-tight">{user?.name || 'User'}</p>
                  <p className="truncate text-[10px] text-white/70 leading-tight">{user?.email || ''}</p>
                </div>
                <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg bg-theme-gold/25 text-theme-gold border border-theme-gold/40">
                  {roleLabel}
                </span>
              </div>
            </div>
            {/* Drawer body */}
            <div
              className="drawer-menu-body flex-1 overflow-y-auto overscroll-contain p-3 grid grid-cols-1 gap-1.5 content-start bg-linear-to-b from-theme-lightViolet/40 to-white border-t border-theme-lightViolet/40"
              onClick={close}
            >
              {children}
            </div>
            {/* Drawer footer */}
            <div className="shrink-0 px-5 py-2.5 bg-white text-center">
              <p className="text-[9px] font-bold text-theme-darkViolet/40 uppercase tracking-wider">
                SRG • Swayamrojgar • {new Date().getFullYear()}
              </p>
            </div>
          </aside>
        </div>
      )}
      {/* Desktop: static compact column */}
      {variant === 'sidebar' && (
        <div className="hidden lg:grid grid-cols-1 gap-1.5 content-start">
          {children}
        </div>
      )}
    </div>
  );
}
// ==========================================
// SUB-TAB VIEWS: DYNAMIC LIVE API STATISTICS
// ==========================================
function LiveDashboardStats({ appliedJobsOverride }: { appliedJobsOverride?: number }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { t, i18n } = useTranslation();
  const { data: stats, isLoading, error } = useGetDashboardStatsQuery(undefined, { skip: !user });
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-150 shadow-xs flex items-center justify-center min-h-[140px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-4 border-orange-500/20 border-t-orange-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-500">{t('dash.stats.loading')}</p>
        </div>
      </div>
    );
  }
  if (error || !stats) {
    return null;
  }
  const { adminDashboard, employerDashboard, candidateDashboard, isMock } = stats;
  let title = t('dash.stats.title');
  let items: { labelMr: string; labelEn: string; value: any; icon: React.ReactNode; colorClass: string }[] = [];
  // Per-card accent gradients (top strip + icon ring) keyed by the card's colorClass.
  const CARD_ACCENTS: Record<string, { strip: string; ring: string }> = {
    'bg-indigo-50/70 border-indigo-100': { strip: 'from-indigo-400 via-indigo-500 to-indigo-700', ring: 'from-indigo-400 to-indigo-700' },
    'bg-emerald-50/70 border-emerald-100': { strip: 'from-emerald-400 via-emerald-500 to-emerald-600', ring: 'from-emerald-400 to-emerald-600' },
    'bg-rose-50/70 border-rose-100': { strip: 'from-rose-400 via-rose-500 to-rose-600', ring: 'from-rose-400 to-rose-600' },
    'bg-amber-50/70 border-amber-100': { strip: 'from-amber-300 via-amber-400 to-orange-500', ring: 'from-amber-300 to-orange-500' },
    'bg-sky-50/70 border-sky-100': { strip: 'from-sky-400 via-sky-500 to-blue-600', ring: 'from-sky-400 to-blue-600' },
    'bg-violet-50/70 border-violet-100': { strip: 'from-violet-400 via-violet-500 to-violet-700', ring: 'from-violet-400 to-violet-700' },
  };
  const noAccent = { strip: 'from-theme-lavender via-purple-500 to-theme-darkViolet', ring: 'from-theme-lavender to-theme-darkViolet' };
  if (adminDashboard) {
    title = t('dashboard.adminTitle');
    items = [
      {
        labelMr: 'एकूण वापरकर्ता नोंदणी संख्या',
        labelEn: 'Total User Registrations',
        value: adminDashboard.userRegistrationCount,
        icon: <UserCheck className="w-5 h-5 text-indigo-600" />,
        colorClass: "bg-indigo-50/70 border-indigo-100"
      },
      {
        labelMr: 'एकूण कंपनी नोंदणी संख्या',
        labelEn: 'Total Company Registrations',
        value: adminDashboard.companyRegistrationCount,
        icon: <Layers className="w-5 h-5 text-emerald-600" />,
        colorClass: "bg-emerald-50/70 border-emerald-100"
      },
      {
        labelMr: 'एकूण नोकरी अर्ज संख्या',
        labelEn: 'Total Job Applications',
        value: adminDashboard.appliedJobCount,
        icon: <FileText className="w-5 h-5 text-rose-600" />,
        colorClass: "bg-rose-50/70 border-rose-100"
      }
    ];
  } else if (employerDashboard) {
    title = t('dash.stats.employerTitle');
    items = [
      {
        labelMr: 'एकूण नोकरी अर्ज संख्या',
        labelEn: 'Applied Candidates',
        value: employerDashboard.appliedJobCount,
        icon: <UserCheck className="w-5 h-5 text-indigo-600" />,
        colorClass: "bg-indigo-50/70 border-indigo-100"
      },
      {
        labelMr: 'सक्रिय नोकऱ्या संख्या',
        labelEn: 'Active Requirements',
        value: employerDashboard.requirementCount,
        icon: <Briefcase className="w-5 h-5 text-amber-600" />,
        colorClass: "bg-amber-50/70 border-amber-100"
      },
      {
        labelMr: 'उमेदवार प्रोफाइल व्ह्यूज',
        labelEn: 'Resume Profile Views',
        value: employerDashboard.profileViewCount,
        icon: <Eye className="w-5 h-5 text-violet-600" />,
        colorClass: "bg-violet-50/70 border-violet-100"
      }
    ];
  } else if (candidateDashboard) {
    title = t('dash.stats.candidateTitle');
    items = [
      {
        labelMr: 'प्रोफाइल पूर्णता',
        labelEn: 'Profile Completion',
        value: `${candidateDashboard.ProfileComp || candidateDashboard.profileComp || 0}%`,
        icon: <Sparkles className="w-5 h-5 text-amber-500" />,
        colorClass: "bg-amber-50/70 border-amber-100"
      },
      {
        labelMr: 'अर्ज केलेल्या नोकऱ्या',
        labelEn: 'Applied Jobs Count',
        value: appliedJobsOverride ?? (candidateDashboard.AppliedJobCount || candidateDashboard.appliedJobCount || 0),
        icon: <FileText className="w-5 h-5 text-sky-600" />,
        colorClass: "bg-sky-50/70 border-sky-100"
      },
      {
        labelMr: 'बायोडाटा डाउनलोड संख्या',
        labelEn: 'Resume Downloads',
        value: candidateDashboard.ProfileDownloadCount || candidateDashboard.profileDownloadCount || 0,
        icon: <Download className="w-5 h-5 text-emerald-600" />,
        colorClass: "bg-emerald-50/70 border-emerald-100"
      },
      {
        labelMr: 'प्रोफाइल पाहिली संख्या',
        labelEn: 'Profile Views',
        value: candidateDashboard.ProfileViewCount || candidateDashboard.profileViewCount || 0,
        icon: <Eye className="w-5 h-5 text-violet-600" />,
        colorClass: "bg-violet-50/70 border-violet-100"
      }
    ];
  } else {
    return null;
  }
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-white rounded-2xl border border-gray-150 shadow-xs p-4 lg:p-6 space-y-3 lg:space-y-4 text-left">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2 lg:pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse"></span>
            <h3 className="font-extrabold text-blue-950 text-xs sm:text-sm tracking-wide uppercase">
              {title}
            </h3>
          </div>
          {isMock ? (
            <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
              {t('dash.stats.demoMode')}
            </span>
          ) : (
            <span className="text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md">
              {t('dash.stats.liveSync')}
            </span>
          )}
        </div>
        <div className={`grid grid-cols-1 min-[420px]:grid-cols-2 ${items.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2 2xl:grid-cols-4'} gap-2.5 lg:gap-4`}>
          {items.map((item, idx) => {
            const accent = CARD_ACCENTS[item.colorClass] || noAccent;
            const stretchOdd = items.length === 3 && idx === 2 ? 'min-[420px]:col-span-2 lg:col-span-1' : '';
            return (
              <div
                key={idx}
                className={`group relative overflow-hidden rounded-2xl border p-3 lg:p-3.5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${stretchOdd} ${item.colorClass}`}
              >
                {/* Top gradient accent strip */}
                <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${accent.strip}`}></div>
                {/* Decorative pattern + glows */}
                <div className="pointer-events-none absolute inset-0 dot-grid opacity-60"></div>
                <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-white/60 blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="pointer-events-none absolute -bottom-12 -left-8 h-24 w-24 rounded-full bg-white/40 blur-2xl"></div>
                {/* Faint icon watermark in the corner */}
                <div className="pointer-events-none absolute top-3 right-3 opacity-15 group-hover:opacity-40 group-hover:-rotate-6 transition-all duration-300">
                  {item.icon}
                </div>
                {/* Label on top, count below (compact KPI card) */}
                <div className="relative flex items-start gap-2 min-w-0">
                  <div className={`relative shrink-0 rounded-lg p-[2px] bg-linear-to-br ${accent.ring} shadow-md`}>
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-[6px] bg-white flex items-center justify-center">
                      {item.icon}
                    </div>
                  </div>
                  <p className="break-words text-[11px] lg:text-xs font-bold text-slate-700 leading-snug min-w-0 pt-0.5">
                    {i18n.language === 'mr' ? item.labelMr : item.labelEn}
                  </p>
                </div>
                <div className="relative mt-auto pt-2 flex justify-end">
                  <p className="gloss whitespace-nowrap text-[clamp(1.25rem,1.9vw,1.875rem)] font-black leading-none tracking-tight drop-shadow-sm">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
// ==========================================
// SUB-TAB VIEWS: 1. ADMINS OVERVIEW METRICS
// ==========================================
function AdminOverviewTab() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined, { skip: !user });
  const { t } = useTranslation();
  if (isLoading || !stats) return <Loader />;
  return (
    <div className="space-y-6 font-sans">
      <LiveDashboardStats />
      <ActivityLogPanel logs={stats.adminDashboard?.activityLogs || []} />
      {/* Informative system logs */}
      <div className="bg-linear-to-tr from-orange-400 to-amber-500 rounded-2xl p-6 text-white text-left space-y-4 shadow-sm border border-orange-200 max-w-2xl">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">🙏</div>
        <h3 className="font-extrabold text-base">{t('dash.brand.systemName')}</h3>
        <p className="text-xs leading-relaxed opacity-95">
          {t('dash.admin.introPara')}
        </p>
        <div className="pt-2">
          <span className="text-[10px] font-black uppercase tracking-wider bg-black/10 px-3 py-1.5 rounded-lg border border-white/20">
            Swami Seva Department v1.0
          </span>
        </div>
      </div>
    </div>
  );
}
// ==========================================
// ACTIVITY LOG PANEL: TABLE / BAR GRAPH / PIE CHART
// ==========================================
type ActivityMetricKey = 'newReg' | 'jobApps' | 'newReq' | 'logins';
const ACTIVITY_METRICS: { key: ActivityMetricKey; labelMr: string; labelEn: string; color: string }[] = [
  { key: 'newReg', labelMr: 'नवीन नोंदणी', labelEn: 'New Registration', color: '#10B981' },
  { key: 'jobApps', labelMr: 'नोकरी अर्ज', labelEn: 'Job Applications', color: '#0EA5E9' },
  { key: 'newReq', labelMr: 'नवीन आवश्यकता', labelEn: 'New Requirements', color: '#F59E0B' },
  { key: 'logins', labelMr: 'यूजर लॉगिन', labelEn: 'User Login', color: '#8B5CF6' },
];
interface ActivityRow {
  date: string;
  newReg: number;
  jobApps: number;
  newReq: number;
  logins: number;
}
const parseActivityNum = (v: unknown): number => {
  if (typeof v === 'number') return v;
  const n = parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 0 : n;
};
const normalizeActivityLogs = (logs: any[]): ActivityRow[] =>
  (Array.isArray(logs) ? logs : []).map((l: any) => ({
    date: String(l?.activityDate ?? l?.date ?? ''),
    newReg: parseActivityNum(l?.newRegistration ?? l?.newregistration),
    jobApps: parseActivityNum(l?.jobApplications ?? l?.jobapplications),
    newReq: parseActivityNum(l?.newRequirements ?? l?.newrequirements),
    logins: parseActivityNum(l?.userLogin ?? l?.userlogin),
  }));
const weekShortLabel = (row: ActivityRow): string => {
  const m = /^([A-Za-z]{3})\s+\d{1,2}/.exec(row.date);
  return m ? m[0] : row.date;
};
type ActivityViewMode = 'table' | 'bar' | 'pie';
function ActivityLegend() {
  const { i18n } = useTranslation();
  return (
    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-5">
      {ACTIVITY_METRICS.map((m) => (
        <span key={m.key} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
          <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: m.color }}></span>
          {i18n.language === 'mr' ? m.labelMr : m.labelEn}
        </span>
      ))}
    </div>
  );
}
function ActivityLogTable({ rows }: { rows: ActivityRow[] }) {
  const { t, i18n } = useTranslation();
  const totals = ACTIVITY_METRICS.reduce((acc, m) => {
    acc[m.key] = rows.reduce((s, r) => s + r[m.key], 0);
    return acc;
  }, {} as Record<ActivityMetricKey, number>);
  return (
    <div className="srg-scroll overflow-x-auto overflow-y-auto max-h-[70vh] rounded-xl border border-slate-100">
      <table className="w-full min-w-[560px] divide-y divide-slate-100 text-left text-xs">
        <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider">
          <tr>
            <th scope="col" className="px-4 py-3.5 font-bold">{t('dash.activity.date')}</th>
            {ACTIVITY_METRICS.map((m) => (
              <th key={m.key} scope="col" className="px-4 py-3.5 font-bold text-center whitespace-nowrap">
                {i18n.language === 'mr' ? m.labelMr : m.labelEn}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
              <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-800 text-[11px]">
                {r.date}
              </td>
              {ACTIVITY_METRICS.map((m) => (
                <td key={m.key} className="whitespace-nowrap px-4 py-3.5 text-center">
                  <span
                    className="inline-flex items-center justify-center min-w-9 px-2 py-1 rounded-lg text-[11px] font-extrabold tabular-nums"
                    style={{ color: m.color, backgroundColor: `${m.color}1A` }}
                  >
                    {r[m.key]}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50/70">
            <td className="whitespace-nowrap px-4 py-3.5 font-black text-slate-700 text-[11px]">
              {t('dash.activity.total')}
            </td>
            {ACTIVITY_METRICS.map((m) => (
              <td key={m.key} className="whitespace-nowrap px-4 py-3.5 text-center">
                <span
                  className="inline-flex items-center justify-center min-w-9 px-2 py-1 rounded-lg text-[11px] font-black tabular-nums"
                  style={{ color: m.color, backgroundColor: `${m.color}14` }}
                >
                  {totals[m.key]}
                </span>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
function ActivityBarChart({ rows }: { rows: ActivityRow[] }) {
  const { i18n } = useTranslation();
  const allValues = rows.flatMap((r) => ACTIVITY_METRICS.map((m) => r[m.key]));
  const maxVal = Math.max(...allValues, 1);
  const niceMax = Math.max(4, Math.ceil(maxVal / 2) * 2);
  const W = rows.length;
  const svgW = 640;
  const svgH = 250;
  const padL = 40;
  const padR = 18;
  const padT = 18;
  const padB = 60;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;
  const groupW = plotW / W;
  const nBars = ACTIVITY_METRICS.length;
  const barGap = 4;
  const barW = Math.min(24, Math.max(8, (groupW - (nBars - 1) * barGap) / nBars - 2));
  const totalBW = nBars * barW + (nBars - 1) * barGap;
  const gridVals = [0, niceMax / 2, niceMax];
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState<{ id: string; date: string; label: string; value: number; color: string } | null>(null);
  return (
    <div
      className="relative"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" role="img" aria-label="Activity bar graph">
        {gridVals.map((gv) => {
          const y = padT + plotH - (gv / niceMax) * plotH;
          return (
            <g key={gv}>
              <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#EEF1F7" strokeWidth="1" />
              <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#8FA0B5">{gv}</text>
            </g>
          );
        })}
        {rows.map((r, wi) => {
          const gx = padL + wi * groupW + (groupW - totalBW) / 2;
          return (
            <g key={wi}>
              {ACTIVITY_METRICS.map((m, bi) => {
                const v = r[m.key];
                const barH = (v / niceMax) * plotH;
                const x = gx + bi * (barW + barGap);
                const y = padT + plotH - barH;
                const id = `${wi}-${m.key}`;
                return (
                  <g
                    key={m.key}
                    onMouseEnter={() => setHover({ id, date: r.date, label: i18n.language === 'mr' ? m.labelMr : m.labelEn, value: v, color: m.color })}
                    onMouseLeave={() => setHover((h) => (h?.id === id ? null : h))}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={Math.max(barH, v > 0 ? 2 : 0)}
                      rx="3"
                      fill={m.color}
                      opacity={hover && hover.id !== id ? 0.35 : 0.92}
                    />
                    {v > 0 && (
                      <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill={m.color}>
                        {v}
                      </text>
                    )}
                  </g>
                );
              })}
              <text
                x={padL + wi * groupW + groupW / 2}
                y={svgH - padB + 18}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#64748B"
              >
                {weekShortLabel(r)}
              </text>
            </g>
          );
        })}
      </svg>
      <ActivityLegend />
      {hover && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full"
          style={{ left: pos.x, top: pos.y - 10 }}
        >
          <div className="rounded-lg bg-slate-900/95 px-3 py-2 text-white shadow-lg whitespace-nowrap">
            <p className="text-[10px] font-bold text-slate-200">{hover.date}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hover.color }}></span>
              {hover.label}
            </p>
            <p className="mt-0.5 text-sm font-black tabular-nums" style={{ color: hover.color }}>{hover.value}</p>
          </div>
        </div>
      )}
    </div>
  );
}
function ActivityDonutChart({ rows }: { rows: ActivityRow[] }) {
  const { i18n } = useTranslation();
  const totals = ACTIVITY_METRICS.map((m) => ({
    ...m,
    total: rows.reduce((s, r) => s + r[m.key], 0)
  }));
  const grand = totals.reduce((s, t) => s + t.total, 0);
  const range = rows.length > 0
    ? (rows[0].date === rows[rows.length - 1].date ? rows[0].date : `${rows[0].date} – ${rows[rows.length - 1].date}`)
    : '';
  const R = 78;
  const T = 34;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const segs = totals.map((t) => {
    const frac = grand > 0 ? t.total / grand : 0;
    const len = frac * C;
    const seg = { ...t, frac, len, start: acc };
    acc += len;
    return seg;
  });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState<{ key: string; label: string; value: number; pct: number; color: string } | null>(null);
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div
        className="relative shrink-0"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseLeave={() => setHover(null)}
      >
        <svg viewBox="0 0 200 200" className="w-44 h-44 sm:w-52 sm:h-52" role="img" aria-label="Activity pie chart">
          <circle cx="100" cy="100" r={R} fill="none" stroke="#EEF1F7" strokeWidth={T} />
          {segs.filter((s) => s.len > 0.4).map((s) => (
            <circle
              key={s.key}
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={T}
              strokeDasharray={`${s.len} ${C - s.len}`}
              strokeDashoffset={-s.start}
              transform="rotate(-90 100 100)"
              strokeLinecap="butt"
              opacity={hover && hover.key !== s.key ? 0.4 : 1}
              onMouseEnter={() => setHover({ key: s.key, label: i18n.language === 'mr' ? s.labelMr : s.labelEn, value: s.total, pct: grand > 0 ? Math.round((s.total / grand) * 100) : 0, color: s.color })}
              onMouseLeave={() => setHover((h) => (h?.key === s.key ? null : h))}
            />
          ))}
          <circle cx="100" cy="100" r={R - T / 2} fill="#fff" />
          <text x="100" y="95" textAnchor="middle" fontSize="24" fontWeight="800" fill="#1E293B">{grand}</text>
          <text x="100" y="112" textAnchor="middle" fontSize="8" fontWeight="600" fill="#94A3B8">TOTAL</text>
        </svg>
        {hover && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full"
            style={{ left: pos.x, top: pos.y - 10 }}
          >
            <div className="rounded-lg bg-slate-900/95 px-3 py-2 text-white shadow-lg whitespace-nowrap">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hover.color }}></span>
                {hover.label}
              </p>
              <p className="mt-0.5 text-sm font-black tabular-nums" style={{ color: hover.color }}>
                {hover.value}
                <span className="ml-1 text-[10px] font-bold text-slate-300">({hover.pct}%)</span>
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-slate-300">{range}</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 w-full min-w-0">
        <ul className="space-y-2.5">
          {totals.map((t) => (
            <li
              key={t.key}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-colors"
            >
              <span className="w-3 h-3 rounded-[4px] shrink-0" style={{ backgroundColor: t.color }}></span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-700 leading-tight truncate">
                  {i18n.language === 'mr' ? t.labelMr : t.labelEn}
                </p>
              </div>
              <span className="text-sm font-black tabular-nums" style={{ color: t.color }}>{t.total}</span>
              <span className="w-12 text-right text-[10px] font-bold text-slate-400 tabular-nums">
                {grand > 0 ? Math.round((t.total / grand) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
function ActivityLogPanel({ logs }: { logs: any[] }) {
  const { t } = useTranslation();
  const [view, setView] = useState<ActivityViewMode>('pie');
  const rows = normalizeActivityLogs(logs);
  const headerBtns: { mode: ActivityViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'pie', icon: <ChartPie className="w-3.5 h-3.5" />, label: 'Pie Chart' },
    { mode: 'bar', icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Bar Graph' },
    { mode: 'table', icon: <Table2 className="w-3.5 h-3.5" />, label: 'Table' },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-150 shadow-xs text-left overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-gray-100 p-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-theme-lavender via-purple-500 to-theme-darkViolet flex items-center justify-center text-white shadow-sm shrink-0">
            <History className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-blue-950 text-sm tracking-wide">
              {t('dash.activity.title')}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              {t('dash.activity.subtitle')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start lg:self-auto">
          {headerBtns.map((b) => (
            <button
              key={b.mode}
              onClick={() => setView(b.mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${view === b.mode
                ? 'bg-white text-theme-darkViolet shadow-sm ring-1 ring-purple-200'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              {b.icon}
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5">
        {rows.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">
            {t('dash.activity.empty')}
          </div>
        ) : view === 'pie' ? (
          <ActivityDonutChart rows={rows} />
        ) : view === 'bar' ? (
          <ActivityBarChart rows={rows} />
        ) : (
          <ActivityLogTable rows={rows} />
        )}
      </div>
    </div>
  );
}
// ==========================================
// COMPONENT LIST: 3. JOBS APPROVAL GRID WITH LIST AND EDIT
// ==========================================
function AdminJobsApprovalTab({ setToastMsg }: { setToastMsg: (msg: string) => void }) {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedJobIdForDetail, setSelectedJobIdForDetail] = useState<number | null>(null);
  const [selectedJobCode, setSelectedJobCode] = useState<string | undefined>(undefined);
  const [selectedJobIdForEdit, setSelectedJobIdForEdit] = useState<number | null>(null);
  const [isPostingNewJob, setIsPostingNewJob] = useState(false);
  const { data: jobs = [], refetch } = useGetJobsQuery(undefined, { skip: !user });
  const [updateJob] = useUpdateJobMutation();
  const [deleteJob] = useDeleteJobMutation();
  const handleApprove = async (jobId: string) => {
    try {
      await updateJob({ id: jobId, isApproved: true }).unwrap();
      setToastMsg(t('dash.toast.jobApproved'));
      refetch();
    } catch (_) {
      setToastMsg('Failed to approve vacancy.');
    }
  };
  const handleDelete = async (jobId: string) => {
    try {
      await deleteJob(jobId).unwrap();
      setToastMsg(t('dash.toast.jobDeleted'));
      refetch();
    } catch (_) {
      setToastMsg('Deletions failed');
    }
  };
  if (selectedJobIdForDetail) {
    return (
      <JobDetailsView
        jobId={selectedJobIdForDetail}
        jobCode={selectedJobCode}
        onBack={() => { setSelectedJobIdForDetail(null); setSelectedJobCode(undefined); }}
      />
    );
  }
  if (isPostingNewJob) {
    return (
      <AddJobForm
        onCancel={() => setIsPostingNewJob(false)}
        onSuccess={() => {
          setIsPostingNewJob(false);
          setToastMsg(t('dash.toast.jobAdded'));
          refetch();
        }}
      />
    );
  }
  return (
    <div className="space-y-6 text-left">
      {/* 1. Recruiter Vacancies Approval Desk */}
      <Card title={t('dash.admin.vacanciesApprovalTitle')}>
        <p className="text-xs text-slate-500 mb-6 font-semibold">
          {t('dash.admin.vacanciesApprovalDesc')}
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
                  <p className="text-[10px] text-orange-600 font-semibold block uppercase">{t('dash.job.categorySalary', { category: job.category, salary: job.salary })}</p>
                </div>
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  {!job.isApproved && (
                    <PrimaryButton onClick={() => handleApprove(job.id)} className="px-3.5 py-1.5 text-xs font-bold">
                      {t('dash.admin.approve')}
                    </PrimaryButton>
                  )}
                  <DangerButton onClick={() => handleDelete(job.id)} className="px-3.5 py-1.5 text-xs font-bold bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-700">
                    {t('dashboard.delete')}
                  </DangerButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      {/* 2. Unified Job Listings view with Edit option */}
      <Card title={t('dash.admin.allJobsTitle')}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <p className="text-xs text-slate-500 font-medium">
            {t('dash.admin.allJobsDesc')}
          </p>
          <PrimaryButton onClick={() => setIsPostingNewJob(true)} className="py-2 px-4 text-xs font-bold">
            {t('dash.admin.addNewJob')}
          </PrimaryButton>
        </div>
        <JobListingView
          onViewDetails={(id, jobCode) => { setSelectedJobIdForDetail(id); setSelectedJobCode(jobCode); }}
          onEditJob={(id) => setSelectedJobIdForEdit(id)}
        />
      </Card>
      {/* Edit Job popup modal */}
      <Modal
        isOpen={selectedJobIdForEdit !== null}
        onClose={() => setSelectedJobIdForEdit(null)}
        title={t('dash.admin.editJobTitle')}
        maxWidthClass="max-w-3xl"
      >
        {selectedJobIdForEdit !== null && (
          <EditJobForm
            jobId={selectedJobIdForEdit}
            onCancel={() => setSelectedJobIdForEdit(null)}
            onSuccess={() => {
              setSelectedJobIdForEdit(null);
              setToastMsg(t('dash.toast.jobUpdated'));
              refetch();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
// ==========================================
// COMPONENT LIST: 4. COMPANIES APPROVAL GRID
// ==========================================
function AdminCompaniesApprovalTab({ setToastMsg }: { setToastMsg: (msg: string) => void }) {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: companies = [], refetch } = useGetCompaniesQuery(undefined, { skip: !user });
  const [updateCompany] = useUpdateCompanyMutation();
  const handleApproveComp = async (compId: string) => {
    try {
      await updateCompany({ id: compId, isApproved: true }).unwrap();
      setToastMsg(t('dash.toast.companyApproved'));
      refetch();
    } catch (_) {
      setToastMsg('Failed company edit approval.');
    }
  };
  return (
      <Card title={t('dash.admin.companiesApprovalTitle')}>
      <p className="text-xs text-slate-550 mb-6 font-semibold">
        {t('dash.admin.companiesApprovalDesc')}
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
                    {t('dash.admin.representative')} {comp.contactPerson} | {t('dash.admin.industry')} {comp.industry}
                  </p>
                  <p className="text-xs text-slate-500 font-semibold block leading-none">
                    {t('dash.admin.contact')} {comp.email} | {comp.phone} | {t('dash.admin.address')} {comp.address}
                  </p>
              </div>
              <div>
                {!comp.isApproved && (
                  <PrimaryButton onClick={() => handleApproveComp(comp.id)} className="px-3.5 py-1.5 text-xs font-bold font-sans">
                    {t('dash.admin.verifyApprove')}
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
function HandlerSHGTab({ setToastMsg }: { setToastMsg: (msg: string) => void }) {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: list = [], refetch } = useGetSHGProfilesQuery(undefined, { skip: !user });
  return (
    <Card title={t('dash.shg.verificationTitle')}>
      <p className="text-xs text-slate-500 mb-6 font-semibold">
        {t('dash.shg.verificationDesc')}
      </p>
      <div className="space-y-4 text-left">
        {list.map((shg) => (
          <div key={shg.id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl relative">
            <div className="space-y-2">
            <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5 leading-none">
              🌾 {shg.shgName} ({shg.memberCount} {t('dash.shg.members')})
            </h4>
            <p className="text-xs font-semibold text-slate-600 block">
              {t('dash.shg.leader')} {shg.leaderName} | {t('dash.shg.district')} {shg.district} | {t('dash.shg.phone')} {shg.phone}
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(() => {
    const tab = searchParams.get('tab') || 'overview';
    return ['overview', 'pipeline', 'listings', 'post', 'profile', 'support_tickets'].includes(tab) ? tab : 'overview';
  });
  const [selectedJobIdForDetail, setSelectedJobIdForDetail] = useState<number | null>(null);
  const [selectedJobCode, setSelectedJobCode] = useState<string | undefined>(undefined);
  const [selectedJobIdForEdit, setSelectedJobIdForEdit] = useState<number | null>(null);
  const [isPostingNewJob, setIsPostingNewJob] = useState<boolean>(false);
  // Pipeline search & filter state
  const [pipelineSearch, setPipelineSearch] = useState('');
  const [pipelineStatusFilter, setPipelineStatusFilter] = useState('');
  const [pipelineJobFilter, setPipelineJobFilter] = useState('');
  const PIPELINE_PAGE_SIZE = 10;
  const [pipelineVisibleCount, setPipelineVisibleCount] = useState(PIPELINE_PAGE_SIZE);
  const [pipelineLoadingMore, setPipelineLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  // Immediate local overrides so the pipeline dropdown + badge reflect a saved
  // status even if the list endpoint has not caught up with the status history.
  const [localStatusOverrides, setLocalStatusOverrides] = useState<Record<string, { statusId: number; statusName: string }>>({});
  // Bumped whenever the shared status store changes so both the employer
  // pipeline and candidate applied list re-render with the latest status.
  const [statusStoreVersion, setStatusStoreVersion] = useState(0);
  useEffect(() => subscribeApplicationStatusOverrides(() => setStatusStoreVersion(v => v + 1)), []);
  const { data: locations = [] } = useGetLocationsQuery(undefined, { skip: !user });
  const { data: jobCategories = [] } = useGetJobCategoriesQuery(undefined, { skip: !user });
  // Load recruiter profile from unified endpoint
  const { data: profile, refetch: refetchProfile } = useGetMyProfileQuery(undefined, { skip: !user });
  // Load applicants pipelines & jobs (employer-specific endpoints with Bearer token)
  const { data: pipelineApps = [], refetch: refetchApps } = useGetMyJobApplicationsQuery(undefined, { skip: !user });
  const { data: jobsList = [], refetch: refetchJobs } = useGetMyRequirementsQuery(undefined, { skip: !user });
  // Master list of application statuses → resolve the numeric statusId for the edit API.
  const { data: statusList = [] } = useGetApplicationStatusListQuery(undefined, { skip: !user });
  // Seed the pipeline badge/dropdown with the last saved status from the shared
  // store so a reload never falls back to a stale ("Submitted") API value.
  useEffect(() => {
    if (!pipelineApps.length) return;
    setLocalStatusOverrides(prev => {
      let changed = false;
      const next = { ...prev };
      for (const app of pipelineApps) {
        const ov = getApplicationStatusOverride({
          applicationId: app.applicationId,
          id: app.id,
          jobId: app.jobId,
          jobCode: app.jobCode,
        });
        if (ov && next[app.id]?.statusId !== ov.statusId) {
          next[app.id] = { statusId: ov.statusId, statusName: ov.statusName };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [pipelineApps, statusStoreVersion]);
  // Default master statuses aligned with /api/v1/jobapplicationstatuslist
  const defaultStatusOptions: JobApplicationStatus[] = React.useMemo(() => [
    { id: 1, statusId: 1, statusCode: 'APPLIED', name: 'Applied', statusName: 'Applied', description: 'Application submitted', sortOrder: 1, isFinalStatus: false },
    { id: 2, statusId: 2, statusCode: 'SHORTLISTED', name: 'Shortlisted', statusName: 'Shortlisted', description: 'Candidate shortlisted', sortOrder: 2, isFinalStatus: false },
    { id: 3, statusId: 3, statusCode: 'INTERVIEW', name: 'Interview', statusName: 'Interview', description: 'Candidate called for interview', sortOrder: 3, isFinalStatus: false },
    { id: 4, statusId: 4, statusCode: 'ROUND_2', name: 'Round 2', statusName: 'Round 2', description: 'Candidate selected for second round', sortOrder: 4, isFinalStatus: false },
    { id: 5, statusId: 5, statusCode: 'ROUND_3', name: 'Round 3', statusName: 'Round 3', description: 'Candidate selected for third round', sortOrder: 5, isFinalStatus: false },
    { id: 6, statusId: 6, statusCode: 'HR_DISCUSSION', name: 'HR Discussion', statusName: 'HR Discussion', description: 'HR discussion in progress', sortOrder: 6, isFinalStatus: false },
    { id: 7, statusId: 7, statusCode: 'SELECTED', name: 'Selected', statusName: 'Selected', description: 'Candidate selected for job', sortOrder: 7, isFinalStatus: true },
    { id: 8, statusId: 8, statusCode: 'REJECTED', name: 'Rejected', statusName: 'Rejected', description: 'Candidate rejected', sortOrder: 8, isFinalStatus: true },
    { id: 9, statusId: 9, statusCode: 'WITHDRAWN', name: 'Withdrawn', statusName: 'Withdrawn', description: 'Application withdrawn by candidate', sortOrder: 9, isFinalStatus: true },
    { id: 10, statusId: 10, statusCode: 'ON_HOLD', name: 'On Hold', statusName: 'On Hold', description: 'Application temporarily put on hold', sortOrder: 10, isFinalStatus: false }
  ], []);
  // Dropdown options: prefer the backend master list, otherwise fall back to defaults.
  const pipelineStatusOptions: JobApplicationStatus[] = statusList.length > 0
    ? [...statusList].sort((a, b) => (a.sortOrder || a.id) - (b.sortOrder || b.id))
    : defaultStatusOptions;
  const statusIdMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    pipelineStatusOptions.forEach(s => {
      map[String(s.name).toLowerCase()] = s.id;
      if (s.statusCode) map[String(s.statusCode).toLowerCase()] = s.id;
      if (s.statusName) map[String(s.statusName).toLowerCase()] = s.id;
    });
    return map;
  }, [pipelineStatusOptions]);
  const resolveStatusId = (statusIdentifier: string | number): number => {
    if (typeof statusIdentifier === 'number' && Number.isFinite(statusIdentifier) && statusIdentifier > 0) {
      return statusIdentifier;
    }
    const clean = String(statusIdentifier || '').toLowerCase().trim();
    return statusIdMap[clean] || 0;
  };
  const getStatusNameById = (id?: number, fallbackText?: string): string => {
    if (id) {
      const match = pipelineStatusOptions.find(s => s.id === id);
      if (match) return match.name;
    }
    return fallbackText || 'Applied';
  };
  // Unique job titles from applications for filter dropdown
  const uniqueJobTitles = React.useMemo(() => {
    const titles = pipelineApps.map(a => a.jobTitle).filter(Boolean);
    return [...new Set(titles)].sort();
  }, [pipelineApps]);
  // Filtered pipeline list based on search + dropdowns
  const filteredPipelineApps = React.useMemo(() => {
    let result = [...pipelineApps];
    if (pipelineSearch.trim()) {
      const phrase = pipelineSearch.toLowerCase();
      result = result.filter(a =>
        (a.candidateName || '').toLowerCase().includes(phrase) ||
        (a.jobTitle || '').toLowerCase().includes(phrase) ||
        (a.candidatePhone || '').toLowerCase().includes(phrase)
      );
    }
    if (pipelineStatusFilter) {
      const filterNum = Number(pipelineStatusFilter);
      result = result.filter(a => {
        if (filterNum) {
          const appStatusId = localStatusOverrides[a.id]?.statusId || a.statusId || resolveStatusId(a.status);
          return appStatusId === filterNum;
        }
        return a.status.toLowerCase() === pipelineStatusFilter.toLowerCase();
      });
    }
    if (pipelineJobFilter) {
      result = result.filter(a => a.jobTitle === pipelineJobFilter);
    }
    return result;
  }, [pipelineApps, pipelineSearch, pipelineStatusFilter, pipelineJobFilter, localStatusOverrides]);
  // Infinite scroll slice of the filtered pipeline (10 records per batch)
  const visiblePipelineApps = React.useMemo(() => {
    return filteredPipelineApps.slice(0, pipelineVisibleCount);
  }, [filteredPipelineApps, pipelineVisibleCount]);
  const pipelineHasMore = filteredPipelineApps.length > pipelineVisibleCount;
  // Reset visible count when filters change
  React.useEffect(() => {
    setPipelineVisibleCount(PIPELINE_PAGE_SIZE);
  }, [pipelineSearch, pipelineStatusFilter, pipelineJobFilter]);
  // Infinite scroll: load the next 10 records when the sentinel is near the viewport
  const loadMorePipeline = React.useCallback(() => {
    if (!pipelineHasMore || pipelineLoadingMore) return;
    setPipelineLoadingMore(true);
    // Simulate a tiny async step so the loader is perceivable on fast lists
    window.setTimeout(() => {
      setPipelineVisibleCount(c => Math.min(c + PIPELINE_PAGE_SIZE, filteredPipelineApps.length));
      setPipelineLoadingMore(false);
    }, 350);
  }, [pipelineHasMore, pipelineLoadingMore, filteredPipelineApps.length]);
  React.useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !pipelineHasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMorePipeline();
      },
      { rootMargin: '200px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pipelineHasMore, loadMorePipeline]);
  // Job creation forms state
  const [vacancyTitle, setVacancyTitle] = useState('');
  const [vacancyLocation, setVacancyLocation] = useState('Nashik');
  const [vacancySalary, setVacancySalary] = useState('');
  const [vacancyCategory, setVacancyCategory] = useState('Information Technology');
  const [vacancyType, setVacancyType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote'>('Full-time');
  const [vacancyDesc, setVacancyDesc] = useState('');
  const [vacancyReqText, setVacancyReqText] = useState('');
  const [createJob, { isLoading: isPublishing }] = useCreateJobMutation();
  // Form edit elements for Recruiter Corporate details
  const [compName, setCompName] = useState('');
  const [compContact, setCompContact] = useState('');
  const [compIndustry, setCompIndustry] = useState('');
  const [compAddress, setCompAddress] = useState('');
  const [compMobile, setCompMobile] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compAltContact, setCompAltContact] = useState('');
  const [compAltNumber, setCompAltNumber] = useState('');
  const [compState, setCompState] = useState('');
  const [compDistrict, setCompDistrict] = useState('');
  const [compTaluka, setCompTaluka] = useState('');
  // Numeric IDs driving the cascading location master-data dropdowns (PROF-026).
  // The string state above stays in sync and is what gets sent to the backend.
  const [compStateId, setCompStateId] = useState<number>(1); // Default Maharashtra
  const [compDistrictId, setCompDistrictId] = useState<number>(0);
  const [compTalukaId, setCompTalukaId] = useState<number>(0);
  const { data: compStates = [] } = useGetStatesQuery(1); // India
  const { data: compDistricts = [] } = useGetDistrictsQuery(compStateId, { skip: !compStateId });
  const { data: compTalukas = [] } = useGetTalukasQuery(compDistrictId, { skip: !compDistrictId });
  const handleCompStateChange = (id: number) => {
    setCompStateId(id);
    setCompState(getLocalizedName(compStates.find(s => s.id === id)));
    setCompDistrictId(0);
    setCompDistrict('');
    setCompTalukaId(0);
    setCompTaluka('');
  };
  const handleCompDistrictChange = (id: number) => {
    setCompDistrictId(id);
    setCompDistrict(getLocalizedName(compDistricts.find(d => d.id === id)));
    setCompTalukaId(0);
    setCompTaluka('');
  };
  const handleCompTalukaChange = (id: number) => {
    setCompTalukaId(id);
    setCompTaluka(getLocalizedName(compTalukas.find(t => t.id === id)));
  };
  const [compCompanyType, setCompCompanyType] = useState('');
  const [compWebsite, setCompWebsite] = useState('');
  const [compAltEmail, setCompAltEmail] = useState('');
  const [compDescription, setCompDescription] = useState('');
  const [compPicFile, setCompPicFile] = useState<File | null>(null);
  const [compPicPreview, setCompPicPreview] = useState('');
  const [compPicUploading, setCompPicUploading] = useState(false);
  const compPicInputRef = useRef<HTMLInputElement | null>(null);
  // Status change modal & remarks state
  const [statusUpdateApp, setStatusUpdateApp] = useState<JobApplication | null>(null);
  const [selectedStatusObj, setSelectedStatusObj] = useState<JobApplicationStatus | null>(null);
  const [statusRemarks, setStatusRemarks] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
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
      setCompMobile(profile.phone || '');
      setCompEmail(profile.email || '');
      setCompState(profile.state || '');
      setCompDistrict(profile.district || '');
      setCompTaluka(profile.taluka || '');
      setCompStateId(profile.stateId || 0);
      setCompDistrictId(profile.districtId || 0);
      setCompTalukaId(profile.talukaId || 0);
    }
  }, [profile]);
  // PROF-026: keep the string state and numeric IDs in sync with the master
  // lists — resolve saved strings into IDs (backend returned 0) and back-fill
  // empty strings from the selected ID, so Save always sends the right name.
  React.useEffect(() => {
    const matchesName = (item: { name: string; enName?: string }, value: string) =>
      item.name.trim().toLowerCase() === value.trim().toLowerCase() ||
      (item.enName || '').trim().toLowerCase() === value.trim().toLowerCase();
    if (compStateId === 0 && compState && compStates.length) {
      const m = compStates.find(s => matchesName(s, compState));
      if (m) setCompStateId(m.id);
    } else if (compStateId !== 0 && !compState && compStates.length) {
      const m = compStates.find(s => s.id === compStateId);
      if (m) setCompState(getLocalizedName(m));
    }
    if (compDistrictId === 0 && compDistrict && compDistricts.length) {
      const m = compDistricts.find(d => matchesName(d, compDistrict));
      if (m) setCompDistrictId(m.id);
    } else if (compDistrictId !== 0 && !compDistrict && compDistricts.length) {
      const m = compDistricts.find(d => d.id === compDistrictId);
      if (m) setCompDistrict(getLocalizedName(m));
    }
    if (compTalukaId === 0 && compTaluka && compTalukas.length) {
      const m = compTalukas.find(tl => matchesName(tl, compTaluka));
      if (m) setCompTalukaId(m.id);
    } else if (compTalukaId !== 0 && !compTaluka && compTalukas.length) {
      const m = compTalukas.find(tl => tl.id === compTalukaId);
      if (m) setCompTaluka(getLocalizedName(m));
    }
  }, [compStateId, compDistrictId, compTalukaId, compState, compDistrict, compTaluka, compStates, compDistricts, compTalukas]);
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
      setToastMsg(t('dash.toast.vacancyAdded'));
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
  const toNumId = (raw?: unknown): number => {
    if (raw === undefined || raw === null) return 0;
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0 && n < Number.MAX_SAFE_INTEGER) return Math.trunc(n);
    const digits = String(raw).replace(/\D/g, '');
    if (!digits || digits.length > 15) return 0;
    const d = Number(digits);
    return Number.isFinite(d) ? d : 0;
  };
  const resolveChangedBy = (): number => toNumId(user?.id);
  const resolveAppNumericId = (app: JobApplication): number => {
    if (app.applicationId && Number.isFinite(app.applicationId) && app.applicationId > 0) {
      return Math.trunc(app.applicationId);
    }
    const fromId = toNumId(app.id);
    if (fromId > 0) return fromId;
    // Deep check raw item keys if available
    if (app.rawItem && typeof app.rawItem === 'object') {
      const keys = Object.keys(app.rawItem);
      for (const k of keys) {
        if (/id$/i.test(k) || /application/i.test(k)) {
          const val = app.rawItem[k];
          const n = Number(val);
          if (Number.isFinite(n) && n > 0 && n < Number.MAX_SAFE_INTEGER) {
            return Math.trunc(n);
          }
        }
      }
    }
    console.error('[DashboardHub] Unable to determine numeric applicationId for app:', app);
    return 0;
  };
  const buildStatusPayload = (app: JobApplication, statusId: number, extra?: Partial<UpdateApplicationStatusPayload>): UpdateApplicationStatusPayload => ({
    applicationStatusHistoryId: app.applicationStatusHistoryId || 0,
    applicationId: resolveAppNumericId(app),
    statusId: statusId,
    remarks: '',
    changedBy: resolveChangedBy(),
    ...extra,
  });
  const handleStatusSelectChange = (app: JobApplication, chosenStatusIdOrName: string) => {
    const numId = Number(chosenStatusIdOrName);
    const statusObj = pipelineStatusOptions.find(s => s.id === numId) ||
      pipelineStatusOptions.find(s => s.name.toLowerCase() === chosenStatusIdOrName.toLowerCase());
    if (!statusObj) return;
    // If changing to Interview, prompt with scheduling datetime modal
    if (statusObj.name.toLowerCase().includes('interview') || statusObj.statusCode === 'INTERVIEW') {
      setTargetAppId(app.id);
      setSelectedStatusObj(statusObj);
      setShowInterviewModal(true);
      return;
    }
    // Prompt status change modal with remarks field
    setStatusUpdateApp(app);
    setSelectedStatusObj(statusObj);
    setStatusRemarks('');
  };
  const executeStatusUpdate = async (app: JobApplication, statusObj: JobApplicationStatus, remarksText: string = '') => {
    const statusId = statusObj.id;
    const payload = buildStatusPayload(app, statusId, { remarks: remarksText });
    if (!payload.statusId) {
      setToastMsg(`Status ID not resolved for "${statusObj.name}". Please try again.`);
      return;
    }
    if (!payload.applicationId) {
      console.error('[executeStatusUpdate] Application ID unavailable. Applicant details:', app);
      setToastMsg('Application ID unavailable for this applicant. Cannot update status.');
      return;
    }
    setIsUpdatingStatus(true);
    try {
      const result = await updateJobApplicationStatus(payload);
      setToastMsg(result.success ? (result.message || `Status updated to ${statusObj.name}!`) : result.message);
      if (result.success) {
        setLocalStatusOverrides(prev => ({
          ...prev,
          [app.id]: { statusId: statusObj.id, statusName: statusObj.name }
        }));
        setApplicationStatusOverride(
          { applicationId: payload.applicationId, id: app.id, jobId: app.jobId, jobCode: app.jobCode },
          { statusId: statusObj.id, statusName: statusObj.name }
        );
        setStatusUpdateApp(null);
        setSelectedStatusObj(null);
        setStatusRemarks('');
        refetchApps();
      }
    } catch (_) {
      setToastMsg('Failed pipeline status update');
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  const handleScheduleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewDate) return;
    const app = pipelineApps.find(a => a.id === targetAppId);
    const statusId = selectedStatusObj?.id || resolveStatusId('Interview');
    if (!statusId) {
      setToastMsg('Status ID not resolved for "Interview". Please try again.');
      return;
    }
    const payload: UpdateApplicationStatusPayload = app
      ? buildStatusPayload(app, statusId)
      : { applicationStatusHistoryId: 0, applicationId: 0, statusId, remarks: '', changedBy: resolveChangedBy() };
    payload.remarks = `Interview scheduled on ${interviewDate}`;
    if (!payload.applicationId) {
      setToastMsg('Application ID unavailable for this applicant. Cannot schedule interview.');
      return;
    }
    try {
      const result = await updateJobApplicationStatus(payload);
      if (result.success) {
        setToastMsg(result.message || t('dash.toast.interviewScheduled'));
        if (targetAppId) {
          setLocalStatusOverrides(prev => ({
            ...prev,
            [targetAppId]: { statusId, statusName: selectedStatusObj?.name || 'Interview' }
          }));
          if (app) {
            setApplicationStatusOverride(
              { applicationId: payload.applicationId, id: app.id, jobId: app.jobId, jobCode: app.jobCode },
              { statusId, statusName: selectedStatusObj?.name || 'Interview' }
            );
          }
        }
        setShowInterviewModal(false);
        setInterviewDate('');
        setSelectedStatusObj(null);
        refetchApps();
      } else {
        setToastMsg(result.message);
      }
    } catch (_) {
      setToastMsg('Interview schedules failed.');
    }
  };
  const handleSaveCorporateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Upload the new profile pic (same /api/v1/profilepic endpoint for all roles) if chosen
      if (compPicFile) {
        setCompPicUploading(true);
        const up = await uploadProfilePic(compPicFile);
        if (!up.success) {
          setToastMsg(t('dash.toast.logoUploadFailed', { msg: up.message }));
          setCompPicUploading(false);
          return;
        }
        bustProfileImageCache();
      }
      const res = await updateCompanyProfile({
        address: compAddress,
        stateId: compStateId,
        state: compState,
        districtId: compDistrictId,
        district: compDistrict,
        talukaId: compTalukaId,
        taluka: compTaluka,
        mobile: compMobile,
        email: compEmail,
        contactPerson: compContact,
        alternateContactPerson: compAltContact,
        alternateContactNumber: compAltNumber,
        companyTypeId: 0,
        companyTypeName: compCompanyType,
        industryTypeId: 0,
        industryTypeName: compIndustry,
        discription: compDescription,
        website: compWebsite,
        alternateEmail: compAltEmail,
      });
      if (res.success) {
        setToastMsg(t('dash.toast.profileUpdated'));
        setCompPicFile(null);
        setCompPicPreview('');
        refetchProfile();
      } else {
        setToastMsg(res.message);
      }
    } catch (err: any) {
      setToastMsg(err.message || 'Failed profile save.');
    } finally {
      setCompPicUploading(false);
    }
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start text-left font-sans">
      <DashboardMenu>
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 ${activeTab === 'overview' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
            }`}
        >
          <Tag className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.overview')}</span>
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 ${activeTab === 'pipeline' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
            }`}
        >
          <Compass className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.pipeline')} ({pipelineApps.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 ${activeTab === 'listings' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
            }`}
        >
          <Briefcase className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.vacancies')} ({jobsList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('post')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 ${activeTab === 'post' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
            }`}
        >
          <FilePlus className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.postJob')}</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 ${activeTab === 'profile' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
            }`}
        >
          <Settings className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.profileSettings')}</span>
        </button>
        <button
          onClick={() => setActiveTab('support_tickets')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 ${activeTab === 'support_tickets' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
            }`}
        >
          <LifeBuoy className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.viewTicket')}</span>
        </button>
        <hr className="my-1 border-theme-lightViolet/60 hidden lg:block" />
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to log off?')) {
              dispatch(logout());
              navigate('/login');
            }
          }}
          className="px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 mt-2 cursor-pointer"
        >
          <Power className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.logOff')}</span>
        </button>
      </DashboardMenu>
      <div className="lg:col-span-9 space-y-6">
        {/* Overview tab - Employer Control Dashboard */}
        {activeTab === 'overview' && (
          <LiveDashboardStats />
        )}
        {/* Verification Alert status banner if unapproved recruiter */}
        {profile && !profile.isApproved && (
          <Alert
            type="warning"
            title={t('dash.employer.reviewPending')}
            message="Your employer recruiter profile verification is actively pending review by Shree Swami Samarth self-employment staff handlers. Once verified, your posted vacancies will instantly receive high-priority visibility!"
          />
        )}
        {/* 1. Job application Pipelines tab */}
        {activeTab === 'pipeline' && (
          <Card title={t('dash.employer.pipelineTitle')}>
            {pipelineApps.length === 0 ? (
              <EmptyState title="No Applicants Found" desc="Vacancies you post will gather seekers applied pipelines here." />
            ) : (
              <>
                {/* Search & Filter bar */}
                <div className="flex flex-col sm:flex-row gap-3 pb-4 border-b border-slate-100">
                  <div className="relative flex-1 min-w-0">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-3.5 w-3.5 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search by name, job title, phone..."
                      value={pipelineSearch}
                      onChange={(e) => setPipelineSearch(e.target.value)}
                      className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <select
                      value={pipelineStatusFilter}
                      onChange={(e) => setPipelineStatusFilter(e.target.value)}
                      className="flex-1 sm:flex-none min-w-0 max-w-full sm:w-40 text-xs px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 font-semibold cursor-pointer"
                    >
                      <option value="">All Statuses</option>
                      {pipelineStatusOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
                    </select>
                    <select
                      value={pipelineJobFilter}
                      onChange={(e) => setPipelineJobFilter(e.target.value)}
                      className="flex-1 sm:flex-none min-w-0 max-w-full sm:w-48 text-xs px-3 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800 font-semibold cursor-pointer"
                    >
                      <option value="">All Jobs</option>
                      {uniqueJobTitles.map((title) => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                    {(pipelineSearch || pipelineStatusFilter || pipelineJobFilter) && (
                      <button
                        onClick={() => { setPipelineSearch(''); setPipelineStatusFilter(''); setPipelineJobFilter(''); }}
                        className="text-[10px] text-orange-600 font-bold hover:underline cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
                {/* Results count */}
                <div className="text-[10px] text-slate-400 font-bold pt-2">
                  Showing {filteredPipelineApps.length === 0 ? 0 : 1} to {Math.min(pipelineVisibleCount, filteredPipelineApps.length)} of {filteredPipelineApps.length} applicants
                </div>
                {/* Applicant cards */}
                <div className="space-y-4 pt-2">
                  {visiblePipelineApps.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6 font-medium">No applicants match your search/filters.</p>
                  ) : (
                    visiblePipelineApps.map((app) => (
                      <div key={app.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/50 pb-2.5">
                          <div className="space-y-1">
                            <button
                              onClick={() => app.candidateId && navigate(`/candidate/${app.candidateId}`)}
                              className="text-xs text-orange-600 font-extrabold uppercase tracking-wide hover:text-orange-800 hover:underline transition-colors text-left cursor-pointer"
                            >
                              {t('dash.employer.applicant', { name: app.candidateName })}
                            </button>
                            <h4 className="text-sm font-bold text-blue-950">{app.jobTitle}</h4>
                            <p className="text-[10px] text-gray-500 font-semibold block leading-none">
                              {t('dash.employer.mobileAppliedOn', { phone: app.candidatePhone, date: app.appliedAt })}
                            </p>
                          </div>
                          <div>
                            {(() => {
                              const override = localStatusOverrides[app.id];
                              const sId = override?.statusId || app.statusId || resolveStatusId(app.status);
                              const currentStatusObj = pipelineStatusOptions.find(s => s.id === sId);
                              const displayName = override?.statusName || currentStatusObj?.name || app.status || 'Applied';
                              const code = currentStatusObj?.statusCode || '';
                              if (code === 'INTERVIEW' || displayName.toLowerCase().includes('interview')) {
                                return (
                                  <Badge type="secondary">
                                    🗓️ {displayName.toUpperCase()}{app.interviewDate ? `: ${app.interviewDate}` : ''}
                                  </Badge>
                                );
                              }
                              if (code === 'SELECTED' || displayName.toLowerCase() === 'hired' || displayName.toLowerCase() === 'selected') {
                                return <Badge type="success">✓ {displayName.toUpperCase()}</Badge>;
                              }
                              if (code === 'REJECTED' || displayName.toLowerCase() === 'rejected') {
                                return <Badge type="danger">✕ {displayName.toUpperCase()}</Badge>;
                              }
                              if (code === 'SHORTLISTED' || displayName.toLowerCase() === 'shortlisted') {
                                return <Badge type="primary">★ {displayName.toUpperCase()}</Badge>;
                              }
                              return <Badge type="warning">{displayName.toUpperCase()}</Badge>;
                            })()}
                          </div>
                        </div>
                        {/* Interactive Status dropdown + Resume */}
                        <div className="flex flex-wrap gap-2 items-center">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Status:</label>
                          <select
                            value={localStatusOverrides[app.id]?.statusId || app.statusId || resolveStatusId(app.status) || pipelineStatusOptions[0]?.id || 1}
                            onChange={(e) => handleStatusSelectChange(app, e.target.value)}
                            className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 text-[10px] font-bold rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer shadow-sm hover:border-slate-300"
                          >
                            {pipelineStatusOptions.map((opt) => (
                              <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                          </select>
                          {app.remarks && (
                            <span className="text-[10px] text-slate-500 italic max-w-xs truncate" title={app.remarks}>
                              Note: {app.remarks}
                            </span>
                          )}
                          {/* Resume download mock button */}
                          <button
                            onClick={() => setToastMsg('Mock Resume Download complete! (Rahul_Resume.pdf)')}
                            className="ml-auto flex items-center gap-1 px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-850 text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" /> CV / Resume
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {/* Infinite scroll footer */}
                <div className="pt-4 border-t border-slate-100">
                  {pipelineHasMore && (
                    <div ref={loadMoreRef} className="flex flex-col items-center gap-2 py-2">
                      {pipelineLoadingMore ? (
                        <span className="text-[11px] text-slate-400 font-semibold animate-pulse">Loading more applicants...</span>
                      ) : (
                        <button
                          onClick={loadMorePipeline}
                          className="text-[11px] text-orange-600 font-bold hover:underline cursor-pointer"
                        >
                          Load more applicants
                        </button>
                      )}
                    </div>
                  )}
                  {!pipelineHasMore && filteredPipelineApps.length > 0 && (
                    <div className="text-center py-2">
                      <span className="text-[10px] text-slate-400 font-semibold">You've reached the end of the list.</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>
        )}
        {/* 2. Job Listings tab */}
        {activeTab === 'listings' && (
          selectedJobIdForDetail ? (
            <JobDetailsView jobId={selectedJobIdForDetail} jobCode={selectedJobCode} onBack={() => { setSelectedJobIdForDetail(null); setSelectedJobCode(undefined); }} />
          ) : isPostingNewJob ? (
            <AddJobForm onCancel={() => setIsPostingNewJob(false)} onSuccess={() => { setIsPostingNewJob(false); refetchJobs(); }} />
          ) : (
            <>
              <JobListingView
                onViewDetails={(id, jobCode) => { setSelectedJobIdForDetail(id); setSelectedJobCode(jobCode); }}
                onEditJob={(id) => setSelectedJobIdForEdit(id)}
                onAddNewJob={() => setIsPostingNewJob(true)}
                externalJobs={jobsList}
                externalTotalCount={jobsList.length}
                externalRefetch={refetchJobs}
              />
              {/* Edit Job popup modal */}
              <Modal
                isOpen={selectedJobIdForEdit !== null}
                onClose={() => setSelectedJobIdForEdit(null)}
                title={t('dash.admin.editJobTitle')}
                maxWidthClass="max-w-3xl"
              >
                {selectedJobIdForEdit !== null && (
                  <EditJobForm
                    jobId={selectedJobIdForEdit}
                    onCancel={() => setSelectedJobIdForEdit(null)}
                    onSuccess={() => { setSelectedJobIdForEdit(null); refetchJobs(); }}
                  />
                )}
              </Modal>
            </>
          )
        )}
        {/* 3. Job creation Post vacancy Form tab */}
        {activeTab === 'post' && (
          <AddJobForm onSuccess={() => setActiveTab('listings')} />
        )}
        {/* Support Tickets - View Ticket */}
        {activeTab === 'support_tickets' && (
          <SupportTicketsView setToastMsg={setToastMsg} />
        )}
        {/* 4. Recruiter Settings Profile card updater */}
        {activeTab === 'profile' && (
          <Card title={t('dash.employer.profileTitle')}>
            <form onSubmit={handleSaveCorporateProfile} className="space-y-5">
              {/* Company logo / profile pic */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  {compPicPreview ? (
                    <img src={compPicPreview} alt="Logo preview" className="w-20 h-20 rounded-full object-cover ring-4 ring-theme-lightViolet shadow-sm" />
                  ) : profile?.profilePicUrl ? (
                    <img src={profile.profilePicUrl} alt="Company logo" className="w-20 h-20 rounded-full object-cover ring-4 ring-theme-lightViolet shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-theme-lightViolet border-2 border-dashed border-theme-sage/60 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-theme-lavender/60" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center sm:items-start gap-1.5">
                  <p className="text-xs font-bold text-slate-800">{compName || '—'}</p>
                  <button
                    type="button"
                    onClick={() => compPicInputRef.current?.click()}
                    className="px-4 py-2 text-xs font-bold bg-theme-lightViolet hover:bg-theme-lightViolet/60 text-theme-darkViolet rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" /> {compPicFile ? 'Change Logo' : 'Upload Logo / Profile Pic'}
                  </button>
                  <p className="text-[10px] text-slate-500 font-semibold">Images are uploaded along with the Save action.</p>
                  <input
                    ref={compPicInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setCompPicFile(f);
                        setCompPicPreview(URL.createObjectURL(f));
                      }
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextBox
                  label={t('dash.form.liaisonName')}
                  value={compContact}
                  onChange={(e) => setCompContact(e.target.value)}
                  required
                />
                <TextBox
                  label={t('dash.form.mobile')}
                  value={compMobile}
                  onChange={(e) => setCompMobile(e.target.value)}
                />
                <TextBox
                  label={t('dash.form.email')}
                  type="email"
                  value={compEmail}
                  onChange={(e) => setCompEmail(e.target.value)}
                />
                <TextBox
                  label={t('dash.form.industryType')}
                  value={compIndustry}
                  onChange={(e) => setCompIndustry(e.target.value)}
                />
                <TextBox
                  label={t('dash.form.companyType')}
                  value={compCompanyType}
                  onChange={(e) => setCompCompanyType(e.target.value)}
                />
                <TextBox
                  label={t('dash.form.altContactPerson')}
                  value={compAltContact}
                  onChange={(e) => setCompAltContact(e.target.value)}
                />
                <TextBox
                  label={t('dash.form.altContactNumber')}
                  value={compAltNumber}
                  onChange={(e) => setCompAltNumber(e.target.value)}
                />
                <TextBox
                  label={t('dash.form.altEmail')}
                  type="email"
                  value={compAltEmail}
                  onChange={(e) => setCompAltEmail(e.target.value)}
                />
                <TextBox
                  label={t('dash.form.website')}
                  value={compWebsite}
                  onChange={(e) => setCompWebsite(e.target.value)}
                />
                <Dropdown
                  label={t('dash.form.state')}
                  options={[
                    { value: '0', label: t('reg.option.selectState') },
                    ...compStates.map(s => ({ value: String(s.id), label: getLocalizedName(s) }))
                  ]}
                  value={String(compStateId)}
                  onChange={(e) => handleCompStateChange(Number(e.target.value))}
                />
                <Dropdown
                  label={t('dash.form.district')}
                  options={[
                    { value: '0', label: t('reg.option.selectDistrict') },
                    ...compDistricts.map(d => ({ value: String(d.id), label: getLocalizedName(d) }))
                  ]}
                  value={String(compDistrictId)}
                  onChange={(e) => handleCompDistrictChange(Number(e.target.value))}
                  disabled={!compStateId}
                />
                <Dropdown
                  label={t('dash.form.taluka')}
                  options={[
                    { value: '0', label: t('reg.option.selectTaluka') },
                    ...compTalukas.map(tl => ({ value: String(tl.id), label: getLocalizedName(tl) }))
                  ]}
                  value={String(compTalukaId)}
                  onChange={(e) => handleCompTalukaChange(Number(e.target.value))}
                  disabled={!compDistrictId}
                />
              </div>
              <TextArea
                label={t('dash.form.corporateAddress')}
                value={compAddress}
                onChange={(e) => setCompAddress(e.target.value)}
              />
              <TextArea
                label={t('dash.form.companyDesc')}
                value={compDescription}
                onChange={(e) => setCompDescription(e.target.value)}
              />
              <div className="flex justify-end">
                <PrimaryButton type="submit" disabled={compPicUploading}>
                  {compPicUploading ? t('dash.form.uploading') : t('dashboard.save')}
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
        title={t('dash.employer.interviewModalTitle')}
      >
        <form onSubmit={handleScheduleInterviewSubmit} className="space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed font-semibold">
            Choose a suitable date and coordinates timing setup. An automated notification will sync to the applicant tracking panel.
          </p>
          <TextBox
            label={t('dash.form.interviewDate')}
            type="datetime-local"
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2.5 pt-4">
            <SecondaryButton onClick={() => setShowInterviewModal(false)}>
              {t('dash.form.close')}
            </SecondaryButton>
            <PrimaryButton type="submit">
              {t('dash.form.setInterviewDate')}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
      {/* Status Update Confirmation & Remarks Dialog */}
      <Modal
        isOpen={statusUpdateApp !== null && selectedStatusObj !== null}
        onClose={() => {
          if (!isUpdatingStatus) {
            setStatusUpdateApp(null);
            setSelectedStatusObj(null);
            setStatusRemarks('');
          }
        }}
        title={t('dash.employer.statusModalTitle')}
      >
        {statusUpdateApp && selectedStatusObj && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeStatusUpdate(statusUpdateApp, selectedStatusObj, statusRemarks);
            }}
            className="space-y-4"
          >
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
              <p className="text-xs font-bold text-slate-800">
                {t('dash.employer.applicantLabel')} <span className="text-orange-600 font-extrabold">{statusUpdateApp.candidateName}</span>
              </p>
              <p className="text-xs text-slate-600">
                {t('dash.employer.jobLabel')} <span className="font-semibold text-blue-950">{statusUpdateApp.jobTitle}</span>
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-500">{t('dash.employer.targetStatus')}:</span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-850">
                  {selectedStatusObj.name}
                </span>
              </div>
              {selectedStatusObj.description && (
                <p className="text-[11px] text-slate-500 italic pt-0.5">
                  {selectedStatusObj.description}
                </p>
              )}
            </div>
            <TextArea
              label={t('dash.form.remarks')}
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              placeholder="e.g., Shortlisted based on profile screening, round completed, etc."
              rows={3}
            />
            <div className="flex justify-end gap-2.5 pt-3">
              <SecondaryButton
                disabled={isUpdatingStatus}
                onClick={() => {
                  setStatusUpdateApp(null);
                  setSelectedStatusObj(null);
                  setStatusRemarks('');
                }}
              >
                {t('dash.form.cancel')}
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isUpdatingStatus}>
                {isUpdatingStatus ? t('dash.form.updating') : t('dash.form.confirmStatus')}
              </PrimaryButton>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
// ==========================================
// INTEGRATED SUB-BOARD: JOB SEEKER / CANDIDATE PORTAL
// ==========================================
function CandidateSeekerDashboard({ candidateId, setToastMsg }: { candidateId: string; setToastMsg: (msg: string) => void }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedJobIdForDetail, setSelectedJobIdForDetail] = useState<number | null>(null);
  const [selectedJobCode, setSelectedJobCode] = useState<string | undefined>(undefined);
  // Optimistic tracking of newly applied job IDs for instant UI updates
  const [recentlyAppliedIds, setRecentlyAppliedIds] = useState<Set<string>>(new Set());
  // Load seeker profile from unified endpoint
  const { data: profile, refetch: refetchProfile } = useGetMyProfileQuery(undefined, { skip: !user });
  const [updateProfile] = useUpdateCandidateMutation();
  // Load jobs lists (Approved only!) — skip until user/token are ready
  const { data: availableJobs = [], refetch: refetchJobs } = useGetJobsQuery({ approvedOnly: true }, { skip: !user });
  // Load jobs from TanStack Query (same source as JobListingView, has userJobStatus)
  const { data: searchJobsData, refetch: refetchSearchJobs } = useSearchJobsQuery(undefined, { enabled: !!user });
  const searchJobs = searchJobsData?.jobs || [];
  // Load applications history tracking
  const { data: myApps = [], refetch: refetchMyApps } = useGetApplicationsQuery({ candidateId }, { skip: !user || !candidateId });
  // Load options metadata
  const { data: locations = [] } = useGetLocationsQuery();
  // Profile data forms state
  const [fullName, setFullName] = useState('');
  const [seekerCity, setSeekerCity] = useState('Nashik');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState(0);
  const [skillsText, setSkillsText] = useState('');
  const [resumeName, setResumeName] = useState('');
  // Dynamic Live API Cascaded Dropdowns Section
  const [liveCountryId, setLiveCountryId] = useState<number>(1); // Default to India (1)
  const [liveStateId, setLiveStateId] = useState<number>(1); // Default to Maharashtra (1)
  const [liveDistrictId, setLiveDistrictId] = useState<number>(6); // Default to Nashik (6)
  const [liveTalukaId, setLiveTalukaId] = useState<number>(82); // Default to Nashik (82)
  const [liveSevaKendraId, setLiveSevaKendraId] = useState<number>(159);
  const [liveEducationId, setLiveEducationId] = useState<number>(12); // Default to B.Tech/B.E. (12)
  const [liveSubEducationId, setLiveSubEducationId] = useState<number>(0);
  const { data: liveCountries = [] } = useGetCountriesQuery();
  const { data: liveStates = [] } = useGetStatesQuery(liveCountryId, { skip: !liveCountryId });
  const { data: liveDistricts = [] } = useGetDistrictsQuery(liveStateId, { skip: !liveStateId });
  const { data: liveTalukas = [] } = useGetTalukasQuery(liveDistrictId, { skip: !liveDistrictId });
  const { data: liveSevaKendras = [] } = useGetSevaKendrasQuery(liveTalukaId, { skip: !liveTalukaId });
  const { data: liveEducationsList = [] } = useGetEducationsListQuery();
  const { data: liveSubEducationsList = [] } = useGetSubEducationsListQuery(liveEducationId, { skip: !liveEducationId });
  const handleAutofillLiveSelections = () => {
    const countryObj = liveCountries.find(c => c.id === Number(liveCountryId));
    const stateObj = liveStates.find(s => s.id === Number(liveStateId));
    const districtObj = liveDistricts.find(d => d.id === Number(liveDistrictId));
    const talukaObj = liveTalukas.find(t => t.id === Number(liveTalukaId));
    const skObj = liveSevaKendras.find(sk => sk.id === Number(liveSevaKendraId));
    const eduObj = liveEducationsList.find(e => e.id === Number(liveEducationId));
    const subEduObj = liveSubEducationsList.find(se => se.id === Number(liveSubEducationId));
    const parts: string[] = [];
    if (skObj) parts.push(skObj.name);
    if (talukaObj) parts.push(getLocalizedName(talukaObj));
    if (districtObj) parts.push(getLocalizedName(districtObj));
    if (stateObj) parts.push(getLocalizedName(stateObj));
    if (countryObj && countryObj.name !== 'INDIA') parts.push(countryObj.name);
    if (parts.length > 0) {
      setSeekerCity(parts.join(', '));
    }
    if (eduObj) {
      setQualification(subEduObj ? `${eduObj.name} - ${subEduObj.name}` : eduObj.name);
    }
    setToastMsg(t('dash.toast.selectionsPopulated'));
  };
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
        candidateName: fullName || fullName || "",
        candidatePhone: profile?.phone || profile?.phone || ""
      }).unwrap();
      setToastMsg(t('dash.toast.appliedRole'));
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
      setToastMsg(t('dash.toast.candidateProfilesaved'));
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
  const hasAppliedStatus = (status?: string): boolean => {
    const s = (status || '').trim();
    return !!s && !/^not\s*applied$/i.test(s);
  };
  const displayAppliedStatus = (status?: string): string => {
    const s = (status || '').trim();
    return !s || /^already\s*applied$/i.test(s) ? 'Applied' : s;
  };
  const isJobApplied = (jobId: number, job?: Job): boolean => {
    if (recentlyAppliedIds.has(String(jobId))) return true;
    if (job?.jobCode && recentlyAppliedIds.has(job.jobCode)) return true;
    if (hasAppliedStatus(job?.userJobStatus)) return true;
    const sj = searchJobs.find((j: any) => Number(j.id) === jobId);
    if (sj && hasAppliedStatus(sj.userJobStatus)) return true;
    return false;
  };
  const appliedJobIds = React.useMemo(() => {
    const ids = new Set<number>();
    const addFrom = (list: any[]) =>
      list.forEach((j: any) => {
        if (isJobApplied(Number(j.id), j)) ids.add(Number(j.id));
      });
    addFrom(availableJobs);
    addFrom(searchJobs);
    return [...ids];
  }, [availableJobs, searchJobs, recentlyAppliedIds]);
  const apiAppliedCount = Math.max(
    searchJobs.filter((j: any) => hasAppliedStatus(j.userJobStatus)).length,
    availableJobs.filter((j) => hasAppliedStatus(j.userJobStatus)).length
  );
  const appliedCount = Math.max(apiAppliedCount, recentlyAppliedIds.size, myApps.length);
  const filteredJobs = availableJobs.filter((j) => {
    const query = searchPhrase.toLowerCase();
    const sj = searchJobs.find((s: any) => String(s.id) === String(j.id) || s.jobCode === j.jobCode);
    const isApplied = hasAppliedStatus(j.userJobStatus) || hasAppliedStatus(sj?.userJobStatus);
    return (
      !isApplied &&
      (j.title.toLowerCase().includes(query) ||
        j.companyName.toLowerCase().includes(query) ||
        j.location.toLowerCase().includes(query) ||
        j.category.toLowerCase().includes(query))
    );
  });
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start text-left font-sans">
      <DashboardMenu>
        <button
          onClick={() => { setActiveTab('overview'); setSelectedJobIdForDetail(null); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 ${activeTab === 'overview' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
            }`}
        >
          <Tag className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.overview')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('search'); setSelectedJobIdForDetail(null); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 ${activeTab === 'search' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
            }`}
        >
          <Search className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.findJobs')}</span>
        </button>
        <button
          onClick={() => { setActiveTab('history'); setSelectedJobIdForDetail(null); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 ${activeTab === 'history' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
            }`}
        >
          <History className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.applied')} ({appliedCount})</span>
        </button>
        <button
          onClick={() => { setActiveTab('support_tickets'); setSelectedJobIdForDetail(null); }}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 ${activeTab === 'support_tickets' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
            }`}
        >
          <LifeBuoy className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.viewTicket')}</span>
        </button>
        <hr className="my-1 border-theme-lightViolet/60 hidden lg:block" />
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to log off?')) {
              dispatch(logout());
              navigate('/login');
            }
          }}
          className="px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 mt-2 cursor-pointer"
        >
          <Power className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.logOff')}</span>
        </button>
      </DashboardMenu>
      <div className="lg:col-span-9 space-y-6">
        {/* Overview tab - Candidate Dashboard */}
        {activeTab === 'overview' && (
          <>
            {/* Mobile-only: jump straight to Find Jobs */}
            <div className="lg:hidden">
              <button
                onClick={() => { setActiveTab('search'); setSelectedJobIdForDetail(null); }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-linear-to-r from-theme-darkViolet via-[#3a1f8f] to-theme-lavender text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer text-left"
              >
                <span className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-extrabold leading-tight">{t('dash.candidate.findNewJobs')}</span>
                  <span className="block text-[10px] font-semibold text-white/70 leading-tight mt-0.5">Explore fresh openings & apply in one tap</span>
                </span>
                <Briefcase className="w-4 h-4 text-white/80 shrink-0" />
              </button>
            </div>
            <LiveDashboardStats appliedJobsOverride={appliedCount} />
          </>
        )}
        {/* Profile incomplete warning to push CV uploads */}
        {!resumeName && (
          <Alert
            type="info"
            title={t('dash.candidate.resumeUploadRequired')}
            message="Please upload your digital Resume/CV in PDF format under the Profile page (Resume tab) to ensure verified recruiters can download and review your competencies!"
          />
        )}
        {/* 1. Job search list tab */}
        {activeTab === 'search' && (
          selectedJobIdForDetail ? (
            <JobDetailsView
              jobId={selectedJobIdForDetail}
              jobCode={selectedJobCode}
              onBack={() => { setSelectedJobIdForDetail(null); setSelectedJobCode(undefined); }}
              onApplySuccess={(appliedJobCode?: string) => {
                const job =
                  availableJobs.find((j) => Number(j.id) === selectedJobIdForDetail) ||
                  (searchJobs as any[]).find((j: any) => Number(j.id) === selectedJobIdForDetail);
                const identifier = appliedJobCode || job?.jobCode || String(selectedJobIdForDetail);
                setRecentlyAppliedIds((prev) =>
                  new Set(prev).add(identifier).add(String(selectedJobIdForDetail ?? ''))
                );
                setSelectedJobIdForDetail(null);
                setSelectedJobCode(undefined);
                refetchMyApps();
                refetchJobs();
                refetchSearchJobs();
              }}
              alreadyApplied={isJobApplied(
                selectedJobIdForDetail,
                availableJobs.find((j) => Number(j.id) === selectedJobIdForDetail) ||
                (searchJobs as any[]).find((j: any) => Number(j.id) === selectedJobIdForDetail)
              )}
            />
          ) : (
            <JobListingView
              onViewDetails={(id, jobCode) => { setSelectedJobIdForDetail(id); setSelectedJobCode(jobCode); }}
              appliedJobIds={appliedJobIds}
            />
          )
        )}
        {/* 2. Job history tab */}
        {activeTab === 'history' && (
          selectedJobIdForDetail ? (
            <JobDetailsView
              jobId={selectedJobIdForDetail}
              onBack={() => setSelectedJobIdForDetail(null)}
              alreadyApplied={true}
            />
          ) : (
            <Card title={t('dash.candidate.activeApplications')}>
              {(() => {
                const mergedApps: Array<{ id: string; jobTitle: string; companyName: string; status: string; numericId?: number; jobCode?: string }> = [];
                const seenKeys = new Set<string>();
                const addKey = (k?: string | number) => {
                  if (k === undefined || k === null) return;
                  const s = String(k).trim();
                  if (s) seenKeys.add(s);
                };
                // Applications from the applications history API (myApps) carry the
                // authoritative, employer-updated status → add these first.
                myApps.forEach((a) => {
                  const numId = parseInt(String(a.jobId).replace(/\D/g, ''), 10);
                  const validNum = numId && !isNaN(numId) ? numId : undefined;
                  const override = getApplicationStatusOverride({
                    applicationId: a.applicationId,
                    id: a.id,
                    jobId: a.jobId,
                    jobCode: a.jobCode,
                  });
                  if (!mergedApps.some((m) => m.id === a.id)) {
                    mergedApps.push({
                      id: a.id,
                      jobTitle: a.jobTitle || 'Job',
                      companyName: a.companyName || 'Company',
                      status: override?.statusName || displayAppliedStatus(a.status),
                      numericId: validNum
                    });
                    addKey(a.id);
                    addKey(a.jobId);
                    if (validNum) addKey(validNum);
                  }
                });
                // Jobs from searchJobs API (TanStack Query) where userJobStatus indicates
                // already applied — only used as a fallback for jobs not in myApps.
                searchJobs.forEach((j: any) => {
                  if (hasAppliedStatus(j.userJobStatus)) {
                    const numId = Number(j.id);
                    if (numId && !isNaN(numId) && !seenKeys.has(String(numId))) {
                      const override = getApplicationStatusOverride({ id: j.id, jobId: j.id, jobCode: j.jobCode });
                      mergedApps.push({ id: String(j.id), jobTitle: j.jobDesignation || j.profileHeader || 'Job', companyName: j.companyName || j.postingNotes || 'Company', status: override?.statusName || displayAppliedStatus(j.userJobStatus), numericId: numId, jobCode: j.jobCode });
                      addKey(numId);
                      if (j.jobCode) addKey(j.jobCode);
                    }
                  }
                });
                // Also check availableJobs (RTK Query) as a fallback.
                availableJobs.forEach((j) => {
                  if (hasAppliedStatus(j.userJobStatus)) {
                    const numId = Number(j.id);
                    if (numId && !isNaN(numId) && !seenKeys.has(String(numId))) {
                      const override = getApplicationStatusOverride({ id: j.id, jobId: j.id, jobCode: j.jobCode });
                      mergedApps.push({ id: String(j.id), jobTitle: j.title, companyName: j.companyName, status: override?.statusName || displayAppliedStatus(j.userJobStatus), numericId: numId, jobCode: j.jobCode });
                      addKey(numId);
                      if (j.jobCode) addKey(j.jobCode);
                    }
                  }
                });
                // Optimistic entries from recent applies in this session
                recentlyAppliedIds.forEach((code) => {
                  if (!seenKeys.has(code)) {
                    const job =
                      availableJobs.find((j) => String(j.id) === code || j.jobCode === code) ||
                      (searchJobs as any[]).find((j: any) => String(j.id) === code || j.jobCode === code);
                    if (job) {
                      mergedApps.unshift({
                        id: `local-${code}`,
                        jobTitle: job.jobDesignation || job.profileHeader || job.title,
                        companyName: job.companyName,
                        status: 'Applied',
                        numericId: Number(job.id),
                        jobCode: job.jobCode,
                      });
                      addKey(code);
                      if (job.id) addKey(job.id);
                      if (job.jobCode) addKey(job.jobCode);
                    }
                  }
                });
                if (mergedApps.length === 0) {
                  return <EmptyState title="No Applications" desc="You have not applied to any job yet." />;
                }
                return (
                  <div className="space-y-4">
                    {mergedApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={app.numericId ? () => setSelectedJobIdForDetail(app.numericId!) : undefined}
                        className={`p-3 lg:p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3 text-left transition-all ${app.numericId ? 'hover:bg-orange-50 hover:border-orange-200 cursor-pointer' : ''}`}
                      >
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-bold text-slate-800">{app.jobTitle}</h4>
                          <p className="text-xs text-slate-600 font-bold block leading-none">{t('dash.candidate.companyName', { name: app.companyName })}</p>
                        </div>
                        <div>
                          <Badge type="primary">{app.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Card>
          )
        )}
        {/* Support Tickets - View Ticket */}
        {activeTab === 'support_tickets' && (
          <SupportTicketsView setToastMsg={setToastMsg} />
        )}
        {/* 3. Seeker Profile settings updater */}
        {activeTab === 'profile' && (
          <Card title={t('dash.candidate.profileTitle')}>
            <form onSubmit={handleSaveSeekerProfile} className="space-y-5">
              <TextBox
                label={t('dash.form.fullName')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Dropdown
                  label={t('dash.form.city')}
                  options={locations.map(l => ({ value: l.value, label: i18n.language === 'mr' ? l.labelMr : l.labelEn }))}
                  value={seekerCity}
                  onChange={(e) => setSeekerCity(e.target.value)}
                />
                <Dropdown
                  label={t('dash.form.degree')}
                  options={[
                    { value: '', label: t('reg.option.selectEducation') },
                    ...liveEducationsList.map(e => ({ value: e.name, label: e.name })),
                    ...(qualification && !liveEducationsList.some(e => e.name === qualification)
                      ? [{ value: qualification, label: qualification }]
                      : [])
                  ]}
                  value={qualification}
                  onChange={(e) => {
                    setQualification(e.target.value);
                    const m = liveEducationsList.find(ed => ed.name === e.target.value);
                    setLiveEducationId(m ? m.id : 0);
                  }}
                  required
                />
                <TextBox
                  label={t('dash.form.experience')}
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(Number(e.target.value))}
                />
              </div>
              <TextBox
                label={t('dash.form.keySkills')}
                value={skillsText}
                placeholder="E.g. Sales, Drivers license, Computer typing, tailoring"
                onChange={(e) => setSkillsText(e.target.value)}
              />
              {/* Live srgapp Swagger APIs location locator */}
              <div className="bg-orange-50/40 border border-orange-100 rounded-2xl p-5 space-y-4">
                <div className="text-left">
                  <h4 className="text-sm font-bold text-blue-950 flex items-center gap-1.5 md:text-base">
                    <span>🌍</span> {t('dash.candidate.liveDataFinder')}
                  </h4>
                  <p className="text-xs text-slate-550 mt-1 leading-normal">
                    {t('dash.candidate.liveDataHelp')}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Location Group */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-orange-700 uppercase tracking-wider block text-left">{t('dash.candidate.locationCascade')}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="text-left">
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t('dash.form.country')}</label>
                        <select
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-700"
                          value={liveCountryId}
                          onChange={(e) => {
                            setLiveCountryId(Number(e.target.value));
                            setLiveStateId(0);
                            setLiveDistrictId(0);
                            setLiveTalukaId(0);
                            setLiveSevaKendraId(0);
                          }}
                        >
                          <option value="0">{t('reg.option.selectCountry')}</option>
                          {liveCountries.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="text-left">
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t('dash.form.state')}</label>
                        <select
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-700"
                          value={liveStateId}
                          onChange={(e) => {
                            setLiveStateId(Number(e.target.value));
                            setLiveDistrictId(0);
                            setLiveTalukaId(0);
                            setLiveSevaKendraId(0);
                          }}
                          disabled={!liveCountryId}
                        >
                          <option value="0">{t('reg.option.selectState')}</option>
                          {liveStates.map(s => (
                            <option key={s.id} value={s.id}>{getLocalizedName(s)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="text-left">
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t('dash.form.district')}</label>
                        <select
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-700"
                          value={liveDistrictId}
                          onChange={(e) => {
                            setLiveDistrictId(Number(e.target.value));
                            setLiveTalukaId(0);
                            setLiveSevaKendraId(0);
                          }}
                          disabled={!liveStateId}
                        >
                          <option value="0">{t('reg.option.selectDistrict')}</option>
                          {liveDistricts.map(d => (
                            <option key={d.id} value={d.id}>{getLocalizedName(d)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="text-left">
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t('dash.form.taluka')}</label>
                        <select
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-700"
                          value={liveTalukaId}
                          onChange={(e) => {
                            setLiveTalukaId(Number(e.target.value));
                            setLiveSevaKendraId(0);
                          }}
                          disabled={!liveDistrictId}
                        >
                          <option value="0">{t('reg.option.selectTaluka')}</option>
                          {liveTalukas.map(t => (
                            <option key={t.id} value={t.id}>{getLocalizedName(t)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="text-left">
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t('dash.form.sevaKendra')}</label>
                        <select
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-700"
                          value={liveSevaKendraId}
                          onChange={(e) => setLiveSevaKendraId(Number(e.target.value))}
                          disabled={!liveTalukaId}
                        >
                          <option value="0">{t('reg.option.selectSevaKendra')}</option>
                          {liveSevaKendras.map(sk => (
                            <option key={sk.id} value={sk.id}>{sk.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* Education Group */}
                  <div className="space-y-3 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-5">
                    <h5 className="text-xs font-bold text-orange-700 uppercase tracking-wider block text-left">{t('dash.candidate.educationCascade')}</h5>
                    <div className="space-y-3">
                      <div className="text-left">
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t('dash.form.highestEducation')}</label>
                        <select
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-700"
                          value={liveEducationId}
                          onChange={(e) => {
                            setLiveEducationId(Number(e.target.value));
                            setLiveSubEducationId(0);
                          }}
                        >
                          <option value="0">{t('reg.option.selectEducation')}</option>
                          {liveEducationsList.map(e => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="text-left">
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">{t('dash.form.subEducation')}</label>
                        <select
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-700"
                          value={liveSubEducationId}
                          onChange={(e) => setLiveSubEducationId(Number(e.target.value))}
                          disabled={!liveEducationId}
                        >
                          <option value="0">{t('reg.option.selectSpecialization')}</option>
                          {liveSubEducationsList.map(se => (
                            <option key={se.id} value={se.id}>{se.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleAutofillLiveSelections}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                  >
                    📝 {t('dash.candidate.autofill')}
                  </button>
                </div>
              </div>
              {/* Real Resume Drag and Drop / select mock upload */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-gray-700">
                  {t('dash.candidate.uploadResumeBtn')}
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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('trainings');
  // Load trainings list
  const { data: trainings = [] } = useGetTrainingsQuery(undefined, { skip: !user });
  const { data: myProfile } = useGetMyProfileQuery(undefined, { skip: !user });
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
      name: t('dash.shg.seedProductName'),
      description: t('dash.shg.seedProductDesc'),
      price: 150
    }
  ]);
  // Product submission fields
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [updateSHG] = useUpdateSHGProfileMutation();
  const handleEnrollTraining = (courseTitle: string) => {
    setToastMsg(t('dash.toast.trainingEnrolled', { name: courseTitle }));
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
    setToastMsg(t('dash.toast.productAdded'));
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
      setToastMsg(t('dash.toast.shgUpdated'));
    } catch (_) {
      setToastMsg('Failed profiles updaters');
    }
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start text-left font-sans">
      <DashboardMenu>
        <button
          onClick={() => setActiveTab('trainings')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 ${activeTab === 'trainings' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
            }`}
        >
          <Award className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.courses')}</span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 ${activeTab === 'products' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
            }`}
        >
          <ShoppingBag className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.sellProducts')}</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 ${activeTab === 'profile' ? 'btn-gloss bg-theme-lavender text-white shadow-md' : 'bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80'
            }`}
        >
          <Settings className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.groupProfiles')}</span>
        </button>
        <hr className="my-1 border-theme-lightViolet/60 hidden lg:block" />
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to log off?')) {
              dispatch(logout());
              navigate('/login');
            }
          }}
          className="px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 mt-2 cursor-pointer"
        >
          <Power className="w-4 h-4" /><span className="truncate min-w-0">{t('dash.menu.logOff')}</span>
        </button>
      </DashboardMenu>
      <div className="lg:col-span-9 space-y-6">
        {/* Live Dashboard API statistics */}
        <LiveDashboardStats />
        {/* Trainings listed tab */}
        {activeTab === 'trainings' && (
          <Card title={t('dash.shg.trainingTitle')}>
            <p className="text-xs text-slate-500 mb-6 font-semibold">
              {t('dash.shg.trainingIntro')}
            </p>
            <div className="space-y-4">
              {trainings.map((c) => (
                <div key={c.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2.5 rounded-md leading-normal uppercase">
                      {t('dash.shg.duration', { duration: c.duration })}
                    </span>
                    <h4 className="text-sm font-extrabold text-blue-950 mt-1 leading-tight">{i18n.language === 'mr' ? c.titleMr : c.titleEn}</h4>
                    <p className="text-xs text-slate-550 leading-relaxed font-semibold block">{i18n.language === 'mr' ? c.descriptionMr : c.descriptionEn}</p>
                    <p className="text-[10px] text-gray-400 font-bold block uppercase mt-1 leading-none">
                      {t('dash.shg.instructorAndStart', { instructor: c.instructor, startDate: c.startDate })}
                    </p>
                  </div>
                  <div>
                    <PrimaryButton onClick={() => handleEnrollTraining(i18n.language === 'mr' ? c.titleMr : c.titleEn)} className="px-4 py-2 text-xs font-semibold shrink-0 cursor-pointer">
                      {t('dash.shg.enrollCourse')}
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
            <Card title={t('dash.shg.addCraftTitle')}>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextBox
                    label={t('dash.form.itemName')}
                    placeholder={t('dash.form.itemNamePlaceholder')}
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    required
                  />
                  <TextBox
                    label={t('dash.form.retailPrice')}
                    type="number"
                    placeholder={t('dash.form.retailPricePlaceholder')}
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                  />
                </div>
                <TextArea
                  label={t('dash.form.briefDescription')}
                  placeholder={t('dash.form.briefDescriptionPlaceholder')}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                />
                <div className="flex justify-end">
                  <PrimaryButton type="submit">
                    {t('dash.shg.publishItem')}
                  </PrimaryButton>
                </div>
              </form>
            </Card>
            <Card title={t('dash.shg.catalogueTitle')}>
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
                        {prod.description || t('dash.shg.defaultProductDesc')}
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
          <Card title={t('dash.shg.groupInfoTitle')}>
            <form onSubmit={handleSaveSHGDetails} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextBox
                  label={t('dash.form.shgName')}
                  value={shgName}
                  onChange={(e) => setShgName(e.target.value)}
                  required
                />
                <TextBox
                  label={t('dash.form.leaderName')}
                  value={shgLeader}
                  onChange={(e) => setShgLeader(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextBox
                  label={t('dash.form.totalMembers')}
                  type="number"
                  value={memberCount}
                  onChange={(e) => setMemberCount(Number(e.target.value))}
                  required
                />
                <TextBox
                  label={t('dash.form.locationDistrict')}
                  value={shgDistrict}
                  onChange={(e) => setShgDistrict(e.target.value)}
                  required
                />
              </div>
              <TextBox
                label={t('dash.form.vocationActivities')}
                value={activitiesText}
                onChange={(e) => setActivitiesText(e.target.value)}
              />
              <div className="flex justify-end pt-3">
                <PrimaryButton type="submit">
                  {t('dash.form.saveGroupInfo')}
                </PrimaryButton>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
