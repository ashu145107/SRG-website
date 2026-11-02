import { LegalContent } from './types';

export const enLegal: LegalContent = {
  privacy: {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    subtitle: 'Dindoree Pranit Job Portal',
    effectiveDate: '2 November 2026',
    sections: [
      {
        id: 'about',
        title: '1. About Us',
        blocks: [
          {
            type: 'paragraph',
            text: 'Dindoree Pranit Seva Marg Foundation ("the Foundation", "we", "us", or "our") is a charitable trust with its registered office at Dindori, Nashik District, Maharashtra.',
          },
          {
            type: 'paragraph',
            text: 'We operate the Dindoree Pranit Job Portal ("the Platform") as part of our Swayamrojgar Vibhag activities to support Self-Help Groups, rural women, and job-seekers.',
          },
          {
            type: 'paragraph',
            text: 'For the purposes of the Digital Personal Data Protection Act, 2023 ("DPDP Act"), the Foundation is the Data Fiduciary in respect of the personal data processed through the Platform.',
          },
        ],
      },
      {
        id: 'data-we-collect',
        title: '2. What Data We Collect',
        blocks: [
          { type: 'paragraph', text: 'Depending on how you use the Platform, we may collect the following categories of personal data:' },
          {
            type: 'table',
            headers: ['Category', 'Examples'],
            rows: [
              ['Identity', 'Name, mobile number, email address, date of birth, gender'],
              ['Profile', 'Education, qualifications, work experience, skills, preferences, language'],
              ['Location', 'State, district, taluka, city or village, pincode'],
              ['Documents', 'Resume, certifications, ID proofs, employer KYC documents'],
              ['Usage', 'Searches, applications, page views, interactions'],
              ['Technical', 'IP address, device type, browser details collected through cookies'],
            ],
          },
        ],
      },
      {
        id: 'purposes',
        title: '3. Why We Collect It',
        blocks: [
          { type: 'paragraph', text: 'We use personal data only for clear and lawful purposes, including:' },
          {
            type: 'list',
            items: [
              'To create and manage your account.',
              'To match Candidates with relevant job opportunities.',
              'To allow Employers to find suitable Candidates, only with your consent.',
              'To verify Employer legitimacy through KYC.',
              'To prevent fraud, spam, and abuse.',
              'To communicate with you as per your consent.',
              'To comply with legal obligations.',
            ],
          },
        ],
      },
      {
        id: 'lawful-basis',
        title: '4. Lawful Basis for Processing',
        blocks: [
          { type: 'paragraph', text: 'We process personal data on the following bases under the DPDP Act, 2023:' },
          {
            type: 'list',
            items: [
              'Consent under Section 6 — our primary basis. You choose what to share through granular consents.',
              'Legitimate uses such as fraud prevention and platform security, to the extent permitted by law.',
              'Legal obligations such as audit and regulatory requirements.',
            ],
          },
        ],
      },
      {
        id: 'consent',
        title: '5. How We Use Consent',
        blocks: [
          {
            type: 'paragraph',
            text: 'We ask for separate, specific consent for each purpose through individual checkboxes — not a single blanket agreement. You can give only the consents you are comfortable with.',
          },
          {
            type: 'paragraph',
            text: 'Your profile is shared with Employers only if you grant that specific consent. You can withdraw any consent at any time from your account settings, without affecting the lawfulness of processing already done.',
          },
        ],
      },
      {
        id: 'sharing',
        title: '6. Who We Share Data With',
        blocks: [
          { type: 'paragraph', text: 'We share personal data only as follows:' },
          {
            type: 'list',
            items: [
              'Verified Employers — only with your specific consent, and only for genuine recruitment.',
              'Service providers — bound by data-processing undertakings, including IT volunteers who help operate the Platform.',
              'Regulators or authorities — only when legally required.',
            ],
          },
          {
            type: 'callout',
            text: 'We do not sell, rent, or trade your personal data, and we do not use it for third-party advertising or marketing.',
          },
        ],
      },
      {
        id: 'retention',
        title: '7. How Long We Keep Data',
        blocks: [
          { type: 'paragraph', text: 'We keep data only as long as necessary. Key periods are:' },
          {
            type: 'list',
            items: [
              'Active accounts: while the account remains active.',
              'Inactive accounts: anonymised three years after the last activity.',
              'Employer KYC documents: seven years, as required for regulatory purposes.',
              'Audit logs: seven years.',
            ],
          },
        ],
      },
      {
        id: 'your-rights',
        title: '8. Your Rights',
        blocks: [
          { type: 'paragraph', text: 'Under Sections 11 to 14 of the DPDP Act, 2023, you have the right to:' },
          {
            type: 'list',
            items: [
              'Access — get a summary of the personal data we hold about you.',
              'Correction — fix inaccurate or outdated data.',
              'Erasure — request deletion of your data, subject to legal retention requirements.',
              'Withdraw consent — at any time, from your account settings.',
              'Nominate — appoint a person to exercise your rights in case of death or incapacity.',
              'Grievance — raise a complaint with our Grievance Officer.',
              'Escalate — approach the Data Protection Board of India if you are unsatisfied.',
            ],
          },
          { type: 'paragraph', text: 'To exercise these rights, use the Data Request form available on the Platform.' },
        ],
      },
      {
        id: 'security',
        title: '9. How We Protect Your Data',
        blocks: [
          {
            type: 'paragraph',
            text: 'We take reasonable security safeguards as required by Section 8(5) of the DPDP Act, 2023, including encryption (HTTPS/TLS), access control, multi-factor authentication for staff, audit logging, and training for everyone who handles data.',
          },
          {
            type: 'paragraph',
            text: 'While we take strong measures, no system is completely immune. We act promptly on any incident under our Breach Notification Plan.',
          },
        ],
      },
      {
        id: 'children',
        title: '10. Children',
        blocks: [
          {
            type: 'paragraph',
            text: 'The Platform is for users aged 18 and above. We do not knowingly process the personal data of children. Registration is blocked for anyone under 18, consistent with Section 9 of the DPDP Act, 2023.',
          },
        ],
      },
      {
        id: 'cookies',
        title: '11. Cookies',
        blocks: [
          {
            type: 'paragraph',
            text: 'We use cookies as described in our separate Cookie Policy. You can control non-essential cookies through the cookie banner and settings.',
          },
        ],
      },
      {
        id: 'changes',
        title: '12. Changes to This Policy',
        blocks: [
          {
            type: 'paragraph',
            text: 'We may update this Privacy Policy from time to time. We will notify you of material changes by email or through the Platform, and where required we will seek fresh consent. The latest version, with its effective date, is always available on this page.',
          },
        ],
      },
      {
        id: 'language',
        title: '13. Language',
        blocks: [
          {
            type: 'paragraph',
            text: 'This Policy is available in Marathi and English. In case of any conflict, the version required by applicable law will prevail.',
          },
        ],
      },
      {
        id: 'contact',
        title: '14. Contact',
        blocks: [
          {
            type: 'table',
            headers: ['Purpose', 'Contact'],
            rows: [
              ['Privacy queries', 'admin@dindoripranit.org'],
              ['Grievances', 'admin@dindoripranit.org'],
              ['Phone', '+91 7755941753 / +91 8956741109'],
              ['Postal address', 'Dindoree Pranit Seva Marg Foundation, Dindori, Nashik District, Maharashtra'],
              ['Working hours', '10:00 AM – 7:00 PM, Monday to Saturday'],
            ],
          },
          {
            type: 'paragraph',
            text: 'By using the Platform, you acknowledge that you have read and understood this Privacy Policy.',
          },
        ],
      },
    ],
  },

  termsCandidate: {
    slug: 'terms-candidate',
    title: 'Terms of Use — Candidate',
    subtitle: 'Dindoree Pranit Job Portal',
    effectiveDate: '2 November 2026',
    sections: [
      {
        id: 'about',
        title: '1. About This Document',
        blocks: [
          {
            type: 'paragraph',
            text: 'The Dindoree Pranit Job Portal is operated by Dindoree Pranit Seva Marg Foundation, a charitable trust with its office at Dindori, Nashik District, Maharashtra.',
          },
          {
            type: 'paragraph',
            text: '"You" or "Candidate" means any person who registers on the Platform to look for employment, skill training, or livelihood opportunities.',
          },
          {
            type: 'paragraph',
            text: '"Employer" means any organisation or individual registered on the Platform to post job listings. "Profile" means the personal details, resume, and qualifications you provide on the Platform.',
          },
        ],
      },
      {
        id: 'eligibility',
        title: '2. Who Can Register',
        blocks: [
          { type: 'paragraph', text: 'You must be at least 18 years old to register. By registering, you confirm that you are 18 or above.' },
          { type: 'paragraph', text: 'You must be legally eligible to work or seek work in India.' },
          { type: 'paragraph', text: 'Each person may have only one Candidate account.' },
        ],
      },
      {
        id: 'key-points',
        title: '3. Three Things You Must Know',
        blocks: [
          { type: 'subheading', text: 'No job guarantee' },
          {
            type: 'paragraph',
            text: 'This Platform connects you with Employers — it does not place you in a job. All hiring decisions are made by the Employer alone. The Foundation is a facilitator, not a placement agency, and gives no guarantee of employment, interview, or shortlisting.',
          },
          { type: 'subheading', text: 'This Platform is free for you' },
          {
            type: 'paragraph',
            text: 'The Foundation charges no fee from Candidates at any stage. No Employer on this Platform is permitted to charge you a fee or deposit for applying or getting hired. If anyone asks you for money claiming to be from the Foundation or a listed Employer, report it immediately to the Grievance Officer.',
          },
          { type: 'subheading', text: 'Your data is never sold' },
          {
            type: 'paragraph',
            text: 'The Foundation does not sell, rent, or use your personal data for marketing or commercial purposes. Your information is used only to match you with relevant job opportunities as described in the Consent Form and Privacy Policy.',
          },
        ],
      },
      {
        id: 'account',
        title: '4. Your Account',
        blocks: [
          {
            type: 'paragraph',
            text: 'You must provide accurate, true, and complete information when registering. Providing false information may result in your account being permanently suspended.',
          },
          { type: 'paragraph', text: 'Keep your login details private. Do not share your password with anyone.' },
          { type: 'paragraph', text: 'Update your information whenever it changes so that your profile stays current.' },
          { type: 'paragraph', text: 'If you think someone else has accessed your account, contact the Grievance Officer immediately.' },
        ],
      },
      {
        id: 'conduct',
        title: '5. What You Can and Cannot Do',
        blocks: [
          { type: 'paragraph', text: 'You may use the Platform only to seek employment or livelihood opportunities for yourself.' },
          { type: 'paragraph', text: 'You must not:' },
          {
            type: 'list',
            items: [
              'Submit applications on behalf of someone else without their written permission.',
              'Upload false, misleading, or fake documents or qualifications.',
              'Attempt to copy or extract data from the Platform by automated tools.',
              'Upload harmful software, viruses, or malicious code.',
              'Harass, threaten, or abuse any person through the Platform.',
              'Impersonate any other person or organisation.',
              'Use the Platform for any activity that violates Indian law.',
            ],
          },
        ],
      },
      {
        id: 'privacy',
        title: '6. Your Data and Privacy',
        blocks: [
          {
            type: 'paragraph',
            text: 'You own your personal data. You give the Foundation only a limited permission to use it for the purposes described in the Privacy Policy and Consent Form.',
          },
          { type: 'paragraph', text: 'Your Profile will only be shown to Employers if you give specific consent for that. You control this from your account settings.' },
          { type: 'paragraph', text: 'You can withdraw consent at any time from your account settings.' },
          { type: 'paragraph', text: 'You can request to see, correct, or delete your data through the Data Request form on the Platform.' },
          { type: 'paragraph', text: 'All documents and qualifications you upload must be genuine and belong to you.' },
        ],
      },
      {
        id: 'applying',
        title: '7. Applying for Jobs',
        blocks: [
          { type: 'paragraph', text: 'Submitting an application does not guarantee any response, interview, or offer.' },
          { type: 'paragraph', text: 'The Foundation does not verify the accuracy of every job listing. Use your own judgement when applying.' },
          { type: 'paragraph', text: 'Never pay a fee to any Employer in connection with an application made through this Platform.' },
        ],
      },
      {
        id: 'termination',
        title: '8. Suspension and Termination',
        blocks: [
          {
            type: 'paragraph',
            text: 'If you violate these Terms, provide false information, or misuse the Platform, your account may be suspended or terminated without prior notice.',
          },
          { type: 'paragraph', text: 'You can deactivate your account at any time through account settings or by writing to the Grievance Officer.' },
        ],
      },
      {
        id: 'grievance',
        title: '9. Grievance Officer Contact',
        blocks: [
          { type: 'paragraph', text: 'If you have a complaint or question about your data, contact:' },
          {
            type: 'table',
            headers: ['Channel', 'Details'],
            rows: [
              ['Email', 'admin@dindoripranit.org'],
              ['Phone', '+91 7755941753 / +91 8956741109 (Monday to Saturday, 10 AM – 7 PM)'],
              ['Post', 'Grievance Officer, Dindoree Pranit Seva Marg Foundation, Dindori, Nashik District, Maharashtra'],
            ],
          },
          { type: 'paragraph', text: 'Your complaint will be acknowledged within 24 hours and resolved within 15 days.' },
        ],
      },
      {
        id: 'governing-law',
        title: '10. Governing Law',
        blocks: [
          {
            type: 'paragraph',
            text: 'These Terms are governed by Indian law. Any disputes will be resolved through the Grievance Officer first. If unresolved, the courts at Nashik, Maharashtra will have jurisdiction.',
          },
          {
            type: 'paragraph',
            text: 'By clicking "I Agree" or registering on the Platform, you confirm that you have read and accept these Terms in full.',
          },
        ],
      },
    ],
  },

  termsEmployer: {
    slug: 'terms-employer',
    title: 'Terms of Use — Employer',
    subtitle: 'Dindoree Pranit Job Portal',
    effectiveDate: '2 November 2026',
    sections: [
      {
        id: 'about',
        title: '1. About This Document',
        blocks: [
          {
            type: 'paragraph',
            text: 'The Dindoree Pranit Job Portal is operated by Dindoree Pranit Seva Marg Foundation, Dindori, Nashik District, Maharashtra.',
          },
          {
            type: 'paragraph',
            text: '"Employer" or "You" means any company, firm, NGO, Self-Help Group, individual, or government body that registers to post job listings.',
          },
          { type: 'paragraph', text: '"Candidate" means any individual registered on the Platform seeking employment.' },
          {
            type: 'paragraph',
            text: '"Verified Employer" means an Employer who has completed the Foundation\'s KYC verification process. "Job Listing" means any vacancy or opportunity you advertise through the Platform.',
          },
        ],
      },
      {
        id: 'key-points',
        title: '2. Three Things All Employers Must Know',
        blocks: [
          { type: 'subheading', text: 'Never charge Candidates' },
          {
            type: 'paragraph',
            text: 'You must not charge any fee, deposit, or payment from Candidates at any stage of the hiring process — application, interview, selection, or joining. Any Employer found demanding fees from Candidates will be immediately removed from the Platform and reported to the relevant authorities.',
          },
          { type: 'subheading', text: 'Use Candidate data only for recruitment' },
          {
            type: 'paragraph',
            text: 'Candidate data shared with you through the Platform is for recruitment purposes only. You must not sell it, share it with third parties, or use it for marketing, advertising, or any other commercial purpose.',
          },
          { type: 'subheading', text: 'Post only genuine listings' },
          {
            type: 'paragraph',
            text: 'Only post real, currently available vacancies. Fake or misleading listings will result in immediate account termination.',
          },
        ],
      },
      {
        id: 'kyc',
        title: '3. Employer Verification (KYC)',
        blocks: [
          { type: 'paragraph', text: 'To post listings, you must complete KYC verification by submitting:' },
          {
            type: 'list',
            items: [
              'GST Registration Certificate or PAN Card.',
              'Certificate of Incorporation, Registration Certificate, Shop Act licence, or Partnership Deed, as applicable.',
              'Address proof of your registered or operating office.',
              'ID proof of the authorised signatory.',
            ],
          },
          { type: 'paragraph', text: 'Unverified accounts cannot post live listings.' },
          {
            type: 'paragraph',
            text: 'The Foundation may suspend or revoke your account if verification fails or your conduct violates these Terms.',
          },
          { type: 'paragraph', text: 'KYC documents will be kept securely for seven years as required by law.' },
        ],
      },
      {
        id: 'postings',
        title: '4. What You Can and Cannot Post',
        blocks: [
          {
            type: 'paragraph',
            text: 'All Job Listings must be genuine, lawful, and accurately describe the role, location, pay, and requirements.',
          },
          { type: 'paragraph', text: 'You must not post listings that:' },
          {
            type: 'list',
            items: [
              'Pay below the applicable Minimum Wage notified by the Government of Maharashtra.',
              'Involve bonded labour, forced labour, or human trafficking.',
              'Seek to hire persons under 18 years of age.',
              'Discriminate on grounds of religion, caste, sex, gender, disability, or region.',
              'Require candidates to pay a fee or deposit.',
              'Are fictitious, already filled, or posted only to collect data.',
              'Contain false information about salary, location, or the organisation.',
            ],
          },
        ],
      },
      {
        id: 'obligations',
        title: '5. Employer Obligations',
        blocks: [
          { type: 'paragraph', text: 'You must comply with all applicable Indian labour laws for persons hired through the Platform.' },
          { type: 'paragraph', text: 'You must respond to Candidate applications within a reasonable time.' },
          {
            type: 'paragraph',
            text: 'You must use Candidate data only for the specific recruitment purpose and must not share it with any third party.',
          },
          { type: 'paragraph', text: 'You must delete Candidate data once the vacancy is filled or the recruitment process ends.' },
          {
            type: 'paragraph',
            text: 'If your organisation employs 10 or more people, you confirm that you have constituted an Internal Complaints Committee (ICC) under the POSH Act, 2013.',
          },
          {
            type: 'paragraph',
            text: 'If you become aware of any data breach involving Candidate data from the Platform, notify the Foundation\'s Grievance Officer within 48 hours.',
          },
        ],
      },
      {
        id: 'ethical-hiring',
        title: '6. Ethical Hiring Undertaking',
        blocks: [
          { type: 'paragraph', text: 'By accepting these Terms, you confirm that:' },
          {
            type: 'list',
            items: [
              'All listings you post represent real, currently available vacancies.',
              'Pay offered meets or exceeds the applicable Minimum Wage.',
              'No fee will be charged to Candidates at any stage.',
              'Your recruitment process is free from discrimination and harassment.',
              'Successful Candidates will receive written offer letters and employment contracts.',
              'Candidate data will be used only for recruitment and deleted when no longer needed.',
            ],
          },
        ],
      },
      {
        id: 'termination',
        title: '7. Suspension and Termination',
        blocks: [
          {
            type: 'paragraph',
            text: 'The Foundation may suspend or terminate your account immediately for posting fake listings, charging Candidates, misusing Candidate data, or any violation of these Terms.',
          },
          { type: 'paragraph', text: 'On termination, you must delete all Candidate data in your possession within 30 days.' },
        ],
      },
      {
        id: 'liability',
        title: '8. Your Liability',
        blocks: [
          { type: 'paragraph', text: 'You are responsible for the accuracy of your listings and your conduct during recruitment.' },
          {
            type: 'paragraph',
            text: 'You will compensate the Foundation for any loss, penalty, or legal cost caused by your violation of these Terms.',
          },
        ],
      },
      {
        id: 'grievance',
        title: '9. Grievance Officer Contact',
        blocks: [
          {
            type: 'table',
            headers: ['Channel', 'Details'],
            rows: [
              ['Email', 'admin@dindoripranit.org'],
              ['Phone', '+91 7755941753 / +91 8956741109 (Monday to Saturday, 10 AM – 7 PM)'],
              ['Post', 'Grievance Officer, Dindoree Pranit Seva Marg Foundation, Dindori, Nashik District, Maharashtra'],
            ],
          },
        ],
      },
      {
        id: 'governing-law',
        title: '10. Governing Law',
        blocks: [
          {
            type: 'paragraph',
            text: 'These Terms are governed by Indian law. Courts at Nashik, Maharashtra have jurisdiction.',
          },
          {
            type: 'paragraph',
            text: 'By clicking "I Agree", you confirm that your organisation has read, understood, and accepts these Terms in full.',
          },
        ],
      },
    ],
  },

  consent: {
    slug: 'consent-forms',
    title: 'Consent Forms',
    subtitle: 'Candidate & Employer — DPDP Act 2023 Compliant',
    effectiveDate: '2 November 2026',
    sections: [
      {
        id: 'intro',
        title: 'Important — Please Read First',
        blocks: [
          { type: 'paragraph', text: 'This Platform does not guarantee employment. All hiring decisions are made by Employers.' },
          { type: 'paragraph', text: 'This Platform is free for Candidates. No one is permitted to charge you any fee for using it.' },
          { type: 'paragraph', text: 'Your data is never sold or used for marketing. It is used only to match you with relevant jobs.' },
        ],
      },
      {
        id: 'candidate',
        title: 'Part A — Candidate Consent Form',
        blocks: [
          { type: 'subheading', text: 'Consent 1 — Account creation' },
          {
            type: 'paragraph',
            text: 'I consent to the collection of my name, mobile number, email, date of birth, gender, and district for creating and maintaining my account.',
          },
          { type: 'subheading', text: 'Consent 2 — Detailed profile and resume' },
          {
            type: 'paragraph',
            text: 'I consent to storing my education, work experience, skills, certifications, and resume for building my job-seeker profile.',
          },
          { type: 'subheading', text: 'Consent 3 — Sharing profile with verified Employers' },
          {
            type: 'paragraph',
            text: 'I consent to my profile being visible to Verified Employers whose listings match my profile.',
          },
          { type: 'subheading', text: 'Consent 4 — Submitting job applications' },
          {
            type: 'paragraph',
            text: 'I consent to my profile and resume being sent to a specific Employer when I click "Apply" on their listing.',
          },
          { type: 'subheading', text: 'Consent 5 — Identity verification (optional)' },
          {
            type: 'paragraph',
            text: 'I consent to sharing Aadhaar (last four digits only) or PAN with the Foundation\'s verification team to receive a "Verified Candidate" badge.',
          },
          { type: 'subheading', text: 'Consent 6 — Transactional communications' },
          {
            type: 'paragraph',
            text: 'I consent to receiving messages about my account activity — such as application updates, login OTPs, and policy change notices — by SMS and email.',
          },
          { type: 'subheading', text: 'Consent 7 — Job alerts (optional)' },
          {
            type: 'paragraph',
            text: 'I consent to receiving job alerts matching my preferences, by SMS and email.',
          },
          { type: 'subheading', text: 'Consent 8 — Platform improvement analytics (optional)' },
          {
            type: 'paragraph',
            text: 'I consent to anonymised analysis of my usage patterns, such as pages visited and searches made, to help improve the Platform.',
          },
          { type: 'subheading', text: 'How to withdraw consent' },
          {
            type: 'paragraph',
            text: 'Go to Account Settings → Privacy & Consents → click "Withdraw" next to any consent. Withdrawal does not undo processing already done. To ask questions, contact admin@dindoripranit.org.',
          },
        ],
      },
      {
        id: 'employer',
        title: 'Part B — Employer Consent Form',
        blocks: [
          { type: 'subheading', text: 'Consent 1 — Organisation registration and KYC' },
          {
            type: 'paragraph',
            text: 'I consent, on behalf of the organisation, to collection and processing of our registration details, GST or PAN, Shop Act or other documents, and KYC documents for verifying our eligibility to post listings.',
          },
          { type: 'subheading', text: 'Consent 2 — Job listing publication' },
          {
            type: 'paragraph',
            text: 'I consent to our Job Listings — including organisation name, job details, location, and salary range — being published and visible to registered Candidates.',
          },
          { type: 'subheading', text: 'Consent 3 — Access to Candidate profiles' },
          {
            type: 'paragraph',
            text: 'I consent to accessing Candidate profiles for the sole purpose of evaluating applicants for our specific, currently listed vacancies. Candidate data accessed through this Platform must not be used for any other purpose, sold, or shared with third parties.',
          },
          { type: 'subheading', text: 'Consent 4 — Transactional communications' },
          {
            type: 'paragraph',
            text: 'I consent to receiving account alerts, application notifications, KYC status updates, and policy notices.',
          },
          { type: 'subheading', text: 'Consent 5 — Platform updates (optional)' },
          {
            type: 'paragraph',
            text: 'I consent to receiving newsletters and informational updates from the Foundation.',
          },
          { type: 'subheading', text: 'Employer declaration' },
          {
            type: 'list',
            items: [
              'All information provided is accurate and genuine.',
              'We will not charge any fee from Candidates at any stage.',
              'We will use Candidate data only for recruitment purposes and delete it when no longer needed.',
              'We accept the Employer Terms and Conditions in full.',
            ],
          },
        ],
      },
    ],
  },

  disclaimer: {
    slug: 'disclaimer',
    title: 'Disclaimer',
    subtitle: 'Public-Facing Page — Dindoree Pranit Job Portal',
    effectiveDate: '2 November 2026',
    sections: [
      {
        id: 'facilitator',
        title: '1. We Are a Facilitator, Not an Employer',
        blocks: [
          {
            type: 'paragraph',
            text: 'Dindoree Pranit Seva Marg Foundation ("the Foundation") operates the Dindoree Pranit Job Portal only as a neutral platform that connects job-seekers ("Candidates") with organisations offering work ("Employers"). The Foundation is not the employer of any Candidate and is not a recruitment or placement agency.',
          },
          {
            type: 'paragraph',
            text: 'The Foundation does not employ, engage, or place any Candidate. Any employment relationship is solely between the Candidate and the Employer.',
          },
        ],
      },
      {
        id: 'no-guarantee',
        title: '2. No Guarantee of Employment',
        blocks: [
          {
            type: 'paragraph',
            text: 'Registering, creating a profile, or applying through the Platform does not guarantee any interview, job offer, employment, wage, or any specific outcome.',
          },
          {
            type: 'paragraph',
            text: 'The Foundation gives no assurance that any Candidate will be hired or that any Employer will fill a vacancy.',
          },
        ],
      },
      {
        id: 'no-verification',
        title: '3. We Do Not Verify Every Listing or Profile',
        blocks: [
          {
            type: 'paragraph',
            text: 'While the Foundation verifies Employers through a KYC process, it does not independently guarantee the accuracy, legality, or genuineness of every job listing, salary figure, or Candidate profile on the Platform.',
          },
          {
            type: 'paragraph',
            text: 'Candidates and Employers must exercise their own judgement and due diligence before acting on any listing, application, or communication.',
          },
        ],
      },
      {
        id: 'no-fees',
        title: '4. No Fees from Candidates',
        blocks: [
          {
            type: 'paragraph',
            text: 'The Foundation never charges Candidates. No Employer or third party is authorised to demand any fee, deposit, or payment from a Candidate in connection with the Platform. Any such demand should be reported to the Grievance Officer and must not be paid.',
          },
        ],
      },
      {
        id: 'third-party',
        title: '5. Third-Party Content and Links',
        blocks: [
          {
            type: 'paragraph',
            text: 'The Platform may contain information supplied by Employers or links to third-party websites. The Foundation is not responsible for third-party content, and inclusion does not imply endorsement.',
          },
        ],
      },
      {
        id: 'liability',
        title: '6. Limitation of Liability',
        blocks: [
          {
            type: 'paragraph',
            text: 'To the maximum extent permitted by law, the Foundation is not liable for any loss, damage, or harm arising from any employment decision; any fraud or misrepresentation by an Employer or Candidate; reliance on any listing or profile; or any interruption of the Platform.',
          },
          {
            type: 'paragraph',
            text: 'Nothing in this Disclaimer excludes any liability that cannot be excluded under applicable Indian law.',
          },
        ],
      },
      {
        id: 'informational',
        title: '7. Informational Purpose',
        blocks: [
          {
            type: 'paragraph',
            text: 'Information on the Platform is provided for general informational purposes and does not constitute legal, financial, or career advice.',
          },
        ],
      },
      {
        id: 'governing-law',
        title: '8. Governing Law',
        blocks: [
          {
            type: 'paragraph',
            text: 'This Disclaimer is governed by the laws of India. Courts at Nashik, Maharashtra have jurisdiction. This Disclaimer should be read together with the Terms of Use and Privacy Policy.',
          },
          {
            type: 'paragraph',
            text: 'By using the Platform, you confirm that you have read and understood this Disclaimer.',
          },
        ],
      },
    ],
  },

  cookies: {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    subtitle: 'Dindoree Pranit Job Portal',
    effectiveDate: '2 November 2026',
    sections: [
      {
        id: 'what-are-cookies',
        title: '1. What Are Cookies',
        blocks: [
          {
            type: 'paragraph',
            text: 'Cookies are small text files stored on your device when you visit a website. They help the website work properly, remember your preferences, and understand how the site is used.',
          },
        ],
      },
      {
        id: 'types',
        title: '2. Types of Cookies We Use',
        blocks: [
          {
            type: 'table',
            headers: ['Type', 'What it does', 'Control'],
            rows: [
              ['Essential', 'Needed for login, security, and core functions.', 'Always on'],
              ['Preference', 'Remembers your language (Marathi or English) and settings.', 'Optional'],
              ['Analytics', 'Helps us understand usage to improve the Platform, in an anonymised form.', 'Optional'],
            ],
          },
        ],
      },
      {
        id: 'no-sale',
        title: '3. We Do Not Use Cookies to Sell Your Data',
        blocks: [
          {
            type: 'paragraph',
            text: 'We do not use cookies to sell your data or to build advertising profiles. We do not allow third-party advertising networks to track you through our Platform.',
          },
        ],
      },
      {
        id: 'choices',
        title: '4. Your Choices',
        blocks: [
          {
            type: 'paragraph',
            text: 'When you first visit, a cookie banner lets you accept or decline non-essential cookies.',
          },
          { type: 'paragraph', text: 'Essential cookies are always on, because the Platform cannot work without them.' },
          { type: 'paragraph', text: 'You can change your cookie choices at any time through the cookie settings link in the footer.' },
          {
            type: 'paragraph',
            text: 'You can also clear or block cookies through your browser settings, though some features may stop working.',
          },
        ],
      },
      {
        id: 'updates',
        title: '5. Updates to This Policy',
        blocks: [
          {
            type: 'paragraph',
            text: 'We may update this Cookie Policy from time to time. The latest version will always be available on this page with its effective date.',
          },
        ],
      },
      {
        id: 'contact',
        title: '6. Contact',
        blocks: [
          {
            type: 'paragraph',
            text: 'Questions about cookies or privacy? Contact the Grievance Officer at admin@dindoripranit.org or call +91 7755941753.',
          },
        ],
      },
    ],
  },

  codeOfConduct: {
    slug: 'code-of-conduct',
    title: 'Code of Conduct',
    subtitle: 'For All Staff, Volunteers & Representatives',
    effectiveDate: '2 November 2026',
    sections: [
      {
        id: 'principle',
        title: '1. Our Guiding Principle',
        blocks: [
          {
            type: 'paragraph',
            text: 'The Platform exists to serve job-seekers, Self-Help Groups, and rural communities. Everyone connected with it acts as a custodian of the trust that users place in the Foundation. We serve with honesty, respect, and care.',
          },
        ],
      },
      {
        id: 'respect',
        title: '2. Treat Everyone with Respect',
        blocks: [
          {
            type: 'list',
            items: [
              'Treat all users, colleagues, and members of the public and sevekaris with dignity and courtesy.',
              'Do not discriminate on grounds of caste, religion, sex, gender, disability, region, or language.',
              'Do not harass, threaten, demean, or abuse any person — in person, online, or through the Platform.',
              'Be patient and supportive with users who are new to technology.',
            ],
          },
        ],
      },
      {
        id: 'data',
        title: "3. Protect People's Data",
        blocks: [
          {
            type: 'list',
            items: [
              'Keep all personal information you encounter strictly confidential.',
              'Access only the data your role requires — never out of curiosity.',
              'Never share, sell, or misuse anyone\'s personal information.',
              'Report any data leak or breach to the Grievance Officer immediately.',
            ],
          },
        ],
      },
      {
        id: 'honesty',
        title: '4. Be Honest',
        blocks: [
          {
            type: 'list',
            items: [
              'Never create fake profiles, fake listings, or false records.',
              'Never misrepresent your role or authority.',
              'Never promise a job — the Platform connects people; it does not guarantee employment.',
              'Record information accurately and truthfully.',
            ],
          },
        ],
      },
      {
        id: 'no-money',
        title: '5. Take No Money from Users',
        blocks: [
          {
            type: 'list',
            items: [
              'Never ask for or accept any fee, gift, or favour from a Candidate or Employer.',
              'Report anyone who demands money from users in connection with the Platform.',
            ],
          },
        ],
      },
      {
        id: 'conflicts',
        title: '6. Avoid Conflicts of Interest',
        blocks: [
          {
            type: 'list',
            items: [
              'Disclose any personal or business interest that could conflict with your role.',
              'Do not use your position or any knowledge gained for personal gain.',
              'Do not favour any Employer or Candidate improperly.',
            ],
          },
        ],
      },
      {
        id: 'systems',
        title: '7. Use Systems Responsibly',
        blocks: [
          {
            type: 'list',
            items: [
              'Follow all security rules — strong passwords, multi-factor authentication, and approved devices.',
              'Do not share your login with anyone.',
              'Do not install unauthorised software or bypass security controls.',
              'Use Platform systems only for Foundation purposes.',
            ],
          },
        ],
      },
      {
        id: 'speak-up',
        title: '8. Speak Up',
        blocks: [
          {
            type: 'list',
            items: [
              'If you see wrongdoing, unsafe practice, or a possible data breach, report it.',
              'Reports can be made to the Grievance Officer or a senior Trustee.',
              'The Foundation will not penalise anyone for raising a genuine concern in good faith.',
            ],
          },
        ],
      },
      {
        id: 'reputation',
        title: "9. Uphold the Foundation's Reputation",
        blocks: [
          {
            type: 'list',
            items: [
              'Conduct yourself, including on social media, in a way that does not bring the Foundation into disrepute.',
              'Do not speak on behalf of the Foundation unless authorised.',
            ],
          },
        ],
      },
      {
        id: 'consequences',
        title: '10. Consequences',
        blocks: [
          {
            type: 'paragraph',
            text: 'Breaking this Code of Conduct may lead to a warning, removal from your role, and, where the law is broken, civil or criminal liability.',
          },
        ],
      },
      {
        id: 'acknowledgement',
        title: 'Acknowledgement',
        blocks: [
          {
            type: 'paragraph',
            text: 'I have read and understood this Code of Conduct and agree to follow it in my role with the Foundation.',
          },
        ],
      },
    ],
  },

  grievance: {
    slug: 'grievance-officer',
    title: 'Grievance Officer — Contact & Process',
    subtitle: 'Public-Facing Page Content',
    effectiveDate: '2 November 2026',
    sections: [
      {
        id: 'intro',
        title: 'Grievance Redressal',
        blocks: [
          {
            type: 'paragraph',
            text: 'If you have any complaint, concern, or request about your data or your experience on the Dindoree Pranit Job Portal, our Grievance Officer is here to help.',
          },
        ],
      },
      {
        id: 'contact-details',
        title: 'Grievance Officer Contact Details',
        blocks: [
          {
            type: 'table',
            headers: ['Field', 'Details'],
            rows: [
              ['Designation', 'Grievance Officer, Dindoree Pranit Seva Marg Foundation'],
              ['Email', 'admin@dindoripranit.org'],
              ['Phone', '+91 7755941753 / +91 8956741109'],
              ['Postal address', 'Dindoree Pranit Seva Marg Foundation, Dindori, Nashik District, Maharashtra'],
              ['Working hours', '10:00 AM – 7:00 PM, Monday to Saturday'],
            ],
          },
        ],
      },
      {
        id: 'how-to-file',
        title: 'How to File a Grievance',
        blocks: [
          { type: 'paragraph', text: 'You can raise a grievance in any of these ways:' },
          {
            type: 'list',
            items: [
              'Fill in the online grievance form on this page.',
              'Email the Grievance Officer at admin@dindoripranit.org.',
              'Call the phone numbers above during working hours.',
              'Send a letter by post to the address above.',
            ],
          },
        ],
      },
      {
        id: 'timeline',
        title: 'What Happens Next',
        blocks: [
          {
            type: 'table',
            headers: ['Timeline', 'What we do'],
            rows: [
              ['Within 24 hours', 'We acknowledge your complaint and give you a ticket number.'],
              ['Within 3 days', 'We review and categorise your complaint.'],
              ['Within 15 days', 'We give you our decision and take any needed action.'],
              ['If unresolved', 'You may escalate to the Data Protection Board of India.'],
            ],
          },
        ],
      },
      {
        id: 'complaints',
        title: 'What You Can Complain About',
        blocks: [
          {
            type: 'list',
            items: [
              'Privacy or data concerns, including access, correction, deletion, and consent.',
              'An Employer demanding a fee from you.',
              'A fake or misleading job listing.',
              'Harassment or abuse by any user.',
              'A technical problem with the Platform.',
              'Any other concern about your experience.',
            ],
          },
        ],
      },
      {
        id: 'escalation',
        title: 'If You Are Not Satisfied',
        blocks: [
          {
            type: 'paragraph',
            text: "If you are not satisfied with the Grievance Officer's decision, you may escalate your complaint to the Data Protection Board of India under the Digital Personal Data Protection Act, 2023.",
          },
        ],
      },
    ],
  },

  dataRequest: {
    slug: 'data-request',
    title: 'Data Request Form',
    subtitle: 'Data Subject Access Request (DSAR) — DPDP Act 2023',
    effectiveDate: '2 November 2026',
    form: 'dsar',
    sections: [
      {
        id: 'about',
        title: 'How to Use This Form',
        blocks: [
          {
            type: 'paragraph',
            text: 'Use this form to access, correct, or delete your personal data, withdraw consent, or nominate a person to exercise your rights. Fill in your details below and submit the request. Submitting the form opens your email client addressed to the Grievance Officer.',
          },
        ],
      },
      {
        id: 'what-you-can-request',
        title: 'What You Can Request',
        blocks: [
          {
            type: 'list',
            items: [
              'Access my data — show me a copy of the personal data you hold about me.',
              'Correct my data — fix incorrect or outdated information.',
              'Delete my data — erase my personal data, subject to legal retention rules.',
              'Withdraw consent — withdraw one or more consents I gave earlier.',
              'Nominate a person — appoint someone to exercise my rights on my behalf.',
            ],
          },
        ],
      },
      {
        id: 'identity-verification',
        title: 'Identity Verification',
        blocks: [
          {
            type: 'paragraph',
            text: 'To protect your data, we may need to confirm your identity before acting on this request. We may send a verification code to your registered mobile or email. We will not ask for unnecessary documents.',
          },
        ],
      },
      {
        id: 'next-steps',
        title: 'What Happens Next',
        blocks: [
          {
            type: 'list',
            items: [
              'We acknowledge your request within 24 hours.',
              'We verify your identity.',
              'We complete your request within the timeline set under the DPDP Act.',
              'If we cannot fully act on your request, we will explain why.',
            ],
          },
        ],
      },
    ],
  },
};
