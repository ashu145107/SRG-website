/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { useGetDashboardStatsQuery } from '../services/dashboardApi';
import { useGetInitiativesQuery } from '../services/initiativeApi';
import { MockDb } from '../services/mockDb';
import {
  Briefcase,
  Users,
  Building,
  Target,
  Award,
  BookOpen,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Heart,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { LanguageSwitcher } from '../components/ui/UtilityComponents';
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons';

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Mobil Nav Control
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [registerDropdownOpen, setRegisterDropdownOpen] = useState(false);

  // States for dynamic data
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: initiatives } = useGetInitiativesQuery();

  const [activeInitiativeTab, setActiveInitiativeTab] = useState<'upcoming' | 'past'>('upcoming');
  const [storyIndex, setStoryIndex] = useState(0);

  const stories = MockDb.getStories();
  const currentStory = stories[storyIndex];

  const handleNextStory = () => {
    setStoryIndex((prev) => (prev + 1) % stories.length);
  };

  const handlePrevStory = () => {
    setStoryIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const handleEnterGateway = (roleTarget: string) => {
    navigate('/register', { state: { preferredRole: roleTarget } });
  };

  const getLocalizedInitiative = (init: any) => {
    const isMr = i18n.language === 'mr';
    return {
      title: isMr ? init.titleMr : init.titleEn,
      desc: isMr ? init.descriptionMr : init.descriptionEn,
      location: isMr ? init.locationMr : init.locationEn,
      date: init.date
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased font-sans">
      {/* 1. TOP NAVBAR SCREEN HEADER */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Name */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-sm">
              श्री
            </div>
            <div className="text-left font-sans">
              <h1 className="text-base font-extrabold text-[#1E3A8A] tracking-wider uppercase leading-tight">
                Shri Swami Samarth Seva
              </h1>
              <p className="text-xs text-orange-600 font-bold uppercase tracking-widest">
                Self Employment Department
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#home" className="text-sm font-semibold text-orange-600 border-b-2 border-orange-500 pb-1">
              {t('nav.home')}
            </a>
            <a href="#about" className="text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors">
              {t('nav.about')}
            </a>
            <a href="#initiatives" className="text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors">
              {t('nav.initiatives')}
            </a>
            <a href="#contact" className="text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors">
              {t('nav.contact')}
            </a>
          </nav>

          {/* Language and Auth */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />

            {isAuthenticated && user && (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 rounded-lg hover:bg-blue-950 transition-all shadow-md"
                >
                  {t('nav.dashboard')} ({user.role})
                </Link>
                <button
                  onClick={() => dispatch(logout())}
                  className="text-xs font-bold text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                >
                  {t('nav.logout')}
                </button>
              </div>
            )}

            {(!isAuthenticated || !user) && (
              <div className="flex items-center gap-2">
                <div 
                  className="relative" 
                  onMouseLeave={() => setLoginDropdownOpen(false)}
                >
                  <button
                    onMouseEnter={() => setLoginDropdownOpen(true)}
                    onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                    className="px-4 py-2 text-xs font-bold text-blue-900 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('nav.login')}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${loginDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {loginDropdownOpen && (
                    <div 
                      onMouseEnter={() => setLoginDropdownOpen(true)}
                      className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <div className="px-3.5 py-1 border-b border-slate-50 mb-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">लॉगिन प्रकार / Login Type</span>
                      </div>
                      <Link
                        to="/login?role=candidate"
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex flex-col px-3.5 py-2 hover:bg-orange-50 text-left transition-colors"
                      >
                        <span className="text-xs font-bold text-slate-800 hover:text-orange-950">नोकरी शोधक लॉगिन / Job Seeker Login</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">उमेदवार व नोकरीसाठी प्रवेश</span>
                      </Link>
                      <Link
                        to="/login?role=employer"
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex flex-col px-3.5 py-2 hover:bg-orange-50 text-left transition-colors"
                      >
                        <span className="text-xs font-bold text-slate-800 hover:text-orange-950">उद्योजक लॉगिन / Employer Login</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">नियोक्ते व कंपन्यांसाठी प्रवेश</span>
                      </Link>
                      <div className="h-px bg-slate-100 my-1" />
                      <Link
                        to="/login"
                        onClick={() => setLoginDropdownOpen(false)}
                        className="flex items-center justify-between px-3.5 py-1 text-[11px] font-bold text-blue-900 hover:text-orange-600"
                      >
                        <span>इतर लॉगिन / Staff & Admin</span>
                        <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-sm">Staff</span>
                      </Link>
                    </div>
                  )}
                </div>

                <div 
                  className="relative" 
                  onMouseLeave={() => setRegisterDropdownOpen(false)}
                >
                  <button
                    onMouseEnter={() => setRegisterDropdownOpen(true)}
                    onClick={() => setRegisterDropdownOpen(!registerDropdownOpen)}
                    className="px-4 py-2 text-xs font-bold text-white bg-orange-600 border border-orange-700 rounded-lg hover:bg-orange-700 transition-all flex items-center gap-1 cursor-pointer shadow-md"
                  >
                    <span>{t('nav.register')}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${registerDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {registerDropdownOpen && (
                    <div 
                      onMouseEnter={() => setRegisterDropdownOpen(true)}
                      className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                      <div className="px-3.5 py-1 border-b border-slate-50 mb-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">नोंदणी प्रकार / Registration Type</span>
                      </div>
                      <Link
                        to="/register?role=candidate"
                        onClick={() => setRegisterDropdownOpen(false)}
                        className="flex flex-col px-3.5 py-2 hover:bg-orange-50 text-left transition-colors"
                      >
                        <span className="text-xs font-bold text-slate-800 hover:text-orange-950">नोकरी शोधक नोंदणी / Job Seeker Register</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">उमेदवार व नोकरीसाठी नोंदणी</span>
                      </Link>
                      <Link
                        to="/register?role=employer"
                        onClick={() => setRegisterDropdownOpen(false)}
                        className="flex flex-col px-3.5 py-2 hover:bg-orange-50 text-left transition-colors"
                      >
                        <span className="text-xs font-bold text-slate-800 hover:text-orange-950">उद्योजक नोंदणी / Employer Register</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">नियोक्ते व कंपन्यांसाठी नोंदणी</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-orange-600 rounded-xl focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white py-4 px-6 space-y-4">
            <div className="flex flex-col gap-3 text-left">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-orange-600"
              >
                {t('nav.home')}
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-gray-600"
              >
                {t('nav.about')}
              </a>
              <a
                href="#initiatives"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-gray-600"
              >
                {t('nav.initiatives')}
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-gray-600"
              >
                {t('nav.contact')}
              </a>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl">
                <span className="text-xs font-bold text-gray-500">भाषा / Language:</span>
                <LanguageSwitcher />
              </div>

              {isAuthenticated && user && (
                <div className="space-y-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center w-full py-2.5 bg-blue-900 text-white rounded-xl text-xs font-bold"
                  >
                    {t('nav.dashboard')} ({user.role})
                  </Link>
                  <button
                    onClick={() => {
                      dispatch(logout());
                      setMobileMenuOpen(false);
                    }}
                    className="block text-center w-full py-2.5 border border-red-200 text-red-600 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              )}

              {(!isAuthenticated || !user) && (
                <div className="space-y-3 pt-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left pl-1">लॉगिन प्रकार / Login Gateways</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login?role=candidate"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-center py-2.5 bg-blue-50 border border-blue-100 text-blue-900 rounded-xl text-xs font-bold"
                    >
                      नोकरी शोधक / Job Seeker
                    </Link>
                    <Link
                      to="/login?role=employer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-center py-2.5 bg-blue-50 border border-blue-100 text-blue-900 rounded-xl text-xs font-bold"
                    >
                      उद्योजक / Employer
                    </Link>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left pl-1 pt-1 border-t border-slate-100">नोंदणी प्रकार / Registration Gateways</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/register?role=candidate"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-center py-2.5 bg-orange-50 border border-orange-100 text-orange-900 rounded-xl text-xs font-bold shadow-xs hover:bg-orange-100"
                    >
                      नोकरी शोधक / Job Seeker
                    </Link>
                    <Link
                      to="/register?role=employer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-center py-2.5 bg-orange-50 border border-orange-100 text-orange-900 rounded-xl text-xs font-bold shadow-xs hover:bg-orange-100"
                    >
                      उद्योजक / Employer
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section id="home" className="py-12 md:py-18 bg-linear-to-b from-orange-50/70 via-white to-slate-50 relative overflow-hidden">
        {/* Subtle orange ambient glow backgrounds */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 border border-orange-200/50 rounded-full text-orange-700 font-sans font-bold text-xs uppercase tracking-wider mb-6">
            <Award className="w-3.5 h-3.5" /> आध्यात्मिकतेची जोड, स्वयंरोजगाराची वाट!
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-950 tracking-tight leading-tight max-w-4xl mx-auto">
            {t('hero.headline')}
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-4 max-w-2xl mx-auto font-medium">
            {t('hero.subHeadline')}
          </p>

          {/* 3 GATEWAY CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12 sm:mt-16 z-10">
            {/* Seeker Gate */}
            <div className="bg-white p-8 rounded-[12px] border border-gray-200 shadow-xl hover:border-orange-500 transition-all group flex flex-col justify-between text-left">
              <div>
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">
                  {t('hero.candidate.title')}
                </h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed font-semibold">
                  {t('hero.candidate.desc')}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-orange-850 rounded-md">
                    नोकरी
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-orange-850 rounded-md">
                    प्लेसमेंट
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-orange-850 rounded-md">
                    समुपदेशन
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleEnterGateway('CANDIDATE')}
                className="w-full mt-6 py-3 bg-[#F8FAFC] border border-gray-200 text-[#1E3A8A] font-bold rounded-lg hover:bg-orange-600 hover:text-white transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
              >
                {t('hero.candidate.action')} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Recruiter/Employer Gate */}
            <div className="bg-[#1E3A8A] p-8 rounded-[12px] shadow-xl transform scale-105 flex flex-col justify-between text-left group">
              <div>
                <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center mb-6">
                  <Building className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {t('hero.employer.title')}
                </h3>
                <p className="text-sm text-blue-200 mb-6 leading-relaxed font-semibold">
                  {t('hero.employer.desc')}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-white/10 text-blue-100 rounded-md">
                    थेट भरती
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-white/10 text-blue-100 rounded-md">
                    मोफत शोध
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleEnterGateway('COMPANY')}
                className="w-full mt-6 py-3 bg-[#F97316] text-white font-bold rounded-lg shadow-lg hover:bg-white hover:text-[#1E3A8A] transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
              >
                {t('hero.employer.action')} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* SHG Gate */}
            <div className="bg-white p-8 rounded-[12px] border border-gray-200 shadow-xl hover:border-orange-500 transition-all group flex flex-col justify-between text-left">
              <div>
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">
                  {t('hero.shg.title')}
                </h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed font-semibold">
                  {t('hero.shg.desc')}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-md">
                    प्रशिक्षण
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-md">
                    बाजारपेठ
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-md">
                    गट नोंदणी
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleEnterGateway('SHG')}
                className="w-full mt-6 py-3 bg-[#F8FAFC] border border-gray-200 text-[#1E3A8A] font-bold rounded-lg hover:bg-orange-600 hover:text-white transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
              >
                {t('hero.shg.action')} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST & IMPACT SECTION */}
      <section id="about" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Panel */}
            <div className="lg:col-span-5 relative text-left">
              <div className="aspect-square bg-slate-150 rounded-2xl overflow-hidden shadow-xs relative border border-orange-100 flex flex-col justify-center items-center text-center p-8 bg-linear-to-tr from-orange-400 to-amber-500 text-white">
                <span className="text-6xl mb-4">🙏</span>
                <blockquote className="italic text-base md:text-lg font-bold leading-relaxed">
                  \"आध्यात्मिक अधिष्ठान असेल तर प्रत्येक कार्यात यश निश्चित मिळते. प्रामाणिक श्रम हाच सर्वात मोठा धर्म आहे.\"
                </blockquote>
                <cite className="block text-xs font-bold uppercase tracking-wider mt-4 opacity-90 not-italic">
                  - सद्गुरु मोरे दादा (प्रेरणास्थान)
                </cite>
              </div>
              <div className="absolute -bottom-5 -right-5 bg-blue-900 text-white p-4.5 rounded-2xl shadow-lg border border-blue-800 text-center max-w-xs ring-4 ring-white">
                <span className="text-2xl font-black block">१०,०००+</span>
                <span className="text-[10px] font-semibold text-blue-250 block uppercase tracking-wide">
                  तरुणांना मिळालेला थेट स्वावलंबन मार्ग
                </span>
              </div>
            </div>

            {/* Context */}
            <div className="lg:col-span-7 text-left space-y-6">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block">
                {t('trust.title')}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-blue-950 tracking-tight leading-8">
                आर्थिक सक्षमीकरणाचा स्वामी मार्ग
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                {t('trust.description')}
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                  <span className="text-sm font-semibold text-slate-700">{t('trust.points.morals')}</span>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                  <span className="text-sm font-semibold text-slate-700">{t('trust.points.rural')}</span>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">✓</div>
                  <span className="text-sm font-semibold text-slate-700">{t('trust.points.women')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATISTICS COUNTERS SECTION */}
      <section className="bg-blue-950 text-white py-12 md:py-16 relative">
        <div className="absolute inset-0 bg-radial from-blue-900/40 to-blue-950 opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-10 block">
            {t('stats.title')}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-orange-400 block tracking-tight">
                {stats?.totalCandidates ? `${stats.totalCandidates}+` : '२५००+'}
              </span>
              <span className="text-[11px] font-bold text-blue-200 block uppercase tracking-wider">
                {t('stats.candidates')}
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-orange-400 block tracking-tight">
                {stats?.activeJobs ? `${stats.activeJobs}` : '३४०'}
              </span>
              <span className="text-[11px] font-bold text-blue-200 block uppercase tracking-wider">
                {t('stats.jobs')}
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-orange-400 block tracking-tight">
                {stats?.approvedCompanies ? `${stats.approvedCompanies}+` : '१५०+'}
              </span>
              <span className="text-[11px] font-bold text-blue-200 block uppercase tracking-wider">
                {t('stats.companies')}
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-orange-400 block tracking-tight">
                {stats?.totalSHGs ? `${stats.totalSHGs}+` : '४८०+'}
              </span>
              <span className="text-[11px] font-bold text-blue-200 block uppercase tracking-wider">
                {t('stats.shgs')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block mb-3">
            सोपी प्रक्रिया
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-950 tracking-tight">
            {t('howItWorks.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto text-left">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative">
              <span className="absolute -top-4 left-6 px-3.5 py-1 bg-orange-600 text-white text-xs font-extrabold rounded-lg">
                चरण १
              </span>
              <h3 className="text-base font-bold text-blue-950 mt-2">{t('howItWorks.step1Title')}</h3>
              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-semibold">
                {t('howItWorks.step1Desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative">
              <span className="absolute -top-4 left-6 px-3.5 py-1 bg-orange-600 text-white text-xs font-extrabold rounded-lg">
                चरण २
              </span>
              <h3 className="text-base font-bold text-blue-950 mt-2">{t('howItWorks.step2Title')}</h3>
              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-semibold">
                {t('howItWorks.step2Desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative">
              <span className="absolute -top-4 left-6 px-3.5 py-1 bg-orange-600 text-white text-xs font-extrabold rounded-lg">
                चरण ३
              </span>
              <h3 className="text-base font-bold text-blue-950 mt-2">{t('howItWorks.step3Title')}</h3>
              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-semibold">
                {t('howItWorks.step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INITIATIVES (TABBED SECTION) */}
      <section id="initiatives" className="py-16 md:py-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block mb-3">
            {t('nav.initiatives')}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-950 tracking-tight">
            {t('initiatives.title')}
          </h2>

          {/* Tab buttons */}
          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={() => setActiveInitiativeTab('upcoming')}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeInitiativeTab === 'upcoming'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-250/70'
              }`}
            >
              {t('initiatives.upcoming')}
            </button>
            <button
              onClick={() => setActiveInitiativeTab('past')}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeInitiativeTab === 'past'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-250/70'
              }`}
            >
              {t('initiatives.past')}
            </button>
          </div>

          {/* Initiative Grid list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mt-10 text-left">
            {initiatives
              ?.filter((init) => init.type === activeInitiativeTab)
              .map((init) => {
                const localized = getLocalizedInitiative(init);
                return (
                  <div
                    key={init.id}
                    className="bg-slate-50 rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-sm transition-all text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <span className="text-xs font-bold text-orange-600 bg-orange-100/50 px-2.5 py-0.5 rounded-md">
                          {localized.date}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-blue-950 leading-snug">
                        {localized.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed font-semibold">
                        {localized.desc}
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-gray-200/50 flex items-center gap-2 text-slate-400">
                      <MapPin className="w-4.5 h-4.5 text-orange-500 shrink-0" />
                      <span className="text-[10px] text-slate-600 font-bold leading-none truncate">
                        {localized.location}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* 7. SUCCESS STORIES PANEL WITH CONTROLS */}
      {currentStory && (
        <section className="py-16 bg-slate-50 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block mb-3">
              प्रेरणा
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-blue-950 tracking-tight mb-10">
              {t('stories.title')}
            </h2>

            <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 sm:p-10 border border-gray-100 shadow-xs relative">
              <span className="text-6xl text-orange-200 absolute top-4 left-6 select-none opacity-40">“</span>
              <div className="space-y-4 relative z-10 text-left">
                <p className="text-sm sm:text-base text-slate-600 italic leading-relaxed font-semibold">
                  {i18n.language === 'mr' ? currentStory.storyMr : currentStory.storyEn}
                </p>

                <div className="pt-4 border-t border-orange-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-blue-950">
                      {i18n.language === 'mr' ? currentStory.nameMr : currentStory.nameEn}
                    </h4>
                    <p className="text-xs font-semibold text-orange-600">
                      {i18n.language === 'mr' ? currentStory.roleMr : currentStory.roleEn}
                    </p>
                  </div>

                  {/* Manual buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevStory}
                      className="p-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all duration-100 active:scale-95 shrink-0"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextStory}
                      className="p-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all duration-100 active:scale-95 shrink-0"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8. FINAL CTA */}
      <section className="bg-linear-to-r from-orange-500 to-amber-500 text-white py-14 sm:py-16 text-center shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug">
            {t('cta.title')}
          </h2>
          <p className="text-sm md:text-base opacity-90 max-w-2xl mx-auto font-medium">
            {t('cta.subtitle')}
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-blue-950 hover:bg-blue-1000 font-bold rounded-xl text-sm transition-all shadow-md active:scale-98 float-none"
            >
              {t('cta.button')}
            </Link>
          </div>
        </div>
      </section>

      {/* 9. STANDARD FOOTER */}
      <footer id="contact" className="bg-blue-950 text-white pt-14 pb-8 border-t border-blue-900/40 text-left text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-blue-900/40">
          {/* Col 1 */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white text-xs">
                श्री
              </div>
              <span className="font-bold text-sm tracking-tight">श्री स्वामी समर्थ सेवा मार्ग</span>
            </div>
            <p className="opacity-70 leading-relaxed font-semibold">
              {t('footer.aboutText')}
            </p>
          </div>

          {/* Col 2 */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-orange-400">
              {t('footer.quickLinks')}
            </h4>
            <div className="flex flex-col gap-2 opacity-80 font-bold">
              <a href="#home" className="hover:text-orange-400 hover:underline">{t('nav.home')}</a>
              <a href="#about" className="hover:text-orange-400 hover:underline">{t('nav.about')}</a>
              <a href="#initiatives" className="hover:text-orange-400 hover:underline">{t('nav.initiatives')}</a>
              <a href="#contact" className="hover:text-orange-400 hover:underline">{t('nav.contact')}</a>
            </div>
          </div>

          {/* Col 3 */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-orange-400">
              {t('footer.contact')}
            </h4>
            <div className="space-y-2 opacity-80 font-semibold leading-relaxed">
              <div className="flex gap-2">
                <MapPin className="w-4.5 h-4.5 text-orange-400 shrink-0" />
                <span>{t('footer.address')}</span>
              </div>
              <div className="flex gap-2">
                <Phone className="w-4.5 h-4.5 text-orange-400 shrink-0" />
                <span>{t('footer.phone')}</span>
              </div>
              <div className="flex gap-2">
                <Mail className="w-4.5 h-4.5 text-orange-400 shrink-0" />
                <span>{t('footer.email')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400">
          <span className="font-medium text-[11px] uppercase tracking-wide">
            {t('footer.rights')}
          </span>
          <div className="flex gap-4 font-bold">
            <a href="#" className="hover:text-white">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-white">{t('footer.terms')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
