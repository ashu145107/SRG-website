/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Standalone My Profile page with 3 tabs:
 *   1. Basic Details — shows all profile info from GET /api/v1/myprofile
 *   2. Profile Picture — upload via POST /api/v1/profilepic (multipart/form-data)
 *   3. Resume — upload via POST /api/v1/resume (multipart/form-data)
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { RootState } from '../store';
import { useGetMyProfileQuery, uploadProfilePic, uploadResume, bustProfileImageCache, updateUserPersonalInfo, updateUserEducationInfo } from '../services/profileApi';
import { Toast } from '../components/ui/FeedbackComponents';
import { Loader } from '../components/ui/FeedbackComponents';
import { DashboardMenu, DashboardMenuContext } from './DashboardHub';
import {
  UserCircle,
  Camera,
  FileUp,
  FileText,
  CheckCircle,
  LogOut,
  ChevronDown,
  Eye,
  Menu,
  X,
  Settings,
  BarChart3,
  LockKeyhole,
  Briefcase,
  Pencil,
  Save,
  GraduationCap
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { UserRole } from '../types';
import { isRoleAllowedForTab } from '../utils/roleTabMap';
import { EmploymentHistoryTab } from '../components/profile/EmploymentHistoryTab';

/**
 * Reads the EXIF orientation (1-8) from a JPEG buffer. Returns 1 (normal) for
 * non-JPEG files or when no orientation tag exists.
 */
const getJpegOrientation = (buffer: ArrayBuffer): number => {
  const view = new DataView(buffer);
  if (view.byteLength < 2 || view.getUint16(0, false) !== 0xffd8) return 1;

  let offset = 2;
  while (offset + 9 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) {
      offset++;
      continue;
    }
    const marker = view.getUint8(offset + 1);
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0x01 && marker <= 0x0f && marker !== 0x00)) {
      offset += 2;
      continue;
    }
    const len = view.getUint16(offset + 2, false);

    if (marker === 0xe1 && offset + 4 + 6 <= view.byteLength) {
      const start = offset + 4;
      const isExif =
        view.getUint8(start) === 0x45 && view.getUint8(start + 1) === 0x78 &&
        view.getUint8(start + 2) === 0x69 && view.getUint8(start + 3) === 0x66 &&
        view.getUint8(start + 4) === 0x00 && view.getUint8(start + 5) === 0x00;

      if (isExif) {
        const tiff = start + 6;
        const little = view.getUint16(tiff, false) === 0x4949;
        const ifd0 = tiff + view.getUint32(tiff + 4, little);
        const entries = view.getUint16(ifd0, little);

        for (let i = 0; i < entries; i++) {
          const entry = ifd0 + 2 + i * 12;
          if (entry + 12 > view.byteLength) break;
          if (view.getUint16(entry, little) === 0x0112) {
            if (view.getUint16(entry + 2, little) === 3 && view.getUint32(entry + 4, little) === 1) {
              return view.getUint16(entry + 8, little);
            }
          }
        }
      }
    }

    offset += 2 + len;
  }
  return 1;
};

/**
 * Instagram/Facebook-style avatar processing: applies the photo's EXIF
 * rotation, then center-crops it into a square PNG so it always fills the
 * circular profile picture cleanly (never big, tilted or off-center).
 */
const processProfileImage = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('Could not read image file.'));

    fr.onload = () => {
      const orientation = getJpegOrientation(fr.result as ArrayBuffer);
      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Unsupported image format.'));
      };

      img.onload = () => {
        try {
          const rotated = orientation >= 5 && orientation <= 8;
          const orientedW = rotated ? img.height : img.width;
          const orientedH = rotated ? img.width : img.height;

          const SIDE = Math.min(orientedW, orientedH, 640);
          const scale = Math.max(SIDE / img.width, SIDE / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;

          const canvas = document.createElement('canvas');
          canvas.width = SIDE;
          canvas.height = SIDE;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            reject(new Error('Canvas not supported.'));
            return;
          }

          ctx.translate(SIDE / 2, SIDE / 2);
          switch (orientation) {
            case 2: ctx.transform(-1, 0, 0, 1, 0, 0); break;   // flip horizontal
            case 3: ctx.transform(-1, 0, 0, -1, 0, 0); break;  // 180°
            case 4: ctx.transform(1, 0, 0, -1, 0, 0); break;   // flip vertical
            case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;    // 90° CW + flip
            case 6: ctx.transform(0, 1, -1, 0, 0, 0); break;   // 90° CW
            case 7: ctx.transform(0, -1, -1, 0, 0, 0); break;  // 90° CCW + flip
            case 8: ctx.transform(0, -1, 1, 0, 0, 0); break;   // 90° CCW
          }
          ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
          URL.revokeObjectURL(url);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not process image.'));
                return;
              }
              resolve(new File([blob], 'profile-pic.png', { type: 'image/png' }));
            },
            'image/png'
          );
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err as Error);
        }
      };

      img.src = url;
    };

    fr.readAsArrayBuffer(file);
  });

