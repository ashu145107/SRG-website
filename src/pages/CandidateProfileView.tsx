/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Employer-facing read-only candidate profile page.
 * Fetches data from GET /api/v1/viewcandidateprofile/{candidateId}
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchCandidateProfile } from '../services/employerApi';
import {
  ArrowLeft,
  UserCircle,
  FileText,
  Eye,
  Download,
  LogOut,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  Loader,
  AlertCircle
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface CandidateData {
  fullName: string;
  email: string;
  phone: string;
  profilePicUrl: string;
  address: string;
  district: string;
  city: string;
  qualification: string;
  experienceYears: number | string;
  skills: string[];
  resumeUrl: string;
  resumeName: string;
  raw: Record<string, any>;
}

/* ------------------------------------------------------------------ */
/*  Normalize                                                          */
/* ------------------------------------------------------------------ */
const normalizeCandidateProfile = (data: any): CandidateData => {
  const raw = data?.value || data?.data || data || {};

  const personal = raw.personalInfo || raw;
  const education = raw.educationInfo || raw;

  const fullName = personal.fullName || raw.fullName || raw.candidateName || raw.name || '';
  const email = personal.email || raw.email || '';
  const phone = personal.mobile || raw.phone || raw.mobile || '';
  const profilePicUrl = personal.profilePic || raw.profilePicUrl || raw.profileImage || raw.photoUrl || raw.avatarUrl || '';
  const address = personal.address || raw.address || '';
  const district = typeof personal.district === 'string' ? personal.district : raw.district || '';
  const city = personal.city || raw.city || '';
  const qualification = education.education || raw.qualification || raw.education || '';
  const experienceYears = education.experience ?? raw.experienceYears ?? raw.experience ?? 0;
  const skills = education.skill
    ? education.skill.split(',').map((s: string) => s.trim()).filter(Boolean)
    : Array.isArray(raw.skills) ? raw.skills : typeof raw.skills === 'string' ? raw.skills.split(',').map((s: string) => s.trim()) : [];
  const resumeRaw = education.resume_File_Path || raw.resumeUrl || raw.resumeFileName || '';
  const resumeUrl = resumeRaw && !resumeRaw.startsWith('http')
    ? `https://srgapp.dindoripranit.org${resumeRaw.startsWith('/') ? '' : '/'}${resumeRaw}`
    : resumeRaw;
  const resumeName = education.resumeName || raw.resumeName || raw.resumeFileName || (resumeUrl ? resumeUrl.split('/').pop() || 'Resume' : '');

  return { fullName, email, phone, profilePicUrl, address, district, city, qualification, experienceYears, skills, resumeUrl, resumeName, raw };
};

/* ------------------------------------------------------------------ */
/*  Field row helper                                                   */
/* ------------------------------------------------------------------ */
const Field = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-blue-400">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-xs font-semibold text-blue-950 break-words">{value || <span className="text-gray-300 italic">Not provided</span>}</p>
    </div>
  </div>
);

/* ================================================================== */
/*  PAGE COMPONENT                                                     */
/* ================================================================== */
export default function CandidateProfileView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { candidateId } = useParams<{ candidateId: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [candidate, setCandidate] = useState<CandidateData | null>(null);

  useEffect(() => {
    if (!candidateId) {
      setError('No candidate ID provided.');
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError('');
        const json = await fetchCandidateProfile(candidateId);
        if (!cancelled) {
          setCandidate(normalizeCandidateProfile(json));
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load candidate profile.');
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [candidateId]);

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased font-sans">
      {/* Navbar */}
      <nav className="bg-blue-950 text-white border-b border-blue-900/40 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Pipeline
            </button>
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

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto px-3 sm:px-6 py-6 lg:py-10 w-full">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-blue-950">Candidate Profile</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Viewing profile for candidate ID: <span className="font-bold text-blue-900">{candidateId}</span>
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading candidate profile...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm font-bold text-red-600">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Go Back
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && candidate && (
          <div className="space-y-6">
            {/* Profile header card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              {candidate.profilePicUrl ? (
                <img
                  src={candidate.profilePicUrl}
                  alt={candidate.fullName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-orange-200 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-50 border-4 border-orange-200 shadow-sm flex items-center justify-center">
                  <UserCircle className="w-14 h-14 text-blue-300" />
                </div>
              )}

              {/* Name + status */}
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl font-black text-blue-950 leading-tight">
                  {candidate.fullName || 'Unnamed Candidate'}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  ID: {candidateId}
                </p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  {candidate.phone && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                      <Phone className="w-3 h-3" /> {candidate.phone}
                    </span>
                  )}
                  {candidate.email && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                      <Mail className="w-3 h-3" /> {candidate.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
              <h3 className="text-xs font-black text-blue-950 uppercase tracking-wider mb-5">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field icon={<UserCircle className="w-4 h-4" />} label="Full Name" value={candidate.fullName} />
                <Field icon={<Phone className="w-4 h-4" />} label="Mobile" value={candidate.phone} />
                <Field icon={<Mail className="w-4 h-4" />} label="Email" value={candidate.email} />
                <Field icon={<MapPin className="w-4 h-4" />} label="Address" value={[candidate.address, candidate.city, candidate.district].filter(Boolean).join(', ')} />
              </div>
            </div>

            {/* Education / Skills */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
              <h3 className="text-xs font-black text-blue-950 uppercase tracking-wider mb-5">Education & Skills</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <Field icon={<GraduationCap className="w-4 h-4" />} label="Qualification" value={candidate.qualification} />
                <Field icon={<Briefcase className="w-4 h-4" />} label="Experience" value={candidate.experienceYears ? `${candidate.experienceYears} years` : ''} />
              </div>
              {candidate.skills.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg text-[10px] font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resume */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs">
              <h3 className="text-xs font-black text-blue-950 uppercase tracking-wider mb-5">Resume / CV</h3>
              {candidate.resumeUrl ? (
                <div className="space-y-4">
                  {/* Resume card */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4">
                    <FileText className="w-10 h-10 text-blue-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-blue-900 truncate">{candidate.resumeName || 'Resume'}</p>
                      <p className="text-[10px] text-blue-500 mt-0.5 truncate">{candidate.resumeUrl}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const w = window.open('', '_blank');
                          if (w) {
                            w.document.write(
                              `<html><head><title>${candidate.resumeName || 'Resume'}</title></head>` +
                              `<body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f1f5f9;">` +
                              `<iframe src="${candidate.resumeUrl}" style="width:100%;height:100vh;border:none;"></iframe>` +
                              `</body></html>`
                            );
                          }
                        }}
                        className="px-3 py-2 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <a
                        href={candidate.resumeUrl}
                        download={candidate.resumeName || 'resume'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  </div>

                  {/* Inline preview */}
                  <div className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <iframe
                      src={candidate.resumeUrl}
                      title="Resume Preview"
                      className="w-full h-[500px]"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-2">
                  <FileText className="w-12 h-12 text-gray-300" />
                  <p className="text-xs text-gray-400 font-medium">No resume uploaded by this candidate</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
