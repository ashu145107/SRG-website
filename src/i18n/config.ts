/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './en.json';
import mrTranslation from './mr.json';

const savedLanguage = localStorage.getItem('app_lang') || 'mr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      mr: {
        translation: mrTranslation,
      },
    },
    lng: savedLanguage,
    fallbackLng: 'mr',
    interpolation: {
      escapeValue: false, // React already safeguards against XSS
    },
  });

export default i18n;
