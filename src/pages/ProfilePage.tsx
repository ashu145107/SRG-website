/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Standalone My Profile page with 3 tabs:
 *   1. Basic Details — shows all profile info from GET /api/v1/myprofile
 *   2. Profile Picture — upload via POST /api/v1/profilepic (multipart/form-data)
 *   3. Resume — upload via POST /api/v1/resume (multipart/form-data)
 */

import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { RootState } from '../store';
import { useGetMyProfileQuery, uploadProfilePic, uploadResume } from '../services/profileApi';
import { Toast } from '../components/ui/FeedbackComponents';
import { Loader } from '../components/ui/FeedbackComponents';
import { UserRole } from '../types';
import {
  ArrowLeft,
  UserCircle,
  Camera,
  FileUp,
  FileText,
  CheckCircle,
  LogOut,
  ChevronDown,
  Eye,
  Download
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<'details' | 'pic' | 'resume'>('details');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Profile picture state
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const profilePicInputRef = useRef<HTMLInputElement>(null);

  // Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

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
    setToastMsg(message);
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

  const tabs = [
    { key: 'details' as const, label: 'Basic Details', icon: <UserCircle className="w-4 h-4" /> },
    { key: 'pic' as const, label: 'Profile Picture', icon: <Camera className="w-4 h-4" /> },
    ...(user.role === UserRole.CANDIDATE ? [{ key: 'resume' as const, label: 'Resume', icon: <FileUp className="w-4 h-4" /> }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased font-sans">
      {/* Navbar */}
      <nav className="bg-blue-950 text-white border-b border-blue-900/40 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black">{user.name}</p>
            </div>
            <button
              onClick={() => { dispatch(logout()); navigate('/'); }}
              className="p-1 px-3 border border-blue-900 bg-blue-1000 font-bold hover:bg-orange-600 rounded-xl text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto px-3 sm:px-6 py-6 lg:py-10 w-full">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-blue-950">My Profile</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            View and update your personal details, profile picture, and resume.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-5 py-3 text-xs font-semibold border-b-2 transition-colors ${
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', value: profile.fullName || user.name || '-' },
                    { label: 'Email', value: profile.email || user.email || '-' },
                    { label: 'Phone', value: profile.phone || user.phone || '-' },
                    { label: 'Role', value: user.role },
                    { label: 'City', value: profile.city || '-' },
                    { label: 'District', value: profile.district || '-' },
                    { label: 'Address', value: profile.address || '-', full: true },
                    { label: 'Qualification', value: profile.qualification || '-' },
                    { label: 'Experience (Years)', value: String(profile.experienceYears ?? '-') },
                  ].map((item, i) => (
                    <div key={i} className={`bg-slate-50 rounded-xl p-4 ${item.full ? 'sm:col-span-2' : ''}`}>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="text-xs font-bold text-gray-800">{item.value}</p>
                    </div>
                  ))}

                  {profile.skills && profile.skills.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 sm:col-span-2">
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
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-12">No profile data found.</p>
              )}
            </div>
          )}

          {/* ---- TAB 2: Profile Picture ---- */}
          {activeTab === 'pic' && (
            <div className="flex flex-col items-center gap-6 py-6">
              {/* Current / preview image */}
              <div className="relative">
                {profilePicPreview ? (
                  <img
                    src={profilePicPreview}
                    alt="Selected preview"
                    className="w-36 h-36 rounded-full object-cover border-4 border-orange-300 shadow-lg"
                  />
                ) : profile?.profilePicUrl ? (
                  <img
                    src={profile.profilePicUrl}
                    alt="Current profile"
                    className="w-36 h-36 rounded-full object-cover border-4 border-blue-300 shadow-lg"
                  />
                ) : (
                  <div className="w-36 h-36 rounded-full bg-slate-100 border-4 border-dashed border-gray-300 flex items-center justify-center">
                    <UserCircle className="w-20 h-20 text-gray-300" />
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
                accept=".png,image/png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setProfilePicFile(file);
                    setProfilePicPreview(URL.createObjectURL(file));
                  }
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
                <p className="text-[10px] text-gray-500">Selected: {profilePicFile.name}</p>
              )}
            </div>
          )}

          {/* ---- TAB 3: Resume ---- */}
          {activeTab === 'resume' && user.role === UserRole.CANDIDATE && (
            <div className="flex flex-col items-center gap-6 py-6">
              {/* Current resume info */}
              {profile?.resumeUrl ? (
                <div className="w-full max-w-2xl space-y-4">
                  {/* Resume card */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4">
                    <FileText className="w-10 h-10 text-blue-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-blue-900 truncate">{profile.resumeName || 'Resume'}</p>
                      <p className="text-[10px] text-blue-500 mt-0.5 truncate">{profile.resumeUrl}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const w = window.open('', '_blank');
                          if (w) {
                            w.document.write(`
                              <html><head><title>${profile.resumeName || 'Resume'}</title></head>
                              <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f1f5f9;">
                                <iframe src="${profile.resumeUrl}" style="width:100%;height:100vh;border:none;"></iframe>
                              </body></html>
                            `);
                          }
                        }}
                        className="px-3 py-2 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <a
                        href={profile.resumeUrl}
                        download={profile.resumeName || 'resume'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  </div>

                  {/* Inline PDF preview */}
                  <div className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <iframe
                      src={profile.resumeUrl}
                      title="Resume Preview"
                      className="w-full h-[500px]"
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md bg-slate-50 border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-2">
                  <FileText className="w-12 h-12 text-gray-300" />
                  <p className="text-xs text-gray-400 font-medium">No resume uploaded yet</p>
                </div>
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
  );
}
