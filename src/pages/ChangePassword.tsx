/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { useChangePasswordMutation } from '../services/authApi';
import { PasswordBox } from '../components/ui/Inputs';
import { PrimaryButton } from '../components/ui/Buttons';
import { Alert } from '../components/ui/FeedbackComponents';
import { ArrowLeft, LogOut, LockKeyhole, CheckCircle2, XCircle, Check, X } from 'lucide-react';

interface DialogState {
  type: 'success' | 'error';
  message: string;
}

interface StrengthChecks {
  min8: boolean;
  upper: boolean;
  lower: boolean;
  digit: boolean;
  special: boolean;
}

const STRENGTH_META = [
  { labelEn: 'Weak', labelMr: 'कमकुवत', color: '#f43f5e', width: 20, tipEn: 'Add uppercase, numbers and special characters.', tipMr: 'मोठी अक्षरे, अंक आणि विशेष चिन्हे जोडा.' },
  { labelEn: 'Fair', labelMr: 'मध्यम', color: '#fb923c', width: 40, tipEn: 'Add uppercase, numbers and special characters.', tipMr: 'मोठी अक्षरे, अंक आणि विशेष चिन्हे जोडा.' },
  { labelEn: 'Medium', labelMr: 'चांगला', color: '#facc15', width: 60, tipEn: 'Longer passwords are safer — try 10+ characters.', tipMr: 'लांब पासवर्ड अधिक सुरक्षित — 10+ अक्षरे ठेवा.' },
  { labelEn: 'Good', labelMr: 'चांगला', color: '#84cc16', width: 80, tipEn: 'Almost there! Add one more special character.', tipMr: 'जवळजवळ पूर्ण! आणखी एक विशेष चिन्ह जोडा.' },
  { labelEn: 'Strong', labelMr: 'मजबूत', color: '#22c55e', width: 100, tipEn: 'Excellent — your password is strong!', tipMr: 'उत्कृष्ट — तुमचा पासवर्ड मजबूत आहे!' },
];

export default function ChangePassword() {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const [changePwd, { isLoading }] = useChangePasswordMutation();

  // Auto-fetch the numeric user id from the logged-in session
  const userId = Number(String(user?.id || '').replace(/\D/g, '')) || 0;

  // Animated password strength analysis
  const strength = React.useMemo<{ checks: StrengthChecks; score: number }>(() => {
    const checks: StrengthChecks = {
      min8: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      digit: /\d/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  }, [newPassword]);

  const strengthMeta = STRENGTH_META[strength.score] || STRENGTH_META[0];
  const passwordVisible = newPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!oldPassword) {
      setErrorText(t('auth.oldPwdRequired', 'जुना पासवर्ड प्रविष्ट करा / Please enter your old password.'));
      return;
    }
    if (!strength.checks.min8 || strength.score < 3) {
      setErrorText(t('auth.newPwdWeak', 'मजबूत पासवर्ड निवडा — किमान 8 अक्षरे, मोठी/लहान अक्षरे, अंक आणि विशेष चिन्ह. / Choose a strong password — min 8 characters with upper/lower case, a number and a special character.'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorText(t('auth.confirmPwdMismatch', 'नवीन पासवर्ड आणि पुष्टी पासवर्ड जुळत नाहीत / New password and confirmation do not match.'));
      return;
    }

    try {
      const result = await changePwd({ userId, oldPassword, newPassword }).unwrap();
      if (result.isSuccess) {
        setDialog({
          type: 'success',
          message: result.value || t('auth.pwdChanged', 'पासवर्ड यशस्वीरित्या बदलला! / Password changed successfully!'),
        });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
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
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased font-sans">
      {/* Slim dark top bar */}
      <nav className="bg-theme-darkViolet text-white border-b border-theme-lightViolet/20 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-theme-gold hover:text-white transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> {t('auth.backToDashboard', 'डॅशबोर्ड / Dashboard')}
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-white leading-none">{user?.name}</p>
            </div>
            <button
              onClick={() => { dispatch(logout()); navigate('/'); }}
              className="p-1 px-3 border border-theme-lightViolet/40 bg-white/10 font-bold hover:bg-theme-lavender rounded-xl text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-8 py-6 lg:py-10 w-full">
        <div className="mb-6 text-left">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-theme-lightViolet/70 border border-theme-lightViolet flex items-center justify-center">
              <LockKeyhole className="w-6 h-6 text-theme-lavender" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-theme-darkViolet">{t('auth.changePassword', 'पासवर्ड बदला / Change Password')}</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {t('auth.changePwdSub', 'तुमचा सुरक्षा पासवर्ड अद्ययावत करा / Update your account security password.')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-theme-lightViolet/80 shadow-2xl px-6 sm:px-10 py-8 space-y-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {errorText && <Alert type="danger" message={errorText} />}

            <PasswordBox
              label={t('auth.oldPassword', 'जुना पासवर्ड / Old Password')}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <PasswordBox
              label={t('auth.newPassword', 'नवीन पासवर्ड / New Password')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            {/* Animated password strength meter */}
            <div className={`overflow-hidden transition-all duration-500 ease-out ${passwordVisible ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: strengthMeta.color }}>
                  {isMr ? strengthMeta.labelMr : strengthMeta.labelEn}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {strength.score}/{Object.keys(strength.checks).length}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${passwordVisible ? strengthMeta.width : 0}%`,
                    backgroundColor: strengthMeta.color,
                    boxShadow: passwordVisible ? `0 0 8px ${strengthMeta.color}` : 'none',
                  }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 font-medium" style={{ color: strengthMeta.color }}>
                {isMr ? strengthMeta.tipMr : strengthMeta.tipEn}
              </p>

              {/* Pattern checklist */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {([
                  { key: 'min8' as const, labelEn: 'At least 8 characters', labelMr: 'किमान 8 अक्षरे' },
                  { key: 'upper' as const, labelEn: 'One uppercase letter (A-Z)', labelMr: 'एक मोठे अक्षर (A-Z)' },
                  { key: 'lower' as const, labelEn: 'One lowercase letter (a-z)', labelMr: 'एक लहान अक्षर (a-z)' },
                  { key: 'digit' as const, labelEn: 'One number (0-9)', labelMr: 'एक अंक (0-9)' },
                  { key: 'special' as const, labelEn: 'One special character (!@#...)', labelMr: 'एक विशेष चिन्ह (!@#...)' },
                ]).map((item) => {
                  const ok = strength.checks[item.key];
                  return (
                    <span key={item.key} className="flex items-center gap-1.5 text-[11px] font-semibold">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                          ok ? 'bg-emerald-100 text-emerald-600 scale-100' : 'bg-gray-100 text-gray-400 scale-90'
                        } animate-fade-in`}
                      >
                        {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      </span>
                      <span className={ok ? 'text-emerald-600' : 'text-slate-400'}>
                        {isMr ? item.labelMr : item.labelEn}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            <PasswordBox
              label={t('auth.confirmPassword', 'नवीन पासवर्डची पुष्टी / Confirm New Password')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <PrimaryButton type="submit" loading={isLoading} className="w-full py-3">
              {t('auth.changePasswordBtn', 'पासवर्ड बदला / Change Password')}
            </PrimaryButton>
          </form>
        </div>
      </main>

      {/* Result Dialog */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-left">
            <div className="p-6 sm:p-8 text-center space-y-4">
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
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-gloss inline-flex items-center gap-2 bg-theme-lavender hover:bg-theme-darkViolet text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  {t('auth.goToDashboard', 'डॅशबोर्ड कडे जा / Go to Dashboard')}
                </button>
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