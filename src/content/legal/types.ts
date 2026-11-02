export type LegalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'subheading'; text: string }
  | { type: 'callout'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] };

export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export type LegalDocKey =
  | 'privacy'
  | 'termsCandidate'
  | 'termsEmployer'
  | 'consent'
  | 'disclaimer'
  | 'cookies'
  | 'codeOfConduct'
  | 'grievance'
  | 'dataRequest';

export interface LegalDocument {
  slug: string;
  title: string;
  subtitle: string;
  effectiveDate: string;
  form?: 'dsar' | 'grievance';
  sections: LegalSection[];
}

export type LegalContent = Record<LegalDocKey, LegalDocument>;

export const LEGAL_DOC_KEYS: LegalDocKey[] = [
  'privacy',
  'termsCandidate',
  'termsEmployer',
  'consent',
  'disclaimer',
  'cookies',
  'codeOfConduct',
  'grievance',
  'dataRequest',
];
