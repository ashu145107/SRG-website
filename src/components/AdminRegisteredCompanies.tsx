/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { openEncryptedRouteInNewTab } from '../utils/secureDetailRoute';
import { useGetAdminCompaniesQuery, useAddCompanyMutation } from '../services/adminApi';
import { CompanyProfile } from '../types';
import { useGetCompanyTypesQuery, useGetIndustryTypesQuery } from '../services/jobMasterApi';
import { getLocalizedName, useGetDistrictsQuery, useGetStatesQuery, useGetTalukasQuery } from '../services/masterApi';
import { Building2, Eye, Search, ArrowUpDown, ChevronLeft, ChevronRight, X, Loader2, Plus, ExternalLink } from 'lucide-react';
import { Loader, Toast } from './ui/FeedbackComponents';
import { useTranslation } from 'react-i18next';

type AddCompanyForm = {
  fullname: string;
  mobile: string;
  address: string;
  email: string;
  stateId: number;
  districtId: number;
  talukaId: number;
  contactPerson: string;
  alternateContactPerson: string;
  alternateContactNumber: string;
  companyTypeId: number;
  industryTypeId: number;
  discription: string;
  website: string;
  alternateEmail: string;
};

const initialAddCompanyForm: AddCompanyForm = {
  fullname: '',
  mobile: '',
  address: '',
  email: '',
  stateId: 0,
  districtId: 0,
  talukaId: 0,
  contactPerson: '',
  alternateContactPerson: '',
  alternateContactNumber: '',
  companyTypeId: 0,
  industryTypeId: 0,
  discription: '',
  website: '',
  alternateEmail: '',
};

