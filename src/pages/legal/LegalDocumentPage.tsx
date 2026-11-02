import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { SiteFooter } from '../../components/SiteFooter';
import { LegalLayout } from '../../components/legal/LegalLayout';
import { getLegalDocument } from '../../content/legal';

export default function LegalDocumentPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const document = slug ? getLegalDocument(i18n.language, slug) : undefined;

  if (!document) {
    return (
      <div className="min-h-screen bg-theme-cream flex flex-col">
        <Navbar compact activePage="legal" />
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-3xl border border-theme-lightViolet bg-white p-8 text-center shadow-sm sm:p-12">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-theme-lightViolet text-theme-lavender">
              <FileQuestion className="h-7 w-7" />
            </span>
            <h1 className="text-2xl font-black text-theme-darkViolet">{t('legal.notFoundTitle')}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-theme-darkViolet/60">{t('legal.notFoundText')}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/legal"
                className="inline-flex items-center gap-1.5 rounded-full bg-theme-lavender px-4 py-2 text-sm font-bold text-white transition hover:bg-theme-darkViolet"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('legal.backToLegal')}
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-theme-lightViolet bg-theme-cream px-4 py-2 text-sm font-bold text-theme-darkViolet transition hover:border-theme-lavender"
              >
                {t('legal.backHome')}
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return <LegalLayout document={document} />;
}
