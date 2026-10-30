/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Sparkles } from 'lucide-react';

export interface ComingSoonContent {
  /** Menu-entry label, shown in the dropdown that opens this popup. */
  labelEn: string;
  labelMr: string;
  titleEn: string;
  titleMr: string;
  bodyEn: string;
  bodyMr: string;
  /** Feature icon shown in the animated centrepiece. */
  icon: React.ComponentType<{ className?: string }>;
}

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ComingSoonContent | null;
}

/**
 * "Coming soon" popup for menu entries that are planned but not built yet.
 * Rendered through a portal because the Navbar header uses `backdrop-filter`,
 * which would otherwise make `position: fixed` resolve against the header box
 * instead of the viewport.
 */
export function ComingSoonModal({ isOpen, onClose, content }: ComingSoonModalProps) {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !content) return null;
  const Icon = content.icon;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-theme-darkViolet/55 backdrop-blur-sm" onClick={onClose} />

      <div className="cs-pop relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="relative px-7 pt-9 pb-7 bg-gradient-to-br from-theme-lavender/10 via-theme-lightViolet/60 to-theme-wine/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-theme-darkViolet/40 hover:text-theme-darkViolet hover:bg-white/70 transition cursor-pointer"
            aria-label={t('comingSoon.close')}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Animated centrepiece: pulsing halo, spinning dashed ring, drifting icon */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="cs-glow absolute inset-1 rounded-full bg-gradient-to-br from-theme-lavender/50 to-theme-wine/40 blur-xl"></div>
            <div className="ring-dash absolute inset-0 rounded-full border-2 border-dashed border-theme-lavender/50"></div>
            <div className="absolute inset-4 rounded-full bg-white shadow-xl flex items-center justify-center">
              <Icon className="cs-float w-11 h-11 text-theme-lavender" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 mt-6 bg-theme-gold/25 text-theme-darkViolet px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> {t('comingSoon.badge')}
          </span>
        </div>

        <div className="px-7 pt-6 pb-7">
          <h3 className="text-xl font-extrabold text-theme-darkViolet leading-snug">
            {isMr ? content.titleMr : content.titleEn}
          </h3>
          <p className="text-sm text-theme-darkViolet/65 mt-2.5 leading-relaxed">
            {isMr ? content.bodyMr : content.bodyEn}
          </p>
          <button
            onClick={onClose}
            className="btn-gloss mt-6 w-full bg-theme-lavender text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-theme-darkViolet transition-all shadow-md shadow-theme-lavender/30 cursor-pointer"
          >
            {t('comingSoon.gotIt')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
