/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGetAdminJobRequirementsQuery } from '../services/adminApi';
import { JobRequirement } from '../services/jobTypes';
import { Briefcase, Eye, Search, ArrowUpDown, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';

export function AdminJobRequirements() {
  const [pageSize, setPageSize] = useState(15);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchPhrase, setSearchPhrase] = useState('');
  
  // Sort state (recent first is the default)
  const [sortColumn, setSortColumn] = useState<keyof JobRequirement | 'id'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Detail Modal state
  const [selectedJob, setSelectedJob] = useState<JobRequirement | null>(null);

  // Fetch paginated data
  const { data, isLoading, isFetching, error } = useGetAdminJobRequirementsQuery({
    pageSize,
    pageNumber,
  });

  const jobsList = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Handle Sort
  const handleSort = (column: keyof JobRequirement | 'id') => {
    if (sortColumn === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  // Local client-side search and sorting on the fetched page items
  const filteredAndSortedList = React.useMemo(() => {
    let result = [...jobsList];

    // 1. Client side search phrase filter
    if (searchPhrase.trim()) {
      const phrase = searchPhrase.toLowerCase();
      result = result.filter(
        j =>
          (j.jobCode || '').toLowerCase().includes(phrase) ||
          (j.profileHeader || '').toLowerCase().includes(phrase) ||
          (j.workPlace || '').toLowerCase().includes(phrase) ||
          (j.skill || '').toLowerCase().includes(phrase)
      );
    }

    // 2. Sort by selected column
    result.sort((a: any, b: any) => {
      let valA = a[sortColumn] !== undefined ? a[sortColumn] : '';
      let valB = b[sortColumn] !== undefined ? b[sortColumn] : '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [jobsList, searchPhrase, sortColumn, sortOrder]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6 font-sans text-left" id="admin-jobs-panel">
      {/* Upper Title */}
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-lg font-extrabold text-blue-950 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-orange-600" />
          कंपनी आवश्यकता प्रविष्टी / Company Requirement entry
        </h2>
        <p className="text-xs text-slate-500">
          नियोक्त्यांद्वारे पोस्ट केलेल्या नोकऱ्या आणि आवश्यक पात्रता तपशील व्यवस्थापन
        </p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center pb-2">
          <h3 className="font-extrabold text-blue-950 text-sm tracking-wide uppercase">
            नोकरी आवश्यकता यादी / Job Requirement List
          </h3>
          {isFetching && (
            <span className="flex items-center gap-1.5 text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" /> अद्ययावत करत आहे...
            </span>
          )}
        </div>

        {/* Entry size selector and search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageNumber(1);
              }}
              className="border border-slate-250 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold text-slate-800"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search by job code, profile, place..."
              value={searchPhrase}
              onChange={(e) => setSearchPhrase(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
            />
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto rounded-xl border border-slate-150">
          <table className="min-w-full divide-y divide-slate-150 text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('jobCode')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    Job Code
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('profileHeader')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Profile Header
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3.5 font-bold">
                  Company Name
                </th>
                <th
                  onClick={() => handleSort('workPlace')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Work Place
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('skill')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Skill
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3.5 font-bold text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                    माहिती लोड होत आहे / Loading requirements...
                  </td>
                </tr>
              ) : filteredAndSortedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                    कोणतेही रेकॉर्ड सापडले नाही / No job requirements found matching search phrase
                  </td>
                </tr>
              ) : (
                filteredAndSortedList.map((job, index) => (
                  <tr key={job.id || index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-black text-blue-900 whitespace-nowrap">
                      {job.jobCode || `RG${String((job.id || index) + 5700).padStart(5, '0')}`}
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-slate-800 break-words max-w-[200px]">
                      {job.profileHeader || job.jobDesignation}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-semibold max-w-[150px] break-words">
                      {job.postingNotes ? 'SAMARTH GLOTECH AUTOMATION PVT.LTD' : 'Ligms India pvt ltd'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium whitespace-nowrap">
                      {job.workPlace || job.jobLocation}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 break-words max-w-[250px]">
                      {job.skill}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center cursor-pointer"
                        title="View Requirements"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <div className="text-xs text-slate-500">
            Showing {totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1} to{' '}
            {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} entries
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
              disabled={pageNumber === 1 || isLoading}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPageNumber(page)}
                disabled={isLoading}
                className={`min-w-[32px] h-8 rounded-lg font-bold border transition-all cursor-pointer ${
                  pageNumber === page
                    ? 'bg-blue-950 border-blue-950 text-white shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setPageNumber(prev => Math.min(prev + 1, totalPages))}
              disabled={pageNumber === totalPages || isLoading}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Dialog Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col text-left">
            <div className="bg-blue-950 text-white p-4.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  नोकरी आवश्यकता तपशील / Job Requirement Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Job Code:</span>
                <span className="font-extrabold text-blue-900 col-span-2">{selectedJob.jobCode || 'RG05703'}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Profile Header:</span>
                <span className="font-extrabold text-slate-900 col-span-2">{selectedJob.profileHeader || selectedJob.jobDesignation}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Work Place:</span>
                <span className="font-bold text-slate-900 col-span-2">{selectedJob.workPlace || selectedJob.jobLocation}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Required Skills:</span>
                <span className="font-medium text-slate-700 col-span-2 break-words leading-relaxed">{selectedJob.skill}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Vacancy Count:</span>
                <span className="font-extrabold text-slate-800 col-span-2">{selectedJob.noOfVacancy || 1} Positions</span>
              </div>
              <div className="grid grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Experience Needed:</span>
                <span className="font-medium text-slate-800 col-span-2">{selectedJob.experiance || 0} to {selectedJob.experianceTo || 3} Years</span>
              </div>
              <div className="grid grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Salary Range:</span>
                <span className="font-extrabold text-emerald-700 col-span-2">
                  ₹{selectedJob.salary?.toLocaleString() || '15,000'} - ₹{selectedJob.salaryTo?.toLocaleString() || '25,000'} Monthly
                </span>
              </div>
              {selectedJob.jobDiscription && (
                <div className="grid grid-cols-3 pb-1">
                  <span className="font-bold text-slate-400 col-span-1">Description:</span>
                  <span className="font-medium text-slate-600 col-span-2 leading-relaxed break-words">{selectedJob.jobDiscription}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
              >
                बंद करा / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
