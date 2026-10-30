/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useGetDashboardStatsQuery } from '../services/dashboardApi';
import { useGetInitiativesQuery } from '../services/initiativeApi';
import { SuccessStory } from '../types';

import { Navbar } from '../components/Navbar';
import { SiteFooter } from '../components/SiteFooter';
import { readSectionTarget } from '../utils/sectionNav';
import {
  Briefcase,
  Users,
  UserPlus,
  GraduationCap,
  Store,
  HandCoins,
  Compass,
  Landmark,
  Network,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  Check,
  Star,
  Search,
  Linkedin,
  Quote,
  Leaf,
  Droplets,
  Handshake,
  MessageCircle,
  CircleHelp,
  X,
  Building
} from 'lucide-react';

const KEYWORDS = [
  { en: 'Job', mr: 'नोकरी' },
  { en: 'Service', mr: 'सेवा' },
  { en: 'SHG', mr: 'बचतगट' },
  { en: 'Business', mr: 'व्यवसाय' },
  { en: 'Career', mr: 'करिअर' },
  { en: 'Team', mr: 'पथक' },
];

/** Carousel slides stacked in the hero frame. The last one is the fallback photo. */
const HERO_SLIDES = [
  { src: '/home/carousel-job.jpg', labelEn: 'Jobs', labelMr: 'नोकरी' },
  { src: '/home/carousel-services.jpg', labelEn: 'Services & Business', labelMr: 'सेवा व व्यवसाय' },
  { src: '/home/carousel-shg.jpg', labelEn: 'SHG Network', labelMr: 'बचतगट नेटवर्क' },
  { src: '/home/hero-person.jpg', labelEn: 'Swayamrojgar Vibhag', labelMr: 'स्वयंरोजगार विभाग' },
];

/** Slide each rotating keyword shows. Keywords absent here fall back to the last slide. */
const HERO_SLIDE_BY_KEYWORD: Record<string, number> = {
  Job: 0,
  Service: 1,
  Business: 1,
  SHG: 2,
};
const HERO_FALLBACK_INDEX = HERO_SLIDES.length - 1;

/** First keyword that shows a slide, so a dot click lands on a matching headline word. */
const HERO_DOT_KEYWORDS = HERO_SLIDES.map(
  (_, i) => KEYWORDS.find((k) => HERO_SLIDE_BY_KEYWORD[k.en] === i)?.en || null
);

const PRODUCTS = [
  { name: 'Eco-Friendly Cloth Bags', nameMr: 'इको-फ्रेंडली कापडी पिशव्या', desc: 'Block-printed cotton, made to last' },
  { name: 'Portable Steel Glass', nameMr: 'पोर्टेबल स्टीलचा ग्लास', desc: 'Collapsible, plastic-free, travel ready' },
  { name: 'Pickles & Masala', nameMr: 'लोणचे व मसाले', desc: 'Traditional recipes, small batches' },
  { name: 'Patravali (Leaf Plate) / Trencher', nameMr: 'पत्रावळ', desc: 'Pressed leaf, fully compostable' }
];

/** Community success stories shown in the home-page carousel (English + Marathi). */
const SUCCESS_STORIES: SuccessStory[] = [
  {
    id: 's-1',
    nameEn: 'Vandana Santosh Patil',
    nameMr: 'वंदना संतोष पाटील',
    roleEn: 'Founder, Swami Krupa Food Products',
    roleMr: 'संस्थापक, स्वामी कृपा गृहोद्योग',
    storyEn: 'Started with just preparing pickles from a small home kitchen. Under Gurumauli mentoring, our group now distributes organic foodstuffs to 15 cities with a thriving 20-woman team!',
    storyMr: 'अवघ्या ३ महिलांसह घरगुती लोणचे बनवण्यापासून सुरुवात केली. गुरुमाऊलींच्या मार्गदर्शनामुळे आज आमचा बचत गट १५ शहरांमध्ये उत्पादने पाठवतो आणि २० महिलांना रोजगार मिळाला आहे!'
  },
  {
    id: 's-2',
    nameEn: 'Aniket Devram Mor',
    nameMr: 'अनिकेत सुदाम मोरे',
    roleEn: 'Web Developer / Placed Seeker',
    roleMr: 'वेब डेव्हलपर (नोकरी प्राप्त)',
    storyEn: 'Coming from a rural farming household, getting access to technical coaching at Dindori Seva Marg completely revolutionized my path. Placed in Hinjawadi IT hub!',
    storyMr: 'ग्रामीण भागातून शिक्षणासाठी खूप धडपड सुरू होती. दिंडोरी दरबारच्या स्वयंरोजगार केंद्राद्वारे तांत्रिक प्रशिक्षण आणि प्लेसमेंट मिळाल्यामुळे आज मी पुण्यात नामांकित आयटी कंपनीत कार्यरत आहे.'
  }
];

