/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserRole, Job, CandidateProfile, CompanyProfile, SHGProfile, JobApplication, Initiative, Training, SuccessStory, HandlerPermissions } from '../types';

// Pre-seeded Data Keys
const USERS_KEY = 'srg_users';
const JOBS_KEY = 'srg_jobs';
const CANDIDATES_KEY = 'srg_candidates';
const COMPANIES_KEY = 'srg_companies';
const SHGS_KEY = 'srg_shgs';
const APPLICATIONS_KEY = 'srg_applications';
const INITIATIVES_KEY = 'srg_initiatives';
const TRAININGS_KEY = 'srg_trainings';
const STORIES_KEY = 'srg_stories';

export const INITIAL_USERS: User[] = [
  {
    id: 'u-1',
    email: 'admin@dindori.org',
    phone: '9876543210',
    name: 'Super Admin Dindori',
    role: UserRole.SUPER_ADMIN,
    token: 'jwt-super-admin-token-123'
  },
  {
    id: 'u-2',
    email: 'employer@tata.com',
    phone: '9998887770',
    name: 'Tata Consultancy Services',
    role: UserRole.COMPANY,
    companyId: 'comp-1',
    token: 'jwt-company-token-123'
  },
  {
    id: 'u-3',
    email: 'candidate@gmail.com',
    phone: '8887776660',
    name: 'Rahul Ramesh Patil',
    role: UserRole.CANDIDATE,
    candidateId: 'cand-1',
    token: 'jwt-candidate-token-123'
  },
  {
    id: 'u-4',
    email: 'shg@shg.org',
    phone: '7776665550',
    name: 'Swami Samarth Mahila Gruhudyog',
    role: UserRole.SHG,
    shgId: 'shg-1',
    token: 'jwt-shg-token-123'
  },
  {
    id: 'u-5',
    email: 'handler@dindori.org',
    phone: '6665554440',
    name: 'Dnyaneshwar Maharaj (Handler)',
    role: UserRole.HANDLER,
    token: 'jwt-handler-token-123',
    handlerPermissions: {
      canViewUsers: true,
      canEditUsers: false,
      canApproveJobs: true,
      canManageCompanies: false,
      canManageSHG: true,
      canViewReports: true,
      canManageContent: false
    }
  }
];

export const INITIAL_COMPANIES: CompanyProfile[] = [
  {
    id: 'comp-1',
    companyName: 'Tata Consultancy Services',
    contactPerson: 'Milind Deshmukh',
    email: 'employer@tata.com',
    phone: '9998887770',
    website: 'https://tata.com',
    industry: 'Technology & IT Services',
    address: 'Hinjawadi IT Park, Pune',
    isApproved: true
  },
  {
    id: 'comp-2',
    companyName: 'Reliance Retail Nashik',
    contactPerson: 'Sanjay Shinde',
    email: 'info@relianceretail.com',
    phone: '9123456789',
    website: 'https://reliance.com',
    industry: 'Retail & Sales',
    address: 'College Road, Nashik',
    isApproved: false
  }
];

export const INITIAL_CANDIDATES: CandidateProfile[] = [
  {
    id: 'cand-1',
    fullName: 'Rahul Ramesh Patil',
    email: 'candidate@gmail.com',
    phone: '8887776660',
    city: 'Nashik',
    qualification: 'B.E. Computer Science',
    experienceYears: 2,
    skills: ['React', 'TypeScript', 'Node.js', 'Sales'],
    resumeName: 'Rahul_Resume.pdf'
  }
];

