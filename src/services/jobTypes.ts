/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface JobRequirement {
  id?: number; // Present on responses or when editing
  userId: number;
  profileHeader: string;
  skill: string;
  specialization: number;
  experiance: number;
  noOfVacancy: number;
  workPlace: string;
  salary: number;
  expiryDate: string; // ISO DateTime or date string
  educationId: number;
  createdBy: number;
  experianceTo: number;
  salaryTo: number;
  roleTypeId: number;
  interviewModeId: number;
  interviewLocation: string;
  postingNotes: string;
  jobDiscription: string;
  jobDesignation: string;
  certificationsRequired: string;
  genderPreference: string;
  ageRange: string;
  shiftTypeId: number;
  workModeId: number;
  jobLocation: string;
  salaryPeriodId: number;
  benefits: string;
  weeklyOffId: number;
  jobCode: string;
}

// Params for searching jobs
export interface JobSearchParams {
  searchPhrase?: string;
  location?: string;
  category?: string;
  page?: number;
  limit?: number;
}

// Response from jobsearch GET API
export interface JobSearchResponse {
  // Supports direct array or wrapping object
  data?: JobRequirement[];
  items?: JobRequirement[];
  results?: JobRequirement[];
  totalCount?: number;
  total?: number;
}

// Response from details API
export type JobDetailsResponse = JobRequirement;

// Request body for jobapplication POST API (array of strings)
export type JobApplicationRequest = string[];

export interface JobApplicationResponse {
  success: boolean;
  message?: string;
  status?: string;
}