/** Convert an ISO/date string into the yyyy-mm-dd value a date input expects. */
const toInputDate = (value?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

/** Render an ISO/date string as a human-readable date. */
const formatDisplayDate = (value?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

interface DetailsFormState {
  fullName: string;
  mobile: string;
  email: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  state: string;
  district: string;
  taluka: string;
  pincode: string;
  address: string;
}

const emptyDetailsForm: DetailsFormState = {
  fullName: '',
  mobile: '',
  email: '',
  dob: '',
  gender: '',
  maritalStatus: '',
  state: '',
  district: '',
  taluka: '',
  pincode: '',
  address: '',
};

interface EducationFormState {
  education: string;
  specialization: string;
  skill: string;
  courses: string;
  experience: string;
  currentSalary: string;
  expectation: string;
  noticePeriod: string;
  preferredJobLocations: string;
  preferredJobTypeId: string;
  jobType: string;
  preferredShiftId: string;
  shiftType: string;
  workStatus: string;
  resumeHeadline: string;
  profileSummary: string;
}

const emptyEducationForm: EducationFormState = {
  education: '',
  specialization: '',
  skill: '',
  courses: '',
  experience: '',
  currentSalary: '',
  expectation: '',
  noticePeriod: '',
  preferredJobLocations: '',
  preferredJobTypeId: '',
  jobType: '',
  preferredShiftId: '',
  shiftType: '',
  workStatus: '',
  resumeHeadline: '',
  profileSummary: '',
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<'details' | 'education' | 'pic' | 'resume' | 'employment'>('details');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Header hamburger (mobile/tablet drawer)
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const toggleNavMenu = useCallback(() => setNavMenuOpen((v) => !v), []);
  const closeNavMenu = useCallback(() => setNavMenuOpen(false), []);

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Profile picture state
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const profilePicInputRef = useRef<HTMLInputElement>(null);

  // Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Basic details edit state
  const [detailsEditing, setDetailsEditing] = useState(false);
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [detailsForm, setDetailsForm] = useState<DetailsFormState>(emptyDetailsForm);

  // Education details edit state
  const [educationEditing, setEducationEditing] = useState(false);
  const [educationSaving, setEducationSaving] = useState(false);
  const [educationError, setEducationError] = useState('');
  const [educationForm, setEducationForm] = useState<EducationFormState>(emptyEducationForm);

  // Fetch profile from API
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useGetMyProfileQuery();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 antialiased font-sans">
        <h3 className="text-lg font-bold text-red-600 mb-2">Unauthorized — Please login first</h3>
        <Link to="/login" className="px-5 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm">
          Login
        </Link>
      </div>
    );
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    const fallback = type === 'success' ? 'Operation successful.' : 'Something went wrong.';
    setToastMsg(message && message.trim() ? message : fallback);
    setToastType(type);
  };

  // Upload profile picture handler
  const handleProfilePicUpload = async () => {
    if (!profilePicFile) return;
    setProfilePicUploading(true);
    try {
      const result = await uploadProfilePic(profilePicFile);
      if (result.success) {
        showToast(result.message, 'success');
        setProfilePicFile(null);
        setProfilePicPreview('');
        bustProfileImageCache();
        refetchProfile();
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Unexpected error uploading profile picture.', 'error');
    }
    setProfilePicUploading(false);
  };

  // Upload resume handler
  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setResumeUploading(true);
    try {
      const result = await uploadResume(resumeFile);
      if (result.success) {
        showToast(result.message, 'success');
        setResumeFile(null);
        refetchProfile();
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Unexpected error uploading resume.', 'error');
    }
    setResumeUploading(false);
  };

  const userIdNum = parseInt(String(profile?.userId || user?.id || '').replace(/\D/g, ''), 10) || 0;

  // Personal info can be edited by candidates and admins (SUPER_ADMIN = ADMIN)
  // via /updateuserpersonalinfo.
  const canEditPersonalInfo =
    user.role === UserRole.CANDIDATE || isRoleAllowedForTab(user.role, 'admin');

  const handleDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setDetailsForm((prev) => ({ ...prev, [name]: value }));
  };

  // Open the inline personal-info form prefilled from the current profile.
  const startEditDetails = () => {
    setDetailsForm({
      fullName: profile?.fullName || user.name || '',
      mobile: profile?.phone || user.phone || '',
      email: profile?.email || user.email || '',
      dob: toInputDate(profile?.dob),
      gender: profile?.gender || '',
      maritalStatus: profile?.maritalStatus || '',
      state: profile?.state || '',
      district: profile?.district || '',
      taluka: profile?.taluka || '',
      pincode: profile?.pincode || '',
      address: profile?.address || '',
    });
    setDetailsError('');
    setDetailsEditing(true);
  };

  const cancelEditDetails = () => {
    setDetailsEditing(false);
    setDetailsError('');
    setDetailsForm(emptyDetailsForm);
  };

  // Save handler — POST /api/v1/updateuserpersonalinfo (candidate/admin)
  const handleSaveDetails = async () => {
    if (!canEditPersonalInfo) {
      showToast('You are not allowed to edit personal information for your role.', 'error');
      setDetailsEditing(false);
      return;
    }
    setDetailsError('');
    if (!detailsForm.fullName.trim()) {
      setDetailsError('Please enter your full name.');
      return;
    }
    if (!detailsForm.mobile.trim()) {
      setDetailsError('Please enter your mobile number.');
      return;
    }
    if (detailsForm.pincode && !/^\d{6}$/.test(detailsForm.pincode.trim())) {
      setDetailsError('Please enter a valid 6-digit pincode.');
      return;
    }

    setDetailsSaving(true);
    try {
      const result = await updateUserPersonalInfo({
        userId: userIdNum,
        fullName: detailsForm.fullName.trim(),
        mobile: detailsForm.mobile.trim(),
        email: detailsForm.email.trim(),
        profilePic: (profile?.profilePicUrl || '').split('?')[0],
        dob: detailsForm.dob ? new Date(`${detailsForm.dob}T00:00:00.000Z`).toISOString() : null,
        gender: detailsForm.gender,
        address: detailsForm.address.trim(),
        stateId: profile?.stateId ?? 0,
        state: detailsForm.state.trim(),
        districtId: profile?.districtId ?? 0,
        district: detailsForm.district.trim(),
        talukaId: profile?.talukaId ?? 0,
        taluka: detailsForm.taluka.trim(),
        maritalStatus: detailsForm.maritalStatus,
        pincode: detailsForm.pincode.trim(),
      });

      if (result.success) {
        showToast(result.message, 'success');
        setDetailsEditing(false);
        setDetailsForm(emptyDetailsForm);
        refetchProfile();
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Unexpected error updating personal information.', 'error');
    }
    setDetailsSaving(false);
  };

  const handleEducationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEducationForm((prev) => ({ ...prev, [name]: value }));
  };

  // Open the inline education form prefilled from the current profile.
  const startEditEducation = () => {
    setEducationForm({
      education: profile?.education || profile?.qualification || '',
      specialization: profile?.specialization || '',
      skill: profile?.skills?.join(', ') || '',
      courses: profile?.courses || '',
      experience: String(profile?.experienceYears ?? 0),
      currentSalary: profile?.currentSalary != null ? String(profile.currentSalary) : '',
      expectation: profile?.expectation != null ? String(profile.expectation) : '',
      noticePeriod: profile?.noticePeriod != null ? String(profile.noticePeriod) : '',
      preferredJobLocations: profile?.preferredJobLocations || '',
      preferredJobTypeId: profile?.preferredJobTypeId != null ? String(profile.preferredJobTypeId) : '',
      jobType: profile?.jobType || '',
      preferredShiftId: profile?.preferredShiftId != null ? String(profile.preferredShiftId) : '',
      shiftType: profile?.shiftType || '',
      workStatus: profile?.workStatus || '',
      resumeHeadline: profile?.resumeHeadline || '',
      profileSummary: profile?.profileSummary || '',
    });
    setEducationError('');
    setEducationEditing(true);
  };

  const cancelEditEducation = () => {
    setEducationEditing(false);
    setEducationError('');
  };

  const handleSaveEducation = async () => {
    if (!canEditPersonalInfo) {
      setEducationError('You are not allowed to edit education information for your role.');
      return;
    }
    setEducationSaving(true);
    setEducationError('');
    try {
      const result = await updateUserEducationInfo({
        id: profile?.educationInfoId ?? 0,
        userId: userIdNum,
        educationId: profile?.educationId ?? 0,
        education: educationForm.education.trim(),
        specializationId: profile?.specializationId ?? 0,
        specialization: educationForm.specialization.trim(),
        skill: educationForm.skill.trim(),
        courses: educationForm.courses.trim(),
        experience: parseInt(educationForm.experience, 10) || 0,
        expectation: educationForm.expectation.trim() ? (Number(educationForm.expectation) || 0) : null,
        resume_File_Path: profile?.resumeUrl || '',
        currentSalary: educationForm.currentSalary.trim() ? (Number(educationForm.currentSalary) || 0) : null,
        noticePeriod: educationForm.noticePeriod.trim() ? (Number(educationForm.noticePeriod) || 0) : null,
        preferredJobLocations: educationForm.preferredJobLocations.trim(),
        preferredJobTypeId: educationForm.preferredJobTypeId.trim()
          ? (parseInt(educationForm.preferredJobTypeId, 10) || null)
          : (profile?.preferredJobTypeId ?? null),
        jobType: educationForm.jobType.trim(),
        preferredShiftId: educationForm.preferredShiftId.trim()
          ? (parseInt(educationForm.preferredShiftId, 10) || null)
          : (profile?.preferredShiftId ?? null),
        shiftType: educationForm.shiftType.trim(),
        workStatus: educationForm.workStatus.trim(),
        resumeHeadline: educationForm.resumeHeadline.trim(),
        profileSummary: educationForm.profileSummary.trim(),
      });

      if (result.success) {
        showToast(result.message, 'success');
        setEducationEditing(false);
        setEducationForm(emptyEducationForm);
        refetchProfile();
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Unexpected error updating education information.', 'error');
    }
    setEducationSaving(false);
  };

  const tabs = [
    { key: 'details' as const, label: 'Basic Details', icon: <UserCircle className="w-4 h-4" /> },
    { key: 'education' as const, label: 'Education Details', icon: <GraduationCap className="w-4 h-4" /> },
    { key: 'employment' as const, label: 'Employment History', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'pic' as const, label: 'Profile Picture', icon: <Camera className="w-4 h-4" /> },
    { key: 'resume' as const, label: 'Resume', icon: <FileUp className="w-4 h-4" /> },
  ].filter((tab) => {
    if (tab.key === 'education' && !canEditPersonalInfo) return false;
    if (user?.role === UserRole.COMPANY && (tab.key === 'resume' || tab.key === 'employment')) return false;
    return true;
  });

  const menuItems = (() => {
    const items: { label: string; to: string; icon: React.ReactNode }[] = [
      { label: 'डॅशबोर्ड / Dashboard', to: '/dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    ];
    if (user?.role === UserRole.COMPANY) {
      items.push({ label: 'कंपनी प्रोफाइल / Profile Settings', to: '/dashboard?tab=profile', icon: <Settings className="w-4 h-4" /> });
    }
    items.push({ label: 'पासवर्ड बदला / Change Password', to: '/change-password', icon: <LockKeyhole className="w-4 h-4" /> });
    return items;
  })();

  return (
    <DashboardMenuContext.Provider value={{ open: navMenuOpen, toggle: toggleNavMenu, close: closeNavMenu }}>
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased font-sans">
      {/* Dynamic Header (mirrors dashboard) */}
      <nav className="bg-theme-darkViolet text-white border-b border-theme-lightViolet/20 z-40 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile & tablet hamburger */}
            <button
              onClick={toggleNavMenu}
              aria-label="Toggle profile menu"
              aria-expanded={navMenuOpen}
              data-menu-toggle="true"
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-theme-lightViolet/30 transition-colors cursor-pointer shrink-0"
            >
              {navMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
              <img src="/home/logo.png" alt="SRG Logo" className="w-10 h-10 object-contain drop-shadow" />
            </Link>
            <div className="text-left min-w-0">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight block text-white truncate">श्री स्वामी समर्थ सेवा मार्ग</span>
              <span className="text-[10px] text-theme-gold block font-bold uppercase tracking-wide truncate">
                प्रोफाइल / {user.role === UserRole.COMPANY ? 'EMPLOYER' : user.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop: right-side menu items */}
            <div className="hidden lg:flex items-center gap-1.5">
              {menuItems.map((item) => (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className="px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-theme-lightViolet/30 flex items-center gap-1.5 whitespace-nowrap"
                >
                  {item.icon} <span className="hidden xl:inline">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-1 px-3 border border-theme-lightViolet/30 bg-white/10 font-bold hover:bg-white/20 rounded-xl text-[11px] transition-all cursor-pointer"
              >
                {profile?.profilePicUrl ? (
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-2 ring-theme-gold ring-offset-1 ring-offset-theme-darkViolet">
                    <img src={profile.profilePicUrl} alt="Profile" className="w-full h-full object-cover object-center" />
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
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-theme-lightViolet/80 z-50 py-1 text-slate-800">
                  <div className="px-4 py-3 border-b border-theme-lightViolet/60 flex items-center gap-3">
                    {profile?.profilePicUrl ? (
                      <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-theme-gold shrink-0">
                        <img src={profile.profilePicUrl} alt="Profile" className="w-full h-full object-cover object-center" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-theme-lightViolet flex items-center justify-center shrink-0">
                        <UserCircle className="w-5 h-5 text-theme-lavender/70" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-theme-darkViolet truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                      {user.role && (
                        <p className="text-[9px] text-theme-lavender font-semibold mt-1 truncate">{user.role}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowProfileDropdown(false); navigate('/profile'); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-theme-lightViolet/40 hover:text-theme-darkViolet flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <UserCircle className="w-4 h-4 text-theme-lavender" /> My Profile
                  </button>
                  <button
                    onClick={() => { setShowProfileDropdown(false); navigate('/change-password'); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-theme-lightViolet/40 hover:text-theme-darkViolet flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LockKeyhole className="w-4 h-4 text-theme-lavender" /> Change Password
                  </button>
                  <div className="border-t border-theme-lightViolet/60 my-1"></div>
                  <button
                    onClick={() => { setShowProfileDropdown(false); dispatch(logout()); navigate('/'); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile & tablet drawer (reuses the dashboard hamburger drawer) */}
      <DashboardMenu variant="drawer">
        {menuItems.map((item) => (
          <button
            key={item.to}
            onClick={() => navigate(item.to)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 cursor-pointer bg-white hover:bg-theme-lightViolet/30 text-theme-darkViolet border border-theme-lightViolet/80"
          >
            {item.icon}<span className="truncate min-w-0">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => { dispatch(logout()); navigate('/'); }}
          className="px-3 py-1.5 text-xs font-bold rounded-xl text-left w-full transition-all flex items-center gap-1.5 cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
        >
          <LogOut className="w-4 h-4" /><span className="truncate min-w-0">Log Off / लॉग ऑफ</span>
        </button>
      </DashboardMenu>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 py-6 lg:py-10 w-full">
        {/* Page header */}
        <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-blue-950">My Profile</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {user.role === UserRole.COMPANY
                ? 'View and update your company details and profile picture.'
                : 'View and update your personal details, profile picture, resume, and employment history.'}
            </p>
          </div>
          {user.role === UserRole.COMPANY && (
            <button
              onClick={() => navigate('/dashboard?tab=profile')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-theme-lavender hover:bg-theme-lavender/90 text-white rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4" /> कंपनी प्रोफाइल संपादित करा / Edit Profile
            </button>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 sm:px-5 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-orange-600 text-orange-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 min-h-[300px]">

          {/* ---- TAB 1: Basic Details ---- */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {profileLoading ? (
                <Loader />
              ) : profile ? (
                <>
                  {/* Header with Edit / Save actions */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">Personal Information</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Keep your personal details up to date.</p>
                    </div>
                    {!detailsEditing ? (
                      canEditPersonalInfo && (
                        <button
                          onClick={startEditDetails}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" /> Edit
                        </button>
                      )
                    ) : (
                      <div className="hidden lg:flex items-center gap-2">
                        <button
                          onClick={cancelEditDetails}
                          disabled={detailsSaving}
                          className="px-4 py-2.5 text-xs font-semibold hover:bg-gray-100 rounded-xl text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveDetails}
                          disabled={detailsSaving}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          {detailsSaving ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></span>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {detailsSaving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>

                  {detailsEditing ? (
                    /* ---- Edit form ---- */
                    <div className="border border-orange-200 bg-orange-50/40 rounded-2xl p-4 sm:p-6 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">पूर्ण नाव / Full Name *</label>
                          <input type="text" name="fullName" value={detailsForm.fullName} onChange={handleDetailsChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">मोबाइल / Mobile *</label>
                          <input type="tel" name="mobile" value={detailsForm.mobile} onChange={handleDetailsChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">ईमेल / Email</label>
                          <input type="email" name="email" value={detailsForm.email} onChange={handleDetailsChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">जन्मतारीख / Date of Birth</label>
                          <input type="date" name="dob" value={detailsForm.dob} onChange={handleDetailsChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white cursor-pointer" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">लिंग / Gender</label>
                          <select name="gender" value={detailsForm.gender} onChange={handleDetailsChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white">
                            <option value="">-- Select --</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">वैवाहिक स्थिती / Marital Status</label>
                          <select name="maritalStatus" value={detailsForm.maritalStatus} onChange={handleDetailsChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white">
                            <option value="">-- Select --</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">राज्य / State</label>
                          <input type="text" name="state" value={detailsForm.state} onChange={handleDetailsChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">जिल्हा / District</label>
                          <input type="text" name="district" value={detailsForm.district} onChange={handleDetailsChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">तालुका / Taluka</label>
                          <input type="text" name="taluka" value={detailsForm.taluka} onChange={handleDetailsChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">पिन कोड / Pincode</label>
                          <input type="text" name="pincode" inputMode="numeric" maxLength={6} value={detailsForm.pincode} onChange={handleDetailsChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">पत्ता / Address</label>
                        <textarea name="address" rows={2} value={detailsForm.address} onChange={handleDetailsChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white resize-none" />
                      </div>

                      {detailsError && (
                        <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                          {detailsError}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-orange-100 lg:hidden">
                        <button
                          onClick={cancelEditDetails}
                          disabled={detailsSaving}
                          className="px-4 py-2.5 text-xs font-semibold hover:bg-gray-100 rounded-xl text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveDetails}
                          disabled={detailsSaving}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          {detailsSaving ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></span>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {detailsSaving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ---- Read-only details ---- */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: 'Full Name', value: profile.fullName || user.name || '-' },
                        { label: 'Email', value: profile.email || user.email || '-' },
                        { label: 'Phone', value: profile.phone || user.phone || '-' },
                        { label: 'Role', value: user.role },
                        { label: 'Date of Birth', value: formatDisplayDate(profile.dob) || '-' },
                        { label: 'Gender', value: profile.gender || '-' },
                        { label: 'Marital Status', value: profile.maritalStatus || '-' },
                        { label: 'State', value: profile.state || '-' },
                        { label: 'District', value: profile.district || '-' },
                        { label: 'Taluka', value: profile.taluka || '-' },
                        { label: 'Pincode', value: profile.pincode || '-' },
                        { label: 'Address', value: profile.address || '-', full: true },
                      ].map((item, i) => (
                        <div key={i} className={`bg-slate-50 rounded-xl p-4 ${item.full ? 'sm:col-span-2' : ''}`}>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                          <p className="text-xs font-bold text-gray-800">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-500 text-center py-12">No profile data found.</p>
              )}
            </div>
          )}

          {/* ---- TAB 1b: Education Details ---- */}
          {activeTab === 'education' && (
            <div className="space-y-5">
              {profileLoading ? (
                <Loader />
              ) : profile ? (
                <>
                  {/* Header with Edit / Save actions */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">Education Details</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Your educational and professional summary.</p>
                    </div>
                    {!educationEditing ? (
                      canEditPersonalInfo && (
                        <button
                          onClick={startEditEducation}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" /> Edit
                        </button>
                      )
                    ) : (
                      <div className="hidden lg:flex items-center gap-2">
                        <button
                          onClick={cancelEditEducation}
                          disabled={educationSaving}
                          className="px-4 py-2.5 text-xs font-semibold hover:bg-gray-100 rounded-xl text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEducation}
                          disabled={educationSaving}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          {educationSaving ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></span>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {educationSaving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>

                  {educationEditing ? (
                    /* ---- Edit form ---- */
                    <div className="border border-orange-200 bg-orange-50/40 rounded-2xl p-4 sm:p-6 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Education</label>
                          <input type="text" name="education" value={educationForm.education} onChange={handleEducationChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Specialization</label>
                          <input type="text" name="specialization" value={educationForm.specialization} onChange={handleEducationChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Skills (comma separated)</label>
                          <input type="text" name="skill" value={educationForm.skill} onChange={handleEducationChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Courses</label>
                          <input type="text" name="courses" value={educationForm.courses} onChange={handleEducationChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Experience (Years)</label>
                          <input type="number" min={0} name="experience" value={educationForm.experience} onChange={handleEducationChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Salary (₹)</label>
                          <input type="number" min={0} name="currentSalary" value={educationForm.currentSalary} onChange={handleEducationChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Expected / Salary Expectation (₹)</label>
                          <input type="number" min={0} name="expectation" value={educationForm.expectation} onChange={handleEducationChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Notice Period</label>
                          <input type="number" min={0} name="noticePeriod" value={educationForm.noticePeriod} onChange={handleEducationChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Job Locations</label>
                          <input type="text" name="preferredJobLocations" value={educationForm.preferredJobLocations} onChange={handleEducationChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Job Type</label>
                          <input type="text" name="jobType" value={educationForm.jobType} onChange={handleEducationChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Shift Type</label>
                          <input type="text" name="shiftType" value={educationForm.shiftType} onChange={handleEducationChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Work Status</label>
                          <input type="text" name="workStatus" value={educationForm.workStatus} onChange={handleEducationChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Resume Headline</label>
                          <input type="text" name="resumeHeadline" value={educationForm.resumeHeadline} onChange={handleEducationChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Profile Summary</label>
                        <textarea name="profileSummary" rows={3} value={educationForm.profileSummary} onChange={handleEducationChange} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none transition-all bg-white resize-none" />
                      </div>

                      {educationError && (
                        <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                          {educationError}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-orange-100 lg:hidden">
                        <button
                          onClick={cancelEditEducation}
                          disabled={educationSaving}
                          className="px-4 py-2.5 text-xs font-semibold hover:bg-gray-100 rounded-xl text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEducation}
                          disabled={educationSaving}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          {educationSaving ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></span>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {educationSaving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ---- Read-only education details ---- */
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { label: 'Education', value: profile.education || profile.qualification || '-' },
                          { label: 'Specialization', value: profile.specialization || '-' },
                          { label: 'Courses', value: profile.courses || '-' },
                          { label: 'Experience (Years)', value: String(profile.experienceYears ?? (profile.experienceYears === 0 ? 0 : '-')) },
                          { label: 'Preferred Job Locations', value: profile.preferredJobLocations || '-', full: true },
                          { label: 'Job Type', value: profile.jobType || '-' },
                          { label: 'Shift Type', value: profile.shiftType || '-' },
                          { label: 'Work Status', value: profile.workStatus || '-' },
                          { label: 'Current Salary', value: typeof profile.currentSalary === 'number' ? `₹${profile.currentSalary}` : (profile.currentSalary || '-') },
                          { label: 'Expected / Salary Expectation', value: profile.expectation || '-' },
                          { label: 'Notice Period', value: profile.noticePeriod || '-' },
                          { label: 'Resume Headline', value: profile.resumeHeadline || '-', full: true },
                          { label: 'Profile Summary', value: profile.profileSummary || '-', full: true },
                        ].map((item, i) => (
                          <div key={i} className={`bg-slate-50 rounded-xl p-4 ${item.full ? 'sm:col-span-2' : ''}`}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                            <p className="text-xs font-bold text-gray-800 break-words">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {profile.skills && profile.skills.length > 0 && (
                        <div className="bg-slate-50 rounded-xl p-4">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill, i) => (
                              <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 text-[11px] font-bold rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-500 text-center py-12">No education data found.</p>
              )}
            </div>
          )}

          {/* ---- TAB 2: Profile Picture ---- */}
          {activeTab === 'pic' && (
            <div className="flex flex-col items-center gap-6 py-6">
              {/* Current / preview image */}
              <div className="relative">
                {profilePicPreview ? (
                  <div className="w-36 h-36 rounded-full overflow-hidden ring-4 ring-theme-lightViolet shadow-lg">
                    <img
                      src={profilePicPreview}
                      alt="Selected preview"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                ) : profile?.profilePicUrl ? (
                  <div className="w-36 h-36 rounded-full overflow-hidden ring-4 ring-theme-lightViolet shadow-lg">
                    <img
                      src={profile.profilePicUrl}
                      alt="Current profile"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                ) : (
                  <div className="w-36 h-36 rounded-full bg-theme-lightViolet border-4 border-dashed border-theme-sage/60 flex items-center justify-center">
                    <UserCircle className="w-20 h-20 text-theme-lavender/50" />
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 font-medium">
                {profile?.profilePicUrl ? 'Current profile picture' : 'No profile picture set'}
              </p>

              {/* Hidden file input */}
              <input
                ref={profilePicInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const processed = await processProfileImage(file);
                    setProfilePicFile(processed);
                    setProfilePicPreview(URL.createObjectURL(processed));
                  } catch (_) {
                    setProfilePicFile(file);
                    setProfilePicPreview(URL.createObjectURL(file));
                  }
                  if (e.target.value) e.target.value = '';
                }}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => profilePicInputRef.current?.click()}
                  className="px-5 py-2.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Choose Photo
                </button>

                {profilePicFile && (
                  <button
                    onClick={handleProfilePicUpload}
                    disabled={profilePicUploading}
                    className="px-5 py-2.5 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {profilePicUploading ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></span>
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {profilePicUploading ? 'Uploading...' : 'Upload Photo'}
                  </button>
                )}
              </div>

              {profilePicFile && (
                <p className="text-[10px] text-gray-500">
                  Selected: {profilePicFile.name} · auto-fixed orientation & square-cropped like a profile picture
                </p>
              )}
            </div>
          )}

          {/* ---- TAB 3: Resume ---- */}
          {activeTab === 'resume' && (
            <div className="flex flex-col gap-6 py-6">
              {/* Current resume info */}
              {profile?.resumeUrl ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4">
                  <FileText className="w-8 h-8 text-blue-600 shrink-0" />
                  <p className="text-sm font-bold text-blue-900 truncate flex-1 min-w-0">My Resume</p>
                  <button
                    onClick={() => window.open(profile.resumeUrl, '_blank')}
                    className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-400 font-medium text-center py-16">No resume uploaded yet</p>
              )}

              {/* Hidden file input */}
              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setResumeFile(file);
                }}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => resumeInputRef.current?.click()}
                  className="px-5 py-2.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors flex items-center gap-2"
                >
                  <FileUp className="w-4 h-4" /> Choose File
                </button>

                {resumeFile && (
                  <button
                    onClick={handleResumeUpload}
                    disabled={resumeUploading}
                    className="px-5 py-2.5 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {resumeUploading ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></span>
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {resumeUploading ? 'Uploading...' : 'Upload Resume'}
                  </button>
                )}
              </div>

              {resumeFile && (
                <p className="text-[10px] text-gray-500">Selected: {resumeFile.name}</p>
              )}
            </div>
          )}

          {/* ---- TAB 4: Employment History ---- */}
          {activeTab === 'employment' && (
            <EmploymentHistoryTab
              profile={profile}
              loading={profileLoading}
              onRefresh={refetchProfile}
            />
          )}

        </div>
      </main>

      {/* Toast */}
      {toastMsg && (
        <Toast
          message={toastMsg}
          type={toastType}
          onClose={() => setToastMsg('')}
        />
      )}
    </div>
    </DashboardMenuContext.Provider>
  );
}
