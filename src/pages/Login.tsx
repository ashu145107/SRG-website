/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { useLoginMutation } from '../services/authApi';
import { TextBox, PasswordBox } from '../components/ui/Inputs';
import { PrimaryButton } from '../components/ui/Buttons';
import { Alert, Toast } from '../components/ui/FeedbackComponents';
import { LanguageSwitcher } from '../components/ui/UtilityComponents';
import { ShieldCheck, ArrowLeft, Users, Building } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Extract initial role selection from URL
  const initialRole = searchParams.get('role');
  const [activeTab, setActiveTab] = useState<'candidate' | 'employer'>(
    initialRole === 'employer' ? 'employer' : 'candidate'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  // Success Toast message
  const [toastMessage, setToastMessage] = useState('');

  // API mutations
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim()) {
      if (activeTab === 'candidate') {
        setFormError('कृपया मोबाईल नंबर किंवा युझरनेम प्रविष्ट करा / Please enter your mobile number, email or username.');
      } else {
        setFormError('कृपया कंपनी ईमेल किंवा युझरनेम प्रविष्ट करा / Please enter your company email, username or mobile.');
      }
      return;
    }

    try {
      const response = await login({ email: email.trim(), password }).unwrap();
      dispatch(setCredentials(response));
      setToastMessage(`लॉगिन यशस्वी / Login Successful! Redirecting...`);
      
      // Redirect to dashboard!
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      setFormError(err.data || 'लॉगिन अयशस्वी / Invalid login details. Please check your credentials or try our demo presets.');
    }
  };

  // Demo Assist Presets
  const applyDemoPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('password123');
    setFormError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative antialiased font-sans">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> {t('nav.home')}
        </Link>
        <div className="mx-auto w-12 h-12 bg-linear-to-tr from-orange-400 to-amber-500 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-xs">
          श्री
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-blue-950 tracking-tight">
          {activeTab === 'candidate' 
            ? 'नोकरी शोधक लॉगिन / Job Seeker Login' 
            : 'उद्योजक लॉगिन / Employer Login'
          }
        </h2>
        <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-widest text-orange-600">
          श्री स्वामी समर्थ स्वयंरोजगार
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          
          {/* Separate Form Tab Switcher */}
          <div className="flex border border-slate-100 p-1 bg-slate-50 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('candidate');
                setFormError('');
                setEmail('');
                setPassword('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'candidate'
                  ? 'bg-white text-orange-600 shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <div className="flex flex-col text-left">
                <span className="leading-tight text-[11px] block">नोकरी शोधक</span>
                <span className="text-[9px] opacity-75 font-medium block">Job Seeker</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('employer');
                setFormError('');
                setEmail('');
                setPassword('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'employer'
                  ? 'bg-white text-orange-600 shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building className="w-4 h-4" />
              <div className="flex flex-col text-left">
                <span className="leading-tight text-[11px] block">नियोक्ता / उद्योजक</span>
                <span className="text-[9px] opacity-75 font-medium block">Employer</span>
              </div>
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            {formError && <Alert type="danger" message={formError} />}

            {activeTab === 'candidate' ? (
              <TextBox
                label="मोबाईल नंबर / युझरनेम / ईमेल (Mobile Number / Username / Email)"
                type="text"
                placeholder="Enter Mobile, Email or Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            ) : (
              <TextBox
                label="कंपनी ईमेल आयडी / युझरनेम (Company Email ID / Username)"
                type="text"
                placeholder="Enter Company Email or Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}

            <PasswordBox
              label={t('auth.password')}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-end text-xs font-medium">
              <Link to="/forgot-password" className="text-orange-600 hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <PrimaryButton type="submit" loading={isLoginLoading} className="w-full py-3">
              {activeTab === 'candidate' 
                ? 'नोकरी शोधक म्हणून प्रवेश करा / Login as Job Seeker' 
                : 'नियोक्ता म्हणून प्रवेश करा / Login as Employer'
              }
            </PrimaryButton>
          </form>

          <div className="text-center text-xs font-semibold text-slate-500 border-t border-slate-100 pt-4 cursor-pointer">
            <Link to="/register" className="text-orange-600 hover:underline">
              {t('auth.noAccount')}
            </Link>
          </div>
        </div>

        {/* DEMO presets support board */}
        <div className="mt-6 bg-blue-50/70 border border-blue-100/50 rounded-2xl p-4 sm:mx-auto sm:w-full sm:max-w-md text-left space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-blue-800" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-950">
              चाचणी लॉगिन पर्याय / Demo Preset Logins
            </span>
          </div>

          {activeTab === 'candidate' ? (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 font-medium">
                नोकरी शोधक किंवा उमेदवारांच्या चाचणीसाठी खालीलपैकी एक पर्याय निवडा:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <button
                  onClick={() => applyDemoPreset('candidate@gmail.com')}
                  className="p-2 bg-white border border-blue-100 hover:bg-blue-100 rounded-lg text-slate-700 font-bold transition-all"
                >
                  Job Candidate (उमेदवार)
                </button>
                <button
                  onClick={() => applyDemoPreset('shg@shg.org')}
                  className="p-2 bg-white border border-blue-100 hover:bg-blue-100 rounded-lg text-slate-700 font-bold transition-all"
                >
                  SHG Cell (बचतगट)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 font-medium">
                नियोक्ता किंवा उद्योजकांच्या चाचणीसाठी खालील पर्याय निवडा:
              </p>
              <div className="text-[10px]">
                <button
                  onClick={() => applyDemoPreset('employer@tata.com')}
                  className="w-full p-2 bg-white border border-blue-100 hover:bg-blue-100 rounded-lg text-slate-700 font-bold transition-all text-center"
                >
                  Company Recruiter (नियोक्ता / उद्योजक)
                </button>
              </div>
            </div>
          )}

          {/* Shared Admin and staff helper link / collapse */}
          <div className="h-px bg-slate-200/50 my-1.5" />
          <div className="space-y-2">
            <p className="text-[9px] text-slate-500 font-medium">
              कर्मचारी आणि प्रशासकांसाठी (Staff & Admin Logins):
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                onClick={() => applyDemoPreset('admin@dindori.org')}
                className="p-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-md text-slate-700 font-bold transition-all"
              >
                Super Admin
              </button>
              <button
                onClick={() => applyDemoPreset('handler@dindori.org')}
                className="p-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-md text-slate-700 font-bold transition-all"
              >
                Handler Person
              </button>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage('')} />
      )}
    </div>
  );
}
