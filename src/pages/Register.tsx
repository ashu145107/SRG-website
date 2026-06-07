/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { useRegisterMutation } from '../services/authApi';
import { TextBox } from '../components/ui/Inputs';
import { Dropdown } from '../components/ui/SelectionControls';
import { PrimaryButton } from '../components/ui/Buttons';
import { Alert, Toast } from '../components/ui/FeedbackComponents';
import { LanguageSwitcher } from '../components/ui/UtilityComponents';
import { UserRole } from '../types';
import { ArrowLeft } from 'lucide-react';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CANDIDATE);
  const [errorText, setErrorText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Register mutation
  const [register, { isLoading }] = useRegisterMutation();

  // If redirected from gateway clicks, prefill preferred role! Extremely polished
  useEffect(() => {
    if (location.state?.preferredRole) {
      setRole(location.state.preferredRole as UserRole);
    }
  }, [location.state]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!name || !email || !phone) {
      setErrorText('Please fill out all required fields.');
      return;
    }

    if (phone.length < 10) {
      setErrorText('Mobile phone number must be at least 10 numbers long.');
      return;
    }

    try {
      const response = await register({ name, email, phone, role }).unwrap();
      dispatch(setCredentials(response));
      setToastMessage(`खाते यशस्वीरीत्या तयार केले! / Account created successfully!`);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      setErrorText(err.data || 'Failed to complete registration.');
    }
  };

  const roleOptions = [
    { value: UserRole.CANDIDATE, label: 'उमेदवार / Candidate (Job Seeker)' },
    { value: UserRole.COMPANY, label: 'नियोक्ता / Employer (Recruiter)' },
    { value: UserRole.SHG, label: 'बचतगट / SHG (Self Help Group)' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative antialiased font-sans">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center animate-fade-in animate-duration-150">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> {t('nav.home')}
        </Link>
        <div className="mx-auto w-12 h-12 bg-linear-to-tr from-orange-400 to-amber-500 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-xs">
          श्री
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-blue-950 tracking-tight">
          {t('auth.registerTitle')}
        </h2>
        <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-widest text-orange-600">
          स्वावलंबन आणि स्वयंरोजगार
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <form className="space-y-5" onSubmit={handleRegisterSubmit}>
            {errorText && <Alert type="danger" message={errorText} />}

            <TextBox
              label={t('auth.fullName')}
              type="text"
              placeholder="E.g. Jayesh Patil"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <TextBox
              label={t('auth.email')}
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <TextBox
              label={t('auth.phone')}
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <Dropdown
              label={t('auth.role')}
              options={roleOptions}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            />

            <PrimaryButton type="submit" loading={isLoading} className="w-full py-3">
              {t('auth.submitRegister')}
            </PrimaryButton>
          </form>

          <div className="text-center text-xs font-semibold text-slate-500 border-t border-slate-100 pt-4 cursor-pointer">
            <Link to="/login" className="text-orange-600 hover:underline">
              {t('auth.hasAccount')}
            </Link>
          </div>
        </div>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage('')} />
      )}
    </div>
  );
}
