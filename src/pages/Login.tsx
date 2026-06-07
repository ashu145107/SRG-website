/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { useLoginMutation, useVerifyOtpMutation } from '../services/authApi';
import { TextBox, PasswordBox, OTPInput } from '../components/ui/Inputs';
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons';
import { Alert, Toast } from '../components/ui/FeedbackComponents';
import { LanguageSwitcher } from '../components/ui/UtilityComponents';
import { User, UserRole } from '../types';
import { ShieldCheck, Mail, ArrowLeft, KeySquare } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  // OTP State handling
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifiedUserPayload, setVerifiedUserPayload] = useState<{ user: User; token: string } | null>(null);

  // Success Toast message
  const [toastMessage, setToastMessage] = useState('');

  // API mutations
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [verifyOtp, { isLoading: isOtpLoading }] = useVerifyOtpMutation();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim()) {
      setFormError('कृपया युझरनेम किंवा ईमेल प्रविष्ट करा / Please enter your username, email, or mobile number.');
      return;
    }

    try {
      const response = await login({ email: email.trim(), password }).unwrap();
      // Store payloads momentarily, wait for OTP validation
      setVerifiedUserPayload(response);
      setShowOtpScreen(true);
    } catch (err: any) {
      setFormError(err.data || 'लॉगिन अयशस्वी / Invalid login details. Please check your credentials or try our demo presets.');
    }
  };

  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (otpCode.length !== 4) {
      setOtpError('Please insert the 4-digit security code.');
      return;
    }

    try {
      await verifyOtp({ otp: otpCode, email }).unwrap();
      if (verifiedUserPayload) {
        dispatch(setCredentials(verifiedUserPayload));
        setToastMessage(`लॉगिन यशस्वी / Login Successful! Redirecting...`);
        
        // Redirect depending on user type role!
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      }
    } catch (err: any) {
      setOtpError(err.data || 'Verification failed. Try typing 1234.');
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
          {t('auth.loginTitle')}
        </h2>
        <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-widest text-orange-600">
          श्री स्वामी समर्थ स्वयंरोजगार
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          {/* OTP screen or Login Form */}
          {!showOtpScreen ? (
            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              {formError && <Alert type="danger" message={formError} />}

              <TextBox
                label="युझरनेम / ईमेल / मोबाईल (Username / Email / Mobile)"
                type="text"
                placeholder="Enter Username, Email or Mobile"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

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
                {t('auth.submitLogin')}
              </PrimaryButton>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleOtpVerifySubmit}>
              <div className="text-center space-y-2">
                <KeySquare className="w-8 h-8 text-orange-600 mx-auto" />
                <h3 className="font-bold text-blue-950 text-sm">{t('auth.otpTitle')}</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  {t('auth.otpVerify')}
                </p>
                <div className="inline-block mt-1.5 px-2.5 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-bold rounded-lg leading-normal">
                  {t('auth.otpSent')}: {email}
                </div>
              </div>

              <OTPInput onChange={(otp) => setOtpCode(otp)} error={otpError} />

              <div className="space-y-2">
                <PrimaryButton type="submit" loading={isOtpLoading} className="w-full py-2.5">
                  {t('auth.otpButton')}
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => setShowOtpScreen(false)}
                  className="w-full text-center text-xs font-bold text-gray-500 hover:text-orange-600 py-1"
                >
                  मार्ग बदला / Change Method
                </button>
              </div>
            </form>
          )}

          <div className="text-center text-xs font-semibold text-slate-500 border-t border-slate-100 pt-4 cursor-pointer">
            <Link to="/register" className="text-orange-600 hover:underline">
              {t('auth.noAccount')}
            </Link>
          </div>
        </div>

        {/* DEMO presets support board */}
        {!showOtpScreen && (
          <div className="mt-6 bg-blue-50/70 border border-blue-100/50 rounded-2xl p-4 sm:mx-auto sm:w-full sm:max-w-md text-left space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-800" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-950">
                चाचणी लॉगिन पर्याय / Demo Preset Logins
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                onClick={() => applyDemoPreset('admin@dindori.org')}
                className="p-1 px-2.5 bg-white border border-blue-100 hover:bg-blue-100 rounded-lg text-slate-700 font-bold"
              >
                Super Admin
              </button>
              <button
                onClick={() => applyDemoPreset('employer@tata.com')}
                className="p-1 px-2.5 bg-white border border-blue-100 hover:bg-blue-100 rounded-lg text-slate-700 font-bold"
              >
                Company Recruiter
              </button>
              <button
                onClick={() => applyDemoPreset('candidate@gmail.com')}
                className="p-1 px-2.5 bg-white border border-blue-100 hover:bg-blue-100 rounded-lg text-slate-700 font-bold"
              >
                Job Candidate
              </button>
              <button
                onClick={() => applyDemoPreset('shg@shg.org')}
                className="p-1 px-2.5 bg-white border border-blue-100 hover:bg-blue-100 rounded-lg text-slate-700 font-bold"
              >
                SHG Cell Group
              </button>
              <button
                onClick={() => applyDemoPreset('handler@dindori.org')}
                className="p-2 py-1 bg-white border border-blue-100 hover:bg-blue-100 rounded-lg text-slate-700 font-bold col-span-2 text-center"
              >
                Handler Person (Dynamic Staff RBAC)
              </button>
            </div>
          </div>
        )}
      </div>

      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage('')} />
      )}
    </div>
  );
}