export function AdminRegisteredCompanies() {
  const { t } = useTranslation();
  const { token } = useSelector((state: RootState) => state.auth);
  const [pageSize, setPageSize] = useState(15);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchPhrase, setSearchPhrase] = useState('');
  
  // Sort state (recent first is the default)
  const [sortColumn, setSortColumn] = useState<keyof CompanyProfile | 'id'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Detail Modal state
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null);

  // Add Company Modal state
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Fetch paginated data
  const { data, isLoading, isFetching, error, refetch } = useGetAdminCompaniesQuery({
    pageSize,
    pageNumber,
  });

  // Master data for add-company form
  const { data: companyTypes = [] } = useGetCompanyTypesQuery(undefined, {
    skip: !showAddCompany,
    refetchOnMountOrArgChange: true,
  });
  const { data: industryTypes = [] } = useGetIndustryTypesQuery(undefined, {
    skip: !showAddCompany,
    refetchOnMountOrArgChange: true,
  });
  const { data: states = [], isLoading: isLoadingStates } = useGetStatesQuery(1);

  const [addCompany, { isLoading: isAddingCompany }] = useAddCompanyMutation();
  const [form, setForm] = useState<AddCompanyForm>(initialAddCompanyForm);
  const { data: districts = [], isLoading: isLoadingDistricts } = useGetDistrictsQuery(form.stateId, { skip: !form.stateId });
  const { data: talukas = [], isLoading: isLoadingTalukas } = useGetTalukasQuery(form.districtId, { skip: !form.districtId });
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleAddCompanySubmit = async () => {
    try {
      const res: any = await addCompany({ ...form, companyTypeId: Number(form.companyTypeId) || 1, industryTypeId: Number(form.industryTypeId) || 1 });
      if (res?.error) {
        const msg = typeof res.error.data === 'string' ? res.error.data : t('adm.companies.toast.registrationFailed');
        setToastType('error');
        setToastMsg(msg);
        return;
      }
      const msg = res?.data?.message || t('adm.companies.toast.registrationSuccess');
      setToastType('success');
      setToastMsg(msg);
      setShowAddCompany(false);
      setForm(initialAddCompanyForm);
      refetch();
    } catch (err: any) {
      setToastType('error');
      setToastMsg(t('adm.companies.toast.registrationFailed') + ' ' + (err?.message || err));
    }
  };

  const companiesList = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Handle Sort
  const handleSort = (column: keyof CompanyProfile | 'id') => {
    if (sortColumn === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  // Local client-side search and sorting on the fetched page items
  const filteredAndSortedList = React.useMemo(() => {
    let result = [...companiesList];

    // 1. Client side search phrase filter
    if (searchPhrase.trim()) {
      const phrase = searchPhrase.toLowerCase();
      result = result.filter(
        c =>
          (c.companyName || '').toLowerCase().includes(phrase) ||
          (c.phone || '').toLowerCase().includes(phrase) ||
          (c.email || '').toLowerCase().includes(phrase) ||
          (c.contactPerson || '').toLowerCase().includes(phrase) ||
          (c.address || '').toLowerCase().includes(phrase)
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
  }, [companiesList, searchPhrase, sortColumn, sortOrder]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6 font-sans text-left" id="admin-companies-panel">
      {/* Upper Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-blue-950 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-600" />
            {t('adm.companies.title')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('adm.companies.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowAddCompany(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-950 hover:bg-orange-600 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add new Company
        </button>
      </div>

      {/* Main Table Wrapper */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center pb-2">
          <h3 className="font-extrabold text-blue-950 text-sm tracking-wide uppercase">
            {t('adm.companies.listTitle')}
          </h3>
          {isFetching && (
            <span className="flex items-center gap-1.5 text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" /> {t('adm.common.refreshing')}
            </span>
          )}
        </div>

        {/* Top controls: Show entry dropdown and Search input */}
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
              placeholder="Search..."
              value={searchPhrase}
              onChange={(e) => setSearchPhrase(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
            />
          </div>
        </div>

        {/* Table representation */}
        <div className="srg-scroll overflow-x-auto overflow-y-auto max-h-[70vh] rounded-xl border border-slate-150">
          <table className="w-full min-w-[960px] divide-y divide-slate-150 text-left text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    ID
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('companyName')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Company Name
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
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors hidden md:table-cell"
                >
                  <div className="flex items-center gap-1">
                    Email
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('contactPerson')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Contact Person
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('address')}
                  className="px-4 py-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors hidden md:table-cell"
                >
                  <div className="flex items-center gap-1">
                    Address
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
                  <td colSpan={7} className="px-4 py-2 text-center text-slate-400">
                    <Loader />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <div className="inline-flex flex-col items-center gap-2 text-red-600 font-medium">
                      <span className="text-sm">{t('adm.companies.loadError')}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAndSortedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-medium">
                    {t('adm.companies.empty')}
                  </td>
                </tr>
              ) : (
                filteredAndSortedList.map((company, index) => (
                  <tr key={company.id || index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-black text-blue-900 whitespace-nowrap">
                      <a
                        href="#/dashboard"
                        onClick={(event) => {
                          event.preventDefault();
                          void openEncryptedRouteInNewTab('/dashboard', {
                            view: 'company',
                            id: String(company.id || index + 1),
                          }, token || '').catch((error: unknown) => {
                            window.alert(error instanceof Error ? error.message : 'Unable to open company details.');
                          });
                        }}
                        title="Open company profile in new tab"
                        className="underline decoration-blue-300 underline-offset-2 hover:text-blue-600 hover:decoration-blue-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        {company.id || `C${index + 1}`}
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                      </a>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800 break-words max-w-[180px]">
                      {company.companyName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                      {company.phone || company.mobile || 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 break-all max-w-[150px] hidden md:table-cell">
                      {company.email}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {company.contactPerson}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 break-words max-w-[200px] hidden md:table-cell">
                      {company.address}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCompany(company)}
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

        {/* Footer controls: Showing range text and Pagination controls */}
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
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col text-left">
            <div className="bg-blue-950 text-white p-4.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  {t('adm.companies.detailTitle')}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Company Name:</span>
                <span className="font-extrabold text-slate-900 col-span-2">{selectedCompany.companyName || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Mobile:</span>
                <span className="font-bold text-slate-900 col-span-2">{selectedCompany.phone || selectedCompany.mobile || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Email:</span>
                <span className="font-medium text-slate-700 col-span-2 break-all">{selectedCompany.email || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-100 pb-2.5">
                <span className="font-bold text-slate-400 col-span-1">Contact Person:</span>
                <span className="font-extrabold text-slate-850 col-span-2">{selectedCompany.contactPerson || 'N/A'}</span>
              </div>
              {selectedCompany.website && (
                <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-100 pb-2.5">
                  <span className="font-bold text-slate-400 col-span-1">Website:</span>
                  <span className="font-medium text-blue-650 col-span-2 break-all">{selectedCompany.website}</span>
                </div>
              )}
              {selectedCompany.industry && (
                <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-100 pb-2.5">
                  <span className="font-bold text-slate-400 col-span-1">Industry:</span>
                  <span className="font-medium text-slate-800 col-span-2">{selectedCompany.industry}</span>
                </div>
              )}
              {selectedCompany.address && (
                <div className="grid grid-cols-1 sm:grid-cols-3 pb-1">
                  <span className="font-bold text-slate-400 col-span-1">Address:</span>
                  <span className="font-medium text-slate-600 col-span-2 leading-relaxed">{selectedCompany.address}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
              <button
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
              >
                {t('adm.common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Company Dialog Modal */}
      {showAddCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden flex flex-col text-left max-h-[92vh]">
            <div className="bg-blue-950 text-white p-4.5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  {t('adm.companies.addTitle')}
                </h3>
              </div>
              <button
                onClick={() => setShowAddCompany(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    {t('adm.companies.fieldName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="addcomp-fullname"
                    value={form.fullname}
                    onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                    placeholder="e.g. Acme Pvt. Ltd."
                    className="w-full px-3 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    {t('adm.companies.fieldMobile')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="addcomp-mobile"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    {t('adm.companies.fieldEmail')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="addcomp-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. info@acme.com"
                    className="w-full px-3 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    {t('adm.companies.fieldContactPerson')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="addcomp-contactperson"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    {t('adm.companies.fieldCompanyType')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="addcomp-companytype"
                    value={form.companyTypeId}
                    onChange={(e) => setForm({ ...form, companyTypeId: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                  >
                    <option value={0}>{t('adm.common.selectPlaceholder')}</option>
                    {companyTypes.map((ct) => (
                      <option key={ct.id} value={ct.id}>{ct.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    {t('adm.companies.fieldIndustryType')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="addcomp-industrytype"
                    value={form.industryTypeId}
                    onChange={(e) => setForm({ ...form, industryTypeId: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                  >
                    <option value={0}>{t('adm.common.selectPlaceholder')}</option>
                    {industryTypes.map((it) => (
                      <option key={it.id} value={it.id}>{it.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    {t('adm.companies.fieldAltContactPerson')}
                  </label>
                  <input
                    id="addcomp-altcontactperson"
                    value={form.alternateContactPerson}
                    onChange={(e) => setForm({ ...form, alternateContactPerson: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    {t('adm.companies.fieldAltContactNumber')}
                  </label>
                  <input
                    id="addcomp-altnumber"
                    value={form.alternateContactNumber}
                    onChange={(e) => setForm({ ...form, alternateContactNumber: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    {t('adm.companies.fieldAltEmail')}
                  </label>
                  <input
                    id="addcomp-altemail"
                    type="email"
                    value={form.alternateEmail}
                    onChange={(e) => setForm({ ...form, alternateEmail: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">
                    {t('adm.companies.fieldWebsite')}
                  </label>
                  <input
                    id="addcomp-website"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="e.g. https://acme.com"
                    className="w-full px-3 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="addcomp-state" className="block font-bold text-slate-600 mb-1.5">
                    {t('reg.form.state')}
                  </label>
                  <select
                    id="addcomp-state"
                    value={form.stateId}
                    onChange={(e) => setForm({ ...form, stateId: Number(e.target.value), districtId: 0, talukaId: 0 })}
                    disabled={isLoadingStates}
                    className="w-full px-3 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                  >
                    <option value={0}>{t('reg.option.selectState')}</option>
                    {states.map((state) => <option key={state.id} value={state.id}>{getLocalizedName(state)}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="addcomp-district" className="block font-bold text-slate-600 mb-1.5">
                    {t('reg.form.district')}
                  </label>
                  <select
                    id="addcomp-district"
                    value={form.districtId}
                    onChange={(e) => setForm({ ...form, districtId: Number(e.target.value), talukaId: 0 })}
                    disabled={!form.stateId || isLoadingDistricts}
                    className="w-full px-3 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                  >
                    <option value={0}>{t('reg.option.selectDistrict')}</option>
                    {districts.map((district) => <option key={district.id} value={district.id}>{getLocalizedName(district)}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="addcomp-taluka" className="block font-bold text-slate-600 mb-1.5">
                    {t('reg.form.taluka')}
                  </label>
                  <select
                    id="addcomp-taluka"
                    value={form.talukaId}
                    onChange={(e) => setForm({ ...form, talukaId: Number(e.target.value) })}
                    disabled={!form.districtId || isLoadingTalukas}
                    className="w-full px-3 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                  >
                    <option value={0}>{t('reg.option.selectTaluka')}</option>
                    {talukas.map((taluka) => <option key={taluka.id} value={taluka.id}>{getLocalizedName(taluka)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1.5">
                  {t('adm.companies.fieldAddress')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="addcomp-address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  placeholder="Company registered address"
                  className="w-full px-3 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1.5">
                  {t('adm.companies.fieldDescription')}
                </label>
                <textarea
                  id="addcomp-discription"
                  value={form.discription}
                  onChange={(e) => setForm({ ...form, discription: e.target.value })}
                  rows={2}
                  placeholder="Brief description about the company (optional)"
                  className="w-full px-3 py-2 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-slate-800"
                />
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setShowAddCompany(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
              >
                {t('adm.common.cancel')}
              </button>
              <button
                onClick={handleAddCompanySubmit}
                disabled={isAddingCompany || !form.fullname.trim() || !form.mobile.trim() || !form.email.trim() || !form.contactPerson.trim() || !form.address.trim() || !form.stateId || !form.districtId || !form.talukaId || !form.companyTypeId || !form.industryTypeId}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-950 hover:bg-orange-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingCompany ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('adm.companies.registering')}
                  </>
                ) : (
                  <>{t('adm.companies.register')}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
      )}
    </div>
  );
}
