import { enLegal } from './en';
import { mrLegal } from './mr';
import { LegalContent, LegalDocKey, LegalDocument } from './types';

export type LegalLang = 'en' | 'mr';

const legalByLang: Record<LegalLang, LegalContent> = {
  en: enLegal,
  mr: mrLegal,
};

export function getLegalContent(lang: string = 'en'): LegalContent {
  const l = (lang === 'mr' ? 'mr' : 'en') as LegalLang;
  return legalByLang[l];
}

export function getLegalDocument(lang: string, slug: string): LegalDocument | undefined {
  const content = getLegalContent(lang);
  const key = Object.keys(content).find((k) => content[k as LegalDocKey].slug === slug) as
    | LegalDocKey
    | undefined;
  if (!key) return undefined;
  return content[key];
}

export function getLegalDocumentByKey(lang: string, key: LegalDocKey): LegalDocument {
  return getLegalContent(lang)[key];
}

export { enLegal, mrLegal };
export * from './types';
