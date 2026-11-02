import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CalendarDays, ChevronRight, FileText, LifeBuoy, ShieldCheck } from 'lucide-react';
import { Navbar } from '../Navbar';
import { SiteFooter } from '../SiteFooter';
import { LegalDocument } from '../../content/legal/types';
import { LegalBlockRenderer } from './LegalBlockRenderer';
import { LegalRequestForm } from './LegalRequestForm';

export function LegalLayout({ document: doc }: { document: LegalDocument }) {
  const { t } = useTranslation();
  const isRequest = Boolean(doc.form);

  const scrollToSection = (id: string) => {
    window.document.getElementById(`legal-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-theme-cream flex flex-col">
      <Navbar compact activePage="legal" />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <nav className="mb-5 flex items-center gap-1.5 text-xs font-bold text-theme-darkViolet/50">
          <Link to="/" className="transition hover:text-theme-lavender">{t('nav.home')}</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/legal" className="transition hover:text-theme-lavender">{t('legal.hubTitle')}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-theme-darkViolet/75">{doc.title}</span>
        </nav>

        <header className="relative overflow-hidden rounded-3xl border border-theme-lightViolet bg-white px-5 py-6 sm:px-8 sm:py-8 shadow-sm">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-theme-lightViolet/60 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-theme-lightViolet text-theme-lavender">
                {isRequest ? <ShieldCheck className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
              </span>
              <div>
                <h1 className="text-2xl font-black leading-tight text-theme-darkViolet sm:text-3xl">{doc.title}</h1>
                <p className="mt-1 text-sm font-semibold text-theme-darkViolet/60">{doc.subtitle}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-full border border-theme-lightViolet bg-theme-cream px-3.5 py-1.5 text-xs font-bold text-theme-darkViolet/65">
              <CalendarDays className="h-3.5 w-3.5 text-theme-lavender" />
              {t('legal.effectiveDate')}: {doc.effectiveDate}
            </div>
          </div>
        </header>

        <div className="mt-7 grid grid-cols-1 gap-7 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <div className="rounded-2xl border border-theme-lightViolet bg-white p-4 shadow-sm">
                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-wider text-theme-darkViolet/50">
                  {t('legal.onThisPage')}
                </p>
                <ul className="max-h-[55vh] space-y-1 overflow-y-auto pr-1">
                  {doc.sections.map((section) => (
                    <li key={section.id}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(section.id)}
                        className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold leading-5 text-theme-darkViolet/65 transition hover:bg-theme-lightViolet/60 hover:text-theme-lavender"
                      >
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-theme-lavender/25 bg-theme-lightViolet/40 p-4">
                <div className="mb-2 flex items-center gap-2 text-theme-darkViolet">
                  <LifeBuoy className="h-4 w-4 text-theme-lavender" />
                  <p className="text-xs font-extrabold">{t('legal.needHelp')}</p>
                </div>
                <p className="mb-3 text-xs leading-5 text-theme-darkViolet/60">{t('legal.needHelpText')}</p>
                <div className="space-y-2">
                  <Link to="/legal/grievance-officer" className="block text-xs font-bold text-theme-lavender hover:underline">
                    {t('legal.contactGrievance')}
                  </Link>
                  <Link to="/legal/data-request" className="block text-xs font-bold text-theme-lavender hover:underline">
                    {t('legal.requestData')}
                  </Link>
                </div>
              </div>

              <Link to="/legal" className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-darkViolet/55 hover:text-theme-lavender">
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('legal.backToLegal')}
              </Link>
            </div>
          </aside>

          <article className="min-w-0">
            <details className="mb-5 rounded-2xl border border-theme-lightViolet bg-white p-4 lg:hidden">
              <summary className="cursor-pointer text-xs font-extrabold uppercase tracking-wider text-theme-darkViolet/60">
                {t('legal.onThisPage')}
              </summary>
              <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                {doc.sections.map((section) => (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className="w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-theme-darkViolet/65 hover:bg-theme-lightViolet/60"
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </details>

            <div className="rounded-3xl border border-theme-lightViolet bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-8">
              <div className="space-y-7">
                {doc.sections.map((section) => (
                  <section key={section.id} id={`legal-section-${section.id}`} className="scroll-mt-28">
                    <h2 className="mb-3 text-lg font-extrabold text-theme-darkViolet sm:text-xl">{section.title}</h2>
                    <div className="space-y-3">
                      {section.blocks.map((block, index) => (
                        <LegalBlockRenderer key={index} block={block} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {doc.form && <LegalRequestForm kind={doc.form} />}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-theme-lightViolet/70 pt-5">
                <Link to="/legal" className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-darkViolet/55 hover:text-theme-lavender">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t('legal.backToLegal')}
                </Link>
                <Link to="/" className="text-xs font-bold text-theme-lavender hover:underline">
                  {t('legal.backHome')}
                </Link>
              </div>
            </div>
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
