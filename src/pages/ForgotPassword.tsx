/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../services/authApi';
import { Alert } from '../components/ui/FeedbackComponents';
import { Navbar } from '../components/Navbar';
import { ArrowRight, CheckCircle2, XCircle, Mail, Phone } from 'lucide-react';

interface DialogState {
  type: 'success' | 'error';
  message: string;
}

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [errorText, setErrorText] = useState('');
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const [forgot, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    const emailVal = email.trim();
    const mobileVal = mobile.trim();

    if (!emailVal && !mobileVal) {
      setErrorText(
        t(
          'auth.emailOrMobileRequired',
          'नोंदणीकृत ईमेल किंवा मोबाईल नंबर प्रविष्ट करा / Please enter your registered email or mobile number.'
        )
      );
      return;
    }
    if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setErrorText(t('auth.emailInvalid', 'वैध ईमेल पत्ता प्रविष्ट करा / Please enter a valid email address.'));
      return;
    }
    if (mobileVal && !/^\d{10}$/.test(mobileVal)) {
      setErrorText(
        t('auth.mobileInvalid', '10 अंकी मोबाईल नंबर प्रविष्ट करा / Please enter a valid 10-digit mobile number.')
      );
      return;
    }

    try {
      const result = await forgot({ email: emailVal, mobile: mobileVal }).unwrap();
      if (result.isSuccess) {
        setDialog({
          type: 'success',
          message: result.value || t('auth.successMessage', 'खाते तपशील तुमच्या ईमेल पत्त्यावर पाठविले आहेत. / Account details have been sent to your email address.'),
        });
      } else {
        setDialog({
          type: 'error',
          message: result.value || result.error?.message || t('auth.errorMessage', 'अर्ज यशस्वी झाला नाही. कृपया प्रयत्न करा. / The request could not be completed. Please try again.'),
        });
      }
    } catch (err: any) {
      setDialog({
        type: 'error',
        message: (err as any)?.data || t('auth.errorMessage', 'अर्ज यशस्वी झाला नाही. कृपया प्रयत्न करा. / The request could not be completed. Please try again.'),
      });
    }
  };

  return (
    <div className="min-h-screen bg-theme-cream flex flex-col antialiased font-sans">
      {/* Top Unified Navbar */}
      <Navbar activePage="forgot-password" compact />

      {/* Main Content Area */}
      <main className="flex-1 flex px-4 py-8 sm:py-12">
        <div className="w-full max-w-md m-auto">
          {/* Card Container */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-theme-lightViolet/80 shadow-2xl p-6 sm:p-9 space-y-6">
            {/* Brand Logo & Header */}
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-white rounded-2xl shadow-md border border-theme-lightViolet flex items-center justify-center p-1.5 transform hover:scale-105 transition-transform">
                <img src="/home/logo.png" alt="SRG Logo" className="w-full h-full object-contain" />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-theme-darkViolet tracking-tight">
                  {t('auth.forgotPassword')}
                </h1>
                <p className="text-xs font-extrabold text-theme-lavender uppercase tracking-wider mt-1">
                  {t('auth.emailOrMobile', 'श्री स्वामी सेवा मार्ग, दिंडोरी / Enter your registered email or mobile')}
                </p>
              </div>
            </div>

            {/* Forgot Password Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {errorText && <Alert type="danger" message={errorText} />}

              {/* Email */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-theme-darkViolet">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theme-lavender">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-3 bg-white border border-theme-lightViolet/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-lavender/20 focus:border-theme-lavender text-slate-800 font-medium transition-all"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-theme-darkViolet">
                  {t('auth.mobile', 'मोबाईल नंबर / Mobile Number')}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theme-lavender">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full text-xs pl-10 pr-4 py-3 bg-white border border-theme-lightViolet/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-lavender/20 focus:border-theme-lavender text-slate-800 font-medium transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-gloss w-full py-3.5 px-6 rounded-xl bg-theme-lavender hover:bg-theme-lavender/90 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>{t('auth.submitting', 'पाठवत आहे... / Submitting...')}</span>
                ) : (
                  <>
                    <span>{t('auth.forgotBtn', 'पुनर्प्राप्ती करा / Recover Password')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Prompt */}
            <div className="text-center text-xs font-semibold text-slate-500 border-t border-theme-lightViolet/60 pt-4 space-y-2">
              <p>
                {t('auth.backToLoginPrompt', 'पासवर्ड आठवला? / Remembered your password?')}{' '}
                <Link to="/login" className="text-theme-lavender font-extrabold hover:underline">
                  {t('auth.backToLogin', 'लॉगिन कडे परत / Back to Login')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Result Dialog */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-left">
            <div className={`p-6 sm:p-8 text-center space-y-4`}>
              {dialog.type === 'success' ? (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
                    <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {t('auth.successTitle', 'यशस्वी! / Success!')}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{dialog.message}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center shadow-inner">
                    <XCircle className="w-9 h-9 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {t('auth.errorTitle', 'त्रुटी! / Error!')}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{dialog.message}</p>
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              {dialog.type === 'success' && (
                <Link
                  to="/login"
                  className="btn-gloss inline-flex items-center gap-2 bg-theme-lavender hover:bg-theme-darkViolet text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md"
                >
                  {t('auth.goToLogin', 'लॉगिन कडे जा / Go to Login')}
                </Link>
              )}
              <button
                onClick={() => setDialog(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {t('auth.close', 'बंद करा / Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}