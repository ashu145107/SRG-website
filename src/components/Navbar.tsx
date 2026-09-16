/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { LanguageSwitcher } from './ui/UtilityComponents';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Briefcase, Users, Phone, Info } from 'lucide-react';

interface NavbarProps {
  activePage?: string;
  compact?: boolean;
}

export function Navbar({ activePage, compact }: NavbarProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [jobsDropdown, setJobsDropdown] = useState(false);
  const [shgDropdown, setShgDropdown] = useState(false);

  const isMr = i18n.language === 'mr';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinkClass = (active: boolean) =>
    `block px-3 py-2 rounded-xl text-sm font-bold ${
      active ? 'bg-theme-lightViolet text-theme-lavender font-extrabold' : 'text-theme-darkViolet hover:bg-theme-lightViolet/40'
    }`;

  return (
    <header className="bg-theme-cream/90 backdrop-blur-md border-b border-theme-sage/25 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24 gap-2">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group text-left min-w-0 flex-1 mr-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-2xl shadow-md flex items-center justify-center border border-theme-lightViolet p-1 shrink-0 group-hover:scale-105 transition-transform">
              <img src="/home/logo.png" alt="SRG Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-theme-darkViolet/70 font-extrabold truncate">
                {isMr ? 'श्री स्वामी समर्थ सेवा मार्ग, दिंडोरी' : 'Shri Swami Seva Marg, Dindori'}
              </span>
              <span className="text-sm sm:text-base lg:text-lg font-black text-theme-darkViolet leading-tight truncate">
                {isMr ? 'स्वयंरोजगार विभाग' : 'Swayamrojgar Vibhag'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            <Link
              to="/"
              className={`text-sm font-bold transition-colors ${
                activePage === 'home' ? 'text-theme-lavender font-extrabold' : 'text-theme-darkViolet/80 hover:text-theme-lavender'
              }`}
            >
              {isMr ? 'मुख्यपृष्ठ' : 'Home'}
            </Link>

            {!compact && (
              <>
                <a
                  href="/#about"
                  className="text-theme-darkViolet/75 hover:text-theme-lavender font-semibold text-sm transition-colors"
                >
                  {isMr ? 'आमच्याबद्दल' : 'About Us'}
                </a>

                {/* Jobs Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setJobsDropdown(true)}
                  onMouseLeave={() => setJobsDropdown(false)}
                >
                  <button className="flex items-center gap-1.5 text-theme-darkViolet/75 hover:text-theme-lavender font-semibold text-sm transition-colors py-2 cursor-pointer">
                    <span>{isMr ? 'नोकऱ्या' : 'Jobs'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${jobsDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {jobsDropdown && (
                    <div className="absolute left-0 top-full pt-1 z-50 animate-fade-in w-60">
                      <div className="glass rounded-2xl py-2 shadow-xl border border-white/90 bg-white/95 backdrop-blur-md">
                        <Link
                          to="/#careers"
                          className="block px-4 py-2 text-xs font-bold text-theme-darkViolet/80 hover:text-theme-lavender hover:bg-theme-lightViolet/60 transition-colors"
                        >
                          {isMr ? 'नोकऱ्या शोधा' : 'Browse Jobs'}
                        </Link>
                        <Link
                          to="/register?type=employer"
                          className="block px-4 py-2 text-xs font-bold text-theme-darkViolet/80 hover:text-theme-lavender hover:bg-theme-lightViolet/60 transition-colors"
                        >
                          {isMr ? 'नोकरी आवश्यकता नोंदवा' : 'Post a Requirement'}
                        </Link>
                        <Link
                          to="/register?type=candidate"
                          className="block px-4 py-2 text-xs font-bold text-theme-darkViolet/80 hover:text-theme-lavender hover:bg-theme-lightViolet/60 transition-colors"
                        >
                          {isMr ? 'उमेदवार नोंदणी' : 'Candidate Registration'}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* SHG Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setShgDropdown(true)}
                  onMouseLeave={() => setShgDropdown(false)}
                >
                  <button className="flex items-center gap-1.5 text-theme-darkViolet/75 hover:text-theme-lavender font-semibold text-sm transition-colors py-2 cursor-pointer whitespace-nowrap">
                    <span>{isMr ? 'बचतगट व उपजीविका' : 'SHG & Livelihood'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${shgDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {shgDropdown && (
                    <div className="absolute left-0 top-full pt-1 z-50 animate-fade-in w-64">
                      <div className="glass rounded-2xl py-2 shadow-xl border border-white/90 bg-white/95 backdrop-blur-md">
                        <Link
                          to="/#shg"
                          className="block px-4 py-2 text-xs font-bold text-theme-darkViolet/80 hover:text-theme-lavender hover:bg-theme-lightViolet/60 transition-colors"
                        >
                          {isMr ? 'महिला बचतगट माहिती' : 'About Self-Help Groups'}
                        </Link>
                        <Link
                          to="/#products"
                          className="block px-4 py-2 text-xs font-bold text-theme-darkViolet/80 hover:text-theme-lavender hover:bg-theme-lightViolet/60 transition-colors"
                        >
                          {isMr ? 'उत्पादन कॅटलॉग' : 'Community Products'}
                        </Link>
                        <Link
                          to="/register?type=candidate"
                          className="block px-4 py-2 text-xs font-bold text-theme-darkViolet/80 hover:text-theme-lavender hover:bg-theme-lightViolet/60 transition-colors"
                        >
                          {isMr ? 'बचतगट नोंदणी' : 'Register Your Group'}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <a
                  href="/#contact"
                  className="text-theme-darkViolet/75 hover:text-theme-lavender font-semibold text-sm transition-colors"
                >
                  {isMr ? 'संपर्क' : 'Contact'}
                </a>
              </>
            )}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <LanguageSwitcher />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/dashboard"
                  className="btn-gloss inline-flex items-center gap-2 bg-theme-lavender text-white px-4 py-2 rounded-full font-bold text-xs hover:bg-theme-darkViolet transition-all shadow-md shadow-theme-lavender/30"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{isMr ? 'डॅशबोर्ड' : 'Dashboard'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className={`text-sm font-bold transition-colors whitespace-nowrap ${
                    activePage === 'login'
                      ? 'text-theme-lavender font-extrabold'
                      : 'text-theme-darkViolet/80 hover:text-theme-lavender'
                  }`}
                >
                  {isMr ? 'लॉगिन' : 'Login'}
                </Link>
                <span className="text-theme-darkViolet/25">|</span>
                <Link
                  to="/register"
                  className={`btn-gloss inline-block bg-theme-lavender text-white px-5 py-2 rounded-full font-bold text-xs hover:bg-theme-darkViolet transition-all shadow-md shadow-theme-lavender/30 whitespace-nowrap active:scale-98 ${
                    activePage === 'register' ? 'ring-2 ring-theme-darkViolet ring-offset-2' : ''
                  }`}
                >
                  {isMr ? 'नोंदणी करा' : 'Sign Up'}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger (language moved into drawer) */}
          <div className="flex items-center lg:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-theme-darkViolet hover:bg-theme-lightViolet/60 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-theme-lightViolet/80 bg-theme-cream/98 px-4 pt-4 pb-6 space-y-3 shadow-2xl animate-fade-in text-left">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={navLinkClass(activePage === 'home')}
          >
            {isMr ? 'मुख्यपृष्ठ / Home' : 'Home'}
          </Link>

          {!compact && (
            <>
              <a
                href="/#about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-theme-darkViolet hover:bg-theme-lightViolet/40"
              >
                {isMr ? 'आमच्याबद्दल / About Us' : 'About Us'}
              </a>
              <a
                href="/#careers"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-theme-darkViolet hover:bg-theme-lightViolet/40"
              >
                {isMr ? 'नोकऱ्या / Jobs' : 'Jobs'}
              </a>
              <a
                href="/#shg"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-theme-darkViolet hover:bg-theme-lightViolet/40"
              >
                {isMr ? 'बचतगट / SHG & Products' : 'SHG & Products'}
              </a>
              <a
                href="/#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-theme-darkViolet hover:bg-theme-lightViolet/40"
              >
                {isMr ? 'संपर्क / Contact' : 'Contact'}
              </a>
            </>
          )}

          <div className="border-t border-theme-lightViolet/80 pt-3 space-y-2">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-gloss w-full flex items-center justify-center gap-2 bg-theme-lavender text-white py-2.5 rounded-xl font-bold text-xs shadow-md"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{isMr ? 'डॅशबोर्ड उघडा' : 'Go to Dashboard'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-700 py-2.5 rounded-xl font-bold text-xs border border-rose-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isMr ? 'लॉगआउट' : 'Logout'}</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full text-center py-2.5 rounded-xl text-xs font-bold border border-theme-lightViolet/80 bg-white hover:bg-theme-lightViolet/30 ${
                    activePage === 'login' ? 'text-theme-lavender font-extrabold' : 'text-theme-darkViolet'
                  }`}
                >
                  {isMr ? 'लॉगिन' : 'Login'}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`btn-gloss w-full text-center py-2.5 rounded-xl text-xs font-bold text-white bg-theme-lavender shadow-md ${
                    activePage === 'register' ? 'ring-2 ring-theme-darkViolet ring-offset-2' : ''
                  }`}
                >
                  {isMr ? 'नोंदणी' : 'Sign Up'}
                </Link>
              </div>
            )}
          </div>

          <div className="border-t border-theme-lightViolet/80 pt-3 flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}