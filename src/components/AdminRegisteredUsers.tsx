/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGetAdminUsersQuery } from '../services/adminApi';
import { CandidateProfile } from '../types';
import { Users, Eye, Search, ArrowUpDown, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';

export function AdminRegisteredUsers() {
  const [pageSize, setPageSize] = useState(15);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchPhrase, setSearchPhrase] = useState('');
  
  // Sort state (recent first is the default)
  const [sortColumn, setSortColumn] = useState<keyof CandidateProfile | 'id'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Detail Modal state
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);

  // Fetch paginated data
  const { data, isLoading, isFetching, error } = useGetAdminUsersQuery({
    pageSize,
    pageNumber,
  });

  const candidatesList = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Handle Sort
  const handleSort = (column: keyof CandidateProfile | 'id') => {
    if (sortColumn === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  // Local client-side search and sorting on the fetched page items
  const filteredAndSortedList = React.useMemo(() => {
    let result = [...candidatesList];

    // 1. Client side search phrase filter
    if (searchPhrase.trim()) {
      const phrase = searchPhrase.toLowerCase();
      result = result.filter(
        c =>
          (c.fullName || '').toLowerCase().includes(phrase) ||
          (c.phone || '').toLowerCase().includes(phrase) ||
          (c.email || '').toLowerCase().includes(phrase) ||
          (c.qualification || '').toLowerCase().includes(phrase) ||
          (c.city || '').toLowerCase().includes(phrase)
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
  }, [candidatesList, searchPhrase, sortColumn, sortOrder]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6 font-sans text-left" id="admin-users-panel">
      {/* Upper Title */}
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-lg font-extrabold text-blue-950 flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-600" />
          नोंदणीकृत उमेदवार यादी / Registered Candidate List
        </h2>
        <p className="text-xs text-slate-500">
          प्रणालीत नोंदणीकृत असलेल्या ग्रामीण उमेदवारांचा बायोडाटा व शिक्षण माहिती व्यवस्थापन
        </p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center pb-2">
          <h3 className="font-extrabold text-blue-950 text-sm tracking-wide uppercase">
            नोंदणीकृत उमेदवार / Registered Candidates
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
              placeholder="Search candidate..."
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
                  onClick={() => handleSort('fullName')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Full Name
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('phone')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Mobile
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Email
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('qualification')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Education
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3.5 font-bold">
                  Specialization
                </th>
                <th
                  onClick={() => handleSort('experienceYears')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    Experience
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('city')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    District
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
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                    माहिती लोड होत आहे / Loading candidates...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <div className="inline-flex flex-col items-center gap-2 text-red-600 font-medium">
                      <span className="text-sm">❌ API लोड करण्यात अयशस्वी</span>
                      <span className="text-xs text-slate-500">Failed to load candidates from API. Please check your connection and try again.</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAndSortedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-medium">
                    कोणतेही रेकॉर्ड सापडले नाही / No candidates found
                  </td>
                </tr>
              ) : (
                filteredAndSortedList.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-800 break-words max-w-[150px]">
                      {candidate.fullName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                      {candidate.phone}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 break-all max-w-[150px]">
                      {candidate.email}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {candidate.qualification || 'Graduate'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 italic">
                      {candidate.skills && candidate.skills.length > 0 ? candidate.skills.slice(0, 2).join(', ') : 'General'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-900 font-extrabold text-center">
                      {candidate.experienceYears !== undefined ? `${candidate.experienceYears} Years` : '0'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {candidate.city || 'Nashik'}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCandidate(candidate)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center cursor-pointer"
                        title="View Profile"
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

          <div className="flex items-center gap-1 text-xs flex-wrap">
            <button
              onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
              disabled={pageNumber === 1 || isLoading}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const startPage = Math.max(1, pageNumber - 2);
              return startPage + i <= totalPages ? startPage + i : null;
            }).filter(Boolean).map((page) => (
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

            {totalPages > 5 && pageNumber < totalPages - 2 && (
              <span className="text-slate-400 px-1">...</span>
            )}
            {totalPages > 5 && pageNumber < totalPages - 2 && (
              <button
                onClick={() => setPageNumber(totalPages)}
                disabled={isLoading}
                className="min-w-[32px] h-8 rounded-lg font-bold border bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                {totalPages}
              </button>
            )}

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

      {/* Profile Details Dialog Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col text-left">
            <div className="bg-blue-950 text-white p-4.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  उमेदवार प्रोफाइल तपशील / Candidate Profile Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Full Name:</span>
                <span className="font-extrabold text-slate-900 col-span-2">{selectedCandidate.fullName || selectedCandidate.candidateName}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Mobile:</span>
                <span className="font-bold text-slate-900 col-span-2">{selectedCandidate.phone || selectedCandidate.mobile}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Email:</span>
                <span className="font-medium text-slate-700 col-span-2 break-all">{selectedCandidate.email}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Education:</span>
                <span className="font-extrabold text-slate-850 col-span-2">{selectedCandidate.qualification || selectedCandidate.education || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Specialization:</span>
                <span className="font-medium text-slate-800 col-span-2">{selectedCandidate.specialization || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Experience:</span>
                <span className="font-extrabold text-slate-900 col-span-2">{selectedCandidate.experienceYears || selectedCandidate.experience || 0} Years</span>
              </div>
              {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                <div className="grid grid-cols-3 border-b border-gray-100 pb-2.5">
                  <span className="font-bold text-slate-400 col-span-1">Skills:</span>
                  <span className="font-medium text-slate-800 col-span-2 flex flex-wrap gap-1">
                    {selectedCandidate.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700 border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">District/City:</span>
                <span className="font-medium text-slate-600 col-span-2">{selectedCandidate.city || selectedCandidate.district || 'N/A'}</span>
              </div>
              {selectedCandidate.address && (
                <div className="grid grid-cols-3 pb-1">
                  <span className="font-bold text-slate-400 col-span-1">Address:</span>
                  <span className="font-medium text-slate-600 col-span-2 leading-relaxed">{selectedCandidate.address}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
              <button
                onClick={() => setSelectedCandidate(null)}
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
