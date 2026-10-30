/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useSectionNav } from '../utils/sectionNav';
import { Phone, Mail, MessageCircle, Play } from 'lucide-react';

export interface SiteFooterHandlers {
  scrollTo?: (section: string) => void;
  enterGateway?: (role: string) => void;
}

export function SiteFooter({ scrollTo, enterGateway }: SiteFooterHandlers) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goHome = () => navigate('/');
  const goSection = useSectionNav();
  // Prefer the host page's own scroller, otherwise fall back to routing home
  // and letting Home scroll to the target.
  const section = (id: string) => () => (scrollTo ? scrollTo(id) : goSection(id));
  const gateway = (role: string) => () => (enterGateway ? enterGateway(role) : goHome());

  return (
    <footer className="bg-white border-t border-theme-lightViolet pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[4fr_2.5fr_2.5fr_3fr] gap-8 lg:gap-10 mb-12 items-start">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white rounded-xl border border-theme-lightViolet p-1 flex items-center justify-center">
                <img src="/home/logo.png" alt={t('footer.brand')} className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-theme-darkViolet text-lg">{t('footer.brand')}</span>
            </div>
            <p className="text-xs font-bold text-theme-darkViolet/70 leading-snug mb-6">{t('nav.orgName')} - {t('nav.department')}</p>
            <p className="text-sm text-theme-darkViolet/60 mb-6 leading-relaxed">
              {t('footer.tagline')}
            </p>
            <p className="flex items-start gap-2 text-sm text-theme-darkViolet/80 font-semibold">
              <Phone className="w-4 h-4 text-theme-lavender shrink-0 mt-0.5" />
              <span className="flex flex-col">
                <a href="tel:+917755941753" className="hover:text-theme-lavender transition">+91 7755941753</a>
                <a href="tel:+918956741109" className="hover:text-theme-lavender transition">+91 8956741109</a>
              </span>
            </p>
            <p className="flex items-start gap-2 text-sm text-theme-darkViolet/80 font-semibold mt-2">
              <Mail className="w-4 h-4 text-theme-lavender shrink-0 mt-0.5" />
              <span className="flex flex-col break-all">
                <a href="mailto:admin@dindoripranit.org" className="hover:text-theme-lavender transition">admin@dindoripranit.org</a>
                <a href="mailto:srg.dindori@gmail.com" className="hover:text-theme-lavender transition">srg.dindori@gmail.com</a>
              </span>
            </p>
            <a href="https://play.google.com/store/apps/details?id=dindori.pranit.swayamrojgarapp" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 text-sm font-bold text-theme-lavender hover:underline">
              <Play className="w-4 h-4 fill-current" /> {t('footer.getApp')}
            </a>
            <a href="https://wa.me/917755941753" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 text-sm font-bold text-emerald-600 hover:underline">
              <MessageCircle className="w-4 h-4" /> {t('footer.followWhatsApp')}
            </a>
          </div>

          <div>
            <h4 className="font-bold text-theme-darkViolet mb-6 tracking-wide">{t('footer.forGroups')}</h4>
            <ul className="space-y-3 text-sm text-theme-darkViolet/60 font-medium">
              <li><button onClick={section('shg')} className="hover:text-theme-lavender transition cursor-pointer text-left">{t('footer.aboutShgs')}</button></li>
              <li><button onClick={gateway('SHG')} className="hover:text-theme-lavender transition cursor-pointer text-left">{t('footer.registerGroup')}</button></li>
              <li><button onClick={section('products')} className="hover:text-theme-lavender transition cursor-pointer text-left">{t('footer.ourProducts')}</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-theme-darkViolet mb-6 tracking-wide">{t('footer.careers')}</h4>
            <ul className="space-y-3 text-sm text-theme-darkViolet/60 font-medium">
              <li><button onClick={gateway('CANDIDATE')} className="hover:text-theme-lavender transition cursor-pointer text-left">{t('footer.browseJobs')}</button></li>
              <li><button onClick={gateway('COMPANY')} className="hover:text-theme-lavender transition cursor-pointer text-left">{t('footer.postRequirement')}</button></li>
              <li><Link to="/login" className="hover:text-theme-lavender transition">{t('footer.loginPortals')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-theme-darkViolet mb-6 tracking-wide">{t('footer.information')}</h4>
            <ul className="space-y-3 text-sm text-theme-darkViolet/60 font-medium">
              <li><button onClick={section('offices')} className="hover:text-theme-lavender transition cursor-pointer text-left">{t('footer.aboutUs')}</button></li>
              <li><button onClick={section('contact')} className="hover:text-theme-lavender transition cursor-pointer text-left">{t('footer.contactUs')}</button></li>
              <li><button onClick={section('contact')} className="hover:text-theme-lavender transition cursor-pointer text-left">{t('footer.faqHelp')}</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-theme-lightViolet pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-theme-darkViolet/50 font-semibold">
          <p className="text-center md:text-left leading-relaxed">{t('footer.copyright')}</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-theme-lavender">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-theme-lavender">{t('footer.termsOfUse')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}