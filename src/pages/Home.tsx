/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useGetDashboardStatsQuery } from '../services/dashboardApi';
import { useGetInitiativesQuery } from '../services/initiativeApi';
import { MockDb } from '../services/mockDb';
import { Navbar } from '../components/Navbar';
import { SiteFooter } from '../components/SiteFooter';
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
  ShieldCheck,
  Bookmark,
  Search,
  Linkedin,
  Quote,
  Leaf,
  Package,
  Utensils,
  Factory,
  ChartLine,
  FlaskConical,
  Scissors,
  Truck,
  Droplets,
  Handshake,
  MessageCircle,
  CircleHelp,
  X,
  IndianRupee,
  Building
} from 'lucide-react';

const KEYWORDS = ['Career', 'Job', 'Service', 'SHG', 'Business', 'Team'];

const SAMPLE_JOBS = [
  {
    id: 'sample-1',
    title: 'Production Executive',
    companyName: '[Company name]',
    location: 'Dindori',
    type: 'Full Time',
    salary: '[salary]',
    icon: Factory,
    tint: 'bg-theme-lavender/10 text-theme-lavender'
  },
  {
    id: 'sample-2',
    title: 'Hotel Manager',
    companyName: '[Company name]',
    location: 'Dindori',
    type: 'Full Time',
    salary: '[salary]',
    icon: Utensils,
    tint: 'bg-theme-terracotta/10 text-theme-terracotta'
  },
  {
    id: 'sample-3',
    title: 'Business Development Manager',
    companyName: '[Company name]',
    location: '[location]',
    type: 'Full Time',
    salary: '[salary]',
    icon: ChartLine,
    tint: 'bg-theme-deepTeal/10 text-theme-deepTeal'
  },
  {
    id: 'sample-4',
    title: 'ITI Trainee / Technician',
    companyName: 'Reliance Life Sciences',
    location: 'Akarale',
    type: 'ITI Freshers',
    salary: '[salary]',
    icon: FlaskConical,
    tint: 'bg-theme-gold/10 text-theme-gold'
  },
  {
    id: 'sample-5',
    title: 'Driver',
    companyName: '[Company name]',
    location: 'Ozar',
    type: '3 Openings',
    salary: '[salary]',
    icon: Truck,
    tint: 'bg-theme-lavender/10 text-theme-lavender'
  },
  {
    id: 'sample-6',
    title: 'Tailoring Artisan',
    companyName: '[Organisation]',
    location: 'Khedgaon',
    type: 'Part Time',
    salary: '[salary]',
    icon: Scissors,
    tint: 'bg-theme-deepTeal/10 text-theme-deepTeal'
  }
];