/** Wraps content in a scroll-reveal that adds `.on` once visible. */
function Reveal({
  direction = 'u',
  delay = '',
  className = '',
  children
}: {
  direction?: string;
  delay?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('on');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('on');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`rv ${direction} ${delay} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Hero image frame. Stacks every slide and crossfades the one selected by the
 * rotating headline keyword, with dots that jump the headline to that keyword.
 */
function HeroCarousel({
  activeIdx,
  onPick,
  onHoverChange,
  sizeClass,
}: {
  activeIdx: number;
  onPick: (keyword: string) => void;
  onHoverChange: (hovering: boolean) => void;
  sizeClass: string;
}) {
  const { i18n } = useTranslation();
  const L = (en: string, mr: string) => (i18n.language === 'mr' ? mr : en);

  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 overflow-hidden shadow-2xl z-10 bg-white ${sizeClass}`}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      {HERO_SLIDES.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={L(s.labelEn, s.labelMr)}
          className={`hero-slide ${i === activeIdx ? 'on' : ''}`}
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1.5 backdrop-blur-sm">
        {HERO_SLIDES.map((s, i) => {
          const keyword = HERO_DOT_KEYWORDS[i];
          if (!keyword) return null;
          return (
            <button
              key={s.src}
              type="button"
              onClick={() => onPick(keyword)}
              aria-label={L(`Show ${s.labelEn}`, `${s.labelMr} दाखवा`)}
              aria-current={i === activeIdx}
              className={`hero-dot ${i === activeIdx ? 'on' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isMr = i18n.language === 'mr';
  const L = (en: string, mr: string) => (isMr ? mr : en);

  // States for dynamic data
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: initiatives } = useGetInitiativesQuery();

  const [activeInitiativeTab, setActiveInitiativeTab] = useState<'upcoming' | 'past'>('upcoming');
  const [storyIndex, setStoryIndex] = useState(0);
  const stories = SUCCESS_STORIES;
  const currentStory = stories[storyIndex];

  // Hero rotating keyword + the carousel slide it selects
  const [kwIndex, setKwIndex] = useState(0);
  const [kwSwap, setKwSwap] = useState(false);
  const kwSwapTimer = useRef<number | null>(null);
  const kwPaused = useRef(false);

  const activeIdx = HERO_SLIDE_BY_KEYWORD[KEYWORDS[kwIndex].en] ?? HERO_FALLBACK_INDEX;

  /** Two-phase swap: fade the word out, swap keyword + slide, fade back in. */
  const swapKeyword = useCallback((pick: (cur: number) => number) => {
    setKwSwap(true);
    if (kwSwapTimer.current) window.clearTimeout(kwSwapTimer.current);
    kwSwapTimer.current = window.setTimeout(() => {
      setKwIndex((p) => pick(p));
      setKwSwap(false);
      kwSwapTimer.current = null;
    }, 350);
  }, []);

  /** Dot click / arrow key: jump straight to the keyword that owns a slide. */
  const goSlide = useCallback(
    (keyword: string) => {
      const i = KEYWORDS.findIndex((k) => k.en === keyword);
      if (i >= 0) swapKeyword(() => i);
    },
    [swapKeyword]
  );

  /** Hovering the carousel pauses the auto-rotation so a slide can be read. */
  const setKwHover = useCallback((hovering: boolean) => {
    kwPaused.current = hovering;
  }, []);

  // Modals
  const [queryOpen, setQueryOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [querySent, setQuerySent] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [rating, setRating] = useState(-1);
  const [queryMobile, setQueryMobile] = useState('');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (kwPaused.current) return;
      swapKeyword((p) => (p + 1) % KEYWORDS.length);
    }, 2200);
    return () => {
      window.clearInterval(id);
      if (kwSwapTimer.current) window.clearTimeout(kwSwapTimer.current);
    };
  }, [swapKeyword]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setQueryOpen(false);
      setFeedbackOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // A section link clicked from another page routes here with a pending target.
  useEffect(() => {
    const target = readSectionTarget(location.state);
    if (!target) return;
    const id = window.setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
    return () => window.clearTimeout(id);
  }, [location.state]);

  useEffect(() => {
    document.body.style.overflow = queryOpen || feedbackOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [queryOpen, feedbackOpen]);

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNextStory = () => {
    setStoryIndex((prev) => (prev + 1) % stories.length);
  };

  const handlePrevStory = () => {
    setStoryIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const handleEnterGateway = (roleTarget: string) => {
    navigate('/register', { state: { preferredRole: roleTarget } });
  };

  const goLogin = () => {
    navigate('/login');
  };

  const getLocalizedInitiative = (init: any) => ({
    title: isMr ? init.titleMr : init.titleEn,
    desc: isMr ? init.descriptionMr : init.descriptionEn,
    location: isMr ? init.locationMr : init.locationEn,
    date: init.date
  });

  // Hero action cards: rendered as floating badges on desktop, as a responsive
  // grid on mobile/tablet so they never overlap the hero image.
  const heroCards = [
    { en: 'Find a Job', mr: 'नोकरी शोधा', subEn: '', subMr: '', icon: Briefcase, chipBg: 'bg-theme-lavender text-white', big: false, pos: 'left-0 top-6', from: 'from-left', go: () => handleEnterGateway('CANDIDATE') },
    { en: 'Hire Talent', mr: 'उमेदवार निवडा', subEn: '', subMr: '', icon: UserPlus, chipBg: 'bg-theme-terracotta text-white', big: false, pos: 'right-0 top-0', from: 'from-top', go: () => handleEnterGateway('COMPANY') },
    { en: 'Skill Training', mr: 'कौशल्य प्रशिक्षण', subEn: 'MPSC / UPSC & trades', subMr: 'MPSC / UPSC आणि व्यवसाय', icon: GraduationCap, chipBg: 'bg-theme-deepTeal/15 text-theme-deepTeal', big: true, pos: '-left-3 top-[40%]', from: 'from-left', go: () => scrollToId('services') },
    { en: 'Start a Business', mr: 'व्यवसाय सुरू करा', subEn: 'Udyojakta Manch', subMr: 'उद्योजकता मंच', icon: Store, chipBg: 'bg-theme-lavender/15 text-theme-lavender', big: true, pos: '-right-3 top-[36%]', from: 'from-right', go: () => scrollToId('services') },
    { en: 'SHG / Bachat Gat', mr: 'बचत गट', subEn: 'Register, train and sell', subMr: 'नोंदणी, प्रशिक्षण आणि विक्री', icon: HandCoins, chipBg: 'bg-theme-mint/25 text-theme-deepTeal', big: true, pos: 'left-0 bottom-10', from: 'from-bottom', go: () => handleEnterGateway('SHG') },
    { en: 'Employment Fairs', mr: 'रोजगार मेळावे', subEn: 'Meet companies directly', subMr: 'कंपन्यांना थेट भेटा', icon: Users, chipBg: 'bg-theme-gold/20 text-theme-gold', big: true, pos: 'right-0 bottom-2', from: 'from-right', go: () => handleEnterGateway('CANDIDATE') },
  ];

  const openModal = (which: 'query' | 'feedback') => {
    if (which === 'query') setQueryOpen(true);
    else setFeedbackOpen(true);
  };

  const submitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    setQuerySent(true);
  };

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSent(true);
  };

  const hiredCount = stats?.totalCandidates ? `${stats.totalCandidates}+` : '1,500+';
  const trainingsCount = stats?.activeJobs ? `${stats.activeJobs}+` : '250+';
  const shgCount = stats?.totalSHGs ? `${stats.totalSHGs}+` : '124';

  return (
    <div className="min-h-screen bg-theme-cream font-sans text-theme-darkViolet antialiased">
      {/* HEADER */}
      <Navbar activePage="home" />

      {/* HERO */}
      <section className="relative overflow-hidden bg-theme-lightViolet/40 pt-10 pb-16 lg:pt-14 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-6 items-center">

            {/* LEFT */}
            <div className="text-center lg:text-left relative z-10">
              <div className="inline-flex items-center space-x-3 mb-8">
                <span className="w-8 h-8 rounded-lg bg-theme-terracotta text-white flex items-center justify-center shrink-0"><Check className="text-sm w-4 h-4" /></span>
                <span className="text-sm font-semibold text-theme-darkViolet/80">
                  {t('home.hero.badgePrefix')}{' '}
                  <em className="not-italic font-extrabold text-theme-lavender">{t('home.hero.badgeBrand')}</em>
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl xl:text-[3.75rem] font-extrabold text-theme-darkViolet leading-[1.12] mb-7">
                <span className="text-theme-darkViolet">{t('home.hero.wordFind')} </span>
                <span className="gloss-teal">{t('home.hero.wordYour')}</span>{' '}
                <span className="gloss">{t('home.hero.wordPerfect')}</span>
                <br className="hidden md:block" />
                <span className={`kw-box ${kwSwap ? 'swap' : ''}`}>{L(KEYWORDS[kwIndex].en, KEYWORDS[kwIndex].mr)}</span>
              </h1>

              <p className="text-base md:text-lg text-theme-darkViolet/70 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t('home.hero.subtitle')}
              </p>

              {/* Primary CTA - job browsing lives behind an account */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl mx-auto lg:mx-0">
                <button
                  onClick={() => handleEnterGateway('CANDIDATE')}
                  className="btn-gloss bg-theme-lavender text-white px-8 py-3.5 rounded-xl font-bold hover:bg-theme-darkViolet transition-all shadow-md shadow-theme-lavender/30 whitespace-nowrap cursor-pointer"
                >
                  {t('home.hero.ctaStart')} <ArrowRight className="inline w-4 h-4 -mt-0.5" />
                </button>
                <button
                  onClick={goLogin}
                  className="bg-white border border-theme-lightViolet text-theme-darkViolet px-8 py-3.5 rounded-xl font-bold hover:border-theme-lavender hover:text-theme-lavender transition-all whitespace-nowrap cursor-pointer"
                >
                  {t('home.hero.ctaLogin')}
                </button>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-6">
                <span className="text-sm font-bold text-theme-darkViolet/70 mr-1">{t('home.hero.goStraight')}</span>
                <button onClick={() => handleEnterGateway('CANDIDATE')} className="bg-white border border-theme-lightViolet px-4 py-1.5 rounded-full text-sm font-bold text-theme-darkViolet hover:border-theme-lavender hover:text-theme-lavender transition cursor-pointer">{t('home.hero.chipJobs')}</button>
                <button onClick={() => handleEnterGateway('COMPANY')} className="bg-white border border-theme-lightViolet px-4 py-1.5 rounded-full text-sm font-bold text-theme-darkViolet hover:border-theme-lavender hover:text-theme-lavender transition cursor-pointer">{t('home.hero.chipHire')}</button>
                <button onClick={() => scrollToId('services')} className="bg-white border border-theme-lightViolet px-4 py-1.5 rounded-full text-sm font-bold text-theme-darkViolet hover:border-theme-lavender hover:text-theme-lavender transition cursor-pointer">{t('home.hero.chipServices')}</button>
                <button onClick={() => handleEnterGateway('SHG')} className="bg-white border border-theme-lightViolet px-4 py-1.5 rounded-full text-sm font-bold text-theme-darkViolet hover:border-theme-lavender hover:text-theme-lavender transition cursor-pointer">{t('home.hero.chipShg')}</button>
                <button onClick={() => scrollToId('products')} className="bg-white border border-theme-lightViolet px-4 py-1.5 rounded-full text-sm font-bold text-theme-darkViolet hover:border-theme-lavender hover:text-theme-lavender transition cursor-pointer">{t('home.hero.chipProducts')}</button>
              </div>
            </div>

            {/* RIGHT */}
            <div className="relative">
              {/* ---------- MOBILE / TABLET : centered animated image + card grid ---------- */}
              <div className="lg:hidden">
                <div className="relative mx-auto w-full max-w-sm h-[340px] sm:h-[430px]">
                  <div
                    className="absolute left-1/2 -translate-x-1/2 top-6 w-[220px] h-[300px] min-[340px]:w-[250px] min-[380px]:w-[270px] sm:w-[320px] sm:h-[400px] rounded-[2.5rem] rotate-3"
                    style={{ background: 'linear-gradient(150deg,#6D4AFF 0%,#E23E77 55%,#FFB020 100%)' }}
                  ></div>

                  <div className="ring-dash absolute left-1/2 -translate-x-1/2 top-3 w-[260px] h-[330px] min-[340px]:w-[290px] min-[380px]:w-[310px] sm:w-[360px] sm:h-[440px] rounded-[3rem] border-2 border-dashed border-theme-lavender/35"></div>

                  <HeroCarousel
                    activeIdx={activeIdx}
                    onPick={goSlide}
                    onHoverChange={setKwHover}
                    sizeClass="top-6 w-[220px] h-[300px] min-[340px]:w-[250px] min-[380px]:w-[270px] sm:w-[320px] sm:h-[400px] rounded-[2.5rem]"
                  />

                  <div className="deco text-theme-gold text-3xl font-bold right-4 top-1 ico-bob">+</div>
                  <div className="deco text-theme-lavender text-2xl font-bold left-2 top-1/3 ico-bob s2">+</div>
                  <div className="deco text-theme-mint text-2xl font-bold right-1/4 bottom-6 ico-bob s3">+</div>
                  <div className="deco right-5 bottom-14 w-6 h-6 rounded-full border-[3px] border-theme-gold"></div>
                  <div className="deco left-4 bottom-6 w-9 h-9 rounded-full border-[4px] border-theme-terracotta/50"></div>
                </div>

                {/* Action cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-7 max-w-3xl mx-auto">
                  {heroCards.map((c, i) => (
                    <a
                      key={c.en}
                      onClick={c.go}
                      className="float-card from-bottom glass px-3.5 py-3 rounded-2xl z-20 text-left flex items-center gap-2.5 hover:-translate-y-0.5 transition cursor-pointer"
                      style={{ animationDelay: `${0.2 + i * 0.12}s, ${1.2 + i * 0.12}s` }}
                    >
                      <span className={`w-9 h-9 rounded-lg ${c.chipBg} flex items-center justify-center shrink-0`}>
                        <c.icon className="text-sm w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-[13px] font-extrabold text-theme-darkViolet leading-tight">{L(c.en, c.mr)}</div>
                        {c.big && <div className="text-[10px] text-theme-darkViolet/60 truncate">{L(c.subEn, c.subMr)}</div>}
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* ---------- DESKTOP : floating cards around the image ---------- */}
              <div className="hidden lg:block relative h-[640px]">
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-8 w-[380px] h-[500px] rounded-[3rem] rotate-3"
                  style={{ background: 'linear-gradient(150deg,#6D4AFF 0%,#E23E77 55%,#FFB020 100%)' }}
                ></div>

                <div className="ring-dash absolute left-1/2 -translate-x-1/2 top-4 w-[420px] h-[540px] rounded-[3.5rem] border-2 border-dashed border-theme-lavender/35"></div>

                <HeroCarousel
                  activeIdx={activeIdx}
                  onPick={goSlide}
                  onHoverChange={setKwHover}
                  sizeClass="top-8 w-[380px] h-[500px] rounded-[3rem]"
                />

                <div className="deco text-theme-gold text-3xl font-bold right-6 top-10 ico-bob">+</div>
                <div className="deco text-theme-lavender text-2xl font-bold left-4 top-1/3 ico-bob s2">+</div>
                <div className="deco text-theme-mint text-2xl font-bold right-1/4 bottom-10 ico-bob s3">+</div>
                <div className="deco right-8 bottom-28 w-6 h-6 rounded-full border-[3px] border-theme-gold"></div>
                <div className="deco left-6 bottom-14 w-10 h-10 rounded-full border-[4px] border-theme-terracotta/50"></div>

                {heroCards.map((c, i) => (
                  <a
                    key={c.en}
                    onClick={c.go}
                    className={`float-card ${c.from} d${i + 1} absolute ${c.pos} glass rounded-full z-20 flex items-center gap-2.5 hover:-translate-y-0.5 transition cursor-pointer ${c.big ? 'px-4 py-3 rounded-2xl text-left w-48' : 'pl-3 pr-5 py-2.5 whitespace-nowrap'}`}
                  >
                    <span className={`w-9 h-9 rounded-lg ${c.big ? 'rounded-lg' : 'rounded-full'} ${c.chipBg} flex items-center justify-center shrink-0`}>
                      <c.icon className="text-sm w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <div className={`${c.big ? 'text-[13px]' : 'text-sm'} font-extrabold text-theme-darkViolet leading-tight`}>{L(c.en, c.mr)}</div>
                      {c.big && <div className="text-[10px] text-theme-darkViolet/60 truncate">{L(c.subEn, c.subMr)}</div>}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHOOSE YOUR PLATFORM */}
      <section id="about" className="scroll-mt-20 sm:scroll-mt-24 relative py-20 overflow-hidden">
        <div className="absolute top-10 left-[8%] w-3 h-3 rounded-full bg-theme-gold ico-bob"></div>
        <div className="absolute bottom-16 right-[10%] w-4 h-4 rounded-full border-2 border-theme-terracotta ico-bob s2"></div>
        <div className="absolute top-1/3 right-[6%] text-theme-lavender/40 text-2xl font-bold ico-bob s3">+</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-theme-mint/15 text-theme-deepTeal px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest mb-4">
              <Compass className="w-3.5 h-3.5" /> {t('home.platform.badge')}
            </span>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-theme-darkViolet leading-tight">
              {t('home.platform.titleDoors')} <span className="gloss">{t('home.platform.titlePurpose')}</span>
            </h2>
            <p className="text-theme-darkViolet/60 mt-4 max-w-2xl mx-auto">
              {t('home.platform.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-7 max-w-6xl mx-auto items-stretch">

            {/* 1. CAREERS */}
            <div className="tile group relative rounded-[2rem] p-[2px] bg-gradient-to-br from-theme-lavender/60 via-theme-lavender/10 to-transparent hover:from-theme-lavender hover:via-theme-wine/50 transition-all duration-500">
              <div className="relative h-full rounded-[1.9rem] bg-white p-8 flex flex-col items-center text-center overflow-hidden">
                <span className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-theme-lavender/[0.07] group-hover:scale-150 transition-transform duration-700"></span>
                <span className="absolute top-5 right-6 text-6xl font-extrabold text-theme-lavender/10 leading-none select-none">01</span>

                <div className="stat-badge absolute top-5 left-5 bg-white shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 border border-theme-lightViolet z-20">
                  <span className="w-2 h-2 rounded-full bg-theme-mint animate-pulse"></span>
                  <span className="text-[11px] font-extrabold text-theme-darkViolet">{t('home.careers.hired', { count: hiredCount })}</span>
                </div>

                <div className="relative z-10 w-20 h-20 rounded-3xl bg-theme-lavender/10 text-theme-lavender flex items-center justify-center mt-10 mb-6 ico-hop group-hover:bg-theme-lavender group-hover:text-white transition-colors duration-300">
                  <Briefcase className="text-3xl w-8 h-8" />
                </div>
                <h3 className="relative z-10 text-2xl font-extrabold text-theme-darkViolet mb-3">{t('home.careers.title')}</h3>
                <p className="relative z-10 text-theme-darkViolet/65 mb-7 flex-grow text-sm leading-relaxed">
                  {t('home.careers.descPrefix')}
                  <strong className="text-theme-darkViolet">{t('home.careers.descCandidates')}</strong>
                  {t('home.careers.descMid')}
                  <strong className="text-theme-darkViolet">{t('home.careers.descCompanies')}</strong>
                  {t('home.careers.descSuffix')}
                </p>
                <div className="relative z-10 w-full space-y-2.5">
                  <button onClick={() => handleEnterGateway('CANDIDATE')} className="btn-gloss block w-full bg-theme-lavender text-white px-6 py-3 rounded-full font-bold hover:bg-theme-darkViolet transition-all shadow-md shadow-theme-lavender/30 text-sm cursor-pointer">{t('home.careers.findWork')}</button>
                  <button onClick={() => handleEnterGateway('COMPANY')} className="block w-full bg-white border-2 border-theme-lightViolet text-theme-darkViolet px-6 py-3 rounded-full font-bold hover:border-theme-lavender hover:text-theme-lavender transition-all text-sm cursor-pointer">{t('home.careers.hireTalent')}</button>
                </div>
              </div>
            </div>

            {/* 2. SERVICES */}
            <div id="services" className="tile scroll-mt-20 sm:scroll-mt-24 group relative rounded-[2rem] p-[2px] bg-gradient-to-br from-theme-deepTeal/60 via-theme-deepTeal/10 to-transparent hover:from-theme-deepTeal hover:via-theme-mint/50 transition-all duration-500">
              <div className="relative h-full rounded-[1.9rem] bg-white p-8 flex flex-col items-center text-center overflow-hidden">
                <span className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-theme-deepTeal/[0.07] group-hover:scale-150 transition-transform duration-700"></span>
                <span className="absolute top-5 right-6 text-6xl font-extrabold text-theme-deepTeal/10 leading-none select-none">02</span>

                <div className="stat-badge absolute top-5 left-5 bg-white shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 border border-theme-lightViolet z-20">
                  <span className="w-2 h-2 rounded-full bg-theme-gold animate-pulse"></span>
                  <span className="text-[11px] font-extrabold text-theme-darkViolet">{t('home.services.trainings', { count: trainingsCount })}</span>
                </div>

                <div className="relative z-10 w-20 h-20 rounded-3xl bg-theme-deepTeal/10 text-theme-deepTeal flex items-center justify-center mt-10 mb-6 ico-hop group-hover:bg-theme-deepTeal group-hover:text-white transition-colors duration-300">
                  <Landmark className="text-3xl w-8 h-8" />
                </div>
                <h3 className="relative z-10 text-2xl font-extrabold text-theme-darkViolet mb-3">{t('home.services.title')}</h3>
                <p className="relative z-10 text-theme-darkViolet/65 mb-7 flex-grow text-sm leading-relaxed">
                  {t('home.services.desc')}
                </p>
                <div className="relative z-10 w-full space-y-2.5">
                  <button onClick={() => scrollToId('about')} className="btn-gloss block w-full bg-theme-deepTeal text-white px-6 py-3 rounded-full font-bold hover:bg-theme-darkViolet transition-all shadow-md text-sm cursor-pointer">{t('home.services.explore')}</button>
                  <button onClick={() => openModal('query')} className="block w-full bg-white border-2 border-theme-lightViolet text-theme-darkViolet px-6 py-3 rounded-full font-bold hover:border-theme-deepTeal hover:text-theme-deepTeal transition-all text-sm cursor-pointer">{t('home.services.bookGuidance')}</button>
                </div>
              </div>
            </div>

            {/* 3. SHG */}
            <div id="shg" className="tile scroll-mt-20 sm:scroll-mt-24 group relative rounded-[2rem] p-[2px] bg-gradient-to-br from-theme-terracotta/60 via-theme-terracotta/10 to-transparent hover:from-theme-terracotta hover:via-theme-gold/50 transition-all duration-500">
              <div className="relative h-full rounded-[1.9rem] bg-white p-8 flex flex-col items-center text-center overflow-hidden">
                <span className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-theme-terracotta/[0.07] group-hover:scale-150 transition-transform duration-700"></span>
                <span className="absolute top-5 right-6 text-6xl font-extrabold text-theme-terracotta/10 leading-none select-none">03</span>

                <div className="stat-badge absolute top-5 left-5 bg-white shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 border border-theme-lightViolet z-20">
                  <span className="w-2 h-2 rounded-full bg-theme-terracotta animate-pulse"></span>
                  <span className="text-[11px] font-extrabold text-theme-darkViolet">{t('home.shg.groups', { count: shgCount })}</span>
                </div>

                <div className="relative z-10 w-20 h-20 rounded-3xl bg-theme-terracotta/10 text-theme-terracotta flex items-center justify-center mt-10 mb-6 ico-hop group-hover:bg-theme-terracotta group-hover:text-white transition-colors duration-300">
                  <Network className="text-3xl w-8 h-8" />
                </div>
                <h3 className="relative z-10 text-2xl font-extrabold text-theme-darkViolet mb-3">{t('home.shg.title')}</h3>
                <p className="relative z-10 text-theme-darkViolet/65 mb-7 flex-grow text-sm leading-relaxed">
                  {t('home.shg.descPrefix')}
                  <strong className="text-theme-darkViolet">{t('home.shg.descExisting')}</strong>
                  {t('home.shg.descMid')}
                  <strong className="text-theme-darkViolet">{t('home.shg.descNew')}</strong>
                  {t('home.shg.descSuffix')}
                </p>
                <div className="relative z-10 w-full space-y-2.5">
                  <button onClick={() => handleEnterGateway('SHG')} className="btn-gloss block w-full bg-theme-terracotta text-white px-6 py-3 rounded-full font-bold hover:bg-theme-darkViolet transition-all shadow-md text-sm cursor-pointer">{t('home.shg.register')}</button>
                  <button onClick={() => scrollToId('products')} className="block w-full bg-white border-2 border-theme-lightViolet text-theme-darkViolet px-6 py-3 rounded-full font-bold hover:border-theme-terracotta hover:text-theme-terracotta transition-all text-sm cursor-pointer">{t('home.shg.ourProducts')}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY PRODUCTS */}
      <section id="products" className="scroll-mt-20 sm:scroll-mt-24 py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-5 relative">
              <Reveal direction="l">
                <div className="kb-frame relative max-w-sm mx-auto lg:mx-0">
                  <span className="absolute -top-4 -left-4 w-20 h-20 rounded-2xl border-2 border-theme-mint/40"></span>
                  <span className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-theme-gold/15"></span>
                  <div className="relative rounded-2xl overflow-hidden shadow-xl">
                    <img src="/home/products.jpg" alt={t('home.products.imgAlt')} className="w-full object-cover" />
                    <span className="shine"></span>
                  </div>
                  <div className="absolute -bottom-5 left-5 bg-white shadow-xl rounded-xl px-4 py-3 flex items-center gap-3 border border-theme-lightViolet">
                    <span className="w-9 h-9 rounded-lg bg-theme-mint/20 text-theme-deepTeal flex items-center justify-center"><Leaf className="text-sm w-4 h-4" /></span>
                    <div className="text-left leading-none">
                      <div className="text-sm font-extrabold text-theme-darkViolet">{t('home.products.handmade')}</div>
                      <div className="text-[10px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mt-1">{t('home.products.byGats')}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 bg-theme-mint/15 text-theme-deepTeal px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest mb-4">
                <HeartHandshake className="w-3.5 h-3.5" /> {t('home.products.badge')}
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-theme-darkViolet mb-3">
                <span className="gloss-teal">{t('home.products.titleCommunity')}</span> {t('home.products.titleProducts')}
              </h2>
              <p className="text-theme-darkViolet/60 mb-6 leading-relaxed max-w-xl">
                {t('home.products.desc')}
              </p>

              <div className="-mx-5">
                {PRODUCTS.map((p, i) => (
                  <React.Fragment key={p.name}>
                    <Reveal direction="r" delay={`dly${i + 1}`}>
                      <a className="prod-row group block px-5 py-5 rounded-xl cursor-pointer" onClick={() => openModal('query')}>
                        <div className="relative z-10 flex items-center gap-5">
                          <span className="num text-lg font-extrabold text-theme-darkViolet/25 w-8 shrink-0">0{i + 1}</span>
                          <div className="min-w-0 flex-1">
                            <div className="font-extrabold text-theme-darkViolet leading-tight">{isMr ? p.nameMr : p.name}</div>
                            <div className="text-xs text-theme-darkViolet/55 mt-1">{isMr ? L(p.desc, p.desc) : L(p.desc, p.desc)} &middot; <span className="text-theme-deepTeal font-bold">{t('home.products.ourGats')}</span></div>
                          </div>
                          <span className="go text-theme-lavender shrink-0"><ArrowRight className="w-4 h-4" /></span>
                        </div>
                        <span className="line block h-px bg-theme-lavender/40 mt-4 relative z-10"></span>
                      </a>
                    </Reveal>
                  </React.Fragment>
                ))}
              </div>

              <button onClick={() => openModal('query')} className="btn-gloss inline-flex items-center gap-2 mt-7 ml-5 bg-theme-deepTeal text-white px-8 py-3.5 rounded-full font-bold hover:bg-theme-darkViolet transition-all shadow-lg text-sm cursor-pointer">
                {t('home.products.visitShop')} <ArrowRight className="text-xs w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INITIATIVES */}
      <section id="initiatives" className="scroll-mt-20 sm:scroll-mt-24 py-20 bg-theme-lightViolet/40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-theme-gold/15 text-theme-gold px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest mb-4">
              <Compass className="w-3.5 h-3.5" /> {t('nav.initiatives')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-theme-darkViolet leading-tight">{t('initiatives.title')}</h2>
          </div>

          <div className="flex justify-center gap-3 mb-10">
            <button
              onClick={() => setActiveInitiativeTab('upcoming')}
              className={`px-6 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer ${activeInitiativeTab === 'upcoming' ? 'bg-theme-lavender text-white shadow-lg shadow-theme-lavender/30' : 'bg-white border border-theme-lightViolet text-theme-darkViolet/70 hover:text-theme-lavender hover:border-theme-lavender'}`}
            >
              {t('initiatives.upcoming')}
            </button>
            <button
              onClick={() => setActiveInitiativeTab('past')}
              className={`px-6 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer ${activeInitiativeTab === 'past' ? 'bg-theme-lavender text-white shadow-lg shadow-theme-lavender/30' : 'bg-white border border-theme-lightViolet text-theme-darkViolet/70 hover:text-theme-lavender hover:border-theme-lavender'}`}
            >
              {t('initiatives.past')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {initiatives
              ?.filter((init) => init.type === activeInitiativeTab)
              .map((init) => {
                const localized = getLocalizedInitiative(init);
                return (
                  <React.Fragment key={init.id}>
                    <Reveal>
                      <div className="h-full bg-white rounded-2xl border border-theme-lightViolet p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
                        <div className="flex items-center gap-2 mb-3.5">
                          <span className={`w-2 h-2 rounded-full animate-pulse ${activeInitiativeTab === 'upcoming' ? 'bg-theme-mint' : 'bg-theme-gold'}`}></span>
                          <span className="text-xs font-bold text-theme-darkViolet/70 bg-theme-lightViolet px-2.5 py-1 rounded-full">{localized.date}</span>
                        </div>
                        <h4 className="text-base font-extrabold text-theme-darkViolet leading-snug">{localized.title}</h4>
                        <p className="text-[13px] text-theme-darkViolet/65 mt-2 leading-relaxed flex-grow">{localized.desc}</p>
                        <div className="mt-5 pt-3 border-t border-theme-lightViolet flex items-center gap-2 text-theme-darkViolet/60">
                          <MapPin className="w-4 h-4 text-theme-lavender shrink-0" />
                          <span className="text-xs font-bold leading-none truncate">{localized.location}</span>
                        </div>
                      </div>
                    </Reveal>
                  </React.Fragment>
                );
              })}
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      {currentStory && (
        <section className="py-14 bg-theme-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <span className="inline-flex items-center gap-2 bg-theme-gold/15 text-theme-gold px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest mb-3">
                  <Quote className="w-3.5 h-3.5" /> {t('home.stories.badge')}
                </span>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-theme-darkViolet leading-tight">
                  {t('home.stories.titlePrefix')} <span className="gloss">{t('home.stories.titleGloss')}</span> {t('home.stories.titleSuffix')}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handlePrevStory} className="nav-btn w-11 h-11 rounded-full bg-white text-theme-lavender border border-theme-lightViolet shadow-md hover:bg-theme-lavender hover:text-white flex items-center justify-center cursor-pointer" aria-label="Previous story">
                  <ChevronLeft className="text-sm w-4 h-4" />
                </button>
                <button onClick={handleNextStory} className="nav-btn w-11 h-11 rounded-full bg-theme-lavender text-white shadow-lg shadow-theme-lavender/30 hover:bg-theme-darkViolet flex items-center justify-center cursor-pointer" aria-label="Next story">
                  <ChevronRight className="text-sm w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-theme-lightViolet shadow-sm hover:shadow-lg transition relative">
                <span className="absolute -top-4 left-8 w-9 h-9 rounded-xl bg-theme-lavender/10 text-theme-lavender flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </span>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-theme-gold text-[11px] tracking-widest">
                    {[0, 1, 2, 3, 4].map((s) => <Star key={s} className="inline w-3.5 h-3.5 fill-current" />)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-theme-darkViolet/45">
                    {t('home.stories.counter', { current: storyIndex + 1, total: stories.length })}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-theme-darkViolet/70 italic leading-relaxed mb-4">
                  &ldquo;{isMr ? currentStory.storyMr : currentStory.storyEn}&rdquo;
                </p>
                <div className="pt-3 border-t border-theme-lightViolet flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-theme-darkViolet">{isMr ? currentStory.nameMr : currentStory.nameEn}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-theme-darkViolet/45 mt-0.5">{isMr ? currentStory.roleMr : currentStory.roleEn}</div>
                  </div>
                  <div className="text-4xl text-theme-lightViolet select-none"><Quote /></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FRANCHISE */}
      <section id="franchise" className="scroll-mt-20 sm:scroll-mt-24 relative bg-theme-lightViolet/70 py-10 overflow-hidden">
        <div className="fr-blob absolute -top-16 left-10 w-48 h-48 rounded-full bg-theme-lavender/15 blur-3xl"></div>
        <div className="fr-blob b2 absolute -bottom-16 right-24 w-48 h-48 rounded-full bg-theme-mint/15 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-9">

            <Reveal direction="l" className="shrink-0">
              <div className="kb-frame relative w-[150px] sm:w-[170px]">
                <span className="absolute -top-2 -left-2 w-10 h-10 rounded-xl bg-theme-gold/25"></span>
                <span className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-theme-mint/25"></span>
                <div className="relative rounded-2xl overflow-hidden shadow-lg">
                  <img src="/home/franchise.jpg" alt={t('home.franchise.partnerWithUs')} className="w-full object-cover" />
                  <span className="shine"></span>
                </div>
              </div>
            </Reveal>

            <Reveal direction="u" className="text-center lg:text-left flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 bg-white text-theme-lavender px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-2.5 shadow-sm">
                <Handshake className="w-3.5 h-3.5" /> {t('home.franchise.partnerWithUs')}
              </span>
              <h2 className="text-2xl lg:text-[1.75rem] font-extrabold text-theme-darkViolet leading-tight mb-1.5">
                {t('home.franchise.titlePrefix')} <span className="gloss">{t('home.franchise.titleGloss')}</span>
              </h2>
              <p className="text-sm text-theme-darkViolet/65 mb-3 max-w-xl mx-auto lg:mx-0">
                {t('home.franchise.desc')}
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-1.5 text-xs font-bold text-theme-darkViolet/70">
                <span><Check className="inline w-3.5 h-3.5 text-theme-mint mr-1.5 -mt-0.5" />{t('home.franchise.perkBrands')}</span>
                <span><Check className="inline w-3.5 h-3.5 text-theme-mint mr-1.5 -mt-0.5" />{t('home.franchise.perkDemand')}</span>
                <span><Check className="inline w-3.5 h-3.5 text-theme-mint mr-1.5 -mt-0.5" />{t('home.franchise.perkCommunities')}</span>
              </div>
            </Reveal>

            <Reveal direction="r" className="shrink-0 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="fr-card group bg-white rounded-xl border border-theme-lavender/10 shadow-sm px-3 py-2.5 text-center w-[86px] hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
                  <img src="/home/brand-krishidhan.jpg" alt="Krishidhan" className="w-full h-auto object-contain mb-1.5" />
                  <div className="text-[10px] font-extrabold text-theme-darkViolet leading-tight">Krishidhan</div>
                </div>
                <div className="fr-card group bg-white rounded-xl border border-theme-lavender/10 shadow-sm px-3 py-2.5 text-center w-[86px] hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
                  <Droplets className="text-theme-gold text-2xl w-6 h-6 block mx-auto mb-1.5 mt-1" />
                  <div className="text-[10px] font-extrabold text-theme-darkViolet leading-tight">{t('home.franchise.brandSatvikMilk')}</div>
                </div>
                <div className="fr-card group bg-white rounded-xl border border-theme-lavender/10 shadow-sm px-3 py-2.5 text-center w-[86px] hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
                  <img src="/home/brand-satvikmart.jpg" alt="Satvik Mart" className="w-full h-auto object-contain mb-1.5" />
                  <div className="text-[10px] font-extrabold text-theme-darkViolet leading-tight">{t('home.franchise.brandSatvikMart')}</div>
                </div>
              </div>
              <button
                onClick={() => openModal('query')}
                className="btn-gloss inline-flex items-center gap-2 bg-theme-lavender text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-theme-darkViolet transition-all shadow-md shadow-theme-lavender/30 whitespace-nowrap cursor-pointer"
              >
                {t('home.franchise.beBoss')} <ArrowRight className="text-[10px] w-3.5 h-3" />
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CONTACT & MAP */}
      <section id="contact" className="scroll-mt-20 sm:scroll-mt-24 py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-theme-lightViolet text-theme-lavender px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest mb-4">
              <MapPin className="w-3.5 h-3.5" /> {t('home.contact.badge')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-theme-darkViolet">
              {t('home.contact.titlePrefix')} <span className="gloss">{t('home.contact.titleGloss')}</span>
            </h2>
            <p className="text-theme-darkViolet/60 mt-3 max-w-2xl mx-auto">
              {t('home.contact.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-stretch">
            <div className="lg:col-span-2 space-y-4">
              <Reveal>
                <div className="tile bg-white rounded-2xl border border-theme-lightViolet p-6 flex items-start gap-4 hover:shadow-xl transition-all duration-300 group">
                  <span className="w-12 h-12 rounded-2xl bg-theme-lavender/10 text-theme-lavender flex items-center justify-center shrink-0 ico-hop"><MapPin className="text-lg w-5 h-5" /></span>
                  <div>
                    <h4 className="font-extrabold text-theme-darkViolet mb-1">{t('home.contact.headOfficeAddress')}</h4>
                    <p className="text-sm text-theme-darkViolet/65 leading-relaxed">
                      {t('home.contact.headOfficeText')}
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay="dly1">
                <div className="tile bg-white rounded-2xl border border-theme-lightViolet p-6 flex items-start gap-4 hover:shadow-xl transition-all duration-300 group">
                  <span className="w-12 h-12 rounded-2xl bg-theme-deepTeal/10 text-theme-deepTeal flex items-center justify-center shrink-0 ico-hop"><Phone className="text-lg w-5 h-5" /></span>
                  <div>
                    <h4 className="font-extrabold text-theme-darkViolet mb-1">{t('home.contact.phone')}</h4>
                    <p className="text-sm text-theme-darkViolet/65 leading-relaxed">
                      <a href="tel:+917755941753" className="font-bold text-theme-darkViolet hover:text-theme-deepTeal transition">+91 7755941753</a>
                      <br />
                      <a href="tel:+918956741109" className="font-bold text-theme-darkViolet hover:text-theme-deepTeal transition">+91 8956741109</a>
                      <br />
                      <span className="text-xs text-theme-darkViolet/50">{t('home.contact.hours')}</span>
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay="dly2">
                <div className="tile bg-white rounded-2xl border border-theme-lightViolet p-6 flex items-start gap-4 hover:shadow-xl transition-all duration-300 group">
                  <span className="w-12 h-12 rounded-2xl bg-theme-terracotta/10 text-theme-terracotta flex items-center justify-center shrink-0 ico-hop"><Mail className="text-lg w-5 h-5" /></span>
                  <div>
                    <h4 className="font-extrabold text-theme-darkViolet mb-1">{t('home.contact.email')}</h4>
                    <p className="text-sm text-theme-darkViolet/65 leading-relaxed break-all">
                      <a href="mailto:admin@dindoripranit.org" className="font-bold text-theme-darkViolet hover:text-theme-terracotta transition">admin@dindoripranit.org</a>
                      <br />
                      <a href="mailto:srg.dindori@gmail.com" className="font-bold text-theme-darkViolet hover:text-theme-terracotta transition">srg.dindori@gmail.com</a>
                    </p>
                  </div>
                </div>
              </Reveal>

              <a
                href="https://in.linkedin.com/showcase/dpsm-swayamrojgar/"
                target="_blank"
                rel="noopener noreferrer"
                className="tile bg-theme-lavender text-white rounded-2xl p-6 flex items-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group btn-gloss"
              >
                <span className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 ico-hop"><Linkedin className="text-lg w-5 h-5" /></span>
                <div className="relative z-10">
                  <h4 className="font-extrabold mb-0.5">{t('home.contact.linkedin')}</h4>
                  <p className="text-sm text-white/80">DPSM Swayamrojgar</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto relative z-10 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="lg:col-span-3 space-y-5">
              <div className="relative rounded-[1.5rem] overflow-hidden shadow-lg border border-theme-lavender/15">
                <iframe
                  title="Dindori and Trimbak"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=73.35%2C19.80%2C74.05%2C20.40&layer=mapnik&marker=20.2047%2C73.8375"
                  className="w-full h-[250px] border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href="https://www.openstreetmap.org/?mlat=20.2047&mlon=73.8375#map=13/20.2047/73.8375"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tile group bg-white rounded-2xl border border-theme-lightViolet p-5 hover:shadow-lg hover:-translate-y-1 transition-all block"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-9 h-9 rounded-xl bg-theme-lavender/10 text-theme-lavender flex items-center justify-center shrink-0"><BuildingIcon /></span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-theme-lavender">{t('home.contact.headOffice')}</span>
                  </div>
                  <div className="font-extrabold text-theme-darkViolet leading-tight">{t('home.contact.dindori')}</div>
                  <div className="text-xs text-theme-darkViolet/55 mt-1">{t('home.contact.distNashik')}</div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-darkViolet/60 group-hover:text-theme-lavender transition mt-3">{t('home.contact.directions')} <ArrowRight className="text-[10px] w-3 h-3 group-hover:translate-x-1 transition-transform" /></span>
                </a>

                <a
                  href="https://www.openstreetmap.org/?mlat=19.9333&mlon=73.5333#map=13/19.9333/73.5333"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tile group bg-white rounded-2xl border border-theme-lightViolet p-5 hover:shadow-lg hover:-translate-y-1 transition-all block"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-9 h-9 rounded-xl bg-theme-gold/15 text-theme-gold flex items-center justify-center shrink-0"><Landmark className="text-sm w-4 h-4" /></span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-theme-gold">{t('home.contact.officeGurupeeth')}</span>
                  </div>
                  <div className="font-extrabold text-theme-darkViolet leading-tight">{t('home.contact.trimbak')}</div>
                  <div className="text-xs text-theme-darkViolet/55 mt-1">{t('home.contact.distNashik')}</div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-darkViolet/60 group-hover:text-theme-gold transition mt-3">{t('home.contact.directions')} <ArrowRight className="text-[10px] w-3 h-3 group-hover:translate-x-1 transition-transform" /></span>
                </a>
              </div>

              <div id="offices" className="scroll-mt-20 sm:scroll-mt-24 bg-white rounded-2xl border border-theme-lightViolet p-6">
                <h4 className="font-extrabold text-theme-darkViolet mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-theme-deepTeal" /> {t('home.contact.ourKendras')}
                </h4>
                <p className="text-xs text-theme-darkViolet/55 mb-5">{t('home.contact.kendrasNote')}</p>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-extrabold text-theme-darkViolet leading-tight mb-1.5">{t('home.contact.maharashtra')}</div>
                    <p className="text-xs text-theme-darkViolet/60">{t('home.contact.kendrasState')}</p>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-theme-darkViolet leading-tight mb-2">{t('home.contact.elsewhereIndia')}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Madhya Pradesh', 'Uttar Pradesh', 'Gujarat', 'Karnataka', 'Goa'].map((s) => (
                        <span key={s} className="bg-theme-lightViolet text-theme-darkViolet/75 text-[11px] font-bold px-2.5 py-1 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-theme-darkViolet leading-tight mb-2">{t('home.contact.outsideIndia')}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {['United States', 'United Kingdom', 'Canada'].map((s) => (
                        <span key={s} className="bg-theme-mint/15 text-theme-deepTeal text-[11px] font-bold px-2.5 py-1 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUERY MODAL */}
      <div className={queryOpen ? 'fmodal show' : 'fmodal'} role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setQueryOpen(false); }}>
        <div className="sheet relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-lg p-8">
          <button onClick={() => setQueryOpen(false)} aria-label="Close" className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-theme-lightViolet text-theme-darkViolet flex items-center justify-center transition cursor-pointer"><X className="text-lg w-5 h-5" /></button>

          <div className="flex items-center gap-3 mb-6">
            <span className="w-12 h-12 rounded-2xl bg-theme-lavender/10 text-theme-lavender flex items-center justify-center"><CircleHelp className="text-lg w-6 h-6" /></span>
            <div>
              <h3 className="text-xl font-extrabold text-theme-darkViolet leading-tight">{t('home.query.title')}</h3>
              <p className="text-xs text-theme-darkViolet/55 mt-0.5">{t('home.query.subtitle')}</p>
            </div>
          </div>

          <form className="space-y-3.5" onSubmit={submitQuery}>
            <div className="grid sm:grid-cols-2 gap-3.5">
              <input type="text" required placeholder={t('home.form.fullName')} className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet placeholder-theme-darkViolet/40 outline-none focus:border-theme-lavender transition" />
              <input type="tel" inputMode="numeric" required placeholder={t('home.form.mobile')} value={queryMobile} onChange={(e) => setQueryMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} pattern="[0-9]{10}" className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet placeholder-theme-darkViolet/40 outline-none focus:border-theme-lavender transition" />
            </div>
            <input type="email" placeholder={t('home.form.email')} className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet placeholder-theme-darkViolet/40 outline-none focus:border-theme-lavender transition" />
            <select required className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet outline-none focus:border-theme-lavender transition cursor-pointer">
              <option value="">{t('home.query.topicPlaceholder')}</option>
              <option>{t('home.query.topicFindJob')}</option>
              <option>{t('home.query.topicHiring')}</option>
              <option>{t('home.query.topicTraining')}</option>
              <option>{t('home.query.topicShg')}</option>
              <option>{t('home.query.topicProducts')}</option>
              <option>{t('home.query.topicFranchise')}</option>
              <option>{t('home.query.topicOther')}</option>
            </select>
            <textarea required rows={4} placeholder={t('home.query.textarea')} className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet placeholder-theme-darkViolet/40 outline-none focus:border-theme-lavender transition resize-none"></textarea>
            <button type="submit" className="btn-gloss w-full bg-theme-lavender text-white px-6 py-3.5 rounded-xl font-bold hover:bg-theme-darkViolet transition-all shadow-lg shadow-theme-lavender/30 cursor-pointer">{t('home.query.submit')}</button>
            <p className={`${querySent ? '' : 'hidden'} text-sm font-bold text-theme-deepTeal text-center pt-1`}>
              <Check className="inline w-4 h-4 mr-1.5 -mt-0.5" /> {t('home.query.thanks')}
            </p>
          </form>
        </div>
      </div>

      {/* FEEDBACK MODAL */}
      <div className={feedbackOpen ? 'fmodal show' : 'fmodal'} role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setFeedbackOpen(false); }}>
        <div className="sheet relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-lg p-8">
          <button onClick={() => setFeedbackOpen(false)} aria-label="Close" className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-theme-lightViolet text-theme-darkViolet flex items-center justify-center transition cursor-pointer"><X className="text-lg w-5 h-5" /></button>

          <div className="flex items-center gap-3 mb-6">
            <span className="w-12 h-12 rounded-2xl bg-theme-mint/15 text-theme-deepTeal flex items-center justify-center"><MessageCircle className="text-lg w-6 h-6" /></span>
            <div>
              <h3 className="text-xl font-extrabold text-theme-darkViolet leading-tight">{t('home.feedback.title')}</h3>
              <p className="text-xs text-theme-darkViolet/55 mt-0.5">{t('home.feedback.subtitle')}</p>
            </div>
          </div>

          <form className="space-y-3.5" onSubmit={submitFeedback}>
            <div className="grid sm:grid-cols-2 gap-3.5">
              <input type="text" required placeholder={t('home.form.fullName')} className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet placeholder-theme-darkViolet/40 outline-none focus:border-theme-deepTeal transition" />
              <select required className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet outline-none focus:border-theme-deepTeal transition cursor-pointer">
                <option value="">{t('home.feedback.rolePlaceholder')}</option>
                <option>{t('home.feedback.roleCandidate')}</option>
                <option>{t('home.feedback.roleEmployer')}</option>
                <option>{t('home.feedback.roleShg')}</option>
                <option>{t('home.feedback.roleTrainee')}</option>
                <option>{t('home.feedback.roleFranchise')}</option>
                <option>{t('home.feedback.roleVisitor')}</option>
              </select>
            </div>

            <div className="border border-theme-lightViolet rounded-xl px-4 py-3.5">
              <div className="text-xs font-bold text-theme-darkViolet/55 uppercase tracking-wider mb-2.5">{t('home.feedback.ratingLabel')}</div>
              <div className="flex gap-1.5 text-2xl text-theme-darkViolet/20">
                {[0, 1, 2, 3, 4].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    className="hover:scale-110 transition cursor-pointer"
                    style={{ color: i <= rating ? '#FFB020' : '' }}
                    aria-label={`${i + 1} star`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <textarea required rows={4} placeholder={t('home.feedback.experiencePlaceholder')} className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet placeholder-theme-darkViolet/40 outline-none focus:border-theme-deepTeal transition resize-none"></textarea>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 mt-0.5 accent-theme-deepTeal" />
              <span className="text-xs font-semibold text-theme-darkViolet/60">{t('home.feedback.publishConsent')}</span>
            </label>

            <button type="submit" className="btn-gloss w-full bg-theme-deepTeal text-white px-6 py-3.5 rounded-xl font-bold hover:bg-theme-darkViolet transition-all shadow-lg cursor-pointer">{t('home.feedback.submit')}</button>
            <p className={`${feedbackSent ? '' : 'hidden'} text-sm font-bold text-theme-deepTeal text-center pt-1`}>
              <Check className="inline w-4 h-4 mr-1.5 -mt-0.5" /> {t('home.feedback.thanks')}
            </p>
          </form>
        </div>
      </div>

      {/* FOOTER */}
      <SiteFooter scrollTo={scrollToId} openModal={openModal} enterGateway={handleEnterGateway} />
    </div>
  );
}

function BuildingIcon() {
  return <Building className="text-sm w-4 h-4" />;
}