export const INITIAL_SHGS: SHGProfile[] = [
  {
    id: 'shg-1',
    shgName: 'Swami Samarth Mahila Gruhudyog',
    leaderName: 'Sunita Vinay Joshi',
    phone: '7776665550',
    district: 'Nashik',
    memberCount: 12,
    activities: ['Lajjavanti Agarbatti craft', 'Organic turmeric powder packing', 'Handicraft knitting'],
    productShowcase: [
      {
        id: 'prod-1',
        name: 'अष्टगंध अगरबत्ती (Premium)',
        description: 'नैसर्गिक अष्टगंध आणि सुगंधी द्रव्यांपासून बनवलेली अगरबत्ती',
        price: 150
      },
      {
        id: 'prod-2',
        name: 'शुद्ध सेंद्रिय हळद पावडर',
        description: 'थेट शेतातून गोळा करून पारंपारिक पद्धतीने तयार केलेली हळद पावडर',
        price: 200
      }
    ]
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Junior Software Engineer',
    companyId: 'comp-1',
    companyName: 'Tata Consultancy Services',
    location: 'Pune / Remote',
    salary: '₹३,५०,००० - ₹५,००,००० प्रति वर्ष',
    description: 'We are seeking an enthusiastic system engineer with familiarity in typescript and react for development of modular interfaces.',
    requirements: ['React Framework', 'TypeScript Language', 'Analytical Thinking'],
    type: 'Full-time',
    category: 'Information Technology',
    createdAt: '2026-06-01',
    isApproved: true
  },
  {
    id: 'job-2',
    title: 'Assistant Retail Store Manager',
    companyId: 'comp-2',
    companyName: 'Reliance Retail Nashik',
    location: 'Nashik',
    salary: '₹२,४०,००० - ₹३,२०,०००',
    description: 'Looking after inventory stock controls and guiding checkout customer services.',
    requirements: ['Excellent communication', 'Inventory tracking', 'Leadership skill'],
    type: 'Full-time',
    category: 'Retail & Commerce',
    createdAt: '2026-06-03',
    isApproved: true
  },
  {
    id: 'job-3',
    title: 'Call Center Representative',
    companyId: 'comp-1',
    companyName: 'Tata Consultancy Services',
    location: 'Remote',
    salary: '₹१,८०,००० - ₹२,५०,०००',
    description: 'Provide exceptional customer care support over inbound telecommunications.',
    requirements: ['Marathi En fluency', 'Problem solving'],
    type: 'Contract',
    category: 'Customer Service',
    createdAt: '2026-06-05',
    isApproved: false
  }
];

export const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Junior Software Engineer',
    companyName: 'Tata Consultancy Services',
    companyId: 'comp-1',
    candidateId: 'cand-1',
    candidateName: 'Rahul Ramesh Patil',
    candidatePhone: '8887776660',
    status: 'Interview Scheduled',
    appliedAt: '2026-06-02',
    interviewDate: '2026-06-15'
  }
];

export const INITIAL_INITIATIVES: Initiative[] = [
  {
    id: 'init-1',
    titleEn: 'Nashik Mega Job Placement Fair 2026',
    titleMr: 'नाशिक भव्य रोजगार आणि स्वयंरोजगार मेळावा २०२६',
    descriptionEn: 'Over 40 recruiters offering instant placements and career counselling sessions at Shri Swami Samarth Seva Kendra.',
    descriptionMr: 'श्री स्वामी समर्थ सेवा केंद्रात ४० हून अधिक नियोक्त्यांकडून तात्काळ भरती आणि करिअर मार्गदर्शन शिबिर.',
    type: 'upcoming',
    date: '15 June 2026',
    locationEn: 'Seva Kendra, Dindori, Nashik',
    locationMr: 'सेवा केंद्र, दिंडोरी दरबार, नाशिक'
  },
  {
    id: 'init-2',
    titleEn: 'Self Employment Business Incubation Summit',
    titleMr: 'स्वयंरोजगार व्यवसाय मार्गदर्शन व कर्ज योजना शिबिर',
    descriptionEn: 'Interaction with banking experts and enterprise consultants assisting in Mudra & Stand-up India credits.',
    descriptionMr: 'मुद्रा योजना व इतर सरकारी कर्ज योजनांविषयी बँक अधिकारी आणि व्यवसाय तज्ज्ञांचे थेट मार्गदर्शन.',
    type: 'upcoming',
    date: '28 June 2026',
    locationEn: 'Seva Kendra, Pune (Chikhali)',
    locationMr: 'श्री स्वामी समर्थ सेवा केंद्र, चिखली, पुणे'
  },
  {
    id: 'init-3',
    titleEn: 'State Level SHG Exhibition Council Nagpur',
    titleMr: 'राज्यस्तरीय महिला बचत गट प्रदर्शन व विक्री परिषद नागपूर',
    descriptionEn: 'Showcasing custom fabrics, home spices, and herbal creations. Generated record local sales of over 10 lakhs.',
    descriptionMr: 'घरगुती मसाले, आयुर्वेदिक उत्पादने आणि कपड्यांचे भव्य प्रदर्शन. तब्बल १० लाखांहून अधिक विक्रीची नोंद.',
    type: 'past',
    date: '20 May 2026',
    locationEn: 'Reshimbagh Ground, Nagpur',
    locationMr: 'रेशीमबाग मैदान, नागपूर'
  }
];

