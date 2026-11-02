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
import { SuccessStory } from '../types';

import { Navbar } from '../components/Navbar';
import { SiteFooter } from '../components/SiteFooter';
import { ComingSoonModal } from '../components/ComingSoonModal';
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
  Linkedin,
  Quote,
  Leaf,
  Droplets,
  Handshake,
  MessageCircle,
  CircleHelp,
  X,
  Building,
  Smartphone
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
    id: 's-3',
    nameEn: 'Vishal Wable',
    nameMr: 'विशाल वाबळे',
    titleEn: 'Finding the Right People Makes Business Easier!',
    titleMr: 'योग्य माणसं मिळणं, हीच व्यवसायासाठी मोठी मदत!',
    roleEn: 'Employer | ShreeRaj Consultants & Contractors',
    roleMr: 'नियोक्ता | ShreeRaj Consultants & Contractors',
    storyEn: "As a business, finding suitable employees at the right time is always an important part of managing operations. We had a similar requirement at ShreeRaj Consultants & Contractors. Through the Self-Employment Department, we were able to connect with and recruit employees who helped fulfil our staffing requirements. This support made the hiring process easier and reduced the effort involved in finding suitable candidates. I appreciate the department's initiative in understanding employers' requirements and helping businesses connect with potential employees.",
    storyMr: 'व्यवसायाच्या कामकाजात योग्य कर्मचारी मिळणे ही नेहमीच एक महत्त्वाची गरज असते. आमच्या ShreeRaj Consultants & Contractors या फर्मसाठीही आम्हाला काही कर्मचाऱ्यांची आवश्यकता होती. त्यावेळी स्वयंरोजगार विभागाच्या माध्यमातून आम्हाला आवश्यक कर्मचारी उपलब्ध झाले. विशेष म्हणजे, कर्मचारी शोधण्यासाठी करावा लागणारा वेळ आणि प्रयत्न यामध्ये बचत झाली. आमच्या गरजेनुसार कर्मचारी उपलब्ध करून दिल्यामुळे कामकाजातही मदत झाली. नियोक्त्यांच्या गरजा समजून घेऊन त्यांना योग्य मनुष्यबळ उपलब्ध करून देण्याचा हा उपक्रम निश्चितच उपयुक्त आहे. यासाठी स्वयंरोजगार विभागाच्या संपूर्ण टीमचे आभार.'
  },
  {
    id: 's-4',
    nameEn: 'Pratik Londhe',
    nameMr: 'प्रतीक लोंढे',
    titleEn: 'Skilled People, Stronger Teams!',
    titleMr: 'योग्य कौशल्य, योग्य उमेदवार आणि व्यवसायाच्या प्रगतीला चालना!',
    roleEn: 'Employer | Samarth MEP Consultant',
    roleMr: 'नियोक्ता | समर्थ MEP कन्सल्टंट',
    storyEn: "In the technical consulting field, having people with the right skills and practical knowledge is essential. At Samarth MEP Consultant, we were looking for employees with specific technical skills to support our work requirements. Through the Self-Employment Department, we were able to find suitable candidates for our team. Getting access to relevant talent through this initiative helped us address our manpower requirements. I appreciate the department's efforts in connecting skilled individuals with businesses that need their expertise.",
    storyMr: 'श्री स्वामी समर्थ सेवा मार्ग, दिंडोरी प्रणीत यांच्या १८ विभागांपैकी एक असलेल्या स्वयंरोजगार विभागामार्फत राबविण्यात येणारा रोजगार उपक्रम आमच्या कंपनीसाठी अत्यंत उपयुक्त ठरला. आमची कंपनी समर्थ MEP कन्सल्टंट यांच्यासाठी आवश्यक तांत्रिक कौशल्ये आणि पात्रता असलेले कर्मचारी या विभागाच्या माध्यमातून उपलब्ध करून देण्यात आले. त्यामुळे योग्य कौशल्य असलेले मनुष्यबळ शोधण्याची प्रक्रिया सुलभ झाली आणि कंपनीच्या कामकाजासाठी आवश्यक मनुष्यबळ मिळण्यास मदत झाली. नियोक्त्यांच्या गरजा समजून घेऊन योग्य उमेदवार उपलब्ध करून देणाऱ्या स्वयंरोजगार विभागाचे मी मनःपूर्वक आभार मानतो.'
  },
  {
    id: 's-5',
    nameEn: 'Kartik Lipane & Mayur Patil',
    nameMr: 'कार्तिक लीपने आणि मयूर पाटील',
    titleEn: 'Building the Right Team for a Growing Digital Business!',
    titleMr: 'योग्य टीममुळे डिजिटल व्यवसायाला मिळाली नवी गती!',
    roleEn: 'Founders / Owners | Smart Makers, Chhatrapati Sambhajinagar',
    roleMr: 'संस्थापक | Smart Makers, संभाजीनगर',
    storyEn: "In the digital industry, every project requires people with different skills and the ability to adapt to changing requirements. At Smart Makers, Chhatrapati Sambhajinagar, we work in application development, website development and digital marketing. Finding suitable people for our growing business requirements was an important need. The Self-Employment Department helped us connect with candidates who could fulfil our manpower requirements. This support made it easier for us to find the people we needed and continue our work with greater confidence. We appreciate the department's efforts in bridging the gap between employment seekers and businesses.",
    storyMr: 'एप्लीकेशन डेव्हलपमेंट, वेबसाइट डेव्हलपमेंट आणि डिजिटल मार्केटिंग या क्षेत्रांत काम करताना कुशल आणि योग्य कौशल्य असलेले मनुष्यबळ मिळणे अत्यंत महत्त्वाचे असते. आमच्या Smart Makers या संभाजीनगरस्थित कंपनीच्या विस्तारासाठी आवश्यक असलेले मनुष्यबळ उपलब्ध करून देण्यात स्वयंरोजगार विभागाची महत्त्वपूर्ण मदत झाली. आमच्या व्यवसायाच्या गरजेनुसार कर्मचारी उपलब्ध झाल्यामुळे नवीन कामे हाताळणे आणि कामकाज पुढे नेणे अधिक सोयीचे झाले. रोजगार इच्छुकांना संधी देतानाच उद्योगांच्या मनुष्यबळाच्या गरजाही पूर्ण करणारा स्वयंरोजगार विभागाचा हा उपक्रम कौतुकास्पद आहे.'
  },
  {
    id: 's-6',
    nameEn: 'Kiran Sonawane',
    nameMr: 'किरण सोनवणे',
    titleEn: 'From Searching for the Right Opportunity to Finding My Place!',
    titleMr: 'प्रयत्नांना मिळाली योग्य संधी, स्वप्नांना मिळाली नवी दिशा!',
    roleEn: 'Job Beneficiary | Designer | Employed in Chhatrapati Sambhajinagar',
    roleMr: 'लाभार्थी | डिझायनर | संभाजीनगर येथे रोजगार प्राप्त',
    storyEn: 'As a designer, I was looking for a job that matched my skills and professional interests. However, despite several attempts, finding the right opportunity was not easy. During this journey, the Self-Employment Department came forward with guidance and support. With their assistance, I was able to secure a job in Chhatrapati Sambhajinagar that gave me an opportunity to move forward in my career. This experience has been an important milestone in my professional journey. I am sincerely thankful to the Self-Employment Department for helping me find the right opportunity.',
    storyMr: 'मी एक डिझायनर म्हणून माझ्या कौशल्याला साजेशी नोकरी शोधत होतो. अनेक प्रयत्न करूनही माझ्या अपेक्षेनुसार आणि कौशल्यानुसार योग्य संधी मिळत नव्हती. अशा वेळी स्वयंरोजगार विभागाच्या माध्यमातून मला मार्गदर्शन आणि सहकार्य मिळाले. त्यांच्या मदतीमुळे माझ्या कौशल्याला अनुरूप नोकरीची संधी मिळाली आणि आज मी संभाजीनगर येथे कार्यरत आहे. योग्य संधीच्या शोधात असलेल्या माझ्यासारख्या तरुणांना रोजगार मिळवून देण्यासाठी स्वयंरोजगार विभाग करत असलेले काम माझ्यासाठी महत्त्वपूर्ण ठरले. या सहकार्याबद्दल मी स्वयंरोजगार विभागाचा मनःपूर्वक आभारी आहे.'
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
  const [shgComingSoonOpen, setShgComingSoonOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [querySent, setQuerySent] = useState(false);
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
      setContactOpen(false);
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
    document.body.style.overflow = queryOpen || contactOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [queryOpen, contactOpen]);

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

  const shgComingSoonContent = {
    labelEn: 'Register Your Group',
    labelMr: 'गट नोंदणी करा',
    titleEn: 'Online group registration is coming soon',
    titleMr: 'ऑनलाइन गट नोंदणी लवकरच सुरू होईल',
    bodyEn: 'Online self-help group registration will open shortly. Please check back soon.',
    bodyMr: 'बचतगटाची ऑनलाइन नोंदणी लवकरच सुरू होईल. कृपया थोड्या वेळाने पुन्हा भेट द्या.',
    icon: Network,
  };

  // Hero action cards: rendered as floating badges on desktop, as a responsive
  // grid on mobile/tablet so they never overlap the hero image.
  const heroCards = [
    { en: 'Find a Job', mr: 'नोकरी शोधा', subEn: '', subMr: '', icon: Briefcase, chipBg: 'bg-theme-lavender text-white', big: false, pos: 'left-0 top-6', from: 'from-left', go: () => handleEnterGateway('CANDIDATE') },
    { en: 'Hire Talent', mr: 'उमेदवार निवडा', subEn: '', subMr: '', icon: UserPlus, chipBg: 'bg-theme-terracotta text-white', big: false, pos: 'right-0 top-0', from: 'from-top', go: () => setContactOpen(true) },
    { en: 'Skill Training', mr: 'कौशल्य प्रशिक्षण', subEn: 'MPSC / UPSC & trades', subMr: 'MPSC / UPSC आणि व्यवसाय', icon: GraduationCap, chipBg: 'bg-theme-deepTeal/15 text-theme-deepTeal', big: true, pos: '-left-3 top-[40%]', from: 'from-left', go: () => scrollToId('services') },
    { en: 'Start a Business', mr: 'व्यवसाय सुरू करा', subEn: 'Udyojakta Manch', subMr: 'उद्योजकता मंच', icon: Store, chipBg: 'bg-theme-lavender/15 text-theme-lavender', big: true, pos: '-right-3 top-[36%]', from: 'from-right', go: () => scrollToId('services') },
    { en: 'SHG / Bachat Gat', mr: 'बचत गट', subEn: 'Register, train and sell', subMr: 'नोंदणी, प्रशिक्षण आणि विक्री', icon: HandCoins, chipBg: 'bg-theme-mint/25 text-theme-deepTeal', big: true, pos: 'left-0 bottom-10', from: 'from-bottom', go: () => handleEnterGateway('SHG') },
    { en: 'Employment Fairs', mr: 'रोजगार मेळावे', subEn: 'Meet companies directly', subMr: 'कंपन्यांना थेट भेटा', icon: Users, chipBg: 'bg-theme-gold/20 text-theme-gold', big: true, pos: 'right-0 bottom-2', from: 'from-right', go: () => handleEnterGateway('CANDIDATE') },
  ];

  const submitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    setQuerySent(true);
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
              <div className="mb-8 flex justify-center lg:justify-start">
                <span className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-theme-lightViolet/80 bg-white/70 px-3 py-1.5 text-left shadow-sm">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-theme-terracotta text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-semibold leading-snug text-theme-darkViolet/80 sm:text-sm">
                    {t('home.hero.badgePrefix')}{' '}
                    <em className="not-italic font-extrabold text-theme-lavender">{t('home.hero.badgeBrand')}</em>
                  </span>
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
                <span className="bg-white border border-theme-lightViolet px-4 py-1.5 rounded-full text-sm font-bold text-theme-darkViolet">{t('home.hero.chipJobs')}</span>
                <span className="bg-white border border-theme-lightViolet px-4 py-1.5 rounded-full text-sm font-bold text-theme-darkViolet">{t('home.hero.chipHire')}</span>
                <span className="bg-white border border-theme-lightViolet px-4 py-1.5 rounded-full text-sm font-bold text-theme-darkViolet">{t('home.hero.chipServices')}</span>
                <span className="bg-white border border-theme-lightViolet px-4 py-1.5 rounded-full text-sm font-bold text-theme-darkViolet">{t('home.hero.chipShg')}</span>
                <span className="bg-white border border-theme-lightViolet px-4 py-1.5 rounded-full text-sm font-bold text-theme-darkViolet">{t('home.hero.chipProducts')}</span>
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
                  <button onClick={() => setContactOpen(true)} className="block w-full bg-white border-2 border-theme-lightViolet text-theme-darkViolet px-6 py-3 rounded-full font-bold hover:border-theme-lavender hover:text-theme-lavender transition-all text-sm cursor-pointer">{t('home.careers.hireTalent')}</button>
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
                  <button onClick={() => setContactOpen(true)} className="block w-full bg-white border-2 border-theme-lightViolet text-theme-darkViolet px-6 py-3 rounded-full font-bold hover:border-theme-deepTeal hover:text-theme-deepTeal transition-all text-sm cursor-pointer">{t('home.services.bookGuidance')}</button>
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
                  <button onClick={() => setShgComingSoonOpen(true)} className="btn-gloss block w-full bg-theme-terracotta text-white px-6 py-3 rounded-full font-bold hover:bg-theme-darkViolet transition-all shadow-md text-sm cursor-pointer">{t('home.shg.register')}</button>
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
                      <div className="prod-row group block px-5 py-5 rounded-xl">
                        <div className="relative z-10 flex items-center gap-5">
                          <span className="num text-lg font-extrabold text-theme-darkViolet/25 w-8 shrink-0">0{i + 1}</span>
                          <div className="min-w-0 flex-1">
                            <div className="font-extrabold text-theme-darkViolet leading-tight">{isMr ? p.nameMr : p.name}</div>
                            <div className="text-xs text-theme-darkViolet/55 mt-1">{isMr ? L(p.desc, p.desc) : L(p.desc, p.desc)} &middot; <span className="text-theme-deepTeal font-bold">{t('home.products.ourGats')}</span></div>
                          </div>
                        </div>
                        <span className="line block h-px bg-theme-lavender/40 mt-4 relative z-10"></span>
                      </div>
                    </Reveal>
                  </React.Fragment>
                ))}
              </div>

              <button onClick={() => setContactOpen(true)} className="btn-gloss inline-flex items-center gap-2 mt-7 ml-5 bg-theme-deepTeal text-white px-8 py-3.5 rounded-full font-bold hover:bg-theme-darkViolet transition-all shadow-lg text-sm cursor-pointer">
                {t('home.contact.contactUsBtn')} <ArrowRight className="text-xs w-3.5 h-3.5" />
              </button>
            </div>
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
                {(currentStory.titleEn || currentStory.titleMr) && (
                  <h3 className="text-base sm:text-lg font-extrabold text-theme-darkViolet leading-snug mb-2">
                    {isMr ? currentStory.titleMr : currentStory.titleEn}
                  </h3>
                )}
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
              <span className="btn-gloss inline-flex items-center gap-2 bg-theme-lavender text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md shadow-theme-lavender/30 whitespace-nowrap cursor-default select-none">
                {t('home.franchise.beBoss')} <ArrowRight className="text-[10px] w-3.5 h-3" />
              </span>
            </Reveal>
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <section id="app" className="scroll-mt-20 sm:scroll-mt-24 relative overflow-hidden bg-theme-cream py-16 sm:py-20">
        <div className="absolute -left-24 top-10 h-56 w-56 rounded-full bg-theme-lavender/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-theme-mint/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
            <Reveal direction="l">
              <div className="text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-full bg-theme-lightViolet px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-theme-lavender">
                  <Smartphone className="h-3.5 w-3.5" /> {t('home.app.badge')}
                </span>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight text-theme-darkViolet lg:text-4xl">
                  {t('home.app.titlePrefix')} <span className="gloss">{t('home.app.titleGloss')}</span>
                </h2>
                <p className="mt-3 text-lg font-extrabold text-theme-darkViolet/80">{t('home.app.subtitle')}</p>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-theme-darkViolet/60 lg:mx-0">
                  {t('home.app.desc')}
                </p>

                <div className="mt-6 grid max-w-md gap-2.5 text-left mx-auto lg:mx-0">
                  {[t('home.app.feature1'), t('home.app.feature2'), t('home.app.feature3')].map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5 text-sm font-bold text-theme-darkViolet/75">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-theme-mint/25 text-theme-darkViolet">
                        <Check className="h-3 w-3" />
                      </span>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                  <a
                    href="https://play.google.com/store/apps/details?id=dindori.pranit.swayamrojgarapp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex transition hover:-translate-y-0.5 hover:opacity-90"
                    aria-label={t('home.app.availableOn')}
                  >
                    <img src="/home/google-play-badge-official.png" alt={t('home.app.downloadOn')} className="h-12 w-auto sm:h-14" />
                  </a>
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-extrabold text-theme-darkViolet">{t('home.app.downloadOn')}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-theme-darkViolet/50">{t('home.app.freeNote')}</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="r">
              <div className="relative mx-auto w-[266px] sm:w-[300px]">
                <div className="absolute -inset-10 rounded-full bg-theme-lavender/15 blur-2xl" />
                <span className="absolute -right-4 top-14 h-16 w-16 rounded-2xl bg-theme-gold/20 blur-sm" />
                <span className="absolute -bottom-3 -left-5 h-20 w-20 rounded-full bg-theme-mint/30 blur-sm" />

                <div className="relative rounded-[2.6rem] border-[9px] border-theme-darkViolet bg-theme-darkViolet shadow-2xl shadow-theme-darkViolet/25">
                  <div className="relative overflow-hidden rounded-[2rem] bg-theme-cream">
                    <img
                      src="/home/mobileview.png"
                      alt={t('home.app.badge')}
                      className="block h-auto w-full object-cover"
                    />
                  </div>
                </div>
              </div>
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

              <a
                href="https://wa.me/917755941753"
                target="_blank"
                rel="noopener noreferrer"
                className="tile bg-emerald-600 text-white rounded-2xl p-6 flex items-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group btn-gloss"
              >
                <span className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 ico-hop"><MessageCircle className="text-lg w-5 h-5" /></span>
                <div className="relative z-10">
                  <h4 className="font-extrabold mb-0.5">{t('home.contact.whatsapp')}</h4>
                  <p className="text-sm text-white/80">+91 7755941753</p>
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
                  href="https://www.google.com/maps/place/Sri+Swami+Samarth+Pradhan+Seva+Kendra/@20.2040375,73.8286094,706m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3bdde7163a41ff99:0x64edb44c90abbccc!8m2!3d20.2040375!4d73.8286094!16s%2Fg%2F11hdng9mzf?entry=ttu&g_ep=EgoyMDI2MTAyNy4wIKXMDSoASAFQAw%3D%3D"
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
                  href="https://www.google.com/maps/place/Akhil+Bhartiya+Shree+Swami+Samarth+Gurupeeth,+Trimbakeshwar/@19.9326,73.5291,14z/data=!4m6!3m5!1s0x3bddf4b167cecc65:0x3b8e4b5e1a81d285!8m2!3d19.9378105!4d73.5438269!16s%2Fg%2F1x5qr7gs?entry=tts&g_ep=EgoyMDI1MTAxNC4wIPu8ASoASAFQAw%3D%3D&skid=57fd4707-4154-4cea-b436-fe035d061ba2"
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
                      {[
                        { en: 'Madhya Pradesh', mr: 'मध्य प्रदेश' },
                        { en: 'Uttar Pradesh', mr: 'उत्तर प्रदेश' },
                        { en: 'Gujarat', mr: 'गुजरात' },
                        { en: 'Karnataka', mr: 'कर्नाटक' },
                        { en: 'Goa', mr: 'गोवा' },
                        { en: 'Delhi', mr: 'दिल्ली' },
                        { en: 'Diu Daman', mr: 'दीव दमण' },
                      ].map((s) => (
                        <span key={s.en} className="bg-theme-lightViolet text-theme-darkViolet/75 text-[11px] font-bold px-2.5 py-1 rounded-full">{isMr ? s.mr : s.en}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-theme-darkViolet leading-tight mb-2">{t('home.contact.outsideIndia')}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { en: 'United States', mr: 'अमेरिका' },
                        { en: 'United Kingdom', mr: 'युनायटेड किंग्डम' },
                        { en: 'Canada', mr: 'कॅनडा' },
                        { en: 'Singapore', mr: 'सिंगापूर' },
                        { en: 'Nepal', mr: 'नेपाळ' },
                        { en: 'UAE', mr: 'संयुक्त अरब अमिरात' },
                      ].map((s) => (
                        <span key={s.en} className="bg-theme-mint/15 text-theme-deepTeal text-[11px] font-bold px-2.5 py-1 rounded-full">{isMr ? s.mr : s.en}</span>
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

      {/* CONTACT US MODAL */}
      <div className={contactOpen ? 'fmodal show' : 'fmodal'} role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setContactOpen(false); }}>
        <div className="sheet relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md sm:max-w-lg p-5 sm:p-8">
          <button onClick={() => setContactOpen(false)} aria-label="Close" className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 rounded-full hover:bg-theme-lightViolet text-theme-darkViolet flex items-center justify-center transition cursor-pointer"><X className="text-lg w-5 h-5" /></button>

          <div className="flex items-start gap-3 mb-5 sm:mb-6 pr-8">
            <span className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-theme-deepTeal/10 text-theme-deepTeal flex items-center justify-center"><Phone className="w-5 h-5 sm:w-6 sm:h-6" /></span>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-extrabold text-theme-darkViolet leading-tight">{t('home.contact.contactUsTitle')}</h3>
              <p className="text-[11px] sm:text-xs text-theme-darkViolet/55 mt-0.5">{t('home.contact.contactUsSubtitle')}</p>
            </div>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            <a href="tel:+917755941753" className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 bg-slate-50 hover:bg-theme-lightViolet/60 rounded-xl px-3.5 sm:px-4 py-3 sm:py-3.5 transition-colors">
              <span className="flex min-w-0 items-center gap-2 sm:gap-2.5 text-[13px] sm:text-sm font-extrabold text-theme-darkViolet"><Phone className="w-4 h-4 shrink-0 text-theme-deepTeal" /> <span className="truncate">+91 7755941753</span></span>
              <span className="text-[10px] sm:text-[11px] font-bold text-theme-deepTeal">{t('home.contact.callNow')}</span>
            </a>
            <a href="tel:+918956741109" className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 bg-slate-50 hover:bg-theme-lightViolet/60 rounded-xl px-3.5 sm:px-4 py-3 sm:py-3.5 transition-colors">
              <span className="flex min-w-0 items-center gap-2 sm:gap-2.5 text-[13px] sm:text-sm font-extrabold text-theme-darkViolet"><Phone className="w-4 h-4 shrink-0 text-theme-deepTeal" /> <span className="truncate">+91 8956741109</span></span>
              <span className="text-[10px] sm:text-[11px] font-bold text-theme-deepTeal">{t('home.contact.callNow')}</span>
            </a>
          </div>

          <p className="mt-4 text-[11px] sm:text-xs font-semibold text-theme-darkViolet/55 text-center">
            {t('home.contact.hours')}
          </p>
        </div>
      </div>

      <ComingSoonModal
        isOpen={shgComingSoonOpen}
        onClose={() => setShgComingSoonOpen(false)}
        content={shgComingSoonContent}
      />

      {/* FOOTER */}
      <SiteFooter scrollTo={scrollToId} enterGateway={handleEnterGateway} />
    </div>
  );
}

function BuildingIcon() {
  return <Building className="text-sm w-4 h-4" />;
}
