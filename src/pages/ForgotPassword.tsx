/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../services/authApi';
import { TextBox } from '../components/ui/Inputs';
import { PrimaryButton } from '../components/ui/Buttons';
import { Alert } from '../components/ui/FeedbackComponents';
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';

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

    if (!email.trim()) {
      setErrorText(t('auth.emailRequired', 'नोंदणीकृत ईमेल प्रविष्ट करा / Please enter your registered email.'));
      return;
    }
    if (!/^\d{10}$/.test(mobile.trim())) {
      setErrorText(t('auth.mobileRequired', '10 अंकी मोबाईल नंबर प्रविष्ट करा / Please enter a 10-digit mobile number.'));
      return;
    }

    try {
      const result = await forgot({ email: email.trim(), mobile: mobile.trim() }).unwrap();
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
      <Navbar activePage="forgot-password" compact />

      <main className="flex-1 flex flex-col px-4 py-8 sm:py-12 text-left">
        <div className="m-auto w-full max-w-md text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-theme-darkViolet/60 hover:text-theme-lavender transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> {t('auth.backToLogin', 'Back to Login')}
          </Link>
          <h2 className="text-2xl font-extrabold text-theme-darkViolet tracking-tight">
            {t('auth.forgotPassword')}
          </h2>
          <p className="text-xs font-bold text-theme-lavender uppercase tracking-widest mt-1">
            {t('auth.brandSevaMarg', 'श्री स्वामी सेवा मार्ग, दिंडोरी')}
          </p>
        </div>

        <div className="mt-8 m-auto w-full max-w-md">
          <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-theme-lightViolet/80 shadow-2xl space-y-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {errorText && <Alert type="danger" message={errorText} />}

              <TextBox
                label={t('auth.email')}
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <TextBox
                label={t('auth.mobile', 'मोबाईल नंबर / Mobile Number')}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
              />

              <PrimaryButton type="submit" loading={isLoading} className="w-full py-3">
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> {t('auth.submitting', 'पाठवत आहे... / Submitting...')}
                  </span>
                ) : (
                  'पुनर्प्राप्ती करा / Forgot Password'
                )}
              </PrimaryButton>
            </form>
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