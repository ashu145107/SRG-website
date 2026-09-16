/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { useLoginMutation } from '../services/authApi';
import { Alert } from '../components/ui/FeedbackComponents';
import { Navbar } from '../components/Navbar';
import { Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const isMr = i18n.language === 'mr';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      const response = await login({ email: email.trim(), password }).unwrap();
      dispatch(setCredentials(response));
      navigate('/dashboard');
    } catch (err: any) {
      setFormError(err.data || 'लॉगिन अयशस्वी / Invalid login details. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-theme-cream flex flex-col antialiased font-sans">
      {/* Top Unified Navbar */}
      <Navbar activePage="login" compact />

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
                  {isMr ? 'खाते लॉगिन' : 'Account Login'}
                </h1>
                <p className="text-xs font-extrabold text-theme-lavender uppercase tracking-wider mt-1">
                  {isMr ? 'श्री स्वामी सेवा मार्ग, दिंडोरी' : 'Shri Swami Seva Marg, Dindori'}
                </p>
              </div>
            </div>

            {/* Login Form */}
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              {formError && <Alert type="danger" message={formError} />}

              {/* Username/Email/Mobile */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-theme-darkViolet">
                  {isMr ? 'युझरनेम / ईमेल / मोबाईल' : 'Username / Email / Mobile'} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theme-lavender">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={isMr ? 'उदा. user@domain.com किंवा 9876543210' : 'Enter username, email or mobile'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-3 bg-white border border-theme-lightViolet/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-lavender/20 focus:border-theme-lavender text-slate-800 font-medium transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-theme-darkViolet">
                    {isMr ? 'पासवर्ड' : 'Password'} *
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-bold text-theme-lavender hover:underline"
                  >
                    {isMr ? 'पासवर्ड विसरलात?' : 'Forgot Password?'}
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theme-lavender">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-10 pr-10 py-3 bg-white border border-theme-lightViolet/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-lavender/20 focus:border-theme-lavender text-slate-800 font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoginLoading}
                className="btn-gloss w-full py-3.5 px-6 rounded-xl bg-theme-lavender hover:bg-theme-lavender/90 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoginLoading ? (
                  <span>{isMr ? 'लॉगिन होत आहे...' : 'Logging in...'}</span>
                ) : (
                  <>
                    <span>{isMr ? 'लॉगिन करा' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Prompt */}
            <div className="text-center text-xs font-semibold text-slate-500 border-t border-theme-lightViolet/60 pt-4 space-y-2">
              <p>
                {isMr ? 'खाते नाही आहे का?' : "Don't have an account?"}{' '}
                <Link to="/register" className="text-theme-lavender font-extrabold hover:underline">
                  {isMr ? 'येथे नवीन नोंदणी करा' : 'Register Here'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}