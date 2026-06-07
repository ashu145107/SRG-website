/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useResetPasswordMutation } from '../services/authApi';
import { TextBox } from '../components/ui/Inputs';
import { PrimaryButton } from '../components/ui/Buttons';
import { Alert, Toast } from '../components/ui/FeedbackComponents';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [reset, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccess(false);

    if (!email) {
      setErrorText('Please specify a registered email.');
      return;
    }

    try {
      await reset({ email }).unwrap();
      setSuccess(true);
    } catch (err: any) {
      setErrorText('Failed to perform password reset.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative antialiased font-sans text-left">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>
        <h2 className="text-2xl font-extrabold text-blue-950 tracking-tight">
          {t('auth.forgotPassword')}
        </h2>
        <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-widest text-orange-600">
          श्री स्वामी समर्थ स्वयंरोजगार
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          {success ? (
            <div className="space-y-4">
              <Alert
                type="success"
                title="सूचना पाठविली!"
                message="Password reset instructions have been dispatched to your email address with guidelines to define your new log in safety key."
              />
              <Link
                to="/login"
                className="block text-center w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                लॉगिन कडे जा / Go to Login
              </Link>
            </div>
          ) : (
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

              <PrimaryButton type="submit" loading={isLoading} className="w-full py-3">
                लिंक पाठवा / Submit Request
              </PrimaryButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
