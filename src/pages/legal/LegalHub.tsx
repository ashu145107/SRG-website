import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Briefcase,
  ChevronRight,
  ClipboardList,
  Cookie,
  Database,
  FileText,
  HeartHandshake,
  LifeBuoy,
  MessageCircle,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { SiteFooter } from '../../components/SiteFooter';
import { LegalDocKey } from '../../content/legal/types';
import { getLegalContent } from '../../content/legal';

const GROUPED_KEYS: { label: string; keys: LegalDocKey[] }[] = [
  { label: 'everyone', keys: ['privacy', 'disclaimer', 'cookies', 'codeOfConduct'] },
  { label: 'candidates', keys: ['termsCandidate', 'consent', 'dataRequest', 'grievance'] },
  { label: 'employers', keys: ['termsEmployer'] },
];

const DOC_ICONS: Record<LegalDocKey, React.ComponentType<{ className?: string }>> = {
  privacy: ShieldCheck,
  termsCandidate: FileText,
  termsEmployer: Briefcase,
  consent: ClipboardList,
  disclaimer: AlertTriangle,
  cookies: Cookie,
  codeOfConduct: HeartHandshake,
  grievance: MessageCircle,
  dataRequest: Database,
};

export default function LegalHub() {
  const { t, i18n } = useTranslation();
  const content = getLegalContent(i18n.language);

  return (
    <div className="min-h-screen bg-theme-cream flex flex-col">
      <Navbar compact activePage="legal" />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="relative overflow-hidden rounded-3xl border border-theme-lightViolet bg-white px-6 py-8 sm:px-10 sm:py-10 shadow-sm">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-theme-lightViolet/70 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-theme-gold/15 blur-2xl" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-theme-lightViolet px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-theme-lavender">
              <Shield className="h-3.5 w-3.5" />
              {t('legal.badge')}
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight text-theme-darkViolet sm:text-4xl">{t('legal.hubTitle')}</h1>
            <p className="mt-3 text-base font-semibold text-theme-darkViolet/70">{t('legal.hubSubtitle')}</p>
            <p className="mt-3 text-sm leading-7 text-theme-darkViolet/60">{t('legal.hubIntro')}</p>
          </div>
        </header>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-theme-lightViolet bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-theme-lightViolet text-theme-lavender">
                <LifeBuoy className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-theme-darkViolet">{t('legal.needHelp')}</h2>
                <p className="mt-1 text-sm leading-6 text-theme-darkViolet/60">{t('legal.needHelpText')}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to="/legal/grievance-officer"
                    className="inline-flex items-center gap-1 rounded-full bg-theme-lavender px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-theme-darkViolet"
                  >
                    {t('legal.contactGrievance')}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                  <Link
                    to="/legal/data-request"
                    className="inline-flex items-center gap-1 rounded-full border border-theme-lightViolet bg-theme-cream px-3.5 py-1.5 text-xs font-bold text-theme-darkViolet transition hover:border-theme-lavender"
                  >
                    {t('legal.requestData')}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-theme-lightViolet bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-theme-lightViolet text-theme-lavender">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-theme-darkViolet">{t('legal.languagesTitle')}</h2>
                <p className="mt-1 text-sm leading-6 text-theme-darkViolet/60">{t('legal.languagesText')}</p>
                <p className="mt-2 text-xs font-bold text-theme-darkViolet/45">
                  {t('legal.effectiveDate')}: {content.privacy.effectiveDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-9 space-y-9">
          {GROUPED_KEYS.map((group) => (
            <section key={group.label}>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-theme-darkViolet/55">
                <span className="h-1.5 w-1.5 rounded-full bg-theme-lavender" />
                {t(`legal.groups.${group.label}`)}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {group.keys.map((key) => {
                  const doc = content[key];
                  const Icon = DOC_ICONS[key];
                  return (
                    <Link
                      key={key}
                      to={`/legal/${doc.slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-theme-lightViolet bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-theme-lavender/50 hover:shadow-md"
                    >
                      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-theme-lightViolet text-theme-lavender transition group-hover:bg-theme-lavender group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="text-sm font-extrabold leading-5 text-theme-darkViolet">{doc.title}</h3>
                      <p className="mt-1.5 flex-1 text-xs leading-5 text-theme-darkViolet/55">
                        {t(`legal.docs.${key}.description`)}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-theme-lavender">
                        {t('legal.readDocument')}
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-10 text-center text-xs font-semibold leading-6 text-theme-darkViolet/45">
          {t('legal.hubFooterNote')}
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
