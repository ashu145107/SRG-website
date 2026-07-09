/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MappingItem {
  value: number;
  labelEn: string;
  labelMr: string;
}

export const educations: MappingItem[] = [
  { value: 1, labelEn: 'High School / 10th-12th', labelMr: 'माध्यमिक / उच्च माध्यमिक' },
  { value: 2, labelEn: 'Diploma', labelMr: 'डिप्लोमा' },
  { value: 3, labelEn: "Bachelor's Degree", labelMr: 'पदवी (Graduate)' },
  { value: 4, labelEn: "Master's Degree", labelMr: 'पदव्युत्तर पदवी (Post Graduate)' },
  { value: 5, labelEn: 'Doctorate / PhD', labelMr: 'विद्यावाचस्पती (PhD)' },
];

export const roleTypes: MappingItem[] = [
  { value: 1, labelEn: 'Full-time', labelMr: 'पूर्ण वेळ' },
  { value: 2, labelEn: 'Part-time', labelMr: 'अर्धा वेळ' },
  { value: 3, labelEn: 'Contract', labelMr: 'कंत्राटी' },
  { value: 4, labelEn: 'Internship', labelMr: 'इंटर्नशिप' },
];

export const interviewModes: MappingItem[] = [
  { value: 1, labelEn: 'Face-to-Face / In-person', labelMr: 'प्रत्यक्ष मुलाखत' },
  { value: 2, labelEn: 'Telephonic', labelMr: 'फोनवर मुलाखत' },
  { value: 3, labelEn: 'Virtual / Online Video', labelMr: 'ऑनलाईन व्हिडिओ' },
];

export const shiftTypes: MappingItem[] = [
  { value: 1, labelEn: 'Day Shift', labelMr: 'दिवसाची पाळी' },
  { value: 2, labelEn: 'Night Shift', labelMr: 'रात्रीची पाळी' },
  { value: 3, labelEn: 'Rotational Shift', labelMr: 'बदलती पाळी' },
];

export const workModes: MappingItem[] = [
  { value: 1, labelEn: 'On-site / Office', labelMr: 'कार्यालयातून' },
  { value: 2, labelEn: 'Hybrid', labelMr: 'हायब्रिड' },
  { value: 3, labelEn: 'Remote / Work From Home', labelMr: 'घरी बसून काम' },
];

export const salaryPeriods: MappingItem[] = [
  { value: 1, labelEn: 'per Month', labelMr: 'दरमहा' },
  { value: 2, labelEn: 'per Week', labelMr: 'दर आठवड्याला' },
  { value: 3, labelEn: 'per Hour', labelMr: 'प्रति तास' },
  { value: 4, labelEn: 'per Year', labelMr: 'वार्षिक' },
];

export const weeklyOffs: MappingItem[] = [
  { value: 1, labelEn: 'Sunday', labelMr: 'रविवार' },
  { value: 2, labelEn: 'Saturday', labelMr: 'शनिवार' },
  { value: 3, labelEn: 'Saturday & Sunday', labelMr: 'शनिवार आणि रविवार' },
  { value: 4, labelEn: 'Rotational / Flexible', labelMr: 'बदलती सुट्टी' },
];

export const specializations: MappingItem[] = [
  { value: 1, labelEn: 'Information Technology / IT', labelMr: 'माहिती तंत्रज्ञान (IT)' },
  { value: 2, labelEn: 'Mechanical / Civil Engineering', labelMr: 'अभियांत्रिकी (Engg)' },
  { value: 3, labelEn: 'Finance & Accounting', labelMr: 'वित्त आणि लेखा' },
  { value: 4, labelEn: 'Healthcare & Nursing', labelMr: 'आरोग्य सेवा' },
  { value: 5, labelEn: 'General Administration', labelMr: 'सामान्य प्रशासन' },
  { value: 6, labelEn: 'Agriculture & Food Processing', labelMr: 'कृषी आणि अन्न प्रक्रिया' },
  { value: 7, labelEn: 'Retail, Sales & Marketing', labelMr: 'विक्री आणि विपणन' },
];

export const getLabel = (mappings: MappingItem[], value: number, lang: 'mr' | 'en' = 'en'): string => {
  const item = mappings.find(m => m.value === Number(value));
  if (!item) return `Unknown (${value})`;
  return lang === 'mr' ? item.labelMr : item.labelEn;
};
