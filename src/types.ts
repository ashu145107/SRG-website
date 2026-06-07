/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  HANDLER = 'HANDLER',
  COMPANY = 'COMPANY',
  CANDIDATE = 'CANDIDATE',
  SHG = 'SHG'
}

export interface HandlerPermissions {
  canViewUsers: boolean;
  canEditUsers: boolean;
  canApproveJobs: boolean;
  canManageCompanies: boolean;
  canManageSHG: boolean;
  canViewReports: boolean;
  canManageContent: boolean;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  token?: string;
  // Dynamic handler permissions
  handlerPermissions?: HandlerPermissions;
  // Specific reference ids
  companyId?: string;
  candidateId?: string;
  shgId?: string;
}

export interface CandidateProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  qualification: string;
  experienceYears: number;
  skills: string[];
  resumeUrl?: string;
  resumeName?: string;
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  industry: string;
  address: string;
  isApproved: boolean;
}

export interface SHGProfile {
  id: string;
  shgName: string;
  leaderName: string;
  phone: string;
  district: string;
  memberCount: number;
  activities: string[];
  productShowcase: SHGProduct[];
}

export interface SHGProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  category: string;
  createdAt: string;
  isApproved: boolean;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyId: string;
  candidateId: string;
  candidateName: string;
  candidatePhone: string;
  status: 'Applied' | 'Reviewing' | 'Interview Scheduled' | 'Shortlisted' | 'Rejected' | 'Hired';
  appliedAt: string;
  interviewDate?: string;
}

export interface Initiative {
  id: string;
  titleEn: string;
  titleMr: string;
  descriptionEn: string;
  descriptionMr: string;
  type: 'upcoming' | 'past';
  date: string;
  locationEn: string;
  locationMr: string;
}

export interface Training {
  id: string;
  titleEn: string;
  titleMr: string;
  descriptionEn: string;
  descriptionMr: string;
  duration: string;
  instructor: string;
  startDate: string;
}

export interface SuccessStory {
  id: string;
  nameEn: string;
  nameMr: string;
  storyEn: string;
  storyMr: string;
  roleEn: string;
  roleMr: string;
  imageUrl?: string;
}