const PRODUCTS = [
  { name: 'Eco-Friendly Cloth Bags', nameMr: 'इको-फ्रेंडली कापडी पिशव्या', desc: 'Block-printed cotton, made to last' },
  { name: 'Portable Steel Glass', nameMr: 'पोर्टेबल स्टीलचा ग्लास', desc: 'Collapsible, plastic-free, travel ready' },
  { name: 'Pickles & Masala', nameMr: 'लोणचे व मसाले', desc: 'Traditional recipes, small batches' },
  { name: 'Patravali (Leaf Plate) / Trencher', nameMr: 'पत्रावळ', desc: 'Pressed leaf, fully compostable' }
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

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isMr = i18n.language === 'mr';
  const L = (en: string, mr: string) => (isMr ? mr : en);

  // States for dynamic data
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: initiatives } = useGetInitiativesQuery();

  const [activeInitiativeTab, setActiveInitiativeTab] = useState<'upcoming' | 'past'>('upcoming');
  const [storyIndex, setStoryIndex] = useState(0);
  const stories = MockDb.getStories();
  const currentStory = stories[storyIndex];

  // Hero rotating keyword
  const [kwIndex, setKwIndex] = useState(0);
  const [kwSwap, setKwSwap] = useState(false);

  // Hero search
  const [searchType, setSearchType] = useState('job');

  // Auto rail
  const jobRailRef = useRef<HTMLDivElement>(null);
  const railPaused = useRef(false);

  // Modals
  const [queryOpen, setQueryOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [querySent, setQuerySent] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [rating, setRating] = useState(-1);

  useEffect(() => {
    const id = setInterval(() => {
      setKwSwap(true);
      setTimeout(() => {
        setKwIndex((p) => (p + 1) % KEYWORDS.length);
        setKwSwap(false);
      }, 350);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setQueryOpen(false);
      setFeedbackOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = queryOpen || feedbackOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [queryOpen, feedbackOpen]);

  // Auto-run the featured jobs rail
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      const rail = jobRailRef.current;
      if (!rail || railPaused.current) return;
      const card = rail.firstElementChild as HTMLElement | null;
      const step = card ? card.getBoundingClientRect().width + 20 : 340;
      if (rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 4) {
        rail.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        rail.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, 3200);
    return () => clearInterval(id);
  }, []);

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

  const handleSearch = () => {
    if (searchType === 'job') {
      scrollToId('jobs');
    } else if (searchType === 'hire') {
      handleEnterGateway('COMPANY');
    } else if (searchType === 'service') {
      scrollToId('services');
    } else {
      handleEnterGateway('SHG');
    }
  };

  const getLocalizedInitiative = (init: any) => ({
    title: isMr ? init.titleMr : init.titleEn,
    desc: isMr ? init.descriptionMr : init.descriptionEn,
    location: isMr ? init.locationMr : init.locationEn,
    date: init.date
  });

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

  const realJobs = MockDb.getJobs().filter((j) => j.isApproved);
  const padTo = 4;
  const railJobs = realJobs.length
    ? [...realJobs, ...SAMPLE_JOBS.slice(0, Math.max(0, padTo - realJobs.length))]
    : SAMPLE_JOBS.slice(0, padTo);

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
                  {L('Employment, enterprise and self-reliance with', 'रोजगार, उद्योजकता आणि स्वावलंबन,')}{' '}
                  <em className="not-italic font-extrabold text-theme-lavender">{L('Swayamrojgar Vibhag', 'स्वयंरोजगार विभाग')}</em>
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl xl:text-[3.75rem] font-extrabold text-theme-darkViolet leading-[1.12] mb-7">
                <span className="text-theme-darkViolet">{L('Find', 'तुमचे')} </span>
                <span className="gloss-teal">{L('Your', 'आदर्श')}</span>{' '}
                <span className="gloss">{L('Perfect', '...')}</span>
                <br className="hidden md:block" />
                <span className={`kw-box ${kwSwap ? 'swap' : ''}`}>{KEYWORDS[kwIndex]}</span>
              </h1>

              <p className="text-base md:text-lg text-theme-darkViolet/70 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {L(
                  'Search a job, hire local talent, book a service or register your self-help group. Whatever you have come here for, start below.',
                  'नोकरी शोधा, स्थानिक उमेदवार निवडा, सेवा बुक करा किंवा तुमचा बचत गट नोंदवा. तुम्ही जे काही करायला आले असाल, ते खालून सुरू करा.'
                )}
              </p>

              {/* Search bar */}
              <div className="glass p-2.5 rounded-2xl max-w-2xl mx-auto lg:mx-0">
                <div className="flex flex-col md:flex-row items-stretch gap-2">
                  <div className="px-4 py-2 md:border-r border-theme-lightViolet text-left md:w-40 shrink-0">
                    <label className="block text-[10px] text-theme-darkViolet/50 font-bold uppercase tracking-widest mb-1">{L('I want to', 'मला हवे आहे')}</label>
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="w-full text-sm outline-none text-theme-darkViolet font-bold bg-transparent appearance-none cursor-pointer"
                    >
                      <option value="job">{L('Find a Job', 'नोकरी शोधा')}</option>
                      <option value="hire">{L('Hire Talent', 'उमेदवार निवडा')}</option>
                      <option value="service">{L('Use a Service', 'सेवा घ्या')}</option>
                      <option value="shg">{L('Join / Register SHG', 'बचतगटात सामील व्हा')}</option>
                    </select>
                  </div>

                  <div className="px-4 py-2 md:border-r border-theme-lightViolet text-left flex-1">
                    <label className="block text-[10px] text-theme-darkViolet/50 font-bold uppercase tracking-widest mb-1">{L('Keyword', 'कीवर्ड')}</label>
                    <input type="text" placeholder="Marketing Manager, ITI, Papad..." className="w-full text-sm outline-none text-theme-darkViolet font-bold bg-transparent placeholder-theme-darkViolet/30" />
                  </div>

                  <div className="px-4 py-2 text-left md:w-40 shrink-0">
                    <label className="block text-[10px] text-theme-darkViolet/50 font-bold uppercase tracking-widest mb-1">{L('Location', 'ठिकाण')}</label>
                    <select className="w-full text-sm outline-none text-theme-darkViolet font-bold bg-transparent appearance-none cursor-pointer">
                      <option>{L('All Locations', 'सर्व ठिकाणे')}</option>
                      <option>Dindori, Nashik</option>
                      <option>Akarale</option>
                      <option>Thergaon, Pune</option>
                      <option>Vani</option>
                      <option>Ozar</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSearch}
                    className="btn-gloss bg-theme-lavender text-white px-8 py-3.5 rounded-xl font-bold hover:bg-theme-darkViolet transition-all shadow-md shadow-theme-lavender/30 whitespace-nowrap cursor-pointer"
                  >
                    {L('Search', 'शोधा')}
                  </button>
                </div>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-6">
                <span className="text-sm font-bold text-theme-darkViolet/70 mr-1">{L('Go straight to:', 'थेट जा:')}</span>
                <button onClick={() => scrollToId('jobs')} className="bg-white border border-theme-lightViolet px-4 py-1.5 rounded-full text-sm font-bold text-theme-darkViolet hover:border-theme-lavender hover:text-theme-lavender transition cursor-pointer">{L('Jobs', 'नोकऱ्या')}</button>
                <button onClick={() => handleEnterGateway('COMPANY')} className="bg-white border border-theme-lightViolet px-4 py-1.5 rounded-full text-sm font-bold text-theme-darkViolet hover:border-theme-lavender hover:text-theme-lavender transition cursor-pointer">{L('Hire', 'भरती')}</button>
                <button onClick={() => scrollToId('services')} className="bg-white border border-theme-lightViolet px-4 py-1.5 rounded-full text-sm font-bold text-theme-darkViolet hover:border-theme-lavender hover:text-theme-lavender transition cursor-pointer">{L('Services', 'सेवा')}</button>
                <button onClick={() => handleEnterGateway('SHG')} className="bg-white border border-theme-lightViolet px-4 py-1.5 rounded-full text-sm font-bold text-theme-darkViolet hover:border-theme-lavender hover:text-theme-lavender transition cursor-pointer">{L('SHG', 'बचतगट')}</button>
                <button onClick={() => scrollToId('products')} className="bg-white border border-theme-lightViolet px-4 py-1.5 rounded-full text-sm font-bold text-theme-darkViolet hover:border-theme-lavender hover:text-theme-lavender transition cursor-pointer">{L('Products', 'उत्पादने')}</button>
              </div>
            </div>

            {/* RIGHT */}
            <div className="relative h-[480px] sm:h-[580px] lg:h-[640px]">
              <div
                className="absolute left-1/2 -translate-x-1/2 top-8 w-[260px] h-[380px] min-[340px]:w-[300px] min-[340px]:h-[420px] sm:w-[380px] sm:h-[500px] rounded-[3rem] rotate-3"
                style={{ background: 'linear-gradient(150deg,#6D4AFF 0%,#E23E77 55%,#FFB020 100%)' }}
              ></div>

              <div className="ring-dash absolute left-1/2 -translate-x-1/2 top-4 w-[300px] h-[420px] min-[340px]:w-[336px] min-[340px]:h-[456px] sm:w-[420px] sm:h-[540px] rounded-[3.5rem] border-2 border-dashed border-theme-lavender/35"></div>

              <div className="absolute left-1/2 -translate-x-1/2 top-8 w-[260px] h-[380px] min-[340px]:w-[300px] min-[340px]:h-[420px] sm:w-[380px] sm:h-[500px] rounded-[3rem] overflow-hidden shadow-2xl z-10 bg-white">
                <img src="/home/hero-person.jpg" alt={L('Swayamrojgar Vibhag', 'स्वयंरोजगार विभाग')} className="w-full h-full object-cover" />
              </div>

              <div className="deco text-theme-gold text-3xl font-bold right-6 top-10 ico-bob">+</div>
              <div className="deco text-theme-lavender text-2xl font-bold left-4 top-1/3 ico-bob s2">+</div>
              <div className="deco text-theme-mint text-2xl font-bold right-1/4 bottom-10 ico-bob s3">+</div>
              <div className="deco right-8 bottom-28 w-6 h-6 rounded-full border-[3px] border-theme-gold"></div>
              <div className="deco left-6 bottom-14 w-10 h-10 rounded-full border-[4px] border-theme-terracotta/50"></div>

              <a onClick={() => scrollToId('jobs')} className="float-card from-left d1 absolute left-0 top-6 glass pl-3 pr-5 py-2.5 rounded-full z-20 flex items-center gap-2.5 hover:-translate-y-0.5 transition cursor-pointer">
                <span className="w-9 h-9 rounded-full bg-theme-lavender text-white flex items-center justify-center shrink-0"><Briefcase className="text-sm w-4 h-4" /></span>
                <span className="text-sm font-extrabold text-theme-darkViolet whitespace-nowrap">{L('Find a Job', 'नोकरी शोधा')}</span>
              </a>

              <a onClick={() => handleEnterGateway('COMPANY')} className="float-card from-top d2 absolute right-0 top-0 glass pl-3 pr-5 py-2.5 rounded-full z-20 flex items-center gap-2.5 hover:-translate-y-0.5 transition cursor-pointer">
                <span className="w-9 h-9 rounded-full bg-theme-terracotta text-white flex items-center justify-center shrink-0"><UserPlus className="text-sm w-4 h-4" /></span>
                <span className="text-sm font-extrabold text-theme-darkViolet whitespace-nowrap">{L('Hire Talent', 'उमेदवार निवडा')}</span>
              </a>

              <a onClick={() => scrollToId('services')} className="float-card from-left d3 absolute -left-3 top-[40%] glass px-4 py-3 rounded-2xl z-20 text-left w-48 hover:-translate-y-0.5 transition cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-lg bg-theme-deepTeal/15 text-theme-deepTeal flex items-center justify-center shrink-0"><GraduationCap className="text-sm w-4 h-4" /></span>
                  <div>
                    <div className="text-[13px] font-extrabold text-theme-darkViolet leading-tight">{L('Skill Training', 'कौशल्य प्रशिक्षण')}</div>
                    <div className="text-[10px] text-theme-darkViolet/60">{L('MPSC / UPSC & trades', 'MPSC / UPSC आणि व्यवसाय')}</div>
                  </div>
                </div>
              </a>

              <a onClick={() => scrollToId('services')} className="float-card from-right d4 absolute -right-3 top-[36%] glass px-4 py-3 rounded-2xl z-20 text-left w-48 hover:-translate-y-0.5 transition cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-lg bg-theme-lavender/15 text-theme-lavender flex items-center justify-center shrink-0"><Store className="text-sm w-4 h-4" /></span>
                  <div>
                    <div className="text-[13px] font-extrabold text-theme-darkViolet leading-tight">{L('Start a Business', 'व्यवसाय सुरू करा')}</div>
                    <div className="text-[10px] text-theme-darkViolet/60">{L('Udyojakta Manch', 'उद्योजकता मंच')}</div>
                  </div>
                </div>
              </a>

              <a onClick={() => handleEnterGateway('SHG')} className="float-card from-bottom d5 absolute left-0 bottom-10 glass px-4 py-3 rounded-2xl z-20 text-left w-52 hover:-translate-y-0.5 transition cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-lg bg-theme-mint/25 text-theme-deepTeal flex items-center justify-center shrink-0"><HandCoins className="text-sm w-4 h-4" /></span>
                  <div>
                    <div className="text-[13px] font-extrabold text-theme-darkViolet leading-tight">{L('SHG / Bachat Gat', 'बचत गट')}</div>
                    <div className="text-[10px] text-theme-darkViolet/60">{L('Register, train and sell', 'नोंदणी, प्रशिक्षण आणि विक्री')}</div>
                  </div>
                </div>
              </a>

              <a onClick={() => scrollToId('jobs')} className="float-card from-right d6 absolute right-0 bottom-2 glass px-4 py-3 rounded-2xl z-20 text-left w-52 hover:-translate-y-0.5 transition cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-lg bg-theme-gold/20 text-theme-gold flex items-center justify-center shrink-0"><Users className="text-sm w-4 h-4" /></span>
                  <div>
                    <div className="text-[13px] font-extrabold text-theme-darkViolet leading-tight">{L('Employment Fairs', 'रोजगार मेळावे')}</div>
                    <div className="text-[10px] text-theme-darkViolet/60">{L('Meet companies directly', 'कंपन्यांना थेट भेटा')}</div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CHOOSE YOUR PLATFORM */}
      <section id="platform" className="relative py-20 overflow-hidden">
        <div className="absolute top-10 left-[8%] w-3 h-3 rounded-full bg-theme-gold ico-bob"></div>
        <div className="absolute bottom-16 right-[10%] w-4 h-4 rounded-full border-2 border-theme-terracotta ico-bob s2"></div>
        <div className="absolute top-1/3 right-[6%] text-theme-lavender/40 text-2xl font-bold ico-bob s3">+</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-theme-mint/15 text-theme-deepTeal px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest mb-4">
              <Compass className="w-3.5 h-3.5" /> {L('Where do you begin', 'कुठून सुरुवात कराल')}
            </span>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-theme-darkViolet leading-tight">
              {L('Three Doors,', 'तीन दरवाजे,')} <span className="gloss">{L('One Purpose', 'एकच ध्येय')}</span>
            </h2>
            <p className="text-theme-darkViolet/60 mt-4 max-w-2xl mx-auto">
              {L(
                'Whether you need work, need guidance or need a market for what you make — walk through the door that is yours.',
                'तुम्हाला काम हवे, मार्गदर्शन हवे किंवा तुमच्या उत्पादनाला बाजारपेठ हवी — तुमच्या दरवाजातून आत या.'
              )}
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
                  <span className="text-[11px] font-extrabold text-theme-darkViolet">{L(`${hiredCount} hired`, `${hiredCount} नोकरी मिळालेले`)}</span>
                </div>

                <div className="relative z-10 w-20 h-20 rounded-3xl bg-theme-lavender/10 text-theme-lavender flex items-center justify-center mt-10 mb-6 ico-hop group-hover:bg-theme-lavender group-hover:text-white transition-colors duration-300">
                  <Briefcase className="text-3xl w-8 h-8" />
                </div>
                <h3 className="relative z-10 text-2xl font-extrabold text-theme-darkViolet mb-3">{L('Careers', 'करिअर')}</h3>
                <p className="relative z-10 text-theme-darkViolet/65 mb-7 flex-grow text-sm leading-relaxed">
                  {L('For ', '')}
                  <strong className="text-theme-darkViolet">{L('candidates', 'उमेदवारांसाठी')}</strong>
                  {L(' seeking work and ', ' नोकरी शोधणारे आणि ')}
                  <strong className="text-theme-darkViolet">{L('companies', 'कंपन्यांसाठी')}</strong>
                  {L(' looking to hire reliable local talent.', ' स्थानिक विश्वासू उमेदवारांची भरती.')}
                </p>
                <div className="relative z-10 w-full space-y-2.5">
                  <button onClick={() => scrollToId('jobs')} className="btn-gloss block w-full bg-theme-lavender text-white px-6 py-3 rounded-full font-bold hover:bg-theme-darkViolet transition-all shadow-md shadow-theme-lavender/30 text-sm cursor-pointer">{L('Find Work', 'नोकरी शोधा')}</button>
                  <button onClick={() => handleEnterGateway('COMPANY')} className="block w-full bg-white border-2 border-theme-lightViolet text-theme-darkViolet px-6 py-3 rounded-full font-bold hover:border-theme-lavender hover:text-theme-lavender transition-all text-sm cursor-pointer">{L('Hire Talent', 'उमेदवार निवडा')}</button>
                </div>
              </div>
            </div>

            {/* 2. SERVICES */}
            <div id="services" className="tile group relative rounded-[2rem] p-[2px] bg-gradient-to-br from-theme-deepTeal/60 via-theme-deepTeal/10 to-transparent hover:from-theme-deepTeal hover:via-theme-mint/50 transition-all duration-500">
              <div className="relative h-full rounded-[1.9rem] bg-white p-8 flex flex-col items-center text-center overflow-hidden">
                <span className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-theme-deepTeal/[0.07] group-hover:scale-150 transition-transform duration-700"></span>
                <span className="absolute top-5 right-6 text-6xl font-extrabold text-theme-deepTeal/10 leading-none select-none">02</span>

                <div className="stat-badge absolute top-5 left-5 bg-white shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 border border-theme-lightViolet z-20">
                  <span className="w-2 h-2 rounded-full bg-theme-gold animate-pulse"></span>
                  <span className="text-[11px] font-extrabold text-theme-darkViolet">{L(`${trainingsCount} trainings`, `${trainingsCount} प्रशिक्षणे`)}</span>
                </div>

                <div className="relative z-10 w-20 h-20 rounded-3xl bg-theme-deepTeal/10 text-theme-deepTeal flex items-center justify-center mt-10 mb-6 ico-hop group-hover:bg-theme-deepTeal group-hover:text-white transition-colors duration-300">
                  <Landmark className="text-3xl w-8 h-8" />
                </div>
                <h3 className="relative z-10 text-2xl font-extrabold text-theme-darkViolet mb-3">{L('Our Services', 'आमच्या सेवा')}</h3>
                <p className="relative z-10 text-theme-darkViolet/65 mb-7 flex-grow text-sm leading-relaxed">
                  {L('Career counselling, competitive examination guidance, business and licence help, machinery support and skill training.', 'करिअर समुपदेशन, स्पर्धा परीक्षा मार्गदर्शन, व्यवसाय व परवाना साहाय्य, यंत्रसाहाय्य आणि कौशल्य प्रशिक्षण.')}
                </p>
                <div className="relative z-10 w-full space-y-2.5">
                  <button onClick={() => scrollToId('platform')} className="btn-gloss block w-full bg-theme-deepTeal text-white px-6 py-3 rounded-full font-bold hover:bg-theme-darkViolet transition-all shadow-md text-sm cursor-pointer">{L('Explore Services', 'सेवा पहा')}</button>
                  <button onClick={() => openModal('query')} className="block w-full bg-white border-2 border-theme-lightViolet text-theme-darkViolet px-6 py-3 rounded-full font-bold hover:border-theme-deepTeal hover:text-theme-deepTeal transition-all text-sm cursor-pointer">{L('Book Guidance', 'मार्गदर्शन मिळवा')}</button>
                </div>
              </div>
            </div>

            {/* 3. SHG */}
            <div id="shg" className="tile group relative rounded-[2rem] p-[2px] bg-gradient-to-br from-theme-terracotta/60 via-theme-terracotta/10 to-transparent hover:from-theme-terracotta hover:via-theme-gold/50 transition-all duration-500">
              <div className="relative h-full rounded-[1.9rem] bg-white p-8 flex flex-col items-center text-center overflow-hidden">
                <span className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-theme-terracotta/[0.07] group-hover:scale-150 transition-transform duration-700"></span>
                <span className="absolute top-5 right-6 text-6xl font-extrabold text-theme-terracotta/10 leading-none select-none">03</span>

                <div className="stat-badge absolute top-5 left-5 bg-white shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 border border-theme-lightViolet z-20">
                  <span className="w-2 h-2 rounded-full bg-theme-terracotta animate-pulse"></span>
                  <span className="text-[11px] font-extrabold text-theme-darkViolet">{L(`${shgCount} groups`, `${shgCount} गट`)}</span>
                </div>

                <div className="relative z-10 w-20 h-20 rounded-3xl bg-theme-terracotta/10 text-theme-terracotta flex items-center justify-center mt-10 mb-6 ico-hop group-hover:bg-theme-terracotta group-hover:text-white transition-colors duration-300">
                  <Network className="text-3xl w-8 h-8" />
                </div>
                <h3 className="relative z-10 text-2xl font-extrabold text-theme-darkViolet mb-3">{L('SHG Network', 'बचतगट नेटवर्क')}</h3>
                <p className="relative z-10 text-theme-darkViolet/65 mb-7 flex-grow text-sm leading-relaxed">
                  {L('Support for ', '')}
                  <strong className="text-theme-darkViolet">{L('existing', 'विद्यमान')}</strong>
                  {L(' self-help groups and registration for ', ' बचतगटांना पाठबळ आणि ')}
                  <strong className="text-theme-darkViolet">{L('new', 'नवीन')}</strong>
                  {L(' ones — training, quality and market access.', ' गटांची नोंदणी — प्रशिक्षण, गुणवत्ता आणि बाजारपेठ.')}
                </p>
                <div className="relative z-10 w-full space-y-2.5">
                  <button onClick={() => handleEnterGateway('SHG')} className="btn-gloss block w-full bg-theme-terracotta text-white px-6 py-3 rounded-full font-bold hover:bg-theme-darkViolet transition-all shadow-md text-sm cursor-pointer">{L('Register Your Group', 'गट नोंदणी करा')}</button>
                  <button onClick={() => scrollToId('products')} className="block w-full bg-white border-2 border-theme-lightViolet text-theme-darkViolet px-6 py-3 rounded-full font-bold hover:border-theme-terracotta hover:text-theme-terracotta transition-all text-sm cursor-pointer">{L('Our Products', 'आमची उत्पादने')}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED JOBS */}
      <section id="jobs" className="relative py-16 bg-theme-lightViolet/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">

            {/* LEFT image */}
            <div className="lg:col-span-4 relative hidden lg:block order-first">
              <div className="morphing absolute inset-x-2 top-6 bottom-6 blob-b bg-theme-lavender/15"></div>
              <div className="deco left-0 top-4 text-theme-gold text-3xl font-bold ico-bob">+</div>
              <div className="deco right-2 bottom-20 w-8 h-8 rounded-full border-[4px] border-theme-terracotta/40"></div>
              <img src="/home/pointing-girl.jpg" alt={L('Pointing to opportunities', 'संधी दाखवताना')} className="relative z-10 rounded-[2rem] object-cover w-full h-full drop-shadow-xl" />
              <div className="stat-badge absolute -right-3 bottom-28 glass rounded-2xl px-4 py-3 z-20 flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-theme-mint/25 text-theme-deepTeal flex items-center justify-center"><Check className="w-4 h-4" /></span>
                <div className="text-left leading-none">
                  <div className="text-base font-extrabold text-theme-darkViolet">{L('100% Free', '100% मोफत')}</div>
                  <div className="text-[10px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mt-1">{L('No fee, ever', 'कधीही शुल्क नाही')}</div>
                </div>
              </div>
            </div>

            {/* RIGHT job rail */}
            <div className="lg:col-span-8">
              <div className="mb-7">
                <span className="inline-flex items-center gap-2 bg-white text-theme-wine px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest shadow-sm mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-theme-wine animate-pulse"></span> {L('Live openings', 'थेट संधी')}
                </span>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-theme-darkViolet leading-tight">
                  {L('Featured', 'ठळक')} <span className="gloss">{L('Jobs', 'नोकऱ्या')}</span>
                </h2>
                <p className="text-theme-darkViolet/60 mt-2 text-sm max-w-lg">
                  {L('Verified openings with local employers — free for every candidate.', 'स्थानिक नियोक्त्यांच्या पडताळलेल्या संधी — प्रत्येक उमेदवारासाठी मोफत.')}
                </p>
              </div>

              <div
                id="jobRail"
                ref={jobRailRef}
                className="rail"
                onMouseEnter={() => { railPaused.current = true; }}
                onMouseLeave={() => { railPaused.current = false; }}
              >
                {railJobs.map((job) => (
                  <div key={job.id} className="job-card group relative bg-white rounded-2xl border border-theme-lightViolet p-5 hover:shadow-xl hover:-translate-y-1.5 hover:border-theme-lavender/40 transition-all duration-300">
                    <button className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-theme-lightViolet/70 text-theme-lavender/70 hover:bg-theme-lavender hover:text-white flex items-center justify-center transition cursor-pointer" aria-label="Save job"><Bookmark className="text-xs w-4 h-4" /></button>
                    <div className="flex items-start gap-3.5 mb-3.5 pr-9">
                      <span className="w-12 h-12 rounded-xl bg-theme-lavender/10 text-theme-lavender flex items-center justify-center shrink-0 ico-hop">
                        {'tint' in job ? null : <Briefcase className="w-5 h-5" />}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-theme-darkViolet leading-tight truncate">{job.title}</h4>
                        <p className="text-xs text-theme-darkViolet/55 mt-0.5 truncate">{job.companyName}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3.5">
                      <span className="bg-theme-lightViolet text-theme-darkViolet/70 text-[11px] font-bold px-2.5 py-1 rounded-full">
                        <MapPin className="inline w-3 h-3 mr-1 text-theme-lavender/70 -mt-0.5" />{job.location}
                      </span>
                      <span className="bg-theme-mint/15 text-theme-deepTeal text-[11px] font-bold px-2.5 py-1 rounded-full">{job.type}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-theme-lightViolet">
                      <span className="text-sm font-extrabold text-theme-darkViolet">
                        {'salary' in job && typeof job.salary === 'string' && job.salary.replace(/[0-9]/g, '').includes('₹') ? (
                          job.salary
                        ) : (
                          <>
                            <IndianRupee className="inline w-3 h-3 mr-0.5 text-theme-lavender -mt-0.5" />{job.salary}
                            <span className="text-[11px] font-semibold text-theme-darkViolet/45"> / {L('month', 'महिना')}</span>
                          </>
                        )}
                      </span>
                      <button
                        onClick={() => { if (isAuthenticated) scrollToId('jobs'); else handleEnterGateway('CANDIDATE'); }}
                        className="text-xs font-extrabold text-theme-lavender opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all cursor-pointer"
                      >
                        {L('Apply', 'अर्ज करा')} <ArrowRight className="inline w-3 h-3 -mt-0.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { const r = jobRailRef.current; if (r && r.firstElementChild) { const w = (r.firstElementChild as HTMLElement).getBoundingClientRect().width + 20; r.scrollBy({ left: -w, behavior: 'smooth' }); } }}
                    className="nav-btn w-12 h-12 rounded-full bg-white text-theme-lavender border border-theme-lightViolet shadow-md hover:bg-theme-lavender hover:text-white flex items-center justify-center cursor-pointer"
                    aria-label="Previous jobs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { const r = jobRailRef.current; if (r && r.firstElementChild) { const w = (r.firstElementChild as HTMLElement).getBoundingClientRect().width + 20; r.scrollBy({ left: w, behavior: 'smooth' }); } }}
                    className="nav-btn w-12 h-12 rounded-full bg-theme-lavender text-white shadow-lg shadow-theme-lavender/30 hover:bg-theme-darkViolet flex items-center justify-center cursor-pointer"
                    aria-label="Next jobs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => handleEnterGateway('CANDIDATE')} className="btn-gloss inline-flex items-center gap-2 bg-theme-lavender text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-theme-darkViolet transition-all shadow-lg shadow-theme-lavender/30 cursor-pointer">
                  {L('All Jobs', 'सर्व नोकऱ्या')} <ArrowRight className="text-xs w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-theme-darkViolet/50 mt-10">
            <ShieldCheck className="inline w-4 h-4 text-theme-lavender mr-1.5 -mt-0.5" />
            {L('Every listing is verified. The Swayamrojgar Vibhag never charges a candidate any fee.', 'प्रत्येक नोकरी पडताळलेली असते. स्वयंरोजगार विभाग उमेदवाराकडून कधीही शुल्क घेत नाही.')}
          </p>
        </div>
      </section>

      {/* COMMUNITY PRODUCTS */}
      <section id="products" className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-5 relative">
              <Reveal direction="l">
                <div className="kb-frame relative max-w-sm mx-auto lg:mx-0">
                  <span className="absolute -top-4 -left-4 w-20 h-20 rounded-2xl border-2 border-theme-mint/40"></span>
                  <span className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-theme-gold/15"></span>
                  <div className="relative rounded-2xl overflow-hidden shadow-xl">
                    <img src="/home/products.jpg" alt={L('Community products', 'समुदाय उत्पादने')} className="w-full object-cover" />
                    <span className="shine"></span>
                  </div>
                  <div className="absolute -bottom-5 left-5 bg-white shadow-xl rounded-xl px-4 py-3 flex items-center gap-3 border border-theme-lightViolet">
                    <span className="w-9 h-9 rounded-lg bg-theme-mint/20 text-theme-deepTeal flex items-center justify-center"><Leaf className="text-sm w-4 h-4" /></span>
                    <div className="text-left leading-none">
                      <div className="text-sm font-extrabold text-theme-darkViolet">{L('Handmade', 'हाताने बनवलेले')}</div>
                      <div className="text-[10px] font-bold text-theme-darkViolet/50 uppercase tracking-wider mt-1">{L('By our bachat gats', 'आमच्या बचत गटांनी')}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 bg-theme-mint/15 text-theme-deepTeal px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest mb-4">
                <HeartHandshake className="w-3.5 h-3.5" /> {L('Made by our women', 'आमच्या महिलांनी बनवलेले')}
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-theme-darkViolet mb-3">
                <span className="gloss-teal">{L('Community', 'समुदाय')}</span> {L('Products', 'उत्पादने')}
              </h2>
              <p className="text-theme-darkViolet/60 mb-6 leading-relaxed max-w-xl">
                {L('Handmade, sustainable and community made. Every purchase supports a family in our network.', 'हाताने बनवलेली, टिकाऊ आणि समुदायातर्फे बनवलेली उत्पादने. प्रत्येक खरेदीने आमच्या नेटवर्कमधील एक कुटुंब सक्षम होते.')}
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
                          <div className="text-xs text-theme-darkViolet/55 mt-1">{isMr ? L(p.desc, p.desc) : L(p.desc, p.desc)} &middot; <span className="text-theme-deepTeal font-bold">[Group name]</span></div>
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
                {L('Visit the Shop', 'दुकान पहा')} <ArrowRight className="text-xs w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INITIATIVES */}
      <section id="initiatives" className="py-20 bg-theme-lightViolet/40 relative overflow-hidden">
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
                  <Quote className="w-3.5 h-3.5" /> {L('Real stories', 'खऱ्या यशोगाथा')}
                </span>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-theme-darkViolet leading-tight">
                  {L('Our Happy', 'आमचे समाधानी')} <span className="gloss">{L('Community', 'समुदाय')}</span> {L('Family', 'कुटुंब')}
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
                    {L('Success story', 'यशोगाथा')} {storyIndex + 1} / {stories.length}
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
      <section id="franchise" className="relative bg-theme-lightViolet/70 py-10 overflow-hidden">
        <div className="fr-blob absolute -top-16 left-10 w-48 h-48 rounded-full bg-theme-lavender/15 blur-3xl"></div>
        <div className="fr-blob b2 absolute -bottom-16 right-24 w-48 h-48 rounded-full bg-theme-mint/15 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-9">

            <Reveal direction="l" className="shrink-0">
              <div className="kb-frame relative w-[150px] sm:w-[170px]">
                <span className="absolute -top-2 -left-2 w-10 h-10 rounded-xl bg-theme-gold/25"></span>
                <span className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-theme-mint/25"></span>
                <div className="relative rounded-2xl overflow-hidden shadow-lg">
                  <img src="/home/franchise.jpg" alt={L('Partner with us', 'आमचे भागीदार व्हा')} className="w-full object-cover" />
                  <span className="shine"></span>
                </div>
              </div>
            </Reveal>

            <Reveal direction="u" className="text-center lg:text-left flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 bg-white text-theme-lavender px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-2.5 shadow-sm">
                <Handshake className="w-3.5 h-3.5" /> {L('Partner with us', 'आमचे भागीदार व्हा')}
              </span>
              <h2 className="text-2xl lg:text-[1.75rem] font-extrabold text-theme-darkViolet leading-tight mb-1.5">
                {L('Build Your Own', 'तुमची स्वतःची')} <span className="gloss">{L('Success.', 'यशस्वी कथा घडवा.')}</span>
              </h2>
              <p className="text-sm text-theme-darkViolet/65 mb-3 max-w-xl mx-auto lg:mx-0">
                {L('Partner with us to bring trusted products to your community. Grow together, create opportunities.', 'तुमच्या समुदायापर्यंत विश्वासू उत्पादने पोहोचवण्यासाठी आमच्यासोबत जोडून घ्या. एकत्र वाढा, संधी निर्माण करा.')}
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-1.5 text-xs font-bold text-theme-darkViolet/70">
                <span><Check className="inline w-3.5 h-3.5 text-theme-mint mr-1.5 -mt-0.5" />{L('Trusted brands', 'विश्वासू ब्रँड्स')}</span>
                <span><Check className="inline w-3.5 h-3.5 text-theme-mint mr-1.5 -mt-0.5" />{L('Growing demand', 'वाढती मागणी')}</span>
                <span><Check className="inline w-3.5 h-3.5 text-theme-mint mr-1.5 -mt-0.5" />{L('Stronger communities', 'सक्षम समुदाय')}</span>
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
                  <div className="text-[10px] font-extrabold text-theme-darkViolet leading-tight">{L('Satvik Milk', 'सात्विक दूध')}</div>
                </div>
                <div className="fr-card group bg-white rounded-xl border border-theme-lavender/10 shadow-sm px-3 py-2.5 text-center w-[86px] hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
                  <img src="/home/brand-satvikmart.jpg" alt="Satvik Mart" className="w-full h-auto object-contain mb-1.5" />
                  <div className="text-[10px] font-extrabold text-theme-darkViolet leading-tight">{L('Satvik Mart', 'सात्विक मार्ट')}</div>
                </div>
              </div>
              <button
                onClick={() => openModal('query')}
                className="btn-gloss inline-flex items-center gap-2 bg-theme-lavender text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-theme-darkViolet transition-all shadow-md shadow-theme-lavender/30 whitespace-nowrap cursor-pointer"
              >
                {L('Be Your Own Boss!', 'स्वतःचे मालक व्हा!')} <ArrowRight className="text-[10px] w-3.5 h-3" />
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CONTACT & MAP */}
      <section id="contact" className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-theme-lightViolet text-theme-lavender px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest mb-4">
              <MapPin className="w-3.5 h-3.5" /> {L('Where to find us', 'आम्हाला कुठे भेटाल')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-theme-darkViolet">
              {L('Our Offices &', 'आमची कार्यालये व')} <span className="gloss">{L('Kendras', 'केंद्रे')}</span>
            </h2>
            <p className="text-theme-darkViolet/60 mt-3 max-w-2xl mx-auto">
              {L('Our offices are at Dindori and Trimbak. Everywhere else, sevekaris are served through our kendras.', 'आमची कार्यालये दिंडोरी व त्र्यंबकेश्वर येथे आहेत. इतर ठिकाणी सेवेकरींना आमच्या केंद्रांमार्फत सेवा दिली जाते.')}
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-stretch">
            <div className="lg:col-span-2 space-y-4">
              <Reveal>
                <div className="tile bg-white rounded-2xl border border-theme-lightViolet p-6 flex items-start gap-4 hover:shadow-xl transition-all duration-300 group">
                  <span className="w-12 h-12 rounded-2xl bg-theme-lavender/10 text-theme-lavender flex items-center justify-center shrink-0 ico-hop"><MapPin className="text-lg w-5 h-5" /></span>
                  <div>
                    <h4 className="font-extrabold text-theme-darkViolet mb-1">{L('Head Office Address', 'मुख्य कार्यालयाचा पत्ता')}</h4>
                    <p className="text-sm text-theme-darkViolet/65 leading-relaxed">
                      {L('Swayamrojgar Vibhag, Shri Swami Seva Marg, [building / street], Dindori, Dist. Nashik, Maharashtra [PIN code]', 'स्वयंरोजगार विभाग, श्री स्वामी सेवा मार्ग, [इमारत / रस्ता], दिंडोरी, जि. नाशिक, महाराष्ट्र [पिन कोड]')}
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay="dly1">
                <div className="tile bg-white rounded-2xl border border-theme-lightViolet p-6 flex items-start gap-4 hover:shadow-xl transition-all duration-300 group">
                  <span className="w-12 h-12 rounded-2xl bg-theme-deepTeal/10 text-theme-deepTeal flex items-center justify-center shrink-0 ico-hop"><Phone className="text-lg w-5 h-5" /></span>
                  <div>
                    <h4 className="font-extrabold text-theme-darkViolet mb-1">{L('Phone', 'दूरध्वनी')}</h4>
                    <p className="text-sm text-theme-darkViolet/65 leading-relaxed">
                      {L('+91 [phone number]', '+९१ [दूरध्वनी क्रमांक]')}
                      <br />{L('Mon to Sat, 10 am to 6 pm', 'सोम ते शनि, सकाळी १० ते संध्याकाळी ६')}
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay="dly2">
                <div className="tile bg-white rounded-2xl border border-theme-lightViolet p-6 flex items-start gap-4 hover:shadow-xl transition-all duration-300 group">
                  <span className="w-12 h-12 rounded-2xl bg-theme-terracotta/10 text-theme-terracotta flex items-center justify-center shrink-0 ico-hop"><Mail className="text-lg w-5 h-5" /></span>
                  <div>
                    <h4 className="font-extrabold text-theme-darkViolet mb-1">{L('Email', 'ईमेल')}</h4>
                    <p className="text-sm text-theme-darkViolet/65 leading-relaxed">{L('[email address]', '[ईमेल पत्ता]')}</p>
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
                  <h4 className="font-extrabold mb-0.5">{L('Follow us on LinkedIn', 'आम्हाला LinkedIn वर फॉलो करा')}</h4>
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
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-theme-lavender">{L('Head Office', 'मुख्य कार्यालय')}</span>
                  </div>
                  <div className="font-extrabold text-theme-darkViolet leading-tight">{L('Dindori', 'दिंडोरी')}</div>
                  <div className="text-xs text-theme-darkViolet/55 mt-1">{L('Dist. Nashik, Maharashtra', 'जि. नाशिक, महाराष्ट्र')}</div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-darkViolet/60 group-hover:text-theme-lavender transition mt-3">{L('Get directions', 'दिशा पहा')} <ArrowRight className="text-[10px] w-3 h-3 group-hover:translate-x-1 transition-transform" /></span>
                </a>

                <a
                  href="https://www.openstreetmap.org/?mlat=19.9333&mlon=73.5333#map=13/19.9333/73.5333"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tile group bg-white rounded-2xl border border-theme-lightViolet p-5 hover:shadow-lg hover:-translate-y-1 transition-all block"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-9 h-9 rounded-xl bg-theme-gold/15 text-theme-gold flex items-center justify-center shrink-0"><Landmark className="text-sm w-4 h-4" /></span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-theme-gold">{L('Office & Gurupeeth', 'कार्यालय व गुरुपीठ')}</span>
                  </div>
                  <div className="font-extrabold text-theme-darkViolet leading-tight">{L('Trimbak', 'त्र्यंबकेश्वर')}</div>
                  <div className="text-xs text-theme-darkViolet/55 mt-1">{L('Dist. Nashik, Maharashtra', 'जि. नाशिक, महाराष्ट्र')}</div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-darkViolet/60 group-hover:text-theme-gold transition mt-3">{L('Get directions', 'दिशा पहा')} <ArrowRight className="text-[10px] w-3 h-3 group-hover:translate-x-1 transition-transform" /></span>
                </a>
              </div>

              <div className="bg-white rounded-2xl border border-theme-lightViolet p-6">
                <h4 className="font-extrabold text-theme-darkViolet mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-theme-deepTeal" /> {L('Our Kendras', 'आमची केंद्रे')}
                </h4>
                <p className="text-xs text-theme-darkViolet/55 mb-5">{L('Beyond our two offices, sevekaris are served through kendras.', 'आमच्या दोन्ही कार्यालयांव्यतिरिक्त, सेवेकरींना केंद्रांमार्फत सेवा दिली जाते.')}</p>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-extrabold text-theme-darkViolet leading-tight mb-1.5">{L('Maharashtra', 'महाराष्ट्र')}</div>
                    <p className="text-xs text-theme-darkViolet/60">{L('Kendras in almost every district of the state.', 'राज्यातील जवळपास प्रत्येक जिल्ह्यात केंद्रे.')}</p>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-theme-darkViolet leading-tight mb-2">{L('Elsewhere in India', 'भारतातील इतर ठिकाणे')}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Madhya Pradesh', 'Uttar Pradesh', 'Gujarat', 'Karnataka', 'Goa'].map((s) => (
                        <span key={s} className="bg-theme-lightViolet text-theme-darkViolet/75 text-[11px] font-bold px-2.5 py-1 rounded-full">{L(s, L(s, s))}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-theme-darkViolet leading-tight mb-2">{L('Outside India', 'भारताबाहेर')}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {['United States', 'United Kingdom', 'Canada'].map((s) => (
                        <span key={s} className="bg-theme-mint/15 text-theme-deepTeal text-[11px] font-bold px-2.5 py-1 rounded-full">{L(s, L(s, s))}</span>
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
              <h3 className="text-xl font-extrabold text-theme-darkViolet leading-tight">{L('Send Us a Query', 'आम्हाला विचारा')}</h3>
              <p className="text-xs text-theme-darkViolet/55 mt-0.5">{L('Jobs, training, SHG registration, franchise', 'नोकरी, प्रशिक्षण, बचतगट नोंदणी, फ्रँचायझी')}</p>
            </div>
          </div>

          <form className="space-y-3.5" onSubmit={submitQuery}>
            <div className="grid sm:grid-cols-2 gap-3.5">
              <input type="text" required placeholder={L('Full name', 'पूर्ण नाव')} className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet placeholder-theme-darkViolet/40 outline-none focus:border-theme-lavender transition" />
              <input type="tel" required placeholder={L('Mobile number', 'मोबाईल क्रमांक')} className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet placeholder-theme-darkViolet/40 outline-none focus:border-theme-lavender transition" />
            </div>
            <input type="email" placeholder={L('Email address (optional)', 'ईमेल पत्ता (ऐच्छिक)')} className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet placeholder-theme-darkViolet/40 outline-none focus:border-theme-lavender transition" />
            <select required className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet outline-none focus:border-theme-lavender transition cursor-pointer">
              <option value="">{L('My query is about…', 'माझा प्रश्न आहे…')}</option>
              <option>{L('Finding a job', 'नोकरी शोधणे')}</option>
              <option>{L('Hiring candidates', 'उमेदवार निवडणे')}</option>
              <option>{L('Skill training / competitive exams', 'कौशल्य प्रशिक्षण / स्पर्धा परीक्षा')}</option>
              <option>{L('Self-help group registration', 'बचतगट नोंदणी')}</option>
              <option>{L('Community products', 'समुदाय उत्पादने')}</option>
              <option>{L('Franchise or distributorship', 'फ्रँचायझी किंवा वितरण')}</option>
              <option>{L('Something else', 'इतर')}</option>
            </select>
            <textarea required rows={4} placeholder={L('Write your question here', 'तुमचा प्रश्न येथे लिहा')} className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet placeholder-theme-darkViolet/40 outline-none focus:border-theme-lavender transition resize-none"></textarea>
            <button type="submit" className="btn-gloss w-full bg-theme-lavender text-white px-6 py-3.5 rounded-xl font-bold hover:bg-theme-darkViolet transition-all shadow-lg shadow-theme-lavender/30 cursor-pointer">{L('Submit Query', 'प्रश्न पाठवा')}</button>
            <p className={`${querySent ? '' : 'hidden'} text-sm font-bold text-theme-deepTeal text-center pt-1`}>
              <Check className="inline w-4 h-4 mr-1.5 -mt-0.5" /> {L('Thank you. A coordinator will contact you.', 'धन्यवाद. समन्वयक तुम्हाला संपर्क करेल.')}
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
              <h3 className="text-xl font-extrabold text-theme-darkViolet leading-tight">{L('Share Your Feedback', 'तुमचा अभिप्राय द्या')}</h3>
              <p className="text-xs text-theme-darkViolet/55 mt-0.5">{L('Tell us what worked and what did not', 'काय चांगले झाले आणि काय नाही, हे सांगा')}</p>
            </div>
          </div>

          <form className="space-y-3.5" onSubmit={submitFeedback}>
            <div className="grid sm:grid-cols-2 gap-3.5">
              <input type="text" required placeholder={L('Full name', 'पूर्ण नाव')} className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet placeholder-theme-darkViolet/40 outline-none focus:border-theme-deepTeal transition" />
              <select required className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet outline-none focus:border-theme-deepTeal transition cursor-pointer">
                <option value="">{L('I am a…', 'मी…')}</option>
                <option>{L('Candidate', 'उमेदवार')}</option>
                <option>{L('Employer', 'नियोक्ता')}</option>
                <option>{L('Self-help group member', 'बचतगट सदस्य')}</option>
                <option>{L('Trainee', 'प्रशिक्षणार्थी')}</option>
                <option>{L('Franchise partner', 'फ्रँचायझी भागीदार')}</option>
                <option>{L('Visitor', 'अभ्यागत')}</option>
              </select>
            </div>

            <div className="border border-theme-lightViolet rounded-xl px-4 py-3.5">
              <div className="text-xs font-bold text-theme-darkViolet/55 uppercase tracking-wider mb-2.5">{L('How would you rate us?', 'तुम्ही आम्हाला किती गुण द्याल?')}</div>
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

            <textarea required rows={4} placeholder={L('Your experience with the Swayamrojgar Vibhag', 'स्वयंरोजगार विभागासोबतचा तुमचा अनुभव')} className="w-full border border-theme-lightViolet rounded-xl px-4 py-3 text-sm font-semibold text-theme-darkViolet placeholder-theme-darkViolet/40 outline-none focus:border-theme-deepTeal transition resize-none"></textarea>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 mt-0.5 accent-theme-deepTeal" />
              <span className="text-xs font-semibold text-theme-darkViolet/60">{L('You may publish my feedback as a testimonial on this website.', 'तुम्ही माझा अभिप्राय या वेबसाइटवर प्रशंसापत्र म्हणून प्रकाशित करू शकता.')}</span>
            </label>

            <button type="submit" className="btn-gloss w-full bg-theme-deepTeal text-white px-6 py-3.5 rounded-xl font-bold hover:bg-theme-darkViolet transition-all shadow-lg cursor-pointer">{L('Send Feedback', 'अभिप्राय पाठवा')}</button>
            <p className={`${feedbackSent ? '' : 'hidden'} text-sm font-bold text-theme-deepTeal text-center pt-1`}>
              <Check className="inline w-4 h-4 mr-1.5 -mt-0.5" /> {L('Thank you for taking the time.', 'वेळ दिल्याबद्दल धन्यवाद.')}
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