export const INITIAL_TRAININGS: Training[] = [
  {
    id: 't-1',
    titleEn: 'Professional Tailoring & Fashion Design',
    titleMr: 'व्यावसायिक शिवणकला आणि फॅशन डिझायनिंग कोर्स',
    descriptionEn: 'Intensive course sponsored by SHG Cell offering training in modern tailoring machines and pattern creation.',
    descriptionMr: 'बचत गट विभागाद्वारे प्रायोजित आधुनिक शिवणयंत्र वापर आणि पॅटर्न मेकिंगचा संपूर्ण कोर्स.',
    duration: '2 Months (3 hrs daily)',
    instructor: 'Asha Deshpande (Seva Marg Expert)',
    startDate: '20 June 2026'
  },
  {
    id: 't-2',
    titleEn: 'Digital Marketing & Social Selling',
    titleMr: 'डिजिटल मार्केटिंग आणि सोशल सेलिंग प्रशिक्षण',
    descriptionEn: 'Helping SHGs and micro-enterprises build online catalogs, list products on WhatsApp Business and e-marketplaces.',
    descriptionMr: 'बचतगटांना आणि नवउद्योजकांना स्वतःचा ऑनलाइन कॅटलॉग बनवणे आणि सोशल मीडियाद्वारे विक्री वाढवण्याचे प्रशिक्षण.',
    duration: '3 Weeks',
    instructor: 'Sandip Gadhul (Digital Coach)',
    startDate: '01 July 2026'
  }
];

export const INITIAL_STORIES: SuccessStory[] = [
  {
    id: 's-1',
    nameEn: 'Vandana Santosh Patil',
    nameMr: 'वंदना संतोष पाटील',
    roleEn: 'Founder, Swami Krupa Food Products',
    roleMr: 'संस्थापक, स्वामी कृपा गृहोद्योग',
    storyEn: 'Started with just preparing pickles from a small home kitchen. Under Gurumauli mentoring, our group now distributes organic foodstuffs to 15 cities with a thriving 20-woman team!',
    storyMr: 'अवघ्या ३ महिलांसह घरगुती लोणचे बनवण्यापासून सुरुवात केली. गुरुमाऊलींच्या मार्गदर्शनामुळे आज आमचा बचत गट १५ शहरांमध्ये उत्पादने पाठवतो आणि २० महिलांना रोजगार मिळाला आहे!'
  },
  {
    id: 's-2',
    nameEn: 'Aniket Devram Mor',
    nameMr: 'अनिकेत सुदाम मोरे',
    roleEn: 'Web Developer / Placed Seeker',
    roleMr: 'वेब डेव्हलपर (नोकरी प्राप्त)',
    storyEn: 'Coming from a rural farming household, getting access to technical coaching at Dindori Seva Marg completely revolutionized my path. Placed in Hinjawadi IT hub!',
    storyMr: 'ग्रामीण भागातून शिक्षणासाठी खूप धडपड सुरू होती. दिंडोरी दरबारच्या स्वयंरोजगार केंद्राद्वारे तांत्रिक प्रशिक्षण आणि प्लेसमेंट मिळाल्यामुळे आज मी पुण्यात नामांकित आयटी कंपनीत कार्यरत आहे.'
  }
];

// Helper to Safely load from localStorage
function getStore<T>(key: string, initial: T): T {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(item);
  } catch (e) {
    return initial;
  }
}

function setStore<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const MockDb = {
  getUsers: () => getStore<User[]>(USERS_KEY, INITIAL_USERS),
  setUsers: (users: User[]) => setStore(USERS_KEY, users),

  getJobs: () => getStore<Job[]>(JOBS_KEY, INITIAL_JOBS),
  setJobs: (jobs: Job[]) => setStore(JOBS_KEY, jobs),

  getCandidates: () => getStore<CandidateProfile[]>(CANDIDATES_KEY, INITIAL_CANDIDATES),
  setCandidates: (candidates: CandidateProfile[]) => setStore(CANDIDATES_KEY, candidates),

  getCompanies: () => getStore<CompanyProfile[]>(COMPANIES_KEY, INITIAL_COMPANIES),
  setCompanies: (companies: CompanyProfile[]) => setStore(COMPANIES_KEY, companies),

  getSHGs: () => getStore<SHGProfile[]>(SHGS_KEY, INITIAL_SHGS),
  setSHGs: (shgs: SHGProfile[]) => setStore(SHGS_KEY, shgs),

  getApplications: () => getStore<JobApplication[]>(APPLICATIONS_KEY, INITIAL_APPLICATIONS),
  setApplications: (apps: JobApplication[]) => setStore(APPLICATIONS_KEY, apps),

  getInitiatives: () => getStore<Initiative[]>(INITIATIVES_KEY, INITIAL_INITIATIVES),
  getTrainings: () => getStore<Training[]>(TRAININGS_KEY, INITIAL_TRAININGS),
  getStories: () => getStore<SuccessStory[]>(STORIES_KEY, INITIAL_STORIES),
};
