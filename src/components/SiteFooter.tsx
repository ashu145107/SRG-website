/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CircleHelp, MessageCircle, Phone, Mail, Linkedin } from 'lucide-react';

export interface SiteFooterHandlers {
  scrollTo?: (section: string) => void;
  openModal?: (modal: 'query' | 'feedback') => void;
  enterGateway?: (role: string) => void;
}

export function SiteFooter({ scrollTo, openModal, enterGateway }: SiteFooterHandlers) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isMr = i18n.language === 'mr';
  const L = (en: string, mr: string) => (isMr ? mr : en);

  const goHome = () => navigate('/');
  const section = (id: string) => () => (scrollTo ? scrollTo(id) : goHome());
  const gateway = (role: string) => () => (enterGateway ? enterGateway(role) : goHome());
  const modal = (which: 'query' | 'feedback') => () => (openModal ? openModal(which) : goHome());

  return (
    <footer className="bg-white border-t border-theme-lightViolet pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-theme-lightViolet/70 rounded-2xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-5 border border-theme-lavender/10">
          <p className="text-theme-darkViolet font-bold text-center md:text-left">
            <ShieldCheck className="inline w-4 h-4 text-theme-lavender mr-2 -mt-0.5" />
            {L('The Swayamrojgar Vibhag never charges any fee from a candidate or a self-help group.', 'स्वयंरोजगार विभाग उमेदवार किंवा बचतगटाकडून कधीही कोणतेही शुल्क घेत नाही.')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button onClick={modal('query')} className="btn-gloss inline-flex items-center gap-2 bg-theme-lavender text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-theme-darkViolet transition-all shadow-md shadow-theme-lavender/30 cursor-pointer">
              <CircleHelp className="w-4 h-4" /> {L('Ask a Question', 'प्रश्न विचारा')}
            </button>
            <button onClick={modal('feedback')} className="inline-flex items-center gap-2 bg-white border-2 border-theme-lightViolet text-theme-darkViolet px-6 py-3 rounded-full font-bold text-sm hover:border-theme-deepTeal hover:text-theme-deepTeal transition-all cursor-pointer">
              <MessageCircle className="w-4 h-4" /> {L('Give Feedback', 'अभिप्राय द्या')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-xl border border-theme-lightViolet p-1 flex items-center justify-center">
                <img src="/home/logo.png" alt={L('Swayamrojgar', 'स्वयंरोजगार')} className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-theme-darkViolet text-lg">{isMr ? 'स्वयंरोजगार' : 'Swayamrojgar'}</span>
            </div>
            <p className="text-sm text-theme-darkViolet/60 mb-6 leading-relaxed">
              {L('Work, income and self-reliance for every family we reach.', 'आम्ही पोहोचलेल्या प्रत्येक कुटुंबासाठी काम, उत्पन्न आणि स्वावलंबन.')}
            </p>
            <p className="text-sm text-theme-darkViolet/80 font-semibold">
              <Phone className="inline w-4 h-4 text-theme-lavender mr-2 -mt-0.5" /> {L('+91 [phone number]', '+९१ [दूरध्वनी क्रमांक]')}
            </p>
            <p className="text-sm text-theme-darkViolet/80 font-semibold mt-2">
              <Mail className="inline w-4 h-4 text-theme-lavender mr-2 -mt-0.5" /> {L('[email address]', '[ईमेल पत्ता]')}
            </p>
            <a href="https://in.linkedin.com/showcase/dpsm-swayamrojgar/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-theme-lavender hover:underline">
              <Linkedin className="w-4 h-4" /> {L('Follow us on LinkedIn', 'आम्हाला LinkedIn वर फॉलो करा')}
            </a>
          </div>

          <div>
            <h4 className="font-bold text-theme-darkViolet mb-6 tracking-wide">{L('For Groups', 'बचतगटांसाठी')}</h4>
            <ul className="space-y-3 text-sm text-theme-darkViolet/60 font-medium">
              <li><button onClick={section('shg')} className="hover:text-theme-lavender transition cursor-pointer text-left">{L('About self-help groups', 'बचतगटांची माहिती')}</button></li>
              <li><button onClick={gateway('SHG')} className="hover:text-theme-lavender transition cursor-pointer text-left">{L('Register your group', 'तुमच्या गटाची नोंदणी')}</button></li>
              <li><button onClick={section('products')} className="hover:text-theme-lavender transition cursor-pointer text-left">{L('Our products', 'आमची उत्पादने')}</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-theme-darkViolet mb-6 tracking-wide">{L('Careers', 'करिअर')}</h4>
            <ul className="space-y-3 text-sm text-theme-darkViolet/60 font-medium">
              <li><button onClick={section('jobs')} className="hover:text-theme-lavender transition cursor-pointer text-left">{L('Browse jobs', 'नोकऱ्या पहा')}</button></li>
              <li><button onClick={gateway('COMPANY')} className="hover:text-theme-lavender transition cursor-pointer text-left">{L('Post a requirement', 'आवश्यकता नोंदवा')}</button></li>
              <li><Link to="/login" className="hover:text-theme-lavender transition">{L('Login portals', 'लॉगिन पोर्टल्स')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-theme-darkViolet mb-6 tracking-wide">{L('Information', 'माहिती')}</h4>
            <ul className="space-y-3 text-sm text-theme-darkViolet/60 font-medium">
              <li><button onClick={section('initiatives')} className="hover:text-theme-lavender transition cursor-pointer text-left">{L('About us', 'आमच्याबद्दल')}</button></li>
              <li><button onClick={section('contact')} className="hover:text-theme-lavender transition cursor-pointer text-left">{L('Contact us', 'संपर्क साधा')}</button></li>
              <li><button onClick={modal('query')} className="hover:text-theme-lavender transition cursor-pointer text-left">{L('Ask a question', 'प्रश्न विचारा')}</button></li>
              <li><button onClick={modal('feedback')} className="hover:text-theme-lavender transition cursor-pointer text-left">{L('Give feedback', 'अभिप्राय द्या')}</button></li>
              <li><button onClick={section('contact')} className="hover:text-theme-lavender transition cursor-pointer text-left">{L('FAQ & Help', 'FAQ आणि मदत')}</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-theme-lightViolet pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-theme-darkViolet/40 font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <p>{L('© 2026 Shri Swami Seva Marg, Dindori', '© २०२६ श्री स्वामी सेवा मार्ग, दिंडोरी')}</p>
            <a href="https://in.linkedin.com/showcase/dpsm-swayamrojgar/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-theme-lavender text-white flex items-center justify-center hover:bg-theme-darkViolet transition" aria-label="LinkedIn">
              <Linkedin className="text-xs w-4 h-4" />
            </a>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-theme-lavender">{L('Privacy Policy', 'गोपनीयता धोरण')}</a>
            <a href="#" className="hover:text-theme-lavender">{L('Terms of Use', 'अटी व शर्ती')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}